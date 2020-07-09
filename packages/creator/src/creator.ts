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
  IGroup,
  removeItem,
  sanitizeJSONAndReportChanges
} from "@esri/solution-common";
import { UserSession } from "@esri/arcgis-rest-auth";
import { failSafe, IModel } from "@esri/hub-common";
import { _addContentToSolution } from "./helpers/add-content-to-solution";

// Simple no-op to clean up progressCallback management
// tslint:disable-next-line: no-empty
const noOp = () => {};

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
  let createOptions: ICreateSolutionOptions = options || {};
  const progressCb = createOptions.progressCallback || noOp;

  progressCb(1); // let the caller know that we've started

  // Get group information
  return Promise.all([
    getGroupBase(sourceId, authentication),
    getGroupContents(sourceId, authentication)
  ])
    .then(
      responses => {
        const [groupInfo, groupItems] = responses;
        progressCb(15);
        // update the createOptions with values from the group
        createOptions = _applyGroupToCreateOptions(
          createOptions,
          groupInfo,
          authentication
        );
        // Create a solution with the group contents
        return _createSolutionFromItemIds(
          groupItems,
          authentication,
          createOptions
        );
      },

      // Try sourceId as an item if group fetch fails
      () => {
        return _createSolutionFromItemIds(
          [sourceId],
          authentication,
          createOptions
        );
      }
    )
    .then(
      createdSolutionId => {
        progressCb(100); // finished
        return createdSolutionId;
      },
      error => {
        // Error fetching group, group contents, or item, or error creating solution from ids
        progressCb(1);
        console.error(error);
        throw error;
      }
    );
}

/**
 * Update the createOptions with the group properties
 *
 * @param createOptions
 * @param groupInfo
 * @param authentication
 * @internal
 */
export function _applyGroupToCreateOptions(
  createOptions: ICreateSolutionOptions,
  groupInfo: IGroup,
  authentication: UserSession
): ICreateSolutionOptions {
  // Create a solution from the group's contents,
  // using the group's information as defaults for the solution item
  ["title", "snippet", "description", "tags"].forEach(prop => {
    createOptions[prop] = createOptions[prop] ?? groupInfo[prop];
  });

  if (!createOptions.thumbnailurl && groupInfo.thumbnail) {
    // Copy the group's thumbnail to the new item
    // createOptions.thumbnail needs to be a full URL
    createOptions.thumbnailurl = generateSourceThumbnailUrl(
      authentication.portal,
      groupInfo.id,
      groupInfo.thumbnail,
      true
    );
  }
  return createOptions;
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
  let solutionId = "";
  // Create a solution from the list of items
  return _createSolutionItem(authentication, options)
    .then(id => {
      solutionId = id;
      // Add list of items to the new solution
      return _addContentToSolution(
        solutionId,
        itemIds,
        authentication,
        options
      );
    })
    .catch(addError => {
      // If the solution item got created, delete it
      if (solutionId) {
        const failSafeRemove = failSafe(removeItem, { success: true });
        return failSafeRemove(solutionId, authentication).then(() => {
          throw addError;
        });
      } else {
        throw addError;
      }
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
  const model = _createSolutionItemModel(options);

  let solutionItemId = "";
  // Create new solution item
  return createItemWithData(
    model.item,
    model.data,
    authentication,
    options?.folderId
  )
    .then(createResponse => {
      solutionItemId = createResponse.id;
      // Thumbnail must be added manually
      if (model.item.thumbnailurl) {
        return addThumbnailFromUrl(
          model.item.thumbnailurl,
          solutionItemId,
          authentication
        );
      } else {
        return Promise.resolve({ success: true });
      }
    })
    .then(result => {
      // this seems convoluted - maybe addThumbnailFromUrl should
      // reject if it gets success: false?
      if (result.success) {
        return solutionItemId;
      } else {
        throw result;
      }
    })
    .catch(err => {
      if (solutionItemId) {
        const failSafeRemove = failSafe(removeItem, { success: true });
        return failSafeRemove(solutionItemId, authentication).then(() => {
          throw err;
        });
      } else {
        throw err;
      }
    });
}

/**
 * Create the Solution Item model to be used to create
 * the Solution Item itself
 *
 * @param options
 * @internal
 */
export function _createSolutionItemModel(options: any): IModel {
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
    tags: creationTags.filter((tag: any) => !tag.startsWith("deploy.")),
    typeKeywords: ["Solution", "Template"].concat(
      _getDeploymentProperties(creationTags)
    )
  };

  // ensure that snippet and description are not nefarious
  const sanitizedItem = sanitizeJSONAndReportChanges(solutionItem);

  const addlKeywords = options?.additionalTypeKeywords || [];
  sanitizedItem.typeKeywords = [...solutionItem.typeKeywords, ...addlKeywords];

  const solutionData: ISolutionItemData = {
    metadata: {},
    templates: []
  };
  return {
    item: sanitizedItem,
    data: solutionData
  };
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
