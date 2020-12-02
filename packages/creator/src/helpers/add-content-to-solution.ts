/** @license
 * Copyright 2020 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  EItemProgressStatus,
  failWithIds,
  getIDs,
  getPortal,
  getTemplateById,
  globalStringReplace,
  ICreateSolutionOptions,
  IItemProgressCallback,
  IItemTemplate,
  IItemUpdate,
  ISolutionItemData,
  removeTemplate,
  replaceInTemplate,
  SItemProgressStatus,
  updateItem,
  postProcessWorkforceTemplates
} from "@esri/solution-common";
import { getProp, getWithDefault } from "@esri/hub-common";
import { UserSession } from "@esri/arcgis-rest-auth";
import {
  createItemTemplate,
  postProcessFieldReferences
} from "../createItemTemplate";

/**
 * Adds a list of AGO item ids to a solution item.
 *
 * @param solutionItemId AGO id of solution to receive items
 * @param options Customizations for creating the solution
 * @param authentication Credentials for the request
 * @return A promise that resolves with the AGO id of the updated solution
 * @internal
 */
export function addContentToSolution(
  solutionItemId: string,
  options: ICreateSolutionOptions,
  authentication: UserSession
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!options.itemIds || options.itemIds.length === 0) {
      resolve(solutionItemId);
      return;
    }

    // Prepare feedback mechanism
    let totalEstimatedCost = 2 * options.itemIds.length + 1; // solution items, plus avoid divide by 0
    let percentDone: number = 16; // allow for previous creation work
    let progressPercentStep = (99 - percentDone) / totalEstimatedCost; // leave some % for caller for wrapup

    const failedItemIds: string[] = [];
    let totalExpended = 0;
    let statusOK = true;
    const itemProgressCallback: IItemProgressCallback = (
      itemId: string,
      status: EItemProgressStatus,
      costUsed: number
    ) => {
      // ---------------------------------------------------------------------------------------------------------------
      if (options.itemIds.indexOf(itemId) < 0) {
        // New item--a dependency that wasn't in the supplied list of itemIds; add it to the list
        // and recalculate the progress percent step based on how much progress remains to be done
        options.itemIds.push(itemId);

        totalEstimatedCost += 2;
        progressPercentStep =
          (99 - percentDone) / (totalEstimatedCost - totalExpended);
      }

      totalExpended += costUsed;
      percentDone += progressPercentStep * costUsed;
      if (options.progressCallback) {
        options.progressCallback(Math.round(percentDone), options.jobId);
      }

      /* istanbul ignore if */
      if (options.consoleProgress) {
        console.log(
          Date.now(),
          itemId,
          options.jobId ?? "",
          SItemProgressStatus[status],
          percentDone.toFixed(0) + "%",
          costUsed
        );
      }

      if (status === EItemProgressStatus.Failed) {
        let error = "";
        solutionTemplates.some(t => {
          /* istanbul ignore else */
          if (t.itemId === itemId) {
            /* istanbul ignore else */
            if (getProp(t, "properties.error")) {
              error = t.properties.error;
              try {
                // parse for better console logging if we can
                error = JSON.parse(error);
              } catch (e) {
                /* istanbul ignore next */
                // do nothing and show the error as is
              }
            }
            return true;
          }
        });
        removeTemplate(solutionTemplates, itemId);
        if (failedItemIds.indexOf(itemId) < 0) {
          failedItemIds.push(itemId);
        }
        statusOK = false;
      } else if (status === EItemProgressStatus.Ignored) {
        removeTemplate(solutionTemplates, itemId);
      }

      return statusOK;
      // ---------------------------------------------------------------------------------------------------------------
    };

    // Replacement dictionary and created templates
    const templateDictionary = options.templateDictionary ?? {};
    let solutionTemplates: IItemTemplate[] = [];

    // Handle a list of one or more AGO ids by stepping through the list
    // and calling this function recursively
    const getItemsPromise: Array<Promise<void>> = [];
    options.itemIds.forEach(itemId => {
      const createDef = createItemTemplate(
        solutionItemId,
        itemId,
        templateDictionary,
        authentication,
        solutionTemplates,
        itemProgressCallback
      );
      getItemsPromise.push(createDef);
    });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Promise.all(getItemsPromise).then(() => {
      if (failedItemIds.length > 0) {
        reject(
          failWithIds(
            failedItemIds,
            "One or more items cannot be converted into templates"
          )
        );
      } else {
        if (solutionTemplates.length > 0) {
          // test for and update group dependencies and other post-processing
          solutionTemplates = _postProcessGroupDependencies(solutionTemplates);
          solutionTemplates = _postProcessIgnoredItems(solutionTemplates);
          solutionTemplates = postProcessWorkforceTemplates(solutionTemplates);
          _templatizeSolutionIds(solutionTemplates);
          _replaceDictionaryItemsInObject(
            templateDictionary,
            solutionTemplates
          );
          _templatizeOrgUrl(solutionTemplates, authentication).then(
            solutionTemplates2 => {
              // Update solution item with its data JSON
              const solutionData: ISolutionItemData = {
                metadata: {},
                templates: options.templatizeFields
                  ? postProcessFieldReferences(solutionTemplates2)
                  : solutionTemplates2
              };
              const itemInfo: IItemUpdate = {
                id: solutionItemId,
                text: solutionData
              };
              updateItem(itemInfo, authentication).then(() => {
                resolve(solutionItemId);
              }, reject);
            },
            reject
          );
        } else {
          resolve(solutionItemId);
        }
      }
    });
  });
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Gets the dependencies of an item by merging its dependencies list with item references in template variables.
 *
 * @param template Template to examine
 * @return List of dependency ids
 * @private
 */
