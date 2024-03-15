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
  const zipObjectUpdatePromises: Array<Promise<common.IZipObjectContentItem>> = [];
  zipObjectContents.forEach(
    (zipFileItem : common.IZipObjectContentItem) => {

      // Separate the binary files from the text files
      if (typeof zipFileItem.content === "string") {
        const updatedZipContent = _updateZipObjectTextContent(zipFileItem, templateDictionary);

        // Replace the file content in the zip object
        zipObject.file(zipFileItem.file, updatedZipContent);

      } else {
        // Only update XLSX binary files
        if (zipFileItem.file.endsWith(".xlsx")) {
          zipObjectUpdatePromises.push(_updateZipObjectBinaryContent(zipFileItem, templateDictionary));
        }
      }
    }
  );

  const asyncUpdates = await Promise.all(zipObjectUpdatePromises);
  asyncUpdates.forEach((zipFileItem: common.IZipObjectContentItem) => {
    // Replace the file content in the zip object
    zipObject.file(zipFileItem.file, zipFileItem.content);
  });

  return Promise.resolve(zipObject);
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Updates the binary content of a zip object.
 *
 * @param zipFileItem Zip file item
 * @param templateDictionary Dictionary of replacement values
 * @returns Promise that resolves to the updated zip file item
 */
async function _updateZipObjectBinaryContent(
  zipFileItem: common.IZipObjectContentItem,
  templateDictionary: any
): Promise<common.IZipObjectContentItem> {
  let updatedZipFileItem;
  try {
    const updatedZipContent = await swizzleFormObject(await JSZip.loadAsync(zipFileItem.content), templateDictionary);

    // Replace the file content in the zip file item
    updatedZipFileItem = {
      file: zipFileItem.file,
      content: await common.zipObjectToZipFile(updatedZipContent, zipFileItem.file)
    }
  } catch (error) {
    console.log("Error loading binary zip object: ", error, zipFileItem.file);
  }

  return Promise.resolve(updatedZipFileItem);
}

/**
 * Updates the text content of a zip object.
 *
 * @param zipFileItem Zip file item
 * @param templateDictionary Dictionary of replacement values
 * @returns Updated zip file item text content
 */
function _updateZipObjectTextContent(
  zipFileItem: common.IZipObjectContentItem,
  templateDictionary: any
): string {
  const agoIdRegEx = common.getAgoIdRegEx();

  // Detemplatize the file content
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  let updatedZipObjectContent = zipFileItem.content as string;

  updatedZipObjectContent = common.replaceInTemplate(zipFileItem.content, templateDictionary);

  // Find the AGO ids in the file content
  const agoIdMatches = updatedZipObjectContent.match(agoIdRegEx) ?? [];

  // Replace the matching AGO id in the file content iff it is present in the template dictionary
  agoIdMatches.forEach((match: string) => {
    const replacement = templateDictionary[match];
    if (typeof replacement?.itemId === "string") {
      if (match === replacement.itemId) { return; }
      updatedZipObjectContent = updatedZipObjectContent.replace(new RegExp(match, "g"), `${replacement.itemId}`);
    }
  });

  return updatedZipObjectContent;
}
