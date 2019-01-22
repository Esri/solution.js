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

import { UserSession, IUserRequestOptions } from "@esri/arcgis-rest-auth";

import * as mClassifier from "../src/itemTypes/classifier";
import * as mCommon from "../src/itemTypes/common";
import * as mFeatureService from "../src/itemTypes/featureservice";
import * as mGroup from "../src/itemTypes/group";
import * as mInterfaces from "../src/interfaces";
import * as mItemHelpers from '../src/utils/item-helpers';
import * as mSolution from "../src/solution";
import * as mViewing from "../src/viewing";
import * as GenericModule from "../src/itemTypes/generic";

import { TOMORROW, setMockDateTime, createRuntimeMockUserSession, createMockSettings } from "./lib/utils";
import { ICustomArrayLikeMatchers, CustomMatchers } from './customMatchers';
import * as fetchMock from "fetch-mock";
import * as mockItems from "./mocks/agolItems";
import * as mockSolutions from "./mocks/templates";
import * as mockUtils from "./lib/utils";

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

    it("for single item containing webmap WMA & feature service", done => {
      const baseSvcURL = "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";

      spyOn(mItemHelpers, "createId").and.callFake(() => {
        return "i1a2b3c4";
      });

      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("one text"))
      .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"))
      .post(baseSvcURL + "FeatureServer?f=json", mockItems.getAGOLService(
        [mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")],
        [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]
      ))
      .post(baseSvcURL + "FeatureServer/0?f=json",
        mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer",
        [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]
      ))
      .post(baseSvcURL + "FeatureServer/1?f=json",
        mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table",
        [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]
      ));
      mSolution.createSolution("wma1234567890", MOCK_USER_REQOPTS)
      .then(
        response => {
          mockUtils.removeItemFcns(response);
          const template = mockSolutions.getWebMappingApplicationTemplate();
          template[0].resources = mockItems.getAGOLItemResources("one text").resources;
          expect(response).toEqual(template);
          done();
        },
        done.fail
      );
    });

    it("for single item containing group WMA & feature service", done => {
      const baseSvcURL = "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";

      spyOn(mItemHelpers, "createId").and.callFake(() => {
        return "i1a2b3c4";
      });

      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemDataWMAGroup())
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("one text"))
      .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"))
      .post(baseSvcURL + "FeatureServer?f=json", mockItems.getAGOLService(
        [mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")],
        [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]
      ))
      .post(baseSvcURL + "FeatureServer/0?f=json",
        mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer",
        [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]
      ))
      .post(baseSvcURL + "FeatureServer/1?f=json",
        mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table",
        [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]
      ));
      mSolution.createSolution("wma1234567890", MOCK_USER_REQOPTS)
      .then(
        response => {
          mockUtils.removeItemFcns(response);
          const template = mockSolutions.getWebMappingApplicationTemplateGroup();
          expect(response).toEqual(template);
          done();
        },
        done.fail
      );
    });

    it("for single item containing WMA without folderId, webmap, or group", done => {
      const baseSvcURL = "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";

      spyOn(mItemHelpers, "createId").and.callFake(() => {
        return "i1a2b3c4";
      });

      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemDataWMANoWebmapOrGroup())
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources());
      mSolution.createSolution("wma1234567890", MOCK_USER_REQOPTS)
      .then(
        response => {
          mockUtils.removeItemFcns(response);
          const template = mockSolutions.getWebMappingApplicationTemplateNoWebmapOrGroup();
          expect(response).toEqual(template);
          done();
        },
        done.fail
      );
    });

    it("for single item not containing WMA or feature service", done => {
      spyOn(mItemHelpers, "createId").and.callFake(() => {
        return "i1a2b3c4";
      });

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
          mockUtils.removeItemFcns(response);
          expect(response).toEqual([
            mockSolutions.getGroupTemplatePart()
          ]);
          done();
        },
        done.fail
      );
    });

    it("gets a service name from a layer if a service needs a name", done => {
      const itemTemplate:mInterfaces.ITemplate = {
        itemId: "",
        type: "Feature Service",
        key: "",
        item: mockItems.getNoNameAGOLFeatureServiceItem(),
        data: mockItems.getAGOLItemData("Feature Service"),
        properties: {
          service: null,
          layers: null,
          tables: null
        }
      };
      itemTemplate.itemId = itemTemplate.item.id;

      fetchMock
      .post(itemTemplate.item.url + "?f=json", mockItems.getAGOLService(
        [mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")],
        [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]
      ))
      .post(itemTemplate.item.url + "/0?f=json",
        mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer",
        [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]
      ))
      .post(itemTemplate.item.url + "/1?f=json",
        mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table",
        [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]
      ));
      mFeatureService.fleshOutFeatureService(itemTemplate, MOCK_USER_REQOPTS)
      .then(
        () => {
          expect(itemTemplate.properties.service.name).toEqual(mockItems.getAGOLService(
            [mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")],
            [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]
          ).layers[0].name);
          done();
        },
        done.fail
      );
    });

    it("gets a service name from a table if a service needs a name--no layer", done => {
      const itemTemplate:mInterfaces.ITemplate = {
        itemId: "",
        type: "Feature Service",
        key: "",
        item: mockItems.getNoNameAGOLFeatureServiceItem(),
        data: mockItems.getAGOLItemData("Feature Service"),
        properties: {
          service: null,
          layers: null,
          tables: null
        }
      };
      itemTemplate.itemId = itemTemplate.item.id;

      fetchMock
      .post(itemTemplate.item.url + "?f=json", mockItems.getAGOLService(
        undefined,
        [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]
      ))
      .post(itemTemplate.item.url + "/0?f=json",
        mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer",
        [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]
      ))
      .post(itemTemplate.item.url + "/1?f=json",
        mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table",
        [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]
      ));
      mFeatureService.fleshOutFeatureService(itemTemplate, MOCK_USER_REQOPTS)
      .then(
        () => {
          expect(itemTemplate.properties.service.name).toEqual(
            mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table",
            [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]
          ).name);
          done();
        },
        done.fail
      );
    });

    it("gets a service name from a table if a service needs a name--nameless layer", done => {
      const itemTemplate:mInterfaces.ITemplate = {
        itemId: "",
        type: "Feature Service",
        key: "",
        item: mockItems.getNoNameAGOLFeatureServiceItem(),
        data: mockItems.getAGOLItemData("Feature Service"),
        properties: {
          service: null,
          layers: null,
          tables: null
        }
      };
      itemTemplate.itemId = itemTemplate.item.id;

      fetchMock
      .post(itemTemplate.item.url + "?f=json", mockItems.getAGOLService(
        mockUtils.removeNameField([mockItems.getAGOLLayerOrTable(0, "", "Feature Layer")]),
        [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]
      ))
      .post(itemTemplate.item.url + "/0?f=json",
        mockItems.getAGOLLayerOrTable(0, "", "Feature Layer",
        [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]
      ))
      .post(itemTemplate.item.url + "/1?f=json",
        mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table",
        [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]
      ));
      mFeatureService.fleshOutFeatureService(itemTemplate, MOCK_USER_REQOPTS)
      .then(
        () => {
          expect(itemTemplate.properties.service.name).toEqual(
            mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table",
            [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]
          ).name);
          done();
        },
        done.fail
      );
    });

    it("falls back to 'Feature Service' if a service needs a name", done => {
      const itemTemplate:mInterfaces.ITemplate = {
        itemId: "",
        type: "Feature Service",
        key: "",
        item: mockItems.getNoNameAGOLFeatureServiceItem(),
        data: mockItems.getAGOLItemData("Feature Service"),
        properties: {
          service: null,
          layers: null,
          tables: null
        }
      };
      itemTemplate.itemId = itemTemplate.item.id;

      fetchMock
      .post(itemTemplate.item.url + "?f=json", mockItems.getAGOLService(
        mockUtils.removeNameField([mockItems.getAGOLLayerOrTable(0, "", "Feature Layer")]),
        mockUtils.removeNameField([mockItems.getAGOLLayerOrTable(1, "", "Table")])
      ))
      .post(itemTemplate.item.url + "/0?f=json",
        mockItems.getAGOLLayerOrTable(0, "", "Feature Layer",
        [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]
      ))
      .post(itemTemplate.item.url + "/1?f=json",
        mockItems.getAGOLLayerOrTable(1, "", "Table",
        [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]
      ));
      mFeatureService.fleshOutFeatureService(itemTemplate, MOCK_USER_REQOPTS)
      .then(
        () => {
          expect(itemTemplate.properties.service.name).toEqual("Feature Service");
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
      mSolution.publishSolution("My Solution", mockSolutions.getWebMappingApplicationTemplate(), MOCK_USER_REQOPTS)
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
      mSolution.publishSolution("My Solution", mockSolutions.getWebMappingApplicationTemplate(), MOCK_USER_REQOPTS)
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
      mSolution.publishSolution("My Solution", mockSolutions.getWebMappingApplicationTemplate(), MOCK_USER_REQOPTS,
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
      mSolution.cloneSolution(null, MOCK_USER_REQOPTS)
      .then(done, done.fail);
    });

    it("should handle an empty, nameless solution", done => {
      const settings = createMockSettings();
      mSolution.cloneSolution({} as mInterfaces.ITemplate[], MOCK_USER_REQOPTS, settings)
      .then(done, done.fail);
    });

    it("should handle failure to create solution's folder", done => {
      const solutionItem:mInterfaces.ITemplate[] = mockSolutions.getWebMappingApplicationTemplate();
      const settings = createMockSettings();

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const now = 1555555555555;
      const sessionWithMockedTime:IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      fetchMock
      .post("https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
        '{"error":{"code":400,"message":"Unable to create folder.","details":["\'title\' must be specified."]}}');
      mSolution.cloneSolution(solutionItem, sessionWithMockedTime, settings)
      .then(
        () => done.fail(),
        done
      )
    });

    it("should clone a solution using a generated folder", done => {
      const solutionItem:mInterfaces.ITemplate[] = mockSolutions.getWebMappingApplicationTemplate();
      const settings = createMockSettings();

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
      mSolution.cloneSolution(solutionItem, sessionWithMockedTime, settings)
      .then(
        response => {
          expect(response.length).toEqual(3);
          done();
        },
        done.fail
      );
    });

    it("should clone a solution using a supplied folder and supplied solution name", done => {
      const solutionItem:mInterfaces.ITemplate[] = mockSolutions.getWebMappingApplicationTemplate();
      const folderId = "FLD1234567890";
      const settings = createMockSettings("My Solution", folderId);

      // Test a code path
      solutionItem[2].dependencies = null;

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
      mSolution.cloneSolution(solutionItem, MOCK_USER_REQOPTS, settings)
      .then(
        response => {
          expect(response.length).toEqual(3);
          done();
        },
        done.fail
      );
    });

    it("should clone a solution using a supplied folder, but handle failed storymap", done => {
      const solutionItem:mInterfaces.ITemplate[] = mockSolutions.getWebMappingApplicationTemplate();
      const folderId = "FLD1234567890";
      const settings = createMockSettings(undefined, folderId, "org");

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
      mSolution.cloneSolution(solutionItem, MOCK_USER_REQOPTS, settings)
      .then(
        response => {
        expect(response.length).toEqual(3);
          done();
        },
        done.fail
      );
    });

    it("should handle failure to create a contained item", done => {
      const solutionItem:mInterfaces.ITemplate[] = mockSolutions.getWebMappingApplicationTemplate();
      const folderId = "FLD1234567890";
      const settings = createMockSettings(undefined, folderId);

      fetchMock
      .post("https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
        '{"success":true,"folder":{"username":"casey","id":"' + folderId + '","title":"' + folderId + '"}}')
      .post("path:/sharing/rest/content/users/casey/createService",
        '{"success":false}');
      mSolution.cloneSolution(solutionItem, MOCK_USER_REQOPTS, settings)
      .then(
        () => done.fail(),
        errorMsg => {
          expect(errorMsg).toEqual({"success":false});
          done();
        }
      );
    });

  });

  describe("create solution storymap", () => {

    it("should create a storymap using a specified folder and public access", done => {
      const title = "Solution storymap";
      const solutionItem:mInterfaces.ITemplate[] = mockSolutions.getWebMappingApplicationTemplate();
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
      const solutionItem:mInterfaces.ITemplate[] = mockSolutions.getWebMappingApplicationTemplate();

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
      const itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Dashboard"));
      const settings = createMockSettings();

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"DSH1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/DSH1234567890/update",
        '{"success":true,"id":"DSH1234567890"}');
      itemTemplate.fcns.deployItem(itemTemplate, settings, MOCK_USER_REQOPTS)
      .then(
        createdItem => {
          expect(createdItem.itemId).toEqual("DSH1234567890");
          done();
        },
        done.fail
      );
    });

    it("should create a Dashboard in a specified folder", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Dashboard"));
      const settings = createMockSettings();
      settings.folderId = "fld1234567890";

      fetchMock
      .post("path:/sharing/rest/content/users/casey/fld1234567890/addItem",
        '{"success":true,"id":"DSH1234567890","folder":"fld1234567890"}')
      .post("path:/sharing/rest/content/users/casey/items/DSH1234567890/update",
        '{"success":true,"id":"DSH1234567890"}');
      itemTemplate.fcns.deployItem(itemTemplate, settings, MOCK_USER_REQOPTS)
      .then(
        createdItem => {
          expect(createdItem.itemId).toEqual("DSH1234567890");
          done();
        },
        done.fail
      );
    });

    it("should create a mapless Dashboard", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getDashboardTemplatePartNoWidgets());
      const settings = createMockSettings();

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"DSH1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/DSH1234567890/update",
        '{"success":true,"id":"DSH1234567890"}');
      itemTemplate.fcns.deployItem(itemTemplate, settings, MOCK_USER_REQOPTS)
      .then(
        createdItem => {
          expect(createdItem.itemId).toEqual("DSH1234567890");
          done();
        },
        done.fail
      );
    });

    it("should create a dataless Dashboard", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getDashboardTemplatePartNoData());
      const settings = createMockSettings();

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"DSH1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/DSH1234567890/update",
        '{"success":true,"id":"DSH1234567890"}');
      itemTemplate.fcns.deployItem(itemTemplate, settings, MOCK_USER_REQOPTS)
      .then(
        createdItem => {
          expect(createdItem.itemId).toEqual("DSH1234567890");
          done();
        },
        done.fail
      );
    });

    it("should handle failure to create a Dashboard", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getDashboardTemplatePartNoWidgets());
      const settings = createMockSettings();

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"error":{"code":400,"messageCode":"CONT_0004","message":"User folder does not exist.","details":[]}}');
      itemTemplate.fcns.deployItem(itemTemplate, settings, MOCK_USER_REQOPTS)
      .then(
        () => done.fail(),
        errorMsg => {
          expect(errorMsg).toEqual("User folder does not exist.");
          done();
        }
      );
    });

    it("should create a Feature Service", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Feature Service"));
      const settings = createMockSettings();
      settings.folderId = "fld1234567890";

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
      itemTemplate.fcns.deployItem(itemTemplate, settings, sessionWithMockedTime)
      .then(
        createdItem => {
          // Check that we're appending a timestamp to the service name
          const createServiceCall = fetchMock.calls("path:/sharing/rest/content/users/casey/createService");
          const createServiceCallBody = createServiceCall[0][1].body as string;
          expect(createServiceCallBody.indexOf("name%22%3A%22Name%20of%20an%20AGOL%20item_1555555555555%22%2C"))
            .toBeGreaterThan(0);

          expect(createdItem.itemId).toEqual("svc1234567890");
          done();
        },
        done.fail
      );
    });

    it("should create a Feature Service without a data section", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Feature Service"));
      itemTemplate.data = null;
      const settings = createMockSettings();
      settings.folderId = "fld1234567890";

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
      itemTemplate.fcns.deployItem(itemTemplate, settings, sessionWithMockedTime)
      .then(
        createdItem => {
          // Check that we're appending a timestamp to the service name
          const createServiceCall = fetchMock.calls("path:/sharing/rest/content/users/casey/createService");
          const createServiceCallBody = createServiceCall[0][1].body as string;
          expect(createServiceCallBody.indexOf("name%22%3A%22Name%20of%20an%20AGOL%20item_1555555555555%22%2C"))
            .toBeGreaterThan(0);

          expect(createdItem.itemId).toEqual("svc1234567890");
          done();
        },
        done.fail
      );
    });

    it("should create a Feature Service without relationships", done => {
      const itemTemplate =
        mClassifier.initItemTemplateFromJSON(mockSolutions.getFeatureServiceTemplatePartNoRelationships());
      const settings = createMockSettings();
      settings.folderId = "fld1234567890";

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
      itemTemplate.fcns.deployItem(itemTemplate, settings, sessionWithMockedTime)
      .then(
        createdItem => {
          // Check that we're appending a timestamp to the service name
          const createServiceCall = fetchMock.calls("path:/sharing/rest/content/users/casey/createService");
          const createServiceCallBody = createServiceCall[0][1].body as string;
          expect(createServiceCallBody.indexOf("name%22%3A%22Name%20of%20an%20AGOL%20item_1555555555555%22%2C"))
            .toBeGreaterThan(0);

          expect(createdItem.itemId).toEqual("svc1234567890");
          done();
        },
        done.fail
      );
    });

    it("should handle an error while trying to create a Feature Service", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Feature Service"));
      itemTemplate.item.url = null;
      const settings = createMockSettings();
      settings.folderId = "fld1234567890";

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const now = 1555555555555;
      const sessionWithMockedTime:IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      fetchMock
      .post("path:/sharing/rest/content/users/casey/createService",
        '{"success":false}');
      itemTemplate.fcns.deployItem(itemTemplate, settings, sessionWithMockedTime)
      .then(
        () => done.fail(),
        errorMsg => {
          expect(errorMsg).toEqual({"success":false});
          done();
        }
      );
    });

    it("should handle service without any layers or tables", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Feature Service"));
      itemTemplate.properties.service.layers = null;
      itemTemplate.properties.service.tables = null;
      itemTemplate.properties.layers = null;
      itemTemplate.properties.tables = null;

      mFeatureService.addFeatureServiceLayersAndTables(itemTemplate, {}, MOCK_USER_REQOPTS)
      .then(
        () => done(),
        done.fail
      );
    });

    it("should create an empty group", done => {
      const groupTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getGroupTemplatePart());
      const settings = createMockSettings();

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const now = 1555555555555;
      const sessionWithMockedTime:IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      fetchMock
      .post('path:/sharing/rest/community/createGroup',
        '{"success":true,"group":{"id":"grp1234567890","title":"Group_1555555555555","owner":"casey"}}');
      groupTemplate.fcns.deployItem(groupTemplate, settings, sessionWithMockedTime)
      .then(
        () => done(),
        (error:any) => done.fail(error)
      );
    });

    it("should handle the failure to create an empty group", done => {
      const groupTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getGroupTemplatePart());
      const settings = createMockSettings();

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
      groupTemplate.fcns.deployItem(groupTemplate, settings, sessionWithMockedTime)
      .then(
        () => done.fail(),
        (errorMsg:any) => {
          expect(errorMsg).toEqual("You do not have permissions to access this resource or perform this operation.");
          done();
        }
      );
    });

    it("should create a Web Mapping Application in the root folder", done => {
      const itemTemplate =
        mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Web Mapping Application"));
      const settings = createMockSettings();

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"WMA1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/WMA1234567890/update",
        '{"success":true,"id":"WMA1234567890"}');
      itemTemplate.fcns.deployItem(itemTemplate, settings, MOCK_USER_REQOPTS)
      .then(
        createdItem => {
          expect(createdItem.itemId).toEqual("WMA1234567890");
          done();
        },
        done.fail
      );
    });

    it("should handle the failure to update the URL of a Web Mapping Application being created", done => {
      const itemTemplate =
        mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Web Mapping Application"));
      const settings = createMockSettings();

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"WMA1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/WMA1234567890/update",
        '{"error":{"code":400,"messageCode":"CONT_0001",' +
        '"message":"Item does not exist or is inaccessible.","details":[]}}');
      itemTemplate.fcns.deployItem(itemTemplate, settings, MOCK_USER_REQOPTS)
      .then(
        () => done.fail(),
        errorMsg => {
          expect(errorMsg).toEqual("Item does not exist or is inaccessible.");
          done();
        }
      );
    });

    it("should create an unswizzled public Dashboard in a specified folder", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Dashboard"));

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"dsh1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/dsh1234567890/share",
        '{"notSharedWith":[],"itemId":"dsh1234567890"}');
      mCommon.createItemWithData(itemTemplate.item, itemTemplate.data, MOCK_USER_REQOPTS, null, "public")
      .then(
        createdItemUpdateResponse => {
          expect(createdItemUpdateResponse).toEqual({ success: true, id: "dsh1234567890" });
          done();
        },
        done.fail
      );
    });

    it("should create an unswizzled dataless public Dashboard in a specified folder", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getDashboardTemplatePartNoData());

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"dsh1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/dsh1234567890/share",
        '{"notSharedWith":[],"itemId":"dsh1234567890"}');
      mCommon.createItemWithData(itemTemplate.item, itemTemplate.data, MOCK_USER_REQOPTS, null, "public")
      .then(
        createdItemUpdateResponse => {
          expect(createdItemUpdateResponse).toEqual({ success: true, id: "dsh1234567890" });
          done();
        },
        done.fail
      );
    });

    it("should create an unswizzled dataless public Dashboard with both folder and access undefined", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getDashboardTemplatePartNoData());

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"dsh1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/dsh1234567890/share",
        '{"notSharedWith":[],"itemId":"dsh1234567890"}');
      mCommon.createItemWithData(itemTemplate.item, itemTemplate.data, MOCK_USER_REQOPTS, undefined, undefined)
      .then(
        createdItemUpdateResponse => {
          expect(createdItemUpdateResponse).toEqual({ success: true, id: "dsh1234567890" });
          done();
        },
        done.fail
      );
    });

    it("should create an item that's not a Dashboard, Feature Service, Group, Web Map, or Web Mapping Application",
      done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Map Template"));
      const settings = createMockSettings();

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"MTP1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/MTP1234567890/update",
        '{"success":true,"id":"MTP1234567890"}');
      itemTemplate.fcns.deployItem(itemTemplate, settings, MOCK_USER_REQOPTS)
      .then(
        createdItem => {
          expect(createdItem.itemId).toEqual("MTP1234567890");
          done();
        },
        done.fail
      );
    });

  });

  describe("supporting routine: get cloning order", () => {

    it("sorts an item and its dependencies 1", () => {
      const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "abc", dependencies: ["ghi", "def"]});
      const def = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "def"});
      const ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "ghi"});

      const results:string[] = mSolution.topologicallySortItems([abc, def, ghi]);
      expect(results.length).toEqual(3);
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({predecessor: "ghi", successor: "abc"});
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({predecessor: "def", successor: "abc"});
    });

    it("sorts an item and its dependencies 2", () => {
      const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "abc", dependencies: ["ghi", "def"]});
      const def = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "def", dependencies: ["ghi"]});
      const ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "ghi"});

      const results:string[] = mSolution.topologicallySortItems([abc, def, ghi]);
      expect(results.length).toEqual(3);
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({predecessor: "ghi", successor: "abc"});
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({predecessor: "def", successor: "abc"});
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({predecessor: "ghi", successor: "def"});
    });

    it("sorts an item and its dependencies 3", () => {
      const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "abc", dependencies: ["ghi"]});
      const def = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "def"});
      const ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "ghi", dependencies: ["def"]});

      const results:string[] = mSolution.topologicallySortItems([abc, def, ghi]);
      expect(results.length).toEqual(3);
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({predecessor: "ghi", successor: "abc"});
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({predecessor: "def", successor: "abc"});
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({predecessor: "def", successor: "ghi"});
    });

    it("reports a multi-item cyclic dependency graph", () => {
      const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "abc", dependencies: ["ghi"]});
      const def = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "def", dependencies: ["ghi"]});
      const ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "ghi", dependencies: ["abc"]});

      expect(function () {
        mSolution.topologicallySortItems([abc, def, ghi]);
      }).toThrowError(Error, "Cyclical dependency graph detected");
    });

    it("reports a single-item cyclic dependency graph", () => {
      const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "abc"});
      const def = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "def", dependencies: ["def"]});
      const ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "ghi"});

      expect(function () {
        mSolution.topologicallySortItems([abc, def, ghi]);
      }).toThrowError(Error, "Cyclical dependency graph detected");
    });

  });

  describe("supporting routine: remove undesirable properties", () => {

    it("remove properties", () => {
      const abc = mockItems.getAGOLItem("Web Mapping Application",
        "http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc599252a7835eea21");

      const abcCopy = mClassifier.removeUndesirableItemProperties(abc);
      expect(abc).toEqual(mockItems.getAGOLItem("Web Mapping Application",
        "http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc599252a7835eea21"));
      expect(abcCopy).toEqual(mockItems.getTrimmedAGOLItem());
    });

    it("shallow copy if properties already removed", () => {
      const abc = mockItems.getTrimmedAGOLItem();

      const abcCopy = mClassifier.removeUndesirableItemProperties(abc);
      expect(abc).toEqual(mockItems.getTrimmedAGOLItem());
      expect(abcCopy).toEqual(mockItems.getTrimmedAGOLItem());

      abcCopy.name = "Renamed item";
      expect(abc.name).toEqual("Name of an AGOL item");
    });

    it("checks for item before attempting to access its properties", () => {
      const result = mClassifier.removeUndesirableItemProperties(null);
      expect(result).toBeNull();
    });

  });

  describe("supporting routine: initializing an item template from an id", () => {

    it("should handle an unsupported item type missing data & resources", done => {

      fetchMock
      .mock("path:/sharing/rest/content/items/unk1234567890", mockItems.getUnknownItemWithoutItemProp())
      .mock("path:/sharing/rest/content/items/unk1234567890/data", mockItems.getAGOLItemData())
      .mock("path:/sharing/rest/content/items/unk1234567890/resources", mockItems.getAGOLItemResources());
      mClassifier.initItemTemplateFromId("unk1234567890", MOCK_USER_REQOPTS)
      .then(
        response => {
          expect(response.fcns.completeItemTemplate).toEqual(GenericModule.completeItemTemplate);
          done();
        },
        done.fail
      );
    });

  });

  describe("supporting routine: solution storymap", () => {

    it("should handle defaults to create a storymap", () => {
      const title = "Solution storymap";
      const solutionItem:mInterfaces.ITemplate[] = mockSolutions.getWebMappingApplicationTemplate();

      const storymapItem = mViewing.createSolutionStorymapItem(title, solutionItem);
      expect(storymapItem).toBeDefined();
    });

    it("should handle defaults to publish a storymap", done => {
      const title = "Solution storymap";
      const solutionItem:mInterfaces.ITemplate[] = mockSolutions.getWebMappingApplicationTemplate();
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
        mockSolutions.getItemTemplatePart("Dashboard")
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
      expect(mCommon.getTimestamp()).toEqual(expected.toString());
      jasmine.clock().uninstall();
    });

  });

  describe("supporting routine: doCommonTemplatizations", () => {

    it("should handle provided extent", () => {
      const templatePart = mockSolutions.getDashboardTemplatePartNoData();
      templatePart.item.extent = [
        [-8589300.590117617, 40.36926825227528],
        [-73.96624645399964, 4722244.554455302]
      ];
      mCommon.doCommonTemplatizations(templatePart);
      expect(templatePart.item.extent).not.toBeNull();
      expect(templatePart.item.extent).toEqual("{{initiative.extent:optional}}");
    });

    it("should handle missing extent", () => {
      const template = mockSolutions.getDashboardTemplatePartNoExtent();
      mCommon.doCommonTemplatizations(template);
      expect(template.item.extent).toBeNull();
    });

  });

  describe("supporting routine: templatizeList", () => {

    it("should handle default parameter", () => {
      const ids = ["abc", "def", "ghi"];
      const expectedTemplatized = ["{{abc.id}}", "{{def.id}}", "{{ghi.id}}"];
      const templatized = mCommon.templatizeList(ids);
      expect(templatized).toEqual(expectedTemplatized);
    });

    it("should handle custom parameter", () => {
      const ids = ["abc", "def", "ghi"];
      const expectedTemplatized = ["{{abc.url}}", "{{def.url}}", "{{ghi.url}}"];
      const templatized = mCommon.templatizeList(ids, "url");
      expect(templatized).toEqual(expectedTemplatized);
    });

    it("should handle empty list", () => {
      const ids = [] as string[];
      const expectedTemplatized = [] as string[];
      const templatized1 = mCommon.templatizeList(ids);
      expect(templatized1).toEqual(expectedTemplatized);
      const templatized2 = mCommon.templatizeList(ids, "url");
      expect(templatized2).toEqual(expectedTemplatized);
    });

  });

  describe("supporting routine: add members to cloned group", () => {

    it("should handle empty group", done => {
      const group = mockSolutions.getGroupTemplatePart();
      mGroup.addGroupMembers(group, MOCK_USER_REQOPTS)
      .then(
        () => done(),
        done.fail
      );
    });

    it("should handle failure to add to group", done => {
      const group = mockSolutions.getGroupTemplatePart(["map1234567890"]);
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
      mGroup.addGroupMembers(group, MOCK_USER_REQOPTS)
      .then(
        () => done.fail(),
        done
      );
    });

    it("should add an item to a group", done => {
      const group = mockSolutions.getGroupTemplatePart(["map1234567890"]);
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
      mGroup.addGroupMembers(group, MOCK_USER_REQOPTS)
      .then(
        () => done(),
        done.fail
      );
    });

  });

  describe("successful fetches", () => {

    it("should return a list of WMA details for a valid AGOL id", done => {
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
      .post(baseSvcURL + "FeatureServer?f=json", mockItems.getAGOLService(
        [mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")],
        [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]
      ))
      .post(baseSvcURL + "FeatureServer/0?f=json",
        mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer",
        [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]
      ))
      .post(baseSvcURL + "FeatureServer/1?f=json",
        mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table",
        [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]
      ));
      mSolution.getItemTemplateHierarchy("wma1234567890", MOCK_USER_REQOPTS)
      .then(
        (response:mInterfaces.ITemplate[]) => {
          expect(response.length).toEqual(3);
          const itemTemplate = response[0];
          expect(itemTemplate.type).toEqual("Web Mapping Application");
          expect(itemTemplate.item.title).toEqual("An AGOL item");
          expect(itemTemplate.data.source).toEqual("tpl1234567890");
          done();
        },
        done.fail
      );
    });

    it("should return a list of WMA details for a valid AGOL id in a list", done => {
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
      .post(baseSvcURL + "FeatureServer?f=json", mockItems.getAGOLService(
        [mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")],
        [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]
      ))
      .post(baseSvcURL + "FeatureServer/0?f=json",
        mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer",
        [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]
      ))
      .post(baseSvcURL + "FeatureServer/1?f=json",
        mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table",
        [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]
      ));
      mSolution.getItemTemplateHierarchy(["wma1234567890"], MOCK_USER_REQOPTS)
      .then(
        (response:mInterfaces.ITemplate[]) => {
          expect(response.length).toEqual(3);
          const itemTemplate = response[0];
          expect(itemTemplate.type).toEqual("Web Mapping Application");
          expect(itemTemplate.item.title).toEqual("An AGOL item");
          expect(itemTemplate.data.source).toEqual("tpl1234567890");
          done();
        },
        done.fail
      );
    });

    it("should return a list of WMA details for a valid AGOL id in a list with more than one id", done => {
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
      .post(baseSvcURL + "FeatureServer?f=json", mockItems.getAGOLService(
        [mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")],
        [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]
      ))
      .post(baseSvcURL + "FeatureServer/0?f=json",
        mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer",
        [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]
      ))
      .post(baseSvcURL + "FeatureServer/1?f=json",
        mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table",
        [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]
      ));
      mSolution.getItemTemplateHierarchy(["wma1234567890", "svc1234567890"], MOCK_USER_REQOPTS)
      .then(
        (response:mInterfaces.ITemplate[]) => {
          expect(response.length).toEqual(3);
          const itemTemplate = response[0];
          expect(itemTemplate.type).toEqual("Web Mapping Application");
          expect(itemTemplate.item.title).toEqual("An AGOL item");
          expect(itemTemplate.data.source).toEqual("tpl1234567890");
          done();
        },
        done.fail
      );
    });

    it("should handle repeat calls without re-fetching items", done => {
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
      .post(baseSvcURL + "FeatureServer?f=json", mockItems.getAGOLService(
        [mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")],
        [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]
      ))
      .post(baseSvcURL + "FeatureServer/0?f=json",
        mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer",
        [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]
      ))
      .post(baseSvcURL + "FeatureServer/1?f=json",
        mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table",
        [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]
      ));
      mSolution.getItemTemplateHierarchy("wma1234567890", MOCK_USER_REQOPTS)
      .then(
        (response:mInterfaces.ITemplate[]) => {
          expect(response.length).toEqual(3);
          expect(fetchMock.calls("begin:https://myorg.maps.arcgis.com/").length).toEqual(9);

          mSolution.getItemTemplateHierarchy("wma1234567890", MOCK_USER_REQOPTS, response)
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
      mSolution.getItemTemplateHierarchy(null, MOCK_USER_REQOPTS)
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
      mSolution.getItemTemplateHierarchy([], MOCK_USER_REQOPTS)
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
      mSolution.getItemTemplateHierarchy([null], MOCK_USER_REQOPTS)
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
      mSolution.getItemTemplateHierarchy("fail1234567890", MOCK_USER_REQOPTS)
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
      mSolution.getItemTemplateHierarchy(["fail1234567890"], MOCK_USER_REQOPTS)
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
      .post(baseSvcURL + "FeatureServer?f=json", mockItems.getAGOLService(
        [mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")],
        [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]
      ))
      .post(baseSvcURL + "FeatureServer/0?f=json", mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer",
        [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]
      ))
      .post(baseSvcURL + "FeatureServer/1?f=json", mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table",
        [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]
      ))
      .mock("path:/sharing/rest/content/items/fail1234567890", mockItems.getAGOLItem())
      .mock("path:/sharing/rest/community/groups/fail1234567890", mockItems.getAGOLItem());
      mSolution.getItemTemplateHierarchy(["wma1234567890", "fail1234567890"], MOCK_USER_REQOPTS)
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
      mSolution.getItemTemplateHierarchy(["wma1234567890", null], MOCK_USER_REQOPTS)
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
      mSolution.getItemTemplateHierarchy(["grp1234567890"], MOCK_USER_REQOPTS)
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
      mSolution.getItemTemplateHierarchy(["wma1234567890"], MOCK_USER_REQOPTS)
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
      const replacementTemplate = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "ghi456"});

      expect(mSolution.replaceTemplate(bundle, idToFind, replacementTemplate)).toBeFalsy();
      expect(bundle.length).toEqual(0);
    });

    it("item not in bundle", () => {
      const placeholderTemplate = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "xyz098"});
      const bundle:mInterfaces.ITemplate[] = [placeholderTemplate];
      const idToFind = "abc123";
      const replacementTemplate = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "ghi456"});

      expect(mSolution.replaceTemplate(bundle, idToFind, replacementTemplate)).toBeFalsy();
      expect(bundle.length).toEqual(1);
      expect(bundle[0].itemId).toEqual(placeholderTemplate.itemId);
    });

    it("item in bundle", () => {
      const placeholderTemplate = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "xyz098"});
      const bundle:mInterfaces.ITemplate[] = [placeholderTemplate];
      const idToFind = "xyz098";
      const replacementTemplate = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "ghi456"});

      expect(mSolution.replaceTemplate(bundle, idToFind, replacementTemplate)).toBeTruthy();
      expect(bundle.length).toEqual(1);
      expect(bundle[0].itemId).toEqual(replacementTemplate.itemId);
    });

  });

});
