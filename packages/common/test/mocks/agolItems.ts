import { isBoolean, isNullOrUndefined } from "util";

/*
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

// This file contains examples of items of the type one would expect to get from the AGOL REST API.

import * as interfaces from "../../src/interfaces";
import * as utils from "./utils";

// -------------------------------------------------------------------------------------------------------------------//

export function get200Failure(): any {
  return {
    success: false
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
      success: false
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

export function getAGOLItem(type?: string, url = ""): any {
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

    case "Image":
      item = getAGOLItemFundamentals(type, url || undefined);
      break;

    case "Layer Package":
      break;

    case "Map Template":
      break;

    case "Operation View":
      break;

    case "Notebook":
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

    case "Unsupported":
      item = getAGOLItemFundamentals(type);
      break;

    case "Group":
      item = getAGOLGroup();
      break;

    case "QuickCapture Project":
      item = getAGOLItemFundamentals(type);
      break;
  }

  return item;
}

export function getSolutionItem(): any {
  return getAGOLItemFundamentals("Solution");
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

export function getAGOLItemData(type?: string): any {
  let data: any = get500Failure();

  // Supported item types
  switch (type) {
    case "ArcGIS Pro Add In":
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

    case "Pro Map":
      break;

    case "Project Package":
      break;

    case "Project Template":
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
                "https://www.arcgis.com/sharing/rest/content/items/" +
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

export function getAGOLGroup(): any {
  return {
    id: "grp1234567890",
    title: "An AGOL group",
    isInvitationOnly: true,
    owner: "LocalGovTryItLive",
    description: "Description of an AGOL group",
    snippet: "Snippet of an AGOL group",
    typeKeywords: ["JavaScript"],
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
      memberType: "none"
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

export function getAGOLItemWithId(
  type: string,
  idOffset: number,
  url = ""
): any {
  const item = getAGOLItem(type);
  item.id = item.item =
    getItemTypeAbbrev(type) + 1234567890 + idOffset.toString(16).toLowerCase();
  return item;
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
    },
    layers: [],
    tables: []
  };

  function addCondensedFormOfLayer(
    layersOrTables: any[],
    serviceLayerList: any[]
  ) {
    layersOrTables.forEach(layer => {
      serviceLayerList.push({
        id: layer.id,
        name: layer.name,
        parentLayerId: -1,
        defaultVisibility: true,
        subLayerIds: null,
        minScale: 0,
        maxScale: 0,
        geometryType: "esriGeometryPoint"
      });
    });
  }

  addCondensedFormOfLayer(layers, service.layers);
  addCondensedFormOfLayer(tables, service.tables);

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
    definitionQuery: "status = 'BoardReview'"
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

export function getAnImageResponse(): any {
  const fs = require("fs");
  if (fs.createReadStream) {
    // Node test
    console.log("getAnImageResponse success.png");
    return fs.createReadStream("./test/mocks/success.png");
  } else {
    // Chrome test
    return utils.getSampleImage();
  }
}

export interface IItemTypeAbbrev {
  [id: string]: string;
}

export function getItemTypeAbbrev(type: string): string {
  // Supported item types
  return (
    ({
      Group: "grp",

      ////////////////////////////////////////////////////////
      // Layer types
      "Big Data Analytic": "xxx",
      "Feature Collection": "col",
      "Feature Service": "svc",
      Feed: "xxx",
      "Geocoding Service": "xxx",
      "Geodata Service": "xxx",
      "Geometry Service": "xxx",
      "Geoprocessing Service": "xxx",
      "Globe Service": "xxx",
      "Image Service": "xxx",
      KML: "xxx",
      "Map Service": "xxx",
      "Network Analysis Service": "xxx",
      "Real Time Analytic": "xxx",
      "Relational Database Connection": "xxx",
      "Scene Service": "xxx",
      "Stream Service": "xxx",
      Tool: "xxx",
      "Vector Tile Service": "xxx",
      WFS: "xxx",
      WMS: "xxx",
      WMTS: "xxx",
      "Workflow Manager Service": "xxx",

      ////////////////////////////////////////////////////////
      // Map types
      "3D Web Scene": "xxx",
      "Web Map": "map",
      "Web Scene": "xxx",

      ////////////////////////////////////////////////////////
      // App types
      Application: "xxx",
      "Data Store": "xxx",
      "Desktop Application": "xxx",
      "Excalibur Imagery Project": "xxx",
      Form: "frm",
      "Hub Initiative": "xxx",
      "Hub Page": "xxx",
      "Hub Site Application": "xxx",
      "Insights Model": "xxx",
      "Insights Page": "xxx",
      "Insights Theme": "xxx",
      "Insights Workbook": "xxx",
      Mission: "xxx",
      "Mobile Application": "xxx",
      "Native Application": "xxx",
      Notebook: "xxx",
      "Ortho Mapping Project": "xxx",
      "QuickCapture Project": "xxx",
      "Site Application": "xxx",
      "Site Initiative": "xxx",
      "Site Page": "xxx",
      Solution: "sol",
      StoryMap: "xxx",
      "Urban Model": "xxx",
      "Web Experience Template": "xxx",
      "Web Experience": "xxx",
      "Web Mapping Application": "wma",
      "Workforce Project": "wrk",

      ////////////////////////////////////////////////////////
      // File types
      "360 VR Experience": "xxx",
      "AppBuilder Extension": "xxx",
      "AppBuilder Widget Package": "xxx",
      "Application Configuration": "xxx",
      "ArcGIS Pro Add In": "pro",
      "ArcGIS Pro Configuration": "xxx",
      "ArcPad Package": "xxx",
      "Basemap Package": "xxx",
      "CAD Drawing": "xxx",
      "CityEngine Web Scene": "xxx",
      "Code Attachment": "cod",
      "Code Sample": "sam",
      "Color Set": "xxx",
      "Compact Tile Package": "xxx",
      "CSV Collection": "xxx",
      CSV: "xxx",
      Dashboard: "dsh",
      "Deep Learning Package": "xxx",
      "Desktop Add In": "dai",
      "Desktop Application Template": "dat",
      "Desktop Style": "xxx",
      "Document Link": "doc",
      "Explorer Add In": "xxx",
      "Explorer Layer": "xxx",
      "Explorer Map": "xxx",
      "Feature Collection Template": "xxx",
      "File Geodatabase": "xxx",
      GeoJson: "jsn",
      GeoPackage: "xxx",
      "Geoprocessing Package": "gpk",
      "Geoprocessing Sample": "geo",
      "Globe Document": "xxx",
      "Image Collection": "xxx",
      Image: "img",
      "iWork Keynote": "xxx",
      "iWork Numbers": "xxx",
      "iWork Pages": "xxx",
      "KML Collection": "xxx",
      "Layer Package": "lyp",
      "Layer Template": "xxx",
      Layer: "xxx",
      Layout: "xxx",
      "Locator Package": "xxx",
      "Map Document": "xxx",
      "Map Package": "xxx",
      "Map Template": "mpt",
      "Microsoft Excel": "xxx",
      "Microsoft Powerpoint": "xxx",
      "Microsoft Word": "xxx",
      "Mobile Basemap Package": "xxx",
      "Mobile Map Package": "xxx",
      "Mobile Scene Package": "xxx",
      "Native Application Installer": "xxx",
      "Native Application Template": "xxx",
      netCDF: "xxx",
      "Operation View": "opv",
      "Operations Dashboard Add In": "xxx",
      "Operations Dashboard Extension": "xxx",
      PDF: "xxx",
      "Pro Layer Package": "xxx",
      "Pro Layer": "xxx",
      "Pro Map Package": "prm",
      "Pro Map": "xxx",
      "Pro Report": "xxx",
      "Project Package": "ppk",
      "Project Template": "prt",
      "Published Map": "xxx",
      "Raster function template": "xxx",
      "Report Template": "xxx",
      "Rule Package": "xxx",
      "Scene Document": "xxx",
      "Scene Package": "xxx",
      "Service Definition": "xxx",
      Shapefile: "xxx",
      "Statistical Data Collection": "xxx",
      Style: "xxx",
      "Survey123 Add In": "xxx",
      "Symbol Set": "xxx",
      "Task File": "xxx",
      "Tile Package": "xxx",
      "Toolbox Package": "xxx",
      "Vector Tile Package": "xxx",
      "Viewer Configuration": "xxx",
      "Visio Document": "xxx",
      "Window Mobile Package": "xxx",
      "Windows Mobile Package": "xxx",
      "Windows Viewer Add In": "xxx",
      "Windows Viewer Configuration": "xxx",
      "Workflow Manager Package": "xxx"
    } as IItemTypeAbbrev)[type] || "xxx"
  );
}

function getAGOLItemFundamentals(type: string, url = ""): any {
  const typePrefix = getItemTypeAbbrev(type);
  return {
    id: typePrefix + "1234567890",
    item: typePrefix + "1234567890",
    owner: "LocalGovTryItLive",
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
    spatialReference: null,
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
