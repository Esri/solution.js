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
 * Form post-processing actions
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
  authentication: common.UserSession
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
    return postProcessHubSurvey(
      itemId,
      type,
      itemInfos,
      template,
      templates,
      templateDictionary,
      authentication
    );
  }

  // Otherwise, just update the item's template
  return common.updateItemTemplateFromDictionary(
    itemId,
    templateDictionary,
    authentication
  );
}
