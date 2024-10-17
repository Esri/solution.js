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
export async function swizzleFormObject(zipObject: JSZip, templateDictionary: any): Promise<JSZip> {
  // Get the contents of the zip object
  const zipObjectContents = await common.getZipObjectContents(zipObject);

  // Set the file dates to be a day in the past offset for time zone to get around S123 bug with dates during unzipping
  let now = new Date();
  now = new Date(
    now.valueOf() -
      86400000 - // back up 1 day in milliseconds
      now.getTimezoneOffset() * 1000 * 60, // back up the time zone offset in milliseconds
  );

  // Swizzle the contents of each file in a zip file and replace them in the zip object
  //const zipObjectUpdatePromises: Array<Promise<common.IZipObjectContentItem>> = [];
  zipObjectContents.forEach((zipFileItem: common.IZipObjectContentItem) => {
    // Separate the binary files from the text files
    if (typeof zipFileItem.content === "string") {
      const updatedZipContent = _updateZipObjectTextContent(zipFileItem, templateDictionary);

      // Replace the file content in the zip object
      zipObject.file(zipFileItem.file, updatedZipContent, { date: now });
    } else {
      // Update XLSX binary files' timestamp to match the other files
      if (zipFileItem.file.endsWith(".xlsx")) {
        zipObject.file(zipFileItem.file, zipFileItem.content, { date: now });
        //zipObjectUpdatePromises.push(_updateZipObjectBinaryContent(zipFileItem, templateDictionary));
      }
    }
  });

  /*
  const asyncUpdates = await Promise.all(zipObjectUpdatePromises);
  asyncUpdates.forEach((zipFileItem: common.IZipObjectContentItem) => {
    // Replace the file content in the zip object
    zipObject.file(zipFileItem.file, zipFileItem.content);
  });
  */

  return Promise.resolve(zipObject);
}

/**
 * Templatizes the content in a form's zip object.
 *
 * @param zipObject Form zip object to templatize; it is modified in place
 * @param templateDictionary Dictionary of values to use when templatizing
 * @returns Promise that resolves to the modified zip object
 */
