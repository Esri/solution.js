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
 *
 * How it works
 *
 * An item may have resources that are listed as a set of filenames and/or folder/filename combinations. It may have
 * a thumbnail, listed in its item info as a filename or folder/filename combination. It may have metadata, which is
 * not listed, but has a distinct URL. A group may have a thumbnail, but not the others.
 *
 * For storing these files in a common storage item, a new folder and filename combination is created for each. The
 * filename is kept as-is. The folder consists of the source item's id and an optional suffix. For thumbnails, the
 * suffix is "_info_thumbnail"; for metadata, the suffix is "_info_metadata"; for resources, the suffix is "_" plus
 * the resource's folder's name; if the resource doesn't have a folder, there is no suffix.
 *
 * Note that "thumbnail" is included in an item's thumbnail property like a folder (e.g., "thumbnail/thumbnail.png"),
 * and the item's thumbnail is accessed using a path such as "%lt;itemId&gt;/info/thumbnail/thumbnail.png". Groups,
 * on the other hand, have a property with a simple name (e.g., "thumbnail.png") and it is accessed using a path
 * such as "%lt;groupId&gt;/info/thumbnail.png".
 *
 * For copying these files from the common storage item to another item, one converts the unique names back into the
 * original names (or the special cases for thumbnails and metadata).
 *
 * Routines are provided to
 *   1. create full URLs to resources, thumbnails, and metadata.
 *   2. create a folder and filename combination that uniquely identifies these files for
 *      storing them in a single, shared storage item
 *   3. copy a set of resources, thumbnails, and metadata for an item to a storage item
 *   4. copy a file by URL to an item using specified folder and filename
 *   5. undo the unique folder and filename into the original folder and filename
 */

import * as generalHelpers from "./generalHelpers";
import * as interfaces from "./interfaces";
import * as portal from "@esri/arcgis-rest-portal";
import * as request from "@esri/arcgis-rest-request";
import * as restHelpers from "./restHelpers";
import * as restHelpersGet from "./restHelpersGet";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Adds metadata to an AGO item.
 *
 * @param blob Blob containing metadata
 * @param itemId Item to receive metadata
 * @param authentication Credentials for the request
 * @return Promise resolving to JSON containing success boolean
 */
export function addMetadataFromBlob(
  blob: Blob,
  itemId: string,
  authentication: interfaces.UserSession
): Promise<any> {
  const updateOptions: any = {
    item: {
      id: itemId
    },
    params: {
      // Pass metadata in via params because item property is serialized, which discards a blob
      metadata: blob
    },
    authentication: authentication
  };
  return portal.updateItem(updateOptions);
}

export function addResourceFromBlob(
  blob: any,
  itemId: string,
  folder: string,
  filename: string,
  authentication: interfaces.UserSession
): Promise<any> {
  // Check that the filename has an extension because it is required by the addResources call
  if (filename && filename.indexOf(".") < 0) {
    return new Promise((resolve, reject) => {
      reject(
        new request.ArcGISAuthError(
          "Filename must have an extension indicating its type"
        )
      );
    });
  }

  const addRsrcOptions = {
    id: itemId,
    resource: blob,
    name: filename,
    authentication: authentication,
    params: {}
  };
  if (folder) {
    addRsrcOptions.params = {
      resourcesPrefix: folder
    };
  }
  return portal.addItemResource(addRsrcOptions);
}

export function addThumbnailFromBlob(
  blob: any,
  itemId: string,
  authentication: interfaces.UserSession,
  isGroup: boolean = false
): Promise<any> {
  const updateOptions: any = {
    params: {
      // Pass image in directly because item object is serialized, which discards a blob
      thumbnail: blob
    },
    authentication: authentication
  };
  updateOptions[isGroup ? "group" : "item"] = {
    id: itemId
  };

  return isGroup
    ? portal.updateGroup(updateOptions)
    : portal.updateItem(updateOptions);
}

export function addThumbnailFromUrl(
  url: string,
  itemId: string,
  authentication: interfaces.UserSession,
  isGroup: boolean = false
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    restHelpersGet.getBlob(url, authentication).then(async blob => {
      addThumbnailFromBlob(blob, itemId, authentication, isGroup).then(
        resolve,
        reject
      );
    }, reject);
  });
}

