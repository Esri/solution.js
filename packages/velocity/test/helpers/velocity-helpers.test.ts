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
  cleanDataSourcesAndFeeds,
  getVelocityUrl,
  postVelocityData,
  _updateFeed,
  _updateDataOutput,
  _validateOutputs,
  _getOutputLabel,
  getUniqueTitle
} from "../../src/helpers/velocity-helpers";
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

describe("getVelocityUrl", () => {
  it("gets standard url with suffix", done => {
    const velocityUrl: string =
      "https://us-iot.arcgis.com/usadvanced00/aaaatfmrv9d1divn";
    const expected: string = `${velocityUrl}/iot/feed/ABC123/suffix/?f=json&token=fake-token`;
    const templateDictionary: any = {
      velocityUrl
    };
    getVelocityUrl(
      MOCK_USER_SESSION,
      templateDictionary,
      "Feed",
      "ABC123",
      false,
      "",
      "suffix"
    ).then(actual => {
      expect(actual).toEqual(expected);
      done();
    }, done.fail);
  });
});

describe("postVelocityData", () => {
  it("supports autoStart", done => {
    const velocityUrl: string =
      "https://us-iot.arcgis.com/usadvanced00/aaaatfmrv9d1divn";
    const realtimeUrl: string =
      `${velocityUrl}/iot/analytics/realtime`;

    const type: string = "Real Time Analytic";
    const id: string = "aaabbbccc123";
    const template: interfaces.IItemTemplate = templates.getItemTemplate(
      type,
      []
    );
    const data: any = template.data;
    delete data.outputs;
    const feeds: any = data.feeds;
    delete data.feeds;
    data.feed = feeds[0];
    data.feed.properties["simulator.portalItemId"] = data.feed.id;
    delete data.feed.id;
    delete data.feed.label;

    const templateDictionary: any = {
      velocityUrl
    };
    templateDictionary[template.itemId] = {};

    const startUrl: string = `${realtimeUrl}/${id}/start/?f=json&token=fake-token`;

    const validateResults: any = {
      id: "",
      validation: {
        messages: []
      },
      nodes: [],
      executable: false
    };

    fetchMock
      .get(
        `${realtimeUrl}StatusList?view=admin`,
        {}
      )
      .post(
        `${realtimeUrl}/validate/${id}/?f=json&token=fake-token`,
        validateResults
      )
      .post(realtimeUrl, { id }
      )
      .post(
        `${realtimeUrl}/validate/?f=json&token=fake-token`,
        validateResults
      )
      .get(startUrl, {});

    postVelocityData(
      MOCK_USER_SESSION,
      template,
      data,
      templateDictionary,
      true
    ).then(() => {
      done();
    }, done.fail);
  });

  it("handles non executable in autoStart", done => {
    const velocityUrl: string =
      "https://us-iot.arcgis.com/usadvanced00/aaaatfmrv9d1divn";
    const realtimeUrl: string =
      "https://us-iot.arcgis.com/usadvanced00/aaaatfmrv9d1divn/iot/analytics/realtime";
    const type: string = "Real Time Analytic";
    const id: string = "aaabbbccc123";
    const template: interfaces.IItemTemplate = templates.getItemTemplate(
      type,
      []
    );
    const data: any = template.data;
    delete data.outputs;
    delete data.feeds[0].id;
    delete data.feeds[1].id;
    const templateDictionary: any = {
      velocityUrl
    };
    templateDictionary[template.itemId] = {};

    const startUrl: string = `${realtimeUrl}/${id}/start/?f=json&token=fake-token`;

    const validateResults: any = {
      id: "",
      validation: {
        messages: []
      },
      nodes: [],
      executable: false
    };

    fetchMock
      .get(`${realtimeUrl}StatusList?view=admin`, ["A"])
      .post(
        `${realtimeUrl}/validate/${id}/?f=json&token=fake-token`,
        validateResults
      )
      .post(
        `${realtimeUrl}/validate/?f=json&token=fake-token`,
        validateResults
      )
      .post(realtimeUrl, {
        id
      })
      .get(startUrl, {});

    postVelocityData(
      MOCK_USER_SESSION,
      template,
      data,
      templateDictionary,
      true
    ).then(() => {
      done();
    }, done.fail);
  });

  it("name errors", done => {
    const velocityUrl: string =
      "https://us-iot.arcgis.com/usadvanced00/aaaatfmrv9d1divn";
    const realtimeUrl: string =
      "https://us-iot.arcgis.com/usadvanced00/aaaatfmrv9d1divn/iot/analytics/realtime";
    const type: string = "Real Time Analytic";
    const id: string = "aaabbbccc123";
    const template: interfaces.IItemTemplate = templates.getItemTemplate(
      type,
      []
    );
    const data: any = template.data;
    const outputs = data.outputs;
    delete(data.outputs);
    data.output = outputs[0];
    delete(data.feeds);
    const templateDictionary: any = {
      velocityUrl
    };
    templateDictionary[template.itemId] = {};

    const startUrl: string = `${realtimeUrl}/${id}/start/?f=json&token=fake-token`;

    fetchMock
      .get(realtimeUrl + "StatusList?view=admin", {})
      .post(realtimeUrl + `/validate/${id}/?f=json&token=fake-token`, {
        executable: true,
        validation: {
          messages: [
            {
              key:
                "VALIDATION_ANALYTICS__MULTIPLE_CREATE_FEATURE_LAYER_OUTPUTS_REFERENCE_SAME_LAYER_NAME",
              args: [type]
            }
          ]
        },
        nodes: [
          {
            validation: {
              messages: []
            }
          }
        ]
      })
      .postOnce(
        "https://us-iot.arcgis.com/usadvanced00/aaaatfmrv9d1divn/iot/analytics/realtime/validate/?f=json&token=fake-token",
        {
          executable: true,
          validation: {
            messages: [
              {
                key:
                  "VALIDATION_ANALYTICS__MULTIPLE_CREATE_FEATURE_LAYER_OUTPUTS_REFERENCE_SAME_LAYER_NAME",
                args: [type]
              }
            ]
          },
          nodes: [
            {
              validation: {
                messages: []
              }
            }
          ]
        },
        { overwriteRoutes: false }
      )
      .postOnce(
        "https://us-iot.arcgis.com/usadvanced00/aaaatfmrv9d1divn/iot/analytics/realtime/validate/?f=json&token=fake-token",
        {
          executable: true,
          validation: {
            messages: []
          },
          nodes: [
            {
              validation: {
                messages: []
              }
            }
          ]
        },
        { overwriteRoutes: false }
      )
      .post(realtimeUrl, {
        id
      })
      .get(startUrl, {});

    postVelocityData(
      MOCK_USER_SESSION,
      template,
      data,
      templateDictionary,
      true
    ).then(() => {
      done();
    }, done.fail);
  });

  it("name errors on feeds", done => {
    const velocityUrl: string =
      "https://us-iot.arcgis.com/usadvanced00/aaaatfmrv9d1divn";
    const realtimeUrl: string =
      "https://us-iot.arcgis.com/usadvanced00/aaaatfmrv9d1divn/iot/analytics/realtime";
    const type: string = "Real Time Analytic";
    const id: string = "aaabbbccc123";
    const template: interfaces.IItemTemplate = templates.getItemTemplate(
      type,
      []
    );
    const data: any = template.data;
    //const outputs = data.outputs;
    delete(data.outputs);
    //data.output = outputs[0];
    //delete(data.feeds);
    const templateDictionary: any = {
      velocityUrl
    };
    templateDictionary[template.itemId] = {};

    const startUrl: string = `${realtimeUrl}/${id}/start/?f=json&token=fake-token`;

    const statusList = [
      {
        "label": type,
        "id": "b1f40dfb69d94a96ac5127dc6d4b01cc",
        "status": "stopped",
        "avgRateIn": 0,
        "executionMode": "direct",
        "executable": true,
        "startTime": 1634932075739,
        "lastStartTime": 1634928915641
      }
    ];

    fetchMock
      .get(realtimeUrl + "StatusList?view=admin", statusList)
      .post(realtimeUrl + `/validate/${id}/?f=json&token=fake-token`, {
        executable: true,
        validation: {
          messages: [
            {
              key:
                "VALIDATION_ANALYTICS__MULTIPLE_CREATE_FEATURE_LAYER_OUTPUTS_REFERENCE_SAME_LAYER_NAME",
              args: [type]
            }
          ]
        },
        nodes: [
          {
            validation: {
              messages: []
            }
          }
        ]
      })
      .postOnce(
        "https://us-iot.arcgis.com/usadvanced00/aaaatfmrv9d1divn/iot/analytics/realtime/validate/?f=json&token=fake-token",
        {
          executable: true,
          validation: {
            messages: [
              {
                key:
                  "VALIDATION_ANALYTICS__MULTIPLE_CREATE_FEATURE_LAYER_OUTPUTS_REFERENCE_SAME_LAYER_NAME",
                args: [type]
              }
            ]
          },
          nodes: [
            {
              validation: {
                messages: []
              }
            }
          ]
        },
        { overwriteRoutes: false }
      )
      .postOnce(
        "https://us-iot.arcgis.com/usadvanced00/aaaatfmrv9d1divn/iot/analytics/realtime/validate/?f=json&token=fake-token",
        {
          executable: true,
          validation: {
            messages: []
          },
          nodes: [
            {
              validation: {
                messages: []
              }
            }
          ]
        },
        { overwriteRoutes: false }
      )
      .post(realtimeUrl, {
        id
      })
      .get(startUrl, {});

    postVelocityData(
      MOCK_USER_SESSION,
      template,
      data,
      templateDictionary,
      true
    ).then(() => {
      done();
    }, done.fail);
  });
});

