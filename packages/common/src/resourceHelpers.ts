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
  appendQueryParam,
  blobToFile,
  checkUrlPathTermination,
  fail
} from "./generalHelpers";
import {
  EFileType,
  IDeployFileCopyPath,
  IDeployFilename,
  IFileMimeType,
  IItemTemplate,
  IItemUpdate,
  ISourceFileCopyPath,
  UserSession
} from "./interfaces";
import { new_File } from "./polyfills";
import {
  IItemResourceOptions,
  IItemResourceResponse,
  addItemResource,
  updateGroup,
  updateItem,
  updateItemInfo,
  updateItemResource
} from "@esri/arcgis-rest-portal";
import { addResourceFromBlob } from "./resources/add-resource-from-blob";
import { convertItemResourceToStorageResource } from "./resources/convert-item-resource-to-storage-resource";

import { copyResource } from "./resources/copy-resource";
import { getBlob } from "./resources/get-blob";

import { updateItem as helpersUpdateItem } from "./restHelpers";
import { getBlobAsFile, getThumbnailFile } from "./restHelpersGet";
import JSZip from "jszip";

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
  authentication: UserSession
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
  return updateItem(updateOptions);
}

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

export function copyData(
  source: {
    url: string;
    authentication: UserSession;
  },
  destination: {
    itemId: string;
    folder: string;
    filename: string;
    mimeType: string;
    authentication: UserSession;
  }
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    getBlob(source.url, source.authentication).then(
      blob => {
        const update: IItemUpdate = {
          id: destination.itemId,
          data: convertResourceToFile({
            blob: blob,
            filename: destination.filename,
            mimeType: destination.mimeType || blob.type
          })
        };

        helpersUpdateItem(
          update,
          destination.authentication,
          destination.folder
        ).then(
          resolve,
          e => reject(fail(e)) // unable to add resource
        );
      },
      e => reject(fail(e)) // unable to get resource
    );
  });
}

export function convertBlobToSupportableResource(
  blob: Blob,
  filename: string = ""
): IFileMimeType {
  const originalFilename = (blob as File).name || filename;
  let filenameToUse = originalFilename;
  if (filenameToUse && !isSupportedFileType(filenameToUse)) {
    filenameToUse = filenameToUse + ".zip";
  }

  return {
    blob: new_File([blob], filenameToUse, { type: blob.type }),
    filename: originalFilename,
    mimeType: blob.type
  };
}

export function convertResourceToFile(resource: IFileMimeType): File {
  return new_File([resource.blob], resource.filename, {
    type: resource.mimeType
  });
}

/**
 * Copies the files described by a list of full URLs and folder/filename combinations for
 * the resources, and metadata of an item or group to an item.
 *
 * @param storageAuthentication Credentials for the request to the storage
 * @param filePaths List of item files' URLs and folder/filenames for storing the files
 * @param destinationItemId Id of item to receive copy of resource/metadata/thumbnail
 * @param destinationAuthentication Credentials for the request to the destination
 * @param isGroup Boolean to indicate if the files are associated with a group or item
 * @return A promise which resolves to a boolean indicating if the copies were successful
 */
