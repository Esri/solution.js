/* Copyright (c) 2018 Esri
 * Apache-2.0 */

import { IItem } from "@esri/arcgis-rest-common-types";

export const WebMapItemSuccessResponse: IItem = {
  "id": "abc123",
  "owner": "LocalGovTryItLive",
  "created": 1520968139000,
  "modified": 1522178539000,
  "title": "ROW Permit Public Comment",
  "type": "Web Map",
  "typeKeywords": ["ArcGIS Online", "Collector", "Data Editing", "Explorer Web Map", "Map", "Online Map", "source-6e120a158f9445b29d047d6164578df7", "Web Map"],
  "description": "A map used in the ROW Permit Public Comment application to review right of way permit applications and submit feedback.",
  "tags": ["ROW", "Public Works", "Local Government", "ArcGIS for Local Government", "Permit", "Right of Way"],
  "snippet": "A map used in the ROW Permit Public Comment application to review right of way permit applications and submit feedback.",
  "thumbnail": "thumbnail/ago_downloaded.png",
  "documentation": null,
  "extent": [
    [-88.1975, 41.7443],
    [-88.0903, 41.8043]
  ],
  "categories": [],
  "spatialReference": null,
  "culture": "en-us",
  "properties": null,
  "url": null,
  "protected": false
};

