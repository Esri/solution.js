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

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Creates a solution item using the contents of a group.
 *
 * @param groupId AGO id of group whose contents are to be added to solution
 * @param authentication Credentials for the request
 * @param options Customizations for creating the solution
 * @return A promise that resolves with the AGO id of the new solution
 */
export function createSolutionFromGroupId(
  groupId: string,
  authentication: common.UserSession,
  options?: common.ICreateSolutionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    let percentDone = 1;
    if (options?.progressCallback) {
      options.progressCallback(percentDone); // let the caller know that we've started
    }

    // Get group information
    Promise.all([
      common.getGroup(groupId, authentication),
      common.getGroupContents(groupId, authentication)
    ]).then(
      responses => {
        const [groupInfo, groupItems] = responses;
        if (options?.progressCallback) {
          options.progressCallback(++percentDone); // for solution item creation
        }

        // Create a solution from the group's contents, using the group's information as defaults for the solution item
        const createOptions: common.ICreateSolutionOptions = options ?? {};
        createOptions.title = createOptions.title ?? groupInfo.title;
        createOptions.snippet = createOptions.snippet ?? groupInfo.snippet;
        createOptions.description =
          createOptions.description ?? groupInfo.description;
        createOptions.tags = createOptions.tags ?? groupInfo.tags; // createOptions.thumbnail needs to be a full URL
        createOptions.percentDone = percentDone;

        /* istanbul ignore else*/ if (
          !createOptions.thumbnailUrl &&
          groupInfo.thumbnail
        ) {
          // Copy the group's thumbnail to the new item
          createOptions.thumbnailUrl = common.generateSourceThumbnailUrl(
            authentication.portal,
            groupId,
            groupInfo.thumbnail,
            true
          );
        }

        // Create a solution with the group contents
        createSolutionFromItemIds(
          groupItems,
          authentication,
          createOptions
        ).then(
          createdSolutionId => resolve(createdSolutionId),
          error => reject(error)
        );
      },
      error => reject(error)
    );
  });
}

/**
 * Creates a solution item using a list of AGO item ids.
 *
 * @param itemIds AGO ids of items that are to be added to solution
 * @param authentication Credentials for the request
 * @param options Customizations for creating the solution
 * @return A promise that resolves with the AGO id of the new solution
 */
export function createSolutionFromItemIds(
  itemIds: string[],
  authentication: common.UserSession,
  options?: common.ICreateSolutionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const createOptions: common.ICreateSolutionOptions = options ?? {};
    createOptions.percentDone = createOptions.percentDone || 0;
    if (options?.progressCallback) {
      options.progressCallback(++createOptions.percentDone); // let the caller know that we've started
    }

    // Create a solution from the list of items
    createSolutionItem(authentication, createOptions).then(
      createdSolutionId => {
        if (options?.progressCallback) {
          options.progressCallback(++createOptions.percentDone!); // for solution item creation
        }

        addContentToSolution(
          createdSolutionId,
          itemIds,
          authentication,
          createOptions
        ).then(
          results => {
            if (options?.progressCallback) {
              options.progressCallback(100); // we're done
            }
            resolve(results);
          },
          error => reject(error)
        );
      },
      error => reject(error)
    );
  });
}

/**
 * Creates an empty solution item.
 *
 * @param authentication Credentials for the request
 * @param options Customizations for creating the solution
 * @return A promise that resolves with the AGO id of the new solution
 */
export function createSolutionItem(
  authentication: common.UserSession,
  options?: common.ICreateSolutionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const solutionItem: any = {
      type: "Solution",
      title: options?.title ?? common.createId(),
      snippet: options?.snippet ?? "",
      description: options?.description ?? "",
      thumbnailUrl: options?.thumbnailUrl ?? "",
      properties: {
        prop1: 11,
        prop2: "22"
      },
      tags: options?.tags ?? [],
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
        solutionItem,
        solutionData,
        authentication,
        undefined // use top-level folder
      )
      .then(
        updateResponse => {
          // Thumbnail must be added manually
          if (solutionItem.thumbnailUrl) {
            // thumbnailUrl += "?token=" + authentication.token();
            common
              .addThumbnailFromUrl(
                solutionItem.thumbnailUrl,
                updateResponse.id,
                authentication
              )
              .then(() => resolve(updateResponse.id), reject);
          } else {
            resolve(updateResponse.id);
          }
        },
        error => reject(error)
      );
  });
}

