/** @license
 * Copyright 2021 Esri
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

import {
  EFileType,
  IAssociatedFileCopyResults,
  IAssociatedFileInfo,
  IFileMimeTyped,
  IItemUpdate,
  IZipCopyResults,
  IZipInfo,
  UserSession
} from "../interfaces";
import {
  IItemResourceOptions,
  addItemResource,
  updateItem
} from "@esri/arcgis-rest-portal";
import { blobToFile } from "../generalHelpers";
import { chunkArray } from "@esri/hub-common";
import { getBlob } from "./get-blob";
import { getBlobAsFile } from "../restHelpersGet";
import { new_File } from "../polyfills";
import { updateItem as helpersUpdateItem } from "../restHelpers";
import JSZip from "jszip";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Copies the files described by a list of full URLs and storage folder/filename combinations for storing
 * the resources, metadata, and thumbnail of an item or group to a storage item.
 *
 * @param fileInfos List of item files' URLs and folder/filenames for storing the files
 * @param sourceAuthentication Credentials for the request to the source
 * @param destinationItemId Id of item to receive copy of resource/metadata/thumbnail
 * @param destinationAuthentication Credentials for the request to the storage
 * @param copyBasedOnFileType Switch indicating if the EFileType property for each file is to be used for
 * determining the location in the destination item; e.g., if "true" (the default), then an EFileType.Data
 * file will be stored in the item's data section, while an EFileType.Metadata file will be stored as the
 * item's metadata; if "false", then EFileType.Data, EFileType.Metadata, and EFileType.Resource files will
 * all be stored in the item's resources. EFileType.Info and EFileType.Thumbnail files are not handled by
 * this function.
 * @return A promise which resolves to a list of the result of the copies
 */
export function copyAssociatedFiles(
  fileInfos: IAssociatedFileInfo[],
  sourceAuthentication: UserSession,
  destinationItemId: string,
  destinationAuthentication: UserSession,
  copyBasedOnFileType = true
): Promise<IAssociatedFileCopyResults[]> {
  return new Promise<IAssociatedFileCopyResults[]>(resolve => {
    let awaitAllItems: Array<Promise<IAssociatedFileCopyResults>> = [];
    let resourceFileInfos = fileInfos;

    if (copyBasedOnFileType) {
      awaitAllItems = fileInfos
        .filter(
          fileInfo =>
            fileInfo.type === EFileType.Data ||
            fileInfo.type === EFileType.Metadata
        )
        .map(fileInfo => {
          // Handle Data and Metadata first
          switch (fileInfo.type) {
            case EFileType.Data:
              // We are updating an item with a zip file, which is written to AGO. If the updated
              // item is in a folder, the zip file is moved to the item's folder after being written.
              // Without the folder information in the URL, AGO writes the zip to the root folder,
              // which causes a conflict if an item with the same data is already in that root folder.
              return copyDataIntoItem(
                fileInfo,
                sourceAuthentication,
                destinationItemId,
                destinationAuthentication
              );

            case EFileType.Metadata:
              return copyMetadataIntoItem(
                fileInfo,
                sourceAuthentication,
                destinationItemId,
                destinationAuthentication
              );
          }
        });

      // Now add in the Resources
      resourceFileInfos = fileInfos.filter(
        fileInfo => fileInfo.type === EFileType.Resource
      );
    }

    let zipInfos: IZipInfo[] = [];
    if (resourceFileInfos.length > 0) {
      // Bundle the resources into chunked zip updates because AGO tends to have problems with
      // many updates in a row to the same item: it claims success despite randomly failing.
      // Note that AGO imposes a limit of 50 files per zip, so we break the list of resource
      // file info into chunks below this threshold and start a zip for each
      // https://developers.arcgis.com/rest/users-groups-and-items/add-resources.htm
      const chunkedResourceFileInfo = chunkArray(resourceFileInfos, 40); // leave a bit of room below threshold
      chunkedResourceFileInfo.forEach((chunk, index) => {
        // Create a zip for this chunk
        const zipInfo: IZipInfo = {
          filename: `resources${index}.zip`,
          zip: new JSZip(),
          filelist: [] as IAssociatedFileInfo[]
        };
        awaitAllItems = awaitAllItems.concat(
          chunk.map(fileInfo => {
            return copyResourceIntoZip(fileInfo, sourceAuthentication, zipInfo);
          })
        );
        zipInfos.push(zipInfo);
      });
    }

    if (awaitAllItems.length > 0) {
      // Wait until all Data and Metadata files have been copied (if copyBasedOnFileType is true) and
      // the Resource zip file(s) prepared (the Data and Metadata files will be in a zip if
      // copyBasedOnFileType is false)
      void Promise.all(awaitAllItems).then(
        (results: IAssociatedFileCopyResults[]) => {
          // We have three types of results:
          // | fetchedFromSource | copiedToDestination |             interpretation            |        |
          // +-------------------+---------------------+------------------------------------------------+
          // |       false       |          *          | could not fetch file from source               |
          // |       true        |        true         | file has been fetched and sent to AGO          |
          // |       true        |      undefined      | file has been fetched and will be sent via zip |

          // Filter out copiedToDestination===undefined; we'll get their status when we send their zip
          results = results.filter(
            (result: IAssociatedFileCopyResults) =>
              !(
                result.fetchedFromSource &&
                typeof result.copiedToDestination === "undefined"
              )
          );

          // Filter out empty zips
          zipInfos = zipInfos.filter(
            (zipInfo: IZipInfo) => Object.keys(zipInfo.zip.files).length > 0
          );

          // Now send the resources to AGO
          if (zipInfos.length > 0) {
            // Send the zip(s) to AGO
            const awaitSendingZips = zipInfos.map(zipInfo => {
              return copyZipIntoItem(
                zipInfo,
                destinationItemId,
                destinationAuthentication
              );
            });
            void Promise.all(awaitSendingZips).then(
              (zipResults: IZipCopyResults[]) => {
                // Apply the result of sending the zip to AGO to each of the items in the zip
                zipResults.forEach((zipResult: IZipCopyResults) => {
                  zipResult.filelist.forEach(
                    (fileInfo: IAssociatedFileInfo) => {
                      results.push(
                        createCopyResults(
                          fileInfo,
                          true,
                          zipResult.copiedToDestination
                        ) as IAssociatedFileCopyResults
                      );
                    }
                  );
                });
                resolve(results);
              }
            );
          } else {
            // No resources to send; we're done
            resolve(results);
          }
        }
      );
    } else {
      // No data, metadata, or resources to send; we're done
      resolve([]);
    }
  });
}

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

