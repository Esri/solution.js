/** @license
 * Copyright 2020 Esri
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
 * Provides connectors to third-party helper functions.
 */

import JSZip from "jszip";
import { blobToFile } from "@esri/solution-common";

//#region JSZip ----------------------------------------------------------------------------------------------------- //

/**
 * Creates a zip File from a collection of Files.
 *
 * @param zipFilename Name to use for zip File
 * @param files List of files to add to zip File
 * @return Promise resolving to a zip File
 */
export function createZip(
  zipFilename: string,
  files: File[]
): Promise<File> {
  return new Promise<File>((resolve, reject) => {
    const zip = new JSZip();

    // Add the files
    files.forEach(
      file => zip.file(file.name, file, { binary: true })
    );

    // Create the ZIP
    zip.generateAsync({ type: "blob" })
      .then(
        (content: Blob) => resolve(blobToFile(content, zipFilename, "application/zip")),
        reject
      );
  });
}

//#endregion ---------------------------------------------------------------------------------------------------------//
