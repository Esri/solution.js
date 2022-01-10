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

// This file contains examples of items of the type one would expect to get from the AGOL REST API.

import * as generalHelpers from "../../src/generalHelpers";
import * as getItemTypeAbbrev from "../../src/getItemTypeAbbrev";
import * as interfaces from "../../src/interfaces";
import * as utils from "./utils";

// -------------------------------------------------------------------------------------------------------------------//

export function get200Failure(): any {
  return {
    success: false
  };
}

export function get200Success(itemId = "itm1234567890"): any {
  return {
    success: true,
    id: itemId
  };
}

export function get400Failure(): any {
  return {
    error: {
      code: 400,
      messageCode: "CONT_0001",
      message: "Item does not exist or is inaccessible.",
      details: []
    }
  };
}

export function get400SuccessFailure(): any {
  return {
    success: false,
    error: {
      code: 400,
      messageCode: "CONT_0001",
      message: "Item does not exist or is inaccessible.",
      details: []
    }
  };
}

export function get400FailureResponse(): any {
  return {
    name: "",
    message:
      "400: Item or group does not exist or is inaccessible: fail1234567890",
    originalMessage: "",
    code: 400,
    response: {
      error: {
        code: 400,
        message:
          "Item or group does not exist or is inaccessible: fail1234567890",
        details: [
          "Item or group does not exist or is inaccessible: fail1234567890"
        ]
      }
    },
    url: "",
    options: null
  };
}

export function get500Failure(): any {
  return {
    error: {
      code: 500,
      message: "Item does not have a file.",
      details: []
    }
  };
}

export function getAGOLItem(type?: string, url = "", itemId?: string): any {
  let item: any = get400FailureResponse();

  // Supported item types
  switch (type) {
    case "ArcGIS Pro Add In":
      break;

    case "Code Attachment":
      item = getAGOLItemFundamentals(type);
      item.name += ".zip";
      break;

    case "Code Sample":
      break;

    case "Dashboard":
      item = getAGOLItemFundamentals(type, url || undefined);
      break;

    case "Desktop Add In":
      break;

    case "Desktop Application Template":
      break;

    case "Document Link":
      break;

    case "Feature Collection":
      break;

    case "Feature Service":
      item = getAGOLItemFundamentals(
        type,
        url ||
          "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer"
      );
      break;

    case "Form":
      item = getAGOLItemFundamentals(type, url || undefined);
      break;

    case "GeoJson":
      item = getAGOLItemFundamentals(type, url || undefined);
      item.name += ".json";
      break;

    case "Geoprocessing Package":
      break;

    case "Geoprocessing Sample":
      break;

    case "Group":
      item = getAGOLGroup();
      break;

    case "Hub Site Application":
      item = getAGOLItemFundamentals(type, url || undefined);
      break;

    case "Image":
      item = getAGOLItemFundamentals(type, url || undefined);
      break;

    case "Layer Package":
      break;

    case "Map Template":
      break;

    case "Notebook":
      item = getAGOLItemFundamentals(type);
      break;

    case "Operation View":
      break;

    case "Oriented Imagery Catalog":
      item = getAGOLItemFundamentals(type);
      break;

    case "Pro Map":
      break;

    case "Project Package":
      item = getAGOLItemFundamentals(type);
      item.name += ".ppkx";
      break;

    case "Project Template":
      break;

    case "QuickCapture Project":
      item = getAGOLItemFundamentals(type);
      break;

    case "Real Time Analytic":
      item = getAGOLItemFundamentals(type, "", itemId);
      break;

    case "Solution":
      item = getAGOLItemFundamentals(type);
      break;

    case "Web Map":
      item = getAGOLItemFundamentals(type, url || undefined);
      break;

    case "Web Mapping Application":
      item = getAGOLItemFundamentals(
        type,
        url ||
          "http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=wma1234567890"
      );
      break;

    case "Workforce Project":
      item = getAGOLItemFundamentals(type);
      break;

    case "Undefined":
      item = getAGOLItemFundamentals(type);
      break;

    case "Unsupported":
      item = getAGOLItemFundamentals(type);
      break;
  }

  return item;
}

export function getAGOLItemPrecis(
  type?: string,
  url = ""
): interfaces.ISolutionItemPrecis {
  const item = getAGOLItem(type, url);
  const precis: interfaces.ISolutionItemPrecis = {
    id: item.id,
    type: item.type,
    title: item.title,
    modified: item.modified,
    owner: item.owner
  };
  return precis;
}

export function getCompleteMockItem(
  type = "Web Mapping Application"
): interfaces.ICompleteItem {
  const item = {
    base: getAGOLItem(type),
    data: generalHelpers.jsonToFile(getAGOLItemData(type), ""),
    thumbnail: utils.getSampleImageAsFile(),
    metadata: utils.getSampleMetadataAsFile(),
    resources: [] as File[],
    fwdRelatedItems: [] as interfaces.IRelatedItems[],
    revRelatedItems: [] as interfaces.IRelatedItems[]
  } as interfaces.ICompleteItem;
  if (type === "Feature Service") {
    item.featureServiceProperties = {} as interfaces.IFeatureServiceProperties;
  }
  return item;
}

