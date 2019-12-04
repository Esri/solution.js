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

import * as group from "../src/group";
import * as utils from "../../common/test/mocks/utils";
import * as staticDashboardMocks from "../../common/test/mocks/staticDashboardMocks";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as common from "@esri/solution-common";

// Set up a UserSession to use in all these tests
const MOCK_USER_SESSION = new common.UserSession({
  clientId: "clientId",
  redirectUri: "https://example-app.com/redirect-uri",
  token: "fake-token",
  tokenExpires: utils.TOMORROW,
  refreshToken: "refreshToken",
  refreshTokenExpires: utils.TOMORROW,
  refreshTokenTTL: 1440,
  username: "casey",
  password: "123456",
  portal: "https://myorg.maps.arcgis.com/sharing/rest"
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

const noResourcesResponse: any = {
  total: 0,
  start: 1,
  num: 0,
  nextStart: -1,
  resources: []
};

afterEach(() => {
  fetchMock.restore();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `simple-types`: manages the creation and deployment of simple item types", () => {
  describe("convertItemToTemplate", () => {
    it("should handle error on getGroup", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getItemTemplate();
      itemTemplate.itemId = "abc0cab401af4828a25cc6eaeb59fb69";
      itemTemplate.item = mockItems.getAGOLItem("Group", null);
      itemTemplate.item.tags = [];

      const groupResource: any = mockItems.get400Failure();

      const expectedTemplate: any = {
        itemId: "grp1234567890",
        type: "",
        item: {
          id: "{{grp1234567890.itemId}}",
          type: "",
          description: "Description of an AGOL group",
          snippet: "Snippet of an AGOL group",
          title: "An AGOL group",
          tags: []
        },
        data: {},
        resources: [],
        dependencies: [],
        properties: {},
        estimatedDeploymentCostFactor: 2
      };

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
          groupResource
        )
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/groups/grp1234567890?f=json&token=fake-token",
          groupResource
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/grp1234567890/resources",
          noResourcesResponse
        );

      group
        .convertItemToTemplate(
          itemTemplate.itemId,
          itemTemplate.item,
          MOCK_USER_SESSION
        )
        .then(newItemTemplate => {
          delete newItemTemplate.key;
          expect(newItemTemplate).toEqual(expectedTemplate);
          done();
        }, done.fail);
    });

    it("should handle error on portal getGroup", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getItemTemplate();
      itemTemplate.itemId = "abc0cab401af4828a25cc6eaeb59fb69";
      itemTemplate.item = mockItems.getAGOLItem("Group", null);
      itemTemplate.item.tags = [];

      const groupResource: any = {
        total: 7,
        start: 1,
        num: 7,
        nextStart: -1,
        items: [
          {
            id: "156bf2715e9e4098961c4a2a6848fa20",
            owner: "LocalGovDeployment",
            created: 1550876176000,
            isOrgItem: true,
            modified: 1553045028000,
            guid: null,
            name: "location_9402a6f176f54415ad4b8cb07598f42d",
            title: "Location Tracking",
            type: "Feature Service",
            typeKeywords: [
              "ArcGIS Server",
              "Collector",
              "Data",
              "Feature Access",
              "Feature Service",
              "Feature Service Template",
              "Layer",
              "Layer Template",
              "Location Tracking",
              "Platform",
              "Service",
              "Service template",
              "Template",
              "Hosted Service"
            ],
            description:
              "A feature layer used in the Dam Inspection Assignments Workforce for ArcGIS project to store a record for each point location logged while location tracking is enabled.",
            tags: ["Dam Safety", "Environment", "Natural Resources"],
            snippet:
              "A feature layer used in the Dam Inspection Assignments Workforce for ArcGIS project to store a record for each point location logged while location tracking is enabled.",
            thumbnail: "thumbnail/thumbnail1552925274760.png",
            documentation: null,
            extent: [
              [-131.82999999999555, 16.22999999999945],
              [-57.11999999999807, 58.49999999999802]
            ],
            categories: [],
            spatialReference: null,
            accessInformation: "Esri",
            licenseInfo: null,
            culture: "",
            properties: null,
            url:
              "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/location_9402a6f176f54415ad4b8cb07598f42d/FeatureServer",
            proxyFilter: null,
            access: "public",
            size: 0,
            appCategories: [],
            industries: [],
            languages: [],
            largeThumbnail: null,
            banner: null,
            screenshots: [],
            listed: false,
            numComments: 0,
            numRatings: 0,
            avgRating: 0,
            numViews: 106,
            groupCategories: [],
            scoreCompleteness: 78,
            groupDesignations: null
          }
        ]
      };

      const expectedTemplate: any = {
        itemId: "grp1234567890",
        type: "Group",
        item: {
          id: "{{grp1234567890.itemId}}",
          type: "",
          description: "Description of an AGOL group",
          snippet: "Snippet of an AGOL group",
          title: "An AGOL group",
          tags: []
        },
        data: {},
        resources: [],
        dependencies: ["156bf2715e9e4098961c4a2a6848fa20"],
        properties: {},
        estimatedDeploymentCostFactor: 2
      };

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
          groupResource
        )
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/groups/grp1234567890?f=json&token=fake-token",
          mockItems.get400Failure()
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/grp1234567890/resources",
          noResourcesResponse
        );

      group
        .convertItemToTemplate(
          itemTemplate.itemId,
          itemTemplate.item,
          MOCK_USER_SESSION
        )
        .then(newItemTemplate => {
          delete newItemTemplate.key;
          expect(newItemTemplate).toEqual(expectedTemplate);
          done();
        }, done.fail);
    });

    it("should handle a group", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getItemTemplate();
      itemTemplate.itemId = "abc0cab401af4828a25cc6eaeb59fb69";
      itemTemplate.item = mockItems.getAGOLItem("Group", null);

      const groupResource: any = {
        total: 7,
        start: 1,
        num: 7,
        nextStart: -1,
        items: [
          {
            id: "156bf2715e9e4098961c4a2a6848fa20",
            owner: "LocalGovDeployment",
            created: 1550876176000,
            isOrgItem: true,
            modified: 1553045028000,
            guid: null,
            name: "location_9402a6f176f54415ad4b8cb07598f42d",
            title: "Location Tracking",
            type: "Feature Service",
            typeKeywords: [
              "ArcGIS Server",
              "Collector",
              "Data",
              "Feature Access",
              "Feature Service",
              "Feature Service Template",
              "Layer",
              "Layer Template",
              "Location Tracking",
              "Platform",
              "Service",
              "Service template",
              "Template",
              "Hosted Service"
            ],
            description:
              "A feature layer used in the Dam Inspection Assignments Workforce for ArcGIS project to store a record for each point location logged while location tracking is enabled.",
            tags: ["Dam Safety", "Environment", "Natural Resources"],
            snippet:
              "A feature layer used in the Dam Inspection Assignments Workforce for ArcGIS project to store a record for each point location logged while location tracking is enabled.",
            thumbnail: "thumbnail/thumbnail1552925274760.png",
            documentation: null,
            extent: [
              [-131.82999999999555, 16.22999999999945],
              [-57.11999999999807, 58.49999999999802]
            ],
            categories: [],
            spatialReference: null,
            accessInformation: "Esri",
            licenseInfo: null,
            culture: "",
            properties: null,
            url:
              "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/location_9402a6f176f54415ad4b8cb07598f42d/FeatureServer",
            proxyFilter: null,
            access: "public",
            size: 0,
            appCategories: [],
            industries: [],
            languages: [],
            largeThumbnail: null,
            banner: null,
            screenshots: [],
            listed: false,
            numComments: 0,
            numRatings: 0,
            avgRating: 0,
            numViews: 106,
            groupCategories: [],
            scoreCompleteness: 78,
            groupDesignations: null
          }
        ]
      };

      const expectedTemplate: any = {
        itemId: "grp1234567890",
        type: "Group",
        item: {
          total: 7,
          start: 1,
          num: 7,
          nextStart: -1,
          items: [
            {
              id: "156bf2715e9e4098961c4a2a6848fa20",
              owner: "LocalGovDeployment",
              created: 1550876176000,
              isOrgItem: true,
              modified: 1553045028000,
              guid: null,
              name: "location_9402a6f176f54415ad4b8cb07598f42d",
              title: "Location Tracking",
              type: "Feature Service",
              typeKeywords: [
                "ArcGIS Server",
                "Collector",
                "Data",
                "Feature Access",
                "Feature Service",
                "Feature Service Template",
                "Layer",
                "Layer Template",
                "Location Tracking",
                "Platform",
                "Service",
                "Service template",
                "Template",
                "Hosted Service"
              ],
              description:
                "A feature layer used in the Dam Inspection Assignments Workforce for ArcGIS project to store a record for each point location logged while location tracking is enabled.",
              tags: ["Dam Safety", "Environment", "Natural Resources"],
              snippet:
                "A feature layer used in the Dam Inspection Assignments Workforce for ArcGIS project to store a record for each point location logged while location tracking is enabled.",
              thumbnail: "thumbnail/thumbnail1552925274760.png",
              documentation: null,
              extent: [
                [-131.82999999999555, 16.22999999999945],
                [-57.11999999999807, 58.49999999999802]
              ],
              categories: [],
              spatialReference: null,
              accessInformation: "Esri",
              licenseInfo: null,
              culture: "",
              properties: null,
              url:
                "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/location_9402a6f176f54415ad4b8cb07598f42d/FeatureServer",
              proxyFilter: null,
              access: "public",
              size: 0,
              appCategories: [],
              industries: [],
              languages: [],
              largeThumbnail: null,
              banner: null,
              screenshots: [],
              listed: false,
              numComments: 0,
              numRatings: 0,
              avgRating: 0,
              numViews: 106,
              groupCategories: [],
              scoreCompleteness: 78,
              groupDesignations: null
            }
          ],
          id: "{{grp1234567890.itemId}}"
        },
        data: {},
        resources: [],
        dependencies: ["156bf2715e9e4098961c4a2a6848fa20"],
        properties: {},
        estimatedDeploymentCostFactor: 2
      };

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
          groupResource
        )
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/groups/grp1234567890?f=json&token=fake-token",
          groupResource
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/grp1234567890/resources",
          noResourcesResponse
        );

      group
        .convertItemToTemplate(
          itemTemplate.itemId,
          itemTemplate.item,
          MOCK_USER_SESSION
        )
        .then(newItemTemplate => {
          delete newItemTemplate.key; // key is randomly generated, and so is not testable
          expect(newItemTemplate).toEqual(expectedTemplate);
          done();
        }, done.fail);
    });
  });

  describe("createItemFromTemplate", () => {
    it("should create group", done => {
      const itemId: string = "abc9cab401af4828a25cc6eaeb59fb69";
      const newItemID: string = "abc8cab401af4828a25cc6eaeb59fb69";
      const templateDictionary: any = {};

      const itemTemplate: common.IItemTemplate = mockItems.getItemTemplate();
      itemTemplate.itemId = itemId;
      itemTemplate.type = "Group";
      itemTemplate.item.title = "Dam Inspection Assignments";

      const searchResult: any = {
        query: "Dam Inspection Assignments",
        total: 12,
        start: 1,
        num: 10,
        nextStart: 11,
        results: []
      };

      const expected: any = {};
      expected[itemId] = { itemId: newItemID };

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments&token=fake-token",
          searchResult
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/community/createGroup",
          { success: true, group: { id: newItemID } }
        );
      group
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          function() {
            const a: any = "A";
          }
        )
        .then(response => {
          expect(response).toEqual(newItemID);
          expect(templateDictionary).toEqual(expected);
          done();
        }, done.fail);
    });

    it("should handle success === false on create group", done => {
      const itemId: string = "abc9cab401af4828a25cc6eaeb59fb69";
      const newItemID: string = "abc8cab401af4828a25cc6eaeb59fb69";
      const templateDictionary: any = {};

      const itemTemplate: common.IItemTemplate = mockItems.getItemTemplate();
      itemTemplate.itemId = itemId;
      itemTemplate.type = "Group";
      itemTemplate.item.title = "Dam Inspection Assignments";

      const searchResult: any = {
        query: "Dam Inspection Assignments",
        total: 12,
        start: 1,
        num: 10,
        nextStart: 11,
        results: []
      };

      const expected: any = {};
      expected[itemId] = { id: newItemID };

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments&token=fake-token",
          searchResult
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/community/createGroup",
          { success: false }
        );

      group
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          function() {
            const a: any = "A";
          }
        )
        .then(response => {
          done.fail();
        }, done);
    });

    it("should handle error on create group", done => {
      const itemId: string = "abc9cab401af4828a25cc6eaeb59fb69";
      const templateDictionary: any = {};

      const itemTemplate: common.IItemTemplate = mockItems.getItemTemplate();
      itemTemplate.itemId = itemId;
      itemTemplate.type = "Group";
      itemTemplate.item.title = "Dam Inspection Assignments";

      const searchResult: any = {
        query: "Dam Inspection Assignments",
        total: 12,
        start: 1,
        num: 10,
        nextStart: 11,
        results: []
      };

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments&token=fake-token",
          searchResult
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/community/createGroup",
          mockItems.get400Failure()
        );

      group
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          function() {
            const a: any = "A";
          }
        )
        .then(() => {
          done.fail();
        }, done);
    });

    it("should create group and handle error on update", done => {
      const itemId: string = "abc0cab401af4828a25cc6eaeb59fb69";
      const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";
      const templateDictionary: any = {};

      const itemTemplate: common.IItemTemplate = mockItems.getItemTemplate();
      itemTemplate.itemId = itemId;
      itemTemplate.type = "Group";
      itemTemplate.item.title = "Dam Inspection Assignments";

      itemTemplate.dependencies = ["abc2cab401af4828a25cc6eaeb59fb69"];

      const groupResponse: any = {
        id: "4c9e145c5d6c431c9d50b9f15ed34042",
        title:
          "Dam Inspection Assignments_9402a6f176f54415ad4b8cb07598f42d_20190627_2025_59807",
        isInvitationOnly: true,
        owner: "LocalGovDeployJohnH",
        description:
          "<span style='color: rgb(77, 77, 77); font-family: &quot;Lucida Grande&quot;, &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 14px;'>A group used to configure the Dam Inspection Assignments application.</span>",
        snippet: null,
        tags: ["workforce"],
        phone: null,
        sortField: "title",
        sortOrder: "asc",
        isViewOnly: true,
        thumbnail: null,
        created: 1561667160000,
        modified: 1561667160000,
        access: "public",
        capabilities: [],
        isFav: false,
        isReadOnly: false,
        protected: false,
        autoJoin: false,
        notificationsEnabled: false,
        provider: null,
        providerGroupName: null,
        leavingDisallowed: false,
        hiddenMembers: false,
        displaySettings: {
          itemTypes: ""
        },
        userMembership: {
          username: "LocalGovDeployJohnH",
          memberType: "owner",
          applications: 0
        },
        collaborationInfo: {}
      };

      const searchResult: any = {
        query: "Dam Inspection Assignments",
        total: 12,
        start: 1,
        num: 10,
        nextStart: 11,
        results: []
      };

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments&token=fake-token",
          searchResult
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/community/createGroup",
          { success: true, group: { id: newItemID } }
        )
        .post("https://myorg.maps.arcgis.com/sharing/rest/search", {
          results: []
        })
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/users/casey?f=json&token=fake-token",
          {}
        )
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/groups/abc1cab401af4828a25cc6eaeb59fb69?f=json&token=fake-token",
          groupResponse
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/abc2cab401af4828a25cc6eaeb59fb69/share",
          mockItems.get400Failure()
        );

      group
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          function() {
            const a: any = "A";
          }
        )
        .then(() => {
          done.fail();
        }, done);
    });

    it("should create group and handle error on getGroupTitle", done => {
      const itemId: string = "abc0cab401af4828a25cc6eaeb59fb69";
      const templateDictionary: any = {};

      const itemTemplate: common.IItemTemplate = mockItems.getItemTemplate();
      itemTemplate.itemId = itemId;
      itemTemplate.type = "Group";
      itemTemplate.item.title = "Dam Inspection Assignments";

      fetchMock.get(
        "https://myorg.maps.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments&token=fake-token",
        mockItems.get400Failure()
      );

      group
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          function() {
            const a: any = "A";
          }
        )
        .then(() => {
          done.fail();
        }, done);
    });

    //   it("should handle error on copy group resources", done => {
    //     const itemId: string = "abc9cab401af4828a25cc6eaeb59fb69";
    //     const templateDictionary: any = {};
    //     const newItemID: string = "abc8cab401af4828a25cc6eaeb59fb69";

    //     const itemTemplate: IItemTemplate = mockItems.getItemTemplate();
    //     itemTemplate.itemId = itemId;
    //     itemTemplate.type = "Group";
    //     itemTemplate.item.title = "Dam Inspection Assignments";

    //     const searchResult: any = {
    //       "query": "Dam Inspection Assignments",
    //       "total": 12,
    //       "start": 1,
    //       "num": 10,
    //       "nextStart": 11,
    //       "results": []
    //     };

    //     const filePaths: any[] = [{
    //       type: resourceHelpers.EFileType.Resource,
    //       folder: "aFolder",
    //       filename: "git_merge.png",
    //       url: "http://someurl"
    //     }];

    //     fetchMock
    //       .get("https://myorg.maps.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments&token=fake-token", searchResult)
    //       .post("https://myorg.maps.arcgis.com/sharing/rest/community/createGroup", { "success": true, "group": { "id": newItemID } })
    //       .post("http://someurl/", mockItems.get400Failure());

    //     createItemFromTemplate(
    //       itemTemplate,
    //       filePaths,
    //       MOCK_USER_SESSION,
    //       templateDictionary,
    //       MOCK_USER_SESSION,
    //       function () { const a: any = "A"; }
    //     ).then(() => {
    //       done.fail();
    //     }, done);
    //   });
  });

  describe("getGroupTitle", () => {
    it("handle error in get", done => {
      const name: string = "Dam Inspection Assignments";
      const id: string = "abc0cab401af4828a25cc6eaeb59fb69";

      fetchMock.get(
        "https://myorg.maps.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments&token=fake-token",
        mockItems.get400Failure()
      );

      group.getAvailableGroupTitle(name, id, MOCK_USER_SESSION).then(r => {
        done.fail();
      }, done);
    });

    it("should handle error when the current title is not available", done => {
      const name: string = "Dam Inspection Assignments";
      const id: string = "abc0cab401af4828a25cc6eaeb59fb69";

      const emptySearchResult: any = {
        query: "Dam Inspection Assignments",
        total: 12,
        start: 1,
        num: 10,
        nextStart: 11,
        results: []
      };

      const searchResult: any = {
        query: "Dam Inspection Assignments",
        total: 12,
        start: 1,
        num: 10,
        nextStart: 11,
        results: [
          {
            id: "9402a6f176f54415ad4b8cb07598f42d",
            title: "Dam Inspection Assignments",
            isInvitationOnly: true,
            owner: "LocalGovDeployment",
            snippet: null,
            tags: ["workforce"],
            phone: null,
            sortField: "title",
            sortOrder: "asc",
            isViewOnly: true,
            thumbnail: "thumbnail1552926199126.png",
            created: 1550876175000,
            modified: 1553045146000,
            access: "public",
            capabilities: [],
            isFav: false,
            isReadOnly: false,
            protected: true,
            autoJoin: false,
            notificationsEnabled: false,
            provider: null,
            providerGroupName: null,
            leavingDisallowed: false,
            hiddenMembers: false,
            displaySettings: {
              itemTypes: ""
            }
          }
        ]
      };

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments&token=fake-token",
          searchResult
        )
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments_abc0cab401af4828a25cc6eaeb59fb69&token=fake-token",
          mockItems.get400Failure()
        );

      group.getAvailableGroupTitle(name, id, MOCK_USER_SESSION).then(r => {
        done.fail();
      }, done);
    });

    it("return a valid title", done => {
      const name: string = "Dam Inspection Assignments";
      const id: string = "abc0cab401af4828a25cc6eaeb59fb69";

      const searchResult: any = {
        query: "Dam Inspection Assignments",
        total: 12,
        start: 1,
        num: 10,
        nextStart: 11,
        results: []
      };

      fetchMock.get(
        "https://myorg.maps.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments&token=fake-token",
        searchResult
      );

      group
        .getAvailableGroupTitle(name, id, MOCK_USER_SESSION)
        .then(response => {
          expect(response).toEqual(name);
          done();
        }, done.fail);
    });

    it("return a valid title when the current title is not available", done => {
      const name: string = "Dam Inspection Assignments";
      const id: string = "abc0cab401af4828a25cc6eaeb59fb69";

      const emptySearchResult: any = {
        query: "Dam Inspection Assignments",
        total: 12,
        start: 1,
        num: 10,
        nextStart: 11,
        results: []
      };

      const searchResult: any = {
        query: "Dam Inspection Assignments",
        total: 12,
        start: 1,
        num: 10,
        nextStart: 11,
        results: [
          {
            id: "9402a6f176f54415ad4b8cb07598f42d",
            title: "Dam Inspection Assignments",
            isInvitationOnly: true,
            owner: "LocalGovDeployment",
            snippet: null,
            tags: ["workforce"],
            phone: null,
            sortField: "title",
            sortOrder: "asc",
            isViewOnly: true,
            thumbnail: "thumbnail1552926199126.png",
            created: 1550876175000,
            modified: 1553045146000,
            access: "public",
            capabilities: [],
            isFav: false,
            isReadOnly: false,
            protected: true,
            autoJoin: false,
            notificationsEnabled: false,
            provider: null,
            providerGroupName: null,
            leavingDisallowed: false,
            hiddenMembers: false,
            displaySettings: {
              itemTypes: ""
            }
          }
        ]
      };

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments&token=fake-token",
          searchResult
        )
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments_abc0cab401af4828a25cc6eaeb59fb69&token=fake-token",
          emptySearchResult
        );

      group
        .getAvailableGroupTitle(name, id, MOCK_USER_SESSION)
        .then(response => {
          expect(response).toEqual(name + "_" + id);
          done();
        }, done.fail);
    });

    it("return a valid title when the current title is not available and the title_guid is also not available", done => {
      const name: string = "Dam Inspection Assignments";
      const id: string = "abc0cab401af4828a25cc6eaeb59fb69";

      const emptySearchResult: any = {
        query: "Dam Inspection Assignments",
        total: 12,
        start: 1,
        num: 10,
        nextStart: 11,
        results: []
      };

      const searchResult: any = {
        query: "Dam Inspection Assignments",
        total: 12,
        start: 1,
        num: 10,
        nextStart: 11,
        results: [
          {
            id: "9402a6f176f54415ad4b8cb07598f42d",
            title: "Dam Inspection Assignments",
            isInvitationOnly: true,
            owner: "LocalGovDeployment",
            snippet: null,
            tags: ["workforce"],
            phone: null,
            sortField: "title",
            sortOrder: "asc",
            isViewOnly: true,
            thumbnail: "thumbnail1552926199126.png",
            created: 1550876175000,
            modified: 1553045146000,
            access: "public",
            capabilities: [],
            isFav: false,
            isReadOnly: false,
            protected: true,
            autoJoin: false,
            notificationsEnabled: false,
            provider: null,
            providerGroupName: null,
            leavingDisallowed: false,
            hiddenMembers: false,
            displaySettings: {
              itemTypes: ""
            }
          },
          {
            id: "344e78e37d344295b8e41dca42a1acd7",
            title:
              "Dam Inspection Assignments_9402a6f176f54415ad4b8cb07598f42d",
            isInvitationOnly: true,
            owner: "LocalGovDeployJohnH",
            snippet: null,
            tags: ["workforce"],
            phone: null,
            sortField: "title",
            sortOrder: "asc",
            isViewOnly: true,
            thumbnail: null,
            created: 1561585706097,
            modified: 1561585706098,
            access: "public",
            capabilities: [],
            isFav: false,
            isReadOnly: false,
            protected: false,
            autoJoin: false,
            notificationsEnabled: false,
            provider: null,
            providerGroupName: null,
            leavingDisallowed: false,
            hiddenMembers: false,
            displaySettings: {
              itemTypes: ""
            }
          }
        ]
      };

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments&token=fake-token",
          searchResult
        )
        .get(
          "https://www.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments_abc0cab401af4828a25cc6eaeb59fb69",
          searchResult
        )
        .get("*", emptySearchResult);

      group
        .getAvailableGroupTitle(name, id, MOCK_USER_SESSION)
        .then(response => {
          // this should have a current time stamp appended after "title"_"id"_
          expect(response).toContain(
            "Dam Inspection Assignments_abc0cab401af4828a25cc6eaeb59fb69"
          );
          done();
        }, done.fail);
    });
  });

  describe("updateGroup", () => {
    it("should handle error", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getItemTemplate();
      itemTemplate.itemId = "abc1cab401af4828a25cc6eaeb59fb69";
      itemTemplate.dependencies = ["abc0cab401af4828a25cc6eaeb59fb69"];

      const groupResponse: any = {
        id: "4c9e145c5d6c431c9d50b9f15ed34042",
        title:
          "Dam Inspection Assignments_9402a6f176f54415ad4b8cb07598f42d_20190627_2025_59807",
        isInvitationOnly: true,
        owner: "LocalGovDeployJohnH",
        description:
          "<span style='color: rgb(77, 77, 77); font-family: &quot;Lucida Grande&quot;, &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 14px;'>A group used to configure the Dam Inspection Assignments application.</span>",
        snippet: null,
        tags: ["workforce"],
        phone: null,
        sortField: "title",
        sortOrder: "asc",
        isViewOnly: true,
        thumbnail: null,
        created: 1561667160000,
        modified: 1561667160000,
        access: "public",
        capabilities: [],
        isFav: false,
        isReadOnly: false,
        protected: false,
        autoJoin: false,
        notificationsEnabled: false,
        provider: null,
        providerGroupName: null,
        leavingDisallowed: false,
        hiddenMembers: false,
        displaySettings: {
          itemTypes: ""
        },
        userMembership: {
          username: "LocalGovDeployJohnH",
          memberType: "owner",
          applications: 0
        },
        collaborationInfo: {}
      };

      fetchMock
        .post("https://myorg.maps.arcgis.com/sharing/rest/search", {
          results: []
        })
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/users/casey?f=json&token=fake-token",
          {}
        )
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/groups/abc1cab401af4828a25cc6eaeb59fb69?f=json&token=fake-token",
          groupResponse
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/abc2cab401af4828a25cc6eaeb59fb69/share",
          mockItems.get400Failure()
        );

      group
        .updateGroup(itemTemplate, MOCK_USER_SESSION, {
          abc0cab401af4828a25cc6eaeb59fb69: {
            itemId: "abc2cab401af4828a25cc6eaeb59fb69"
          }
        })
        .then(() => {
          done.fail();
        }, done);
    });

    it("should share dependencies with group", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getItemTemplate();
      itemTemplate.itemId = "abc1cab401af4828a25cc6eaeb59fb69";
      itemTemplate.dependencies = ["abc0cab401af4828a25cc6eaeb59fb69"];

      const groupResponse: any = {
        id: "4c9e145c5d6c431c9d50b9f15ed34042",
        title:
          "Dam Inspection Assignments_9402a6f176f54415ad4b8cb07598f42d_20190627_2025_59807",
        isInvitationOnly: true,
        owner: "LocalGovDeployJohnH",
        description:
          "<span style='color: rgb(77, 77, 77); font-family: &quot;Lucida Grande&quot;, &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 14px;'>A group used to configure the Dam Inspection Assignments application.</span>",
        snippet: null,
        tags: ["workforce"],
        phone: null,
        sortField: "title",
        sortOrder: "asc",
        isViewOnly: true,
        thumbnail: null,
        created: 1561667160000,
        modified: 1561667160000,
        access: "public",
        capabilities: [],
        isFav: false,
        isReadOnly: false,
        protected: false,
        autoJoin: false,
        notificationsEnabled: false,
        provider: null,
        providerGroupName: null,
        leavingDisallowed: false,
        hiddenMembers: false,
        displaySettings: {
          itemTypes: ""
        },
        userMembership: {
          username: "LocalGovDeployJohnH",
          memberType: "owner",
          applications: 0
        },
        collaborationInfo: {}
      };

      fetchMock
        .post("https://myorg.maps.arcgis.com/sharing/rest/search", {
          results: []
        })
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/users/casey?f=json&token=fake-token",
          {}
        )
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/groups/abc1cab401af4828a25cc6eaeb59fb69?f=json&token=fake-token",
          groupResponse
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/abc2cab401af4828a25cc6eaeb59fb69/share",
          { notSharedWith: [], itemId: "6cf74cfc328c4ae49083666aaa2ed525" }
        );

      group
        .updateGroup(itemTemplate, MOCK_USER_SESSION, {
          abc0cab401af4828a25cc6eaeb59fb69: {
            itemId: "abc2cab401af4828a25cc6eaeb59fb69"
          }
        })
        .then(() => {
          done();
        }, done.fail);
    });
  });
});
