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

import {
  EFileType,
  IAssociatedFileCopyResults,
  IAssociatedFileInfo,
  IDeployFileCopyPath,
  IFileMimeTyped,
  ISourceFile,
  ISourceFileCopyPath,
  UserSession
} from "./interfaces";
import {
  IRemoveItemResourceOptions,
  IItemResourceOptions,
  IItemResourceResponse,
  removeItemResource,
  updateGroup,
  updateItem,
  updateItemResource
} from "@esri/arcgis-rest-portal";
import { appendQueryParam, checkUrlPathTermination } from "./generalHelpers";
import { convertItemResourceToStorageResource } from "./resources/convert-item-resource-to-storage-resource";
import { convertStorageResourceToItemResource } from "./resources/convert-storage-resource-to-item-resource";
import { getThumbnailFile } from "./restHelpersGet";
import {
  copyAssociatedFilesByType,
  copyFilesAsResources
} from "./resources/copyAssociatedFiles";

// ------------------------------------------------------------------------------------------------------------------ //

export function addThumbnailFromBlob(
  blob: any,
  itemId: string,
  authentication: UserSession,
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

  return isGroup ? updateGroup(updateOptions) : updateItem(updateOptions);
}

export function convertBlobToSupportableResource(
  blob: Blob,
  filename: string = ""
): IFileMimeTyped {
  const originalFilename = (blob as File).name || filename;
  let filenameToUse = originalFilename;
  if (filenameToUse && !isSupportedFileType(filenameToUse)) {
    filenameToUse = filenameToUse + ".zip";
  }

  return {
    blob: new File([blob], filenameToUse, { type: blob.type }),
    filename: originalFilename,
    mimeType: blob.type
  };
}

/**
 * Copies the files described by a list of full URLs and folder/filename combinations for
 * the resources and metadata of an item or group to an item.
 *
 * @param storageAuthentication Credentials for the request to the storage
 * @param filePaths List of item files' URLs and folder/filenames for storing the files
 * @param sourceItemId Id of item supplying resource/metadata
 * @param destinationFolderId Id of folder
 * @param destinationItemId Id of item to receive copy of resource/metadata
 * @param destinationAuthentication Credentials for the request to the destination
 * @param template Description of item that will receive files
 * @returns A promise which resolves to a boolean indicating if the copies were successful
 */
export function copyFilesFromStorageItem(
  storageAuthentication: UserSession,
  filePaths: IDeployFileCopyPath[],
  sourceItemId: string,
  destinationFolderId: string,
  destinationItemId: string,
  destinationAuthentication: UserSession,
  template: any = {}
): Promise<boolean> {
  // TODO: This is only used in deployer, so move there
  // changed to allow the template to be passed in
  // because Hub templates need to swap out the templateId
  // in the resource filename
  const mimeTypes = template.properties || null;

  // remove the template.itemId from the fileName in the filePaths
  /* istanbul ignore else */
  if (template.itemId) {
    filePaths = filePaths.map(fp => {
      /* istanbul ignore else */
      if (fp.filename.indexOf(template.itemId) === 0 && fp.folder === "") {
        fp.filename = fp.filename.replace(`${template.itemId}-`, "");
      }
      return fp;
    });
  }

  return new Promise<boolean>((resolve, reject) => {
    const fileInfos = filePaths.map(path => {
      return {
        folder:
          path.type === EFileType.Data ? destinationFolderId : path.folder,
        filename: path.filename,
        type: path.type,
        mimeType: mimeTypes ? mimeTypes[path.filename] : "",
        url: path.url
      } as IAssociatedFileInfo;
    });

    void copyAssociatedFilesByType(
      fileInfos,
      storageAuthentication,
      sourceItemId,
      destinationItemId,
      destinationAuthentication,
      template
    ).then((results: IAssociatedFileCopyResults[]) => {
      const allOK: boolean = results
        // Filter out metadata
        .filter(
          (result: IAssociatedFileCopyResults) =>
            result.filename !== "metadata.xml"
        )
        // Extract success
        .map(
          (result: IAssociatedFileCopyResults) =>
            result.fetchedFromSource && result.copiedToDestination
        )
        // Boil it down to a single result
        .reduce(
          (success: boolean, currentValue: boolean) => success && currentValue,
          true
        );
      if (allOK) {
        resolve(true);
      } else {
        reject();
      }
    });
  });
}

/**
 * Copies the files for storing the resources, metadata, and thumbnail of an item or group to a storage item
 * with a specified path.
 *
 * @param files List of item files and paths for storing the files
 * @param storageItemId Id of item to receive copy of resource/metadata
 * @param storageAuthentication Credentials for the request to the storage
 * @returns A promise which resolves to a list of the filenames under which the resource/metadata are stored
 */
