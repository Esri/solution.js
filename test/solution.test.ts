/* Copyright (c) 2018 Esri
 * Apache-2.0 */

import * as fetchMock from "fetch-mock";
import { CustomArrayLikeMatchers, CustomMatchers } from './customMatchers';

import { Solution } from "../src/solution";
import { AgolItem } from "../src/agolItem";

import { UserSession } from "@esri/arcgis-rest-auth";
import { TOMORROW } from "./lib/utils";
import { IItemHash } from '../src/clone';

/*
describe("supporting Solution item", () => {

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

  const MOCK_USER_REQOPTS = {
    authentication: MOCK_USER_SESSION
  };

  beforeEach(() => {
    jasmine.addMatchers(CustomMatchers);
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("sorts an item and its dependencies 1", () => {
    let abc = new AgolItem({});
    let def = new AgolItem({});
    let ghi = new AgolItem({});

    abc.dependencies = ["ghi", "def"];

    let results:string[] = Solution.topologicallySortItems({
      "abc": abc,
      "def": def,
      "ghi": ghi,
    });
    expect(results.length).toEqual(3);
    (expect(results) as CustomArrayLikeMatchers).toHaveOrder({predecessor: "ghi", successor: "abc"});
    (expect(results) as CustomArrayLikeMatchers).toHaveOrder({predecessor: "def", successor: "abc"});
  });

  it("sorts an item and its dependencies 2", () => {
    let abc = new AgolItem({});
    let def = new AgolItem({});
    let ghi = new AgolItem({});

    abc.dependencies = ["ghi", "def"];
    def.dependencies = ["ghi"];

    let results:string[] = Solution.topologicallySortItems({
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
    let abc = new AgolItem({});
    let def = new AgolItem({});
    let ghi = new AgolItem({});

    abc.dependencies = ["ghi"];
    ghi.dependencies = ["def"];

    let results:string[] = Solution.topologicallySortItems({
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
    let abc = new AgolItem({});
    let def = new AgolItem({});
    let ghi = new AgolItem({});

    abc.dependencies = ["ghi"];
    def.dependencies = ["ghi"];
    ghi.dependencies = ["abc"];

    expect(function () {
      let results:string[] = Solution.topologicallySortItems({
        "abc": abc,
        "def": def,
        "ghi": ghi,
      });
    }).toThrowError(Error, "Cyclical dependency graph detected");
  });

  it("reports a single-item cyclic dependency graph", () => {
    let abc = new AgolItem({});
    let def = new AgolItem({});
    let ghi = new AgolItem({});

    def.dependencies = ["def"];

    expect(function () {
      let results:string[] = Solution.topologicallySortItems({
        "abc": abc,
        "def": def,
        "ghi": ghi,
      });
    }).toThrowError(Error, "Cyclical dependency graph detected");
  });

});
*/