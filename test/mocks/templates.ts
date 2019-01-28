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

// This file contains examples of templates of AGOL items.

import * as mFeatureService from "../../src/itemTypes/featureservice";
import * as mInterfaces from "../../src/interfaces";
import * as mockItems from "../../test/mocks/agolItems";

// -- Exports -------------------------------------------------------------------------------------------------------//

export function getItemTemplatePart (
  type: string,
  dependencies = [] as string[],
  url = ""
): any {
  let templatePart:any = null;

  // Supported item types
  switch (type) {

    case "ArcGIS Pro Add In":
      break;

    case "Code Attachment":
      break;

    case "Code Sample":
      break;

    case "Dashboard":
      templatePart = getItemTemplateFundamentals(type, "dsh", dependencies, url);
      templatePart.data = getItemTemplateData(type);
      templatePart.resources = null;
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
      templatePart = getItemTemplateFundamentals(type, "svc", dependencies, url || "{{svc1234567890.id}}");
      templatePart.item.url = url || "{{svc1234567890.url}}";
      templatePart.data = getItemTemplateData(type);
      templatePart.resources = null;

      const layer0:any = removeEditFieldsInfoField(
        getLayerOrTableTemplate(0, "ROW Permits", "Feature Layer",
        [createItemTemplateRelationship(0, 1, "esriRelRoleOrigin")]
      ));
      const table1:any = removeEditFieldsInfoField(
        getLayerOrTableTemplate(1, "ROW Permit Comment", "Table",
        [createItemTemplateRelationship(0, 0, "esriRelRoleDestination")]
      ));

      const properties:mFeatureService.IFeatureServiceProperties = {
        service: getServiceTemplate([layer0], [table1]),
        layers: [layer0],
        tables: [table1]
      };
      properties.service.name = templatePart.item.name;
      properties.service.snippet = templatePart.item.snippet;
      properties.service.description = templatePart.item.description;

      templatePart.properties = properties;
      break;

    case "Form":
      break;

    case "Geoprocessing Package":
      break;

    case "Geoprocessing Sample":
      break;

    case "Layer Package":
      break;

    case "Map Template":  // //??? temporary definition
      templatePart = getItemTemplateFundamentals(type, "mtp", dependencies, url);
      templatePart.resources = null;
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
      templatePart = getItemTemplateFundamentals(type, "map", dependencies,
        url || "{{organization.portalBaseUrl}}/home/webmap/viewer.html?webmap={{map1234567890.id}}");
      templatePart.data = getItemTemplateData(type);
      templatePart.resources = null;
      break;

    case "Web Mapping Application":
      templatePart = getItemTemplateFundamentals(type, "wma", dependencies,
        url || "{{organization.portalBaseUrl}}/apps/CrowdsourcePolling/index.html?appid={{wma1234567890.id}}");
      templatePart.data = getItemTemplateData(type);
      templatePart.resources = null;
      break;

    case "Workforce Project":
      break;

    case "Unsupported":
      templatePart = getItemTemplateFundamentals(type, "unk", dependencies, url);
      templatePart.data = getItemTemplateData(type);
      templatePart.resources = null;
      break;

    default:
      fail("Unsupported template item type");
      break;
  }

  return templatePart;
}

export function getDashboardTemplatePartNoWidgets (
): any {
  const templatePart:any = getItemTemplatePart("Dashboard");
  templatePart.data.widgets = [];
  return templatePart;
}

export function getTemplatePartNoData (
  type: string
): any {
  const templatePart:any = getItemTemplatePart(type);
  templatePart.data = null;
  return templatePart;
}

export function getTemplatePartNoExtent (
  type: string
): any {
  const templatePart:any = getItemTemplatePart(type);
  templatePart.item.extent = null;
  return templatePart;
}

export function getFeatureServiceTemplatePartNoRelationships (
): any {
  const templatePart:any = getItemTemplatePart("Feature Service");
  templatePart.properties.layers[0].relationships = [];
  templatePart.properties.tables[0].relationships = [];
  return templatePart;
}

