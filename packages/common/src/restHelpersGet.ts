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
 * @module restHelpersGet
 */

import {
  blobToFile,
  blobToJson,
  blobToText,
  checkUrlPathTermination,
  getProp
} from "./generalHelpers";
import {
  IGetResourcesResponse,
  IGroup,
  IItem,
  IPagingParams,
  IPortal,
  IRelatedItems,
  ItemRelationshipType,
  IUser,
  UserSession
} from "./interfaces";
import {
  IGetGroupContentOptions,
  IGetRelatedItemsResponse,
  IGroupCategorySchema,
  IItemRelationshipOptions,
  getGroup,
  getGroupCategorySchema as portalGetGroupCategorySchema,
  getGroupContent,
  getItem,
  getItemResources as portalGetItemResources,
  getPortal as portalGetPortal,
  getRelatedItems
} from "@esri/arcgis-rest-portal";
import { IRequestOptions, request } from "@esri/arcgis-rest-request";
import { getBlob } from "./resources/get-blob";
import { searchGroups, searchGroupContents } from "./restHelpers";

// ------------------------------------------------------------------------------------------------------------------ //

const ZIP_FILE_HEADER_SIGNATURE = "PK";

export function getPortal(
  id: string,
  authentication: UserSession
): Promise<IPortal> {
  const requestOptions = {
    authentication: authentication
  };
  return portalGetPortal(id, requestOptions);
}

export function getUser(authentication: UserSession): Promise<IUser> {
  return authentication.getUser();
}

export function getUsername(authentication: UserSession): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    getUser(authentication).then(
      (user: IUser) => resolve(user.username),
      reject
    );
  });
}

