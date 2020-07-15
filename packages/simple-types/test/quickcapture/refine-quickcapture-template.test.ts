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
import * as fetchMock from "fetch-mock";
import * as refineHelpers from "../../src/quickcapture/refine-quick-capture-template";
import * as mockItems from "@esri/solution-common/test/mocks/agolItems";
import * as utils from "@esri/solution-common/test/mocks/utils";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

afterEach(() => {
  fetchMock.restore();
});

describe("refine quickcapture template :: ", () => {
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

      refineHelpers.refineQuickCaptureTemplate(itemTemplate).then(actual => {
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
      refineHelpers.refineQuickCaptureTemplate(itemTemplate).then(actual => {
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

    refineHelpers.refineQuickCaptureTemplate(itemTemplate).then(actual => {
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

      const updatedData = refineHelpers._templatizeApplication(data, null);

      expect(updatedData).toEqual(expectedUpdatedData);
    });
    it("works if datasources is null", () => {
      const data = {};
      const updatedData = refineHelpers._templatizeApplication(data, null);
      expect(updatedData).toEqual({});
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

      refineHelpers._templatizeUrl(obj, idPath, urlPath);

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

      refineHelpers._templatizeUrl(obj, idPath, urlPath);

      expect(common.getProp(obj, urlPath)).toEqual(expectedUpdatedUrl);
    });
  });
});
