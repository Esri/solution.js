/** @license
 * Copyright 2018 Esri
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

/**
 * Provides tests for functions involving the creation and deployment of Web Mapping Application item types.
 */

import * as common from "@esri/solution-common";
import * as webmappingapplication from "../src/webmappingapplication";

import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as utils from "../../common/test/mocks/utils";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

// ------------------------------------------------------------------------------------------------------------------ //

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

describe("Module `webmappingapplication`: manages the creation and deployment of web mapping application item types", () => {
  let infoLookupTemplate: any;

  beforeEach(() => {
    infoLookupTemplate = common.cloneObject(_infoLookupTemplate);
  });

  afterEach(() => {
    fetchMock.restore();
  });

  describe("convertItemToTemplate", () => {
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
      webmappingapplication
        .convertItemToTemplate(model, MOCK_USER_SESSION)
        .then(
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
      webmappingapplication
        .convertItemToTemplate(model, MOCK_USER_SESSION)
        .then(
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
      webmappingapplication
        .convertItemToTemplate(model, MOCK_USER_SESSION)
        .then(
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
                url:
                  "https://fake.com/arcgis/rest/services/test/FeatureServer/0"
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

      webmappingapplication
        .convertItemToTemplate(model, MOCK_USER_SESSION)
        .then(
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
                url:
                  "https://fake.com/arcgis/rest/services/test/FeatureServer/0"
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

      webmappingapplication
        .convertItemToTemplate(model, MOCK_USER_SESSION)
        .then(
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

      webmappingapplication
        .convertItemToTemplate(model, MOCK_USER_SESSION)
        .then(
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
                    someHttpUrl:
                      "{{2ea59a64b34646f8972a71c7d536e4a3.layer1.url}}"
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

      webmappingapplication
        .convertItemToTemplate(model, MOCK_USER_SESSION)
        .then(
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
                icon: "widgets/Scalebar/images/somename.png",
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
                    someHttpUrl:
                      "{{2ea59a64b34646f8972a71c7d536e4a3.layer1.url}}"
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
                icon: "widgets/Scalebar/images/somename.png",
                config: {
                  someProperty: {
                    someHttpUrl:
                      "{{2ea59a64b34646f8972a71c7d536e4a3.layer1.url}}"
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

      webmappingapplication
        .convertItemToTemplate(model, MOCK_USER_SESSION)
        .then(
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

      webmappingapplication
        .convertItemToTemplate(model, MOCK_USER_SESSION)
        .then(
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

      webmappingapplication
        .convertItemToTemplate(model, MOCK_USER_SESSION)
        .then(
          () => {
            done.fail();
          },
          e => done()
        );
    });

    it("web application template values", done => {
      fetchMock
        .post("https://fake.com/arcgis/rest/info", {})
        .post(
          "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayer2FromWebApp/FeatureServer/3",
          {
            id: 3,
            serviceItemId: "b19aec399444407da84fffe2a55d4151",
            fields: [
              {
                name: "OBJECTID"
              }
            ]
          }
        )
        .post(
          "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayer2FromWebApp/FeatureServer/2",
          {
            id: 2,
            serviceItemId: "b19aec399444407da84fffe2a55d4151",
            fields: [
              {
                name: "OBJECTID"
              }
            ]
          }
        )
        .post(
          "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayer2FromWebApp/FeatureServer/1",
          {
            id: 1,
            serviceItemId: "b19aec399444407da84fffe2a55d4151",
            fields: [
              {
                name: "OBJECTID"
              }
            ]
          }
        )
        .post(
          "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayer2FromWebApp/FeatureServer/0",
          {
            id: 0,
            serviceItemId: "b19aec399444407da84fffe2a55d4151",
            fields: [
              {
                name: "OBJECTID"
              }
            ]
          }
        )
        .post(
          "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/7",
          {
            id: 7,
            serviceItemId: "4efe5f693de34620934787ead6693f19",
            fields: [
              {
                name: "OBJECTID"
              }
            ]
          }
        )
        .post(
          "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/6",
          {
            id: 6,
            serviceItemId: "4efe5f693de34620934787ead6693f19",
            fields: [
              {
                name: "OBJECTID"
              }
            ]
          }
        )
        .post(
          "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/5",
          {
            id: 5,
            serviceItemId: "4efe5f693de34620934787ead6693f19",
            fields: [
              {
                name: "OBJECTID"
              }
            ]
          }
        )
        .post(
          "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/4",
          {
            id: 4,
            serviceItemId: "4efe5f693de34620934787ead6693f19",
            fields: [
              {
                name: "OBJECTID"
              }
            ]
          }
        )
        .post(
          "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/3",
          {
            id: 3,
            serviceItemId: "4efe5f693de34620934787ead6693f19",
            fields: [
              {
                name: "OBJECTID"
              }
            ]
          }
        )
        .post(
          "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/2",
          {
            id: 2,
            serviceItemId: "4efe5f693de34620934787ead6693f19",
            fields: [
              {
                name: "OBJECTID"
              }
            ]
          }
        )
        .post(
          "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/1",
          {
            id: 1,
            serviceItemId: "4efe5f693de34620934787ead6693f19",
            fields: [
              {
                name: "OBJECTID"
              }
            ]
          }
        )
        .post(
          "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/0",
          {
            id: 0,
            serviceItemId: "4efe5f693de34620934787ead6693f19",
            fields: [
              {
                name: "OBJECTID"
              }
            ]
          }
        );

      webmappingapplication
        .convertItemToTemplate(infoLookupTemplate, MOCK_USER_SESSION)
        .then(
          template => {
            const actual = webmappingapplication.postProcessFieldReferences(
              template,
              infoLookupDatasourceInfos
            );
            expect(actual).toEqual(expectedInfoLookupTemplate);
            done();
          },
          e => done.fail(e)
        );
    });

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

      webmappingapplication
        .convertItemToTemplate(infoLookupTemplate, MOCK_USER_SESSION)
        .then(template => {
          done.fail();
        }, done);
    });
  });

  describe("templatizeDatasources ", () => {
    it("handles different flavors of data source", done => {
      const itemTemplate: common.IItemTemplate = {
        itemId: "abc0cab401af4828a25cc6eaeb59fb69",
        type: "Web Mapping Application",
        key: "r0rtxyja",
        item: {
          id: "{{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
          type: "Web Mapping Application",
          extent: "{{solutionItemExtent}}",
          title: "Voting Centers",
          url:
            "{{portalBaseUrl}}/home/item.html?id={{abc0cab401af4828a25cc6eaeb59fb69.itemId}}"
        },
        data: {
          appItemId: "{{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
          values: {
            webmap: "{{myMapId.itemId}}"
          },
          map: {
            appProxy: {
              mapItemId: "{{mapItemId.itemId}}"
            },
            itemId: "{{mapItemId.itemId}}"
          },
          folderId: "{{folderId}}",
          dataSource: {
            dataSources: {
              external_123456789: {
                type: "source type",
                portalUrl: "https://fake.maps.arcgis.com/",
                itemId: "2ea59a64b34646f8972a71c7d536e4a3",
                isDynamic: false,
                label: "Point layer",
                url:
                  "https://fake.com/arcgis/rest/services/test/FeatureServer/0"
              },
              external_987654321: {
                type: "source type",
                portalUrl: "https://fake.maps.arcgis.com/",
                itemId: "56465ad54b4646f8972a71c7d536e4a3",
                isDynamic: false,
                label: "Point layer"
              },
              external_123498765: {
                type: "source type",
                portalUrl: "https://fake.maps.arcgis.com/",
                isDynamic: false,
                label: "Point layer"
              }
            },
            settings: {}
          }
        },
        resources: [],
        dependencies: ["myMapId"],
        groups: [],
        properties: {},
        estimatedDeploymentCostFactor: 2
      };
      const expectedItemTemplate: common.IItemTemplate = common.cloneObject(
        itemTemplate
      );
      expectedItemTemplate.data.dataSource.dataSources = {
        external_123456789: {
          type: "source type",
          portalUrl: "{{portalBaseUrl}}",
          itemId: "{{2ea59a64b34646f8972a71c7d536e4a3.layer0.itemId}}",
          isDynamic: false,
          label: "Point layer",
          url: "{{2ea59a64b34646f8972a71c7d536e4a3.layer0.url}}"
        },
        external_987654321: {
          type: "source type",
          portalUrl: "{{portalBaseUrl}}",
          itemId: "{{56465ad54b4646f8972a71c7d536e4a3.itemId}}",
          isDynamic: false,
          label: "Point layer"
        },
        external_123498765: {
          type: "source type",
          portalUrl: "{{portalBaseUrl}}",
          isDynamic: false,
          label: "Point layer"
        }
      };
      const portalUrl: string = "https://fake.maps.arcgis.com";

      fetchMock
        .post("https://fake.com/arcgis/rest/info", {})
        .post("https://fake.com/arcgis/rest/services/test/FeatureServer/0", {
          serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
          id: 0
        });

      webmappingapplication
        .templatizeDatasources(itemTemplate, MOCK_USER_SESSION, portalUrl)
        .then(
          (updatedItemTemplate: common.IItemTemplate) => {
            expect(updatedItemTemplate).toEqual(expectedItemTemplate);
            done();
          },
          e => done.fail()
        );
    });
  });

  describe("templatizeWidgets ", () => {
    it("handles widgets", done => {
      const itemTemplate: common.IItemTemplate = {
        itemId: "f3223bda3c304dd0bf46dee75ac31aae",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: {
          id: "{{f3223bda3c304dd0bf46dee75ac31aae.itemId}}",
          type: "Web Mapping Application",
          extent: "{{solutionItemExtent}}",
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
          widgetOnScreen: {
            widgets: [
              {
                name: "Search",
                uri: "widgets/Search/Widget",
                icon: "widgets/Search/images/icon.png?wab_dv=2.1"
              }
            ]
          },
          widgetPool: {
            widgets: [
              {
                icon: "https://somepath/somename.png",
                config: {
                  someProperty: {
                    someHttpUrl:
                      "http://fake.com/arcgis/rest/services/test/FeatureServer/1"
                  },
                  someOtherProperty: {
                    someHttpsUrl:
                      "https://fake.com/arcgis/rest/services/test/FeatureServer/1"
                  },
                  somePortalPath: {
                    s: "https://fake.maps.arcgis.com/"
                  },
                  geocodeProps: {
                    service: "http://fake.maps.arcgis.com/GeocodeServer"
                  },
                  routeProps: {
                    service: "http://fake.maps.arcgis.com/NAServer"
                  }
                }
              },
              {
                icon: "https://somepath/anothername.png",
                config: {
                  someProperty: {
                    someHttpUrl:
                      "http://fake.com/arcgis/rest/services/test/FeatureServer/2"
                  }
                }
              }
            ]
          }
        },
        resources: [],
        dependencies: ["myMapId"],
        groups: [],
        properties: {},
        estimatedDeploymentCostFactor: 2
      };
      const expectedItemTemplate: common.IItemTemplate = common.cloneObject(
        itemTemplate
      );
      expectedItemTemplate.data.widgetOnScreen.widgets = [
        {
          name: "Search",
          uri: "widgets/Search/Widget",
          icon: "widgets/Search/images/icon.png?wab_dv=2.1"
        }
      ];
      expectedItemTemplate.data.widgetPool.widgets = [
        {
          icon: "{{portalBaseUrl}}/somename.png",
          config: {
            someProperty: {
              someHttpUrl: "{{2ea59a64b34646f8972a71c7d536e4a3.layer1.url}}"
            },
            someOtherProperty: {
              someHttpsUrl: "{{2ea59a64b34646f8972a71c7d536e4a3.layer1.url}}"
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
        },
        {
          icon: "{{portalBaseUrl}}/anothername.png",
          config: {
            someProperty: {
              someHttpUrl: "{{f74d7d7630da4fa7b961921489c7d3ef.layer2.url}}"
            }
          }
        }
      ];
      const portalUrl: string = "https://fake.maps.arcgis.com";
      const widgetPath: string = "data.widgetPool.widgets";
      const layer1: any = {
        serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
        id: 1
      };
      const layer2: any = {
        serviceItemId: "f74d7d7630da4fa7b961921489c7d3ef",
        id: 2
      };

      fetchMock
        .post("https://fake.com/arcgis/rest/info", {})
        .post(
          "https://fake.com/arcgis/rest/services/test/FeatureServer/1",
          layer1
        )
        .post(
          "https://fake.com/arcgis/rest/services/test/FeatureServer/2",
          layer2
        )
        .post("http://fake.com/arcgis/rest/info", {})
        .post(
          "http://fake.com/arcgis/rest/services/test/FeatureServer/1",
          layer1
        )
        .post(
          "http://fake.com/arcgis/rest/services/test/FeatureServer/2",
          layer2
        );

      webmappingapplication
        .templatizeWidgets(
          itemTemplate,
          MOCK_USER_SESSION,
          portalUrl,
          widgetPath
        )
        .then(
          (updatedItemTemplate: common.IItemTemplate) => {
            expect(updatedItemTemplate).toEqual(expectedItemTemplate);
            done();
          },
          e => done.fail()
        );
    });

    it("handles widgets that are missing properties", done => {
      const itemTemplate: common.IItemTemplate = {
        itemId: "f3223bda3c304dd0bf46dee75ac31aae",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: {
          id: "{{f3223bda3c304dd0bf46dee75ac31aae.itemId}}",
          type: "Web Mapping Application",
          extent: "{{solutionItemExtent}}",
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
                icon: null,
                config: null
              }
            ]
          }
        },
        resources: [],
        dependencies: ["myMapId"],
        groups: [],
        properties: {},
        estimatedDeploymentCostFactor: 2
      };
      const expectedItemTemplate: common.IItemTemplate = common.cloneObject(
        itemTemplate
      );
      const portalUrl: string = "https://fake.maps.arcgis.com";
      const widgetPath: string = "data.widgetPool.widgets";
      const layer1: any = {
        serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
        id: 1
      };

      fetchMock
        .post("https://fake.com/arcgis/rest/info", {})
        .post("http://fake.com/arcgis/rest/info", {})
        .post(
          "https://fake.com/arcgis/rest/services/test/FeatureServer/1",
          layer1
        )
        .post(
          "http://fake.com/arcgis/rest/services/test/FeatureServer/1",
          layer1
        );

      webmappingapplication
        .templatizeWidgets(
          itemTemplate,
          MOCK_USER_SESSION,
          portalUrl,
          widgetPath
        )
        .then(
          (updatedItemTemplate: common.IItemTemplate) => {
            expect(updatedItemTemplate).toEqual(expectedItemTemplate);
            done();
          },
          e => done.fail()
        );
    });
  });

  describe("handleServiceRequests ", () => {
    it("should handle no service requests ", done => {
      const expected: string = "{test: 123}";
      webmappingapplication.handleServiceRequests([], [], "{test: 123}").then(
        actual => {
          expect(actual).toEqual(expected);
          done();
        },
        e => done.fail
      );
    });

    it("handles missing data in service requests", done => {
      const itemTemplate: common.IItemTemplate = {
        itemId: "f3223bda3c304dd0bf46dee75ac31aae",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: {
          id: "{{f3223bda3c304dd0bf46dee75ac31aae.itemId}}",
          type: "Web Mapping Application",
          extent: "{{solutionItemExtent}}",
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
                icon: "https://somepath/somename.png",
                config: {
                  someProperty: {
                    someHttpUrl:
                      "http://fake.com/arcgis/rest/services/test/FeatureServer/1"
                  },
                  someOtherProperty: {
                    someHttpsUrl:
                      "https://fake.com/arcgis/rest/services/test/FeatureServer/1"
                  },
                  somePortalPath: {
                    s: "https://fake.maps.arcgis.com/"
                  },
                  geocodeProps: {
                    service: "http://fake.maps.arcgis.com/GeocodeServer"
                  },
                  routeProps: {
                    service: "http://fake.maps.arcgis.com/NAServer"
                  }
                }
              },
              {
                icon: "https://somepath/anothername.png",
                config: {
                  someProperty: {
                    someHttpUrl:
                      "http://fake.com/arcgis/rest/services/test/FeatureServer/2"
                  }
                }
              }
            ]
          }
        },
        resources: [],
        dependencies: ["myMapId"],
        groups: [],
        properties: {},
        estimatedDeploymentCostFactor: 2
      };
      const expectedItemTemplate: common.IItemTemplate = common.cloneObject(
        itemTemplate
      );
      expectedItemTemplate.data.widgetPool.widgets = [
        {
          icon: "{{portalBaseUrl}}/somename.png",
          config: {
            someProperty: {
              someHttpUrl:
                "http://fake.com/arcgis/rest/services/test/FeatureServer/1"
            },
            someOtherProperty: {
              someHttpsUrl:
                "https://fake.com/arcgis/rest/services/test/FeatureServer/1"
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
        },
        {
          icon: "{{portalBaseUrl}}/anothername.png",
          config: {
            someProperty: {
              someHttpUrl: "{{f74d7d7630da4fa7b961921489c7d3ef.url}}"
            }
          }
        }
      ];
      const portalUrl: string = "https://fake.maps.arcgis.com";
      const widgetPath: string = "data.widgetPool.widgets";
      const layer1: any = {
        id: 1
      };
      const layer2: any = {
        serviceItemId: "f74d7d7630da4fa7b961921489c7d3ef"
      };

      fetchMock
        .post("https://fake.com/arcgis/rest/info", {})
        .post(
          "https://fake.com/arcgis/rest/services/test/FeatureServer/1",
          layer1
        )
        .post(
          "https://fake.com/arcgis/rest/services/test/FeatureServer/2",
          layer2
        )
        .post("http://fake.com/arcgis/rest/info", {})
        .post(
          "http://fake.com/arcgis/rest/services/test/FeatureServer/1",
          layer1
        )
        .post(
          "http://fake.com/arcgis/rest/services/test/FeatureServer/2",
          layer2
        );

      webmappingapplication
        .templatizeWidgets(
          itemTemplate,
          MOCK_USER_SESSION,
          portalUrl,
          widgetPath
        )
        .then(
          (updatedItemTemplate: common.IItemTemplate) => {
            expect(updatedItemTemplate).toEqual(expectedItemTemplate);
            done();
          },
          e => done.fail()
        );
    });
  });

  describe("findUrls ", () => {
    it("handles unsupported services and services already in list of result URLs ", () => {
      const testString: string =
        '{"someProperty":{"url1":"https://fake.com/arcgis/rest/services/test/OtherServer/1",' +
        '"url2":"https://fake.com/arcgis/rest/services/test/FeatureServer/1"}}';
      const portalUrl: string = "";
      const requestUrls: string[] = [
        "https://fake.com/arcgis/rest/services/test/FeatureServer/1"
      ];
      const serviceRequests: any[] = [];

      const result = webmappingapplication.findUrls(
        testString,
        portalUrl,
        requestUrls,
        serviceRequests,
        MOCK_USER_SESSION
      );
      const expectedResult = {
        testString:
          '{"someProperty":{"url1":"https://fake.com/arcgis/rest/services/test/OtherServer/1",' +
          '"url2":"https://fake.com/arcgis/rest/services/test/FeatureServer/1"}}',
        requestUrls: [
          "https://fake.com/arcgis/rest/services/test/FeatureServer/1"
        ],
        serviceRequests: [] as any[]
      };

      expect(result).toEqual(expectedResult);
    });
  });

  describe("_extractDependencies", () => {
    it("handles no keywords", () => {
      const model = {
        data: { values: { prop1: "1", prop2: "2", webmap: "myMapId" } }
      };
      const expected = ["myMapId"];
      const actual = webmappingapplication._extractDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles no WAB keywords", () => {
      const model = {
        typeKeywords: ["Web Map"],
        data: { values: { prop1: "1", prop2: "2", webmap: "myMapId" } }
      };
      const expected = ["myMapId"];
      const actual = webmappingapplication._extractDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles WAB2D", () => {
      const model = {
        typeKeywords: ["WAB2D"],
        data: { map: { itemId: "abc" } }
      };
      const expected = ["abc"];
      const actual = webmappingapplication._extractDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles Web AppBuilder", () => {
      const model = {
        typeKeywords: ["Government", "Web AppBuilder"],
        data: { map: { itemId: "abc" } }
      };
      const expected = ["abc"];
      const actual = webmappingapplication._extractDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles external data sources", () => {
      const model = {
        typeKeywords: ["Government", "Web AppBuilder"],
        data: {
          map: {
            itemId: "abc"
          },
          dataSource: {
            dataSources: {
              external_123456789: {
                type: "source type",
                portalUrl: "https://fake.maps.arcgis.com/",
                itemId: "2ea59a64b34646f8972a71c7d536e4a3",
                isDynamic: false,
                label: "Point layer",
                url:
                  "https://fake.com/arcgis/rest/services/test/FeatureServer/0"
              }
            },
            settings: {}
          }
        }
      };
      const expected = ["abc", "2ea59a64b34646f8972a71c7d536e4a3"];
      const actual = webmappingapplication._extractDependencies(model);
      expect(actual).toEqual(expected);
    });
  });

  describe("_getGenericWebAppDependencies", () => {
    it("handles null", () => {
      const model: any = null;
      const expected = [] as string[];
      const actual = webmappingapplication._getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles empty model", () => {
      const model = {};
      const expected = [] as string[];
      const actual = webmappingapplication._getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model without data", () => {
      const model = { data: {} };
      const expected = [] as string[];
      const actual = webmappingapplication._getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model without values", () => {
      const model = { data: { values: {} } };
      const expected = [] as string[];
      const actual = webmappingapplication._getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model without webmap or group", () => {
      const model = { data: { values: { prop1: "1", prop2: "2" } } };
      const expected = [] as string[];
      const actual = webmappingapplication._getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model with webmap", () => {
      const model = {
        data: { values: { prop1: "1", prop2: "2", webmap: "myMapId" } }
      };
      const expected = ["myMapId"];
      const actual = webmappingapplication._getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model with group", () => {
      const model = {
        data: { values: { prop1: "1", prop2: "2", group: "myGroupId" } }
      };
      const expected = ["myGroupId"];
      const actual = webmappingapplication._getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model with both webmap and group", () => {
      const model = {
        data: {
          values: {
            group: "myGroupId",
            prop1: "1",
            webmap: "myMapId",
            prop2: "2"
          }
        }
      };
      const expected = ["myMapId", "myGroupId"];
      const actual = webmappingapplication._getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });
  });

  describe("_getWABDependencies", () => {
    it("handles null", () => {
      const model: any = null;
      const expected = [] as string[];
      const actual = webmappingapplication._getWABDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles empty model", () => {
      const model = {};
      const expected = [] as string[];
      const actual = webmappingapplication._getWABDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model without data", () => {
      const model = { data: {} };
      const expected = [] as string[];
      const actual = webmappingapplication._getWABDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model with similar but unmatching path", () => {
      const model = { data: { itemId: "abc" } };
      const expected = [] as string[];
      const actual = webmappingapplication._getWABDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model with matching path", () => {
      const model = { data: { map: { itemId: "abc" } } };
      const expected = ["abc"];
      const actual = webmappingapplication._getWABDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model without matching dataSource", () => {
      const model = {
        data: {
          map: {
            other: "abc"
          },
          dataSource: {
            dataSources: {
              src123456: {
                id: "2ea59a64b34646f8972a71c7d536e4a3",
                type: "source type"
              }
            }
          }
        }
      };
      const expected = [] as string[];
      const actual = webmappingapplication._getWABDependencies(model);
      expect(actual).toEqual(expected);
    });
  });

  describe("create Code Attachment", () => {
    it("doesn't create a corresponding Code Attachment when it deploys a non-WAB app", done => {
      const originalTemplate = {
        itemId: "itm1234567890",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: {
          tags: [
            "Early Voting",
            "Voting",
            "Polling Places",
            "Ballots",
            "Secretary of State",
            "Voting Centers"
          ],
          title: "Voting Centers",
          typeKeywords: ["Map", "Mapping Site", "Online Map"]
        } as any,
        data: {} as any,
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      } as common.IItemTemplate;
      const newlyCreatedItem = {
        itemId: "wab1234567890",
        type: "Web Mapping Application",
        key: "ijklmnop",
        item: {
          tags: [
            "Early Voting",
            "Voting",
            "Polling Places",
            "Ballots",
            "Secretary of State",
            "Voting Centers"
          ],
          title: "Voting Centers",
          typeKeywords: ["Map", "Mapping Site", "Online Map"]
        } as any,
        data: {} as any,
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      } as common.IItemTemplate;
      const templateDictionary = {
        folderId: "fld1234567890"
      };

      const createUrl =
        utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem";
      const expected = {
        success: true,
        id: "cda1234567890",
        folder: "fld1234567890"
      };
      fetchMock.post(createUrl, expected);

      // Function doesn't reject, so,
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      webmappingapplication
        .fineTuneCreatedItem(
          originalTemplate,
          newlyCreatedItem,
          templateDictionary,
          MOCK_USER_SESSION
        )
        .then(() => {
          const calls = fetchMock.calls(createUrl);
          expect(calls.length).toEqual(0);
          done();
        });
    });

    it("creates a corresponding Code Attachment when it deploys a WAB app", done => {
      const originalTemplate = {
        itemId: "itm1234567890",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: {
          tags: [
            "Early Voting",
            "Voting",
            "Polling Places",
            "Ballots",
            "Secretary of State",
            "Voting Centers"
          ],
          title: "Voting Centers",
          typeKeywords: [
            "Map",
            "Mapping Site",
            "Online Map",
            "WAB2D",
            "Web AppBuilder"
          ]
        } as any,
        data: {} as any,
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      } as common.IItemTemplate;
      const newlyCreatedItem = {
        itemId: "wab1234567890",
        type: "Web Mapping Application",
        key: "ijklmnop",
        item: {
          tags: [
            "Early Voting",
            "Voting",
            "Polling Places",
            "Ballots",
            "Secretary of State",
            "Voting Centers"
          ],
          title: "Voting Centers",
          typeKeywords: [
            "Map",
            "Mapping Site",
            "Online Map",
            "WAB2D",
            "Web AppBuilder"
          ]
        } as any,
        data: {} as any,
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      } as common.IItemTemplate;
      const templateDictionary = {
        folderId: "fld1234567890"
      };

      const createUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/fld1234567890/addItem";
      const expected = {
        success: true,
        id: "cda1234567890",
        folder: "fld1234567890"
      };
      const updateUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/wab1234567890/update";
      fetchMock
        .post(createUrl, expected)
        .post(updateUrl, utils.getSuccessResponse());

      // Function doesn't reject, so,
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      webmappingapplication
        .fineTuneCreatedItem(
          originalTemplate,
          newlyCreatedItem,
          templateDictionary,
          MOCK_USER_SESSION
        )
        .then(() => {
          let calls = fetchMock.calls(createUrl);
          expect(calls.length).toEqual(1);
          calls = fetchMock.calls(updateUrl);
          expect(calls.length).toEqual(1);
          done();
        });
    });

    it("handles fineTuneCreatedItem failure", done => {
      const originalTemplate = {
        itemId: "itm1234567890",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: {
          tags: [
            "Early Voting",
            "Voting",
            "Polling Places",
            "Ballots",
            "Secretary of State",
            "Voting Centers"
          ],
          title: "Voting Centers",
          typeKeywords: [
            "Map",
            "Mapping Site",
            "Online Map",
            "WAB2D",
            "Web AppBuilder"
          ]
        } as any,
        data: {} as any,
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      } as common.IItemTemplate;
      const newlyCreatedItem = {
        itemId: "wab1234567890",
        type: "Web Mapping Application",
        key: "ijklmnop",
        item: {
          tags: [
            "Early Voting",
            "Voting",
            "Polling Places",
            "Ballots",
            "Secretary of State",
            "Voting Centers"
          ],
          title: "Voting Centers",
          typeKeywords: [
            "Map",
            "Mapping Site",
            "Online Map",
            "WAB2D",
            "Web AppBuilder"
          ]
        } as any,
        data: {} as any,
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      } as common.IItemTemplate;
      const templateDictionary = {
        folderId: "fld1234567890"
      };

      const createUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/fld1234567890/addItem";
      const expected = {
        success: false
      };
      const updateUrl: string =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/wab1234567890/update";

      fetchMock.post(createUrl, expected).post(updateUrl, { success: true });

      webmappingapplication
        .fineTuneCreatedItem(
          originalTemplate,
          newlyCreatedItem,
          templateDictionary,
          MOCK_USER_SESSION
        )
        .then(
          () => {
            const calls = fetchMock.calls(createUrl);
            expect(calls.length).toEqual(1);
            done();
          },
          () => {
            const calls = fetchMock.calls(createUrl);
            expect(calls.length).toEqual(1);
            done();
          }
        );
    });
  });

  describe("_getSortOrder ", () => {
    it("sorts url and layer id first", () => {
      const datasourceInfo: common.IDatasourceInfo = {
        basePath: "934a9ef8efa7448fa8ddf7b13cef0240.layer1.fields",
        itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
        layerId: 1,
        ids: [],
        url: "{{934a9ef8efa7448fa8ddf7b13cef0240.url}}",
        fields: [],
        relationships: [],
        adminLayerInfo: {
          geometryField: {
            name: "Shape"
          }
        }
      };
      const testString =
        "nam tincidunt sagittis arcu vestibulum" +
        "{{934a9ef8efa7448fa8ddf7b13cef0240.layer1.url}}" +
        "in at tincidunt lectus. Curabitur vitae lorem mollis";

      const expected = 1;

      const actual = webmappingapplication._getSortOrder(
        datasourceInfo,
        testString
      );
      expect(actual).toEqual(expected);
    });

    it("sorts datasource ids first", () => {
      const datasourceInfo: common.IDatasourceInfo = {
        basePath: "934a9ef8efa7448fa8ddf7b13cef0240.layer1.fields",
        itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
        layerId: 1,
        ids: ["123", "456", "789"],
        fields: [],
        relationships: [],
        adminLayerInfo: {
          geometryField: {
            name: "Shape"
          }
        }
      };
      const testString =
        "nam tincidunt sagittis arcu vestibulum" +
        "456" +
        "in at tincidunt lectus. Curabitur vitae lorem mollis";

      const expected = 1;

      const actual = webmappingapplication._getSortOrder(
        datasourceInfo,
        testString
      );
      expect(actual).toEqual(expected);
    });

    it("sorts base service url second", () => {
      const datasourceInfo: common.IDatasourceInfo = {
        basePath: "934a9ef8efa7448fa8ddf7b13cef0240.layer1.fields",
        itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
        layerId: undefined,
        ids: [],
        url: "{{934a9ef8efa7448fa8ddf7b13cef0240}}",
        fields: [],
        relationships: [],
        adminLayerInfo: {
          geometryField: {
            name: "Shape"
          }
        }
      };
      const testString =
        "nam tincidunt sagittis arcu vestibulum" +
        "{{934a9ef8efa7448fa8ddf7b13cef0240}}" +
        "in at tincidunt lectus. Curabitur vitae lorem mollis";

      const expected = 2;

      const actual = webmappingapplication._getSortOrder(
        datasourceInfo,
        testString
      );
      expect(actual).toEqual(expected);
    });

    it("sorts AGOL item id reference third", () => {
      const datasourceInfo: common.IDatasourceInfo = {
        basePath: "934a9ef8efa7448fa8ddf7b13cef0240.layer1.fields",
        itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
        layerId: 1,
        ids: [],
        url: "",
        fields: [],
        relationships: [],
        adminLayerInfo: {
          geometryField: {
            name: "Shape"
          }
        }
      };
      const testString =
        "nam tincidunt sagittis arcu vestibulum" +
        "{{934a9ef8efa7448fa8ddf7b13cef0240}}" +
        "in at tincidunt lectus. Curabitur vitae lorem mollis";

      const expected = 3;

      const actual = webmappingapplication._getSortOrder(
        datasourceInfo,
        testString
      );
      expect(actual).toEqual(expected);
    });

    it("defaults sort to fourth", () => {
      const datasourceInfo: common.IDatasourceInfo = {
        basePath: "934a9ef8efa7448fa8ddf7b13cef0240.layer1.fields",
        itemId: "",
        layerId: 1,
        ids: [],
        url: "",
        fields: [],
        relationships: [],
        adminLayerInfo: {
          geometryField: {
            name: "Shape"
          }
        }
      };
      const testString =
        "nam tincidunt sagittis arcu vestibulum" +
        "{{934a9ef8efa7448fa8ddf7b13cef0240}}" +
        "in at tincidunt lectus. Curabitur vitae lorem mollis";

      const expected = 4;

      const actual = webmappingapplication._getSortOrder(
        datasourceInfo,
        testString
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("_prioritizedTests", () => {
    it("handles missing url", () => {
      const datasourceInfo: common.IDatasourceInfo = {
        basePath: "934a9ef8efa7448fa8ddf7b13cef0240.layer1.fields",
        itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
        layerId: 1,
        ids: ["123", "456", "789"],
        fields: [],
        relationships: [],
        adminLayerInfo: {
          geometryField: {
            name: "Shape"
          }
        }
      };

      const expected: any = null;

      const actual = webmappingapplication._prioritizedTests(
        null,
        [datasourceInfo],
        false
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("replaceUrl", () => {
    it("can replace partial url", () => {
      const url: string = "https://localdeployment.maps.arcgis.com";
      const newUrl: string = "{{portalBaseUrl}}";
      const objString: string = JSON.stringify({
        url:
          "https://localdeployment.maps.arcgis.com/sharing/rest/content/items/"
      });
      const expected: string = JSON.stringify({
        url: "{{portalBaseUrl}}/sharing/rest/content/items/"
      });
      const actual: string = webmappingapplication.replaceUrl(
        objString,
        url,
        newUrl
      );
      expect(actual).toEqual(expected);
    });

    it("can enforce must match full url", () => {
      let objString: any = JSON.stringify({
        url1:
          "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/EducationalFacilities_public/FeatureServer/0",
        url2:
          "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/EducationalFacilities_public/FeatureServer/",
        url3:
          "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/EducationalFacilities_public/FeatureServer/1"
      });

      const urls: string[] = [
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/EducationalFacilities_public/FeatureServer/0",
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/EducationalFacilities_public/FeatureServer/",
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/EducationalFacilities_public/FeatureServer/1"
      ];

      const newUrls: string[] = [
        "{{206386ad6806406280093882b5cb049c.layer0.url}}",
        "{{206386ad6806406280093882b5cb049c.url}}",
        "{{206386ad6806406280093882b5cb049c.layer1.url}}"
      ];

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const newUrl = newUrls[i];
        objString = webmappingapplication.replaceUrl(
          objString,
          url,
          newUrl,
          true
        );
      }

      const expected: string = JSON.stringify({
        url1: "{{206386ad6806406280093882b5cb049c.layer0.url}}",
        url2: "{{206386ad6806406280093882b5cb049c.url}}",
        url3: "{{206386ad6806406280093882b5cb049c.layer1.url}}"
      });
      expect(objString).toEqual(expected);
    });

    it("can ignore force full url for simple url", () => {
      const urls: string[] = [
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/EducationalFacilities_public/FeatureServer/0",
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/EducationalFacilities_public/FeatureServer/",
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/EducationalFacilities_public/FeatureServer/1"
      ];

      const newUrls: string[] = [
        "{{206386ad6806406280093882b5cb049c.layer0.url}}",
        "{{206386ad6806406280093882b5cb049c.url}}",
        "{{206386ad6806406280093882b5cb049c.layer1.url}}"
      ];

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const newUrl = newUrls[i];
        const actual = webmappingapplication.replaceUrl(url, url, newUrl, true);
        expect(actual).toEqual(newUrl);
      }
    });
  });

  describe("_templatizeParentByURL", () => {
    it("handles missing url", () => {
      const datasourceInfo: common.IDatasourceInfo = {
        basePath: "934a9ef8efa7448fa8ddf7b13cef0240.layer1.fields",
        itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
        layerId: 1,
        ids: ["123", "456", "789"],
        fields: [],
        relationships: [],
        adminLayerInfo: {
          geometryField: {
            name: "Shape"
          }
        }
      };

      const expected: any = {} as { [index: string]: any };

      const actual = webmappingapplication._templatizeParentByURL(
        null,
        datasourceInfo,
        false
      );
      expect(actual).toEqual(expected);
    });
  });
});

const _infoLookupTemplate: any = {
  itemId: "7a26dcae7c71439286e9d873c77bb6cc",
  type: "Web Mapping Application",
  key: "bb04yrqv",
  item: {
    id: "{{7a26dcae7c71439286e9d873c77bb6cc.itemId}}",
    type: "Web Mapping Application",
    categories: [],
    culture: "en-us",
    description: null,
    extent: "{{solutionItemExtent}}",
    licenseInfo: null,
    name: null,
    snippet: null,
    tags: ["test"],
    thumbnail: "thumbnail/ago_downloaded.png",
    title: "InfoLookupTemplateApp",
    typeKeywords: [
      "JavaScript",
      "Map",
      "Mapping Site",
      "Online Map",
      "Web Map"
    ],
    url:
      "https://localdeployment.maps.arcgis.com/apps/InformationLookup/index.html?appid=7a26dcae7c71439286e9d873c77bb6cc"
  },
  data: {
    source: "54da82ed8d264bbbb7f9087df8c947c3",
    folderId: null,
    values: {
      icon: "iconValue",
      serviceAreaLayerNames: "Service Area",
      serviceAreaLayerNamesSelector:
        '[{"id":"TestLayer2FromWebApp_4042","fields":[],"type":"FeatureLayer"},{"id":"TestLayer2FromWebApp_8439","fields":[],"type":"FeatureLayer"},{"id":"TestLayer2FromWebApp_5607","fields":[],"type":"FeatureLayer"},{"id":"TestLayer2FromWebApp_9409","fields":[],"type":"FeatureLayer"},{"id":"TestLayerForDashBoardMap_2615","fields":[],"type":"FeatureLayer"},{"id":"TestLayerForDashBoardMap_8627","fields":[],"type":"FeatureLayer"},{"id":"TestLayerForDashBoardMap_7797","fields":[],"type":"FeatureLayer"},{"id":"TestLayerForDashBoardMap_5389","fields":[],"type":"FeatureLayer"},{"id":"TestLayerForDashBoardMap_5538","fields":[],"type":"FeatureLayer"},{"id":"TestLayerForDashBoardMap_2914","fields":[],"type":"FeatureLayer"},{"id":"TestLayerForDashBoardMap_7041","fields":[],"type":"FeatureLayer"},{"id":"TestLayerForDashBoardMap_2892","fields":[],"type":"FeatureLayer"}]',
      popupTitle: "Service Information",
      popupWidth: null,
      popupHeight: null,
      serviceUnavailableTitle: "Outside Service Area",
      serviceUnavailableMessage:
        "No information is available at the selected location.",
      noSearchFeatureTitle: "No Search Feature Found",
      noSearchFeatureMessage:
        "A search feature used to lookup information was not found.  Please select a new location.",
      zoomLevel: 18,
      storeLocation: true,
      serviceRequestLayerAvailibiltyFieldValueAvail: "Intersected",
      serviceRequestLayerAvailibiltyFieldValueNotAvail: "Not Intersected",
      serviceRequestLayerAvailibiltyFieldValueNoSearch: "No Search Feature",
      showSplash: false,
      splashText:
        "<center>Information Lookup is a configurable web application template that can be used to provide the general public, internal staff and other interested parties the with information about a location. If no features are found at that location, a general message is displayed. Optionally, the location entered can be stored in a point layer. The template can be configured using the ArcGIS Online Configuration dialog.</center>",
      basemapWidgetVisible: true,
      search: true,
      title: "Information Lookup",
      color: "#FFFFFF",
      backcolor: "#000000",
      hypercolor: "#0000EE",
      uidirection: "left",
      splashHeight: 350,
      splashWidth: 290,
      showUI: false,
      popupSide: false,
      popPostMessage: "",
      popPreMessage: "",
      orientForMobile: false,
      linksInPopup: false,
      linksInPopupSide: true,
      minLineSize: 1,
      minPolygonSize: 5,
      checkSize: false,
      onlySearchFeature: false,
      searchTol: 4,
      pointOverlap: 40,
      pointOverlapUnit: "feet",
      searchConfig: {
        sources: [
          {
            locator: {
              url:
                "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
              _url: {
                path:
                  "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
                query: null
              },
              normalization: true
            },
            url:
              "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
            northLat: "Ymax",
            southLat: "Ymin",
            eastLon: "Xmax",
            westLon: "Xmin",
            name: "ArcGIS World Geocoding Service",
            placefinding: true,
            batch: true,
            enableSuggestions: true,
            singleLineFieldName: "SingleLine",
            enable: true,
            id: "dojoUnique393"
          },
          {
            flayerId: "TestLayer2FromWebApp_4042",
            url:
              "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayer2FromWebApp/FeatureServer/3",
            name: "TestLayer2FromWebApp - Stands",
            id: "dojoUnique394",
            enable: true,
            placeholder: "",
            searchFields: ["OBJECTID"]
          },
          {
            flayerId: "TestLayer2FromWebApp_8439",
            url:
              "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayer2FromWebApp/FeatureServer/2",
            name: "TestLayer2FromWebApp - Property",
            id: "dojoUnique395",
            enable: true,
            placeholder: "",
            searchFields: ["OBJECTID"]
          },
          {
            flayerId: "TestLayer2FromWebApp_5607",
            url:
              "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayer2FromWebApp/FeatureServer/1",
            name: "TestLayer2FromWebApp - Chemical Activity",
            id: "dojoUnique396",
            enable: true,
            placeholder: "",
            searchFields: ["OBJECTID"]
          },
          {
            flayerId: "TestLayer2FromWebApp_9409",
            url:
              "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayer2FromWebApp/FeatureServer/0",
            name: "TestLayer2FromWebApp - HarvestActivity",
            id: "dojoUnique397",
            enable: true,
            placeholder: "",
            searchFields: ["OBJECTID"]
          },
          {
            flayerId: "TestLayerForDashBoardMap_2615",
            url:
              "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/7",
            name: "TestLayerForDashBoardMap - Incident Area",
            id: "dojoUnique398",
            enable: true,
            placeholder: "",
            searchFields: ["OBJECTID"]
          },
          {
            flayerId: "TestLayerForDashBoardMap_8627",
            url:
              "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/6",
            name: "TestLayerForDashBoardMap - DemographicPolygons",
            id: "dojoUnique399",
            enable: true,
            placeholder: "",
            searchFields: ["OBJECTID"]
          },
          {
            flayerId: "TestLayerForDashBoardMap_7797",
            url:
              "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/5",
            name: "TestLayerForDashBoardMap - Road Closure",
            id: "dojoUnique400",
            enable: true,
            placeholder: "",
            searchFields: ["OBJECTID"]
          },
          {
            flayerId: "TestLayerForDashBoardMap_5389",
            url:
              "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/4",
            name: "TestLayerForDashBoardMap - Bridges",
            id: "dojoUnique401",
            enable: true,
            placeholder: "",
            searchFields: ["OBJECTID"]
          },
          {
            flayerId: "TestLayerForDashBoardMap_5538",
            url:
              "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/3",
            name: "TestLayerForDashBoardMap - Emergency Assistance",
            id: "dojoUnique402",
            enable: true,
            placeholder: "",
            searchFields: ["OBJECTID"]
          },
          {
            flayerId: "TestLayerForDashBoardMap_2914",
            url:
              "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/2",
            name: "TestLayerForDashBoardMap - Emergency Shelter",
            id: "dojoUnique403",
            enable: true,
            placeholder: "",
            searchFields: ["OBJECTID"]
          },
          {
            flayerId: "TestLayerForDashBoardMap_7041",
            url:
              "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/1",
            name: "TestLayerForDashBoardMap - School",
            id: "dojoUnique404",
            enable: true,
            placeholder: "",
            searchFields: ["OBJECTID"]
          },
          {
            flayerId: "TestLayerForDashBoardMap_2892",
            url:
              "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/0",
            name: "TestLayerForDashBoardMap - Hospital",
            id: "dojoUnique405",
            enable: true,
            placeholder: "",
            searchFields: ["OBJECTID"]
          }
        ],
        activeSourceIndex: "all",
        enableSearchingAll: true
      },
      webmap: "eb6dc49be6f44f76aa195d6de8ce5c48",
      serviceRequestLayerName: {
        id: "TestLayerForDashBoardMap_5538",
        fields: [
          {
            id: "serviceRequestLayerAvailibiltyField",
            fields: ["OBJECTID"]
          }
        ]
      },
      searchByLayer: {
        id: "TestLayerForDashBoardMap_7797",
        fields: [
          {
            id: "urlField",
            fields: ["OBJECTID"]
          }
        ]
      },
      customUrlLayer: {
        id: "TestLayerForDashBoardMap_5389",
        fields: [
          {
            id: "urlField",
            fields: ["OBJECTID"]
          }
        ]
      }
    }
  },
  resources: [
    "7a26dcae7c71439286e9d873c77bb6cc_info_thumbnail/ago_downloaded.png"
  ],
  dependencies: [],
  properties: {},
  estimatedDeploymentCostFactor: 2
};

const expectedInfoLookupTemplate: any = {
  itemId: "7a26dcae7c71439286e9d873c77bb6cc",
  type: "Web Mapping Application",
  key: "bb04yrqv",
  item: {
    type: "Web Mapping Application",
    id: "{{7a26dcae7c71439286e9d873c77bb6cc.itemId}}",
    categories: [],
    culture: "en-us",
    description: null,
    extent: "{{solutionItemExtent}}",
    licenseInfo: null,
    name: null,
    snippet: null,
    tags: ["test"],
    thumbnail: "thumbnail/ago_downloaded.png",
    title: "InfoLookupTemplateApp",
    typeKeywords: [
      "JavaScript",
      "Map",
      "Mapping Site",
      "Online Map",
      "Web Map"
    ],
    url:
      "{{portalBaseUrl}}/apps/InformationLookup/index.html?appid={{7a26dcae7c71439286e9d873c77bb6cc.itemId}}"
  },
  data: {
    source: "54da82ed8d264bbbb7f9087df8c947c3",
    folderId: null,
    values: {
      icon: "{{portalBaseUrl}}",
      serviceAreaLayerNames: "Service Area",
      serviceAreaLayerNamesSelector:
        '[{"id":"TestLayer2FromWebApp_4042","fields":[],"type":"FeatureLayer"},{"id":"TestLayer2FromWebApp_8439","fields":[],"type":"FeatureLayer"},{"id":"TestLayer2FromWebApp_5607","fields":[],"type":"FeatureLayer"},{"id":"TestLayer2FromWebApp_9409","fields":[],"type":"FeatureLayer"},{"id":"TestLayerForDashBoardMap_2615","fields":[],"type":"FeatureLayer"},{"id":"TestLayerForDashBoardMap_8627","fields":[],"type":"FeatureLayer"},{"id":"TestLayerForDashBoardMap_7797","fields":[],"type":"FeatureLayer"},{"id":"TestLayerForDashBoardMap_5389","fields":[],"type":"FeatureLayer"},{"id":"TestLayerForDashBoardMap_5538","fields":[],"type":"FeatureLayer"},{"id":"TestLayerForDashBoardMap_2914","fields":[],"type":"FeatureLayer"},{"id":"TestLayerForDashBoardMap_7041","fields":[],"type":"FeatureLayer"},{"id":"TestLayerForDashBoardMap_2892","fields":[],"type":"FeatureLayer"}]',
      popupTitle: "Service Information",
      popupWidth: null,
      popupHeight: null,
      serviceUnavailableTitle: "Outside Service Area",
      serviceUnavailableMessage:
        "No information is available at the selected location.",
      noSearchFeatureTitle: "No Search Feature Found",
      noSearchFeatureMessage:
        "A search feature used to lookup information was not found.  Please select a new location.",
      zoomLevel: 18,
      storeLocation: true,
      serviceRequestLayerAvailibiltyFieldValueAvail: "Intersected",
      serviceRequestLayerAvailibiltyFieldValueNotAvail: "Not Intersected",
      serviceRequestLayerAvailibiltyFieldValueNoSearch: "No Search Feature",
      showSplash: false,
      splashText:
        "<center>Information Lookup is a configurable web application template that can be used to provide the general public, internal staff and other interested parties the with information about a location. If no features are found at that location, a general message is displayed. Optionally, the location entered can be stored in a point layer. The template can be configured using the ArcGIS Online Configuration dialog.</center>",
      basemapWidgetVisible: true,
      search: true,
      title: "Information Lookup",
      color: "#FFFFFF",
      backcolor: "#000000",
      hypercolor: "#0000EE",
      uidirection: "left",
      splashHeight: 350,
      splashWidth: 290,
      showUI: false,
      popupSide: false,
      popPostMessage: "",
      popPreMessage: "",
      orientForMobile: false,
      linksInPopup: false,
      linksInPopupSide: true,
      minLineSize: 1,
      minPolygonSize: 5,
      checkSize: false,
      onlySearchFeature: false,
      searchTol: 4,
      pointOverlap: 40,
      pointOverlapUnit: "feet",
      searchConfig: {
        sources: [
          {
            locator: {
              url:
                "{{organization.helperServices.geocode:getDefaultLocatorURL}}",
              _url: {
                path:
                  "{{organization.helperServices.geocode:getDefaultLocatorURL}}",
                query: null
              },
              normalization: true
            },
            url: "{{organization.helperServices.geocode:getDefaultLocatorURL}}",
            northLat: "Ymax",
            southLat: "Ymin",
            eastLon: "Xmax",
            westLon: "Xmin",
            name: "ArcGIS World Geocoding Service",
            placefinding: true,
            batch: true,
            enableSuggestions: true,
            singleLineFieldName: "SingleLine",
            enable: true,
            id: "dojoUnique393"
          },
          {
            flayerId: "TestLayer2FromWebApp_4042",
            url: "{{b19aec399444407da84fffe2a55d4151.layer3.url}}",
            name: "TestLayer2FromWebApp - Stands",
            id: "dojoUnique394",
            enable: true,
            placeholder: "",
            searchFields: [
              "{{b19aec399444407da84fffe2a55d4151.layer3.fields.objectid.name}}"
            ]
          },
          {
            flayerId: "TestLayer2FromWebApp_8439",
            url: "{{b19aec399444407da84fffe2a55d4151.layer2.url}}",
            name: "TestLayer2FromWebApp - Property",
            id: "dojoUnique395",
            enable: true,
            placeholder: "",
            searchFields: [
              "{{b19aec399444407da84fffe2a55d4151.layer2.fields.objectid.name}}"
            ]
          },
          {
            flayerId: "TestLayer2FromWebApp_5607",
            url: "{{b19aec399444407da84fffe2a55d4151.layer1.url}}",
            name: "TestLayer2FromWebApp - Chemical Activity",
            id: "dojoUnique396",
            enable: true,
            placeholder: "",
            searchFields: [
              "{{b19aec399444407da84fffe2a55d4151.layer1.fields.objectid.name}}"
            ]
          },
          {
            flayerId: "TestLayer2FromWebApp_9409",
            url: "{{b19aec399444407da84fffe2a55d4151.layer0.url}}",
            name: "TestLayer2FromWebApp - HarvestActivity",
            id: "dojoUnique397",
            enable: true,
            placeholder: "",
            searchFields: [
              "{{b19aec399444407da84fffe2a55d4151.layer0.fields.objectid.name}}"
            ]
          },
          {
            flayerId: "TestLayerForDashBoardMap_2615",
            url: "{{4efe5f693de34620934787ead6693f19.layer7.url}}",
            name: "TestLayerForDashBoardMap - Incident Area",
            id: "dojoUnique398",
            enable: true,
            placeholder: "",
            searchFields: [
              "{{4efe5f693de34620934787ead6693f19.layer7.fields.objectid.name}}"
            ]
          },
          {
            flayerId: "TestLayerForDashBoardMap_8627",
            url: "{{4efe5f693de34620934787ead6693f19.layer6.url}}",
            name: "TestLayerForDashBoardMap - DemographicPolygons",
            id: "dojoUnique399",
            enable: true,
            placeholder: "",
            searchFields: [
              "{{4efe5f693de34620934787ead6693f19.layer6.fields.objectid.name}}"
            ]
          },
          {
            flayerId: "TestLayerForDashBoardMap_7797",
            url: "{{4efe5f693de34620934787ead6693f19.layer5.url}}",
            name: "TestLayerForDashBoardMap - Road Closure",
            id: "dojoUnique400",
            enable: true,
            placeholder: "",
            searchFields: [
              "{{4efe5f693de34620934787ead6693f19.layer5.fields.objectid.name}}"
            ]
          },
          {
            flayerId: "TestLayerForDashBoardMap_5389",
            url: "{{4efe5f693de34620934787ead6693f19.layer4.url}}",
            name: "TestLayerForDashBoardMap - Bridges",
            id: "dojoUnique401",
            enable: true,
            placeholder: "",
            searchFields: [
              "{{4efe5f693de34620934787ead6693f19.layer4.fields.objectid.name}}"
            ]
          },
          {
            flayerId: "TestLayerForDashBoardMap_5538",
            url: "{{4efe5f693de34620934787ead6693f19.layer3.url}}",
            name: "TestLayerForDashBoardMap - Emergency Assistance",
            id: "dojoUnique402",
            enable: true,
            placeholder: "",
            searchFields: [
              "{{4efe5f693de34620934787ead6693f19.layer3.fields.objectid.name}}"
            ]
          },
          {
            flayerId: "TestLayerForDashBoardMap_2914",
            url: "{{4efe5f693de34620934787ead6693f19.layer2.url}}",
            name: "TestLayerForDashBoardMap - Emergency Shelter",
            id: "dojoUnique403",
            enable: true,
            placeholder: "",
            searchFields: [
              "{{4efe5f693de34620934787ead6693f19.layer2.fields.objectid.name}}"
            ]
          },
          {
            flayerId: "TestLayerForDashBoardMap_7041",
            url: "{{4efe5f693de34620934787ead6693f19.layer1.url}}",
            name: "TestLayerForDashBoardMap - School",
            id: "dojoUnique404",
            enable: true,
            placeholder: "",
            searchFields: [
              "{{4efe5f693de34620934787ead6693f19.layer1.fields.objectid.name}}"
            ]
          },
          {
            flayerId: "TestLayerForDashBoardMap_2892",
            url: "{{4efe5f693de34620934787ead6693f19.layer0.url}}",
            name: "TestLayerForDashBoardMap - Hospital",
            id: "dojoUnique405",
            enable: true,
            placeholder: "",
            searchFields: [
              "{{4efe5f693de34620934787ead6693f19.layer0.fields.objectid.name}}"
            ]
          }
        ],
        activeSourceIndex: "all",
        enableSearchingAll: true
      },
      webmap: "{{eb6dc49be6f44f76aa195d6de8ce5c48.itemId}}",
      serviceRequestLayerName: {
        id: "TestLayerForDashBoardMap_5538",
        fields: [
          {
            id: "serviceRequestLayerAvailibiltyField",
            fields: [
              "{{4efe5f693de34620934787ead6693f19.layer3.fields.objectid.name}}"
            ]
          }
        ]
      },
      searchByLayer: {
        id: "TestLayerForDashBoardMap_7797",
        fields: [
          {
            id: "urlField",
            fields: [
              "{{4efe5f693de34620934787ead6693f19.layer5.fields.objectid.name}}"
            ]
          }
        ]
      },
      customUrlLayer: {
        id: "TestLayerForDashBoardMap_5389",
        fields: [
          {
            id: "urlField",
            fields: [
              "{{4efe5f693de34620934787ead6693f19.layer4.fields.objectid.name}}"
            ]
          }
        ]
      }
    }
  },
  resources: [
    "7a26dcae7c71439286e9d873c77bb6cc_info_thumbnail/ago_downloaded.png"
  ],
  dependencies: ["eb6dc49be6f44f76aa195d6de8ce5c48"],
  properties: {},
  estimatedDeploymentCostFactor: 2
};

const infoLookupDatasourceInfos: any[] = [
  {
    itemId: "4efe5f693de34620934787ead6693f19",
    layerId: 0,
    fields: [
      {
        name: "OBJECTID"
      }
    ],
    basePath: "4efe5f693de34620934787ead6693f19.layer0.fields",
    url: "{{4efe5f693de34620934787ead6693f19.url}}",
    ids: ["TestLayerForDashBoardMap_2892"]
  },
  {
    itemId: "4efe5f693de34620934787ead6693f19",
    layerId: 1,
    fields: [
      {
        name: "OBJECTID"
      }
    ],
    basePath: "4efe5f693de34620934787ead6693f19.layer1.fields",
    url: "{{4efe5f693de34620934787ead6693f19.url}}",
    ids: ["TestLayerForDashBoardMap_7041"]
  },
  {
    itemId: "4efe5f693de34620934787ead6693f19",
    layerId: 2,
    fields: [
      {
        name: "OBJECTID"
      }
    ],
    basePath: "4efe5f693de34620934787ead6693f19.layer2.fields",
    url: "{{4efe5f693de34620934787ead6693f19.url}}",
    ids: ["TestLayerForDashBoardMap_2914"]
  },
  {
    url: "{{4efe5f693de34620934787ead6693f19.url}}",
    itemId: "4efe5f693de34620934787ead6693f19",
    layerId: 3,
    fields: [
      {
        name: "OBJECTID"
      }
    ],
    basePath: "4efe5f693de34620934787ead6693f19.layer3.fields",
    ids: ["TestLayerForDashBoardMap_5538"]
  },
  {
    itemId: "4efe5f693de34620934787ead6693f19",
    layerId: 4,
    fields: [
      {
        name: "OBJECTID"
      }
    ],
    basePath: "4efe5f693de34620934787ead6693f19.layer4.fields",
    url: "{{4efe5f693de34620934787ead6693f19.url}}",
    ids: ["TestLayerForDashBoardMap_5389"]
  },
  {
    itemId: "4efe5f693de34620934787ead6693f19",
    layerId: 5,
    fields: [
      {
        name: "OBJECTID"
      }
    ],
    basePath: "4efe5f693de34620934787ead6693f19.layer5.fields",
    url: "{{4efe5f693de34620934787ead6693f19.url}}",
    ids: ["TestLayerForDashBoardMap_7797"]
  },
  {
    itemId: "4efe5f693de34620934787ead6693f19",
    layerId: 6,
    fields: [
      {
        name: "OBJECTID"
      }
    ],
    basePath: "4efe5f693de34620934787ead6693f19.layer6.fields",
    url: "{{4efe5f693de34620934787ead6693f19.url}}",
    ids: ["TestLayerForDashBoardMap_8627"]
  },
  {
    itemId: "4efe5f693de34620934787ead6693f19",
    layerId: 7,
    fields: [
      {
        name: "OBJECTID"
      }
    ],
    basePath: "4efe5f693de34620934787ead6693f19.layer7.fields",
    url: "{{4efe5f693de34620934787ead6693f19.url}}",
    ids: ["TestLayerForDashBoardMap_2615"]
  },
  {
    itemId: "b19aec399444407da84fffe2a55d4151",
    layerId: 0,
    fields: [
      {
        name: "OBJECTID"
      }
    ],
    basePath: "b19aec399444407da84fffe2a55d4151.layer0.fields",
    url: "{{b19aec399444407da84fffe2a55d4151.url}}",
    ids: ["TestLayer2FromWebApp_9409"]
  },
  {
    itemId: "b19aec399444407da84fffe2a55d4151",
    layerId: 1,
    fields: [
      {
        name: "OBJECTID"
      }
    ],
    basePath: "b19aec399444407da84fffe2a55d4151.layer1.fields",
    url: "{{b19aec399444407da84fffe2a55d4151.url}}",
    ids: ["TestLayer2FromWebApp_5607"]
  },
  {
    itemId: "b19aec399444407da84fffe2a55d4151",
    layerId: 2,
    fields: [
      {
        name: "OBJECTID"
      }
    ],
    basePath: "b19aec399444407da84fffe2a55d4151.layer2.fields",
    url: "{{b19aec399444407da84fffe2a55d4151.url}}",
    ids: ["TestLayer2FromWebApp_8439"]
  },
  {
    itemId: "b19aec399444407da84fffe2a55d4151",
    layerId: 3,
    fields: [
      {
        name: "OBJECTID"
      }
    ],
    basePath: "b19aec399444407da84fffe2a55d4151.layer3.fields",
    url: "{{b19aec399444407da84fffe2a55d4151.url}}",
    ids: ["TestLayer2FromWebApp_4042"]
  },
  {
    itemId: "b19aec399444407da84fffe2a55d4151",
    layerId: 4,
    fields: [
      {
        name: "OBJECTID"
      }
    ],
    basePath: "b19aec399444407da84fffe2a55d4151.layer4.fields",
    url: "{{b19aec399444407da84fffe2a55d4151.url}}",
    ids: []
  },
  {
    itemId: "b19aec399444407da84fffe2a55d4151",
    layerId: 5,
    fields: [
      {
        name: "OBJECTID"
      }
    ],
    basePath: "b19aec399444407da84fffe2a55d4151.layer5.fields",
    url: "{{b19aec399444407da84fffe2a55d4151.url}}",
    ids: []
  },
  {
    itemId: "b19aec399444407da84fffe2a55d4151",
    layerId: 6,
    fields: [
      {
        name: "OBJECTID"
      }
    ],
    basePath: "b19aec399444407da84fffe2a55d4151.layer6.fields",
    url: "{{b19aec399444407da84fffe2a55d4151.url}}",
    ids: []
  },
  {
    itemId: "b19aec399444407da84fffe2a55d4151",
    layerId: 7,
    fields: [
      {
        name: "OBJECTID"
      }
    ],
    basePath: "b19aec399444407da84fffe2a55d4151.layer7.fields",
    url: "{{b19aec399444407da84fffe2a55d4151.url}}",
    ids: []
  },
  {
    itemId: "b19aec399444407da84fffe2a55d4151",
    layerId: 8,
    fields: [
      {
        name: "OBJECTID"
      }
    ],
    basePath: "b19aec399444407da84fffe2a55d4151.layer8.fields",
    url: "{{b19aec399444407da84fffe2a55d4151.url}}",
    ids: []
  }
];
