/* Copyright (c) 2018 Esri
 * Apache-2.0 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@esri/arcgis-rest-groups", "./agolItem"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var groups = require("@esri/arcgis-rest-groups");
    var agolItem_1 = require("./agolItem");
    var Group = /** @class */ (function (_super) {
        tslib_1.__extends(Group, _super);
        function Group() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * AGOL item type name
             */
            _this.type = "Group";
            return _this;
        }
        Group.prototype.init = function (requestOptions) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var pagingRequest = tslib_1.__assign({ paging: {
                        start: 0,
                        num: 100
                    } }, requestOptions);
                // Fetch group items
                _this.getGroupContentsTranche(_this.itemSection.id, pagingRequest)
                    .then(function (contents) {
                    _this.dependencies = contents;
                    resolve(_this);
                }, function (error) {
                    reject(error);
                });
            });
        };
        Group.prototype.getGroupContentsTranche = function (id, pagingRequest) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                // Fetch group items
                groups.getGroupContent(id, pagingRequest)
                    .then(function (contents) {
                    // Extract the list of content ids from the JSON returned
                    var trancheIds = contents.items.map(function (item) { return item.id; });
                    //console.log(JSON.stringify(trancheIds));
                    // Are there more contents to fetch?
                    if (contents.nextStart > 0) {
                        pagingRequest.paging.start = contents.nextStart;
                        _this.getGroupContentsTranche(id, pagingRequest)
                            .then(function (allSubsequentTrancheIds) {
                            // Append all of the following tranches to this tranche and return it
                            Array.prototype.push.apply(trancheIds, allSubsequentTrancheIds);
                            resolve(trancheIds);
                        }, function () {
                            resolve(trancheIds);
                        });
                    }
                    else {
                        resolve(trancheIds);
                    }
                }, function (error) {
                    reject(error);
                });
            });
        };
        return Group;
    }(agolItem_1.AgolItem));
    exports.Group = Group;
});
//# sourceMappingURL=group.js.map