export async function templatizeFormData(zipObject: JSZip, templateDictionary: any): Promise<JSZip> {
  const zipObjectContents: common.IZipObjectContentItem[] = await common.getZipObjectContents(zipObject);

  zipObjectContents.forEach((zipFile: common.IZipObjectContentItem) => {
    if (
      zipFile.file.endsWith(".info") ||
      zipFile.file.endsWith(".itemInfo") ||
      zipFile.file.endsWith(".json") ||
      zipFile.file.endsWith(".webform") ||
      zipFile.file.endsWith(".xml")
    ) {
      let contents = zipFile.content as string;

      const agoIdTypeRegEx = /\b([0-9A-Fa-f]){32}_type/g;

      // Replace the item id references
      contents = _replaceItemIds(contents, templateDictionary, agoIdTypeRegEx);

      // Replace the feature service url references
      contents = _replaceFeatureServiceURLs(contents, templateDictionary, agoIdTypeRegEx);

      // Replace portal base url references
      contents = _replacePortalBaseUrls(contents, templateDictionary);

      // Replace workflow manager base url references
      contents = _replaceWorkflowManagerBaseUrls(contents, templateDictionary);

      zipObject.file(zipFile.file, contents);
    }
  });

  // Return the modified zip object
  return Promise.resolve(zipObject);
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Replaces the feature service url references.
 *
 * @param contents String in which to replace feature service URLs
 * @param templateDictionary Item ids of feature services pointing to feature service URLs
 * @param agoIdTypeRegEx Matcher for AGO ids with "_type" suffix
 * @returns Modified contents
 */
export function _replaceFeatureServiceURLs(contents: string, templateDictionary: any, agoIdTypeRegEx: RegExp): string {
  let updatedContents = contents;
  const fsIds = Object.keys(templateDictionary).filter(
    (key) => key.match(agoIdTypeRegEx) && templateDictionary[key].type === "Feature Service",
  );
  fsIds.forEach((fsId) => {
    const urlToReplace = templateDictionary[fsId].url;
    const urlReplacement = templateDictionary[urlToReplace];
    if (urlReplacement) {
      updatedContents = updatedContents.replace(new RegExp(urlToReplace, "g"), urlReplacement);
    }
  });
  return updatedContents;
}

/**
 * Replaces the item id references.
 *
 * @param contents String in which to replace the item id references
 * @param templateDictionary Item ids of feature services pointing to feature service URLs
 * @param agoIdTypeRegEx Matcher for AGO ids
 * @returns Modified contents
 */
export function _replaceItemIds(contents: string, templateDictionary: any, agoIdTypeRegEx: RegExp): string {
  let updatedContents = contents;
  const itemIds = Object.keys(templateDictionary)
    .filter((key) => key.match(agoIdTypeRegEx) && templateDictionary[key].type !== "Feature Service")
    .map((key) => key.replace("_type", ""));
  itemIds.forEach((itemId) => {
    updatedContents = updatedContents.replace(new RegExp(itemId, "g"), `{{${itemId}.itemId}}`);
  });
  return updatedContents;
}

/**
 * Replaces portal base url references.
 *
 * @param contents String in which to replace the portal base url references
 * @param templateDictionary Item ids of feature services pointing to feature service URLs
 * @returns Modified contents
 */
export function _replacePortalBaseUrls(contents: string, templateDictionary: any): string {
  let updatedContents = contents;
  if (templateDictionary.portalBaseUrl) {
    updatedContents = updatedContents.replace(new RegExp(templateDictionary.portalBaseUrl, "g"), "{{portalBaseUrl}}");
  }
  return updatedContents;
}

/**
 * Replaces workflow manager base url references.
 *
 * @param contents String in which to replace the workflow manager base url references
 * @param templateDictionary Item ids of feature services pointing to feature service URLs
 * @returns Modified contents
 */
export function _replaceWorkflowManagerBaseUrls(contents: string, templateDictionary: any): string {
  let updatedContents = contents;
  if (templateDictionary.workflowBaseUrl) {
    updatedContents = updatedContents.replace(
      new RegExp(templateDictionary.workflowBaseUrl, "g"),
      "{{workflowBaseUrl}}",
    );
  }
  return updatedContents;
}

/**
 * Updates the binary content of a zip object.
 *
 * @param zipFileItem Zip file item
 * @param templateDictionary Dictionary of replacement values
 * @returns Promise that resolves to the updated zip file item
 */
/*
export async function _updateZipObjectBinaryContent(
  zipFileItem: common.IZipObjectContentItem,
  templateDictionary: any
): Promise<common.IZipObjectContentItem> {
  const updatedZipContent = await swizzleFormObject(await JSZip.loadAsync(zipFileItem.content), templateDictionary);

  // Replace the file content in the zip file item
  const updatedZipFileItem = {
    file: zipFileItem.file,
    content: await common.zipObjectToZipFile(updatedZipContent, zipFileItem.file)
  }

  return Promise.resolve(updatedZipFileItem);
}
*/

/**
 * Updates the text content of a zip object.
 *
 * @param zipFileItem Zip file item
 * @param templateDictionary Dictionary of replacement values
 * @returns Updated zip file item text content
 */
export function _updateZipObjectTextContent(
  zipFileItem: common.IZipObjectContentItem,
  templateDictionary: any,
): string {
  const agoIdRegEx = common.getAgoIdRegEx();

  // Detemplatize the file content
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  let updatedZipObjectContent = zipFileItem.content as string;

  updatedZipObjectContent = common.replaceInTemplate(zipFileItem.content, templateDictionary);

  // Find the AGO ids in the file content
  const agoIdMatches = common.dedupe(updatedZipObjectContent.match(agoIdRegEx) ?? []);

  // Replace things that look like AGO ids in the file content iff they are present in the template dictionary
  agoIdMatches.forEach((match: string) => {
    const replacement = templateDictionary[match];
    if (typeof replacement?.itemId === "string") {
      updatedZipObjectContent = updatedZipObjectContent.replace(new RegExp(match, "g"), `${replacement.itemId}`);
    }
  });

  return updatedZipObjectContent;
}