export function copyData(
  source: {
    url: string;
    authentication: interfaces.UserSession;
  },
  destination: {
    itemId: string;
    filename: string;
    mimeType: string;
    authentication: interfaces.UserSession;
  }
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    restHelpersGet.getBlob(source.url, source.authentication).then(
      async blob => {
        const update: interfaces.IItemUpdate = {
          id: destination.itemId,
          data: convertResourceToFile({
            blob: blob,
            filename: destination.filename,
            mimeType: destination.mimeType
          })
        };

        restHelpers.updateItem(update, destination.authentication).then(
          response => resolve,
          e => reject(generalHelpers.fail(e)) // unable to add resource
        );
      },
      e => reject(generalHelpers.fail(e)) // unable to get resource
    );
  });
}

export function convertBlobToSupportableResource(
  blob: Blob,
  filename: string
): interfaces.IFileMimeType {
  const originalFilename = (blob as File).name || filename || "";
  let filenameToUse = originalFilename;
  if (filenameToUse && !isSupportedFileType(filenameToUse)) {
    filenameToUse = filenameToUse + ".zip";
  }

  return {
    blob: new File([blob], filenameToUse),
    filename: originalFilename,
    mimeType: blob.type
  };
}

export function convertResourceToFile(
  resource: interfaces.IFileMimeType
): File {
  return new File([resource.blob], resource.filename, {
    type: resource.mimeType
  });
}

export function isSupportedFileType(filename: string): boolean {
  // Supported file formats are: .json, .xml, .txt, .png, .pbf, .zip, .jpeg, .jpg, .gif, .bmp, .gz, .svg,
  // .svgz, .geodatabase (https://developers.arcgis.com/rest/users-groups-and-items/add-resources.htm)
  const matches = filename.match(/\.([a-z]+)$/i);
  if (Array.isArray(matches) && matches.length > 0) {
    const supported =
      "|.json|.xml|.txt|.png|.pbf|.zip|.jpeg|.jpg|.gif|.bmp|.gz|.svg|.svgz|.geodatabase|";
    return supported.indexOf("|" + matches[0] + "|") >= 0;
  } else {
    return false;
  }
}

/**
 * Copies the files described by a list of full URLs and folder/filename combinations for
 * the resources, metadata, and thumbnail of an item or group to an item.
 *
 * @param storageAuthentication Credentials for the request to the storage
 * @param filePaths List of item files' URLs and folder/filenames for storing the files
 * @param destinationItemId Id of item to receive copy of resource/metadata/thumbnail
 * @param destinationAuthentication Credentials for the request to the destination
 * @param isGroup Boolean to indicate if the files are associated with a group or item
 * @return A promise which resolves to a boolean indicating if the copies were successful
 */
export function copyFilesFromStorageItem(
  storageAuthentication: interfaces.UserSession,
  filePaths: interfaces.IDeployFileCopyPath[],
  destinationItemId: string,
  destinationAuthentication: interfaces.UserSession,
  isGroup: boolean = false,
  mimeTypes?: interfaces.IMimeTypes
): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    const awaitAllItems = filePaths.map(filePath => {
      switch (filePath.type) {
        case interfaces.EFileType.Data:
          return copyData(
            {
              url: filePath.url,
              authentication: storageAuthentication
            },
            {
              itemId: destinationItemId,
              filename: filePath.filename,
              mimeType: mimeTypes ? mimeTypes[filePath.filename] : "",
              authentication: destinationAuthentication
            }
          );
        case interfaces.EFileType.Metadata:
          return copyMetadata(
            {
              url: filePath.url,
              authentication: storageAuthentication
            },
            {
              itemId: destinationItemId,
              authentication: destinationAuthentication
            }
          );
        case interfaces.EFileType.Resource:
          return copyResource(
            {
              url: filePath.url,
              authentication: storageAuthentication
            },
            {
              itemId: destinationItemId,
              folder: filePath.folder,
              filename: filePath.filename,
              authentication: destinationAuthentication
            }
          );
        case interfaces.EFileType.Thumbnail:
          return addThumbnailFromUrl(
            filePath.url,
            destinationItemId,
            destinationAuthentication,
            isGroup
          );
      }
    });

    // Wait until all files have been copied
    Promise.all(awaitAllItems).then(() => resolve(true), reject);
  });
}

