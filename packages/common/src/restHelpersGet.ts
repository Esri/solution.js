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
 * Provides common item fetch functions involving the arcgis-rest-js library.
 *
 * @module restHelpers
 */

import * as auth from "@esri/arcgis-rest-auth";
import * as generalHelpers from "./generalHelpers";
import * as interfaces from "./interfaces";
import * as portal from "@esri/arcgis-rest-portal";
import * as request from "@esri/arcgis-rest-request";

// ------------------------------------------------------------------------------------------------------------------ //

const ZIP_FILE_HEADER_SIGNATURE = "PK";

/**
 * Gets a Blob from a web site.
 *
 * @param url Address of Blob
 * @param authentication Credentials for the request
 * @return Promise that will resolve with Blob or an AGO-style JSON failure response
 */
export function getBlob(
  url: string,
  authentication: auth.UserSession
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    // Get the blob from the URL
    const blobRequestOptions = {
      authentication: authentication,
      rawResponse: true
    } as request.IRequestOptions;
    request.request(url, blobRequestOptions).then(
      response => {
        // Extract the blob from the response
        response.blob().then(
          resolve,
          reject // unable to get blob out of response
        );
      },
      reject // unable to get response
    );
  });
}

/**
 * Gets a Blob from a web site and casts it as a file using the supplied name.
 *
 * @param url Address of Blob
 * @param filename Name to use for file
 * @param authentication Credentials for the request
 * @return Promise that will resolve with a File, undefined if the Blob is null, or an AGO-style JSON failure response
 */
export function getBlobAsFile(
  url: string,
  filename: string,
  authentication: auth.UserSession,
  ignoreErrors: number[] = []
): Promise<File> {
  return new Promise<File>((resolve, reject) => {
    // Get the blob from the URL
    getBlobCheckForError(url, authentication, ignoreErrors).then(
      blob =>
        !blob
          ? resolve(null)
          : resolve(generalHelpers.blobToFile(blob, filename)),
      reject
    );
  });
}

/**
 * Gets a Blob from a web site and checks for a JSON error packet in the Blob.
 *
 * @param url Address of Blob
 * @param authentication Credentials for the request
 * @param ignoreErrors List of HTTP error codes that should be ignored
 * @return Promise that will resolve with Blob or an AGO-REST JSON failure response
 */
export function getBlobCheckForError(
  url: string,
  authentication: auth.UserSession,
  ignoreErrors: number[] = []
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    // Get the blob from the URL
    getBlob(url, authentication).then(blob => {
      // Reclassify text/plain blobs as needed
      _fixTextBlobType(blob).then(adjustedBlob => {
        if (adjustedBlob.type === "application/json") {
          // Blob may be an error
          // tslint:disable-next-line: no-floating-promises
          generalHelpers.blobToJson(adjustedBlob).then((json: any) => {
            if (json && json.error) {
              const code: number = json.error.code;
              if (code !== undefined && ignoreErrors.indexOf(code) >= 0) {
                resolve(null); // Error, but ignored
              } else {
                reject(json); // Other error; fail with error
              }
            } else {
              resolve(adjustedBlob);
            }
          });
        } else {
          resolve(adjustedBlob);
        }
      }, reject);
    }, reject);
  });
}

/**
 * Gets the ids of the dependencies (contents) of an AGO group.
 *
 * @param groupId Id of a group whose contents are sought
 * @param authentication Credentials for the request to AGO
 * @return A promise that will resolve with list of dependent ids or an empty list
 */
export function getGroupContents(
  groupId: string,
  authentication: auth.UserSession
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const pagingParams: portal.IPagingParams = {
      start: 1,
      num: 100 // max allowed by REST API
    };

    // Fetch group items
    _getGroupContentsTranche(groupId, pagingParams, authentication).then(
      contents => {
        resolve(contents);
      },
      reject
    );
  });
}

/**
 * Gets the primary information of an AGO item.
 *
 * @param itemId Id of an item whose primary information is sought
 * @param authentication Credentials for the request to AGO
 * @return A promise that will resolve with item's JSON or error JSON or throws ArcGISRequestError in case of HTTP error
 *         or response error code
 */
export function getItem(
  itemId: string,
  authentication: auth.UserSession
): Promise<any> {
  // Get item data
  const itemParam: request.IRequestOptions = {
    authentication: authentication
  };
  return portal.getItem(itemId, itemParam);
}

/**
 * Gets the primary information of an AGO item.
 *
 * @param itemId Id of an item whose primary information is sought
 * @param authentication Credentials for the request to AGO
 * @return A promise that will resolve with item's JSON or error JSON or throws ArcGISRequestError in case of HTTP error
 *         or response error code
 */
export function getItemBase(
  itemId: string,
  authentication: auth.UserSession
): Promise<any> {
  const itemParam: request.IRequestOptions = {
    authentication: authentication
  };
  return portal.getItem(itemId, itemParam);
}

