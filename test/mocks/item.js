/* Copyright (c) 2018 Esri
 * Apache-2.0 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemFailResponse = {
        "name": "",
        "message": "Item or group does not exist or is inaccessible.",
        "originalMessage": "",
        "code": "400",
        "response": "",
        "url": "",
        "options": null
    };
    exports.ItemSuccessResponseWMA = {
        "id": "wma1234567890",
        "item": "wma1234567890",
        "itemType": "text",
        "owner": "LocalGovTryItLive",
        "orgId": "org1234567890",
        "uploaded": 1520968147000,
        "modified": 1522178539000,
        "guid": null,
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
        "lastModified": -1,
        "spatialReference": null,
        "accessInformation": "Esri., Inc.",
        "licenseInfo": null,
        "culture": "en-us",
        "properties": null,
        "url": "http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc5992522d34f26b2210d17835eea21",
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
    exports.ItemDataSuccessResponseWMA = {
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
    };
    exports.ItemSuccessResponseWebmap = {
        "id": "map1234567890",
        "item": "map1234567890",
        "itemType": "text",
        "owner": "LocalGovTryItLive",
        "orgId": "Pu6Fai10JE2L2xUd",
        "uploaded": 1520968139000,
        "modified": 1522178539000,
        "guid": null,
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
        "lastModified": -1,
        "spatialReference": null,
        "accessInformation": "Esri., Inc.",
        "licenseInfo": null,
        "culture": "en-us",
        "properties": null,
        "url": null,
        "proxyFilter": null,
        "access": "public",
        "size": 12470,
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
        "numViews": 664,
        "scoreCompleteness": 76,
        "groupDesignations": null
    };
    exports.ItemDataSuccessResponseWebmap = {
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
    };
    exports.ItemSuccessResponseService = {
        "id": "svc1234567890",
        "item": "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer",
        "itemType": "url",
        "owner": "LocalGovTryItLive",
        "orgId": "org1234567890",
        "uploaded": 1520968092000,
        "modified": 1522178516000,
        "guid": null,
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
        "lastModified": -1,
        "spatialReference": null,
        "accessInformation": "Esri., Inc.",
        "licenseInfo": null,
        "culture": "en-us",
        "properties": null,
        "url": "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer",
        "proxyFilter": null,
        "access": "public",
        "size": 0,
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
        "numViews": 644,
        "scoreCompleteness": 76,
        "groupDesignations": null
    };
    exports.ItemDataSuccessResponseService = {
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
});
//# sourceMappingURL=item.js.map