/** @license
 * Copyright 2019 Esri
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
 * Provides tests for functions involving the creation and deployment of Form item types.
 */

import * as fetchMock from "fetch-mock";
import * as form from "../src/form";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as utils from "../../common/test/mocks/utils";

const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

afterEach(() => {
  fetchMock.restore();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `form`", () => {
  describe("convertItemToTemplate", () => {
    it("handles items without form info files", done => {
      const itemId = "itm1234567890";
      const expectedFile = mockItems.get400Failure();

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/itm1234567890/info/form.json",
          expectedFile
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/itm1234567890/info/forminfo.json",
          expectedFile
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/itm1234567890/info/form.webform",
          expectedFile
        );
      form.getFormInfoFiles(itemId, MOCK_USER_SESSION).then(results => {
        expect(results).toEqual([] as File[]);
        done();
      }, done.fail);
    });

    it("handles items with form info files", done => {
      const itemId = "itm1234567890";
      const expectedFile = utils.getSampleJsonAsFile("form.json");

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/itm1234567890/info/form.json",
          utils.getSampleJsonAsFile("form.json")
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/itm1234567890/info/forminfo.json",
          utils.getSampleJsonAsFile("forminfo.json")
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/itm1234567890/info/form.webform",
          utils.getSampleJsonAsFile("form.webform")
        );
      form.getFormInfoFiles(itemId, MOCK_USER_SESSION).then(results => {
        expect(results).toEqual([
          utils.getSampleJsonAsFile("form.json"),
          utils.getSampleJsonAsFile("forminfo.json"),
          utils.getSampleJsonAsFile("form.webform")
        ] as File[]);
        done();
      }, done.fail);
    });
  });
});