/**
 * Copies the files described by a list of full URLs and storage folder/filename combinations for storing
 * the resources, metadata, and thumbnail of an item or group to a storage item.
 *
 * @param sourceUserSession Credentials for the request to the source
 * @param filePaths List of item files' URLs and folder/filenames for storing the files
 * @param storageItemId Id of item to receive copy of resource/metadata/thumbnail
 * @param storageAuthentication Credentials for the request to the storage
 * @return A promise which resolves to a list of the filenames under which the resource/metadata/thumbnails are stored
 */
export function copyFilesToStorageItem(
  sourceUserSession: interfaces.UserSession,
  filePaths: interfaces.ISourceFileCopyPath[],
  storageItemId: string,
  storageAuthentication: interfaces.UserSession
): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    const awaitAllItems: Array<Promise<string>> = filePaths.map(filePath => {
      return new Promise<string>(resolveThisFile => {
        copyResource(
          {
            url: filePath.url,
            authentication: sourceUserSession
          },
          {
            itemId: storageItemId,
            folder: filePath.folder,
            filename: filePath.filename,
            authentication: storageAuthentication
          }
        ).then(
          // Ignore failures because the item may not have metadata or thumbnail
          () => resolveThisFile(filePath.folder + "/" + filePath.filename),
          () => resolveThisFile("")
        );
      });
    });

    // Wait until all items have been copied
    Promise.all(awaitAllItems).then(r => resolve(r), reject);
  });
}

export function copyMetadata(
  source: {
    url: string;
    authentication: interfaces.UserSession;
  },
  destination: {
    itemId: string;
    authentication: interfaces.UserSession;
  }
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    restHelpersGet.getBlob(source.url, source.authentication).then(
      blob => {
        if (blob.type !== "text/xml") {
          reject(generalHelpers.fail()); // unable to get resource
          return;
        }
        addMetadataFromBlob(
          blob,
          destination.itemId,
          destination.authentication
        ).then(
          resolve,
          e => reject(generalHelpers.fail(e)) // unable to add resource
        );
      },
      e => reject(generalHelpers.fail(e)) // unable to get resource
    );
  });
}

/**
 * Copies a resource from a URL to an item.
 *
 * @param source.url URL to source resource
 * @param source.authentication Credentials for the request to source
 * @param destination.itemId Id of item to receive copy of resource/metadata/thumbnail
 * @param destination.folderName Folder in destination for resource/metadata/thumbnail; defaults to top level
 * @param destination.filename Filename in destination for resource/metadata/thumbnail
 * @param destination.authentication Credentials for the request to destination
 * @return A promise which resolves to the filename under which the resource/metadata/thumbnail is stored
 */
export function copyResource(
  source: {
    url: string;
    authentication: interfaces.UserSession;
  },
  destination: {
    itemId: string;
    folder: string;
    filename: string;
    authentication: interfaces.UserSession;
  }
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    restHelpersGet.getBlob(source.url, source.authentication).then(
      async blob => {
        if (
          blob.type.startsWith("text/plain") ||
          blob.type === "application/json"
        ) {
          try {
            const text = await new Response(blob).text();
            const json = JSON.parse(text);
            if (json.error) {
              reject(); // unable to get resource
              return;
            }
          } catch (Ignore) {
            reject(); // unable to get resource
            return;
          }
        }

        addResourceFromBlob(
          blob,
          destination.itemId,
          destination.folder,
          destination.filename,
          destination.authentication
        ).then(
          resolve,
          e => reject(generalHelpers.fail(e)) // unable to add resource
        );
      },
      e => reject(generalHelpers.fail(e)) // unable to get resource
    );
  });
}

/**
 * Generates the full URL and storage folder/filename for storing the thumbnail of a group.
 *
 * @param portalSharingUrl Server/sharing
 * @param itemId Id of item
 * @param thumbnailUrlPart Partial path to the thumbnail held in an item's JSON
 * @return List of item files' URLs and folder/filenames for storing the files
 */
export function generateGroupFilePaths(
  portalSharingUrl: string,
  itemId: string,
  thumbnailUrlPart: string
): interfaces.ISourceFileCopyPath[] {
  if (!thumbnailUrlPart) {
    return [];
  }
  return [
    {
      url: generateSourceThumbnailUrl(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        true
      ),
      ...generateThumbnailStorageFilename(itemId, thumbnailUrlPart)
    }
  ];
}

