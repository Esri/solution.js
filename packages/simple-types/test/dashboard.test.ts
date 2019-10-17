/** @license
 * Copyright 2019 Esri
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
 * Provides tests for common functions involving the management of a dashboard item.
 */

import * as dashboard from "../src/dashboard";
import * as fetchMock from "fetch-mock";
import {
  createRuntimeMockUserSession,
  setMockDateTime
} from "../../common/test/mocks/utils";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as common from "../../common/src/generalHelpers";

const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
const now = date.getTime();

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

const MOCK_USER_SESSION = createRuntimeMockUserSession(setMockDateTime(now));

let _initialDashboardTemplate: any;
let _mapDataResponse: any;
let _featureServiceItemResponse: any;
let _externalDatasourceResponse: any;
let _webmapFeatureServiceResponse: any;

beforeEach(() => {
  _initialDashboardTemplate = common.cloneObject(initialDashboardTemplate);
  _mapDataResponse = common.cloneObject(mapDataResponse);
  _featureServiceItemResponse = common.cloneObject(featureServiceItemResponse);
  _externalDatasourceResponse = common.cloneObject(externalDatasourceResponse);
  _webmapFeatureServiceResponse = common.cloneObject(
    webmapFeatureServiceResponse
  );
});

afterEach(() => {
  fetchMock.restore();
});
// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `dashboard`: manages the creation and deployment of dashboard item type", () => {
  describe("convertItemToTemplate", () => {
    if (typeof window !== "undefined") {
      it("should templatize webmap ids and external datasource ids", done => {
        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/generateToken",
            '{"token":"fake-token"}'
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/7e6c41c72d4548d9a312329e0c5a984f/data",
            _mapDataResponse
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/934a9ef8efa7448fa8ddf7b13cef0240?f=json&token=fake-token",
            _featureServiceItemResponse
          )
          .post(
            "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/LayerForDashboardExteternal/FeatureServer/0?f=json",
            _externalDatasourceResponse
          )
          .post(
            "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/2?f=json",
            _webmapFeatureServiceResponse
          );

        dashboard
          .convertItemToTemplate(_initialDashboardTemplate, MOCK_USER_SESSION)
          .then(
            updatedTemplate => {
              expect(updatedTemplate).toEqual(expectedUpdatedTemplate);
              done();
            },
            e => {
              done.fail(e);
            }
          );
      });

      it("should handle error on getting datasource info", done => {
        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/generateToken",
            '{"token":"fake-token"}'
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/7e6c41c72d4548d9a312329e0c5a984f/data",
            _mapDataResponse
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/934a9ef8efa7448fa8ddf7b13cef0240?f=json&token=fake-token",
            _featureServiceItemResponse
          )
          .post(
            "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/LayerForDashboardExteternal/FeatureServer/0?f=json",
            _externalDatasourceResponse
          )
          .post(
            "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/2?f=json",
            mockItems.get400SuccessFailure()
          );

        dashboard
          .convertItemToTemplate(_initialDashboardTemplate, MOCK_USER_SESSION)
          .then(() => done.fail(), () => done());
      });

      it("should handle error on getting datasource", done => {
        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/generateToken",
            '{"token":"fake-token"}'
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/7e6c41c72d4548d9a312329e0c5a984f/data",
            _mapDataResponse
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/934a9ef8efa7448fa8ddf7b13cef0240?f=json&token=fake-token",
            mockItems.get400SuccessFailure()
          );

        dashboard
          .convertItemToTemplate(_initialDashboardTemplate, MOCK_USER_SESSION)
          .then(() => done.fail(), () => done());
      });
    }
  });

  describe("_extractDependencies", () => {
    if (typeof window !== "undefined") {
      it("should extract dependencies", done => {
        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/generateToken",
            '{"token":"fake-token"}'
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/7e6c41c72d4548d9a312329e0c5a984f/data",
            _mapDataResponse
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/934a9ef8efa7448fa8ddf7b13cef0240?f=json&token=fake-token",
            _featureServiceItemResponse
          )
          .post(
            "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/LayerForDashboardExteternal/FeatureServer/0?f=json",
            _externalDatasourceResponse
          )
          .post(
            "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/2?f=json",
            _webmapFeatureServiceResponse
          );

        dashboard
          ._extractDependencies(_initialDashboardTemplate, MOCK_USER_SESSION)
          .then(
            results => {
              expect(results.itemTemplate.dependencies).toEqual(
                expectedUpdatedTemplate.dependencies
              );
              done();
            },
            e => {
              done.fail(e);
            }
          );
      });
    }
  });

  describe("_getMapDatasources", () => {
    xit("_getMapDatasources", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_getExternalDatasources", () => {
    xit("_getExternalDatasources", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_getDatasourceInfo", () => {
    xit("_getDatasourceInfo", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_getItemPromises", () => {
    xit("_getItemPromises", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_getWidgetPromises", () => {
    xit("_getWidgetPromises", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_getPromises", () => {
    xit("_getPromises", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_getDatasourcePromises", () => {
    xit("_getDatasourcePromises", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_updateDatasourceInfoFields", () => {
    xit("_updateDatasourceInfoFields", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_getDatasourcesFromMap", () => {
    xit("_getDatasourcesFromMap", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_hasDatasourceInfo", () => {
    xit("_hasDatasourceInfo", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_templatize", () => {
    xit("_templatize", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_templatizeByDatasource", () => {
    xit("_templatizeByDatasource", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_getDatasourceInfo", () => {
    xit("_getDatasourceInfo", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });
});

const initialDashboardTemplate: any = {
  itemId: "eff3f22d41ad42dcb6fe9015f26d40f4",
  type: "Dashboard",
  key: "w5u0o8te",
  item: {
    id: "{{eff3f22d41ad42dcb6fe9015f26d40f4.itemId}}",
    type: "Dashboard",
    categories: [],
    culture: "en-us",
    description: null,
    extent: "{{initiative.orgExtent:optional}}",
    licenseInfo: null,
    name: null,
    snippet: null,
    tags: ["test"],
    thumbnail: "thumbnail/ago_downloaded.png",
    title: "Dashboard",
    typeKeywords: ["Dashboard", "Operations Dashboard"],
    url: null
  },
  data: {
    version: 27,
    headerPanel: {
      type: "headerPanel",
      size: "medium",
      logoIcon:
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" id="ember4492" class="icon ember-view" viewBox="0 0 21 21">\n<path d="M10.8,7.2c0,0,0.7-0.7,0.8-1.1c0-0.3,0.1-0.7,0.2-1c-0.6-0.5-1.3-0.9-2-1.1C9,3.8,8.2,3.7,7.4,3.7l0.2-0.2&#10;&#9;c1.3-0.3,2.7-0.4,4.1-0.2c1.2,0.2,2.3,0.6,3.2,1.4c0.2,0.2,0.7,0.8,0.7,1.1c0,0.3,0,0.6,0.2,0.8C16,6.7,16.5,7,16.5,7&#10;&#9;c0.3-0.1,0.6-0.2,0.9-0.1c0.3,0.2,0.7,0.4,0.9,0.7c0.1,0.2,0.1,0.4,0.1,0.6C18.3,8.5,18.2,8.7,18,9s-0.5,0.6-0.8,0.9&#10;&#9;c-0.2,0-0.3,0.1-0.5,0c-0.2-0.1-0.4-0.2-0.5-0.3c-0.3-0.3-0.6-0.7-0.8-1.1c-0.2-0.4-0.6-0.7-1.1-0.8c-0.7,0.1-1.3,0.4-1.9,0.6&#10;&#9;c0,0,0.1-0.1-0.6-0.7C11.4,7.5,11.2,7.3,10.8,7.2z M3.4,17.3c0.6,0.5,0.9,0.6,1.3,0.5c0.4-0.1,5.5-6.9,6.8-8.5&#10;&#9;c0-0.1-0.1-0.3-0.7-0.6c-0.2-0.2-0.5-0.4-0.8-0.5c-0.5,0.6-7.2,7.7-7.3,7.9C2.5,16.3,2.4,16.4,3.4,17.3z"/>\n</svg>',
      showMargin: true,
      backgroundImageSizing: "fit-height",
      normalBackgroundImagePlacement: "left",
      horizontalBackgroundImagePlacement: "top",
      showSignOutMenu: true,
      menuLinks: [],
      selectors: [
        {
          type: "categorySelectorWidget",
          category: {
            type: "features",
            itemText: "{FACILITYID}"
          },
          selection: {
            type: "single",
            defaultSelection: "first",
            operator: "equal"
          },
          preferredDisplayType: "dropdown",
          displayThreshold: 10,
          datasets: [
            {
              type: "serviceDataset",
              dataSource: {
                id:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              },
              filter: {
                type: "filterGroup",
                condition: "OR",
                rules: [
                  {
                    type: "filterGroup",
                    condition: "AND",
                    rules: [
                      {
                        type: "filterRule",
                        field: {
                          name: "FACNAME",
                          type: "esriFieldTypeString"
                        },
                        operator: "equal",
                        constraint: {
                          type: "field",
                          value: "ORGANIZ"
                        }
                      },
                      {
                        type: "filterRule",
                        field: {
                          name: "OBJECTID",
                          type: "esriFieldTypeOID"
                        },
                        operator: "between",
                        constraint: {
                          type: "range",
                          startValue: "0",
                          endValue: "100000"
                        }
                      }
                    ]
                  }
                ]
              },
              outFields: ["*"],
              groupByFields: [],
              orderByFields: ["ORGANIZ asc"],
              statisticDefinitions: [],
              maxFeatures: 50,
              querySpatialRelationship: "esriSpatialRelIntersects",
              returnGeometry: false,
              clientSideStatistics: false,
              name: "main"
            }
          ],
          id: "f81f2270-e104-453d-9c09-045d8d1087c9",
          name: "Category Selector (1)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        },
        {
          type: "categorySelectorWidget",
          category: {
            type: "features",
            itemText: "{FACILITYID}"
          },
          selection: {
            type: "single",
            defaultSelection: "first",
            operator: "equal"
          },
          preferredDisplayType: "dropdown",
          displayThreshold: 10,
          datasets: [
            {
              type: "serviceDataset",
              dataSource: {
                id:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              },
              outFields: ["*"],
              groupByFields: [],
              orderByFields: ["FACNAME asc"],
              statisticDefinitions: [],
              maxFeatures: 50,
              querySpatialRelationship: "esriSpatialRelIntersects",
              returnGeometry: false,
              clientSideStatistics: false,
              name: "main"
            }
          ],
          id: "90ebe87f-b8b4-4f1c-bc1c-313a2a799c80",
          name: "Category Selector (2)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        },
        {
          type: "categorySelectorWidget",
          category: {
            type: "features",
            itemText: "{FACILITYID} {FACNAME} {POCPHONE}"
          },
          selection: {
            type: "single",
            defaultSelection: "first",
            operator: "equal"
          },
          preferredDisplayType: "dropdown",
          displayThreshold: 10,
          datasets: [
            {
              type: "serviceDataset",
              dataSource: {
                id:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              },
              filter: {
                type: "filterGroup",
                condition: "OR",
                rules: [
                  {
                    type: "filterGroup",
                    condition: "AND",
                    rules: [
                      {
                        type: "filterRule",
                        field: {
                          name: "FACILITYID",
                          type: "esriFieldTypeString"
                        },
                        operator: "equal",
                        constraint: {
                          type: "value",
                          value: "1"
                        }
                      },
                      {
                        type: "filterRule",
                        field: {
                          name: "FACILITYID",
                          type: "esriFieldTypeString"
                        },
                        operator: "equal",
                        constraint: {
                          type: "value",
                          value: "1"
                        }
                      },
                      {
                        type: "filterRule",
                        field: {
                          name: "FULLADDR",
                          type: "esriFieldTypeString"
                        },
                        operator: "equal",
                        constraint: {
                          type: "value",
                          value: "1"
                        }
                      }
                    ]
                  }
                ]
              },
              outFields: ["*"],
              groupByFields: [],
              orderByFields: [],
              statisticDefinitions: [],
              maxFeatures: 50,
              querySpatialRelationship: "esriSpatialRelIntersects",
              returnGeometry: false,
              clientSideStatistics: false,
              name: "main"
            }
          ],
          id: "238a75d4-4a35-4747-918a-d2353b1698bd",
          name: "Category Selector (3)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        },
        {
          type: "categorySelectorWidget",
          category: {
            type: "features"
          },
          selection: {
            type: "single",
            defaultSelection: "first",
            operator: "equal"
          },
          preferredDisplayType: "dropdown",
          displayThreshold: 10,
          datasets: [
            {
              type: "serviceDataset",
              dataSource: {
                id:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              },
              filter: {
                type: "filterGroup",
                condition: "OR",
                rules: [
                  {
                    type: "filterGroup",
                    condition: "AND",
                    rules: [
                      {
                        type: "filterRule",
                        field: {
                          name: "FACILITYID",
                          type: "esriFieldTypeString"
                        },
                        operator: "equal",
                        constraint: {
                          type: "value",
                          value: "12"
                        }
                      }
                    ]
                  }
                ]
              },
              outFields: ["*"],
              groupByFields: [],
              orderByFields: [],
              statisticDefinitions: [],
              maxFeatures: 50,
              querySpatialRelationship: "esriSpatialRelIntersects",
              returnGeometry: false,
              clientSideStatistics: false,
              name: "main"
            }
          ],
          events: [
            {
              type: "selectionChanged",
              actions: [
                {
                  type: "filter",
                  by: "whereClause",
                  targetId:
                    "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
                },
                {
                  type: "filter",
                  by: "whereClause",
                  targetId: "90ebe87f-b8b4-4f1c-bc1c-313a2a799c80#main"
                },
                {
                  type: "flashGeometry",
                  targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
                },
                {
                  type: "identify",
                  targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
                }
              ]
            }
          ],
          id: "bfbc8214-5549-4fe7-a919-d7857ce0ea16",
          name: "Category Selector (4)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        },
        {
          type: "categorySelectorWidget",
          category: {
            type: "features",
            itemText: "{NAME}"
          },
          selection: {
            type: "single",
            defaultSelection: "first",
            operator: "equal"
          },
          preferredDisplayType: "dropdown",
          displayThreshold: 10,
          datasets: [
            {
              type: "serviceDataset",
              dataSource: {
                type: "featureServiceDataSource",
                itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
                layerId: 0,
                table: false
              },
              filter: {
                type: "filterGroup",
                condition: "OR",
                rules: [
                  {
                    type: "filterGroup",
                    condition: "AND",
                    rules: [
                      {
                        type: "filterRule",
                        field: {
                          name: "OWNTYPE",
                          type: "esriFieldTypeString"
                        },
                        operator: "equal",
                        constraint: {
                          type: "value",
                          value: "1"
                        }
                      },
                      {
                        type: "filterRule",
                        field: {
                          name: "FACILITYID",
                          type: "esriFieldTypeString"
                        },
                        operator: "equal",
                        constraint: {
                          type: "value",
                          value: "1"
                        }
                      }
                    ]
                  }
                ]
              },
              outFields: ["*"],
              groupByFields: [],
              orderByFields: [],
              statisticDefinitions: [],
              maxFeatures: 50,
              querySpatialRelationship: "esriSpatialRelIntersects",
              returnGeometry: false,
              clientSideStatistics: false,
              name: "main"
            }
          ],
          events: [
            {
              type: "selectionChanged",
              actions: [
                {
                  type: "filter",
                  by: "whereClause",
                  fieldMap: [
                    {
                      sourceName: "FACILITYID",
                      targetName: "FULLADDR"
                    }
                  ],
                  targetId: "f81f2270-e104-453d-9c09-045d8d1087c9#main"
                }
              ]
            }
          ],
          id: "79de7d45-0586-43fa-91e6-9d020c88d2d3",
          name: "Category Selector (5)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        },
        {
          type: "dateSelectorWidget",
          optionType: "definedOptions",
          definedOptions: {
            type: "definedOptions",
            displayType: "dropdown",
            defaultSelection: "first",
            namedFilters: []
          },
          events: [
            {
              type: "selectionChanged",
              actions: [
                {
                  type: "filter",
                  by: "whereClause",
                  fieldMap: [
                    {
                      sourceName: "filterField",
                      targetName: "CLOSEDDATE"
                    }
                  ],
                  targetId:
                    "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
                }
              ]
            }
          ],
          id: "cdc451c3-846f-4ac9-afe7-c0292d35f1bd",
          name: "Date Selector (1)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        }
      ]
    },
    leftPanel: {
      type: "leftPanel",
      selectors: [
        {
          type: "categorySelectorWidget",
          category: {
            type: "features",
            itemText: "{NAME}"
          },
          selection: {
            type: "single",
            defaultSelection: "first",
            operator: "equal"
          },
          preferredDisplayType: "dropdown",
          displayThreshold: 10,
          datasets: [
            {
              type: "serviceDataset",
              dataSource: {
                type: "featureServiceDataSource",
                itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
                layerId: 0,
                table: false
              },
              filter: {
                type: "filterGroup",
                condition: "OR",
                rules: [
                  {
                    type: "filterGroup",
                    condition: "AND",
                    rules: [
                      {
                        type: "filterRule",
                        field: {
                          name: "FACILITYID",
                          type: "esriFieldTypeString"
                        },
                        operator: "equal",
                        constraint: {
                          type: "value",
                          value: "1"
                        }
                      }
                    ]
                  }
                ]
              },
              outFields: ["*"],
              groupByFields: [],
              orderByFields: [],
              statisticDefinitions: [],
              maxFeatures: 50,
              querySpatialRelationship: "esriSpatialRelIntersects",
              returnGeometry: false,
              clientSideStatistics: false,
              name: "main"
            }
          ],
          events: [
            {
              type: "selectionChanged",
              actions: [
                {
                  type: "filter",
                  by: "whereClause",
                  fieldMap: [
                    {
                      sourceName: "FACILITYID",
                      targetName: "FULLADDR"
                    }
                  ],
                  targetId: "f81f2270-e104-453d-9c09-045d8d1087c9#main"
                }
              ]
            }
          ],
          id: "0ef05811-5ef1-4079-b8c3-68671d1d2a77",
          name: "Category Selector (6)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        },
        {
          type: "dateSelectorWidget",
          optionType: "definedOptions",
          definedOptions: {
            type: "definedOptions",
            displayType: "dropdown",
            defaultSelection: "first",
            namedFilters: []
          },
          events: [
            {
              type: "selectionChanged",
              actions: [
                {
                  type: "filter",
                  by: "whereClause",
                  fieldMap: [
                    {
                      sourceName: "filterField",
                      targetName: "CLOSEDDATE"
                    }
                  ],
                  targetId:
                    "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
                }
              ]
            }
          ],
          id: "ed1704e5-1a5b-4155-b522-d702ee818e80",
          name: "Date Selector (2)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        },
        {
          type: "categorySelectorWidget",
          category: {
            type: "static"
          },
          selection: {
            type: "single",
            defaultSelection: "first",
            operator: "equal"
          },
          preferredDisplayType: "dropdown",
          displayThreshold: 10,
          datasets: [
            {
              type: "staticDataset",
              data: {
                type: "staticValues",
                dataType: "string",
                values: []
              },
              name: "main"
            }
          ],
          events: [
            {
              type: "selectionChanged",
              actions: [
                {
                  type: "filter",
                  by: "whereClause",
                  fieldMap: [
                    {
                      sourceName: "filterField",
                      targetName: "FACNAME"
                    }
                  ],
                  targetId:
                    "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
                }
              ]
            }
          ],
          id: "38b8b9b2-0a0c-4c31-b24d-0f087229a0be",
          name: "Category Selector (7)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        },
        {
          type: "categorySelectorWidget",
          category: {
            type: "static"
          },
          selection: {
            type: "single",
            defaultSelection: "first",
            operator: "equal"
          },
          preferredDisplayType: "dropdown",
          displayThreshold: 10,
          datasets: [
            {
              type: "staticDataset",
              data: {
                type: "staticValues",
                dataType: "string",
                values: []
              },
              name: "main"
            }
          ],
          events: [
            {
              type: "selectionChanged",
              actions: [
                {
                  type: "filter",
                  by: "whereClause",
                  fieldMap: [
                    {
                      sourceName: "filterField",
                      targetName: "FULLADDR"
                    }
                  ],
                  targetId: "7866f4bd-8361-4205-8fd7-f92da41fdb61#main"
                }
              ]
            }
          ],
          id: "5dd48c85-d155-4ce1-a61e-59623aba6319",
          name: "Category Selector (8)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        },
        {
          type: "categorySelectorWidget",
          category: {
            type: "features",
            itemText: "{FACILITYID}"
          },
          selection: {
            type: "single",
            defaultSelection: "first",
            operator: "equal"
          },
          preferredDisplayType: "dropdown",
          displayThreshold: 10,
          datasets: [
            {
              type: "serviceDataset",
              dataSource: {
                type: "featureServiceDataSource",
                itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
                layerId: 0,
                table: false
              },
              filter: {
                type: "filterGroup",
                condition: "OR",
                rules: [
                  {
                    type: "filterGroup",
                    condition: "AND",
                    rules: [
                      {
                        type: "filterRule",
                        field: {
                          name: "FACILITYID",
                          type: "esriFieldTypeString"
                        },
                        operator: "equal",
                        constraint: {
                          type: "value",
                          value: "34"
                        }
                      }
                    ]
                  }
                ]
              },
              outFields: ["*"],
              groupByFields: [],
              orderByFields: [],
              statisticDefinitions: [],
              maxFeatures: 50,
              querySpatialRelationship: "esriSpatialRelIntersects",
              returnGeometry: false,
              clientSideStatistics: false,
              name: "main"
            }
          ],
          id: "a78ee2ac-bfe2-4a4c-a477-1d4abb76419a",
          name: "Category Selector (9)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        },
        {
          type: "categorySelectorWidget",
          category: {
            type: "static"
          },
          selection: {
            type: "single",
            defaultSelection: "first",
            operator: "equal"
          },
          preferredDisplayType: "dropdown",
          displayThreshold: 10,
          datasets: [
            {
              type: "staticDataset",
              data: {
                type: "staticValues",
                dataType: "string",
                values: []
              },
              name: "main"
            }
          ],
          events: [
            {
              type: "selectionChanged",
              actions: [
                {
                  type: "filter",
                  by: "whereClause",
                  fieldMap: [
                    {
                      sourceName: "filterField",
                      targetName: "FULLADDR"
                    }
                  ],
                  targetId: "c220e9bb-f0b9-4f0e-93e8-8baa3f39aa0c#main"
                }
              ]
            }
          ],
          id: "114026d5-93ff-4d11-9343-50b1e7f72eca",
          name: "Category Selector (10)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        }
      ]
    },
    widgets: [
      {
        type: "mapWidget",
        flashRepeats: 3,
        itemId: "7e6c41c72d4548d9a312329e0c5a984f",
        mapTools: [],
        showNavigation: false,
        showPopup: true,
        scalebarStyle: "none",
        layers: [
          {
            events: [
              {
                type: "selectionChanged",
                actions: [
                  {
                    type: "flashGeometry",
                    targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
                  },
                  {
                    type: "pan",
                    targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
                  },
                  {
                    type: "zoom",
                    targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
                  }
                ]
              }
            ],
            type: "featureLayerDataSource",
            layerId: "TestLayerForDashBoardMap_632"
          }
        ],
        id: "b38e032d-bf0c-426f-8036-b86341eb3693",
        name: "DashboardMap",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "legendWidget",
        mapWidgetId: "b38e032d-bf0c-426f-8036-b86341eb3693",
        id: "92010c2e-38e0-405b-b628-5aa95e3c8d56",
        name: "Map Legend (1)",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "gaugeWidget",
        style: "progress",
        displayAsPercentage: false,
        valueFormat: {
          name: "value",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        percentageFormat: {
          name: "percentage",
          type: "decimal",
          prefix: false,
          pattern: "#.#%"
        },
        arrows: [],
        axes: [
          {
            id: "main",
            style: "progress",
            startAngle: -120,
            endAngle: 120,
            startValue: 0,
            endValue: 1,
            labelsEnabled: false,
            labelOffset: 0,
            color: null,
            inside: true,
            gridInside: true,
            axisAlpha: 0,
            axisColor: null,
            axisThickness: 0,
            tickAlpha: 0,
            tickColor: null,
            tickLength: 0,
            tickThickness: 0,
            minorTickLength: 0,
            radius: "100%",
            bottomText: "",
            bands: [
              {
                id: "background",
                alpha: 1,
                color: "#d6d6d6",
                startValue: 0,
                endValue: 1,
                radius: "100%",
                innerRadius: "75%",
                colorThresholds: []
              },
              {
                id: "value",
                alpha: 1,
                color: "#ffaa00",
                startValue: 0,
                endValue: 0.5,
                radius: "100%",
                innerRadius: "75%",
                colorThresholds: []
              }
            ]
          },
          {
            id: "labels",
            style: "progress",
            startAngle: -125,
            endAngle: 125,
            startValue: 0,
            endValue: 1,
            labelsEnabled: true,
            labelOffset: 0,
            fontSize: 20,
            color: null,
            inside: true,
            gridInside: true,
            axisAlpha: 0,
            axisColor: null,
            axisThickness: 0,
            tickAlpha: 0,
            tickColor: null,
            tickLength: 0,
            tickThickness: 0,
            minorTickLength: 0,
            radius: "100%",
            bottomText: "",
            bands: []
          }
        ],
        labels: [
          {
            id: "value",
            align: "center",
            color: null,
            size: 12,
            y: "40%"
          }
        ],
        valueField: "NUMBEDS",
        minValueField: "OCCUPANCY",
        maxValueField: "OCCUPANCY",
        noValueVerticalAlignment: "middle",
        showCaptionWhenNoValue: true,
        showDescriptionWhenNoValue: true,
        valueType: "feature",
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name: "FACILITYID",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "12"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: ["FACNAME asc", "FACILITYID asc"],
            statisticDefinitions: [],
            maxFeatures: 50,
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        id: "7866f4bd-8361-4205-8fd7-f92da41fdb61",
        name: "Gauge (1)",
        caption: "<p>Gauge Feature</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "gaugeWidget",
        style: "progress",
        displayAsPercentage: false,
        valueFormat: {
          name: "value",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        percentageFormat: {
          name: "percentage",
          type: "decimal",
          prefix: false,
          pattern: "#.#%"
        },
        arrows: [],
        axes: [
          {
            id: "main",
            style: "progress",
            startAngle: -120,
            endAngle: 120,
            startValue: 0,
            endValue: 1,
            labelsEnabled: false,
            labelOffset: 0,
            color: null,
            inside: true,
            gridInside: true,
            axisAlpha: 0,
            axisColor: null,
            axisThickness: 0,
            tickAlpha: 0,
            tickColor: null,
            tickLength: 0,
            tickThickness: 0,
            minorTickLength: 0,
            radius: "100%",
            bottomText: "",
            bands: [
              {
                id: "background",
                alpha: 1,
                color: "#d6d6d6",
                startValue: 0,
                endValue: 1,
                radius: "100%",
                innerRadius: "75%",
                colorThresholds: []
              },
              {
                id: "value",
                alpha: 1,
                color: "#ffaa00",
                startValue: 0,
                endValue: 0.5,
                radius: "100%",
                innerRadius: "75%",
                colorThresholds: []
              }
            ]
          },
          {
            id: "labels",
            style: "progress",
            startAngle: -125,
            endAngle: 125,
            startValue: 0,
            endValue: 1,
            labelsEnabled: true,
            labelOffset: 0,
            fontSize: 20,
            color: null,
            inside: true,
            gridInside: true,
            axisAlpha: 0,
            axisColor: null,
            axisThickness: 0,
            tickAlpha: 0,
            tickColor: null,
            tickLength: 0,
            tickThickness: 0,
            minorTickLength: 0,
            radius: "100%",
            bottomText: "",
            bands: []
          }
        ],
        labels: [
          {
            id: "value",
            align: "center",
            color: null,
            size: 12,
            y: "40%"
          }
        ],
        valueField: "NUMBEDS",
        noValueVerticalAlignment: "middle",
        showCaptionWhenNoValue: true,
        showDescriptionWhenNoValue: true,
        valueType: "feature",
        datasets: [
          {
            type: "staticDataset",
            data: 0,
            name: "min"
          },
          {
            type: "serviceDataset",
            dataSource: {
              type: "featureServiceDataSource",
              itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
              layerId: 0,
              table: false
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name: "OWNER",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "wwer"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [],
            statisticDefinitions: [],
            maxFeatures: 50,
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          },
          {
            type: "serviceDataset",
            dataSource: {
              type: "featureServiceDataSource",
              itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
              layerId: 0,
              table: false
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [],
            statisticDefinitions: [
              {
                onStatisticField: "NUMBEDS",
                outStatisticFieldName: "value",
                statisticType: "min"
              }
            ],
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "max"
          }
        ],
        id: "8830ce79-2010-408d-838c-93b1afd6308a",
        name: "Gauge (2)",
        caption: "<p>Gauge 2</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "serialChartWidget",
        category: {
          labelOverrides: [
            {
              key: "qw",
              label: "qw"
            }
          ],
          byCategoryColors: true,
          colors: [],
          labelsPlacement: "default",
          labelRotation: 0,
          fieldName: "FACILITYID",
          nullLabel: "Null",
          blankLabel: "Blank",
          defaultColor: "#d6d6d6",
          nullColor: "#d6d6d6",
          blankColor: "#d6d6d6"
        },
        valueFormat: {
          name: "value",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        labelFormat: {
          name: "label",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        datePeriodPatterns: [
          {
            period: "ss",
            pattern: "HH:mm:ss"
          },
          {
            period: "mm",
            pattern: "HH:mm"
          },
          {
            period: "hh",
            pattern: "HH:mm"
          },
          {
            period: "DD",
            pattern: "MMM d"
          },
          {
            period: "MM",
            pattern: "MMM"
          },
          {
            period: "YYYY",
            pattern: "yyyy"
          }
        ],
        chartScrollbar: {
          enabled: false,
          dragIcon: "dragIconRoundSmall",
          dragIconHeight: 20,
          dragIconWidth: 20,
          scrollbarHeight: 15
        },
        categoryAxis: {
          title: "Serial",
          titleRotation: 270,
          gridPosition: "start",
          gridThickness: 1,
          gridAlpha: 0.15,
          axisThickness: 1,
          axisAlpha: 0.5,
          labelsEnabled: true,
          parseDates: false,
          minPeriod: "DD"
        },
        valueAxis: {
          titleRotation: 0,
          gridThickness: 1,
          gridAlpha: 0.15,
          axisThickness: 1,
          axisAlpha: 0.5,
          labelsEnabled: true,
          stackType: "none",
          integersOnly: false,
          logarithmic: false
        },
        legend: {
          enabled: false,
          position: "bottom",
          markerSize: 15,
          markerType: "circle",
          align: "center",
          labelWidth: 100,
          valueWidth: 0
        },
        graphs: [
          {
            valueField: "NUMBEDS",
            title: "# of Beds Available",
            lineColor: "#ffaa00",
            lineColorField: "_lineColor_",
            fillColorsField: "_fillColor_",
            type: "column",
            fillAlphas: 1,
            lineAlpha: 1,
            lineThickness: 1,
            bullet: "none",
            bulletAlpha: 1,
            bulletBorderAlpha: 0,
            bulletBorderThickness: 2,
            showBalloon: true,
            bulletSize: 8
          }
        ],
        guides: [],
        splitBy: {
          defaultColor: "#d6d6d6",
          seriesProperties: []
        },
        rotate: true,
        commonGraphProperties: {
          lineColorField: "_lineColor_",
          fillColorsField: "_fillColor_",
          type: "column",
          fillAlphas: 1,
          lineAlpha: 1,
          lineThickness: 1,
          bullet: "none",
          bulletAlpha: 1,
          bulletBorderAlpha: 0,
          bulletBorderThickness: 2,
          showBalloon: true,
          bulletSize: 8
        },
        events: [
          {
            type: "selectionChanged",
            actions: [
              {
                type: "filter",
                by: "whereClause",
                targetId: "8830ce79-2010-408d-838c-93b1afd6308a#main"
              },
              {
                type: "filter",
                by: "whereClause",
                targetId: "0ef05811-5ef1-4079-b8c3-68671d1d2a77#main"
              }
            ]
          }
        ],
        selectionMode: "single",
        categoryType: "features",
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              type: "featureServiceDataSource",
              itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
              layerId: 0,
              table: false
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name: "FACILITYID",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "1"
                      }
                    },
                    {
                      type: "filterRule",
                      field: {
                        name: "OWNER",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "www"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: ["OWNER asc"],
            statisticDefinitions: [],
            maxFeatures: 10,
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        id: "e321f855-d6c0-4bf5-9c2a-861db15fe877",
        name: "Serial Chart (1)",
        caption: "<p>Serial Features</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "pieChartWidget",
        category: {
          sliceProperties: [],
          fieldName: "FACILITYID",
          nullLabel: "Null",
          blankLabel: "Blank",
          defaultColor: "#d6d6d6",
          nullColor: "#d6d6d6",
          blankColor: "#d6d6d6"
        },
        pie: {
          type: "pie",
          titleField: "category",
          valueField: "absoluteValue",
          alpha: 1,
          outlineAlpha: 0,
          outlineColor: "",
          outlineThickness: 1,
          innerRadius: 0,
          labelsEnabled: true,
          labelsFormat: "percentage",
          labelTickAlpha: 0.5,
          labelTickColor: "",
          maxLabelWidth: 100,
          startAngle: 90,
          autoMargins: false,
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
          groupedColor: "#d6d6d6"
        },
        legend: {
          enabled: false,
          format: "percentage",
          position: "bottom",
          markerSize: 15,
          markerType: "circle",
          align: "center",
          labelWidth: 100,
          valueWidth: 50
        },
        showBalloon: true,
        valueFormat: {
          name: "value",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        percentageFormat: {
          name: "percentage",
          type: "decimal",
          prefix: false,
          pattern: "#.##"
        },
        events: [
          {
            type: "selectionChanged",
            actions: [
              {
                type: "filter",
                by: "whereClause",
                targetId:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              },
              {
                type: "filter",
                by: "whereClause",
                targetId: "f81f2270-e104-453d-9c09-045d8d1087c9#main"
              }
            ]
          }
        ],
        selectionMode: "single",
        categoryType: "groupByValues",
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name: "FACILITYID",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "1"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: ["FACILITYID"],
            orderByFields: ["FACILITYID asc"],
            statisticDefinitions: [
              {
                onStatisticField: "OBJECTID",
                outStatisticFieldName: "value",
                statisticType: "count"
              }
            ],
            maxFeatures: 20,
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        id: "b90fa68a-1817-40a2-91c4-1738f5b37e7e",
        name: "Pie Chart (1)",
        caption: "<p>Pie Grouped</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "pieChartWidget",
        category: {
          sliceProperties: [],
          fieldName: "FACILITYID",
          nullLabel: "Null",
          blankLabel: "Blank",
          defaultColor: "#d6d6d6",
          nullColor: "#d6d6d6",
          blankColor: "#d6d6d6"
        },
        pie: {
          type: "pie",
          titleField: "category",
          valueField: "absoluteValue",
          alpha: 1,
          outlineAlpha: 0,
          outlineColor: "",
          outlineThickness: 1,
          innerRadius: 0,
          labelsEnabled: true,
          labelsFormat: "percentage",
          labelTickAlpha: 0.5,
          labelTickColor: "",
          maxLabelWidth: 100,
          startAngle: 90,
          autoMargins: false,
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
          groupedColor: "#d6d6d6"
        },
        valueField: "NUMBEDS",
        legend: {
          enabled: false,
          format: "percentage",
          position: "bottom",
          markerSize: 15,
          markerType: "circle",
          align: "center",
          labelWidth: 100,
          valueWidth: 50
        },
        showBalloon: true,
        valueFormat: {
          name: "value",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        percentageFormat: {
          name: "percentage",
          type: "decimal",
          prefix: false,
          pattern: "#.##"
        },
        events: [
          {
            type: "selectionChanged",
            actions: [
              {
                type: "filter",
                by: "whereClause",
                targetId: "79de7d45-0586-43fa-91e6-9d020c88d2d3#main"
              }
            ]
          }
        ],
        selectionMode: "single",
        categoryType: "features",
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              type: "featureServiceDataSource",
              itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
              layerId: 0,
              table: false
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name: "NAME",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "sad"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: ["OWNER asc"],
            statisticDefinitions: [],
            maxFeatures: 20,
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        id: "161e9532-317f-4ce2-acea-445b1c4dae59",
        name: "Pie Features",
        caption: "<p>Pie Features</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "pieChartWidget",
        category: {
          sliceProperties: [
            {
              key: "NUMBEDS",
              label: "# of Beds Available",
              color: "#ffaa00"
            },
            {
              key: "NUMBEDS",
              label: "# of Beds Available",
              color: "#ffff00"
            }
          ],
          fieldName: "category",
          nullLabel: "Null",
          blankLabel: "Blank",
          defaultColor: "#d6d6d6",
          nullColor: "#d6d6d6",
          blankColor: "#d6d6d6"
        },
        pie: {
          type: "pie",
          titleField: "category",
          valueField: "absoluteValue",
          alpha: 1,
          outlineAlpha: 0,
          outlineColor: "",
          outlineThickness: 1,
          innerRadius: 0,
          labelsEnabled: true,
          labelsFormat: "percentage",
          labelTickAlpha: 0.5,
          labelTickColor: "",
          maxLabelWidth: 100,
          startAngle: 90,
          autoMargins: false,
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
          groupedColor: "#d6d6d6"
        },
        legend: {
          enabled: false,
          format: "percentage",
          position: "bottom",
          markerSize: 15,
          markerType: "circle",
          align: "center",
          labelWidth: 100,
          valueWidth: 50
        },
        showBalloon: true,
        valueFormat: {
          name: "value",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        percentageFormat: {
          name: "percentage",
          type: "decimal",
          prefix: false,
          pattern: "#.##"
        },
        selectionMode: "single",
        categoryType: "fields",
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name: "FULLADDR",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "123"
                      }
                    }
                  ]
                },
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name: "FACILITYID",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "12"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [],
            statisticDefinitions: [
              {
                onStatisticField: "NUMBEDS",
                outStatisticFieldName: "NUMBEDS",
                statisticType: "avg"
              },
              {
                onStatisticField: "NUMBEDS",
                outStatisticFieldName: "NUMBEDS",
                statisticType: "avg"
              }
            ],
            maxFeatures: null,
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        id: "2ccc8953-1958-40c0-b237-689a39d5904b",
        name: "Pie Chart (2)",
        caption: "<p>Pie Fields</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "serialChartWidget",
        category: {
          labelOverrides: [],
          byCategoryColors: false,
          labelsPlacement: "default",
          labelRotation: 0,
          fieldName: "FACILITYID",
          nullLabel: "Null",
          blankLabel: "Blank",
          defaultColor: "#d6d6d6",
          nullColor: "#d6d6d6",
          blankColor: "#d6d6d6"
        },
        valueFormat: {
          name: "value",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        labelFormat: {
          name: "label",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        datePeriodPatterns: [
          {
            period: "ss",
            pattern: "HH:mm:ss"
          },
          {
            period: "mm",
            pattern: "HH:mm"
          },
          {
            period: "hh",
            pattern: "HH:mm"
          },
          {
            period: "DD",
            pattern: "MMM d"
          },
          {
            period: "MM",
            pattern: "MMM"
          },
          {
            period: "YYYY",
            pattern: "yyyy"
          }
        ],
        chartScrollbar: {
          enabled: false,
          dragIcon: "dragIconRoundSmall",
          dragIconHeight: 20,
          dragIconWidth: 20,
          scrollbarHeight: 15
        },
        categoryAxis: {
          titleRotation: 0,
          gridPosition: "start",
          gridThickness: 1,
          gridAlpha: 0.15,
          axisThickness: 1,
          axisAlpha: 0.5,
          labelsEnabled: true,
          parseDates: false,
          minPeriod: "DD"
        },
        valueAxis: {
          titleRotation: 270,
          gridThickness: 1,
          gridAlpha: 0.15,
          axisThickness: 1,
          axisAlpha: 0.5,
          labelsEnabled: true,
          stackType: "none",
          integersOnly: false,
          logarithmic: false
        },
        legend: {
          enabled: false,
          position: "bottom",
          markerSize: 15,
          markerType: "circle",
          align: "center",
          labelWidth: 100,
          valueWidth: 0
        },
        graphs: [],
        guides: [],
        splitBy: {
          fieldName: "NAME",
          defaultColor: "#d6d6d6",
          seriesProperties: []
        },
        rotate: false,
        commonGraphProperties: {
          lineColorField: "_lineColor_",
          fillColorsField: "_fillColor_",
          type: "column",
          fillAlphas: 1,
          lineAlpha: 1,
          lineThickness: 1,
          bullet: "none",
          bulletAlpha: 1,
          bulletBorderAlpha: 0,
          bulletBorderThickness: 2,
          showBalloon: true,
          bulletSize: 8
        },
        events: [
          {
            type: "selectionChanged",
            actions: [
              {
                type: "filter",
                by: "whereClause",
                targetId: "161e9532-317f-4ce2-acea-445b1c4dae59#main"
              },
              {
                type: "filter",
                by: "whereClause",
                targetId: "8830ce79-2010-408d-838c-93b1afd6308a#main"
              }
            ]
          }
        ],
        selectionMode: "multi",
        categoryType: "groupByValues",
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              type: "featureServiceDataSource",
              itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
              layerId: 0,
              table: false
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name: "FACILITYID",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "123"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: ["FACILITYID", "NAME"],
            orderByFields: ["FACILITYID asc", "value asc"],
            statisticDefinitions: [
              {
                onStatisticField: "OBJECTID",
                outStatisticFieldName: "value",
                statisticType: "count"
              }
            ],
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        id: "ecf67bd0-3b15-4920-877a-7b02f28a9d4a",
        name: "Serial Chart (2)",
        caption: "<p>Serial grouped</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "serialChartWidget",
        category: {
          labelOverrides: [
            {
              key: "NUMBEDS",
              label: "# of Beds Available"
            },
            {
              key: "NUMBEDS",
              label: "# of Beds Available"
            }
          ],
          byCategoryColors: false,
          labelsPlacement: "default",
          labelRotation: 0,
          fieldName: "category",
          nullLabel: "Null",
          blankLabel: "Blank",
          defaultColor: "#d6d6d6",
          nullColor: "#d6d6d6",
          blankColor: "#d6d6d6"
        },
        valueFormat: {
          name: "value",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        labelFormat: {
          name: "label",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        datePeriodPatterns: [
          {
            period: "ss",
            pattern: "HH:mm:ss"
          },
          {
            period: "mm",
            pattern: "HH:mm"
          },
          {
            period: "hh",
            pattern: "HH:mm"
          },
          {
            period: "DD",
            pattern: "MMM d"
          },
          {
            period: "MM",
            pattern: "MMM"
          },
          {
            period: "YYYY",
            pattern: "yyyy"
          }
        ],
        chartScrollbar: {
          enabled: false,
          dragIcon: "dragIconRoundSmall",
          dragIconHeight: 20,
          dragIconWidth: 20,
          scrollbarHeight: 15
        },
        categoryAxis: {
          titleRotation: 0,
          gridPosition: "start",
          gridThickness: 1,
          gridAlpha: 0.15,
          axisThickness: 1,
          axisAlpha: 0.5,
          labelsEnabled: true,
          parseDates: false,
          minPeriod: "DD"
        },
        valueAxis: {
          titleRotation: 270,
          gridThickness: 1,
          gridAlpha: 0.15,
          axisThickness: 1,
          axisAlpha: 0.5,
          labelsEnabled: true,
          stackType: "none",
          integersOnly: false,
          logarithmic: false
        },
        legend: {
          enabled: false,
          position: "bottom",
          markerSize: 15,
          markerType: "circle",
          align: "center",
          labelWidth: 100,
          valueWidth: 0
        },
        graphs: [
          {
            valueField: "value",
            lineColor: "#ffaa00",
            lineColorField: "_lineColor_",
            fillColorsField: "_fillColor_",
            type: "column",
            fillAlphas: 1,
            lineAlpha: 1,
            lineThickness: 1,
            bullet: "none",
            bulletAlpha: 1,
            bulletBorderAlpha: 0,
            bulletBorderThickness: 2,
            showBalloon: true,
            bulletSize: 8
          }
        ],
        guides: [],
        splitBy: {
          defaultColor: "#d6d6d6",
          seriesProperties: []
        },
        rotate: false,
        commonGraphProperties: {
          lineColorField: "_lineColor_",
          fillColorsField: "_fillColor_",
          type: "column",
          fillAlphas: 1,
          lineAlpha: 1,
          lineThickness: 1,
          bullet: "none",
          bulletAlpha: 1,
          bulletBorderAlpha: 0,
          bulletBorderThickness: 2,
          showBalloon: true,
          bulletSize: 8
        },
        selectionMode: "single",
        categoryType: "fields",
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name: "FULLADDR",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "123"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [],
            statisticDefinitions: [
              {
                onStatisticField: "NUMBEDS",
                outStatisticFieldName: "NUMBEDS",
                statisticType: "avg"
              },
              {
                onStatisticField: "NUMBEDS",
                outStatisticFieldName: "NUMBEDS",
                statisticType: "avg"
              }
            ],
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        id: "c220e9bb-f0b9-4f0e-93e8-8baa3f39aa0c",
        name: "Serial Chart (3)",
        caption: "<p>Serial Fields</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "gaugeWidget",
        style: "progress",
        displayAsPercentage: false,
        valueFormat: {
          name: "value",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        percentageFormat: {
          name: "percentage",
          type: "decimal",
          prefix: false,
          pattern: "#.#%"
        },
        arrows: [],
        axes: [
          {
            id: "main",
            style: "progress",
            startAngle: -120,
            endAngle: 120,
            startValue: 0,
            endValue: 1,
            labelsEnabled: false,
            labelOffset: 0,
            color: null,
            inside: true,
            gridInside: true,
            axisAlpha: 0,
            axisColor: null,
            axisThickness: 0,
            tickAlpha: 0,
            tickColor: null,
            tickLength: 0,
            tickThickness: 0,
            minorTickLength: 0,
            radius: "100%",
            bottomText: "",
            bands: [
              {
                id: "background",
                alpha: 1,
                color: "#d6d6d6",
                startValue: 0,
                endValue: 1,
                radius: "100%",
                innerRadius: "75%",
                colorThresholds: []
              },
              {
                id: "value",
                alpha: 1,
                color: "#ffaa00",
                startValue: 0,
                endValue: 0.5,
                radius: "100%",
                innerRadius: "75%",
                colorThresholds: []
              }
            ]
          },
          {
            id: "labels",
            style: "progress",
            startAngle: -125,
            endAngle: 125,
            startValue: 0,
            endValue: 1,
            labelsEnabled: true,
            labelOffset: 0,
            fontSize: 20,
            color: null,
            inside: true,
            gridInside: true,
            axisAlpha: 0,
            axisColor: null,
            axisThickness: 0,
            tickAlpha: 0,
            tickColor: null,
            tickLength: 0,
            tickThickness: 0,
            minorTickLength: 0,
            radius: "100%",
            bottomText: "",
            bands: []
          }
        ],
        labels: [
          {
            id: "value",
            align: "center",
            color: null,
            size: 12,
            y: "40%"
          }
        ],
        noValueVerticalAlignment: "middle",
        showCaptionWhenNoValue: true,
        showDescriptionWhenNoValue: true,
        valueType: "statistic",
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name: "FACNAME",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "qwe"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [],
            statisticDefinitions: [
              {
                onStatisticField: "OBJECTID",
                outStatisticFieldName: "value",
                statisticType: "count"
              }
            ],
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          },
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name: "FACNAME",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "2313"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [],
            statisticDefinitions: [
              {
                onStatisticField: "OBJECTID",
                outStatisticFieldName: "value",
                statisticType: "count"
              }
            ],
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "min"
          },
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name: "FULLADDR",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "123"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [],
            statisticDefinitions: [
              {
                onStatisticField: "OBJECTID",
                outStatisticFieldName: "value",
                statisticType: "count"
              }
            ],
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "max"
          }
        ],
        id: "27daba1f-9223-4013-8ca8-797388fd2116",
        name: "Gauge (3)",
        caption: "<p>Gauge Stat</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        events: [
          {
            type: "selectionChanged",
            actions: [
              {
                type: "filter",
                by: "whereClause",
                targetId:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              },
              {
                type: "identify",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              }
            ]
          }
        ],
        type: "listWidget",
        iconType: "symbol",
        selectionMode: "single",
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name: "FULLADDR",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "asD"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: ["FACNAME asc", "ORGANIZ asc"],
            statisticDefinitions: [],
            maxFeatures: 25,
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        id: "bd1eec15-c178-4929-b800-936be1e6789b",
        name: "List (1)",
        caption: "<p>lIST FILTER SORT</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "detailsWidget",
        showTitle: true,
        showContents: true,
        showMedia: true,
        showAttachments: true,
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name: "FULLADDR",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "QSAD"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: ["FACNAME asc"],
            statisticDefinitions: [],
            maxFeatures: 50,
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        id: "be4aad77-c0c3-42f5-8a74-53dfc79f6558",
        name: "Details (1)",
        caption: "<p>DETAILS FILTER SORT</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "embeddedContentWidget",
        url: "{FACILITYID}",
        contentType: "document",
        imageRefreshInterval: 0,
        videoSettings: {
          controls: true,
          autoplay: false,
          loop: false,
          muted: false,
          controlsList: "nodownload"
        },
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name: "FACILITYID",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "esf"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: ["FACNAME asc"],
            statisticDefinitions: [],
            maxFeatures: 50,
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        id: "2f547ec0-cd71-4b05-b28a-a467793d7601",
        name: "Embedded Content (1)",
        caption: "<p>Embedded Content</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      }
    ],
    settings: {
      maxPaginationRecords: 50000,
      allowElementResizing: false
    },
    mapOverrides: {
      trackedFeatureRadius: 60
    },
    theme: "dark",
    themeOverrides: {},
    numberPrefixOverrides: [
      {
        key: "yotta",
        symbol: "Y",
        enabled: true
      },
      {
        key: "zeta",
        symbol: "Z",
        enabled: true
      },
      {
        key: "exa",
        symbol: "E",
        enabled: true
      },
      {
        key: "peta",
        symbol: "P",
        enabled: true
      },
      {
        key: "tera",
        symbol: "T",
        enabled: true
      },
      {
        key: "giga",
        symbol: "G",
        enabled: true
      },
      {
        key: "mega",
        symbol: "M",
        enabled: true
      },
      {
        key: "kilo",
        symbol: "k",
        enabled: true
      },
      {
        key: "base",
        symbol: "",
        enabled: true
      },
      {
        key: "deci",
        symbol: "d",
        enabled: false
      },
      {
        key: "centi",
        symbol: "c",
        enabled: false
      },
      {
        key: "milli",
        symbol: "m",
        enabled: false
      },
      {
        key: "micro",
        symbol: "µ",
        enabled: false
      },
      {
        key: "nano",
        symbol: "n",
        enabled: false
      }
    ],
    urlParameters: [
      {
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [],
            statisticDefinitions: [],
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        type: "feature",
        idFieldName: "FACILITYID",
        events: [
          {
            type: "parameterChanged",
            actions: [
              {
                type: "filter",
                by: "whereClause",
                targetId:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              },
              {
                type: "flashGeometry",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              },
              {
                type: "identify",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              },
              {
                type: "pan",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              },
              {
                type: "zoom",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              }
            ]
          }
        ],
        label: "p_map_layer"
      },
      {
        type: "category",
        dataType: "string",
        operator: "is_in",
        events: [
          {
            type: "parameterChanged",
            actions: [
              {
                type: "filter",
                by: "whereClause",
                fieldMap: [
                  {
                    sourceName: "filterField",
                    targetName: "FULLADDR"
                  }
                ],
                targetId:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              }
            ]
          }
        ],
        label: "CatParam"
      },
      {
        type: "numeric",
        valueType: "single",
        operator: "less",
        events: [
          {
            type: "parameterChanged",
            actions: [
              {
                type: "filter",
                by: "whereClause",
                fieldMap: [
                  {
                    sourceName: "filterField",
                    targetName: "NUMBEDS"
                  }
                ],
                targetId:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              }
            ]
          }
        ],
        label: "NumParam"
      },
      {
        type: "date",
        dataType: "string",
        valueType: "single",
        operator: "is_before",
        events: [
          {
            type: "parameterChanged",
            actions: [
              {
                type: "filter",
                by: "whereClause",
                fieldMap: [
                  {
                    sourceName: "filterField",
                    targetName: "CLOSEDDATE"
                  }
                ],
                targetId:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              }
            ]
          }
        ],
        label: "DateParam"
      },
      {
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              type: "featureServiceDataSource",
              itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
              layerId: 0,
              table: false
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [],
            statisticDefinitions: [],
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        type: "feature",
        idFieldName: "FACILITYID",
        events: [
          {
            type: "parameterChanged",
            actions: [
              {
                type: "filter",
                by: "whereClause",
                fieldMap: [
                  {
                    sourceName: "FACILITYID",
                    targetName: "FACNAME"
                  }
                ],
                targetId:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              },
              {
                type: "flashGeometry",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              },
              {
                type: "pan",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              },
              {
                type: "zoom",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              }
            ]
          }
        ],
        label: "external_map_layer"
      },
      {
        type: "geometry",
        dataType: "point",
        events: [
          {
            type: "parameterChanged",
            actions: [
              {
                type: "flashGeometry",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              },
              {
                type: "pan",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              },
              {
                type: "zoom",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              }
            ]
          }
        ],
        label: "Geom1"
      },
      {
        type: "geometry",
        dataType: "extent",
        events: [
          {
            type: "parameterChanged",
            actions: [
              {
                type: "filter",
                by: "geometry",
                targetId:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              },
              {
                type: "setExtent",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              }
            ]
          }
        ],
        label: "GeomExtent"
      }
    ],
    layout: {
      rootElement: {
        type: "stackLayoutElement",
        orientation: "col",
        elements: [
          {
            type: "stackLayoutElement",
            orientation: "row",
            elements: [
              {
                type: "itemLayoutElement",
                id: "2f547ec0-cd71-4b05-b28a-a467793d7601",
                width: 1,
                height: 0.3144582394843341
              },
              {
                type: "itemLayoutElement",
                id: "be4aad77-c0c3-42f5-8a74-53dfc79f6558",
                width: 1,
                height: 0.33203775934369795
              },
              {
                type: "itemLayoutElement",
                id: "bd1eec15-c178-4929-b800-936be1e6789b",
                width: 1,
                height: 0.353504001171968
              }
            ],
            width: 0.13354113735903447,
            height: 1
          },
          {
            type: "stackLayoutElement",
            orientation: "row",
            elements: [
              {
                type: "itemLayoutElement",
                id: "b90fa68a-1817-40a2-91c4-1738f5b37e7e",
                width: 1,
                height: 0.3085983995312128
              },
              {
                type: "itemLayoutElement",
                id: "161e9532-317f-4ce2-acea-445b1c4dae59",
                width: 1,
                height: 0.295706751634346
              },
              {
                type: "itemLayoutElement",
                id: "2ccc8953-1958-40c0-b237-689a39d5904b",
                width: 1,
                height: 0.3956948488344412
              }
            ],
            width: 0.13057012924022732,
            height: 1
          },
          {
            type: "stackLayoutElement",
            orientation: "row",
            elements: [
              {
                type: "itemLayoutElement",
                id: "e321f855-d6c0-4bf5-9c2a-861db15fe877",
                width: 1,
                height: 0.31797414345620684
              },
              {
                type: "itemLayoutElement",
                id: "ecf67bd0-3b15-4920-877a-7b02f28a9d4a",
                width: 1,
                height: 0.3543051511655588
              },
              {
                type: "itemLayoutElement",
                id: "c220e9bb-f0b9-4f0e-93e8-8baa3f39aa0c",
                width: 1,
                height: 0.32772070537823433
              }
            ],
            width: 0.1473938973532348,
            height: 1
          },
          {
            type: "stackLayoutElement",
            orientation: "row",
            elements: [
              {
                type: "itemLayoutElement",
                id: "7866f4bd-8361-4205-8fd7-f92da41fdb61",
                width: 1,
                height: 0.35502126323329586
              },
              {
                type: "itemLayoutElement",
                id: "8830ce79-2010-408d-838c-93b1afd6308a",
                width: 1,
                height: 0.3067103194728515
              },
              {
                type: "itemLayoutElement",
                id: "27daba1f-9223-4013-8ca8-797388fd2116",
                width: 1,
                height: 0.33826841729385265
              }
            ],
            width: 0.11465816595818965,
            height: 1
          },
          {
            type: "itemLayoutElement",
            id: "92010c2e-38e0-405b-b628-5aa95e3c8d56",
            width: 0.1431475564291276,
            height: 1
          },
          {
            type: "itemLayoutElement",
            id: "b38e032d-bf0c-426f-8036-b86341eb3693",
            width: 0.33068911366018605,
            height: 1
          }
        ],
        width: 1,
        height: 1
      }
    }
  },
  resources: [
    "eff3f22d41ad42dcb6fe9015f26d40f4_info_thumbnail/ago_downloaded.png"
  ],
  dependencies: [],
  properties: {},
  estimatedDeploymentCostFactor: 2
};

const mapDataResponse: any = {
  operationalLayers: [
    {
      id: "TestLayerForDashBoardMap_632",
      layerType: "ArcGISFeatureLayer",
      url:
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/2",
      visibility: true,
      opacity: 1,
      title: "TestLayerForDashBoardMap - Emergency Shelter",
      itemId: "4efe5f693de34620934787ead6693f19",
      popupInfo: {
        title: "Emergency Shelter: {FACNAME}",
        fieldInfos: [
          {
            fieldName: "OBJECTID",
            label: "OBJECTID",
            isEditable: false,
            tooltip: "",
            visible: false,
            stringFieldOption: "textbox"
          },
          {
            fieldName: "FACILITYID",
            label: "Emergency Facility ID",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox"
          },
          {
            fieldName: "FACNAME",
            label: "Name",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox"
          },
          {
            fieldName: "FULLADDR",
            label: "Site Address",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox"
          },
          {
            fieldName: "ORGANIZ",
            label: "Organization",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox"
          },
          {
            fieldName: "REDXMODEL",
            label: "Red Cross Model",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox"
          },
          {
            fieldName: "POCNAME",
            label: "Contact Name",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox"
          },
          {
            fieldName: "POCEMAIL",
            label: "Contact Email",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox"
          },
          {
            fieldName: "POCPHONE",
            label: "Contact Phone",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox"
          },
          {
            fieldName: "CAPACITY",
            label: "Total Capacity",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox",
            format: {
              places: 0,
              digitSeparator: true
            }
          },
          {
            fieldName: "NUMBEDS",
            label: "# of Beds Available",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox",
            format: {
              places: 0,
              digitSeparator: true
            }
          },
          {
            fieldName: "OCCUPANCY",
            label: "Current Occupancy",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox",
            format: {
              places: 0,
              digitSeparator: true
            }
          },
          {
            fieldName: "HOURSOPER",
            label: "Hours Operation",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox"
          },
          {
            fieldName: "HANDICAP",
            label: "Handicap Accessible",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox"
          },
          {
            fieldName: "BACKPOWER",
            label: "Generator",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox"
          },
          {
            fieldName: "ALLOWPETS",
            label: "Allows Pets / Animals",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox"
          },
          {
            fieldName: "DAYSOPER",
            label: "Days Operation",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox"
          },
          {
            fieldName: "ACCESSRES",
            label: "Access Restrictions",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox"
          },
          {
            fieldName: "OPENDATE",
            label: "Open Date",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox",
            format: {
              dateFormat: "shortDateShortTime"
            }
          },
          {
            fieldName: "CLOSEDDATE",
            label: "Closed Date",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox",
            format: {
              dateFormat: "shortDateShortTime"
            }
          },
          {
            fieldName: "OPSSTATUS",
            label: "Operational Status",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox"
          },
          {
            fieldName: "LASTUPDATE",
            label: "Last Update Date",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox",
            format: {
              dateFormat: "shortDateShortTime"
            }
          },
          {
            fieldName: "LASTEDITOR",
            label: "Last Editor",
            isEditable: true,
            tooltip: "",
            visible: true,
            stringFieldOption: "textbox"
          }
        ],
        description: null,
        showAttachments: true,
        mediaInfos: []
      }
    }
  ],
  baseMap: {
    baseMapLayers: [
      {
        id: "defaultBasemap_0",
        layerType: "ArcGISTiledMapServiceLayer",
        url:
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer",
        visibility: true,
        opacity: 1,
        title: "World_Topo_Map"
      }
    ],
    title: "Topographic"
  },
  spatialReference: {
    wkid: 102100,
    latestWkid: 3857
  },
  authoringApp: "WebMapViewer",
  authoringAppVersion: "7.2",
  version: "2.15",
  applicationProperties: {
    viewing: {
      routing: {
        enabled: true
      },
      basemapGallery: {
        enabled: true
      },
      measure: {
        enabled: true
      }
    }
  }
};

const featureServiceItemResponse: any = {
  spatialReference: null,
  id: "934a9ef8efa7448fa8ddf7b13cef0240",
  owner: "LocalGovDeployJohnH",
  created: 1568385286000,
  modified: 1568385296000,
  guid: null,
  name: "LayerForDashboardExteternal",
  title: "LayerForDashboardExteternal",
  type: "Feature Service",
  typeKeywords: [
    "ArcGIS Server",
    "Data",
    "Feature Access",
    "Feature Service",
    "Multilayer",
    "Service",
    "Hosted Service"
  ],
  description:
    "This map contains the collection of data and symbology to be used with the Incident Analysis Viewer as part of Situational Awareness.",
  tags: ["test"],
  snippet: "Incident Analysis data and symbology for Situational Awareness",
  thumbnail: "thumbnail/ago_downloaded.png",
  documentation: null,
  extent: [
    [-160.74499999999728, 21.13899999999964],
    [-25.744999999999568, 55.68499999999906]
  ],
  categories: [],
  accessInformation: null,
  licenseInfo: null,
  culture: "",
  properties: null,
  url:
    "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/LayerForDashboardExteternal/FeatureServer",
  proxyFilter: null,
  access: "public",
  size: 4161536,
  appCategories: [],
  industries: [],
  languages: [],
  largeThumbnail: null,
  banner: null,
  screenshots: [],
  listed: false,
  ownerFolder: null,
  protected: false,
  commentsEnabled: false,
  numComments: 0,
  numRatings: 0,
  avgRating: 0,
  numViews: 69,
  itemControl: "admin",
  scoreCompleteness: 56,
  groupDesignations: null
};

const externalDatasourceResponse: any = {
  id: 0,
  name: "Hospital",
  type: "Feature Layer",
  description: "",
  extent: {
    xmin: -17894051.547564458,
    ymin: 2408460.591287479,
    xmax: -2865920.29047278,
    ymax: 7495961.931296048,
    spatialReference: {
      wkid: 102100,
      latestWkid: 3857
    }
  },
  currentVersion: 10.7,
  serviceItemId: "934a9ef8efa7448fa8ddf7b13cef0240",
  displayField: "NAME",
  copyrightText: "",
  defaultVisibility: true,
  editingInfo: {
    lastEditDate: 1568385293900
  },
  relationships: [],
  isDataVersioned: false,
  supportsAppend: true,
  supportsCalculate: true,
  supportsASyncCalculate: true,
  supportsTruncate: true,
  supportsAttachmentsByUploadId: true,
  supportsAttachmentsResizing: true,
  supportsRollbackOnFailureParameter: true,
  supportsStatistics: true,
  supportsExceedsLimitStatistics: true,
  supportsAdvancedQueries: true,
  supportsValidateSql: true,
  supportsCoordinatesQuantization: true,
  supportsFieldDescriptionProperty: true,
  supportsQuantizationEditMode: true,
  supportsApplyEditsWithGlobalIds: false,
  supportsReturningQueryGeometry: true,
  advancedQueryCapabilities: {
    supportsPagination: true,
    supportsPaginationOnAggregatedQueries: true,
    supportsQueryRelatedPagination: true,
    supportsQueryWithDistance: true,
    supportsReturningQueryExtent: true,
    supportsStatistics: true,
    supportsOrderBy: true,
    supportsDistinct: true,
    supportsQueryWithResultType: true,
    supportsSqlExpression: true,
    supportsAdvancedQueryRelated: true,
    supportsCountDistinct: true,
    supportsLod: true,
    supportsQueryWithLodSR: false,
    supportedLodTypes: ["geohash"],
    supportsReturningGeometryCentroid: false,
    supportsQueryWithDatumTransformation: true,
    supportsHavingClause: true,
    supportsOutFieldSQLExpression: true,
    supportsMaxRecordCountFactor: true,
    supportsTopFeaturesQuery: true,
    supportsDisjointSpatialRel: true,
    supportsQueryWithCacheHint: true
  },
  useStandardizedQueries: true,
  geometryType: "esriGeometryPoint",
  minScale: 0,
  maxScale: 0,
  drawingInfo: {
    renderer: {
      type: "simple",
      symbol: {
        type: "esriPMS",
        url: "1c31d1d6e4c9368fe9711b75d0948639",
        imageData:
          "iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAABYNJREFUaIHtmF1sU2UYx/9PW/qxtWvXVdfGrRvxqJzFuRKm4AYXerMaLgaBLHphNuMFJlUUNEMmXDCIyUgQE1kMgSDMC5wZCUiiMyEQk20kM8YRhi3YmNJNKTDWyQ6sW7o+XnC6lNGNnu6UYcLvqh/ve57n/57n/b8fOvzP0S12AgvliYDF5omAVJjZC6CKmT1E5Jz1X4SIBgBcIKJutWKqIoCZmwBsAGAGACJ6oI0syAvAy8w+ACeI6OhCYy9IADMLzLwNgAAAp3qv2b7pDjn7/VHbtVsTxtS2riJT7BWxcOwdb3mkvtYFAI2JRKKWiNqIKPjIBcjl4iMic8/FUfMHBwYE/9Vxm73AiAKLAcVFpvvaT0wljP2Xbzu7f+13imWWsa/e9wRXV9oFAPuZuT3bsspKADOvBrANAL74Puj8+ODFZWVP50EsK5izj0mvgUmvR3GhHtHbU7Y1H/1SvW9TZWBrgxABsI2ZJSLqybkAZhZSk285cmnZC+4CmPSajJ9RWKCH0ahDy5FLywAgRUREaTllI8BHROZk8mKJBdA+OGkfhkmvgVhiuU+EPLm3KHmOIgFy3Xv84XFjS0dAKHXmZ5X8DFpCqTMfLR0B4Y1VxWOi2+JhZq+S+aBUQCMRYfuhwXK7UaszG7Qz//1+8LWZz8s3nUvbP10bs0ELu1Gr235osPzk7lcDzNwIQH0Bcu07/eFx46m+iNOz1Jpp14dSbDPgVF/E6Q+Ph0S3xcnMQqZzQckbqAOA42eHHHarYWGlMxstwW414PjZIUdrU8WwHEtdAfKo4PT5iMNuXpJtqnNiNy/B6fMRR2tTxbD8tjMiYwFE5AGAgStRm+d5ezY5zovZpMPAlVFbaqxMyMluNHWy5hpFAvzhcaPB8HjtwBVlI7otscnJeK5yyYqcDGcm64BaKHGhCBE5XUWmmDQ5bUxdxNRAmpyGq8gUS8bKtJ8SFxoA4BVLLJL/n7uqC7hzdxpiiUVKiZURSkroAgDv2hrXSO+RS47iQr3SHOdl9HYMazc+O5ISKyOUCOgB4NvaIERajv4hSBNxndmkzhSSJuKAhuLytlqSY2WEkhKSmPkEgMbmBiG097s/hfkOMEoYunEXzW8+F5K/niAiKdO+SoewC8CG1qaK4eNn/naGb06Y3U/dOzrO5TyppGsTvjmBUkeeJO+BJDlGxigSIL+FNgC7f/h81eDy985VR6W4rtCcXSlFpTjuxOLxni/XDMo/tSkZfSCLdYCIepi5W3RbvAc/9ASa9v72YuFSq/Ld6TTjakTC0eYVAdFtiQHofiRnYpl2ZhYa69zo+OnqSG8w6hCfsSh6gD8iob7GGWmsc48wc1Cj0bRlk0hWAlJK6VDnrpWBl949U309OmXM1FqvR6dgN+pihz9ZEQQgEVFWyQML2EoQUZCZ2x1Wve/rLcsD63b0efLzrHjYAidNTuPaTQkn99QEHFZ9HMCxRbnYAgAi6kokElX1ta7VvvVC6PCPofJ5bymmGUORO/CtF0L1ta4xZu7RaDSKXGc2C16J5NfvObC5KvRz/w1HeDQ2Y62zCY/GUOrIkw5srgphgaWTRA0BEjPvBLB/PmtNY5k7lVpmOlTZCxDRADN3iW7LxuYGIbT728vCfdYqW+a+TZVB2TK7lGzY5kO18wARtScSCU9rUwV6B27Zev/61yG68gHcs8zXKx0j8u1bUKPRtKsVV9UDjVzT+zt3rQyUvNW96np06t7zE4h37loZgEp1n4raAoLMfMxh1fs6P3t5cN2OPg8AnNxTM6iGZaZD9SNlqrW+XVc2DABqWWY6cnImTlprx6fVydFWvXSS5ErAjLXKP6limenI2SVP0lqTn3MVJ6e3VESkml3OxeN1zZYFTwQsNv8BQjU+Pnbw+XgAAAAASUVORK5CYII=",
        contentType: "image/png",
        width: 36,
        height: 36,
        angle: 0,
        xoffset: 0,
        yoffset: 15
      },
      label: "",
      description: ""
    },
    transparency: 0,
    labelingInfo: null
  },
  allowGeometryUpdates: true,
  hasAttachments: false,
  htmlPopupType: "esriServerHTMLPopupTypeAsHTMLText",
  hasM: false,
  hasZ: false,
  objectIdField: "OBJECTID",
  uniqueIdField: {
    name: "OBJECTID",
    isSystemMaintained: true
  },
  globalIdField: "",
  typeIdField: "",
  fields: [
    {
      name: "OBJECTID",
      type: "esriFieldTypeOID",
      alias: "OBJECTID",
      sqlType: "sqlTypeOther",
      nullable: false,
      editable: false,
      domain: null,
      defaultValue: null
    },
    {
      name: "FACILITYID",
      type: "esriFieldTypeString",
      alias: "Facility Identifier",
      sqlType: "sqlTypeOther",
      length: 50,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "NAME",
      type: "esriFieldTypeString",
      alias: "Name of Facility",
      sqlType: "sqlTypeOther",
      length: 255,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "OWNER",
      type: "esriFieldTypeString",
      alias: "Owner Name",
      sqlType: "sqlTypeOther",
      length: 50,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "OWNTYPE",
      type: "esriFieldTypeString",
      alias: "Owner Type",
      sqlType: "sqlTypeOther",
      length: 50,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "SUBTYPEFIELD",
      type: "esriFieldTypeInteger",
      alias: "Subtype Field",
      sqlType: "sqlTypeOther",
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "FEATURECODE",
      type: "esriFieldTypeString",
      alias: "Feature Code",
      sqlType: "sqlTypeOther",
      length: 100,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "FULLADDR",
      type: "esriFieldTypeString",
      alias: "Full Address",
      sqlType: "sqlTypeOther",
      length: 250,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "AGENCYURL",
      type: "esriFieldTypeString",
      alias: "Website",
      sqlType: "sqlTypeOther",
      length: 100,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "OPERDAYS",
      type: "esriFieldTypeString",
      alias: "Operational Days",
      sqlType: "sqlTypeOther",
      nullable: true,
      editable: true,
      domain: {
        type: "codedValue",
        name: "OperationalDays",
        codedValues: [
          {
            name: "Sun-Sat",
            code: "Sun-Sat"
          },
          {
            name: "Mon-Fri",
            code: "Mon-Fri"
          },
          {
            name: "Sat-Sun",
            code: "Sat-Sun"
          },
          {
            name: "Other",
            code: "Other"
          }
        ]
      },
      defaultValue: null,
      length: 50
    },
    {
      name: "OPERHOURS",
      type: "esriFieldTypeString",
      alias: "Operational Hours",
      sqlType: "sqlTypeOther",
      nullable: true,
      editable: true,
      domain: {
        type: "codedValue",
        name: "OperationalHours",
        codedValues: [
          {
            name: "Daylight",
            code: "Daylight"
          },
          {
            name: "Other",
            code: "Other"
          },
          {
            name: "6:00am-7:00pm",
            code: "6:00am-7:00pm"
          },
          {
            name: "24 Hours/Day",
            code: "24 Hours/Day"
          },
          {
            name: "8:30am-5:00pm",
            code: "8:30am-5:00pm"
          }
        ]
      },
      defaultValue: null,
      length: 50
    },
    {
      name: "NUMBEDS",
      type: "esriFieldTypeSmallInteger",
      alias: "# of Beds Available",
      sqlType: "sqlTypeOther",
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "CONTACT",
      type: "esriFieldTypeString",
      alias: "Contact Name",
      sqlType: "sqlTypeOther",
      length: 50,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "PHONE",
      type: "esriFieldTypeString",
      alias: "Phone",
      sqlType: "sqlTypeOther",
      length: 12,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "EMAIL",
      type: "esriFieldTypeString",
      alias: "Email",
      sqlType: "sqlTypeOther",
      length: 100,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    }
  ],
  indexes: [
    {
      name: "user_15533.LayerForDashboardExteternal_HOSPITAL_Shape_sidx",
      fields: "Shape",
      isAscending: false,
      isUnique: false,
      description: "Shape Index"
    },
    {
      name: "PK__LayerFor__F4B70D85130A6CD8",
      fields: "OBJECTID",
      isAscending: true,
      isUnique: true,
      description: "clustered, unique, primary key"
    }
  ],
  types: [],
  templates: [
    {
      name: "Hospital",
      description: "",
      drawingTool: "esriFeatureEditToolPoint",
      prototype: {
        attributes: {
          SUBTYPEFIELD: 790,
          EMAIL: null,
          FACILITYID: null,
          NAME: null,
          OWNER: null,
          OWNTYPE: null,
          FEATURECODE: null,
          FULLADDR: null,
          AGENCYURL: null,
          OPERDAYS: null,
          OPERHOURS: null,
          NUMBEDS: null,
          CONTACT: null,
          PHONE: null
        }
      }
    }
  ],
  supportedQueryFormats: "JSON, geoJSON, PBF",
  hasStaticData: false,
  maxRecordCount: 1000,
  standardMaxRecordCount: 32000,
  tileMaxRecordCount: 8000,
  maxRecordCountFactor: 1,
  capabilities: "Create,Delete,Query,Update,Editing"
};

const webmapFeatureServiceResponse: any = {
  id: 2,
  name: "Emergency Shelter",
  type: "Feature Layer",
  description: "",
  extent: {
    xmin: -17894051.547564458,
    ymin: 2408460.591287479,
    xmax: -2865920.29047278,
    ymax: 7495961.931296048,
    spatialReference: {
      wkid: 102100,
      latestWkid: 3857
    }
  },
  currentVersion: 10.7,
  serviceItemId: "4efe5f693de34620934787ead6693f19",
  displayField: "FACNAME",
  copyrightText: "",
  defaultVisibility: true,
  editingInfo: {
    lastEditDate: 1568385209428
  },
  relationships: [],
  isDataVersioned: false,
  supportsAppend: true,
  supportsCalculate: true,
  supportsASyncCalculate: true,
  supportsTruncate: true,
  supportsAttachmentsByUploadId: true,
  supportsAttachmentsResizing: true,
  supportsRollbackOnFailureParameter: true,
  supportsStatistics: true,
  supportsExceedsLimitStatistics: true,
  supportsAdvancedQueries: true,
  supportsValidateSql: true,
  supportsCoordinatesQuantization: true,
  supportsFieldDescriptionProperty: true,
  supportsQuantizationEditMode: true,
  supportsApplyEditsWithGlobalIds: false,
  supportsReturningQueryGeometry: true,
  advancedQueryCapabilities: {
    supportsPagination: true,
    supportsPaginationOnAggregatedQueries: true,
    supportsQueryRelatedPagination: true,
    supportsQueryWithDistance: true,
    supportsReturningQueryExtent: true,
    supportsStatistics: true,
    supportsOrderBy: true,
    supportsDistinct: true,
    supportsQueryWithResultType: true,
    supportsSqlExpression: true,
    supportsAdvancedQueryRelated: true,
    supportsCountDistinct: true,
    supportsLod: true,
    supportsQueryWithLodSR: false,
    supportedLodTypes: ["geohash"],
    supportsReturningGeometryCentroid: false,
    supportsQueryWithDatumTransformation: true,
    supportsHavingClause: true,
    supportsOutFieldSQLExpression: true,
    supportsMaxRecordCountFactor: true,
    supportsTopFeaturesQuery: true,
    supportsDisjointSpatialRel: true,
    supportsQueryWithCacheHint: true
  },
  useStandardizedQueries: true,
  geometryType: "esriGeometryPoint",
  minScale: 0,
  maxScale: 0,
  drawingInfo: {
    renderer: {
      type: "uniqueValue",
      field1: "OPSSTATUS",
      field2: null,
      field3: null,
      fieldDelimiter: ", ",
      defaultSymbol: {
        type: "esriPMS",
        url: "c901d3654a452868ec09d5d720eedf8c",
        imageData:
          "iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAA8hJREFUOI211VtoHFUYB/D/mcvOzM5uNplN0p2kuZENGyiJaVMsFoX2QWpabRq8Ui/xQXySQvFBfdA3qeCToj6ECval1BaR9KGikbYQKUZEQmokq0tzscluQnY2e9+5neND2jVDNmlB/ODAmTnDb77vfIcZAf9TCLst3h2DxjGc5kRtBDQYA/IKI8EiYM0wN/kNL+HynlEUHxpeOAdBbpLeZxTvMpg+ahsQlHZwQgSuXdBcc7YNDCeorX2aHDPe0d/EFw+Ek2MIEUG/Qe3kfl6OIdD+OOSGCDj+30epM4zy+jIKf98MUNf4PPWl/rSUS440nIVZE05egkhK+iS1k33+yDDquvpBCLetIk4QoUY6oTS9gmziF1TSE0NmqGOcYXGIAGwbTMqxj6kd71P1YdR1DdzLzkIxNQ8z/RdcOwtBCkNqjMLf3AmOF1AfewwbcaCSnji2el47gzeMTzxw6jO0UHvhLcE/gGBnPwDAymeQmRsHtRerL7esBKz8FEorMWj7TkKQ/QhFH4WV+xOM5s+tXsD5PaMoVmES6DgLc5EPtB8CIRxcy0TmjyugbrJWf+GacRizV9E48Bw4XkCg7Qhydy4olGgvA8bYlq0QnyW8BrmhGQBQXInviG7FS2sLCOhRKI2tyM0DnE9/zQNTx2gV1d5qsyrp27ui98NcTyCgR8EJInhpH5jrxDx7zFxD5ER1SzaJh4IdM12d82IATjmleGDCay5zK9VrTuzwNG2n4MVQdU4dE4SXLQ/M+3TDzieaGY6CgEDW+lFafTAshXs2UdeBU56GqA6ueGDO13TLKc+eMrNpyKFGqK29KK/9AMbMHcjNqtRIFwCgkkltVi74r3lgam98AOBUcelXyH1PbZ7P2OvIxr+qiXO8jobeYXCCD4xRFJZ+AuE1WslNfuSBm1+dvp3++sgtc+Pm4fzdbgT39kDRIhD3n0FxeQ4VYwbUXgQvRSGH+6C2xMD7JABAbn4GbiUOqf6JS+EXJw0PDAA8444LSmy5sHRRBU4juLdnM/PuAwh1H9iWNWMU+YUZlFLjENXBVP7O5Oj9NQ9c/9L1bPbq8wcB4bfC0kXFyhyC2n4QUigMAuIBK5k1FJam4JSmIQYG13le6Ot8D05NGABCJ6/M5a+90GYVW66bxkS/NTsFjtchBqMgvAxqF2EX58BcA4RIkMPHfqSh709oT8La6tT80AePX04DeCT73chRt2R96JaX++18wk/dJOEEnYlKT15Q6n/mRPntumfGf69l7PprCg19ewPAYe/d5L2xe+wK/5f4B2vSh+yy6hihAAAAAElFTkSuQmCC",
        contentType: "image/png",
        width: 16,
        height: 16,
        angle: 0,
        xoffset: 0,
        yoffset: 0
      },
      defaultLabel: "<all other values>",
      uniqueValueInfos: [
        {
          symbol: {
            type: "esriPMS",
            url: "4338cce98ddab8779f501946b7aa764c",
            imageData:
              "iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAABcxJREFUaIHtmFFsU1UYx39fqbYLm9RwkbuESdHCaDDYBR5IRE14cYYMR/TVtLyRjIfJHpqMmFBMTHiALcElTh8YPBgXwCqGZC8ukOzBl8VplqxLKhZY0iojFldkV0c/H3oLFcro7e5Eg/+kye0953zf9z/nu/9zvuPlPw7v4w5gqfifwOPG/wQqoartwMuqGhER8762nIhMAN+LyIhbPl0hoKox4G2gEUBEHuhjE2oH2lW1CzgnIkNL9b0kAqoaUtU4EALIf/114OeTJ81b334b+DOb9Vf2faq5eX7ljh35tfv25QIdHQDRYrH4iogcFZH0P07ATpcuEWmcGxtrzHR3hxbGxwPPAS2A777+Vjbr/zWZNH9KJk3vtm35YH9/umnnzhDQp6oD9aZVXQRUdScQB8geP27O9PRsfh4wFhnjA0z7Nzs+Hki9+ur2dceOpZoPHswBcVUtiMiY01gcE1DVUGXw13t6Nm/hwRlfDAbQBKR7ejYDVJDIOU2negh0iUhjOfhWp0Z8PmT/fhra2miNxZiuIGF/3O85MefIt533kdtTU/5cb2/oRQcGZO9eJBpF3nqr9OLKFbxAEPixtzcUePPNfEM4HFHVdiffg1MCURHh6qFDwdWW5V35qKAjEYhG8ezbB6tWlWycOoV+9RWaTAKwElhtWd6rhw4FW7/4IqWqUcB9Anbum7enpvy/JZNm8GEd7RSRWKxEANCJCXRoCP34Y7CsB4asBX5IJs3bU1OZhnDYVNVQrd+CkxV4A2D288+NNVUGSiyGdHbeS5GbN0uz3d+PTkw8Mog1tu2WRGLG9uUuAXtWyF+4YLSUg45EkO5upLPzXopculSa7aGhWk0DEACuXbhgtCQSM/Zq14SaCYhIBOD38fFAk8/HiulpWL/+bnsxkYCTJ9ErV5zEfRdNtu1KX7Wgvp3Yskp53deHp78fAD18uC5TS4UjArenpvxP28/Fzs7Sg03gccERgYZweP6P5YqkTjw5BY19TjGfam6ev5XN+qttYivyeQDuBALIrl3w2mtIMAjB4D07Fy/Cl18+IK23KB25y75cJ2BXU+3+cLgw9xACd+Hz4fnmm+p2Xn8duru5s3bt3za1OcAfDhcqfNUEJyn0PdD+7O7ds9dHRw2zSoc7gcC95ypV2WK4AazZvXu2wldNcEJgDOhqPngwN9PbG5qzLG9TReMKVQem/k5wDrB8vgX7WF2wfdUEJylUUNVzQNSMxzNXjxwJbXEQ8GK4CpjxeMb+e05ECrWOdapCZ4G3WxKJmRuffWZeS6cbWxymyv24BhRDoYJ9BirYPmqGIwL2KhwFPmg9f35ysq1te5NleQOPHFkdeeC6z7fw0vnzk/aro05mH+rYB0RkTFVHGsLh9g2Dg6nLsdhLW+swtABcBjYMDqYawuF5YOQfqYltDKhqyIhG+eX06dn06Kix2aGBNPDM3r05IxqdVdW0x+M5Wk8gdRGoSKVPNw0Pp37YunV7Lpv1V5PWasgBVnPzfOsnn6SBgojUFTws4SghImlVHfAaRtcLg4Op6T17Ik2USsTFcAuYAVoHB1New1gATj2Wiy0AETlbLBZfDnR07DQPHMhkPvoouNgtxQKQAcwDBzKBjo68qo55PB5HqnM/lnyYs5c/sv7EiczEyIiRTacbWx7SN0tJMtefOJFhialThhsECqr6PtC3mLRWkcz3nUpmNbhynBaRCVU92xAOv2PG45nLR46EKqW1LJnrPvwwbUvmWScHtsXgWj0gIgPFYjHSkkgwNzYW+Gl01Nhot6WBlbt2zdq3b2mPxzPgll9XCxo7p/s2DQ+nvlu3bkfOsrwAv/t8C23DwylcyvtKuE0graqnvIbRtfHMmcnpPXsiAK1nzky6IZnV4HpJWSmta959dwbALcmshmWpicvS+sLp0+XZdj11ylguAnel1X7limRWw7LdSpSltfy8XH6W9VpFRFyTy4fhybkX+rfiP0/gL9bfX+7lfOVyAAAAAElFTkSuQmCC",
            contentType: "image/png",
            width: 36,
            height: 36,
            angle: 0,
            xoffset: 0,
            yoffset: 13
          },
          value: "Closed",
          label: "Closed",
          description: ""
        },
        {
          symbol: {
            type: "esriPMS",
            url: "577aa38622412843f3c56c65a9d92066",
            imageData:
              "iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAABkJJREFUaIHtmH9sU+Uexj9v2zsW19GKRY4jtsulmTPgVuP+ELdKMCarbtzcDBmIue46M0ysEZDoogvRBIS7GIOaO71ARli80USBxB80A/FyyZbd6B0BpGa16Uw3Jzahsuk6s+Ghr3/sbHasjJ7uTDT6/NPTc973/X6f9zzneb/va+E3Dsu1TmC2+IPAtcYfBFIhpfQBpVJKjxBCuexZTAhxGjgjhGg3KqYhBKSUfwdWA1YAIcS0NhohH+CTUvqBg0KI/bONPSsCUkq3lLIRcAN0fNZh/7CzXfm8r8ceH4rnprZ12B2jS123DlVX+GLeEi9AXTKZLBdCNAshIr84AU0ufiGE9UzvWesr77zq7vk6bKfAjOoE3OYp7WMXB3PjQ13KiT0dyq2Li4Y21W6MlC65zQ3sklK2ZCurrAhIKSuARoC3jr2jvHbon8U4zail5it3ygF1IbDQTM+3vfbHXvaXPVnzRGj9vbUxoFFKmRBCdM45ASmle0rygTeK1aVmyMl8DPUGIN/Ma4E3igFSSMT0yikbAn4hhHUy+SJghom/HLacfO4vqqT4BjfPm/8xhYT2cW/Wk48uApruPX2x/tzWwD43TjJOfmVhBdVFlaxwVQDwzXBsvK8TWgP73OXL7hxyKU6PlNKn53vQS6BOCMHrh3YXjtjHLGrezO2LFyyh+hYfVUU+8nOsABwOH+G/fZ0cj47LXc2DEfuY5fVDuwubH38xJKWsA4wnoGlf6Yv1554IdihqSfqpn5DIqlt8FC1YAkD4Qi97vmgjED7CdxeHp/VRb4QTn3UofbH+qEtxKlJKd6bfgp43UAlwtPuYA4d5mnT+UlTJisKKSYkMX0xwOHyEt8++S+hC78wjmwGHmaPdxxwN1fUDWixjCWizQtfZLge28XvFC5bw4G1ruLuwfFIip745zQfhdt4PH8l06HHYoOtsl6Ohun5Ae9sZIWMCQggPQE80bM+7y86/a/ZwU/7P5c7eU20c/qKdgeGYrrwnoM6Hnu6wPTVWJshqIfvu4jDhCxHeCh5ky3I/ALu792cz1Kyhi0BfrD+XP41fbzm6dfxXI3CtoIuAS3GO8uNcpZIdfj8bGq1OURx2x2h8ZDA33SJ2vO4DAFa2raKsoJQ7Cm6nIE+hIH/RZJvu2BlOfNkxzVotI+Ml90Qswwlouymfa9HiRPyHwVxmWIVtOfn8q+qVtM9uv8nDuqWr+evb66cuaj+Aa9HiREqsjKBHQmcAX3mJN34yEHSwcHqDlW2rJq/L9q7UMTQQh/L7vfGUWBlBD4FOwL/+3tpY63v73CPfj1nU+T8/7G44rmOoqQQt30Pej/NUraxOaLEygh4JJaSUB4G6dZW10db/vOlm/lW7ZYavYV1lbVT7d1AIkci0q14XOgCsbqiuH/jo04+V/q/OWXVL5fIEvgKntSCh1UAJLUbm/fU01t5CM7Dtpcd3Butf3FA2Yh2zqNfrGSUl+CDkDc5TX2raGdRuNeuZfchiHRBCdEop212K0/fU+o2hbW/uXMb86dXpVXEJiF7iqb9tDLkU5yjQ/ovsiTW0SCndVcvvI/C/QPxkb9ChFukM3AsrlnljVcvvi0spIyaTqTmbRLIikCKlvTs2bA89tO2Rsvj5wVw1jbWmDXoeHKbrR597+JkIkBBCZJU8zKKUEEJEpJQtNqvN3/jQ5tDTLU0ey3VmrrbNtIwAfZdo9G8O2aw2FWi7JgdbAEKIA8lkstRb4q1Yc09N9N1P3itkplOKS0A/rLmnJuot8Q5JKTtNJpMu17kcsy7mtNfv2bJ2U/STz//v6D93zqrefIVg58Ytc8vaTVFmKZ3JMWc7gPY9bAV2zWStaSxzq17LTAdDymkhxGkp5QGX4nxgXWVttDWw3z3FWjXLfLSmPqJZ5gE9BdtMMGw/IIRoSSaTnobqek6HT9lP9gUd6p+1IL1wh7s0rp2+RUwmU4tRcQ3d0Gia3rVjw/ZQzbNr7xw5P2YByBudp+7YsD2EQbpPhdEEIlLKNpvV5n+hoSn4dEuTB+AFf1PQCMtMB8O3lKnWWnWXbwDAKMtMhznZE09Y69a65yZm23DpTGCuCExaq3bLEMtMhzk7lZiw1onruYozp8cqQgjD7PJK+P2cC/1a8Zsn8BOhs3yy9LpzPwAAAABJRU5ErkJggg==",
            contentType: "image/png",
            width: 36,
            height: 36,
            angle: 0,
            xoffset: 0,
            yoffset: 13
          },
          value: "Open",
          label: "Open",
          description: ""
        }
      ]
    },
    transparency: 0,
    labelingInfo: null
  },
  allowGeometryUpdates: true,
  hasAttachments: false,
  htmlPopupType: "esriServerHTMLPopupTypeAsHTMLText",
  hasM: false,
  hasZ: false,
  objectIdField: "OBJECTID",
  uniqueIdField: {
    name: "OBJECTID",
    isSystemMaintained: true
  },
  globalIdField: "",
  typeIdField: "OPSSTATUS",
  fields: [
    {
      name: "OBJECTID",
      type: "esriFieldTypeOID",
      alias: "OBJECTID",
      sqlType: "sqlTypeOther",
      nullable: false,
      editable: false,
      domain: null,
      defaultValue: null
    },
    {
      name: "FACILITYID",
      type: "esriFieldTypeString",
      alias: "Emergency Facility ID",
      sqlType: "sqlTypeOther",
      length: 20,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "FACNAME",
      type: "esriFieldTypeString",
      alias: "Name",
      sqlType: "sqlTypeOther",
      length: 255,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "FULLADDR",
      type: "esriFieldTypeString",
      alias: "Site Address",
      sqlType: "sqlTypeOther",
      length: 250,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "ORGANIZ",
      type: "esriFieldTypeString",
      alias: "Organization",
      sqlType: "sqlTypeOther",
      length: 255,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "REDXMODEL",
      type: "esriFieldTypeString",
      alias: "Red Cross Model",
      sqlType: "sqlTypeOther",
      length: 50,
      nullable: true,
      editable: true,
      domain: {
        type: "codedValue",
        name: "RedCrossShelterModel",
        codedValues: [
          {
            name: "Red Cross Managed",
            code: "Model 1"
          },
          {
            name: "Red Cross Partnered",
            code: "Model 2"
          },
          {
            name: "Red Cross Supported",
            code: "Model 3"
          },
          {
            name: "Independent",
            code: "Model 4"
          },
          {
            name: "Unknown",
            code: "Unknown"
          }
        ]
      },
      defaultValue: null
    },
    {
      name: "POCNAME",
      type: "esriFieldTypeString",
      alias: "Contact Name",
      sqlType: "sqlTypeOther",
      length: 255,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "POCEMAIL",
      type: "esriFieldTypeString",
      alias: "Contact Email",
      sqlType: "sqlTypeOther",
      length: 255,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "POCPHONE",
      type: "esriFieldTypeString",
      alias: "Contact Phone",
      sqlType: "sqlTypeOther",
      length: 255,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "CAPACITY",
      type: "esriFieldTypeSmallInteger",
      alias: "Total Capacity",
      sqlType: "sqlTypeOther",
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "NUMBEDS",
      type: "esriFieldTypeSmallInteger",
      alias: "# of Beds Available",
      sqlType: "sqlTypeOther",
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "OCCUPANCY",
      type: "esriFieldTypeSmallInteger",
      alias: "Current Occupancy",
      sqlType: "sqlTypeOther",
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "HOURSOPER",
      type: "esriFieldTypeString",
      alias: "Hours Operation",
      sqlType: "sqlTypeOther",
      length: 255,
      nullable: true,
      editable: true,
      domain: {
        type: "codedValue",
        name: "OperationalHours",
        codedValues: [
          {
            name: "Daylight",
            code: "Daylight"
          },
          {
            name: "Other",
            code: "Other"
          },
          {
            name: "6:00am-7:00pm",
            code: "6:00am-7:00pm"
          },
          {
            name: "24 Hours/Day",
            code: "24 Hours/Day"
          },
          {
            name: "8:30am-5:00pm",
            code: "8:30am-5:00pm"
          }
        ]
      },
      defaultValue: null
    },
    {
      name: "HANDICAP",
      type: "esriFieldTypeString",
      alias: "Handicap Accessible",
      sqlType: "sqlTypeOther",
      length: 5,
      nullable: true,
      editable: true,
      domain: {
        type: "codedValue",
        name: "YesNo",
        codedValues: [
          {
            name: "Yes",
            code: "Yes"
          },
          {
            name: "No",
            code: "No"
          }
        ]
      },
      defaultValue: null
    },
    {
      name: "BACKPOWER",
      type: "esriFieldTypeString",
      alias: "Generator",
      sqlType: "sqlTypeOther",
      length: 5,
      nullable: true,
      editable: true,
      domain: {
        type: "codedValue",
        name: "YesNo",
        codedValues: [
          {
            name: "Yes",
            code: "Yes"
          },
          {
            name: "No",
            code: "No"
          }
        ]
      },
      defaultValue: null
    },
    {
      name: "ALLOWPETS",
      type: "esriFieldTypeString",
      alias: "Allows Pets / Animals",
      sqlType: "sqlTypeOther",
      length: 5,
      nullable: true,
      editable: true,
      domain: {
        type: "codedValue",
        name: "YesNo",
        codedValues: [
          {
            name: "Yes",
            code: "Yes"
          },
          {
            name: "No",
            code: "No"
          }
        ]
      },
      defaultValue: null
    },
    {
      name: "DAYSOPER",
      type: "esriFieldTypeString",
      alias: "Days Operation",
      sqlType: "sqlTypeOther",
      length: 255,
      nullable: true,
      editable: true,
      domain: {
        type: "codedValue",
        name: "OperationalDays",
        codedValues: [
          {
            name: "Sun-Sat",
            code: "Sun-Sat"
          },
          {
            name: "Mon-Fri",
            code: "Mon-Fri"
          },
          {
            name: "Sat-Sun",
            code: "Sat-Sun"
          },
          {
            name: "Other",
            code: "Other"
          }
        ]
      },
      defaultValue: null
    },
    {
      name: "ACCESSRES",
      type: "esriFieldTypeString",
      alias: "Access Restrictions",
      sqlType: "sqlTypeOther",
      length: 255,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "OPENDATE",
      type: "esriFieldTypeDate",
      alias: "Open Date",
      sqlType: "sqlTypeOther",
      length: 8,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "CLOSEDDATE",
      type: "esriFieldTypeDate",
      alias: "Closed Date",
      sqlType: "sqlTypeOther",
      length: 8,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "OPSSTATUS",
      type: "esriFieldTypeString",
      alias: "Operational Status",
      sqlType: "sqlTypeOther",
      length: 50,
      nullable: true,
      editable: true,
      domain: {
        type: "codedValue",
        name: "ShelterOperationalStatus",
        codedValues: [
          {
            name: "Alert",
            code: "Alert"
          },
          {
            name: "Standby",
            code: "Standby"
          },
          {
            name: "Unknown",
            code: "Unknown"
          },
          {
            name: "Closed",
            code: "Closed"
          },
          {
            name: "Open",
            code: "Open"
          }
        ]
      },
      defaultValue: null
    },
    {
      name: "LASTUPDATE",
      type: "esriFieldTypeDate",
      alias: "Last Update Date",
      sqlType: "sqlTypeOther",
      length: 8,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    },
    {
      name: "LASTEDITOR",
      type: "esriFieldTypeString",
      alias: "Last Editor",
      sqlType: "sqlTypeOther",
      length: 50,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    }
  ],
  indexes: [
    {
      name: "user_15533.TestLayerForDashBoardMap_EMERGENCY_SHELTER_Shape_sidx",
      fields: "Shape",
      isAscending: false,
      isUnique: false,
      description: "Shape Index"
    },
    {
      name: "PK__TestLaye__F4B70D85DF92AF45",
      fields: "OBJECTID",
      isAscending: true,
      isUnique: true,
      description: "clustered, unique, primary key"
    }
  ],
  types: [
    {
      id: "Open",
      name: "Open",
      domains: {
        REDXMODEL: {
          type: "inherited"
        },
        HOURSOPER: {
          type: "inherited"
        },
        HANDICAP: {
          type: "inherited"
        },
        BACKPOWER: {
          type: "inherited"
        },
        ALLOWPETS: {
          type: "inherited"
        },
        DAYSOPER: {
          type: "inherited"
        },
        OPSSTATUS: {
          type: "inherited"
        }
      },
      templates: [
        {
          name: "Open",
          description: "",
          drawingTool: "esriFeatureEditToolPoint",
          prototype: {
            attributes: {
              OPSSTATUS: "Open",
              LASTEDITOR: null,
              FACILITYID: null,
              FACNAME: null,
              FULLADDR: null,
              ORGANIZ: null,
              REDXMODEL: null,
              POCNAME: null,
              POCEMAIL: null,
              POCPHONE: null,
              CAPACITY: null,
              NUMBEDS: null,
              OCCUPANCY: null,
              HOURSOPER: null,
              HANDICAP: null,
              BACKPOWER: null,
              ALLOWPETS: null,
              DAYSOPER: null,
              ACCESSRES: null,
              OPENDATE: null,
              CLOSEDDATE: null,
              LASTUPDATE: null
            }
          }
        }
      ]
    },
    {
      id: "Closed",
      name: "Closed",
      domains: {
        REDXMODEL: {
          type: "inherited"
        },
        HOURSOPER: {
          type: "inherited"
        },
        HANDICAP: {
          type: "inherited"
        },
        BACKPOWER: {
          type: "inherited"
        },
        ALLOWPETS: {
          type: "inherited"
        },
        DAYSOPER: {
          type: "inherited"
        },
        OPSSTATUS: {
          type: "inherited"
        }
      },
      templates: [
        {
          name: "Closed",
          description: "",
          drawingTool: "esriFeatureEditToolPoint",
          prototype: {
            attributes: {
              OPSSTATUS: "Closed",
              LASTEDITOR: null,
              FACILITYID: null,
              FACNAME: null,
              FULLADDR: null,
              ORGANIZ: null,
              REDXMODEL: null,
              POCNAME: null,
              POCEMAIL: null,
              POCPHONE: null,
              CAPACITY: null,
              NUMBEDS: null,
              OCCUPANCY: null,
              HOURSOPER: null,
              HANDICAP: null,
              BACKPOWER: null,
              ALLOWPETS: null,
              DAYSOPER: null,
              ACCESSRES: null,
              OPENDATE: null,
              CLOSEDDATE: null,
              LASTUPDATE: null
            }
          }
        }
      ]
    }
  ],
  templates: [],
  supportedQueryFormats: "JSON, geoJSON, PBF",
  hasStaticData: false,
  maxRecordCount: 1000,
  standardMaxRecordCount: 32000,
  tileMaxRecordCount: 8000,
  maxRecordCountFactor: 1,
  capabilities: "Create,Delete,Query,Update,Editing"
};

const expectedUpdatedTemplate: any = {
  itemId: "eff3f22d41ad42dcb6fe9015f26d40f4",
  type: "Dashboard",
  key: "w5u0o8te",
  item: {
    id: "{{eff3f22d41ad42dcb6fe9015f26d40f4.itemId}}",
    type: "Dashboard",
    categories: [],
    culture: "en-us",
    description: null,
    extent: "{{initiative.orgExtent:optional}}",
    licenseInfo: null,
    name: null,
    snippet: null,
    tags: ["test"],
    thumbnail: "thumbnail/ago_downloaded.png",
    title: "Dashboard",
    typeKeywords: ["Dashboard", "Operations Dashboard"],
    url: null
  },
  data: {
    version: 27,
    headerPanel: {
      type: "headerPanel",
      size: "medium",
      logoIcon:
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" id="ember4492" class="icon ember-view" viewBox="0 0 21 21">\n<path d="M10.8,7.2c0,0,0.7-0.7,0.8-1.1c0-0.3,0.1-0.7,0.2-1c-0.6-0.5-1.3-0.9-2-1.1C9,3.8,8.2,3.7,7.4,3.7l0.2-0.2&#10;&#9;c1.3-0.3,2.7-0.4,4.1-0.2c1.2,0.2,2.3,0.6,3.2,1.4c0.2,0.2,0.7,0.8,0.7,1.1c0,0.3,0,0.6,0.2,0.8C16,6.7,16.5,7,16.5,7&#10;&#9;c0.3-0.1,0.6-0.2,0.9-0.1c0.3,0.2,0.7,0.4,0.9,0.7c0.1,0.2,0.1,0.4,0.1,0.6C18.3,8.5,18.2,8.7,18,9s-0.5,0.6-0.8,0.9&#10;&#9;c-0.2,0-0.3,0.1-0.5,0c-0.2-0.1-0.4-0.2-0.5-0.3c-0.3-0.3-0.6-0.7-0.8-1.1c-0.2-0.4-0.6-0.7-1.1-0.8c-0.7,0.1-1.3,0.4-1.9,0.6&#10;&#9;c0,0,0.1-0.1-0.6-0.7C11.4,7.5,11.2,7.3,10.8,7.2z M3.4,17.3c0.6,0.5,0.9,0.6,1.3,0.5c0.4-0.1,5.5-6.9,6.8-8.5&#10;&#9;c0-0.1-0.1-0.3-0.7-0.6c-0.2-0.2-0.5-0.4-0.8-0.5c-0.5,0.6-7.2,7.7-7.3,7.9C2.5,16.3,2.4,16.4,3.4,17.3z"/>\n</svg>',
      showMargin: true,
      backgroundImageSizing: "fit-height",
      normalBackgroundImagePlacement: "left",
      horizontalBackgroundImagePlacement: "top",
      showSignOutMenu: true,
      menuLinks: [],
      selectors: [
        {
          type: "categorySelectorWidget",
          category: {
            type: "features",
            itemText:
              "{{{4efe5f693de34620934787ead6693f19.layer2.fields.facilityid.name}}}"
          },
          selection: {
            type: "single",
            defaultSelection: "first",
            operator: "equal"
          },
          preferredDisplayType: "dropdown",
          displayThreshold: 10,
          datasets: [
            {
              type: "serviceDataset",
              dataSource: {
                id:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              },
              filter: {
                type: "filterGroup",
                condition: "OR",
                rules: [
                  {
                    type: "filterGroup",
                    condition: "AND",
                    rules: [
                      {
                        type: "filterRule",
                        field: {
                          name:
                            "{{4efe5f693de34620934787ead6693f19.layer2.fields.facname.name}}",
                          type: "esriFieldTypeString"
                        },
                        operator: "equal",
                        constraint: {
                          type: "field",
                          value:
                            "{{4efe5f693de34620934787ead6693f19.layer2.fields.organiz.name}}"
                        }
                      },
                      {
                        type: "filterRule",
                        field: {
                          name:
                            "{{4efe5f693de34620934787ead6693f19.layer2.fields.objectid.name}}",
                          type: "esriFieldTypeOID"
                        },
                        operator: "between",
                        constraint: {
                          type: "range",
                          startValue: "0",
                          endValue: "100000"
                        }
                      }
                    ]
                  }
                ]
              },
              outFields: ["*"],
              groupByFields: [],
              orderByFields: [
                "{{4efe5f693de34620934787ead6693f19.layer2.fields.organiz.name}} asc"
              ],
              statisticDefinitions: [],
              maxFeatures: 50,
              querySpatialRelationship: "esriSpatialRelIntersects",
              returnGeometry: false,
              clientSideStatistics: false,
              name: "main"
            }
          ],
          id: "f81f2270-e104-453d-9c09-045d8d1087c9",
          name: "Category Selector (1)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        },
        {
          type: "categorySelectorWidget",
          category: {
            type: "features",
            itemText:
              "{{{4efe5f693de34620934787ead6693f19.layer2.fields.facilityid.name}}}"
          },
          selection: {
            type: "single",
            defaultSelection: "first",
            operator: "equal"
          },
          preferredDisplayType: "dropdown",
          displayThreshold: 10,
          datasets: [
            {
              type: "serviceDataset",
              dataSource: {
                id:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              },
              outFields: ["*"],
              groupByFields: [],
              orderByFields: [
                "{{4efe5f693de34620934787ead6693f19.layer2.fields.facname.name}} asc"
              ],
              statisticDefinitions: [],
              maxFeatures: 50,
              querySpatialRelationship: "esriSpatialRelIntersects",
              returnGeometry: false,
              clientSideStatistics: false,
              name: "main"
            }
          ],
          id: "90ebe87f-b8b4-4f1c-bc1c-313a2a799c80",
          name: "Category Selector (2)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        },
        {
          type: "categorySelectorWidget",
          category: {
            type: "features",
            itemText:
              "{{{4efe5f693de34620934787ead6693f19.layer2.fields.facilityid.name}}} {{{4efe5f693de34620934787ead6693f19.layer2.fields.facname.name}}} {{{4efe5f693de34620934787ead6693f19.layer2.fields.pocphone.name}}}"
          },
          selection: {
            type: "single",
            defaultSelection: "first",
            operator: "equal"
          },
          preferredDisplayType: "dropdown",
          displayThreshold: 10,
          datasets: [
            {
              type: "serviceDataset",
              dataSource: {
                id:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              },
              filter: {
                type: "filterGroup",
                condition: "OR",
                rules: [
                  {
                    type: "filterGroup",
                    condition: "AND",
                    rules: [
                      {
                        type: "filterRule",
                        field: {
                          name:
                            "{{4efe5f693de34620934787ead6693f19.layer2.fields.facilityid.name}}",
                          type: "esriFieldTypeString"
                        },
                        operator: "equal",
                        constraint: {
                          type: "value",
                          value: "1"
                        }
                      },
                      {
                        type: "filterRule",
                        field: {
                          name:
                            "{{4efe5f693de34620934787ead6693f19.layer2.fields.facilityid.name}}",
                          type: "esriFieldTypeString"
                        },
                        operator: "equal",
                        constraint: {
                          type: "value",
                          value: "1"
                        }
                      },
                      {
                        type: "filterRule",
                        field: {
                          name:
                            "{{4efe5f693de34620934787ead6693f19.layer2.fields.fulladdr.name}}",
                          type: "esriFieldTypeString"
                        },
                        operator: "equal",
                        constraint: {
                          type: "value",
                          value: "1"
                        }
                      }
                    ]
                  }
                ]
              },
              outFields: ["*"],
              groupByFields: [],
              orderByFields: [],
              statisticDefinitions: [],
              maxFeatures: 50,
              querySpatialRelationship: "esriSpatialRelIntersects",
              returnGeometry: false,
              clientSideStatistics: false,
              name: "main"
            }
          ],
          id: "238a75d4-4a35-4747-918a-d2353b1698bd",
          name: "Category Selector (3)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        },
        {
          type: "categorySelectorWidget",
          category: {
            type: "features"
          },
          selection: {
            type: "single",
            defaultSelection: "first",
            operator: "equal"
          },
          preferredDisplayType: "dropdown",
          displayThreshold: 10,
          datasets: [
            {
              type: "serviceDataset",
              dataSource: {
                id:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              },
              filter: {
                type: "filterGroup",
                condition: "OR",
                rules: [
                  {
                    type: "filterGroup",
                    condition: "AND",
                    rules: [
                      {
                        type: "filterRule",
                        field: {
                          name:
                            "{{4efe5f693de34620934787ead6693f19.layer2.fields.facilityid.name}}",
                          type: "esriFieldTypeString"
                        },
                        operator: "equal",
                        constraint: {
                          type: "value",
                          value: "12"
                        }
                      }
                    ]
                  }
                ]
              },
              outFields: ["*"],
              groupByFields: [],
              orderByFields: [],
              statisticDefinitions: [],
              maxFeatures: 50,
              querySpatialRelationship: "esriSpatialRelIntersects",
              returnGeometry: false,
              clientSideStatistics: false,
              name: "main"
            }
          ],
          events: [
            {
              type: "selectionChanged",
              actions: [
                {
                  type: "filter",
                  by: "whereClause",
                  targetId:
                    "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
                },
                {
                  type: "filter",
                  by: "whereClause",
                  targetId: "90ebe87f-b8b4-4f1c-bc1c-313a2a799c80#main"
                },
                {
                  type: "flashGeometry",
                  targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
                },
                {
                  type: "identify",
                  targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
                }
              ]
            }
          ],
          id: "bfbc8214-5549-4fe7-a919-d7857ce0ea16",
          name: "Category Selector (4)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        },
        {
          type: "categorySelectorWidget",
          category: {
            type: "features",
            itemText:
              "{{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.name.name}}}"
          },
          selection: {
            type: "single",
            defaultSelection: "first",
            operator: "equal"
          },
          preferredDisplayType: "dropdown",
          displayThreshold: 10,
          datasets: [
            {
              type: "serviceDataset",
              dataSource: {
                type: "featureServiceDataSource",
                itemId: "{{934a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
                layerId: 0,
                table: false
              },
              filter: {
                type: "filterGroup",
                condition: "OR",
                rules: [
                  {
                    type: "filterGroup",
                    condition: "AND",
                    rules: [
                      {
                        type: "filterRule",
                        field: {
                          name:
                            "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.owntype.name}}",
                          type: "esriFieldTypeString"
                        },
                        operator: "equal",
                        constraint: {
                          type: "value",
                          value: "1"
                        }
                      },
                      {
                        type: "filterRule",
                        field: {
                          name:
                            "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.facilityid.name}}",
                          type: "esriFieldTypeString"
                        },
                        operator: "equal",
                        constraint: {
                          type: "value",
                          value: "1"
                        }
                      }
                    ]
                  }
                ]
              },
              outFields: ["*"],
              groupByFields: [],
              orderByFields: [],
              statisticDefinitions: [],
              maxFeatures: 50,
              querySpatialRelationship: "esriSpatialRelIntersects",
              returnGeometry: false,
              clientSideStatistics: false,
              name: "main"
            }
          ],
          events: [
            {
              type: "selectionChanged",
              actions: [
                {
                  type: "filter",
                  by: "whereClause",
                  fieldMap: [
                    {
                      sourceName:
                        "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.facilityid.name}}",
                      targetName:
                        "{{4efe5f693de34620934787ead6693f19.layer2.fields.fulladdr.name}}"
                    }
                  ],
                  targetId: "f81f2270-e104-453d-9c09-045d8d1087c9#main"
                }
              ]
            }
          ],
          id: "79de7d45-0586-43fa-91e6-9d020c88d2d3",
          name: "Category Selector (5)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        },
        {
          type: "dateSelectorWidget",
          optionType: "definedOptions",
          definedOptions: {
            type: "definedOptions",
            displayType: "dropdown",
            defaultSelection: "first",
            namedFilters: []
          },
          events: [
            {
              type: "selectionChanged",
              actions: [
                {
                  type: "filter",
                  by: "whereClause",
                  fieldMap: [
                    {
                      sourceName: "filterField",
                      targetName:
                        "{{4efe5f693de34620934787ead6693f19.layer2.fields.closeddate.name}}"
                    }
                  ],
                  targetId:
                    "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
                }
              ]
            }
          ],
          id: "cdc451c3-846f-4ac9-afe7-c0292d35f1bd",
          name: "Date Selector (1)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        }
      ]
    },
    leftPanel: {
      type: "leftPanel",
      selectors: [
        {
          type: "categorySelectorWidget",
          category: {
            type: "features",
            itemText:
              "{{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.name.name}}}"
          },
          selection: {
            type: "single",
            defaultSelection: "first",
            operator: "equal"
          },
          preferredDisplayType: "dropdown",
          displayThreshold: 10,
          datasets: [
            {
              type: "serviceDataset",
              dataSource: {
                type: "featureServiceDataSource",
                itemId: "{{934a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
                layerId: 0,
                table: false
              },
              filter: {
                type: "filterGroup",
                condition: "OR",
                rules: [
                  {
                    type: "filterGroup",
                    condition: "AND",
                    rules: [
                      {
                        type: "filterRule",
                        field: {
                          name:
                            "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.facilityid.name}}",
                          type: "esriFieldTypeString"
                        },
                        operator: "equal",
                        constraint: {
                          type: "value",
                          value: "1"
                        }
                      }
                    ]
                  }
                ]
              },
              outFields: ["*"],
              groupByFields: [],
              orderByFields: [],
              statisticDefinitions: [],
              maxFeatures: 50,
              querySpatialRelationship: "esriSpatialRelIntersects",
              returnGeometry: false,
              clientSideStatistics: false,
              name: "main"
            }
          ],
          events: [
            {
              type: "selectionChanged",
              actions: [
                {
                  type: "filter",
                  by: "whereClause",
                  fieldMap: [
                    {
                      sourceName:
                        "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.facilityid.name}}",
                      targetName:
                        "{{4efe5f693de34620934787ead6693f19.layer2.fields.fulladdr.name}}"
                    }
                  ],
                  targetId: "f81f2270-e104-453d-9c09-045d8d1087c9#main"
                }
              ]
            }
          ],
          id: "0ef05811-5ef1-4079-b8c3-68671d1d2a77",
          name: "Category Selector (6)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        },
        {
          type: "dateSelectorWidget",
          optionType: "definedOptions",
          definedOptions: {
            type: "definedOptions",
            displayType: "dropdown",
            defaultSelection: "first",
            namedFilters: []
          },
          events: [
            {
              type: "selectionChanged",
              actions: [
                {
                  type: "filter",
                  by: "whereClause",
                  fieldMap: [
                    {
                      sourceName: "filterField",
                      targetName:
                        "{{4efe5f693de34620934787ead6693f19.layer2.fields.closeddate.name}}"
                    }
                  ],
                  targetId:
                    "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
                }
              ]
            }
          ],
          id: "ed1704e5-1a5b-4155-b522-d702ee818e80",
          name: "Date Selector (2)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        },
        {
          type: "categorySelectorWidget",
          category: {
            type: "static"
          },
          selection: {
            type: "single",
            defaultSelection: "first",
            operator: "equal"
          },
          preferredDisplayType: "dropdown",
          displayThreshold: 10,
          datasets: [
            {
              type: "staticDataset",
              data: {
                type: "staticValues",
                dataType: "string",
                values: []
              },
              name: "main"
            }
          ],
          events: [
            {
              type: "selectionChanged",
              actions: [
                {
                  type: "filter",
                  by: "whereClause",
                  fieldMap: [
                    {
                      sourceName: "filterField",
                      targetName:
                        "{{4efe5f693de34620934787ead6693f19.layer2.fields.facname.name}}"
                    }
                  ],
                  targetId:
                    "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
                }
              ]
            }
          ],
          id: "38b8b9b2-0a0c-4c31-b24d-0f087229a0be",
          name: "Category Selector (7)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        },
        {
          type: "categorySelectorWidget",
          category: {
            type: "static"
          },
          selection: {
            type: "single",
            defaultSelection: "first",
            operator: "equal"
          },
          preferredDisplayType: "dropdown",
          displayThreshold: 10,
          datasets: [
            {
              type: "staticDataset",
              data: {
                type: "staticValues",
                dataType: "string",
                values: []
              },
              name: "main"
            }
          ],
          events: [
            {
              type: "selectionChanged",
              actions: [
                {
                  type: "filter",
                  by: "whereClause",
                  fieldMap: [
                    {
                      sourceName: "filterField",
                      targetName:
                        "{{4efe5f693de34620934787ead6693f19.layer2.fields.fulladdr.name}}"
                    }
                  ],
                  targetId: "7866f4bd-8361-4205-8fd7-f92da41fdb61#main"
                }
              ]
            }
          ],
          id: "5dd48c85-d155-4ce1-a61e-59623aba6319",
          name: "Category Selector (8)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        },
        {
          type: "categorySelectorWidget",
          category: {
            type: "features",
            itemText:
              "{{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.facilityid.name}}}"
          },
          selection: {
            type: "single",
            defaultSelection: "first",
            operator: "equal"
          },
          preferredDisplayType: "dropdown",
          displayThreshold: 10,
          datasets: [
            {
              type: "serviceDataset",
              dataSource: {
                type: "featureServiceDataSource",
                itemId: "{{934a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
                layerId: 0,
                table: false
              },
              filter: {
                type: "filterGroup",
                condition: "OR",
                rules: [
                  {
                    type: "filterGroup",
                    condition: "AND",
                    rules: [
                      {
                        type: "filterRule",
                        field: {
                          name:
                            "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.facilityid.name}}",
                          type: "esriFieldTypeString"
                        },
                        operator: "equal",
                        constraint: {
                          type: "value",
                          value: "34"
                        }
                      }
                    ]
                  }
                ]
              },
              outFields: ["*"],
              groupByFields: [],
              orderByFields: [],
              statisticDefinitions: [],
              maxFeatures: 50,
              querySpatialRelationship: "esriSpatialRelIntersects",
              returnGeometry: false,
              clientSideStatistics: false,
              name: "main"
            }
          ],
          id: "a78ee2ac-bfe2-4a4c-a477-1d4abb76419a",
          name: "Category Selector (9)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        },
        {
          type: "categorySelectorWidget",
          category: {
            type: "static"
          },
          selection: {
            type: "single",
            defaultSelection: "first",
            operator: "equal"
          },
          preferredDisplayType: "dropdown",
          displayThreshold: 10,
          datasets: [
            {
              type: "staticDataset",
              data: {
                type: "staticValues",
                dataType: "string",
                values: []
              },
              name: "main"
            }
          ],
          events: [
            {
              type: "selectionChanged",
              actions: [
                {
                  type: "filter",
                  by: "whereClause",
                  fieldMap: [
                    {
                      sourceName: "filterField",
                      targetName:
                        "{{4efe5f693de34620934787ead6693f19.layer2.fields.fulladdr.name}}"
                    }
                  ],
                  targetId: "c220e9bb-f0b9-4f0e-93e8-8baa3f39aa0c#main"
                }
              ]
            }
          ],
          id: "114026d5-93ff-4d11-9343-50b1e7f72eca",
          name: "Category Selector (10)",
          showLastUpdate: true,
          noDataVerticalAlignment: "middle",
          showCaptionWhenNoData: true,
          showDescriptionWhenNoData: true
        }
      ]
    },
    widgets: [
      {
        type: "mapWidget",
        flashRepeats: 3,
        itemId: "{{7e6c41c72d4548d9a312329e0c5a984f.itemId}}",
        mapTools: [],
        showNavigation: false,
        showPopup: true,
        scalebarStyle: "none",
        layers: [
          {
            events: [
              {
                type: "selectionChanged",
                actions: [
                  {
                    type: "flashGeometry",
                    targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
                  },
                  {
                    type: "pan",
                    targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
                  },
                  {
                    type: "zoom",
                    targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
                  }
                ]
              }
            ],
            type: "featureLayerDataSource",
            layerId: "TestLayerForDashBoardMap_632"
          }
        ],
        id: "b38e032d-bf0c-426f-8036-b86341eb3693",
        name: "DashboardMap",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "legendWidget",
        mapWidgetId: "b38e032d-bf0c-426f-8036-b86341eb3693",
        id: "92010c2e-38e0-405b-b628-5aa95e3c8d56",
        name: "Map Legend (1)",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "gaugeWidget",
        style: "progress",
        displayAsPercentage: false,
        valueFormat: {
          name: "value",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        percentageFormat: {
          name: "percentage",
          type: "decimal",
          prefix: false,
          pattern: "#.#%"
        },
        arrows: [],
        axes: [
          {
            id: "main",
            style: "progress",
            startAngle: -120,
            endAngle: 120,
            startValue: 0,
            endValue: 1,
            labelsEnabled: false,
            labelOffset: 0,
            color: null,
            inside: true,
            gridInside: true,
            axisAlpha: 0,
            axisColor: null,
            axisThickness: 0,
            tickAlpha: 0,
            tickColor: null,
            tickLength: 0,
            tickThickness: 0,
            minorTickLength: 0,
            radius: "100%",
            bottomText: "",
            bands: [
              {
                id: "background",
                alpha: 1,
                color: "#d6d6d6",
                startValue: 0,
                endValue: 1,
                radius: "100%",
                innerRadius: "75%",
                colorThresholds: []
              },
              {
                id: "value",
                alpha: 1,
                color: "#ffaa00",
                startValue: 0,
                endValue: 0.5,
                radius: "100%",
                innerRadius: "75%",
                colorThresholds: []
              }
            ]
          },
          {
            id: "labels",
            style: "progress",
            startAngle: -125,
            endAngle: 125,
            startValue: 0,
            endValue: 1,
            labelsEnabled: true,
            labelOffset: 0,
            fontSize: 20,
            color: null,
            inside: true,
            gridInside: true,
            axisAlpha: 0,
            axisColor: null,
            axisThickness: 0,
            tickAlpha: 0,
            tickColor: null,
            tickLength: 0,
            tickThickness: 0,
            minorTickLength: 0,
            radius: "100%",
            bottomText: "",
            bands: []
          }
        ],
        labels: [
          {
            id: "value",
            align: "center",
            color: null,
            size: 12,
            y: "40%"
          }
        ],
        valueField:
          "{{4efe5f693de34620934787ead6693f19.layer2.fields.numbeds.name}}",
        minValueField:
          "{{4efe5f693de34620934787ead6693f19.layer2.fields.occupancy.name}}",
        maxValueField:
          "{{4efe5f693de34620934787ead6693f19.layer2.fields.occupancy.name}}",
        noValueVerticalAlignment: "middle",
        showCaptionWhenNoValue: true,
        showDescriptionWhenNoValue: true,
        valueType: "feature",
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name:
                          "{{4efe5f693de34620934787ead6693f19.layer2.fields.facilityid.name}}",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "12"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [
              "{{4efe5f693de34620934787ead6693f19.layer2.fields.facname.name}} asc",
              "{{4efe5f693de34620934787ead6693f19.layer2.fields.facilityid.name}} asc"
            ],
            statisticDefinitions: [],
            maxFeatures: 50,
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        id: "7866f4bd-8361-4205-8fd7-f92da41fdb61",
        name: "Gauge (1)",
        caption: "<p>Gauge Feature</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "gaugeWidget",
        style: "progress",
        displayAsPercentage: false,
        valueFormat: {
          name: "value",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        percentageFormat: {
          name: "percentage",
          type: "decimal",
          prefix: false,
          pattern: "#.#%"
        },
        arrows: [],
        axes: [
          {
            id: "main",
            style: "progress",
            startAngle: -120,
            endAngle: 120,
            startValue: 0,
            endValue: 1,
            labelsEnabled: false,
            labelOffset: 0,
            color: null,
            inside: true,
            gridInside: true,
            axisAlpha: 0,
            axisColor: null,
            axisThickness: 0,
            tickAlpha: 0,
            tickColor: null,
            tickLength: 0,
            tickThickness: 0,
            minorTickLength: 0,
            radius: "100%",
            bottomText: "",
            bands: [
              {
                id: "background",
                alpha: 1,
                color: "#d6d6d6",
                startValue: 0,
                endValue: 1,
                radius: "100%",
                innerRadius: "75%",
                colorThresholds: []
              },
              {
                id: "value",
                alpha: 1,
                color: "#ffaa00",
                startValue: 0,
                endValue: 0.5,
                radius: "100%",
                innerRadius: "75%",
                colorThresholds: []
              }
            ]
          },
          {
            id: "labels",
            style: "progress",
            startAngle: -125,
            endAngle: 125,
            startValue: 0,
            endValue: 1,
            labelsEnabled: true,
            labelOffset: 0,
            fontSize: 20,
            color: null,
            inside: true,
            gridInside: true,
            axisAlpha: 0,
            axisColor: null,
            axisThickness: 0,
            tickAlpha: 0,
            tickColor: null,
            tickLength: 0,
            tickThickness: 0,
            minorTickLength: 0,
            radius: "100%",
            bottomText: "",
            bands: []
          }
        ],
        labels: [
          {
            id: "value",
            align: "center",
            color: null,
            size: 12,
            y: "40%"
          }
        ],
        valueField:
          "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.numbeds.name}}",
        noValueVerticalAlignment: "middle",
        showCaptionWhenNoValue: true,
        showDescriptionWhenNoValue: true,
        valueType: "feature",
        datasets: [
          {
            type: "staticDataset",
            data: 0,
            name: "min"
          },
          {
            type: "serviceDataset",
            dataSource: {
              type: "featureServiceDataSource",
              itemId: "{{934a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
              layerId: 0,
              table: false
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name:
                          "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.owner.name}}",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "wwer"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [],
            statisticDefinitions: [],
            maxFeatures: 50,
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          },
          {
            type: "serviceDataset",
            dataSource: {
              type: "featureServiceDataSource",
              itemId: "{{934a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
              layerId: 0,
              table: false
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [],
            statisticDefinitions: [
              {
                onStatisticField:
                  "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.numbeds.name}}",
                outStatisticFieldName: "value",
                statisticType: "min"
              }
            ],
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "max"
          }
        ],
        id: "8830ce79-2010-408d-838c-93b1afd6308a",
        name: "Gauge (2)",
        caption: "<p>Gauge 2</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "serialChartWidget",
        category: {
          labelOverrides: [
            {
              key: "qw",
              label: "qw"
            }
          ],
          byCategoryColors: true,
          colors: [],
          labelsPlacement: "default",
          labelRotation: 0,
          fieldName:
            "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.facilityid.name}}",
          nullLabel: "Null",
          blankLabel: "Blank",
          defaultColor: "#d6d6d6",
          nullColor: "#d6d6d6",
          blankColor: "#d6d6d6"
        },
        valueFormat: {
          name: "value",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        labelFormat: {
          name: "label",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        datePeriodPatterns: [
          {
            period: "ss",
            pattern: "HH:mm:ss"
          },
          {
            period: "mm",
            pattern: "HH:mm"
          },
          {
            period: "hh",
            pattern: "HH:mm"
          },
          {
            period: "DD",
            pattern: "MMM d"
          },
          {
            period: "MM",
            pattern: "MMM"
          },
          {
            period: "YYYY",
            pattern: "yyyy"
          }
        ],
        chartScrollbar: {
          enabled: false,
          dragIcon: "dragIconRoundSmall",
          dragIconHeight: 20,
          dragIconWidth: 20,
          scrollbarHeight: 15
        },
        categoryAxis: {
          title: "Serial",
          titleRotation: 270,
          gridPosition: "start",
          gridThickness: 1,
          gridAlpha: 0.15,
          axisThickness: 1,
          axisAlpha: 0.5,
          labelsEnabled: true,
          parseDates: false,
          minPeriod: "DD"
        },
        valueAxis: {
          titleRotation: 0,
          gridThickness: 1,
          gridAlpha: 0.15,
          axisThickness: 1,
          axisAlpha: 0.5,
          labelsEnabled: true,
          stackType: "none",
          integersOnly: false,
          logarithmic: false
        },
        legend: {
          enabled: false,
          position: "bottom",
          markerSize: 15,
          markerType: "circle",
          align: "center",
          labelWidth: 100,
          valueWidth: 0
        },
        graphs: [
          {
            valueField:
              "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.numbeds.name}}",
            title: "# of Beds Available",
            lineColor: "#ffaa00",
            lineColorField: "_lineColor_",
            fillColorsField: "_fillColor_",
            type: "column",
            fillAlphas: 1,
            lineAlpha: 1,
            lineThickness: 1,
            bullet: "none",
            bulletAlpha: 1,
            bulletBorderAlpha: 0,
            bulletBorderThickness: 2,
            showBalloon: true,
            bulletSize: 8
          }
        ],
        guides: [],
        splitBy: {
          defaultColor: "#d6d6d6",
          seriesProperties: []
        },
        rotate: true,
        commonGraphProperties: {
          lineColorField: "_lineColor_",
          fillColorsField: "_fillColor_",
          type: "column",
          fillAlphas: 1,
          lineAlpha: 1,
          lineThickness: 1,
          bullet: "none",
          bulletAlpha: 1,
          bulletBorderAlpha: 0,
          bulletBorderThickness: 2,
          showBalloon: true,
          bulletSize: 8
        },
        events: [
          {
            type: "selectionChanged",
            actions: [
              {
                type: "filter",
                by: "whereClause",
                targetId: "8830ce79-2010-408d-838c-93b1afd6308a#main"
              },
              {
                type: "filter",
                by: "whereClause",
                targetId: "0ef05811-5ef1-4079-b8c3-68671d1d2a77#main"
              }
            ]
          }
        ],
        selectionMode: "single",
        categoryType: "features",
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              type: "featureServiceDataSource",
              itemId: "{{934a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
              layerId: 0,
              table: false
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name:
                          "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.facilityid.name}}",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "1"
                      }
                    },
                    {
                      type: "filterRule",
                      field: {
                        name:
                          "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.owner.name}}",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "www"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [
              "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.owner.name}} asc"
            ],
            statisticDefinitions: [],
            maxFeatures: 10,
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        id: "e321f855-d6c0-4bf5-9c2a-861db15fe877",
        name: "Serial Chart (1)",
        caption: "<p>Serial Features</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "pieChartWidget",
        category: {
          sliceProperties: [],
          fieldName:
            "{{4efe5f693de34620934787ead6693f19.layer2.fields.facilityid.name}}",
          nullLabel: "Null",
          blankLabel: "Blank",
          defaultColor: "#d6d6d6",
          nullColor: "#d6d6d6",
          blankColor: "#d6d6d6"
        },
        pie: {
          type: "pie",
          titleField: "category",
          valueField: "absoluteValue",
          alpha: 1,
          outlineAlpha: 0,
          outlineColor: "",
          outlineThickness: 1,
          innerRadius: 0,
          labelsEnabled: true,
          labelsFormat: "percentage",
          labelTickAlpha: 0.5,
          labelTickColor: "",
          maxLabelWidth: 100,
          startAngle: 90,
          autoMargins: false,
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
          groupedColor: "#d6d6d6"
        },
        legend: {
          enabled: false,
          format: "percentage",
          position: "bottom",
          markerSize: 15,
          markerType: "circle",
          align: "center",
          labelWidth: 100,
          valueWidth: 50
        },
        showBalloon: true,
        valueFormat: {
          name: "value",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        percentageFormat: {
          name: "percentage",
          type: "decimal",
          prefix: false,
          pattern: "#.##"
        },
        events: [
          {
            type: "selectionChanged",
            actions: [
              {
                type: "filter",
                by: "whereClause",
                targetId:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              },
              {
                type: "filter",
                by: "whereClause",
                targetId: "f81f2270-e104-453d-9c09-045d8d1087c9#main"
              }
            ]
          }
        ],
        selectionMode: "single",
        categoryType: "groupByValues",
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name:
                          "{{4efe5f693de34620934787ead6693f19.layer2.fields.facilityid.name}}",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "1"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [
              "{{4efe5f693de34620934787ead6693f19.layer2.fields.facilityid.name}}"
            ],
            orderByFields: [
              "{{4efe5f693de34620934787ead6693f19.layer2.fields.facilityid.name}} asc"
            ],
            statisticDefinitions: [
              {
                onStatisticField:
                  "{{4efe5f693de34620934787ead6693f19.layer2.fields.objectid.name}}",
                outStatisticFieldName: "value",
                statisticType: "count"
              }
            ],
            maxFeatures: 20,
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        id: "b90fa68a-1817-40a2-91c4-1738f5b37e7e",
        name: "Pie Chart (1)",
        caption: "<p>Pie Grouped</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "pieChartWidget",
        category: {
          sliceProperties: [],
          fieldName:
            "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.facilityid.name}}",
          nullLabel: "Null",
          blankLabel: "Blank",
          defaultColor: "#d6d6d6",
          nullColor: "#d6d6d6",
          blankColor: "#d6d6d6"
        },
        pie: {
          type: "pie",
          titleField: "category",
          valueField: "absoluteValue",
          alpha: 1,
          outlineAlpha: 0,
          outlineColor: "",
          outlineThickness: 1,
          innerRadius: 0,
          labelsEnabled: true,
          labelsFormat: "percentage",
          labelTickAlpha: 0.5,
          labelTickColor: "",
          maxLabelWidth: 100,
          startAngle: 90,
          autoMargins: false,
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
          groupedColor: "#d6d6d6"
        },
        valueField:
          "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.numbeds.name}}",
        legend: {
          enabled: false,
          format: "percentage",
          position: "bottom",
          markerSize: 15,
          markerType: "circle",
          align: "center",
          labelWidth: 100,
          valueWidth: 50
        },
        showBalloon: true,
        valueFormat: {
          name: "value",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        percentageFormat: {
          name: "percentage",
          type: "decimal",
          prefix: false,
          pattern: "#.##"
        },
        events: [
          {
            type: "selectionChanged",
            actions: [
              {
                type: "filter",
                by: "whereClause",
                targetId: "79de7d45-0586-43fa-91e6-9d020c88d2d3#main"
              }
            ]
          }
        ],
        selectionMode: "single",
        categoryType: "features",
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              type: "featureServiceDataSource",
              itemId: "{{934a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
              layerId: 0,
              table: false
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name:
                          "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.name.name}}",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "sad"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [
              "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.owner.name}} asc"
            ],
            statisticDefinitions: [],
            maxFeatures: 20,
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        id: "161e9532-317f-4ce2-acea-445b1c4dae59",
        name: "Pie Features",
        caption: "<p>Pie Features</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "pieChartWidget",
        category: {
          sliceProperties: [
            {
              key:
                "{{4efe5f693de34620934787ead6693f19.layer2.fields.numbeds.name}}",
              label: "# of Beds Available",
              color: "#ffaa00"
            },
            {
              key:
                "{{4efe5f693de34620934787ead6693f19.layer2.fields.numbeds.name}}",
              label: "# of Beds Available",
              color: "#ffff00"
            }
          ],
          fieldName: "category",
          nullLabel: "Null",
          blankLabel: "Blank",
          defaultColor: "#d6d6d6",
          nullColor: "#d6d6d6",
          blankColor: "#d6d6d6"
        },
        pie: {
          type: "pie",
          titleField: "category",
          valueField: "absoluteValue",
          alpha: 1,
          outlineAlpha: 0,
          outlineColor: "",
          outlineThickness: 1,
          innerRadius: 0,
          labelsEnabled: true,
          labelsFormat: "percentage",
          labelTickAlpha: 0.5,
          labelTickColor: "",
          maxLabelWidth: 100,
          startAngle: 90,
          autoMargins: false,
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
          groupedColor: "#d6d6d6"
        },
        legend: {
          enabled: false,
          format: "percentage",
          position: "bottom",
          markerSize: 15,
          markerType: "circle",
          align: "center",
          labelWidth: 100,
          valueWidth: 50
        },
        showBalloon: true,
        valueFormat: {
          name: "value",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        percentageFormat: {
          name: "percentage",
          type: "decimal",
          prefix: false,
          pattern: "#.##"
        },
        selectionMode: "single",
        categoryType: "fields",
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name:
                          "{{4efe5f693de34620934787ead6693f19.layer2.fields.fulladdr.name}}",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "123"
                      }
                    }
                  ]
                },
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name:
                          "{{4efe5f693de34620934787ead6693f19.layer2.fields.facilityid.name}}",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "12"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [],
            statisticDefinitions: [
              {
                onStatisticField:
                  "{{4efe5f693de34620934787ead6693f19.layer2.fields.numbeds.name}}",
                outStatisticFieldName:
                  "{{4efe5f693de34620934787ead6693f19.layer2.fields.numbeds.name}}",
                statisticType: "avg"
              },
              {
                onStatisticField:
                  "{{4efe5f693de34620934787ead6693f19.layer2.fields.numbeds.name}}",
                outStatisticFieldName:
                  "{{4efe5f693de34620934787ead6693f19.layer2.fields.numbeds.name}}",
                statisticType: "avg"
              }
            ],
            maxFeatures: null,
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        id: "2ccc8953-1958-40c0-b237-689a39d5904b",
        name: "Pie Chart (2)",
        caption: "<p>Pie Fields</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "serialChartWidget",
        category: {
          labelOverrides: [],
          byCategoryColors: false,
          labelsPlacement: "default",
          labelRotation: 0,
          fieldName:
            "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.facilityid.name}}",
          nullLabel: "Null",
          blankLabel: "Blank",
          defaultColor: "#d6d6d6",
          nullColor: "#d6d6d6",
          blankColor: "#d6d6d6"
        },
        valueFormat: {
          name: "value",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        labelFormat: {
          name: "label",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        datePeriodPatterns: [
          {
            period: "ss",
            pattern: "HH:mm:ss"
          },
          {
            period: "mm",
            pattern: "HH:mm"
          },
          {
            period: "hh",
            pattern: "HH:mm"
          },
          {
            period: "DD",
            pattern: "MMM d"
          },
          {
            period: "MM",
            pattern: "MMM"
          },
          {
            period: "YYYY",
            pattern: "yyyy"
          }
        ],
        chartScrollbar: {
          enabled: false,
          dragIcon: "dragIconRoundSmall",
          dragIconHeight: 20,
          dragIconWidth: 20,
          scrollbarHeight: 15
        },
        categoryAxis: {
          titleRotation: 0,
          gridPosition: "start",
          gridThickness: 1,
          gridAlpha: 0.15,
          axisThickness: 1,
          axisAlpha: 0.5,
          labelsEnabled: true,
          parseDates: false,
          minPeriod: "DD"
        },
        valueAxis: {
          titleRotation: 270,
          gridThickness: 1,
          gridAlpha: 0.15,
          axisThickness: 1,
          axisAlpha: 0.5,
          labelsEnabled: true,
          stackType: "none",
          integersOnly: false,
          logarithmic: false
        },
        legend: {
          enabled: false,
          position: "bottom",
          markerSize: 15,
          markerType: "circle",
          align: "center",
          labelWidth: 100,
          valueWidth: 0
        },
        graphs: [],
        guides: [],
        splitBy: {
          fieldName:
            "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.name.name}}",
          defaultColor: "#d6d6d6",
          seriesProperties: []
        },
        rotate: false,
        commonGraphProperties: {
          lineColorField: "_lineColor_",
          fillColorsField: "_fillColor_",
          type: "column",
          fillAlphas: 1,
          lineAlpha: 1,
          lineThickness: 1,
          bullet: "none",
          bulletAlpha: 1,
          bulletBorderAlpha: 0,
          bulletBorderThickness: 2,
          showBalloon: true,
          bulletSize: 8
        },
        events: [
          {
            type: "selectionChanged",
            actions: [
              {
                type: "filter",
                by: "whereClause",
                targetId: "161e9532-317f-4ce2-acea-445b1c4dae59#main"
              },
              {
                type: "filter",
                by: "whereClause",
                targetId: "8830ce79-2010-408d-838c-93b1afd6308a#main"
              }
            ]
          }
        ],
        selectionMode: "multi",
        categoryType: "groupByValues",
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              type: "featureServiceDataSource",
              itemId: "{{934a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
              layerId: 0,
              table: false
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name:
                          "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.facilityid.name}}",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "123"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [
              "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.facilityid.name}}",
              "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.name.name}}"
            ],
            orderByFields: [
              "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.facilityid.name}} asc",
              "value asc"
            ],
            statisticDefinitions: [
              {
                onStatisticField:
                  "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.objectid.name}}",
                outStatisticFieldName: "value",
                statisticType: "count"
              }
            ],
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        id: "ecf67bd0-3b15-4920-877a-7b02f28a9d4a",
        name: "Serial Chart (2)",
        caption: "<p>Serial grouped</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "serialChartWidget",
        category: {
          labelOverrides: [
            {
              key:
                "{{4efe5f693de34620934787ead6693f19.layer2.fields.numbeds.name}}",
              label: "# of Beds Available"
            },
            {
              key:
                "{{4efe5f693de34620934787ead6693f19.layer2.fields.numbeds.name}}",
              label: "# of Beds Available"
            }
          ],
          byCategoryColors: false,
          labelsPlacement: "default",
          labelRotation: 0,
          fieldName: "category",
          nullLabel: "Null",
          blankLabel: "Blank",
          defaultColor: "#d6d6d6",
          nullColor: "#d6d6d6",
          blankColor: "#d6d6d6"
        },
        valueFormat: {
          name: "value",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        labelFormat: {
          name: "label",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        datePeriodPatterns: [
          {
            period: "ss",
            pattern: "HH:mm:ss"
          },
          {
            period: "mm",
            pattern: "HH:mm"
          },
          {
            period: "hh",
            pattern: "HH:mm"
          },
          {
            period: "DD",
            pattern: "MMM d"
          },
          {
            period: "MM",
            pattern: "MMM"
          },
          {
            period: "YYYY",
            pattern: "yyyy"
          }
        ],
        chartScrollbar: {
          enabled: false,
          dragIcon: "dragIconRoundSmall",
          dragIconHeight: 20,
          dragIconWidth: 20,
          scrollbarHeight: 15
        },
        categoryAxis: {
          titleRotation: 0,
          gridPosition: "start",
          gridThickness: 1,
          gridAlpha: 0.15,
          axisThickness: 1,
          axisAlpha: 0.5,
          labelsEnabled: true,
          parseDates: false,
          minPeriod: "DD"
        },
        valueAxis: {
          titleRotation: 270,
          gridThickness: 1,
          gridAlpha: 0.15,
          axisThickness: 1,
          axisAlpha: 0.5,
          labelsEnabled: true,
          stackType: "none",
          integersOnly: false,
          logarithmic: false
        },
        legend: {
          enabled: false,
          position: "bottom",
          markerSize: 15,
          markerType: "circle",
          align: "center",
          labelWidth: 100,
          valueWidth: 0
        },
        graphs: [
          {
            valueField: "value",
            lineColor: "#ffaa00",
            lineColorField: "_lineColor_",
            fillColorsField: "_fillColor_",
            type: "column",
            fillAlphas: 1,
            lineAlpha: 1,
            lineThickness: 1,
            bullet: "none",
            bulletAlpha: 1,
            bulletBorderAlpha: 0,
            bulletBorderThickness: 2,
            showBalloon: true,
            bulletSize: 8
          }
        ],
        guides: [],
        splitBy: {
          defaultColor: "#d6d6d6",
          seriesProperties: []
        },
        rotate: false,
        commonGraphProperties: {
          lineColorField: "_lineColor_",
          fillColorsField: "_fillColor_",
          type: "column",
          fillAlphas: 1,
          lineAlpha: 1,
          lineThickness: 1,
          bullet: "none",
          bulletAlpha: 1,
          bulletBorderAlpha: 0,
          bulletBorderThickness: 2,
          showBalloon: true,
          bulletSize: 8
        },
        selectionMode: "single",
        categoryType: "fields",
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name:
                          "{{4efe5f693de34620934787ead6693f19.layer2.fields.fulladdr.name}}",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "123"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [],
            statisticDefinitions: [
              {
                onStatisticField:
                  "{{4efe5f693de34620934787ead6693f19.layer2.fields.numbeds.name}}",
                outStatisticFieldName:
                  "{{4efe5f693de34620934787ead6693f19.layer2.fields.numbeds.name}}",
                statisticType: "avg"
              },
              {
                onStatisticField:
                  "{{4efe5f693de34620934787ead6693f19.layer2.fields.numbeds.name}}",
                outStatisticFieldName:
                  "{{4efe5f693de34620934787ead6693f19.layer2.fields.numbeds.name}}",
                statisticType: "avg"
              }
            ],
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        id: "c220e9bb-f0b9-4f0e-93e8-8baa3f39aa0c",
        name: "Serial Chart (3)",
        caption: "<p>Serial Fields</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "gaugeWidget",
        style: "progress",
        displayAsPercentage: false,
        valueFormat: {
          name: "value",
          type: "decimal",
          prefix: true,
          pattern: "#,###.#"
        },
        percentageFormat: {
          name: "percentage",
          type: "decimal",
          prefix: false,
          pattern: "#.#%"
        },
        arrows: [],
        axes: [
          {
            id: "main",
            style: "progress",
            startAngle: -120,
            endAngle: 120,
            startValue: 0,
            endValue: 1,
            labelsEnabled: false,
            labelOffset: 0,
            color: null,
            inside: true,
            gridInside: true,
            axisAlpha: 0,
            axisColor: null,
            axisThickness: 0,
            tickAlpha: 0,
            tickColor: null,
            tickLength: 0,
            tickThickness: 0,
            minorTickLength: 0,
            radius: "100%",
            bottomText: "",
            bands: [
              {
                id: "background",
                alpha: 1,
                color: "#d6d6d6",
                startValue: 0,
                endValue: 1,
                radius: "100%",
                innerRadius: "75%",
                colorThresholds: []
              },
              {
                id: "value",
                alpha: 1,
                color: "#ffaa00",
                startValue: 0,
                endValue: 0.5,
                radius: "100%",
                innerRadius: "75%",
                colorThresholds: []
              }
            ]
          },
          {
            id: "labels",
            style: "progress",
            startAngle: -125,
            endAngle: 125,
            startValue: 0,
            endValue: 1,
            labelsEnabled: true,
            labelOffset: 0,
            fontSize: 20,
            color: null,
            inside: true,
            gridInside: true,
            axisAlpha: 0,
            axisColor: null,
            axisThickness: 0,
            tickAlpha: 0,
            tickColor: null,
            tickLength: 0,
            tickThickness: 0,
            minorTickLength: 0,
            radius: "100%",
            bottomText: "",
            bands: []
          }
        ],
        labels: [
          {
            id: "value",
            align: "center",
            color: null,
            size: 12,
            y: "40%"
          }
        ],
        noValueVerticalAlignment: "middle",
        showCaptionWhenNoValue: true,
        showDescriptionWhenNoValue: true,
        valueType: "statistic",
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name:
                          "{{4efe5f693de34620934787ead6693f19.layer2.fields.facname.name}}",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "qwe"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [],
            statisticDefinitions: [
              {
                onStatisticField:
                  "{{4efe5f693de34620934787ead6693f19.layer2.fields.objectid.name}}",
                outStatisticFieldName: "value",
                statisticType: "count"
              }
            ],
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          },
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name:
                          "{{4efe5f693de34620934787ead6693f19.layer2.fields.facname.name}}",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "2313"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [],
            statisticDefinitions: [
              {
                onStatisticField:
                  "{{4efe5f693de34620934787ead6693f19.layer2.fields.objectid.name}}",
                outStatisticFieldName: "value",
                statisticType: "count"
              }
            ],
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "min"
          },
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name:
                          "{{4efe5f693de34620934787ead6693f19.layer2.fields.fulladdr.name}}",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "123"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [],
            statisticDefinitions: [
              {
                onStatisticField:
                  "{{4efe5f693de34620934787ead6693f19.layer2.fields.objectid.name}}",
                outStatisticFieldName: "value",
                statisticType: "count"
              }
            ],
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "max"
          }
        ],
        id: "27daba1f-9223-4013-8ca8-797388fd2116",
        name: "Gauge (3)",
        caption: "<p>Gauge Stat</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        events: [
          {
            type: "selectionChanged",
            actions: [
              {
                type: "filter",
                by: "whereClause",
                targetId:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              },
              {
                type: "identify",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              }
            ]
          }
        ],
        type: "listWidget",
        iconType: "symbol",
        selectionMode: "single",
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name:
                          "{{4efe5f693de34620934787ead6693f19.layer2.fields.fulladdr.name}}",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "asD"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [
              "{{4efe5f693de34620934787ead6693f19.layer2.fields.facname.name}} asc",
              "{{4efe5f693de34620934787ead6693f19.layer2.fields.organiz.name}} asc"
            ],
            statisticDefinitions: [],
            maxFeatures: 25,
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        id: "bd1eec15-c178-4929-b800-936be1e6789b",
        name: "List (1)",
        caption: "<p>lIST FILTER SORT</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "detailsWidget",
        showTitle: true,
        showContents: true,
        showMedia: true,
        showAttachments: true,
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name:
                          "{{4efe5f693de34620934787ead6693f19.layer2.fields.fulladdr.name}}",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "QSAD"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [
              "{{4efe5f693de34620934787ead6693f19.layer2.fields.facname.name}} asc"
            ],
            statisticDefinitions: [],
            maxFeatures: 50,
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        id: "be4aad77-c0c3-42f5-8a74-53dfc79f6558",
        name: "Details (1)",
        caption: "<p>DETAILS FILTER SORT</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      },
      {
        type: "embeddedContentWidget",
        url:
          "{{{4efe5f693de34620934787ead6693f19.layer2.fields.facilityid.name}}}",
        contentType: "document",
        imageRefreshInterval: 0,
        videoSettings: {
          controls: true,
          autoplay: false,
          loop: false,
          muted: false,
          controlsList: "nodownload"
        },
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            filter: {
              type: "filterGroup",
              condition: "OR",
              rules: [
                {
                  type: "filterGroup",
                  condition: "AND",
                  rules: [
                    {
                      type: "filterRule",
                      field: {
                        name:
                          "{{4efe5f693de34620934787ead6693f19.layer2.fields.facilityid.name}}",
                        type: "esriFieldTypeString"
                      },
                      operator: "equal",
                      constraint: {
                        type: "value",
                        value: "esf"
                      }
                    }
                  ]
                }
              ]
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [
              "{{4efe5f693de34620934787ead6693f19.layer2.fields.facname.name}} asc"
            ],
            statisticDefinitions: [],
            maxFeatures: 50,
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        id: "2f547ec0-cd71-4b05-b28a-a467793d7601",
        name: "Embedded Content (1)",
        caption: "<p>Embedded Content</p>\n",
        showLastUpdate: true,
        noDataVerticalAlignment: "middle",
        showCaptionWhenNoData: true,
        showDescriptionWhenNoData: true
      }
    ],
    settings: {
      maxPaginationRecords: 50000,
      allowElementResizing: false
    },
    mapOverrides: {
      trackedFeatureRadius: 60
    },
    theme: "dark",
    themeOverrides: {},
    numberPrefixOverrides: [
      {
        key: "yotta",
        symbol: "Y",
        enabled: true
      },
      {
        key: "zeta",
        symbol: "Z",
        enabled: true
      },
      {
        key: "exa",
        symbol: "E",
        enabled: true
      },
      {
        key: "peta",
        symbol: "P",
        enabled: true
      },
      {
        key: "tera",
        symbol: "T",
        enabled: true
      },
      {
        key: "giga",
        symbol: "G",
        enabled: true
      },
      {
        key: "mega",
        symbol: "M",
        enabled: true
      },
      {
        key: "kilo",
        symbol: "k",
        enabled: true
      },
      {
        key: "base",
        symbol: "",
        enabled: true
      },
      {
        key: "deci",
        symbol: "d",
        enabled: false
      },
      {
        key: "centi",
        symbol: "c",
        enabled: false
      },
      {
        key: "milli",
        symbol: "m",
        enabled: false
      },
      {
        key: "micro",
        symbol: "µ",
        enabled: false
      },
      {
        key: "nano",
        symbol: "n",
        enabled: false
      }
    ],
    urlParameters: [
      {
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              id:
                "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [],
            statisticDefinitions: [],
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        type: "feature",
        idFieldName:
          "{{4efe5f693de34620934787ead6693f19.layer2.fields.facilityid.name}}",
        events: [
          {
            type: "parameterChanged",
            actions: [
              {
                type: "filter",
                by: "whereClause",
                targetId:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              },
              {
                type: "flashGeometry",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              },
              {
                type: "identify",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              },
              {
                type: "pan",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              },
              {
                type: "zoom",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              }
            ]
          }
        ],
        label: "p_map_layer"
      },
      {
        type: "category",
        dataType: "string",
        operator: "is_in",
        events: [
          {
            type: "parameterChanged",
            actions: [
              {
                type: "filter",
                by: "whereClause",
                fieldMap: [
                  {
                    sourceName: "filterField",
                    targetName:
                      "{{4efe5f693de34620934787ead6693f19.layer2.fields.fulladdr.name}}"
                  }
                ],
                targetId:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              }
            ]
          }
        ],
        label: "CatParam"
      },
      {
        type: "numeric",
        valueType: "single",
        operator: "less",
        events: [
          {
            type: "parameterChanged",
            actions: [
              {
                type: "filter",
                by: "whereClause",
                fieldMap: [
                  {
                    sourceName: "filterField",
                    targetName:
                      "{{4efe5f693de34620934787ead6693f19.layer2.fields.numbeds.name}}"
                  }
                ],
                targetId:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              }
            ]
          }
        ],
        label: "NumParam"
      },
      {
        type: "date",
        dataType: "string",
        valueType: "single",
        operator: "is_before",
        events: [
          {
            type: "parameterChanged",
            actions: [
              {
                type: "filter",
                by: "whereClause",
                fieldMap: [
                  {
                    sourceName: "filterField",
                    targetName:
                      "{{4efe5f693de34620934787ead6693f19.layer2.fields.closeddate.name}}"
                  }
                ],
                targetId:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              }
            ]
          }
        ],
        label: "DateParam"
      },
      {
        datasets: [
          {
            type: "serviceDataset",
            dataSource: {
              type: "featureServiceDataSource",
              itemId: "{{934a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
              layerId: 0,
              table: false
            },
            outFields: ["*"],
            groupByFields: [],
            orderByFields: [],
            statisticDefinitions: [],
            querySpatialRelationship: "esriSpatialRelIntersects",
            returnGeometry: false,
            clientSideStatistics: false,
            name: "main"
          }
        ],
        type: "feature",
        idFieldName:
          "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.facilityid.name}}",
        events: [
          {
            type: "parameterChanged",
            actions: [
              {
                type: "filter",
                by: "whereClause",
                fieldMap: [
                  {
                    sourceName:
                      "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.facilityid.name}}",
                    targetName:
                      "{{4efe5f693de34620934787ead6693f19.layer2.fields.facname.name}}"
                  }
                ],
                targetId:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              },
              {
                type: "flashGeometry",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              },
              {
                type: "pan",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              },
              {
                type: "zoom",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              }
            ]
          }
        ],
        label: "external_map_layer"
      },
      {
        type: "geometry",
        dataType: "point",
        events: [
          {
            type: "parameterChanged",
            actions: [
              {
                type: "flashGeometry",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              },
              {
                type: "pan",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              },
              {
                type: "zoom",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              }
            ]
          }
        ],
        label: "Geom1"
      },
      {
        type: "geometry",
        dataType: "extent",
        events: [
          {
            type: "parameterChanged",
            actions: [
              {
                type: "filter",
                by: "geometry",
                targetId:
                  "b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632"
              },
              {
                type: "setExtent",
                targetId: "b38e032d-bf0c-426f-8036-b86341eb3693"
              }
            ]
          }
        ],
        label: "GeomExtent"
      }
    ],
    layout: {
      rootElement: {
        type: "stackLayoutElement",
        orientation: "col",
        elements: [
          {
            type: "stackLayoutElement",
            orientation: "row",
            elements: [
              {
                type: "itemLayoutElement",
                id: "2f547ec0-cd71-4b05-b28a-a467793d7601",
                width: 1,
                height: 0.3144582394843341
              },
              {
                type: "itemLayoutElement",
                id: "be4aad77-c0c3-42f5-8a74-53dfc79f6558",
                width: 1,
                height: 0.33203775934369795
              },
              {
                type: "itemLayoutElement",
                id: "bd1eec15-c178-4929-b800-936be1e6789b",
                width: 1,
                height: 0.353504001171968
              }
            ],
            width: 0.13354113735903447,
            height: 1
          },
          {
            type: "stackLayoutElement",
            orientation: "row",
            elements: [
              {
                type: "itemLayoutElement",
                id: "b90fa68a-1817-40a2-91c4-1738f5b37e7e",
                width: 1,
                height: 0.3085983995312128
              },
              {
                type: "itemLayoutElement",
                id: "161e9532-317f-4ce2-acea-445b1c4dae59",
                width: 1,
                height: 0.295706751634346
              },
              {
                type: "itemLayoutElement",
                id: "2ccc8953-1958-40c0-b237-689a39d5904b",
                width: 1,
                height: 0.3956948488344412
              }
            ],
            width: 0.13057012924022732,
            height: 1
          },
          {
            type: "stackLayoutElement",
            orientation: "row",
            elements: [
              {
                type: "itemLayoutElement",
                id: "e321f855-d6c0-4bf5-9c2a-861db15fe877",
                width: 1,
                height: 0.31797414345620684
              },
              {
                type: "itemLayoutElement",
                id: "ecf67bd0-3b15-4920-877a-7b02f28a9d4a",
                width: 1,
                height: 0.3543051511655588
              },
              {
                type: "itemLayoutElement",
                id: "c220e9bb-f0b9-4f0e-93e8-8baa3f39aa0c",
                width: 1,
                height: 0.32772070537823433
              }
            ],
            width: 0.1473938973532348,
            height: 1
          },
          {
            type: "stackLayoutElement",
            orientation: "row",
            elements: [
              {
                type: "itemLayoutElement",
                id: "7866f4bd-8361-4205-8fd7-f92da41fdb61",
                width: 1,
                height: 0.35502126323329586
              },
              {
                type: "itemLayoutElement",
                id: "8830ce79-2010-408d-838c-93b1afd6308a",
                width: 1,
                height: 0.3067103194728515
              },
              {
                type: "itemLayoutElement",
                id: "27daba1f-9223-4013-8ca8-797388fd2116",
                width: 1,
                height: 0.33826841729385265
              }
            ],
            width: 0.11465816595818965,
            height: 1
          },
          {
            type: "itemLayoutElement",
            id: "92010c2e-38e0-405b-b628-5aa95e3c8d56",
            width: 0.1431475564291276,
            height: 1
          },
          {
            type: "itemLayoutElement",
            id: "b38e032d-bf0c-426f-8036-b86341eb3693",
            width: 0.33068911366018605,
            height: 1
          }
        ],
        width: 1,
        height: 1
      }
    }
  },
  resources: [
    "eff3f22d41ad42dcb6fe9015f26d40f4_info_thumbnail/ago_downloaded.png"
  ],
  dependencies: [
    "7e6c41c72d4548d9a312329e0c5a984f",
    "934a9ef8efa7448fa8ddf7b13cef0240"
  ],
  properties: {},
  estimatedDeploymentCostFactor: 2
};
