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

import { ArcGISRequestError } from "@esri/arcgis-rest-request";

export const ItemFailResponse: ArcGISRequestError = {
  "name":  "",
  "message": "Item or group does not exist or is inaccessible: fail1234567890",
  "originalMessage": "",
  "code": "400",
  "response": "",
  "url": "",
  "options": null
};

export const ItemResourcesSuccessResponseNone: any = {
  "total": 0,
  "start": 1,
  "num": 0,
  "nextStart": -1,
  "resources": []
};

export const ItemSuccessResponseWMAWithoutUndesirableProps: any = {
  "access": "public",
  "accessInformation": "Esri., Inc.",
  "appCategories": [],
  "banner": null,
  "categories": [],
  "commentsEnabled": false,
  "culture": "en-us",
  "description": "ROW Permit Public Comment is a configuration of the Crowdsource Polling application that can be used by the general public and interested parties to review permit applications and comment on proposed construction activity.<br /><br /><a href='http://links.esri.com/localgovernment/help/ROWPermitPublicComment/' target='_blank'>Learn more<\/a>",
  "documentation": null,
  "extent": [],
  "groupDesignations": null,
  "id": "wma1234567890",
  "industries": [],
  "item": "wma1234567890",
  "languages": [],
  "largeThumbnail": null,
  "licenseInfo": null,
  "listed": false,
  "name": null,
  "properties": null,
  "proxyFilter": null,
  "screenshots": [],
  "snippet": "ROW Permit Public Comment is a configuration of the Crowdsource Polling application that can be used by the general public and interested parties to review permit applications and comment on proposed construction activity.",
  "spatialReference": null,
  "tags": ["ROW", "Public Works", "Local Government", "ArcGIS for Local Government", "Permit", "Right of Way"],
  "thumbnail": "thumbnail/ago_downloaded.png",
  "title": "ROW Permit Public Comment",
  "type": "Web Mapping Application",
  "typeKeywords": ["JavaScript", "Map", "Mapping Site", "Online Map", "source-049f861ad61b4d2992de47e2d0375097", "Web Map"],
  "url": "http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc5992522d34f26b2210d17835eea21"
};