export function getGroupTemplatePart (
  dependencies = [] as string[]
): any {
  return {
    "itemId": "grp1234567890",
    "type": "Group",
    "key": "i1a2b3c4",
    "item": {
      "id": "{{grp1234567890.id}}",
      "title": "An AGOL group",
      "isInvitationOnly": true,
      "description": "Description of an AGOL group",
      "snippet": "Snippet of an AGOL group",
      "typeKeywords": ["JavaScript"],
      "phone": null,
      "sortField": "title",
      "sortOrder": "asc",
      "isViewOnly": true,
      "thumbnail": "ROWPermitManager.png",
      "access": "public",
      "capabilities": [],
      "isFav": false,
      "isReadOnly": false,
      "protected": false,
      "autoJoin": false,
      "notificationsEnabled": false,
      "provider": null,
      "providerGroupName": null,
      "userMembership": {
        "username": "ArcGISTeamLocalGovOrg",
        "memberType": "none"
      },
      "collaborationInfo": {}
    },
    "dependencies": dependencies
  };
}

export function getWebMappingApplicationTemplate (
): mInterfaces.ITemplate[] {
  const template:mInterfaces.ITemplate[] = [
    getItemTemplatePart("Web Mapping Application", ["map1234567890"],
      "{{organization.portalBaseUrl}}/apps/CrowdsourcePolling/index.html?appid={{wma1234567890.id}}"),
    getItemTemplatePart("Web Map", ["svc1234567890"],
      "{{organization.portalBaseUrl}}/home/webmap/viewer.html?webmap={{map1234567890.id}}"),
    getItemTemplatePart("Feature Service")
  ];

  return template;
}

export function getWebMappingApplicationTemplateGroup (
): mInterfaces.ITemplate[] {
  const template:mInterfaces.ITemplate[] = [
    getItemTemplatePart("Web Mapping Application", ["map1234567890"],
      "{{organization.portalBaseUrl}}/apps/CrowdsourcePolling/index.html?appid={{wma1234567890.id}}"),
    getItemTemplatePart("Web Map", ["svc1234567890"],
      "{{organization.portalBaseUrl}}/home/webmap/viewer.html?webmap={{map1234567890.id}}"),
    getItemTemplatePart("Feature Service", [])
  ];

  // Switch from webmap to group
  template[0].data.values.group = template[0].data.values.webmap;
  delete template[0].data.values.webmap;

  //  Give the WMA a resource
  template[0].resources = mockItems.getAGOLItemResources("one text").resources;

  return template;
}

export function getWebMappingApplicationTemplateNoWebmapOrGroup (
): mInterfaces.ITemplate[] {
  const template:mInterfaces.ITemplate[] = [
    getItemTemplatePart("Web Mapping Application", null,
      "{{organization.portalBaseUrl}}/apps/CrowdsourcePolling/index.html?appid={{wma1234567890.id}}"),
  ];

  // Change the dependencies from null to an empty array
  template[0].dependencies = [];

  // Remove folderId & values.webmap
  delete template[0].data.folderId;
  delete template[0].data.values.webmap;

  return template;
}

// -- Internals ------------------------------------------------------------------------------------------------------//

function createItemTemplateRelationship (
  id: number,
  relatedTableId: number,
  role: string
): any {
  const relationship:any = {
    "id": id,
    "name": "",
    "relatedTableId": relatedTableId,
    "cardinality": "esriRelCardinalityOneToMany",
    "role": role,
    "": "globalid",
    "composite": true
  };
  relationship.keyField = role === "esriRelRoleOrigin" ? "globalid" : "parentglobalid";
  return relationship;
}

