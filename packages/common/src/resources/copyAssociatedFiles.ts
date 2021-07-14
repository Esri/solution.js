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

/**
 * Provides functions for sending resources to AGO.
 */

import {
  EFileType,
  IAssociatedFileCopyResults,
  IAssociatedFileInfo,
  ISourceFile,
  IZipCopyResults,
  IZipInfo,
  UserSession
} from "../interfaces";
import { chunkArray } from "@esri/hub-common";
import { copyDataIntoItem } from "./copyDataIntoItem";
import { copyMetadataIntoItem } from "./copyMetadataIntoItem";
import {
  copyResourceIntoZip,
  copyResourceIntoZipFromInfo
} from "./copyResourceIntoZip";
import { copyZipIntoItem } from "./copyZipIntoItem";
import { createCopyResults } from "./createCopyResults";
import JSZip from "jszip";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Copies the files for storing the resources, metadata, and thumbnail of an item or group to a storage item
 * with a specified path by collecting files into zip files.
 *
 * @param files List of item files' URLs and folder/filenames for storing the files
 * @param destinationItemId Id of item to receive copy of resource/metadata/thumbnail
 * @param destinationAuthentication Credentials for the request to the storage
 * @param filesPerZip Number of files to include per zip file; AGO limits zips to 50 files
 * @return A promise which resolves to a list of the result of the copies
 */
export function copyFilesAsResources(
  files: ISourceFile[],
  destinationItemId: string,
  destinationAuthentication: UserSession,
  filesPerZip = 40
): Promise<IAssociatedFileCopyResults[]> {
  return new Promise<IAssociatedFileCopyResults[]>(resolve => {
    let awaitAllItems: IAssociatedFileCopyResults[] = [];

    const zipInfos: IZipInfo[] = [];
    if (files.length > 0) {
      // Bundle the resources into chunked zip updates because AGO tends to have problems with
      // many updates in a row to the same item: it claims success despite randomly failing.
      // Note that AGO imposes a limit of 50 files per zip, so we break the list of resource
      // file info into chunks below this threshold and start a zip for each
      // https://developers.arcgis.com/rest/users-groups-and-items/add-resources.htm
      const chunkedResourceFiles = chunkArray(files, filesPerZip);
      chunkedResourceFiles.forEach((chunk, index) => {
        // Create a zip for this chunk
        const zipInfo: IZipInfo = {
          filename: `resources${index}.zip`,
          zip: new JSZip(),
          filelist: [] as IAssociatedFileInfo[]
        };
        awaitAllItems = awaitAllItems.concat(
          chunk.map(file => copyResourceIntoZip(file, zipInfo))
        );
        zipInfos.push(zipInfo);
      });
    }

    if (awaitAllItems.length > 0) {
      // Wait until the Resource zip file(s) are prepared
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

          // Now send the resources to AGO
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          _copyAssociatedFileZips(
            zipInfos,
            destinationItemId,
            destinationAuthentication
          ).then((zipResults: IAssociatedFileCopyResults[]) => {
            resolve(results.concat(zipResults));
          });
        }
      );
    } else {
      // No data, metadata, or resources to send; we're done
      resolve([]);
    }
  });
}

/**
 * Copies the files described by a list of full URLs and storage folder/filename combinations for storing
 * the resources, metadata, and thumbnail of an item or group to a storage item with different
 * handling based on the type of file.
 *
 * @param fileInfos List of item files' URLs and folder/filenames for storing the files
 * @param sourceAuthentication Credentials for the request to the source
 * @param destinationItemId Id of item to receive copy of resource/metadata/thumbnail
 * @param destinationAuthentication Credentials for the request to the storage
 * @return A promise which resolves to a list of the result of the copies
 */
