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
    var Dashboard = /** @class */ (function (_super) {
        tslib_1.__extends(Dashboard, _super);
        function Dashboard() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Dashboard.prototype.init = function (requestOptions) {
            var _this = this;
            return new Promise(function (resolve) {
                // Fetch item data section
                _super.prototype.init.call(_this, requestOptions)
                    .then(function () {
                    // Extract the dependencies
                    if (_this.dataSection && _this.dataSection.widgets) {
                        var widgets = _this.dataSection.widgets;
                        widgets.forEach(function (widget) {
                            if (widget.type === "mapWidget") {
                                _this.dependencies.push(widget.itemId);
                            }
                        });
                    }
                    resolve(_this);
                });
            });
        };
        return Dashboard;
    }(item_1.Item));
    exports.Dashboard = Dashboard;
});
//# sourceMappingURL=dashboard.js.map