export function getItemTemplateData (
  type?: string
): any {
  let data:any = {
    "error": {
      "code": 400,
      "messageCode": "CONT_0001",
      "message": "Item does not exist or is inaccessible.",
      "details": []
    }
  };

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
        "version": 24,
        "layout": {
          "rootElement": {
            "type": "stackLayoutElement",
            "orientation": "col",
            "elements": []
          }
        },
        "headerPanel": {
          "type": "headerPanel"
        },
        "leftPanel": {
          "type": "leftPanel",
          "title": "<p>left panel description</p>\n",
          "selectors": []
        },
        "widgets": [{
            "showNavigation": true,
            "events": [],
            "flashRepeats": 3,
            "itemId": "{{map1234567890.id}}",
            "mapTools": [{
              "type": "bookmarksTool"
            }],
            "type": "mapWidget",
            "showPopup": true,
            "layers": [{
              "type": "featureLayerDataSource",
              "layerId": "ROWPermitApplication_4605",
              "name": "ROW Permits"
            }],
            "id": "1200f3f1-8f72-4ea6-af16-14f19e9a4517",
            "name": "ROW Permit Map"
          },
          {
            "type": "indicatorWidget",
            "id": "3e796f16-722b-437f-89a4-e3787e105b24",
            "name": "ROW Permit Count"
          },
          {
            "type": "listWidget",
            "id": "0f994268-e553-4d11-b8d1-afecf0818841",
            "name": "ROW Permit List"
          },
          {
            "type": "serialChartWidget",
            "id": "ff698ea5-2812-4ba5-a0ba-d89fc302f8f4",
            "name": "Permit Type"
          },
          {
            "type": "serialChartWidget",
            "id": "d2e11f43-8d61-422c-b7fe-00dc8a9c2b14",
            "name": "Submission Date"
          }
        ],
        "settings": {
          "maxPaginationRecords": 50000
        },
        "theme": "light"
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
        "tables": [{
          "id": 1,
          "popupInfo": {}
        }],
        "layers": [{
          "id": 0,
          "popupInfo": {},
          "layerDefinition": {
            "defaultVisibility": true
          }
        }]
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
        "operationalLayers": [{
          "id": "ROWPermitApplication_4605",
          "layerType": "ArcGISFeatureLayer",
          "url": "{{svc1234567890.url}}/0",
          "title": "ROW Permits",
          "itemId": "{{svc1234567890.id}}",
          "popupInfo": {},
          "capabilities": "Query"
        }],
        "baseMap": {
          "baseMapLayers": [{
            "id": "World_Hillshade_3689",
            "layerType": "ArcGISTiledMapServiceLayer",
            "url": "http://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer",
            "title": "World Hillshade"
          }, {
            "id": "VectorTile_6451",
            "type": "VectorTileLayer",
            "layerType": "VectorTileLayer",
            "title": "World Topographic Map",
            "styleUrl": "https://www.arcgis.com/sharing/rest/content/items/" +
              "7dc6cea0b1764a1f9af2e679f642f0f5/resources/styles/root.json",
            "itemId": "7dc6cea0b1764a1f9af2e679f642f0f5"
          }],
          "title": "Topographic"
        },
        "spatialReference": {
          "wkid": 102100,
          "latestWkid": 3857
        },
        "tables": [{
          "url": "{{svc1234567890.url}}/1",
          "id": "ROWPermitApplication_4404",
          "title": "ROW Permit Comment",
          "layerDefinition": {},
          "itemId": "{{svc1234567890.id}}",
          "popupInfo": {}
        }]
      };
      break;

    case "Web Mapping Application":
      data = {
        "source": "tpl1234567890",
        "folderId": "{{folderId}}",
        "values": {
          "webmap": "{{map1234567890.id}}",
          "title": "A web mapping application",
          "titleIcon": "images/banner.png",
          "displayText": "<b>Welcome</p>",
          "featureLayer": {
            "id": "ROWPermitApplication_4605",
            "fields": [{
              "id": "sortField",
              "fields": ["submitdt"]
            }]
          },
          "showAllFeatures": "true",
          "customUrlLayer": {
            "id": "ROWPermitApplication_4605",
            "fields": [{
              "id": "urlField",
              "fields": ["OBJECTID"]
            }]
          },
          "customUrlParam": "id"
        }
      };
      break;

    case "Workforce Project":
      break;

    case "Unknown":
      data = {};
      break;
  }

  return data;
}

function getServiceTemplate (
  layers = [] as any,
  tables = [] as any
): any {
  const service:any = {
    "currentVersion": 10.61,
    "serviceItemId": "{{svc1234567890.id}}",
    "isView": true,
    "isUpdatableView": true,
    "sourceSchemaChangesAllowed": true,
    "serviceDescription": "",
    "hasVersionedData": false,
    "supportsDisconnectedEditing": false,
    "hasStaticData": false,
    "maxRecordCount": 1000,
    "supportedQueryFormats": "JSON",
    "supportsVCSProjection": false,
    "capabilities": "Create,Query,Editing",
    "description": "",
    "copyrightText": "",
    "spatialReference": {
      "wkid": 102100,
      "latestWkid": 3857
    },
    "initialExtent": {
      "xmin": -14999999.999989873,
      "ymin": 2699999.9999980442,
      "xmax": -6199999.9999958146,
      "ymax": 6499999.99999407,
      "spatialReference": {
        "wkid": 102100,
        "latestWkid": 3857
      }
    },
    "fullExtent": {
      "xmin": -14999999.999989873,
      "ymin": 2699999.9999980442,
      "xmax": -6199999.9999958146,
      "ymax": 6499999.99999407,
      "spatialReference": {
        "wkid": 102100,
        "latestWkid": 3857
      }
    },
    "allowGeometryUpdates": true,
    "units": "esriMeters",
    "supportsAppend": true,
    "syncEnabled": false,
    "supportsApplyEditsWithGlobalIds": true,
    "editorTrackingInfo": {
      "enableEditorTracking": true,
      "enableOwnershipAccessControl": false,
      "allowOthersToQuery": true,
      "allowOthersToUpdate": true,
      "allowOthersToDelete": true,
      "allowAnonymousToQuery": true,
      "allowAnonymousToUpdate": true,
      "allowAnonymousToDelete": true
    },
    "xssPreventionInfo": {
      "xssPreventionEnabled": true,
      "xssPreventionRule": "InputOnly",
      "xssInputRule": "rejectInvalid"
    },
    "layers": [],
    "tables": []
  };

  function addCondensedFormOfLayer (layersOrTables: any[], serviceLayerList: any[]) {
    layersOrTables.forEach(
      layer => {
        serviceLayerList.push({
          "id": layer.id,
          "name": layer.name,
          "parentLayerId": -1,
          "defaultVisibility": true,
          "subLayerIds": null,
          "minScale": 0,
          "maxScale": 0,
          "geometryType": "esriGeometryPoint"
        });
      }
    );
  }

  addCondensedFormOfLayer(layers, service.layers);
  addCondensedFormOfLayer(tables, service.tables);

  return service;
}