export function getCompleteDeployedSolutionItem(): interfaces.ICompleteItem {
  const item = getCompleteMockItem("Solution");
  item.base.typeKeywords.push("Solution");
  item.base.typeKeywords.push("Deployed");
  item.data = generalHelpers.jsonToFile(
    {
      metadata: {},
      templates: [
        {
          itemId: "wma1234567890",
          type: "Web Mapping Application",
          dependencies: ["map1234567890"],
          groups: []
        },
        {
          itemId: "map1234567890",
          type: "Web Map",
          dependencies: [],
          groups: []
        }
      ]
    },
    ""
  );
  item.fwdRelatedItems = [
    {
      relationshipType: "Solution2Item",
      relatedItemIds: ["wma1234567890", "map1234567890"]
    }
  ];
  return item;
}

export function getCompleteDeployedSolutionItemVersioned(
  version = interfaces.DeployedSolutionFormatVersion
): any {
  const item: any = getCompleteMockItem("Solution");
  item.base.typeKeywords.push("Solution");
  item.base.typeKeywords.push("Deployed");
  item.base.ownerFolder = "fld1234567890";

  if (version === 0) {
    item.data = {
      metadata: {},
      templates: [
        {
          itemId: "wma1234567890",
          type: "Web Mapping Application",
          dependencies: ["map1234567890"],
          groups: [],
          item: {
            typeKeywords: []
          }
        },
        {
          itemId: "map1234567890",
          type: "Web Map",
          dependencies: [],
          groups: [],
          item: {
            typeKeywords: []
          }
        }
      ]
    };
  } else {
    item.data = {
      metadata: {
        version
      },
      templates: [
        {
          itemId: "map1234567890",
          type: "Web Map",
          dependencies: [],
          groups: [],
          item: {
            typeKeywords: []
          }
        },
        {
          itemId: "wma1234567890",
          type: "Web Mapping Application",
          dependencies: ["map1234567890"],
          groups: [],
          item: {
            typeKeywords: []
          }
        }
      ]
    };
  }

  item.fwdRelatedItems = [
    {
      relationshipType: "Solution2Item",
      relatedItemIds: ["wma1234567890", "map1234567890"]
    }
  ];
  return item;
}

export function getCompleteTemplateSolutionItem(): interfaces.ICompleteItem {
  const item = getCompleteMockItem("Solution");
  item.base.typeKeywords.push("Solution");
  item.base.typeKeywords.push("Template");
  return item;
}

export function getSolutionItem(): any {
  return getAGOLItemFundamentals("Solution");
}

export function getSolutionPrecis(
  items: interfaces.ISolutionItemPrecis[] = [],
  groups: string[] = []
): interfaces.ISolutionPrecis {
  return {
    id: "sol1234567890",
    title: "An AGOL item",
    folder: "fld1234567890",
    items,
    groups
  };
}

export function getItemWithoutItemProp(): any {
  const agolItem = getAGOLItem("Web Map");
  delete agolItem.item;
  return agolItem;
}

export function getTrimmedAGOLItem(item: any): any {
  delete item.avgRating;
  delete item.created;
  delete item.guid;
  delete item.lastModified;
  delete item.modified;
  delete item.numComments;
  delete item.numRatings;
  delete item.numViews;
  delete item.orgId;
  delete item.owner;
  delete item.scoreCompleteness;
  delete item.size;
  delete item.uploaded;

  return item;
}

export function getNoNameAGOLFeatureServiceItem(): any {
  const item = getAGOLItem("Feature Service");
  item.name = null;
  return item;
}

