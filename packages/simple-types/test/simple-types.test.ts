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

import {
  getGroupTitle,
  convertItemToTemplate,
  createItemFromTemplate,
  updateGroup
} from "../src/simple-types";

import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";
import { IItemTemplate } from "../../common/src/interfaces";
import * as resourceHelpers from "../../common/src/resourceHelpers";

import { TOMORROW, create404Error } from "../../common/test/mocks/utils";
import { IUserRequestOptions, UserSession } from "@esri/arcgis-rest-auth";

// Set up a UserSession to use in all these tests
const MOCK_USER_SESSION = new UserSession({
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

const TINY_PNG_BYTES = [
  137,
  80,
  78,
  71,
  13,
  10,
  26,
  10,
  0,
  0,
  0,
  13,
  73,
  72,
  68,
  82,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  1,
  8,
  6,
  0,
  0,
  0,
  31,
  21,
  196,
  137,
  0,
  0,
  0,
  13,
  73,
  68,
  65,
  84,
  24,
  87,
  99,
  96,
  88,
  244,
  226,
  63,
  0,
  4,
  186,
  2,
  138,
  87,
  137,
  99,
  50,
  0,
  0,
  0,
  0,
  73,
  69,
  78,
  68,
  174,
  66,
  96,
  130
];

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
    it("should handle error on getResources", done => {
      const itemTemplate: IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );

      itemTemplate.item = {
        id: "abc0cab401af4828a25cc6eaeb59fb69",
        type: "Workforce Project",
        title: "Dam Inspection Assignments"
      };
      itemTemplate.itemId = "abc0cab401af4828a25cc6eaeb59fb69";

      fetchMock
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/resources",
          mockItems.get400Failure()
        )
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/data?f=json&num=1000&token=fake-token",
          {}
        )
        .post(
          "https://www.arcgis.com/sharing//content/items/abc0cab401af4828a25cc6eaeb59fb69/info/metadata/metadata.xml",
          {}
        );

      convertItemToTemplate(
        itemTemplate.item.id,
        itemTemplate.item,
        MOCK_USER_SESSION
      ).then(newItemTemplate => {
        expect(newItemTemplate.resources).toEqual([]);
        done();
      }, done.fail);
    });

    it("should handle error on getGroup", done => {
      const itemTemplate: IItemTemplate = mockItems.getItemTemplate();
      itemTemplate.itemId = "abc0cab401af4828a25cc6eaeb59fb69";
      itemTemplate.item = mockItems.getAGOLItem("Group", null);
      itemTemplate.item.tags = [];

      const groupResource: any = mockItems.get400Failure();

      const expectedTemplate: any = {
        itemId: "grp1234567890",
        type: "",
        item: {
          id: "{{grp1234567890.id}}",
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

      convertItemToTemplate(
        itemTemplate.itemId,
        itemTemplate.item,
        MOCK_USER_SESSION,
        true
      ).then(newItemTemplate => {
        delete newItemTemplate.key;
        expect(newItemTemplate).toEqual(expectedTemplate);
        done();
      }, done.fail);
    });

    it("should handle error on portal getGroup", done => {
      const itemTemplate: IItemTemplate = mockItems.getItemTemplate();
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
          id: "{{grp1234567890.id}}",
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

      convertItemToTemplate(
        itemTemplate.itemId,
        itemTemplate.item,
        MOCK_USER_SESSION,
        true
      ).then(newItemTemplate => {
        delete newItemTemplate.key;
        expect(newItemTemplate).toEqual(expectedTemplate);
        done();
      }, done.fail);
    });

    if (typeof window !== "undefined") {
      // Blobs are only available in the browser
      it("should handle workforce project", done => {
        const itemTemplate: IItemTemplate = mockItems.getAGOLItem(
          "Workforce Project",
          null
        );

        itemTemplate.item = {
          id: "abc0cab401af4828a25cc6eaeb59fb69",
          type: "Workforce Project",
          title: "Dam Inspection Assignments"
        };
        itemTemplate.itemId = "abc0cab401af4828a25cc6eaeb59fb69";

        const expectedTemplateData: any = {
          workerWebMapId: "{{abc116555b16437f8435e079033128d0.id}}",
          dispatcherWebMapId: "{{abc26a244163430590151395821fb845.id}}",
          dispatchers: {
            serviceItemId: "{{abc302ec12b74d2f9f2b3cc549420086.id}}",
            url: "{{abc302ec12b74d2f9f2b3cc549420086.url}}/0"
          },
          assignments: {
            serviceItemId: "{{abc4494043c3459faabcfd0e1ab557fc.id}}",
            url: "{{abc4494043c3459faabcfd0e1ab557fc.url}}/0"
          },
          workers: {
            serviceItemId: "{{abc5dd4bdd18437f8d5ff1aa2d25fd7c.id}}",
            url: "{{abc5dd4bdd18437f8d5ff1aa2d25fd7c.url}}/0"
          },
          tracks: {
            serviceItemId: "{{abc64329e69144c59f69f3f3e0d45269.id}}",
            url: "{{abc64329e69144c59f69f3f3e0d45269.url}}/0",
            enabled: true,
            updateInterval: 300
          },
          version: "1.2.0",
          groupId: "{{abc715c2df2b466da05577776e82d044.id}}",
          folderId: "{{folderId}}",
          assignmentIntegrations: [
            {
              id: "default-navigator",
              prompt: "Navigate to Assignment",
              urlTemplate:
                "arcgis-navigator://?stop=${assignment.latitude},{itemID={{cad3483e025c47338d43df308c117308.id}}},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt={itemID={{bad3483e025c47338d43df308c117308.id}}}://Workforce",
              assignmentTypes: [
                {
                  urlTemplate:
                    "arcgis-navigator://?stop=${assignment.latitude},{itemID={{cad3483e025c47338d43df308c117308.id}}},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt={itemID={{bad3483e025c47338d43df308c117308.id}}}://Workforce"
                }
              ]
            }
          ]
        };

        const dataResponse: any = mockItems.getAGOLItemData(
          "Workforce Project"
        );

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/resources",
            noResourcesResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/info/metadata/metadata.xml",
            {}
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/abc0cab401af4828a25cc6eaeb59fb69/addResources",
            { success: true, id: itemTemplate.itemId }
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/data?f=json&num=1000&token=fake-token",
            dataResponse
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/community/groups/grp1234567890?f=json&token=fake-token",
            {}
          );

        convertItemToTemplate(
          itemTemplate.item.id,
          itemTemplate.item,
          MOCK_USER_SESSION
        ).then(newItemTemplate => {
          expect(newItemTemplate.data).toEqual(expectedTemplateData);
          done();
        }, done.fail);
      });
    }

    it("should handle a group", done => {
      const itemTemplate: IItemTemplate = mockItems.getItemTemplate();
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
          id: "{{grp1234567890.id}}"
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

      convertItemToTemplate(
        itemTemplate.itemId,
        itemTemplate.item,
        MOCK_USER_SESSION,
        true
      ).then(newItemTemplate => {
        delete newItemTemplate.key; // key is randomly generated, and so is not testable
        expect(newItemTemplate).toEqual(expectedTemplate);
        done();
      }, done.fail);
    });

    if (typeof window !== "undefined") {
      // Blobs are only available in the browser
      it("should handle item resource", done => {
        const itemTemplate: IItemTemplate = mockItems.getItemTemplate();
        itemTemplate.item = mockItems.getAGOLItem("Web Map", null);
        itemTemplate.item.item = itemTemplate.itemId = itemTemplate.item.id;
        itemTemplate.item.thumbnail = "thumbnail/banner.png";

        const expectedFetch = new Blob(
          [new Uint8Array(TINY_PNG_BYTES).buffer],
          { type: "image/png" }
        );

        const expectedTemplate: any = {
          itemId: "map1234567890",
          type: "Web Map",
          item: {
            id: "{{map1234567890.id}}",
            type: "Web Map",
            categories: [],
            culture: "en-us",
            description: "Description of an AGOL item",
            extent: [],
            licenseInfo: null,
            name: "Name of an AGOL item",
            snippet: "Snippet of an AGOL item",
            tags: ["test"],
            thumbnail: "thumbnail/banner.png",
            title: "An AGOL item",
            typeKeywords: ["JavaScript"],
            url:
              "{{organization.portalBaseUrl}}/home/webmap/viewer.html?webmap={{map1234567890.id}}"
          },
          data: {},
          resources: [
            "map1234567890_image/banner.png",
            "map1234567890_info_thumbnail/banner.png"
          ],
          dependencies: [],
          properties: {},
          estimatedDeploymentCostFactor: 2
        };

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/resources",
            {
              total: 1,
              start: 1,
              num: 1,
              nextStart: -1,
              resources: [
                {
                  resource: "image/banner.png",
                  created: 1522711362000,
                  size: 56945
                }
              ]
            }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/resources/image/banner.png",
            expectedFetch
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/" +
              MOCK_USER_SESSION.username +
              "/items/" +
              itemTemplate.itemId +
              "/addResources",
            {
              success: true,
              itemId: itemTemplate.itemId,
              owner: MOCK_USER_SESSION.username,
              folder: null
            }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/info/thumbnail/banner.png",
            expectedFetch
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/data?f=json&num=1000&token=fake-token",
            {}
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/info/metadata/metadata.xml",
            {
              error: {
                code: 400,
                messageCode: "CONT_0036",
                message: "Item info file does not exist or is inaccessible.",
                details: ["Error getting Item Info from DataStore"]
              }
            }
          );

        convertItemToTemplate(
          itemTemplate.item.id,
          itemTemplate.item,
          MOCK_USER_SESSION
        ).then(newItemTemplate => {
          delete newItemTemplate.key; // key is randomly generated, and so is not testable
          expect(newItemTemplate).toEqual(expectedTemplate);
          done();
        }, done.fail);
      });

      it("should handle dashboard et al. item types", done => {
        const itemTemplate: IItemTemplate = mockItems.getItemTemplate();
        itemTemplate.itemId = "dsh1234567890";
        itemTemplate.item = mockItems.getAGOLItem("Dashboard", null);
        itemTemplate.item.thumbnail = null;
        const blob = new Blob(["abc", "def", "ghi"], { type: "text/xml" });

        const expectedTemplate: any = {
          itemId: "dsh1234567890",
          type: "Dashboard",
          item: {
            id: "{{dsh1234567890.id}}",
            type: "Dashboard",
            categories: [],
            culture: "en-us",
            description: "Description of an AGOL item",
            extent: [],
            licenseInfo: null,
            name: "Name of an AGOL item",
            snippet: "Snippet of an AGOL item",
            tags: ["test"],
            thumbnail: null,
            title: "An AGOL item",
            typeKeywords: ["JavaScript"],
            url: ""
          },
          data: {},
          resources: [],
          dependencies: [],
          properties: {},
          estimatedDeploymentCostFactor: 2
        };

        fetchMock
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/data?f=json&num=1000&token=fake-token",
            blob
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/resources",
            noResourcesResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/info/metadata/metadata.xml",
            {
              error: {
                code: 400,
                messageCode: "CONT_0036",
                message: "Item info file does not exist or is inaccessible.",
                details: ["Error getting Item Info from DataStore"]
              }
            }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/" +
              MOCK_USER_SESSION.username +
              "/items/" +
              itemTemplate.itemId +
              "/addResources",
            {
              error: {
                code: 400,
                messageCode: "CONT_0036",
                message: "Item info file does not exist or is inaccessible.",
                details: ["Error getting Item Info from DataStore"]
              }
            }
          );

        convertItemToTemplate(
          itemTemplate.item.id,
          itemTemplate.item,
          MOCK_USER_SESSION
        ).then(newItemTemplate => {
          delete newItemTemplate.key; // key is randomly generated, and so is not testable
          expect(newItemTemplate).toEqual(expectedTemplate);
          done();
        }, done.fail);
      });

      it("should handle form item type", done => {
        const itemTemplate: IItemTemplate = mockItems.getItemTemplate();
        itemTemplate.itemId = "frm1234567890";
        itemTemplate.item = mockItems.getAGOLItem("Form", null);
        itemTemplate.item.thumbnail = null;
        const blob = new Blob(["abc", "def", "ghi"], { type: "text/xml" });

        const expectedTemplate: any = {
          itemId: "frm1234567890",
          type: "Form",
          item: {
            id: "{{frm1234567890.id}}",
            type: "Form",
            categories: [],
            culture: "en-us",
            description: "Description of an AGOL item",
            extent: [],
            licenseInfo: null,
            name: "Name of an AGOL item",
            snippet: "Snippet of an AGOL item",
            tags: ["test"],
            thumbnail: null,
            title: "An AGOL item",
            typeKeywords: ["JavaScript"],
            url: ""
          },
          data: null,
          resources: ["frm1234567890_info_form/formData"],
          dependencies: ["srv1234567890"],
          properties: {},
          estimatedDeploymentCostFactor: 2
        };

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/data",
            blob
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/relatedItems?f=json&num=1000&relationshipType=Survey2Service&token=fake-token",
            {
              total: 1,
              relatedItems: [
                {
                  id: "srv1234567890",
                  owner: MOCK_USER_SESSION.username,
                  created: 1496669828000,
                  modified: 1529597563000,
                  guid: null,
                  name: "OpioidIncidents",
                  title: "OpioidIncidents",
                  type: "Feature Service",
                  typeKeywords: [
                    "ArcGIS Server",
                    "Data",
                    "Feature Access",
                    "Feature Service",
                    "Multilayer",
                    "Service",
                    "source-1e900c4d6b8846c6b4871592933a0863",
                    "Hosted Service"
                  ],
                  description:
                    "Overdoses, fatalities, and other drug related incidents.",
                  tags: [
                    "Opioids",
                    "Public Health",
                    "Public Safety",
                    "Health",
                    "Deaths",
                    "Overdoses",
                    "Drug Seizures",
                    "Police",
                    "Fire Service",
                    "Law Enforcement"
                  ],
                  snippet:
                    "Overdoses, fatalities, and other drug related incidents.",
                  thumbnail: "thumbnail/OpioidIncidents.png",
                  documentation: null,
                  extent: [[-131.0, 16.0], [-57.0, 58.0]],
                  categories: [],
                  spatialReference: null,
                  accessInformation: "Esri",
                  licenseInfo: null,
                  culture: "en-us",
                  properties: null,
                  url:
                    "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/OpioidIncidents/FeatureServer",
                  proxyFilter: null,
                  access: "public",
                  size: 49152,
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
                  numViews: 740,
                  scoreCompleteness: 68,
                  groupDesignations: null
                }
              ]
            }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/resources",
            noResourcesResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/info/metadata/metadata.xml",
            {
              error: {
                code: 400,
                messageCode: "CONT_0036",
                message: "Item info file does not exist or is inaccessible.",
                details: ["Error getting Item Info from DataStore"]
              }
            }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/" +
              MOCK_USER_SESSION.username +
              "/items/" +
              itemTemplate.itemId +
              "/addResources",
            {
              success: true,
              itemId: itemTemplate.itemId,
              owner: MOCK_USER_SESSION.username,
              folder: null
            }
          );

        convertItemToTemplate(
          itemTemplate.item.id,
          itemTemplate.item,
          MOCK_USER_SESSION
        ).then(newItemTemplate => {
          delete newItemTemplate.key; // key is randomly generated, and so is not testable
          expect(newItemTemplate).toEqual(expectedTemplate);
          done();
        }, done.fail);
      });
    }

    it("should handle web mapping application", done => {
      const itemTemplate: IItemTemplate = mockItems.getAGOLItem(
        "Web Mapping Application",
        null
      );

      itemTemplate.item = {
        id: "abc0cab401af4828a25cc6eaeb59fb69",
        type: "Web Mapping Application",
        title: "Voting Centers",
        url:
          "https://myOrg.arcgis.com/home/item.html?id=abc123da3c304dd0bf46dee75ac31aae"
      };
      itemTemplate.itemId = "abc0cab401af4828a25cc6eaeb59fb69";
      itemTemplate.data = {
        appItemId: "myAppItemId",
        values: {
          webmap: "myMapId"
        },
        map: {
          appProxy: {
            mapItemId: "mapItemId"
          },
          itemId: "mapItemId"
        },
        folderId: "folderId"
      };
      const expected = {
        itemId: "abc0cab401af4828a25cc6eaeb59fb69",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: {
          title: "Voting Centers",
          id: "{{abc0cab401af4828a25cc6eaeb59fb69.id}}",
          type: "Web Mapping Application",
          categories: undefined,
          culture: undefined,
          description: undefined,
          extent: undefined,
          tags: undefined,
          thumbnail: undefined,
          typeKeywords: undefined,
          url:
            "{{organization.portalBaseUrl}}/home/item.html?id={{abc0cab401af4828a25cc6eaeb59fb69.id}}",
          licenseInfo: undefined,
          name: undefined,
          snippet: undefined
        } as any,
        data: {
          appItemId: "{{myAppItemId.id}}",
          values: {
            webmap: "{{myMapId.id}}"
          },
          map: {
            appProxy: {
              mapItemId: "{{mapItemId.id}}"
            },
            itemId: "{{mapItemId.id}}"
          },
          folderId: "{{folderId}}"
        },
        resources: [] as any[],
        dependencies: ["myMapId"],
        properties: {} as any,
        estimatedDeploymentCostFactor: 2
      };

      fetchMock
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/resources",
          []
        )
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/data?f=json&num=1000&token=fake-token",
          itemTemplate.data
        );

      convertItemToTemplate(
        itemTemplate.item.id,
        itemTemplate.item,
        MOCK_USER_SESSION
      ).then(
        actual => {
          actual.key = "abcdefgh";
          expect(actual).toEqual(expected);
          done();
        },
        e => done.fail(e)
      );
    });

    it("should handle error on web mapping application", done => {
      const itemTemplate: IItemTemplate = mockItems.getAGOLItem(
        "Web Mapping Application",
        null
      );

      itemTemplate.item = {
        id: "abc0cab401af4828a25cc6eaeb59fb69",
        type: "Web Mapping Application",
        title: "Voting Centers",
        url:
          "https://myOrg.arcgis.com/home/item.html?id=abc123da3c304dd0bf46dee75ac31aae"
      };
      itemTemplate.itemId = "abc0cab401af4828a25cc6eaeb59fb69";

      const data: any = {
        appItemId: "myAppItemId",
        values: {
          webmap: "myMapId"
        },
        map: {
          appProxy: {
            mapItemId: "mapItemId"
          },
          itemId: "mapItemId"
        },
        folderId: "folderId",
        dataSource: {
          dataSources: {
            external_123456789: {
              type: "source type",
              portalUrl: "https://fake.maps.arcgis.com/",
              itemId: "2ea59a64b34646f8972a71c7d536e4a3",
              isDynamic: false,
              label: "Point layer",
              url: "https://fake.com/arcgis/rest/services/test/FeatureServer/0"
            }
          },
          settings: {}
        }
      };
      fetchMock
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/resources",
          []
        )
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/data?f=json&num=1000&token=fake-token",
          data
        )
        .post(
          "https://fake.com/arcgis/rest/services/test/FeatureServer/0",
          mockItems.get400FailureResponse()
        );

      convertItemToTemplate(
        itemTemplate.item.id,
        itemTemplate.item,
        MOCK_USER_SESSION
      ).then(
        () => {
          done();
        },
        e => done.fail(e)
      );
    });

    if (typeof window !== "undefined") {
      // Blobs are only available in the browser
      it("should handle web mapping applications", done => {
        const itemTemplate: IItemTemplate = mockItems.getItemTemplate();
        itemTemplate.item = mockItems.getAGOLItem(
          "Web Mapping Application",
          null
        );
        itemTemplate.itemId = itemTemplate.item.id;
        itemTemplate.item.thumbnail = null;

        const expectedTemplate: any = {
          itemId: "wma1234567890",
          type: "Web Mapping Application",
          item: {
            id: "{{wma1234567890.id}}",
            type: "Web Mapping Application",
            categories: [],
            culture: "en-us",
            description: "Description of an AGOL item",
            extent: [],
            licenseInfo: null,
            name: "Name of an AGOL item",
            snippet: "Snippet of an AGOL item",
            tags: ["test"],
            thumbnail: null,
            title: "An AGOL item",
            typeKeywords: ["JavaScript"],
            url:
              "{{organization.portalBaseUrl}}/apps/CrowdsourcePolling/index.html?appid={{wma1234567890.id}}"
          },
          data: null,
          resources: [],
          dependencies: [],
          properties: {},
          estimatedDeploymentCostFactor: 2
        };

        fetchMock
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/data?f=json&num=1000&token=fake-token",
            create404Error()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/resources",
            noResourcesResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/info/metadata/metadata.xml",
            {
              error: {
                code: 400,
                messageCode: "CONT_0036",
                message: "Item info file does not exist or is inaccessible.",
                details: ["Error getting Item Info from DataStore"]
              }
            }
          );

        convertItemToTemplate(
          itemTemplate.item.id,
          itemTemplate.item,
          MOCK_USER_SESSION
        ).then(newItemTemplate => {
          delete newItemTemplate.key; // key is randomly generated, and so is not testable
          expect(newItemTemplate).toEqual(expectedTemplate);
          done();
        }, done.fail);
      });
    }

    it("should catch fetch errors", done => {
      const itemTemplate: IItemTemplate = mockItems.getItemTemplate();
      itemTemplate.item = mockItems.getAGOLItem("Form", null);
      itemTemplate.itemId = itemTemplate.item.id;
      itemTemplate.item.thumbnail = null;

      fetchMock
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/frm1234567890/resources",
          create404Error()
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/frm1234567890/data",
          create404Error()
        )
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/frm1234567890/relatedItems?f=json&num=1000&relationshipType=Survey2Service&token=fake-token",
          create404Error()
        );

      convertItemToTemplate(
        itemTemplate.item.id,
        itemTemplate.item,
        MOCK_USER_SESSION
      ).then(newItemTemplate => {
        expect(newItemTemplate.data).toEqual(null);
        expect(newItemTemplate.resources).toEqual([]);
        expect(newItemTemplate.dependencies).toEqual([]);
        done();
      }, done.fail);
    });

    if (typeof window !== "undefined") {
      // Blobs are only available in the browser
      it("should catch wrapup errors", done => {
        const itemTemplate: IItemTemplate = mockItems.getItemTemplate();
        itemTemplate.item = mockItems.getAGOLItem("Form", null);
        itemTemplate.itemId = itemTemplate.item.id;
        itemTemplate.item.thumbnail = null;
        const blob = new Blob(["abc", "def", "ghi"], { type: "text/xml" });

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/data",
            blob
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/resources",
            noResourcesResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/info/metadata/metadata.xml",
            {
              error: {
                code: 400,
                messageCode: "CONT_0036",
                message: "Item info file does not exist or is inaccessible.",
                details: ["Error getting Item Info from DataStore"]
              }
            }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/" +
              MOCK_USER_SESSION.username +
              "/items/" +
              itemTemplate.itemId +
              "/addResources",
            {
              error: {
                code: 400,
                messageCode: "CONT_0036",
                message: "Item info file does not exist or is inaccessible.",
                details: ["Error getting Item Info from DataStore"]
              }
            }
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/relatedItems?f=json&num=1000&relationshipType=Survey2Service&token=fake-token",
            create404Error()
          );

        convertItemToTemplate(
          itemTemplate.item.id,
          itemTemplate.item,
          MOCK_USER_SESSION
        ).then(
          () => done.fail,
          response => {
            expect(response.error.code).toEqual(400);
            expect(response.error.message).toEqual(
              "Item info file does not exist or is inaccessible."
            );
            done();
          }
        );
      });
    }
  });

  describe("createItemFromTemplate", () => {
    it("should handle error on addItem", done => {
      const itemId: string = "abc0cab401af4828a25cc6eaeb59fb69";
      const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";
      const templateDictionary: any = {};

      const itemTemplate: IItemTemplate = mockItems.getItemTemplate();
      itemTemplate.itemId = itemId;
      itemTemplate.type = "Web Map";
      itemTemplate.item = {
        id: itemId,
        type: itemTemplate.type
      };

      const expected: any = {};
      expected[itemId] = newItemID;

      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
        mockItems.get400Failure()
      );

      createItemFromTemplate(
        itemTemplate,
        [],
        MOCK_USER_SESSION,
        templateDictionary,
        MOCK_USER_SESSION,
        function() {
          const a: any = "A";
        }
      ).then(response => {
        done.fail();
      }, done);
    });

    it("should handle success === false", done => {
      const itemId: string = "abc0cab401af4828a25cc6eaeb59fb69";
      const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";
      const templateDictionary: any = {};

      const itemTemplate: IItemTemplate = mockItems.getItemTemplate();
      itemTemplate.itemId = itemId;
      itemTemplate.type = "Web Map";
      itemTemplate.item = {
        id: itemId,
        type: itemTemplate.type
      };

      const expected: any = {};
      expected[itemId] = newItemID;

      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
        { success: false }
      );

      createItemFromTemplate(
        itemTemplate,
        [],
        MOCK_USER_SESSION,
        templateDictionary,
        MOCK_USER_SESSION,
        function() {
          const a: any = "A";
        }
      ).then(response => {
        done.fail();
      }, done);
    });

    it("should create workforce project", done => {
      const itemId: string = "abc0cab401af4828a25cc6eaeb59fb69";
      const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";
      const templateDictionary: any = {};

      const itemTemplate: IItemTemplate = mockItems.getItemTemplate();
      itemTemplate.itemId = itemId;
      itemTemplate.data = {
        workerWebMapId: "{{abc116555b16437f8435e079033128d0.id}}",
        dispatcherWebMapId: "{{abc26a244163430590151395821fb845.id}}",
        dispatchers: {
          serviceItemId: "{{abc302ec12b74d2f9f2b3cc549420086.id}}",
          url: "{{abc302ec12b74d2f9f2b3cc549420086.url}}/0"
        },
        assignments: {
          serviceItemId: "{{abc4494043c3459faabcfd0e1ab557fc.id}}",
          url: "{{abc4494043c3459faabcfd0e1ab557fc.url}}/0"
        },
        workers: {
          serviceItemId: "{{abc5dd4bdd18437f8d5ff1aa2d25fd7c.id}}",
          url: "{{abc5dd4bdd18437f8d5ff1aa2d25fd7c.url}}/0"
        },
        tracks: {
          serviceItemId: "{{abc64329e69144c59f69f3f3e0d45269.id}}",
          url: "{{abc64329e69144c59f69f3f3e0d45269.url}}/0",
          enabled: true,
          updateInterval: 300
        },
        version: "1.2.0",
        groupId: "{{abc715c2df2b466da05577776e82d044.id}}",
        folderId: "{{folderId}}",
        assignmentIntegrations: [
          {
            id: "default-navigator",
            prompt: "Navigate to Assignment",
            urlTemplate:
              "arcgis-navigator://?stop=${assignment.latitude},{itemID={{cad3483e025c47338d43df308c117308.id}}},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt={itemID={{bad3483e025c47338d43df308c117308.id}}}://Workforce",
            assignmentTypes: [
              {
                urlTemplate:
                  "arcgis-navigator://?stop=${assignment.latitude},{itemID={{cad3483e025c47338d43df308c117308.id}}},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt={itemID={{bad3483e025c47338d43df308c117308.id}}}://Workforce"
              }
            ]
          }
        ]
      };

      const expected: any = {};
      expected[itemId] = { id: newItemID };

      fetchMock
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
          { success: true, id: newItemID }
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/" +
            newItemID +
            "/update",
          { success: true }
        );

      createItemFromTemplate(
        itemTemplate,
        [],
        MOCK_USER_SESSION,
        templateDictionary,
        MOCK_USER_SESSION,
        function() {
          const a: any = "A";
        }
      ).then(response => {
        expect(response).toEqual(newItemID);
        expect(templateDictionary).toEqual(expected);
        done();
      }, done.fail);
    });

    it("should create and fine tune workforce project", done => {
      const itemTemplate: IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";

      const userUrl: string =
        "https://myorg.maps.arcgis.com/sharing/rest/community/users/casey?f=json&token=fake-token";
      const queryUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/query?f=json&where=userId%20%3D%20%27MrClaypool%27&outFields=*&token=fake-token";
      const addUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/addFeatures";

      fetchMock
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
          { success: true, id: newItemID }
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/" +
            newItemID +
            "/update",
          { success: true }
        )
        .get(userUrl, {
          username: "MrClaypool",
          fullName: "Mr Claypool"
        })
        .get(queryUrl, {
          features: []
        })
        .post(addUrl, {
          addResults: [{}]
        });

      createItemFromTemplate(
        itemTemplate,
        [],
        MOCK_USER_SESSION,
        {},
        MOCK_USER_SESSION,
        function() {
          const a: any = "A";
        }
      ).then(r => {
        expect(r).toEqual(newItemID);
        done();
      }, done.fail);
    });

    it("should create group", done => {
      const itemId: string = "abc9cab401af4828a25cc6eaeb59fb69";
      const newItemID: string = "abc8cab401af4828a25cc6eaeb59fb69";
      const templateDictionary: any = {};

      const itemTemplate: IItemTemplate = mockItems.getItemTemplate();
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
          "https://www.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments",
          searchResult
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/community/createGroup",
          { success: true, group: { id: newItemID } }
        );

      createItemFromTemplate(
        itemTemplate,
        [],
        MOCK_USER_SESSION,
        templateDictionary,
        MOCK_USER_SESSION,
        function() {
          const a: any = "A";
        }
      ).then(response => {
        expect(response).toEqual(newItemID);
        expect(templateDictionary).toEqual(expected);
        done();
      }, done.fail);
    });

    it("should handle success === false on create group", done => {
      const itemId: string = "abc9cab401af4828a25cc6eaeb59fb69";
      const newItemID: string = "abc8cab401af4828a25cc6eaeb59fb69";
      const templateDictionary: any = {};

      const itemTemplate: IItemTemplate = mockItems.getItemTemplate();
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
          "https://www.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments",
          searchResult
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/community/createGroup",
          { success: false }
        );

      createItemFromTemplate(
        itemTemplate,
        [],
        MOCK_USER_SESSION,
        templateDictionary,
        MOCK_USER_SESSION,
        function() {
          const a: any = "A";
        }
      ).then(response => {
        done.fail();
      }, done);
    });

    it("should handle error on create group", done => {
      const itemId: string = "abc9cab401af4828a25cc6eaeb59fb69";
      const templateDictionary: any = {};

      const itemTemplate: IItemTemplate = mockItems.getItemTemplate();
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
          "https://www.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments",
          searchResult
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/community/createGroup",
          mockItems.get400Failure()
        );

      createItemFromTemplate(
        itemTemplate,
        [],
        MOCK_USER_SESSION,
        templateDictionary,
        MOCK_USER_SESSION,
        function() {
          const a: any = "A";
        }
      ).then(() => {
        done.fail();
      }, done);
    });

    it("should create group and handle error on update", done => {
      const itemId: string = "abc0cab401af4828a25cc6eaeb59fb69";
      const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";
      const templateDictionary: any = {};

      const itemTemplate: IItemTemplate = mockItems.getItemTemplate();
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
          "https://www.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments",
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

      createItemFromTemplate(
        itemTemplate,
        [],
        MOCK_USER_SESSION,
        templateDictionary,
        MOCK_USER_SESSION,
        function() {
          const a: any = "A";
        }
      ).then(() => {
        done.fail();
      }, done);
    });

    it("should create group and handle error on getGroupTitle", done => {
      const itemId: string = "abc0cab401af4828a25cc6eaeb59fb69";
      const templateDictionary: any = {};

      const itemTemplate: IItemTemplate = mockItems.getItemTemplate();
      itemTemplate.itemId = itemId;
      itemTemplate.type = "Group";
      itemTemplate.item.title = "Dam Inspection Assignments";

      fetchMock.get(
        "https://www.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments",
        mockItems.get400Failure()
      );

      createItemFromTemplate(
        itemTemplate,
        [],
        MOCK_USER_SESSION,
        templateDictionary,
        MOCK_USER_SESSION,
        function() {
          const a: any = "A";
        }
      ).then(() => {
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
    //       .get("https://www.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments", searchResult)
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

    it("should handle web mapping application", done => {
      const itemTemplate: IItemTemplate = mockItems.getAGOLItem(
        "Web Mapping Application",
        null
      );
      itemTemplate.itemId = "abc0cab401af4828a25cc6eaeb59fb69";
      itemTemplate.item = {
        title: "Voting Centers",
        id: "{{abc0cab401af4828a25cc6eaeb59fb69.id}}",
        type: "Web Mapping Application",
        categories: undefined,
        culture: undefined,
        description: undefined,
        extent: undefined,
        tags: undefined,
        thumbnail: undefined,
        typeKeywords: ["WAB2D"],
        url:
          "{{organization.portalBaseUrl}}/home/item.html?id={{abc0cab401af4828a25cc6eaeb59fb69.id}}",
        licenseInfo: undefined,
        name: undefined,
        snippet: undefined
      };
      itemTemplate.data = {
        appItemId: "{{myAppItemId.id}}",
        values: {
          webmap: "{{myMapId.id}}"
        },
        map: {
          appProxy: {
            mapItemId: "{{mapItemId.id}}"
          },
          itemId: "{{mapItemId.id}}"
        },
        folderId: "{{folderId}}"
      };
      itemTemplate.dependencies = ["myMapId"];

      const layer0: any = {
        serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
        id: 0
      };

      fetchMock
        .post(
          "https://fake.com/arcgis/rest/services/test/FeatureServer/0",
          layer0
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
          { success: true, id: "abc0cab401af4828a25cc6eaeb59fb69" }
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/abc0cab401af4828a25cc6eaeb59fb69/update",
          { success: true }
        );

      createItemFromTemplate(
        itemTemplate,
        [],
        MOCK_USER_SESSION,
        {},
        MOCK_USER_SESSION,
        function() {
          const tick = 0;
        }
      ).then(
        actual => {
          expect(actual).toEqual("abc0cab401af4828a25cc6eaeb59fb69");
          done();
        },
        e => done.fail(e)
      );
    });

    it("should handle error web mapping application", done => {
      const itemTemplate: IItemTemplate = mockItems.getAGOLItem(
        "Web Mapping Application",
        null
      );
      itemTemplate.itemId = "abc0cab401af4828a25cc6eaeb59fb69";
      itemTemplate.item = {
        title: "Voting Centers",
        id: "{{abc0cab401af4828a25cc6eaeb59fb69.id}}",
        type: "Web Mapping Application",
        categories: undefined,
        culture: undefined,
        description: undefined,
        extent: undefined,
        tags: undefined,
        thumbnail: undefined,
        typeKeywords: ["WAB2D"],
        url:
          "{{organization.portalBaseUrl}}/home/item.html?id={{abc0cab401af4828a25cc6eaeb59fb69.id}}",
        licenseInfo: undefined,
        name: undefined,
        snippet: undefined
      };
      itemTemplate.data = {
        appItemId: "{{myAppItemId.id}}",
        values: {
          webmap: "{{myMapId.id}}"
        },
        map: {
          appProxy: {
            mapItemId: "{{mapItemId.id}}"
          },
          itemId: "{{mapItemId.id}}"
        },
        folderId: "{{folderId}}"
      };
      itemTemplate.dependencies = ["myMapId"];

      const layer0: any = {
        serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
        id: 0
      };

      fetchMock
        .post(
          "https://fake.com/arcgis/rest/services/test/FeatureServer/0",
          layer0
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
          { success: true, id: "abc0cab401af4828a25cc6eaeb59fb69" }
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/folderId/addItem",
          { success: true, id: "abc2cab401af4828a25cc6eaeb59fb69" }
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/abc2cab401af4828a25cc6eaeb59fb69/update",
          mockItems.get400FailureResponse()
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/abc0cab401af4828a25cc6eaeb59fb69/update",
          mockItems.get400FailureResponse()
        );

      createItemFromTemplate(
        itemTemplate,
        [],
        MOCK_USER_SESSION,
        {
          folderId: "folderId",
          abc0cab401af4828a25cc6eaeb59fb69: {
            id: "abc1cab401af4828a25cc6eaeb59fb69"
          }
        },
        MOCK_USER_SESSION,
        function() {
          const tick = 0;
        }
      ).then(
        actual => {
          done.fail();
        },
        e => done()
      );
    });
  });

  describe("getGroupTitle", () => {
    it("handle error in get", done => {
      const name: string = "Dam Inspection Assignments";
      const id: string = "abc0cab401af4828a25cc6eaeb59fb69";

      fetchMock.get(
        "https://www.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments",
        mockItems.get400Failure()
      );

      getGroupTitle(name, id).then(r => {
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
          "https://www.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments",
          searchResult
        )
        .get(
          "https://www.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments_abc0cab401af4828a25cc6eaeb59fb69",
          mockItems.get400Failure()
        );

      getGroupTitle(name, id).then(r => {
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
        "https://www.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments",
        searchResult
      );

      getGroupTitle(name, id).then(response => {
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
          "https://www.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments",
          searchResult
        )
        .get(
          "https://www.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments_abc0cab401af4828a25cc6eaeb59fb69",
          emptySearchResult
        );

      getGroupTitle(name, id).then(response => {
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
          "https://www.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments",
          searchResult
        )
        .get(
          "https://www.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments_abc0cab401af4828a25cc6eaeb59fb69",
          searchResult
        )
        .get("*", emptySearchResult);

      getGroupTitle(name, id).then(response => {
        // this should have a current time stamp appended after "title"_"id"_
        expect(response).toContain(
          "Dam Inspection Assignments_abc0cab401af4828a25cc6eaeb59fb69_"
        );
        done();
      }, done.fail);
    });
  });

  describe("updateGroup", () => {
    it("should handle error", done => {
      const itemTemplate: IItemTemplate = mockItems.getItemTemplate();
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

      updateGroup(itemTemplate, MOCK_USER_SESSION, {
        abc0cab401af4828a25cc6eaeb59fb69: {
          id: "abc2cab401af4828a25cc6eaeb59fb69"
        }
      }).then(() => {
        done.fail();
      }, done);
    });

    it("should share dependencies with group", done => {
      const itemTemplate: IItemTemplate = mockItems.getItemTemplate();
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

      updateGroup(itemTemplate, MOCK_USER_SESSION, {
        abc0cab401af4828a25cc6eaeb59fb69: {
          id: "abc2cab401af4828a25cc6eaeb59fb69"
        }
      }).then(() => {
        done();
      }, done.fail);
    });
  });
});
