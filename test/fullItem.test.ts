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

import { IPagingParamsRequestOptions } from "@esri/arcgis-rest-groups";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { UserSession } from "@esri/arcgis-rest-auth";

import * as mCommon from "../src/common";
import * as mFullItem from "../src/fullItem";
import * as mInterfaces from "../src/interfaces";
import * as mGroupItemType from "../src/itemTypes/group";
import * as mWebmapItemType from "../src/itemTypes/webmap";

import { TOMORROW } from "./lib/utils";
import * as fetchMock from "fetch-mock";
import * as mockItems from "./mocks/items";

// -------------------------------------------------------------------------------------------------------------------//

describe("Module `fullItem`: fetches the item, data, and resources of an AGOL item", () => {

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;  // default is 5000 ms

  const MOCK_ITEM_PROTOTYPE:mInterfaces.ITemplate = {
    itemId: "",
    type: "",
    key: "",
    item: null
  };

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

  afterEach(() => {
    fetchMock.restore();
  });

  describe("fetch different item types", () => {
    [
      {
        id: "dash1234657890", type: "Dashboard", item: mockItems.getAGOLItem("Dashboard"),
        data: mockItems.getAGOLItemData("Dashboard"), resources: mockItems.getAGOLItemResources("none")
      },
      {
        id: "map1234657890", type: "Web Map", item: mockItems.getAGOLItem("Web Map"),
        data: mockItems.getAGOLItemData("Web Map"), resources: mockItems.getAGOLItemResources("none")
      },
      {
        id: "wma1234657890", type: "Web Mapping Application", item: mockItems.getAGOLItem("Web Mapping Application"),
        data: mockItems.getAGOLItemData("Web Mapping Application"), resources: mockItems.getAGOLItemResources("none")
      }
    ].forEach(({id, type, item, data, resources}) => {
      it("should create a " + type + " based on the AGOL response", done => {
        fetchMock
        .mock("path:/sharing/rest/content/items/" + id, item)
        .mock("path:/sharing/rest/content/items/" + id + "/data", data)
        .mock("path:/sharing/rest/content/items/" + id + "/resources", resources);

        mFullItem.getFullItem(id, MOCK_USER_REQOPTS)
        .then(response => {
          expect(fetchMock.called("path:/sharing/rest/content/items/" + id)).toEqual(true);
          expect(fetchMock.called("path:/sharing/rest/content/items/" + id + "/data")).toEqual(true);
          expect(fetchMock.called("path:/sharing/rest/content/items/" + id + "/resources")).toEqual(true);

          expect(response.type).toEqual(type);

          expect(response.item).toEqual(jasmine.anything());
          expect(Object.keys(response.item).length).toEqual(42);

          expect(response.data).toEqual(jasmine.anything());
          done();
        })
        .catch(e => fail(e));
      });
    });

    it("should create a Feature Service based on the AGOL response", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"));

      mFullItem.getFullItem("svc1234567890", MOCK_USER_REQOPTS)
      .then(response => {
        expect(fetchMock.called("path:/sharing/rest/content/items/svc1234567890")).toEqual(true);
        expect(fetchMock.called("path:/sharing/rest/content/items/svc1234567890/data")).toEqual(true);
        expect(fetchMock.called("path:/sharing/rest/content/items/svc1234567890/resources")).toEqual(true);

        expect(response.type).toEqual("Feature Service");

        expect(response.item).toEqual(jasmine.anything());
        expect(Object.keys(response.item).length).toEqual(42);

        expect(response.data).toEqual(jasmine.anything());
        done();
      })
      .catch(e => fail(e));
    });

    it("should return WMA details for a valid AGOL id", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("one text"));
      mFullItem.getFullItem("wma1234567890")
      .then(
        response => {
          expect(response.type).toEqual("Web Mapping Application");
          expect(response.item.title).toEqual("An AGOL item");
          expect(response.data.source).toEqual("tpl1234567890");
          expect(response.resources).toEqual([{ "value": "abc"}]);
          done();
        },
        done.fail
      );
    });

    it("should handle an item without a data or a resource section", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData())
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources());
      mFullItem.getFullItem("wma1234567890")
      .then(
        response => {
          expect(response.type).toEqual("Web Mapping Application");
          expect(response.item.title).toEqual("An AGOL item");
          done();
        },
        done.fail
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
      mFullItem.getFullItem("grp1234567890", MOCK_USER_REQOPTS)
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

  });

  describe("catch bad input", () => {

    it("throws an error if the item to be created fails: missing id", done => {
      fetchMock.mock("*", mockItems.getAGOLItem());
      mFullItem.getFullItem(null, MOCK_USER_REQOPTS)
      .then(
        fail,
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: null");
          done();
        }
      );
    });

    it("throws an error if the item to be created fails: inaccessible", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/fail1234567890", mockItems.getAGOLItem())
      .mock("path:/sharing/rest/community/groups/fail1234567890", mockItems.getAGOLItem());
      mFullItem.getFullItem("fail1234567890", MOCK_USER_REQOPTS)
      .then(
        fail,
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: fail1234567890");
          done();
        }
      );
    });

  });

  describe("getDependencies", () => {

    describe("dashboard", () => {

      it("without widgets", done => {
        const abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Dashboard";
        abc.data = {};
        const expected:string[] = [];

        mFullItem.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(
          response => {
            expect(response).toEqual(expected);
            done();
          },
          done.fail
        );
      });

      it("without map widget", done => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
          type: "Dashboard",
          data: {
            widgets: [{
              type: "indicatorWidget"
            }, {
              type: "listWidget"
            }]
          }
        });
        const expected:string[] = [];

        mFullItem.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(
          response => {
            expect(response).toEqual(expected);
            done();
          },
          done.fail
        );
      });

      it("with map widget", done => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
          type: "Dashboard",
          data: {
            widgets: [{
              type: "indicatorWidget"
            }, {
              type: "mapWidget",
              itemId: "def"
            }, {
              type: "listWidget"
            }]
          }
        });
        const expected:string[] = ["def"];

        mFullItem.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(
          response => {
            expect(response).toEqual(expected);
            done();
          },
          done.fail
        );
      });

    });

    describe("feature service", () => {

      it("item type does not have dependencies", done => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {type: "Feature Service"});
        const expected:string[] = [];

        mFullItem.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(
          response => {
            expect(response).toEqual(expected);
            done();
          },
          done.fail
        );
      });

    });

    describe("group", () => {

      it("group with no items", done => {
        const groupUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?" +
          "f=json&start=0&num=100&token=fake-token";
        fetchMock
        .mock(groupUrl,
          '{"total":0,"start":1,"num":0,"nextStart":-1,"items":[]}');
        const expected:string[] = [];
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {type: "Group", item: {id: 'grp1234567890'}});

        mFullItem.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(
          response => {
            expect(response).toEqual(expected);
            done();
          },
          done.fail
        );
      });

      it("group with 6 items", done => {
        const groupUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?" +
          "f=json&start=0&num=100&token=fake-token";
        fetchMock
        .mock(groupUrl,
          '{"total":6,"start":1,"num":6,"nextStart":-1,' +
          '"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"},{"id":"a4"},{"id":"a5"},{"id":"a6"}]}');
        const expected = ["a1", "a2", "a3", "a4", "a5", "a6"];
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {type: "Group", item: {id: 'grp1234567890'}});

        mFullItem.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(
          response => {
            expect(response).toEqual(expected);
            done();
          },
          done.fail
        );
      });

      it("group with error", done => {
        const groupUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
          "?f=json&start=0&num=100&token=fake-token";
        const expected = "Group does not exist or is inaccessible.";
        fetchMock
        .mock("begin:" + groupUrl,
          '{"error":{"code":400,"messageCode":"CONT_0006","message":"' + expected + '","details":[]}}');
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {type: "Group", item: {id: 'grp1234567890'}});

        mFullItem.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(
          () => {
            done.fail();
          },
          error => {
            expect(error).toEqual(expected);
            done();
          }
        );
      });

      it("group with error in second tranche", done => {
        const groupUrl = "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json";
        const expected = "Group does not exist or is inaccessible.";
        fetchMock
        .mock("begin:" + groupUrl + "&start=0&num=100&token=fake-token",
          '{"total":4,"start":1,"num":3,"nextStart":3,"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"}]}')
        .mock("begin:" + groupUrl + "&start=3&num=100&token=fake-token",
          '{"error":{"code":400,"messageCode":"CONT_0006","message":"' + expected + '","details":[]}}');
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {type: "Group", item: {id: 'grp1234567890'}});

        mFullItem.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(
          response => {
            done.fail();
          },
          error => {
            expect(error).toEqual("Group does not exist or is inaccessible.");
            done();
          }
        );
      });

    });

    describe ("webmap", () => {

      it("no data", done => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {type: "Web Map"});
        const expected:string[] = [];

        mFullItem.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(
          response => {
            expect(response).toEqual(expected);
            done();
          },
          done.fail
        );
      });

      it("one operational layer", done => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
          type: "Web Map",
          data: {
            operationalLayers: [{
              itemId: "def"
            }],
            tables: []
          }
        });
        const expected:string[] = ["def"];

        mFullItem.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(
          response => {
            expect(response).toEqual(expected);
            done();
          },
          done.fail
        );
      });

      it("two operational layers", done => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
          type: "Web Map",
          data: {
            operationalLayers: [{
              itemId: "def"
            }, {
              itemId: "ghi"
            }],
            tables: []
          }
        });
        const expected:string[] = ["def", "ghi"];

        mFullItem.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(
          response => {
            expect(response).toEqual(expected);
            done();
          },
          done.fail
        );
      });

      it("one operational layer and a table", done => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
          type: "Web Map",
          data: {
            operationalLayers: [{
              itemId: "def"
            }],
            tables: [{
              itemId: "ghi"
            }]
          }
        });
        const expected:string[] = ["def", "ghi"];

        mFullItem.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(
          response => {
            expect(response).toEqual(expected);
            done();
          },
          done.fail
        );
      });

    });

    describe("web mapping application", () => {

      it("no data", done => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {type: "Web Mapping Application"});
        const expected:string[] = [];

        mFullItem.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(
          response => {
            expect(response).toEqual(expected);
            done();
          },
          done.fail
        );
      });

      it("no data values", done => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {type: "Web Mapping Application", data: {}});
        const expected:string[] = [];

        mFullItem.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(
          response => {
            expect(response).toEqual(expected);
            done();
          },
          done.fail
        );
      });

      it("based on webmap", done => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
          type: "Web Mapping Application",
          data: {
            values: {
              webmap: "def"
            }
          }
        });
        const expected:string[] = ["def"];

        mFullItem.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(
          response => {
            expect(response).toEqual(expected);
            done();
          },
          done.fail
        );
      });

      it("based on group", done => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
          type: "Web Mapping Application",
          data: {
            values: {
              group: "def"
            }
          }
        });
        const expected:string[] = ["def"];

        mFullItem.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(
          response => {
            expect(response).toEqual(expected);
            done();
          },
          done.fail
        );
      });

    });

  });

  describe("swizzleDependencies", () => {

    const swizzles:mCommon.ISwizzleHash = {
      def: {
        id: "DEF",
        name: "'Def'",
        url: "http://services2/SVC67890"
    },
      ghi: {
        id: "GHI",
        name: "'Ghi'",
        url: "http://services2/SVC67890"
      }
    };

    describe("dashboard", () => {

      it("without widgets or swizzles", () => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {type: "Dashboard", data: {}});
        const expected = Object.assign({}, MOCK_ITEM_PROTOTYPE, {type: "Dashboard", data: {}});

        mFullItem.swizzleDependencies(abc)
        expect(abc).toEqual(expected);
      });

      it("without map widget", () => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
          type: "Dashboard",
          data: {
            widgets: [{
              type: "indicatorWidget"
            }, {
              type: "listWidget"
            }]
          }
        });
        const expected = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
          type: "Dashboard",
          data: {
            widgets: [{
              type: "indicatorWidget"
            }, {
              type: "listWidget"
            }]
          }
        });

        mFullItem.swizzleDependencies(abc, swizzles)
        expect(abc).toEqual(expected);
      });

      it("with map widget", () => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
          type: "Dashboard",
          data: {
            widgets: [{
              type: "indicatorWidget"
            }, {
              type: "mapWidget",
              itemId: "def"
            }, {
              type: "listWidget"
            }]
          }
        });
        const expected = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
          type: "Dashboard",
          data: {
            widgets: [{
              type: "indicatorWidget"
            }, {
              type: "mapWidget",
              itemId: "DEF"
            }, {
              type: "listWidget"
            }]
          }
        });

        mFullItem.swizzleDependencies(abc, swizzles)
        expect(abc).toEqual(expected);
      });

    });

    describe("feature service", () => {

      it("item type does not have dependencies", () => {
        const abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Feature Service";
        abc.dependencies = [];

        mFullItem.swizzleDependencies(abc, swizzles)
        expect(abc.dependencies).toEqual([]);
      });

    });

    describe("group", () => {

      it("group with no items", () => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {type: "Group", dependencies: []});

        mFullItem.swizzleDependencies(abc, swizzles);
        expect(abc.dependencies).toEqual([]);
      });

      it("group with 2 items", () => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
          type: "Group",
          dependencies: ["ghi", "def"]
        });

        mFullItem.swizzleDependencies(abc, swizzles);
        expect(abc.dependencies[0]).toEqual("GHI");
        expect(abc.dependencies[1]).toEqual("DEF");
      });

    });

    describe("webmap", () => {

      it("no data", () => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {type: "Web Map"});

        mFullItem.swizzleDependencies(abc, swizzles);
        expect(abc.data).toBeUndefined();
      });

      it("no operational layer or table", () => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {type: "Web Map", data: {}});
        const expected:any = {};

        mFullItem.swizzleDependencies(abc, swizzles);
        expect(abc.data).toEqual(expected);
      });

      it("one operational layer", () => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
          type: "Web Map",
          data: {
            operationalLayers: [{
              itemId: "def",
              title: "'def'",
              url: "http://services1/svc12345/0"
            }],
            tables: []
          }
        });

        mFullItem.swizzleDependencies(abc, swizzles);
        expect(abc.data.operationalLayers[0].itemId).toEqual("DEF");
        expect(abc.data.operationalLayers[0].title).toEqual("'Def'");
        expect(abc.data.operationalLayers[0].url).toEqual("http://services2/SVC67890/0");
      });

      it("two operational layers", () => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
          type: "Web Map",
          data: {
            operationalLayers: [{
              itemId: "def",
              title: "'def'",
              url: "http://services1/svc12345/0"
            }, {
              itemId: "ghi",
              title: "'ghi'",
              url: "http://services1/svc12345/1"
            }],
            tables: []
          }
        });

        mFullItem.swizzleDependencies(abc, swizzles);
        expect(abc.data.operationalLayers[0].itemId).toEqual("DEF");
        expect(abc.data.operationalLayers[0].title).toEqual("'Def'");
        expect(abc.data.operationalLayers[0].url).toEqual("http://services2/SVC67890/0");

        expect(abc.data.operationalLayers[1].itemId).toEqual("GHI");
        expect(abc.data.operationalLayers[1].title).toEqual("'Ghi'");
        expect(abc.data.operationalLayers[1].url).toEqual("http://services2/SVC67890/1");
      });

      it("one operational layer and a table", () => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
          type: "Web Map",
          data: {
            operationalLayers: [{
              itemId: "def",
              title: "'def'",
              url: "http://services1/svc12345/0"
            }],
            tables: [{
              itemId: "ghi",
              title: "'ghi'",
              url: "http://services1/svc12345/1"
            }]
          }
        });

        mFullItem.swizzleDependencies(abc, swizzles);
        expect(abc.data.operationalLayers[0].itemId).toEqual("DEF");
        expect(abc.data.operationalLayers[0].title).toEqual("'Def'");
        expect(abc.data.operationalLayers[0].url).toEqual("http://services2/SVC67890/0");

        expect(abc.data.tables[0].itemId).toEqual("GHI");
        expect(abc.data.tables[0].title).toEqual("'Ghi'");
        expect(abc.data.tables[0].url).toEqual("http://services2/SVC67890/1");
      });

      it("one operational layer and a table, but neither has swizzles", () => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
          type: "Web Map",
          data: {
            operationalLayers: [{
              itemId: "jkl",
              title: "'jkl'",
              url: "http://services1/svc12345/0"
            }],
            tables: [{
              itemId: "mno",
              title: "'mno'",
              url: "http://services1/svc12345/1"
            }]
          }
        });

        mFullItem.swizzleDependencies(abc, swizzles);
        expect(abc.data.operationalLayers[0].itemId).toEqual("jkl");
        expect(abc.data.operationalLayers[0].title).toEqual("'jkl'");
        expect(abc.data.operationalLayers[0].url).toEqual("http://services1/svc12345/0");

        expect(abc.data.tables[0].itemId).toEqual("mno");
        expect(abc.data.tables[0].title).toEqual("'mno'");
        expect(abc.data.tables[0].url).toEqual("http://services1/svc12345/1");
      });

    });

    describe("web mapping application", () => {

      it("no data", () => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {type: "Web Mapping Application"});

        mFullItem.swizzleDependencies(abc, swizzles);
        expect(abc.data).toBeUndefined();
      });

      it("no data values", () => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {type: "Web Mapping Application", data: {}});
        const expected:any = {};

        mFullItem.swizzleDependencies(abc, swizzles);
        expect(abc.data).toEqual(expected);
      });

      it("based on webmap", () => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
          type: "Web Mapping Application",
          data: {
            values: {
              webmap: "def"
            }
          }
        });

        mFullItem.swizzleDependencies(abc, swizzles);
        expect(abc.data.values.webmap).toEqual("DEF");
      });

      it("based on group", () => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
          type: "Web Mapping Application",
          data: {
            values: {
              group: "def"
            }
          }
        });

        mFullItem.swizzleDependencies(abc, swizzles);
        expect(abc.data.values.group).toEqual("DEF");
      });

      it("no webmap or group", () => {
        const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
          type: "Web Mapping Application",
          data: {
            values: {}
          }
        });
        const expected:any = {
          values: {}
        };

        mFullItem.swizzleDependencies(abc, swizzles);
        expect(abc.data).toEqual(expected);
      });

    });

  });

  describe("supporting routine: removing duplicates", () => {

    it("empty array", () => {
      const sourceArray:string[] = [];
      const expected:string[] = [];

      const results = mFullItem.removeDuplicates(sourceArray);
      expect(results).toEqual(expected);
    });

    it("no duplicates", () => {
      const sourceArray = ["a", "b", "c", "d"];
      const expected = ["a", "b", "c", "d"];

      const results = mFullItem.removeDuplicates(sourceArray);
      expect(results).toEqual(expected);
    });

    it("some duplicates", () => {
      const sourceArray = ["c", "a", "b", "b", "c", "d"];
      const expected = ["c", "a", "b", "d"];

      const results = mFullItem.removeDuplicates(sourceArray);
      expect(results).toEqual(expected);
    });

  });

  describe("supporting routine: fetching group contents", () => {
    const firstGroupTrancheUrl =
      "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=0&num=3&token=fake-token";
    const secondGroupTrancheUrl =
      "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=3&num=3&token=fake-token";
    const thirdGroupTrancheUrl =
      "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=6&num=3&token=fake-token";

    it("fewer items than fetch batch size", done => {
      const pagingRequest:IPagingParamsRequestOptions = { paging: { start: 0, num: 3 }, ...MOCK_USER_REQOPTS };
      fetchMock
      .mock(firstGroupTrancheUrl,
        '{"total":1,"start":1,"num":1,"nextStart":-1,"items":[{"id":"a1"}]}');
      const expected = ["a1"];

      mGroupItemType.getGroupContentsTranche("grp1234567890", pagingRequest)
      .then(
        response => {
          expect(response).toEqual(expected);

          const calls = fetchMock.calls(firstGroupTrancheUrl);  // => [string, fetchMock.MockRequest][]
          expect(calls.length === 1);
          expect(calls[0][0]).toEqual(firstGroupTrancheUrl);

          done();
        },
        done.fail
      );
    });

    it("same number of items as fetch batch size", done => {
      const pagingRequest:IPagingParamsRequestOptions = { paging: { start: 0, num: 3 }, ...MOCK_USER_REQOPTS };
      fetchMock
      .mock(firstGroupTrancheUrl,
        '{"total":3,"start":1,"num":3,"nextStart":-1,"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"}]}');
      const expected = ["a1", "a2", "a3"];

      mGroupItemType.getGroupContentsTranche("grp1234567890", pagingRequest)
      .then(
        response => {
          expect(response).toEqual(expected);

          const calls = fetchMock.calls(firstGroupTrancheUrl);  // => [string, fetchMock.MockRequest][]
          expect(calls.length === 1);
          expect(calls[0][0]).toEqual(firstGroupTrancheUrl);

          done();
        },
        done.fail
      );
    });

    it("one more item than fetch batch size", done => {
      const pagingRequest:IPagingParamsRequestOptions = { paging: { start: 0, num: 3 }, ...MOCK_USER_REQOPTS };
      fetchMock
      .mock(firstGroupTrancheUrl,
        '{"total":4,"start":1,"num":3,"nextStart":3,"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"}]}')
      .mock(secondGroupTrancheUrl,
        '{"total":4,"start":3,"num":1,"nextStart":-1,"items":[{"id":"a4"}]}');
      const expected = ["a1", "a2", "a3", "a4"];

      mGroupItemType.getGroupContentsTranche("grp1234567890", pagingRequest)
      .then(
        response => {
          expect(response).toEqual(expected);

          let calls = fetchMock.calls(firstGroupTrancheUrl);  // => [string, fetchMock.MockRequest][]
          expect(calls.length === 1);
          expect(calls[0][0]).toEqual(firstGroupTrancheUrl);

          calls = fetchMock.calls(secondGroupTrancheUrl);  // => [string, fetchMock.MockRequest][]
          expect(calls.length === 1);
          expect(calls[0][0]).toEqual(secondGroupTrancheUrl);

          done();
        },
        done.fail
      );
    });

    it("twice the number of items as fetch batch size", done => {
      const pagingRequest:IPagingParamsRequestOptions = { paging: { start: 0, num: 3 }, ...MOCK_USER_REQOPTS };
      fetchMock
      .mock(firstGroupTrancheUrl,
        '{"total":6,"start":1,"num":3,"nextStart":3,"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"}]}')
      .mock(secondGroupTrancheUrl,
        '{"total":6,"start":3,"num":3,"nextStart":-1,"items":[{"id":"a4"},{"id":"a5"},{"id":"a6"}]}');
      const expected = ["a1", "a2", "a3", "a4", "a5", "a6"];

      mGroupItemType.getGroupContentsTranche("grp1234567890", pagingRequest)
      .then(
        response => {
          expect(response).toEqual(expected);

          let calls = fetchMock.calls(firstGroupTrancheUrl);  // => [string, fetchMock.MockRequest][]
          expect(calls.length === 1);
          expect(calls[0][0]).toEqual(firstGroupTrancheUrl);

          calls = fetchMock.calls(secondGroupTrancheUrl);  // => [string, fetchMock.MockRequest][]
          expect(calls.length === 1);
          expect(calls[0][0]).toEqual(secondGroupTrancheUrl);

          done();
        },
        done.fail
      );
    });

    it("one more item than twice the number of items as fetch batch size", done => {
      const pagingRequest:IPagingParamsRequestOptions = { paging: { start: 0, num: 3 }, ...MOCK_USER_REQOPTS };
      fetchMock
      .mock(firstGroupTrancheUrl,
        '{"total":7,"start":1,"num":3,"nextStart":3,"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"}]}')
      .mock(secondGroupTrancheUrl,
        '{"total":7,"start":3,"num":3,"nextStart":6,"items":[{"id":"a4"},{"id":"a5"},{"id":"a6"}]}')
      .mock(thirdGroupTrancheUrl,
        '{"total":7,"start":6,"num":1,"nextStart":-1,"items":[{"id":"a7"}]}');
      const expected = ["a1", "a2", "a3", "a4", "a5", "a6", "a7"];

      mGroupItemType.getGroupContentsTranche("grp1234567890", pagingRequest)
      .then(
        response => {
          expect(response).toEqual(expected);

          let calls = fetchMock.calls(firstGroupTrancheUrl);  // => [string, fetchMock.MockRequest][]
          expect(calls.length === 1);
          expect(calls[0][0]).toEqual(firstGroupTrancheUrl);

          calls = fetchMock.calls(secondGroupTrancheUrl);  // => [string, fetchMock.MockRequest][]
          expect(calls.length === 1);
          expect(calls[0][0]).toEqual(secondGroupTrancheUrl);

          calls = fetchMock.calls(thirdGroupTrancheUrl);  // => [string, fetchMock.MockRequest][]
          expect(calls.length === 1);
          expect(calls[0][0]).toEqual(thirdGroupTrancheUrl);

          done();
        },
        done.fail
      );
    });

    it("thrice the number of items as fetch batch size", done => {
      const pagingRequest:IPagingParamsRequestOptions = { paging: { start: 0, num: 3 }, ...MOCK_USER_REQOPTS };
      fetchMock
      .mock(firstGroupTrancheUrl,
        '{"total":9,"start":1,"num":3,"nextStart":3,"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"}]}')
      .mock(secondGroupTrancheUrl,
        '{"total":9,"start":3,"num":3,"nextStart":6,"items":[{"id":"a4"},{"id":"a5"},{"id":"a6"}]}')
      .mock(thirdGroupTrancheUrl,
        '{"total":9,"start":6,"num":3,"nextStart":-1,"items":[{"id":"a7"},{"id":"a8"},{"id":"a9"}]}');
      const expected = ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9"];

      mGroupItemType.getGroupContentsTranche("grp1234567890", pagingRequest)
      .then(
        response => {
          expect(response).toEqual(expected);

          let calls = fetchMock.calls(firstGroupTrancheUrl);  // => [string, fetchMock.MockRequest][]
          expect(calls.length === 1);
          expect(calls[0][0]).toEqual(firstGroupTrancheUrl);

          calls = fetchMock.calls(secondGroupTrancheUrl);  // => [string, fetchMock.MockRequest][]
          expect(calls.length === 1);
          expect(calls[0][0]).toEqual(secondGroupTrancheUrl);

          calls = fetchMock.calls(thirdGroupTrancheUrl);  // => [string, fetchMock.MockRequest][]
          expect(calls.length === 1);
          expect(calls[0][0]).toEqual(thirdGroupTrancheUrl);

          done();
        },
        done.fail
      );
    });

    it("group with error", done => {
      const pagingRequest:IPagingParamsRequestOptions = { paging: { start: 0, num: 3 }, ...MOCK_USER_REQOPTS };
      const expected = "Group does not exist or is inaccessible.";
      fetchMock
      .mock(firstGroupTrancheUrl,
        '{"error":{"code":400,"messageCode":"CONT_0006","message":"' + expected + '","details":[]}}');

      mGroupItemType.getGroupContentsTranche("grp1234567890", pagingRequest)
      .then(
        () => {
          done.fail();
        },
        errorMessage => {
          expect(errorMessage).toEqual(expected);
          done();
        }
      );
    });

  });

  describe("supporting routine: extracting layer ids", () => {

    it("no layer list", () => {
      const sourceArray:any[] = null;
      const expected:string[] = [];

      const results = mWebmapItemType.getWebmapLayerIds(sourceArray);
      expect(results).toEqual(expected);
    });

    it("empty layer list", () => {
      const sourceArray:any[] = [];
      const expected:string[] = [];

      const results = mWebmapItemType.getWebmapLayerIds(sourceArray);
      expect(results).toEqual(expected);
    });

    it("layer without itemId", () => {
      const sourceArray:any[] = [{
        id: "abc"
      }];
      const expected:string[] = [];

      const results = mWebmapItemType.getWebmapLayerIds(sourceArray);
      expect(results).toEqual(expected);
    });

    it("layer with itemId", () => {
      const sourceArray:any[] = [{
        id: "abc",
        itemId: "ABC"
      }];
      const expected:string[] = ["ABC"];

      const results = mWebmapItemType.getWebmapLayerIds(sourceArray);
      expect(results).toEqual(expected);
    });

    it("multiple layers, one without itemId", () => {
      const sourceArray:any[] = [{
        id: "abc",
        itemId: "ABC"
      }, {
        id: "def"
      }, {
        id: "ghi",
        itemId: "GHI"
      }];
      const expected:string[] = ["ABC", "GHI"];

      const results = mWebmapItemType.getWebmapLayerIds(sourceArray);
      expect(results).toEqual(expected);
    });

  });

  describe("supporting routine: camelize", () => {

    it("empty string", () => {
      const result = mFullItem.camelize("");
      expect(result).toEqual("");
    });

    it("no spaces", () => {
      const result = mFullItem.camelize("thishasnospaces");
      expect(result).toEqual("thishasnospaces");
    });

    it("this is a title", () => {
      const result = mFullItem.camelize("this is a title");
      expect(result).toEqual("thisIsATitle");
    });

    it("this has LOTS OF CAPS", () => {
      const result = mFullItem.camelize("this has LOTS OF CAPS");
      expect(result).toEqual("thisHasLOTSOFCAPS");
    });

  });

});