export function getAGOLItemData(type?: string, itemId?: string): any {
  let data: any = get500Failure();

  // Supported item types
  switch (type) {
    case "ArcGIS Pro Add In":
      break;

    case "Big Data Analytic":
      data = {
        id: itemId,
        label: "Test Analytic",
        description: "",
        sources: [
          {
            id: "7afde56d-646e-75cc-a53e-4613cc34d359",
            name: "feature-layer",
            label: "Snow Routes",
            schemaTransformation: {},
            properties: {
              ui: {
                top: 10,
                left: 10,
                width: 240,
                height: 70
              },
              "feature-layer.portalItemId": "ad6893904c4d4191b5c2312e60e8def7",
              "feature-layer.outSR": "4326"
            }
          },
          {
            id: "9b2a43f6-f207-0e8c-812d-f63ec6a95227",
            name: "feature-layer",
            label: "WWO1_Simulation_Combined_Fleet_with_Service_Status",
            schemaTransformation: {},
            properties: {
              ui: {
                top: 140,
                left: 10,
                width: 240,
                height: 70
              },
              "feature-layer.portalItemId": "a8d8e6ee3e7d4c889d3e95ad6a99198c",
              "feature-layer.timestampField": "datetimeprocessed",
              "feature-layer.outSR": "4326"
            }
          }
        ],
        tools: [],
        outputs: [
          {
            id: "dd99fcbc-e8fc-f85a-e567-881a2db9afb4",
            name: "feat-lyr-new",
            label: "SnowRoutesLastServicedFox",
            properties: {
              "feat-lyr-new.replaceFeatures": false,
              "feat-lyr-new.aggregationStyles": [],
              "feat-lyr-new.editorTrackingEnabled": false,
              "feat-lyr-new.updateExistingFeatures": true,
              "feat-lyr-new.name": "SnowRoutesLastServicedFox"
            }
          }
        ],
        pipeline: [],
        recurrence: {
          expression: "0/3 * * * *",
          timeZone: "America/New_York"
        },
        properties: {
          mode: "model"
        },
        status: {}
      };
      break;

    case "Code Attachment":
      break;

    case "Code Sample":
      break;

    case "Dashboard":
      data = {
        version: 24,
        layout: {
          rootElement: {
            type: "stackLayoutElement",
            orientation: "col",
            elements: []
          }
        },
        headerPanel: {
          type: "headerPanel"
        },
        leftPanel: {
          type: "leftPanel",
          title: "<p>left panel description</p>\n",
          selectors: []
        },
        widgets: [
          {
            showNavigation: true,
            events: [],
            flashRepeats: 3,
            itemId: "map1234567890",
            mapTools: [
              {
                type: "bookmarksTool"
              }
            ],
            type: "mapWidget",
            showPopup: true,
            layers: [
              {
                type: "featureLayerDataSource",
                layerId: "ROWPermitApplication_4605",
                name: "ROW Permits"
              }
            ],
            id: "1200f3f1-8f72-4ea6-af16-14f19e9a4517",
            name: "ROW Permit Map"
          },
          {
            type: "indicatorWidget",
            id: "3e796f16-722b-437f-89a4-e3787e105b24",
            name: "ROW Permit Count"
          },
          {
            type: "listWidget",
            id: "0f994268-e553-4d11-b8d1-afecf0818841",
            name: "ROW Permit List"
          },
          {
            type: "serialChartWidget",
            id: "ff698ea5-2812-4ba5-a0ba-d89fc302f8f4",
            name: "Permit Type"
          },
          {
            type: "serialChartWidget",
            id: "d2e11f43-8d61-422c-b7fe-00dc8a9c2b14",
            name: "Submission Date"
          }
        ],
        settings: {
          maxPaginationRecords: 50000
        },
        theme: "light"
      };
      break;

    case "Desktop Add In":
      break;

    case "Desktop Application Template":
      break;

    case "Document Link":
      break;

    case "Feature Collection":
      break;

    case "Feature Service":
      data = {
        tables: [
          {
            id: 1,
            popupInfo: {
              title: "table 1"
            }
          }
        ],
        layers: [
          {
            id: 0,
            popupInfo: {
              title: "layer 0"
            },
            layerDefinition: {
              defaultVisibility: true
            }
          }
        ]
      };
      break;

    case "Form":
      break;

    case "Geoprocessing Package":
      break;

    case "Geoprocessing Sample":
      break;

    case "Layer Package":
      break;

    case "Map Template":
      break;

    case "Notebook":
      data = {
        metadata: {
          kernelspec: {
            name: "python3",
            display_name: "Python 3",
            language: "python"
          },
          esriNotebookRuntime: {
            notebookRuntimeName: "ArcGIS Notebook Python 3 Advanced",
            notebookRuntimeVersion: "3.0"
          },
          language_info: {
            name: "python",
            version: "3.6.9",
            mimetype: "text/x-python",
            codemirror_mode: {
              name: "ipython",
              version: 3
            },
            pygments_lexer: "ipython3",
            nbconvert_exporter: "python",
            file_extension: ".py"
          }
        },
        cells: [
          {
            metadata: {
              trusted: true
            },
            cell_type: "code",
            source: "3b927de78a784a5aa3981469d85cf45d",
            execution_count: null,
            outputs: []
          }
        ],
        nbformat: 4,
        nbformat_minor: 2
      };
      break;

    case "Operation View":
      break;

    case "Oriented Imagery Catalog":
      data = {
        type: "OIC",
        version: "1.0",
        properties: {
          Name: "OIC_002",
          Description: "OIC_002",
          Tags: "OIC",
          ServiceURL:
            "https://services.arcgis.com/64491f8c348a51cf/arcgis/rest/services/OIC_FL_002/FeatureServer/0",
          OverviewURL:
            "https://services.arcgis.com/64491f8c348a51cf/arcgis/rest/services/OIC_FL_002/FeatureServer/0",
          DefaultAttributes: {
            CamHeading: "",
            CamPitch: "90",
            CamRoll: "0",
            HFOV: "60",
            VFOV: "40",
            AvgHtAG: "1.7",
            FarDist: "50",
            NearDist: "0.1",
            OIType: "I",
            SortOrder: "",
            CamOffset: "",
            Accuracy: "",
            ImgPyramids: "",
            DepthImg: "",
            ExternalViewer: "",
            ImgRot: ""
          },
          About: "",
          ImageField: "image_",
          ImagePrefix: "",
          VideoPrefix: "",
          DepthImagePrefix: "",
          SourceImagePrefix: "",
          MaxDistance: "100",
          DEMPrefix: "",
          Credentials: {
            Username: "",
            Password: ""
          },
          Variables: {},
          Filters: {},
          Copyright: {
            text: "",
            url: ""
          },
          PointsSource: "",
          CoverageSource: "",
          imageField: "Image_"
        }
      };
      break;

    case "Pro Map":
      break;

    case "Project Package":
      break;

    case "Project Template":
      break;

    case "QuickCapture Project":
      data = [
        {
          name: "images/Camera.png",
          lastModified: 1579284023790,
          lastModifiedDate:
            "Fri Jan 17 2020 11:00:23 GMT-0700 (Mountain Standard Time)",
          webkitRelativePath: "",
          size: 487,
          type: "image/png"
        },
        {
          name: "qc.project.json",
          lastModified: 1579284023790,
          lastModifiedDate:
            "Fri Jan 17 2020 11:00:23 GMT-0700 (Mountain Standard Time)",
          webkitRelativePath: "",
          size: 29882,
          type: "application/json",
          text: () => {
            return new Promise<any>(resolve => {
              resolve(
                JSON.stringify({
                  basemap: {},
                  dataSources: [
                    {
                      featureServiceItemId: "4efe5f693de34620934787ead6693f10",
                      dataSourceId: "1d4de1e4-ef58-4e02-9159-7a6e6701cada",
                      url:
                        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/0"
                    },
                    {
                      featureServiceItemId: "4efe5f693de34620934787ead6693f10",
                      dataSourceId: "1687a71b-cf77-48ed-b948-c66e228a0f74",
                      url:
                        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/TestLayerForDashBoardMap/FeatureServer/1"
                    }
                  ],
                  itemId: "9da79c91fc7642ebb4c0bbacfbacd510",
                  preferences: {
                    adminEmail: "jhauck@esri.com"
                  },
                  templateGroups: [],
                  userInputs: [],
                  version: 0.1
                })
              );
            });
          }
        }
      ];
      break;

    case "Real Time Analytic":
      data = {
        id: itemId,
        label: type,
        description: "",
        sources: [
          {
            id: "40d18a22-9927-97d1-e573-44f197bddfe7",
            name: "feature-layer",
            label: "Active_Snowplow_Driver",
            schemaTransformation: {},
            properties: {
              "feature-layer.portalItemId": itemId,
              "feature-layer.outSR": "4326"
            }
          }
        ],
        feeds: [
          {
            id: "bbb9398bcf8c4dc5a50cceaa59baf513",
            label: "WWO Simulation Provider AVL Feed",
            name: "simulator",
            properties: {}
          },
          {
            id: "ccc6347e0c4f4dc8909da399418cafbe",
            label: "WWO Simulation ArcGIS Tracking Feed",
            name: "simulator",
            properties: {}
          }
        ],
        outputs: [
          {
            id: "01aacfd0-754d-3ac0-bb8d-aa3814b32fbf",
            name: "feat-lyr-new",
            label: "Custom Velocity Update",
            properties: {
              "feat-lyr-new.editorTrackingEnabled": false,
              "feat-lyr-new.updateExistingFeatures": true,
              "feat-lyr-new.name": "Custom Velocity Update",
              "feat-lyr-new.useSpatiotemporal": true,
              "feat-lyr-new.portal.featureServicePortalItemID":
                "e620910ed73b4780b5407112d8f1ce30",
              "feat-lyr-new.portal.mapServicePortalItemID":
                "d17c3732ceb04e62917d9444863a6c28"
            }
          },
          {
            id: "02aacfd0-754d-3ac0-bb8d-aa3814b32fbf",
            name: "feat-lyr-new",
            label: "Custom Stream",
            properties: {
              "feat-lyr-new.editorTrackingEnabled": false,
              "feat-lyr-new.updateExistingFeatures": true,
              "stream-lyr-new.name": "Custom Stream",
              "feat-lyr-new.useSpatiotemporal": false
            }
          }
        ]
      };
      break;

    case "Solution":
      data = {
        metadata: {},
        templates: [
          {
            itemId: "wma1234567890",
            type: "Web Mapping Application",
            item: {
              id: "{{wma1234567890.itemId}}",
              type: "Web Mapping Application",
              description: null,
              extent: [],
              properties: null,
              snippet: null,
              tags: ["test"],
              thumbnail: null,
              title: "Basic Viewer",
              typeKeywords: [
                "JavaScript",
                "Map",
                "Mapping Site",
                "Online Map",
                "Web Map"
              ],
              url:
                "{{portalBaseUrl}}/apps/View/index.html?appid={{wma1234567890.itemId}}"
            },
            data: {
              source: "tmp1234567890",
              folderId: null,
              values: {
                webmap: "{{map1234567890.itemId}}"
              }
            },
            resources: ["wma1234567890_info_thumbnail/ago_downloaded.png"],
            dependencies: ["map1234567890"],
            groups: [],
            properties: {},
            estimatedDeploymentCostFactor: 2,
            relatedItems: []
          },
          {
            itemId: "map1234567890",
            type: "Web Map",
            item: {
              id: "{{map1234567890.itemId}}",
              type: "Web Map",
              description:
                "This is an extensive, in-depth description about the map with metadata. Although it's also the metadata's abstract.",
              extent: "{{solutionItemExtent}}",
              properties: null,
              snippet: "This is a brief summary about the map with metadata.",
              tags: ["test"],
              thumbnail: null,
              title: "Map with metadata",
              typeKeywords: [
                "ArcGIS Online",
                "Explorer Web Map",
                "Map",
                "Metadata",
                "Offline",
                "Online Map",
                "Web Map"
              ],
              url:
                "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{map1234567890.itemId}}"
            },
            data: {
              operationalLayers: [],
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
              authoringAppVersion: "7.3",
              version: "2.15"
            },
            resources: [
              "map1234567890_info_metadata/metadata.xml",
              "map1234567890_info_thumbnail/thumbnail1572976699636.png"
            ],
            dependencies: [],
            groups: [],
            properties: {},
            estimatedDeploymentCostFactor: 2,
            relatedItems: []
          }
        ]
      };
      break;

    case "Web Map":
      data = {
        operationalLayers: [
          {
            id: "ROWPermitApplication_4605",
            layerType: "ArcGISFeatureLayer",
            url:
              "https://services123.arcgis.com/org1234567890/arcgis/rest/services/" +
              "ROWPermits_publiccomment/FeatureServer/0",
            title: "ROW Permits",
            itemId: "svc1234567890",
            popupInfo: {},
            capabilities: "Query"
          }
        ],
        baseMap: {
          baseMapLayers: [
            {
              id: "World_Hillshade_3689",
              layerType: "ArcGISTiledMapServiceLayer",
              url:
                "http://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer",
              title: "World Hillshade"
            },
            {
              id: "VectorTile_6451",
              type: "VectorTileLayer",
              layerType: "VectorTileLayer",
              title: "World Topographic Map",
              styleUrl:
                utils.PORTAL_SUBSET.restUrl +
                "/content/items/" +
                "7dc6cea0b1764a1f9af2e679f642f0f5/resources/styles/root.json",
              itemId: "7dc6cea0b1764a1f9af2e679f642f0f5"
            }
          ],
          title: "Topographic"
        },
        spatialReference: {
          wkid: 102100,
          latestWkid: 3857
        },
        tables: [
          {
            url:
              "https://services123.arcgis.com/org1234567890/arcgis/rest/services/" +
              "ROWPermits_publiccomment/FeatureServer/1",
            id: "ROWPermitApplication_4404",
            title: "ROW Permit Comment",
            layerDefinition: {},
            itemId: "svc1234567890",
            popupInfo: {}
          }
        ]
      };
      break;

    case "Web Mapping Application":
      data = {
        source: "tpl1234567890",
        folderId: "fld1234567890",
        values: {
          webmap: "map1234567890",
          title: "A web mapping application",
          titleIcon: "images/banner.png",
          displayText: "<b>Welcome</p>",
          featureLayer: {
            id: "ROWPermitApplication_4605",
            fields: [
              {
                id: "sortField",
                fields: ["submitdt"]
              }
            ]
          },
          showAllFeatures: "true",
          customUrlLayer: {
            id: "ROWPermitApplication_4605",
            fields: [
              {
                id: "urlField",
                fields: ["OBJECTID"]
              }
            ]
          },
          customUrlParam: "id"
        }
      };
      break;

    case "Workforce Project":
      data = {
        workerWebMapId: "abc116555b16437f8435e079033128d0",
        dispatcherWebMapId: "abc26a244163430590151395821fb845",
        dispatchers: {
          serviceItemId: "abc302ec12b74d2f9f2b3cc549420086",
          url:
            "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0"
        },
        assignments: {
          serviceItemId: "abc4494043c3459faabcfd0e1ab557fc",
          url:
            "https://services123.arcgis.com/org1234567890/arcgis/rest/services/assignments_47bb15c2df2b466da05577776e82d044/FeatureServer/0"
        },
        workers: {
          serviceItemId: "abc5dd4bdd18437f8d5ff1aa2d25fd7c",
          url:
            "https://services123.arcgis.com/org1234567890/arcgis/rest/services/workers_47bb15c2df2b466da05577776e82d044/FeatureServer/0"
        },
        tracks: {
          serviceItemId: "abc64329e69144c59f69f3f3e0d45269",
          url:
            "https://services123.arcgis.com/org1234567890/arcgis/rest/services/location_47bb15c2df2b466da05577776e82d044/FeatureServer/0",
          enabled: true,
          updateInterval: 300
        },
        version: "1.2.0",
        groupId: "abc715c2df2b466da05577776e82d044",
        folderId: "abc8483e025c47338d43df308c117308",
        assignmentIntegrations: [
          {
            id: "default-navigator",
            prompt: "Navigate to Assignment",
            // placeholder urlTemplates until I get an legitimate one
            urlTemplate:
              "arcgis-navigator://?stop=${assignment.latitude},{itemID=cad3483e025c47338d43df308c117308},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt={itemID=bad3483e025c47338d43df308c117308}://Workforce",
            assignmentTypes: [
              {
                // placeholder urlTemplates until I get an legitimate one
                urlTemplate:
                  "arcgis-navigator://?stop=${assignment.latitude},{itemID=cad3483e025c47338d43df308c117308},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt={itemID=bad3483e025c47338d43df308c117308}://Workforce"
              }
            ]
          }
        ]
      };
      break;

    case "Unsupported":
      data = null;
      break;
  }

  return data;
}

