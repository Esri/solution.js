/* Copyright (c) 2018 Esri
 * Apache-2.0 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./agolItem", "./dashboard", "./featureService", "./group", "./item", "./itemFactory", "./solution", "./webmap", "./webMappingApp"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    tslib_1.__exportStar(require("./agolItem"), exports);
    tslib_1.__exportStar(require("./dashboard"), exports);
    tslib_1.__exportStar(require("./featureService"), exports);
    tslib_1.__exportStar(require("./group"), exports);
    tslib_1.__exportStar(require("./item"), exports);
    tslib_1.__exportStar(require("./itemFactory"), exports);
    tslib_1.__exportStar(require("./solution"), exports);
    tslib_1.__exportStar(require("./webmap"), exports);
    tslib_1.__exportStar(require("./webMappingApp"), exports);
});
//# sourceMappingURL=clone.js.map