/**
 * Generates a folder and filename for storing a copy of an item's metadata in a storage item.
 *
 * @param itemId Id of item
 * @return Folder and filename for storage; folder is the itemID suffixed with "_info_metadata"
 * @see generateResourceFilenameFromStorage
 */
export function generateMetadataStorageFilename(
  itemId: string
): {
  folder: string;
  filename: string;
} {
  const folder = itemId + "_info_metadata";
  const filename = "metadata.xml";
  return { folder, filename };
}

/**
 * Extracts an item's resource folder and filename from the filename used to store a copy in a storage item.
 *
 * @param storageResourceFilename Filename used to store the resource, metadata, or thumbnail of an item
 * @return Folder and filename for storing information in an item, as well as the type (resource, metadata,
 * or thumbnail) of the information; the folder property is only meaningful for the resource type
 * @see generateResourceStorageFilename
 * @see generateMetadataStorageFilename
 * @see generateThumbnailStorageFilename
 */
export function generateResourceFilenameFromStorage(
  storageResourceFilename: string
): interfaces.IDeployFilename {
  let type = interfaces.EFileType.Resource;
  let [folder, filename] = storageResourceFilename.split("/");
  if (folder.endsWith("_info_thumbnail")) {
    type = interfaces.EFileType.Thumbnail;
  } else if (folder.endsWith("_info_metadata")) {
    type = interfaces.EFileType.Metadata;
    filename = "metadata.xml";
  } else if (folder.endsWith("_info_data")) {
    type = interfaces.EFileType.Data;
  } else if (folder.endsWith("_info_dataz")) {
    filename = filename.replace(/\.zip$/, "");
    type = interfaces.EFileType.Data;
  } else {
    const folderStart = folder.indexOf("_");
    if (folderStart > 0) {
      folder = folder.substr(folderStart + 1);
    } else {
      folder = "";
    }
  }
  return { type, folder, filename };
}

/**
 * Generates a folder and filename for storing a copy of an item's resource in a storage item.
 *
 * @param itemId Id of item
 * @param sourceResourceFilename Either filename or folder/filename to resource
 * @param storageFolder An additional folder level inserted between the itemId and the sourceResourceFilename
 * @return Folder and filename for storage; folder is the itemID plus ("_" + storageFolder) if storageFolder
 * exists plus ("_" + part of sourceResourceFilename before "/" if that separator exists);
 * file is sourceResourceFilename
 * @see generateResourceFilenameFromStorage
 */
export function generateResourceStorageFilename(
  itemId: string,
  sourceResourceFilename: string,
  storageFolder = ""
): {
  folder: string;
  filename: string;
} {
  let folder = itemId + (storageFolder ? "_" + storageFolder : "");
  let filename = sourceResourceFilename;
  const sourceResourceFilenameParts = sourceResourceFilename.split("/");
  if (sourceResourceFilenameParts.length > 1) {
    folder += "_" + sourceResourceFilenameParts[0];
    filename = sourceResourceFilenameParts[1];
  }
  return { folder, filename };
}

/**
 * Generates a list of full URLs and storage folder/filename combinations for storing the resources, metadata,
 * and thumbnail of an item.
 *
 * @param portalSharingUrl Server/sharing
 * @param itemId Id of item
 * @param thumbnailUrlPart Partial path to the thumbnail held in an item's JSON
 * @param resourceFilenames List of resource filenames for an item, e.g., ["file1", "myFolder/file2"]
 * @param isGroup Boolean to indicate if the files are associated with a group or item
 * @return List of item files' URLs and folder/filenames for storing the files
 */
export function generateSourceFilePaths(
  portalSharingUrl: string,
  itemId: string,
  thumbnailUrlPart: string,
  resourceFilenames: string[],
  isGroup: boolean = false
): interfaces.ISourceFileCopyPath[] {
  const filePaths = resourceFilenames.map(resourceFilename => {
    return {
      url: generateSourceResourceUrl(
        portalSharingUrl,
        itemId,
        resourceFilename
      ),
      ...generateResourceStorageFilename(itemId, resourceFilename)
    };
  });

  filePaths.push({
    url: generateSourceMetadataUrl(portalSharingUrl, itemId, isGroup),
    ...generateMetadataStorageFilename(itemId)
  });

  if (thumbnailUrlPart) {
    filePaths.push({
      url: generateSourceThumbnailUrl(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        isGroup
      ),
      ...generateThumbnailStorageFilename(itemId, thumbnailUrlPart)
    });
  }

  return filePaths;
}

