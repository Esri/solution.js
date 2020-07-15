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
 * Provides tests for functions involving the creation and deployment of Dashboard item types.
 */

import * as common from "@esri/solution-common";

import * as staticMocks from "@esri/solution-common/test/mocks/staticDashboardMocks";
import * as postProcessHelpers from "../../src/dashboard/post-process-dashboard-field-references";
import * as dashboardProcessor from "../../src/dashboard/dashboard-processor";
import * as refineHelpers from "../../src/dashboard/refine-dashboard-template";
import * as utils from "@esri/solution-common/test/mocks/utils";
import * as templates from "@esri/solution-common/test/mocks/templates";

const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
const now = date.getTime();

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

let initialDashboardTemplate: any;
let expectedTemplate: any;
let datasourceInfos: common.IDatasourceInfo[];

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

  initialDashboardTemplate = common.cloneObject(
    staticMocks._initialDashboardTemplate
  );
  expectedTemplate = common.cloneObject(staticMocks.expectedTemplate);
  datasourceInfos = common.cloneObject(staticMocks.datasourceInfos);
});

describe("dashboard :: postProcessDashboardFieldReferences", () => {
  it("should templatize field references", () => {
    const actual = refineHelpers.refineDashboardTemplate(
      initialDashboardTemplate
    );
    const actualTemplate: common.IItemTemplate = postProcessHelpers.postProcessDashboardFieldReferences(
      actual,
      datasourceInfos
    );
    expect(actualTemplate).toEqual(expectedTemplate);
  });

  describe("_updateDatasourceReferences", () => {
    it("_updateDatasourceReferences", () => {
      const objs: any[] = [
        {
          id: "map0",
          datasets: [
            {
              dataSource: {
                itemId: "AAABBBCCC123",
                layerId: 1
              },
              type: "serviceDataset"
            },
            {
              dataSource: {
                itemId: "AAABBBCCC123",
                layerId: 0
              },
              type: "serviceDataset"
            }
          ]
        }
      ];

      const dsInfos: common.IDatasourceInfo[] = [
        {
          basePath: "",
          itemId: "AAABBBCCC123",
          ids: [],
          layerId: 0,
          fields: [],
          relationships: [],
          adminLayerInfo: {}
        },
        {
          basePath: "",
          itemId: "AAABBBCCC123",
          ids: [],
          layerId: 1,
          fields: [],
          relationships: [],
          adminLayerInfo: {}
        }
      ];

      postProcessHelpers._updateDatasourceReferences(objs, dsInfos);

      expect(dsInfos[0].references.length).toEqual(1);
      expect(dsInfos[0].references[0]).toEqual("map0");

      expect(dsInfos[1].references.length).toEqual(1);
      expect(dsInfos[1].references[0]).toEqual("map0");
    });
  });

  describe("_templatizeByDatasource", () => {
    it("ignores supplied objs if it is not defined", () => {
      const updatedList = postProcessHelpers._templatizeByDatasource(
        null,
        null
      );
      expect(updatedList).toBeNull();
    });
  });
  describe("_getDatasourceInfo", () => {
    it("handles dataSource.id", () => {
      const obj: any = {
        dataSource: {
          id: "widget#id"
        }
      };

      const dsInfos: common.IDatasourceInfo[] = [
        {
          basePath: "",
          itemId: "AAABBBCCC123",
          ids: ["id"],
          layerId: 0,
          fields: [],
          relationships: [],
          adminLayerInfo: {}
        },
        {
          basePath: "",
          itemId: "AAABBBCCC123",
          ids: [],
          layerId: 1,
          fields: [],
          relationships: [],
          adminLayerInfo: {}
        }
      ];

      const info = postProcessHelpers._getDatasourceInfo(obj, dsInfos);
      expect(info).toEqual(dsInfos[0]);
    });

    it("handles dataSource.id without match in datasourceInfos", () => {
      const obj: any = {
        dataSource: {
          id: "widget#id"
        }
      };

      const dsInfos: common.IDatasourceInfo[] = [
        {
          basePath: "",
          itemId: "AAABBBCCC123",
          ids: [],
          layerId: 0,
          fields: [],
          relationships: [],
          adminLayerInfo: {}
        },
        {
          basePath: "",
          itemId: "AAABBBCCC123",
          ids: [],
          layerId: 1,
          fields: [],
          relationships: [],
          adminLayerInfo: {}
        }
      ];

      const info = postProcessHelpers._getDatasourceInfo(obj, dsInfos);
      expect(info).toBeUndefined();
    });

    it("handles dataSource.itemId", () => {
      const obj: any = {
        dataSource: {
          itemId: "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.itemId}}",
          layerId: "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.layerId}}"
        }
      };

      const dsInfos: common.IDatasourceInfo[] = [
        {
          basePath: "",
          itemId: "AAABBBCCC123",
          ids: [],
          layerId: 0,
          fields: [],
          relationships: [],
          adminLayerInfo: {}
        },
        {
          basePath: "",
          itemId: "AAABBBCCC123",
          ids: [],
          layerId: 1,
          fields: [],
          relationships: [],
          adminLayerInfo: {}
        }
      ];

      const info = postProcessHelpers._getDatasourceInfo(obj, dsInfos);
    });
  });
});
