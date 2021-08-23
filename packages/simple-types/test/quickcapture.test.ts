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
import * as createHelper from "../src/helpers/create-item-from-template";
import * as convertHelper from "../src/helpers/convert-item-to-template";
import * as fetchMock from "fetch-mock";
import * as quickcapture from "../src/quickcapture";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as utils from "../../common/test/mocks/utils";
import * as templates from "../../common/test/mocks/templates";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

afterEach(() => {
  fetchMock.restore();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `quick capture`: manages the creation and deployment of quick capture project item types", () => {
  describe("createItemFromTemplate :: ", () => {
    it("delegated to helper", () => {
      const createSpy = spyOn(
        createHelper,
        "createItemFromTemplate"
      ).and.resolveTo();
      const cb = (): boolean => {
        return true;
      };
      return quickcapture
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
        "convertItemToTemplate"
      ).and.resolveTo();
      return quickcapture
        .convertItemToTemplate("3ef", {}, MOCK_USER_SESSION, {})
        .then(() => {
          expect(convertSpy.calls.count()).toBe(1, "should delegate");
        });
    });
  });

  describe("convertQuickCaptureToTemplate", () => {
    it("templatize application data", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "QuickCapture Project",
        null
      );
      itemTemplate.dependencies = [];
      itemTemplate.data = mockItems.getAGOLItemData("QuickCapture Project");

      const expectedDependencies: string[] = [
        "4efe5f693de34620934787ead6693f10"
      ];

      const expectedData: any = {
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

      quickcapture.convertQuickCaptureToTemplate(itemTemplate).then(actual => {
        expect(actual.data).toEqual(expectedData);
        expect(actual.dependencies).toEqual(expectedDependencies);
        done();
      }, done.fail);
    });

    it("will not fail with empty data", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "QuickCapture Project",
        null
      );
      itemTemplate.data = {};
      quickcapture.convertQuickCaptureToTemplate(itemTemplate).then(actual => {
        expect(actual).toEqual(itemTemplate);
        done();
      }, done.fail);
    });
  });

  it("will not fail with missing JSON", done => {
    const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
      "QuickCapture Project",
      null
    );
    itemTemplate.dependencies = [];
    itemTemplate.data = mockItems.getAGOLItemData("QuickCapture Project");
    itemTemplate.data[1].text = () => {
      return new Promise<any>(resolve => resolve(null));
    };

    const expectedDependencies: string[] = [];
    const expectedData: any = {};

    quickcapture.convertQuickCaptureToTemplate(itemTemplate).then(actual => {
      expect(actual.data).toEqual(expectedData);
      expect(actual.dependencies).toEqual(expectedDependencies);
      done();
    }, done.fail);
  });

  describe("_templatizeApplication", () => {
    it("will not fail with missing datasource id", () => {
      const data = {
        dataSources: [
          {
            dataSourceId: "1d4de1e4-ef58-4e02-9159-7a6e6701cada",
            url: "{{4efe5f693de34620934787ead6693f10.layer0.url}}"
          }
        ]
      };
      const expectedUpdatedData = common.cloneObject(data);

      const updatedData = quickcapture._templatizeApplication(data, null);

      expect(updatedData).toEqual(expectedUpdatedData);
    });
  });

  describe("_templatizeUrl", () => {
    it("will templatize a datasource URL", () => {
      const obj = {
        featureServiceItemId: "4efe5f693de34620934787ead6693f10",
        dataSourceId: "1687a71b-cf77-48ed-b948-c66e228a0f74",
        url:
          "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/1"
      };
      const idPath = "featureServiceItemId";
      const urlPath = "url";
      const expectedUpdatedUrl =
        "{{4efe5f693de34620934787ead6693f10.layer1.url}}";

      quickcapture._templatizeUrl(obj, idPath, urlPath);

      expect(common.getProp(obj, urlPath)).toEqual(expectedUpdatedUrl);
    });

    it("will not fail with missing datasource URL", () => {
      const obj = {
        featureServiceItemId: "4efe5f693de34620934787ead6693f10",
        dataSourceId: "1687a71b-cf77-48ed-b948-c66e228a0f74"
      };
      const idPath = "featureServiceItemId";
      const urlPath = "url";
      const expectedUpdatedUrl: string = undefined;

      quickcapture._templatizeUrl(obj, idPath, urlPath);

      expect(common.getProp(obj, urlPath)).toEqual(expectedUpdatedUrl);
    });

    it("postProcess QuickCapture projects--no changes needed", done => {
      const qcTemplate: common.IItemTemplate = templates.getItemTemplate(
        "QuickCapture Project"
      );
      const newItemId = qcTemplate.itemId;
      qcTemplate.item.id = newItemId;
      qcTemplate.item.extent = null;
      qcTemplate.item.licenseInfo =
        "https://abc12/apps/opsdashboard/index.html#/" +
        newItemId +
        "?areaname=";
      qcTemplate.data = {
        application: {
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
          itemId: newItemId,
          preferences: {
            adminEmail: "casey@esri.com"
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
          itemId: newItemId
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
        itemId: newItemId,
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

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            newItemId +
            "?f=json&token=fake-token",
          qcTemplate.item
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/" + newItemId + "/data",
          qcTemplate.data
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemId +
            "/updateResources",
          { success: true }
        );

      quickcapture
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
        }, done.fail);
    });

    it("postProcess QuickCapture projects--changes needed", done => {
      const qcTemplate: common.IItemTemplate = templates.getItemTemplate(
        "QuickCapture Project"
      );
      const newItemId = qcTemplate.itemId;
      qcTemplate.item.id = newItemId;
      qcTemplate.item.extent = null;
      qcTemplate.item.licenseInfo =
        "{{portalBaseUrl}}/apps/opsdashboard/index.html#/{{9da79c91fc7642ebb4c0bbacfbacd510.itemId}}?areaname=";
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
          itemId: newItemId
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
        itemId: newItemId,
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

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            newItemId +
            "?f=json&token=fake-token",
          qcTemplate.item
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/" + newItemId + "/data",
          qcTemplate.data
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemId +
            "/update",
          { success: true }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemId +
            "/updateResources",
          { success: true }
        );

      spyOn(console, "log").and.callFake(() => {});
      quickcapture
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
        }, done.fail);
    });
  });
});
