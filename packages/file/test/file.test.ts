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

const SERVER_INFO = {
  currentVersion: 10.1,
  fullVersion: "10.1",
  soapUrl: "http://server/arcgis/services",
  secureSoapUrl: "https://server/arcgis/services",
  owningSystemUrl: "https://www.arcgis.com",
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

afterEach(() => {
  fetchMock.restore();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `file`: manages the creation and deployment of item types that contain files", () => {
  describe("convertItemToTemplate", () => {
    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
      it("handles GeoJson with no data", done => {
        const solutionItemId: string = "sln1234567890";
        const agolItem = mockItems.getAGOLItem("GeoJson");
        agolItem.thumbnail = null;

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/jsn1234567890/data",
            mockItems.get500Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/jsn1234567890/resources",
            noResourcesResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/jsn1234567890/info/metadata/metadata.xml",
            mockItems.get400Failure()
          );

        file
          .convertItemToTemplate(solutionItemId, agolItem, MOCK_USER_SESSION)
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
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/jsn1234567890/data",
            {}
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/jsn1234567890/resources",
            mockItems.getAGOLItemResources("one png")
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/jsn1234567890/info/metadata/metadata.xml",
            mockItems.get400Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/jsn1234567890/resources/anImage.png",
            utils.getSampleImage()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: solutionItemId }
          );

        file
          .convertItemToTemplate(solutionItemId, agolItem, MOCK_USER_SESSION)
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
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/cod1234567890/data",
            utils.getSampleZipFile("myZipFile.zip")
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/cod1234567890/resources",
            mockItems.get500Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/cod1234567890/info/metadata/metadata.xml",
            mockItems.get400Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: solutionItemId }
          );

        file
          .convertItemToTemplate(solutionItemId, agolItem, MOCK_USER_SESSION)
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
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/ppk1234567890/data",
            utils.getSampleZipFile("myProjectPackage.ppkx")
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/ppk1234567890/resources",
            mockItems.get500Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/ppk1234567890/info/metadata/metadata.xml",
            mockItems.get400Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: solutionItemId }
          );

        file
          .convertItemToTemplate(solutionItemId, agolItem, MOCK_USER_SESSION)
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
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/cod1234567890/data",
            utils.getSampleZipFile("myZipFile.zip")
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/cod1234567890/resources",
            mockItems.get500Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/cod1234567890/info/metadata/metadata.xml",
            mockItems.get400Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/addResources",
            mockItems.get400Failure()
          );

        file
          .convertItemToTemplate(solutionItemId, agolItem, MOCK_USER_SESSION)
          .then(
            response => {
              expect(response.itemId).toEqual("cod1234567890");
              expect(response.type).toEqual("Code Attachment");
              expect(response.resources).toEqual([]);
              expect(response.properties.partial).toBeTruthy();
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
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/jsn1234567890/data",
            mockItems.get400Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/jsn1234567890/resources",
            mockItems.get500Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/jsn1234567890/info/metadata/metadata.xml",
            mockItems.get400Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: solutionItemId }
          );

        file
          .convertItemToTemplate(solutionItemId, agolItem, MOCK_USER_SESSION)
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
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/jsn1234567890/data",
            mockItems.get400Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/jsn1234567890/resources",
            noResourcesResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/jsn1234567890/info/metadata/metadata.xml",
            mockItems.get400Failure()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/wma1234567890/resources/anImage.png",
            utils.getSampleImage()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: solutionItemId }
          );

        file
          .convertItemToTemplate(solutionItemId, agolItem, MOCK_USER_SESSION)
          .then(
            response => {
              expect(response.itemId).toEqual("jsn1234567890");
              expect(response.type).toEqual("GeoJson");
              done();
            },
            () => done.fail()
          );
      });
    }
  });

  describe("createItemFromTemplate", () => {
    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
      it("deploys an item", done => {
        const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
          "Web Map"
        );
        itemTemplate.item.thumbnail = null;
        const resourceFilePaths: common.IDeployFileCopyPath[] = [];
        const templateDictionary: any = {};
        const newItemID: string = "map1234567891";

        fetchMock.post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
          { success: true, id: newItemID }
        );

        file
          .createItemFromTemplate(
            itemTemplate,
            resourceFilePaths,
            MOCK_USER_SESSION,
            templateDictionary,
            MOCK_USER_SESSION,
            utils.PROGRESS_CALLBACK
          )
          .then(
            response => {
              expect(response).toEqual({
                id: "map1234567891",
                type: itemTemplate.type,
                postProcess: false
              });
              done();
            },
            () => done.fail()
          );
      });

      it("deploys an item with resources", done => {
        const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
          "Web Map"
        );
        itemTemplate.item.thumbnail = null;
        const resourceFilePaths: common.IDeployFileCopyPath[] = [
          {
            type: common.EFileType.Metadata,
            folder: "",
            filename: "",
            url: "https://myserver/doc/metadata.xml" // Metadata uses only URL
          }
        ];
        const templateDictionary: any = {};
        const newItemID: string = "map1234567891";

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
            { success: true, id: newItemID }
          )
          .post("https://www.arcgis.com/sharing/rest/info", SERVER_INFO)
          .post("https://myserver/doc/metadata.xml/rest/info", SERVER_INFO)
          .post(
            "https://myserver/doc/metadata.xml",
            new Blob(["<meta><value1>a</value1><value2>b</value2></meta>"], {
              type: "text/xml"
            }),
            { sendAsJson: false }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/" +
              newItemID +
              "/update",
            { success: true }
          );

        file
          .createItemFromTemplate(
            itemTemplate,
            resourceFilePaths,
            MOCK_USER_SESSION,
            templateDictionary,
            MOCK_USER_SESSION,
            utils.PROGRESS_CALLBACK
          )
          .then(
            response => {
              expect(response).toEqual({
                id: "map1234567891",
                type: itemTemplate.type,
                postProcess: false
              });
              done();
            },
            () => done.fail()
          );
      });

      it("fails to create item", done => {
        const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
          "Web Map"
        );
        itemTemplate.item.thumbnail = null;
        const resourceFilePaths: common.IDeployFileCopyPath[] = [];
        const templateDictionary: any = {};
        const newItemID: string = "map1234567891";

        fetchMock.post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
          { success: false }
        );

        file
          .createItemFromTemplate(
            itemTemplate,
            resourceFilePaths,
            MOCK_USER_SESSION,
            templateDictionary,
            MOCK_USER_SESSION,
            utils.PROGRESS_CALLBACK
          )
          .then(response => {
            done.fail();
          }, done);
      });

      it("fails to deploy file data to the item", done => {
        const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
          "Web Map"
        );
        itemTemplate.item.thumbnail = null;
        const resourceFilePaths: common.IDeployFileCopyPath[] = [
          {
            type: common.EFileType.Data,
            folder: "cod1234567890_info_data",
            filename: "Name of an AGOL item.zip",
            url:
              "https://myserver/doc/cod1234567890_info_data/Name of an AGOL item.zip"
          }
        ];
        const templateDictionary: any = {};
        const newItemID: string = "map1234567891";

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
            { success: true, id: newItemID }
          )
          .post(
            "https://myserver/doc/cod1234567890_info_data/Name of an AGOL item.zip/rest/info",
            SERVER_INFO
          )
          .post(
            "https://myserver/doc/cod1234567890_info_data/Name of an AGOL item.zip",
            utils.getSampleZipFile("Name of an AGOL item.zip")
          )
          .post(
            "https://myserver/doc/metadata.xml",
            new Blob(["<meta><value1>a</value1><value2>b</value2></meta>"], {
              type: "text/xml"
            }),
            { sendAsJson: false }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/" +
              newItemID +
              "/update",
            { success: false }
          );

        file
          .createItemFromTemplate(
            itemTemplate,
            resourceFilePaths,
            MOCK_USER_SESSION,
            templateDictionary,
            MOCK_USER_SESSION,
            utils.PROGRESS_CALLBACK
          )
          .then(
            () => done.fail(),
            () => done()
          );
      });
    }
  });
});