/**
 * Creates a file with a specified mime type.
 *
 * @param fileDescription Structure containing a file and the desired mime type
 * @return Created file
 */
export function _createMimeTypedFile(fileDescription: IFileMimeTyped): File {
  return new_File([fileDescription.blob], fileDescription.filename, {
    type: fileDescription.mimeType
  });
}

/**
 * Copies data into an AGO item.
 *
 * @param fileInfo Information about the source and destination of the file such as its URL, folder, filename
 * @param sourceAuthentication Credentials for the request to the source
 * @param destinationItemId Id of item to receive copy of resource/metadata/thumbnail
 * @param destinationAuthentication Credentials for the request to the storage
 * @return A promise which resolves to the result of the copy
 */
export function copyDataIntoItem(
  fileInfo: IAssociatedFileInfo,
  sourceAuthentication: UserSession,
  destinationItemId: string,
  destinationAuthentication: UserSession
): Promise<IAssociatedFileCopyResults> {
  return new Promise<IAssociatedFileCopyResults>(resolve => {
    getBlob(fileInfo.url, sourceAuthentication).then(
      blob => {
        const update: IItemUpdate = {
          id: destinationItemId,
          data: _createMimeTypedFile({
            blob: blob,
            filename: fileInfo.filename,
            mimeType: fileInfo.mimeType || blob.type
          })
        };

        helpersUpdateItem(
          update,
          destinationAuthentication,
          fileInfo.folder
        ).then(
          () =>
            resolve(
              createCopyResults(
                fileInfo,
                true,
                true
              ) as IAssociatedFileCopyResults
            ),
          () =>
            resolve(
              createCopyResults(
                fileInfo,
                true,
                false
              ) as IAssociatedFileCopyResults
            ) // unable to add resource
        );
      },
      () =>
        resolve(
          createCopyResults(fileInfo, false) as IAssociatedFileCopyResults
        ) // unable to get resource
    );
  });
}

