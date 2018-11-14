/*
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

import { UserSession } from "@esri/arcgis-rest-auth";

//--------------------------------------------------------------------------------------------------------------------//

export const TOMORROW = (function() {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  return now;
})();

export const YESTERDAY = (function() {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return now;
})();

export function setMockDateTime (
  now: number
): number {
  jasmine.clock().install();
  jasmine.clock().mockDate(new Date(now));
  return now;
}

export function createRuntimeMockUserSession (
  now: number
): UserSession {
  let tomorrow = new Date(now + 86400000);
  return new UserSession({
    clientId: "clientId",
    redirectUri: "https://example-app.com/redirect-uri",
    token: "fake-token",
    tokenExpires: tomorrow,
    refreshToken: "refreshToken",
    refreshTokenExpires: tomorrow,
    refreshTokenTTL: 1440,
    username: "casey",
    password: "123456",
    portal: "https://myorg.maps.arcgis.com/sharing/rest"
  });
}
