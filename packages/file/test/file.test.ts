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

/* tslint:disable:no-empty */
describe("Module `file`: manages the creation and deployment of item types that contain files", () => {
  describe("convertItemToTemplate", () => {
    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
      it("GeoJson with no data", done => {
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

      it("GeoJson with data & resources", done => {
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

      it("Code Attachment with zip data using item name", done => {
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
                "cod1234567890_info_file/Name of an AGOL item.zip"
              ]);
              done();
            },
            () => done.fail()
          );
      });

      it("Code Attachment with zip data using default zip name", done => {
        const solutionItemId: string = "sln1234567890";
        const agolItem = mockItems.getAGOLItem("Code Attachment");
        agolItem.name = null;
        agolItem.thumbnail = null;

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/cod1234567890/data",
            utils.getSampleZipFile("")
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
                "cod1234567890_info_file/file.zip.zip"
              ]);
              done();
            },
            () => done.fail()
          );
      });

      it("Code Attachment save fails", done => {
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

      it("GeoJson with inaccessible bad JSON data", done => {
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

      it("GeoJson with bad JSON data", done => {
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
    it("placeholder", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate();
      itemTemplate.itemId = "map1234567890";
      itemTemplate.item = mockItems.getAGOLItem("Web Map", null);
      itemTemplate.item.thumbnail = null;
      const templateDictionary: any = {};

      file
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
        .then(done, done);
    });
  });
});
