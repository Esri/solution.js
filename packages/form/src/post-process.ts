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

import { UserSession, IItemTemplate } from "@esri/solution-common";
import { simpleTypes } from "@esri/solution-simple-types";
import { isHubFormTemplate } from "./helpers/is-hub-form-template";
import { postProcessHubSurvey } from "./helpers/post-process-survey";

/**
 * Form post-processing actions
 * @param {string} itemId The item ID
 * @param {string} type The template type
 * @param {any[]} itemInfos Array of {id: 'ef3', type: 'Web Map'} objects
 * @param {any} templateDictionary The template dictionary
 * @param {UserSession} authentication The destination session info
 * @returns {Promise<any>}
 */
export function postProcess(
  itemId: string,
  type: string,
  itemInfos: any[],
  template: IItemTemplate,
  templates: IItemTemplate[],
  templateDictionary: any,
  authentication: UserSession
): Promise<any> {
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

  return simpleTypes.postProcess(
    itemId,
    type,
    itemInfos,
    template,
    templates,
    templateDictionary,
    authentication
  );
}