function getLayerOrTableTemplate (
  id: number,
  name: string,
  type: string,
  relationships = [] as any
): any {
  return {
    "currentVersion": 10.61,
    "id": id,
    "name": name,
    "type": type,
    "serviceItemId": "{{svc1234567890.id}}",
    "isView": true,
    "isUpdatableView": true,
    "sourceSchemaChangesAllowed": true,
    "displayField": "appname",
    "description": "PermitApplication",
    "copyrightText": "",
    "defaultVisibility": true,
    "editFieldsInfo": {
      "creationDateField": "CreationDate",
      "creatorField": "Creator",
      "editDateField": "EditDate",
      "editorField": "Editor"
    },
    "editingInfo": {
      "lastEditDate": 1538579807130
    },
    "relationships": relationships,
    "geometryType": "esriGeometryPoint",
    "minScale": 0,
    "maxScale": 0,
    "extent": {
      "xmin": -14999999.999989873,
      "ymin": -13315943.826968452,
      "xmax": 1604565.8194646926,
      "ymax": 6499999.99999407,
      "spatialReference": {
        "wkid": 102100,
        "latestWkid": 3857
      }
    },
    "allowGeometryUpdates": true,
    "hasAttachments": true,
    "viewSourceHasAttachments": false,
    "attachmentProperties": [{
      "name": "name",
      "isEnabled": true
    }, {
      "name": "size",
      "isEnabled": true
    }, {
      "name": "contentType",
      "isEnabled": true
    }, {
      "name": "keywords",
      "isEnabled": true
    }],
    "objectIdField": "OBJECTID",
    "uniqueIdField": {
      "name": "OBJECTID",
      "isSystemMaintained": true
    },
    "globalIdField": "globalid",
    "capabilities": "Create,Query,Editing",
    "viewDefinitionQuery": "status = 'BoardReview'",
    "definitionQuery": "status = 'BoardReview'"
  };
}

function getItemTemplateFundamentals (
  type: string,
  typePrefix: string,
  dependencies = [] as string[],
  url = ""
): any {
  return {
    "itemId": typePrefix + "1234567890",
    "type": type,
    "key": "i1a2b3c4",
    "item": {
      "id": "{{" + typePrefix + "1234567890.id}}",
      "item": "{{" + typePrefix + "1234567890.id}}",
      "name": "Name of an AGOL item",
      "title": "An AGOL item",
      "type": type,
      "typeKeywords": ["JavaScript"],
      "description": "Description of an AGOL item",
      "tags": ["test"],
      "snippet": "Snippet of an AGOL item",
      "thumbnail": "thumbnail/ago_downloaded.png",
      "documentation": null,
      "extent": "{{initiative.extent:optional}}",
      "categories": [],
      "spatialReference": null,
      "accessInformation": "Esri, Inc.",
      "licenseInfo": null,
      "culture": "en-us",
      "properties": null,
      "url": url,
      "proxyFilter": null,
      "access": "public",
      "appCategories": [],
      "industries": [],
      "languages": [],
      "largeThumbnail": null,
      "banner": null,
      "screenshots": [],
      "listed": false,
      "commentsEnabled": false,
      "groupDesignations": null
    },
    "dependencies": dependencies
  };
}

export function removeEditFieldsInfoField (
  layerOrTable: any
): any {
  layerOrTable.editFieldsInfo = null;
  return layerOrTable;
}

