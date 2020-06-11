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

import { UserSession } from "@esri/arcgis-rest-auth";

import {
  IHubRequestOptions,
  getHubUrlFromPortal,
  cloneObject,
  getProp
} from "@esri/hub-common";

import { getSelf } from "@esri/arcgis-rest-portal";

/**
 * Create a IHubRequestOptions object from
 * the UserSession
 * If passed, it will use `templateDictionary`
 * values instead of making additional requests
 *
 * @export
 * @param {UserSession} authentication
 * @param {*} templateDictionary
 * @returns {IHubRequestOptions}
 */
export function createHubRequestOptions(
  authentication: UserSession,
  templateDictionary: any = {}
): Promise<IHubRequestOptions> {
  let orgUserPrms;
  // try to get info from templateDict
  const portalSelf = getProp(templateDictionary, "organization");
  const currentUser = getProp(templateDictionary, "user");

  // if we've been passed the templateDictionary, use it
  if (portalSelf && currentUser) {
    orgUserPrms = Promise.all([
      Promise.resolve(cloneObject(portalSelf)),
      Promise.resolve(cloneObject(currentUser))
    ]);
  } else {
    // need to use the auth to get the user and the org
    orgUserPrms = Promise.all([
      getSelf({ authentication }),
      authentication.getUser()
    ]);
  }

  return orgUserPrms.then(([pSelf, user]) => {
    pSelf.user = user;
    const hubApiUrl = getHubUrlFromPortal(pSelf);

    return {
      authentication,
      portalSelf,
      isPortal: pSelf.isPortal,
      hubApiUrl
    } as IHubRequestOptions;
  });
}
