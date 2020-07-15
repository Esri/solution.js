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

import * as dashboardProcessor from "../../src/dashboard/dashboard-processor";
import * as common from "@esri/solution-common";
import * as convertGenericHelper from "../../src/helpers/convert-generic-item-to-template";
import * as staticMocks from "@esri/solution-common/test/mocks/staticDashboardMocks";
import * as refineHelpers from "../../src/dashboard/refine-dashboard-template";
import * as utils from "@esri/solution-common/test/mocks/utils";
import * as createHelper from "../../src/helpers/create-item-from-template";

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

describe("dashboardProcessor :: ", () => {
  describe("convertItemToTemplate :: ", () => {
    it("should call generic converter then call dashboard logic", () => {
      const convertSpy = spyOn(
        convertGenericHelper,
        "convertGenericItemToTemplate"
      ).and.resolveTo();

      const refineSpy = spyOn(
        refineHelpers,
        "refineDashboardTemplate"
      ).and.resolveTo();

      return dashboardProcessor
        .convertItemToTemplate("3ef", {}, MOCK_USER_SESSION)
        .then(() => {
          expect(convertSpy.calls.count()).toBe(
            1,
            "should call generic converter"
          );
          expect(refineSpy.calls.count()).toBe(
            1,
            "should call QC specific converter"
          );
        });
    });
  });

  describe("postProcessFieldReferences", () => {
    it("should templatize field references", () => {
      // need to the dependencies
      const actual = refineHelpers.refineDashboardTemplate(
        initialDashboardTemplate
      );
      const actualTemplate: common.IItemTemplate = dashboardProcessor.postProcessFieldReferences(
        actual,
        datasourceInfos,
        "Dashboard"
      );
      expect(actualTemplate).toEqual(expectedTemplate);
    });
  });

  describe("createItemFromTemplate :: ", () => {
    it("delegated to helper", () => {
      const createSpy = spyOn(
        createHelper,
        "createItemFromTemplate"
      ).and.resolveTo();
      const cb = (): boolean => {
        return true;
      };
      return dashboardProcessor
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
});
