/** @license
 * Copyright 2020 Esri
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

import { refineWebAppTemplate } from "../../src/webapp/refine-webapp-template";
import { webappTemplate } from "./fixtures/webappTemplate";
import * as common from "@esri/solution-common";
import * as fetchMock from "fetch-mock";
import * as mockItems from "@esri/solution-common/test/mocks/agolItems";
let MOCK_USER_SESSION: common.UserSession;

describe("webapp :: refine-webapp-template ::", () => {
  let webappTemplateExample: any;
  beforeEach(() => {
    webappTemplateExample = common.cloneObject(webappTemplate);
  });

  afterEach(() => {
    fetchMock.restore();
  });
  it("just webmap data", done => {
    const model = {
      itemId: "itm1234567890",
      type: "Web Mapping Application",
      key: "abcdefgh",
      item: { title: "Voting Centers" } as any,
      data: {
        appItemId: "myAppItemId",
        values: {
          webmap: "myMapId"
        },
        map: {
          appProxy: {
            mapItemId: "mapItemId"
          },
          itemId: "mapItemId"
        }
      },
      resources: [] as any[],
      dependencies: [] as string[],
      groups: [] as string[],
      properties: {} as any,
      estimatedDeploymentCostFactor: 0
    };
    const expected = {
      itemId: "itm1234567890",
      type: "Web Mapping Application",
      key: "abcdefgh",
      item: { title: "Voting Centers" } as any,
      data: {
        appItemId: "{{itm1234567890.itemId}}",
        values: {
          webmap: "{{myMapId.itemId}}"
        },
        map: {
          appProxy: {
            mapItemId: "{{mapItemId.itemId}}"
          },
          itemId: "{{mapItemId.itemId}}"
        }
      },
      resources: [] as any[],
      dependencies: ["myMapId"],
      groups: [] as string[],
      properties: {} as any,
      estimatedDeploymentCostFactor: 0
    };
    refineWebAppTemplate(model, MOCK_USER_SESSION).then(
      actual => {
        expect(actual).toEqual(expected);
        done();
      },
      e => done.fail(e)
    );
  });

  it("just group data", done => {
    const model = {
      itemId: "itm1234567890",
      type: "Web Mapping Application",
      key: "abcdefgh",
      item: { title: "Voting Centers" } as any,
      data: { values: { group: "myGroupId" } },
      resources: [] as any[],
      dependencies: [] as string[],
      groups: [] as string[],
      properties: {} as any,
      estimatedDeploymentCostFactor: 0
    };
    const expected = {
      itemId: "itm1234567890",
      type: "Web Mapping Application",
      key: "abcdefgh",
      item: { title: "Voting Centers" } as any,
      data: { values: { group: "{{myGroupId.itemId}}" } },
      resources: [] as any[],
      dependencies: ["myGroupId"],
      groups: [] as string[],
      properties: {} as any,
      estimatedDeploymentCostFactor: 0
    };
    refineWebAppTemplate(model, MOCK_USER_SESSION).then(
      actual => {
        expect(actual).toEqual(expected);
        done();
      },
      e => done.fail(e)
    );
  });

  it("neither webmap nor group", done => {
    const model = {
      itemId: "itm1234567890",
      type: "Web Mapping Application",
      key: "abcdefgh",
      item: {
        id: "{{itm1234567890.itemId}}",
        title: "Voting Centers",
        url:
          "http://anOrg.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=itm1234567890"
      } as any,
      data: {
        folderId: "fld1234567890"
      } as any,
      resources: [] as any[],
      dependencies: [] as string[],
      groups: [] as string[],
      properties: {} as any,
      estimatedDeploymentCostFactor: 0
    };
    const expected = {
      itemId: "itm1234567890",
      type: "Web Mapping Application",
      key: "abcdefgh",
      item: {
        id: "{{itm1234567890.itemId}}",
        title: "Voting Centers",
        url:
          "{{portalBaseUrl}}/apps/CrowdsourcePolling/index.html?appid={{itm1234567890.itemId}}"
      } as any,
      data: {
        folderId: "{{folderId}}"
      } as any,
      resources: [] as any[],
      dependencies: [] as any[],
      groups: [] as string[],
      properties: {} as any,
      estimatedDeploymentCostFactor: 0
    };
    refineWebAppTemplate(model, MOCK_USER_SESSION).then(
      actual => {
        expect(actual).toEqual(expected);
        done();
      },
      e => {
        done.fail(e);
      }
    );
  });

  it("webmap data with external dataSources", done => {
    const model = {
      itemId: "itm1234567890",
      type: "Web Mapping Application",
      key: "abcdefgh",
      item: { title: "Voting Centers" } as any,
      data: {
        appItemId: "myAppItemId",
        values: {
          webmap: "myMapId"
        },
        map: {
          appProxy: {
            mapItemId: "mapItemId"
          },
          itemId: "mapItemId"
        },
        dataSource: {
          dataSources: {
            external_123456789: {
              type: "source type",
              portalUrl: "https://fake.maps.arcgis.com/",
              itemId: "2ea59a64b34646f8972a71c7d536e4a3",
              isDynamic: false,
              label: "Point layer",
              url: "https://fake.com/arcgis/rest/services/test/FeatureServer/0"
            }
          },
          settings: {}
        }
      },
      resources: [] as any[],
      dependencies: [] as string[],
      groups: [] as string[],
      properties: {} as any,
      estimatedDeploymentCostFactor: 0
    };
    const expected = {
      itemId: "itm1234567890",
      type: "Web Mapping Application",
      key: "abcdefgh",
      item: { title: "Voting Centers" } as any,
      data: {
        appItemId: "{{itm1234567890.itemId}}",
        values: {
          webmap: "{{myMapId.itemId}}"
        },
        map: {
          appProxy: {
            mapItemId: "{{mapItemId.itemId}}"
          },
          itemId: "{{mapItemId.itemId}}"
        },
        dataSource: {
          dataSources: {
            external_123456789: {
              type: "source type",
              portalUrl: "{{portalBaseUrl}}",
              itemId: "{{2ea59a64b34646f8972a71c7d536e4a3.layer0.itemId}}",
              isDynamic: false,
              label: "Point layer",
              url: "{{2ea59a64b34646f8972a71c7d536e4a3.layer0.url}}"
            }
          },
          settings: {}
        }
      },
      resources: [] as any[],
      dependencies: ["myMapId"],
      groups: [] as string[],
      properties: {} as any,
      estimatedDeploymentCostFactor: 0
    };

    const layer0: any = {
      serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
      id: 0
    };

    fetchMock
      .post("https://fake.com/arcgis/rest/info", {})
      .post(
        "https://fake.com/arcgis/rest/services/test/FeatureServer/0",
        layer0
      );

    refineWebAppTemplate(model, MOCK_USER_SESSION).then(
      actual => {
        expect(actual).toEqual(expected);
        done();
      },
      e => done.fail(e)
    );
  });

  it("error with webmap data with external dataSources", done => {
    const model = {
      itemId: "itm1234567890",
      type: "Web Mapping Application",
      key: "abcdefgh",
      item: { title: "Voting Centers" } as any,
      data: {
        appItemId: "myAppItemId",
        values: {
          webmap: "myMapId"
        },
        map: {
          appProxy: {
            mapItemId: "mapItemId"
          },
          itemId: "mapItemId"
        },
        dataSource: {
          dataSources: {
            external_123456789: {
              type: "source type",
              portalUrl: "https://fake.maps.arcgis.com/",
              itemId: "2ea59a64b34646f8972a71c7d536e4a3",
              isDynamic: false,
              label: "Point layer",
              url: "https://fake.com/arcgis/rest/services/test/FeatureServer/0"
            }
          },
          settings: {}
        }
      },
      resources: [] as any[],
      dependencies: [] as string[],
      groups: [] as string[],
      properties: {} as any,
      estimatedDeploymentCostFactor: 0
    };
    fetchMock
      .post("https://fake.com/arcgis/rest/info", {})
      .post(
        "https://fake.com/arcgis/rest/services/test/FeatureServer/0",
        mockItems.get400Failure()
      );

    refineWebAppTemplate(model, MOCK_USER_SESSION).then(
      actual => {
        done.fail();
      },
      e => done()
    );
  });

  it("webmap data with external dataSources without url", done => {
    const model = {
      itemId: "itm1234567890",
      type: "Web Mapping Application",
      key: "abcdefgh",
      item: { title: "Voting Centers" } as any,
      data: {
        appItemId: "myAppItemId",
        values: {
          webmap: "myMapId"
        },
        map: {
          appProxy: {
            mapItemId: "mapItemId"
          },
          itemId: "mapItemId"
        },
        dataSource: {
          dataSources: {
            external_123456789: {
              type: "source type",
              portalUrl: "https://fake.maps.arcgis.com/",
              itemId: "2ea59a64b34646f8972a71c7d536e4a3",
              isDynamic: false,
              label: "Point layer"
            }
          },
          settings: {}
        }
      },
      resources: [] as any[],
      dependencies: [] as string[],
      groups: [] as string[],
      properties: {} as any,
      estimatedDeploymentCostFactor: 0
    };
    const expected = {
      itemId: "itm1234567890",
      type: "Web Mapping Application",
      key: "abcdefgh",
      item: { title: "Voting Centers" } as any,
      data: {
        appItemId: "{{itm1234567890.itemId}}",
        values: {
          webmap: "{{myMapId.itemId}}"
        },
        map: {
          appProxy: {
            mapItemId: "{{mapItemId.itemId}}"
          },
          itemId: "{{mapItemId.itemId}}"
        },
        dataSource: {
          dataSources: {
            external_123456789: {
              type: "source type",
              portalUrl: "{{portalBaseUrl}}",
              itemId: "{{2ea59a64b34646f8972a71c7d536e4a3.itemId}}",
              isDynamic: false,
              label: "Point layer"
            }
          },
          settings: {}
        }
      },
      resources: [] as any[],
      dependencies: ["myMapId"],
      groups: [] as string[],
      properties: {} as any,
      estimatedDeploymentCostFactor: 0
    };

    refineWebAppTemplate(model, MOCK_USER_SESSION).then(
      actual => {
        expect(actual).toEqual(expected);
        done();
      },
      e => done.fail(e)
    );
  });

  it("webmap data with widgetPool widgets", done => {
    const model = {
      itemId: "f3223bda3c304dd0bf46dee75ac31aae",
      type: "Web Mapping Application",
      key: "abcdefgh",
      item: {
        id: "{{f3223bda3c304dd0bf46dee75ac31aae.itemId}}",
        type: "Web Mapping Application",
        title: "Voting Centers",
        url:
          "https://somepath/apps/webappviewer/index.html?id=f3223bda3c304dd0bf46dee75ac31aae"
      } as any,
      data: {
        appItemId: "myAppItemId",
        values: {
          webmap: "myMapId"
        },
        map: {
          appProxy: {
            mapItemId: "mapItemId"
          },
          itemId: "mapItemId"
        },
        dataSource: {
          dataSources: {},
          settings: {}
        },
        widgetPool: {
          widgets: [
            {
              icon: "https://somepath/somename.png",
              config: {
                someProperty: {
                  someHttpUrl: "http://path/FeatureServer/1"
                },
                someOtherProperty: {
                  someHttpsUrl: "https://path/FeatureServer/1"
                },
                somePortalPath: {
                  s: "https://somepath/"
                },
                geocodeProps: {
                  service: "http://path/GeocodeServer"
                },
                routeProps: {
                  service: "http://path/NAServer"
                }
              }
            }
          ]
        }
      },
      resources: [] as any[],
      dependencies: [] as string[],
      groups: [] as string[],
      properties: {} as any,
      estimatedDeploymentCostFactor: 0
    };
    const expected = {
      itemId: "f3223bda3c304dd0bf46dee75ac31aae",
      type: "Web Mapping Application",
      key: "abcdefgh",
      item: {
        id: "{{f3223bda3c304dd0bf46dee75ac31aae.itemId}}",
        type: "Web Mapping Application",
        title: "Voting Centers",
        url:
          "{{portalBaseUrl}}/apps/webappviewer/index.html?id={{f3223bda3c304dd0bf46dee75ac31aae.itemId}}"
      },
      data: {
        appItemId: "{{f3223bda3c304dd0bf46dee75ac31aae.itemId}}",
        values: {
          webmap: "{{myMapId.itemId}}"
        },
        map: {
          appProxy: {
            mapItemId: "{{mapItemId.itemId}}"
          },
          itemId: "{{mapItemId.itemId}}"
        },
        dataSource: {
          dataSources: {},
          settings: {}
        },
        widgetPool: {
          widgets: [
            {
              icon: "{{portalBaseUrl}}/somename.png",
              config: {
                someProperty: {
                  someHttpUrl: "{{2ea59a64b34646f8972a71c7d536e4a3.layer1.url}}"
                },
                someOtherProperty: {
                  someHttpsUrl:
                    "{{2ea59a64b34646f8972a71c7d536e4a3.layer1.url}}"
                },
                somePortalPath: {
                  s: "{{portalBaseUrl}}/"
                },
                geocodeProps: {
                  service:
                    "{{organization.helperServices.geocode:getDefaultLocatorURL}}"
                },
                routeProps: {
                  service: "{{organization.helperServices.route.url}}"
                }
              }
            }
          ]
        }
      },
      resources: [] as any[],
      dependencies: ["myMapId"],
      groups: [] as string[],
      properties: {} as any,
      estimatedDeploymentCostFactor: 0
    };

    const layer1: any = {
      serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
      id: 1
    };

    fetchMock
      .post("https://path/FeatureServer/1/rest/info", {})
      .post("http://path/FeatureServer/1/rest/info", {})
      .post("https://path/FeatureServer/1", layer1)
      .post("http://path/FeatureServer/1", layer1);

    refineWebAppTemplate(model, MOCK_USER_SESSION).then(
      actual => {
        expect(actual).toEqual(expected);
        done();
      },
      e => done.fail(e)
    );
  });

  it("webmap data with widgetPool and widgetOnScreen widgets", done => {
    const model = {
      itemId: "f3223bda3c304dd0bf46dee75ac31aae",
      type: "Web Mapping Application",
      key: "abcdefgh",
      item: {
        id: "{{f3223bda3c304dd0bf46dee75ac31aae.itemId}}",
        type: "Web Mapping Application",
        title: "Voting Centers",
        url:
          "https://somepath/apps/webappviewer/index.html?id=f3223bda3c304dd0bf46dee75ac31aae"
      } as any,
      data: {
        appItemId: "myAppItemId",
        values: {
          webmap: "myMapId"
        },
        map: {
          appProxy: {
            mapItemId: "mapItemId"
          },
          itemId: "mapItemId"
        },
        dataSource: {
          dataSources: {},
          settings: {}
        },
        widgetPool: {
          widgets: [
            {
              icon: "https://somepath/somename.png",
              config: {
                someProperty: {
                  someHttpUrl: "http://path/FeatureServer/1"
                },
                someOtherProperty: {
                  someHttpsUrl: "https://path/FeatureServer/1"
                },
                geocodeProps: {
                  service: "http://path/GeocodeServer"
                },
                routeProps: {
                  service: "http://path/NAServer"
                }
              }
            }
          ]
        },
        widgetOnScreen: {
          widgets: [
            {
              icon: "https://somepath/somename.png",
              config: {
                someProperty: {
                  someHttpUrl: "http://path/FeatureServer/1"
                },
                someOtherProperty: {
                  someHttpsUrl: "https://path/FeatureServer/1"
                },
                geocodeProps: {
                  service: "http://path/GeocodeServer"
                },
                routeProps: {
                  service: "http://path/NAServer"
                }
              }
            }
          ]
        }
      },
      resources: [] as any[],
      dependencies: [] as string[],
      groups: [] as string[],
      properties: {} as any,
      estimatedDeploymentCostFactor: 0
    };
    const expected = {
      itemId: "f3223bda3c304dd0bf46dee75ac31aae",
      type: "Web Mapping Application",
      key: "abcdefgh",
      item: {
        id: "{{f3223bda3c304dd0bf46dee75ac31aae.itemId}}",
        type: "Web Mapping Application",
        title: "Voting Centers",
        url:
          "{{portalBaseUrl}}/apps/webappviewer/index.html?id={{f3223bda3c304dd0bf46dee75ac31aae.itemId}}"
      },
      data: {
        appItemId: "{{f3223bda3c304dd0bf46dee75ac31aae.itemId}}",
        values: {
          webmap: "{{myMapId.itemId}}"
        },
        map: {
          appProxy: {
            mapItemId: "{{mapItemId.itemId}}"
          },
          itemId: "{{mapItemId.itemId}}"
        },
        dataSource: {
          dataSources: {},
          settings: {}
        },
        widgetPool: {
          widgets: [
            {
              icon: "{{portalBaseUrl}}/somename.png",
              config: {
                someProperty: {
                  someHttpUrl: "{{2ea59a64b34646f8972a71c7d536e4a3.layer1.url}}"
                },
                someOtherProperty: {
                  someHttpsUrl:
                    "{{2ea59a64b34646f8972a71c7d536e4a3.layer1.url}}"
                },
                geocodeProps: {
                  service:
                    "{{organization.helperServices.geocode:getDefaultLocatorURL}}"
                },
                routeProps: {
                  service: "{{organization.helperServices.route.url}}"
                }
              }
            }
          ]
        },
        widgetOnScreen: {
          widgets: [
            {
              icon: "{{portalBaseUrl}}/somename.png",
              config: {
                someProperty: {
                  someHttpUrl: "{{2ea59a64b34646f8972a71c7d536e4a3.layer1.url}}"
                },
                someOtherProperty: {
                  someHttpsUrl:
                    "{{2ea59a64b34646f8972a71c7d536e4a3.layer1.url}}"
                },
                geocodeProps: {
                  service:
                    "{{organization.helperServices.geocode:getDefaultLocatorURL}}"
                },
                routeProps: {
                  service: "{{organization.helperServices.route.url}}"
                }
              }
            }
          ]
        }
      },
      resources: [] as any[],
      dependencies: ["myMapId"],
      groups: [] as string[],
      properties: {} as any,
      estimatedDeploymentCostFactor: 0
    };

    const layer1: any = {
      serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
      id: 1
    };

    fetchMock
      .post("https://path/FeatureServer/1/rest/info", {})
      .post("http://path/FeatureServer/1/rest/info", {})
      .post("https://path/FeatureServer/1", layer1)
      .post("http://path/FeatureServer/1", layer1);

    refineWebAppTemplate(model, MOCK_USER_SESSION).then(
      actual => {
        expect(actual).toEqual(expected);
        done();
      },
      e => done.fail(e)
    );
  });

  it("error with widgetPool widgets", done => {
    const model = {
      itemId: "f3223bda3c304dd0bf46dee75ac31aae",
      type: "Web Mapping Application",
      key: "abcdefgh",
      item: {
        id: "{{f3223bda3c304dd0bf46dee75ac31aae.itemId}}",
        title: "Voting Centers",
        url:
          "https://somepath/apps/webappviewer/index.html?id=f3223bda3c304dd0bf46dee75ac31aae"
      } as any,
      data: {
        appItemId: "myAppItemId",
        values: {
          webmap: "myMapId"
        },
        map: {
          appProxy: {
            mapItemId: "mapItemId"
          },
          itemId: "mapItemId"
        },
        dataSource: {
          dataSources: {},
          settings: {}
        },
        widgetPool: {
          widgets: [
            {
              icon: "https://somepath/somename.png",
              config: {
                someProperty: {
                  someHttpUrl: "http://path/FeatureServer/1"
                },
                someOtherProperty: {
                  someHttpsUrl: "https://path/FeatureServer/1"
                },
                geocodeProps: {
                  service: "http://path/GeocodeServer"
                },
                routeProps: {
                  service: "http://path/NAServer"
                }
              }
            }
          ]
        }
      },
      resources: [] as any[],
      dependencies: [] as string[],
      groups: [] as string[],
      properties: {} as any,
      estimatedDeploymentCostFactor: 0
    };

    const layer1: any = {
      serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
      id: 1
    };

    fetchMock
      .post("https://path/FeatureServer/1/rest/info", {})
      .post("http://path/FeatureServer/1/rest/info", {})
      .post("https://path/FeatureServer/1", layer1)
      .post("http://path/FeatureServer/1", mockItems.get400Failure());

    refineWebAppTemplate(model, MOCK_USER_SESSION).then(
      () => {
        done.fail();
      },
      e => done()
    );
  });

  it("error with widgetOnScreen widgets", done => {
    const model = {
      itemId: "f3223bda3c304dd0bf46dee75ac31aae",
      type: "Web Mapping Application",
      key: "abcdefgh",
      item: {
        id: "{{f3223bda3c304dd0bf46dee75ac31aae.itemId}}",
        title: "Voting Centers",
        url:
          "https://somepath/apps/webappviewer/index.html?id=f3223bda3c304dd0bf46dee75ac31aae"
      } as any,
      data: {
        appItemId: "myAppItemId",
        values: {
          webmap: "myMapId"
        },
        map: {
          appProxy: {
            mapItemId: "mapItemId"
          },
          itemId: "mapItemId"
        },
        dataSource: {
          dataSources: {},
          settings: {}
        },
        widgetOnScreen: {
          widgets: [
            {
              icon: "https://somepath/somename.png",
              config: {
                someProperty: {
                  someHttpUrl: "http://path/FeatureServer/1"
                },
                someOtherProperty: {
                  someHttpsUrl: "https://path/FeatureServer/1"
                },
                geocodeProps: {
                  service: "http://path/GeocodeServer"
                },
                routeProps: {
                  service: "http://path/NAServer"
                }
              }
            }
          ]
        }
      },
      resources: [] as any[],
      dependencies: [] as string[],
      groups: [] as string[],
      properties: {} as any,
      estimatedDeploymentCostFactor: 0
    };

    const layer1: any = {
      serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
      id: 1
    };

    fetchMock
      .post("https://path/FeatureServer/1/rest/info", {})
      .post("http://path/FeatureServer/1/rest/info", {})
      .post("https://path/FeatureServer/1", layer1)
      .post("http://path/FeatureServer/1", mockItems.get400Failure());

    refineWebAppTemplate(model, MOCK_USER_SESSION).then(
      () => {
        done.fail();
      },
      e => done()
    );
  });

  // it("web application template values", done => {
  //   fetchMock
  //     .post("https://fake.com/arcgis/rest/info", {})
  //     .post(
  //       "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayer2FromWebApp/FeatureServer/3",
  //       {
  //         id: 3,
  //         serviceItemId: "b19aec399444407da84fffe2a55d4151",
  //         fields: [
  //           {
  //             name: "OBJECTID"
  //           }
  //         ]
  //       }
  //     )
  //     .post(
  //       "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayer2FromWebApp/FeatureServer/2",
  //       {
  //         id: 2,
  //         serviceItemId: "b19aec399444407da84fffe2a55d4151",
  //         fields: [
  //           {
  //             name: "OBJECTID"
  //           }
  //         ]
  //       }
  //     )
  //     .post(
  //       "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayer2FromWebApp/FeatureServer/1",
  //       {
  //         id: 1,
  //         serviceItemId: "b19aec399444407da84fffe2a55d4151",
  //         fields: [
  //           {
  //             name: "OBJECTID"
  //           }
  //         ]
  //       }
  //     )
  //     .post(
  //       "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayer2FromWebApp/FeatureServer/0",
  //       {
  //         id: 0,
  //         serviceItemId: "b19aec399444407da84fffe2a55d4151",
  //         fields: [
  //           {
  //             name: "OBJECTID"
  //           }
  //         ]
  //       }
  //     )
  //     .post(
  //       "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/7",
  //       {
  //         id: 7,
  //         serviceItemId: "4efe5f693de34620934787ead6693f19",
  //         fields: [
  //           {
  //             name: "OBJECTID"
  //           }
  //         ]
  //       }
  //     )
  //     .post(
  //       "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/6",
  //       {
  //         id: 6,
  //         serviceItemId: "4efe5f693de34620934787ead6693f19",
  //         fields: [
  //           {
  //             name: "OBJECTID"
  //           }
  //         ]
  //       }
  //     )
  //     .post(
  //       "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/5",
  //       {
  //         id: 5,
  //         serviceItemId: "4efe5f693de34620934787ead6693f19",
  //         fields: [
  //           {
  //             name: "OBJECTID"
  //           }
  //         ]
  //       }
  //     )
  //     .post(
  //       "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/4",
  //       {
  //         id: 4,
  //         serviceItemId: "4efe5f693de34620934787ead6693f19",
  //         fields: [
  //           {
  //             name: "OBJECTID"
  //           }
  //         ]
  //       }
  //     )
  //     .post(
  //       "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/3",
  //       {
  //         id: 3,
  //         serviceItemId: "4efe5f693de34620934787ead6693f19",
  //         fields: [
  //           {
  //             name: "OBJECTID"
  //           }
  //         ]
  //       }
  //     )
  //     .post(
  //       "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/2",
  //       {
  //         id: 2,
  //         serviceItemId: "4efe5f693de34620934787ead6693f19",
  //         fields: [
  //           {
  //             name: "OBJECTID"
  //           }
  //         ]
  //       }
  //     )
  //     .post(
  //       "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/1",
  //       {
  //         id: 1,
  //         serviceItemId: "4efe5f693de34620934787ead6693f19",
  //         fields: [
  //           {
  //             name: "OBJECTID"
  //           }
  //         ]
  //       }
  //     )
  //     .post(
  //       "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/0",
  //       {
  //         id: 0,
  //         serviceItemId: "4efe5f693de34620934787ead6693f19",
  //         fields: [
  //           {
  //             name: "OBJECTID"
  //           }
  //         ]
  //       }
  //     );

  //   refineWebAppTemplate(webappTemplateExample, MOCK_USER_SESSION)
  //     .then(
  //       template => {
  //         const actual = webappProcessor.postProcessFieldReferences(
  //           template,
  //           infoLookupDatasourceInfos,
  //           'Web Mapping Application'
  //         );
  //         expect(actual).toEqual(expectedInfoLookupTemplate);
  //         done();
  //       },
  //       e => done.fail(e)
  //     );
  // });

  it("error with web application template templatizeValues", done => {
    fetchMock
      .post("https://fake.com/arcgis/rest/info", {})
      .post(
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayer2FromWebApp/FeatureServer/3",
        mockItems.get400Failure()
      )
      .post(
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayer2FromWebApp/FeatureServer/2",
        mockItems.get400Failure()
      )
      .post(
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayer2FromWebApp/FeatureServer/1",
        mockItems.get400Failure()
      )
      .post(
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayer2FromWebApp/FeatureServer/0",
        mockItems.get400Failure()
      )
      .post(
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/7",
        mockItems.get400Failure()
      )
      .post(
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/6",
        mockItems.get400Failure()
      )
      .post(
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/5",
        mockItems.get400Failure()
      )
      .post(
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/4",
        mockItems.get400Failure()
      )
      .post(
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/3",
        mockItems.get400Failure()
      )
      .post(
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/2",
        mockItems.get400Failure()
      )
      .post(
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/1",
        mockItems.get400Failure()
      )
      .post(
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/0",
        mockItems.get400Failure()
      );

    return refineWebAppTemplate(webappTemplateExample, MOCK_USER_SESSION)
      .then(template => {
        done.fail();
      })
      .catch(ex => {
        done();
      });
  });
});
