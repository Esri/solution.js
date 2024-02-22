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
import * as zipUtilsTest from "../../../common/test/zip-utils.test";

// ------------------------------------------------------------------------------------------------------------------ //


jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

describe("Module `zip-utils`", () => {

  describe("templatizeFormData", () => {
    const itemId = "2f56b3b59cdc4ac8b8f5de0399887e1e";

    it("templatizes form data containing webhooks", async () => {
      const filename = "test.zip";
      const zipObject = await zipUtilsTest.generateFormZipObject(itemId);

      const modifiedZipObject = await formHelpers.templatizeFormData(zipObject);
      const modifiedZipContents = await common.getZipObjectContents(modifiedZipObject);

      const expectedZipObject = zipUtilsTest.generateFormZipObject(`{{${itemId}.itemId}}`);
      const expectedZipContents = await common.getZipObjectContents(expectedZipObject);
      expectedZipContents[1].content = expectedZipContents[1].content
        .replace("https://fred.maps.arcgis.com", "{{portalBaseUrl}}")
        .replace("org1234567890", "{{orgId}}");

      expect(modifiedZipContents).toEqual(expectedZipContents);
    });

    it("templatizes form data that doesn't contain webhooks", async () => {
      const filename = "test.zip";
      const zipObject = await zipUtilsTest.generateFormZipObject(itemId, false);

      const modifiedZipObject = await formHelpers.templatizeFormData(zipObject);
      const modifiedZipContents = await common.getZipObjectContents(modifiedZipObject);

      const expectedZipObject = zipUtilsTest.generateFormZipObject(`{{${itemId}.itemId}}`, false);
      const expectedZipContents = await common.getZipObjectContents(expectedZipObject);

      expect(modifiedZipContents).toEqual(expectedZipContents);
    });
  });

  describe("_templatizeAgoIds", () => {
    const itemId = "2f56b3b59cdc4ac8b8f5de0399887e1e";

    it("templatizes AGO ids", async () => {
      const zipObject = zipUtilsTest.generateFormZipObject(itemId);
      const zipContents = await common.getZipObjectContents(zipObject);

      const modifiedZipObject = await formHelpers._templatizeAgoIds(zipObject);
      const modifiedZipContents = await common.getZipObjectContents(modifiedZipObject);

      const expectedZipObject = zipUtilsTest.generateFormZipObject(`{{${itemId}.itemId}}`);
      const expectedZipContents = await common.getZipObjectContents(expectedZipObject);

      expect(zipContents).not.toEqual(modifiedZipContents);
      expect(modifiedZipContents).toEqual(expectedZipContents);
    });
  });

  describe("_templatizeWebHooks", () => {
    it("templatizes webhooks", () => {
      const webhooks = [{
        "active": true,
        "name": "workflow manager",
        "url":
        "https://workflow.arcgis.com/org1234567890/e788fd6491bb46fda9e7c97d0bf4eb02/webhooks/createJobFromSurveyResponse/hook1234567890",
      }, {
        "active": true,
        "name": "Swizzle Webhook",
        "url": "https://myorg.maps.arcgis.com/home/item.html?id=e788fd6491bb46fda9e7c97d0bf4eb02",
      }];

      formHelpers._templatizeWebHooks(webhooks);

      expect(webhooks).toEqual([{
        "active": true,
        "name": "workflow manager",
        "url":
        "https://workflow.arcgis.com/{{user.orgId}}/e788fd6491bb46fda9e7c97d0bf4eb02/webhooks/createJobFromSurveyResponse/hook1234567890",
      }, {
        "active": true,
        "name": "Swizzle Webhook",
        "url": "{{portalBaseUrl}}/home/item.html?id=e788fd6491bb46fda9e7c97d0bf4eb02",
      }]);
    });
  });

});
