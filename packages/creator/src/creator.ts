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
  appendQueryParam,
  createItemWithData,
  createLongId,
  createShortId,
  CURRENT_SCHEMA_VERSION,
  generateSourceThumbnailUrl,
  getBlobAsFile,
  getFilenameFromUrl,
  getGroupBase,
  getGroupContents,
  getItemBase,
  ICreateSolutionOptions,
  ISolutionItemData,
  IGroup,
  IItem,
  removeItem,
  sanitizeJSONAndReportChanges,
  UserSession
} from "@esri/solution-common";
import { failSafe, IModel } from "@esri/hub-common";
import { addContentToSolution } from "./helpers/add-content-to-solution";

// Simple no-op to clean up progressCallback management
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
  const createOptions: ICreateSolutionOptions = options || {};
  const progressCb = createOptions.progressCallback || noOp;

  progressCb(1); // let the caller know that we've started

  // Assume that source is a group and try to get group's information
  return Promise.all([
    getGroupBase(sourceId, authentication),
    getGroupContents(sourceId, authentication)
  ])
    .then(
      // Group fetches worked; assumption was correct
      responses => {
        createOptions.itemIds = responses[1];
        progressCb(15);

        return new Promise<ICreateSolutionOptions>(resolve => {
          // Update the createOptions with values from the group
          resolve(
            _applySourceToCreateOptions(
              createOptions,
              responses[0],
              authentication,
              true
            )
          );
        });
      },

      // Assumption incorrect; try source as an item
      () => {
        return new Promise<ICreateSolutionOptions>((resolve, reject) => {
          createOptions.itemIds = [sourceId];
          getItemBase(sourceId, authentication).then(
            // Update the createOptions with values from the item
            itemBase =>
              resolve(
                _applySourceToCreateOptions(
                  createOptions,
                  itemBase,
                  authentication,
                  false
                )
              ),
            reject
          );
        });
      }
    )

    .then(
      // Use a copy of the thumbnail rather than a URL to it
      createOptions => {
        return _addThumbnailFileToCreateOptions(createOptions, authentication);
      }
    )

    .then(
      // Create a solution
      createOptions => {
        return _createSolutionFromItemIds(createOptions, authentication);
      }
    )

    .then(
      // Successfully created solution
      createdSolutionId => {
        progressCb(100); // finished
        return createdSolutionId;
      },

      // Error fetching group, group contents, or item, or error creating solution from ids
      error => {
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
 * @param sourceInfo
 * @param authentication
 * @param isGroup Boolean to indicate if the files are associated with a group or item
 * @internal
 */
export function _applySourceToCreateOptions(
  createOptions: ICreateSolutionOptions,
  sourceInfo: IGroup | IItem,
  authentication: UserSession,
  isGroup = false
): ICreateSolutionOptions {
  // Create a solution from the group's or item's contents,
  // using the group's or item's information as defaults for the solution item
  ["title", "snippet", "description", "tags"].forEach(prop => {
    createOptions[prop] = createOptions[prop] ?? sourceInfo[prop];
  });

  if (!createOptions.thumbnailurl && sourceInfo.thumbnail) {
    // Get the full path to the thumbnail
    createOptions.thumbnailurl = generateSourceThumbnailUrl(
      authentication.portal,
      sourceInfo.id,
      sourceInfo.thumbnail,
      isGroup
    );
    delete sourceInfo.thumbnail;
  }

  return createOptions;
}

/**
 * Update the createOptions with the thumbnail file
 *
 * @param createOptions
 * @param authentication
 * @internal
 */
export function _addThumbnailFileToCreateOptions(
  createOptions: ICreateSolutionOptions,
  authentication: UserSession
): Promise<ICreateSolutionOptions> {
  return new Promise<ICreateSolutionOptions>(resolve => {
    if (!createOptions.thumbnail && createOptions.thumbnailurl) {
      // Figure out the thumbnail's filename
      const filename =
        getFilenameFromUrl(createOptions.thumbnailurl) || "thumbnail";
      const thumbnailurl = appendQueryParam(
        createOptions.thumbnailurl,
        "w=400"
      );
      delete createOptions.thumbnailurl;

      // Fetch the thumbnail
      getBlobAsFile(thumbnailurl, filename, authentication).then(
        thumbnail => {
          createOptions.thumbnail = thumbnail;
          resolve(createOptions);
        },
        () => {
          resolve(createOptions);
        }
      );
    } else {
      resolve(createOptions);
    }
  });
}

/**
 * Creates a solution item using a list of AGO item ids.
 *
 * @param options Customizations for creating the solution
 * @param authentication Credentials for the request
 * @return A promise that resolves with the AGO id of the new solution; solution item is deleted if its
 * there is a problem updating it
 * @internal
 */
export function _createSolutionFromItemIds(
  options: ICreateSolutionOptions,
  authentication: UserSession
): Promise<string> {
  let solutionId = "";
  // Create a solution from the list of items
  return _createSolutionItem(authentication, options)
    .then(id => {
      solutionId = id;
      // Add list of items to the new solution
      return addContentToSolution(solutionId, options, authentication);
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
  return new Promise<string>((resolve, reject) => {
    const model = _createSolutionItemModel(options);

    // Create new solution item
    delete model.item.thumbnailurl;
    model.item.thumbnail = options?.thumbnail;
    createItemWithData(
      model.item,
      model.data,
      authentication,
      options?.folderId
    ).then(
      createResponse => {
        resolve(createResponse.id);
      },
      err => {
        reject(err);
      }
    );
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
      (_getDeploymentProperty("deploy.id.", tags) ?? createLongId()),
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