export function getAGOLItemDataWMAGroup(): any {
  const data = getAGOLItemData("Web Mapping Application");
  data.values.group = data.values.webmap;
  delete data.values.webmap;
  return data;
}

export function getAGOLItemDataWMANoWebmapOrGroup(): any {
  const data = getAGOLItemData("Web Mapping Application");
  delete data.folderId;
  delete data.values.webmap;
  return data;
}

export function getItemDataWidgetlessDashboard(): any {
  const data = getAGOLItemData("Dashboard");
  data.widgets = null;
  return data;
}

export function getAGOLItemResources(testCase?: string): any {
  let resources: any = get400Failure();

  // Supported file formats are: JSON, XML, TXT, PNG, JPEG, GIF, BMP, PDF, MP3, MP4, and ZIP.

  // Some test cases
  switch (testCase) {
    case "none":
      resources = {
        total: 0,
        start: 1,
        num: 0,
        nextStart: -1,
        resources: []
      };
      break;

    case "one png":
      resources = {
        total: 1,
        start: 1,
        num: 1,
        nextStart: -1,
        resources: [
          {
            resource: "anImage.png",
            created: 1551117331000,
            size: 236838,
            access: "inherit"
          }
        ]
      };
      break;

    case "one png in folder":
      resources = {
        total: 1,
        start: 1,
        num: 1,
        nextStart: -1,
        resources: [
          {
            resource: "aFolder/anImage.png",
            created: 1551117331000,
            size: 236838,
            access: "inherit"
          }
        ]
      };
      break;

    case "one zip":
      resources = {
        total: 1,
        start: 1,
        num: 1,
        nextStart: -1,
        resources: [utils.getSampleZip()]
      };
      break;
  }

  return resources;
}