/**
 * Gets the data information of an AGO item.
 *
 * @param itemId Id of an item whose data information is sought
 * @param authentication Credentials for the request to AGO
 * @param convertToJsonIfText Switch indicating that MIME type "text/plain" should be converted to JSON;
 * MIME type "application/json" is always converted
 * @return A promise that will resolve with 1. null in case of error, or 2. JSON if "application/json" or ("text/plain"
 * && convertToJsonIfText), or 3. text if ("text/plain" && ¬convertToJsonIfText), or 3. blob
 */
export function getItemData(
  itemId: string,
  authentication: auth.UserSession,
  convertToJsonIfText = true
): Promise<any> {
  return new Promise<any>(resolve => {
    // Get item data
    const itemDataParam: portal.IItemDataOptions = {
      authentication: authentication,
      file: true
    };

    // Need to shield call because it throws an exception if the item doesn't have data
    try {
      portal.getItemData(itemId, itemDataParam).then(
        blob => {
          if (blob.type === "application/json" || blob.type === "text/plain") {
            generalHelpers.blobToText(blob).then(
              (response: string) => {
                if (
                  blob.type === "application/json" ||
                  (blob.type === "text/plain" && convertToJsonIfText)
                ) {
                  const json = response !== "" ? JSON.parse(response) : null;
                  resolve(json && json.error ? null : json);
                } else {
                  resolve(response);
                }
              },
              () => {
                resolve(null);
              }
            );
          } else {
            resolve(blob);
          }
        },
        () => resolve(null)
      );
    } catch (ignored) {
      resolve(null);
    }
  });
}

/**
 * Gets the data information of an AGO item in its raw (Blob) form and casts it as a file using the supplied name.
 *
 * @param itemId Id of an item whose data information is sought
 * @param filename Name to use for file
 * @param authentication Credentials for the request to AGO
 * @return Promise that will resolve with a File, undefined if the Blob is null, or an AGO-style JSON failure response
 */
export function getItemDataAsFile(
  itemId: string,
  filename: string,
  authentication: auth.UserSession
): Promise<File> {
  return new Promise<File>((resolve, reject) => {
    getItemDataBlob(itemId, authentication).then(
      blob =>
        !blob ? resolve() : resolve(generalHelpers.blobToFile(blob, filename)),
      reject
    );
  });
}

/**
 * Gets the data information of an AGO item in its JSON form.
 *
 * @param itemId Id of an item whose data information is sought
 * @param filename Name to use for file
 * @param authentication Credentials for the request to AGO
 * @return Promise that will resolve with JSON, or an AGO-style JSON failure response
 */
export function getItemDataAsJson(
  itemId: string,
  authentication: auth.UserSession
): Promise<File> {
  return new Promise<File>((resolve, reject) => {
    getItemDataBlob(itemId, authentication).then(
      blob => (!blob ? resolve() : resolve(generalHelpers.blobToJson(blob))),
      reject
    );
  });
}

/**
 * Gets the data information of an AGO item in its raw (Blob) form.
 *
 * @param itemId Id of an item whose data information is sought
 * @param authentication Credentials for the request to AGO
 * @return A promise that will resolve with the data Blob or null if the item doesn't have a data section
 */
export function getItemDataBlob(
  itemId: string,
  authentication: auth.UserSession
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const url = getItemDataBlobUrl(itemId, authentication);

    getBlobCheckForError(url, authentication, [500]).then(
      blob => resolve(_fixTextBlobType(blob)),
      reject
    );
  });
}

/**
 * Gets the URL to the data information of an AGO item in its raw (Blob) form.
 *
 * @param itemId Id of an item whose data information is sought
 * @param authentication Credentials for the request to AGO
 * @return URL string
 */
export function getItemDataBlobUrl(
  itemId: string,
  authentication: auth.UserSession
): string {
  return `${getPortalSharingUrlFromAuth(
    authentication
  )}/content/items/${itemId}/data`;
}

/**
 * Gets the metadata information of an AGO item.
 *
 * @param itemId Id of an item whose data information is sought
 * @param authentication Credentials for the request to AGO
 * @return Promise that will resolve with a File containing the metadata or an AGO-style JSON failure response
 */
export function getItemMetadataAsFile(
  itemId: string,
  authentication: auth.UserSession
): Promise<File> {
  return new Promise<File>((resolve, reject) => {
    getItemMetadataBlob(itemId, authentication).then(
      blob =>
        !blob
          ? resolve()
          : resolve(generalHelpers.blobToFile(blob, "metadata.xml")),
      reject
    );
  });
}

/**
 * Gets the metadata information of an AGO item.
 *
 * @param itemId Id of an item whose data information is sought
 * @param authentication Credentials for the request to AGO
 * @return A promise that will resolve with the metadata Blob or null if the item doesn't have a metadata file
 */
