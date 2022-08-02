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
  authInfo: {}
};

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

const noResourcesResponse: any = {
  total: 0,
  start: 1,
  num: 0,
  nextStart: -1,
  resources: []
};

let MOCK_USER_SESSION: common.ArcGISIdentityManager;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

afterEach(() => {
  fetchMock.restore();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `file`: manages the creation and deployment of item types that contain files", () => {
  describe("convertItemToTemplate :: ", () => {
    it("handles GeoJson with no data", done => {
      const solutionItemId: string = "sln1234567890";
      const agolItem = mockItems.getAGOLItem("GeoJson");
      agolItem.thumbnail = null;

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/jsn1234567890/data",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/jsn1234567890/resources",
          noResourcesResponse
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/jsn1234567890/info/metadata/metadata.xml",
          mockItems.get400Failure()
        );

      file
        .convertItemToTemplate(solutionItemId, agolItem, MOCK_USER_SESSION, MOCK_USER_SESSION)
        .then(
          response => {
            expect(response.itemId).toEqual("jsn1234567890");
            expect(response.type).toEqual("GeoJson");
            done();
          },
          () => done.fail()
        );
    });

    it("handles GeoJson with data & resources", done => {
      const solutionItemId: string = "sln1234567890";
      const agolItem = mockItems.getAGOLItem("GeoJson");
      agolItem.thumbnail = null;

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/jsn1234567890/data",
          {}
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/jsn1234567890/resources",
          mockItems.getAGOLItemResources("one png")
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/jsn1234567890/info/metadata/metadata.xml",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/jsn1234567890/resources/anImage.png",
          utils.getSampleImageAsBlob()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/sln1234567890/addResources",
          { success: true, id: solutionItemId }
        );

      file
        .convertItemToTemplate(solutionItemId, agolItem, MOCK_USER_SESSION, MOCK_USER_SESSION)
        .then(
          response => {
            expect(response.itemId).toEqual("jsn1234567890");
            expect(response.type).toEqual("GeoJson");
            done();
          },
          () => done.fail()
        );
    });

    it("handles Code Attachment with zip data using item name", done => {
      const solutionItemId: string = "sln1234567890";
      const agolItem = mockItems.getAGOLItem("Code Attachment");
      agolItem.thumbnail = null;

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/cod1234567890/data",
          utils.getSampleZipFile("myZipFile.zip")
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/cod1234567890/resources",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/cod1234567890/info/metadata/metadata.xml",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/sln1234567890/addResources",
          { success: true, id: solutionItemId }
        );

      file
        .convertItemToTemplate(solutionItemId, agolItem, MOCK_USER_SESSION, MOCK_USER_SESSION)
        .then(
          response => {
            expect(response.itemId).toEqual("cod1234567890");
            expect(response.type).toEqual("Code Attachment");
            expect(response.resources).toEqual([
              "cod1234567890_info_data/Name of an AGOL item.zip"
            ]);
            done();
          },
          () => done.fail()
        );
    });

    it("handles file type not supported as an AGO resource", done => {
      const solutionItemId: string = "sln1234567890";
      const agolItem = mockItems.getAGOLItem("Project Package");
      agolItem.thumbnail = null;
      agolItem.name = "myProjectPackage.ppkx";

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/ppk1234567890/data",
          utils.getSampleZipFile("myProjectPackage.ppkx")
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/ppk1234567890/resources",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/ppk1234567890/info/metadata/metadata.xml",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/sln1234567890/addResources",
          { success: true, id: solutionItemId }
        );

      file
        .convertItemToTemplate(solutionItemId, agolItem, MOCK_USER_SESSION, MOCK_USER_SESSION)
        .then(
          response => {
            expect(response.itemId).toEqual("ppk1234567890");
            expect(response.type).toEqual("Project Package");
            expect(response.resources).toEqual([
              "ppk1234567890_info_dataz/myProjectPackage.ppkx.zip"
            ]);
            done();
          },
          () => done.fail()
        );
    });

    it("handles Code Attachment where save fails", done => {
      const solutionItemId: string = "sln1234567890";
      const agolItem = mockItems.getAGOLItem("Code Attachment");
      agolItem.thumbnail = null;

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/cod1234567890/data",
          utils.getSampleZipFile("myZipFile.zip")
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/cod1234567890/resources",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/cod1234567890/info/metadata/metadata.xml",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/sln1234567890/addResources",
          mockItems.get400Failure()
        );

      file
        .convertItemToTemplate(solutionItemId, agolItem, MOCK_USER_SESSION, MOCK_USER_SESSION)
        .then(
          response => {
            expect(response.itemId).toEqual("cod1234567890");
            expect(response.type).toEqual("Code Attachment");
            expect(response.resources).toEqual([]);
            expect(
              JSON.parse(response.properties.error).originalMessage
            ).toEqual("Item does not exist or is inaccessible.");
            done();
          },
          () => done.fail()
        );
    });

    it("handles GeoJson with inaccessible bad JSON data", done => {
      const solutionItemId: string = "sln1234567890";
      const agolItem = mockItems.getAGOLItem("GeoJson");
      agolItem.thumbnail = null;
      const badBlob = new Blob([mockItems.get400Failure()], {
        type: "application/json"
      });

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/jsn1234567890/data",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/jsn1234567890/resources",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/jsn1234567890/info/metadata/metadata.xml",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/sln1234567890/addResources",
          { success: true, id: solutionItemId }
        );

      file
        .convertItemToTemplate(solutionItemId, agolItem, MOCK_USER_SESSION, MOCK_USER_SESSION)
        .then(
          response => {
            expect(response.itemId).toEqual("jsn1234567890");
            expect(response.type).toEqual("GeoJson");
            done();
          },
          () => done.fail()
        );
    });

    it("handles GeoJson with bad JSON data", done => {
      const solutionItemId: string = "sln1234567890";
      const agolItem = mockItems.getAGOLItem("GeoJson");
      agolItem.thumbnail = null;
      const badBlob = new Blob([mockItems.get400Failure()], {
        type: "application/json"
      });

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/jsn1234567890/data",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/jsn1234567890/resources",
          noResourcesResponse
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/jsn1234567890/info/metadata/metadata.xml",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/wma1234567890/resources/anImage.png",
          utils.getSampleImageAsBlob()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/sln1234567890/addResources",
          { success: true, id: solutionItemId }
        );

      file
        .convertItemToTemplate(solutionItemId, agolItem, MOCK_USER_SESSION, MOCK_USER_SESSION)
        .then(
          response => {
            expect(response.itemId).toEqual("jsn1234567890");
            expect(response.type).toEqual("GeoJson");
            done();
          },
          () => done.fail()
        );
    });
  });

  describe("createItemFromTemplate", () => {
    it("deploys an item", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Web Map"
      );
      itemTemplate.item.thumbnail = null;
      const templateDictionary: any = {};
      const newItemID: string = "map1234567891";

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
        { success: true, id: newItemID }
      );

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      file
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          itemTemplate.itemId = "map1234567891";
          expect(response).toEqual({
            item: itemTemplate,
            id: newItemID,
            type: itemTemplate.type,
            postProcess: false
          });
          done();
        });
    });

    it("deploys an item with resources", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Web Map"
      );
      const templateDictionary: any = {};
      const newItemID: string = "map1234567891";

      fetchMock
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem", {
          success: true,
          id: newItemID
        })
        .post(utils.PORTAL_SUBSET.restUrl + "/info", SERVER_INFO)
        .post("https://myserver/doc/metadata.xml/rest/info", SERVER_INFO)
        .post(
          "https://myserver/doc/metadata.xml",
          new Blob(["<meta><value1>a</value1><value2>b</value2></meta>"], {
            type: "text/xml"
          }),
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemID +
            "/update",
          { success: true }
        );

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      file
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          itemTemplate.itemId = "map1234567891";
          expect(response).toEqual({
            item: itemTemplate,
            id: newItemID,
            type: itemTemplate.type,
            postProcess: false
          });
          done();
        });
    });

    it("fails to create item", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Web Map"
      );
      itemTemplate.item.thumbnail = null;
      const templateDictionary: any = {};
      const newItemID: string = "map1234567891";

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
        utils.getFailureResponse()
      );

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      file
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

    it("should handle cancellation before deployment of item starts", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Web Map"
      );
      itemTemplate.item.thumbnail = null;
      const templateDictionary: any = {};
      const newItemID: string = "map1234567891";

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: newItemID, folder: null })
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/info", SERVER_INFO)
        .post("https://myserver/doc/metadata.xml/rest/info", SERVER_INFO)
        .post(
          "https://myserver/doc/metadata.xml",
          new Blob(["<meta><value1>a</value1><value2>b</value2></meta>"], {
            type: "text/xml"
          }),
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemID +
            "/update",
          { success: true }
        );

      file
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallbackOnNthCall(1)
        )
        .then(
          response => {
            expect(response).toEqual(
              templates.getFailedItem(itemTemplate.type)
            );
            done();
          },
          () => done.fail()
        );
    });

    it("should handle cancellation after deployed item is created", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Web Map"
      );
      itemTemplate.item.thumbnail = null;
      const templateDictionary: any = {};
      const newItemID: string = "map1234567891";

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: newItemID, folder: null })
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/info", SERVER_INFO)
        .post("https://myserver/doc/metadata.xml/rest/info", SERVER_INFO)
        .post(
          "https://myserver/doc/metadata.xml",
          new Blob(["<meta><value1>a</value1><value2>b</value2></meta>"], {
            type: "text/xml"
          }),
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemID +
            "/update",
          { success: true }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/map1234567891/delete",
          utils.getSuccessResponse({ itemId: itemTemplate.itemId })
        );

      file
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallbackOnNthCall(2)
        )
        .then(
          response => {
            expect(response).toEqual(
              templates.getFailedItem(itemTemplate.type)
            );
            done();
          },
          () => done.fail()
        );
    });

    it("should handle cancellation failure after deployed item is created", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Web Map"
      );
      itemTemplate.item.thumbnail = null;
      const templateDictionary: any = {};
      const newItemID: string = "map1234567891";

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: newItemID, folder: null })
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/info", SERVER_INFO)
        .post("https://myserver/doc/metadata.xml/rest/info", SERVER_INFO)
        .post(
          "https://myserver/doc/metadata.xml",
          new Blob(["<meta><value1>a</value1><value2>b</value2></meta>"], {
            type: "text/xml"
          }),
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemID +
            "/update",
          { success: true }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/map1234567891/delete",
          utils.getFailureResponse({ itemId: itemTemplate.itemId })
        );

      file
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallbackOnNthCall(2)
        )
        .then(
          response => {
            expect(response).toEqual(
              templates.getFailedItem(itemTemplate.type)
            );
            done();
          },
          () => done.fail()
        );
    });
  });
});
