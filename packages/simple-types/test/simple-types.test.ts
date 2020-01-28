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

import * as simpleTypes from "../src/simple-types";
import * as utils from "../../common/test/mocks/utils";
import * as staticDashboardMocks from "../../common/test/mocks/staticDashboardMocks";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as templates from "../../common/test/mocks/templates";
import * as common from "@esri/solution-common";
import * as quickcapture from "../src/quickcapture";

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
    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
      it("should handle error on getResources", done => {
        const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
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
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/data",
            mockItems.get500Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/info/metadata/metadata.xml",
            mockItems.get500Failure()
          );

        simpleTypes
          .convertItemToTemplate(
            itemTemplate.item.id,
            itemTemplate.item,
            MOCK_USER_SESSION
          )
          .then(newItemTemplate => {
            expect(newItemTemplate.resources).toEqual([]);
            done();
          }, done.fail);
      });

      it("should handle error on dataPromise", done => {
        const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
          "Web Mapping Application",
          null
        );
        const itemId: string = "abc0cab401af4828a25cc6eaeb59fb69";
        itemTemplate.item = {
          id: itemId,
          type: "Web Mapping Application",
          title: "Dam Inspection Assignments"
        };
        itemTemplate.itemId = itemId;

        const url = common.getItemDataBlobUrl(itemId, MOCK_USER_SESSION);
        fetchMock
          .post(url, mockItems.get400Failure())
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/resources",
            mockItems.get400Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/info/metadata/metadata.xml",
            mockItems.get500Failure()
          );

        simpleTypes
          .convertItemToTemplate(
            itemTemplate.item.id,
            itemTemplate.item,
            MOCK_USER_SESSION
          )
          .then(() => {
            done.fail();
          }, done);
      });

      it("should handle workforce project", done => {
        const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
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
            mockItems.get500Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/abc0cab401af4828a25cc6eaeb59fb69/addResources",
            { success: true, id: itemTemplate.itemId }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/data",
            dataResponse
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/community/groups/grp1234567890?f=json&token=fake-token",
            {}
          );

        simpleTypes
          .convertItemToTemplate(
            itemTemplate.item.id,
            itemTemplate.item,
            MOCK_USER_SESSION
          )
          .then(newItemTemplate => {
            expect(newItemTemplate.data).toEqual(expectedTemplateData);
            done();
          }, done.fail);
      });

      it("should handle quick capture project", done => {
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
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/xxx1234567890/resources",
            resources
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/xxx1234567890/info/metadata/metadata.xml",
            mockItems.get500Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/xxx1234567890/info/thumbnail/ago_downloaded.png",
            utils.getSampleImage(),
            { sendAsJson: false }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/xxx1234567890/resources/images/Camera.png",
            utils.getSampleImage(),
            { sendAsJson: false }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/xxx1234567890/resources/qc.project.json",
            {}
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/ee67658b2a98450cba051fd001463df0/addResources",
            { success: true, id: "ee67658b2a98450cba051fd001463df0" }
          );

        const itemInfo: common.IItemTemplate = mockItems.getAGOLItem(
          "QuickCapture Project",
          null
        );

        const expected: common.IItemTemplate = {
          itemId: "xxx1234567890",
          key: "vx3ubyx3",
          data: Object({ application: Object({}), name: "qc.project.json" }),
          resources: [
            "xxx1234567890/qc.project.json",
            "xxx1234567890_info_thumbnail/ago_downloaded.png"
          ],
          dependencies: [],
          circularDependencies: [],
          type: "QuickCapture Project",
          item: {
            id: "{{xxx1234567890.itemId}}",
            type: "QuickCapture Project",
            accessInformation: "Esri, Inc.",
            categories: [],
            contentStatus: null,
            culture: "en-us",
            description: "Description of an AGOL item",
            extent: [],
            licenseInfo: null,
            name: "Name of an AGOL item",
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
          .convertItemToTemplate(
            "ee67658b2a98450cba051fd001463df0",
            itemInfo,
            MOCK_USER_SESSION
          )
          .then(actual => {
            actual.key = expected.key;
            expect(actual).toEqual(expected);
            done();
          }, done.fail);
      });

      it("should handle python notebook", done => {
        const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
          "Notebook"
        );
        itemTemplate.item = {
          id: "abc0cab401af4828a25cc6eaeb59fb69",
          type: itemTemplate.type,
          title: "Simple Notebook"
        };

        const dataResponse: any = mockItems.getAGOLItemData("Notebook");

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/resources",
            noResourcesResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/info/metadata/metadata.xml",
            mockItems.get500Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/data",
            dataResponse
          );

        simpleTypes
          .convertItemToTemplate(
            itemTemplate.item.id,
            itemTemplate.item,
            MOCK_USER_SESSION
          )
          .then(newItemTemplate => {
            expect(newItemTemplate.data).toEqual(
              templates.getItemTemplateData("Notebook")
            );
            done();
          }, done.fail);
      });

      it("should handle item resource", done => {
        const itemTemplate: common.IItemTemplate = templates.getItemTemplate();
        itemTemplate.item = mockItems.getAGOLItem("Web Map", null);
        itemTemplate.item.item = itemTemplate.itemId = itemTemplate.item.id;
        itemTemplate.item.thumbnail = "thumbnail/banner.png";

        const expectedFetch = mockItems.getAnImageResponse();

        const expectedTemplate: any = {
          itemId: "map1234567890",
          type: "Web Map",
          item: {
            id: "{{map1234567890.itemId}}",
            type: "Web Map",
            accessInformation: "Esri, Inc.",
            categories: [],
            contentStatus: null,
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
              "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{map1234567890.itemId}}"
          },
          data: undefined,
          resources: [
            "map1234567890_image/banner.png",
            "map1234567890_info_thumbnail/banner.png"
          ],
          dependencies: [],
          circularDependencies: [],
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
            expectedFetch,
            { sendAsJson: false }
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
            expectedFetch,
            { sendAsJson: false }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/data",
            mockItems.get500Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/info/metadata/metadata.xml",
            mockItems.get400Failure()
          );

        simpleTypes
          .convertItemToTemplate(
            itemTemplate.item.id,
            itemTemplate.item,
            MOCK_USER_SESSION
          )
          .then(newItemTemplate => {
            delete newItemTemplate.key; // key is randomly generated, and so is not testable
            expect(newItemTemplate).toEqual(expectedTemplate);
            done();
          }, done.fail);
      });

      it("should handle dashboard et al. item types", done => {
        const itemTemplate: common.IItemTemplate = templates.getItemTemplate();
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
            licenseInfo: null,
            name: "Name of an AGOL item",
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
          circularDependencies: [],
          properties: {},
          estimatedDeploymentCostFactor: 2
        };

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/data",
            ["abc", "def", "ghi"]
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
            mockItems.get400Failure()
          );

        simpleTypes
          .convertItemToTemplate(
            itemTemplate.item.id,
            itemTemplate.item,
            MOCK_USER_SESSION
          )
          .then(newItemTemplate => {
            delete newItemTemplate.key; // key is randomly generated, and so is not testable
            expect(newItemTemplate).toEqual(expectedTemplate);
            done();
          }, done.fail);
      });

      it("should handle form item type with default filename", done => {
        const itemTemplate: common.IItemTemplate = templates.getItemTemplate();
        itemTemplate.itemId = "frm1234567890";
        itemTemplate.item = mockItems.getAGOLItem("Form", null);
        itemTemplate.item.thumbnail = null;
        itemTemplate.item.name = null;

        const expectedTemplate: any = {
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
            licenseInfo: null,
            name: "formData.zip",
            snippet: "Snippet of an AGOL item",
            tags: ["test"],
            thumbnail: null,
            title: "An AGOL item",
            typeKeywords: ["JavaScript"],
            url: ""
          },
          data: null, // forms don't store info here
          resources: ["frm1234567890_info_form/formData.zip"],
          dependencies: ["srv1234567890"],
          circularDependencies: [],
          properties: {},
          estimatedDeploymentCostFactor: 2
        };

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/data",
            ["abc", "def", "ghi"]
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/relatedItems?f=json&direction=forward&relationshipType=Survey2Service&token=fake-token",
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
                  extent: [
                    [-131.0, 16.0],
                    [-57.0, 58.0]
                  ],
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
            mockItems.get400Failure()
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

        simpleTypes
          .convertItemToTemplate(
            itemTemplate.item.id,
            itemTemplate.item,
            MOCK_USER_SESSION
          )
          .then(newItemTemplate => {
            delete newItemTemplate.key; // key is randomly generated, and so is not testable
            expect(newItemTemplate).toEqual(expectedTemplate);
            done();
          }, done.fail);
      });

      it("should handle web mapping application with missing data", done => {
        // Related to issue: #56
        // To add support for simple apps such as those that we create for "Getting to Know"
        // A new app should be created in the users org but we will retain the source URL
        const itemTemplate: common.IItemTemplate = templates.getItemTemplate();
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
          circularDependencies: [],
          properties: {},
          estimatedDeploymentCostFactor: 2
        };

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/data",
            200
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
            mockItems.get400Failure()
          );

        simpleTypes
          .convertItemToTemplate(
            itemTemplate.item.id,
            itemTemplate.item,
            MOCK_USER_SESSION
          )
          .then(newItemTemplate => {
            delete newItemTemplate.key; // key is randomly generated, and so is not testable
            expect(newItemTemplate).toEqual(expectedTemplate);
            done();
          }, done.fail);
      });

      it("should catch fetch errors", done => {
        // TODO resolve Karma internal error triggered by this test
        const itemTemplate: common.IItemTemplate = templates.getItemTemplate();
        itemTemplate.item = mockItems.getAGOLItem("Form", null);
        itemTemplate.itemId = itemTemplate.item.id;
        itemTemplate.item.thumbnail = null;

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/frm1234567890/info/metadata/metadata.xml",
            mockItems.get500Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/frm1234567890/resources",
            mockItems.get500Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/frm1234567890/data",
            mockItems.get500Failure()
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/frm1234567890/relatedItems?f=json&direction=forward&relationshipType=Survey2Service&token=fake-token",
            mockItems.get500Failure()
          );

        simpleTypes
          .convertItemToTemplate(
            itemTemplate.item.id,
            itemTemplate.item,
            MOCK_USER_SESSION
          )
          .then(newItemTemplate => {
            expect(newItemTemplate.data).toBeNull();
            expect(newItemTemplate.resources).toEqual([]);
            expect(newItemTemplate.dependencies).toEqual([]);
            done();
          }, done.fail);
      });

      it("should catch wrapup errors", done => {
        const itemTemplate: common.IItemTemplate = templates.getItemTemplate();
        itemTemplate.item = mockItems.getAGOLItem("Form", null);
        itemTemplate.itemId = itemTemplate.item.id;
        itemTemplate.item.thumbnail = null;
        itemTemplate.item.name = "form.zip";

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/data",
            utils.getSampleZip(),
            { sendAsJson: false }
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
            mockItems.get400Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/" +
              MOCK_USER_SESSION.username +
              "/items/" +
              itemTemplate.itemId +
              "/addResources",
            mockItems.get400Failure()
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
              itemTemplate.itemId +
              "/relatedItems?f=json&direction=forward&relationshipType=Survey2Service&token=fake-token",
            mockItems.get500Failure()
          );

        simpleTypes
          .convertItemToTemplate(
            itemTemplate.item.id,
            itemTemplate.item,
            MOCK_USER_SESSION
          )
          .then(
            () => done.fail(),
            response => {
              expect(response.error.code).toEqual(400);
              expect(response.error.message).toEqual(
                "Item does not exist or is inaccessible."
              );
              done();
            }
          );
      });

      it("should handle web mapping application 1", done => {
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
            extent: undefined,
            tags: undefined,
            thumbnail: undefined,
            typeKeywords: undefined,
            url:
              "{{portalBaseUrl}}/home/item.html?id={{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
            licenseInfo: undefined,
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
          circularDependencies: [] as string[],
          properties: {} as any,
          estimatedDeploymentCostFactor: 2
        };

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/resources",
            []
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/data",
            new Blob([JSON.stringify(itemTemplate.data)], {
              type: "application/json"
            }),
            { sendAsJson: false }
          );

        simpleTypes
          .convertItemToTemplate(
            itemTemplate.item.id,
            itemTemplate.item,
            MOCK_USER_SESSION
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

      it("should handle error on web mapping application", done => {
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
                url:
                  "https://fake.com/arcgis/rest/services/test/FeatureServer/0"
              }
            },
            settings: {}
          }
        };
        fetchMock
          .post("https://fake.com/arcgis/rest/info", {})
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/resources",
            []
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/abc0cab401af4828a25cc6eaeb59fb69/data",
            data
          )
          .post(
            "https://fake.com/arcgis/rest/services/test/FeatureServer/0",
            mockItems.get400FailureResponse()
          );

        simpleTypes
          .convertItemToTemplate(
            itemTemplate.item.id,
            itemTemplate.item,
            MOCK_USER_SESSION
          )
          .then(
            () => done.fail(),
            () => done()
          );
      });
    }
  });

  describe("createItemFromTemplate", () => {
    it("should handle error on addItem", done => {
      const itemId: string = "abc0cab401af4828a25cc6eaeb59fb69";
      const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";
      const templateDictionary: any = {};

      const itemTemplate: common.IItemTemplate = templates.getItemTemplate();
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

      simpleTypes
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

    it("should handle success === false", done => {
      const itemId: string = "abc0cab401af4828a25cc6eaeb59fb69";
      const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";
      const templateDictionary: any = {};

      const itemTemplate: common.IItemTemplate = templates.getItemTemplate();
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

      simpleTypes
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

    if (typeof window !== "undefined") {
      it("should create and fine tune python notebook", done => {
        const itemTemplate: common.IItemTemplate = templates.getItemTemplatePart(
          "Notebook"
        );
        itemTemplate.data = mockItems.getAGOLItemData("Notebook");

        const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";
        const expected: any = {};
        expected[itemTemplate.itemId] = { itemId: newItemID };
        const templateDictionary: any = {};

        const userUrl: string =
          "https://myorg.maps.arcgis.com/sharing/rest/community/users/casey?f=json&token=fake-token";

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
            username: "casey",
            fullName: "casey"
          });

        simpleTypes
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
          .then(r => {
            expect(templateDictionary).toEqual(expected);
            expect(r).toEqual(newItemID);
            done();
          }, done.fail);
      });

      it("should handle error on python notebook update item", done => {
        const itemTemplate: common.IItemTemplate = templates.getItemTemplatePart(
          "Notebook"
        );
        itemTemplate.data = mockItems.getAGOLItemData("Notebook");

        const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";
        const expected: any = {};
        expected[itemTemplate.itemId] = { itemId: newItemID };
        const templateDictionary: any = {};

        const userUrl: string =
          "https://myorg.maps.arcgis.com/sharing/rest/community/users/casey?f=json&token=fake-token";

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
            { success: true, id: newItemID }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/" +
              newItemID +
              "/update",
            mockItems.get400Failure()
          )
          .get(userUrl, {
            username: "casey",
            fullName: "casey"
          });

        simpleTypes
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
          .then(() => done.fail, done);
      });
    }

    it("should create and fine tune workforce project", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplatePart(
        "Workforce Project"
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";
      const expected: any = {};
      expected[itemTemplate.itemId] = { itemId: newItemID };
      const templateDictionary: any = {};

      const userUrl: string =
        "https://myorg.maps.arcgis.com/sharing/rest/community/users/casey?f=json&token=fake-token";
      const queryUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/query?f=json&where=userId%20%3D%20%27casey%27&outFields=*&token=fake-token";
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
          username: "casey",
          fullName: "casey"
        })
        .get(queryUrl, {
          features: []
        })
        .post(addUrl, {
          addResults: [{}]
        });

      simpleTypes
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
        .then(r => {
          expect(templateDictionary).toEqual(expected);
          expect(r).toEqual(newItemID);
          done();
        }, done.fail);
    });

    it("should create quick capture project", done => {
      const newItemId: string = "xxx79c91fc7642ebb4c0bbacfbacd510";

      const templateDictionary: any = {
        user: {
          email: "casey@esri.com"
        },
        "4efe5f693de34620934787ead6693f10": {
          itemId: "xxxe5f693de34620934787ead6693f10",
          layer0: {
            url: "https://abc123/name/FeatureServer/0"
          },
          layer1: {
            url: "https://abc123/name/FeatureServer/1"
          }
        },
        "9da79c91fc7642ebb4c0bbacfbacd510": {}
      };

      const expectedTemplateDictionary: any = {
        user: {
          email: "casey@esri.com"
        },
        "4efe5f693de34620934787ead6693f10": {
          itemId: "xxxe5f693de34620934787ead6693f10",
          layer0: {
            url: "https://abc123/name/FeatureServer/0"
          },
          layer1: {
            url: "https://abc123/name/FeatureServer/1"
          }
        },
        "9da79c91fc7642ebb4c0bbacfbacd510": {
          itemId: "xxx79c91fc7642ebb4c0bbacfbacd510"
        }
      };

      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "QuickCapture Project",
        null
      );

      itemTemplate.itemId = "9da79c91fc7642ebb4c0bbacfbacd510";

      itemTemplate.dependencies = ["4efe5f693de34620934787ead6693f10"];

      itemTemplate.data = {
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

      const expectedData: any = {
        application: {
          basemap: {},
          dataSources: [
            {
              featureServiceItemId: "xxxe5f693de34620934787ead6693f10",
              dataSourceId: "1d4de1e4-ef58-4e02-9159-7a6e6701cada",
              url: "https://abc123/name/FeatureServer/0"
            },
            {
              featureServiceItemId: "xxxe5f693de34620934787ead6693f10",
              dataSourceId: "1687a71b-cf77-48ed-b948-c66e228a0f74",
              url: "https://abc123/name/FeatureServer/1"
            }
          ],
          itemId: "xxx79c91fc7642ebb4c0bbacfbacd510",
          preferences: {
            adminEmail: "casey@esri.com"
          },
          templateGroups: [],
          userInputs: [],
          version: 0.1
        },
        name: "qc.project.json"
      };

      fetchMock
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
          { success: true, id: newItemId }
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/" +
            newItemId +
            "/update",
          { success: true }
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/" +
            newItemId +
            "/updateResources",
          { success: true }
        );

      spyOn(quickcapture, "fineTuneCreatedItem").and.returnValue(
        Promise.resolve()
      );

      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          () => {
            return 0;
          }
        )
        .then(actual => {
          itemTemplate.itemId = newItemId;
          itemTemplate.data = expectedData;
          expect(quickcapture.fineTuneCreatedItem).toHaveBeenCalledWith(
            itemTemplate,
            MOCK_USER_SESSION
          );
          expect(actual).toEqual(newItemId);
          expect(templateDictionary).toEqual(expectedTemplateDictionary);
          done();
        }, done.fail);
    });

    it("should handle error on update resources", done => {
      const newItemId: string = "xxx79c91fc7642ebb4c0bbacfbacd510";

      const templateDictionary: any = {};

      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "QuickCapture Project",
        null
      );

      itemTemplate.data = {
        application: {
          basemap: {},
          dataSources: [],
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

      fetchMock
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
          { success: true, id: newItemId }
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/" +
            newItemId +
            "/update",
          { success: true }
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/" +
            newItemId +
            "/updateResources",
          mockItems.get400Failure()
        );

      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          () => {
            return 0;
          }
        )
        .then(done.fail, done);
    });

    it("should handle web mapping application 2", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Web Mapping Application",
        null
      );
      itemTemplate.itemId = "abc0cab401af4828a25cc6eaeb59fb69";
      itemTemplate.item = {
        title: "Voting Centers",
        id: "{{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
        type: "Web Mapping Application",
        categories: undefined,
        culture: undefined,
        description: undefined,
        extent: undefined,
        tags: undefined,
        thumbnail: undefined,
        typeKeywords: ["WAB2D"],
        url:
          "{{portalBaseUrl}}/home/item.html?id={{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
        licenseInfo: undefined,
        name: undefined,
        snippet: undefined
      };
      itemTemplate.data = {
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

      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          {},
          MOCK_USER_SESSION,
          function() {
            const tick = 0;
          }
        )
        .then(
          actual => {
            expect(actual).toEqual("abc0cab401af4828a25cc6eaeb59fb69");
            done();
          },
          e => done.fail(e)
        );
    });

    it("should handle error web mapping application", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Web Mapping Application",
        null
      );
      itemTemplate.itemId = "abc0cab401af4828a25cc6eaeb59fb69";
      itemTemplate.item = {
        title: "Voting Centers",
        id: "{{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
        type: "Web Mapping Application",
        categories: undefined,
        culture: undefined,
        description: undefined,
        extent: undefined,
        tags: undefined,
        thumbnail: undefined,
        typeKeywords: ["WAB2D"],
        url:
          "{{portalBaseUrl}}/home/item.html?id={{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
        licenseInfo: undefined,
        name: undefined,
        snippet: undefined
      };
      itemTemplate.data = {
        appItemId: "{{myAppItemId.itemId}}",
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

      simpleTypes
        .createItemFromTemplate(
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
        )
        .then(
          actual => {
            done.fail();
          },
          e => done()
        );
    });
  });

  describe("postProcessFieldReferences", () => {
    it("should process dashboard field references", () => {
      const template: common.IItemTemplate = common.cloneObject(
        staticDashboardMocks._initialDashboardTemplate
      );
      const datasourceInfos: common.IDatasourceInfo[] = common.cloneObject(
        staticDashboardMocks.datasourceInfos
      );
      const expected: common.IItemTemplate = common.cloneObject(
        staticDashboardMocks.expectedTemplate
      );

      // we don't first convert the item to template so the itemIds are not templatized
      // clean those out for this test.
      // This should be handled differently when removing the static mock items in favor of standard mock items.

      // Clean datasource itemIds
      expected.data.headerPanel.selectors[4].datasets[0].dataSource.itemId = common.cleanLayerBasedItemId(
        expected.data.headerPanel.selectors[4].datasets[0].dataSource.itemId
      );
      expected.data.leftPanel.selectors[0].datasets[0].dataSource.itemId = common.cleanLayerBasedItemId(
        expected.data.leftPanel.selectors[0].datasets[0].dataSource.itemId
      );
      expected.data.leftPanel.selectors[4].datasets[0].dataSource.itemId = common.cleanLayerBasedItemId(
        expected.data.leftPanel.selectors[4].datasets[0].dataSource.itemId
      );
      expected.data.widgets[3].datasets[1].dataSource.itemId = common.cleanLayerBasedItemId(
        expected.data.widgets[3].datasets[1].dataSource.itemId
      );
      expected.data.widgets[3].datasets[2].dataSource.itemId = common.cleanLayerBasedItemId(
        expected.data.widgets[3].datasets[2].dataSource.itemId
      );
      expected.data.widgets[4].datasets[0].dataSource.itemId = common.cleanLayerBasedItemId(
        expected.data.widgets[4].datasets[0].dataSource.itemId
      );
      expected.data.widgets[6].datasets[0].dataSource.itemId = common.cleanLayerBasedItemId(
        expected.data.widgets[6].datasets[0].dataSource.itemId
      );
      expected.data.widgets[8].datasets[0].dataSource.itemId = common.cleanLayerBasedItemId(
        expected.data.widgets[8].datasets[0].dataSource.itemId
      );
      expected.data.urlParameters[4].datasets[0].dataSource.itemId = common.cleanLayerBasedItemId(
        expected.data.urlParameters[4].datasets[0].dataSource.itemId
      );

      // clean map itemId
      expected.data.widgets[0].itemId = common.cleanItemId(
        expected.data.widgets[0].itemId
      );

      // clean layerIds
      expected.data.headerPanel.selectors[4].datasets[0].dataSource.layerId = common.cleanLayerId(
        expected.data.headerPanel.selectors[4].datasets[0].dataSource.layerId
      );
      expected.data.leftPanel.selectors[0].datasets[0].dataSource.layerId = common.cleanLayerId(
        expected.data.leftPanel.selectors[0].datasets[0].dataSource.layerId
      );
      expected.data.leftPanel.selectors[4].datasets[0].dataSource.layerId = common.cleanLayerId(
        expected.data.leftPanel.selectors[4].datasets[0].dataSource.layerId
      );
      expected.data.widgets[3].datasets[1].dataSource.layerId = common.cleanLayerId(
        expected.data.widgets[3].datasets[1].dataSource.layerId
      );
      expected.data.widgets[3].datasets[2].dataSource.layerId = common.cleanLayerId(
        expected.data.widgets[3].datasets[2].dataSource.layerId
      );
      expected.data.widgets[4].datasets[0].dataSource.layerId = common.cleanLayerId(
        expected.data.widgets[4].datasets[0].dataSource.layerId
      );
      expected.data.widgets[6].datasets[0].dataSource.layerId = common.cleanLayerId(
        expected.data.widgets[6].datasets[0].dataSource.layerId
      );
      expected.data.widgets[8].datasets[0].dataSource.layerId = common.cleanLayerId(
        expected.data.widgets[8].datasets[0].dataSource.layerId
      );
      expected.data.urlParameters[4].datasets[0].dataSource.layerId = common.cleanLayerId(
        expected.data.urlParameters[4].datasets[0].dataSource.layerId
      );

      // clean dependencies
      expected.dependencies = [];

      const actual = simpleTypes.postProcessFieldReferences(
        template,
        datasourceInfos,
        "Dashboard"
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("postProcessCircularDependencies", () => {
    if (typeof window !== "undefined") {
      it("update item", done => {
        const template: any = {
          dependencies: ["ABC123", "A"],
          type: "Workforce Project",
          itemId: "123ABC"
        };

        const templateDictionary: any = {
          ABC123: {
            itemId: "NEWABC123"
          }
        };

        const itemData: any = {
          groupId: "{{ABC123.itemId}}"
        };

        const expectedBody: string =
          "f=json&text=%7B%22groupId%22%3A%22NEWABC123%22%7D&id=123ABC&token=fake-token";

        const updateUrl: string =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/123ABC/update";

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/generateToken",
            MOCK_USER_SESSION.token
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/123ABC/data",
            itemData
          )
          .post(updateUrl, '{"success":true}');

        simpleTypes
          .postProcessCircularDependencies(
            template,
            MOCK_USER_SESSION,
            templateDictionary
          )
          .then(() => {
            const options: fetchMock.MockOptions = fetchMock.lastOptions(
              updateUrl
            );
            const fetchBody = (options as fetchMock.MockResponseObject).body;
            expect(fetchBody).toEqual(expectedBody);
            done();
          }, done.fail);
      });

      it("handle error on updateItemExtended", done => {
        const template: any = {
          dependencies: ["ABC123", "A"],
          type: "Workforce Project",
          itemId: "123ABC"
        };

        const templateDictionary: any = {
          ABC123: {
            itemId: "NEWABC123"
          }
        };

        const itemData: any = {
          groupId: "{{ABC123.itemId}}"
        };

        const expectedBody: string =
          "f=json&text=%7B%22groupId%22%3A%22NEWABC123%22%7D&id=123ABC&token=fake-token";

        const updateUrl: string =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/123ABC/update";

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/generateToken",
            MOCK_USER_SESSION.token
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/123ABC/data",
            itemData
          )
          .post(updateUrl, mockItems.get400Failure());

        simpleTypes
          .postProcessCircularDependencies(
            template,
            MOCK_USER_SESSION,
            templateDictionary
          )
          .then(done.fail, done);
      });

      it("should handle error on get data", done => {
        const template: any = {
          dependencies: ["ABC123", "A"],
          type: "Workforce Project",
          itemId: "123ABC"
        };

        const templateDictionary: any = {
          ABC123: {
            itemId: "NEWABC123"
          }
        };

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/generateToken",
            MOCK_USER_SESSION.token
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/123ABC/data",
            mockItems.get400Failure()
          );

        simpleTypes
          .postProcessCircularDependencies(
            template,
            MOCK_USER_SESSION,
            templateDictionary
          )
          .then(done.fail, done);
      });
    }
  });
});
