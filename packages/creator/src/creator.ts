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

export function createSolutionFromGroupId(
  groupId: string,
  authentication: common.UserSession,
  options?: common.ICreateSolutionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
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
        createOptions.tags = createOptions.tags ?? groupInfo.tags;

        if (!createOptions.thumbnailUrl && groupInfo.thumbnail) {
          // Copy the group's thumbnail to the new item; need to add token to thumbnail because
          // authentication only applies to updating solution item, not fetching group thumbnail image
          const groupItemThumbnail = common.generateSourceThumbnailUrl(
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

export function createSolutionFromItemIds(
  itemIds: string[],
  authentication: common.UserSession,
  options?: common.ICreateSolutionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create a solution from the list of items
    createSolutionItem(authentication, options).then(
      createdSolutionId => {
        addContentToSolution(
          createdSolutionId,
          itemIds,
          authentication,
          options
        ).then(resolve, error => reject(error));
      },
      error => reject(error)
    );
  });
}

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

    // Create new solution item using group item info
    common
      .createItemWithData(
        solutionItem,
        solutionData,
        authentication,
        undefined // use top-level folder
      )
      .then(
        updateResponse => {
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
 *
 *
 * @param itemIds List of AGO id strings
 * @param authentication Options for updating solution item in AGO
 * @return A promise without value
 */
export function addContentToSolution(
  solutionItemId: string,
  itemIds: string[],
  authentication: common.UserSession,
  options?: common.ICreateSolutionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const templateDictionary = options?.templateDictionary ?? {};
    let solutionTemplates: common.IItemTemplate[] = [];

    // Handle a list of one or more AGO ids by stepping through the list
    // and calling this function recursively
    const getItemsPromise: Array<Promise<boolean>> = [];

    itemIds.forEach(itemId => {
      getItemsPromise.push(
        createItemTemplate.createItemTemplate(
          solutionItemId,
          itemId,
          templateDictionary,
          authentication,
          solutionTemplates
        )
      );
      // progressTickCallback();
    });
    Promise.all(getItemsPromise).then(
      responses => {
        // Remove remnant placeholder items from the templates list
        solutionTemplates = solutionTemplates.filter(
          template => template.type // `type` needs to be defined
        );

        // Update solution item with its data JSON
        const solutionData: common.ISolutionItemData = {
          metadata: {},
          templates: options?.templatizeFields
            ? createItemTemplate.postProcessFieldReferences(solutionTemplates)
            : solutionTemplates
        };
        const itemInfo: common.IItemUpdate = {
          id: solutionItemId,
          text: solutionData
        };
        common.updateItem(itemInfo, authentication).then(() => {
          // progressCallback(0);
          resolve(solutionItemId);
        }, reject);
      },
      e => reject(common.fail(e))
    );
  });
}