/**
 * Copies metadata into an AGO item.
 *
 * @param fileInfo Information about the source and destination of the file such as its URL, folder, filename
 * @param sourceAuthentication Credentials for the request to the source
 * @param destinationItemId Id of item to receive copy of resource/metadata/thumbnail
 * @param destinationAuthentication Credentials for the request to the storage
 * @return A promise which resolves to the result of the copy
 */
export function copyMetadataIntoItem(
  fileInfo: IAssociatedFileInfo,
  sourceAuthentication: UserSession,
  destinationItemId: string,
  destinationAuthentication: UserSession
): Promise<IAssociatedFileCopyResults> {
  return new Promise<IAssociatedFileCopyResults>(resolve => {
    getBlob(fileInfo.url, sourceAuthentication).then(
      blob => {
        if (blob.type !== "text/xml" && blob.type !== "application/xml") {
          resolve(
            createCopyResults(fileInfo, false) as IAssociatedFileCopyResults
          ); // unable to get resource
          return;
        }
        addMetadataFromBlob(
          blob,
          destinationItemId,
          destinationAuthentication
        ).then(
          () =>
            resolve(
              createCopyResults(
                fileInfo,
                true,
                true
              ) as IAssociatedFileCopyResults
            ),
          () =>
            resolve(
              createCopyResults(
                fileInfo,
                true,
                false
              ) as IAssociatedFileCopyResults
            ) // unable to add resource
        );
      },
      () =>
        resolve(
          createCopyResults(fileInfo, false) as IAssociatedFileCopyResults
        ) // unable to get resource
    );
  });
}

/**
 * Copies a resource into a zipfile.
 *
 * @param fileInfo Information about the source and destination of the file such as its URL, folder, filename
 * @param sourceAuthentication Credentials for the request to the source
 * @param zipInfo Information about a zipfile such as its name and its zip object
 * @return A promise which resolves to the result of the copy
 */
export function copyResourceIntoZip(
  fileInfo: IAssociatedFileInfo,
  sourceAuthentication: UserSession,
  zipInfo: IZipInfo
): Promise<IAssociatedFileCopyResults> {
  return new Promise<IAssociatedFileCopyResults>(resolve => {
    getBlobAsFile(fileInfo.url, fileInfo.filename, sourceAuthentication).then(
      (file: any) => {
        // And add it to the zip
        if (fileInfo.folder) {
          zipInfo.zip
            .folder(fileInfo.folder)
            .file(fileInfo.filename, file, { binary: true });
        } else {
          zipInfo.zip.file(fileInfo.filename, file, { binary: true });
        }
        zipInfo.filelist.push(fileInfo);
        resolve(
          createCopyResults(fileInfo, true) as IAssociatedFileCopyResults
        );
      },
      () =>
        resolve(
          createCopyResults(fileInfo, false) as IAssociatedFileCopyResults
        ) // unable to get resource
    );
  });
}

/**
 * Copies a zipfile into an AGO item.
 *
 * @param zipInfo Information about a zipfile such as its name and its zip object
 * @param destinationItemId Id of item to receive copy of resource/metadata/thumbnail
 * @param destinationAuthentication Credentials for the request to the storage
 * @return A promise which resolves to the result of the copy
 */
export function copyZipIntoItem(
  zipInfo: IZipInfo,
  destinationItemId: string,
  destinationAuthentication: UserSession
): Promise<IZipCopyResults> {
  return new Promise<IZipCopyResults>(resolve => {
    zipInfo.zip
      .generateAsync({ type: "blob" })
      .then((content: Blob) => {
        return blobToFile(content, zipInfo.filename, "application/zip");
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
        return addItemResource(addResourceOptions);
      })
      .then(
        () =>
          resolve(createCopyResults(zipInfo, true, true) as IZipCopyResults),
        () =>
          resolve(createCopyResults(zipInfo, true, false) as IZipCopyResults) // unable to add resource
      );
  });
}

/**
 * Generates IAssociatedFileCopyResults object.
 *
 * @param fileInfo Info about item that was to be copied
 * @param fetchedFromSource Status of fetching item from source
 * @param copiedToDestination Status of copying item to destination
 * @return IAssociatedFileCopyResults object
 */
export function createCopyResults(
  fileInfo: IAssociatedFileInfo | IZipInfo,
  fetchedFromSource: boolean,
  copiedToDestination?: boolean
): IAssociatedFileCopyResults | IZipCopyResults {
  return {
    ...fileInfo,
    fetchedFromSource,
    copiedToDestination
  };
}
