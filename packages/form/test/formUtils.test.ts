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

  });

});
