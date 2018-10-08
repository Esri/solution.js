/* Copyright (c) 2018 Esri
 * Apache-2.0 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@esri/arcgis-rest-items", "./agolItem"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var items = require("@esri/arcgis-rest-items");
    var agolItem_1 = require("./agolItem");
    var Item = /** @class */ (function (_super) {
        tslib_1.__extends(Item, _super);
        function Item() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Performs item-specific initialization.
         *
         * @param requestOptions Options for initialization request for item's data section
         * @returns A promise that will resolve with the item
         */
        Item.prototype.init = function (requestOptions) {
            var _this = this;
            return new Promise(function (resolve) {
                // Fetch item data section
                items.getItemData(_this.itemSection.id, requestOptions)
                    .then(function (dataSection) {
                    _this.dataSection = dataSection;
                    resolve(_this);
                }, function () {
                    // Items without a data section return an error from the REST library
                    resolve(_this);
                });
            });
        };
        return Item;
    }(agolItem_1.AgolItem));
    exports.Item = Item;
});
//# sourceMappingURL=item.js.map