/**
 * Adds a list of AGO item ids to a solution item.
 *
 * @param solutionItemId AGO id of solution to receive items
 * @param itemIds AGO ids of items that are to be added to solution
 * @param authentication Credentials for the request
 * @param options Customizations for creating the solution
 * @return A promise that resolves with the AGO id of the updated solution
 */
export function addContentToSolution(
  solutionItemId: string,
  itemIds: string[],
  authentication: common.UserSession,
  options: common.ICreateSolutionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    options.percentDone = options.percentDone || 0;
    const templateDictionary = options.templateDictionary ?? {};
    let solutionTemplates: common.IItemTemplate[] = [];
    let progressTickCallback: common.ISolutionProgressTickCallback;
    if (options.progressCallback) {
      const progressCallback = options.progressCallback;
      const totalEstimatedCost = Math.max(1, itemIds.length); // avoid / 0
      const progressPercentStep =
        (99 - options.percentDone) / totalEstimatedCost;
      progressTickCallback = () => {
        progressCallback((options.percentDone! += progressPercentStep)); // progress tick callback
      };
      console.log(
        "totalEstimatedCost, progressPercentStep",
        totalEstimatedCost.toString(),
        progressPercentStep.toFixed(2).toString()
      );
    }

    // Handle a list of one or more AGO ids by stepping through the list
    // and calling this function recursively
    const getItemsPromise: Array<Promise<boolean>> = [];

    itemIds.forEach(itemId => {
      const createDef = createItemTemplate.createItemTemplate(
        solutionItemId,
        itemId,
        templateDictionary,
        authentication,
        solutionTemplates,
        progressTickCallback
      );
      getItemsPromise.push(createDef);
    });

    // tslint:disable-next-line: no-floating-promises
    Promise.all(getItemsPromise).then(() => {
      // Remove remnant placeholder items from the templates list
      solutionTemplates = solutionTemplates.filter(
        template => template.type // `type` needs to be defined
      );

      if (solutionTemplates.length > 0) {
        // test for and update circular dependencies
        _postProcessCircularDependencies(solutionTemplates);

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
          if (options.progressCallback) {
            options.progressCallback(++options.percentDone!);
          }
          resolve(solutionItemId);
        }, reject);
      } else {
        if (options.progressCallback) {
          options.progressCallback(++options.percentDone!);
        }
        resolve(solutionItemId);
      }
    });
  });
}

/**
 * Remove the circular dependency id from the dependencies array
 * and add it to the circularDependencies array
 *
 * @param template The item template to process
 * @param id The id to update the arrays based on
 */
export function _updateDependencyArrays(template: any, id: string) {
  template.dependencies.splice(template.dependencies.indexOf(id), 1);
  if (Array.isArray(template.circularDependencies)) {
    template.circularDependencies.push(id);
  } else {
    template.circularDependencies = [id];
  }
}

/**
 * Find any one to one circular dependencies and update the
 * items dependencies and circularDependencies arrays
 *
 * @param templates The array of templates to evaluate
 */
export function _postProcessCircularDependencies(templates: any[]) {
  templates.forEach((template: any) => {
    const id: string = template.itemId;
    (template.dependencies || []).forEach((dependencyId: string) => {
      const dependencyTemplate: any = common.getTemplateById(
        templates,
        dependencyId
      );
      if (dependencyTemplate) {
        if (dependencyTemplate.dependencies.indexOf(id) > -1) {
          // update the current template
          _updateDependencyArrays(template, dependencyId);
          // update the current dependant template
          _updateDependencyArrays(dependencyTemplate, id);
        }
      }
    });
  });
}