export function getItemMetadataBlob(
  itemId: string,
  authentication: auth.UserSession
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const url = getItemMetadataBlobUrl(itemId, authentication);

    getBlobCheckForError(url, authentication, [400]).then(
      (blob: Blob) => resolve(_fixTextBlobType(blob)),
      reject
    );
  });
}

/**
 * Gets the URL to the metadata information of an AGO item.
 *
 * @param itemId Id of an item whose data information is sought
 * @param authentication Credentials for the request to AGO
 * @return URL string
 */
export function getItemMetadataBlobUrl(
  itemId: string,
  authentication: auth.UserSession
): string {
  return `${getPortalSharingUrlFromAuth(
    authentication
  )}/content/items/${itemId}/info/metadata/metadata.xml`;
}

/**
 * Gets the related items of an AGO item.
 *
 * @param itemId Id of an item whose related items are sought
 * @param relationshipType
 * @param direction
 * @param authentication Credentials for the request to AGO
 * @return A promise that will resolve with an arcgis-rest-js `IGetRelatedItemsResponse` structure
 */
export function getItemRelatedItems(
  itemId: string,
  relationshipType: portal.ItemRelationshipType | portal.ItemRelationshipType[],
  direction: "forward" | "reverse",
  authentication: auth.UserSession
): Promise<portal.IGetRelatedItemsResponse> {
  // Get item related items
  const itemRelatedItemsParam: portal.IItemRelationshipOptions = {
    id: itemId,
    relationshipType,
    direction,
    authentication: authentication
  };
  return portal.getRelatedItems(itemRelatedItemsParam);
}

/**
 * Gets the resources of an AGO item.
 *
 * @param itemId Id of an item whose resources are sought
 * @param authentication Credentials for the request to AGO
 * @return Promise that will resolve with a list of Files or an AGO-style JSON failure response
 */
export function getItemResourcesFiles(
  itemId: string,
  authentication: auth.UserSession
): Promise<File[]> {
  return new Promise<File[]>((resolve, reject) => {
    const pagingParams: portal.IPagingParams = {
      start: 1,
      num: 100 // max allowed by REST API
    };

    // Fetch resources
    _getItemResourcesTranche(itemId, pagingParams, authentication).then(
      itemResourcesDef => {
        Promise.all(itemResourcesDef).then(resolve, reject);
      },
      reject
    );
  });
}

/**
 * Gets the thumbnail of an AGO item.
 *
 * @param itemId Id of an item whose resources are sought
 * @param thumbnailUrlPart The partial name of the item's thumbnail as reported by the `thumbnail` property
 * in the item's base section
 * @param isGroup Switch indicating if the item is a group
 * @param authentication Credentials for the request to AGO
 * @return Promise that will resolve with an image Blob or an AGO-style JSON failure response
 */
export function getItemThumbnail(
  itemId: string,
  thumbnailUrlPart: string,
  isGroup: boolean,
  authentication: auth.UserSession
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    if (!thumbnailUrlPart) {
      resolve();
      return;
    }

    const url = getItemThumbnailUrl(
      itemId,
      thumbnailUrlPart,
      isGroup,
      authentication
    );

    getBlobCheckForError(url, authentication, [500]).then(
      blob => resolve(_fixTextBlobType(blob)),
      reject
    );
  });
}

/**
 * Gets the URL to the thumbnail of an AGO item.
 *
 * @param itemId Id of an item whose resources are sought
 * @param thumbnailUrlPart The partial name of the item's thumbnail as reported by the `thumbnail` property
 * in the item's base section
 * @param isGroup Switch indicating if the item is a group
 * @param authentication Credentials for the request to AGO
 * @return URL string
 */
export function getItemThumbnailUrl(
  itemId: string,
  thumbnailUrlPart: string,
  isGroup: boolean,
  authentication: auth.UserSession
): string {
  return (
    getPortalSharingUrlFromAuth(authentication) +
    (isGroup ? "/community/groups/" : "/content/items/") +
    itemId +
    "/info/" +
    thumbnailUrlPart
  );
}

/**
 * Extracts the portal sharing url from a supplied authentication.
 *
 * @param authentication Credentials for the request to AGO
 * @returns Portal sharing url to be used in API requests, defaulting to `https://www.arcgis.com/sharing/rest`
 */
export function getPortalSharingUrlFromAuth(
  authentication: auth.UserSession
): string {
  // If auth was passed, use that portal
  return generalHelpers.getProp(authentication, "portal");
}

/**
 * Extracts the portal url from a supplied authentication.
 *
 * @param authentication Credentials for the request to AGO
 * @returns Portal url to be used in API requests, defaulting to `https://www.arcgis.com`
 */
