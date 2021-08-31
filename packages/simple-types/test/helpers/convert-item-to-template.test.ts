/** @license
 * Copyright 2020 Esri
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

import * as simpleTypes from "../../src/simple-types";
import * as utils from "../../../common/test/mocks/utils";
import * as staticRelatedItemsMocks from "../../../common/test/mocks/staticRelatedItemsMocks";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../../../common/test/mocks/agolItems";
import * as notebook from "../../src/notebook";
import * as templates from "../../../common/test/mocks/templates";
import * as common from "@esri/solution-common";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

const noResourcesResponse: any = {
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
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("simpleTypeConvertItemToTemplate", () => {
  describe("dashboard", () => {
    it("should handle dashboard et al. item types", done => {
      const solutionItemId = "sln1234567890";
      const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.itemId = "dsh1234567890";
      itemTemplate.item = mockItems.getAGOLItem("Dashboard", null);
      itemTemplate.item.thumbnail = null;

      const expectedTemplate: any = {
        itemId: "dsh1234567890",
        type: "Dashboard",
        item: {
          id: "{{dsh1234567890.itemId}}",
          type: "Dashboard",
          accessInformation: "Esri, Inc.",
          categories: [],
          contentStatus: null,
          culture: "en-us",
          description: "Description of an AGOL item",
          extent: [],
          spatialReference: undefined,
          licenseInfo: null,
          name: "Name of an AGOL item",
          origUrl: undefined,
          properties: null,
          snippet: "Snippet of an AGOL item",
          tags: ["test"],
          thumbnail: null,
          title: "An AGOL item",
          typeKeywords: ["JavaScript"],
          url: ""
        },
        data: ["abc", "def", "ghi"],
        resources: [],
        dependencies: [],
        relatedItems: [],
        groups: [],
        properties: {},
        estimatedDeploymentCostFactor: 2
      };

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/data",
          ["abc", "def", "ghi"]
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/resources",
          noResourcesResponse
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/info/metadata/metadata.xml",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/sln1234567890/addResources",
          utils.getSuccessResponse()
        );
      staticRelatedItemsMocks.fetchMockRelatedItems("dsh1234567890", {
        total: 0,
        relatedItems: []
      });

      simpleTypes
        .convertItemToTemplate(
          solutionItemId,
          itemTemplate.item,
          MOCK_USER_SESSION,
          {}
        )
        .then(newItemTemplate => {
          delete newItemTemplate.key; // key is randomly generated, and so is not testable
          expect(newItemTemplate).toEqual(expectedTemplate);
          done();
        }, done.fail);
    });
  });

  describe("form", () => {
    let solutionItemId: string;
    let itemTemplate: common.IItemTemplate;
    let expectedTemplate: any;

    beforeEach(() => {
      solutionItemId = "sln1234567890";
      itemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.itemId = "frm1234567890";
      itemTemplate.item = mockItems.getAGOLItem("Form", null);
      itemTemplate.item.thumbnail = null;

      expectedTemplate = {
        itemId: "frm1234567890",
        type: "Form",
        item: {
          id: "{{frm1234567890.itemId}}",
          type: "Form",
          accessInformation: "Esri, Inc.",
          categories: [],
          contentStatus: null,
          culture: "en-us",
          description: "Description of an AGOL item",
          extent: [],
          spatialReference: undefined,
          licenseInfo: null,
          name: "frm1234567890.zip",
          origUrl: undefined,
          properties: null,
          snippet: "Snippet of an AGOL item",
          tags: ["test"],
          thumbnail: null,
          title: "An AGOL item",
          typeKeywords: ["JavaScript"],
          url: ""
        },
        data: null, // forms don't store info here
        resources: ["frm1234567890_info_data/frm1234567890.zip"],
        relatedItems: [
          {
            relationshipType: "Survey2Data",
            relatedItemIds: ["srv1234567890", "abc1234567890"]
          },
          {
            relationshipType: "Survey2Service",
            relatedItemIds: ["srv1234567890"]
          }
        ],
        dependencies: ["srv1234567890", "abc1234567890"],
        groups: [],
        properties: {},
        estimatedDeploymentCostFactor: 2
      };

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/data",
          ["abc", "def", "ghi"]
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/resources",
          noResourcesResponse
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/info/metadata/metadata.xml",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/" +
            MOCK_USER_SESSION.username +
            "/items/" +
            solutionItemId +
            "/addResources",
          {
            success: true,
            itemId: itemTemplate.itemId,
            owner: MOCK_USER_SESSION.username,
            folder: null
          }
        );
      staticRelatedItemsMocks.fetchMockRelatedItems(
        itemTemplate.itemId,
        { total: 0, relatedItems: [] },
        ["Survey2Data", "Survey2Service"]
      );
      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/content/items/" +
          itemTemplate.itemId +
          "/relatedItems?f=json&direction=forward&relationshipType=Survey2Data&token=fake-token",
        {
          total: 2,
          relatedItems: [
            {
              id: "srv1234567890"
            },
            {
              id: "abc1234567890"
            }
          ]
        }
      );
      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/content/items/" +
          itemTemplate.itemId +
          "/relatedItems?f=json&direction=forward&relationshipType=Survey2Service&token=fake-token",
        {
          total: 1,
          relatedItems: [
            {
              id: "srv1234567890"
            }
          ]
        }
      );
    });

    const verifyFormTemplate = (done: DoneFn) => {
      return (newItemTemplate: common.IItemTemplate) => {
        delete newItemTemplate.key; // key is randomly generated, and so is not testable
        expect(newItemTemplate).toEqual(expectedTemplate);
        done();
      };
    };

    it("should handle form item type with default filename for falsy item name", done => {
      itemTemplate.item.name = null;

      simpleTypes
        .convertItemToTemplate(
          solutionItemId,
          itemTemplate.item,
          MOCK_USER_SESSION,
          {}
        )
        .then(verifyFormTemplate(done), done.fail);
    });

    it('should handle form item type with default filename for "undefined" string literal item name', done => {
      itemTemplate.item.name = "undefined";

      simpleTypes
        .convertItemToTemplate(
          solutionItemId,
          itemTemplate.item,
          MOCK_USER_SESSION,
          {}
        )
        .then(verifyFormTemplate(done), done.fail);
    });
  });

  describe("notebook", () => {
    it("should handle python notebook", done => {
      const solutionItemId = "sln1234567890";
      const item = {
        id: "abc0cab401af4828a25cc6eaeb59fb69",
        type: "Notebook",
        title: "Simple Notebook"
      };

      const dataResponse: any = mockItems.getAGOLItemData("Notebook");

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69/resources",
          noResourcesResponse
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69/info/metadata/metadata.xml",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69/data",
          dataResponse
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/sln1234567890/addResources",
          utils.getSuccessResponse()
        );
      staticRelatedItemsMocks.fetchMockRelatedItems(
        "abc0cab401af4828a25cc6eaeb59fb69",
        { total: 0, relatedItems: [] }
      );

      simpleTypes
        .convertItemToTemplate(solutionItemId, item, MOCK_USER_SESSION, {})
        .then(newItemTemplate => {
          expect(newItemTemplate.data).toEqual(
            templates.getItemTemplateData("Notebook")
          );
          done();
        }, done.fail);
    });
  });

  describe("oic", () => {
    it("should handle OIC (Oriented Imagery Catalog)", done => {
      const solutionItemId = "sln1234567890";
      const item: any = mockItems.getAGOLItem("Oriented Imagery Catalog", null);
      const data: any = mockItems.getAGOLItemData("Oriented Imagery Catalog");
      const service: any = mockItems.getAGOLService();

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/oic1234567890/data",
          data
        )
        .post(
          "https://services.arcgis.com/64491f8c348a51cf/arcgis/rest/services/OIC_FL_002/FeatureServer/0",
          service
        );
      staticRelatedItemsMocks.fetchMockRelatedItems("oic1234567890", {
        total: 0,
        relatedItems: []
      });

      simpleTypes
        .convertItemToTemplate(solutionItemId, item, MOCK_USER_SESSION, {})
        .then(newItemTemplate => {
          const expectedTemplate = templates.getItemTemplate(
            "Oriented Imagery Catalog",
            ["svc1234567890"]
          );
          expectedTemplate.item.extent = [];
          expectedTemplate.item.thumbnail = "thumbnail/ago_downloaded.png";
          newItemTemplate.key = expectedTemplate.key;

          expect(newItemTemplate).toEqual(expectedTemplate);
          done();
        }, done.fail);
    });
  });

  describe("quick capture", () => {
    it("should handle quick capture project", done => {
      const solutionItemId = "ee67658b2a98450cba051fd001463df0";
      const resources: any = {
        total: 1,
        start: 1,
        num: 1,
        nextStart: -1,
        resources: [
          {
            resource: "qc.project.json",
            created: 1579127879000,
            size: 29882,
            access: "inherit",
            type: "application/json"
          }
        ]
      };

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/qck1234567890/resources",
          resources
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/qck1234567890/info/metadata/metadata.xml",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/qck1234567890/info/thumbnail/ago_downloaded.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/qck1234567890/resources/images/Camera.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/qck1234567890/resources/qc.project.json",
          utils.getSampleJsonAsFile("qc.project.json"),
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            solutionItemId +
            "/addResources",
          { success: true, id: solutionItemId }
        );
      staticRelatedItemsMocks.fetchMockRelatedItems("qck1234567890", {
        total: 0,
        relatedItems: []
      });

      const itemInfo: common.IItemTemplate = mockItems.getAGOLItem(
        "QuickCapture Project",
        null
      );

      const expected: common.IItemTemplate = {
        itemId: "qck1234567890",
        key: "vx3ubyx3",
        data: Object({
          application: Object(utils.getSampleJson()),
          name: "qc.project.json"
        }),
        resources: [],
        dependencies: [],
        relatedItems: [],
        groups: [],
        type: "QuickCapture Project",
        item: {
          id: "{{qck1234567890.itemId}}",
          type: "QuickCapture Project",
          accessInformation: "Esri, Inc.",
          categories: [],
          contentStatus: null,
          culture: "en-us",
          description: "Description of an AGOL item",
          extent: [],
          spatialReference: undefined,
          licenseInfo: null,
          name: "Name of an AGOL item",
          origUrl: undefined,
          properties: null,
          snippet: "Snippet of an AGOL item",
          tags: ["test"],
          thumbnail: "thumbnail/ago_downloaded.png",
          title: "An AGOL item",
          typeKeywords: ["JavaScript"],
          url: ""
        },
        properties: {},
        estimatedDeploymentCostFactor: 2
      };

      simpleTypes
        .convertItemToTemplate(solutionItemId, itemInfo, MOCK_USER_SESSION, {})
        .then(actual => {
          actual.key = expected.key;
          expect(actual).toEqual(expected);
          done();
        }, done.fail);
    });
  });

  describe("web mapping application", () => {
    it("should handle web mapping application", done => {
      const solutionItemId = "sln1234567890";
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Web Mapping Application",
        null
      );

      itemTemplate.item = {
        id: "abc0cab401af4828a25cc6eaeb59fb69",
        type: "Web Mapping Application",
        title: "Voting Centers",
        contentStatus: null,
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
          id: "{{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
          type: "Web Mapping Application",
          accessInformation: undefined,
          categories: undefined,
          contentStatus: null,
          culture: undefined,
          description: undefined,
          extent: "{{solutionItemExtent}}",
          spatialReference: undefined,
          tags: undefined,
          thumbnail: undefined,
          typeKeywords: undefined,
          url:
            "{{portalBaseUrl}}/home/item.html?id={{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
          licenseInfo: undefined,
          origUrl: undefined,
          properties: undefined,
          name: undefined,
          snippet: undefined
        } as any,
        data: {
          appItemId: "{{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
          values: {
            webmap: "{{myMapId.itemId}}"
          },
          map: {
            appProxy: {
              mapItemId: "{{mapItemId.itemId}}"
            },
            itemId: "{{mapItemId.itemId}}"
          },
          folderId: "{{folderId}}"
        },
        resources: [] as any[],
        dependencies: ["myMapId"],
        relatedItems: [] as common.IRelatedItems[],
        groups: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 2
      };

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69/resources",
          []
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69/data",
          new Blob([JSON.stringify(itemTemplate.data)], {
            type: "application/json"
          }),
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/sln1234567890/addResources",
          utils.getSuccessResponse()
        );
      staticRelatedItemsMocks.fetchMockRelatedItems(
        "abc0cab401af4828a25cc6eaeb59fb69",
        { total: 0, relatedItems: [] }
      );

      simpleTypes
        .convertItemToTemplate(
          solutionItemId,
          itemTemplate.item,
          MOCK_USER_SESSION,
          {}
        )
        .then(
          actual => {
            actual.key = "abcdefgh";
            expect(actual).toEqual(expected);
            done();
          },
          e => done.fail(e)
        );
    });

    it("should handle error on web mapping application: data section", done => {
      const solutionItemId = "sln1234567890";
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
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

      fetchMock
        .post("https://fake.com/arcgis/rest/info", {})
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69/resources",
          []
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69/data",
          mockItems.get400FailureResponse()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/sln1234567890/addResources",
          utils.getSuccessResponse()
        );
      staticRelatedItemsMocks.fetchMockRelatedItems(
        "abc0cab401af4828a25cc6eaeb59fb69",
        { total: 0, relatedItems: [] }
      );

      simpleTypes
        .convertItemToTemplate(
          solutionItemId,
          itemTemplate.item,
          MOCK_USER_SESSION,
          {}
        )
        .then(() => done());
    });

    it("should handle error on web mapping application: feature layer", done => {
      const solutionItemId = "sln1234567890";
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
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
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse()
        )
        .post("https://fake.com/arcgis/rest/info", {})
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69/resources",
          []
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69/data",
          data
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/sln1234567890/addResources",
          utils.getSuccessResponse()
        )
        .post(
          "https://fake.com/arcgis/rest/services/test/FeatureServer/0",
          mockItems.get400FailureResponse()
        );
      staticRelatedItemsMocks.fetchMockRelatedItems(
        "abc0cab401af4828a25cc6eaeb59fb69",
        { total: 0, relatedItems: [] }
      );

      simpleTypes
        .convertItemToTemplate(
          solutionItemId,
          itemTemplate.item,
          MOCK_USER_SESSION,
          {}
        )
        .then(
          () => done.fail(),
          () => done()
        );
    });

    it("should handle web mapping application with missing data section and source URL", done => {
      const solutionItemId = "sln1234567890";
      // Related to issue: #56
      // To add support for simple apps such as those that we create for "Getting to Know"
      // A new app should be created in the users org but we will retain the source URL
      const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
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
          id: "{{wma1234567890.itemId}}",
          type: "Web Mapping Application",
          accessInformation: "Esri, Inc.",
          categories: [],
          contentStatus: null,
          culture: "en-us",
          description: "Description of an AGOL item",
          extent: [],
          origUrl: undefined,
          properties: null,
          spatialReference: undefined,
          licenseInfo: null,
          name: "Name of an AGOL item",
          snippet: "Snippet of an AGOL item",
          tags: ["test"],
          thumbnail: null,
          title: "An AGOL item",
          typeKeywords: ["JavaScript"],
          url:
            "http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=wma1234567890"
        },
        data: null,
        resources: [],
        dependencies: [],
        relatedItems: [],
        groups: [],
        properties: {},
        estimatedDeploymentCostFactor: 2
      };

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/data",
          200
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/resources",
          noResourcesResponse
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/info/metadata/metadata.xml",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            solutionItemId +
            "/addResources",
          { success: true, id: solutionItemId }
        );
      staticRelatedItemsMocks.fetchMockRelatedItems("wma1234567890", {
        total: 0,
        relatedItems: []
      });

      simpleTypes
        .convertItemToTemplate(
          solutionItemId,
          itemTemplate.item,
          MOCK_USER_SESSION,
          {}
        )
        .then(newItemTemplate => {
          delete newItemTemplate.key; // key is randomly generated, and so is not testable
          expect(newItemTemplate).toEqual(expectedTemplate);
          done();
        }, done.fail);
    });
  });

  describe("workforce", () => {
    it("should handle workforce project", done => {
      const solutionItemId = "sln1234567890";
      const item = {
        id: "abc0cab401af4828a25cc6eaeb59fb69",
        type: "Workforce Project",
        title: "Dam Inspection Assignments"
      };

      const expectedTemplateData: any = {
        workerWebMapId: "{{abc116555b16437f8435e079033128d0.itemId}}",
        dispatcherWebMapId: "{{abc26a244163430590151395821fb845.itemId}}",
        dispatchers: {
          serviceItemId: "{{abc302ec12b74d2f9f2b3cc549420086.layer0.itemId}}",
          url: "{{abc302ec12b74d2f9f2b3cc549420086.layer0.url}}"
        },
        assignments: {
          serviceItemId: "{{abc4494043c3459faabcfd0e1ab557fc.layer0.itemId}}",
          url: "{{abc4494043c3459faabcfd0e1ab557fc.layer0.url}}"
        },
        workers: {
          serviceItemId: "{{abc5dd4bdd18437f8d5ff1aa2d25fd7c.layer0.itemId}}",
          url: "{{abc5dd4bdd18437f8d5ff1aa2d25fd7c.layer0.url}}"
        },
        tracks: {
          serviceItemId: "{{abc64329e69144c59f69f3f3e0d45269.layer0.itemId}}",
          url: "{{abc64329e69144c59f69f3f3e0d45269.layer0.url}}",
          enabled: true,
          updateInterval: 300
        },
        version: "1.2.0",
        groupId: "{{abc715c2df2b466da05577776e82d044.itemId}}",
        folderId: "{{folderId}}",
        assignmentIntegrations: [
          {
            id: "default-navigator",
            prompt: "Navigate to Assignment",
            urlTemplate:
              "arcgis-navigator://?stop=${assignment.latitude},{itemID={{cad3483e025c47338d43df308c117308.itemId}}},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt={itemID={{bad3483e025c47338d43df308c117308.itemId}}}://Workforce",
            assignmentTypes: [
              {
                urlTemplate:
                  "arcgis-navigator://?stop=${assignment.latitude},{itemID={{cad3483e025c47338d43df308c117308.itemId}}},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt={itemID={{bad3483e025c47338d43df308c117308.itemId}}}://Workforce"
              }
            ]
          }
        ]
      };

      const dataResponse: any = mockItems.getAGOLItemData("Workforce Project");

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69/resources",
          noResourcesResponse
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69/info/metadata/metadata.xml",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            solutionItemId +
            "/addResources",
          { success: true, id: solutionItemId }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69/data",
          dataResponse
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/groups/grp1234567890?f=json&token=fake-token",
          {}
        );
      staticRelatedItemsMocks.fetchMockRelatedItems(
        "abc0cab401af4828a25cc6eaeb59fb69",
        { total: 0, relatedItems: [] }
      );

      simpleTypes
        .convertItemToTemplate(solutionItemId, item, MOCK_USER_SESSION, {})
        .then(newItemTemplate => {
          expect(newItemTemplate.data).toEqual(expectedTemplateData);
          done();
        }, done.fail);
    });
  });
});
