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
  convertItemToTemplate,
  createItemFromTemplate
} from "../src/velocity-processor";
import * as fetchMock from "fetch-mock";
import * as interfaces from "../../common/src/interfaces";
import * as utils from "../../common/test/mocks/utils";
import * as templates from "../../common/test/mocks/templates";
import * as agolItems from "../../common/test/mocks/agolItems";

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

afterEach(() => {
  fetchMock.restore();
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

describe("convertItemToTemplate", () => {
  it("handles Real Time Analytic", done => {
    const solutionItemId: string = "solaf0cf8bdc4fb19749cc1cbad1651b";
    const type: string = "Real Time Analytic";
    const id: string = "aaaaf0cf8bdc4fb19749cc1cbad1651b";
    const itemInfo: any = { id, type };

    fetchMock
      .get(
        `${utils.PORTAL_SUBSET.restUrl}/portals/self/subscriptioninfo?f=json&token=fake-token`,
        {
          id: "aaabbbccc",
          orgCapabilities: [
            {
              id: "velocity",
              test: false,
              level: "Advanced",
              region: "US",
              status: "active",
              endDate: 1632700800000,
              itemUnits: 0,
              computeUnits: 0,
              velocityUrl:
                "https://us-iot.arcgis.com/usadvanced00/fliptfmrv9d1divn",
              storageUnits: 0
            }
          ]
        }
      )
      .get(
        `https://us-iot.arcgis.com/usadvanced00/fliptfmrv9d1divn/iot/analytics/realtime/${id}/?f=json&token=${MOCK_USER_SESSION.token}`,
        agolItems.getAGOLItemData(type, id)
      )
      .get(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/aaaaf0cf8bdc4fb19749cc1cbad1651b?f=json&token=fake-token",
        {
          id: "aaaaf0cf8bdc4fb19749cc1cbad1651b",
          typeKeywords: []
        }
      )
      .get(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/bbb9398bcf8c4dc5a50cceaa59baf513?f=json&token=fake-token",
        {
          id: "bbb9398bcf8c4dc5a50cceaa59baf513",
          typeKeywords: []
        }
      )
      .get(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/ccc6347e0c4f4dc8909da399418cafbe?f=json&token=fake-token",
        {
          id: "ccc6347e0c4f4dc8909da399418cafbe",
          typeKeywords: []
        }
      )
      .get(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/e620910ed73b4780b5407112d8f1ce30?f=json&token=fake-token",
        {
          id: "e620910ed73b4780b5407112d8f1ce30",
          typeKeywords: ["IoTFeatureLayer"]
        }
      )
      .get(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/d17c3732ceb04e62917d9444863a6c28?f=json&token=fake-token",
        {
          id: "d17c3732ceb04e62917d9444863a6c28",
          typeKeywords: ["IoTFeatureLayer"]
        }
      );

    convertItemToTemplate(solutionItemId, itemInfo, MOCK_USER_SESSION, {}).then(
      actual => {
        expect(actual.data.outputs[0].properties["feat-lyr-new.name"]).toEqual(
          "Custom Velocity Update_{{solutionItemId}}"
        );

        expect(
          actual.data.outputs[0].properties[
            "feat-lyr-new.portal.featureServicePortalItemID"
          ]
        ).toBeUndefined();

        expect(
          actual.data.outputs[0].properties[
            "feat-lyr-new.portal.mapServicePortalItemID"
          ]
        ).toBeUndefined();

        expect(actual.dependencies.length).toEqual(3);

        expect(actual.dependencies).toContain(
          "bbb9398bcf8c4dc5a50cceaa59baf513"
        );

        expect(actual.dependencies).toContain(
          "ccc6347e0c4f4dc8909da399418cafbe"
        );

        expect(actual.dependencies).toContain(
          "aaaaf0cf8bdc4fb19749cc1cbad1651b"
        );
        done();
      }
    );
  });

  it("handles Big Data Analytic", done => {
    const solutionItemId: string = "solaf0cf8bdc4fb19749cc1cbad1651b";
    const type: string = "Big Data Analytic";
    const id: string = "aaaaf0cf8bdc4fb19749cc1cbad1651b";
    const itemInfo: any = { id, type };

    fetchMock
      .get(
        `${utils.PORTAL_SUBSET.restUrl}/portals/self/subscriptioninfo?f=json&token=fake-token`,
        {
          id: "aaabbbccc",
          orgCapabilities: [
            {
              id: "velocity",
              test: false,
              level: "Advanced",
              region: "US",
              status: "active",
              endDate: 1632700800000,
              itemUnits: 0,
              computeUnits: 0,
              velocityUrl:
                "https://us-iot.arcgis.com/usadvanced00/fliptfmrv9d1divn",
              storageUnits: 0
            }
          ]
        }
      )
      .get(
        `https://us-iot.arcgis.com/usadvanced00/fliptfmrv9d1divn/iot/analytics/bigdata/${id}/?f=json&token=${MOCK_USER_SESSION.token}`,
        agolItems.getAGOLItemData(type, id)
      )
      .get(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/ad6893904c4d4191b5c2312e60e8def7?f=json&token=fake-token",
        {
          id: "ad6893904c4d4191b5c2312e60e8def7",
          typeKeywords: []
        }
      )
      .get(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/a8d8e6ee3e7d4c889d3e95ad6a99198c?f=json&token=fake-token",
        {
          id: "a8d8e6ee3e7d4c889d3e95ad6a99198c",
          typeKeywords: []
        }
      );

    convertItemToTemplate(solutionItemId, itemInfo, MOCK_USER_SESSION, {}).then(
      actual => {
        expect(actual.dependencies).toContain(
          "ad6893904c4d4191b5c2312e60e8def7"
        );

        expect(actual.dependencies).toContain(
          "a8d8e6ee3e7d4c889d3e95ad6a99198c"
        );
        done();
      }
    );
  });

  it("handles dependency that should be removed", done => {
    const solutionItemId: string = "solaf0cf8bdc4fb19749cc1cbad1651b";
    const type: string = "Big Data Analytic";
    const id: string = "aaaaf0cf8bdc4fb19749cc1cbad1651b";
    const itemInfo: any = { id, type };

    fetchMock
      .get(
        `${utils.PORTAL_SUBSET.restUrl}/portals/self/subscriptioninfo?f=json&token=fake-token`,
        {
          id: "aaabbbccc",
          orgCapabilities: [
            {
              id: "velocity",
              test: false,
              level: "Advanced",
              region: "US",
              status: "active",
              endDate: 1632700800000,
              itemUnits: 0,
              computeUnits: 0,
              velocityUrl:
                "https://us-iot.arcgis.com/usadvanced00/fliptfmrv9d1divn",
              storageUnits: 0
            }
          ]
        }
      )
      .get(
        `https://us-iot.arcgis.com/usadvanced00/fliptfmrv9d1divn/iot/analytics/bigdata/${id}/?f=json&token=${MOCK_USER_SESSION.token}`,
        agolItems.getAGOLItemData(type, id)
      )
      .get(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/ad6893904c4d4191b5c2312e60e8def7?f=json&token=fake-token",
        {
          id: "ad6893904c4d4191b5c2312e60e8def7",
          typeKeywords: ["IoTFeatureLayer"]
        }
      )
      .get(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/a8d8e6ee3e7d4c889d3e95ad6a99198c?f=json&token=fake-token",
        {
          id: "a8d8e6ee3e7d4c889d3e95ad6a99198c",
          typeKeywords: []
        }
      );

    convertItemToTemplate(solutionItemId, itemInfo, MOCK_USER_SESSION, {}).then(
      actual => {
        expect(actual.dependencies.length).toEqual(1);

        expect(actual.dependencies).toContain(
          "a8d8e6ee3e7d4c889d3e95ad6a99198c"
        );
        done();
      }
    );
  });

  it("handles failure on getVelocityUrl", done => {
    const solutionItemId: string = "solaf0cf8bdc4fb19749cc1cbad1651b";
    const type: string = "Real Time Analytic";
    const id: string = "aaaaf0cf8bdc4fb19749cc1cbad1651b";
    const itemInfo: any = { id, type };

    fetchMock.get(
      `${utils.PORTAL_SUBSET.restUrl}/portals/self/subscriptioninfo?f=json&token=fake-token`,
      agolItems.get500Failure()
    );

    convertItemToTemplate(solutionItemId, itemInfo, MOCK_USER_SESSION, {}).then(
      () => {
        done.fail();
      },
      done
    );
  });

  it("handles org without velocity support", done => {
    const solutionItemId: string = "solaf0cf8bdc4fb19749cc1cbad1651b";
    const type: string = "Big Data Analytic";
    const id: string = "aaaaf0cf8bdc4fb19749cc1cbad1651b";
    const itemInfo: any = { id, type };

    fetchMock.get(
      `${utils.PORTAL_SUBSET.restUrl}/portals/self/subscriptioninfo?f=json&token=fake-token`,
      {
        id: "aaabbbccc",
        orgCapabilities: []
      }
    );

    convertItemToTemplate(solutionItemId, itemInfo, MOCK_USER_SESSION, {}).then(
      () => {
        done.fail();
      },
      done
    );
  });
});

describe("createItemFromTemplate", () => {
  it("handles Real Time Analytic", done => {
    const type: string = "Real Time Analytic";
    const template: interfaces.IItemTemplate = templates.getItemTemplate(
      type,
      []
    );
    const templateDictionary = {};
    templateDictionary[template.itemId] = {};
    const destinationAuthentication: interfaces.UserSession = MOCK_USER_SESSION;
    const realtimeUrl: string =
      "https://us-iot.arcgis.com/usadvanced00/fliptfmrv9d1divn/iot/analytics/realtime";
    const id: string = "aaabbbccc123";

    fetchMock
      .get(
        `${utils.PORTAL_SUBSET.restUrl}/portals/self/subscriptioninfo?f=json&token=fake-token`,
        {
          id: "aaabbbccc",
          orgCapabilities: [
            {
              id: "velocity",
              test: false,
              level: "Advanced",
              region: "US",
              status: "active",
              endDate: 1632700800000,
              itemUnits: 0,
              computeUnits: 0,
              velocityUrl:
                "https://us-iot.arcgis.com/usadvanced00/fliptfmrv9d1divn",
              storageUnits: 0
            }
          ]
        }
      )
      .get(realtimeUrl + "StatusList?view=admin", {})
      .post(realtimeUrl + "/validate/?f=json&token=fake-token", {
        validation: {
          messages: []
        },
        nodes: [
          {
            validation: {}
          }
        ]
      })
      .post(realtimeUrl, {
        id
      });

    createItemFromTemplate(
      template,
      templateDictionary,
      destinationAuthentication,
      utils.ITEM_PROGRESS_CALLBACK
    ).then(actual => {
      expect(actual.item.item.url).toEqual(`${realtimeUrl}/${id}`);
      expect(actual.item.item.title).toEqual(type);
      done();
    }, done.fail);
  });

  it("handles issue with item progress callback at start", done => {
    const type: string = "Real Time Analytic";
    const template: interfaces.IItemTemplate = templates.getItemTemplate(
      type,
      []
    );
    const templateDictionary = {};
    templateDictionary[template.itemId] = {};
    const destinationAuthentication: interfaces.UserSession = MOCK_USER_SESSION;

    createItemFromTemplate(
      template,
      templateDictionary,
      destinationAuthentication,
      utils.createFailingItemProgressCallbackOnNthCall(1)
    ).then(() => {
      done();
    }, done.fail);
  });

  it("handles issue with item progress callback at end", done => {
    const type: string = "Real Time Analytic";
    const template: interfaces.IItemTemplate = templates.getItemTemplate(
      type,
      []
    );
    template.estimatedDeploymentCostFactor = undefined;
    const templateDictionary = {};
    templateDictionary[template.itemId] = {};
    const destinationAuthentication: interfaces.UserSession = MOCK_USER_SESSION;
    const realtimeUrl: string =
      "https://us-iot.arcgis.com/usadvanced00/fliptfmrv9d1divn/iot/analytics/realtime";
    const id: string = "aaabbbccc123";

    fetchMock
      .get(
        `${utils.PORTAL_SUBSET.restUrl}/portals/self/subscriptioninfo?f=json&token=fake-token`,
        {
          id: "aaabbbccc",
          orgCapabilities: [
            {
              id: "velocity",
              test: false,
              level: "Advanced",
              region: "US",
              status: "active",
              endDate: 1632700800000,
              itemUnits: 0,
              computeUnits: 0,
              velocityUrl:
                "https://us-iot.arcgis.com/usadvanced00/fliptfmrv9d1divn",
              storageUnits: 0
            }
          ]
        }
      )
      .get(realtimeUrl + "StatusList?view=admin", {})
      .post(realtimeUrl + "/validate/?f=json&token=fake-token", {
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
      })
      .post(realtimeUrl, {
        id
      })
      .post(
        `${utils.PORTAL_SUBSET.restUrl}/content/users/casey/items/aaabbbccc123/delete`,
        agolItems.get200Success()
      );

    createItemFromTemplate(
      template,
      templateDictionary,
      destinationAuthentication,
      utils.createFailingItemProgressCallbackOnNthCall(2)
    ).then(() => {
      done();
    }, done.fail);
  });

  it("handles issue with removeItem", done => {
    const type: string = "Real Time Analytic";
    const template: interfaces.IItemTemplate = templates.getItemTemplate(
      type,
      []
    );
    template.estimatedDeploymentCostFactor = undefined;
    const templateDictionary = {};
    templateDictionary[template.itemId] = {};
    const destinationAuthentication: interfaces.UserSession = MOCK_USER_SESSION;
    const realtimeUrl: string =
      "https://us-iot.arcgis.com/usadvanced00/fliptfmrv9d1divn/iot/analytics/realtime";
    const id: string = "aaabbbccc123";

    fetchMock
      .get(
        `${utils.PORTAL_SUBSET.restUrl}/portals/self/subscriptioninfo?f=json&token=fake-token`,
        {
          id: "aaabbbccc",
          orgCapabilities: [
            {
              id: "velocity",
              test: false,
              level: "Advanced",
              region: "US",
              status: "active",
              endDate: 1632700800000,
              itemUnits: 0,
              computeUnits: 0,
              velocityUrl:
                "https://us-iot.arcgis.com/usadvanced00/fliptfmrv9d1divn",
              storageUnits: 0
            }
          ]
        }
      )
      .get(realtimeUrl + "StatusList?view=admin", {})
      .post(realtimeUrl + "/validate/?f=json&token=fake-token", {
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
      })
      .post(realtimeUrl, {
        id
      })
      .post(
        `${utils.PORTAL_SUBSET.restUrl}/content/users/casey/items/aaabbbccc123/delete`,
        agolItems.get400Failure()
      );

    createItemFromTemplate(
      template,
      templateDictionary,
      destinationAuthentication,
      utils.createFailingItemProgressCallbackOnNthCall(2)
    ).then(() => {
      done();
    }, done.fail);
  });

  it("handles org without velocity support", done => {
    const type: string = "Real Time Analytic";
    const template: interfaces.IItemTemplate = templates.getItemTemplate(
      type,
      []
    );
    const templateDictionary = {};
    templateDictionary[template.itemId] = {};
    const destinationAuthentication: interfaces.UserSession = MOCK_USER_SESSION;
    const realtimeUrl: string =
      "https://us-iot.arcgis.com/usadvanced00/fliptfmrv9d1divn/iot/analytics/realtime";
    const id: string = "aaabbbccc123";

    fetchMock.get(
      `${utils.PORTAL_SUBSET.restUrl}/portals/self/subscriptioninfo?f=json&token=fake-token`,
      {
        id: "aaabbbccc",
        orgCapabilities: []
      }
    );

    createItemFromTemplate(
      template,
      templateDictionary,
      destinationAuthentication,
      utils.ITEM_PROGRESS_CALLBACK
    ).then(() => done.fail, done);
  });
});
