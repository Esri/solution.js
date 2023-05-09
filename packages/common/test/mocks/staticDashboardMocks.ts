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
 * Provides static mock items for dashboard tests across multiple packages.
 *
 * Long term...would like to work these into the standard mocks.
 */

import * as interfaces from "../../src/interfaces";

export const datasourceInfos: interfaces.IDatasourceInfo[] = [
  {
    layerId: 0,
    itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
    basePath: "934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields",
    url: "{{934a9ef8efa7448fa8ddf7b13cef0240.url}}",
    fields: [
      {
        name: "OBJECTID"
      },
      {
        name: "FACILITYID"
      },
      {
        name: "NAME"
      },
      {
        name: "OWNER"
      },
      {
        name: "OWNTYPE"
      },
      {
        name: "SUBTYPEFIELD"
      },
      {
        name: "FEATURECODE"
      },
      {
        name: "FULLADDR"
      },
      {
        name: "AGENCYURL"
      },
      {
        name: "OPERDAYS"
      },
      {
        name: "OPERHOURS"
      },
      {
        name: "NUMBEDS"
      },
      {
        name: "CONTACT"
      },
      {
        name: "PHONE"
      },
      {
        name: "EMAIL"
      }
    ],
    ids: [],
    relationships: [],
    adminLayerInfo: {}
  },
  {
    itemId: "4efe5f693de34620934787ead6693f19",
    layerId: 2,
    fields: [
      {
        name: "OBJECTID"
      },
      {
        name: "FACILITYID"
      },
      {
        name: "FACNAME"
      },
      {
        name: "FULLADDR"
      },
      {
        name: "ORGANIZ"
      },
      {
        name: "REDXMODEL"
      },
      {
        name: "POCNAME"
      },
      {
        name: "POCEMAIL"
      },
      {
        name: "POCPHONE"
      },
      {
        name: "CAPACITY"
      },
      {
        name: "NUMBEDS"
      },
      {
        name: "OCCUPANCY"
      },
      {
        name: "HOURSOPER"
      },
      {
        name: "HANDICAP"
      },
      {
        name: "BACKPOWER"
      },
      {
        name: "ALLOWPETS"
      },
      {
        name: "DAYSOPER"
      },
      {
        name: "ACCESSRES"
      },
      {
        name: "OPENDATE"
      },
      {
        name: "CLOSEDDATE"
      },
      {
        name: "OPSSTATUS"
      },
      {
        name: "LASTUPDATE"
      },
      {
        name: "LASTEDITOR"
      }
    ],
    basePath: "4efe5f693de34620934787ead6693f19.layer2.fields",
    url: "{{4efe5f693de34620934787ead6693f19.url}}",
    ids: ["TestLayerForDashBoardMap_632"],
    relationships: [],
    adminLayerInfo: {}
  }
];

export const _baseWidgets: any[] = [
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
    graphs: [],
    guides: [],
    splitBy: {
      fieldName: "NAME",
      defaultColor: "#d6d6d6",
      seriesProperties: []
    },
    rotate: false,
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
];

export const expectedWidgets: any[] = [
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
    graphs: [],
    guides: [],
    splitBy: {
      fieldName: "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.name.name}}",
      defaultColor: "#d6d6d6",
      seriesProperties: []
    },
    rotate: false,
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
    url: "{{{4efe5f693de34620934787ead6693f19.layer2.fields.facilityid.name}}}",
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
];

export const _baseHeaderPanel: any = {
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
};

export const expectedHeaderPanel: any = {
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
};

export const _baseLeftPanel: any = {
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
};

export const expectedLeftPanel: any = {
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
};

export const _baseUrlParameters: any[] = [
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
];

export const expectedUrlParameters: any[] = [
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
];

export const _initialDashboardTemplate: any = {
  itemId: "eff3f22d41ad42dcb6fe9015f26d40f4",
  type: "Dashboard",
  key: "w5u0o8te",
  item: {
    id: "{{eff3f22d41ad42dcb6fe9015f26d40f4.itemId}}",
    type: "Dashboard",
    categories: [],
    culture: "en-us",
    description: null,
    extent: "{{solutionItemExtent}}",
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
    headerPanel: _baseHeaderPanel,
    leftPanel: _baseLeftPanel,
    widgets: _baseWidgets,
    urlParameters: _baseUrlParameters
  },
  resources: [
    "eff3f22d41ad42dcb6fe9015f26d40f4_info_thumbnail/ago_downloaded.png"
  ],
  dependencies: [],
  properties: {},
  estimatedDeploymentCostFactor: 2
};

export const expectedTemplate: any = {
  itemId: "eff3f22d41ad42dcb6fe9015f26d40f4",
  type: "Dashboard",
  key: "w5u0o8te",
  item: {
    id: "{{eff3f22d41ad42dcb6fe9015f26d40f4.itemId}}",
    type: "Dashboard",
    categories: [],
    culture: "en-us",
    description: null,
    extent: "{{solutionItemExtent}}",
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
    headerPanel: expectedHeaderPanel,
    leftPanel: expectedLeftPanel,
    widgets: expectedWidgets,
    urlParameters: expectedUrlParameters
  },
  resources: [
    "eff3f22d41ad42dcb6fe9015f26d40f4_info_thumbnail/ago_downloaded.png"
  ],
  dependencies: [
    "934a9ef8efa7448fa8ddf7b13cef0240",
    "7e6c41c72d4548d9a312329e0c5a984f"
  ],
  properties: {},
  estimatedDeploymentCostFactor: 2
};