export function getAGOLGroup(id?: string, owner?: string): any {
  return {
    id: id || "grp1234567890",
    title: "An AGOL group",
    isInvitationOnly: true,
    owner: owner || "LocalGovTryItLive",
    description: "Description of an AGOL group",
    snippet: "Snippet of an AGOL group",
    tags: ["JavaScript"],
    typeKeywords: [],
    phone: null,
    sortField: "title",
    sortOrder: "asc",
    isViewOnly: true,
    thumbnail: "ROWPermitManager.png",
    created: 1520967981000,
    modified: 1523544543000,
    access: "public",
    capabilities: [],
    isFav: false,
    isReadOnly: false,
    protected: false,
    autoJoin: false,
    notificationsEnabled: false,
    provider: null,
    providerGroupName: null,
    userMembership: {
      username: "ArcGISTeamLocalGovOrg",
      memberType: "owner",
      applications: 0
    },
    collaborationInfo: {}
  };
}

export function getAGOLUser(username: string): interfaces.IUser {
  return {
    access: "org",
    created: 1346425801000,
    culture: "en-US",
    description: "",
    disabled: false,
    email: "casey@esri.com",
    firstName: "Casey",
    fullName: "Casey",
    lastName: "",
    level: "2",
    orgId: "org1234567890",
    preferredView: "",
    privileges: ["features:user:edit"],
    provider: "arcgis",
    region: "US",
    units: "metric",
    username: username
  };
}

