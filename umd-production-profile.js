"use strict";
exports.__esModule = true;
var umd_base_profile_js_1 = require("./umd-base-profile.js");
var rollup_plugin_terser_1 = require("rollup-plugin-terser");
var rollup_plugin_filesize_1 = require("rollup-plugin-filesize");
// use umd.min.js
umd_base_profile_js_1["default"].output.file = umd_base_profile_js_1["default"].output.file.replace(".umd.", ".umd.min.");
umd_base_profile_js_1["default"].plugins.push((0, rollup_plugin_filesize_1["default"])());
umd_base_profile_js_1["default"].plugins.push((0, rollup_plugin_terser_1.terser)({
    output: { comments: /@preserve/ }
}));
exports["default"] = umd_base_profile_js_1["default"];
