/* Copyright (c) 2018 Esri
 * Apache-2.0 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@esri/arcgis-rest-items", "@esri/arcgis-rest-sharing"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var items = require("@esri/arcgis-rest-items");
    var sharing = require("@esri/arcgis-rest-sharing");
    var SolutionItem = /** @class */ (function () {
        function SolutionItem() {
        }
        /**
         * Creates a Solution item containing JSON descriptions of items forming the solution.
         *
         * @param title Title for Solution item to create
         * @param collection List of JSON descriptions of items to publish into Solution
         * @param access Access to set for item: 'public', 'org', 'private'
         * @param requestOptions Options for the request
         * @returns A promise that will resolve with an object reporting success and the Solution id
         */
        SolutionItem.publishItemJSON = function (title, collection, access, requestOptions) {
            return new Promise(function (resolve) {
                // Define the solution item
                var itemSection = {
                    title: title,
                    type: 'Solution',
                    itemType: 'text',
                    access: access,
                    listed: false,
                    commentsEnabled: false
                };
                var dataSection = {
                    items: collection
                };
                // Create it and add its data section
                var options = tslib_1.__assign({ title: title, item: itemSection }, requestOptions);
                items.createItem(options)
                    .then(function (results) {
                    if (results.success) {
                        var options_1 = tslib_1.__assign({ id: results.id, data: dataSection }, requestOptions);
                        items.addItemJsonData(options_1)
                            .then(function (results) {
                            // Set the access manually since the access value in createItem appears to be ignored
                            var options = tslib_1.__assign({ id: results.id, access: access }, requestOptions);
                            sharing.setItemAccess(options)
                                .then(function (results) {
                                resolve({
                                    success: true,
                                    id: results.itemId
                                });
                            });
                        });
                    }
                });
            });
        };
        return SolutionItem;
    }());
    exports.SolutionItem = SolutionItem;
});
//# sourceMappingURL=agolSupport.js.map