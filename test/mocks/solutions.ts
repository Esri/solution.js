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

export const SolutionWMA: any = {
  "wma1234567890": {
    "type": 'Web Mapping Application',
    "item": {
      "id": "wma1234567890",
      "item": "wma1234567890",
      "name": null,
      "title": "ROW Permit Public Comment",
      "type": "Web Mapping Application",
      "typeKeywords": ["JavaScript", "Map", "Mapping Site", "Online Map", "source-049f861ad61b4d2992de47e2d0375097", "Web Map"],
      "description": "ROW Permit Public Comment is a configuration of the Crowdsource Polling application that can be used by the general public and interested parties to review permit applications and comment on proposed construction activity.<br /><br /><a href='http://links.esri.com/localgovernment/help/ROWPermitPublicComment/' target='_blank'>Learn more<\/a>",
      "tags": ["ROW", "Public Works", "Local Government", "ArcGIS for Local Government", "Permit", "Right of Way"],
      "snippet": "ROW Permit Public Comment is a configuration of the Crowdsource Polling application that can be used by the general public and interested parties to review permit applications and comment on proposed construction activity.",
      "thumbnail": "thumbnail/ago_downloaded.png",
      "documentation": null,
      "extent": [],
      "categories": [],
      "spatialReference": null,
      "accessInformation": "Esri., Inc.",
      "licenseInfo": null,
      "culture": "en-us",
      "properties": null,
      "url": "https://arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc5992522d34f26b2210d17835eea21",
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
    "dependencies": ['map1234567890'],
    "data": {
      "source": "template1234567890",
      "folderId": "folder1234567890",
      "values": {
        "webmap": "map1234567890",
        "title": "ROW Permit Public Comment",
        "titleIcon": "images/banner.png",
        "displayText": "<b>Welcome to ROW Permit Public Comment</b><p>ROW Permit Public Comment can be used by the general public and interested parties to review permit applications and comment on proposed construction activity.</p><p>Search for a location or click an item in the list to get started.</p>",
        "featureLayer": {
          "id": "ROWPermitApplication_4605",
          "fields": [{
            "id": "sortField",
            "fields": ["submitdt"]
          }]
        },
        "ascendingSortOrder": "false",
        "showListViewFirst": "true",
        "showAllFeatures": "true",
        "commentNameField": "",
        "allowFacebook": false,
        "facebookAppId": "",
        "allowGoogle": false,
        "googleplusClientId": "",
        "allowTwitter": false,
        "socialMediaDisclaimer": "Choose how you would like to sign in to this application. The name associated with your social media account will be added to any comments you post.",
        "showDisplayTextAsSplashScreen": false,
        "customUrlLayer": {
          "id": "ROWPermitApplication_4605",
          "fields": [{
            "id": "urlField",
            "fields": ["OBJECTID"]
          }]
        },
        "customUrlParam": "id",
        "color": "#004575",
        "headerBackgroundColor": "#ffffff",
        "bodyTextColor": "#474747",
        "bodyBackgroundColor": "#ffffff",
        "buttonTextColor": "#ffffff",
        "buttonBackgroundColor": "#004575",
        "commentPeriod": "Open",
        "commentPeriodDialogTitle": "Comment period closed",
        "commentPeriodDialogContent": "We are no longer accepting comments for this project.",
        "submitMessage": "Thank you. Your comment has been submitted."
      }
    },
    "resources": null
  },
  "map1234567890": {
    "type": 'Web Map',
    "item": {
      "id": "map1234567890",
      "item": "map1234567890",
      "name": null,
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
      "accessInformation": "Esri., Inc.",
      "licenseInfo": null,
      "culture": "en-us",
      "properties": null,
      "url": null,
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
    "dependencies": ['svc1234567890'],
    "data": {
      "operationalLayers": [{
        "id": "ROWPermitApplication_4605",
        "layerType": "ArcGISFeatureLayer",
        "url": "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0",
        "visibility": true,
        "opacity": 1,
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
        "url": "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/1",
        "id": "ROWPermitApplication_4404",
        "title": "ROW Permit Comment",
        "layerDefinition": {},
        "itemId": "svc1234567890",
        "popupInfo": {}
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
    },
    "resources": null
  },
  "svc1234567890": {
    "type": 'Feature Service',
    "item": {
      "id": "svc1234567890",
      "item": "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer",
      "name": "ROWPermits_publiccomment",
      "title": "ROWPermits_publiccomment",
      "type": "Feature Service",
      "typeKeywords": ["ArcGIS Server", "Data", "Feature Access", "Feature Service", "Multilayer", "Service", "source-14ffc9672de84fc6aea443854fa551b8", "Hosted Service", "View Service"],
      "description": "A public feature layer view used in the ROW Permit Public Comment application to review right of way permit applications and submit feedback.",
      "tags": ["ROW", "Public Works", "Local Government", "ArcGIS for Local Government", "Permit", "Right of Way"],
      "snippet": "A public feature layer view used in the ROW Permit Public Comment application to review right of way permit applications and submit feedback.",
      "thumbnail": "thumbnail/ago_downloaded.png",
      "documentation": null,
      "extent": [
        [-134.74729261783727, 23.560962423754177],
        [-55.69554761537273, 50.309217030255674]
      ],
      "categories": [],
      "spatialReference": null,
      "accessInformation": "Esri., Inc.",
      "licenseInfo": null,
      "culture": "en-us",
      "properties": null,
      "url": "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer",
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
    "dependencies": [],
    "data": {
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
    },
    "resources": null,
    service: {
      "name": "ROWPermits_publiccomment",
      "snippet": "A public feature layer view used in the ROW Permit Public Comment application to review right of way permit applications and submit feedback.",
      "description": "A public feature layer view used in the ROW Permit Public Comment application to review right of way permit applications and submit feedback.",
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
      "layers": [{
        "id": 0,
        "name": "ROW Permits",
        "parentLayerId": -1,
        "defaultVisibility": true,
        "subLayerIds": null,
        "minScale": 0,
        "maxScale": 0,
        "geometryType": "esriGeometryPoint"
      }],
      "tables": [{
        "id": 1,
        "name": "ROW Permit Comment",
        "parentLayerId": -1,
        "defaultVisibility": true,
        "subLayerIds": null,
        "minScale": 0,
        "maxScale": 0
      }]
    },
    layers: [{
      "currentVersion": 10.61,
      "id": 0,
      "name": "ROW Permits",
      "type": "Feature Layer",
      "serviceItemId": "svc1234567890",
      "isView": true,
      "isUpdatableView": true,
      "sourceSchemaChangesAllowed": true,
      "displayField": "appname",
      "description": "PermitApplication",
      "copyrightText": "",
      "defaultVisibility": true,
      "editFieldsInfo": null,
      "editingInfo": {
        "lastEditDate": 1538579807130
      },
      "relationships": [{
        "id": 0,
        "name": "",
        "relatedTableId": 1,
        "cardinality": "esriRelCardinalityOneToMany",
        "role": "esriRelRoleOrigin",
        "keyField": "globalid",
        "composite": true
      }],
      "isDataVersioned": false,
      "supportsAppend": true,
      "supportsCalculate": true,
      "supportsTruncate": false,
      "supportsAttachmentsByUploadId": true,
      "supportsAttachmentsResizing": true,
      "supportsRollbackOnFailureParameter": true,
      "supportsStatistics": true,
      "supportsAdvancedQueries": true,
      "supportsValidateSql": true,
      "supportsCoordinatesQuantization": true,
      "supportsQuantizationEditMode": true,
      "supportsApplyEditsWithGlobalIds": true,
      "advancedQueryCapabilities": {
        "supportsPagination": true,
        "supportsPaginationOnAggregatedQueries": true,
        "supportsQueryRelatedPagination": true,
        "supportsQueryWithDistance": true,
        "supportsReturningQueryExtent": true,
        "supportsStatistics": true,
        "supportsOrderBy": true,
        "supportsDistinct": true,
        "supportsQueryWithResultType": true,
        "supportsSqlExpression": true,
        "supportsAdvancedQueryRelated": true,
        "supportsCountDistinct": true,
        "supportsQueryAttachments": true,
        "supportsLod": true,
        "supportsReturningGeometryCentroid": false,
        "supportsQueryWithDatumTransformation": true,
        "supportsHavingClause": true,
        "supportsOutFieldSQLExpression": true,
        "supportsMaxRecordCountFactor": true,
        "supportsTopFeaturesQuery": true
      },
      "useStandardizedQueries": true,
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
      "drawingInfo": {
        "renderer": {
          "type": "uniqueValue",
          "field1": "status",
          "uniqueValueInfos": [{
            "symbol": {
              "type": "esriPMS",
              "url": "dcb8875a-42e4-461d-9843-b739a1f56040",
              "imageData": "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAtxJREFUSIm1lr1LG3EYxz8kd6lJjIl40hgRS5dsgZLFpdBNhESKDnXrIMTBTlksiq2itjjUSQf9CzJJIWI7dGk7NMtRcHMRQQwKF2hIvTRectfhPF/uJYZCn+3gd8/n+T7f5/ndCfznEDo4IxbypKNhUhgkGhqiDuVwgNLoCvI/AzanGU5IZAQfOSlCSvSDKIDgh2YLqioU51EiXew+e8MrQOsYsL9AtqmzOhAj1ReB0APnmXgMtBZSpUauOM/EZYPJyQ98uxfw8TUvwl0U4jGIhtpoB0S/CeoJIh2d8/X7GjNPF9jxBOwvkA13UXj8ELofZRGldHuCBTopkhRkDk/ZLuQ5mNqg5ABsTjPc1FmNx8zKRClN+MlbGid7NBWnl4GhzJ0CNEUmOQj1Y4pAvwOQkMgMxEjZ29JUZH7/XHIAusGhUPRDPIq0O8fsxDpbtwGi4CPXF3HKDwxl6HZpi+DRvngvnFVZgluAQp60FCHlNi2ilO7YC0tFTxCpkGdkaoOSABANm3PuFpYH9p63i1AABvtIwRUAg4TosXKWB24991QhgFIjAVctamiIgocCywOvnruF4DdzXgN0KDdbHtXYPHAbW8323GxB6AHla0A4QKmqmltpD7sHTUVGU+Q7UL1evvNOVQXDMJdNABhdQf68iKK1kOxmu3lgLaFVvXp4czuoDaiqHIy/N2/aa2sNnd1KjZxdRTsPNEXm15dxdPVGQaUGos/lqhhbY6Y4z0RPEOn2PnjtgVtytQFKDXlsjbwDAHDxh+zROT+Sg9A4KTqSWon1ehn1cMeR/KQChsEycOEKmNqg9GmRmcNTtpPIjunwCiv58TlTLze5U5ljvcZW2CnkOagfU4xHkeK95vp7Ja7UzLYYBsv25K4ASwnQvzvH7FmVpZ4gUijg/GRWVQ50nb3n67zjVlvuBVhxdeVuFfKMRMOk6peIPkhYH31rFNtFJ38VlqLSvQdd4i/JvicwsP6X/QAAAABJRU5ErkJggg==",
              "contentType": "image/png",
              "width": 18,
              "height": 18,
              "angle": 0,
              "xoffset": 0,
              "yoffset": 0
            },
            "value": "Submitted",
            "label": "Submitted"
          }, {
            "symbol": {
              "type": "esriPMS",
              "url": "18a7f922-a5d6-4265-9a42-4ebd15ce52ac",
              "imageData": "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAxVJREFUSIm1lb1OG0EQx/+392H2DLGQTOMGzAM4IqRArk7YgIyBAorkCaAgVZ4AJJQmShOJAp6AIkEJjgkyNjI0ceNA3JvDDRUIHAfw2veRAp8xvuUjiTLd6WbnNzP/nVkJ/9mkR/jIWlQbVFQaAuyAaZoybByLgpBLJVP5vwaEh8O9tMM7AUJmOzyeECEERCQQiADbslFjNUTiYyeyLK1vfUq+AlB/NGB0IjZpwlpSKQ15qAeS5HajKoVlWX5WZbOR+Ni0bddndjZ39h4ERGKjL0RZXOv0dkJRlPuqByEEVKWQFdlfKVd24zNTc8mPG6t3AkYnYpOiLK51+brwfGAQ/X3BewGO5Q/2UdSLKJ+VV7SoVsimszkXIDwc7jVhLXV6O0EIQX9fEDNT0/j+Yx96SXcFffZ0AMHemwT0kg5ftw+nhpkA0OMC0A7vhEppqL0teknHh8/r3MxbAcB1y1SV+iPjI/OZze3lVoAMQmY91MPN9DHBm4l6KS4vrxYA3AC0qDbY4fGEeLcl2Bu8MxjPCCFQFNmvRbWhbDqbkwBAUWmIEMI94GjQ3vP7TJIkeH1PQgByjZTtABH5gFYNHgsgIgFj1QDQaJFpmrJABK6zo8GftEkgAkzTlJsA2Di2LZvr3K4B79oeHt3+ti0bkiQfNwGiIORqrAaqUhegXQO9pOPwSL81hGfn57fO1FgNtmHkmoBUMpUfmYydWJblbxebp4EzhM7/zO5O098wDNTq9UKmsWmb99KGvc6qbLa9ivs00Es63r5/d6sCdsUgCIJ7VaQTW3OR+Ni0rMj+1nm4aw54wQ3DQJWxfDqx9doFAACTsclKufLN1+1D/mDfFRS4FvTs/ByZ3R1X8IvKBQQLiwAuuIBsOpsbnYrNlc/KK0UUuUuOZ07wi5+/Xu5lsonWf67dkNr4uqpFtcKpYSZUlfqpl+KuKTcMA+yKocpYXrCw2B6cC3AqAdATGR+Zv7y8WlAaurQ/mbV6vQDb+pJJbr9pbcuDAMcaK3dZi2pDikpDpmHIEBBwHv3Mvzz6nIpyDzpy7Dej6WVVLLdqyAAAAABJRU5ErkJggg==",
              "contentType": "image/png",
              "width": 18,
              "height": 18,
              "angle": 0,
              "xoffset": 0,
              "yoffset": 0
            },
            "value": "StaffReview",
            "label": "Staff Review"
          }, {
            "symbol": {
              "type": "esriPMS",
              "url": "cee93f85-09c8-42aa-b66e-ebaf7b427468",
              "imageData": "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAvdJREFUSIm1lj9r20AYxh/nZOsPCM72hUBMKPkChtClH6JZ2qHdDcnQTgcCgTK4uCoJIZrSof0EnbqkW6Z2qRdnyOTNIHDAQQKD0gNbnNWhlmtbsmMKfTdJr97fvc9zr04K/nMoG+QUOedPdV2vFwqF3TiOi5PJ5E7TtHar1er8M6DRaDypVCrPCSFHpmnWCSFQFAWEEEgpIYSAbduBpmlfm83mWwDxxgDHcQ6llO8ppXXTNKGqaiaHUgopJYui6Mi27RdxHL+8uLj48SjAsqxXqqp+oZTCMIx13YMQAkopdF1ng8Hgu+u6x47jfF4JcBznUFXVLzs7O9jf3wdjbC0gDd/3oSgK+v3+J875red57Qyg0Wg8mcoCQggYYzg4OIDv+wjDMFN0b29vYQFBEKBWq6HX610B2M4AKpXKc0ppfVmWMAxxc3OTu/LlDqeSMcuy3pyfn3+cBxSnuyV3pXlRrVZz75fLZQyHwyaAvwDO+VPTNOt5u4UxtrEXaReGYTDO+TPP89oKAOi6XieE5L6QerCs+boolUqoVqt1AH8AhUJhV1HyZ27eg00BiqLg4eFhF5hKFMdxcVUHqQerNM8LQgjiOC7OAJPJ5E5KmZu87EHetg2CYOFaSglVVe9mAE3T2kIIUEozgGUPwjBEEAQLUCHEwjtCCCRJ0p4BWq1W5+TkJJBSsmWp8jxIhzBdfbfbneWPRiMIIW5PT087MwAAJEnyNYqio+Uu1nkQBAGur68XOoiiCISQ7KfCdd1j27Zf6LrO5udh1RzkFR+NRoiiqOO6Ls8AAGA8Hh8OBoOftVoNvu9niqaFhRDodruZ4lPz3wH4lQvwPK/tOM5xv9//lBbbJNLi9/f3ry8vL6/mn2Wmy3Xdz5zz216vd0UpZeVyGatmZCoJoijqAHi3XDwXkHYCYNuyrDfD4bBpGAYrlUqZI1MIcZskybezs7MPmJPlUUAa00/uR875M13X6+PxuLi1tbWbHvrpVlwXm/xVpB21H03Mid9YxGhCaPhLywAAAABJRU5ErkJggg==",
              "contentType": "image/png",
              "width": 18,
              "height": 18,
              "angle": 0,
              "xoffset": 0,
              "yoffset": 0
            },
            "value": "BoardReview",
            "label": "Board Review"
          }, {
            "symbol": {
              "type": "esriPMS",
              "url": "ddaa254b-47a6-4e18-a1a2-d7de3f087308",
              "imageData": "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAyFJREFUSIm1lr1rE2Ecx7+9l1zikxypvSs2Uh2KIAi3uHRyFuktKa0FEUKwiS+lg4NzheIfENSaWCSiQmu1SwRnHTRLO5R2sThoaAOxaVLimUtyLw7txeTukkbB33Y8v+f7eX5vz3MM/rMxPfiwkYR8kfMTqc9ESKtrrGGau9wJKrsQWVn7Z0B4/srZ4EnfGMVQMdLvk2iGAs3SoBkKumZArdQwnZrY4wi3+vDayxkAjZ4B8cVJWTfMeV4kEun3weNjHT68SKBrhqCUqrHp1ES4XtfHn8+sfjwWcONJ+KqHeJZ4kcAb4LpFD5qhwIsEXr9HKH4vf5h9fT2emHyR6giIL07KHuJZGjgTxHlBwhAZ7gqwbLu8CZr9hsLXYjKSkDfSs5msAxCev3L2KC2gGQpDZBiXTl/GdnkLeSXnED0XvNB2gLySw+DIAHa2tAwA0QEInvSN8SKR7GnJKzl83HnvenJ7hDRDISASIfp4/M6z228ftQLYo25xPWkv4pbxg35UfihzAP4AIgn5Iun3SW7dMkSGe66FFYU3wAmRhDyans1kGQDg/ESiGcp1g1UDe867GetlwJ8KSgAOAX0mQjRLuzq31qBXAM3S+LWvhoCjFGl1je0UgVWDv02TVtfYJsAwzV1dM1yd7TVwa1v7t64ZYAmz2wRwJ6isWqmBF4kDYK9BXskhr+TaoD8bB2171EoNMPRsE7AQWVm7mZ7a0zVDsKfKrQbWEFrr64VPTf96tYFqpbaxGDu8aZuDZhrmqlKqxuxRdKtBXslh+cvTtgiUUhU0QzmvimR0OT6dmgh7/R6hdR46zYGbeL3agFJS15LR5bsOAAA0VFUufi9/HhwZwHZ50yFqCf9sHGC98MkhXs5XAMO4D0BxBaRnM9n4s6l44WsxiRFnd3QyS3w/V556de9dpnXN8R4ko0upSELe2NnSMgGRCPygH51m5DAlVSgldQ2Gcd8u7gqwIgEgRh+P36n8UOa8AU5gvYzjyaxWahvQzXeLt948aE3LsQDLjq7cR5GEPMr5idRQGyzV1xeyHn2rFbtZL38VVkTZYx1d7Dda921C9+yatQAAAABJRU5ErkJggg==",
              "contentType": "image/png",
              "width": 18,
              "height": 18,
              "angle": 0,
              "xoffset": 0,
              "yoffset": 0
            },
            "value": "Approved",
            "label": "Approved"
          }, {
            "symbol": {
              "type": "esriPMS",
              "url": "a82867fe-92da-4d93-804d-a33edabb03ec",
              "imageData": "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAsJJREFUSIm1lj9LG2Ecxz+X3IOpiVDlTkoKFTGkSiFLFqf2DZgOFtpCF3FIaBUpHbpWQfoCAkoNUjpKhyz6BurSLLcENCHVxdIUjDRCiMbkctfhcja5XGJa6Hc77rnf5/f/OZn/LHmAMyIZIhqQiZgQrBsIE4rDHjILebR/BqxPMjEmmJMhPioTkSUQEsgS6CZUmpAKc+b3kH6RZxloDAzYniZmGKyrgsioDLc83WdUAbqJUtaJp8LM102eLH9j/0bAhzDP/BI7qg9GvH1ix4pGFRDwopxc8eXzAxJPD0j1BGxPE/NL7NwbAuVRDP9MtD+hpfP9XcShxnGNrWSI7MoRmS7A+iQThsG66rM8889EuZt4x/n+HtVcdy1vP5zrcKCa05jywcEFu4DaBRgTzKmCiDMt1ZzGj61VV8+dEbZSpmyGWXpVYKMdIFrd4urpIMZtjQsoNViFNkAyRHRUJuLWLf6Z6MC1sKMY8aIkQ8yuHJGRAQKtPneTXQNnzvvJ54E7Q0SgBTAhKHoA2mswKEBI8EsnCK0U1Q1ErwjsGvxtmuoG4hpgQlE33Q87a+DWts5n3QS/l+I1YNhDptK0ptIpZw2qOY1qTuuANkrFjm8qTTBMa9hkgIU82qf7nOkmijNVbjWwh9B+f5r+sx0uDag0ycYL1qa97nzDJF3WiTuj6FeDak6j8PpxRwRlHWRcVsVigUQqzHzAi9I+D73mwM34pQFlHW2xwJsuAEDNIHZyxdcpn7XA3FTNaTRKRU7TqS7jP+tgSKwBVVfAyhGZj9MkjmtsTR1qrkvOTbbx73Wevz2mw7Ou7bOYJ5UMkT24YFcVKOPC6utehsu6lRZDYs1p3BVgRwKom2GWSg1WR7woPk/3lVlpkm3C3ssC72lLy40AW62Vu5EMMRuQidQMhARB+9K3W7GfBvmrsCPK3HjQRb8B4FQk/kc7k/0AAAAASUVORK5CYII=",
              "contentType": "image/png",
              "width": 18,
              "height": 18,
              "angle": 0,
              "xoffset": 0,
              "yoffset": 0
            },
            "value": "Denied",
            "label": "Denied"
          }],
          "fieldDelimiter": ","
        },
        "transparency": 0,
        "labelingInfo": null
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
      "htmlPopupType": "esriServerHTMLPopupTypeAsHTMLText",
      "hasM": false,
      "hasZ": false,
      "objectIdField": "OBJECTID",
      "uniqueIdField": {
        "name": "OBJECTID",
        "isSystemMaintained": true
      },
      "globalIdField": "globalid",
      "typeIdField": "status",
      "fields": [{
        "name": "OBJECTID",
        "type": "esriFieldTypeOID",
        "alias": "OBJECTID",
        "sqlType": "sqlTypeOther",
        "nullable": false,
        "editable": false,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "globalid",
        "type": "esriFieldTypeGlobalID",
        "alias": "GlobalID",
        "sqlType": "sqlTypeOther",
        "length": 38,
        "nullable": false,
        "editable": false,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "appname",
        "type": "esriFieldTypeString",
        "alias": "Applicant Name",
        "sqlType": "sqlTypeOther",
        "length": 150,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "appaddr",
        "type": "esriFieldTypeString",
        "alias": "Applicant Address",
        "sqlType": "sqlTypeOther",
        "length": 255,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "appcity",
        "type": "esriFieldTypeString",
        "alias": "Applicant City",
        "sqlType": "sqlTypeOther",
        "length": 255,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "appstate",
        "type": "esriFieldTypeString",
        "alias": "Applicant State",
        "sqlType": "sqlTypeOther",
        "length": 2,
        "nullable": true,
        "editable": true,
        "domain": {
          "type": "codedValue",
          "name": "state",
          "codedValues": [{
            "name": "AL",
            "code": "AL"
          }, {
            "name": "AK",
            "code": "AK"
          }, {
            "name": "AZ",
            "code": "AZ"
          }, {
            "name": "AR",
            "code": "AR"
          }, {
            "name": "CA",
            "code": "CA"
          }, {
            "name": "CO",
            "code": "CO"
          }, {
            "name": "CT",
            "code": "CT"
          }, {
            "name": "DE",
            "code": "DE"
          }, {
            "name": "FL",
            "code": "FL"
          }, {
            "name": "GA",
            "code": "GA"
          }, {
            "name": "HI",
            "code": "HI"
          }, {
            "name": "ID",
            "code": "ID"
          }, {
            "name": "IL",
            "code": "IL"
          }, {
            "name": "IN",
            "code": "IN"
          }, {
            "name": "IA",
            "code": "IA"
          }, {
            "name": "KS",
            "code": "KS"
          }, {
            "name": "KY",
            "code": "KY"
          }, {
            "name": "LA",
            "code": "LA"
          }, {
            "name": "ME",
            "code": "ME"
          }, {
            "name": "MD",
            "code": "MD"
          }, {
            "name": "MA",
            "code": "MA"
          }, {
            "name": "MI",
            "code": "MI"
          }, {
            "name": "MN",
            "code": "MN"
          }, {
            "name": "MS",
            "code": "MS"
          }, {
            "name": "MO",
            "code": "MO"
          }, {
            "name": "MT",
            "code": "MT"
          }, {
            "name": "NE",
            "code": "NE"
          }, {
            "name": "NV",
            "code": "NV"
          }, {
            "name": "NH",
            "code": "NH"
          }, {
            "name": "NJ",
            "code": "NJ"
          }, {
            "name": "NM",
            "code": "NM"
          }, {
            "name": "NY",
            "code": "NY"
          }, {
            "name": "NC",
            "code": "NC"
          }, {
            "name": "ND",
            "code": "ND"
          }, {
            "name": "OH",
            "code": "OH"
          }, {
            "name": "OK",
            "code": "OK"
          }, {
            "name": "OR",
            "code": "OR"
          }, {
            "name": "PA",
            "code": "PA"
          }, {
            "name": "RI",
            "code": "RI"
          }, {
            "name": "SC",
            "code": "SC"
          }, {
            "name": "SD",
            "code": "SD"
          }, {
            "name": "TN",
            "code": "TN"
          }, {
            "name": "TX",
            "code": "TX"
          }, {
            "name": "UT",
            "code": "UT"
          }, {
            "name": "VT",
            "code": "VT"
          }, {
            "name": "VA",
            "code": "VA"
          }, {
            "name": "WA",
            "code": "WA"
          }, {
            "name": "WV",
            "code": "WV"
          }, {
            "name": "WI",
            "code": "WI"
          }, {
            "name": "WY",
            "code": "WY"
          }]
        },
        "defaultValue": null
      }, {
        "name": "appzip",
        "type": "esriFieldTypeString",
        "alias": "Applicant Zip",
        "sqlType": "sqlTypeOther",
        "length": 5,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "appphone",
        "type": "esriFieldTypeString",
        "alias": "Applicant Phone",
        "sqlType": "sqlTypeOther",
        "length": 15,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "appemail",
        "type": "esriFieldTypeString",
        "alias": "Applicant Email",
        "sqlType": "sqlTypeOther",
        "length": 100,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "sameapp",
        "type": "esriFieldTypeString",
        "alias": "Contractor Same as Applicant",
        "sqlType": "sqlTypeOther",
        "length": 5,
        "nullable": true,
        "editable": true,
        "domain": {
          "type": "codedValue",
          "name": "yesno",
          "codedValues": [{
            "name": "Yes",
            "code": "Yes"
          }, {
            "name": "No",
            "code": "No"
          }]
        },
        "defaultValue": null
      }, {
        "name": "contname",
        "type": "esriFieldTypeString",
        "alias": "Contractor Name",
        "sqlType": "sqlTypeOther",
        "length": 150,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "contaddr",
        "type": "esriFieldTypeString",
        "alias": "Contractor Address",
        "sqlType": "sqlTypeOther",
        "length": 255,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "contcity",
        "type": "esriFieldTypeString",
        "alias": "Contractor City",
        "sqlType": "sqlTypeOther",
        "length": 255,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "contstate",
        "type": "esriFieldTypeString",
        "alias": "Contractor State",
        "sqlType": "sqlTypeOther",
        "length": 2,
        "nullable": true,
        "editable": true,
        "domain": {
          "type": "codedValue",
          "name": "state",
          "codedValues": [{
            "name": "AL",
            "code": "AL"
          }, {
            "name": "AK",
            "code": "AK"
          }, {
            "name": "AZ",
            "code": "AZ"
          }, {
            "name": "AR",
            "code": "AR"
          }, {
            "name": "CA",
            "code": "CA"
          }, {
            "name": "CO",
            "code": "CO"
          }, {
            "name": "CT",
            "code": "CT"
          }, {
            "name": "DE",
            "code": "DE"
          }, {
            "name": "FL",
            "code": "FL"
          }, {
            "name": "GA",
            "code": "GA"
          }, {
            "name": "HI",
            "code": "HI"
          }, {
            "name": "ID",
            "code": "ID"
          }, {
            "name": "IL",
            "code": "IL"
          }, {
            "name": "IN",
            "code": "IN"
          }, {
            "name": "IA",
            "code": "IA"
          }, {
            "name": "KS",
            "code": "KS"
          }, {
            "name": "KY",
            "code": "KY"
          }, {
            "name": "LA",
            "code": "LA"
          }, {
            "name": "ME",
            "code": "ME"
          }, {
            "name": "MD",
            "code": "MD"
          }, {
            "name": "MA",
            "code": "MA"
          }, {
            "name": "MI",
            "code": "MI"
          }, {
            "name": "MN",
            "code": "MN"
          }, {
            "name": "MS",
            "code": "MS"
          }, {
            "name": "MO",
            "code": "MO"
          }, {
            "name": "MT",
            "code": "MT"
          }, {
            "name": "NE",
            "code": "NE"
          }, {
            "name": "NV",
            "code": "NV"
          }, {
            "name": "NH",
            "code": "NH"
          }, {
            "name": "NJ",
            "code": "NJ"
          }, {
            "name": "NM",
            "code": "NM"
          }, {
            "name": "NY",
            "code": "NY"
          }, {
            "name": "NC",
            "code": "NC"
          }, {
            "name": "ND",
            "code": "ND"
          }, {
            "name": "OH",
            "code": "OH"
          }, {
            "name": "OK",
            "code": "OK"
          }, {
            "name": "OR",
            "code": "OR"
          }, {
            "name": "PA",
            "code": "PA"
          }, {
            "name": "RI",
            "code": "RI"
          }, {
            "name": "SC",
            "code": "SC"
          }, {
            "name": "SD",
            "code": "SD"
          }, {
            "name": "TN",
            "code": "TN"
          }, {
            "name": "TX",
            "code": "TX"
          }, {
            "name": "UT",
            "code": "UT"
          }, {
            "name": "VT",
            "code": "VT"
          }, {
            "name": "VA",
            "code": "VA"
          }, {
            "name": "WA",
            "code": "WA"
          }, {
            "name": "WV",
            "code": "WV"
          }, {
            "name": "WI",
            "code": "WI"
          }, {
            "name": "WY",
            "code": "WY"
          }]
        },
        "defaultValue": null
      }, {
        "name": "contzip",
        "type": "esriFieldTypeString",
        "alias": "Contractor Zip",
        "sqlType": "sqlTypeOther",
        "length": 5,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "contphone",
        "type": "esriFieldTypeString",
        "alias": "Contractor Phone",
        "sqlType": "sqlTypeOther",
        "length": 15,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "contemail",
        "type": "esriFieldTypeString",
        "alias": "Contractor Email",
        "sqlType": "sqlTypeOther",
        "length": 100,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "contlicense",
        "type": "esriFieldTypeString",
        "alias": "Contractor License #",
        "sqlType": "sqlTypeOther",
        "length": 50,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "project",
        "type": "esriFieldTypeString",
        "alias": "Project",
        "sqlType": "sqlTypeOther",
        "length": 255,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "type",
        "type": "esriFieldTypeString",
        "alias": "Permit Type",
        "sqlType": "sqlTypeOther",
        "length": 15,
        "nullable": true,
        "editable": true,
        "domain": {
          "type": "codedValue",
          "name": "type",
          "codedValues": [{
            "name": "Surface or Sub-surface Alterations",
            "code": "Alterations"
          }, {
            "name": "Temporary Use",
            "code": "Temporary"
          }, {
            "name": "Encroachment",
            "code": "Encroachment"
          }]
        },
        "defaultValue": null
      }, {
        "name": "subtype",
        "type": "esriFieldTypeString",
        "alias": "Permit Subtype",
        "sqlType": "sqlTypeOther",
        "length": 255,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "subtypeother",
        "type": "esriFieldTypeString",
        "alias": "Permit Subtype Other",
        "sqlType": "sqlTypeOther",
        "length": 255,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "description",
        "type": "esriFieldTypeString",
        "alias": "Description of Work",
        "sqlType": "sqlTypeOther",
        "length": 1000,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "propstartdt",
        "type": "esriFieldTypeDate",
        "alias": "Proposed Start Date",
        "sqlType": "sqlTypeOther",
        "length": 8,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "propenddt",
        "type": "esriFieldTypeDate",
        "alias": "Proposed Completion Date",
        "sqlType": "sqlTypeOther",
        "length": 8,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "laneclosure",
        "type": "esriFieldTypeString",
        "alias": "Lane Closure Required",
        "sqlType": "sqlTypeOther",
        "length": 5,
        "nullable": true,
        "editable": true,
        "domain": {
          "type": "codedValue",
          "name": "yesno",
          "codedValues": [{
            "name": "Yes",
            "code": "Yes"
          }, {
            "name": "No",
            "code": "No"
          }]
        },
        "defaultValue": null
      }, {
        "name": "status",
        "type": "esriFieldTypeString",
        "alias": "Status",
        "sqlType": "sqlTypeOther",
        "length": 35,
        "nullable": true,
        "editable": true,
        "domain": {
          "type": "codedValue",
          "name": "status",
          "codedValues": [{
            "name": "Submitted",
            "code": "Submitted"
          }, {
            "name": "Staff Review",
            "code": "StaffReview"
          }, {
            "name": "Board Review",
            "code": "BoardReview"
          }, {
            "name": "Approved",
            "code": "Approved"
          }, {
            "name": "Denied",
            "code": "Denied"
          }]
        },
        "defaultValue": null
      }, {
        "name": "submitdt",
        "type": "esriFieldTypeDate",
        "alias": "Submission Date",
        "sqlType": "sqlTypeOther",
        "length": 8,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "actiondt",
        "type": "esriFieldTypeDate",
        "alias": "Approved or Denied Date",
        "sqlType": "sqlTypeOther",
        "length": 8,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "apprstartdt",
        "type": "esriFieldTypeDate",
        "alias": "Approved Start Date",
        "sqlType": "sqlTypeOther",
        "length": 8,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "apprenddt",
        "type": "esriFieldTypeDate",
        "alias": "Approved Completion Date",
        "sqlType": "sqlTypeOther",
        "length": 8,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "moreinfo",
        "type": "esriFieldTypeString",
        "alias": "More Information Required",
        "sqlType": "sqlTypeOther",
        "length": 5,
        "nullable": true,
        "editable": true,
        "domain": {
          "type": "codedValue",
          "name": "yesno",
          "codedValues": [{
            "name": "Yes",
            "code": "Yes"
          }, {
            "name": "No",
            "code": "No"
          }]
        },
        "defaultValue": null
      }, {
        "name": "comments",
        "type": "esriFieldTypeString",
        "alias": "Comments",
        "sqlType": "sqlTypeOther",
        "length": 1000,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "CreationDate",
        "type": "esriFieldTypeDate",
        "alias": "CreationDate",
        "sqlType": "sqlTypeOther",
        "length": 8,
        "nullable": true,
        "editable": false,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "Creator",
        "type": "esriFieldTypeString",
        "alias": "Creator",
        "sqlType": "sqlTypeOther",
        "length": 50,
        "nullable": true,
        "editable": false,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "EditDate",
        "type": "esriFieldTypeDate",
        "alias": "EditDate",
        "sqlType": "sqlTypeOther",
        "length": 8,
        "nullable": true,
        "editable": false,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "Editor",
        "type": "esriFieldTypeString",
        "alias": "Editor",
        "sqlType": "sqlTypeOther",
        "length": 50,
        "nullable": true,
        "editable": false,
        "domain": null,
        "defaultValue": null
      }],
      "indexes": [{
        "name": "FDO_globalid",
        "fields": "globalid",
        "isAscending": true,
        "isUnique": true,
        "description": ""
      }, {
        "name": "CreationDateIndex",
        "fields": "CreationDate",
        "isAscending": true,
        "isUnique": false,
        "description": "CreationDate Field index"
      }, {
        "name": "CreatorIndex",
        "fields": "Creator",
        "isAscending": false,
        "isUnique": false,
        "description": "Creator Field index"
      }, {
        "name": "EditDateIndex",
        "fields": "EditDate",
        "isAscending": true,
        "isUnique": false,
        "description": "EditDate Field index"
      }, {
        "name": "EditorIndex",
        "fields": "Editor",
        "isAscending": false,
        "isUnique": false,
        "description": "Editor Field index"
      }, {
        "name": "user_4375.ROWPermits_ROW_PERMITS_Shape_sidx",
        "fields": "Shape",
        "isAscending": false,
        "isUnique": false,
        "description": "Shape Index"
      }, {
        "name": "PK__ROWPermi__F4B70D859D5FEDE7",
        "fields": "OBJECTID",
        "isAscending": true,
        "isUnique": true,
        "description": "clustered, unique, primary key"
      }],
      "types": [{
        "id": "Submitted",
        "name": "Submitted",
        "domains": {
          "appstate": {
            "type": "inherited"
          },
          "sameapp": {
            "type": "inherited"
          },
          "type": {
            "type": "inherited"
          },
          "laneclosure": {
            "type": "inherited"
          },
          "status": {
            "type": "inherited"
          },
          "moreinfo": {
            "type": "inherited"
          }
        },
        "templates": [{
          "name": "Submitted",
          "description": "",
          "drawingTool": "esriFeatureEditToolPoint",
          "prototype": {
            "attributes": {
              "laneclosure": null,
              "Editor": null,
              "EditDate": null,
              "appname": null,
              "appaddr": null,
              "appcity": null,
              "appstate": null,
              "appzip": null,
              "appphone": null,
              "appemail": null,
              "sameapp": null,
              "contname": null,
              "contaddr": null,
              "contcity": null,
              "contstate": null,
              "contzip": null,
              "contphone": null,
              "contemail": null,
              "contlicense": null,
              "project": null,
              "type": null,
              "subtype": null,
              "subtypeother": null,
              "description": null,
              "propstartdt": null,
              "propenddt": null,
              "status": "Submitted",
              "submitdt": null,
              "actiondt": null,
              "apprstartdt": null,
              "apprenddt": null,
              "moreinfo": null,
              "comments": null,
              "CreationDate": null,
              "Creator": null
            }
          }
        }]
      }, {
        "id": "StaffReview",
        "name": "StaffReview",
        "domains": {
          "appstate": {
            "type": "inherited"
          },
          "sameapp": {
            "type": "inherited"
          },
          "type": {
            "type": "inherited"
          },
          "laneclosure": {
            "type": "inherited"
          },
          "status": {
            "type": "inherited"
          },
          "moreinfo": {
            "type": "inherited"
          }
        },
        "templates": [{
          "name": "Staff Review",
          "description": "",
          "drawingTool": "esriFeatureEditToolPoint",
          "prototype": {
            "attributes": {
              "laneclosure": null,
              "Editor": null,
              "EditDate": null,
              "appname": null,
              "appaddr": null,
              "appcity": null,
              "appstate": null,
              "appzip": null,
              "appphone": null,
              "appemail": null,
              "sameapp": null,
              "contname": null,
              "contaddr": null,
              "contcity": null,
              "contstate": null,
              "contzip": null,
              "contphone": null,
              "contemail": null,
              "contlicense": null,
              "project": null,
              "type": null,
              "subtype": null,
              "subtypeother": null,
              "description": null,
              "propstartdt": null,
              "propenddt": null,
              "status": "StaffReview",
              "submitdt": null,
              "actiondt": null,
              "apprstartdt": null,
              "apprenddt": null,
              "moreinfo": null,
              "comments": null,
              "CreationDate": null,
              "Creator": null
            }
          }
        }]
      }, {
        "id": "BoardReview",
        "name": "BoardReview",
        "domains": {
          "appstate": {
            "type": "inherited"
          },
          "sameapp": {
            "type": "inherited"
          },
          "type": {
            "type": "inherited"
          },
          "laneclosure": {
            "type": "inherited"
          },
          "status": {
            "type": "inherited"
          },
          "moreinfo": {
            "type": "inherited"
          }
        },
        "templates": [{
          "name": "Board Review",
          "description": "",
          "drawingTool": "esriFeatureEditToolPoint",
          "prototype": {
            "attributes": {
              "laneclosure": null,
              "Editor": null,
              "EditDate": null,
              "appname": null,
              "appaddr": null,
              "appcity": null,
              "appstate": null,
              "appzip": null,
              "appphone": null,
              "appemail": null,
              "sameapp": null,
              "contname": null,
              "contaddr": null,
              "contcity": null,
              "contstate": null,
              "contzip": null,
              "contphone": null,
              "contemail": null,
              "contlicense": null,
              "project": null,
              "type": null,
              "subtype": null,
              "subtypeother": null,
              "description": null,
              "propstartdt": null,
              "propenddt": null,
              "status": "BoardReview",
              "submitdt": null,
              "actiondt": null,
              "apprstartdt": null,
              "apprenddt": null,
              "moreinfo": null,
              "comments": null,
              "CreationDate": null,
              "Creator": null
            }
          }
        }]
      }, {
        "id": "Approved",
        "name": "Approved",
        "domains": {
          "appstate": {
            "type": "inherited"
          },
          "sameapp": {
            "type": "inherited"
          },
          "type": {
            "type": "inherited"
          },
          "laneclosure": {
            "type": "inherited"
          },
          "status": {
            "type": "inherited"
          },
          "moreinfo": {
            "type": "inherited"
          }
        },
        "templates": [{
          "name": "Approved",
          "description": "",
          "drawingTool": "esriFeatureEditToolPoint",
          "prototype": {
            "attributes": {
              "laneclosure": null,
              "Editor": null,
              "EditDate": null,
              "appname": null,
              "appaddr": null,
              "appcity": null,
              "appstate": null,
              "appzip": null,
              "appphone": null,
              "appemail": null,
              "sameapp": null,
              "contname": null,
              "contaddr": null,
              "contcity": null,
              "contstate": null,
              "contzip": null,
              "contphone": null,
              "contemail": null,
              "contlicense": null,
              "project": null,
              "type": null,
              "subtype": null,
              "subtypeother": null,
              "description": null,
              "propstartdt": null,
              "propenddt": null,
              "status": "Approved",
              "submitdt": null,
              "actiondt": null,
              "apprstartdt": null,
              "apprenddt": null,
              "moreinfo": null,
              "comments": null,
              "CreationDate": null,
              "Creator": null
            }
          }
        }]
      }, {
        "id": "Denied",
        "name": "Denied",
        "domains": {
          "appstate": {
            "type": "inherited"
          },
          "sameapp": {
            "type": "inherited"
          },
          "type": {
            "type": "inherited"
          },
          "laneclosure": {
            "type": "inherited"
          },
          "status": {
            "type": "inherited"
          },
          "moreinfo": {
            "type": "inherited"
          }
        },
        "templates": [{
          "name": "Denied",
          "description": "",
          "drawingTool": "esriFeatureEditToolPoint",
          "prototype": {
            "attributes": {
              "laneclosure": null,
              "Editor": null,
              "EditDate": null,
              "appname": null,
              "appaddr": null,
              "appcity": null,
              "appstate": null,
              "appzip": null,
              "appphone": null,
              "appemail": null,
              "sameapp": null,
              "contname": null,
              "contaddr": null,
              "contcity": null,
              "contstate": null,
              "contzip": null,
              "contphone": null,
              "contemail": null,
              "contlicense": null,
              "project": null,
              "type": null,
              "subtype": null,
              "subtypeother": null,
              "description": null,
              "propstartdt": null,
              "propenddt": null,
              "status": "Denied",
              "submitdt": null,
              "actiondt": null,
              "apprstartdt": null,
              "apprenddt": null,
              "moreinfo": null,
              "comments": null,
              "CreationDate": null,
              "Creator": null
            }
          }
        }]
      }],
      "templates": [],
      "supportedQueryFormats": "JSON, geoJSON, PBF",
      "hasStaticData": false,
      "maxRecordCount": 2000,
      "standardMaxRecordCount": 32000,
      "tileMaxRecordCount": 8000,
      "maxRecordCountFactor": 1,
      "capabilities": "Create,Query,Editing",
      "viewDefinitionQuery": "status = 'BoardReview'",
      "definitionQuery": "status = 'BoardReview'"
    }],
    tables: [{
      "currentVersion": 10.61,
      "id": 1,
      "name": "ROW Permit Comment",
      "type": "Table",
      "serviceItemId": "svc1234567890",
      "isView": true,
      "isUpdatableView": true,
      "sourceSchemaChangesAllowed": true,
      "displayField": "name",
      "description": "",
      "copyrightText": "",
      "defaultVisibility": true,
      "ownershipBasedAccessControlForFeatures": {
        "allowOthersToQuery": true,
        "allowOthersToDelete": true,
        "allowOthersToUpdate": true,
        "allowAnonymousToQuery": true,
        "allowAnonymousToUpdate": true,
        "allowAnonymousToDelete": true
      },
      "editFieldsInfo": null,
      "editingInfo": {
        "lastEditDate": 1538579807130
      },
      "relationships": [{
        "id": 0,
        "name": "",
        "relatedTableId": 0,
        "cardinality": "esriRelCardinalityOneToMany",
        "role": "esriRelRoleDestination",
        "keyField": "parentglobalid",
        "composite": true
      }],
      "isDataVersioned": false,
      "supportsAppend": true,
      "supportsCalculate": true,
      "supportsTruncate": true,
      "supportsAttachmentsByUploadId": true,
      "supportsAttachmentsResizing": true,
      "supportsRollbackOnFailureParameter": true,
      "supportsStatistics": true,
      "supportsAdvancedQueries": true,
      "supportsValidateSql": true,
      "supportsCoordinatesQuantization": true,
      "supportsQuantizationEditMode": true,
      "supportsApplyEditsWithGlobalIds": true,
      "supportsOBACForAnonymousUsers": true,
      "advancedQueryCapabilities": {
        "supportsPagination": true,
        "supportsPaginationOnAggregatedQueries": true,
        "supportsQueryRelatedPagination": true,
        "supportsQueryWithDistance": true,
        "supportsReturningQueryExtent": true,
        "supportsStatistics": true,
        "supportsOrderBy": true,
        "supportsDistinct": true,
        "supportsQueryWithResultType": true,
        "supportsSqlExpression": true,
        "supportsAdvancedQueryRelated": true,
        "supportsCountDistinct": true,
        "supportsLod": true,
        "supportsReturningGeometryCentroid": false,
        "supportsQueryWithDatumTransformation": true,
        "supportsHavingClause": true,
        "supportsOutFieldSQLExpression": true,
        "supportsMaxRecordCountFactor": true,
        "supportsTopFeaturesQuery": true
      },
      "useStandardizedQueries": true,
      "allowGeometryUpdates": true,
      "hasAttachments": false,
      "viewSourceHasAttachments": false,
      "htmlPopupType": "esriServerHTMLPopupTypeNone",
      "hasM": false,
      "hasZ": false,
      "objectIdField": "OBJECTID",
      "uniqueIdField": {
        "name": "OBJECTID",
        "isSystemMaintained": true
      },
      "globalIdField": "globalid",
      "typeIdField": "",
      "fields": [{
        "name": "OBJECTID",
        "type": "esriFieldTypeOID",
        "alias": "OBJECTID",
        "sqlType": "sqlTypeOther",
        "nullable": false,
        "editable": false,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "globalid",
        "type": "esriFieldTypeGlobalID",
        "alias": "GlobalID",
        "sqlType": "sqlTypeOther",
        "length": 38,
        "nullable": false,
        "editable": false,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "name",
        "type": "esriFieldTypeString",
        "alias": "Name",
        "sqlType": "sqlTypeOther",
        "length": 150,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "address",
        "type": "esriFieldTypeString",
        "alias": "Address",
        "sqlType": "sqlTypeOther",
        "length": 255,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "organization",
        "type": "esriFieldTypeString",
        "alias": "Organization",
        "sqlType": "sqlTypeOther",
        "length": 50,
        "nullable": true,
        "editable": true,
        "domain": {
          "type": "codedValue",
          "name": "organization",
          "codedValues": [{
            "name": "Public Works",
            "code": "PublicWorks"
          }, {
            "name": "Parks & Recreation",
            "code": "ParksRec"
          }, {
            "name": "Planning & Development",
            "code": "PlanningDev"
          }, {
            "name": "Transportation",
            "code": "Transportation"
          }, {
            "name": "Water & Sewer",
            "code": "WaterSewer"
          }, {
            "name": "General Public",
            "code": "GeneralPublic"
          }, {
            "name": "Other",
            "code": "Other"
          }]
        },
        "defaultValue": null
      }, {
        "name": "comments",
        "type": "esriFieldTypeString",
        "alias": "Comments",
        "sqlType": "sqlTypeOther",
        "length": 1000,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "instructions",
        "type": "esriFieldTypeString",
        "alias": "Any Instructions",
        "sqlType": "sqlTypeOther",
        "length": 1000,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "actiontaken",
        "type": "esriFieldTypeString",
        "alias": "Action Taken",
        "sqlType": "sqlTypeOther",
        "length": 35,
        "nullable": true,
        "editable": true,
        "domain": {
          "type": "codedValue",
          "name": "actiontaken",
          "codedValues": [{
            "name": "Under Review",
            "code": "UnderReview"
          }, {
            "name": "More Information Required",
            "code": "MoreInformationRequired"
          }, {
            "name": "Approved",
            "code": "Approved"
          }, {
            "name": "Denied",
            "code": "Denied"
          }]
        },
        "defaultValue": null
      }, {
        "name": "publicview",
        "type": "esriFieldTypeString",
        "alias": "Public View",
        "sqlType": "sqlTypeOther",
        "length": 5,
        "nullable": true,
        "editable": true,
        "domain": {
          "type": "codedValue",
          "name": "yesno",
          "codedValues": [{
            "name": "Yes",
            "code": "Yes"
          }, {
            "name": "No",
            "code": "No"
          }]
        },
        "defaultValue": null
      }, {
        "name": "submitdate",
        "type": "esriFieldTypeDate",
        "alias": "Submission Date",
        "sqlType": "sqlTypeOther",
        "length": 8,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "parentglobalid",
        "type": "esriFieldTypeGUID",
        "alias": "ParentGlobalID",
        "sqlType": "sqlTypeOther",
        "length": 38,
        "nullable": true,
        "editable": true,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "CreationDate",
        "type": "esriFieldTypeDate",
        "alias": "CreationDate",
        "sqlType": "sqlTypeOther",
        "length": 8,
        "nullable": true,
        "editable": false,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "Creator",
        "type": "esriFieldTypeString",
        "alias": "Creator",
        "sqlType": "sqlTypeOther",
        "length": 50,
        "nullable": true,
        "editable": false,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "EditDate",
        "type": "esriFieldTypeDate",
        "alias": "EditDate",
        "sqlType": "sqlTypeOther",
        "length": 8,
        "nullable": true,
        "editable": false,
        "domain": null,
        "defaultValue": null
      }, {
        "name": "Editor",
        "type": "esriFieldTypeString",
        "alias": "Editor",
        "sqlType": "sqlTypeOther",
        "length": 50,
        "nullable": true,
        "editable": false,
        "domain": null,
        "defaultValue": null
      }],
      "indexes": [{
        "name": "FDO_globalid",
        "fields": "globalid",
        "isAscending": true,
        "isUnique": true,
        "description": ""
      }, {
        "name": "G11parentglobali",
        "fields": "parentglobalid",
        "isAscending": true,
        "isUnique": false,
        "description": ""
      }, {
        "name": "CreationDateIndex",
        "fields": "CreationDate",
        "isAscending": true,
        "isUnique": false,
        "description": "CreationDate Field index"
      }, {
        "name": "CreatorIndex",
        "fields": "Creator",
        "isAscending": false,
        "isUnique": false,
        "description": "Creator Field index"
      }, {
        "name": "EditDateIndex",
        "fields": "EditDate",
        "isAscending": true,
        "isUnique": false,
        "description": "EditDate Field index"
      }, {
        "name": "EditorIndex",
        "fields": "Editor",
        "isAscending": false,
        "isUnique": false,
        "description": "Editor Field index"
      }, {
        "name": "PK__ROWPermi__F4B70D85BE37697A",
        "fields": "OBJECTID",
        "isAscending": true,
        "isUnique": true,
        "description": "clustered, unique, primary key"
      }],
      "types": [],
      "templates": [{
        "name": "ROW Permit Comment",
        "description": "",
        "drawingTool": "esriFeatureEditToolNone",
        "prototype": {
          "attributes": {
            "EditDate": null,
            "Editor": null,
            "Creator": null,
            "name": null,
            "address": null,
            "organization": "GeneralPublic",
            "comments": null,
            "instructions": null,
            "actiontaken": null,
            "publicview": "Yes",
            "submitdate": null,
            "parentglobalid": null,
            "CreationDate": null
          }
        }
      }],
      "supportedQueryFormats": "JSON, geoJSON, PBF",
      "hasStaticData": false,
      "maxRecordCount": 2000,
      "standardMaxRecordCount": 32000,
      "tileMaxRecordCount": 8000,
      "maxRecordCountFactor": 1,
      "capabilities": "Create,Query,Editing",
      "viewDefinitionQuery": "(organization = 'GeneralPublic') AND (publicview = 'Yes')",
      "definitionQuery": "(organization = 'GeneralPublic') AND (publicview = 'Yes')"
    }]
  }
};

export const SolutionEmptyGroup: any = {
  "grp1234567890": {
    "type": 'Group',
    "item": {
      "id": "grp1234567890",
      "title": "ROW Permit Manager",
      "isInvitationOnly": true,
      "description": null,
      "snippet": "ROW",
      "tags": ["ROW", "source-84453ddeff8841e9aa2c25d5e1253cd7"],
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
    "dependencies": []
  }
};

export const SolutionDashboardNoMap: any = {
  "dash1234567890": {
    "type": "Dashboard",
    "item": {
      "id": "dash1234567890",
      "name": null,
      "title": "ROW Permit Dashboard",
      "type": "Dashboard",
      "typeKeywords": ["Dashboard", "Operations Dashboard", "source-c3bea7d9491244d89a1ac33ce074084b"],
      "description": "ROW Permit Dashboard is a configuration of Operations Dashboard for ArcGIS that can be used by public works executives to monitor the status of right of way permits in their community.<br /><br /><a href='http://links.esri.com/localgovernment/help/ROWPermit/' target='_blank'>Learn more</a>",
      "tags": ["ROW", "Public Works", "Local Government", "ArcGIS for Local Government", "Permit", "Right of Way"],
      "snippet": "ROW Permit Dashboard is a configuration of Operations Dashboard for ArcGIS that can be used by public works executives to monitor the status of right of way permits in their community.",
      "thumbnail": "thumbnail/ago_downloaded.png",
      "documentation": null,
      "extent": [],
      "categories": [],
      "spatialReference": null,
      "accessInformation": "Esri., Inc.",
      "licenseInfo": null,
      "culture": "en-us",
      "properties": null,
      "url": null,
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
    "dependencies": [],
    "data": {
      "version": 24,
      "layout": {
        "rootElement": {
          "type": "stackLayoutElement",
          "orientation": "col",
          "elements": [{
            "type": "stackLayoutElement",
            "orientation": "row",
            "elements": [{
              "type": "itemLayoutElement",
              "id": "1200f3f1-8f72-4ea6-af16-14f19e9a4517",
              "width": 1,
              "height": 0.7
            }, {
              "type": "tabsLayoutElement",
              "elements": [{
                "type": "itemLayoutElement",
                "id": "ff698ea5-2812-4ba5-a0ba-d89fc302f8f4",
                "width": 1,
                "height": 1,
                "tabName": "Permit Type"
              }, {
                "type": "itemLayoutElement",
                "id": "d2e11f43-8d61-422c-b7fe-00dc8a9c2b14",
                "width": 1,
                "height": 1,
                "tabName": "Submission Date"
              }],
              "width": 1,
              "height": 0.3
            }],
            "width": 0.75,
            "height": 1
          }, {
            "type": "groupLayoutElement",
            "orientation": "row",
            "elements": [{
              "type": "itemLayoutElement",
              "id": "3e796f16-722b-437f-89a4-e3787e105b24",
              "width": 1,
              "height": 0.25
            }, {
              "type": "itemLayoutElement",
              "id": "0f994268-e553-4d11-b8d1-afecf0818841",
              "width": 1,
              "height": 0.75
            }],
            "width": 0.25,
            "height": 1
          }],
          "width": 1,
          "height": 1
        }
      },
      "headerPanel": {
        "showMargin": true,
        "type": "headerPanel",
        "titleTextColor": "#ffffff",
        "backgroundColor": "#004575",
        "size": "medium",
        "backgroundImageSizing": "fit-height",
        "normalBackgroundImagePlacement": "left",
        "horizontalBackgroundImagePlacement": "top",
        "showSignOutMenu": false,
        "menuLinks": [],
        "selectors": []
      },
      "leftPanel": {
        "type": "leftPanel",
        "title": "<p>ROW Permit Dashboard can be used by public works executives to monitor the status of right of way permits in their community.</p>\n\n<p>&nbsp;</p>\n\n<p>Adjust the filters or current map extent to refine the results.</p>\n",
        "selectors": [{
          "events": [{
            "type": "selectionChanged",
            "actions": [{
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "1200f3f1-8f72-4ea6-af16-14f19e9a4517#ROWPermitApplication_4605"
            }, {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "3e796f16-722b-437f-89a4-e3787e105b24#main"
            }, {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "0f994268-e553-4d11-b8d1-afecf0818841#main"
            }, {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "ff698ea5-2812-4ba5-a0ba-d89fc302f8f4#main"
            }, {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "d2e11f43-8d61-422c-b7fe-00dc8a9c2b14#main"
            }]
          }],
          "datasets": [{
            "statisticDefinitions": [{
              "onStatisticField": "type",
              "outStatisticFieldName": "count_result",
              "statisticType": "count"
            }],
            "type": "serviceDataset",
            "outFields": ["*"],
            "groupByFields": ["type"],
            "orderByFields": ["type asc"],
            "dataSource": {
              "id": "1200f3f1-8f72-4ea6-af16-14f19e9a4517#ROWPermitApplication_4605"
            },
            "maxFeatures": 50,
            "querySpatialRelationship": "esriSpatialRelIntersects",
            "returnGeometry": false,
            "clientSideStatistics": false,
            "name": "main"
          }],
          "category": {
            "type": "groupByValues",
            "nullLabel": "Null",
            "blankLabel": "Blank",
            "labelOverrides": []
          },
          "selection": {
            "type": "multiple",
            "operator": "is_in"
          },
          "preferredDisplayType": "checkboxes",
          "displayThreshold": 10,
          "type": "categorySelectorWidget",
          "id": "0e95ecaf-2027-4505-aee3-a2eba058a453",
          "name": "Type",
          "caption": "Type",
          "showLastUpdate": true
        }, {
          "events": [{
            "type": "selectionChanged",
            "actions": [{
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "1200f3f1-8f72-4ea6-af16-14f19e9a4517#ROWPermitApplication_4605"
            }, {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "3e796f16-722b-437f-89a4-e3787e105b24#main"
            }, {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "0f994268-e553-4d11-b8d1-afecf0818841#main"
            }, {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "ff698ea5-2812-4ba5-a0ba-d89fc302f8f4#main"
            }, {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "d2e11f43-8d61-422c-b7fe-00dc8a9c2b14#main"
            }]
          }],
          "datasets": [{
            "statisticDefinitions": [{
              "onStatisticField": "status",
              "outStatisticFieldName": "count_result",
              "statisticType": "count"
            }],
            "type": "serviceDataset",
            "outFields": ["*"],
            "groupByFields": ["status"],
            "orderByFields": ["status desc"],
            "dataSource": {
              "id": "1200f3f1-8f72-4ea6-af16-14f19e9a4517#ROWPermitApplication_4605"
            },
            "maxFeatures": 50,
            "querySpatialRelationship": "esriSpatialRelIntersects",
            "returnGeometry": false,
            "clientSideStatistics": false,
            "name": "main"
          }],
          "category": {
            "type": "groupByValues",
            "nullLabel": "Null",
            "blankLabel": "Blank",
            "labelOverrides": []
          },
          "selection": {
            "type": "multiple",
            "operator": "is_in"
          },
          "preferredDisplayType": "checkboxes",
          "displayThreshold": 10,
          "type": "categorySelectorWidget",
          "id": "329bb4d1-ad54-4d52-9db7-9fd674c54d4e",
          "name": "Status",
          "caption": "Status",
          "showLastUpdate": true
        }, {
          "events": [{
            "type": "selectionChanged",
            "actions": [{
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "1200f3f1-8f72-4ea6-af16-14f19e9a4517#ROWPermitApplication_4605"
            }, {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "3e796f16-722b-437f-89a4-e3787e105b24#main"
            }, {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "0f994268-e553-4d11-b8d1-afecf0818841#main"
            }, {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "ff698ea5-2812-4ba5-a0ba-d89fc302f8f4#main"
            }, {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "d2e11f43-8d61-422c-b7fe-00dc8a9c2b14#main"
            }]
          }],
          "datasets": [{
            "statisticDefinitions": [{
              "onStatisticField": "moreinfo",
              "outStatisticFieldName": "count_result",
              "statisticType": "count"
            }],
            "type": "serviceDataset",
            "outFields": ["*"],
            "groupByFields": ["moreinfo"],
            "orderByFields": ["moreinfo asc"],
            "dataSource": {
              "id": "1200f3f1-8f72-4ea6-af16-14f19e9a4517#ROWPermitApplication_4605"
            },
            "maxFeatures": 50,
            "querySpatialRelationship": "esriSpatialRelIntersects",
            "returnGeometry": false,
            "clientSideStatistics": false,
            "name": "main"
          }],
          "category": {
            "type": "groupByValues",
            "nullLabel": "Null",
            "blankLabel": "Blank",
            "labelOverrides": []
          },
          "selection": {
            "type": "multiple",
            "operator": "is_in"
          },
          "preferredDisplayType": "button_bar",
          "displayThreshold": 10,
          "type": "categorySelectorWidget",
          "id": "fa6e8b0b-3912-4eb4-bf58-b17d1c7c7a3b",
          "name": "More Information Required?",
          "caption": "More Information Required?",
          "showLastUpdate": true
        }, {
          "events": [{
            "type": "selectionChanged",
            "actions": [{
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [{
                "sourceName": "filterField",
                "targetName": "submitdt"
              }],
              "targetId": "1200f3f1-8f72-4ea6-af16-14f19e9a4517#ROWPermitApplication_4605"
            }, {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [{
                "sourceName": "filterField",
                "targetName": "submitdt"
              }],
              "targetId": "3e796f16-722b-437f-89a4-e3787e105b24#main"
            }, {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [{
                "sourceName": "filterField",
                "targetName": "submitdt"
              }],
              "targetId": "0f994268-e553-4d11-b8d1-afecf0818841#main"
            }, {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [{
                "sourceName": "filterField",
                "targetName": "submitdt"
              }],
              "targetId": "ff698ea5-2812-4ba5-a0ba-d89fc302f8f4#main"
            }, {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [{
                "sourceName": "filterField",
                "targetName": "submitdt"
              }],
              "targetId": "d2e11f43-8d61-422c-b7fe-00dc8a9c2b14#main"
            }]
          }],
          "type": "dateSelectorWidget",
          "definedOptions": {
            "type": "definedOptions",
            "displayType": "dropdown",
            "defaultSelection": "first",
            "noneLabelPlacement": "first",
            "noneLabel": "All",
            "namedFilters": [{
              "displayName": "Last 7 days",
              "filter": {
                "type": "filterGroup",
                "condition": "OR",
                "rules": [{
                  "type": "filterGroup",
                  "condition": "AND",
                  "rules": [{
                    "type": "filterRule",
                    "field": {
                      "name": "filterField",
                      "type": "esriFieldTypeDate"
                    },
                    "operator": "is_within_last",
                    "constraint": {
                      "type": "relativeDate",
                      "unit": "d",
                      "value": "7"
                    }
                  }]
                }]
              }
            }, {
              "displayName": "Last 30 days",
              "filter": {
                "type": "filterGroup",
                "condition": "OR",
                "rules": [{
                  "type": "filterGroup",
                  "condition": "AND",
                  "rules": [{
                    "type": "filterRule",
                    "field": {
                      "name": "filterField",
                      "type": "esriFieldTypeDate"
                    },
                    "operator": "is_within_last",
                    "constraint": {
                      "type": "relativeDate",
                      "unit": "d",
                      "value": "30"
                    }
                  }]
                }]
              }
            }, {
              "displayName": "Last 90 days",
              "filter": {
                "type": "filterGroup",
                "condition": "OR",
                "rules": [{
                  "type": "filterGroup",
                  "condition": "AND",
                  "rules": [{
                    "type": "filterRule",
                    "field": {
                      "name": "filterField",
                      "type": "esriFieldTypeDate"
                    },
                    "operator": "is_within_last",
                    "constraint": {
                      "type": "relativeDate",
                      "unit": "d",
                      "value": "90"
                    }
                  }]
                }]
              }
            }, {
              "displayName": "Older than 30 days",
              "filter": {
                "type": "filterGroup",
                "condition": "OR",
                "rules": [{
                  "type": "filterGroup",
                  "condition": "AND",
                  "rules": [{
                    "type": "filterRule",
                    "field": {
                      "name": "filterField",
                      "type": "esriFieldTypeDate"
                    },
                    "operator": "is_before_last",
                    "constraint": {
                      "type": "relativeDate",
                      "unit": "d",
                      "value": "30"
                    }
                  }]
                }]
              }
            }, {
              "displayName": "Older than 90 days",
              "filter": {
                "type": "filterGroup",
                "condition": "OR",
                "rules": [{
                  "type": "filterGroup",
                  "condition": "AND",
                  "rules": [{
                    "type": "filterRule",
                    "field": {
                      "name": "filterField",
                      "type": "esriFieldTypeDate"
                    },
                    "operator": "is_before_last",
                    "constraint": {
                      "type": "relativeDate",
                      "unit": "d",
                      "value": "90"
                    }
                  }]
                }]
              }
            }]
          },
          "datePickerOption": {
            "type": "datePicker",
            "selectionType": "range",
            "operator": "between",
            "minDefaultValue": {
              "type": "date",
              "includeTime": false,
              "defaultToToday": false
            },
            "maxDefaultValue": {
              "type": "date",
              "includeTime": false,
              "defaultToToday": true
            }
          },
          "customLabel": "Between the dates",
          "optionType": "advanced",
          "id": "117c527b-96ef-4939-9751-d61feb96b62c",
          "name": "Submission Date",
          "caption": "Submission Date",
          "showLastUpdate": true
        }, {
          "events": [{
            "type": "selectionChanged",
            "actions": [{
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [{
                "sourceName": "filterField",
                "targetName": "apprstartdt"
              }],
              "targetId": "1200f3f1-8f72-4ea6-af16-14f19e9a4517#ROWPermitApplication_4605"
            }, {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [{
                "sourceName": "filterField",
                "targetName": "apprstartdt"
              }],
              "targetId": "3e796f16-722b-437f-89a4-e3787e105b24#main"
            }, {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [{
                "sourceName": "filterField",
                "targetName": "apprstartdt"
              }],
              "targetId": "0f994268-e553-4d11-b8d1-afecf0818841#main"
            }, {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [{
                "sourceName": "filterField",
                "targetName": "apprstartdt"
              }],
              "targetId": "ff698ea5-2812-4ba5-a0ba-d89fc302f8f4#main"
            }, {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [{
                "sourceName": "filterField",
                "targetName": "apprstartdt"
              }],
              "targetId": "d2e11f43-8d61-422c-b7fe-00dc8a9c2b14#main"
            }]
          }],
          "type": "dateSelectorWidget",
          "definedOptions": {
            "type": "definedOptions",
            "displayType": "dropdown",
            "defaultSelection": "first",
            "noneLabelPlacement": "first",
            "noneLabel": "All",
            "namedFilters": [{
              "displayName": "Next 7 days",
              "filter": {
                "type": "filterGroup",
                "condition": "OR",
                "rules": [{
                  "type": "filterGroup",
                  "condition": "AND",
                  "rules": [{
                    "type": "filterRule",
                    "field": {
                      "name": "filterField",
                      "type": "esriFieldTypeDate"
                    },
                    "operator": "is_within_next",
                    "constraint": {
                      "type": "relativeDate",
                      "unit": "d",
                      "value": "7"
                    }
                  }]
                }]
              }
            }, {
              "displayName": "Next 30 days",
              "filter": {
                "type": "filterGroup",
                "condition": "OR",
                "rules": [{
                  "type": "filterGroup",
                  "condition": "AND",
                  "rules": [{
                    "type": "filterRule",
                    "field": {
                      "name": "filterField",
                      "type": "esriFieldTypeDate"
                    },
                    "operator": "is_within_next",
                    "constraint": {
                      "type": "relativeDate",
                      "unit": "d",
                      "value": "30"
                    }
                  }]
                }]
              }
            }, {
              "displayName": "Last 30 days",
              "filter": {
                "type": "filterGroup",
                "condition": "OR",
                "rules": [{
                  "type": "filterGroup",
                  "condition": "AND",
                  "rules": [{
                    "type": "filterRule",
                    "field": {
                      "name": "filterField",
                      "type": "esriFieldTypeDate"
                    },
                    "operator": "is_within_last",
                    "constraint": {
                      "type": "relativeDate",
                      "unit": "d",
                      "value": "30"
                    }
                  }]
                }]
              }
            }, {
              "displayName": "Last 7 days",
              "filter": {
                "type": "filterGroup",
                "condition": "OR",
                "rules": [{
                  "type": "filterGroup",
                  "condition": "AND",
                  "rules": [{
                    "type": "filterRule",
                    "field": {
                      "name": "filterField",
                      "type": "esriFieldTypeDate"
                    },
                    "operator": "is_within_last",
                    "constraint": {
                      "type": "relativeDate",
                      "unit": "d",
                      "value": "7"
                    }
                  }]
                }]
              }
            }]
          },
          "datePickerOption": {
            "type": "datePicker",
            "selectionType": "range",
            "operator": "between",
            "minDefaultValue": {
              "type": "date",
              "includeTime": false,
              "defaultToToday": false
            },
            "maxDefaultValue": {
              "type": "date",
              "includeTime": false,
              "defaultToToday": false
            }
          },
          "customLabel": "Between the dates",
          "optionType": "advanced",
          "id": "024b8abb-07c3-4505-bde7-b1994f69ac87",
          "name": "Approved Start Date",
          "caption": "Approved Start Date",
          "showLastUpdate": true
        }]
      },
      "widgets": [{
        "valueFormat": {
          "name": "value",
          "type": "decimal",
          "prefix": false
        },
        "datasets": [{
          "statisticDefinitions": [{
            "onStatisticField": "objectid",
            "outStatisticFieldName": "value",
            "statisticType": "count"
          }],
          "type": "serviceDataset",
          "outFields": ["*"],
          "groupByFields": [],
          "orderByFields": [],
          "dataSource": {
            "id": "1200f3f1-8f72-4ea6-af16-14f19e9a4517#ROWPermitApplication_4605"
          },
          "querySpatialRelationship": "esriSpatialRelIntersects",
          "returnGeometry": false,
          "clientSideStatistics": false,
          "name": "main"
        }],
        "defaultSettings": {
          "backgroundColor": "#ffffff",
          "caption": "<p><span style=\"font-size:18px\">Permits</span></p>\n",
          "topSection": {
            "fontSize": 80,
            "textInfo": {}
          },
          "middleSection": {
            "fontSize": 160,
            "textInfo": {
              "text": "{value}",
              "fillColor": "#004575"
            },
            "iconInfo": {
              "fillColor": "#004575",
              "align": "left",
              "icon": "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"-16 -16 96 96\" id=\"ember5200\" class=\"icon ember-view\">\n\t<path d=\"M39,44h20v1.9725L41.48045,64H39V44z M59,0v39H34v25H5V0H59z M25,44H15v10h10V44z M25,24H15v10h10V24z M44,5 H15v10h29V5z\"></path>\n</svg>"
            }
          },
          "bottomSection": {
            "fontSize": 80,
            "textInfo": {}
          }
        },
        "comparison": "none",
        "type": "indicatorWidget",
        "percentageFormat": {
          "name": "percentage",
          "type": "decimal",
          "prefix": false
        },
        "ratioFormat": {
          "name": "ratio",
          "type": "decimal",
          "prefix": false
        },
        "id": "3e796f16-722b-437f-89a4-e3787e105b24",
        "name": "ROW Permit Count",
        "showLastUpdate": false
      }, {
        "datasets": [{
          "statisticDefinitions": [],
          "type": "serviceDataset",
          "outFields": ["*"],
          "groupByFields": [],
          "orderByFields": ["submitdt desc"],
          "dataSource": {
            "id": "1200f3f1-8f72-4ea6-af16-14f19e9a4517#ROWPermitApplication_4605"
          },
          "maxFeatures": 100,
          "querySpatialRelationship": "esriSpatialRelIntersects",
          "returnGeometry": false,
          "clientSideStatistics": false,
          "name": "main"
        }],
        "type": "listWidget",
        "iconType": "symbol",
        "text": "<p><span style=\"font-size:16px\">{appname}</span></p>\n\n<p><span style=\"font-size:12px\">{type} </span></p>\n\n<p><span style=\"font-size:12px\">{status}</span></p>\n",
        "selectionMode": "single",
        "events": [{
          "type": "selectionChanged",
          "actions": [{
            "type": "flashGeometry",
            "targetId": "1200f3f1-8f72-4ea6-af16-14f19e9a4517"
          }, {
            "type": "pan",
            "targetId": "1200f3f1-8f72-4ea6-af16-14f19e9a4517"
          }]
        }],
        "backgroundColor": "#ffffff",
        "id": "0f994268-e553-4d11-b8d1-afecf0818841",
        "name": "ROW Permit List",
        "showLastUpdate": false
      }, {
        "guides": [],
        "type": "serialChartWidget",
        "fontSize": 11,
        "valueFormat": {
          "name": "value",
          "type": "decimal",
          "prefix": true,
          "pattern": "#,###"
        },
        "labelFormat": {
          "name": "label",
          "type": "decimal",
          "prefix": true,
          "pattern": "#,###"
        },
        "datePeriodPatterns": [{
          "period": "ss",
          "pattern": "HH:mm:ss"
        }, {
          "period": "mm",
          "pattern": "HH:mm"
        }, {
          "period": "hh",
          "pattern": "HH:mm"
        }, {
          "period": "DD",
          "pattern": "MMM d"
        }, {
          "period": "MM",
          "pattern": "MMM"
        }, {
          "period": "YYYY",
          "pattern": "yyyy"
        }],
        "chartScrollbar": {
          "enabled": false,
          "dragIcon": "dragIconRoundSmall",
          "dragIconHeight": 20,
          "dragIconWidth": 20,
          "scrollbarHeight": 15
        },
        "categoryAxis": {
          "gridPosition": "start",
          "gridThickness": 1,
          "gridAlpha": 0,
          "axisThickness": 1,
          "axisAlpha": 0,
          "labelsEnabled": true,
          "parseDates": false,
          "minPeriod": "DD"
        },
        "valueAxis": {
          "gridThickness": 1,
          "gridAlpha": 0,
          "axisThickness": 1,
          "axisAlpha": 0,
          "stackType": "none",
          "labelsEnabled": false,
          "integersOnly": false
        },
        "legend": {
          "enabled": false,
          "position": "bottom",
          "markerSize": 15,
          "markerType": "circle",
          "align": "center",
          "labelWidth": 100,
          "valueWidth": 0
        },
        "graphs": [{
          "bullet": "none",
          "valueField": "value",
          "lineColor": "#004575",
          "type": "column",
          "fillAlphas": 1,
          "lineAlpha": 1,
          "lineThickness": 1,
          "bulletAlpha": 1,
          "bulletBorderAlpha": 0,
          "bulletBorderThickness": 2,
          "bulletSize": 8,
          "showBalloon": true
        }],
        "category": {
          "fieldName": "type",
          "labelOverrides": [],
          "labelsPlacement": "wrapped",
          "labelRotation": 30,
          "byCategoryColors": false,
          "nullLabel": "Null",
          "blankLabel": "Blank",
          "defaultColor": "#d6d6d6",
          "nullColor": "#d6d6d6",
          "blankColor": "#d6d6d6"
        },
        "splitBy": {
          "defaultColor": "#d6d6d6",
          "seriesProperties": []
        },
        "rotate": true,
        "commonGraphProperties": {
          "bulletAlpha": 1,
          "type": "column",
          "lineAlpha": 1,
          "lineThickness": 1,
          "bullet": "none",
          "fillAlphas": 1,
          "bulletBorderAlpha": 0,
          "bulletBorderThickness": 2,
          "bulletSize": 8,
          "labelText": "[[value]]",
          "showBalloon": false
        },
        "categoryType": "groupByValues",
        "datasets": [{
          "statisticDefinitions": [{
            "onStatisticField": "objectid",
            "outStatisticFieldName": "value",
            "statisticType": "count"
          }],
          "type": "serviceDataset",
          "outFields": ["*"],
          "groupByFields": ["type"],
          "dataSource": {
            "id": "1200f3f1-8f72-4ea6-af16-14f19e9a4517#ROWPermitApplication_4605"
          },
          "querySpatialRelationship": "esriSpatialRelIntersects",
          "returnGeometry": false,
          "clientSideStatistics": false,
          "name": "main"
        }],
        "id": "ff698ea5-2812-4ba5-a0ba-d89fc302f8f4",
        "name": "Permit Type",
        "caption": "",
        "showLastUpdate": false
      }, {
        "guides": [],
        "type": "serialChartWidget",
        "fontSize": 11,
        "valueFormat": {
          "name": "value",
          "type": "decimal",
          "prefix": true,
          "pattern": "#,###.#"
        },
        "labelFormat": {
          "name": "label",
          "type": "decimal",
          "prefix": true,
          "pattern": "#,###.#"
        },
        "datePeriodPatterns": [{
          "period": "ss",
          "pattern": "HH:mm:ss"
        }, {
          "period": "mm",
          "pattern": "HH:mm"
        }, {
          "period": "hh",
          "pattern": "HH:mm"
        }, {
          "period": "DD",
          "pattern": "MMM d"
        }, {
          "period": "MM",
          "pattern": "MMM"
        }, {
          "period": "YYYY",
          "pattern": "yyyy"
        }],
        "chartScrollbar": {
          "enabled": false,
          "dragIcon": "dragIconRoundSmall",
          "dragIconHeight": 20,
          "dragIconWidth": 20,
          "scrollbarHeight": 15
        },
        "categoryAxis": {
          "gridPosition": "start",
          "gridThickness": 1,
          "gridAlpha": 0,
          "axisThickness": 1,
          "axisAlpha": 0.2,
          "labelsEnabled": true,
          "parseDates": true,
          "minPeriod": "MM"
        },
        "valueAxis": {
          "gridThickness": 1,
          "gridAlpha": 0,
          "axisThickness": 1,
          "axisAlpha": 0.2,
          "stackType": "none",
          "labelsEnabled": true,
          "integersOnly": true
        },
        "legend": {
          "enabled": false,
          "position": "bottom",
          "markerSize": 15,
          "markerType": "circle",
          "align": "center",
          "labelWidth": 100,
          "valueWidth": 0
        },
        "graphs": [{
          "bullet": "none",
          "valueField": "value",
          "lineColor": "#004575",
          "type": "column",
          "fillAlphas": 1,
          "lineAlpha": 1,
          "lineThickness": 1,
          "bulletAlpha": 1,
          "bulletBorderAlpha": 0,
          "bulletBorderThickness": 2,
          "bulletSize": 8,
          "showBalloon": true
        }],
        "category": {
          "fieldName": "submitdt",
          "labelOverrides": [],
          "labelsPlacement": "default",
          "labelRotation": 0,
          "byCategoryColors": false,
          "nullLabel": "Null",
          "blankLabel": "Blank",
          "defaultColor": "#d6d6d6",
          "nullColor": "#d6d6d6",
          "blankColor": "#d6d6d6"
        },
        "splitBy": {
          "defaultColor": "#d6d6d6",
          "seriesProperties": []
        },
        "rotate": false,
        "commonGraphProperties": {
          "bulletAlpha": 1,
          "type": "column",
          "lineAlpha": 1,
          "lineThickness": 1,
          "bullet": "none",
          "fillAlphas": 1,
          "bulletBorderAlpha": 0,
          "bulletBorderThickness": 2,
          "bulletSize": 8,
          "showBalloon": false
        },
        "categoryType": "groupByValues",
        "datasets": [{
          "statisticDefinitions": [{
            "onStatisticField": "OBJECTID",
            "outStatisticFieldName": "value",
            "statisticType": "count"
          }],
          "type": "serviceDataset",
          "outFields": ["*"],
          "groupByFields": ["submitdt"],
          "orderByFields": ["submitdt asc"],
          "dataSource": {
            "id": "1200f3f1-8f72-4ea6-af16-14f19e9a4517#ROWPermitApplication_4605"
          },
          "querySpatialRelationship": "esriSpatialRelIntersects",
          "returnGeometry": false,
          "clientSideStatistics": true,
          "name": "main"
        }],
        "id": "d2e11f43-8d61-422c-b7fe-00dc8a9c2b14",
        "name": "Submission Date",
        "caption": "",
        "showLastUpdate": false
      }],
      "settings": {
        "maxPaginationRecords": 50000
      },
      "theme": "light"
    },
    "resources": null
  }
};

export const SolutionDashboardNoData: any = {
  "dash1234567890": {
    "type": "Dashboard",
    "item": {
      "id": "dash1234567890",
      "name": null,
      "title": "ROW Permit Dashboard",
      "type": "Dashboard",
      "typeKeywords": ["Dashboard", "Operations Dashboard", "source-c3bea7d9491244d89a1ac33ce074084b"],
      "description": "ROW Permit Dashboard is a configuration of Operations Dashboard for ArcGIS that can be used by public works executives to monitor the status of right of way permits in their community.<br /><br /><a href='http://links.esri.com/localgovernment/help/ROWPermit/' target='_blank'>Learn more</a>",
      "tags": ["ROW", "Public Works", "Local Government", "ArcGIS for Local Government", "Permit", "Right of Way"],
      "snippet": "ROW Permit Dashboard is a configuration of Operations Dashboard for ArcGIS that can be used by public works executives to monitor the status of right of way permits in their community.",
      "thumbnail": "thumbnail/ago_downloaded.png",
      "documentation": null,
      "extent": [],
      "categories": [],
      "spatialReference": null,
      "accessInformation": "Esri., Inc.",
      "licenseInfo": null,
      "culture": "en-us",
      "properties": null,
      "url": null,
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
    "dependencies": [],
    "data": null,
    "resources": null
  }
};

