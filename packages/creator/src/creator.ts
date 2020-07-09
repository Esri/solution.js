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

import {
  addThumbnailFromUrl,
  createItemWithData,
  createPseudoGUID,
  createShortId,
  CURRENT_SCHEMA_VERSION,
  generateSourceThumbnailUrl,
  getGroupBase,
  getGroupContents,
  ICreateSolutionOptions,
  ISolutionItemData,
  removeItem,
  sanitizeJSONAndReportChanges
} from "@esri/solution-common";
import { UserSession } from "@esri/arcgis-rest-auth";
import { _addContentToSolution } from "./helpers/add-content-to-solution";

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
  authentication: UserSession,
  options?: ICreateSolutionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const createOptions: ICreateSolutionOptions = options || {};
    if (createOptions.progressCallback) {
      createOptions.progressCallback(1); // let the caller know that we've started
    }

    // Get group information
    // tslint:disable-next-line: no-floating-promises
    Promise.all([
      getGroupBase(sourceId, authentication),
      getGroupContents(sourceId, authentication)
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
            createOptions.thumbnailurl = generateSourceThumbnailUrl(
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

/**
 * Creates a solution item using a list of AGO item ids.
 *
 * @param itemIds AGO ids of items that are to be added to solution
 * @param authentication Credentials for the request
 * @param options Customizations for creating the solution
 * @return A promise that resolves with the AGO id of the new solution; solution item is deleted if its
 * there is a problem updating it
 * @internal
 */
export function _createSolutionFromItemIds(
  itemIds: string[],
  authentication: UserSession,
  options: ICreateSolutionOptions
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
            removeItem(createdSolutionId, authentication).then(
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
 * @internal
 */
export function _createSolutionItem(
  authentication: UserSession,
  options?: ICreateSolutionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Solution uses all supplied tags but for deploy.* tags; that information goes into properties
    const creationTags = options?.tags ?? [];
    const solutionItem: any = {
      type: "Solution",
      title: options?.title ?? createShortId(),
      snippet: options?.snippet ?? "",
      description: options?.description ?? "",
      properties: {
        schemaVersion: CURRENT_SCHEMA_VERSION
      },
      thumbnailurl: options?.thumbnailurl ?? "",
      tags: creationTags.filter(tag => !tag.startsWith("deploy.")),
      typeKeywords: ["Solution", "Template"].concat(
        _getDeploymentProperties(creationTags)
      )
    };
    if (Array.isArray(options?.additionalTypeKeywords)) {
      solutionItem.typeKeywords = solutionItem.typeKeywords.concat(
        options!.additionalTypeKeywords
      );
    }

    const solutionData: ISolutionItemData = {
      metadata: {},
      templates: []
    };

    // Create new solution item
    createItemWithData(
      sanitizeJSONAndReportChanges(solutionItem),
      solutionData,
      authentication,
      options?.folderId
    ).then(createResponse => {
      // Thumbnail must be added manually
      if (solutionItem.thumbnailurl) {
        addThumbnailFromUrl(
          solutionItem.thumbnailurl,
          createResponse.id,
          authentication
        ).then(
          response => {
            if (response.success) {
              resolve(createResponse.id);
            } else {
              // Created solution item, but couldn't add to it
              removeItem(createResponse.id, authentication).then(
                () => reject(response),
                () => reject(response)
              );
            }
          },
          updateError => {
            // Created solution item, but couldn't add to it
            removeItem(createResponse.id, authentication).then(
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
 * Gets the deploy.id and deploy.version tag values.
 *
 * @param tags A list of item tags
 * @return A list ocntaining the two values found in the tags, or defaulting to a new GUID and "1.0", respectively,
 * as needed
 * @internal
 */
export function _getDeploymentProperties(tags: string[]): string[] {
  return [
    "solutionid-" +
      (_getDeploymentProperty("deploy.id.", tags) ?? createPseudoGUID()),
    "solutionversion-" +
      (_getDeploymentProperty("deploy.version.", tags) ?? "1.0")
  ];
}

/**
 * Searches for a tag that has the specified prefix and returns the rest of the tag following that prefix.
 *
 * @param desiredTagPrefix Tag prefix to look for
 * @param tags A list of item tags
 * @return The extracted value of the first matching tag or null if a tag with the specified prefix is not found
 * @internal
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
