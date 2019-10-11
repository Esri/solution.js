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
 * Provides tests for common functions involving the management of item and group resources.
 */

import * as auth from "@esri/arcgis-rest-auth";
import * as common from "@esri/solution-common";
import * as webmappingapplication from "../src/webmappingapplication";

import { TOMORROW } from "./lib/utils";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `webmappingapplication`: manages the creation and deployment of web mapping application item types", () => {
  // Set up a UserSession to use in all of these tests
  const MOCK_USER_SESSION = new auth.UserSession({
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
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "itm1234567890",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: { title: "Voting Centers" } as any,
        data: {
          appItemId: "{{myAppItemId.itemId}}",
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
            "{{organization.portalBaseUrl}}/apps/CrowdsourcePolling/index.html?appid={{itm1234567890.itemId}}"
        } as any,
        data: {
          folderId: "{{folderId}}"
        } as any,
        resources: [] as any[],
        dependencies: [] as any[],
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
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "itm1234567890",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: { title: "Voting Centers" } as any,
        data: {
          appItemId: "{{myAppItemId.itemId}}",
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
                portalUrl: "{{organization.portalBaseUrl}}",
                itemId: "{{2ea59a64b34646f8972a71c7d536e4a3.itemId}}",
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
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };

      const layer0: any = {
        serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
        id: 0
      };

      fetchMock.post(
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
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      fetchMock.post(
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
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "itm1234567890",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: { title: "Voting Centers" } as any,
        data: {
          appItemId: "{{myAppItemId.itemId}}",
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
                portalUrl: "{{organization.portalBaseUrl}}",
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
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "f3223bda3c304dd0bf46dee75ac31aae",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: {
          id: "{{f3223bda3c304dd0bf46dee75ac31aae.itemId}}",
          title: "Voting Centers",
          url:
            "{{organization.portalBaseUrl}}/apps/webappviewer/index.html?id={{f3223bda3c304dd0bf46dee75ac31aae.itemId}}"
        },
        data: {
          appItemId: "{{myAppItemId.itemId}}",
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
                icon: "{{organization.portalBaseUrl}}/somename.png",
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
                    s: "{{organization.portalBaseUrl}}"
                  },
                  geocodeProps: {
                    service: "{{organization.geocodeServerUrl}}"
                  },
                  routeProps: {
                    service: "{{organization.naServerUrl}}"
                  }
                }
              }
            ]
          }
        },
        resources: [] as any[],
        dependencies: ["myMapId"],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };

      const layer1: any = {
        serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
        id: 1
      };

      fetchMock
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
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "f3223bda3c304dd0bf46dee75ac31aae",
        type: "Web Mapping Application",
        key: "abcdefgh",
        item: {
          id: "{{f3223bda3c304dd0bf46dee75ac31aae.itemId}}",
          title: "Voting Centers",
          url:
            "{{organization.portalBaseUrl}}/apps/webappviewer/index.html?id={{f3223bda3c304dd0bf46dee75ac31aae.itemId}}"
        },
        data: {
          appItemId: "{{myAppItemId.itemId}}",
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
                icon: "{{organization.portalBaseUrl}}/somename.png",
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
                    service: "{{organization.geocodeServerUrl}}"
                  },
                  routeProps: {
                    service: "{{organization.naServerUrl}}"
                  }
                }
              }
            ]
          },
          widgetOnScreen: {
            widgets: [
              {
                icon: "{{organization.portalBaseUrl}}/somename.png",
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
                    service: "{{organization.geocodeServerUrl}}"
                  },
                  routeProps: {
                    service: "{{organization.naServerUrl}}"
                  }
                }
              }
            ]
          }
        },
        resources: [] as any[],
        dependencies: ["myMapId"],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };

      const layer1: any = {
        serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
        id: 1
      };

      fetchMock
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
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };

      const layer1: any = {
        serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
        id: 1
      };

      fetchMock
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
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };

      const layer1: any = {
        serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
        id: 1
      };

      fetchMock
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
  });

  describe("fineTuneCreatedItem", () => {
    xit("fineTuneCreatedItem", done => {
      console.warn("========== TODO ==========");
      done.fail();
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem";
      const expected = {
        success: true,
        id: "cda1234567890",
        folder: "fld1234567890"
      };
      fetchMock.post(createUrl, expected);

      // Function doesn't reject, so,
      // tslint:disable-next-line:no-floating-promises
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/fld1234567890/addItem";
      const expected = {
        success: true,
        id: "cda1234567890",
        folder: "fld1234567890"
      };
      fetchMock.post(createUrl, expected);

      // Function doesn't reject, so,
      // tslint:disable-next-line:no-floating-promises
      webmappingapplication
        .fineTuneCreatedItem(
          originalTemplate,
          newlyCreatedItem,
          templateDictionary,
          MOCK_USER_SESSION
        )
        .then(() => {
          const calls = fetchMock.calls(createUrl);
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/fld1234567890/addItem";
      const expected = {
        success: false
      };
      fetchMock.post(createUrl, expected);

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

  describe("postProcessFieldReferences", () => {
    xit("postProcessFieldReferences", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_templatizeDatasourceFieldReferences", () => {
    xit("_templatizeDatasourceFieldReferences", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_templatizeWidgetFieldReferences", () => {
    xit("_templatizeWidgetFieldReferences", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_getReplaceOrder", () => {
    xit("_getReplaceOrder", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_getSortOrder ", () => {
    xit("_getSortOrder ", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_prioritizedTests", () => {
    xit("_prioritizedTests", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_templatizeParentByURL", () => {
    xit("_templatizeParentByURL", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_templatizeParentByWebMapLayerId", () => {
    xit("_templatizeParentByWebMapLayerId", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });
});
