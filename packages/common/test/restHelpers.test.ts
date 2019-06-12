/** @license
 * Copyright 2018 Esri
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
 * Provides tests for functions involving the arcgis-rest-js library.
 */

import * as auth from "@esri/arcgis-rest-auth";
import * as portal from "@esri/arcgis-rest-portal";
import * as restHelpers from "../src/restHelpers";

import { TOMORROW } from "./lib/utils";
import * as fetchMock from "fetch-mock";

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `restHelpers`: simplifies access to the arcgis-rest-js library", () => {
  // Set up a UserSession to use in all of these tests
  const MOCK_USER_SESSION = new auth.UserSession({
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

  const MOCK_USER_REQOPTS: auth.IUserRequestOptions = {
    authentication: MOCK_USER_SESSION,
    portal: "https://myorg.maps.arcgis.com/sharing/rest"
  };

  afterEach(() => {
    fetchMock.restore();
  });

  describe("getItemData", () => {
    it("item doesn't allow access", done => {
      const itemId = "itm1234567890";
      const expected = {
        name: "ArcGISAuthError",
        message:
          "GWM_0003: You do not have permissions to access this resource or perform this operation.",
        originalMessage:
          "You do not have permissions to access this resource or perform this operation.",
        code: "GWM_0003",
        response: {
          error: {
            code: 403,
            messageCode: "GWM_0003",
            message:
              "You do not have permissions to access this resource or perform this operation.",
            details: [] as any[]
          }
        },
        url:
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/data?f=json&token=fake-token",
        options: {
          httpMethod: "GET",
          params: {
            f: "json"
          },
          authentication: {
            clientId: "clientId",
            refreshToken: "refreshToken",
            refreshTokenExpires: "2019-06-13T19:35:21.995Z",
            username: "casey",
            password: "123456",
            token: "fake-token",
            tokenExpires: "2019-06-13T19:35:21.995Z",
            portal: "https://myorg.maps.arcgis.com/sharing/rest",
            tokenDuration: 20160,
            redirectUri: "https://example-app.com/redirect-uri",
            refreshTokenTTL: 1440
          },
          headers: {}
        }
      };

      fetchMock.get(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/data?f=json&token=fake-token",
        JSON.stringify(expected)
      );
      restHelpers
        .getItemData(itemId, MOCK_USER_REQOPTS)
        .then((response: any) => {
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });

    it("item doesn't have data", done => {
      const itemId = "itm1234567890";
      const expected = {};

      fetchMock.get(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/data?f=json&token=fake-token",
        {}
      );
      restHelpers
        .getItemData(itemId, MOCK_USER_REQOPTS)
        .then((response: any) => {
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });

    it("item has data", done => {
      const itemId = "itm1234567890";
      const expected = { values: { a: 1, b: "c" } };

      fetchMock.get(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/data?f=json&token=fake-token",
        JSON.stringify(expected)
      );
      restHelpers
        .getItemData(itemId, MOCK_USER_REQOPTS)
        .then((response: any) => {
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });
  });

  describe("getItemRelatedItems", () => {
    it("item doesn't have related items of a single type", done => {
      const itemId = "itm1234567890";
      const relationshipType = "Survey2Service";
      const direction = "forward";
      const expected = { total: 0, relatedItems: [] as any[] };

      fetchMock.get(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/relatedItems" +
          "?f=json&direction=forward&relationshipType=Survey2Service&token=fake-token",
        expected
      );
      restHelpers
        .getItemRelatedItems(
          itemId,
          relationshipType,
          direction,
          MOCK_USER_REQOPTS
        )
        .then((response: any) => {
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });

    it("item doesn't have related items of multiple types", done => {
      const itemId = "itm1234567890";
      const relationshipType: portal.ItemRelationshipType[] = [
        "Survey2Service",
        "Service2Service"
      ];
      const direction = "reverse";
      const expected = { total: 0, relatedItems: [] as any[] };

      fetchMock.get(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/relatedItems" +
          "?f=json&direction=reverse&relationshipTypes=Survey2Service%2CService2Service&token=fake-token",
        expected
      );
      restHelpers
        .getItemRelatedItems(
          itemId,
          relationshipType,
          direction,
          MOCK_USER_REQOPTS
        )
        .then((response: any) => {
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });

    it("item has one related item", done => {
      const itemId = "itm1234567890";
      const relationshipType = "Survey2Service";
      const direction = "forward";
      const expected = {
        total: 1,
        relatedItems: [
          {
            id: "471e7500ab364db5a4f074c704962650",
            owner: "LocalGovDeployment",
            created: 1496669363000,
            modified: 1529597522000,
            guid: null as any,
            name: "service_75b7efa1d3cf4618b0508e66bc2539ae",
            title: "Drug Activity Reporter",
            type: "Feature Service",
            typeKeywords: [
              "ArcGIS Server",
              "Data",
              "Feature Access",
              "Feature Service",
              "Service",
              "Singlelayer",
              "source-010915baf8104a6e9103b4f625160581",
              "Hosted Service"
            ],
            description:
              "Suspected drug activity reported by the general public.",
            tags: [
              "Opioids",
              "Public Safety",
              "Drug Activity",
              "Community Policing",
              "Drug Tips",
              "Police",
              "Law Enforcement"
            ],
            snippet: "Suspected drug activity reported by the general public.",
            thumbnail: "thumbnail/Drug-Activity-Reporter.png",
            documentation: null as any,
            extent: [
              [-131.83000000020434, 16.22999999995342],
              [-57.119999999894105, 58.49999999979133]
            ],
            categories: [] as string[],
            spatialReference: null as any,
            accessInformation: "Esri",
            licenseInfo: null as any,
            culture: "",
            properties: null as any,
            url:
              "https://services7.arcgis.com/piPfTFmr/arcgis/rest/services/service_75b7efa1d3cf/FeatureServer",
            proxyFilter: null as any,
            access: "public",
            size: 180224,
            appCategories: [] as string[],
            industries: [] as string[],
            languages: [] as string[],
            largeThumbnail: null as any,
            banner: null as any,
            screenshots: [] as string[],
            listed: false,
            numComments: 0,
            numRatings: 0,
            avgRating: 0,
            numViews: 610,
            scoreCompleteness: 70,
            groupDesignations: null as any
          }
        ]
      };

      fetchMock.get(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/relatedItems" +
          "?f=json&direction=forward&relationshipType=Survey2Service&token=fake-token",
        expected
      );
      restHelpers
        .getItemRelatedItems(
          itemId,
          relationshipType,
          direction,
          MOCK_USER_REQOPTS
        )
        .then((response: any) => {
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });
  });
});