export function getFoldersAndGroups(authentication: UserSession): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const requestOptions = {
      httpMethod: "GET",
      authentication: authentication,
      rawResponse: false
    } as IRequestOptions;

    // Folders
    const foldersUrl: string = `${
      authentication.portal
    }/content/users/${encodeURIComponent(authentication.username)}`;

    // Groups
    const groupsUrl: string = `${
      authentication.portal
    }/community/users/${encodeURIComponent(authentication.username)}`;

    Promise.all([
      request(foldersUrl, requestOptions),
      request(groupsUrl, requestOptions)
    ]).then(
      responses => {
        resolve({
          folders: responses[0].folders || [],
          groups: responses[1].groups || []
        });
      },
      e => reject(e)
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
  authentication: UserSession,
  ignoreErrors: number[] = [],
  mimeType?: string
): Promise<File> {
  return new Promise<File>((resolve, reject) => {
    // Get the blob from the URL
    getBlobCheckForError(url, authentication, ignoreErrors).then(
      blob =>
        !blob ? resolve() : resolve(blobToFile(blob, filename, mimeType)),
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
  authentication: UserSession,
  ignoreErrors: number[] = []
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    // Get the blob from the URL
    getBlob(url, authentication).then(blob => {
      // Reclassify text/plain blobs as needed
      _fixTextBlobType(blob).then(adjustedBlob => {
        if (adjustedBlob.type === "application/json") {
          // Blob may be an error
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          blobToJson(adjustedBlob).then((json: any) => {
            // Check for valid JSON with an error
            if (json && json.error) {
              const code: number = json.error.code;
              if (code !== undefined && ignoreErrors.indexOf(code) >= 0) {
                resolve(); // Error, but ignored
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
 * Extracts the text in a url between the last forward slash and the beginning of the url's parameters.
 *
 * @param url URL to work with
 * @return Text extracted; empty if url ends with a forward slash or has a "?" immediately after the last
 * forward slash
 */
export function getFilenameFromUrl(url: string): string {
  if (!url) {
    return "";
  }

  let iParamsStart = url.indexOf("?");
  /* istanbul ignore else */
  if (iParamsStart < 0) {
    iParamsStart = url.length;
  }
  const iFilenameStart = url.lastIndexOf("/", iParamsStart) + 1;

  return iFilenameStart < iParamsStart
    ? url.substring(iFilenameStart, iParamsStart)
    : "";
}

export function getInfoFiles(
  itemId: string,
  infoFilenames: string[],
  authentication: UserSession
): Array<Promise<File>> {
  return infoFilenames.map(filename => {
    return new Promise<File>((resolve, reject) => {
      getItemInfoBlob(itemId, filename, authentication).then(
        blob =>
          blob === undefined ? resolve() : resolve(blobToFile(blob, filename)),
        reject
      );
    });
  });
}

/**
 * Gets the primary information of an AGO group.
 *
 * @param groupId Id of an group whose primary information is sought
 * @param authentication Credentials for the request to AGO
 * @return A promise that will resolve with group's JSON or error JSON or throws ArcGISRequestError in case of HTTP error
 *         or response error code
 */
export function getGroupBase(
  groupId: string,
  authentication: UserSession
): Promise<IGroup> {
  const requestOptions = {
    authentication: authentication
  };
  return getGroup(groupId, requestOptions);
}

/**
 * Gets the category schema set on a group.
 *
 * @param groupId Id of an group whose category schema information is sought
 * @param authentication Credentials for the request to AGO
 * @return A promise that will resolve with JSON of group's category schema
 * @see https://developers.arcgis.com/rest/users-groups-and-items/group-category-schema.htm
 */
export function getGroupCategorySchema(
  groupId: string,
  authentication: UserSession
): Promise<IGroupCategorySchema> {
  const requestOptions = {
    authentication: authentication
  };
  return portalGetGroupCategorySchema(groupId, requestOptions);
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
  authentication: UserSession
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const pagingParams: IPagingParams = {
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
export function getItemBase(
  itemId: string,
  authentication: UserSession
): Promise<IItem> {
  const itemParam: IRequestOptions = {
    authentication: authentication
  };
  return getItem(itemId, itemParam);
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
  authentication: UserSession
): Promise<File> {
  return new Promise<File>((resolve, reject) => {
    getItemDataBlob(itemId, authentication).then(
      blob => (!blob ? resolve() : resolve(blobToFile(blob, filename))),
      () => {
        reject();
      }
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
  authentication: UserSession
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    getItemDataBlob(itemId, authentication).then(
      blob => (!blob ? resolve() : resolve(blobToJson(blob))),
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
  authentication: UserSession
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const url = getItemDataBlobUrl(itemId, authentication);
    getBlobCheckForError(url, authentication, [500]).then(
      blob => resolve(_fixTextBlobType(blob)),
      () => {
        reject();
      }
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
  authentication: UserSession
): string {
  return `${getPortalSharingUrlFromAuth(
    authentication
  )}/content/items/${itemId}/data`;
}

/**
 * Gets information item in an AGO item.
 *
 * @param itemId Id of an item whose data information is sought
 * @param authentication Credentials for the request to AGO
 * @return A promise that will resolve with the metadata Blob or null if the item doesn't have a metadata file
 */
export function getItemInfoBlob(
  itemId: string,
  infoFilename: string,
  authentication: UserSession
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const url = getItemInfoFileUrlPrefix(itemId, authentication) + infoFilename;

    getBlobCheckForError(url, authentication, [400]).then(
      (blob: Blob) => resolve(_fixTextBlobType(blob)),
      reject
    );
  });
}

/**
 * Gets the URL to an information item in an AGO item.
 *
 * @param itemId Id of an item whose data information is sought
 * @param authentication Credentials for the request to AGO
 * @return URL string
 */
export function getItemInfoFileUrlPrefix(
  itemId: string,
  authentication: UserSession
): string {
  return `${getPortalSharingUrlFromAuth(
    authentication
  )}/content/items/${itemId}/info/`;
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
  authentication: UserSession
): Promise<File> {
  return new Promise<File>((resolve, reject) => {
    getItemMetadataBlob(itemId, authentication).then(
      blob => (!blob ? resolve() : resolve(blobToFile(blob, "metadata.xml"))),
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
  authentication: UserSession
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
  authentication: UserSession
): string {
  return (
    getItemInfoFileUrlPrefix(itemId, authentication) + "metadata/metadata.xml"
  );
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
  relationshipType: ItemRelationshipType | ItemRelationshipType[],
  direction: "forward" | "reverse",
  authentication: UserSession
): Promise<IGetRelatedItemsResponse> {
  return new Promise<IGetRelatedItemsResponse>(resolve => {
    const itemRelatedItemsParam: IItemRelationshipOptions = {
      id: itemId,
      relationshipType,
      direction,
      authentication: authentication
    };
    getRelatedItems(itemRelatedItemsParam).then(
      (response: IGetRelatedItemsResponse) => {
        resolve(response);
      },
      () => {
        resolve({
          total: 0,
          start: 1,
          num: 0,
          nextStart: -1,
          relatedItems: []
        } as IGetRelatedItemsResponse);
      }
    );
  });
}

/**
 * Gets all of the related items of an AGO item in the specified direction.
 *
 * @param itemId Id of an item whose related items are sought
 * @param direction
 * @param authentication Credentials for the request to AGO
 * @return A promise that will resolve with a list of IRelatedItems
 */
export function getItemRelatedItemsInSameDirection(
  itemId: string,
  direction: "forward" | "reverse",
  authentication: UserSession
): Promise<IRelatedItems[]> {
  return new Promise<IRelatedItems[]>(resolve => {
    const relationshipTypes = [
      // from ItemRelationshipType
      "Map2Service",
      "WMA2Code",
      "Map2FeatureCollection",
      "MobileApp2Code",
      "Service2Data",
      "Service2Service",
      "Map2AppConfig",
      "Item2Attachment",
      "Item2Report",
      "Listed2Provisioned",
      "Style2Style",
      "Service2Style",
      "Survey2Service",
      "Survey2Data",
      "Service2Route",
      "Area2Package",
      "Map2Area",
      "Service2Layer",
      "Area2CustomPackage",
      "TrackView2Map",
      "SurveyAddIn2Data"
    ];

    const relatedItemDefs: Array<Promise<
      IGetRelatedItemsResponse
    >> = relationshipTypes.map(relationshipType =>
      getItemRelatedItems(
        itemId,
        relationshipType as ItemRelationshipType,
        direction,
        authentication
      )
    );
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Promise.all(relatedItemDefs).then(
      (relationshipResponses: IGetRelatedItemsResponse[]) => {
        const relatedItems: IRelatedItems[] = [];

        for (let i: number = 0; i < relationshipTypes.length; ++i) {
          if (relationshipResponses[i].total > 0) {
            relatedItems.push({
              relationshipType: relationshipTypes[i],
              relatedItemIds: relationshipResponses[i].relatedItems.map(
                item => item.id
              )
            });
          }
        }

        resolve(relatedItems);
      }
    );
  });
}

export function getItemResources(
  id: string,
  authentication: UserSession
): Promise<any> {
  return new Promise<any>(resolve => {
    const requestOptions = {
      authentication: authentication
    };
    portalGetItemResources(id, requestOptions).then(resolve, () => {
      resolve({
        total: 0,
        start: 1,
        num: 0,
        nextStart: -1,
        resources: []
      } as IGetResourcesResponse);
    });
  });
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
  authentication: UserSession
): Promise<File[]> {
  return new Promise<File[]>((resolve, reject) => {
    const pagingParams: IPagingParams = {
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
  authentication: UserSession
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
  authentication: UserSession
): string {
  return (
    checkUrlPathTermination(getPortalSharingUrlFromAuth(authentication)) +
    (isGroup ? "community/groups/" : "content/items/") +
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
  authentication: UserSession
): string {
  // If auth was passed, use that portal
  return getProp(authentication, "portal");
}

/**
 * Extracts the portal url from a supplied authentication.
 *
 * @param authentication Credentials for the request to AGO
 * @returns Portal url to be used in API requests, defaulting to `https://www.arcgis.com`
 */
export function getPortalUrlFromAuth(authentication: UserSession): string {
  return getPortalSharingUrlFromAuth(authentication).replace(
    "/sharing/rest",
    ""
  );
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Fixes the types of Blobs incorrectly typed as text/plain.
 *
 * @param blob Blob to check
 * @return Promise resolving to original Blob, unless it's originally typed as text/plain but is
 * really JSON, ZIP, or XML
 * @protected
 */
export function _fixTextBlobType(blob: Blob): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    if (blob && blob.size > 0 && blob.type.startsWith("text/plain")) {
      blobToText(blob).then(
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
      // Empty or not typed as plain text, so simply return
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
  pagingParams: IPagingParams,
  authentication: UserSession
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    // Fetch group items
    const pagingRequest: IGetGroupContentOptions = {
      paging: pagingParams,
      authentication: authentication
    };

    getGroupContent(groupId, pagingRequest).then(contents => {
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
  pagingParams: IPagingParams,
  authentication: UserSession
): Promise<Array<Promise<File>>> {
  return new Promise<Array<Promise<File>>>((resolve, reject) => {
    // Fetch resources
    const portalSharingUrl = getPortalSharingUrlFromAuth(authentication);
    const trancheUrl = `${portalSharingUrl}/content/items/${itemId}/resources`;
    const itemResourcesDef: Array<Promise<File>> = [];

    const options: IRequestOptions = {
      params: {
        ...pagingParams
      },
      authentication: authentication
    };

    request(trancheUrl, options).then(contents => {
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

/**
 * Retrieves the default basemap for the given & basemapGalleryGroupQuery, basemapTitle
 *
 * @param {string} basemapGalleryGroupQuery The default basemap group query
 * @param {string} basemapTitle The default basemap title
 * @param {UserSession} authentication The session info
 * @returns {IItem}
 */
export function getPortalDefaultBasemap(
  basemapGalleryGroupQuery: string,
  basemapTitle: string,
  authentication: UserSession
) {
  return searchGroups(basemapGalleryGroupQuery, authentication, { num: 1 })
    .then(({ results: [basemapGroup] }) => {
      if (!basemapGroup) {
        throw new Error("No basemap group found");
      }
      return searchGroupContents(
        basemapGroup.id,
        `title:${basemapTitle}`,
        authentication,
        { num: 1 }
      );
    })
    .then(({ results: [defaultBasemap] }) => {
      if (!defaultBasemap) {
        throw new Error("No basemap found");
      }
      return defaultBasemap;
    });
}
