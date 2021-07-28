/** @license
 * Copyright 2021 Esri
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

import {
  getVelocityDependencies,
  _getDatasourceDependencies
} from "../../src/helpers/get-velocity-dependencies";
import * as interfaces from "../../../common/src/interfaces";
import * as fetchMock from "fetch-mock";
import * as templates from "../../../common/test/mocks/templates";
import * as utils from "../../../common/test/mocks/utils";

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

afterEach(() => {
  fetchMock.restore();
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

describe("getVelocityDependencies", () => {
  it("handles misssing sources and feeds", () => {
    const type = "Real Time Analytic";
    const template = templates.getItemTemplate(type, []);
    template.data.source = template.data.sources[0];
    delete template.data.sources;
    template.data.feed = template.data.feeds[0];
    delete template.data.feeds;
    const actual = getVelocityDependencies(template);
    expect(actual.length).toEqual(1);
  });

  it("handles misssing source and feed", () => {
    const type = "Real Time Analytic";
    const template = templates.getItemTemplate(type, []);
    delete template.data.source;
    delete template.data.feeds[0].id;
    delete template.data.feed;
    const actual = getVelocityDependencies(template);
    expect(actual.length).toEqual(2);
  });

  it("handles misssing portalItemId", () => {
    const type = "Real Time Analytic";
    const template = templates.getItemTemplate(type, []);
    delete template.data.source;
    delete template.data.feeds[0].id;
    delete template.data.feed;
    const actual = getVelocityDependencies(template);
    expect(actual.length).toEqual(2);
  });
});

describe("_getDatasourceDependencies", () => {
  it("handles missing portralItemId", () => {
    const type = "Real Time Analytic";
    const template = templates.getItemTemplate(type, []);
    const dataSources = template.data.sources;
    delete dataSources[0].properties;
    const deps: string[] = [];
    _getDatasourceDependencies(dataSources, deps);
    expect(deps.length).toEqual(0);
  });
});
