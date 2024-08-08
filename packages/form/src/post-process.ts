/** @license
 * Copyright 2018 Esri
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
 * Manages the creation and deployment of form item types.
 *
 * @module post-process
 */

import { isHubFormTemplate } from "./helpers/is-hub-form-template";
import { postProcessHubSurvey } from "./helpers/post-process-survey";
import * as common from "@esri/solution-common";
import * as formUtils from "./formUtils";
import JSZip from "jszip";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Post-processes form items and the end of Solution item deployment.
 *
 * @param {string} itemId The item ID
 * @param {string} type The template type
 * @param {any[]} itemInfos Array of \{id: 'ef3', type: 'Web Map'\} objects
 * @param {any} templateDictionary The template dictionary
 * @param {UserSession} authentication The destination session info
 * @returns Promise resolving to successfulness of update
 */
export async function postProcess(
  itemId: string,
  type: string,
  itemInfos: any[],
  template: common.IItemTemplate,
  templates: common.IItemTemplate[],
  templateDictionary: any,
  authentication: common.UserSession,
): Promise<any> {
  // Fetch the form's zip file
  const formDataResponse = await common.getItemDataAsFile(itemId, "Form", authentication);
  if (formDataResponse) {
    const zipObject: JSZip = await common.blobToZipObject(formDataResponse);

    // Detemplatize it
    const updatedZipObject = await formUtils.swizzleFormObject(zipObject, templateDictionary);

    // Update the form
    void common.updateItemWithZipObject(updatedZipObject, itemId, authentication);
  } else {
    // If the form data is not found, AGO is slow storing the data; try again
    await common.delay(5000);
    return postProcess(itemId, type, itemInfos, template, templates, templateDictionary, authentication);
  }

  // If this is a Hub form, post-process it as such
  if (isHubFormTemplate(template)) {
    return postProcessHubSurvey(itemId, type, itemInfos, template, templates, templateDictionary, authentication);
  }

  // Update the item's template
  return common.updateItemTemplateFromDictionary(itemId, templateDictionary, authentication);
}

/**
 * Post-processes form items just before a Solution item is created.
 *
 * @param templates All of the templates in the created Solution item
 * @param templateDictionary A collection of mappings from item ids and service URLs to templatizing info
 * @returns
 */
export async function postProcessFormItems(
  templates: common.IItemTemplate[],
  templateDictionary: any,
): Promise<common.IItemTemplate[]> {
  for (const template of templates) {
    if (template.type === "Form") {
      // Store the form's data in the solution resources, not in template
      const formData = template.data;
      template.data = null;

      // Add the form data to the template for a post-process resource upload
      if (formData) {
        let zipObject: JSZip = await common.blobToZipObject(formData as File);

        // Templatize the form
        zipObject = await formUtils.templatizeFormData(zipObject, templateDictionary);

        template.item.name = _getFormDataFilename(
          template.item.name,
          (formData as File).name,
          `${template.itemId}.zip`,
        );
        const templatizedFormData: File = await common.zipObjectToZipFile(zipObject, template.item.name);

        // Add the data file to the template so that it can be uploaded with the other resources in the solution
        const storageName = common.convertItemResourceToStorageResource(
          template.itemId,
          template.item.name,
          common.SolutionTemplateFormatVersion,
          common.SolutionResourceType.data,
        );

        const dataFile: common.ISourceFile = {
          itemId: template.itemId,
          file: templatizedFormData,
          folder: storageName.folder,
          filename: template.item.name,
        };
        template.dataFile = dataFile;

        // Update the template's resources
        template.resources.push(storageName.folder + "/" + storageName.filename);
      }
    }
  }

  return Promise.resolve(templates);
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Encapsulates the rules for naming a form's data file.
 * Chooses the first parameter that's defined and is not the string "undefined".
 *
 * @param itemName Template's item name
 * @param dataFilename The data file name
 * @param itemIdAsName A name constructed from the template's id suffixed with ".zip"
 *
 * @return A name for the data file
 */
export function _getFormDataFilename(itemName: string, dataFilename: string, itemIdAsName: string): string {
  const originalFilename = itemName || dataFilename;
  const filename = originalFilename && originalFilename !== "undefined" ? originalFilename : itemIdAsName;
  return filename;
}
