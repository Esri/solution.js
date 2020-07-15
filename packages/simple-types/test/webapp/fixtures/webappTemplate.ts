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

export const webappTemplate: any = {
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
