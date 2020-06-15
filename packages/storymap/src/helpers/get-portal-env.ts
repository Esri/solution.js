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
import { UserSession } from "@esri/arcgis-rest-auth";

export function getPortalEnv(authentication: UserSession): string {
  const portalUrl =
    authentication.portal || "https://www.arcgis.com/sharing/rest";
  let result = "portal";
  if (portalUrl.match(/(qaext|\.mapsqa)\.arcgis.com/)) {
    result = "qaext";
  } else if (portalUrl.match(/(devext|\.mapsdevext)\.arcgis.com/)) {
    result = "devext";
  } else if (portalUrl.match(/(www|\.maps)\.arcgis.com/)) {
    result = "www";
  }
  return result;
}
