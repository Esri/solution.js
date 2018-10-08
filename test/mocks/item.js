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
    exports.ItemFailResponse = {
        "name": "",
        "message": "Item or group does not exist or is inaccessible.",
        "originalMessage": "",
        "code": "400",
        "response": "",
        "url": "",
        "options": null
    };
});
//# sourceMappingURL=item.js.map