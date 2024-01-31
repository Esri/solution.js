/** @license
 * Copyright 2024 Esri
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

import JSZip from "jszip";
import { createMimeTypedFile } from "./resources/copyDataIntoItem";
import { updateItem } from "./restHelpers";
import { IItemUpdate, IUpdateItemResponse, UserSession } from "./interfaces";

/**
 * Relative path and string contents of a file in a zip file.
 */
export interface IZipFileContent {
  file: string;
  content: string;
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Converts a blob to a zip file.
 *
 * @param blob Blob to convert
 * @returns Promise resolving to zip file
 */
export async function blobToZip(
  blob: Blob
): Promise<JSZip> {
  const zip = new JSZip();
  return zip.loadAsync(blob)
  .then(async (zip) => {
    return Promise.resolve(zip);
  })
  .catch(() => {
    return Promise.reject();
  });
}

/**
 * Gets the contents of the files in the zip.
 *
 * @param zip Zip file
 * @param filesOfInterest Array of file names to extract from the zip file. If empty, all files are extracted.
 * @returns Promise that resolves to an array of objects containing the file name and contents
 */
export async function getZipFileContents(
  zip: JSZip,
  filesOfInterest: string[] = []
): Promise<IZipFileContent[]> {
  const extractedZipFiles: IZipFileContent[] = [];
  const fileContentsRetrievalPromises: Array<Promise<string>> = [];
  zip.forEach(
    (relativePath, file) => {
      const getContents = async () => {
        if (filesOfInterest.length === 0 || filesOfInterest.includes(relativePath)) {
          const fileContentsFetch = file.async('string');
          fileContentsRetrievalPromises.push(fileContentsFetch);
          extractedZipFiles.push({
            file: relativePath,
            content: await fileContentsFetch
          });
        }
      };
      void getContents();
    }
  );
  await Promise.all(fileContentsRetrievalPromises);
  return extractedZipFiles;
}

/**
 * Updates an item with a zip file.
 *
 * @param zip Zip file with which to update the item
 * @param destinationItemId Destination item id
 * @param destinationAuthentication Destination authentication
 * @param filesOfInterest Array of file names to extract from the zip file. If empty, all files are extracted.
 * @returns Promise that resolves to the update item response
 */
export async function updateItemWithZip(
  zip: JSZip,
  destinationItemId: string,
  destinationAuthentication: UserSession,
): Promise<IUpdateItemResponse> {
  const update: IItemUpdate = {
    id: destinationItemId,
    data: createMimeTypedFile({
      blob: await zip.generateAsync({ type: "blob" }),
      filename: `${destinationItemId}.zip`,
      mimeType: "application/zip"
    })
  };

  return updateItem(
    update,
    destinationAuthentication
  );
}
