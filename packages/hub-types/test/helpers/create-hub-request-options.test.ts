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
import { createHubRequestOptions } from "../../src/helpers/create-hub-request-options";
import * as utils from "../../../common/test/mocks/utils";
const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
describe("createHubRequestOptions", () => {
  it("creates hubRequestOptions from the templateDictionary and session", () => {
    const td = {
      organization: {
        id: "somePortalId",
        portalHostname: "www.arcgis.com"
      },
      user: {
        username: "vader"
      }
    };

    const hubRo = createHubRequestOptions(MOCK_USER_SESSION, td);
    expect(hubRo.portalSelf.id).toBe(
      "somePortalId",
      "should copy organization to portalSelf"
    );
    expect(hubRo.portalSelf.user.username).toBe(
      "vader",
      "should copy user to portalSelf.user"
    );
    expect(hubRo.authentication).toBe(
      MOCK_USER_SESSION,
      "should pass thru the auth"
    );
  });
});
