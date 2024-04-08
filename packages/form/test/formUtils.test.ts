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
import * as zipUtilsTest from "../../common/test/zip-utils.test";
import JSZip from "jszip";

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("formUtils", () => {

  describe("swizzleFormObject", () => {

    it("swizzles a form object", async () => {
      const zipObject = await zipUtilsTest.generateFormZipObject("0c01725576b640e4bd25a16721850000");
      const templateDictionary = {
        "0c01725576b640e4bd25a16721850000": {
          itemId: "0c01725576b640e4bd25a16721850001"
        }
      };

      const resultingZipObject = await formUtils.swizzleFormObject(zipObject, templateDictionary);
      const resultingZipContents = await common.getZipObjectContents(resultingZipObject);

      const expectedZipObject = await zipUtilsTest.generateFormZipObject("0c01725576b640e4bd25a16721850001");
      const expectedZipContents = await common.getZipObjectContents(expectedZipObject);

      expect(resultingZipContents).toEqual(expectedZipContents);
    });

    it("skips no-ops", async () => {
      const zipObject = await zipUtilsTest.generateFormZipObject("0c01725576b640e4bd25a16721850000");
      const templateDictionary = {
        "0c01725576b640e4bd25a16721850000": {
          itemId: "0c01725576b640e4bd25a16721850000"
        }
      };

      const resultingZipObject = await formUtils.swizzleFormObject(zipObject, templateDictionary);
      const resultingZipContents = await common.getZipObjectContents(resultingZipObject);

      const expectedZipObject = await zipUtilsTest.generateFormZipObject("0c01725576b640e4bd25a16721850000");
      const expectedZipContents = await common.getZipObjectContents(expectedZipObject);

      expect(resultingZipContents).toEqual(expectedZipContents);
    });

    it("doesn't swizzle the wrong items", async () => {
      const zipObject = await zipUtilsTest.generateFormZipObject("0c01725576b640e4bd25a16721850002");
      const templateDictionary = {
        "0c01725576b640e4bd25a16721850000": {
          itemId: "0c01725576b640e4bd25a16721850001"
        }
      };

      const resultingZipObject = await formUtils.swizzleFormObject(zipObject, templateDictionary);
      const resultingZipContents = await common.getZipObjectContents(resultingZipObject);

      const expectedZipObject = await zipUtilsTest.generateFormZipObject("0c01725576b640e4bd25a16721850002");
      const expectedZipContents = await common.getZipObjectContents(expectedZipObject);

      expect(resultingZipContents).toEqual(expectedZipContents);
    });

    it("doesn't swizzle a binary object", async () => {
      const zipObject = await zipUtilsTest.generateFormZipObject("0c01725576b640e4bd25a16721850000");
      const originalXLSX = utils.loadSampleXLSX("09b843d27d8a441db4c88c1f03b8e9aa");
      zipObject.file("09b843d27d8a441db4c88c1f03b8e9aa.xlsx", originalXLSX, { binary: true });

      const templateDictionary = {
        "content": "item",
        "09b843d27d8a441db4c88c1f03b8e9aa": { itemId: "c909d4ffd708476789e22664051629a0" },
        "bf0b8500dc824f0bbd03dbde294cbec9": { itemId: "3abb693e55374947ba60ec7d974e8e92" },
      }

      const resultingZipObject = await formUtils.swizzleFormObject(zipObject, templateDictionary);
      const resultingZipContents = await common.getZipObjectContents(resultingZipObject);

      const expectedZipObject = await zipUtilsTest.generateFormZipObject("0c01725576b640e4bd25a16721850000");
      const unmodifiedXLSX = utils.loadSampleXLSX("09b843d27d8a441db4c88c1f03b8e9aa");
      expectedZipObject.file("09b843d27d8a441db4c88c1f03b8e9aa.xlsx", unmodifiedXLSX, { binary: true });
      const expectedZipContents = await common.getZipObjectContents(expectedZipObject);

      expect(resultingZipContents).toEqual(expectedZipContents);
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