describe("_validateOutputs", () => {
  it("can handle no data outputs or feeds", done => {
    const expected: any = { asIs: "asIs" };
    const type: string = "Real Time Analytic";
    _validateOutputs(
      MOCK_USER_SESSION,
      {},
      type,
      expected,
      []
    ).then(actual => {
      expect(actual).toEqual(expected);
      done();
    }, done.fail);
  });
});

describe("_updateDataOutput", () => {
  it("supports autoStart", () => {
    const dataOutputs: any[] = [
      {
        name: "A",
        label: "A",
        id: "ABC123"
      }
    ];
    const data: any = {
      outputs: [
        {
          name: "A",
          label: "A",
          id: "ABC123",
          properties: { "A.name": "A" }
        }
      ]
    };
    const names: string[] = ["A"];
    _updateDataOutput(dataOutputs, data, names);

    expect(data.outputs[0].properties["A.name"]).toEqual("A 1");
  });

  it("supports single output", () => {
    const dataOutputs: any[] = [
      {
        name: "A",
        label: "A",
        id: "ABC123"
      }
    ];
    const data: any = {
      output: {
        name: "A",
        label: "A",
        id: "ABC123",
        properties: { "A.name": "A" }
      }
    };
    const names: string[] = ["A"];
    _updateDataOutput(dataOutputs, data, names);

    expect(data.output.properties["A.name"]).toEqual("A 1");
  });

  it("supports missing data options", () => {
    const dataOutputs: any[] = [
      {
        name: "A",
        label: "A",
        id: "ABC123"
      }
    ];
    const data: any = {
      label: "AB"
    };
    const names: string[] = ["A"];
    _updateDataOutput(dataOutputs, data, names);

    expect(data.label).toEqual("AB");
  });
});

