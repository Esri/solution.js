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

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Detemplatize the contents of a zip object.
 *
 * @param zipObject Zip file to be modified in place
 * @param templateDictionary Dictionary of replacement values
 * @returns Promise that resolves to the updated zip object
 */
export async function detemplatizeFormData(
  zipObject: JSZip,
  templateDictionary: any
): Promise<JSZip> {
  // Get the contents of the zip object
  const zipObjectContents = await common.getZipObjectContents(zipObject);

  // Detemplatize the contents of each file in a zip file and replace them in the zip object
  zipObjectContents.forEach(
    (zipFile: common.IZipObjectContentItem) => {
      try {
        let updatedZipContent = zipFile.content;

        // Detemplatize the file content
        updatedZipContent = common.replaceInTemplate(updatedZipContent, templateDictionary);

        // Replace the file content in the zip object
        zipObject.file(zipFile.file, updatedZipContent);

      } catch (_e) {
        // Ignore errors
      }
    }
  );

  return Promise.resolve(zipObject);
}