export function getAGOLItemWithId(type: string, idOffset: number): any {
  const item = getAGOLItem(type);
  item.id = item.item =
    getItemTypeAbbrev.getItemTypeAbbrev(type) +
    1234567890 +
    idOffset.toString(16).toLowerCase();
  return item;
}

export function getAGOLGroupCategorySchema(): interfaces.IGroupCategorySchema {
  // JSON Response Example from https://developers.arcgis.com/rest/users-groups-and-items/group-category-schema.htm
  return {
    categorySchema: [
      {
        title: "Categories",
        categories: [
          {
            title: "Basemaps",
            categories: [
              { title: "Partner Basemap" },
              {
                title: "Esri Basemaps",
                categories: [
                  { title: "Esri Raster Basemap" },
                  { title: "Esri Vector Basemap" }
                ]
              }
            ]
          },
          {
            title: "Imagery",
            categories: [
              { title: "Multispectral Imagery" },
              { title: "Temporal Imagery" }
            ]
          }
        ]
      },
      {
        title: "Region",
        categories: [{ title: "US" }, { title: "World" }]
      }
    ]
  };
}

export function getAGOLGroupContentsList(
  numToPutIntoGroup: number,
  type: string = ""
): any {
  const group = {
    total: 0,
    start: 1,
    num: 0,
    nextStart: -1,
    items: [] as string[]
  };
  while (group.items.length < numToPutIntoGroup) {
    group.items.push(getAGOLItemWithId(type, group.total++));
    group.num++;
  }
  group.total = group.num;
  return group;
}

