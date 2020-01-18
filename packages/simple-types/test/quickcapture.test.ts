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
 * Provides tests for common functions involving the management of item and group resources.
 */

import * as common from "@esri/solution-common";
import * as quickcapture from "../src/quickcapture";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as fetchMock from "fetch-mock";

import { TOMORROW } from "../../common/test/mocks/utils";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

// Set up a UserSession to use in all these tests
const MOCK_USER_SESSION = new common.UserSession({
  clientId: "clientId",
  redirectUri: "https://example-app.com/redirect-uri",
  token: "fake-token",
  tokenExpires: TOMORROW,
  refreshToken: "refreshToken",
  refreshTokenExpires: TOMORROW,
  refreshTokenTTL: 1440,
  username: "casey",
  password: "123456",
  portal: "https://myorg.maps.arcgis.com/sharing/rest"
});

afterEach(() => {
  fetchMock.restore();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `quick capture`: manages the creation and deployment of quick capture project item types", () => {
  describe("convertItemToTemplate", () => {
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

      quickcapture.convertItemToTemplate(itemTemplate).then(actual => {
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
      quickcapture.convertItemToTemplate(itemTemplate).then(actual => {
        expect(actual).toEqual(itemTemplate);
        done();
      }, done.fail);
    });
  });
});
