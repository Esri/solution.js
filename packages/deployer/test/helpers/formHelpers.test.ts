/** @license
 * Copyright 2024 Esri
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
 * Provides tests for zip file helper functions.
 */

import * as common from "@esri/solution-common";
import * as form from "@esri/solution-form";
import * as utils from "../../../common/test/mocks/utils";
import * as zipHelpers from "../../../common/test/mocks/zipHelpers";

// ------------------------------------------------------------------------------------------------------------------ //

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

describe("Module `formHelpers`", () => {
  describe("swizzleFormData", () => {
    const org1 = "org1234567890";
    const itemId1 = "2f56b3b59cdc4ac8b8f5de0399887e1e";
    const orgId2 = "org1234567891";
    const itemId2 = "c73d0ae07a2445b29087f392ed4eb9f9";

    it("detemplatizes the form data", async () => {
      const zipObject = zipHelpers.generateFormZipObject(`{{${itemId1}.itemId}}`);
      const zipObjectContents = await common.getZipObjectContents(zipObject);
      zipObjectContents[1].content = (zipObjectContents[1].content as string)
        .replace("https://fred.maps.arcgis.com", "{{portalBaseUrl}}")
        .replace(org1, "{{orgId}}");
      zipObject.file(zipObjectContents[1].file, zipObjectContents[1].content);

      const templateDictionary = {
        orgId: orgId2,
        portalBaseUrl: "https://ginger.maps.arcgis.com",
      };
      templateDictionary[itemId1] = {
        itemId: itemId2,
      };

      const modifiedZipObject = await form.swizzleFormObject(zipObject, templateDictionary);

      const modifiedZipContents = await common.getZipObjectContents(modifiedZipObject);

      const expectedZipObject = zipHelpers.generateFormZipObject(itemId2);
      const expectedZipContents = await common.getZipObjectContents(expectedZipObject);
      expectedZipContents[1].content = (expectedZipContents[1].content as string)
        .replace("https://fred.maps.arcgis.com", "https://ginger.maps.arcgis.com")
        .replace(org1, orgId2);

      expect(modifiedZipContents).toEqual(expectedZipContents);
    });
  });
});
