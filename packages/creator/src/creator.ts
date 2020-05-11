/** @license
 * Copyright 2018 Esri
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

/**
 * Manages the creation of a Solution item.
 *
 * @module creator
 */

import * as common from "@esri/solution-common";
import * as createItemTemplate from "./createItemTemplate";

//#region Entry point ----------------------------------------------------------------------------------------------- //

/**
 * Creates a solution item.
 *
 * @param sourceId AGO id of group whose contents are to be added to solution or of an item to convert into a solution
 * @param authentication Credentials for the request
 * @param options Customizations for creating the solution
 * @return A promise that resolves with the AGO id of the new solution
 */
export function createSolution(
  sourceId: string,
  authentication: common.UserSession,
  options?: common.ICreateSolutionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const createOptions: common.ICreateSolutionOptions = options || {};
    if (createOptions.progressCallback) {
      createOptions.progressCallback(1); // let the caller know that we've started
    }

    // Get group information
    // tslint:disable-next-line: no-floating-promises
    Promise.all([
      common.getGroupBase(sourceId, authentication),
      common.getGroupContents(sourceId, authentication)
    ])
      .then(
        responses => {
          const [groupInfo, groupItems] = responses;
          if (createOptions.progressCallback) {
            createOptions.progressCallback(15);
          }

          // Create a solution from the group's contents, using the group's information as defaults for the solution item
          createOptions.title = createOptions.title ?? groupInfo.title;
          createOptions.snippet = createOptions.snippet ?? groupInfo.snippet;
          createOptions.description =
            createOptions.description ?? groupInfo.description;
          createOptions.tags = createOptions.tags ?? groupInfo.tags;

          /* istanbul ignore else*/ if (
            !createOptions.thumbnailurl &&
            groupInfo.thumbnail
          ) {
            // Copy the group's thumbnail to the new item
            // createOptions.thumbnail needs to be a full URL
            createOptions.thumbnailurl = common.generateSourceThumbnailUrl(
              authentication.portal,
              sourceId,
              groupInfo.thumbnail,
              true
            );
          }

          // Create a solution with the group contents
          return groupItems;
        },

        // Try sourceId as an item if group fetch fails
        () => {
          return [sourceId];
        }
      )
      // Now create solution using either group items or the supplied solo item
      .then(itemIds => {
        _createSolutionFromItemIds(itemIds, authentication, createOptions).then(
          createdSolutionId => {
            if (createOptions.progressCallback) {
              createOptions.progressCallback(100); // we're done
            }
            resolve(createdSolutionId);
          },
          error => {
            // Error fetching group, group contents, or item, or error creating solution from ids
            if (createOptions.progressCallback) {
              createOptions.progressCallback(1);
            }
            console.error(error);
            reject(error);
          }
        );
      });
  });
}

//#endregion ---------------------------------------------------------------------------------------------------------//

//#region Supporting routines --------------------------------------------------------------------------------------- //

/**
 * Adds a list of AGO item ids to a solution item.
 *
 * @param solutionItemId AGO id of solution to receive items
 * @param itemIds AGO ids of items that are to be added to solution
 * @param authentication Credentials for the request
 * @param options Customizations for creating the solution
 * @return A promise that resolves with the AGO id of the updated solution
 */
