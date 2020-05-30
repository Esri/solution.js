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
 * @module solution-form
 */

import * as common from "@esri/solution-common";
import { simpleTypes } from "@esri/solution-simple-types";
import { isHubFormTemplate } from "./helpers/is-hub-form-template";

export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: common.UserSession
): Promise<common.IItemTemplate> {
  // Delegate to simple types
  return simpleTypes.convertItemToTemplate(
    solutionItemId,
    itemInfo,
    authentication
  );
}

export function createItemFromTemplate(
  template: common.IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: common.UserSession,
  itemProgressCallback: common.IItemProgressCallback
): Promise<common.ICreateItemFromTemplateResponse> {
  // Hub Form template custom processing
  if (isHubFormTemplate(template)) {
    return Promise.reject(
      common.fail(
        "createItemFromTemplate not yet implemented for Hub templates in solution-form package"
      )
    );
  }

  // otherwise delegate to simple types
  return simpleTypes.createItemFromTemplate(
    template,
    templateDictionary,
    destinationAuthentication,
    itemProgressCallback
  );
}