export function copyFilesFromStorageItem(
  storageAuthentication: UserSession,
  filePaths: IDeployFileCopyPath[],
  destinationFolderId: string,
  destinationItemId: string,
  destinationAuthentication: UserSession,
  template: any = {}
): Promise<boolean> {
  // TODO: This is only used in deployer, so move there
  // changed to allow the template to be passed in
  // because Hub templates need to swap out the templateId
  // in the reseource filename
  const mimeTypes = template.properties || null;

  // remove the template.itemId from the fileName in the filePaths
  if (template.itemId) {
    filePaths = filePaths.map(fp => {
      if (fp.filename.indexOf(template.itemId) === 0 && fp.folder === "") {
        fp.filename = fp.filename.replace(`${template.itemId}-`, "");
      }
      return fp;
    });
  }

  return new Promise<boolean>((resolve, reject) => {
    let awaitAllItems = filePaths.map(filePath => {
      switch (filePath.type) {
        case EFileType.Data:
          // We are updating an item with a zip file, which is written to AGO. If the updated
          // item is in a folder, the zip file is moved to the item's folder after being written.
          // Without the folder information in the URL, AGO writes the zip to the root folder,
          // which causes a conflict if an item with the same data is already in that root folder.
          return copyData(
            {
              url: filePath.url,
              authentication: storageAuthentication
            },
            {
              itemId: destinationItemId,
              folder: destinationFolderId,
              filename: filePath.filename,
              mimeType: mimeTypes ? mimeTypes[filePath.filename] : "",
              authentication: destinationAuthentication
            }
          );

        case EFileType.Info:
          return copyFormInfoFile(
            {
              url: filePath.url,
              filename: filePath.filename,
              authentication: storageAuthentication
            },
            {
              itemId: destinationItemId,
              authentication: destinationAuthentication
            }
          );

        case EFileType.Metadata:
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
      }
    });

    // Bundle the resources into a single update because AGO tends to have problems with
    // many updates in a row to the same item: it claims success despite randomly failing
    const resourceFilePaths = filePaths.filter(
      filePath => filePath.type === EFileType.Resource
    );
    let zip: any;
    if (resourceFilePaths.length > 0) {
      zip = new JSZip();
      awaitAllItems = awaitAllItems.concat(
        // Note that AGO imposes a limit of 50 files, which is not checked in this code
        // https://developers.arcgis.com/rest/users-groups-and-items/add-resources.htm
        resourceFilePaths.map(filePath => {
          return getBlobAsFile(
            filePath.url,
            filePath.filename,
            storageAuthentication
          ).then(file => {
            if (filePath.folder) {
              zip
                .folder(filePath.folder)
                .file(filePath.filename, file, { binary: true });
            } else {
              zip.file(filePath.filename, file, { binary: true });
            }
          });
        })
      );
    }

    // Wait until all files have been copied and the zip file prepared
    Promise.all(awaitAllItems).then(() => {
      if (zip) {
        // Create the ZIP
        zip
          .generateAsync({ type: "blob" })
          .then((content: Blob) => {
            return blobToFile(content, "resources.zip", "application/zip");
          })
          .then((zipfile: File) => {
            const addResourceOptions: IItemResourceOptions = {
              id: destinationItemId,
              resource: zipfile,
              authentication: destinationAuthentication,
              params: {
                archive: true
              }
            };
            addItemResource(addResourceOptions).then(
              () => resolve(true),
              reject
            );
          });
      } else {
        resolve(true);
      }
    }, reject);
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
  sourceUserSession: UserSession,
  filePaths: ISourceFileCopyPath[],
  storageItemId: string,
  storageAuthentication: UserSession
): Promise<string[]> {
  return new Promise<string[]>(resolve => {
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
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Promise.all(awaitAllItems).then(r => resolve(r));
  });
}

export function copyFormInfoFile(
  source: {
    url: string;
    filename: string;
    authentication: UserSession;
  },
  destination: {
    itemId: string;
    authentication: UserSession;
  }
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    // Get the info file
    getBlobAsFile(
      source.url,
      source.filename,
      source.authentication,
      [],
      "application/json"
    ).then(file => {
      // Send it to the destination item
      updateItemInfo({
        id: destination.itemId,
        file,
        authentication: destination.authentication
      }).then(resolve, reject);
    }, reject);
  });
}

export function copyMetadata(
  source: {
    url: string;
    authentication: UserSession;
  },
  destination: {
    itemId: string;
    authentication: UserSession;
  }
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    getBlob(source.url, source.authentication).then(
      blob => {
        if (blob.type !== "text/xml" && blob.type !== "application/xml") {
          reject(fail()); // unable to get resource
          return;
        }
        addMetadataFromBlob(
          blob,
          destination.itemId,
          destination.authentication
        ).then(
          resolve,
          e => reject(fail(e)) // unable to add resource
        );
      },
      e => reject(fail(e)) // unable to get resource
    );
  });
}

/**
 * Generates a folder and filename for storing a copy of an item info file in a storage item.
 *
 * @param itemId Id of item
 * @param filename Filename of item
 * @return Folder and filename for storage; folder is the itemID suffixed with "_info"
 * @see generateResourceFilenameFromStorage
 */
export function generateInfoStorageFilename(
  itemId: string,
  filename: string
): {
  folder: string;
  filename: string;
} {
  return {
    folder: itemId + "_info",
    filename
  };
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
  return {
    folder: itemId + "_info_metadata",
    filename: "metadata.xml"
  };
}

/**
 * Extracts an item's resource folder and filename from the filename used to store a copy in a storage item.
 *
 * @param storageResourceFilename Filename used to store the resource, metadata, or thumbnail of an item
 * @return Folder and filename for storing information in an item, as well as the type (resource, metadata,
 * or thumbnail) of the information; the folder property is only meaningful for the resource type
 * @see convertItemResourceToStorageResource
 * @see generateMetadataStorageFilename
 * @see generateThumbnailStorageFilename
 */