export function _getDependencies(template: IItemTemplate): string[] {
  // Get all dependencies
  let deps = template.dependencies.concat(
    _getIdsOutOfTemplateVariables(
      _getTemplateVariables(JSON.stringify(template.item))
    ),
    _getIdsOutOfTemplateVariables(
      _getTemplateVariables(JSON.stringify(template.data))
    )
  );

  // Remove duplicates and self-references
  deps.sort();
  deps = deps.filter((elem, index, array) => {
    if (elem === template.itemId) {
      return false;
    } else if (index > 0) {
      return elem !== array[index - 1];
    } else {
      return true;
    }
  });

  return deps;
}

/**
 * Extracts AGO ids out of template variables.
 *
 * @param variables List of template variables to examine
 * @return List of AGO ids referenced in `variables`
 * @private
 */
export function _getIdsOutOfTemplateVariables(variables: string[]): string[] {
  return variables
    .map(variable => {
      const idList = variable.match(/[0-9A-F]{32}/i); // is it a guid?
      if (idList) {
        return idList[0];
      } else {
        return null;
      }
    })
    .filter(variable => !!variable);
}

/**
 * Extracts template variables out of a string.
 *
 * @param text String to examine
 * @return List of template variables found in string
 * @private
 */
export function _getTemplateVariables(text: string): string[] {
  return (text.match(/{{[a-z0-9.]*}}/gi) || []) // find variable
    .map(variable => variable.substring(2, variable.length - 2)); // remove "{{" & "}}"
}

/**
 * Update the items dependencies and groups arrays
 *
 * @param templates The array of templates to evaluate
 * @return Updated version of the templates
 * @private
 */
export function _postProcessGroupDependencies(
  templates: IItemTemplate[]
): IItemTemplate[] {
  return templates.map((template: IItemTemplate) => {
    if (template.type === "Group") {
      const id: string = template.itemId;
      // remove group dependencies if we find a circular dependency with one of its items
      let removeDependencies: boolean = false;
      // before we remove update each dependants groups array
      template.dependencies.forEach(dependencyId => {
        const dependantTemplate: IItemTemplate = getTemplateById(
          templates,
          dependencyId
        );
        // Not all items shared to the group will exist in the templates array
        // i.e. Hub Initiative items or any other unsupported types
        if (dependantTemplate) {
          // check if the group is in the dependantTemplate's list of dependencies
          const gIndex = getWithDefault(
            dependantTemplate,
            "dependencies",
            []
          ).indexOf(id);

          /* istanbul ignore else */
          if (gIndex > -1) {
            removeDependencies = true;
          }
          // if the dependant template does not have the group id
          // in it's groups array, add it
          const groups = getWithDefault(dependantTemplate, "groups", []);
          if (groups.indexOf(id) === -1) {
            groups.push(id);
            dependantTemplate.groups = groups;
          }
        }
      });
      if (removeDependencies) {
        template.dependencies = [];
      }
    }
    return template;
  });
}

/**
 * Check for feature service items that have been flagged for invalid designations.
 * Remove templates that have invalid designations from the solution item and other item dependencies.
 * Clean up any references to items with invalid designations in the other templates.
 *
 * @param templates The array of templates to evaluate
 * @return Updated version of the templates
 * @private
 */
