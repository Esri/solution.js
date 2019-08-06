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
 * Provides tests for common functions involving the management of item and group resources.
 */

import * as auth from "@esri/arcgis-rest-auth";
import * as common from "@esri/solution-common";
import * as webmappingapplication from "../src/webmappingapplication";

import { TOMORROW } from "./lib/utils";
import * as fetchMock from "fetch-mock";

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `webmappingapplication`: manages the creation and deployment of web mapping application item types", () => {
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

  afterEach(() => {
    fetchMock.restore();
  });

  describe("convertItemToTemplate", () => {
    it("just webmap data", () => {
      const model = {
        itemId: "itm1234567890",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: { title: "Voting Centers" } as any,
        data: { values: { webmap: "myMapId" } },
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "itm1234567890",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: { title: "Voting Centers" } as any,
        data: { values: { webmap: "{{myMapId.id}}" } },
        resources: [] as any[],
        dependencies: ["myMapId"],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const actual = webmappingapplication.convertItemToTemplate(model);
      expect(actual).toEqual(expected);
    });
    it("just group data", () => {
      const model = {
        itemId: "itm1234567890",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: { title: "Voting Centers" } as any,
        data: { values: { group: "myGroupId" } },
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "itm1234567890",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: { title: "Voting Centers" } as any,
        data: { values: { group: "{{myGroupId.id}}" } },
        resources: [] as any[],
        dependencies: ["myGroupId"],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const actual = webmappingapplication.convertItemToTemplate(model);
      expect(actual).toEqual(expected);
    });
    it("neither webmap nor group", () => {
      const model = {
        itemId: "itm1234567890",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.id}}",
          title: "Voting Centers",
          url:
            "http://anOrg.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=itm1234567890"
        } as any,
        data: {
          folderId: "fld1234567890"
        } as any,
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "itm1234567890",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.id}}",
          title: "Voting Centers",
          url:
            "{{organization.portalBaseUrl}}/apps/CrowdsourcePolling/index.html?appid={{itm1234567890.id}}"
        } as any,
        data: {
          folderId: "{{folderId}}"
        } as any,
        resources: [] as any[],
        dependencies: [] as any[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const actual = webmappingapplication.convertItemToTemplate(model);
      expect(actual).toEqual(expected);
    });
  });

  describe("getWABDependencies", () => {
    it("handles no keywords", () => {
      const model = {
        data: { values: { prop1: "1", prop2: "2", webmap: "myMapId" } }
      };
      const expected = ["myMapId"];
      const actual = webmappingapplication.extractDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles no WAB keywords", () => {
      const model = {
        typeKeywords: ["Web Map"],
        data: { values: { prop1: "1", prop2: "2", webmap: "myMapId" } }
      };
      const expected = ["myMapId"];
      const actual = webmappingapplication.extractDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles WAB2D", () => {
      const model = {
        typeKeywords: ["WAB2D"],
        data: { map: { itemId: "abc" } }
      };
      const expected = ["abc"];
      const actual = webmappingapplication.extractDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles Web AppBuilder", () => {
      const model = {
        typeKeywords: ["Government", "Web AppBuilder"],
        data: { map: { itemId: "abc" } }
      };
      const expected = ["abc"];
      const actual = webmappingapplication.extractDependencies(model);
      expect(actual).toEqual(expected);
    });
  });

  describe("getGenericWebAppDependencies", () => {
    it("handles null", () => {
      const model: any = null;
      const expected = [] as string[];
      const actual = webmappingapplication.getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles empty model", () => {
      const model = {};
      const expected = [] as string[];
      const actual = webmappingapplication.getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model without data", () => {
      const model = { data: {} };
      const expected = [] as string[];
      const actual = webmappingapplication.getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model without values", () => {
      const model = { data: { values: {} } };
      const expected = [] as string[];
      const actual = webmappingapplication.getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model without webmap or group", () => {
      const model = { data: { values: { prop1: "1", prop2: "2" } } };
      const expected = [] as string[];
      const actual = webmappingapplication.getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model with webmap", () => {
      const model = {
        data: { values: { prop1: "1", prop2: "2", webmap: "myMapId" } }
      };
      const expected = ["myMapId"];
      const actual = webmappingapplication.getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model with group", () => {
      const model = {
        data: { values: { prop1: "1", prop2: "2", group: "myGroupId" } }
      };
      const expected = ["myGroupId"];
      const actual = webmappingapplication.getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model with both webmap and group", () => {
      const model = {
        data: {
          values: {
            group: "myGroupId",
            prop1: "1",
            webmap: "myMapId",
            prop2: "2"
          }
        }
      };
      const expected = ["myMapId", "myGroupId"];
      const actual = webmappingapplication.getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });
  });

  describe("getWABDependencies", () => {
    it("handles null", () => {
      const model: any = null;
      const expected = [] as string[];
      const actual = webmappingapplication.getWABDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles empty model", () => {
      const model = {};
      const expected = [] as string[];
      const actual = webmappingapplication.getWABDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model without data", () => {
      const model = { data: {} };
      const expected = [] as string[];
      const actual = webmappingapplication.getWABDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model with similar but unmatching path", () => {
      const model = { data: { itemId: "abc" } };
      const expected = [] as string[];
      const actual = webmappingapplication.getWABDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model with matching path", () => {
      const model = { data: { map: { itemId: "abc" } } };
      const expected = ["abc"];
      const actual = webmappingapplication.getWABDependencies(model);
      expect(actual).toEqual(expected);
    });
  });

  describe("create Code Attachment", () => {
    it("doesn't create a corresponding Code Attachment when it deploys a non-WAB app", done => {
      const originalTemplate = {
        itemId: "itm1234567890",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: {
          tags: [
            "Early Voting",
            "Voting",
            "Polling Places",
            "Ballots",
            "Secretary of State",
            "Voting Centers"
          ],
          title: "Voting Centers",
          typeKeywords: ["Map", "Mapping Site", "Online Map"]
        } as any,
        data: {} as any,
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      } as common.IItemTemplate;
      const newlyCreatedItem = {
        itemId: "wab1234567890",
        type: "Web Mapping Application",
        key: "ijklmnop",
        item: {
          tags: [
            "Early Voting",
            "Voting",
            "Polling Places",
            "Ballots",
            "Secretary of State",
            "Voting Centers"
          ],
          title: "Voting Centers",
          typeKeywords: ["Map", "Mapping Site", "Online Map"]
        } as any,
        data: {} as any,
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      } as common.IItemTemplate;
      const templateDictionary = {
        folderId: "fld1234567890"
      };

      const createUrl =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem";
      const expected = {
        success: true,
        id: "cda1234567890",
        folder: "fld1234567890"
      };
      fetchMock.post(createUrl, expected);

      // Function doesn't reject, so,
      // tslint:disable-next-line:no-floating-promises
      webmappingapplication
        .fineTuneCreatedItem(
          originalTemplate,
          newlyCreatedItem,
          templateDictionary,
          MOCK_USER_SESSION
        )
        .then(() => {
          const calls = fetchMock.calls(createUrl);
          expect(calls.length).toEqual(0);
          done();
        });
    });

    it("creates a corresponding Code Attachment when it deploys a WAB app", done => {
      const originalTemplate = {
        itemId: "itm1234567890",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: {
          tags: [
            "Early Voting",
            "Voting",
            "Polling Places",
            "Ballots",
            "Secretary of State",
            "Voting Centers"
          ],
          title: "Voting Centers",
          typeKeywords: [
            "Map",
            "Mapping Site",
            "Online Map",
            "WAB2D",
            "Web AppBuilder"
          ]
        } as any,
        data: {} as any,
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      } as common.IItemTemplate;
      const newlyCreatedItem = {
        itemId: "wab1234567890",
        type: "Web Mapping Application",
        key: "ijklmnop",
        item: {
          tags: [
            "Early Voting",
            "Voting",
            "Polling Places",
            "Ballots",
            "Secretary of State",
            "Voting Centers"
          ],
          title: "Voting Centers",
          typeKeywords: [
            "Map",
            "Mapping Site",
            "Online Map",
            "WAB2D",
            "Web AppBuilder"
          ]
        } as any,
        data: {} as any,
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      } as common.IItemTemplate;
      const templateDictionary = {
        folderId: "fld1234567890"
      };

      const createUrl =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/fld1234567890/addItem";
      const expected = {
        success: true,
        id: "cda1234567890",
        folder: "fld1234567890"
      };
      fetchMock.post(createUrl, expected);

      // Function doesn't reject, so,
      // tslint:disable-next-line:no-floating-promises
      webmappingapplication
        .fineTuneCreatedItem(
          originalTemplate,
          newlyCreatedItem,
          templateDictionary,
          MOCK_USER_SESSION
        )
        .then(() => {
          const calls = fetchMock.calls(createUrl);
          expect(calls.length).toEqual(1);
          done();
        });
    });

    it("handles fineTuneCreatedItem failure", done => {
      const originalTemplate = {
        itemId: "itm1234567890",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: {
          tags: [
            "Early Voting",
            "Voting",
            "Polling Places",
            "Ballots",
            "Secretary of State",
            "Voting Centers"
          ],
          title: "Voting Centers",
          typeKeywords: [
            "Map",
            "Mapping Site",
            "Online Map",
            "WAB2D",
            "Web AppBuilder"
          ]
        } as any,
        data: {} as any,
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      } as common.IItemTemplate;
      const newlyCreatedItem = {
        itemId: "wab1234567890",
        type: "Web Mapping Application",
        key: "ijklmnop",
        item: {
          tags: [
            "Early Voting",
            "Voting",
            "Polling Places",
            "Ballots",
            "Secretary of State",
            "Voting Centers"
          ],
          title: "Voting Centers",
          typeKeywords: [
            "Map",
            "Mapping Site",
            "Online Map",
            "WAB2D",
            "Web AppBuilder"
          ]
        } as any,
        data: {} as any,
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      } as common.IItemTemplate;
      const templateDictionary = {
        folderId: "fld1234567890"
      };

      const createUrl =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/fld1234567890/addItem";
      const expected = {
        success: false
      };
      fetchMock.post(createUrl, expected);

      webmappingapplication
        .fineTuneCreatedItem(
          originalTemplate,
          newlyCreatedItem,
          templateDictionary,
          MOCK_USER_SESSION
        )
        .then(
          () => {
            const calls = fetchMock.calls(createUrl);
            expect(calls.length).toEqual(1);
            done();
          },
          () => {
            const calls = fetchMock.calls(createUrl);
            expect(calls.length).toEqual(1);
            done();
          }
        );
    });
  });
});