describe("_updateFeed", () => {
  it("will update the label", () => {
    const feeds: any[] = [
      {
        name: "AB",
        label: "AB",
        id: "ABC123"
      }
    ];
    const data: any = {
      feeds: [
        {
          name: "AB",
          label: "AB",
          id: "ABC123",
          properties: { "AB.name": "AB" }
        }
      ]
    };
    const names: string[] = ["AB"];
    _updateFeed(feeds, data, names);

    expect(feeds[0].name).toEqual("AB 1");
  });
});

describe("getUniqueTitle", () => {
  it("handles invalid path", () => {
    const title = "A";
    const templateDictionary = {};
    const path = "label";
    const actual = getUniqueTitle(title, templateDictionary, path);
    expect(actual).toEqual("A");
  });

  it("handles empty title", () => {
    const title = "";
    const templateDictionary = {
      ABC123: [
        {
          title: "A"
        }
      ]
    };
    const path = "ABC123";
    const actual = getUniqueTitle(title, templateDictionary, path);
    expect(actual).toEqual("_");
  });
});

describe("cleanDataSourcesAndFeeds", () => {
  it("can handle missing dataSources, feeds, and outputs", () => {
    const type = "Real Time Analytic";
    const template = templates.getItemTemplate(type, []);
    delete template.data.sources;
    delete template.data.feeds;
    delete template.data.outputs;
    cleanDataSourcesAndFeeds(template, "");
    expect(template.dependencies.length).toEqual(0);
  });

  it("can handle single dataSource, feed, and output", () => {
    const type = "Real Time Analytic";
    const template = templates.getItemTemplate(type, []);

    template.data.source = template.data.sources[0];
    const sourceId: string = "aaa9398bcf8c4dc5a50cceaa59baf513";
    template.data.source.properties["feature-layer.portalItemId"] = sourceId;
    delete template.data.sources;

    template.data.feed = template.data.feeds[0];
    const feedId: string = "bbb9398bcf8c4dc5a50cceaa59baf513";
    template.data.feed.id = feedId;
    template.data.feed.properties = {
      "simulator.url": "http://velocityUrl/someservice"
    };
    delete template.data.feeds;

    template.data.output = template.data.outputs[0];
    const outputId: string = "ccc9398bcf8c4dc5a50cceaa59baf513";
    delete(template.data.output.name);
    template.data.output.properties["feat-lyr-new.portal.featureServicePortalItemID"] = outputId;
    delete template.data.outputs;

    const velocityUrl: string = "http://velocityUrl";

    cleanDataSourcesAndFeeds(template, velocityUrl);
    expect(template.data.source.properties["feature-layer.portalItemId"]).toBeUndefined();
    expect(template.data.output.properties["feat-lyr-new.portal.featureServicePortalItemID"]).toBeUndefined();
  });
});
