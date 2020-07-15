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

describe("dashboard :: ", () => {
  describe("refineDashboardTemplate :: ", () => {
    it("should templatize webmap ids and external datasource ids", () => {
      const actualTemplate = refineHelpers.refineDashboardTemplate(
        initialDashboardTemplate
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

      const actualP: any = common.getProp(actualTemplate, "data.urlParameters");
      const expectedP: any = common.getProp(
        expectedTemplate,
        "data.urlParameters"
      );
      expect(actualP[4].datasets[0].dataSource.itemId).toEqual(
        expectedP[4].datasets[0].dataSource.itemId
      );
    });
  });

  describe("_extractDependencies", () => {
    if (typeof window !== "undefined") {
      it("should extract dependencies", () => {
        const actual = refineHelpers.refineDashboardTemplate(
          initialDashboardTemplate
        );
        expect(actual.dependencies).toEqual(expectedTemplate.dependencies);
      });
    }
  });

  describe("_getDatasourceDependencies", () => {
    it("handles defaulting to .itemId", () => {
      const obj: any = {
        dataSource: {
          itemId: "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.itemId}}"
        },
        datasets: [
          {
            dataSource: {
              itemId: "AAABBBCCC123"
            },
            type: "serviceDataset"
          },
          {
            dataSource: {
              itemId: "AAABBBCCC123"
            },
            type: "serviceDataset"
          }
        ]
      };

      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Dashboard"
      );

      expect(itemTemplate.dependencies).toEqual([]);
      refineHelpers._getDatasourceDependencies(obj, itemTemplate);
      expect(itemTemplate.dependencies).toEqual(["AAABBBCCC123"]);
    });
  });
});
