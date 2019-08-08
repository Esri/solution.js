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

// -- Exports -------------------------------------------------------------------------------------------------------//

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

export function getItemTemplate(): any {
  return {
    itemId: "",
    type: "",
    key: "",
    item: {},
    data: {},
    resources: [],
    properties: {},
    dependencies: [],
    estimatedDeploymentCostFactor: 0
  };
}

export function getAGOLItem(type?: string, url = ""): any {
  let item: any = get400FailureResponse();

  // Supported item types
  switch (type) {
    case "ArcGIS Pro Add In":
      break;

    case "Code Attachment":
      break;

    case "Code Sample":
      break;

    case "Dashboard":
      item = getAGOLItemFundamentals(type, "dsh", url || undefined);
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
        "svc",
        url ||
          "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer"
      );
      break;

    case "Form":
      item = getAGOLItemFundamentals(type, "frm", url || undefined);
      break;

    case "Geoprocessing Package":
      break;

    case "Geoprocessing Sample":
      break;

    case "Layer Package":
      break;

    case "Map Template":
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
      item = getAGOLItemFundamentals(type, "map", url || undefined);
      break;

    case "Web Mapping Application":
      item = getAGOLItemFundamentals(
        type,
        "wma",
        url ||
          "http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=wma1234567890"
      );
      break;

    case "Workforce Project":
      item = getAGOLItemFundamentals(type, type);
      break;

    case "Unsupported":
      item = getAGOLItemFundamentals(type, "uns");
      break;

    case "Group":
      item = getAGOLGroup();
  }

  return item;
}

export function getSolutionItem(): any {
  return getAGOLItemFundamentals("Solution", "sol");
}

export function getItemWithoutItemProp(): any {
  const agolItem = getAGOLItem("Web Map");
  delete agolItem.item;
  return agolItem;
}

export function getTrimmedAGOLItem(): any {
  const item = getAGOLItemFundamentals(
    "Web Mapping Application",
    "wma",
    "http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc599252a7835eea21"
  );

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
  let data: any = get400Failure();

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
      data = {};
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

export function getAGOLGroupContentsList(numToPutIntoGroup: number): any {
  const group = {
    total: 0,
    start: 1,
    num: 0,
    nextStart: -1,
    items: [] as string[]
  };
  while (group.items.length < numToPutIntoGroup) {
    group.items.push("itm" + group.items.length);
  }
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
    isView: isNullOrUndefined(isView) ? true : isView,
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
    isView: isNullOrUndefined(isView) ? true : isView,
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
    return fs.createReadStream("./test/mocks/success.png");
  } else {
    // Chrome test
    return new Blob([atob(imageAsDataUri(false))], { type: "image/png" });
  }
}

// -- Internals ------------------------------------------------------------------------------------------------------//

function getAGOLItemFundamentals(
  type: string,
  typePrefix: string,
  url = ""
): any {
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

function imageAsDataUri(withUri: boolean) {
  let uri = "";
  if (withUri) {
    uri = "data:image/png;charset=utf-8;base64,";
  }
  uri +=
    "iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAA\
B3RJTUUH4wECFDYv8o+FNwAAAAd0RVh0QXV0aG9yAKmuzEgAAAAMdEVYdERlc2NyaXB0aW9uABMJ\
ISMAAAAKdEVYdENvcHlyaWdodACsD8w6AAAADnRFWHRDcmVhdGlvbiB0aW1lADX3DwkAAAAJdEVY\
dFNvZnR3YXJlAF1w/zoAAAALdEVYdERpc2NsYWltZXIAt8C0jwAAAAh0RVh0V2FybmluZwDAG+aH\
AAAAB3RFWHRTb3VyY2UA9f+D6wAAAAh0RVh0Q29tbWVudAD2zJa/AAAABnRFWHRUaXRsZQCo7tIn\
AAACaklEQVQ4jZWUS09TYRCGn3NpS0uhPeXSNlxLJQgYExAXEGIkRCKGhZfEnT/LnTs3ujQhLggL\
NYSFihhUQAkBRFoELbSlPbTnfN/nQoMW0Mi7m0zmmbwzk9GUUoozKlvYZTn9mkwxTVdjP+ZZAcVS\
nsXULHNfJimW98kW0uhnAbjCYW1ngXfpaXJuCs0AoQn0/zUjlWQ7u8GrzUl27XV0TKyqJgZab2Aq\
wHEPKbs2umbgMwMYxkmXuWKGZ8sP2c59BE3h1yNciI7SGevHBMXy5kvmP09RU2UxdO4WsbqOCoCQ\
Di+WHpHKL+OqEiYBehqv0tc2iq7rmI7jsLQzw8bBG3yHQfxbFuPHIHOfpljZm6WsDlBSozs2zEBi\
HJ83AIBuejwEvRFMzUdJFNjJr5Et7P+cgxRspD/wfP0xtptHSkV7+BJ9bdcJVdcfNdFBoznURY2n\
HlAclL+R2ltFSkEmt82T9/c5lHsIKbA87VxunyBuJdC134vVNSBuJQn74ziOS7b4nZWv8+TtDE8X\
HpA53MAVDroMMpS8TVtDNx7DW2HXBEU42Eh9dQsru3MUSlkWUzO4TonVzBwCByVNhpITdMb68XuD\
JzanA3g9VURrEwQMC1c47Nsp3m5NU3IOKJdduhuGGei4RtAfPvWGjoxFQwkaqlsRrsAVJWxnDykg\
Vt3FyPm7hAP1FXM4FVJXE6cp0oWSBkJIpIAaX5SxnntEI20YhudUQAWkyhcgbiWp9UZRUsNvWgwm\
b9KbGMT8B+AXRDsKmiNJLrZcIeRvoq91jJHeO2h/5P8m7fg/scs2eTtHJGBherx/q6vQD/83+vfY\
+Sr/AAAAAElFTkSuQmCC";

  return uri;
}
