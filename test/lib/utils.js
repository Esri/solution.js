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
    exports.TOMORROW = (function () {
        var now = new Date();
        now.setDate(now.getDate() + 1);
        return now;
    })();
    exports.YESTERDAY = (function () {
        var now = new Date();
        now.setDate(now.getDate() - 1);
        return now;
    })();
});
//# sourceMappingURL=utils.js.map