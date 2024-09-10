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

const fetchMock = require("fetch-mock");
import * as interfaces from "../src/interfaces";
import * as utils from "./mocks/utils";
import {
  findReusableSolutionsAndItems,
  getDeployedSolutions,
  getDeployedSolutionsAndItems,
  getIdsFromSolutionTemplates,
  getItemHash,
} from "../src/item-reuse";

// ------------------------------------------------------------------------------------------------------------------ //

let MOCK_USER_SESSION: interfaces.UserSession;
beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

afterEach(() => {
  fetchMock.restore();
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

describe("Module `item-reuse`: functions to find reusable items and solutions", () => {
  describe("getDeployedSolutionsAndItems", () => {
    it("gets all deployed solutions and their items", async() => {
      const portal = MOCK_USER_SESSION.portal;
      const user = MOCK_USER_SESSION.username;

      const solutionAId = "aaa12006b49746a99127cef12ab61e85";
      const solutionBId = "bbb12006b49746a99127cef12ab61e85";
      const solutionCId = "ccc12006b49746a99127cef12ab61e85";

      const searchResults = {
        results: [
          {
            id: solutionAId,
            created: 1719430833000,
            title: "A",
            typeKeywords: ["solutionversion-1.0"],
          },
          {
            id: solutionCId,
            created: 1819430834000,
            title: "C",
            typeKeywords: [],
          },
          {
            id: solutionBId,
            created: 1919430834000,
            title: "B",
            typeKeywords: ["solutionversion-2.0"],
          },
        ],
      };

      const itemAData = {
        templates: [
          {
            itemId: "ca28a56f0bc141958466b6a3b17afda7",
            type: "Feature Service",
          },
          {
            itemId: "aaa8a56f0bc141958466b6a3b17afda7",
            type: "Feature Service",
          },
        ],
      };

      const itemBData = {
        templates: [
          {
            itemId: "ca28a56f0bc141958466b6a3b17afda7",
            type: "Feature Service",
          },
          {
            itemId: "bbb8a56f0bc141958466b6a3b17afda7",
            type: "Feature Service",
          },
        ],
      };

      const itemCData = {
        templates: [
          {
            itemId: "ca28a56f0bc141958466b6a3b17afda7",
            type: "Feature Service",
          },
          {
            itemId: "ccc8a56f0bc141958466b6a3b17afda7",
            type: "Feature Service",
          },
        ],
      };

      const expected = {
        aaa12006b49746a99127cef12ab61e85: {
          templates: ["ca28a56f0bc141958466b6a3b17afda7", "aaa8a56f0bc141958466b6a3b17afda7"],
          solutionInfo: {
            created: 1719430833000,
            title: "A",
            version: "solutionversion-1.0",
          },
        },
        bbb12006b49746a99127cef12ab61e85: {
          templates: ["ca28a56f0bc141958466b6a3b17afda7", "bbb8a56f0bc141958466b6a3b17afda7"],
          solutionInfo: {
            created: 1919430834000,
            title: "B",
            version: "solutionversion-2.0",
          },
        },
        ccc12006b49746a99127cef12ab61e85: {
          templates: ["ca28a56f0bc141958466b6a3b17afda7", "ccc8a56f0bc141958466b6a3b17afda7"],
          solutionInfo: {
            created: 1819430834000,
            title: "C",
            version: "",
          },
        },
      };

      fetchMock
        .get(
          `${portal}/search?f=json&q=owner%3A${user}%20AND%20type%3ASolution%20AND%20typekeywords%3ADeployed&num=100&token=fake-token`,
          searchResults,
        )
        .get(`${portal}/content/items/${solutionAId}/data?f=json&token=fake-token`, itemAData)
        .get(`${portal}/content/items/${solutionBId}/data?f=json&token=fake-token`, itemBData)
        .get(`${portal}/content/items/${solutionCId}/data?f=json&token=fake-token`, itemCData);

      const actual = await getDeployedSolutionsAndItems(MOCK_USER_SESSION);
      expect(actual).toEqual(expected);
    });
  });

  describe("getIdsFromSolutionTemplates", () => {
    it("gets all deployed solutions and their items", async() => {
      const portal = MOCK_USER_SESSION.portal;

      const id = "aaa12006b49746a99127cef12ab61e85";

      const data = {
        templates: [
          {
            itemId: "ca28a56f0bc141958466b6a3b17afda7",
            type: "Feature Service",
          },
          {
            itemId: "aaa8a56f0bc141958466b6a3b17afda7",
            type: "Feature Service",
          },
          {
            itemId: "bbb8a56f0bc141958466b6a3b17afda7",
            type: "Feature Service",
          },
          {
            itemId: "ccc8a56f0bc141958466b6a3b17afda7",
            type: "Feature Service",
          },
        ],
      };

      const expected = [
        "ca28a56f0bc141958466b6a3b17afda7",
        "aaa8a56f0bc141958466b6a3b17afda7",
        "bbb8a56f0bc141958466b6a3b17afda7",
        "ccc8a56f0bc141958466b6a3b17afda7",
      ];

      fetchMock.get(`${portal}/content/items/${id}/data?f=json&token=fake-token`, data);

      const actual = await getIdsFromSolutionTemplates(id, MOCK_USER_SESSION);
      expect(actual).toEqual(expected);
    });
  });

  describe("getItemHash", () => {
    it("finds deployed solution items that were based on a source item", async() => {
      const portal = MOCK_USER_SESSION.portal;
      const user = MOCK_USER_SESSION.username;

      const id = "aaa12006b49746a99127cef12ab61e85";

      const itemA = "ca28a56f0bc141958466b6a3b17afda7";
      const itemB = "aaa8a56f0bc141958466b6a3b17afda7";

      const solutionTemplatesData = {
        templates: [
          {
            itemId: "ca28a56f0bc141958466b6a3b17afda7",
            type: "Feature Service",
          },
          {
            itemId: "aaa8a56f0bc141958466b6a3b17afda7",
            type: "Feature Service",
          },
        ],
      };

      const resultAId = "rca28a56f0bc141958466b6a3b17afda";
      const resultBId = "raaa8a56f0bc141958466b6a3b17afda";

      const dataA = {
        results: [
          {
            created: 1719003517000,
            id: resultAId,
            title: "A",
            type: "Feature Service",
          },
        ],
      };

      const dataB = {
        results: [
          {
            created: 1719003505000,
            id: resultBId,
            title: "B",
            type: "Web Map",
          },
        ],
      };

      const expected = {
        ca28a56f0bc141958466b6a3b17afda7: {
          rca28a56f0bc141958466b6a3b17afda: {
            created: 1719003517000,
            solutions: {},
            title: "A",
            type: "Feature Service",
          },
        },
        aaa8a56f0bc141958466b6a3b17afda7: {
          raaa8a56f0bc141958466b6a3b17afda: {
            created: 1719003505000,
            solutions: {},
            title: "B",
            type: "Web Map",
          },
        },
      };

      fetchMock
        .get(`${portal}/content/items/${id}/data?f=json&token=fake-token`, solutionTemplatesData)
        .get(`${portal}/search?f=json&q=typekeywords%3Asource-${itemA}%20owner%3A${user}&token=fake-token`, dataA)
        .get(`${portal}/search?f=json&q=typekeywords%3Asource-${itemB}%20owner%3A${user}&token=fake-token`, dataB);

      const actual = await getItemHash(id, MOCK_USER_SESSION);
      expect(actual).toEqual(expected);
    });

    it("handles missing deployed solution item", async() => {
      const portal = MOCK_USER_SESSION.portal;
      const user = MOCK_USER_SESSION.username;

      const id = "aaa12006b49746a99127cef12ab61e85";

      const itemA = "ca28a56f0bc141958466b6a3b17afda7";
      const itemB = "aaa8a56f0bc141958466b6a3b17afda7";

      const solutionTemplatesData = {
        templates: [
          {
            itemId: "ca28a56f0bc141958466b6a3b17afda7",
            type: "Feature Service",
          },
          {
            itemId: "aaa8a56f0bc141958466b6a3b17afda7",
            type: "Feature Service",
          },
        ],
      };

      const resultAId = "rca28a56f0bc141958466b6a3b17afda";

      const dataA = {
        results: [
          {
            created: 1719003517000,
            id: resultAId,
            title: "A",
            type: "Feature Service",
          },
        ],
      };

      const dataB = {
        results: [],
      };

      const expected = {
        ca28a56f0bc141958466b6a3b17afda7: {
          rca28a56f0bc141958466b6a3b17afda: {
            created: 1719003517000,
            solutions: {},
            title: "A",
            type: "Feature Service",
          },
        },
        aaa8a56f0bc141958466b6a3b17afda7: {},
      };

      fetchMock
        .get(`${portal}/content/items/${id}/data?f=json&token=fake-token`, solutionTemplatesData)
        .get(`${portal}/search?f=json&q=typekeywords%3Asource-${itemA}%20owner%3A${user}&token=fake-token`, dataA)
        .get(`${portal}/search?f=json&q=typekeywords%3Asource-${itemB}%20owner%3A${user}&token=fake-token`, dataB);

      const actual = await getItemHash(id, MOCK_USER_SESSION);
      expect(actual).toEqual(expected);
    });
  });

  describe("findReusableSolutionsAndItems", () => {
    it("finds deployed solution items and solutions", async() => {
      const portal = MOCK_USER_SESSION.portal;
      const user = MOCK_USER_SESSION.username;

      const id = "sol12006b49746a99127cef12ab61e85";

      const itemA = "itm8a56f0bc141958466b6a3b17afda7";
      const itemB = "itm2a56f0bc141958466b6a3b17afda7";

      const solutionTemplatesData = {
        templates: [
          {
            itemId: itemA,
            type: "Feature Service",
          },
          {
            itemId: itemB,
            type: "Feature Service",
          },
        ],
      };

      const resultAId = "ritm1a56f0bc141958466b6a3b17afda";
      const resultBId = "ritm2a56f0bc141958466b6a3b17afda";

      const dataA = {
        results: [
          {
            created: 1719003517000,
            id: resultAId,
            title: "A",
            type: "Feature Service",
          },
        ],
      };

      const dataB = {
        results: [
          {
            created: 1719003505000,
            id: resultBId,
            title: "B",
            type: "Web Map",
          },
        ],
      };

      const solutionAId = "sol1x006b49746a99127cef12ab61e85";
      const solutionBId = "sol2x006b49746a99127cef12ab61e85";
      const solutionCId = "sol3x006b49746a99127cef12ab61e85";

      const searchResults = {
        results: [
          {
            id: solutionAId,
            created: 1719430833000,
            title: "A",
            typeKeywords: ["solutionversion-2.0"],
          },
          {
            id: solutionCId,
            created: 1819430834000,
            title: "C",
            typeKeywords: ["solutionversion-2.0"],
          },
          {
            id: solutionBId,
            created: 1919430834000,
            title: "B",
            typeKeywords: ["solutionversion-2.0"],
          },
        ],
      };

      const itemAData = {
        templates: [
          {
            itemId: "ca28a56f0bc141958466b6a3b17afda7",
            type: "Feature Service",
          },
          {
            itemId: resultAId,
            type: "Feature Service",
          },
        ],
      };

      const itemBData = {
        templates: [
          {
            itemId: "ca28a56f0bc141958466b6a3b17afda7",
            type: "Feature Service",
          },
          {
            itemId: resultBId,
            type: "Feature Service",
          },
        ],
      };

      const itemCData = {
        templates: [
          {
            itemId: resultAId,
            type: "Feature Service",
          },
          {
            itemId: resultBId,
            type: "Feature Service",
          },
        ],
      };

      const expected = {
        itm8a56f0bc141958466b6a3b17afda7: {
          ritm1a56f0bc141958466b6a3b17afda: {
            created: 1719003517000,
            solutions: {
              sol1x006b49746a99127cef12ab61e85: {
                created: 1719430833000,
                title: "A",
                version: "solutionversion-2.0",
              },
              sol3x006b49746a99127cef12ab61e85: {
                created: 1819430834000,
                title: "C",
                version: "solutionversion-2.0",
              },
            },
            title: "A",
            type: "Feature Service",
          },
        },
        itm2a56f0bc141958466b6a3b17afda7: {
          ritm2a56f0bc141958466b6a3b17afda: {
            created: 1719003505000,
            solutions: {
              sol2x006b49746a99127cef12ab61e85: {
                created: 1919430834000,
                title: "B",
                version: "solutionversion-2.0",
              },
              sol3x006b49746a99127cef12ab61e85: {
                created: 1819430834000,
                title: "C",
                version: "solutionversion-2.0",
              },
            },
            title: "B",
            type: "Web Map",
          },
        },
      };

      fetchMock
        .get(`${portal}/content/items/${id}/data?f=json&token=fake-token`, solutionTemplatesData)
        .get(`${portal}/search?f=json&q=typekeywords%3Asource-${itemA}%20owner%3A${user}&token=fake-token`, dataA)
        .get(`${portal}/search?f=json&q=typekeywords%3Asource-${itemB}%20owner%3A${user}&token=fake-token`, dataB)
        .get(
          `${portal}/search?f=json&q=owner%3A${user}%20AND%20type%3ASolution%20AND%20typekeywords%3ADeployed&num=100&token=fake-token`,
          searchResults,
        )
        .get(`${portal}/content/items/${solutionAId}/data?f=json&token=fake-token`, itemAData)
        .get(`${portal}/content/items/${solutionBId}/data?f=json&token=fake-token`, itemBData)
        .get(`${portal}/content/items/${solutionCId}/data?f=json&token=fake-token`, itemCData);

      const actual = await findReusableSolutionsAndItems(id, MOCK_USER_SESSION);
      expect(actual).toEqual(expected);
    });
  });

  describe("getDeployedSolutions", () => {
    it("gets all deployed solutions and their items", async() => {
      const portal = MOCK_USER_SESSION.portal;

      const user = MOCK_USER_SESSION.username;

      const solutionAId = "asol1x006b49746a99127cef12ab61e8";
      const solutionBId = "bsol2x006b49746a99127cef12ab61e8";
      const solutionB2Id = "dsol2x006b49746a99127cef12ab61e8";
      const solutionCId = "csol3x006b49746a99127cef12ab61e8";

      const searchResults = {
        results: [
          {
            id: solutionCId,
            created: 1719430833000,
            title: "A",
          },
          {
            id: solutionAId,
            created: 1819430834000,
            title: "A",
          },
          {
            id: solutionBId,
            created: 1919430834000,
            title: "B",
          },
          {
            id: solutionB2Id,
            created: 1919430834000,
            title: "B",
          },
        ],
      };

      const expected = {
        results: [
          {
            id: "asol1x006b49746a99127cef12ab61e8",
            created: 1819430834000,
            title: "A",
          },
          {
            id: "csol3x006b49746a99127cef12ab61e8",
            created: 1719430833000,
            title: "A",
          },
          {
            id: "bsol2x006b49746a99127cef12ab61e8",
            created: 1919430834000,
            title: "B",
          },
          {
            id: "dsol2x006b49746a99127cef12ab61e8",
            created: 1919430834000,
            title: "B",
          },
        ],
      };

      fetchMock.get(
        `${portal}/search?f=json&q=owner%3A${user}%20AND%20type%3ASolution%20AND%20typekeywords%3ADeployed&num=100&token=fake-token`,
        searchResults,
      );

      const actual = await getDeployedSolutions(MOCK_USER_SESSION);
      expect(actual).toEqual(expected as any);
    });
  });
});
