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

//-- Exports ---------------------------------------------------------------------------------------------------------//

export function getService (
  layers = [] as any,
  tables = [] as any
): any {
  let service:any = {
    "currentVersion": 10.61,
    "serviceItemId": "svc1234567890",
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

  function addCondensedFormOfLayer (layers: any[], serviceLayerList: any[]) {
    layers.forEach(
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

export function getLayerOrTable (
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
    "serviceItemId": "svc1234567890",
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

export function removeNameField (
  layerOrTable: any
): any {
  layerOrTable.name = null;
  return layerOrTable;
}

export function removeEditFieldsInfoField (
  layerOrTable: any
): any {
  layerOrTable.editFieldsInfo = null;
  return layerOrTable;
}

export function getRelationship (
  id: number,
  relatedTableId: number,
  role: string
): any {
  let relationship:any = {
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

