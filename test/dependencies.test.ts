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

import * as fetchMock from "fetch-mock";
import * as dependencies from "../src/dependencies";
import { IFullItem } from "../src/fullItem";
import { IPagingParamsRequestOptions } from "@esri/arcgis-rest-groups";
import { UserSession } from "@esri/arcgis-rest-auth";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { TOMORROW } from "./lib/utils";
import { doesNotReject } from 'assert';

//--------------------------------------------------------------------------------------------------------------------//

describe("Module `dependencies`: managing dependencies of an item", () => {

  const MOCK_ITEM_PROTOTYPE:IFullItem = {
    type: "",
    item: {}
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

  afterEach(() => {
    fetchMock.restore();
  });

  describe("getDependencies", () => {

    describe("dashboard", () => {

      it("without widgets", done => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Dashboard";
        abc.data = {};
        let expected:string[] = [];

        dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(response => {
          expect(response).toEqual(expected);
          done();
        });
      });

      it("without map widget", done => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Dashboard";
        abc.data = {
          widgets: [{
            type: "indicatorWidget"
          }, {
            type: "listWidget"
          }]
        };
        let expected:string[] = [];

        dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(response => {
          expect(response).toEqual(expected);
          done();
        });
      });

      it("with map widget", done => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Dashboard";
        abc.data = {
          widgets: [{
            type: "indicatorWidget"
          }, {
            type: "mapWidget",
            itemId: "def"
          }, {
            type: "listWidget"
          }]
        };
        let expected:string[] = ["def"];

        dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(response => {
          expect(response).toEqual(expected);
          done();
        });
      });

    });

    describe("feature service", () => {

      it("item type does not have dependencies", done => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Feature Service";

        let expected:string[] = [];

        dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(response => {
          expect(response).toEqual(expected);
          done();
        });
      });

    });

    describe("group", () => {

      it("group with no items", done => {
        let groupUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?" +
          "f=json&start=0&num=100&token=fake-token";
        fetchMock
        .mock(groupUrl,
          '{"total":0,"start":1,"num":0,"nextStart":-1,"items":[]}', {});
        let expected:string[] = [];

        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Group";
        abc.item.id = "grp1234567890";

        dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(response => {
          expect(response).toEqual(expected);
          done();
        });
      });

      it("group with 6 items", done => {
        let groupUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?" +
          "f=json&start=0&num=100&token=fake-token";
        fetchMock
        .mock(groupUrl,
          '{"total":6,"start":1,"num":6,"nextStart":-1,' +
          '"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"},{"id":"a4"},{"id":"a5"},{"id":"a6"}]}', {});
        let expected = ["a1", "a2", "a3", "a4", "a5", "a6"];

        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Group";
        abc.item.id = "grp1234567890";

        dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(response => {
          expect(response).toEqual(expected);
          done();
        });
      });

      it("group with error", done => {
        let groupUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
          "?f=json&start=0&num=100&token=fake-token";
        let expected = "Group does not exist or is inaccessible.";
        fetchMock
        .mock("begin:" + groupUrl,
          '{"error":{"code":400,"messageCode":"CONT_0006","message":"' + expected + '","details":[]}}', {});

        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Group";
        abc.item.id = "grp1234567890";

        dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
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
        let groupUrl = "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json";
        let expected = "Group does not exist or is inaccessible.";
        fetchMock
        .mock("begin:" + groupUrl + "&start=0&num=100&token=fake-token",
          '{"total":4,"start":1,"num":3,"nextStart":3,"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"}]}', {})
        .mock("begin:" + groupUrl + "&start=3&num=100&token=fake-token",
          '{"error":{"code":400,"messageCode":"CONT_0006","message":"' + expected + '","details":[]}}', {});

        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Group";
        abc.item.id = "grp1234567890";

        dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
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
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Web Map";
        let expected:string[] = [];

        dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(response => {
          expect(response).toEqual(expected);
          done();
        });
      });

      it("one operational layer", done => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Web Map";
        abc.data = {
          operationalLayers: [{
            itemId: "def"
          }],
          tables: []
        };
        let expected:string[] = ["def"];

        dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(response => {
          expect(response).toEqual(expected);
          done();
        });
      });

      it("two operational layers", done => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Web Map";
        abc.data = {
          operationalLayers: [{
            itemId: "def"
          }, {
            itemId: "ghi"
          }],
          tables: []
        };
        let expected:string[] = ["def", "ghi"];

        dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(response => {
          expect(response).toEqual(expected);
          done();
        });
      });

      it("one operational layer and a table", done => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Web Map";
        abc.data = {
          operationalLayers: [{
            itemId: "def"
          }],
          tables: [{
            itemId: "ghi"
          }]
        };
        let expected:string[] = ["def", "ghi"];

        dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(response => {
          expect(response).toEqual(expected);
          done();
        });
      });

    });

    describe("web mapping application", () => {

      it("no data", done => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Web Mapping Application";
        let expected:string[] = [];

        dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(response => {
          expect(response).toEqual(expected);
          done();
        });
      });

      it("no data values", done => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Web Mapping Application";
        abc.data = {};
        let expected:string[] = [];

        dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(response => {
          expect(response).toEqual(expected);
          done();
        });
      });

      it("based on webmap", done => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Web Mapping Application";
        abc.data = {
          values: {
            webmap: "def"
          }
        };
        let expected:string[] = ["def"];

        dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(response => {
          expect(response).toEqual(expected);
          done();
        });
      });

      it("based on group", done => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Web Mapping Application";
        abc.data = {
          values: {
            group: "def"
          }
        };
        let expected:string[] = ["def"];

        dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
        .then(response => {
          expect(response).toEqual(expected);
          done();
        });
      });

    });

  });

  describe("swizzleDependencies", () => {

    let swizzles:dependencies.ISwizzleHash = {
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

      it("without widgets", () => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Dashboard";
        abc.data = {};
        let expected = {...MOCK_ITEM_PROTOTYPE};
        expected.type = "Dashboard";
        expected.data = {};

        dependencies.swizzleDependencies(abc, swizzles)
        expect(abc).toEqual(expected);
      });

      it("without map widget", () => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Dashboard";
        abc.data = {
          widgets: [{
            type: "indicatorWidget"
          }, {
            type: "listWidget"
          }]
        };
        let expected = {...MOCK_ITEM_PROTOTYPE};
        expected.type = "Dashboard";
        expected.data = {
          widgets: [{
            type: "indicatorWidget"
          }, {
            type: "listWidget"
          }]
        };

        dependencies.swizzleDependencies(abc, swizzles)
        expect(abc).toEqual(expected);
      });

      it("with map widget", () => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Dashboard";
        abc.data = {
          widgets: [{
            type: "indicatorWidget"
          }, {
            type: "mapWidget",
            itemId: "def"
          }, {
            type: "listWidget"
          }]
        };
        let expected = {...MOCK_ITEM_PROTOTYPE};
        expected.type = "Dashboard";
        expected.data = {
          widgets: [{
            type: "indicatorWidget"
          }, {
            type: "mapWidget",
            itemId: "DEF"
          }, {
            type: "listWidget"
          }]
        };

        dependencies.swizzleDependencies(abc, swizzles)
        expect(abc).toEqual(expected);
      });

    });

    describe("feature service", () => {

      it("item type does not have dependencies", () => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Feature Service";
        abc.dependencies = [];

        dependencies.swizzleDependencies(abc, swizzles)
        expect(abc.dependencies).toEqual([]);
      });

    });

    describe("group", () => {

      it("group with no items", () => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Group";
        abc.dependencies = [];

        dependencies.swizzleDependencies(abc, swizzles);
        expect(abc.dependencies).toEqual([]);
      });

      it("group with 2 items", () => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Group";
        abc.dependencies = ["ghi", "def"];

        dependencies.swizzleDependencies(abc, swizzles);
        expect(abc.dependencies[0]).toEqual("GHI");
        expect(abc.dependencies[1]).toEqual("DEF");
      });

    });

    describe("webmap", () => {

      it("no data", () => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Web Map";

        dependencies.swizzleDependencies(abc, swizzles);
        expect(abc.data).toBeUndefined();
      });

      it("no operational layer or table", () => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Web Map";
        abc.data = {};
        let expected:any = {};

        dependencies.swizzleDependencies(abc, swizzles);
        expect(abc.data).toEqual(expected);
      });

      it("one operational layer", () => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Web Map";
        abc.data = {
          operationalLayers: [{
            itemId: "def",
            title: "'def'",
            url: "http://services1/svc12345/0"
          }],
          tables: []
        };

        dependencies.swizzleDependencies(abc, swizzles);
        expect(abc.data.operationalLayers[0].itemId).toEqual("DEF");
        expect(abc.data.operationalLayers[0].title).toEqual("'Def'");
        expect(abc.data.operationalLayers[0].url).toEqual("http://services2/SVC67890/0");
      });

      it("two operational layers", () => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Web Map";
        abc.data = {
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
        };

        dependencies.swizzleDependencies(abc, swizzles);
        expect(abc.data.operationalLayers[0].itemId).toEqual("DEF");
        expect(abc.data.operationalLayers[0].title).toEqual("'Def'");
        expect(abc.data.operationalLayers[0].url).toEqual("http://services2/SVC67890/0");

        expect(abc.data.operationalLayers[1].itemId).toEqual("GHI");
        expect(abc.data.operationalLayers[1].title).toEqual("'Ghi'");
        expect(abc.data.operationalLayers[1].url).toEqual("http://services2/SVC67890/1");
      });

      it("one operational layer and a table", () => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Web Map";
        abc.data = {
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
        };

        dependencies.swizzleDependencies(abc, swizzles);
        expect(abc.data.operationalLayers[0].itemId).toEqual("DEF");
        expect(abc.data.operationalLayers[0].title).toEqual("'Def'");
        expect(abc.data.operationalLayers[0].url).toEqual("http://services2/SVC67890/0");

        expect(abc.data.tables[0].itemId).toEqual("GHI");
        expect(abc.data.tables[0].title).toEqual("'Ghi'");
        expect(abc.data.tables[0].url).toEqual("http://services2/SVC67890/1");
      });

      it("one operational layer and a table, but neither has swizzles", () => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Web Map";
        abc.data = {
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
        };

        dependencies.swizzleDependencies(abc, swizzles);
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
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Web Mapping Application";

        dependencies.swizzleDependencies(abc, swizzles);
        expect(abc.data).toBeUndefined();
      });

      it("no data values", () => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Web Mapping Application";
        abc.data = {};
        let expected:any = {};

        dependencies.swizzleDependencies(abc, swizzles);
        expect(abc.data).toEqual(expected);
      });

      it("based on webmap", () => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Web Mapping Application";
        abc.data = {
          values: {
            webmap: "def"
          }
        };
        let expected = {...MOCK_ITEM_PROTOTYPE};
        expected.type = "Dashboard";
        expected.data = {
          widgets: [{
            type: "indicatorWidget"
          }, {
            type: "listWidget"
          }]
        };

        dependencies.swizzleDependencies(abc, swizzles);
        expect(abc.data.values.webmap).toEqual("DEF");
      });

      it("based on group", () => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Web Mapping Application";
        abc.data = {
          values: {
            group: "def"
          }
        };

        dependencies.swizzleDependencies(abc, swizzles);
        expect(abc.data.values.group).toEqual("DEF");
      });

      it("no webmap or group", () => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Web Mapping Application";
        abc.data = {
          values: {}
        };
        let expected:any = {
          values: {}
        };

        dependencies.swizzleDependencies(abc, swizzles);
        expect(abc.data).toEqual(expected);
      });

    });

  });

  describe("supporting routine: removing duplicates", () => {

    it("empty array", () => {
      let sourceArray:string[] = [];
      let expected:string[] = [];

      let results = dependencies.removeDuplicates(sourceArray);
      expect(results).toEqual(expected);
    });

    it("no duplicates", () => {
      let sourceArray = ["a", "b", "c", "d"];
      let expected = ["a", "b", "c", "d"];

      let results = dependencies.removeDuplicates(sourceArray);
      expect(results).toEqual(expected);
    });

    it("some duplicates", () => {
      let sourceArray = ["c", "a", "b", "b", "c", "d"];
      let expected = ["c", "a", "b", "d"];

      let results = dependencies.removeDuplicates(sourceArray);
      expect(results).toEqual(expected);
    });

  });

  describe("supporting routine: fetching group contents", () => {
    let firstGroupTrancheUrl =
      "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=0&num=3&token=fake-token";
    let secondGroupTrancheUrl =
      "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=3&num=3&token=fake-token";
    let thirdGroupTrancheUrl =
      "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=6&num=3&token=fake-token";

    it("fewer items than fetch batch size", done => {
      let pagingRequest:IPagingParamsRequestOptions = { paging: { start: 0, num: 3 }, ...MOCK_USER_REQOPTS };
      fetchMock
      .mock(firstGroupTrancheUrl,
        '{"total":1,"start":1,"num":1,"nextStart":-1,"items":[{"id":"a1"}]}', {});
      let expected = ["a1"];

      dependencies.getGroupContentsTranche("grp1234567890", pagingRequest)
      .then(response => {
        expect(response).toEqual(expected);

        let calls = fetchMock.calls(firstGroupTrancheUrl);  // => [string, fetchMock.MockRequest][]
        expect(calls.length === 1);
        expect(calls[0][0]).toEqual(firstGroupTrancheUrl);

        done();
      });
    });

    it("same number of items as fetch batch size", done => {
      let pagingRequest:IPagingParamsRequestOptions = { paging: { start: 0, num: 3 }, ...MOCK_USER_REQOPTS };
      fetchMock
      .mock(firstGroupTrancheUrl,
        '{"total":3,"start":1,"num":3,"nextStart":-1,"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"}]}', {});
      let expected = ["a1", "a2", "a3"];

      dependencies.getGroupContentsTranche("grp1234567890", pagingRequest)
      .then(response => {
        expect(response).toEqual(expected);

        let calls = fetchMock.calls(firstGroupTrancheUrl);  // => [string, fetchMock.MockRequest][]
        expect(calls.length === 1);
        expect(calls[0][0]).toEqual(firstGroupTrancheUrl);

        done();
      });
    });

    it("one more item than fetch batch size", done => {
      let pagingRequest:IPagingParamsRequestOptions = { paging: { start: 0, num: 3 }, ...MOCK_USER_REQOPTS };
      fetchMock
      .mock(firstGroupTrancheUrl,
        '{"total":4,"start":1,"num":3,"nextStart":3,"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"}]}', {})
      .mock(secondGroupTrancheUrl,
        '{"total":4,"start":3,"num":1,"nextStart":-1,"items":[{"id":"a4"}]}', {});
      let expected = ["a1", "a2", "a3", "a4"];

      dependencies.getGroupContentsTranche("grp1234567890", pagingRequest)
      .then(response => {
        expect(response).toEqual(expected);

        let calls = fetchMock.calls(firstGroupTrancheUrl);  // => [string, fetchMock.MockRequest][]
        expect(calls.length === 1);
        expect(calls[0][0]).toEqual(firstGroupTrancheUrl);

        calls = fetchMock.calls(secondGroupTrancheUrl);  // => [string, fetchMock.MockRequest][]
        expect(calls.length === 1);
        expect(calls[0][0]).toEqual(secondGroupTrancheUrl);

        done();
      });
    });

    it("twice the number of items as fetch batch size", done => {
      let pagingRequest:IPagingParamsRequestOptions = { paging: { start: 0, num: 3 }, ...MOCK_USER_REQOPTS };
      fetchMock
      .mock(firstGroupTrancheUrl,
        '{"total":6,"start":1,"num":3,"nextStart":3,"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"}]}', {})
      .mock(secondGroupTrancheUrl,
        '{"total":6,"start":3,"num":3,"nextStart":-1,"items":[{"id":"a4"},{"id":"a5"},{"id":"a6"}]}', {});
      let expected = ["a1", "a2", "a3", "a4", "a5", "a6"];

      dependencies.getGroupContentsTranche("grp1234567890", pagingRequest)
      .then(response => {
        expect(response).toEqual(expected);

        let calls = fetchMock.calls(firstGroupTrancheUrl);  // => [string, fetchMock.MockRequest][]
        expect(calls.length === 1);
        expect(calls[0][0]).toEqual(firstGroupTrancheUrl);

        calls = fetchMock.calls(secondGroupTrancheUrl);  // => [string, fetchMock.MockRequest][]
        expect(calls.length === 1);
        expect(calls[0][0]).toEqual(secondGroupTrancheUrl);

        done();
      });
    });

    it("one more item than twice the number of items as fetch batch size", done => {
      let pagingRequest:IPagingParamsRequestOptions = { paging: { start: 0, num: 3 }, ...MOCK_USER_REQOPTS };
      fetchMock
      .mock(firstGroupTrancheUrl,
        '{"total":7,"start":1,"num":3,"nextStart":3,"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"}]}', {})
      .mock(secondGroupTrancheUrl,
        '{"total":7,"start":3,"num":3,"nextStart":6,"items":[{"id":"a4"},{"id":"a5"},{"id":"a6"}]}', {})
      .mock(thirdGroupTrancheUrl,
        '{"total":7,"start":6,"num":1,"nextStart":-1,"items":[{"id":"a7"}]}', {});
      let expected = ["a1", "a2", "a3", "a4", "a5", "a6", "a7"];

      dependencies.getGroupContentsTranche("grp1234567890", pagingRequest)
      .then(response => {
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
      });
    });

    it("thrice the number of items as fetch batch size", done => {
      let pagingRequest:IPagingParamsRequestOptions = { paging: { start: 0, num: 3 }, ...MOCK_USER_REQOPTS };
      fetchMock
      .mock(firstGroupTrancheUrl,
        '{"total":9,"start":1,"num":3,"nextStart":3,"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"}]}', {})
      .mock(secondGroupTrancheUrl,
        '{"total":9,"start":3,"num":3,"nextStart":6,"items":[{"id":"a4"},{"id":"a5"},{"id":"a6"}]}', {})
      .mock(thirdGroupTrancheUrl,
        '{"total":9,"start":6,"num":3,"nextStart":-1,"items":[{"id":"a7"},{"id":"a8"},{"id":"a9"}]}', {});
      let expected = ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9"];

      dependencies.getGroupContentsTranche("grp1234567890", pagingRequest)
      .then(response => {
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
      });
    });

    it("group with error", done => {
      let pagingRequest:IPagingParamsRequestOptions = { paging: { start: 0, num: 3 }, ...MOCK_USER_REQOPTS };
      let expected = "Group does not exist or is inaccessible.";
      fetchMock
      .mock(firstGroupTrancheUrl,
        '{"error":{"code":400,"messageCode":"CONT_0006","message":"' + expected + '","details":[]}}', {});

      dependencies.getGroupContentsTranche("grp1234567890", pagingRequest)
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
      let sourceArray:any[] = null;
      let expected:string[] = [];

      let results = dependencies.getWebmapLayerIds(sourceArray);
      expect(results).toEqual(expected);
    });

    it("empty layer list", () => {
      let sourceArray:any[] = [];
      let expected:string[] = [];

      let results = dependencies.getWebmapLayerIds(sourceArray);
      expect(results).toEqual(expected);
    });

    it("layer without itemId", () => {
      let sourceArray:any[] = [{
        id: "abc"
      }];
      let expected:string[] = [];

      let results = dependencies.getWebmapLayerIds(sourceArray);
      expect(results).toEqual(expected);
    });

    it("layer with itemId", () => {
      let sourceArray:any[] = [{
        id: "abc",
        itemId: "ABC"
      }];
      let expected:string[] = ["ABC"];

      let results = dependencies.getWebmapLayerIds(sourceArray);
      expect(results).toEqual(expected);
    });

    it("multiple layers, one without itemId", () => {
      let sourceArray:any[] = [{
        id: "abc",
        itemId: "ABC"
      }, {
        id: "def"
      }, {
        id: "ghi",
        itemId: "GHI"
      }];
      let expected:string[] = ["ABC", "GHI"];

      let results = dependencies.getWebmapLayerIds(sourceArray);
      expect(results).toEqual(expected);
    });

  });

});