export function copyFilesToStorageItem(
  files: ISourceFile[],
  storageItemId: string,
  storageAuthentication: UserSession
): Promise<string[]> {
  return new Promise<string[]>(resolve => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    void copyFilesAsResources(files, storageItemId, storageAuthentication).then(
      (results: IAssociatedFileCopyResults[]) => {
        resolve(
          results
            // Filter out failures
            .filter(
              (result: IAssociatedFileCopyResults) =>
                result.fetchedFromSource && result.copiedToDestination
            )
            // Return folder and filename in storage item's resources
            .map(
              (result: IAssociatedFileCopyResults) =>
                result.folder + "/" + result.filename
            )
        );
      }
    );
  });
}

/**
 * Generates a folder and filename for storing a copy of an item's metadata in a storage item.
 *
 * @param itemId Id of item
 * @returns Folder and filename for storage; folder is the itemID suffixed with "_info_metadata"
 * @see convertStorageResourceToItemResource
 */
export function generateMetadataStorageFilename(
  itemId: string
): {
  folder: string;
  filename: string;
} {
  return {
    folder: itemId + "_info_metadata",
    filename: "metadata.xml"
  };
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
 * @param storageVersion Version of the Solution template
 * @returns List of item files' URLs and folder/filenames for storing the files
 */
export function generateSourceFilePaths(
  portalSharingUrl: string,
  itemId: string,
  thumbnailUrlPart: string,
  resourceFilenames: string[],
  isGroup: boolean = false,
  storageVersion = 0
): ISourceFileCopyPath[] {
  const filePaths = resourceFilenames.map(resourceFilename => {
    return {
      itemId,
      url: generateSourceResourceUrl(
        portalSharingUrl,
        itemId,
        resourceFilename
      ),
      ...convertItemResourceToStorageResource(
        itemId,
        resourceFilename,
        storageVersion
      )
    };
  });

  filePaths.push({
    itemId,
    url: generateSourceMetadataUrl(portalSharingUrl, itemId, isGroup),
    ...generateMetadataStorageFilename(itemId)
  });

  /* istanbul ignore else */
  if (thumbnailUrlPart) {
    filePaths.push(generateSourceThumbnailPath(portalSharingUrl, itemId, thumbnailUrlPart));
  }

  return filePaths;
}

/**
 * Generates the full URL and storage folder/filename for storing an item's thumbnail.
 * 
 * @param portalSharingUrl Server/sharing
 * @param itemId Id of item
 * @param thumbnailUrlPart Partial path to the thumbnail held in an item's JSON
 * @returns URL and folder/filename for storing the thumbnail
 */
export function generateSourceThumbnailPath(
  portalSharingUrl: string,
  itemId: string,
  thumbnailUrlPart: string
): ISourceFileCopyPath {
  return {
    itemId,
    url: appendQueryParam(
      generateSourceThumbnailUrl(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart
      ),
      "w=400"
    ),
    ...generateThumbnailStorageFilename(itemId, thumbnailUrlPart)
  };
}

/**
 * Generates the URL for reading an item's metadata.
 *
 * @param sourcePortalSharingUrl Server/sharing
 * @param itemId Id of item
 * @param isGroup Boolean to indicate if the files are associated with a group or item
 * @returns URL string
 */
export function generateSourceMetadataUrl(
  sourcePortalSharingUrl: string,
  itemId: string,
  isGroup = false
): string {
  return (
    checkUrlPathTermination(sourcePortalSharingUrl) +
    (isGroup ? "community/groups/" : "content/items/") +
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
 * @returns URL string
 */
export function generateSourceResourceUrl(
  sourcePortalSharingUrl: string,
  itemId: string,
  sourceResourceFilename: string
): string {
  return (
    checkUrlPathTermination(sourcePortalSharingUrl) +
    "content/items/" +
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
 * @returns URL string
 */
export function generateSourceThumbnailUrl(
  sourcePortalSharingUrl: string,
  itemId: string,
  thumbnailUrlPart: string,
  isGroup = false
): string {
  return (
    checkUrlPathTermination(sourcePortalSharingUrl) +
    (isGroup ? "community/groups/" : "content/items/") +
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
 * @param storageVersion Version of the Solution template
 * @returns List of item files' URLs and folder/filenames for storing the files
 */
export function generateStorageFilePaths(
  portalSharingUrl: string,
  storageItemId: string,
  resourceFilenames: string[] = [],
  storageVersion = 0
): IDeployFileCopyPath[] {
  return resourceFilenames.map(resourceFilename => {
    return {
      url: generateSourceResourceUrl(
        portalSharingUrl,
        storageItemId,
        resourceFilename
      ),
      ...convertStorageResourceToItemResource(resourceFilename, storageVersion)
    };
  });
}

/**
 * Generates a folder and filename for storing a copy of an item's thumbnail in a storage item.
 *
 * @param itemId Id of item
 * @param thumbnailUrlPart Partial path to the thumbnail held in an item's JSON; can also be a filename
 * @returns Folder and filename for storage; folder is the itemID suffixed with "_info_thumbnail";
 * file is URI-encoded thumbnailUrlPart
 * @see convertStorageResourceToItemResource
 */
export function generateThumbnailStorageFilename(
  itemId: string,
  thumbnailurl: string
): {
  folder: string;
  filename: string;
} {
  const folder = itemId + "_info_thumbnail";
  const thumbnailUrlParts = thumbnailurl.split("/");
  const filename =
    thumbnailUrlParts.length === 1
      ? thumbnailUrlParts[0]
      : thumbnailUrlParts[1];
  return { folder, filename };
}

export function isSupportedFileType(filename: string): boolean {
  // Supported file formats are: .json, .xml, .txt, .png, .pbf, .zip, .jpeg, .jpg, .gif, .bmp, .gz, .svg,
  // .svgz, .geodatabase (https://developers.arcgis.com/rest/users-groups-and-items/add-resources.htm)
  const filenameExtension = filename.match(/\.([a-z]+)$/i);
  const supportedExtensions =
    "|.json|.xml|.txt|.png|.pbf|.zip|.jpeg|.jpg|.gif|.bmp|.gz|.svg|.svgz|.geodatabase|";
  return (
    !!filenameExtension &&
    supportedExtensions.indexOf("|" + filenameExtension[0] + "|") >= 0
  );
}

/**
 * Gets the thumbnail of an item or group.
 *
 * @param authentication Credentials for the request to the storage
 * @param filePaths List of item files' URLs and folder/filenames for storing the files
 * @returns A promise which resolves to a boolean indicating if the copies were successful
 */
export function getThumbnailFromStorageItem(
  authentication: UserSession,
  filePaths: IDeployFileCopyPath[]
): Promise<File> {
  let thumbnailUrl: string;
  let thumbnailFilename: string;
  filePaths.forEach(path => {
    if (path.type === EFileType.Thumbnail) {
      thumbnailUrl = path.url;
      thumbnailFilename = path.filename;
    }
  });

  if (!thumbnailUrl) {
    return Promise.resolve(null);
  }

  return getThumbnailFile(thumbnailUrl, thumbnailFilename, authentication);
}

/**
 * Removes the item's resource that matches the filename with new content
 *
 * @param itemId Id of the item to remove
 * @param filename Name of the resource file to remove
 * @param authentication Credentials for the request to the storage
 * @returns A promise which resolves with a success true/false response
 */
export function removeItemResourceFile(
  itemId: string,
  filename: string,
  authentication: UserSession
): Promise<{ success: boolean }> {
  return removeItemResource({
    id: itemId,
    resource: filename,
    authentication: authentication
  } as IRemoveItemResourceOptions);
}

/**
 * Updates the item's resource that matches the filename with new content
 *
 * @param itemId Id of the item to update
 * @param filename Name of the resource file to update; prefix optional (e.g., a/b/file.txt)
 * @param resource The new content to update the resource with
 * @param authentication Credentials for the request to the storage
 * @returns A promise which resolves with a success true/false response
 */
export function updateItemResourceFile(
  itemId: string,
  filename: string,
  resource: File,
  authentication: UserSession
): Promise<IItemResourceResponse> {
  // Prefix has to be specified separately
  const prefixedFilenameParts = filename.split("/");
  const prefix = prefixedFilenameParts.length > 1 ? prefixedFilenameParts.slice(0, prefixedFilenameParts.length - 1).join("/") : undefined;
  const suffix = prefixedFilenameParts[prefixedFilenameParts.length - 1];

  return updateItemResource({
    id: itemId,
    prefix: prefix,
    name: suffix,
    resource,
    authentication: authentication
  } as IItemResourceOptions);
}

/**
 * Updates the item's resource that matches the filename with new content
 *
 * @param itemId Id of the item to update
 * @param filename Name of the resource file to update
 * @param content The new content to update the resource with
 * @param authentication Credentials for the request to the storage
 * @returns A promise which resolves with a success true/false response
 */
export function updateItemResourceText(
  itemId: string,
  filename: string,
  content: string,
  authentication: UserSession
): Promise<IItemResourceResponse> {
  return updateItemResource({
    id: itemId,
    name: filename,
    content: content,
    authentication: authentication
  } as IItemResourceOptions);
}