export function getAGOLGroupContentsListByType(typesList: string[]): any {
  const group = {
    total: 0,
    start: 1,
    num: 0,
    nextStart: -1,
    items: [] as string[]
  };
  typesList.forEach(itemType => {
    group.items.push(getAGOLItemWithId(itemType, group.total++));
    group.num++;
  });
  return group;
}

export function getAGOLService(
  layers = [] as any,
  tables = [] as any,
  isView?: boolean
): any {
  const service: any = {
    adminServiceInfo: {
      name: "a feature service",
      type: "FeatureServer",
      cacheMaxAge: 60,
      status: "Started"
    },
    currentVersion: 10.61,
    serviceItemId: "svc1234567890",
    isView: isView === null || isView === undefined ? true : isView,
    isUpdatableView: true,
    sourceSchemaChangesAllowed: true,
    serviceDescription: "",
    hasVersionedData: false,
    supportsDisconnectedEditing: false,
    hasStaticData: false,
    maxRecordCount: 1000,
    supportedQueryFormats: "JSON",
    supportsVCSProjection: false,
    capabilities: "Create,Query,Editing",
    description: "",
    copyrightText: "",
    spatialReference: {
      wkid: 102100,
      latestWkid: 3857
    },
    initialExtent: {
      xmin: -14999999.999989873,
      ymin: 2699999.9999980442,
      xmax: -6199999.9999958146,
      ymax: 6499999.99999407,
      spatialReference: {
        wkid: 102100,
        latestWkid: 3857
      }
    },
    fullExtent: {
      xmin: -14999999.999989873,
      ymin: 2699999.9999980442,
      xmax: -6199999.9999958146,
      ymax: 6499999.99999407,
      spatialReference: {
        wkid: 102100,
        latestWkid: 3857
      }
    },
    allowGeometryUpdates: true,
    units: "esriMeters",
    supportsAppend: true,
    syncEnabled: false,
    supportsApplyEditsWithGlobalIds: true,
    editorTrackingInfo: {
      enableEditorTracking: true,
      enableOwnershipAccessControl: false,
      allowOthersToQuery: true,
      allowOthersToUpdate: true,
      allowOthersToDelete: true,
      allowAnonymousToQuery: true,
      allowAnonymousToUpdate: true,
      allowAnonymousToDelete: true
    },
    xssPreventionInfo: {
      xssPreventionEnabled: true,
      xssPreventionRule: "InputOnly",
      xssInputRule: "rejectInvalid"
    }
  };

  if (layers.length > 0 || tables.length > 0) {
    service.layers = layers;
    service.tables = tables;
  }

  return service;
}

export function getAGOLServiceSources(): any {
  const sources: any = {
    currentVersion: 10.61,
    services: [
      {
        serviceItemId: "svc1234567890",
        name: "OtherSourceServiceName"
      }
    ]
  };

  return sources;
}

export function getAGOLLayerOrTable(
  id: number,
  name: string,
  type: string,
  relationships = [] as any,
  isView?: boolean
): any {
  return {
    currentVersion: 10.61,
    id: id,
    name: name,
    type: type,
    serviceItemId: "svc1234567890",
    isView: isView === null || isView === undefined ? true : isView,
    isUpdatableView: true,
    sourceSchemaChangesAllowed: true,
    displayField: "appname",
    description: "PermitApplication",
    copyrightText: "",
    defaultVisibility: true,
    editFieldsInfo: {
      creationDateField: "CreationDate",
      creatorField: "Creator",
      editDateField: "EditDate",
      editorField: "Editor"
    },
    editingInfo: {
      lastEditDate: 1538579807130
    },
    fields: [
      {
        name: "appname",
        type: "esriFieldTypeString",
        alias: "appname",
        sqlType: "sqlTypeOther",
        length: 0,
        nullable: true,
        editable: true,
        visible: true,
        domain: null,
        defaultValue: null
      },
      {
        name: "BoardReview",
        type: "esriFieldTypeString",
        alias: "Board Review",
        sqlType: "sqlTypeOther",
        length: 0,
        nullable: true,
        editable: true,
        visible: true,
        domain: null,
        defaultValue: null
      },
      {
        name: "globalid",
        type: "esriFieldTypeGlobalID",
        alias: "globalid",
        sqlType: "sqlTypeOther",
        length: 0,
        nullable: false,
        editable: true,
        visible: true,
        domain: null,
        defaultValue: null
      },
      {
        name: "CreationDate",
        type: "esriFieldTypeDate",
        alias: "CreationDate",
        sqlType: "sqlTypeOther",
        length: 0,
        nullable: true,
        editable: true,
        visible: true,
        domain: null,
        defaultValue: null
      },
      {
        name: "Creator",
        type: "esriFieldTypeString",
        alias: "Creator",
        sqlType: "sqlTypeOther",
        length: 0,
        nullable: true,
        editable: true,
        visible: true,
        domain: null,
        defaultValue: null
      },
      {
        name: "EditDate",
        type: "esriFieldTypeDate",
        alias: "EditDate",
        sqlType: "sqlTypeOther",
        length: 0,
        nullable: true,
        editable: true,
        visible: true,
        domain: null,
        defaultValue: null
      },
      {
        name: "Editor",
        type: "esriFieldTypeString",
        alias: "Editor",
        sqlType: "sqlTypeOther",
        length: 0,
        nullable: true,
        editable: true,
        visible: true,
        domain: null,
        defaultValue: null
      },
      {
        name: "OBJECTID",
        type: "esriFieldTypeOID",
        alias: "OBJECTID",
        sqlType: "sqlTypeOther",
        length: 8,
        nullable: false,
        editable: false,
        visible: true,
        domain: null,
        defaultValue: null
      }
    ],
    relationships: relationships,
    geometryType: "esriGeometryPoint",
    minScale: 0,
    maxScale: 0,
    extent: {
      xmin: -14999999.999989873,
      ymin: -13315943.826968452,
      xmax: 1604565.8194646926,
      ymax: 6499999.99999407,
      spatialReference: {
        wkid: 102100,
        latestWkid: 3857
      }
    },
    allowGeometryUpdates: true,
    hasAttachments: true,
    viewSourceHasAttachments: false,
    attachmentProperties: [
      {
        name: "name",
        isEnabled: true
      },
      {
        name: "size",
        isEnabled: true
      },
      {
        name: "contentType",
        isEnabled: true
      },
      {
        name: "keywords",
        isEnabled: true
      }
    ],
    objectIdField: "OBJECTID",
    uniqueIdField: {
      name: "OBJECTID",
      isSystemMaintained: true
    },
    globalIdField: "globalid",
    capabilities: "Create,Query,Editing",
    viewDefinitionQuery: "status = 'BoardReview'",
    definitionQuery: "status = 'BoardReview'",
    typeIdField: "BoardReview"
  };
}

