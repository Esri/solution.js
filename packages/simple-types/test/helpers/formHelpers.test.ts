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
import * as formHelpers from "../../src/helpers/formHelpers";
import * as zipUtilsTest from "@esri/solution-common/test/zip-utils.test";

// ------------------------------------------------------------------------------------------------------------------ //


jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

describe("Module `formHelpers`", () => {

  describe("templatizeFormData", () => {
    const itemId = "2f56b3b59cdc4ac8b8f5de0399887e1e";

    it("templatizes form data containing webhooks", async () => {
      const zipObject = await zipUtilsTest.generateFormZipObject(itemId);

      const modifiedZipObject = await formHelpers.templatizeFormWebHooks(zipObject, true);
      const modifiedZipContents = await common.getZipObjectContents(modifiedZipObject);

      const expectedZipObject = zipUtilsTest.generateFormZipObject(itemId);
      const expectedZipContents = await common.getZipObjectContents(expectedZipObject);
      expectedZipContents[1].content = expectedZipContents[1].content
        .replace("https://fred.maps.arcgis.com", "{{portalBaseUrl}}")
        .replace("org1234567890", "{{user.orgId}}");

      expect(modifiedZipContents).toEqual(expectedZipContents);
    });

    it("templatizes form data that doesn't contain webhooks", async () => {
      const zipObject = await zipUtilsTest.generateFormZipObject(itemId, false);

      const modifiedZipObject = await formHelpers.templatizeFormWebHooks(zipObject, true);
      const modifiedZipContents = await common.getZipObjectContents(modifiedZipObject);

      const expectedZipObject = zipUtilsTest.generateFormZipObject(itemId, false);
      const expectedZipContents = await common.getZipObjectContents(expectedZipObject);

      expect(modifiedZipContents).toEqual(expectedZipContents);
    });
  });

});
