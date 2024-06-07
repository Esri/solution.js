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

import * as common from "@esri/solution-common";
import * as formUtils from "../src/formUtils";
import * as utils from "../../common/test/mocks/utils";
import * as zipHelpers from "../../common/test/mocks/zipHelpers";

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("formUtils", () => {

  describe("swizzleFormObject", () => {

    it("swizzles a form object", async () => {
      const zipObject = await zipHelpers.generateFormZipObject("0c01725576b640e4bd25a16721850000");
      const templateDictionary = {
        "0c01725576b640e4bd25a16721850000": {
          itemId: "0c01725576b640e4bd25a16721850001"
        }
      };

      const resultingZipObject = await formUtils.swizzleFormObject(zipObject, templateDictionary);
      const resultingZipContents = await common.getZipObjectContents(resultingZipObject);

      const expectedZipObject = await zipHelpers.generateFormZipObject("0c01725576b640e4bd25a16721850001");
      const expectedZipContents = await common.getZipObjectContents(expectedZipObject);

      expect(resultingZipContents).toEqual(expectedZipContents);
    });

    it("skips no-ops", async () => {
      const zipObject = await zipHelpers.generateFormZipObject("0c01725576b640e4bd25a16721850000");
      const templateDictionary = {
        "0c01725576b640e4bd25a16721850000": {
          itemId: "0c01725576b640e4bd25a16721850000"
        }
      };

      const resultingZipObject = await formUtils.swizzleFormObject(zipObject, templateDictionary);
      const resultingZipContents = await common.getZipObjectContents(resultingZipObject);

      const expectedZipObject = await zipHelpers.generateFormZipObject("0c01725576b640e4bd25a16721850000");
      const expectedZipContents = await common.getZipObjectContents(expectedZipObject);

      expect(resultingZipContents).toEqual(expectedZipContents);
    });

    it("doesn't swizzle the wrong items", async () => {
      const zipObject = await zipHelpers.generateFormZipObject("0c01725576b640e4bd25a16721850002");
      const templateDictionary = {
        "0c01725576b640e4bd25a16721850000": {
          itemId: "0c01725576b640e4bd25a16721850001"
        }
      };

      const resultingZipObject = await formUtils.swizzleFormObject(zipObject, templateDictionary);
      const resultingZipContents = await common.getZipObjectContents(resultingZipObject);

      const expectedZipObject = await zipHelpers.generateFormZipObject("0c01725576b640e4bd25a16721850002");
      const expectedZipContents = await common.getZipObjectContents(expectedZipObject);

      expect(resultingZipContents).toEqual(expectedZipContents);
    });

    it("doesn't swizzle a binary object", async () => {
      const zipObject = await zipHelpers.generateFormZipObject("0c01725576b640e4bd25a16721850000");
      const originalXLSX = utils.loadSampleXLSX("09b843d27d8a441db4c88c1f03b8e9aa");
      zipObject.file("09b843d27d8a441db4c88c1f03b8e9aa.xlsx", originalXLSX, { binary: true });

      const templateDictionary = {
        "content": "item",
        "09b843d27d8a441db4c88c1f03b8e9aa": { itemId: "c909d4ffd708476789e22664051629a0" },
        "bf0b8500dc824f0bbd03dbde294cbec9": { itemId: "3abb693e55374947ba60ec7d974e8e92" },
      }

      const resultingZipObject = await formUtils.swizzleFormObject(zipObject, templateDictionary);
      const resultingZipContents = await common.getZipObjectContents(resultingZipObject);

      const expectedZipObject = await zipHelpers.generateFormZipObject("0c01725576b640e4bd25a16721850000");
      const unmodifiedXLSX = utils.loadSampleXLSX("09b843d27d8a441db4c88c1f03b8e9aa");
      expectedZipObject.file("09b843d27d8a441db4c88c1f03b8e9aa.xlsx", unmodifiedXLSX, { binary: true });
      const expectedZipContents = await common.getZipObjectContents(expectedZipObject);

      expect(resultingZipContents).toEqual(expectedZipContents);
    });

  });

  describe("templatizeFormData", () => {

    const itemId = "2f56b3b59cdc4ac8b8f5de0399887e1e";

    it("templatizes form data", async () => {
      const zipObject = await zipHelpers.generateFormZipObject(itemId);
      const templateDictionary = {
        "portalBaseUrl": "https://fred.maps.arcgis.com",
      };

      const modifiedZipObject = await formUtils.templatizeFormData(zipObject, templateDictionary);
      const modifiedZipContents = await common.getZipObjectContents(modifiedZipObject);

      const expectedZipObject = zipHelpers.generateFormZipObject(itemId);
      const expectedZipContents = await common.getZipObjectContents(expectedZipObject);
      expectedZipContents[1].content = (expectedZipContents[1].content as string)
        .replace("https://fred.maps.arcgis.com", "{{portalBaseUrl}}");

      expect(modifiedZipContents).toEqual(expectedZipContents);
    });

  });

  describe("_replaceFeatureServiceUrl", () => {

    it("replaces feature service URL", () => {
      const content =
        '"serviceInfo":{"itemId":"123456","type":"Feature Service","url":"https://myServices/abcdef/arcgis/rest/services/fred/FeatureServer","fayard":"nicholas"}' +
        '"serviceInfo":{"itemId":"789012","type":"Feature Service","url":"https://myServices/abcdef/arcgis/rest/services/fred/FeatureServer","harold":"nicholas"}';
      const templateDictionary = {
        "7f056b285512495e80254154c53bde2b": {
          type: "Feature Service",
          url: "https://myServices/abcdef/arcgis/rest/services/fred/FeatureServer"
        },
        "https://myServices/abcdef/arcgis/rest/services/fred/FeatureServer": "{{7f056b285512495e80254154c53bde2b.url}}"
      };
      const agoIdRegEx = common.getAgoIdRegEx();

      const result = formUtils._replaceFeatureServiceURLs(content, templateDictionary, agoIdRegEx);

      const expectedContent =
        '"serviceInfo":{"itemId":"123456","type":"Feature Service","url":"{{7f056b285512495e80254154c53bde2b.url}}","fayard":"nicholas"}' +
        '"serviceInfo":{"itemId":"789012","type":"Feature Service","url":"{{7f056b285512495e80254154c53bde2b.url}}","harold":"nicholas"}';
      expect(result).toEqual(expectedContent);
    });

    it("doesn't replace feature service URL if a feature service doesn't have a URL in the dictionary", () => {
      const content =
        '"serviceInfo":{"itemId":"123456","type":"Feature Service","url":"https://myServices/abcdef/arcgis/rest/services/fred/FeatureServer","fayard":"nicholas"}' +
        '"serviceInfo":{"itemId":"789012","type":"Feature Service","url":"https://myServices/abcdef/arcgis/rest/services/fred/FeatureServer","harold":"nicholas"}';
      const templateDictionary = {
        "7f056b285512495e80254154c53bde2b": {
          type: "Feature Service",
          url: "https://myServices/abcdef/arcgis/rest/services/fred/FeatureServer"
        }
      };
      const agoIdRegEx = common.getAgoIdRegEx();

      const result = formUtils._replaceFeatureServiceURLs(content, templateDictionary, agoIdRegEx);

      const expectedContent =
        '"serviceInfo":{"itemId":"123456","type":"Feature Service","url":"https://myServices/abcdef/arcgis/rest/services/fred/FeatureServer","fayard":"nicholas"}' +
        '"serviceInfo":{"itemId":"789012","type":"Feature Service","url":"https://myServices/abcdef/arcgis/rest/services/fred/FeatureServer","harold":"nicholas"}';
      expect(result).toEqual(expectedContent);
    });

    it("doesn't replace feature service URL if there are no matches with template dictionary", () => {
      const content =
        '"serviceInfo":{"itemId":"123456","type":"Feature Service","url":"https://myServices/zyxwvut/arcgis/rest/services/fred/FeatureServer","fayard":"nicholas"}' +
        '"serviceInfo":{"itemId":"789012","type":"Feature Service","url":"https://myServices/zyxwvut/arcgis/rest/services/fred/FeatureServer","harold":"nicholas"}';
      const templateDictionary = {
        "7f056b285512495e80254154c53bde2b": {
          type: "Feature Service",
          url: "https://myServices/abcdef/arcgis/rest/services/fred/FeatureServer"
        },
        "https://myServices/abcdef/arcgis/rest/services/fred/FeatureServer": "{{7f056b285512495e80254154c53bde2b.url}}"
      };
      const agoIdRegEx = common.getAgoIdRegEx();

      const result = formUtils._replaceFeatureServiceURLs(content, templateDictionary, agoIdRegEx);

      const expectedContent =
        '"serviceInfo":{"itemId":"123456","type":"Feature Service","url":"https://myServices/zyxwvut/arcgis/rest/services/fred/FeatureServer","fayard":"nicholas"}' +
        '"serviceInfo":{"itemId":"789012","type":"Feature Service","url":"https://myServices/zyxwvut/arcgis/rest/services/fred/FeatureServer","harold":"nicholas"}';
      expect(result).toEqual(expectedContent);
    });

  });

  describe("_replaceItemIds", () => {

    it("replaces item ids", () => {
      const content =
        '"webhooks":[{"active":true,"name":"Workflow","url":"https://workflow.arcgis.com/abcdef/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]' +
        '"webhooks":[{"active":true,"name":"Workflow","url":"https://workflow.arcgis.com/abcdef/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]'
      const templateDictionary = {
        "16876b187f1349f19fa92712ae55bfbe": {
          type: "Web Map"
        }
      };
      const agoIdRegEx = common.getAgoIdRegEx();

      const result = formUtils._replaceItemIds(content, templateDictionary, agoIdRegEx);

      const expectedContent =
        '"webhooks":[{"active":true,"name":"Workflow","url":"https://workflow.arcgis.com/abcdef/{{16876b187f1349f19fa92712ae55bfbe.itemId}}/webhooks/createJobFromSurveyResponse"}]' +
        '"webhooks":[{"active":true,"name":"Workflow","url":"https://workflow.arcgis.com/abcdef/{{16876b187f1349f19fa92712ae55bfbe.itemId}}/webhooks/createJobFromSurveyResponse"}]'
      expect(result).toEqual(expectedContent);
    });

    it("doesn't replace item ids if there are no matches with template dictionary", () => {
      const content =
        '"webhooks":[{"active":true,"name":"Workflow","url":"https://workflow.arcgis.com/abcdef/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]' +
        '"webhooks":[{"active":true,"name":"Workflow","url":"https://workflow.arcgis.com/abcdef/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]'
      const templateDictionary = {
        "a38c6d56ca3842cca60b7daa76202fa3": {
          type: "Web Map"
        }
      };
      const agoIdRegEx = common.getAgoIdRegEx();

      const result = formUtils._replaceItemIds(content, templateDictionary, agoIdRegEx);

      const expectedContent =
        '"webhooks":[{"active":true,"name":"Workflow","url":"https://workflow.arcgis.com/abcdef/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]' +
        '"webhooks":[{"active":true,"name":"Workflow","url":"https://workflow.arcgis.com/abcdef/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]'
      expect(result).toEqual(expectedContent);
    });

  });

  describe("_replacePortalBaseUrls", () => {

    it("replaces portal base URL", () => {
      const content =
        '"webhooks":[{"active":true,"name":"Workflow","url":"https://www.arcgis.com/abcdef/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]' +
        '"webhooks":[{"active":true,"name":"Workflow","url":"https://www.arcgis.com/abcdef/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]'
      const templateDictionary = {
        "portalBaseUrl": "https://www.arcgis.com/abcdef"
      };

      const result = formUtils._replacePortalBaseUrls(content, templateDictionary);

      const expectedContent =
        '"webhooks":[{"active":true,"name":"Workflow","url":"{{portalBaseUrl}}/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]' +
        '"webhooks":[{"active":true,"name":"Workflow","url":"{{portalBaseUrl}}/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]'
      expect(result).toEqual(expectedContent);
    });

    it("doesn't replace portal base URL if there are no matches with template dictionary", () => {
      const content =
        '"webhooks":[{"active":true,"name":"Workflow","url":"https://www.arcgis.com/abcdef/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]' +
        '"webhooks":[{"active":true,"name":"Workflow","url":"https://www.arcgis.com/abcdef/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]'
      const templateDictionary = {
      };

      const result = formUtils._replacePortalBaseUrls(content, templateDictionary);

      const expectedContent =
        '"webhooks":[{"active":true,"name":"Workflow","url":"https://www.arcgis.com/abcdef/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]' +
        '"webhooks":[{"active":true,"name":"Workflow","url":"https://www.arcgis.com/abcdef/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]'
      expect(result).toEqual(expectedContent);
    });

  });

  describe("_replaceWorkflowManagerBaseUrls", () => {

    it("replaces workflow manager base URL", () => {
      const content =
        '"webhooks":[{"active":true,"name":"Workflow","url":"https://workflow.arcgis.com/abcdef/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]' +
        '"webhooks":[{"active":true,"name":"Workflow","url":"https://workflow.arcgis.com/abcdef/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]'
      const templateDictionary = {
        "workflowBaseUrl": "https://workflow.arcgis.com/abcdef"
      };

      const result = formUtils._replaceWorkflowManagerBaseUrls(content, templateDictionary);

      const expectedContent =
        '"webhooks":[{"active":true,"name":"Workflow","url":"{{workflowBaseUrl}}/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]' +
        '"webhooks":[{"active":true,"name":"Workflow","url":"{{workflowBaseUrl}}/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]'
      expect(result).toEqual(expectedContent);
    });

    it("doesn't replace workflow manager base URL if there are no matches with template dictionary", () => {
      const content =
        '"webhooks":[{"active":true,"name":"Workflow","url":"https://workflow.arcgis.com/abcdef/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]' +
        '"webhooks":[{"active":true,"name":"Workflow","url":"https://workflow.arcgis.com/abcdef/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]'
      const templateDictionary = {
      };

      const result = formUtils._replaceWorkflowManagerBaseUrls(content, templateDictionary);

      const expectedContent =
        '"webhooks":[{"active":true,"name":"Workflow","url":"https://workflow.arcgis.com/abcdef/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]' +
        '"webhooks":[{"active":true,"name":"Workflow","url":"https://workflow.arcgis.com/abcdef/16876b187f1349f19fa92712ae55bfbe/webhooks/createJobFromSurveyResponse"}]'
      expect(result).toEqual(expectedContent);
    });

  });

  /*
  describe("_updateZipObjectBinaryContent", () => {

    it("swizzles binary form object", async () => {
      const originalXLSX = utils.loadSampleXLSX("09b843d27d8a441db4c88c1f03b8e9aa");
      const originalZipFileItem: common.IZipObjectContentItem = {
        file: "09b843d27d8a441db4c88c1f03b8e9aa.xlsx",
        content: originalXLSX
      };

      const modifiedXLSX = utils.loadSampleXLSX("c909d4ffd708476789e22664051629a0");
      const modifiedZipFileItem: common.IZipObjectContentItem = {
        file: "c909d4ffd708476789e22664051629a0.xlsx",
        content: modifiedXLSX
      };
      const modfifiedZipFileObject = new JSZip();
      modfifiedZipFileObject.file("file.xlsx", modifiedXLSX, { binary: true });

      const templateDictionary = {
        "content": "item",
        "09b843d27d8a441db4c88c1f03b8e9aa": { itemId: "c909d4ffd708476789e22664051629a0" },
        "bf0b8500dc824f0bbd03dbde294cbec9": { itemId: "3abb693e55374947ba60ec7d974e8e92" },
      }

      const result = await formUtils._updateZipObjectBinaryContent(originalZipFileItem, templateDictionary);
      expect(result.content).toEqual(modifiedZipFileItem.content);
    });

  });
  */

  describe("_updateZipObjectTextContent", () => {

    it("modifies text form content", () => {
      const zipFileItem: common.IZipObjectContentItem = {
        file: "file.txt",
        content: "This is the bf0b8500dc824f0bbd03dbde294cbec9 {{content}} of {{09b843d27d8a441db4c88c1f03b8e9aa.itemId}}: 774ac2524dad4bf38c369ac1950d8d97 & bf0b8500dc824f0bbd03dbde294cbec9. It is a very important item 3abb693e55374947ba60ec7d974e8e92 for {{content}} and {{bf0b8500dc824f0bbd03dbde294cbec9.itemId}}. But not for 13d47c3960084f8a9effb0451df5ea1b {{content}}."
      };
      const templateDictionary = {
        "content": "item",
        "09b843d27d8a441db4c88c1f03b8e9aa": { itemId: "c909d4ffd708476789e22664051629a0" },
        "bf0b8500dc824f0bbd03dbde294cbec9": { itemId: "3abb693e55374947ba60ec7d974e8e92" },
      }

      const result = formUtils._updateZipObjectTextContent(zipFileItem, templateDictionary);
      expect(result).toEqual("This is the 3abb693e55374947ba60ec7d974e8e92 item of c909d4ffd708476789e22664051629a0: 774ac2524dad4bf38c369ac1950d8d97 & 3abb693e55374947ba60ec7d974e8e92. It is a very important item 3abb693e55374947ba60ec7d974e8e92 for item and 3abb693e55374947ba60ec7d974e8e92. But not for 13d47c3960084f8a9effb0451df5ea1b item.");
    });

    it("doesn't modify text form content if there are no matches with template dictionary", () => {
      const zipFileItem: common.IZipObjectContentItem = {
        file: "file.txt",
        content: "it doesn't modify text form content if there are no matches with template dictionary."
      };
      const templateDictionary = {
        "content": "item",
        "09b843d27d8a441db4c88c1f03b8e9aa": "c909d4ffd708476789e22664051629a0",
        "bf0b8500dc824f0bbd03dbde294cbec9": "3abb693e55374947ba60ec7d974e8e92",
      }

      const result = formUtils._updateZipObjectTextContent(zipFileItem, templateDictionary);
      expect(result).toEqual("it doesn't modify text form content if there are no matches with template dictionary.");
    });

  });

});