export function generateResourceFilenameFromStorage(
  storageResourceFilename: string
): IDeployFilename {
  let type = EFileType.Resource;
  // Older Hub Solution Templates don't have folders, so
  // we have some extra logic to handle this
  let folder = "";
  let filename = storageResourceFilename;
  if (storageResourceFilename.indexOf("/") > -1) {
    [folder, filename] = storageResourceFilename.split("/");
  }
  // let [folder, filename] = storageResourceFilename.split("/");

  // Handle special "folders"
  if (folder.endsWith("_info_thumbnail")) {
    type = EFileType.Thumbnail;
  } else if (folder.endsWith("_info_metadata")) {
    type = EFileType.Metadata;
    filename = "metadata.xml";
  } else if (folder.endsWith("_info")) {
    type = EFileType.Info;
  } else if (folder.endsWith("_info_data")) {
    type = EFileType.Data;
  } else if (folder.endsWith("_info_dataz")) {
    filename = filename.replace(/\.zip$/, "");
    type = EFileType.Data;
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
): ISourceFileCopyPath[] {
  const filePaths = resourceFilenames.map(resourceFilename => {
    return {
      url: generateSourceResourceUrl(
        portalSharingUrl,
        itemId,
        resourceFilename
      ),
      ...convertItemResourceToStorageResource(itemId, resourceFilename)
    };
  });

  filePaths.push({
    url: generateSourceMetadataUrl(portalSharingUrl, itemId, isGroup),
    ...generateMetadataStorageFilename(itemId)
  });

  /* istanbul ignore else */
  if (thumbnailUrlPart) {
    const path = {
      url: appendQueryParam(
        generateSourceThumbnailUrl(
          portalSharingUrl,
          itemId,
          thumbnailUrlPart,
          isGroup
        ),
        "w=400"
      ),
      ...generateThumbnailStorageFilename(itemId, thumbnailUrlPart)
    };
    filePaths.push(path);
  }

  return filePaths;
}

export function generateSourceFormFilePaths(
  portalSharingUrl: string,
  itemId: string
): ISourceFileCopyPath[] {
  const baseUrl =
    checkUrlPathTermination(portalSharingUrl) +
    "content/items/" +
    itemId +
    "/info/";
  const filePaths: ISourceFileCopyPath[] = [];
  ["form.json", "forminfo.json"].forEach(filename =>
    filePaths.push({
      url: baseUrl + filename,
      ...generateInfoStorageFilename(itemId, filename)
    })
  );

  // We need to add the ".json" extension because AGO uses the extension
  // rather than the MIME type for updateinfo; it strips it automatically
  filePaths.push({
    url: baseUrl + "form.webform",
    folder: itemId + "_info",
    filename: "form.webform.json"
  });

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
 * @return URL string
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
 * @return URL string
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
 * @return List of item files' URLs and folder/filenames for storing the files
 */
export function generateStorageFilePaths(
  portalSharingUrl: string,
  storageItemId: string,
  resourceFilenames: string[] = []
): IDeployFileCopyPath[] {
  return resourceFilenames.map(resourceFilename => {
    return {
      url: generateSourceResourceUrl(
        portalSharingUrl,
        storageItemId,
        resourceFilename
      ),
      ...generateResourceFilenameFromStorage(resourceFilename)
    };
  });
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
 * @return A promise which resolves to a boolean indicating if the copies were successful
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
 * Updates the solution item with form files from the itemTemplate
 *
 * @param itemTemplate Template for AGOL item
 * @param itemData Item's data
 * @param solutionItemId item id for the solution
 * @param authentication Credentials for the request to the storage
 * @return A promise which resolves with an array of resources that have been added to the item
 */
export function storeFormItemFiles(
  itemTemplate: IItemTemplate,
  itemData: any,
  solutionItemId: string,
  authentication: UserSession
): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    const storagePromises: Array<Promise<string[]>> = [];

    // Store form data
    if (itemData) {
      const originalFilename =
        itemTemplate.item.name || (itemData as File).name;
      const filename =
        originalFilename && originalFilename !== "undefined"
          ? originalFilename
          : `${itemTemplate.itemId}.zip`;
      itemTemplate.item.name = filename;
      const storageName = convertItemResourceToStorageResource(
        itemTemplate.itemId,
        filename,
        "info_data"
      );
      storagePromises.push(
        new Promise((resolveDataStorage, rejectDataStorage) => {
          addResourceFromBlob(
            itemData,
            solutionItemId,
            storageName.folder,
            storageName.filename,
            authentication
          ).then(
            () =>
              resolveDataStorage([
                storageName.folder + "/" + storageName.filename
              ]),
            rejectDataStorage
          );
        })
      );
    }

    // Store form info files
    const resourceItemFilePaths: ISourceFileCopyPath[] = generateSourceFormFilePaths(
      authentication.portal,
      itemTemplate.itemId
    );

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    storagePromises.push(
      copyFilesToStorageItem(
        authentication,
        resourceItemFilePaths,
        solutionItemId,
        authentication
      )
    );

    Promise.all(storagePromises).then(savedResourceFilenameSets => {
      let savedResourceFilenames: string[] = [];
      savedResourceFilenameSets.forEach(filenameSet => {
        // Remove any empty names before adding set to cumulative list
        savedResourceFilenames = savedResourceFilenames.concat(
          filenameSet.filter(item => !!item)
        );
      });
      resolve(savedResourceFilenames);
    }, reject);
  });
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
): Promise<IItemResourceResponse> {
  return updateItemResource({
    id: itemId,
    name: filename,
    content: content,
    authentication: authentication
  });
}