export const ItemSuccessResponseDashboard: any = {
  "id": "dsh1234567890",
  "item": "dsh1234567890",
  "owner": "LocalGovTryItLive",
  "orgId": "org1234567890",
  "created": 1520968147000,
  "modified": 1522178539000,
  "guid": null,
  "name": null,
  "title": "ROW Permit Dashboard",
  "type": "Dashboard",
  "typeKeywords": ["Dashboard", "Operations Dashboard", "source-c3bea7d9491244d89a1ac33ce074084b"],
  "description": "ROW Permit Dashboard is a configuration of Operations Dashboard for ArcGIS that can be used by public works executives to monitor the status of right of way permits in their community.<br /><br /><a href='http://links.esri.com/localgovernment/help/ROWPermit/' target='_blank'>Learn more<\/a>",
  "tags": ["ROW", "Public Works", "Local Government", "ArcGIS for Local Government", "Permit", "Right of Way"],
  "snippet": "ROW Permit Dashboard is a configuration of Operations Dashboard for ArcGIS that can be used by public works executives to monitor the status of right of way permits in their community.",
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
  "size": 52923,
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

export const ItemDataSuccessResponseDashboard: any = {
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
            },
            {
              "type": "tabsLayoutElement",
              "elements": [{
                  "type": "itemLayoutElement",
                  "id": "ff698ea5-2812-4ba5-a0ba-d89fc302f8f4",
                  "width": 1,
                  "height": 1,
                  "tabName": "Permit Type"
                },
                {
                  "type": "itemLayoutElement",
                  "id": "d2e11f43-8d61-422c-b7fe-00dc8a9c2b14",
                  "width": 1,
                  "height": 1,
                  "tabName": "Submission Date"
                }
              ],
              "width": 1,
              "height": 0.3
            }
          ],
          "width": 0.75,
          "height": 1
        },
        {
          "type": "groupLayoutElement",
          "orientation": "row",
          "elements": [{
              "type": "itemLayoutElement",
              "id": "3e796f16-722b-437f-89a4-e3787e105b24",
              "width": 1,
              "height": 0.25
            },
            {
              "type": "itemLayoutElement",
              "id": "0f994268-e553-4d11-b8d1-afecf0818841",
              "width": 1,
              "height": 0.75
            }
          ],
          "width": 0.25,
          "height": 1
        }
      ],
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
            },
            {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "3e796f16-722b-437f-89a4-e3787e105b24#main"
            },
            {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "0f994268-e553-4d11-b8d1-afecf0818841#main"
            },
            {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "ff698ea5-2812-4ba5-a0ba-d89fc302f8f4#main"
            },
            {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "d2e11f43-8d61-422c-b7fe-00dc8a9c2b14#main"
            }
          ]
        }],
        "datasets": [{
          "statisticDefinitions": [{
            "onStatisticField": "type",
            "outStatisticFieldName": "count_result",
            "statisticType": "count"
          }],
          "type": "serviceDataset",
          "outFields": [
            "*"
          ],
          "groupByFields": [
            "type"
          ],
          "orderByFields": [
            "type asc"
          ],
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
      },
      {
        "events": [{
          "type": "selectionChanged",
          "actions": [{
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "1200f3f1-8f72-4ea6-af16-14f19e9a4517#ROWPermitApplication_4605"
            },
            {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "3e796f16-722b-437f-89a4-e3787e105b24#main"
            },
            {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "0f994268-e553-4d11-b8d1-afecf0818841#main"
            },
            {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "ff698ea5-2812-4ba5-a0ba-d89fc302f8f4#main"
            },
            {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "d2e11f43-8d61-422c-b7fe-00dc8a9c2b14#main"
            }
          ]
        }],
        "datasets": [{
          "statisticDefinitions": [{
            "onStatisticField": "status",
            "outStatisticFieldName": "count_result",
            "statisticType": "count"
          }],
          "type": "serviceDataset",
          "outFields": [
            "*"
          ],
          "groupByFields": [
            "status"
          ],
          "orderByFields": [
            "status desc"
          ],
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
      },
      {
        "events": [{
          "type": "selectionChanged",
          "actions": [{
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "1200f3f1-8f72-4ea6-af16-14f19e9a4517#ROWPermitApplication_4605"
            },
            {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "3e796f16-722b-437f-89a4-e3787e105b24#main"
            },
            {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "0f994268-e553-4d11-b8d1-afecf0818841#main"
            },
            {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "ff698ea5-2812-4ba5-a0ba-d89fc302f8f4#main"
            },
            {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [],
              "targetId": "d2e11f43-8d61-422c-b7fe-00dc8a9c2b14#main"
            }
          ]
        }],
        "datasets": [{
          "statisticDefinitions": [{
            "onStatisticField": "moreinfo",
            "outStatisticFieldName": "count_result",
            "statisticType": "count"
          }],
          "type": "serviceDataset",
          "outFields": [
            "*"
          ],
          "groupByFields": [
            "moreinfo"
          ],
          "orderByFields": [
            "moreinfo asc"
          ],
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
      },
      {
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
            },
            {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [{
                "sourceName": "filterField",
                "targetName": "submitdt"
              }],
              "targetId": "3e796f16-722b-437f-89a4-e3787e105b24#main"
            },
            {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [{
                "sourceName": "filterField",
                "targetName": "submitdt"
              }],
              "targetId": "0f994268-e553-4d11-b8d1-afecf0818841#main"
            },
            {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [{
                "sourceName": "filterField",
                "targetName": "submitdt"
              }],
              "targetId": "ff698ea5-2812-4ba5-a0ba-d89fc302f8f4#main"
            },
            {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [{
                "sourceName": "filterField",
                "targetName": "submitdt"
              }],
              "targetId": "d2e11f43-8d61-422c-b7fe-00dc8a9c2b14#main"
            }
          ]
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
            },
            {
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
            },
            {
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
            },
            {
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
            },
            {
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
            }
          ]
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
      },
      {
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
            },
            {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [{
                "sourceName": "filterField",
                "targetName": "apprstartdt"
              }],
              "targetId": "3e796f16-722b-437f-89a4-e3787e105b24#main"
            },
            {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [{
                "sourceName": "filterField",
                "targetName": "apprstartdt"
              }],
              "targetId": "0f994268-e553-4d11-b8d1-afecf0818841#main"
            },
            {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [{
                "sourceName": "filterField",
                "targetName": "apprstartdt"
              }],
              "targetId": "ff698ea5-2812-4ba5-a0ba-d89fc302f8f4#main"
            },
            {
              "type": "filter",
              "by": "whereClause",
              "fieldMap": [{
                "sourceName": "filterField",
                "targetName": "apprstartdt"
              }],
              "targetId": "d2e11f43-8d61-422c-b7fe-00dc8a9c2b14#main"
            }
          ]
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
            },
            {
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
            },
            {
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
            },
            {
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
            }
          ]
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
      }
    ]
  },
  "widgets": [{
      "showNavigation": true,
      "events": [{
        "type": "extentChanged",
        "actions": [{
            "type": "filter",
            "by": "geometry",
            "targetId": "3e796f16-722b-437f-89a4-e3787e105b24#main"
          },
          {
            "type": "filter",
            "by": "geometry",
            "targetId": "0f994268-e553-4d11-b8d1-afecf0818841#main"
          },
          {
            "type": "filter",
            "by": "geometry",
            "targetId": "ff698ea5-2812-4ba5-a0ba-d89fc302f8f4#main"
          },
          {
            "type": "filter",
            "by": "geometry",
            "targetId": "d2e11f43-8d61-422c-b7fe-00dc8a9c2b14#main"
          }
        ]
      }],
      "flashRepeats": 3,
      "itemId": "1fb7fe5da4924b9aa608b08f865031e4",
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
      "name": "ROW Permit Map",
      "showLastUpdate": true
    },
    {
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
        "outFields": [
          "*"
        ],
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
    },
    {
      "datasets": [{
        "statisticDefinitions": [],
        "type": "serviceDataset",
        "outFields": [
          "*"
        ],
        "groupByFields": [],
        "orderByFields": [
          "submitdt desc"
        ],
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
          },
          {
            "type": "pan",
            "targetId": "1200f3f1-8f72-4ea6-af16-14f19e9a4517"
          }
        ]
      }],
      "backgroundColor": "#ffffff",
      "id": "0f994268-e553-4d11-b8d1-afecf0818841",
      "name": "ROW Permit List",
      "showLastUpdate": false
    },
    {
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
        },
        {
          "period": "mm",
          "pattern": "HH:mm"
        },
        {
          "period": "hh",
          "pattern": "HH:mm"
        },
        {
          "period": "DD",
          "pattern": "MMM d"
        },
        {
          "period": "MM",
          "pattern": "MMM"
        },
        {
          "period": "YYYY",
          "pattern": "yyyy"
        }
      ],
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
        "outFields": [
          "*"
        ],
        "groupByFields": [
          "type"
        ],
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
    },
    {
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
        },
        {
          "period": "mm",
          "pattern": "HH:mm"
        },
        {
          "period": "hh",
          "pattern": "HH:mm"
        },
        {
          "period": "DD",
          "pattern": "MMM d"
        },
        {
          "period": "MM",
          "pattern": "MMM"
        },
        {
          "period": "YYYY",
          "pattern": "yyyy"
        }
      ],
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
        "outFields": [
          "*"
        ],
        "groupByFields": [
          "submitdt"
        ],
        "orderByFields": [
          "submitdt asc"
        ],
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
    }
  ],
  "settings": {
    "maxPaginationRecords": 50000
  },
  "theme": "light"
};

export const ItemSuccessResponseWebmap: any = {
  "id": "map1234567890",
  "item": "map1234567890",
  "owner": "LocalGovTryItLive",
  "orgId": "Pu6Fai10JE2L2xUd",
  "created": 1520968139000,
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

export const ItemDataSuccessResponseWebmap: any = {
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

export const ItemSuccessResponseWMA: any = {
  "id": "wma1234567890",
  "item": "wma1234567890",
  "owner": "LocalGovTryItLive",
  "orgId": "org1234567890",
  "created": 1520968147000,
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

export const ItemDataSuccessResponseWMA: any = {
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

export const ItemSuccessResponseService: any = {
  "id": "svc1234567890",
  "item": "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer",
  "owner": "LocalGovTryItLive",
  "orgId": "org1234567890",
  "created": 1520968092000,
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

export const ItemDataSuccessResponseService: any = {
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