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

import { UserSession } from "@esri/solution-common";

import {
  IHubRequestOptions,
  getHubUrlFromPortal,
  cloneObject
} from "@esri/hub-common";

/**
 * Create a IHubRequestOptions object from
 * the UserSession and templateDictionary
 * provided by Solution.js
 *
 * @export
 * @param {UserSession} authentication
 * @param {*} templateDictionary
 * @returns {IHubRequestOptions}
 */
export function createHubRequestOptions(
  authentication: UserSession,
  templateDictionary: any
): IHubRequestOptions {
  const portalSelf = cloneObject(templateDictionary.organization);
  portalSelf.user = cloneObject(templateDictionary.user);

  const hubApiUrl = getHubUrlFromPortal(portalSelf);
  // TODO: Why is IUserRequestOptions not discoverable?
  return {
    authentication,
    portalSelf,
    isPortal: templateDictionary.isPortal,
    hubApiUrl
  } as IHubRequestOptions;
}
