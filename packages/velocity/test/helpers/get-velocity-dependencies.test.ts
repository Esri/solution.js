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
  _getDependencies
} from "../../src/helpers/get-velocity-dependencies";
import * as interfaces from "../../../common/src/interfaces";
import * as fetchMock from "fetch-mock";
import * as templates from "../../../common/test/mocks/templates";
import * as utils from "../../../common/test/mocks/utils";
import * as agolItems from "../../../common/test/mocks/agolItems";

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

afterEach(() => {
  fetchMock.restore();
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

describe("getVelocityDependencies", () => {
  it("handles standalone source, feed, and output", done => {
    const type = "Real Time Analytic";
    const template = templates.getItemTemplate(type, []);

    template.data.source = template.data.sources[0];
    const sourceId: string = "aaa9398bcf8c4dc5a50cceaa59baf513";
    template.data.source.properties["feature-layer.portalItemId"] = sourceId;
    delete template.data.sources;

    template.data.feed = template.data.feeds[0];
    const feedId: string = "bbb9398bcf8c4dc5a50cceaa59baf513";
    template.data.feed.id = feedId;
    delete template.data.feeds;

    template.data.output = template.data.outputs[0];
    const outputId: string = "ccc9398bcf8c4dc5a50cceaa59baf513";
    template.data.output.properties["feat-lyr-new.portal.featureServicePortalItemID"] = outputId;
    delete template.data.outputs;

    fetchMock
      .get(
        `https://myorg.maps.arcgis.com/sharing/rest/content/items/${feedId}?f=json&token=fake-token`,
        agolItems.getAGOLItem(type, feedId)
      )
      .get(
        `https://myorg.maps.arcgis.com/sharing/rest/content/items/${sourceId}?f=json&token=fake-token`,
        agolItems.getAGOLItem(type, sourceId)
      )
      .get(
        `https://myorg.maps.arcgis.com/sharing/rest/content/items/${outputId}?f=json&token=fake-token`,
        agolItems.getAGOLItem(type, outputId)
      );

    getVelocityDependencies(template, MOCK_USER_SESSION).then(actual => {
      expect(actual.length).toEqual(3);
      done();
    }, done.fail);
  });

  it("handles misssing sources and feeds", done => {
    const type = "Real Time Analytic";
    const template = templates.getItemTemplate(type, []);
    delete template.data.sources;
    delete template.data.feeds;
    delete template.data.outputs;
    getVelocityDependencies(template, MOCK_USER_SESSION).then(actual => {
      expect(actual.length).toEqual(0);
      done();
    }, done.fail);
  });

  it("handles misssing portalItemId", done => {
    const type = "Real Time Analytic";
    const template = templates.getItemTemplate(type, []);
    delete template.data.source;
    delete template.data.feeds[0].id;
    delete template.data.feed;

    fetchMock
      .get(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/%7B%7Bccc6347e0c4f4dc8909da399418cafbe.itemId%7D%7D?f=json&token=fake-token",
        {
          id: "ccc6347e0c4f4dc8909da399418cafbe",
          typeKeywords: []
        }
      )
      .get(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/%7B%7Baaaaf0cf8bdc4fb19749cc1cbad1651b.itemId%7D%7D?f=json&token=fake-token",
        {
          id: "aaaaf0cf8bdc4fb19749cc1cbad1651b",
          typeKeywords: []
        }
      );
    getVelocityDependencies(template, MOCK_USER_SESSION).then(actual => {
      expect(actual.length).toEqual(2);
      done();
    }, done.fail);
  });
});

describe("_getDependencies", () => {
  it("handles missing portralItemId", () => {
    const type = "Real Time Analytic";
    const template = templates.getItemTemplate(type, []);
    const dataSources = template.data.sources;
    delete dataSources[0].properties;
    const deps: string[] = [];
    _getDependencies(dataSources, deps);
    expect(deps.length).toEqual(0);
  });

  it("handles missing name", () => {
    const type = "Real Time Analytic";
    const template = templates.getItemTemplate(type, []);
    const dataSources = template.data.sources;
    delete(dataSources[0].name);
    dataSources[0].properties = {
      "feat-lyr-new.portalItemId":
        "aaaaf0cf8bdc4fb19749cc1cbad1651b",
      "feature-layer.outSR": "4326"
    }
    const deps: string[] = [];
    _getDependencies(dataSources, deps);
    expect(deps.length).toEqual(1);
  });
});
