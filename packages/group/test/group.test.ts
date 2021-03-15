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
 * Provides tests for common functions involving the creation and deployment of group item types.
 */

import * as group from "../src/group";
import * as utils from "../../common/test/mocks/utils";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as templates from "../../common/test/mocks/templates";
import * as common from "@esri/solution-common";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

const resourcesResponse: any = {
  total: 0,
  start: 1,
  num: 0,
  nextStart: -1,
  resources: []
};

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

afterEach(() => {
  fetchMock.restore();
  resourcesResponse.resources = [];
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `group`: manages the creation and deployment of groups", () => {
  describe("convertItemToTemplate", () => {
    it("should handle error on getGroupBase", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
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
          tags: [],
          thumbnail: "ROWPermitManager.png"
        },
        data: {},
        resources: [],
        dependencies: [],
        groups: [],
        properties: {},
        estimatedDeploymentCostFactor: 2
      };

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
          groupResource
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/groups/grp1234567890?f=json&token=fake-token",
          groupResource
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/grp1234567890/resources",
          resourcesResponse
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

    it("should handle error on portal getGroupBase", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
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
          tags: [],
          thumbnail: "ROWPermitManager.png"
        },
        data: {},
        resources: [],
        dependencies: ["156bf2715e9e4098961c4a2a6848fa20"],
        groups: [],
        properties: {},
        estimatedDeploymentCostFactor: 2
      };

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
          groupResource
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/groups/grp1234567890?f=json&token=fake-token",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/grp1234567890/resources",
          resourcesResponse
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
      const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
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

      resourcesResponse.resources.push({ resource: "name.png" });

      const expectedTemplate: any = {
        itemId: "grp1234567890",
        type: "Group",
        item: {
          type: "Group",
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
        groups: [],
        properties: {},
        estimatedDeploymentCostFactor: 2
      };

      const blob = new Blob(["fake-blob"], { type: "text/plain" });

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
          groupResource
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/groups/grp1234567890?f=json&token=fake-token",
          groupResource
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/grp1234567890/resources",
          resourcesResponse
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/grp1234567890/resources/name.png",
          blob,
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/community/groups/grp1234567890/info/metadata/metadata.xml",
          blob,
          { sendAsJson: false }
        );

      group
        .convertItemToTemplate(
          itemTemplate.itemId,
          itemTemplate.item,
          MOCK_USER_SESSION
        )
        .then(actual => {
          delete actual.key; // key is randomly generated, and so is not testable
          expect(actual).toEqual(expectedTemplate);
          done();
        }, done.fail);
    });

    it("should handle error on getItemResources", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.itemId = "abc0cab401af4828a25cc6eaeb59fb69";
      itemTemplate.item = mockItems.getAGOLItem("Group", null);

      const groupResource: any = {
        type: "Group",
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

      resourcesResponse.resources.push({ resource: "name.png" });

      const expectedTemplate: any = {
        itemId: "grp1234567890",
        type: "Group",
        item: {
          type: "Group",
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
        groups: [],
        properties: {},
        estimatedDeploymentCostFactor: 2
      };

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
          groupResource
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/groups/grp1234567890?f=json&token=fake-token",
          groupResource
        );

      spyOn(common, "getItemResources").and.callFake(() => Promise.reject());

      group
        .convertItemToTemplate(
          itemTemplate.itemId,
          itemTemplate.item,
          MOCK_USER_SESSION
        )
        .then(actual => {
          delete actual.key; // key is randomly generated, and so is not testable
          expect(actual).toEqual(expectedTemplate);
          done();
        }, done.fail);
    });
  });

  describe("createItemFromTemplate", () => {
    it("should create group", done => {
      const itemId: string = "abc9cab401af4828a25cc6eaeb59fb69";
      const newItemID: string = "abc8cab401af4828a25cc6eaeb59fb69";
      const user: any = {
        groups: []
      };
      const templateDictionary: any = { user };

      const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.itemId = itemId;
      itemTemplate.type = "Group";
      itemTemplate.item.title = "Dam Inspection Assignments";

      const expected: any = { user };
      expected[itemId] = {
        itemId: newItemID
      };

      fetchMock.post(utils.PORTAL_SUBSET.restUrl + "/community/createGroup", {
        success: true,
        group: { id: newItemID }
      });

      const expectedClone: common.IItemTemplate = common.cloneObject(
        itemTemplate
      );
      expectedClone.itemId = newItemID;

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      group
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          expect(response).toEqual({
            item: expectedClone,
            id: newItemID,
            type: itemTemplate.type,
            postProcess: false
          });
          expect(templateDictionary).toEqual(expected);
          done();
        });
    });

    it("should create group with thumbnail", done => {
      const itemId: string = "abc9cab401af4828a25cc6eaeb59fb69";
      const newItemID: string = "abc8cab401af4828a25cc6eaeb59fb69";
      const user: any = {
        groups: []
      };
      const templateDictionary: any = { user };

      const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.itemId = itemId;
      itemTemplate.type = "Group";
      itemTemplate.item.title = "Dam Inspection Assignments";
      itemTemplate.item.thumbnailurl =
        "abc9cab401af4828a25cc6eaeb59fb69_info_thumbnail/ago_downloaded.png";

      const expected: any = { user };
      expected[itemId] = {
        itemId: newItemID
      };

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc9cab401af4828a25cc6eaeb59fb69/resources/" +
            itemTemplate.item.thumbnail,
          utils.getSampleImageAsBlob()
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/community/createGroup", {
          success: true,
          group: { id: newItemID }
        });

      const expectedClone: common.IItemTemplate = common.cloneObject(
        itemTemplate
      );
      expectedClone.itemId = newItemID;

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      group
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          expect(response).toEqual({
            item: expectedClone,
            id: newItemID,
            type: itemTemplate.type,
            postProcess: false
          });
          expect(templateDictionary).toEqual(expected);
          done();
        });
    });

    it("should handle success === false on create group", done => {
      const itemId: string = "abc9cab401af4828a25cc6eaeb59fb69";
      const newItemID: string = "abc8cab401af4828a25cc6eaeb59fb69";
      const user: any = {
        groups: []
      };
      const templateDictionary: any = { user };

      const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.itemId = itemId;
      itemTemplate.type = "Group";
      itemTemplate.item.title = null;

      fetchMock.post(utils.PORTAL_SUBSET.restUrl + "/community/createGroup", {
        success: false
      });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      group
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          expect(response).toEqual(templates.getFailedItem("Group"));
          done();
        });
    });

    it("should handle error on create group", done => {
      const itemId: string = "abc9cab401af4828a25cc6eaeb59fb69";
      const user: any = {
        groups: []
      };
      const templateDictionary: any = { user };

      const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.itemId = itemId;
      itemTemplate.type = "Group";
      itemTemplate.item.title = "Dam Inspection Assignments";

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/community/createGroup",
        mockItems.get400Failure()
      );

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      group
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          expect(response).toEqual(templates.getFailedItem("Group"));
          done();
        });
    });

    it("should handle cancellation before deployment of group starts", done => {
      const itemTemplate: common.IItemTemplate = templates.getGroupTemplatePart();
      const templateDictionary: any = {};

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      group
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallbackOnNthCall(1)
        )
        .then(response => {
          expect(response).toEqual(templates.getFailedItem(itemTemplate.type));
          done();
        }, done.fail);
    });

    it("should handle cancellation after deployed group is created", done => {
      const itemTemplate: common.IItemTemplate = templates.getGroupTemplatePart();
      const templateDictionary: any = {};

      fetchMock
        .post(utils.PORTAL_SUBSET.restUrl + "/community/createGroup", {
          success: true,
          group: { id: itemTemplate.itemId }
        })
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/community/groups/grp1234567890/delete",
          utils.getSuccessResponse({ groupId: itemTemplate.itemId })
        );

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      group
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallbackOnNthCall(2)
        )
        .then(response => {
          expect(response).toEqual(templates.getFailedItem(itemTemplate.type));
          done();
        });
    });

    it("should handle cancellation failure after deployed group is created", done => {
      const itemTemplate: common.IItemTemplate = templates.getGroupTemplatePart();
      const templateDictionary: any = {};

      fetchMock
        .post(utils.PORTAL_SUBSET.restUrl + "/community/createGroup", {
          success: true,
          group: { id: itemTemplate.itemId }
        })
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/community/groups/grp1234567890/delete",
          utils.getFailureResponse({ groupId: itemTemplate.itemId })
        );

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      group
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallbackOnNthCall(2)
        )
        .then(response => {
          expect(response).toEqual(templates.getFailedItem(itemTemplate.type));
          done();
        });
    });

    it("should handle cancellation after deployed group is finished", done => {
      const itemTemplate: common.IItemTemplate = templates.getGroupTemplatePart();
      const templateDictionary: any = {};

      fetchMock
        .post(utils.PORTAL_SUBSET.restUrl + "/community/createGroup", {
          success: true,
          group: { id: itemTemplate.itemId }
        })
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/community/groups/grp1234567890/delete",
          utils.getSuccessResponse({ groupId: itemTemplate.itemId })
        );

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      group
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallbackOnNthCall(3)
        )
        .then(response => {
          expect(response).toEqual(templates.getFailedItem(itemTemplate.type));
          done();
        });
    });

    it("should handle cancellation after deployed group is finished", done => {
      const itemTemplate: common.IItemTemplate = templates.getGroupTemplatePart();
      const templateDictionary: any = {};

      fetchMock
        .post(utils.PORTAL_SUBSET.restUrl + "/community/createGroup", {
          success: true,
          group: { id: itemTemplate.itemId }
        })
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/community/groups/grp1234567890/delete",
          utils.getFailureResponse({ groupId: itemTemplate.itemId })
        );

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      group
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallbackOnNthCall(3)
        )
        .then(response => {
          expect(response).toEqual(templates.getFailedItem(itemTemplate.type));
          done();
        });
    });
  });
});
