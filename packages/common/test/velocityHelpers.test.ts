/** @license
 * Copyright 2021 Esri
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

import * as mockItems from "../test/mocks/agolItems";
import { getVelocityInfo, updateVelocityReferences } from "../src/velocityHelpers";
import * as utils from "./mocks/utils";
import * as interfaces from "../src/interfaces";
import * as fetchMock from "fetch-mock";

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

afterEach(() => {
  fetchMock.restore();
});

describe("Module `velocityHelpers`: common functions", () => {
  describe("updateVelocityReferences", () => {
    it("defaults to a version 0 solution", () => {
      const type: string = "Web Map";
      const data: any = mockItems.getAGOLItemData(type);

      const subscriptionInfo: any = mockItems.getAGOLSubscriptionInfo(true);
      const velocityUrl: string = subscriptionInfo.orgCapabilities[0].velocityUrl;
      const templateDictionary = {
        velocityUrl,
      };

      data.operationalLayers.push({
        id: "ROWPermitApplication_4605",
        layerType: "ArcGISFeatureLayer",
        url: `${velocityUrl}/maps/arcgis/rest/services/RouteStatus/FeatureServer/0`,
        title: "ROW Permits",
        itemId: "svc1234567890",
        popupInfo: {},
        capabilities: "Query",
      });

      const actual: any = updateVelocityReferences(data, type, templateDictionary);
      const opLayer: any = actual.operationalLayers[1];
      const expected: string =
        "{{velocityUrl}}/maps/arcgis/rest/services/RouteStatus_{{solutionItemId}}/FeatureServer/0";
      expect(opLayer.url).toEqual(expected);
      expect(opLayer.itemId).toBeUndefined();
    });
  });

  describe("getVelocityInfo", () => {
    it("handles missing velocity id", async () => {
      const subscriptionInfo: any = mockItems.getAGOLSubscriptionInfo(false);
      fetchMock.get(
        "https://myorg.maps.arcgis.com/sharing/rest/portals/self/subscriptioninfo?f=json&token=fake-token",
        subscriptionInfo,
      );

      const actual = await getVelocityInfo(MOCK_USER_SESSION);
      expect(actual.velocityUrl).toEqual("");
      expect(actual.hasVelocity).toEqual(false);
    });
  });
});
