/** @license
 * Copyright 2020 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Provides tests for functions involving the creation and deployment of Notebook item types.
 */

import * as common from "@esri/solution-common";
import * as utils from "../../../common/test/mocks/utils";
import * as templates from "../../../common/test/mocks/templates";
import * as updateHelper from "../../src/helpers/update-notebook-data";
import * as createHelper from "../../src/helpers/create-item-from-template";
import * as convertHelper from "../../src/helpers/convert-generic-item-to-template";
import * as refineHelpers from "../../src/notebook/refine-notebook-template";
import * as notebookProcessor from "../../src/notebook/notebook-processor";

let MOCK_USER_SESSION: common.UserSession;
let template: common.IItemTemplate;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
  template = templates.getItemTemplateSkeleton();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("notebookProcessor :: ", () => {
  describe("createItemFromTemplate :: ", () => {
    it("delegated to helper", () => {
      const createSpy = spyOn(
        createHelper,
        "createItemFromTemplate"
      ).and.resolveTo();
      const cb = (): boolean => {
        return true;
      };
      return notebookProcessor
        .createItemFromTemplate(
          {} as common.IItemTemplate,
          {},
          MOCK_USER_SESSION,
          cb
        )
        .then(() => {
          expect(createSpy.calls.count()).toBe(1, "should delegate");
        });
    });
  });
  describe("convertItemToTemplate :: ", () => {
    it("delegated to helper", () => {
      const convertSpy = spyOn(
        convertHelper,
        "convertGenericItemToTemplate"
      ).and.resolveTo();
      const refineSpy = spyOn(
        refineHelpers,
        "refineNotebookTemplate"
      ).and.resolveTo();
      return notebookProcessor
        .convertItemToTemplate("3ef", {}, MOCK_USER_SESSION)
        .then(() => {
          expect(convertSpy.calls.count()).toBe(1, "should delegate");
        });
    });
  });
  describe("_updateNotebookData :: ", () => {
    if (typeof window !== "undefined") {
      it("handles update error", done => {
        const data = {};
        // TODO: Use fetchMock to simulate failure - makes tests faster
        updateHelper
          .updateNotebookData("itm1234567890", data, MOCK_USER_SESSION)
          .then(() => done.fail())
          .catch(() => done());
      });
    }
  });
  describe("postProcess hook ::", () => {
    it("fetch, interpolate and share", () => {
      const dataSpy = spyOn(common, "getItemDataAsJson").and.resolveTo({
        value: "{{owner}}"
      });
      const td = { owner: "Luke Skywalker" };
      const updateSpy = spyOn(
        updateHelper,
        "updateNotebookData"
      ).and.resolveTo();
      return notebookProcessor
        .postProcess(
          "3ef",
          "Notebook",
          [],
          template,
          [template],
          td,
          MOCK_USER_SESSION
        )
        .then(() => {
          expect(dataSpy.calls.count()).toBe(1, "should fetch data");
          expect(dataSpy.calls.argsFor(0)[0]).toBe(
            "3ef",
            "should fetch data for specified item"
          );
          expect(updateSpy.calls.count()).toBe(1, "should update the item");
          expect(updateSpy.calls.argsFor(0)[1].value).toBe(
            "Luke Skywalker",
            "should interpolate value"
          );
        });
    });
    it("should update only if interpolation needed", () => {
      const dataSpy = spyOn(common, "getItemDataAsJson").and.resolveTo({
        value: "Larry"
      });
      const updateSpy = spyOn(
        updateHelper,
        "updateNotebookData"
      ).and.resolveTo();
      return notebookProcessor
        .postProcess(
          "3ef",
          "Notebook",
          [],
          template,
          [template],
          {},
          MOCK_USER_SESSION
        )
        .then(() => {
          expect(dataSpy.calls.count()).toBe(1, "should fetch data");
          expect(dataSpy.calls.argsFor(0)[0]).toBe(
            "3ef",
            "should fetch data for specified item"
          );
          expect(updateSpy.calls.count()).toBe(0, "should not update the item");
        });
    });
  });

  describe("fineTuneCreatedItem :: ", () => {
    it("interpolates and updated item", () => {
      const updateSpy = spyOn(common, "updateItem").and.resolveTo({
        success: true,
        id: "bc3"
      });

      const replaceSpy = spyOn(common, "replaceInTemplate").and.callThrough();

      const originalTemplate = {
        data: {
          chk: "{{someval}}"
        }
      } as common.IItemTemplate;

      const newItm = {
        item: {},
        data: {
          other: "val"
        }
      } as common.IItemTemplate;

      const td = {
        someval: "red"
      };
      return notebookProcessor
        .fineTuneCreatedItem(originalTemplate, newItm, td, MOCK_USER_SESSION)
        .then(() => {
          expect(replaceSpy.calls.count()).toBe(
            1,
            "should interpolate the item"
          );
          expect(updateSpy.calls.count()).toBe(1, "should update the item");
        });
    });
  });
});
