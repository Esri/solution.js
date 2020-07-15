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
 * Provides tests for functions involving the creation of the template of a Solution item via the REST API.
 */

import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as staticRelatedItemsMocks from "../../common/test/mocks/staticRelatedItemsMocks";
import * as templates from "../../common/test/mocks/templates";
import * as utils from "../../common/test/mocks/utils";
import { solutionTemplates } from "./fixtures/solution-templates";
import { processedSolutionTemplates } from "./fixtures/processed-solution-templates";

import * as common from "@esri/solution-common";
import * as createItemTemplate from "../src/createItemTemplate";

const noDataResponse: any = {};
const noResourcesResponse: any = {
  total: 0,
  start: 1,
  num: 0,
  nextStart: -1,
  resources: []
};
const noMetadataResponse: any = {
  error: {
    code: 400,
    messageCode: "CONT_0036",
    message: "Item info file does not exist or is inaccessible.",
    details: ["Error getting Item Info from DataStore"]
  }
};

let MOCK_USER_SESSION: common.UserSession;
let initialSolutionTemplates: common.IItemTemplate[];
beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
  initialSolutionTemplates = common.cloneObject(solutionTemplates);
});

afterEach(() => {
  fetchMock.restore();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `createItemTemplate`", () => {
  // Blobs are only available in the browser
  if (typeof window !== "undefined") {
    describe("createItemTemplate", () => {
      it("creates a template for an item", done => {
        const solutionItemId: string = "sln1234567890";
        const itemId: string = "map12345678900";
        const templateDictionary: any = {};
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const existingTemplates: common.IItemTemplate[] = [];

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678900?f=json&token=fake-token",
            mockItems.getAGOLItem("Web Map")
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890/info/thumbnail/ago_downloaded.png?w=400",
            mockItems.getAnImageResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/items/map1234567890/data",
            noDataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890/resources",
            noResourcesResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: solutionItemId }
          );
        staticRelatedItemsMocks.fetchMockRelatedItems("map1234567890", {
          total: 0,
          relatedItems: []
        });

        return createItemTemplate
          .createItemTemplate(
            solutionItemId,
            itemId,
            templateDictionary,
            authentication,
            existingTemplates,
            utils.ITEM_PROGRESS_CALLBACK
          )
          .then(() => {
            expect(existingTemplates.length).toEqual(1);
            expect(existingTemplates[0].itemId).toEqual(itemId);
            done();
          });
      });

      it("should handle cancellation after item's template is created", done => {
        const solutionItemId: string = "sln1234567890";
        const itemId: string = "map12345678900";
        const templateDictionary: any = {};
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const existingTemplates: common.IItemTemplate[] = [];

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678900?f=json&token=fake-token",
            mockItems.getAGOLItem("Web Map")
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890/info/thumbnail/ago_downloaded.png?w=400",
            mockItems.getAnImageResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/items/map1234567890/data",
            noDataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890/resources",
            noResourcesResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: solutionItemId }
          );
        staticRelatedItemsMocks.fetchMockRelatedItems("map1234567890", {
          total: 0,
          relatedItems: []
        });

        return createItemTemplate
          .createItemTemplate(
            solutionItemId,
            itemId,
            templateDictionary,
            authentication,
            existingTemplates,
            utils.createFailingItemProgressCallbackOnNthCall(2)
          )
          .then(res => {
            expect(existingTemplates.length).toEqual(1);
            expect(existingTemplates[0].itemId).toEqual(itemId);
            done();
          });
      });

      it("shortcuts if template is already done or in progress", done => {
        const solutionItemId: string = "sln1234567890";
        const itemId: string = "map1234567890";
        const templateDictionary: any = {};
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const existingTemplates: common.IItemTemplate[] = [
          templates.getItemTemplate("Web Map")
        ];

        // tslint:disable-next-line: no-floating-promises
        createItemTemplate
          .createItemTemplate(
            solutionItemId,
            itemId,
            templateDictionary,
            authentication,
            existingTemplates,
            utils.ITEM_PROGRESS_CALLBACK
          )
          .then(() => {
            expect(existingTemplates.length).toEqual(1);
            expect(existingTemplates[0].itemId).toEqual(itemId);
            done();
          });
      });

      it("handles problem creating a template for an item", done => {
        const solutionItemId: string = "sln1234567890";
        const itemId: string = "wma1234567890";
        const templateDictionary: any = {};
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const existingTemplates: common.IItemTemplate[] = [];
        const wmaData = mockItems.getAGOLItemData("Web Mapping Application");
        common.setCreateProp(
          wmaData,
          "dataSource.dataSources.fred.url",
          utils.PORTAL_SUBSET.portalUrl + "/FeatureServer"
        );

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/wma1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Web Mapping Application")
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/wma1234567890/info/thumbnail/ago_downloaded.png?w=400",
            mockItems.getAnImageResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/items/wma1234567890/data",
            wmaData
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/wma1234567890/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/wma1234567890/resources",
            noResourcesResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Web Map")
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890/info/thumbnail/ago_downloaded.png?w=400",
            mockItems.getAnImageResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/items/map1234567890/data",
            noDataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890/resources",
            noResourcesResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: solutionItemId }
          )
          .post(
            utils.PORTAL_SUBSET.portalUrl + "/FeatureServer",
            mockItems.get500Failure()
          );
        staticRelatedItemsMocks.fetchMockRelatedItems("wma1234567890", {
          total: 0,
          relatedItems: []
        });

        // tslint:disable-next-line: no-floating-promises
        createItemTemplate
          .createItemTemplate(
            solutionItemId,
            itemId,
            templateDictionary,
            authentication,
            existingTemplates,
            utils.ITEM_PROGRESS_CALLBACK
          )
          .then(() => {
            const createdTemplate = common.findTemplateInList(
              existingTemplates,
              itemId
            );
            expect(createdTemplate.properties.error).not.toBeUndefined();
            const parsedError: any = JSON.parse(
              createdTemplate.properties.error
            );
            expect(parsedError.success).toBeFalse();
            expect(parsedError.error.message).toEqual(
              "Item does not have a file."
            );
            done();
          });
      });

      it("creates a template for an empty group", done => {
        const solutionItemId: string = "sln1234567890";
        const itemId: string = "grp1234567890";
        const templateDictionary: any = {};
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const existingTemplates: common.IItemTemplate[] = [];

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/grp1234567890?f=json&token=fake-token",
            mockItems.get400Failure()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890/info/ROWPermitManager.png?w=400",
            mockItems.getAnImageResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/grp1234567890/resources",
            noResourcesResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsList(0)
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: solutionItemId }
          );

        // tslint:disable-next-line: no-floating-promises
        createItemTemplate
          .createItemTemplate(
            solutionItemId,
            itemId,
            templateDictionary,
            authentication,
            existingTemplates,
            utils.ITEM_PROGRESS_CALLBACK
          )
          .then(() => {
            expect(existingTemplates.length).toEqual(1);
            expect(existingTemplates[0].itemId).toEqual(itemId);
            done();
          });
      });

      it("creates a template for an empty group, but solution thumbnail can't be fetched", done => {
        const solutionItemId: string = "sln1234567890";
        const itemId: string = "grp1234567890";
        const templateDictionary: any = {};
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const existingTemplates: common.IItemTemplate[] = [];
        const solutionThumbnail = mockItems.getAGOLItem("Image");
        solutionThumbnail.tags.push("deploy.thumbnail");

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/grp1234567890?f=json&token=fake-token",
            mockItems.get400Failure()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890/info/ROWPermitManager.png?w=400",
            mockItems.getAnImageResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/grp1234567890/resources",
            noResourcesResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsList(1, "Image")
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/img12345678900?f=json&token=fake-token",
            solutionThumbnail
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/items/img12345678900/data",
            mockItems.get400Failure()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: solutionItemId }
          );

        // tslint:disable-next-line: no-floating-promises
        createItemTemplate
          .createItemTemplate(
            solutionItemId,
            itemId,
            templateDictionary,
            authentication,
            existingTemplates,
            utils.ITEM_PROGRESS_CALLBACK
          )
          .then(() => {
            expect(existingTemplates.length).toEqual(2);
            expect(existingTemplates[0].itemId).toEqual(itemId);
            expect(existingTemplates[1].itemId).toEqual("img12345678900");
            done();
          });
      });

      it("creates a template for an empty group, but solution's thumbnail can't be set", done => {
        const solutionItemId: string = "sln1234567890";
        const itemId: string = "grp1234567890";
        const templateDictionary: any = {};
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const existingTemplates: common.IItemTemplate[] = [];
        const solutionThumbnail = mockItems.getAGOLItem("Image");
        solutionThumbnail.tags.push("deploy.thumbnail");

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/grp1234567890?f=json&token=fake-token",
            mockItems.get400Failure()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890/info/ROWPermitManager.png?w=400",
            mockItems.getAnImageResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/grp1234567890/resources",
            noResourcesResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsList(1, "Image")
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/img12345678900?f=json&token=fake-token",
            solutionThumbnail
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/items/img12345678900/data",
            mockItems.getAnImageResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: solutionItemId }
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/update",
            mockItems.get400Failure()
          );

        // tslint:disable-next-line: no-floating-promises
        createItemTemplate
          .createItemTemplate(
            solutionItemId,
            itemId,
            templateDictionary,
            authentication,
            existingTemplates,
            utils.ITEM_PROGRESS_CALLBACK
          )
          .then(() => {
            expect(existingTemplates.length).toEqual(2);
            expect(existingTemplates[0].itemId).toEqual(itemId);
            expect(existingTemplates[1].itemId).toEqual("img12345678900");
            done();
          });
      });

      it("creates a template for a group", done => {
        const solutionItemId: string = "sln1234567890";
        const itemId: string = "grp1234567890";
        const templateDictionary: any = {};
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const existingTemplates: common.IItemTemplate[] = [];
        const solutionThumbnail = mockItems.getAGOLItemWithId("Image", 1);
        solutionThumbnail.tags.push("deploy.thumbnail");

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/grp1234567890?f=json&token=fake-token",
            mockItems.get400Failure()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890/info/ROWPermitManager.png?w=400",
            mockItems.getAnImageResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/grp1234567890/resources",
            noResourcesResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsListByType(["Image", "Web Map"])
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/img12345678900?f=json&token=fake-token",
            solutionThumbnail
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/items/img12345678900/data",
            mockItems.getAnImageResponse()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678901?f=json&token=fake-token",
            mockItems.getAGOLItemWithId("Web Map", 1)
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/items/map12345678901/data",
            noDataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678901/info/thumbnail/ago_downloaded.png?w=400",
            mockItems.getAnImageResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678901/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678901/resources",
            noResourcesResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: solutionItemId }
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/update",
            utils.getSuccessResponse({ id: solutionItemId })
          );
        staticRelatedItemsMocks.fetchMockRelatedItems("map12345678901", {
          total: 0,
          relatedItems: []
        });

        // tslint:disable-next-line: no-floating-promises
        createItemTemplate
          .createItemTemplate(
            solutionItemId,
            itemId,
            templateDictionary,
            authentication,
            existingTemplates,
            utils.ITEM_PROGRESS_CALLBACK
          )
          .then(() => {
            expect(existingTemplates.length).toEqual(3);
            expect(existingTemplates[0].itemId).toEqual(itemId);
            expect(existingTemplates[1].itemId).toEqual("img12345678900");
            expect(existingTemplates[2].itemId).toEqual("map12345678901");
            done();
          });
      });

      it("creates a template for a group, testing duplication removal", done => {
        const solutionItemId: string = "sln1234567890";
        const itemId: string = "grp1234567890";
        const templateDictionary: any = {};
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const existingTemplates: common.IItemTemplate[] = [];
        const groupContents = mockItems.getAGOLGroupContentsList(2, "Web Map");
        groupContents.items[0].id = groupContents.items[0].item = groupContents.items[1].id = groupContents.items[1].item =
          "map1234567890";

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/grp1234567890?f=json&token=fake-token",
            mockItems.get400Failure()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890/info/ROWPermitManager.png?w=400",
            mockItems.getAnImageResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/grp1234567890/resources",
            noResourcesResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            groupContents
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Web Map")
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890/info/thumbnail/ago_downloaded.png?w=400",
            mockItems.getAnImageResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/items/map1234567890/data",
            noDataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890/resources",
            noResourcesResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: solutionItemId }
          );
        staticRelatedItemsMocks.fetchMockRelatedItems("map1234567890", {
          total: 0,
          relatedItems: []
        });

        // tslint:disable-next-line: no-floating-promises
        createItemTemplate
          .createItemTemplate(
            solutionItemId,
            itemId,
            templateDictionary,
            authentication,
            existingTemplates,
            utils.ITEM_PROGRESS_CALLBACK
          )
          .then(() => {
            expect(existingTemplates.length).toEqual(2);
            expect(existingTemplates[0].itemId).toEqual(itemId);
            expect(existingTemplates[1].itemId).toEqual(
              groupContents.items[0].id
            );
            done();
          });
      });

      it("handles inability to get a dependency", done => {
        const solutionItemId: string = "sln1234567890";
        const itemId: string = "grp1234567890";
        const templateDictionary: any = {};
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const existingTemplates: common.IItemTemplate[] = [];

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/grp1234567890?f=json&token=fake-token",
            mockItems.get400Failure()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890/info/ROWPermitManager.png?w=400",
            mockItems.getAnImageResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/grp1234567890/resources",
            noResourcesResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsList(1, "Web Map")
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678900?f=json&token=fake-token",
            mockItems.get400Failure()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/map12345678900?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: solutionItemId }
          );

        // tslint:disable-next-line: no-floating-promises
        createItemTemplate
          .createItemTemplate(
            solutionItemId,
            itemId,
            templateDictionary,
            authentication,
            existingTemplates,
            utils.ITEM_PROGRESS_CALLBACK
          )
          .then(() => {
            expect(existingTemplates.length).toEqual(2);
            expect(existingTemplates[0].itemId).toEqual(itemId);
            expect(existingTemplates[1].itemId).toEqual("map12345678900");
            done();
          });
      });

      it("creates inserts a placeholder template for an item type that's not handled", done => {
        const solutionItemId: string = "sln1234567890";
        const itemId: string = "xxx1234567890";
        const templateDictionary: any = {};
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const existingTemplates: common.IItemTemplate[] = [];

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/xxx1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Undefined")
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: solutionItemId }
          );

        // tslint:disable-next-line: no-floating-promises
        createItemTemplate
          .createItemTemplate(
            solutionItemId,
            itemId,
            templateDictionary,
            authentication,
            existingTemplates,
            utils.ITEM_PROGRESS_CALLBACK
          )
          .then(() => {
            expect(existingTemplates.length).toEqual(1);
            expect(existingTemplates[0].itemId).toEqual(itemId);
            done();
          });
      });

      it("shortcuts if item type is not supported", done => {
        const solutionItemId: string = "sln1234567890";
        const itemId: string = "xxx1234567890";
        const templateDictionary: any = {};
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const existingTemplates: common.IItemTemplate[] = [];

        fetchMock.get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/xxx1234567890?f=json&token=fake-token",
          mockItems.getAGOLItem("Unsupported")
        );

        // tslint:disable-next-line: no-floating-promises
        createItemTemplate
          .createItemTemplate(
            solutionItemId,
            itemId,
            templateDictionary,
            authentication,
            existingTemplates,
            utils.ITEM_PROGRESS_CALLBACK
          )
          .then(() => {
            expect(existingTemplates.length).toEqual(1);
            expect(existingTemplates[0].itemId).toEqual(itemId);
            done();
          });
      });

      it("removes source-itemIds from typeKeywords and tags", done => {
        const solutionItemId: string = "sln1234567890";
        const itemId: string = "map12345678900";
        const templateDictionary: any = {};
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const existingTemplates: common.IItemTemplate[] = [];
        const preExpectedTags: string[] = [
          "test",
          "source-aa4a6047326243b290f625e80ebe6531"
        ];
        const preExpectedTypeKeywords: string[] = [
          "JavaScript",
          "source-aa4a6047326243b290f625e80ebe6531"
        ];
        const webmap: any = mockItems.getAGOLItem("Web Map");
        webmap.typeKeywords.push("source-aa4a6047326243b290f625e80ebe6531");
        webmap.tags.push("source-aa4a6047326243b290f625e80ebe6531");

        expect(webmap.tags)
          .withContext("test initial tags")
          .toEqual(preExpectedTags);
        expect(webmap.typeKeywords)
          .withContext("test initial typeKeywords")
          .toEqual(preExpectedTypeKeywords);

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678900?f=json&token=fake-token",
            webmap
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890/info/thumbnail/ago_downloaded.png?w=400",
            mockItems.getAnImageResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/items/map1234567890/data",
            noDataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890/resources",
            noResourcesResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: solutionItemId }
          );
        staticRelatedItemsMocks.fetchMockRelatedItems("map1234567890", {
          total: 0,
          relatedItems: []
        });

        const getItemBase = spyOn(common, "getItemBase");
        getItemBase.and.callThrough();

        const storeItemResources = spyOn(common, "storeItemResources");
        storeItemResources.and.callThrough();
        const expectedTags: string[] = ["test"];
        const expectedTypeKeywords: string[] = ["JavaScript"];

        // tslint:disable-next-line: no-floating-promises
        createItemTemplate
          .createItemTemplate(
            solutionItemId,
            itemId,
            templateDictionary,
            authentication,
            existingTemplates,
            utils.ITEM_PROGRESS_CALLBACK
          )
          .then(() => {
            // getItemBase.calls.mostRecent().returnValue.then(v => {
            //   expect(v.tags).toEqual(preExpectedTags);
            //   expect(v.typeKeywords).toEqual(preExpectedTypeKeywords);
            // }, done.fail);
            const actualTemplate: any = storeItemResources.calls.mostRecent()
              .args[0];
            expect(actualTemplate.item.tags)
              .withContext("test final tags")
              .toEqual(expectedTags);
            expect(actualTemplate.item.typeKeywords)
              .withContext("test final typeKeywords")
              .toEqual(expectedTypeKeywords);
            done();
          });
      });
    });
  }

  describe("postProcessFieldReferences", () => {
    if (typeof window !== "undefined") {
      it("postProcessFieldReferences", () => {
        const actual: common.IItemTemplate[] = createItemTemplate.postProcessFieldReferences(
          initialSolutionTemplates
        );
        expect(actual).toEqual(common.cloneObject(processedSolutionTemplates));
      });
    }
  });

  describe("_getDatasourceInfos", () => {
    it("can handle undefined layers or tables", () => {
      const template: common.IItemTemplate = templates.getItemTemplateSkeleton();
      template.type = "Feature Service";
      template.properties = {};
      const actual: common.IDatasourceInfo[] = createItemTemplate._getDatasourceInfos(
        [template]
      );
      expect(actual).toEqual([]);
    });
  });

  describe("_addLayerIdToDatasourceUrl", () => {
    it("inserts numeric layer id into datasource URL", () => {
      const datasourceUrl = "{{b19aec399444407da84fffe2a55d4151.url}}";
      const layerId = 8;
      const expectedAmendedDatasourceUrl =
        "{{b19aec399444407da84fffe2a55d4151.layer8.url}}";

      const actualAmendedDatasourceUrl: string = createItemTemplate._addLayerIdToDatasourceUrl(
        datasourceUrl,
        layerId
      );
      expect(actualAmendedDatasourceUrl).toEqual(expectedAmendedDatasourceUrl);
    });

    it("returns an empty string if the datasource URL is missing", () => {
      const layerId = 8;
      const expectedAmendedDatasourceUrl = "";

      const actualAmendedDatasourceUrl: string = createItemTemplate._addLayerIdToDatasourceUrl(
        undefined,
        layerId
      );
      expect(actualAmendedDatasourceUrl).toEqual(expectedAmendedDatasourceUrl);
    });

    it("returns an empty string if the layer id isn't numeric", () => {
      const datasourceUrl = "{{b19aec399444407da84fffe2a55d4151.url}}";
      const layerId = "a";
      const expectedAmendedDatasourceUrl = "";

      const actualAmendedDatasourceUrl: string = createItemTemplate._addLayerIdToDatasourceUrl(
        datasourceUrl,
        layerId
      );
      expect(actualAmendedDatasourceUrl).toEqual(expectedAmendedDatasourceUrl);
    });

    it("returns an empty string if the layer id not supplied", () => {
      const expectedAmendedDatasourceUrl = "";

      const actualAmendedDatasourceUrl: string = createItemTemplate._addLayerIdToDatasourceUrl();
      expect(actualAmendedDatasourceUrl).toEqual(expectedAmendedDatasourceUrl);
    });
  });
});
