/*
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

import { ArcGISRequestError } from '@esri/arcgis-rest-request';
import { UserSession, IUserRequestOptions } from "@esri/arcgis-rest-auth";

import * as mCommon from "../src/common";
import * as mInterfaces from "../src/interfaces";
import * as mSolution from "../src/solution";
import * as mViewing from "../src/viewing";

import { TOMORROW, setMockDateTime, createRuntimeMockUserSession, createMockSwizzle } from "./lib/utils";
import { ICustomArrayLikeMatchers, CustomMatchers } from './customMatchers';
import * as fetchMock from "fetch-mock";
import * as mockItems from "./mocks/items";
import * as mockServices from "./mocks/featureServices";
import * as mockSolutions from "./mocks/solutions";

// -------------------------------------------------------------------------------------------------------------------//

describe("Module `solution`: generation, publication, and cloning of a solution item", () => {

  const MOCK_ITEM_PROTOTYPE:mInterfaces.ITemplate = {
    itemId: "",
    type: "",
    key: "",
    item: null
  };

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;  // default is 5000 ms

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

  const MOCK_USER_REQOPTS:IUserRequestOptions = {
    authentication: MOCK_USER_SESSION
  };

  const orgUrl = "https://myOrg.maps.arcgis.com";
  const portalUrl = "https://www.arcgis.com";

  beforeEach(() => {
    jasmine.addMatchers(CustomMatchers);
  });

  afterEach(() => {
    fetchMock.restore();
    jasmine.clock().uninstall();
  });

  describe("create solution", () => {

    it("for single item containing WMA & feature service", done => {
      const baseSvcURL = "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"))
      .post(baseSvcURL + "FeatureServer?f=json", mockServices.getService(
        [mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer")],
        [mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table")]
      ))
      .post(baseSvcURL + "FeatureServer/0?f=json",
        mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer",
        [mockServices.getRelationship(0, 1, "esriRelRoleOrigin")]
      ))
      .post(baseSvcURL + "FeatureServer/1?f=json",
        mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table",
        [mockServices.getRelationship(0, 0, "esriRelRoleDestination")]
      ))
      mSolution.createSolution("wma1234567890", MOCK_USER_REQOPTS)
      .then(
        response => {
          expect(response).toEqual(mockSolutions.getWebMappingApplicationSolution());
          done();
        },
        error => done.fail(error)
      );
    });

    it("for single item not containing WMA or feature service", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/grp1234567890", mockItems.getAGOLItem())
      .mock("path:/sharing/rest/community/groups/grp1234567890", mockItems.getAGOLGroup())
      .mock(
        "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
        "?f=json&start=0&num=100&token=fake-token",
        '{"total":0,"start":1,"num":0,"nextStart":-1,"items":[]}');
      mSolution.createSolution("grp1234567890", MOCK_USER_REQOPTS)
      .then(
        response => {
          expect(response).toEqual([
            mockSolutions.getGroupSolutionPart()
          ]);
          done();
        },
        error => done.fail(error)
      );
    });

    it("gets a service name from a layer if a service needs a name", done => {
      const fullItem:mInterfaces.ITemplateFeatureService = {
        itemId: "",
        type: "Feature Service",
        key: "",
        item: mockItems.getNoNameFeatureServiceItem(),
        data: mockItems.getAGOLItemData("Feature Service"),
        service: null,
        layers: null,
        tables: null
      };
      fullItem.itemId = fullItem.item.id;

      fetchMock
      .post(fullItem.item.url + "?f=json", mockServices.getService(
        [mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer")],
        [mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table")]
      ))
      .post(fullItem.item.url + "/0?f=json",
        mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer",
        [mockServices.getRelationship(0, 1, "esriRelRoleOrigin")]
      ))
      .post(fullItem.item.url + "/1?f=json",
        mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table",
        [mockServices.getRelationship(0, 0, "esriRelRoleDestination")]
      ));
      mSolution.fleshOutFeatureService(fullItem, MOCK_USER_REQOPTS)
      .then(
        () => {
          expect(fullItem.service.name).toEqual(mockServices.getService(
            [mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer")],
            [mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table")]
          ).layers[0].name);
          done();
        },
        done.fail
      );
    });

    it("gets a service name from a table if a service needs a name--no layer", done => {
      const fullItem:mInterfaces.ITemplateFeatureService = {
        itemId: "",
        type: "Feature Service",
        key: "",
        item: mockItems.getNoNameFeatureServiceItem(),
        data: mockItems.getAGOLItemData("Feature Service"),
        service: null,
        layers: null,
        tables: null
      };
      fullItem.itemId = fullItem.item.id;

      fetchMock
      .post(fullItem.item.url + "?f=json", mockServices.getService(
        undefined,
        [mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table")]
      ))
      .post(fullItem.item.url + "/0?f=json",
        mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer",
        [mockServices.getRelationship(0, 1, "esriRelRoleOrigin")]
      ))
      .post(fullItem.item.url + "/1?f=json",
        mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table",
        [mockServices.getRelationship(0, 0, "esriRelRoleDestination")]
      ));
      mSolution.fleshOutFeatureService(fullItem, MOCK_USER_REQOPTS)
      .then(
        () => {
          expect(fullItem.service.name).toEqual(
            mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table",
            [mockServices.getRelationship(0, 0, "esriRelRoleDestination")]
          ).name);
          done();
        },
        done.fail
      );
    });

    it("gets a service name from a table if a service needs a name--nameless layer", done => {
      const fullItem:mInterfaces.ITemplateFeatureService = {
        itemId: "",
        type: "Feature Service",
        key: "",
        item: mockItems.getNoNameFeatureServiceItem(),
        data: mockItems.getAGOLItemData("Feature Service"),
        service: null,
        layers: null,
        tables: null
      };
      fullItem.itemId = fullItem.item.id;

      fetchMock
      .post(fullItem.item.url + "?f=json", mockServices.getService(
        mockServices.removeNameField([mockServices.getLayerOrTable(0, "", "Feature Layer")]),
        [mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table")]
      ))
      .post(fullItem.item.url + "/0?f=json",
        mockServices.getLayerOrTable(0, "", "Feature Layer",
        [mockServices.getRelationship(0, 1, "esriRelRoleOrigin")]
      ))
      .post(fullItem.item.url + "/1?f=json",
        mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table",
        [mockServices.getRelationship(0, 0, "esriRelRoleDestination")]
      ));
      mSolution.fleshOutFeatureService(fullItem, MOCK_USER_REQOPTS)
      .then(
        () => {
          expect(fullItem.service.name).toEqual(mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table",
            [mockServices.getRelationship(0, 0, "esriRelRoleDestination")]
          ).name);
          done();
        },
        done.fail
      );
    });

    it("falls back to 'Feature Service' if a service needs a name", done => {
      const fullItem:mInterfaces.ITemplateFeatureService = {
        itemId: "",
        type: "Feature Service",
        key: "",
        item: mockItems.getNoNameFeatureServiceItem(),
        data: mockItems.getAGOLItemData("Feature Service"),
        service: null,
        layers: null,
        tables: null
      };
      fullItem.itemId = fullItem.item.id;

      fetchMock
      .post(fullItem.item.url + "?f=json", mockServices.getService(
        mockServices.removeNameField([mockServices.getLayerOrTable(0, "", "Feature Layer")]),
        mockServices.removeNameField([mockServices.getLayerOrTable(1, "", "Table")])
      ))
      .post(fullItem.item.url + "/0?f=json",
        mockServices.getLayerOrTable(0, "", "Feature Layer",
        [mockServices.getRelationship(0, 1, "esriRelRoleOrigin")]
      ))
      .post(fullItem.item.url + "/1?f=json",
        mockServices.getLayerOrTable(1, "", "Table",
        [mockServices.getRelationship(0, 0, "esriRelRoleDestination")]
      ));
      mSolution.fleshOutFeatureService(fullItem, MOCK_USER_REQOPTS)
      .then(
        () => {
          expect(fullItem.service.name).toEqual("Feature Service");
          done();
        },
        done.fail
      );
    });

  });

  describe("publish solution", () => {

    it("for single item containing WMA & feature service", done => {
      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"sln1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/sln1234567890/update",
        '{"success":true,"id":"sln1234567890"}')
      .post("path:/sharing/rest/content/users/casey/items/sln1234567890/share",
        '{"notSharedWith":[],"itemId":"sln1234567890"}');
      mSolution.publishSolution("My Solution", mockSolutions.getWebMappingApplicationSolution(), MOCK_USER_REQOPTS)
      .then(
        response => {
          expect(response).toEqual({
            "success": true,
            "id": "sln1234567890"
          });
          done();
        },
        done.fail
      );
    });

    it("for single item containing WMA & feature service, but item add fails", done => {
      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"error":{"code":400,"messageCode":"CONT_0113","message":"Item type not valid.","details":[]}}');
      mSolution.publishSolution("My Solution", mockSolutions.getWebMappingApplicationSolution(), MOCK_USER_REQOPTS)
      .then(
        () => done.fail(),
        errorMsg => {
          expect(errorMsg).toEqual("Item type not valid.");
          done();
        }
      );
    });

    it("for single item containing WMA & feature service, but share as public fails", done => {
      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"sln1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/sln1234567890/share",
        '{"error":{"code":400,"messageCode":"CONT_0001",' +
        '"message":"Item does not exist or is inaccessible.","details":[]}}');
      mSolution.publishSolution("My Solution", mockSolutions.getWebMappingApplicationSolution(), MOCK_USER_REQOPTS,
        null, "public")
      .then(
        () => done.fail(),
        errorMsg => {
          expect(errorMsg).toEqual("Item does not exist or is inaccessible.");
          done();
        }
      );
    });

  });

  describe("clone solution", () => {

    it("should handle a missing solution", done => {
      mSolution.cloneSolution(null, MOCK_USER_REQOPTS, orgUrl, portalUrl)
      .then(done, done.fail);
    });

    it("should handle an empty, nameless solution", done => {
      mSolution.cloneSolution({} as mInterfaces.ITemplate[], MOCK_USER_REQOPTS, orgUrl, portalUrl)
      .then(done, done.fail);
    });

    it("should handle failure to create solution's folder", done => {
      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const solutionItem:mInterfaces.ITemplate[] = mockSolutions.getWebMappingApplicationSolution();

      const now = 1555555555555;
      const sessionWithMockedTime:IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      fetchMock
      .post("https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
        '{"error":{"code":400,"message":"Unable to create folder.","details":["\'title\' must be specified."]}}');
      mSolution.cloneSolution(solutionItem, sessionWithMockedTime, orgUrl, portalUrl)
      .then(
        () => done.fail(),
        done
      )
    });

    it("should clone a solution using a generated folder", done => {
      const solutionItem:mInterfaces.ITemplate[] = mockSolutions.getWebMappingApplicationSolution();

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const now = 1555555555555;
      const sessionWithMockedTime:IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      // Feature layer indices are assigned incrementally as they are added to the feature service
      const layerNumUpdater = (() => {
          let layerNum = 0;
          return () => '{"success":true,"layers":[{"name":"ROW Permits","id":' + layerNum++ + '}]}'
      })();

      // Provide different results for same route upon subsequent call
      const addItemUpdater = (() => {
          let stepNum = 0;
          return () => [
            '{"success":true,"id":"map1234567890","folder":"fld1234567890"}',
            '{"success":true,"id":"wma1234567890","folder":"fld1234567890"}',
            '{"success":true,"id":"sto1234567890","folder":"fld1234567890"}'
          ][stepNum++];
      })();

      fetchMock
      .post("https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
        '{"success":true,"folder":{"username":"casey","id":"fld1234567890","title":"Solution (1555555555555)"}}')
      .post("path:/sharing/rest/content/users/casey/createService",
        '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
        'ROWPermits_publiccomment_' + now + '/FeatureServer","itemId":"svc1234567890",' +
        '"name":"ROWPermits_publiccomment_' + now + '","serviceItemId":"svc1234567890",' +
        '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment_' +
        now + '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}')
      .post("path:/sharing/rest/content/users/casey/items/svc1234567890/move",
        '{"success":true,"itemId":"svc1234567890","owner":"casey","folder":"fld1234567890"}')
      .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
        "/FeatureServer/addToDefinition", layerNumUpdater)
      .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
        "/FeatureServer/0/addToDefinition", '{"success":true}')
      .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
        "/FeatureServer/1/addToDefinition", '{"success":true}')
      .post("path:/sharing/rest/content/users/casey/fld1234567890/addItem", addItemUpdater)
      .post("path:/sharing/rest/content/users/casey/items/wma1234567890/update",
        '{"success":true,"id":"wma1234567890"}')
      .post("path:/sharing/rest/content/users/casey/items/map1234567890/update",
        '{"success":true,"id":"map1234567890"}')
      .post("path:/sharing/rest/content/users/casey/items/sto1234567890/update",
        '{"success":true,"id":"sto1234567890"}');
      mSolution.cloneSolution(solutionItem, sessionWithMockedTime, orgUrl, portalUrl)
      .then(
        response => {
          expect(response.length).toEqual(3);
          done();
        },
        done.fail
      );
    });

    it("should clone a solution using a supplied folder and supplied solution name", done => {
      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const solutionItem:mInterfaces.ITemplate[] = mockSolutions.getWebMappingApplicationSolution();
      const folderId = "FLD1234567890";

      // Feature layer indices are assigned incrementally as they are added to the feature service
      const layerNumUpdater = (() => {
          let layerNum = 0;
          return () => '{"success":true,"layers":[{"name":"ROW Permits","id":' + layerNum++ + '}]}'
      })();

      // Provide different results for same route upon subsequent call
      const addItemUpdater = (() => {
          let stepNum = 0;
          return () => [
            '{"success":true,"id":"map1234567890","folder":"FLD1234567890"}',
            '{"success":true,"id":"wma1234567890","folder":"FLD1234567890"}',
            '{"success":true,"id":"sto1234567890","folder":"FLD1234567890"}'
          ][stepNum++];
      })();

      fetchMock
      .post("https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
        '{"success":true,"folder":{"username":"casey","id":"' + folderId + '","title":"' + folderId + '"}}')
      .post("path:/sharing/rest/content/users/casey/createService",
        '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
        folderId + '/FeatureServer","itemId":"svc1234567890",' +
        '"name":"' + folderId + '","serviceItemId":"svc1234567890",' +
        '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' + folderId +
        '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}')
      .post("path:/sharing/rest/content/users/casey/items/svc1234567890/move",
        '{"success":true,"itemId":"svc1234567890","owner":"casey","folder":"' + folderId + '"}')
      .post("path:/org1234567890/arcgis/rest/admin/services/" + folderId +
        "/FeatureServer/addToDefinition", layerNumUpdater)
      .post("path:/org1234567890/arcgis/rest/admin/services/" + folderId +
        "/FeatureServer/0/addToDefinition", '{"success":true}')
      .post("path:/org1234567890/arcgis/rest/admin/services/" + folderId +
        "/FeatureServer/1/addToDefinition", '{"success":true}')
      .post("path:/sharing/rest/content/users/casey/" + folderId + "/addItem", addItemUpdater)
      .post("path:/sharing/rest/content/users/casey/items/wma1234567890/update",
        '{"success":true,"id":"wma1234567890"}')
      .post("path:/sharing/rest/content/users/casey/items/map1234567890/update",
        '{"success":true,"id":"map1234567890"}')
      .post("path:/sharing/rest/content/users/casey/items/sto1234567890/update",
        '{"success":true,"id":"sto1234567890"}');
      mSolution.cloneSolution(solutionItem, MOCK_USER_REQOPTS, orgUrl, portalUrl, "My Solution", folderId)
      .then(
        response => {
        expect(response.length).toEqual(3);
          done();
        },
        done.fail
      );
    });

    it("should clone a solution using a supplied folder, but handle failed storymap", done => {
      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const solutionItem:mInterfaces.ITemplate[] = mockSolutions.getWebMappingApplicationSolution();
      const folderId = "FLD1234567890";

      // Feature layer indices are assigned incrementally as they are added to the feature service
      const layerNumUpdater = (() => {
          let layerNum = 0;
          return () => '{"success":true,"layers":[{"name":"ROW Permits","id":' + layerNum++ + '}]}'
      })();

      // Provide different results for same route upon subsequent call
      const addItemUpdater = (() => {
          let stepNum = 0;
          return () => [
            '{"success":true,"id":"map1234567890","folder":"FLD1234567890"}',
            '{"success":true,"id":"wma1234567890","folder":"FLD1234567890"}',
            '{"success":false"}'
          ][stepNum++];
      })();

      fetchMock
      .post("https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
        '{"success":true,"folder":{"username":"casey","id":"' + folderId + '","title":"' + folderId + '"}}')
      .post("path:/sharing/rest/content/users/casey/createService",
        '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
        folderId + '/FeatureServer","itemId":"svc1234567890",' +
        '"name":"' + folderId + '","serviceItemId":"svc1234567890",' +
        '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' + folderId +
        '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}')
      .post("path:/sharing/rest/content/users/casey/items/svc1234567890/move",
        '{"success":true,"itemId":"svc1234567890","owner":"casey","folder":"' + folderId + '"}')
      .post("path:/org1234567890/arcgis/rest/admin/services/" + folderId +
        "/FeatureServer/addToDefinition", layerNumUpdater)
      .post("path:/org1234567890/arcgis/rest/admin/services/" + folderId +
        "/FeatureServer/0/addToDefinition", '{"success":true}')
      .post("path:/org1234567890/arcgis/rest/admin/services/" + folderId +
        "/FeatureServer/1/addToDefinition", '{"success":true}')
      .post("path:/sharing/rest/content/users/casey/" + folderId + "/addItem", addItemUpdater)
      .post("path:/sharing/rest/content/users/casey/items/map1234567890/update",
        '{"success":true,"id":"map1234567890"}')
      .post("path:/sharing/rest/content/users/casey/items/wma1234567890/update",
        '{"success":true,"id":"wma1234567890"}');
      mSolution.cloneSolution(solutionItem, MOCK_USER_REQOPTS, orgUrl, portalUrl, undefined, folderId, "org")
      .then(
        response => {
        expect(response.length).toEqual(3);
          done();
        },
        done.fail
      );
    });

    it("should handle failure to create a contained item", done => {
      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const solutionItem:mInterfaces.ITemplate[] = mockSolutions.getWebMappingApplicationSolution();
      const folderId = "fld1234567890";

      fetchMock
      .post("https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
        '{"success":true,"folder":{"username":"casey","id":"' + folderId + '","title":"' + folderId + '"}}')
      .post("path:/sharing/rest/content/users/casey/createService",
        '{"success":false}');
      mSolution.cloneSolution(solutionItem, MOCK_USER_REQOPTS, orgUrl, portalUrl, undefined, folderId)
      .then(
        () => done.fail(),
        done
      );
    });

  });

  describe("create solution storymap", () => {

    it("should create a storymap using a specified folder and public access", done => {
      const title = "Solution storymap";
      const solutionItem:mInterfaces.ITemplate[] = mockSolutions.getWebMappingApplicationSolution();
      const folderId = "fld1234567890";

      fetchMock
      .post("https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
        '{"success":true,"folder":{"username":"casey","id":"' + folderId + '","title":"' + folderId + '"}}')
      .post("https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/fld1234567890/addItem",
        '{"success":true,"id":"sto1234567890","folder":"fld1234567890"}')
      .post("path:/sharing/rest/content/users/casey/items/sto1234567890/update",
        '{"success":true,"id":"sto1234567890"}')
      .post("path:/sharing/rest/content/users/casey/items/sto1234567890/share",
        '{"notSharedWith":[],"itemId":"sto1234567890"}');
      mViewing.createSolutionStorymap(title, solutionItem, MOCK_USER_REQOPTS, orgUrl, folderId, "public")
      .then(
        storymap => {
          done();
        },
        done.fail
      );
    });

    it("should handle the failure to publish a storymap", done => {
      const title = "Solution storymap";
      const solutionItem:mInterfaces.ITemplate[] = mockSolutions.getWebMappingApplicationSolution();

      fetchMock
      .post("https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
        '{"error":{"code":400,"messageCode":"CONT_0113","message":"Item type not valid.","details":[]}}');
      mViewing.createSolutionStorymap(title, solutionItem, MOCK_USER_REQOPTS, orgUrl)
      .then(
        () => done.fail(),
        done
      );
    });

  });

  describe("supporting routine: create item", () => {

    it("should create a Dashboard in the root folder", done => {
      const fullItem:mInterfaces.ITemplate = mockSolutions.getItemSolutionPart("Dashboard");
      const folderId:string = null;
      const swizzles:mCommon.ISwizzleHash = createMockSwizzle(fullItem.data.widgets[0].itemId);

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"DSH1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/DSH1234567890/update",
        '{"success":true,"id":"wma1234567890"}');
      mSolution.createSwizzledItem(fullItem, folderId, swizzles, MOCK_USER_REQOPTS, orgUrl)
      .then(
        createdItem => {
          expect(createdItem.item.id).toEqual("DSH1234567890");
          done();
        },
        error => done.fail(error)
      );
    });

    it("should create a Dashboard in a specified folder", done => {
      const fullItem:mInterfaces.ITemplate = mockSolutions.getItemSolutionPart("Dashboard");
      const folderId:string = "fld1234567890";
      const swizzles:mCommon.ISwizzleHash = createMockSwizzle(fullItem.data.widgets[0].itemId);

      fetchMock
      .post("path:/sharing/rest/content/users/casey/fld1234567890/addItem",
        '{"success":true,"id":"DSH1234567890","folder":"fld1234567890"}')
      .post("path:/sharing/rest/content/users/casey/items/DSH1234567890/update",
        '{"success":true,"id":"dsh1234567890"}');
      mSolution.createSwizzledItem(fullItem, folderId, swizzles, MOCK_USER_REQOPTS, orgUrl)
      .then(
        createdItem => {
          expect(createdItem.item.id).toEqual("DSH1234567890");
          done();
        },
        error => done.fail(error)
      );
    });

    it("should create a mapless Dashboard", done => {
      const fullItem:mInterfaces.ITemplate = mockSolutions.getDashboardSolutionPartNoWidgets();
      const folderId:string = null;
      const swizzles:mCommon.ISwizzleHash = {};

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"DSH1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/DSH1234567890/update",
        '{"success":true,"id":"DSH1234567890"}');
      mSolution.createSwizzledItem(fullItem, folderId, swizzles, MOCK_USER_REQOPTS, orgUrl)
      .then(
        createdItem => {
          expect(createdItem.item.id).toEqual("DSH1234567890");
          done();
        },
        error => done.fail(error)
      );
    });

    it("should create a dataless Dashboard", done => {
      const fullItem:mInterfaces.ITemplate = mockSolutions.getDashboardSolutionPartNoData();
      const folderId:string = null;
      const swizzles:mCommon.ISwizzleHash = {};

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"DSH1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/DSH1234567890/update",
        '{"success":true,"id":"DSH1234567890"}');
      mSolution.createSwizzledItem(fullItem, folderId, swizzles, MOCK_USER_REQOPTS, orgUrl)
      .then(
        createdItem => {
          expect(createdItem.item.id).toEqual("DSH1234567890");
          done();
        },
        error => done.fail(error)
      );
    });

    it("should handle failure to create a Dashboard", done => {
      const fullItem:mInterfaces.ITemplate = mockSolutions.getDashboardSolutionPartNoWidgets();
      const folderId:string = null;
      const swizzles:mCommon.ISwizzleHash = {};

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"error":{"code":400,"messageCode":"CONT_0004","message":"User folder does not exist.","details":[]}}');
      mSolution.createSwizzledItem(fullItem, folderId, swizzles, MOCK_USER_REQOPTS, orgUrl)
      .then(
        () => done.fail(),
        errorMsg => {
          expect(errorMsg).toEqual("User folder does not exist.");
          done();
        }
      );
    });

    it("should create a Feature Service", done => {
      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const fullItem:mInterfaces.ITemplate = mockSolutions.getItemSolutionPart("Feature Service");
      const folderId:string = "fld1234567890";
      const swizzles:mCommon.ISwizzleHash = {};

      const now = 1555555555555;
      const sessionWithMockedTime:IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      // Feature layer indices are assigned incrementally as they are added to the feature service
      const layerNumUpdater = (() => {
          let layerNum = 0;
          return () => '{"success":true,"layers":[{"name":"ROW Permits","id":' + layerNum++ + '}]}'
      })();

      fetchMock
      .post("path:/sharing/rest/content/users/casey/createService",
        '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
        'ROWPermits_publiccomment_' + now + '/FeatureServer","itemId":"svc1234567890",' +
        '"name":"ROWPermits_publiccomment_' + now + '","serviceItemId":"svc1234567890",' +
        '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment_' +
        now + '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}')
      .post("path:/sharing/rest/content/users/casey/items/svc1234567890/move",
        '{"success":true,"itemId":"svc1234567890","owner":"casey","folder":"fld1234567890"}')
      .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
        "/FeatureServer/addToDefinition", layerNumUpdater)
      .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
        "/FeatureServer/0/addToDefinition", '{"success":true}')
      .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
        "/FeatureServer/1/addToDefinition", '{"success":true}');
      mSolution.createSwizzledItem(fullItem, folderId, swizzles, sessionWithMockedTime, orgUrl)
      .then(
        createdItem => {
          // Check that we're appending a timestamp to the service name
          const createServiceCall = fetchMock.calls("path:/sharing/rest/content/users/casey/createService");
          const createServiceCallBody = createServiceCall[0][1].body as string;
          expect(createServiceCallBody.indexOf("name%22%3A%22Name%20of%20an%20AGOL%20item_1555555555555%22%2C"))
            .toBeGreaterThan(0);

          expect(createdItem.item.id).toEqual("svc1234567890");
          done();
        },
        error => done.fail(error)
      );
    });

    it("should create a Feature Service without a data section", done => {
      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const fullItem:mInterfaces.ITemplate = mockSolutions.getItemSolutionPart("Feature Service");
      fullItem.data = null;
      const folderId:string = "fld1234567890";
      const swizzles:mCommon.ISwizzleHash = {};

      const now = 1555555555555;
      const sessionWithMockedTime:IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      // Feature layer indices are assigned incrementally as they are added to the feature service
      const layerNumUpdater = (() => {
          let layerNum = 0;
          return () => '{"success":true,"layers":[{"name":"ROW Permits","id":' + layerNum++ + '}]}'
      })();

      fetchMock
      .post("path:/sharing/rest/content/users/casey/createService",
        '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
        'ROWPermits_publiccomment_' + now + '/FeatureServer","itemId":"svc1234567890",' +
        '"name":"ROWPermits_publiccomment_' + now + '","serviceItemId":"svc1234567890",' +
        '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment_' +
        now + '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}')
      .post("path:/sharing/rest/content/users/casey/items/svc1234567890/move",
        '{"success":true,"itemId":"svc1234567890","owner":"casey","folder":"fld1234567890"}')
      .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
        "/FeatureServer/addToDefinition", layerNumUpdater)
      .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
        "/FeatureServer/0/addToDefinition", '{"success":true}')
      .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
        "/FeatureServer/1/addToDefinition", '{"success":true}');
      mSolution.createSwizzledItem(fullItem, folderId, swizzles, sessionWithMockedTime, orgUrl)
      .then(
        createdItem => {
          // Check that we're appending a timestamp to the service name
          const createServiceCall = fetchMock.calls("path:/sharing/rest/content/users/casey/createService");
          const createServiceCallBody = createServiceCall[0][1].body as string;
          expect(createServiceCallBody.indexOf("name%22%3A%22Name%20of%20an%20AGOL%20item_1555555555555%22%2C"))
            .toBeGreaterThan(0);

          expect(createdItem.item.id).toEqual("svc1234567890");
          done();
        },
        error => done.fail(error)
      );
    });

    it("should create a Feature Service without relationships", done => {
      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const fullItem:mInterfaces.ITemplate = mockSolutions.getFeatureServiceSolutionPartNoRelationships();
      const folderId:string = "fld1234567890";
      const swizzles:mCommon.ISwizzleHash = {};

      const now = 1555555555555;
      const sessionWithMockedTime:IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      // Feature layer indices are assigned incrementally as they are added to the feature service
      const layerNumUpdater = (() => {
          let layerNum = 0;
          return () => '{"success":true,"layers":[{"name":"ROW Permits","id":' + layerNum++ + '}]}'
      })();

      fetchMock
      .post("path:/sharing/rest/content/users/casey/createService",
        '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
        'ROWPermits_publiccomment_' + now + '/FeatureServer","itemId":"svc1234567890",' +
        '"name":"ROWPermits_publiccomment_' + now + '","serviceItemId":"svc1234567890",' +
        '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment_' +
        now + '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}')
      .post("path:/sharing/rest/content/users/casey/items/svc1234567890/move",
        '{"success":true,"itemId":"svc1234567890","owner":"casey","folder":"fld1234567890"}')
      .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
        "/FeatureServer/addToDefinition", layerNumUpdater)
      .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
        "/FeatureServer/0/addToDefinition", '{"success":true}')
      .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
        "/FeatureServer/1/addToDefinition", '{"success":true}');
      mSolution.createSwizzledItem(fullItem, folderId, swizzles, sessionWithMockedTime, orgUrl)
      .then(
        createdItem => {
          // Check that we're appending a timestamp to the service name
          const createServiceCall = fetchMock.calls("path:/sharing/rest/content/users/casey/createService");
          const createServiceCallBody = createServiceCall[0][1].body as string;
          expect(createServiceCallBody.indexOf("name%22%3A%22Name%20of%20an%20AGOL%20item_1555555555555%22%2C"))
            .toBeGreaterThan(0);

          expect(createdItem.item.id).toEqual("svc1234567890");
          done();
        },
        error => done.fail(error)
      );
    });

    it("should handle an error while trying to create a Feature Service", done => {
      const fullItem:mInterfaces.ITemplate = mockSolutions.getItemSolutionPart("Feature Service");
      fullItem.item.url = null;
      expect(mockSolutions.getItemSolutionPart("Feature Service").item.url)
        .toEqual("https://services123.arcgis.com/org1234567890/arcgis/rest/services/" +
        "ROWPermits_publiccomment/FeatureServer");

      const folderId:string = "fld1234567890";
      const swizzles:mCommon.ISwizzleHash = {};

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const now = 1555555555555;
      const sessionWithMockedTime:IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      fetchMock
      .post("path:/sharing/rest/content/users/casey/createService",
        '{"success":false}');
      mSolution.createSwizzledItem(fullItem, folderId, swizzles, sessionWithMockedTime, orgUrl)
      .then(
        () => done.fail(),
        errorMsg => {
          expect(errorMsg).toEqual({"success":false});
          done();
        }
      );
    });

    it("should handle service without any layers or tables", done => {
      const fullItem:mInterfaces.ITemplateFeatureService = mockSolutions.getItemSolutionPart("Feature Service");
      fullItem.service.layers = null;
      fullItem.service.tables = null;
      fullItem.layers = null;
      fullItem.tables = null;

      mSolution.addFeatureServiceLayersAndTables(fullItem, {}, MOCK_USER_REQOPTS)
      .then(
        () => done(),
        error => done.fail(error)
      );
    });

    it("should create an empty group", done => {
      const group = mockSolutions.getGroupSolutionPart();
      const swizzles:mCommon.ISwizzleHash = {};

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const now = 1555555555555;
      const sessionWithMockedTime:IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      fetchMock
      .post('path:/sharing/rest/community/createGroup',
        '{"success":true,"group":{"id":"grp1234567890","title":"Group_1555555555555","owner":"casey"}}');
      mSolution.createSwizzledItem(group, null, swizzles, sessionWithMockedTime, orgUrl)
      .then(
        () => done(),
        error => done.fail(error)
      );
    });

    it("should handle the failure to create an empty group", done => {
      const group = mockSolutions.getGroupSolutionPart();
      const swizzles:mCommon.ISwizzleHash = {};

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const now = 1555555555555;
      const sessionWithMockedTime:IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      fetchMock
      .post('path:/sharing/rest/community/createGroup',
        '{"error":{"code":403,"messageCode":"GWM_0003",' +
        '"message":"You do not have permissions to access this resource or perform this operation.","details":[]}}'
      );
      mSolution.createSwizzledItem(group, null, swizzles, sessionWithMockedTime, orgUrl)
      .then(
        () => done.fail(),
        errorMsg => {
          expect(errorMsg).toEqual("You do not have permissions to access this resource or perform this operation.");
          done();
        }
      );
    });

    it("should create a Web Mapping Application in the root folder", done => {
      const fullItem:mInterfaces.ITemplate = mockSolutions.getItemSolutionPart("Web Mapping Application");
      const folderId:string = null;
      const swizzles:mCommon.ISwizzleHash = createMockSwizzle("map1234567890");

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"WMA1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/WMA1234567890/update",
        '{"success":true,"id":"WMA1234567890"}');
      mSolution.createSwizzledItem(fullItem, folderId, swizzles, MOCK_USER_REQOPTS, orgUrl)
      .then(
        createdItem => {
          expect(createdItem.item.id).toEqual("WMA1234567890");
          done();
        },
        error => done.fail(error)
      );
    });

    it("should handle the failure to update the URL of a Web Mapping Application being created", done => {
      const fullItem:mInterfaces.ITemplate = mockSolutions.getItemSolutionPart("Web Mapping Application");
      const folderId:string = null;
      const swizzles:mCommon.ISwizzleHash = createMockSwizzle("map1234567890");

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"WMA1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/WMA1234567890/update",
        '{"error":{"code":400,"messageCode":"CONT_0001",' +
        '"message":"Item does not exist or is inaccessible.","details":[]}}');
      mSolution.createSwizzledItem(fullItem, folderId, swizzles, MOCK_USER_REQOPTS, orgUrl)
      .then(
        () => done.fail(),
        errorMsg => {
          expect(errorMsg).toEqual("Item does not exist or is inaccessible.");
          done();
        }
      );
    });

    it("should create an unswizzled public Dashboard in a specified folder", done => {
      const fullItem:mInterfaces.ITemplate = mockSolutions.getItemSolutionPart("Dashboard");

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"dsh1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/dsh1234567890/share",
        '{"notSharedWith":[],"itemId":"dsh1234567890"}');
      mCommon.createItemWithData(fullItem.item, fullItem.data, MOCK_USER_REQOPTS, null, "public")
      .then(
        createdItemUpdateResponse => {
          expect(createdItemUpdateResponse).toEqual({ success: true, id: "dsh1234567890" });
          done();
        },
        error => done.fail(error)
      );
    });

    it("should create an unswizzled dataless public Dashboard in a specified folder", done => {
      const fullItem:mInterfaces.ITemplate = mockSolutions.getDashboardSolutionPartNoData();

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"dsh1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/dsh1234567890/share",
        '{"notSharedWith":[],"itemId":"dsh1234567890"}');
      mCommon.createItemWithData(fullItem.item, fullItem.data, MOCK_USER_REQOPTS, null, "public")
      .then(
        createdItemUpdateResponse => {
          expect(createdItemUpdateResponse).toEqual({ success: true, id: "dsh1234567890" });
          done();
        },
        error => done.fail(error)
      );
    });

    it("should create an unswizzled dataless public Dashboard with both folder and access undefined", done => {
      const fullItem:mInterfaces.ITemplate = mockSolutions.getDashboardSolutionPartNoData();

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"dsh1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/dsh1234567890/share",
        '{"notSharedWith":[],"itemId":"dsh1234567890"}');
      mCommon.createItemWithData(fullItem.item, fullItem.data, MOCK_USER_REQOPTS, undefined, undefined)
      .then(
        createdItemUpdateResponse => {
          expect(createdItemUpdateResponse).toEqual({ success: true, id: "dsh1234567890" });
          done();
        },
        error => done.fail(error)
      );
    });

    it("should create an item that's not a Dashboard, Feature Service, Group, Web Map, or Web Mapping Application",
      done => {
      const fullItem:mInterfaces.ITemplate = mockSolutions.getItemSolutionPart("Map Template");
      const folderId:string = null;
      const swizzles:mCommon.ISwizzleHash = {};

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"MTP1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/MTP1234567890/update",
        '{"success":true,"id":"MTP1234567890"}');
      mSolution.createSwizzledItem(fullItem, folderId, swizzles, MOCK_USER_REQOPTS, orgUrl)
      .then(
        createdItem => {
          expect(createdItem.item.id).toEqual("MTP1234567890");
          done();
        },
        error => done.fail(error)
      );
    });

  });

  describe("supporting routine: get cloning order", () => {

    it("sorts an item and its dependencies 1", () => {
      const abc = {...MOCK_ITEM_PROTOTYPE, itemId: "abc"};
      const def = {...MOCK_ITEM_PROTOTYPE, itemId: "def"};
      const ghi = {...MOCK_ITEM_PROTOTYPE, itemId: "ghi"};

      abc.dependencies = ["ghi", "def"];

      const results:string[] = mSolution.topologicallySortItems([abc, def, ghi]);
      expect(results.length).toEqual(3);
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({predecessor: "ghi", successor: "abc"});
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({predecessor: "def", successor: "abc"});
    });

    it("sorts an item and its dependencies 2", () => {
      const abc = {...MOCK_ITEM_PROTOTYPE, itemId: "abc"};
      const def = {...MOCK_ITEM_PROTOTYPE, itemId: "def"};
      const ghi = {...MOCK_ITEM_PROTOTYPE, itemId: "ghi"};

      abc.dependencies = ["ghi", "def"];
      def.dependencies = ["ghi"];

      const results:string[] = mSolution.topologicallySortItems([abc, def, ghi]);
      expect(results.length).toEqual(3);
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({predecessor: "ghi", successor: "abc"});
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({predecessor: "def", successor: "abc"});
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({predecessor: "ghi", successor: "def"});
    });

    it("sorts an item and its dependencies 3", () => {
      const abc = {...MOCK_ITEM_PROTOTYPE, itemId: "abc"};
      const def = {...MOCK_ITEM_PROTOTYPE, itemId: "def"};
      const ghi = {...MOCK_ITEM_PROTOTYPE, itemId: "ghi"};

      abc.dependencies = ["ghi"];
      ghi.dependencies = ["def"];

      const results:string[] = mSolution.topologicallySortItems([abc, def, ghi]);
      expect(results.length).toEqual(3);
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({predecessor: "ghi", successor: "abc"});
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({predecessor: "def", successor: "abc"});
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({predecessor: "def", successor: "ghi"});
    });

    it("reports a multi-item cyclic dependency graph", () => {
      const abc = {...MOCK_ITEM_PROTOTYPE, itemId: "abc"};
      const def = {...MOCK_ITEM_PROTOTYPE, itemId: "def"};
      const ghi = {...MOCK_ITEM_PROTOTYPE, itemId: "ghi"};

      abc.dependencies = ["ghi"];
      def.dependencies = ["ghi"];
      ghi.dependencies = ["abc"];

      expect(function () {
        mSolution.topologicallySortItems([abc, def, ghi]);
      }).toThrowError(Error, "Cyclical dependency graph detected");
    });

    it("reports a single-item cyclic dependency graph", () => {
      const abc = {...MOCK_ITEM_PROTOTYPE, itemId: "abc"};
      const def = {...MOCK_ITEM_PROTOTYPE, itemId: "def"};
      const ghi = {...MOCK_ITEM_PROTOTYPE, itemId: "ghi"};

      def.dependencies = ["def"];

      expect(function () {
        mSolution.topologicallySortItems([abc, def, ghi]);
      }).toThrowError(Error, "Cyclical dependency graph detected");
    });

  });

  describe("supporting routine: remove undesirable properties", () => {

    it("remove properties", () => {
      const abc = mockItems.getAGOLItem("Web Mapping Application",
        "http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc599252a7835eea21");

      const abcCopy = mSolution.removeUndesirableItemProperties(abc);
      expect(abc).toEqual(mockItems.getAGOLItem("Web Mapping Application",
        "http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc599252a7835eea21"));
      expect(abcCopy).toEqual(mockItems.getTrimmedAGOLItem());
    });

    it("shallow copy if properties already removed", () => {
      const abc = mockItems.getTrimmedAGOLItem();

      const abcCopy = mSolution.removeUndesirableItemProperties(abc);
      expect(abc).toEqual(mockItems.getTrimmedAGOLItem());
      expect(abcCopy).toEqual(mockItems.getTrimmedAGOLItem());

      abcCopy.id = "WMA123";
      expect(abc.id).toEqual("wma1234567890");
    });

    it("checks for item before attempting to access its properties", () => {
      const result = mSolution.removeUndesirableItemProperties(null);
      expect(result).toBeNull();
    });

  });

  describe("supporting routine: solution storymap", () => {

    it("should handle defaults to create a storymap", () => {
      const title = "Solution storymap";
      const solutionItem:mInterfaces.ITemplate[] = mockSolutions.getWebMappingApplicationSolution();

      const storymapItem = mViewing.createSolutionStorymapItem(title, solutionItem);
      expect(storymapItem).toBeDefined();
    });

    it("should handle defaults to publish a storymap", done => {
      const title = "Solution storymap";
      const solutionItem:mInterfaces.ITemplate[] = mockSolutions.getWebMappingApplicationSolution();
      const storymapItem = mViewing.createSolutionStorymapItem(title, solutionItem);

      fetchMock
      .post("https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"sto1234567890","folder":null}')

      .get("https://myorg.maps.arcgis.com/sharing/rest/community/groups/map1234567890?f=json&token=fake-token",
        '{"id":"map1234567890","title":"ROW Permit Manager_1543341045131","isInvitationOnly":true,' +
        '"owner":"ArcGISTeamLocalGovOrg","description":null,"snippet":"ROW",' +
        '"tags":["ROW","source-84453ddeff8841e9aa2c25d5e1253cd7"],"phone":null,"sortField":"title",' +
        '"sortOrder":"asc","isViewOnly":true,"thumbnail":null,"created":1543341045000,"modified":1543341045000,' +
        '"access":"public","capabilities":[],"isFav":false,"isReadOnly":false,"protected":false,"autoJoin":false,' +
        '"notificationsEnabled":false,"provider":null,"providerGroupName":null,' +
        '"userMembership":{"username":"ArcGISTeamLocalGovOrg","memberType":"owner","applications":0},' +
        '"collaborationInfo":{}}')
      .get("https://myorg.maps.arcgis.com/sharing/rest/content/groups/map1234567890" +
        "?f=json&start=0&num=100&token=fake-token",
        '{"total":0,"start":1,"num":0,"nextStart":-1,"items":[]}')

      .post("path:/sharing/rest/content/users/casey/items/sto1234567890/update",
        '{"success":true,"id":"sto1234567890"}');
      mViewing.publishSolutionStorymapItem(storymapItem, MOCK_USER_REQOPTS, orgUrl)
      .then(
        () => done(),
        done.fail
      );
    });

    it("should handle solution items without a URL when creating a storymap", () => {
      const title = "Solution storymap";
      const solution:mInterfaces.ITemplate[] = [
        mockSolutions.getItemSolutionPart("Dashboard")
      ];

      const storymapItem = mViewing.createSolutionStorymapItem(title, solution);
      expect(storymapItem.type).toEqual("Web Mapping Application");
      expect(storymapItem.item).toBeDefined();
      expect(storymapItem.data).toBeDefined();
    });

    it("should get an untitled storymap item base", () => {
      const storymapItemBase = mViewing.getStorymapItemFundamentals();
      expect(storymapItemBase.title).toEqual("");
    });

  });

  describe("supporting routine: timestamp", () => {

    it("should return time 1541440408000", () => {
      const expected = 1541440408000;
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(expected));
      expect(mSolution.getTimestamp()).toEqual(expected.toString());
      jasmine.clock().uninstall();
    });

  });

  describe("supporting routine: add members to cloned group", () => {

    it("should handle empty group", done => {
      const group = mockSolutions.getGroupSolutionPart();
      mSolution.addGroupMembers(group, MOCK_USER_REQOPTS)
      .then(
        () => done(),
        error => done.fail(error)
      );
    });

    it("should handle failure to add to group", done => {
      const group = mockSolutions.getGroupSolutionPart(["map1234567890"]);
      fetchMock
      .mock('path:/sharing/rest/community/users/casey',
        '{"username":"casey","id":"9e227333ba7a"}')
      .post('path:/sharing/rest/search',
        '{"query":"id: map1234567890 AND group: grp1234567890",' +
        '"total":0,"start":1,"num":10,"nextStart":-1,"results":[]}')
      .mock('path:/sharing/rest/community/groups/grp1234567890',
        '{"id":"grp1234567890","title":"My group","owner":"casey",' +
        '"userMembership":{"username":"casey","memberType":"owner","applications":0}}')
      .post('path:/sharing/rest/content/users/casey/items/map1234567890/share',
        '{"error":{"code":400,"messageCode":"CONT_0001",' +
        '"message":"Item does not exist or is inaccessible.","details":[]}}');
      mSolution.addGroupMembers(group, MOCK_USER_REQOPTS)
      .then(
        () => done.fail(),
        done
      );
    });

    it("should add an item to a group", done => {
      const group = mockSolutions.getGroupSolutionPart(["map1234567890"]);
      fetchMock
      .mock('path:/sharing/rest/community/users/casey',
        '{"username":"casey","id":"9e227333ba7a"}'
      )
      .post('path:/sharing/rest/search',
        '{"query":"id: map1234567890 AND group: grp1234567890",' +
        '"total":0,"start":1,"num":10,"nextStart":-1,"results":[]}')
      .mock('path:/sharing/rest/community/groups/grp1234567890',
        '{"id":"grp1234567890","title":"My group","owner":"casey",' +
        '"userMembership":{"username":"casey","memberType":"owner","applications":0}}')
      .post('path:/sharing/rest/content/users/casey/items/map1234567890/share',
        '{"notSharedWith":[],"itemId":"map1234567890"}');
      mSolution.addGroupMembers(group, MOCK_USER_REQOPTS)
      .then(
        () => done(),
        error => done.fail(error)
      );
    });

  });

  describe("supporting routine: update application URL", () => {

    it("success", done => {
      const initialUrl = mSolution.PLACEHOLDER_SERVER_NAME + "/apps/CrowdsourcePolling/index.html?appid=";
      const abc:mInterfaces.ITemplate = {
        ...MOCK_ITEM_PROTOTYPE,
        type: "Web Mapping Application",
        item: mockItems.getAGOLItem("Web Mapping Application", initialUrl)
      };

      fetchMock
      .post("https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/wma1234567890/update",
      '{"success":true,"id":"wma1234567890"}');
      mSolution.updateApplicationURL(abc, MOCK_USER_REQOPTS, orgUrl)
      .then(
        response => {
          expect(response).toEqual("wma1234567890");
          done();
        },
        done.fail
      );
    });

    it("failure", done => {
      const initialUrl = mSolution.PLACEHOLDER_SERVER_NAME + "/apps/CrowdsourcePolling/index.html?appid=";
      const abc:mInterfaces.ITemplate = {
        ...MOCK_ITEM_PROTOTYPE,
        type: "Web Mapping Application",
        item: mockItems.getAGOLItem("Web Mapping Application", initialUrl)
      };

      fetchMock
      .post("https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/wma1234567890/update",
        '{"error":{"code":400,"messageCode":"CONT_0001",' +
        '"message":"Item does not exist or is inaccessible.","details":[]}}');
      mSolution.updateApplicationURL(abc, MOCK_USER_REQOPTS, orgUrl)
      .then(
        () => done.fail(),
        errorMsg => {
          const expectedError = new ArcGISRequestError("Item does not exist or is inaccessible.", "CONT_0001");
          expect(errorMsg).toEqual(expectedError);
          done();
        }
      );
    });

    it("should create a placeholder URL for a Dashboard item", () => {
      const initialUrl =
        "http://arcgis4localgov2.maps.arcgis.com/apps/opsdashboard/index.html#/d74b0cb7afc84cc9af0357ccdf113a71";
      const abc:mInterfaces.ITemplate = {
        ...MOCK_ITEM_PROTOTYPE,
        type: "Dashboard",
        item: mockItems.getAGOLItem("Dashboard", initialUrl)
      };

      mSolution.addGeneralizedApplicationURL(abc);
      expect(abc.item.url).toEqual(mSolution.PLACEHOLDER_SERVER_NAME + mSolution.OPS_DASHBOARD_APP_URL_PART);
    });

    it("should create a placeholder URL for a Web Map item", () => {
      const initialUrl =
        "http://arcgis4localgov2.maps.arcgis.com/home/webmap/viewer.html?webmap=72c09ca3b79e429ab8c9c9665fbe42dc";
      const abc:mInterfaces.ITemplate = {
        ...MOCK_ITEM_PROTOTYPE,
        type: "Web Map",
        item: mockItems.getAGOLItem("Web Map", initialUrl)
      };

      mSolution.addGeneralizedApplicationURL(abc);
      expect(abc.item.url).toEqual(mSolution.PLACEHOLDER_SERVER_NAME + mSolution.WEBMAP_APP_URL_PART);
    });

    it("should leave the application URL alone for an item that is neither a Dashboard nor a Web Map", () => {
      const initialUrl = "https://arcgis4localgov2.maps.arcgis.com/apps/CrowdsourcePolling/index.html?" +
        "appid=ed883ee75afe49319d136b46f7e5a86c";
      const abc:mInterfaces.ITemplate = {
        ...MOCK_ITEM_PROTOTYPE,
        type: "Web Mapping Application",
        item: mockItems.getAGOLItem("Web Mapping Application", initialUrl)
      };

      mSolution.addGeneralizedApplicationURL(abc);
      expect(abc.item.url).toEqual(initialUrl);
    });

  });

  describe("successful fetches", () => {

    it("should return a list of WMA details for a valid AGOL id", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"));
      mSolution.getFullItemHierarchy("wma1234567890", MOCK_USER_REQOPTS)
      .then(
        (response:mInterfaces.ITemplate[]) => {
          expect(response.length).toEqual(3);
          const fullItem:mInterfaces.ITemplate = response[0];
          expect(fullItem.type).toEqual("Web Mapping Application");
          expect(fullItem.item.title).toEqual("An AGOL item");
          expect(fullItem.data.source).toEqual("tpl1234567890");
          done();
        },
        done.fail
      );
    });

    it("should return a list of WMA details for a valid AGOL id in a list", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"));
      mSolution.getFullItemHierarchy(["wma1234567890"], MOCK_USER_REQOPTS)
      .then(
        (response:mInterfaces.ITemplate[]) => {
          expect(response.length).toEqual(3);
          const fullItem:mInterfaces.ITemplate = response[0];
          expect(fullItem.type).toEqual("Web Mapping Application");
          expect(fullItem.item.title).toEqual("An AGOL item");
          expect(fullItem.data.source).toEqual("tpl1234567890");
          done();
        },
        done.fail
      );
    });

    it("should return a list of WMA details for a valid AGOL id in a list with more than one id", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"));
      mSolution.getFullItemHierarchy(["wma1234567890", "svc1234567890"], MOCK_USER_REQOPTS)
      .then(
        (response:mInterfaces.ITemplate[]) => {
          expect(response.length).toEqual(3);
          const fullItem:mInterfaces.ITemplate = response[0];
          expect(fullItem.type).toEqual("Web Mapping Application");
          expect(fullItem.item.title).toEqual("An AGOL item");
          expect(fullItem.data.source).toEqual("tpl1234567890");
          done();
        },
        done.fail
      );
    });

    it("should handle repeat calls without re-fetching items", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"));
      mSolution.getFullItemHierarchy("wma1234567890", MOCK_USER_REQOPTS)
      .then(
        (response:mInterfaces.ITemplate[]) => {
          expect(response.length).toEqual(3);
          expect(fetchMock.calls("begin:https://myorg.maps.arcgis.com/").length).toEqual(9);

          mSolution.getFullItemHierarchy("wma1234567890", MOCK_USER_REQOPTS, response)
          .then(
            (response2:mInterfaces.ITemplate[]) => {
              expect(response2.length).toEqual(3);  // unchanged
              expect(fetchMock.calls("begin:https://myorg.maps.arcgis.com/").length).toEqual(9);
              expect(response2).toEqual(response);
              done();
            },
            done.fail
          );
        },
        done.fail
      );
    });

  });

  describe("catch bad input", () => {

    it("throws an error if the hierarchy to be created fails: missing id", done => {
      fetchMock.once("*", mockItems.getAGOLItem());
      mSolution.getFullItemHierarchy(null, MOCK_USER_REQOPTS)
      .then(
        fail,
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: null");
          done();
        }
      );
    });

    it("throws an error if the hierarchy to be created fails: empty id list", done => {
      fetchMock.once("*", mockItems.getAGOLItem());
      mSolution.getFullItemHierarchy([], MOCK_USER_REQOPTS)
      .then(
        fail,
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: null");
          done();
        }
      );
    });

    it("throws an error if the hierarchy to be created fails: missing id in list", done => {
      fetchMock.once("*", mockItems.getAGOLItem());
      mSolution.getFullItemHierarchy([null], MOCK_USER_REQOPTS)
      .then(
        fail,
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: null");
          done();
        }
      );
    });

  });

  describe("failed fetches", () => {

    it("throws an error if the hierarchy to be created fails: inaccessible", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/fail1234567890", mockItems.getAGOLItem())
      .mock("path:/sharing/rest/community/groups/fail1234567890", mockItems.getAGOLItem());
      mSolution.getFullItemHierarchy("fail1234567890", MOCK_USER_REQOPTS)
      .then(
        fail,
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: fail1234567890");
          done();
        }
      );
    });

    it("throws an error if the hierarchy to be created fails: inaccessible in a list", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/fail1234567890", mockItems.getAGOLItem())
      .mock("path:/sharing/rest/community/groups/fail1234567890", mockItems.getAGOLItem());
      mSolution.getFullItemHierarchy(["fail1234567890"], MOCK_USER_REQOPTS)
      .then(
        fail,
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: fail1234567890");
          done();
        }
      );
    });

    it("throws an error if the hierarchy to be created fails: list of [valid, inaccessible]", done => {
      const baseSvcURL = "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"))
      .post(baseSvcURL + "FeatureServer?f=json", mockServices.getService(
        [mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer")],
        [mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table")]
      ))
      .post(baseSvcURL + "FeatureServer/0?f=json", mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer",
        [mockServices.getRelationship(0, 1, "esriRelRoleOrigin")]
      ))
      .post(baseSvcURL + "FeatureServer/1?f=json", mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table",
        [mockServices.getRelationship(0, 0, "esriRelRoleDestination")]
      ))
      .mock("path:/sharing/rest/content/items/fail1234567890", mockItems.getAGOLItem())
      .mock("path:/sharing/rest/community/groups/fail1234567890", mockItems.getAGOLItem());
      mSolution.getFullItemHierarchy(["wma1234567890", "fail1234567890"], MOCK_USER_REQOPTS)
      .then(
        fail,
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: fail1234567890");
          done();
        }
      );
    });

    it("throws an error if the hierarchy to be created fails: list of [valid, missing id]", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"));
      mSolution.getFullItemHierarchy(["wma1234567890", null], MOCK_USER_REQOPTS)
      .then(
        fail,
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: null");
          done();
        }
      );
    });

  });

  describe("catch inability to get dependents", () => {

    it("throws an error if getting group dependencies fails", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/grp1234567890", mockItems.getAGOLItem())
      .mock("path:/sharing/rest/community/groups/grp1234567890", mockItems.getAGOLGroup())
      .mock(
        "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
        "?f=json&start=0&num=100&token=fake-token",
        '{"error":{"code":400,"messageCode":"CONT_0006",' +
        '"message":"Group does not exist or is inaccessible.","details":[]}}');
      mSolution.getFullItemHierarchy(["grp1234567890"], MOCK_USER_REQOPTS)
      .then(
        () => {
          done.fail();
        },
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: grp1234567890");
          done();
        }
      );
    });

    it("throws an error if a non-group dependency fails", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem())
      .mock("path:/sharing/rest/community/groups/svc1234567890", mockItems.getAGOLItem())
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"));
      mSolution.getFullItemHierarchy(["wma1234567890"], MOCK_USER_REQOPTS)
      .then(
        () => {
          done.fail();
        },
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: svc1234567890");
          done();
        }
      );
    });

  });

  describe("supporting routine: get template from template bundle", () => {

    it("empty bundle", () => {
      const bundle:mInterfaces.ITemplate[] = [];
      const idToFind = "abc123";
      const replacementTemplate = {
        ...MOCK_ITEM_PROTOTYPE
      };
      replacementTemplate.itemId = "ghi456";

      expect(mSolution.replaceTemplate(bundle, idToFind, replacementTemplate)).toBeFalsy();
      expect(bundle.length).toEqual(0);
    });

    it("item not in bundle", () => {
      const placeholderTemplate = {
        ...MOCK_ITEM_PROTOTYPE
      };
      placeholderTemplate.itemId = "xyz098";
      const bundle:mInterfaces.ITemplate[] = [placeholderTemplate];
      const idToFind = "abc123";
      const replacementTemplate = {
        ...MOCK_ITEM_PROTOTYPE
      };
      replacementTemplate.itemId = "ghi456";

      expect(mSolution.replaceTemplate(bundle, idToFind, replacementTemplate)).toBeFalsy();
      expect(bundle.length).toEqual(1);
      expect(bundle[0].itemId).toEqual(placeholderTemplate.itemId);
    });

    it("item in bundle", () => {
      const placeholderTemplate = {
        ...MOCK_ITEM_PROTOTYPE
      };
      placeholderTemplate.itemId = "xyz098";
      const bundle:mInterfaces.ITemplate[] = [placeholderTemplate];
      const idToFind = "xyz098";
      const replacementTemplate = {
        ...MOCK_ITEM_PROTOTYPE
      };
      replacementTemplate.itemId = "ghi456";

      expect(mSolution.replaceTemplate(bundle, idToFind, replacementTemplate)).toBeTruthy();
      expect(bundle.length).toEqual(1);
      expect(bundle[0].itemId).toEqual(replacementTemplate.itemId);
    });

  });

});