export function _addContentToSolution(
  solutionItemId: string,
  itemIds: string[],
  authentication: common.UserSession,
  options: common.ICreateSolutionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Prepare feedback mechanism
    let totalEstimatedCost = 2 * itemIds.length + 1; // solution items, plus avoid divide by 0
    let percentDone: number = 16; // allow for previous creation work
    let progressPercentStep = (99 - percentDone) / totalEstimatedCost; // leave some % for caller for wrapup

    const failedItemIds: string[] = [];
    let totalExpended = 0;
    let statusOK = true;
    const itemProgressCallback: common.IItemProgressCallback = (
      itemId: string,
      status: common.EItemProgressStatus,
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
        options.progressCallback(percentDone, options.jobId);
      }

      /* istanbul ignore if */
      if (options.consoleProgress) {
        console.log(
          Date.now(),
          itemId,
          options.jobId ?? "",
          common.SItemProgressStatus[status],
          percentDone.toFixed(0) + "%",
          costUsed
        );
      }

      if (status === common.EItemProgressStatus.Failed) {
        solutionTemplates.some(t => {
          /* istanbul ignore else */
          if (t.itemId === itemId) {
            /* istanbul ignore else */
            if (common.getProp(t, "properties.error")) {
              let error = t.properties.error;
              try {
                // parse for better console logging if we can
                error = JSON.parse(error);
              } catch (e) {
                /* istanbul ignore next */
                // do nothing and show the error as is
              }
              console.error(error);
            }
            return true;
          }
        });
        common.removeTemplate(solutionTemplates, itemId);
        if (failedItemIds.indexOf(itemId) < 0) {
          failedItemIds.push(itemId);
        }
        statusOK = false;
      } else if (status === common.EItemProgressStatus.Ignored) {
        common.removeTemplate(solutionTemplates, itemId);
      }

      return statusOK;
      // ---------------------------------------------------------------------------------------------------------------
    };

    // Replacement dictionary and created templates
    const templateDictionary = options.templateDictionary ?? {};
    let solutionTemplates: common.IItemTemplate[] = [];

    // Handle a list of one or more AGO ids by stepping through the list
    // and calling this function recursively
    const getItemsPromise: Array<Promise<void>> = [];
    itemIds.forEach(itemId => {
      const createDef = createItemTemplate.createItemTemplate(
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
          common.failWithIds(
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
          const solutionData: common.ISolutionItemData = {
            metadata: {},
            templates: options.templatizeFields
              ? createItemTemplate.postProcessFieldReferences(solutionTemplates)
              : solutionTemplates
          };
          const itemInfo: common.IItemUpdate = {
            id: solutionItemId,
            text: solutionData
          };
          common.updateItem(itemInfo, authentication).then(() => {
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
 * Creates a solution item using a list of AGO item ids.
 *
 * @param itemIds AGO ids of items that are to be added to solution
 * @param authentication Credentials for the request
 * @param options Customizations for creating the solution
 * @return A promise that resolves with the AGO id of the new solution; solution item is deleted if its
 * there is a problem updating it
 */
export function _createSolutionFromItemIds(
  itemIds: string[],
  authentication: common.UserSession,
  options: common.ICreateSolutionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create a solution from the list of items
    _createSolutionItem(authentication, options).then(
      createdSolutionId => {
        // Add list of items to the new solution
        _addContentToSolution(
          createdSolutionId,
          itemIds,
          authentication,
          options
        ).then(
          () => resolve(createdSolutionId),
          addError => {
            // Created solution item, but couldn't add to it; delete solution item
            common.removeItem(createdSolutionId, authentication).then(
              () => reject(addError),
              () => reject(addError)
            );
          }
        );
      },
      reject // Couldn't create solution item
    );
  });
}

/**
 * Creates an empty solution item.
 *
 * @param authentication Credentials for the request
 * @param options Customizations for creating the solution
 * @return A promise that resolves with the AGO id of the new solution; solution item is deleted if its
 * there is a problem updating its thumbnail
 */
export function _createSolutionItem(
  authentication: common.UserSession,
  options?: common.ICreateSolutionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Solution uses all supplied tags but for deploy.* tags; that information goes into properties
    const creationTags = options?.tags ?? [];
    const solutionItem: any = {
      type: "Solution",
      title: options?.title ?? common.createShortId(),
      snippet: options?.snippet ?? "",
      description: options?.description ?? "",
      properties: _getDeploymentProperties(creationTags),
      thumbnailurl: options?.thumbnailurl ?? "",
      tags: creationTags.filter(tag => !tag.startsWith("deploy.")),
      typeKeywords: ["Solution", "Template"]
    };
    if (Array.isArray(options?.additionalTypeKeywords)) {
      solutionItem.typeKeywords = solutionItem.typeKeywords.concat(
        options!.additionalTypeKeywords
      );
    }

    const solutionData: common.ISolutionItemData = {
      metadata: {},
      templates: []
    };

    // Create new solution item
    common
      .createItemWithData(
        common.sanitizeJSONAndReportChanges(solutionItem),
        solutionData,
        authentication,
        options?.folderId
      )
      .then(createResponse => {
        // Thumbnail must be added manually
        if (solutionItem.thumbnailurl) {
          common
            .addThumbnailFromUrl(
              solutionItem.thumbnailurl,
              createResponse.id,
              authentication
            )
            .then(
              response => {
                if (response.success) {
                  resolve(createResponse.id);
                } else {
                  // Created solution item, but couldn't add to it
                  common.removeItem(createResponse.id, authentication).then(
                    () => reject(response),
                    () => reject(response)
                  );
                }
              },
              updateError => {
                // Created solution item, but couldn't add to it
                common.removeItem(createResponse.id, authentication).then(
                  () => reject(updateError),
                  () => reject(updateError)
                );
              }
            );
        } else {
          resolve(createResponse.id);
        }
      }, reject);
  });
}

/**
 * Gets the deploy.version and deploy.id tag values.
 *
 * @param tags A list of item tags
 * @return A list ocntaining the two values found in the tags, or defaulting to "1.0" and a new GUID, respectively,
 * as needed
 */
export function _getDeploymentProperties(
  tags: string[]
): common.ISolutionItemProperties {
  return {
    version: _getDeploymentProperty("deploy.version.", tags) ?? "1.0",
    id: _getDeploymentProperty("deploy.id.", tags) ?? common.createPseudoGUID()
  } as common.ISolutionItemProperties;
}

/**
 * Searches for a tag that has the specified prefix and returns the rest of the tag following that prefix.
 *
 * @param desiredTagPrefix Tag prefix to look for
 * @param tags A list of item tags
 * @return The extracted value of the first matching tag or null if a tag with the specified prefix is not found
 */
export function _getDeploymentProperty(
  desiredTagPrefix: string,
  tags: string[]
): string | null {
  const foundTagAsList = tags.filter(tag => tag.startsWith(desiredTagPrefix));
  if (foundTagAsList.length > 0) {
    return foundTagAsList[0].substr(desiredTagPrefix.length);
  } else {
    return null;
  }
}

/**
 * Update the items dependencies and groups arrays
 *
 * @param templates The array of templates to evaluate
 */
export function _postProcessGroupDependencies(
  templates: common.IItemTemplate[]
): common.IItemTemplate[] {
  return templates.map((template: common.IItemTemplate) => {
    if (template.type === "Group") {
      const id: string = template.itemId;
      // remove group dependencies if we find a circular dependency with one of its items
      let removeDependencies: boolean = false;
      // before we remove update each dependants groups array
      template.dependencies.forEach(dependencyId => {
        const dependantTemplate: common.IItemTemplate = common.getTemplateById(
          templates,
          dependencyId
        );
        const gIndex = dependantTemplate.dependencies.indexOf(id);
        /* istanbul ignore else */
        if (gIndex > -1) {
          removeDependencies = true;
        }
        /* istanbul ignore else */
        if (dependantTemplate.groups.indexOf(id) < 0) {
          dependantTemplate.groups.push(id);
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
  templates: common.IItemTemplate[]
): common.IItemTemplate[] {
  // replace in template
  const updateDictionary: any = templates.reduce((result, template) => {
    return template.properties.hasInvalidDesignations
      ? Object.assign(result, template.data)
      : result;
  }, {});
  Object.keys(updateDictionary).forEach(k => {
    common.removeTemplate(templates, k);
    templates = templates.map(t => {
      t.dependencies = t.dependencies.filter(id => id !== k);
      return common.replaceInTemplate(t, updateDictionary);
    });
  });

  return templates;
}

//#endregion ---------------------------------------------------------------------------------------------------------//
