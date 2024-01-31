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

import * as common from "@esri/solution-common";
import JSZip from "jszip";

/**
 * Relative path and string contents of a file in a zip file.
 */
export interface IZipFileContent {
  file: string;
  content: string;
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Extracts files of interest from a zip file, calls a supplied function to modify them, and
 * restores the files into the zip.
 *
 * @param modificationCallback Function that modifies the specified files
 * @param zip Zip file that contains the files to modify; modified in place
 * @param filesOfInterest Array of file names to extract from the zip file. If empty, all files are extracted.
 * @returns Promise that resolves to the modified zip file if the swizzle was successful
 */
export async function modifyFilesinZip(
  modificationCallback: (zipContentStr: IZipFileContent) => string,
  zip: JSZip,
  filesOfInterest: string[] = []
): Promise<JSZip> {
  // Get the contents of the form.json file
  const extractedZipFiles = await common.getZipFileContents(zip, filesOfInterest);

  extractedZipFiles.forEach((extractedZipFile) => {
    // Run the modification callback
    const content = modificationCallback(extractedZipFile);

    // Update the zip file
    zip.file(extractedZipFile.file, content);
  });

  return Promise.resolve(zip);
}

/**
 * Swizzles the source item id with the destination item id in the form zip file and updates the destination item
 * with the swizzled zip file.
 *
 * @param sourceItemId Source item id
 * @param destinationItemId Destination item id
 * @param zipBlob Form zip file
 * @param filesOfInterest Array of file names to extract from the zip file. If empty, all files are extracted.
 * @returns Promise that resolves to the modified zip file if the swizzle was successful
 */
export async function swizzleIdsInZipFile(
  sourceItemId: string,
  destinationItemId: string,
  zip: JSZip,
  filesOfInterest: string[] = []
): Promise<JSZip> {
  const updatedZip = await modifyFilesinZip(
    (zipFile: IZipFileContent) => {
      return zipFile.content.replace(new RegExp(sourceItemId, "g"), destinationItemId);
    }, zip, filesOfInterest
  );

  return Promise.resolve(updatedZip);
}
