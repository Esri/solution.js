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
 * Provides tests for functions involving the creation and deployment of Quick Capture item types.
 */

import * as common from "@esri/solution-common";
import * as createHelper from "../../src/helpers/create-item-from-template";
import * as convertGenericHelper from "../../src/helpers/convert-generic-item-to-template";
import * as fetchMock from "fetch-mock";
import * as quickcaptureProcessor from "../../src/quickcapture/quickcapture-processor";

import * as refineHelpers from "../../src/quickcapture/refine-quick-capture-template";
import * as mockItems from "@esri/solution-common/test/mocks/agolItems";
import * as utils from "@esri/solution-common/test/mocks/utils";
import * as templates from "@esri/solution-common/test/mocks/templates";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

afterEach(() => {
  fetchMock.restore();
});

describe("QuickCapture Processor :: ", () => {
  describe("createItemFromTemplate :: ", () => {
    it("delegated to helper", () => {
      const createSpy = spyOn(
        createHelper,
        "createItemFromTemplate"
      ).and.resolveTo();
      const cb = (): boolean => {
        return true;
      };
      return quickcaptureProcessor
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
    it("call generic converter", () => {
      const convertSpy = spyOn(
        convertGenericHelper,
        "convertGenericItemToTemplate"
      ).and.resolveTo();
      const convertQCSpy = spyOn(
        refineHelpers,
        "refineQuickCaptureTemplate"
      ).and.resolveTo();

      return quickcaptureProcessor
        .convertItemToTemplate("3ef", {}, MOCK_USER_SESSION)
        .then(() => {
          expect(convertSpy.calls.count()).toBe(
            1,
            "should call generic converter"
          );
          expect(convertQCSpy.calls.count()).toBe(
            1,
            "should call QC specific converter"
          );
        });
    });
  });

  describe("postProcess", () => {
    it("postProcess QuickCapture projects", done => {
      const newItemId: string = "xxx79c91fc7642ebb4c0bbacfbacd510";

      const qcTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      qcTemplate.itemId = newItemId;
      qcTemplate.data = {
        application: {
          basemap: {},
          dataSources: [
            {
              featureServiceItemId:
                "{{4efe5f693de34620934787ead6693f10.itemId}}",
              dataSourceId: "1d4de1e4-ef58-4e02-9159-7a6e6701cada",
              url: "{{4efe5f693de34620934787ead6693f10.layer0.url}}"
            },
            {
              featureServiceItemId:
                "{{4efe5f693de34620934787ead6693f10.itemId}}",
              dataSourceId: "1687a71b-cf77-48ed-b948-c66e228a0f74",
              url: "{{4efe5f693de34620934787ead6693f10.layer1.url}}"
            }
          ],
          itemId: "{{9da79c91fc7642ebb4c0bbacfbacd510.itemId}}",
          preferences: {
            adminEmail: "{{user.email}}"
          },
          templateGroups: [],
          userInputs: [],
          version: 0.1
        },
        name: "qc.project.json"
      };

      const templateDictionary: any = {
        user: {
          email: "casey@esri.com"
        },
        "4efe5f693de34620934787ead6693f10": {
          itemId: "xxxe5f693de34620934787ead6693f10",
          layer0: {
            url: "https://abc123/name/FeatureServer/0"
          },
          layer1: {
            url: "https://abc123/name/FeatureServer/1"
          }
        },
        "9da79c91fc7642ebb4c0bbacfbacd510": {
          itemId: "xxx79c91fc7642ebb4c0bbacfbacd510"
        }
      };

      const expectedData: any = JSON.stringify({
        basemap: {},
        dataSources: [
          {
            featureServiceItemId: "xxxe5f693de34620934787ead6693f10",
            dataSourceId: "1d4de1e4-ef58-4e02-9159-7a6e6701cada",
            url: "https://abc123/name/FeatureServer/0"
          },
          {
            featureServiceItemId: "xxxe5f693de34620934787ead6693f10",
            dataSourceId: "1687a71b-cf77-48ed-b948-c66e228a0f74",
            url: "https://abc123/name/FeatureServer/1"
          }
        ],
        itemId: "xxx79c91fc7642ebb4c0bbacfbacd510",
        preferences: {
          adminEmail: "casey@esri.com"
        },
        templateGroups: [],
        userInputs: [],
        version: 0.1
      });

      const updateSpy = spyOn(
        common,
        "updateItemResourceText"
      ).and.callThrough();

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/" +
          newItemId +
          "/updateResources",
        { success: true }
      );

      return quickcaptureProcessor
        .postProcess(
          newItemId,
          "QuickCapture Project",
          [],
          qcTemplate,
          [qcTemplate],
          templateDictionary,
          MOCK_USER_SESSION
        )
        .then(() => {
          const args = updateSpy.calls.argsFor(0) as any[];
          expect(args[0]).toBe(newItemId);
          expect(args[1]).toBe(qcTemplate.data.name);
          expect(args[2]).toBe(expectedData);
          done();
        })
        .catch(err => {
          done.fail();
        });
    });
  });
});
