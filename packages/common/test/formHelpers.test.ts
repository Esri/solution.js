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

import * as formHelpers from "../src/formHelpers";
import * as interfaces from "../src/interfaces";
import * as mockItems from "./mocks/agolItems";
import * as restHelpers from "../src/restHelpers";
import * as utils from "./mocks/utils";
import * as zipHelpers from "../test/mocks/zipHelpers";
import * as zipUtils from "../src/zip-utils";

// ------------------------------------------------------------------------------------------------------------------ //

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

describe("Module `formHelpers`", () => {
  describe("updateItemWithZipObject", () => {
    it("catches the inability to convert a blob into a the zip", async() => {
      const blob = new Blob([""], { type: "application/zip" });
      await expectAsync(zipUtils.blobToZipObject(blob)).toBeRejected();
    });

    it("updates the item with a zip file", async() => {
      const itemId = "2f56b3b59cdc4ac8b8f5de0399887e1e";
      const zip = zipHelpers.generateFormZipObject(itemId);

      spyOn(restHelpers, "updateItem").and.callFake(async(update: interfaces.IItemUpdate) => {
        expect(update.id).toEqual(itemId);
        const file = update.data;
        expect(file.name).toEqual(`${itemId}.zip`);
        expect(file.type).toEqual("application/zip");
        return Promise.resolve(mockItems.get200Success(itemId));
      });

      const response = await formHelpers.updateItemWithZipObject(zip, itemId, MOCK_USER_SESSION);
      expect(response).toEqual(mockItems.get200Success(itemId));
    });
  });
});