export function _postProcessIgnoredItems(
  templates: IItemTemplate[]
): IItemTemplate[] {
  // replace in template
  const updateDictionary: any = templates.reduce((result, template) => {
    return template.properties.hasInvalidDesignations
      ? Object.assign(result, template.data)
      : result;
  }, {});
  Object.keys(updateDictionary).forEach(k => {
    removeTemplate(templates, k);
    templates = templates.map(t => {
      t.dependencies = t.dependencies.filter(id => id !== k);
      return replaceInTemplate(t, updateDictionary);
    });
  });

  return templates;
}

/**
 * Recursively runs through an object to find and replace any strings found in a dictionary.
 *
 * @param templateDictionary Hash of things to be replaced
 * @param obj Object to be examined
 * @private
 */
export function _replaceDictionaryItemsInObject(hash: any, obj: any): any {
  /* istanbul ignore else */
  if (obj) {
    Object.keys(obj).forEach(prop => {
      const propObj = obj[prop];
      if (propObj) {
        if (typeof propObj === "object") {
          _replaceDictionaryItemsInObject(hash, propObj);
        } else if (typeof propObj === "string") {
          obj[prop] = hash[propObj] || propObj;
        }
      }
    });
  }
  return obj;
}

/**
 * Recursively runs through an object to find and templatize any remaining references to solution's items.
 *
 * @param ids Ids to be replaced in strings found in object
 * @param obj Object to be examined
 * @private
 */
export function _replaceRemainingIdsInObject(ids: string[], obj: any): any {
  /* istanbul ignore else */
  if (obj) {
    Object.keys(obj).forEach(prop => {
      const propObj = obj[prop];
      if (propObj) {
        if (typeof propObj === "object") {
          _replaceRemainingIdsInObject(ids, propObj);
        } else if (typeof propObj === "string") {
          obj[prop] = _replaceRemainingIdsInString(ids, propObj);
        }
      }
    });
  }
  return obj;
}

/**
 * Templatizes ids from a list in a string if they're not already templatized.
 *
 * @param ids Ids to be replaced in source string
 * @param str Source string to be examined
 * @return A copy of the source string with any templatization changes
 * @private
 */
export function _replaceRemainingIdsInString(
  ids: string[],
  str: string
): string {
  let updatedStr = str;
  const untemplatizedIds = getIDs(str);
  if (untemplatizedIds.length > 0) {
    untemplatizedIds.forEach(id => {
      if (ids.includes(id)) {
        const re = new RegExp("({*)" + id, "gi");
        updatedStr = updatedStr.replace(re, match =>
          match.indexOf("{{") < 0
            ? "{{" + id.replace("{", "") + ".itemId}}"
            : match
        );
      }
    });
  }
  return updatedStr;
}

/**
 * Templatizes occurrences of the URL to the user's organization in the `item` and `data` template sections.
 *
 * @param templates The array of templates to evaluate; templates is modified in place
 * @param authentication Credentials for request organization info
 * @return Promise resolving with `templates`
 * @private
 */
export function _templatizeOrgUrl(
  templates: IItemTemplate[],
  authentication: UserSession
): Promise<IItemTemplate[]> {
  return new Promise((resolve, reject) => {
    // Get the org's URL
    getPortal(null, authentication).then(org => {
      const orgUrl = "https://" + org.urlKey + "." + org.customBaseUrl;
      const templatizedOrgUrl = "{{portalBaseUrl}}";

      // Cycle through each of the items in the template and scan the `item` and `data` sections of each for replacements
      templates.forEach((template: IItemTemplate) => {
        globalStringReplace(
          template.item,
          new RegExp(orgUrl, "gi"),
          templatizedOrgUrl
        );
        globalStringReplace(
          template.data,
          new RegExp(orgUrl, "gi"),
          templatizedOrgUrl
        );
      });
      resolve(templates);
    }, reject);
  });
}

/**
 * Finds and templatizes any references to solution's items.
 *
 * @param templates The array of templates to evaluate
 * @private
 */
export function _templatizeSolutionIds(templates: IItemTemplate[]): void {
  // Get the ids in the solution
  const solutionIds: string[] = templates.map(
    (template: IItemTemplate) => template.itemId
  );

  // Cycle through each of the items in the template and scan the `item` and `data` sections of each for ids in our solution
  templates.forEach((template: IItemTemplate) => {
    _replaceRemainingIdsInObject(solutionIds, template.item);
    _replaceRemainingIdsInObject(solutionIds, template.data);
    template.dependencies = _getDependencies(template);
  });
}
