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
 * Detemplatizes Form data and swizzles the AGO ids of a zip object if they are present in the template dictionary.
 *
 * @param zipObject Zip file to be modified in place
 * @param templateDictionary Dictionary of replacement values
 * @returns Promise that resolves to the updated zip object
 */
export async function swizzleFormObject(
  zipObject: JSZip,
  templateDictionary: any
): Promise<JSZip> {
  // Get the contents of the zip object
  const zipObjectContents = await common.getZipObjectContents(zipObject);

  // Swizzle the contents of each file in a zip file and replace them in the zip object
  zipObjectContents.forEach(
    (zipFile : common.IZipObjectContentItem) => {
      // Detemplatize the file content
      let updatedZipContent = common.replaceInTemplate(zipFile.content, templateDictionary);

      // Find the AGO ids in the file content
      const agoIdRegEx = common.getAgoIdRegEx();
      const agoIdMatches = updatedZipContent.match(agoIdRegEx) ?? [];

      // Replace the matching AGO id in the file content iff it is present in the template dictionary
      agoIdMatches.forEach((match: string) => {
        const replacement = templateDictionary[match];
        if (typeof replacement?.itemId === "string") {
          if (match === replacement.itemId) { return; }
          updatedZipContent = updatedZipContent.replace(new RegExp(match, "g"), `${replacement.itemId}`);
        }
      });

      // Replace the file content in the zip object
      zipObject.file(zipFile.file, updatedZipContent);
    }
  );

  return Promise.resolve(zipObject);
}
