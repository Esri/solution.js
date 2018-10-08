/* Copyright (c) 2018 Esri
 * Apache-2.0 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@esri/arcgis-rest-request", "./item"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var arcgis_rest_request_1 = require("@esri/arcgis-rest-request");
    var item_1 = require("./item");
    /**
     *  AGOL web map application item
     */
    var FeatureService = /** @class */ (function (_super) {
        tslib_1.__extends(FeatureService, _super);
        function FeatureService() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * Service description
             */
            _this.serviceSection = {};
            /**
             * Description for each layer
             */
            _this.layers = [];
            /**
             * Description for each table
             */
            _this.tables = [];
            return _this;
        }
        FeatureService.prototype.init = function (requestOptions) {
            var _this = this;
            return new Promise(function (resolve) {
                // Fetch item data section
                _super.prototype.init.call(_this, requestOptions)
                    .then(function () {
                    // To have enough information for reconstructing the service, we'll supplement
                    // the item and data sections with sections for the service, full layers, and 
                    // full tables
                    // Get the service description
                    var serviceUrl = _this.itemSection.url;
                    arcgis_rest_request_1.request(serviceUrl + "?f=json", requestOptions)
                        .then(function (serviceData) {
                        // Fill in some missing parts
                        serviceData["name"] = _this.itemSection["name"];
                        serviceData["snippet"] = _this.itemSection["snippet"];
                        serviceData["description"] = _this.itemSection["description"];
                        // If the service doesn't have a name, try to get a name from its layers or tables
                        serviceData["name"] = serviceData["name"] ||
                            _this.getFirstUsableName(serviceData["layers"]) ||
                            _this.getFirstUsableName(serviceData["tables"]) ||
                            "Feature Service";
                        _this.serviceSection = serviceData;
                        // Get the affiliated layer and table items
                        var layersPromise = _this.getLayers(serviceUrl, serviceData["layers"], requestOptions);
                        var tablesPromise = _this.getLayers(serviceUrl, serviceData["tables"], requestOptions);
                        Promise.all([layersPromise, tablesPromise])
                            .then(function (results) {
                            _this.layers = results[0];
                            _this.tables = results[1];
                            resolve(_this);
                        });
                    });
                });
            });
        };
        FeatureService.prototype.getLayers = function (serviceUrl, layerList, requestOptions) {
            return new Promise(function (resolve) {
                if (!Array.isArray(layerList)) {
                    resolve([]);
                }
                var requestsDfd = [];
                layerList.forEach(function (layer) {
                    requestsDfd.push(arcgis_rest_request_1.request(serviceUrl + "/" + layer["id"] + "?f=json", requestOptions));
                });
                // Wait until all layers are heard from
                Promise.all(requestsDfd)
                    .then(function (layers) {
                    // Remove the editFieldsInfo because it references fields that may not be in the layer/table
                    layers.forEach(function (layer) {
                        layer["editFieldsInfo"] = null;
                    });
                    resolve(layers);
                });
            });
        };
        FeatureService.prototype.getFirstUsableName = function (layerList) {
            // Return the first layer name found
            if (layerList !== null) {
                layerList.forEach(function (layer) {
                    if (layer["name"] !== "") {
                        return layer["name"];
                    }
                });
            }
            return "";
        };
        return FeatureService;
    }(item_1.Item));
    exports.FeatureService = FeatureService;
});
//# sourceMappingURL=featureService.js.map