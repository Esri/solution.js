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
 * Provides tests for common functions involving the management of a dashboard item.
 */

import * as dashboard from "../src/dashboard";
import * as fetchMock from "fetch-mock";
import {
  createRuntimeMockUserSession,
  setMockDateTime
} from "../../common/test/mocks/utils";
import * as common from "../../common/src/generalHelpers";
import * as interfaces from "../../common/src/interfaces";
import * as staticMocks from "../../common/test/mocks/staticDashboardMocks";

const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
const now = date.getTime();

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

const MOCK_USER_SESSION = createRuntimeMockUserSession(setMockDateTime(now));

let initialDashboardTemplate: any;
let expectedTemplate: any;
let datasourceInfos: interfaces.IDatasourceInfo[];

beforeEach(() => {
  initialDashboardTemplate = common.cloneObject(
    staticMocks._initialDashboardTemplate
  );
  expectedTemplate = common.cloneObject(staticMocks.expectedTemplate);
  datasourceInfos = common.cloneObject(staticMocks.datasourceInfos);
});

afterEach(() => {
  fetchMock.restore();
});
// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `dashboard`: manages the creation and deployment of dashboard item type", () => {
  describe("convertItemToTemplate", () => {
    if (typeof window !== "undefined") {
      it("should templatize webmap ids and external datasource ids", () => {
        const actualTemplate = dashboard.convertItemToTemplate(
          initialDashboardTemplate,
          MOCK_USER_SESSION
        );

        const actualHS: any = common.getProp(
          actualTemplate,
          "data.headerPanel.selectors"
        );
        const expectedHS: any = common.getProp(
          expectedTemplate,
          "data.headerPanel.selectors"
        );
        expect(actualHS[4].datasets[0].dataSource.itemId).toEqual(
          expectedHS[4].datasets[0].dataSource.itemId
        );

        const actualLPS: any = common.getProp(
          actualTemplate,
          "data.leftPanel.selectors"
        );
        const expectedLPS: any = common.getProp(
          expectedTemplate,
          "data.leftPanel.selectors"
        );
        expect(actualLPS[0].datasets[0].dataSource.itemId).toEqual(
          expectedLPS[0].datasets[0].dataSource.itemId
        );
        expect(actualLPS[4].datasets[0].dataSource.itemId).toEqual(
          expectedLPS[4].datasets[0].dataSource.itemId
        );

        const actualW: any = common.getProp(actualTemplate, "data.widgets");
        const expectedW: any = common.getProp(expectedTemplate, "data.widgets");
        expect(actualW[0].itemId).toEqual(expectedW[0].itemId);
        expect(actualW[3].datasets[1].dataSource.itemId).toEqual(
          expectedW[3].datasets[1].dataSource.itemId
        );
        expect(actualW[3].datasets[2].dataSource.itemId).toEqual(
          expectedW[3].datasets[2].dataSource.itemId
        );
        expect(actualW[4].datasets[0].dataSource.itemId).toEqual(
          expectedW[4].datasets[0].dataSource.itemId
        );
        expect(actualW[6].datasets[0].dataSource.itemId).toEqual(
          expectedW[6].datasets[0].dataSource.itemId
        );
        expect(actualW[8].datasets[0].dataSource.itemId).toEqual(
          expectedW[8].datasets[0].dataSource.itemId
        );

        const actualP: any = common.getProp(
          actualTemplate,
          "data.urlParameters"
        );
        const expectedP: any = common.getProp(
          expectedTemplate,
          "data.urlParameters"
        );
        expect(actualP[4].datasets[0].dataSource.itemId).toEqual(
          expectedP[4].datasets[0].dataSource.itemId
        );
      });
    }
  });

  describe("_extractDependencies", () => {
    if (typeof window !== "undefined") {
      it("should extract dependencies", () => {
        const actual = dashboard._extractDependencies(initialDashboardTemplate);
        expect(actual.dependencies).toEqual(expectedTemplate.dependencies);
      });
    }
  });

  describe("_getDatasourceDependencies", () => {
    xit("_getDatasourceDependencies", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("postProcessFieldReferences", () => {
    it("should templatize field references", () => {
      // need to the dependencies
      const actual = dashboard.convertItemToTemplate(
        initialDashboardTemplate,
        MOCK_USER_SESSION
      );
      const actualTemplate: interfaces.IItemTemplate = dashboard.postProcessFieldReferences(
        actual,
        datasourceInfos
      );
      expect(actualTemplate).toEqual(expectedTemplate);
    });
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

      const dsInfos: interfaces.IDatasourceInfo[] = [
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

      dashboard._updateDatasourceReferences(objs, dsInfos);

      expect(dsInfos[0].references.length).toEqual(1);
      expect(dsInfos[0].references[0]).toEqual("map0");

      expect(dsInfos[1].references.length).toEqual(1);
      expect(dsInfos[1].references[0]).toEqual("map0");
    });
  });

  describe("_templatize", () => {
    xit("_templatize", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_templatizeByDatasource", () => {
    it("should handle undefined objects", () => {
      const actual: any = dashboard._templatizeByDatasource(undefined, []);
      expect(actual).toBeUndefined();
    });
  });

  describe("_getDatasourceInfo", () => {
    xit("_getDatasourceInfo", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_updateReferences", () => {
    xit("_updateReferences", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });
});
