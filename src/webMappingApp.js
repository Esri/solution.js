/* Copyright (c) 2018 Esri
 * Apache-2.0 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./item"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var item_1 = require("./item");
    /**
     *  AGOL web map application item
     */
    var WebMappingApp = /** @class */ (function (_super) {
        tslib_1.__extends(WebMappingApp, _super);
        function WebMappingApp() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        WebMappingApp.prototype.init = function (requestOptions) {
            var _this = this;
            return new Promise(function (resolve) {
                // Fetch item data section
                _super.prototype.init.call(_this, requestOptions)
                    .then(function () {
                    // Extract the dependencies
                    if (_this.dataSection && _this.dataSection.values) {
                        var values = _this.dataSection.values;
                        if (values.webmap) {
                            _this.dependencies.push(values.webmap);
                        }
                        if (values.group) {
                            _this.dependencies.push(values.group);
                        }
                    }
                    resolve(_this);
                });
            });
        };
        return WebMappingApp;
    }(item_1.Item));
    exports.WebMappingApp = WebMappingApp;
});
//# sourceMappingURL=webMappingApp.js.map