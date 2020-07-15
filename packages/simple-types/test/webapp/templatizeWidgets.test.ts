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
import * as common from "@esri/solution-common";
import * as fetchMock from "fetch-mock";
import { templatizeWidgets } from "../../src/webapp/templatizeWidgets";

let MOCK_USER_SESSION: common.UserSession;

describe("webapp :: templatizeWidgets :: ", () => {
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
      .post("http://fake.com/arcgis/rest/services/test/FeatureServer/1", layer1)
      .post(
        "http://fake.com/arcgis/rest/services/test/FeatureServer/2",
        layer2
      );

    templatizeWidgets(
      itemTemplate,
      MOCK_USER_SESSION,
      portalUrl,
      widgetPath
    ).then(
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

    templatizeWidgets(
      itemTemplate,
      MOCK_USER_SESSION,
      portalUrl,
      widgetPath
    ).then(
      (updatedItemTemplate: common.IItemTemplate) => {
        expect(updatedItemTemplate).toEqual(expectedItemTemplate);
        done();
      },
      e => done.fail()
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
      .post("http://fake.com/arcgis/rest/services/test/FeatureServer/1", layer1)
      .post(
        "http://fake.com/arcgis/rest/services/test/FeatureServer/2",
        layer2
      );

    templatizeWidgets(
      itemTemplate,
      MOCK_USER_SESSION,
      portalUrl,
      widgetPath
    ).then(
      (updatedItemTemplate: common.IItemTemplate) => {
        expect(updatedItemTemplate).toEqual(expectedItemTemplate);
        done();
      },
      e => done.fail()
    );
  });
});
