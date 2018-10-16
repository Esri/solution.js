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

import { IItem } from "@esri/arcgis-rest-common-types";

export const WebMappingAppItemSuccessResponse: IItem = {
  "id": "wma1234657890",
  "owner": "LocalGovTryItLive",
  "created": 1520968147000,
  "modified": 1522178539000,
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
  "culture": "en-us",
  "properties": null,
  "url": "http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc5992522d34f26b2210d17835eea21",
  "protected": false
};

export const WebMappingAppItemDataSuccessResponse: any = {
  "source": "bb3fcf7c3d804271bfd7ac6f48290fcf",
  "folderId": "6046cfcbf84840eea9d8d04958a13790",
  "values": {
    "webmap": "164831217e154849a731573e1855cb1a",
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
