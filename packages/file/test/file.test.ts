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
 * Provides tests for the creation and deployment of item types that contain files.
 */

import * as file from "../src/file";
import * as utils from "../../common/test/mocks/utils";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as templates from "../../common/test/mocks/templates";
import * as common from "@esri/solution-common";

const SERVER_INFO = {
  currentVersion: 10.1,
  fullVersion: "10.1",
  soapUrl: "http://server/arcgis/services",
  secureSoapUrl: "https://server/arcgis/services",
  owningSystemUrl: "https://myorg.maps.arcgis.com",
  authInfo: {},
};

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

const noResourcesResponse: any = {
  total: 0,
  start: 1,
  num: 0,
  nextStart: -1,
  resources: [],
};

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

afterEach(() => {
  fetchMock.restore();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `file`: manages the creation and deployment of item types that contain files", () => {
  describe("convertItemToTemplate :: ", () => {
    it("handles GeoJson with no data", async () => {
      const agolItem = mockItems.getAGOLItem("GeoJson");
      agolItem.thumbnail = null;

      fetchMock
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/jsn1234567890/data", mockItems.get500Failure())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/jsn1234567890/resources", noResourcesResponse)
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/jsn1234567890/info/metadata/metadata.xml",
          mockItems.get400Failure(),
        );

      const response = await file.convertItemToTemplate(agolItem, MOCK_USER_SESSION, MOCK_USER_SESSION);
      expect(response.itemId).toEqual("jsn1234567890");
      expect(response.type).toEqual("GeoJson");
    });

    it("handles GeoJson with data & resources", async () => {
      const solutionItemId: string = "sln1234567890";
      const agolItem = mockItems.getAGOLItem("GeoJson");
      agolItem.thumbnail = null;

      fetchMock
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/jsn1234567890/data", {})
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/jsn1234567890/resources",
          mockItems.getAGOLItemResources("one png"),
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/jsn1234567890/info/metadata/metadata.xml",
          mockItems.get400Failure(),
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/jsn1234567890/resources/anImage.png",
          utils.getSampleImageAsBlob(),
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/sln1234567890/addResources", {
          success: true,
          id: solutionItemId,
        });

      const response = await file.convertItemToTemplate(agolItem, MOCK_USER_SESSION, MOCK_USER_SESSION);
      expect(response.itemId).toEqual("jsn1234567890");
      expect(response.type).toEqual("GeoJson");
    });

    it("handles Code Attachment with zip data using item name", async () => {
      const solutionItemId: string = "sln1234567890";
      const agolItem = mockItems.getAGOLItem("Code Attachment");
      agolItem.thumbnail = null;

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/cod1234567890/data",
          utils.getSampleZipFile("myZipFile.zip"),
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/cod1234567890/resources", mockItems.get500Failure())
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/cod1234567890/info/metadata/metadata.xml",
          mockItems.get400Failure(),
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/sln1234567890/addResources", {
          success: true,
          id: solutionItemId,
        });

      const response = await file.convertItemToTemplate(agolItem, MOCK_USER_SESSION, MOCK_USER_SESSION);
      expect(response.itemId).toEqual("cod1234567890");
      expect(response.type).toEqual("Code Attachment");
      expect(response.resources).toEqual(["cod1234567890_info_data/Name of an AGOL item.zip"]);
    });

    it("handles file type not supported as an AGO resource", async () => {
      const solutionItemId: string = "sln1234567890";
      const agolItem = mockItems.getAGOLItem("Project Package");
      agolItem.thumbnail = null;
      agolItem.name = "myProjectPackage.ppkx";

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/ppk1234567890/data",
          utils.getSampleZipFile("myProjectPackage.ppkx"),
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/ppk1234567890/resources", mockItems.get500Failure())
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/ppk1234567890/info/metadata/metadata.xml",
          mockItems.get400Failure(),
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/sln1234567890/addResources", {
          success: true,
          id: solutionItemId,
        });

      const response = await file.convertItemToTemplate(agolItem, MOCK_USER_SESSION, MOCK_USER_SESSION);
      expect(response.itemId).toEqual("ppk1234567890");
      expect(response.type).toEqual("Project Package");
      expect(response.resources).toEqual(["ppk1234567890_info_dataz/myProjectPackage.ppkx.zip"]);
    });

    it("handles GeoJson with inaccessible bad JSON data", async () => {
      const solutionItemId: string = "sln1234567890";
      const agolItem = mockItems.getAGOLItem("GeoJson");
      agolItem.thumbnail = null;

      fetchMock
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/jsn1234567890/data", mockItems.get400Failure())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/jsn1234567890/resources", mockItems.get500Failure())
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/jsn1234567890/info/metadata/metadata.xml",
          mockItems.get400Failure(),
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/sln1234567890/addResources", {
          success: true,
          id: solutionItemId,
        });

      const response = await file.convertItemToTemplate(agolItem, MOCK_USER_SESSION, MOCK_USER_SESSION);
      expect(response.itemId).toEqual("jsn1234567890");
      expect(response.type).toEqual("GeoJson");
    });

    it("handles GeoJson with bad JSON data", async () => {
      const solutionItemId: string = "sln1234567890";
      const agolItem = mockItems.getAGOLItem("GeoJson");
      agolItem.thumbnail = null;

      fetchMock
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/jsn1234567890/data", mockItems.get400Failure())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/jsn1234567890/resources", noResourcesResponse)
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/jsn1234567890/info/metadata/metadata.xml",
          mockItems.get400Failure(),
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/wma1234567890/resources/anImage.png",
          utils.getSampleImageAsBlob(),
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/sln1234567890/addResources", {
          success: true,
          id: solutionItemId,
        });

      const response = await file.convertItemToTemplate(agolItem, MOCK_USER_SESSION, MOCK_USER_SESSION);
      expect(response.itemId).toEqual("jsn1234567890");
      expect(response.type).toEqual("GeoJson");
    });
  });

  describe("createItemFromTemplate", () => {
    it("deploys an item", async () => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate("Web Map");
      itemTemplate.item.thumbnail = null;
      const templateDictionary: any = {};
      const newItemID: string = "map1234567891";

      fetchMock.post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem", { success: true, id: newItemID });

      const response = await file.createItemFromTemplate(
        itemTemplate,
        templateDictionary,
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK,
      );
      itemTemplate.itemId = "map1234567891";
      expect(response).toEqual({
        item: itemTemplate,
        id: newItemID,
        type: itemTemplate.type,
        postProcess: false,
      });
    });

    it("deploys an item with resources", async () => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate("Web Map");
      const templateDictionary: any = {};
      const newItemID: string = "map1234567891";

      fetchMock
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem", {
          success: true,
          id: newItemID,
        })
        .post(utils.PORTAL_SUBSET.restUrl + "/info", SERVER_INFO)
        .post("https://myserver/doc/metadata.xml/rest/info", SERVER_INFO)
        .post(
          "https://myserver/doc/metadata.xml",
          new Blob(["<meta><value1>a</value1><value2>b</value2></meta>"], {
            type: "text/xml",
          }),
          { sendAsJson: false },
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/" + newItemID + "/update", { success: true });

      const response = await file.createItemFromTemplate(
        itemTemplate,
        templateDictionary,
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK,
      );
      itemTemplate.itemId = "map1234567891";
      expect(response).toEqual({
        item: itemTemplate,
        id: newItemID,
        type: itemTemplate.type,
        postProcess: false,
      });
    });

    it("fails to create item", async () => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate("Web Map");
      itemTemplate.item.thumbnail = null;
      const templateDictionary: any = {};

      fetchMock.post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem", utils.getFailureResponse());

      return file.createItemFromTemplate(
        itemTemplate,
        templateDictionary,
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK,
      );
    });

    it("should handle cancellation before deployment of item starts", async () => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate("Web Map");
      itemTemplate.item.thumbnail = null;
      const templateDictionary: any = {};
      const newItemID: string = "map1234567891";

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: newItemID, folder: null }),
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/info", SERVER_INFO)
        .post("https://myserver/doc/metadata.xml/rest/info", SERVER_INFO)
        .post(
          "https://myserver/doc/metadata.xml",
          new Blob(["<meta><value1>a</value1><value2>b</value2></meta>"], {
            type: "text/xml",
          }),
          { sendAsJson: false },
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/" + newItemID + "/update", { success: true });

      const response = await file.createItemFromTemplate(
        itemTemplate,
        templateDictionary,
        MOCK_USER_SESSION,
        utils.createFailingItemProgressCallbackOnNthCall(1),
      );
      expect(response).toEqual(templates.getFailedItem(itemTemplate.type));
    });

    it("should handle cancellation after deployed item is created", async () => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate("Web Map");
      itemTemplate.item.thumbnail = null;
      const templateDictionary: any = {};
      const newItemID: string = "map1234567891";

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: newItemID, folder: null }),
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/info", SERVER_INFO)
        .post("https://myserver/doc/metadata.xml/rest/info", SERVER_INFO)
        .post(
          "https://myserver/doc/metadata.xml",
          new Blob(["<meta><value1>a</value1><value2>b</value2></meta>"], {
            type: "text/xml",
          }),
          { sendAsJson: false },
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/" + newItemID + "/update", { success: true })
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/map1234567891/delete",
          utils.getSuccessResponse({ itemId: itemTemplate.itemId }),
        );

      const response = await file.createItemFromTemplate(
        itemTemplate,
        templateDictionary,
        MOCK_USER_SESSION,
        utils.createFailingItemProgressCallbackOnNthCall(2),
      );
      expect(response).toEqual(templates.getFailedItem(itemTemplate.type));
    });

    it("should handle cancellation failure after deployed item is created", async () => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate("Web Map");
      itemTemplate.item.thumbnail = null;
      const templateDictionary: any = {};
      const newItemID: string = "map1234567891";

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: newItemID, folder: null }),
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/info", SERVER_INFO)
        .post("https://myserver/doc/metadata.xml/rest/info", SERVER_INFO)
        .post(
          "https://myserver/doc/metadata.xml",
          new Blob(["<meta><value1>a</value1><value2>b</value2></meta>"], {
            type: "text/xml",
          }),
          { sendAsJson: false },
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/" + newItemID + "/update", { success: true })
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/map1234567891/delete",
          utils.getFailureResponse({ itemId: itemTemplate.itemId }),
        );

      const response = await file.createItemFromTemplate(
        itemTemplate,
        templateDictionary,
        MOCK_USER_SESSION,
        utils.createFailingItemProgressCallbackOnNthCall(2),
      );
      expect(response).toEqual(templates.getFailedItem(itemTemplate.type));
    });
  });
});
