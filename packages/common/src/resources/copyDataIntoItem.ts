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
  IAssociatedFileCopyResults,
  IAssociatedFileInfo,
  IFileMimeTyped,
  IItemUpdate,
  ArcGISIdentityManager
} from "../interfaces";
import { createCopyResults } from "./createCopyResults";
import { getBlob } from "./get-blob";
import { new_File } from "../polyfills";
import { updateItem as helpersUpdateItem } from "../restHelpers";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Copies data into an AGO item.
 *
 * @param fileInfo Information about the source and destination of the file such as its URL, folder, filename
 * @param sourceAuthentication Credentials for the request to the source
 * @param destinationItemId Id of item to receive copy of resource/metadata/thumbnail
 * @param destinationAuthentication Credentials for the request to the storage
 * @returns A promise which resolves to the result of the copy
 */
export function copyDataIntoItem(
  fileInfo: IAssociatedFileInfo,
  sourceAuthentication: ArcGISIdentityManager,
  destinationItemId: string,
  destinationAuthentication: ArcGISIdentityManager
): Promise<IAssociatedFileCopyResults> {
  return new Promise<IAssociatedFileCopyResults>(resolve => {
    getBlob(fileInfo.url, sourceAuthentication).then(
      blob => {
        const update: IItemUpdate = {
          id: destinationItemId,
          data: createMimeTypedFile({
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
 * Creates a file with a specified mime type.
 *
 * @param fileDescription Structure containing a file and the desired mime type
 * @returns Created file
 */
export function createMimeTypedFile(fileDescription: IFileMimeTyped): File {
  return new_File([fileDescription.blob], fileDescription.filename, {
    type: fileDescription.mimeType
  });
}
