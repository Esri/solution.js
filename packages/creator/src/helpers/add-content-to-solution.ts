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
  SolutionTemplateFormatVersion,
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
  ISourceFile,
  isWorkforceProject,
  removeTemplate,
  replaceInTemplate,
  SItemProgressStatus,
  copyFilesToStorageItem,
  postProcessWorkforceTemplates,
  UNREACHABLE,
  updateItem,
  UserSession
} from "@esri/solution-common";
import { getProp, getWithDefault } from "@esri/hub-common";
import {
  createItemTemplate,
  postProcessFieldReferences
} from "../createItemTemplate";

/**
 * Adds a list of AGO item ids to a solution item.
 *
 * @param solutionItemId AGO id of solution to receive items
 * @param options Customizations for creating the solution
 * @param srcAuthentication Credentials for requests to source items
 * @param destAuthentication Credentials for the requests to destination solution
 * @returns A promise that resolves with the AGO id of the updated solution
 * @internal
 */
export function addContentToSolution(
  solutionItemId: string,
  options: ICreateSolutionOptions,
  srcAuthentication: UserSession,
  destAuthentication: UserSession
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!options.itemIds || options.itemIds.length === 0) {
      resolve(solutionItemId);
      return;
    }

    // Prepare feedback mechanism
    let totalEstimatedCost = 2 * options.itemIds.length + 1; // solution items, plus avoid divide by 0
    let percentDone: number = 16; // allow for previous creation work
    let progressPercentStep = (95 - percentDone) / totalEstimatedCost; // leave some % for caller for wrapup

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
          (95 - percentDone) / (totalEstimatedCost - totalExpended);
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
    const getItemsPromise: Array<Promise<ISourceFile[]>> = [];
    options.itemIds.forEach(itemId => {
      const createDef = createItemTemplate(
        solutionItemId,
        itemId,
        templateDictionary,
        srcAuthentication,
        destAuthentication,
        solutionTemplates,
        itemProgressCallback
      );
      getItemsPromise.push(createDef);
    });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Promise.all(getItemsPromise).then(
      (multipleResourceItemFiles: ISourceFile[][]) => {
        if (failedItemIds.length > 0) {
          reject(
            failWithIds(
              failedItemIds,
              "One or more items cannot be converted into templates"
            )
          );
        } else {
          if (solutionTemplates.length > 0) {
            // Coalesce the resource file paths from the created templates
            let resourceItemFiles: ISourceFile[] = multipleResourceItemFiles.reduce(
              (accumulator, currentValue) => accumulator.concat(currentValue),
              [] as ISourceFile[]
            );

            // Extract data files from templates
            solutionTemplates.forEach(
              (template: IItemTemplate) => {
                if (template.dataFile) {
                  console.log("adding datafile to queue " + template.dataFile.folder + "|" + template.dataFile.filename);//???
                  resourceItemFiles.push(template.dataFile);
                }
              }
            );

            // test for and update group dependencies and other post-processing
            solutionTemplates = _postProcessGroupDependencies(
              solutionTemplates
            );
            solutionTemplates = postProcessWorkforceTemplates(
              solutionTemplates
            );

            // Filter out any resources from items that have been removed from the templates, such as
            // Living Atlas layers
            solutionTemplates = _postProcessIgnoredItems(solutionTemplates, templateDictionary);
            const templateIds = solutionTemplates.map(
              template => template.itemId
            );

            // Coalesce the resource file paths from the created templates
            resourceItemFiles = resourceItemFiles.filter(file =>
              templateIds.includes(file.itemId)
            );

            console.log("copyFilesToStorageItem");//???
            resourceItemFiles.forEach( (file: ISourceFile) => { console.log("  * " + file.folder + "|" + file.filename) } );//???

            // Send the accumulated resources to the solution item
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            copyFilesToStorageItem(
              resourceItemFiles,
              solutionItemId,
              destAuthentication
            ).then(() => {
              // Remove data files from templates--no longer needed
              solutionTemplates.forEach(
                (template: IItemTemplate) => {
                  if (template.dataFile) {
                    delete template.dataFile;
                  }
                }
              );

              //???
              solutionTemplates.forEach((template: IItemTemplate) => { if (template.dataFile) { console.log("Undeleted datafile " + template.dataFile.folder + "|" + template.dataFile.filename); } });  //???

              _templatizeSolutionIds(solutionTemplates);
              _simplifyUrlsInItemDescriptions(solutionTemplates);
              _replaceDictionaryItemsInObject(
                templateDictionary,
                solutionTemplates
              );
              _templatizeOrgUrl(solutionTemplates, destAuthentication).then(
                solutionTemplates2 => {
                  // Update solution item with its data JSON
                  const solutionData: ISolutionItemData = {
                    metadata: { version: SolutionTemplateFormatVersion },
                    templates: options.templatizeFields
                      ? postProcessFieldReferences(solutionTemplates2)
                      : solutionTemplates2
                  };
                  const itemInfo: IItemUpdate = {
                    id: solutionItemId,
                    text: solutionData
                  };
                  updateItem(itemInfo, destAuthentication).then(() => {
                    resolve(solutionItemId);
                  }, reject);
                },
                reject
              );
            });
          } else {
            resolve(solutionItemId);
          }
        }
      }
    );
  });
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Gets the dependencies of an item by merging its dependencies list with item references in template variables.
 *
 * @param template Template to examine
 * @returns List of dependency ids
 * @private
 */
