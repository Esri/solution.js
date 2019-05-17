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
 * Provides common functions involving the management of item and group resources.
 *
 * @module resourceHelpers
 */

import * as auth from "@esri/arcgis-rest-auth";
import * as portal from "@esri/arcgis-rest-portal";
import * as request from "@esri/arcgis-rest-request";

// ------------------------------------------------------------------------------------------------------------------ //

export function generateSourceResourceUrl(
  portalSharingUrl: string,
  itemId: string,
  sourceResourceTag: string
): string {
  return portalSharingUrl + "/content/items/" + itemId + "/resources/" + sourceResourceTag;
}

export function generateSourceMetadataUrl(
  portalSharingUrl: string,
  itemId: string
): string {
  return portalSharingUrl + "/content/items/" + itemId + "/info/metadata/metadata.xml";
}

export function generateSourceThumbnailUrl(
  portalSharingUrl: string,
  itemId: string,
  thumbnailUrlPart: string,
  isGroup = false
): string {
  return portalSharingUrl + (isGroup ? "/community/groups/" : "/content/items/") + itemId + "/info/" + thumbnailUrlPart;
}

export function generateResourceStorageTag(
  itemId: string,
  sourceResourceTag: string
): {
  folder: string;
  filename: string;
} {
  let folder = itemId;
  let filename = sourceResourceTag;
  const resourceTagParts = sourceResourceTag.split("/");
  if (resourceTagParts.length > 1) {
    folder += "_" + resourceTagParts[0];
    filename = resourceTagParts[1];
  }
  return { folder, filename };
}

export function generateMetadataStorageTag(
  itemId: string
): {
  folder: string;
  filename: string;
} {
  const folder = itemId + "_info_metadata";
  const filename = "metadata.xml";
  return { folder, filename };
}

export function generateThumbnailStorageTag(
  itemId: string,
  thumbnailUrl: string
): {
  folder: string;
  filename: string;
} {
  const folder = itemId + "_info_thumbnail";
  const filename = encodeURIComponent(thumbnailUrl);
  return { folder, filename };
}

export function generateResourceTagFromStorage(
  storageResourceTag: string
): {
  folder: string;
  filename: string;
} {
  let [folder, filename] = storageResourceTag.split("/");
  if (folder.endsWith("_info_thumbnail")) {
    filename = decodeURIComponent(filename);
  } else if (folder.endsWith("_info_metadata")) {
    filename = "metadata.xml";
  } else {
    // Remove the item id from the folder name; anything left over is a folder for the destination
    const folderNameParts = folder.split("_");
    folder = folderNameParts.length === 1 ? "" : folderNameParts[1];
  }
  return { folder, filename };
}

/**
 * Copies a resource from a URL to an item.
 *
 * @param source.url URL to source resource
 * @param source.requestOptions Options for requesting information from source
 * @param destination.itemId Id of item to receive copy of resource
 * @param destination.folderName Folder in destination for resource; defaults to top level
 * @param destination.filename Filename in destination for resource
 * @param destination.requestOptions Options for writing information to destination
 * @return A promise which resolves to the tag under which the resource is stored
 */
export function copyResource(
  source: {
    url: string,
    requestOptions: auth.IUserRequestOptions
  },
  destination: {
    itemId: string,
    folderName: string,
    filename: string,
    requestOptions: auth.IUserRequestOptions
  }
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // Get the resource from the URL
    const requestOptions = {
      rawResponse: true,
      ...source.requestOptions
    } as request.IRequestOptions;
    request.request(source.url, requestOptions).then(
      content => {
        // Add it to the destination item
        content.blob().then(
          (blob: any) => {
            const resourceTag = destination.folderName ?
              destination.folderName + "/" + destination.filename : destination.filename;
            const addRsrcOptions = {
              id: destination.itemId,
              resource: blob,
              name: destination.filename,
              ...destination.requestOptions
            };
            if (destination.folderName) {
              addRsrcOptions.params = {
                resourcesPrefix: destination.folderName
              };
            }
            portal.addItemResource(addRsrcOptions).then(
              () => resolve(resourceTag),
              e => reject(fail(e)) // unable to store copy of resource
            );
          },
          (e: any) => reject(fail(e)) // unable to get blob out of resource
        );
      },
      e => reject(fail(e)) // unable to get resource
    );
  });
}
