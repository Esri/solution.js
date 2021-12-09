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

import { UserSession } from "./interfaces";

import { IHubUserRequestOptions, getHubUrlFromPortal } from "@esri/hub-common";

import { getSelf, getUser } from "@esri/arcgis-rest-portal";

/**
 * Create a IHubUserRequestOptions object from
 * the UserSession
 * If passed, it will use `templateDictionary`
 * values instead of making additional requests
 *
 * @export
 * @param {UserSession} authentication
 * @param {*} templateDictionary
 * @returns {IHubUserRequestOptions}
 */
export function createHubRequestOptions(
  authentication: UserSession,
  templateDictionary: any = {}
): Promise<IHubUserRequestOptions> {
  // We used to pull the user
  // the template dictionary, but ran into issues
  // with the user.groups being filtered to groups
  // the user owns, vs all groups the user belongs to
  // this was problematic as we need to check if the user
  // can add more groups, based on how close they are to
  // the max 512 group limit.

  // At this time we are simply fetching the user directly
  const promises = [];
  if (templateDictionary.organization) {
    promises.push(Promise.resolve(templateDictionary.organization));
  } else {
    promises.push(getSelf({ authentication }));
  }
  // always get the user
  promises.push(getUser({ authentication }));

  return Promise.all(promises).then(([pSelf, user]) => {
    pSelf.user = user;
    const ro = {
      authentication,
      portalSelf: pSelf,
      isPortal: pSelf.isPortal
    } as IHubUserRequestOptions;

    if (!pSelf.isPortal) {
      ro.hubApiUrl = getHubUrlFromPortal(pSelf);
    }

    return ro;
  });
}