export const WebMapItemDataSuccessResponse: any = {
  "operationalLayers": [{
    "id": "ROWPermitApplication_4605",
    "layerType": "ArcGISFeatureLayer",
    "url": "https://services123.arcgis.com/myOrg123/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0",
    "visibility": true,
    "opacity": 1,
    "title": "ROW Permits",
    "itemId": "dbca451a5e1546998137bb0a09d94240",
    "popupInfo": {
      "title": "{appname} - {type}",
      "fieldInfos": [{
        "fieldName": "OBJECTID",
        "label": "OBJECTID",
        "isEditable": false,
        "visible": false
      }, {
        "fieldName": "globalid",
        "label": "GlobalID",
        "isEditable": false,
        "visible": false
      }, {
        "fieldName": "appname",
        "label": "Applicant Name",
        "isEditable": true,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "appaddr",
        "label": "Applicant Address",
        "isEditable": true,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "appcity",
        "label": "Applicant City",
        "isEditable": true,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "appstate",
        "label": "Applicant State",
        "isEditable": true,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "appzip",
        "label": "Applicant Zip",
        "isEditable": true,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "sameapp",
        "label": "Contractor Same as Applicant",
        "isEditable": true,
        "tooltip": "",
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "contname",
        "label": "Contractor Name",
        "isEditable": true,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "contaddr",
        "label": "Contractor Address",
        "isEditable": true,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "contcity",
        "label": "Contractor City",
        "isEditable": true,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "contstate",
        "label": "Contractor State",
        "isEditable": true,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "contzip",
        "label": "Contractor Zip",
        "isEditable": true,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "type",
        "label": "Permit Type",
        "isEditable": true,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "subtype",
        "label": "Permit Subtype",
        "isEditable": true,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "subtypeother",
        "label": "Permit Subtype Other",
        "isEditable": true,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "description",
        "label": "Description of Work",
        "isEditable": true,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "propstartdt",
        "label": "Proposed Start Date",
        "isEditable": true,
        "visible": true,
        "format": {
          "dateFormat": "shortDate",
          "timezone": "utc"
        }
      }, {
        "fieldName": "propenddt",
        "label": "Proposed Completion Date",
        "isEditable": true,
        "visible": true,
        "format": {
          "dateFormat": "shortDate",
          "timezone": "utc"
        }
      }, {
        "fieldName": "laneclosure",
        "label": "Lane Closure Required",
        "isEditable": true,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "status",
        "label": "Status",
        "isEditable": true,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "submitdt",
        "label": "Submission Date",
        "isEditable": true,
        "visible": true,
        "format": {
          "dateFormat": "shortDate",
          "timezone": "utc"
        }
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/globalid",
        "label": "GlobalID",
        "isEditable": false,
        "visible": false
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/name",
        "label": "Name",
        "isEditable": false,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/address",
        "label": "Address",
        "isEditable": false,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/organization",
        "label": "Organization",
        "isEditable": false,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/comments",
        "label": "Comments",
        "isEditable": false,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/instructions",
        "label": "Any Instructions",
        "isEditable": false,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/actiontaken",
        "label": "Action Taken",
        "isEditable": false,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/publicview",
        "label": "Public View",
        "isEditable": false,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/submitdate",
        "label": "Submission Date",
        "isEditable": false,
        "visible": true,
        "format": {
          "dateFormat": "shortDateShortTime",
          "timezone": "utc"
        }
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/parentglobalid",
        "label": "ParentGlobalID",
        "isEditable": false,
        "visible": true
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/OBJECTID",
        "label": "OBJECTID",
        "isEditable": false,
        "visible": false
      }, {
        "fieldName": "project",
        "label": "Project",
        "isEditable": true,
        "visible": false,
        "stringFieldOption": "textbox"
      }],
      "description": "<font face='Avenir-Light'><span style='font-weight: bold;'>Action Requested:<\/span> {description}<br /><br />\n<span style='font-weight: bold;'>Permit Subtypes:<\/span> {subtype}<br /> <br />\n<span style='font-weight: bold;'>Requested Dates:<\/span> {propstartdt} - {propenddt}<br /> <br />\n<span style='font-weight: bold;'>Lane Closure Required?<\/span> {laneclosure}<br /><br />\n<table style=' border-collapse: separate; border-spacing: 0px 0px; width: 100%; table-layout: fixed;'>\n  <tbody><tr>\n    <td style='text-align: left; vertical-align: top; width: 50%; font-weight: normal; padding: 0px 2px 0px 0px; word-wrap: break-word;'><span style='font-weight: bold;'>Applicant<\/span><br />{appname}<br />{appaddr}<br />{appcity}, {appstate} {appzip}<br /><\/td>\n    <td style='text-align: left; vertical-align: top; width: 50%; font-weight: normal; padding: 0px 0px 0px 2px; word-wrap: break-word;'><span style='font-weight: bold;'>Contractor<\/span><br /><span style='white-space: pre-line;'>{expression/expr1}<\/span><\/td>\n  <\/tr>\n<\/tbody><\/table><\/font>",
      "showAttachments": false,
      "relatedRecordsInfo": {
        "showRelatedRecords": false
      },
      "expressionInfos": [{
        "name": "expr1",
        "title": "Contractor Information",
        "expression": "if ($feature.contname == \"\"  || $feature.contname == null) {\r\n    return \"No contractor provided\";\r\n}\r\nif ($feature.sameapp == \"Yes\") {\r\n    return \"Same as applicant\";\r\n}\r\nvar contractor_info = [$feature.contname, $feature.contaddr, $feature.contcity + \", \" + $feature.contstate + \" \" + $feature.contzip];\r\nreturn Concatenate(contractor_info, \"\\r\\n\");",
        "returnType": "string"
      }],
      "mediaInfos": []
    },
    "capabilities": "Query"
  }],
  "baseMap": {
    "baseMapLayers": [{
      "id": "World_Hillshade_3689",
      "layerType": "ArcGISTiledMapServiceLayer",
      "url": "http://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer",
      "visibility": true,
      "opacity": 1,
      "title": "World Hillshade"
    }, {
      "id": "VectorTile_6451",
      "type": "VectorTileLayer",
      "layerType": "VectorTileLayer",
      "title": "World Topographic Map",
      "styleUrl": "https://www.arcgis.com/sharing/rest/content/items/7dc6cea0b1764a1f9af2e679f642f0f5/resources/styles/root.json",
      "itemId": "7dc6cea0b1764a1f9af2e679f642f0f5",
      "visibility": true,
      "opacity": 1
    }],
    "title": "Topographic"
  },
  "spatialReference": {
    "wkid": 102100,
    "latestWkid": 3857
  },
  "authoringApp": "WebMapViewer",
  "authoringAppVersion": "5.4",
  "version": "2.11",
  "tables": [{
    "url": "https://services123.arcgis.com/myOrg123/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/1",
    "id": "ROWPermitApplication_4404",
    "title": "ROW Permit Comment",
    "layerDefinition": {},
    "itemId": "dbca451a5e1546998137bb0a09d94240",
    "popupInfo": {
      "title": "{name}",
      "fieldInfos": [{
        "fieldName": "globalid",
        "label": "GlobalID",
        "isEditable": false,
        "visible": false
      }, {
        "fieldName": "name",
        "label": "Name",
        "isEditable": true,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "address",
        "label": "Address",
        "isEditable": true,
        "visible": true,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "organization",
        "label": "Organization",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "comments",
        "label": "Comments",
        "isEditable": true,
        "visible": true,
        "stringFieldOption": "textarea"
      }, {
        "fieldName": "instructions",
        "label": "Any Instructions",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textarea"
      }, {
        "fieldName": "actiontaken",
        "label": "Action Taken",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "publicview",
        "label": "Public View",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "fieldName": "submitdate",
        "label": "Submission Date",
        "isEditable": true,
        "visible": true,
        "format": {
          "dateFormat": "shortDate",
          "timezone": "utc"
        }
      }, {
        "fieldName": "parentglobalid",
        "label": "ParentGlobalID",
        "isEditable": false,
        "visible": false
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/globalid",
        "label": "GlobalID",
        "isEditable": false,
        "visible": false
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/appname",
        "label": "Applicant Name",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/appaddr",
        "label": "Applicant Address",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/appcity",
        "label": "Applicant City",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/appstate",
        "label": "Applicant State",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/appzip",
        "label": "Applicant Zip",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/sameapp",
        "label": "Contractor Same as Applicant",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/contname",
        "label": "Contractor Name",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/contaddr",
        "label": "Contractor Address",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/contcity",
        "label": "Contractor City",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/contstate",
        "label": "Contractor State",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/contzip",
        "label": "Contractor Zip",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/type",
        "label": "Permit Type",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/subtype",
        "label": "Permit Subtype",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/subtypeother",
        "label": "Permit Subtype Other",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/description",
        "label": "Description of Work",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/laneclosure",
        "label": "Lane Closure Required",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/submitdt",
        "label": "Submission Date",
        "isEditable": false,
        "visible": false,
        "format": {
          "dateFormat": "shortDateShortTime",
          "timezone": "utc"
        }
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/status",
        "label": "Status",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox"
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/propenddt",
        "label": "Proposed Completion Date",
        "isEditable": false,
        "visible": false,
        "format": {
          "dateFormat": "shortDateShortTime",
          "timezone": "utc"
        }
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/propstartdt",
        "label": "Proposed Start Date",
        "isEditable": false,
        "visible": false,
        "format": {
          "dateFormat": "shortDateShortTime",
          "timezone": "utc"
        }
      }, {
        "statisticType": "count",
        "fieldName": "relationships/0/OBJECTID",
        "label": "OBJECTID",
        "isEditable": false,
        "visible": false
      }, {
        "fieldName": "OBJECTID",
        "label": "OBJECTID",
        "isEditable": false,
        "visible": false
      }, {
        "fieldName": "relationships/0/project",
        "label": "Project",
        "isEditable": false,
        "visible": false,
        "stringFieldOption": "textbox",
        "statisticType": "count"
      }],
      "description": null,
      "showAttachments": true,
      "relatedRecordsInfo": {
        "showRelatedRecords": true
      },
      "mediaInfos": []
    }
  }],
  "applicationProperties": {
    "viewing": {
      "routing": {
        "enabled": false
      },
      "basemapGallery": {
        "enabled": false
      },
      "measure": {
        "enabled": false
      },
      "search": {
        "enabled": true,
        "disablePlaceFinder": false,
        "hintText": "Place or Address",
        "layers": []
      }
    }
  }
};
