/** @license
 * Copyright 2020 Esri
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
import { getStoryMapSubdomain } from "./get-storymap-subdomain";
/**
 * For a given environment Prod/qa/dev/portal
 * return the correct storymaps base url
 *
 * @param authentication
 */
export function getStoryMapBaseUrl(authentication: UserSession): string {
  let baseUrl = "";

  const subdomain = getStoryMapSubdomain(authentication);
  if (subdomain) {
    baseUrl = `https://${subdomain}.arcgis.com`;
  } else {
    // we're on portal
    // chop off the /sharing/rest to get the baseUrl
    const portalBaseUrl = authentication.portal.replace("/sharing/rest", "");
    baseUrl = `${portalBaseUrl}/apps/storymaps`;
  }

  return baseUrl;
}
