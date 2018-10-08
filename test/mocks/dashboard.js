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
    exports.DashboardItemSuccessResponse = {
        "id": "abc123",
        "owner": "LocalGovTryItLive",
        "created": 1520967813000,
        "modified": 1525447266000,
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
        "spatialReference": null,
        "culture": "en-us",
        "properties": null,
        "url": null,
        "protected": false
    };
    exports.DashboardItemDataSuccessResponse = {
        "version": 24,
        "layout": {},
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
            "selectors": []
        },
        "widgets": [{
                "showNavigation": true,
                "events": [],
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
                "type": "indicatorWidget",
                "id": "3e796f16-722b-437f-89a4-e3787e105b24",
                "name": "ROW Permit Count",
                "showLastUpdate": false
            },
            {
                "type": "listWidget",
                "id": "0f994268-e553-4d11-b8d1-afecf0818841",
                "name": "ROW Permit List",
                "showLastUpdate": false
            },
            {
                "type": "serialChartWidget",
                "id": "d2e11f43-8d61-422c-b7fe-00dc8a9c2b14",
                "name": "Submission Date",
                "showLastUpdate": false
            }
        ]
    };
});
//# sourceMappingURL=dashboard.js.map