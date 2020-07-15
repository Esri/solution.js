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
 * Provides tests for functions involving the creation and deployment of simple item types.
 */

import * as simpleTypes from "../src/simple-types";
import * as utils from "../../common/test/mocks/utils";
import * as staticDashboardMocks from "../../common/test/mocks/staticDashboardMocks";
import * as staticRelatedItemsMocks from "../../common/test/mocks/staticRelatedItemsMocks";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as templates from "../../common/test/mocks/templates";
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

describe("simpleTypes :: ", () => {
  // describe("convertItemToTemplate", () => {
  //   // Blobs are only available in the browser
  //   if (typeof window !== "undefined") {
  //     it("should handle error on getResources", done => {
  //       const solutionItemId = "sln1234567890";
  //       const item: any = mockItems.getAGOLItem("Workforce Project");
  //       item.title = "Dam Inspection Assignments";
  //       item.thumbnail = null;
  //       const expectedTemplate = templates.getItemTemplate(
  //         "Workforce Project",
  //         [
  //           "abc715c2df2b466da05577776e82d044",
  //           "abc116555b16437f8435e079033128d0",
  //           "abc26a244163430590151395821fb845",
  //           "abc302ec12b74d2f9f2b3cc549420086",
  //           "abc4494043c3459faabcfd0e1ab557fc",
  //           "abc5dd4bdd18437f8d5ff1aa2d25fd7c",
  //           "abc64329e69144c59f69f3f3e0d45269",
  //           "cad3483e025c47338d43df308c117308",
  //           "bad3483e025c47338d43df308c117308"
  //         ]
  //       );
  //       expectedTemplate.item.thumbnail = item.thumbnail;
  //       expectedTemplate.item.title = item.title;
  //       expectedTemplate.estimatedDeploymentCostFactor = 2;

  //       fetchMock
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/wrk1234567890/resources",
  //           mockItems.get400Failure()
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl + "/content/items/wrk1234567890/data",
  //           mockItems.getAGOLItemData("Workforce Project")
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/wrk1234567890/info/metadata/metadata.xml",
  //           mockItems.get500Failure()
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/users/casey/items/sln1234567890/addResources",
  //           utils.getSuccessResponse()
  //         );
  //       staticRelatedItemsMocks.fetchMockRelatedItems("wrk1234567890", {
  //         total: 0,
  //         relatedItems: []
  //       });

  //       simpleTypes
  //         .convertItemToTemplate(solutionItemId, item, MOCK_USER_SESSION)
  //         .then(newItemTemplate => {
  //           newItemTemplate.key = expectedTemplate.key;
  //           expect(newItemTemplate).toEqual(expectedTemplate);
  //           expect(newItemTemplate.resources).toEqual([]);
  //           done();
  //         }, done.fail);
  //     });

  //     it("should handle error on dataPromise", done => {
  //       const solutionItemId = "sln1234567890";
  //       const itemId: string = "abc0cab401af4828a25cc6eaeb59fb69";
  //       const item = {
  //         id: itemId,
  //         type: "Web Mapping Application",
  //         title: "Dam Inspection Assignments"
  //       };

  //       const url = common.getItemDataBlobUrl(itemId, MOCK_USER_SESSION);
  //       fetchMock
  //         .post(url, mockItems.get400Failure())
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/abc0cab401af4828a25cc6eaeb59fb69/resources",
  //           mockItems.get400Failure()
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/abc0cab401af4828a25cc6eaeb59fb69/info/metadata/metadata.xml",
  //           mockItems.get500Failure()
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/users/casey/items/sln1234567890/addResources",
  //           utils.getSuccessResponse()
  //         );
  //       staticRelatedItemsMocks.fetchMockRelatedItems(
  //         "abc0cab401af4828a25cc6eaeb59fb69",
  //         { total: 0, relatedItems: [] }
  //       );

  //       simpleTypes
  //         .convertItemToTemplate(solutionItemId, item, MOCK_USER_SESSION)
  //         .then(() => {
  //           done.fail();
  //         }, done);
  //     });

  //     it("should handle workforce project", done => {
  //       const solutionItemId = "sln1234567890";
  //       const item = {
  //         id: "abc0cab401af4828a25cc6eaeb59fb69",
  //         type: "Workforce Project",
  //         title: "Dam Inspection Assignments"
  //       };

  //       const expectedTemplateData: any = {
  //         workerWebMapId: "{{abc116555b16437f8435e079033128d0.itemId}}",
  //         dispatcherWebMapId: "{{abc26a244163430590151395821fb845.itemId}}",
  //         dispatchers: {
  //           serviceItemId: "{{abc302ec12b74d2f9f2b3cc549420086.layer0.itemId}}",
  //           url: "{{abc302ec12b74d2f9f2b3cc549420086.layer0.url}}"
  //         },
  //         assignments: {
  //           serviceItemId: "{{abc4494043c3459faabcfd0e1ab557fc.layer0.itemId}}",
  //           url: "{{abc4494043c3459faabcfd0e1ab557fc.layer0.url}}"
  //         },
  //         workers: {
  //           serviceItemId: "{{abc5dd4bdd18437f8d5ff1aa2d25fd7c.layer0.itemId}}",
  //           url: "{{abc5dd4bdd18437f8d5ff1aa2d25fd7c.layer0.url}}"
  //         },
  //         tracks: {
  //           serviceItemId: "{{abc64329e69144c59f69f3f3e0d45269.layer0.itemId}}",
  //           url: "{{abc64329e69144c59f69f3f3e0d45269.layer0.url}}",
  //           enabled: true,
  //           updateInterval: 300
  //         },
  //         version: "1.2.0",
  //         groupId: "{{abc715c2df2b466da05577776e82d044.itemId}}",
  //         folderId: "{{folderId}}",
  //         assignmentIntegrations: [
  //           {
  //             id: "default-navigator",
  //             prompt: "Navigate to Assignment",
  //             urlTemplate:
  //               "arcgis-navigator://?stop=${assignment.latitude},{itemID={{cad3483e025c47338d43df308c117308.itemId}}},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt={itemID={{bad3483e025c47338d43df308c117308.itemId}}}://Workforce",
  //             assignmentTypes: [
  //               {
  //                 urlTemplate:
  //                   "arcgis-navigator://?stop=${assignment.latitude},{itemID={{cad3483e025c47338d43df308c117308.itemId}}},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt={itemID={{bad3483e025c47338d43df308c117308.itemId}}}://Workforce"
  //               }
  //             ]
  //           }
  //         ]
  //       };

  //       const dataResponse: any = mockItems.getAGOLItemData(
  //         "Workforce Project"
  //       );

  //       fetchMock
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/abc0cab401af4828a25cc6eaeb59fb69/resources",
  //           noResourcesResponse
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/abc0cab401af4828a25cc6eaeb59fb69/info/metadata/metadata.xml",
  //           mockItems.get500Failure()
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/users/casey/items/" +
  //             solutionItemId +
  //             "/addResources",
  //           { success: true, id: solutionItemId }
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/abc0cab401af4828a25cc6eaeb59fb69/data",
  //           dataResponse
  //         )
  //         .get(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/community/groups/grp1234567890?f=json&token=fake-token",
  //           {}
  //         );
  //       staticRelatedItemsMocks.fetchMockRelatedItems(
  //         "abc0cab401af4828a25cc6eaeb59fb69",
  //         { total: 0, relatedItems: [] }
  //       );

  //       simpleTypes
  //         .convertItemToTemplate(solutionItemId, item, MOCK_USER_SESSION)
  //         .then(newItemTemplate => {
  //           expect(newItemTemplate.data).toEqual(expectedTemplateData);
  //           done();
  //         }, done.fail);
  //     });

  //     it("should handle quick capture project", done => {
  //       const solutionItemId = "ee67658b2a98450cba051fd001463df0";
  //       const resources: any = {
  //         total: 1,
  //         start: 1,
  //         num: 1,
  //         nextStart: -1,
  //         resources: [
  //           {
  //             resource: "qc.project.json",
  //             created: 1579127879000,
  //             size: 29882,
  //             access: "inherit",
  //             type: "application/json"
  //           }
  //         ]
  //       };

  //       fetchMock
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/qck1234567890/resources",
  //           resources
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/qck1234567890/info/metadata/metadata.xml",
  //           mockItems.get500Failure()
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/qck1234567890/info/thumbnail/ago_downloaded.png",
  //           utils.getSampleImage(),
  //           { sendAsJson: false }
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/qck1234567890/resources/images/Camera.png",
  //           utils.getSampleImage(),
  //           { sendAsJson: false }
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/qck1234567890/resources/qc.project.json",
  //           utils.getSampleJsonAsFile("qc.project.json"),
  //           { sendAsJson: false }
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/users/casey/items/" +
  //             solutionItemId +
  //             "/addResources",
  //           { success: true, id: solutionItemId }
  //         );
  //       staticRelatedItemsMocks.fetchMockRelatedItems("qck1234567890", {
  //         total: 0,
  //         relatedItems: []
  //       });

  //       const itemInfo: common.IItemTemplate = mockItems.getAGOLItem(
  //         "QuickCapture Project",
  //         null
  //       );

  //       const expected: common.IItemTemplate = {
  //         itemId: "qck1234567890",
  //         key: "vx3ubyx3",
  //         data: Object({
  //           application: Object(utils.getSampleJson()),
  //           name: "qc.project.json"
  //         }),
  //         resources: [],
  //         dependencies: [],
  //         relatedItems: [],
  //         groups: [],
  //         type: "QuickCapture Project",
  //         item: {
  //           id: "{{qck1234567890.itemId}}",
  //           type: "QuickCapture Project",
  //           accessInformation: "Esri, Inc.",
  //           categories: [],
  //           contentStatus: null,
  //           culture: "en-us",
  //           description: "Description of an AGOL item",
  //           extent: "{{solutionItemExtent}}",
  //           spatialReference: undefined,
  //           licenseInfo: null,
  //           name: "Name of an AGOL item",
  //           properties: null,
  //           snippet: "Snippet of an AGOL item",
  //           tags: ["test"],
  //           thumbnail: "thumbnail/ago_downloaded.png",
  //           title: "An AGOL item",
  //           typeKeywords: ["JavaScript"],
  //           url: ""
  //         },
  //         properties: {},
  //         estimatedDeploymentCostFactor: 2
  //       };

  //       simpleTypes
  //         .convertItemToTemplate(solutionItemId, itemInfo, MOCK_USER_SESSION)
  //         .then(actual => {
  //           actual.key = expected.key;
  //           expect(actual).toEqual(expected);
  //           done();
  //         }, done.fail);
  //     });

  //     it("should handle python notebook", done => {
  //       const solutionItemId = "sln1234567890";
  //       const item = {
  //         id: "abc0cab401af4828a25cc6eaeb59fb69",
  //         type: "Notebook",
  //         title: "Simple Notebook"
  //       };

  //       const dataResponse: any = mockItems.getAGOLItemData("Notebook");

  //       fetchMock
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/abc0cab401af4828a25cc6eaeb59fb69/resources",
  //           noResourcesResponse
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/abc0cab401af4828a25cc6eaeb59fb69/info/metadata/metadata.xml",
  //           mockItems.get500Failure()
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/abc0cab401af4828a25cc6eaeb59fb69/data",
  //           dataResponse
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/users/casey/items/sln1234567890/addResources",
  //           utils.getSuccessResponse()
  //         );
  //       staticRelatedItemsMocks.fetchMockRelatedItems(
  //         "abc0cab401af4828a25cc6eaeb59fb69",
  //         { total: 0, relatedItems: [] }
  //       );

  //       simpleTypes
  //         .convertItemToTemplate(solutionItemId, item, MOCK_USER_SESSION)
  //         .then(newItemTemplate => {
  //           expect(newItemTemplate.data).toEqual(
  //             templates.getItemTemplateData("Notebook")
  //           );
  //           done();
  //         }, done.fail);
  //     });

  //     it("should handle item resource", done => {
  //       const solutionItemId = "sln1234567890";
  //       const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
  //       itemTemplate.item = mockItems.getAGOLItem("Web Map", null);
  //       itemTemplate.item.item = itemTemplate.itemId = itemTemplate.item.id;
  //       itemTemplate.item.thumbnail = "thumbnail/banner.png";

  //       const expectedFetch = mockItems.getAnImageResponse();

  //       const expectedTemplate: any = {
  //         itemId: "map1234567890",
  //         type: "Web Map",
  //         item: {
  //           id: "{{map1234567890.itemId}}",
  //           type: "Web Map",
  //           accessInformation: "Esri, Inc.",
  //           categories: [],
  //           contentStatus: null,
  //           culture: "en-us",
  //           description: "Description of an AGOL item",
  //           extent: "{{solutionItemExtent}}",
  //           properties: null,
  //           spatialReference: undefined,
  //           licenseInfo: null,
  //           name: "Name of an AGOL item",
  //           snippet: "Snippet of an AGOL item",
  //           tags: ["test"],
  //           thumbnail: "thumbnail/banner.png",
  //           title: "An AGOL item",
  //           typeKeywords: ["JavaScript"],
  //           url:
  //             "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{map1234567890.itemId}}"
  //         },
  //         data: undefined,
  //         resources: [],
  //         dependencies: [],
  //         relatedItems: [],
  //         groups: [],
  //         properties: {},
  //         estimatedDeploymentCostFactor: 2
  //       };

  //       fetchMock
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/resources",
  //           {
  //             total: 1,
  //             start: 1,
  //             num: 1,
  //             nextStart: -1,
  //             resources: [
  //               {
  //                 resource: "image/banner.png",
  //                 created: 1522711362000,
  //                 size: 56945
  //               }
  //             ]
  //           }
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/resources/image/banner.png",
  //           expectedFetch,
  //           { sendAsJson: false }
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/users/" +
  //             MOCK_USER_SESSION.username +
  //             "/items/" +
  //             solutionItemId +
  //             "/addResources",
  //           {
  //             success: true,
  //             itemId: solutionItemId,
  //             owner: MOCK_USER_SESSION.username,
  //             folder: null
  //           }
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/info/thumbnail/banner.png",
  //           expectedFetch,
  //           { sendAsJson: false }
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/data",
  //           mockItems.get500Failure()
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/info/metadata/metadata.xml",
  //           mockItems.get400Failure()
  //         );
  //       staticRelatedItemsMocks.fetchMockRelatedItems("map1234567890", {
  //         total: 0,
  //         relatedItems: []
  //       });

  //       simpleTypes
  //         .convertItemToTemplate(
  //           solutionItemId,
  //           itemTemplate.item,
  //           MOCK_USER_SESSION
  //         )
  //         .then(newItemTemplate => {
  //           delete newItemTemplate.key; // key is randomly generated, and so is not testable
  //           expect(newItemTemplate).toEqual(expectedTemplate);
  //           done();
  //         }, done.fail);
  //     });

  //     it("should handle dashboard et al. item types", done => {
  //       const solutionItemId = "sln1234567890";
  //       const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
  //       itemTemplate.itemId = "dsh1234567890";
  //       itemTemplate.item = mockItems.getAGOLItem("Dashboard", null);
  //       itemTemplate.item.thumbnail = null;

  //       const expectedTemplate: any = {
  //         itemId: "dsh1234567890",
  //         type: "Dashboard",
  //         item: {
  //           id: "{{dsh1234567890.itemId}}",
  //           type: "Dashboard",
  //           accessInformation: "Esri, Inc.",
  //           categories: [],
  //           contentStatus: null,
  //           culture: "en-us",
  //           description: "Description of an AGOL item",
  //           extent: "{{solutionItemExtent}}",
  //           spatialReference: undefined,
  //           licenseInfo: null,
  //           name: "Name of an AGOL item",
  //           properties: null,
  //           snippet: "Snippet of an AGOL item",
  //           tags: ["test"],
  //           thumbnail: null,
  //           title: "An AGOL item",
  //           typeKeywords: ["JavaScript"],
  //           url: ""
  //         },
  //         data: ["abc", "def", "ghi"],
  //         resources: [],
  //         dependencies: [],
  //         relatedItems: [],
  //         groups: [],
  //         properties: {},
  //         estimatedDeploymentCostFactor: 2
  //       };

  //       fetchMock
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/data",
  //           ["abc", "def", "ghi"]
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/resources",
  //           noResourcesResponse
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/info/metadata/metadata.xml",
  //           mockItems.get400Failure()
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/users/casey/items/sln1234567890/addResources",
  //           utils.getSuccessResponse()
  //         );
  //       staticRelatedItemsMocks.fetchMockRelatedItems("dsh1234567890", {
  //         total: 0,
  //         relatedItems: []
  //       });

  //       simpleTypes
  //         .convertItemToTemplate(
  //           solutionItemId,
  //           itemTemplate.item,
  //           MOCK_USER_SESSION
  //         )
  //         .then(newItemTemplate => {
  //           delete newItemTemplate.key; // key is randomly generated, and so is not testable
  //           expect(newItemTemplate).toEqual(expectedTemplate);
  //           done();
  //         }, done.fail);
  //     });

  //     it("should handle form item type with default filename", done => {
  //       const solutionItemId = "sln1234567890";
  //       const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
  //       itemTemplate.itemId = "frm1234567890";
  //       itemTemplate.item = mockItems.getAGOLItem("Form", null);
  //       itemTemplate.item.thumbnail = null;
  //       itemTemplate.item.name = null;

  //       const expectedTemplate: any = {
  //         itemId: "frm1234567890",
  //         type: "Form",
  //         item: {
  //           id: "{{frm1234567890.itemId}}",
  //           type: "Form",
  //           accessInformation: "Esri, Inc.",
  //           categories: [],
  //           contentStatus: null,
  //           culture: "en-us",
  //           description: "Description of an AGOL item",
  //           extent: "{{solutionItemExtent}}",
  //           spatialReference: undefined,
  //           licenseInfo: null,
  //           name: "formData.zip",
  //           properties: null,
  //           snippet: "Snippet of an AGOL item",
  //           tags: ["test"],
  //           thumbnail: null,
  //           title: "An AGOL item",
  //           typeKeywords: ["JavaScript"],
  //           url: ""
  //         },
  //         data: null, // forms don't store info here
  //         resources: [
  //           "frm1234567890_info_data/formData.zip",
  //           "frm1234567890_info/form.json",
  //           "frm1234567890_info/forminfo.json",
  //           "frm1234567890_info/form.webform.json"
  //         ],
  //         relatedItems: [
  //           {
  //             relationshipType: "Survey2Service",
  //             relatedItemIds: ["srv1234567890"]
  //           },
  //           {
  //             relationshipType: "Survey2Data",
  //             relatedItemIds: ["srv1234567890", "abc1234567890"]
  //           }
  //         ],
  //         dependencies: ["srv1234567890", "abc1234567890"],
  //         groups: [],
  //         properties: {},
  //         estimatedDeploymentCostFactor: 2
  //       };

  //       fetchMock
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/data",
  //           ["abc", "def", "ghi"]
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/resources",
  //           noResourcesResponse
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/info/metadata/metadata.xml",
  //           mockItems.get400Failure()
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/info/form.json",
  //           utils.getSampleJsonAsFile("form.json")
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/info/forminfo.json",
  //           utils.getSampleJsonAsFile("forminfo.json")
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/info/form.webform",
  //           utils.getSampleJsonAsFile("form.webform")
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/users/" +
  //             MOCK_USER_SESSION.username +
  //             "/items/" +
  //             solutionItemId +
  //             "/addResources",
  //           {
  //             success: true,
  //             itemId: itemTemplate.itemId,
  //             owner: MOCK_USER_SESSION.username,
  //             folder: null
  //           }
  //         );
  //       staticRelatedItemsMocks.fetchMockRelatedItems(
  //         itemTemplate.itemId,
  //         { total: 0, relatedItems: [] },
  //         ["Survey2Data", "Survey2Service"]
  //       );
  //       fetchMock.get(
  //         utils.PORTAL_SUBSET.restUrl +
  //           "/content/items/" +
  //           itemTemplate.itemId +
  //           "/relatedItems?f=json&direction=forward&relationshipType=Survey2Data&token=fake-token",
  //         {
  //           total: 2,
  //           relatedItems: [
  //             {
  //               id: "srv1234567890"
  //             },
  //             {
  //               id: "abc1234567890"
  //             }
  //           ]
  //         }
  //       );
  //       fetchMock.get(
  //         utils.PORTAL_SUBSET.restUrl +
  //           "/content/items/" +
  //           itemTemplate.itemId +
  //           "/relatedItems?f=json&direction=forward&relationshipType=Survey2Service&token=fake-token",
  //         {
  //           total: 1,
  //           relatedItems: [
  //             {
  //               id: "srv1234567890"
  //             }
  //           ]
  //         }
  //       );

  //       simpleTypes
  //         .convertItemToTemplate(
  //           solutionItemId,
  //           itemTemplate.item,
  //           MOCK_USER_SESSION
  //         )
  //         .then(newItemTemplate => {
  //           delete newItemTemplate.key; // key is randomly generated, and so is not testable
  //           expect(newItemTemplate).toEqual(expectedTemplate);
  //           done();
  //         }, done.fail);
  //     });

  //     it("should handle web mapping application with missing data section and source URL", done => {
  //       const solutionItemId = "sln1234567890";
  //       // Related to issue: #56
  //       // To add support for simple apps such as those that we create for "Getting to Know"
  //       // A new app should be created in the users org but we will retain the source URL
  //       const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
  //       itemTemplate.item = mockItems.getAGOLItem(
  //         "Web Mapping Application",
  //         null
  //       );
  //       itemTemplate.itemId = itemTemplate.item.id;
  //       itemTemplate.item.thumbnail = null;

  //       const expectedTemplate: any = {
  //         itemId: "wma1234567890",
  //         type: "Web Mapping Application",
  //         item: {
  //           id: "{{wma1234567890.itemId}}",
  //           type: "Web Mapping Application",
  //           accessInformation: "Esri, Inc.",
  //           categories: [],
  //           contentStatus: null,
  //           culture: "en-us",
  //           description: "Description of an AGOL item",
  //           extent: "{{solutionItemExtent}}",
  //           properties: null,
  //           spatialReference: undefined,
  //           licenseInfo: null,
  //           name: "Name of an AGOL item",
  //           snippet: "Snippet of an AGOL item",
  //           tags: ["test"],
  //           thumbnail: null,
  //           title: "An AGOL item",
  //           typeKeywords: ["JavaScript"],
  //           url:
  //             "http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=wma1234567890"
  //         },
  //         data: null,
  //         resources: [],
  //         dependencies: [],
  //         relatedItems: [],
  //         groups: [],
  //         properties: {},
  //         estimatedDeploymentCostFactor: 2
  //       };

  //       fetchMock
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/data",
  //           200
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/resources",
  //           noResourcesResponse
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/info/metadata/metadata.xml",
  //           mockItems.get400Failure()
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/users/casey/items/" +
  //             solutionItemId +
  //             "/addResources",
  //           { success: true, id: solutionItemId }
  //         );
  //       staticRelatedItemsMocks.fetchMockRelatedItems("wma1234567890", {
  //         total: 0,
  //         relatedItems: []
  //       });

  //       simpleTypes
  //         .convertItemToTemplate(
  //           solutionItemId,
  //           itemTemplate.item,
  //           MOCK_USER_SESSION
  //         )
  //         .then(newItemTemplate => {
  //           delete newItemTemplate.key; // key is randomly generated, and so is not testable
  //           expect(newItemTemplate).toEqual(expectedTemplate);
  //           done();
  //         }, done.fail);
  //     });

  //     it("should catch fetch errors", done => {
  //       // TODO resolve Karma internal error triggered by this test
  //       const solutionItemId = "sln1234567890";
  //       const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
  //       itemTemplate.item = mockItems.getAGOLItem("Form", null);
  //       itemTemplate.itemId = itemTemplate.item.id;
  //       itemTemplate.item.thumbnail = null;

  //       fetchMock
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/frm1234567890/info/metadata/metadata.xml",
  //           mockItems.get500Failure()
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/frm1234567890/resources",
  //           mockItems.get500Failure()
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl + "/content/items/frm1234567890/data",
  //           mockItems.get500Failure()
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/info/form.json",
  //           utils.getSampleJsonAsFile("form.json")
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/info/forminfo.json",
  //           utils.getSampleJsonAsFile("forminfo.json")
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/info/form.webform",
  //           utils.getSampleJsonAsFile("form.webform")
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/users/casey/items/" +
  //             solutionItemId +
  //             "/addResources",
  //           { success: true, id: solutionItemId }
  //         );
  //       staticRelatedItemsMocks.fetchMockRelatedItems(
  //         "frm1234567890",
  //         mockItems.get500Failure()
  //       );

  //       simpleTypes
  //         .convertItemToTemplate(
  //           solutionItemId,
  //           itemTemplate.item,
  //           MOCK_USER_SESSION
  //         )
  //         .then(newItemTemplate => {
  //           expect(newItemTemplate.data).toBeNull();
  //           expect(newItemTemplate.resources).toEqual([
  //             "frm1234567890_info/form.json",
  //             "frm1234567890_info/forminfo.json",
  //             "frm1234567890_info/form.webform.json"
  //           ]);
  //           expect(newItemTemplate.dependencies).toEqual([]);
  //           done();
  //         }, done.fail);
  //     });

  //     it("should catch wrapup errors", done => {
  //       const solutionItemId = "sln1234567890";
  //       const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
  //       itemTemplate.item = mockItems.getAGOLItem("Form", null);
  //       itemTemplate.itemId = itemTemplate.item.id;
  //       itemTemplate.item.thumbnail = null;
  //       itemTemplate.item.name = "form.zip";

  //       fetchMock
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/data",
  //           utils.getSampleZip(),
  //           { sendAsJson: false }
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/resources",
  //           noResourcesResponse
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/info/metadata/metadata.xml",
  //           mockItems.get400Failure()
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/info/form.json",
  //           utils.getSampleJsonAsFile("form.json")
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/info/forminfo.json",
  //           utils.getSampleJsonAsFile("forminfo.json")
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/" +
  //             itemTemplate.itemId +
  //             "/info/form.webform",
  //           utils.getSampleJsonAsFile("form.webform")
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/users/" +
  //             MOCK_USER_SESSION.username +
  //             "/items/" +
  //             solutionItemId +
  //             "/addResources",
  //           mockItems.get400Failure()
  //         );

  //       staticRelatedItemsMocks.fetchMockRelatedItems(
  //         "frm1234567890",
  //         mockItems.get500Failure()
  //       );

  //       simpleTypes
  //         .convertItemToTemplate(
  //           solutionItemId,
  //           itemTemplate.item,
  //           MOCK_USER_SESSION
  //         )
  //         .then(
  //           () => done.fail(),
  //           response => {
  //             expect(response.error.code).toEqual(400);
  //             expect(response.error.message).toEqual(
  //               "Item does not exist or is inaccessible."
  //             );
  //             done();
  //           }
  //         );
  //     });

  //     it("should handle web mapping application", done => {
  //       const solutionItemId = "sln1234567890";
  //       const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
  //         "Web Mapping Application",
  //         null
  //       );

  //       itemTemplate.item = {
  //         id: "abc0cab401af4828a25cc6eaeb59fb69",
  //         type: "Web Mapping Application",
  //         title: "Voting Centers",
  //         contentStatus: null,
  //         url:
  //           "https://myOrg.arcgis.com/home/item.html?id=abc123da3c304dd0bf46dee75ac31aae"
  //       };
  //       itemTemplate.itemId = "abc0cab401af4828a25cc6eaeb59fb69";
  //       itemTemplate.data = {
  //         appItemId: "myAppItemId",
  //         values: {
  //           webmap: "myMapId"
  //         },
  //         map: {
  //           appProxy: {
  //             mapItemId: "mapItemId"
  //           },
  //           itemId: "mapItemId"
  //         },
  //         folderId: "folderId"
  //       };
  //       const expected = {
  //         itemId: "abc0cab401af4828a25cc6eaeb59fb69",
  //         type: "Web Mapping Application",
  //         key: "abcdefgh",
  //         item: {
  //           title: "Voting Centers",
  //           id: "{{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
  //           type: "Web Mapping Application",
  //           accessInformation: undefined,
  //           categories: undefined,
  //           contentStatus: null,
  //           culture: undefined,
  //           description: undefined,
  //           extent: "{{solutionItemExtent}}",
  //           spatialReference: undefined,
  //           tags: undefined,
  //           thumbnail: undefined,
  //           typeKeywords: undefined,
  //           url:
  //             "{{portalBaseUrl}}/home/item.html?id={{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
  //           licenseInfo: undefined,
  //           properties: undefined,
  //           name: undefined,
  //           snippet: undefined
  //         } as any,
  //         data: {
  //           appItemId: "{{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
  //           values: {
  //             webmap: "{{myMapId.itemId}}"
  //           },
  //           map: {
  //             appProxy: {
  //               mapItemId: "{{mapItemId.itemId}}"
  //             },
  //             itemId: "{{mapItemId.itemId}}"
  //           },
  //           folderId: "{{folderId}}"
  //         },
  //         resources: [] as any[],
  //         dependencies: ["myMapId"],
  //         relatedItems: [] as common.IRelatedItems[],
  //         groups: [] as string[],
  //         properties: {} as any,
  //         estimatedDeploymentCostFactor: 2
  //       };

  //       fetchMock
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/abc0cab401af4828a25cc6eaeb59fb69/resources",
  //           []
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/abc0cab401af4828a25cc6eaeb59fb69/data",
  //           new Blob([JSON.stringify(itemTemplate.data)], {
  //             type: "application/json"
  //           }),
  //           { sendAsJson: false }
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/users/casey/items/sln1234567890/addResources",
  //           utils.getSuccessResponse()
  //         );
  //       staticRelatedItemsMocks.fetchMockRelatedItems(
  //         "abc0cab401af4828a25cc6eaeb59fb69",
  //         { total: 0, relatedItems: [] }
  //       );

  //       simpleTypes
  //         .convertItemToTemplate(
  //           solutionItemId,
  //           itemTemplate.item,
  //           MOCK_USER_SESSION
  //         )
  //         .then(
  //           actual => {
  //             actual.key = "abcdefgh";
  //             expect(actual).toEqual(expected);
  //             done();
  //           },
  //           e => done.fail(e)
  //         );
  //     });

  //     it("should handle error on web mapping application", done => {
  //       const solutionItemId = "sln1234567890";
  //       const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
  //         "Web Mapping Application",
  //         null
  //       );

  //       itemTemplate.item = {
  //         id: "abc0cab401af4828a25cc6eaeb59fb69",
  //         type: "Web Mapping Application",
  //         title: "Voting Centers",
  //         url:
  //           "https://myOrg.arcgis.com/home/item.html?id=abc123da3c304dd0bf46dee75ac31aae"
  //       };
  //       itemTemplate.itemId = "abc0cab401af4828a25cc6eaeb59fb69";

  //       const data: any = {
  //         appItemId: "myAppItemId",
  //         values: {
  //           webmap: "myMapId"
  //         },
  //         map: {
  //           appProxy: {
  //             mapItemId: "mapItemId"
  //           },
  //           itemId: "mapItemId"
  //         },
  //         folderId: "folderId",
  //         dataSource: {
  //           dataSources: {
  //             external_123456789: {
  //               type: "source type",
  //               portalUrl: "https://fake.maps.arcgis.com/",
  //               itemId: "2ea59a64b34646f8972a71c7d536e4a3",
  //               isDynamic: false,
  //               label: "Point layer",
  //               url:
  //                 "https://fake.com/arcgis/rest/services/test/FeatureServer/0"
  //             }
  //           },
  //           settings: {}
  //         }
  //       };
  //       fetchMock
  //         .post("https://fake.com/arcgis/rest/info", {})
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/abc0cab401af4828a25cc6eaeb59fb69/resources",
  //           []
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/items/abc0cab401af4828a25cc6eaeb59fb69/data",
  //           data
  //         )
  //         .post(
  //           utils.PORTAL_SUBSET.restUrl +
  //             "/content/users/casey/items/sln1234567890/addResources",
  //           utils.getSuccessResponse()
  //         )
  //         .post(
  //           "https://fake.com/arcgis/rest/services/test/FeatureServer/0",
  //           mockItems.get400FailureResponse()
  //         );
  //       staticRelatedItemsMocks.fetchMockRelatedItems(
  //         "abc0cab401af4828a25cc6eaeb59fb69",
  //         { total: 0, relatedItems: [] }
  //       );

  //       simpleTypes
  //         .convertItemToTemplate(
  //           solutionItemId,
  //           itemTemplate.item,
  //           MOCK_USER_SESSION
  //         )
  //         .then(
  //           () => done.fail(),
  //           () => done()
  //         );
  //     });
  //   }
  // });

  describe("createItemFromTemplate :: ", () => {
    it("should handle error on addItem", done => {
      const itemId: string = "abc0cab401af4828a25cc6eaeb59fb69";
      const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";
      const templateDictionary: any = {};

      const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.itemId = itemId;
      itemTemplate.type = "Web Map";
      itemTemplate.item = {
        id: itemId,
        type: itemTemplate.type
      };

      const expected: any = {};
      expected[itemId] = newItemID;

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/map1234567890/delete",
          utils.getSuccessResponse({ itemId: "map1234567890" })
        );

      // tslint:disable-next-line: no-floating-promises
      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          done();
        });
    });

    it("should handle success === false", done => {
      const itemId: string = "abc0cab401af4828a25cc6eaeb59fb69";
      const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";
      const templateDictionary: any = {};

      const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.itemId = itemId;
      itemTemplate.type = "Web Map";
      itemTemplate.item = {
        id: itemId,
        type: itemTemplate.type
      };

      const expected: any = {};
      expected[itemId] = newItemID;

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getFailureResponse({ id: newItemID, folder: null })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/map1234567890/delete",
          utils.getSuccessResponse({ itemId: "map1234567890" })
        );

      // tslint:disable-next-line: no-floating-promises
      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          done();
        });
    });

    if (typeof window !== "undefined") {
      it("should create and fine tune python notebook", done => {
        const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
          "Notebook"
        );
        itemTemplate.data = mockItems.getAGOLItemData("Notebook");

        const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";
        const expected: any = {};
        expected[itemTemplate.itemId] = { itemId: newItemID };
        const templateDictionary: any = {};

        const userUrl: string =
          utils.PORTAL_SUBSET.restUrl +
          "/community/users/casey?f=json&token=fake-token";

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
            utils.getSuccessResponse({ id: newItemID, folder: null })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/" +
              newItemID +
              "/update",
            { success: true }
          )
          .get(userUrl, {
            username: "casey",
            fullName: "casey"
          });

        // tslint:disable-next-line: no-floating-promises
        simpleTypes
          .createItemFromTemplate(
            itemTemplate,
            templateDictionary,
            MOCK_USER_SESSION,
            utils.ITEM_PROGRESS_CALLBACK
          )
          .then(r => {
            expect(templateDictionary).toEqual(expected);
            expect(r).toEqual({
              id: newItemID,
              type: itemTemplate.type,
              postProcess: false
            });
            done();
          });
      });

      it("should handle error on python notebook update item", done => {
        const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
          "Notebook"
        );
        itemTemplate.data = mockItems.getAGOLItemData("Notebook");

        const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";
        const expected: any = {};
        expected[itemTemplate.itemId] = { itemId: newItemID };
        const templateDictionary: any = {};

        const userUrl: string =
          utils.PORTAL_SUBSET.restUrl +
          "/community/users/casey?f=json&token=fake-token";

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
            utils.getSuccessResponse({ id: newItemID, folder: null })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/" +
              newItemID +
              "/update",
            mockItems.get400Failure()
          )
          .get(userUrl, {
            username: "casey",
            fullName: "casey"
          })
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/map1234567890/delete",
            utils.getSuccessResponse({ itemId: "map1234567890" })
          );

        // tslint:disable-next-line: no-floating-promises
        simpleTypes
          .createItemFromTemplate(
            itemTemplate,
            templateDictionary,
            MOCK_USER_SESSION,
            utils.ITEM_PROGRESS_CALLBACK
          )
          .then(response => {
            done();
          });
      });
    }

    it("should create and fine tune workforce project", done => {
      const communitySelfResponse: any = utils.getUserResponse();
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Workforce Project"
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";
      const expected: any = {};
      expected[itemTemplate.itemId] = { itemId: newItemID };
      const templateDictionary: any = {};

      const userUrl: string =
        utils.PORTAL_SUBSET.restUrl +
        "/community/users/casey?f=json&token=fake-token";
      const queryUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/query?f=json&where=userId%20%3D%20%27LocalGovDeployCasey%27&outFields=*&token=fake-token";
      const addUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/addFeatures";

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/self?f=json&token=fake-token",
          communitySelfResponse
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: newItemID, folder: null })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemID +
            "/update",
          { success: true }
        )
        .get(queryUrl, {
          features: []
        })
        .post(addUrl, {
          addResults: [{}]
        });

      // tslint:disable-next-line: no-floating-promises
      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(r => {
          expect(templateDictionary).toEqual(expected);
          expect(r).toEqual({
            id: newItemID,
            type: itemTemplate.type,
            postProcess: false
          });
          done();
        });
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

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: newItemId, folder: null })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemId +
            "/update",
          { success: true }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemId +
            "/addResources",
          { success: true }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemId +
            "/updateResources",
          { success: true }
        );

      // tslint:disable-next-line: no-floating-promises
      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(actual => {
          expect(actual).toEqual({
            id: newItemId,
            type: itemTemplate.type,
            postProcess: true
          });
          expect(templateDictionary).toEqual(expectedTemplateDictionary);
          done();
        });
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
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: newItemId, folder: null })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemId +
            "/update",
          { success: true }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemId +
            "/updateResources",
          mockItems.get400Failure()
        );

      // tslint:disable-next-line: no-floating-promises
      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          done();
        });
    });

    it("should handle web mapping application that is a WAB", done => {
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
        properties: null,
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
            mapItemId: "{{myMapId.itemId}}"
          },
          itemId: "{{myMapId.itemId}}"
        },
        folderId: "{{folderId}}"
      };
      itemTemplate.dependencies = ["myMapId"];

      const layer0: any = {
        serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
        id: 0
      };

      const updatedItem = mockItems.getAGOLItem(
        "Web Mapping Application",
        utils.PORTAL_SUBSET.portalUrl +
          "/home/item.html?id=abc0cab401af4828a25cc6eaeb59fb69"
      );
      updatedItem.id = "abc0cab401af4828a25cc6eaeb59fb69";

      const expectedData: any = {
        appItemId: "abc0cab401af4828a25cc6eaeb59fb69",
        values: {
          webmap: "map0cab401af4828a25cc6eaeb59fb69"
        },
        map: {
          appProxy: {
            mapItemId: "map0cab401af4828a25cc6eaeb59fb69"
          },
          itemId: "map0cab401af4828a25cc6eaeb59fb69"
        },
        folderId: "folderb401af4828a25cc6eaeb59fb69"
      };

      fetchMock
        .post(
          "https://fake.com/arcgis/rest/services/test/FeatureServer/0",
          layer0
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/folderb401af4828a25cc6eaeb59fb69/addItem",
          utils.getSuccessResponse({
            id: "abc0cab401af4828a25cc6eaeb59fb69",
            folder: null
          })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/abc0cab401af4828a25cc6eaeb59fb69/update",
          { success: true }
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69?f=json&token=fake-token",
          updatedItem
        );
      staticRelatedItemsMocks.fetchMockRelatedItems(
        "abc0cab401af4828a25cc6eaeb59fb69",
        { total: 0, relatedItems: [] }
      );

      // tslint:disable-next-line: no-floating-promises
      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          {
            portalBaseUrl: utils.PORTAL_SUBSET.portalUrl,
            folderId: "folderb401af4828a25cc6eaeb59fb69",
            myMapId: {
              itemId: "map0cab401af4828a25cc6eaeb59fb69"
            }
          },
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(actual => {
          expect(actual).toEqual({
            id: "abc0cab401af4828a25cc6eaeb59fb69",
            type: itemTemplate.type,
            postProcess: false
          });
          done();
        });
    });

    it("should handle web mapping application that's not a WAB", done => {
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
        typeKeywords: [],
        url:
          "{{portalBaseUrl}}/home/item.html?id={{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
        licenseInfo: undefined,
        properties: null,
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
            mapItemId: "{{myMapId.itemId}}"
          },
          itemId: "{{myMapId.itemId}}"
        },
        folderId: "{{folderId}}"
      };
      itemTemplate.dependencies = ["myMapId"];

      const layer0: any = {
        serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
        id: 0
      };

      const updatedItem = mockItems.getAGOLItem(
        "Web Mapping Application",
        utils.PORTAL_SUBSET.portalUrl +
          "/home/item.html?id=abc0cab401af4828a25cc6eaeb59fb69"
      );
      updatedItem.id = "abc0cab401af4828a25cc6eaeb59fb69";

      const expectedData: any = {
        appItemId: "abc0cab401af4828a25cc6eaeb59fb69",
        values: {
          webmap: "map0cab401af4828a25cc6eaeb59fb69"
        },
        map: {
          appProxy: {
            mapItemId: "map0cab401af4828a25cc6eaeb59fb69"
          },
          itemId: "map0cab401af4828a25cc6eaeb59fb69"
        },
        folderId: "folderb401af4828a25cc6eaeb59fb69"
      };

      fetchMock
        .post(
          "https://fake.com/arcgis/rest/services/test/FeatureServer/0",
          layer0
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/folderb401af4828a25cc6eaeb59fb69/addItem",
          utils.getSuccessResponse({
            id: "abc0cab401af4828a25cc6eaeb59fb69",
            folder: null
          })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/abc0cab401af4828a25cc6eaeb59fb69/update",
          { success: true }
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69?f=json&token=fake-token",
          updatedItem
        );
      staticRelatedItemsMocks.fetchMockRelatedItems(
        "abc0cab401af4828a25cc6eaeb59fb69",
        { total: 0, relatedItems: [] }
      );

      // tslint:disable-next-line: no-floating-promises
      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          {
            portalBaseUrl: utils.PORTAL_SUBSET.portalUrl,
            folderId: "folderb401af4828a25cc6eaeb59fb69",
            myMapId: {
              itemId: "map0cab401af4828a25cc6eaeb59fb69"
            },
            abc0cab401af4828a25cc6eaeb59fb69: {
              itemId: "abc0cab401af4828a25cc6eaeb59fb69"
            }
          },
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(actual => {
          expect(actual).toEqual({
            id: "abc0cab401af4828a25cc6eaeb59fb69",
            type: itemTemplate.type,
            postProcess: false
          });
          done();
        });
    });

    it("should handle web mapping application with related items", done => {
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
        properties: null,
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
            mapItemId: "{{myMapId.itemId}}"
          },
          itemId: "{{myMapId.itemId}}"
        },
        folderId: "{{folderId}}"
      };
      itemTemplate.relatedItems = [
        {
          relationshipType: "Survey2Service",
          relatedItemIds: ["srv1234567890"]
        },
        {
          relationshipType: "Survey2Data",
          relatedItemIds: ["srv1234567890", "abc1234567890"]
        }
      ];
      itemTemplate.dependencies = ["myMapId", "srv1234567890", "abc1234567890"];

      const layer0: any = {
        serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
        id: 0
      };

      const updatedItem = mockItems.getAGOLItem(
        "Web Mapping Application",
        utils.PORTAL_SUBSET.portalUrl +
          "/home/item.html?id=abc0cab401af4828a25cc6eaeb59fb69"
      );
      updatedItem.id = "abc0cab401af4828a25cc6eaeb59fb69";

      fetchMock
        .post(
          "https://fake.com/arcgis/rest/services/test/FeatureServer/0",
          layer0
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/folderb401af4828a25cc6eaeb59fb69/addItem",
          utils.getSuccessResponse({
            id: "abc0cab401af4828a25cc6eaeb59fb69",
            folder: null
          })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addRelationship",
          { success: true }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/abc0cab401af4828a25cc6eaeb59fb69/update",
          { success: true }
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69?f=json&token=fake-token",
          updatedItem
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/map1234567890/delete",
          utils.getSuccessResponse({ itemId: "map1234567890" })
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

      // tslint:disable-next-line: no-floating-promises
      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          {
            portalBaseUrl: utils.PORTAL_SUBSET.portalUrl,
            folderId: "folderb401af4828a25cc6eaeb59fb69",
            myMapId: {
              itemId: "map0cab401af4828a25cc6eaeb59fb69"
            }
          },
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(actual => {
          expect(actual).toEqual({
            id: "abc0cab401af4828a25cc6eaeb59fb69",
            type: itemTemplate.type,
            postProcess: false
          });
          done();
        });
    });

    it("should handle web mapping application with missing data section and templatized URL", done => {
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
        properties: null,
        tags: undefined,
        thumbnail: undefined,
        typeKeywords: ["WAB2D"],
        url:
          "{{portalBaseUrl}}/home/item.html?id={{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
        licenseInfo: undefined,
        name: undefined,
        snippet: undefined
      };
      itemTemplate.data = undefined;
      itemTemplate.dependencies = [];

      const updatedItem = mockItems.getAGOLItem(
        "Web Mapping Application",
        utils.PORTAL_SUBSET.portalUrl +
          "/home/item.html?id=abc0cab401af4828a25cc6eaeb59fb69"
      );
      updatedItem.id = "abc0cab401af4828a25cc6eaeb59fb69";
      updatedItem.thumbnail = null;

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({
            id: "abc0cab401af4828a25cc6eaeb59fb69",
            folder: null
          })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/abc0cab401af4828a25cc6eaeb59fb69/update",
          { success: true }
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69?f=json&token=fake-token",
          updatedItem
        );

      // tslint:disable-next-line: no-floating-promises
      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          {
            portalBaseUrl: utils.PORTAL_SUBSET.portalUrl
          },
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(actual => {
          expect(actual).toEqual({
            id: "abc0cab401af4828a25cc6eaeb59fb69",
            type: itemTemplate.type,
            postProcess: false
          });
          done();
        });
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
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({
            id: "abc0cab401af4828a25cc6eaeb59fb69",
            folder: null
          })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/folderId/addItem",
          utils.getSuccessResponse({
            id: "abc2cab401af4828a25cc6eaeb59fb69",
            folder: null
          })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/abc2cab401af4828a25cc6eaeb59fb69/update",
          mockItems.get400FailureResponse()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/abc0cab401af4828a25cc6eaeb59fb69/update",
          mockItems.get400FailureResponse()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/map1234567890/delete",
          utils.getSuccessResponse({ itemId: "map1234567890" })
        );

      // tslint:disable-next-line: no-floating-promises
      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          {
            folderId: "folderId",
            abc0cab401af4828a25cc6eaeb59fb69: {
              id: "abc1cab401af4828a25cc6eaeb59fb69"
            }
          },
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          done();
        });
    });

    it("should handle cancellation before deployment of item starts", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Web Map"
      );
      const templateDictionary: any = {};

      simpleTypes
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

    it("should handle cancellation after deployed item is created", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Web Map"
      );
      const templateDictionary: any = {};

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: itemTemplate.itemId, folder: null })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/map1234567890/delete",
          utils.getSuccessResponse({ itemId: itemTemplate.itemId })
        );

      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallbackOnNthCall(2)
        )
        .then(response => {
          expect(response).toEqual(templates.getFailedItem(itemTemplate.type));
          done();
        }, done.fail);
    });

    it("should handle cancellation failure after deployed item is created", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Web Map"
      );
      const templateDictionary: any = {};

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: itemTemplate.itemId, folder: null })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/map1234567890/delete",
          utils.getFailureResponse({ itemId: itemTemplate.itemId })
        );

      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallbackOnNthCall(2)
        )
        .then(response => {
          expect(response).toEqual(templates.getFailedItem(itemTemplate.type));
          done();
        }, done.fail);
    });

    it("should handle cancellation after deployed item is finished", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Web Map"
      );
      const templateDictionary: any = {
        portalBaseUrl: utils.PORTAL_SUBSET.portalUrl
      };

      const updatedItem = mockItems.getAGOLItem(
        "Web Map",
        "https://myorg.maps.arcgis.com/home/webmap/viewer.html?webmap=map1234567890"
      );

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: itemTemplate.itemId, folder: null })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/map1234567890/update",
          { success: true, id: itemTemplate.itemId }
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/map1234567890?f=json&token=fake-token",
          updatedItem
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/map1234567890/delete",
          utils.getSuccessResponse({ itemId: itemTemplate.itemId })
        );

      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallbackOnNthCall(3)
        )
        .then(response => {
          expect(response).toEqual(templates.getFailedItem(itemTemplate.type));
          done();
        }, done.fail);
    });

    it("should handle cancellation failure after deployed item is finished", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Web Map"
      );
      const templateDictionary: any = {
        portalBaseUrl: utils.PORTAL_SUBSET.portalUrl
      };

      const updatedItem = mockItems.getAGOLItem(
        "Web Map",
        "https://myorg.maps.arcgis.com/home/webmap/viewer.html?webmap=map1234567890"
      );

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: itemTemplate.itemId, folder: null })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/map1234567890/update",
          { success: true, id: itemTemplate.itemId }
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/map1234567890?f=json&token=fake-token",
          updatedItem
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/map1234567890/delete",
          utils.getFailureResponse({ itemId: itemTemplate.itemId })
        );

      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallbackOnNthCall(3)
        )
        .then(response => {
          expect(response).toEqual(templates.getFailedItem(itemTemplate.type));
          done();
        }, done.fail);
    });
  });

  describe("postProcessFieldReferences ::", () => {
    xit("should process dashboard field references", () => {
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

  describe("utils.createFailingItemProgressCallbackOnNthCall", () => {
    it("fails upon first call", () => {
      const itemId = "itm1234567890";
      const status = common.EItemProgressStatus.Started;
      const costUsed = 0;
      const progressCallback = utils.createFailingItemProgressCallbackOnNthCall(
        1
      );
      expect(progressCallback(itemId, status, costUsed)).toBeFalsy();
    });

    it("fails upon second call", () => {
      const itemId = "itm1234567890";
      const status = common.EItemProgressStatus.Started;
      const costUsed = 0;
      const progressCallback = utils.createFailingItemProgressCallbackOnNthCall(
        2
      );
      expect(progressCallback(itemId, status, costUsed)).toBeTruthy();
      expect(progressCallback(itemId, status, costUsed)).toBeFalsy();
    });

    it("fails upon third call", () => {
      const itemId = "itm1234567890";
      const status = common.EItemProgressStatus.Started;
      const costUsed = 0;
      const progressCallback = utils.createFailingItemProgressCallbackOnNthCall(
        3
      );
      expect(progressCallback(itemId, status, costUsed)).toBeTruthy();
      expect(progressCallback(itemId, status, costUsed)).toBeTruthy();
      expect(progressCallback(itemId, status, costUsed)).toBeFalsy();
    });
  });

  describe("postProcess hook", () => {
    it("fetch, interpolate and share", () => {
      const dataSpy = spyOn(common, "getItemDataAsJson").and.resolveTo({
        value: "{{owner}}"
      });
      const td = { owner: "Luke Skywalker" };
      const updateSpy = spyOn(common, "updateItemExtended").and.resolveTo();
      const template = templates.getItemTemplateSkeleton();
      return simpleTypes
        .postProcess(
          "3ef",
          "Web Map",
          [],
          template,
          [template],
          td,
          MOCK_USER_SESSION
        )
        .then(() => {
          expect(dataSpy.calls.count()).toBe(1, "should fetch data");
          expect(dataSpy.calls.argsFor(0)[0]).toBe(
            "3ef",
            "should fetch data for specified item"
          );
          expect(updateSpy.calls.count()).toBe(1, "should update the item");
          expect(updateSpy.calls.argsFor(0)[2].value).toBe(
            "Luke Skywalker",
            "should interpolate value"
          );
        });
    });
    it("should update only if interpolation needed", () => {
      const dataSpy = spyOn(common, "getItemDataAsJson").and.resolveTo({
        value: "Larry"
      });
      const updateSpy = spyOn(common, "updateItemExtended").and.resolveTo();
      const template = templates.getItemTemplateSkeleton();
      return simpleTypes
        .postProcess(
          "3ef",
          "Web Map",
          [],
          template,
          [template],
          {},
          MOCK_USER_SESSION
        )
        .then(() => {
          expect(dataSpy.calls.count()).toBe(1, "should fetch data");
          expect(dataSpy.calls.argsFor(0)[0]).toBe(
            "3ef",
            "should fetch data for specified item"
          );
          expect(updateSpy.calls.count()).toBe(0, "should not update the item");
        });
    });
  });
});