export function _getDependencies(template: IItemTemplate): string[] {
  // Get all dependencies
  let deps = template.dependencies.concat(
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
 * @returns List of AGO ids referenced in `variables`
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
 * Creates a list of item URLs.
 *
 * @param templates Templates to check for URLs
 * @returns List of URLs
 * @private
 */
export function _getSolutionItemUrls(templates: IItemTemplate[]): string[][] {
  const solutionUrls: string[][] = [];
  templates.forEach(template => {
    /* istanbul ignore else */
    if (template.item.origUrl) {
      solutionUrls.push([template.itemId, template.item.origUrl]);
    }
  });
  return solutionUrls;
}

/**
 * Extracts template variables out of a string.
 *
 * @param text String to examine
 * @returns List of template variables found in string
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
 * @returns Updated version of the templates
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
 * @param templateDictionary Hash of key details used for variable replacement
 * @returns Updated version of the templates
 * @private
 */
export function _postProcessIgnoredItems(
  templates: IItemTemplate[],
  templateDictionary: any
): IItemTemplate[] {
  // replace in template
  const updateDictionary: any = templates.reduce((result, template) => {
    const invalidDes = template.properties.hasInvalidDesignations;
    const unreachableVal = getProp(templateDictionary, `${UNREACHABLE}.${template.itemId}`);
    if (invalidDes && unreachableVal && Object.keys(template.data).length < 1) {
      template.data[template.itemId] = unreachableVal;
    }
    return invalidDes ? Object.assign(result, template.data) : result;
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
 * @returns A copy of the source string with any templatization changes
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
 * Finds and templatizes any URLs in solution items' descriptions.
 *
 * @param templates The array of templates to evaluate, modified in place
 * @private
 */
export function _simplifyUrlsInItemDescriptions(
  templates: IItemTemplate[]
): void {
  // Get the urls in the solution along with their item ids & convert the id into the form
  // "{{fcb2bf2837a6404ebb418a1f805f976a.url}}"
  const solutionUrls = _getSolutionItemUrls(templates).map(idUrl => [
    "{{" + idUrl[0] + ".url}}",
    idUrl[1]
  ]);

  /* istanbul ignore else */
  if (solutionUrls.length > 0) {
    // Make the replacements
    templates.forEach(template => {
      solutionUrls.forEach(
        // TypeScript for es2015 doesn't have a definition for `replaceAll`
        idUrl => {
          /* istanbul ignore else */
          if (template.item.description) {
            template.item.description = (template.item
              .description as any).replaceAll(idUrl[1], idUrl[0]);
          }
        }
      );
    });
  }
}

/**
 * Templatizes occurrences of the URL to the user's organization in the `item` and `data` template sections.
 *
 * @param templates The array of templates to evaluate; templates is modified in place
 * @param destAuthentication Credentials for request organization info
 * @returns Promise resolving with `templates`
 * @private
 */
export function _templatizeOrgUrl(
  templates: IItemTemplate[],
  destAuthentication: UserSession
): Promise<IItemTemplate[]> {
  return new Promise((resolve, reject) => {
    // Get the org's URL
    getPortal(null, destAuthentication).then(org => {
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
 * @param templates The array of templates to evaluate, modified in place
 * @private
 */
export function _templatizeSolutionIds(templates: IItemTemplate[]): void {
  // Get the ids in the solution
  const solutionIds: string[] = templates.map(
    (template: IItemTemplate) => template.itemId
  );

  // Cycle through each of the items in the template and
  // 1. templatize untemplatized ids in our solution in the `item` and `data` sections;
  // 2. update the `dependencies` section
  templates.forEach((template: IItemTemplate) => {
    _replaceRemainingIdsInObject(solutionIds, template.item);
    _replaceRemainingIdsInObject(solutionIds, template.data);
    /* istanbul ignore else */
    if (template.type !== "Group" && !isWorkforceProject(template)) {
      template.dependencies = _getDependencies(template);
    }
  });
}