/**
 * Generates the URL for reading an item's metadata.
 *
 * @param sourcePortalSharingUrl Server/sharing
 * @param itemId Id of item
 * @param isGroup Boolean to indicate if the files are associated with a group or item
 * @return URL string
 */
export function generateSourceMetadataUrl(
  sourcePortalSharingUrl: string,
  itemId: string,
  isGroup = false
): string {
  return (
    sourcePortalSharingUrl +
    (isGroup ? "/community/groups/" : "/content/items/") +
    itemId +
    "/info/metadata/metadata.xml"
  );
}

/**
 * Generates the URL for reading an item's resource given the filename of the resource.
 *
 * @param sourcePortalSharingUrl Server/sharing
 * @param itemId Id of item
 * @param sourceResourceFilename Either filename or folder/filename to resource
 * @return URL string
 */
export function generateSourceResourceUrl(
  sourcePortalSharingUrl: string,
  itemId: string,
  sourceResourceFilename: string
): string {
  return (
    sourcePortalSharingUrl +
    "/content/items/" +
    itemId +
    "/resources/" +
    sourceResourceFilename
  );
}

/**
 * Generates the URL for reading an item's thumbnail.
 *
 * @param sourcePortalSharingUrl Server/sharing
 * @param itemId Id of item
 * @param thumbnailUrlPart Partial path to the thumbnail held in an item's JSON
 * @param isGroup Boolean to indicate if the files are associated with a group or item
 * @return URL string
 */
export function generateSourceThumbnailUrl(
  sourcePortalSharingUrl: string,
  itemId: string,
  thumbnailUrlPart: string,
  isGroup = false
): string {
  return (
    sourcePortalSharingUrl +
    (isGroup ? "/community/groups/" : "/content/items/") +
    itemId +
    "/info/" +
    thumbnailUrlPart
  );
}

/**
 * Generates a list of full URLs and folder/filename combinations used to store the resources, metadata,
 * and thumbnail of an item.
 *
 * @param portalSharingUrl Server/sharing
 * @param storageItemId Id of storage item
 * @param resourceFilenames List of resource filenames for an item, e.g., ["file1", "myFolder/file2"]
 * @return List of item files' URLs and folder/filenames for storing the files
 */
export function generateStorageFilePaths(
  portalSharingUrl: string,
  storageItemId: string,
  resourceFilenames: string[]
): interfaces.IDeployFileCopyPath[] {
  return resourceFilenames && resourceFilenames.map
    ? resourceFilenames.map(resourceFilename => {
        return {
          url: generateSourceResourceUrl(
            portalSharingUrl,
            storageItemId,
            resourceFilename
          ),
          ...generateResourceFilenameFromStorage(resourceFilename)
        };
      })
    : [];
}

/**
 * Generates a folder and filename for storing a copy of an item's thumbnail in a storage item.
 *
 * @param itemId Id of item
 * @param thumbnailUrlPart Partial path to the thumbnail held in an item's JSON
 * @return Folder and filename for storage; folder is the itemID suffixed with "_info_thumbnail";
 * file is URI-encoded thumbnailUrlPart
 * @see generateResourceFilenameFromStorage
 */
export function generateThumbnailStorageFilename(
  itemId: string,
  thumbnailUrl: string
): {
  folder: string;
  filename: string;
} {
  const folder = itemId + "_info_thumbnail";
  const thumbnailUrlParts = thumbnailUrl.split("/");
  const filename =
    thumbnailUrlParts.length === 1
      ? thumbnailUrlParts[0]
      : thumbnailUrlParts[1];
  return { folder, filename };
}

/**
 * Updates the items resource that matches the filename with new content
 *
 * @param itemId Id of the item to update
 * @param filename Name of the resource file to update
 * @param content The new content to update the resource with
 * @param authentication Credentials for the request to the storage
 * @return A promise which resolves with a success true/false response
 */
export function updateItemResourceText(
  itemId: string,
  filename: string,
  content: string,
  authentication: UserSession
): Promise<any> {
  return portal.updateItemResource({
    id: itemId,
    name: filename,
    content: content,
    authentication: authentication
  });
}
