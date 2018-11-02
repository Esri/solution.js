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
import { IItemHash } from "../src/fullItemHierarchy";
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

});