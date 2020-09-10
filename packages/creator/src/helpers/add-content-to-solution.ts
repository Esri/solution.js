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
  getTemplateById,
  ICreateSolutionOptions,
  IItemProgressCallback,
  IItemTemplate,
  IItemUpdate,
  ISolutionItemData,
  removeTemplate,
  replaceInTemplate,
  SItemProgressStatus,
  updateItem
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
 * @param itemIds AGO ids of items that are to be added to solution
 * @param authentication Credentials for the request
 * @param options Customizations for creating the solution
 * @return A promise that resolves with the AGO id of the updated solution
 * @internal
 */
export function _addContentToSolution(
  solutionItemId: string,
  itemIds: string[],
  authentication: UserSession,
  options: ICreateSolutionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Prepare feedback mechanism
    let totalEstimatedCost = 2 * itemIds.length + 1; // solution items, plus avoid divide by 0
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
      if (itemIds.indexOf(itemId) < 0) {
        // New item--a dependency that wasn't in the supplied list of itemIds; add it to the list
        // and recalculate the progress percent step based on how much progress remains to be done
        itemIds.push(itemId);

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
        console.error("Item " + itemId + " has failed " + error);
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
    itemIds.forEach(itemId => {
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

    // tslint:disable-next-line: no-floating-promises
    Promise.all(getItemsPromise).then((results: any[]) => {
      if (failedItemIds.length > 0) {
        reject(
          failWithIds(
            failedItemIds,
            "One or more items cannot be converted into templates"
          )
        );
      } else {
        if (solutionTemplates.length > 0) {
          // test for and update group dependencies
          solutionTemplates = _postProcessGroupDependencies(solutionTemplates);
          solutionTemplates = _postProcessIgnoredItems(solutionTemplates);

          // Update solution item with its data JSON
          const solutionData: ISolutionItemData = {
            metadata: {},
            templates: options.templatizeFields
              ? postProcessFieldReferences(solutionTemplates)
              : solutionTemplates
          };
          const itemInfo: IItemUpdate = {
            id: solutionItemId,
            text: solutionData
          };
          updateItem(itemInfo, authentication).then(() => {
            resolve(solutionItemId);
          }, reject);
        } else {
          resolve(solutionItemId);
        }
      }
    });
  });
}

/**
 * Update the items dependencies and groups arrays
 *
 * @param templates The array of templates to evaluate
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
 * Reomve templates that have invalid designations from the solution item and other item dependencies.
 * Clean up any references to items with invalid designations in the other templates.
 *
 * @param templates The array of templates to evaluate
 * @return Updated version of the templates
 * @protected
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
