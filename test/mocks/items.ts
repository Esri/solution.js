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

// -- Exports -------------------------------------------------------------------------------------------------------//

export function getAGOLItem (
  type?: string,
  url = ""
): any {
  let item:any = {
    "name":  "",
    "message": "400: Item or group does not exist or is inaccessible: fail1234567890",
    "originalMessage": "",
    "code": 400,
    "response": {
      "error": {
        "code": 400,
        "message": "Item or group does not exist or is inaccessible: fail1234567890",
        "details": [
          "Item or group does not exist or is inaccessible: fail1234567890"
        ]
      }
    },
    "url": "",
    "options": null
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
      item = getAGOLItemFundamentals(type, "dsh",
        url || "https://arcgis.com/apps/opsdashboard/index.html#/");
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
      item = getAGOLItemFundamentals(type, "svc", url ||
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer");
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
      item = getAGOLItemFundamentals(type, "map",
        url || "https://arcgis.com/home/webmap/viewer.html?webmap=");
      break;

    case "Web Mapping Application":
      item = getAGOLItemFundamentals(type, "wma",
        url || "https://arcgis.com/apps/CrowdsourcePolling/index.html?appid=");
      break;

    case "Workforce Project":
      break;

  }

  return item;
}

export function getTrimmedAGOLItem (
): any {
  const item = getAGOLItemFundamentals("Web Mapping Application", "wma",
    "http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc599252a7835eea21");
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

export function getNoNameFeatureServiceItem (
): any {
  const item = getAGOLItem("Feature Service");
  item.name = null;
  return item;
}

export function getAGOLItemData (
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
            "itemId": "map1234567890",
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
          "url": "https://services123.arcgis.com/org1234567890/arcgis/rest/services/" +
            "ROWPermits_publiccomment/FeatureServer/0",
          "title": "ROW Permits",
          "itemId": "svc1234567890",
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
          "url": "https://services123.arcgis.com/org1234567890/arcgis/rest/services/" +
            "ROWPermits_publiccomment/FeatureServer/1",
          "id": "ROWPermitApplication_4404",
          "title": "ROW Permit Comment",
          "layerDefinition": {},
          "itemId": "svc1234567890",
          "popupInfo": {}
        }]
      };
      break;

    case "Web Mapping Application":
      data = {
        "source": "tpl1234567890",
        "folderId": "fld1234567890",
        "values": {
          "webmap": "map1234567890",
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

  }

  return data;
}

export function getAGOLItemResources (
  testCase?: string,
): any {
  let resources:any = {
    "error": {
      "code": 400,
      "messageCode": "CONT_0001",
      "message": "Item does not exist or is inaccessible.",
      "details": []
    }
  };

  // Supported item types
  switch (testCase) {

    case "none":
      resources = {
        "total": 0,
        "start": 1,
        "num": 0,
        "nextStart": -1,
        "resources": []
      };
      break;

    case "one text":
      resources = {
        "total": 1,
        "start": 1,
        "num": 1,
        "nextStart": -1,
        "resources": [{
          "value": "abc"
        }]
      };
      break;

  }

  return resources;
}

export function getAGOLGroup (
): any {
  return {
    "id": "grp1234567890",
    "title": "An AGOL group",
    "isInvitationOnly": true,
    "owner": "LocalGovTryItLive",
    "description": "Description of an AGOL group",
    "snippet": "Snippet of an AGOL group",
    "typeKeywords": ["JavaScript"],
    "phone": null,
    "sortField": "title",
    "sortOrder": "asc",
    "isViewOnly": true,
    "thumbnail": "ROWPermitManager.png",
    "created": 1520967981000,
    "modified": 1523544543000,
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
  };
}

export function getAGOLGroupContentsList (
  numToPutIntoGroup: number
): any {
  const group = {
    "total": 0,
    "start": 1,
    "num": 0,
    "nextStart": -1,
    "items": [] as string[]
  };
  while (group.items.length < numToPutIntoGroup) {
    group.items.push("itm" + group.items.length);
  }
  return group;
}

// -- Internals ------------------------------------------------------------------------------------------------------//

function getAGOLItemFundamentals (
  type: string,
  typePrefix: string,
  url = ""
): any {
  return {
    "id": typePrefix + "1234567890",
    "item": typePrefix + "1234567890",
    "owner": "LocalGovTryItLive",
    "orgId": "org1234567890",
    "created": 1520968147000,
    "modified": 1522178539000,
    "guid": null,
    "name": "Name of an AGOL item",
    "title": "An AGOL item",
    "type": type,
    "typeKeywords": ["JavaScript"],
    "description": "Description of an AGOL item",
    "tags": ["test"],
    "snippet": "Snippet of an AGOL item",
    "thumbnail": "thumbnail/ago_downloaded.png",
    "documentation": null,
    "extent": [],
    "categories": [],
    "lastModified": -1,
    "spatialReference": null,
    "accessInformation": "Esri, Inc.",
    "licenseInfo": null,
    "culture": "en-us",
    "properties": null,
    "url": url,
    "proxyFilter": null,
    "access": "public",
    "size": 1627,
    "appCategories": [],
    "industries": [],
    "languages": [],
    "largeThumbnail": null,
    "banner": null,
    "screenshots": [],
    "listed": false,
    "commentsEnabled": false,
    "numComments": 0,
    "numRatings": 0,
    "avgRating": 0,
    "numViews": 690,
    "scoreCompleteness": 78,
    "groupDesignations": null
  };
}
