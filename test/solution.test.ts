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

import * as solution from "../src/solution";
import { IFullItem } from "../src/fullItem";
import { ISwizzleHash } from "../src/dependencies";

import { UserSession } from "@esri/arcgis-rest-auth";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

import { TOMORROW, setMockDateTime, createRuntimeMockUserSession } from "./lib/utils";
import { CustomArrayLikeMatchers, CustomMatchers } from './customMatchers';
import * as fetchMock from "fetch-mock";
import * as mockItems from "./mocks/items";
import * as mockServices from "./mocks/featureServices";
import * as mockSolutions from "./mocks/solutions";

//--------------------------------------------------------------------------------------------------------------------//

describe("Module `solution`: generation, publication, and cloning of a solution item", () => {

  const MOCK_ITEM_PROTOTYPE:IFullItem = {
    type: "",
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

  beforeEach(() => {
    jasmine.addMatchers(CustomMatchers);
  });

  afterEach(() => {
    fetchMock.restore();
    jasmine.clock().uninstall();
  });

  xdescribe("create solution", () => {

    it("for single item containing WMA & feature service", done => {
      let baseSvcURL = "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"), {})
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"), {})
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"), {})
      .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"), {})
      .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"), {})
      .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"), {})
      .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"), {})
      .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"), {})
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"), {})
      .post(baseSvcURL + "FeatureServer?f=json", mockServices.getService(
        [mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer")],
        [mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table")]
      ))
      .post(baseSvcURL + "FeatureServer/0?f=json", mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer",
        mockServices.getRelationship(0, 1, "esriRelRoleOrigin")
      ))
      .post(baseSvcURL + "FeatureServer/1?f=json", mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table",
        mockServices.getRelationship(0, 0, "esriRelRoleDestination")
      ))
      solution.createSolution("wma1234567890", MOCK_USER_REQOPTS)
      .then(
        response => {
          expect(response).toEqual(mockSolutions.getWebMappingApplicationSolution());
          done();
        },
        error => {
          done.fail(error);
        }
      );
    });

    it("for single item not containing WMA or feature service", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/grp1234567890", mockItems.getAGOLItem(), {})
      .mock("path:/sharing/rest/community/groups/grp1234567890", mockItems.getAGOLGroup(), {})
      .mock(
        "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
        "?f=json&start=0&num=100&token=fake-token",
        '{"total":0,"start":1,"num":0,"nextStart":-1,"items":[]}', {});
      solution.createSolution("grp1234567890", MOCK_USER_REQOPTS)
      .then(
        response => {
          expect(response).toEqual(mockSolutions.getGroupSolutionPart());
          done();
        },
        error => {
          done.fail(error);
        }
      );
    });

    it("gets a service name from a layer if a service needs a name", done => {
      let fullItem:solution.IFullItemFeatureService = {
        type: "Feature Service",
        item: mockItems.getNoNameFeatureServiceItem(),
        data: mockItems.getAGOLItemData("Feature Service"),
        service: null,
        layers: null,
        tables: null
      };
      fetchMock
      .post(fullItem.item.url + "?f=json", mockServices.getService(
        [mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer")],
        [mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table")]
      ))
      .post(fullItem.item.url + "/0?f=json", mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer",
        mockServices.getRelationship(0, 1, "esriRelRoleOrigin")
      ))
      .post(fullItem.item.url + "/1?f=json", mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table",
        mockServices.getRelationship(0, 0, "esriRelRoleDestination")
      ));
      solution.fleshOutFeatureService(fullItem, MOCK_USER_REQOPTS)
      .then(
        () => {
          expect(fullItem.service.name).toEqual(mockServices.getService(
            [mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer")],
            [mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table")]
          ).layers[0].name);
          done();
        }
      );
    });

    it("gets a service name from a table if a service needs a name--no layer", done => {
      let fullItem:solution.IFullItemFeatureService = {
        type: "Feature Service",
        item: mockItems.getNoNameFeatureServiceItem(),
        data: mockItems.getAGOLItemData("Feature Service"),
        service: null,
        layers: null,
        tables: null
      };
      fetchMock
      .post(fullItem.item.url + "?f=json", mockServices.getService(
        undefined,
        [mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table")]
      ))
      .post(fullItem.item.url + "/0?f=json", mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer",
        mockServices.getRelationship(0, 1, "esriRelRoleOrigin")
      ))
      .post(fullItem.item.url + "/1?f=json", mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table",
        mockServices.getRelationship(0, 0, "esriRelRoleDestination")
      ));
      solution.fleshOutFeatureService(fullItem, MOCK_USER_REQOPTS)
      .then(
        () => {
          expect(fullItem.service.name).toEqual(mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table",
            mockServices.getRelationship(0, 0, "esriRelRoleDestination")
          ).name);
          done();
        }
      );
    });

    it("gets a service name from a table if a service needs a name--nameless layer", done => {
      let fullItem:solution.IFullItemFeatureService = {
        type: "Feature Service",
        item: mockItems.getNoNameFeatureServiceItem(),
        data: mockItems.getAGOLItemData("Feature Service"),
        service: null,
        layers: null,
        tables: null
      };
      fetchMock
      .post(fullItem.item.url + "?f=json", mockServices.getService(
        mockServices.removeNameField([mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer")]),
        [mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table")]
      ))
      .post(fullItem.item.url + "/0?f=json", mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer",
        mockServices.getRelationship(0, 1, "esriRelRoleOrigin")
      ))
      .post(fullItem.item.url + "/1?f=json", mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table",
        mockServices.getRelationship(0, 0, "esriRelRoleDestination")
      ));
      solution.fleshOutFeatureService(fullItem, MOCK_USER_REQOPTS)
      .then(
        () => {
          expect(fullItem.service.name).toEqual(mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table",
            mockServices.getRelationship(0, 0, "esriRelRoleDestination")
          ).name);
          done();
        }
      );
    });

    it("falls back to 'Feature Service' if a service needs a name", done => {
      let fullItem:solution.IFullItemFeatureService = {
        type: "Feature Service",
        item: mockItems.getNoNameFeatureServiceItem(),
        data: mockItems.getAGOLItemData("Feature Service"),
        service: null,
        layers: null,
        tables: null
      };
      fetchMock
      .post(fullItem.item.url + "?f=json", mockServices.getService(
        mockServices.removeNameField([mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer")]),
        mockServices.removeNameField([mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table")])
      ))
      .post(fullItem.item.url + "/0?f=json", mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer",
        mockServices.getRelationship(0, 1, "esriRelRoleOrigin")
      ))
      .post(fullItem.item.url + "/1?f=json", mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table",
        mockServices.getRelationship(0, 0, "esriRelRoleDestination")
      ));
      solution.fleshOutFeatureService(fullItem, MOCK_USER_REQOPTS)
      .then(
        () => {
          expect(fullItem.service.name).toEqual("Feature Service");
          done();
        }
      );
    });

  });

  xdescribe("publish solution", () => {

    it("for single item containing WMA & feature service", done => {
      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"sln1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/sln1234567890/update",
        '{"success":true,"id":"sln1234567890"}')
      .post("path:/sharing/rest/content/users/casey/items/sln1234567890/share",
        '{"notSharedWith":[],"itemId":"sln1234567890"}');
      solution.publishSolution("My Solution", mockSolutions.getWebMappingApplicationSolution(), "public", MOCK_USER_REQOPTS)
      .then(
        response => {
          expect(response).toEqual({
            "success": true,
            "id": "sln1234567890"
          });
          done();
        },
        error => {
          done.fail(error);
        }
      );
    });

    it("for single item containing WMA & feature service, but item add fails", done => {
      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"error":{"code":400,"messageCode":"CONT_0113","message":"Item type not valid.","details":[]}}');
      solution.publishSolution("My Solution", mockSolutions.getWebMappingApplicationSolution(), "public", MOCK_USER_REQOPTS)
      .then(
        () => done.fail(),
        errorMsg => {
          expect(errorMsg).toEqual("Item type not valid.");
          done();
        }
      );
    });

    it("for single item containing WMA & feature service, but data add fails", done => {
      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"sln1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/sln1234567890/update",
      '{"error":{"code":400,"messageCode":"CONT_0001","message":"Item does not exist or is inaccessible.","details":[]}}');
      solution.publishSolution("My Solution", mockSolutions.getWebMappingApplicationSolution(), "public", MOCK_USER_REQOPTS)
      .then(
        () => done.fail(),
        errorMsg => {
          expect(errorMsg).toEqual("Item does not exist or is inaccessible.");
          done();
        }
      );
    });

    it("for single item containing WMA & feature service, but share fails", done => {
      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"sln1234567890","folder":null}')
      .post("path:/sharing/rest/content/users/casey/items/sln1234567890/update",
        '{"success":true,"id":"sln1234567890"}')
      .post("path:/sharing/rest/content/users/casey/items/sln1234567890/share",
        '{"error":{"code":400,"messageCode":"CONT_0001","message":"Item does not exist or is inaccessible.","details":[]}}');
      solution.publishSolution("My Solution", mockSolutions.getWebMappingApplicationSolution(), "public", MOCK_USER_REQOPTS)
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

  });

  describe("supporting routine: create item", () => {

    it("should create a Dashboard", done => {
      let fullItem:IFullItem = mockSolutions.getItemSolutionPart("Dashboard");
      let folderId:string = null;
      let swizzleKey = fullItem.data.widgets[0].itemId as string;
      let swizzleValue = (fullItem.data.widgets[0].itemId as string).toUpperCase();
      let swizzles:ISwizzleHash = {};
      swizzles[swizzleKey] = {id: swizzleValue};
      let orgSession:solution.IOrgSession = {
        orgUrl: "https://myOrg.maps.arcgis.com",
        portalUrl: "https://www.arcgis.com",
        ...MOCK_USER_REQOPTS
      };

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"sln1234567890","folder":null}');
      solution.createItem(fullItem, folderId, swizzles, orgSession)
      .then(
        createdItemId => {
          expect(createdItemId).toEqual("sln1234567890");
          expect(fullItem.data.widgets[0].itemId as string).toEqual(swizzleValue);
          done();
        },
        () => done.fail()
      );
    });

    it("should create a mapless Dashboard", done => {
      let fullItem:IFullItem = mockSolutions.getDashboardSolutionPartNoWidgets();
      let folderId:string = null;
      let swizzles:ISwizzleHash = {};
      let orgSession:solution.IOrgSession = {
        orgUrl: "https://myOrg.maps.arcgis.com",
        portalUrl: "https://www.arcgis.com",
        ...MOCK_USER_REQOPTS
      };

      fetchMock
      .post("path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"sln1234567890","folder":null}');
      solution.createItem(fullItem, folderId, swizzles, orgSession)
      .then(
        createdItemId => {
          expect(createdItemId).toEqual("sln1234567890");
          done();
        },
        () => done.fail()
      );
    });

    it("should create a Feature Service", done => {
      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      let fullItem:IFullItem = mockSolutions.getItemSolutionPart("Feature Service");
      let folderId:string = "fld1234567890";
      let swizzles:ISwizzleHash = {};

      let now = 1555555555555;
      let orgSession:solution.IOrgSession = {
        orgUrl: "https://myOrg.maps.arcgis.com",
        portalUrl: "https://www.arcgis.com",
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      // Feature layer indices are assigned incrementally as they are added to the feature service
      let layerNumUpdater = (function () {
          var layerNum = 0;
          return () => layerNum++;
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
      solution.createItem(fullItem, folderId, swizzles, orgSession)
      .then(
        createdItemId => {
          // Check that we're appending a timestamp to the service name
          let createServiceCall = fetchMock.calls("path:/sharing/rest/content/users/casey/createService");
          let createServiceCallBody = createServiceCall[0][1].body as string;
          expect(createServiceCallBody.indexOf("name%22%3A%22ROWPermits_publiccomment_1555555555555%22%2C"))
            .toBeGreaterThan(0);

          expect(createdItemId).toEqual("svc1234567890");
          done();
        },
        () => done.fail()
      );
    });

    it("should handle an error while trying to create a Feature Service", done => {
      let fullItem:IFullItem = mockSolutions.getItemSolutionPart("Feature Service");
      fullItem.item.url = null;
      expect(mockSolutions.getItemSolutionPart("Feature Service").item.url).toEqual("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer");

      let folderId:string = "fld1234567890";
      let swizzles:ISwizzleHash = {};

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      let now = 1555555555555;
      let orgSession:solution.IOrgSession = {
        orgUrl: "https://myOrg.maps.arcgis.com",
        portalUrl: "https://www.arcgis.com",
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      fetchMock
      .post("path:/sharing/rest/content/users/casey/createService",
        '{"success":false}');
      solution.createItem(fullItem, folderId, swizzles, orgSession)
      .then(
        () => done.fail(),
        errorMsg => {
          expect(errorMsg).toEqual('Unable to create Feature Service: {"success":false}');
          done();
        }
      );
    });

    /*
    xit("should create an empty Group", done => {});

    xit("should create a Group and add its members", done => {});

    xit("should handle a member-add failure while trying to create a Group", done => {});

    xit("should create a Web Mapping Application", done => {});

    xit("should handle an item creation failure while trying to create a Web Mapping Application", done => {});

    xit("should handle a URL update failure while trying to create a Web Mapping Application", done => {});
    */

  });

  describe("supporting routine: get cloning order", () => {

    it("sorts an item and its dependencies 1", () => {
      let abc = {...MOCK_ITEM_PROTOTYPE};
      let def = {...MOCK_ITEM_PROTOTYPE};
      let ghi = {...MOCK_ITEM_PROTOTYPE};

      abc.dependencies = ["ghi", "def"];

      let results:string[] = solution.topologicallySortItems({
        "abc": abc,
        "def": def,
        "ghi": ghi,
      });
      expect(results.length).toEqual(3);
      (expect(results) as CustomArrayLikeMatchers).toHaveOrder({predecessor: "ghi", successor: "abc"});
      (expect(results) as CustomArrayLikeMatchers).toHaveOrder({predecessor: "def", successor: "abc"});
    });

    it("sorts an item and its dependencies 2", () => {
      let abc = {...MOCK_ITEM_PROTOTYPE};
      let def = {...MOCK_ITEM_PROTOTYPE};
      let ghi = {...MOCK_ITEM_PROTOTYPE};

      abc.dependencies = ["ghi", "def"];
      def.dependencies = ["ghi"];

      let results:string[] = solution.topologicallySortItems({
        "abc": abc,
        "def": def,
        "ghi": ghi,
      });
      expect(results.length).toEqual(3);
      (expect(results) as CustomArrayLikeMatchers).toHaveOrder({predecessor: "ghi", successor: "abc"});
      (expect(results) as CustomArrayLikeMatchers).toHaveOrder({predecessor: "def", successor: "abc"});
      (expect(results) as CustomArrayLikeMatchers).toHaveOrder({predecessor: "ghi", successor: "def"});
    });

    it("sorts an item and its dependencies 3", () => {
      let abc = {...MOCK_ITEM_PROTOTYPE};
      let def = {...MOCK_ITEM_PROTOTYPE};
      let ghi = {...MOCK_ITEM_PROTOTYPE};

      abc.dependencies = ["ghi"];
      ghi.dependencies = ["def"];

      let results:string[] = solution.topologicallySortItems({
        "abc": abc,
        "def": def,
        "ghi": ghi,
      });
      expect(results.length).toEqual(3);
      (expect(results) as CustomArrayLikeMatchers).toHaveOrder({predecessor: "ghi", successor: "abc"});
      (expect(results) as CustomArrayLikeMatchers).toHaveOrder({predecessor: "def", successor: "abc"});
      (expect(results) as CustomArrayLikeMatchers).toHaveOrder({predecessor: "def", successor: "ghi"});
    });

    it("reports a multi-item cyclic dependency graph", () => {
      let abc = {...MOCK_ITEM_PROTOTYPE};
      let def = {...MOCK_ITEM_PROTOTYPE};
      let ghi = {...MOCK_ITEM_PROTOTYPE};

      abc.dependencies = ["ghi"];
      def.dependencies = ["ghi"];
      ghi.dependencies = ["abc"];

      expect(function () {
        let results:string[] = solution.topologicallySortItems({
          "abc": abc,
          "def": def,
          "ghi": ghi,
        });
      }).toThrowError(Error, "Cyclical dependency graph detected");
    });

    it("reports a single-item cyclic dependency graph", () => {
      let abc = {...MOCK_ITEM_PROTOTYPE};
      let def = {...MOCK_ITEM_PROTOTYPE};
      let ghi = {...MOCK_ITEM_PROTOTYPE};

      def.dependencies = ["def"];

      expect(function () {
        let results:string[] = solution.topologicallySortItems({
          "abc": abc,
          "def": def,
          "ghi": ghi,
        });
      }).toThrowError(Error, "Cyclical dependency graph detected");
    });

  });

  describe("supporting routine: remove undesirable properties", () => {

    it("remove properties", () => {
      let abc = mockItems.getAGOLItem("Web Mapping Application");

      let abcCopy = solution.removeUndesirableItemProperties(abc);
      expect(abc).toEqual(mockItems.getAGOLItem("Web Mapping Application"));
      expect(abcCopy).toEqual(mockItems.getTrimmedAGOLItem());
    });

    it("shallow copy if properties already removed", () => {
      let abc = mockItems.getTrimmedAGOLItem();

      let abcCopy = solution.removeUndesirableItemProperties(abc);
      expect(abc).toEqual(mockItems.getTrimmedAGOLItem());
      expect(abcCopy).toEqual(mockItems.getTrimmedAGOLItem());

      abcCopy.id = "WMA123";
      expect(abc.id).toEqual("wma1234567890");
    });

    it("checks for item before attempting to access its properties", () => {
      let result = solution.removeUndesirableItemProperties(null);
      expect(result).toBeNull();
    });

  });

  describe("supporting routine: timestamp", () => {

    it("should return time 1541440408000", () => {
      let expected = 1541440408000;
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(expected));
      expect(solution.getTimestamp()).toEqual(expected.toString());
      jasmine.clock().uninstall();
    });

  });

  describe("supporting routine: update WMA URL", () => {

    let orgSession:solution.IOrgSession = {
      orgUrl: "https://myOrg.maps.arcgis.com",
      portalUrl: "https://www.arcgis.com",
      ...MOCK_USER_REQOPTS
    };

    let abc = {...MOCK_ITEM_PROTOTYPE};
    abc.item = mockItems.getAGOLItem("Web Mapping Application");
    abc.item.url = solution.aPlaceholderServerName + "/apps/CrowdsourcePolling/index.html?appid=";

    it("success", done => {
      fetchMock
      .post("https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/wma1234567890/update",
      '{"success":true,"id":"wma1234567890"}');
      solution.updateWebMappingApplicationURL(abc, orgSession)
      .then(response => {
        expect(response).toEqual("wma1234567890");
        done();
      });
    });

    it("failure", done => {
      fetchMock
      .post("https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/wma1234567890/update",
      "Unable to update web mapping app: wma1234567890");
      solution.updateWebMappingApplicationURL(abc, orgSession)
      .then(
        fail,
        error => {
          expect(error).toEqual("Unable to update web mapping app: wma1234567890");
          done();
        }
      );
    });

  });

});