export function createAGOLRelationship(
  id: number,
  relatedTableId: number,
  role: string
): any {
  const relationship: any = {
    id: id,
    name: "",
    relatedTableId: relatedTableId,
    cardinality: "esriRelCardinalityOneToMany",
    role: role,
    "": "globalid",
    composite: true
  };
  relationship.keyField =
    role === "esriRelRoleOrigin" ? "globalid" : "parentglobalid";
  return relationship;
}

function getAGOLItemFundamentals(type: string, url = "", itemId?: string): any {
  const typePrefix = getItemTypeAbbrev.getItemTypeAbbrev(type);
  return {
    id: itemId ? itemId : typePrefix + "1234567890",
    item: typePrefix + "1234567890",
    owner: "LocalGovTryItLive",
    ownerFolder: null,
    orgId: "org1234567890",
    created: 1520968147000,
    modified: 1522178539000,
    guid: null,
    name: "Name of an AGOL item",
    title: "An AGOL item",
    type: type,
    typeKeywords: ["JavaScript"],
    description: "Description of an AGOL item",
    tags: ["test"],
    snippet: "Snippet of an AGOL item",
    thumbnail: "thumbnail/ago_downloaded.png",
    documentation: null,
    extent: [],
    categories: [],
    contentStatus: null,
    lastModified: -1,
    accessInformation: "Esri, Inc.",
    licenseInfo: null,
    culture: "en-us",
    properties: null,
    url: url,
    proxyFilter: null,
    access: "public",
    size: 1627,
    appCategories: [],
    industries: [],
    languages: [],
    largeThumbnail: null,
    banner: null,
    screenshots: [],
    listed: false,
    commentsEnabled: false,
    numComments: 0,
    numRatings: 0,
    avgRating: 0,
    numViews: 690,
    scoreCompleteness: 78,
    groupDesignations: null
  };
}

export function getAGOLSubscriptionInfo(hasVelocity: boolean): any {
  return {
    id: "9999999999",
    type: "In House",
    state: "active",
    expDate: 1632812399000,
    userLicenseTypes: {
      advancedUT: 50,
      creatorUT: 50,
      insightsAnalystUT: 50,
      storytellerUT: 50,
      viewerUT: 0
    },
    maxUsersPerLevel: {
      "1": 0,
      "2": 200
    },
    maxUsers: 200,
    availableCredits: 21190.238,
    collaborationSettings: {
      level: "4",
      maxItemSizeInMB: 1024,
      maxReplicationPackageSizeInMB: 5120
    },
    hubSettings: {
      enabled: true
    },
    companionOrganizations: [
      {
        organizationUrl: "localdeploy-hub.fake.maps.arcgis.com",
        orgId: "XXXXJwe2TfrjNh3o",
        orgName: "ArcGIS for Local Government Fake",
        type: "Community",
        canSignInArcGIS: true,
        canSignInIDP: true,
        canSignInSocial: true,
        canSignInOIDC: true
      }
    ],
    orgCapabilities: hasVelocity
      ? [
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
              "https://us-iot.arcgis.com/usadvanced00/faKetfmrv9d1divn",
            storageUnits: 0
          }
        ]
      : [],
    storageRegion: "us1"
  };
}
