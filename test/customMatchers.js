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
    exports.CustomMatchers = {
        toHaveOrder: function (util, customEqualityTester) {
            return {
                compare: function (actual, expected) {
                    var iPredecessor = actual.indexOf(expected.predecessor);
                    var iSuccessor = actual.indexOf(expected.successor);
                    if (0 <= iPredecessor && iPredecessor < iSuccessor) {
                        return {
                            pass: true,
                            message: expected.predecessor + " precedes " + expected.successor
                        };
                    }
                    else {
                        return {
                            pass: false,
                            message: "Expected " + expected.predecessor + " to precede " + expected.successor
                        };
                    }
                }
            };
        }
    };
});
//# sourceMappingURL=customMatchers.js.map