export function copyAssociatedFilesByType(
  fileInfos: IAssociatedFileInfo[],
  sourceAuthentication: UserSession,
  destinationItemId: string,
  destinationAuthentication: UserSession
): Promise<IAssociatedFileCopyResults[]> {
  return new Promise<IAssociatedFileCopyResults[]>(resolve => {
    let awaitAllItems: Array<Promise<IAssociatedFileCopyResults>> = [];
    let resourceFileInfos = fileInfos;

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
      fileInfo =>
        fileInfo.type === EFileType.Info || fileInfo.type === EFileType.Resource
    );

    const zipInfos: IZipInfo[] = [];
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
            return copyResourceIntoZipFromInfo(
              fileInfo,
              sourceAuthentication,
              zipInfo
            );
          })
        );
        zipInfos.push(zipInfo);
      });
    }

    if (awaitAllItems.length > 0) {
      // Wait until all Data and Metadata files have been copied and the Resource zip file(s) prepared
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

          // Now send the resources to AGO
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          _copyAssociatedFileZips(
            zipInfos,
            destinationItemId,
            destinationAuthentication
          ).then((zipResults: IAssociatedFileCopyResults[]) => {
            resolve(results.concat(zipResults));
          });
        }
      );
    } else {
      // No data, metadata, or resources to send; we're done
      resolve([]);
    }
  });
}

/**
 * Copies one or more zipfiles to a storage item.
 *
 * @param zipInfos List of zip files containing files to store
 * @param destinationItemId Id of item to receive copy of resource/metadata/thumbnail
 * @param destinationAuthentication Credentials for the request to the storage
 * @return A promise which resolves to a list of the result of the copies
 */
export function _copyAssociatedFileZips(
  zipInfos: IZipInfo[],
  destinationItemId: string,
  destinationAuthentication: UserSession
): Promise<IAssociatedFileCopyResults[]> {
  return new Promise<IAssociatedFileCopyResults[]>(resolve => {
    const results: IAssociatedFileCopyResults[] = [];

    // Filter out empty zips, which can happen when none of the files in the chunk going into a zip
    // can be fetched; e.g., the only file is metadata.xml, and the source item doesn't have metadata
    const nonEmptyZipInfos = zipInfos.filter(
      (zipInfo: IZipInfo) => Object.keys(zipInfo.zip.files).length > 0
    );

    if (nonEmptyZipInfos.length > 0) {
      // Send the zip(s) to AGO
      void _sendZipsSeriallyToItem(
        nonEmptyZipInfos,
        destinationItemId,
        destinationAuthentication
      ).then((zipResults: IAssociatedFileCopyResults[]) => {
        resolve(zipResults);
      });
    } else {
      // No resources to send; we're done
      resolve(results);
    }
  });
}

/**
 * Copies one or more zipfiles to a storage item in a serial fashion, waiting a bit between sends.
 *
 * @param zipInfos List of zip files containing files to store
 * @param destinationItemId Id of item to receive copy of resource/metadata/thumbnail
 * @param destinationAuthentication Credentials for the request to the storage
 * @return A promise which resolves to a list of the result of the copies
 */
function _sendZipsSeriallyToItem(
  zipInfos: IZipInfo[],
  destinationItemId: string,
  destinationAuthentication: UserSession
): Promise<IAssociatedFileCopyResults[]> {
  return new Promise<IAssociatedFileCopyResults[]>(resolve => {
    let allResults: IAssociatedFileCopyResults[] = [];

    // Remove zip from bottom of list
    const zipInfoToSend = zipInfos.pop();

    // Send predecessors in list
    let sendOthersPromise = Promise.resolve([] as IAssociatedFileCopyResults[]);
    if (zipInfos.length > 0) {
      sendOthersPromise = _sendZipsSeriallyToItem(
        zipInfos,
        destinationItemId,
        destinationAuthentication
      );
    }
    void sendOthersPromise
      .then((response: IAssociatedFileCopyResults[]) => {
        allResults = response;

        // Stall a little to give AGO time to catch up
        return new Promise<void>(resolveSleep => {
          setTimeout(() => resolveSleep(), 1000);
        });
      })
      .then(() => {
        // Now send the zip removed from bottom of the input list
        return copyZipIntoItem(
          zipInfoToSend,
          destinationItemId,
          destinationAuthentication
        );
      })
      .then((zipResult: IZipCopyResults) => {
        // Save the result of copying this zip as a status for each of the files that it contains
        zipResult.filelist.forEach((fileInfo: IAssociatedFileInfo) => {
          allResults.push(
            createCopyResults(
              fileInfo,
              true,
              zipResult.copiedToDestination
            ) as IAssociatedFileCopyResults
          );
        });

        resolve(allResults);
      });
  });
}
