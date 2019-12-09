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
    if (options?.progressCallback) {
      options.progressCallback(1); // Let the caller know that we've started
    }

    // Get group information
    Promise.all([
      common.getGroup(groupId, authentication),
      common.getGroupContents(groupId, authentication)
    ]).then(
      responses => {
        const [groupInfo, groupItems] = responses;

        // Create a solution from the group's contents, using the group's information as defaults for the solution item
        const createOptions: common.ICreateSolutionOptions = options ?? {};
        createOptions.title = createOptions.title ?? groupInfo.title;
        createOptions.snippet = createOptions.snippet ?? groupInfo.snippet;
        createOptions.description =
          createOptions.description ?? groupInfo.description;
        createOptions.tags = createOptions.tags ?? groupInfo.tags; // createOptions.thumbnail needs to be a full URL

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
    if (createOptions.progressCallback) {
      createOptions.progressCallback(2); // Let the caller know that we've started
    }

    // Create a solution from the list of items
    createSolutionItem(authentication, createOptions).then(
      createdSolutionId => {
        addContentToSolution(
          createdSolutionId,
          itemIds,
          authentication,
          createOptions
        ).then(resolve, error => reject(error));
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
    const templateDictionary = options.templateDictionary ?? {};
    let solutionTemplates: common.IItemTemplate[] = [];
    let progressTickCallback: () => void = () => void 0;
    if (options.progressCallback) {
      const progressCallback = options.progressCallback;
      progressCallback(4);
      let percentDone = 4;
      const progressPercentStep = (100 - 8) / (itemIds.length + 1); // '8' for surrounding progress reports
      progressTickCallback = () => {
        progressCallback((percentDone += progressPercentStep)); // progress tick callback
      };
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
        solutionTemplates
      );
      getItemsPromise.push(createDef);
      createDef.then(progressTickCallback, progressTickCallback);
    });

    // tslint:disable-next-line: no-floating-promises
    Promise.all(getItemsPromise).then(() => {
      if (options.progressCallback) {
        options.progressCallback(96);
      }

      // Remove remnant placeholder items from the templates list
      solutionTemplates = solutionTemplates.filter(
        template => template.type // `type` needs to be defined
      );

      if (solutionTemplates.length > 0) {
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
            options.progressCallback(0);
          }
          resolve(solutionItemId);
        }, reject);
      } else {
        if (options.progressCallback) {
          options.progressCallback(0);
        }
        resolve(solutionItemId);
      }
    });
  });
}
