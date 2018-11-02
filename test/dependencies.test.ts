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

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;  // default is 5000 ms

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

  });

  describe("getDependencies", () => {

    describe("webmap", () => {

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

    describe("webmap", () => {

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
        expect(abc.data.operationalLayers[1].itemId).toEqual("GHI");
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
        expect(abc.data.tables[0].itemId).toEqual("GHI");
      });

    });

    describe("web mapping application", () => {

      it("based on webmap", () => {
        let abc = {...MOCK_ITEM_PROTOTYPE};
        abc.type = "Web Mapping Application";
        abc.data = {
          values: {
            webmap: "def"
          }
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

    });

  });

});