export function getPortalUrlFromAuth(authentication: auth.UserSession): string {
  return getPortalSharingUrlFromAuth(authentication).replace(
    "/sharing/rest",
    ""
  );
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Fixes the types of Blobs incorrectly typed as text/plain.
 * @param blob Blob to check
 * @return Promise resolving to original Blob, unless it's originally typed as text/plain but is
 * really JSON, ZIP, or XML
 * @protected
 */
export function _fixTextBlobType(blob: Blob): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    if (blob && blob.type.startsWith("text/plain")) {
      generalHelpers.blobToText(blob).then(
        blobText => {
          // Convertible to JSON?
          try {
            JSON.parse(blobText);
            // Yes; reclassify as JSON
            resolve(new Blob([blob], { type: "application/json" }));
          } catch (ignored) {
            // Nope; test for ZIP file
            if (
              blobText.length > 4 &&
              blobText.substr(0, 4) === ZIP_FILE_HEADER_SIGNATURE
            ) {
              // Yes; reclassify as ZIP
              resolve(new Blob([blob], { type: "application/zip" }));
            } else if (blobText.startsWith("<")) {
              // Reclassify as XML; since the blob started out as text/plain, it's more likely that is
              // meant to be human-readable, so we'll use text/xml instead of application/xml
              resolve(new Blob([blob], { type: "text/xml" }));
            } else {
              // Leave as text
              resolve(blob);
            }
          }
        },
        // Faulty blob
        reject
      );
    } else {
      // Not typed as plain text, so simply return
      resolve(blob);
    }
  });
}

/**
 * Gets some of the ids of the dependencies (contents) of an AGO group.
 *
 * @param groupId Id of a group whose contents are sought
 * @param pagingParams Structure with start and num properties for the tranche to fetch
 * @param authentication Credentials for the request to AGO
 * @return A promise that will resolve with list of dependent ids or an empty list
 * @protected
 */
export function _getGroupContentsTranche(
  groupId: string,
  pagingParams: portal.IPagingParams,
  authentication: auth.UserSession
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    // Fetch group items
    const pagingRequest: portal.IGetGroupContentOptions = {
      paging: pagingParams,
      authentication: authentication
    };

    portal.getGroupContent(groupId, pagingRequest).then(contents => {
      if (contents.num > 0) {
        // Extract the list of content ids from the JSON returned
        const trancheIds: string[] = contents.items.map((item: any) => item.id);

        // Are there more contents to fetch?
        if (contents.nextStart > 0) {
          pagingRequest.paging.start = contents.nextStart;
          _getGroupContentsTranche(groupId, pagingParams, authentication).then(
            (allSubsequentTrancheIds: string[]) => {
              // Append all of the following tranches to the current tranche and return it
              resolve(trancheIds.concat(allSubsequentTrancheIds));
            },
            reject
          );
        } else {
          resolve(trancheIds);
        }
      } else {
        resolve([]);
      }
    }, reject);
  });
}

/**
 * Gets some of the resources of an AGO item.
 *
 * @param itemId Id of an item whose resources are sought
 * @param pagingParams Structure with start and num properties for the tranche to fetch
 * @param authentication Credentials for the request to AGO
 * @return Promise that will resolve with a list of File promises or an AGO-style JSON failure response
 * @protected
 */
export function _getItemResourcesTranche(
  itemId: string,
  pagingParams: portal.IPagingParams,
  authentication: auth.UserSession
): Promise<Array<Promise<File>>> {
  return new Promise<Array<Promise<File>>>((resolve, reject) => {
    // Fetch resources
    const portalSharingUrl = getPortalSharingUrlFromAuth(authentication);
    const trancheUrl = `${portalSharingUrl}/content/items/${itemId}/resources`;
    const itemResourcesDef: Array<Promise<File>> = [];

    const options: request.IRequestOptions = {
      params: {
        ...pagingParams
      },
      authentication: authentication
    };

    request.request(trancheUrl, options).then(contents => {
      if (contents.num > 0) {
        // Extract the list of resource filenames from the JSON returned
        contents.resources.forEach((resource: any) => {
          const itemResourceUrl = `${portalSharingUrl}/content/items/${itemId}/resources/${resource.resource}`;
          itemResourcesDef.push(
            getBlobAsFile(itemResourceUrl, resource.resource, authentication)
          );
        });

        // Are there more resources to fetch?
        if (contents.nextStart > 0) {
          pagingParams.start = contents.nextStart;
          _getItemResourcesTranche(itemId, pagingParams, authentication).then(
            (allSubsequentTrancheDefs: Array<Promise<File>>) => {
              // Append all of the following tranches to the current tranche and return it
              resolve(itemResourcesDef.concat(allSubsequentTrancheDefs));
            },
            reject
          );
        } else {
          resolve(itemResourcesDef);
        }
      } else {
        resolve([]);
      }
    }, reject);
  });
}
