/** @license
 * Copyright 2019 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// @esri/solution-common getItemInfo example
define(["require", "exports", "tslib", "@esri/solution-common"], function (require, exports, tslib_1, common) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getItemInfo = void 0;
    function getItemInfo(itemId, authentication) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!itemId) {
                reject("Item's ID is not defined");
                return;
            }
            // Get the item information
            var itemFwdRelatedItemsDef = common.getItemRelatedItemsInSameDirection(itemId, "forward", authentication);
            var itemRevRelatedItemsDef = common.getItemRelatedItemsInSameDirection(itemId, "reverse", authentication);
            var itemBaseDef = common.getItemBase(itemId, authentication);
            var itemDataDef = new Promise(function (resolve2, reject2) {
                // tslint:disable-next-line: no-floating-promises
                itemBaseDef.then(
                // any error fetching item base will be handled via Promise.all later
                function (itemBase) {
                    common
                        .getItemDataAsFile(itemId, itemBase.name, authentication)
                        .then(resolve2, function (error) { return reject2(JSON.stringify(error)); });
                });
            });
            var itemThumbnailDef = new Promise(function (resolve3, reject3) {
                // tslint:disable-next-line: no-floating-promises
                itemBaseDef.then(
                // any error fetching item base will be handled via Promise.all later
                function (itemBase) {
                    common
                        .getItemThumbnail(itemId, itemBase.thumbnail, false, authentication)
                        .then(resolve3, function (error) { return reject3(JSON.stringify(error)); });
                });
            });
            var itemMetadataDef = common.getItemMetadataBlob(itemId, authentication);
            var itemResourcesDef = common.getItemResourcesFiles(itemId, authentication);
            Promise.all([
                itemBaseDef,
                itemDataDef,
                itemThumbnailDef,
                itemMetadataDef,
                itemResourcesDef,
                itemFwdRelatedItemsDef,
                itemRevRelatedItemsDef
            ]).then(function (responses) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var itemBase, itemDataFile, itemThumbnail, itemMetadataBlob, itemResourceFiles, itemFwdRelatedItems, itemRevRelatedItems, portalUrl, html, _a, _b, _c, i, _d, _i, itemFwdRelatedItems_1, relatedItem, _e, itemRevRelatedItems_1, relatedItem, formInfoFilenames;
                var _this = this;
                return tslib_1.__generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            itemBase = responses[0], itemDataFile = responses[1], itemThumbnail = responses[2], itemMetadataBlob = responses[3], itemResourceFiles = responses[4], itemFwdRelatedItems = responses[5], itemRevRelatedItems = responses[6];
                            // Summarize what we have
                            // ----------------------
                            // (itemBase: any)  text/plain JSON
                            // (itemData: File)  */*
                            // (itemThumbnail: Blob)  image/*
                            // (itemMetadata: Blob)  application/xml
                            // (itemResources: File[])  list of */*
                            // (itemFwdRelatedItems: common.IRelatedItems[])  list of forward relationshipType/relatedItems[] pairs
                            // (itemRevRelatedItems: common.IRelatedItems[])  list of reverse relationshipType/relatedItems[] pairs
                            console.log("itemBase", itemBase);
                            console.log("itemData", itemDataFile);
                            console.log("itemThumbnail", itemThumbnail);
                            console.log("itemMetadata", itemMetadataBlob);
                            console.log("itemResources", JSON.stringify(itemResourceFiles));
                            console.log("itemFwdRelatedItems", JSON.stringify(itemFwdRelatedItems));
                            console.log("itemRevRelatedItems", JSON.stringify(itemRevRelatedItems));
                            portalUrl = common.getPortalUrlFromAuth(authentication);
                            html = "<h3>" +
                                itemBase.type +
                                ' "' +
                                itemBase.title +
                                '" (<a href="' +
                                portalUrl +
                                "/home/item.html?id=" +
                                itemBase.id +
                                '" target="_blank">' +
                                itemBase.id +
                                "</a>)</h3>";
                            html +=
                                '<div style="width:48%;display:inline-block;">Item</div>' +
                                    '<div style="width:2%;display:inline-block;"></div>' +
                                    '<div style="width:48%;display:inline-block;">Data</div>' +
                                    '<div style="width:48%;display:inline-block;">' +
                                    textAreaHtml(JSON.stringify(itemBase, null, 2)) +
                                    '</div><div style="width:2%;display:inline-block;"></div>' +
                                    '<div style="width:48%;display:inline-block;vertical-align: top;">';
                            _a = html;
                            return [4 /*yield*/, showBlob(itemDataFile)];
                        case 1:
                            html = _a + _f.sent();
                            html += "</div>";
                            // Show thumbnail section
                            html += "<p>Thumbnail<br/><div>";
                            _b = html;
                            return [4 /*yield*/, showBlob(itemThumbnail)];
                        case 2:
                            html = _b + _f.sent();
                            html += "</div></p>";
                            // Show metadata section
                            html += "<p>Metadata<br/><div>";
                            _c = html;
                            return [4 /*yield*/, showBlob(itemMetadataBlob)];
                        case 3:
                            html = _c + _f.sent();
                            html += "</div></p>";
                            // Show resources section
                            html += "<p>Resources<br/>";
                            if (!(itemResourceFiles.length === 0)) return [3 /*break*/, 4];
                            html += "<p><i>none</i>";
                            return [3 /*break*/, 9];
                        case 4:
                            html += "<ol>";
                            i = 0;
                            _f.label = 5;
                        case 5:
                            if (!(i < itemResourceFiles.length)) return [3 /*break*/, 8];
                            html += "<li><div>";
                            _d = html;
                            return [4 /*yield*/, showBlob(itemResourceFiles[i])];
                        case 6:
                            html = _d + _f.sent();
                            html += "</div></li>";
                            _f.label = 7;
                        case 7:
                            ++i;
                            return [3 /*break*/, 5];
                        case 8:
                            html += "</ol>";
                            _f.label = 9;
                        case 9:
                            html += "</p>";
                            // Show related items section
                            html += "<p>Related Items<br/>";
                            if (itemFwdRelatedItems.length === 0 &&
                                itemRevRelatedItems.length === 0) {
                                html += "<p><i>none</i>";
                            }
                            else {
                                html +=
                                    "<ul style='margin-left:-36px;list-style-type:none;font-size:smaller;'>";
                                for (_i = 0, itemFwdRelatedItems_1 = itemFwdRelatedItems; _i < itemFwdRelatedItems_1.length; _i++) {
                                    relatedItem = itemFwdRelatedItems_1[_i];
                                    html +=
                                        "<li>&rarr; " +
                                            relatedItem.relationshipType +
                                            " " +
                                            JSON.stringify(relatedItem.relatedItemIds) +
                                            "</li>";
                                }
                                for (_e = 0, itemRevRelatedItems_1 = itemRevRelatedItems; _e < itemRevRelatedItems_1.length; _e++) {
                                    relatedItem = itemRevRelatedItems_1[_e];
                                    html +=
                                        "<li>&larr; " +
                                            relatedItem.relationshipType +
                                            " " +
                                            JSON.stringify(relatedItem.relatedItemIds) +
                                            "</li>";
                                }
                                html += "</ul>";
                            }
                            html += "</p>";
                            // Show sections custom to item types
                            if (itemBase.type === "Feature Service") {
                                if (authentication.token) {
                                    // These queries require authentication
                                    // Show resources section
                                    common
                                        .getFeatureServiceProperties(itemBase.url, authentication)
                                        .then(function (properties) {
                                        html += "<p>Feature Service Properties<br/>";
                                        html +=
                                            "<p><i>Service description</i><br/>" +
                                                textAreaHtml(JSON.stringify(properties.service, null, 2)) +
                                                "</p>";
                                        html += "<p><i>Layers</i>";
                                        properties.layers.forEach(function (layer) {
                                            return (html += textAreaHtml(JSON.stringify(layer, null, 2)));
                                        });
                                        html += "</p>";
                                        html += "<p><i>Tables</i>";
                                        properties.tables.forEach(function (layer) {
                                            return (html += textAreaHtml(JSON.stringify(layer, null, 2)));
                                        });
                                        html += "</p>";
                                        html += "</p>";
                                        resolve(html);
                                    }, function (error) { return reject(JSON.stringify(error)); });
                                }
                                else {
                                    resolve(html);
                                }
                            }
                            else if (itemBase.type === "Form") {
                                formInfoFilenames = [
                                    "form.json",
                                    "forminfo.json",
                                    "form.webform"
                                ];
                                // tslint:disable-next-line: no-floating-promises
                                Promise.all(common.getInfoFiles(itemId, formInfoFilenames, authentication))
                                    .then(function (results) { return results.filter(function (result) { return !!result; }); })
                                    .then(
                                // (itemFormInfoFiles: Blob[3])  list of a Form's "form.json", "forminfo.json", & "form.webform" info files
                                function (formFiles) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                    var i, _a;
                                    return tslib_1.__generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                formFiles = formFiles.filter(function (result) { return !!result; });
                                                console.log("formFiles", formFiles);
                                                html += "<p>Form Files<br/>";
                                                if (!(formFiles.length === 0)) return [3 /*break*/, 1];
                                                html += "<p><i>none</i>";
                                                return [3 /*break*/, 6];
                                            case 1:
                                                html += "<ol>";
                                                i = 0;
                                                _b.label = 2;
                                            case 2:
                                                if (!(i < formFiles.length)) return [3 /*break*/, 5];
                                                html += "<li><div>";
                                                _a = html;
                                                return [4 /*yield*/, showBlob(formFiles[i])];
                                            case 3:
                                                html = _a + _b.sent();
                                                html += "</div></li>";
                                                _b.label = 4;
                                            case 4:
                                                ++i;
                                                return [3 /*break*/, 2];
                                            case 5:
                                                html += "</ol>";
                                                _b.label = 6;
                                            case 6:
                                                html += "</p>";
                                                resolve(html);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); });
                            }
                            else {
                                resolve(html);
                            }
                            return [2 /*return*/];
                    }
                });
            }); }, function (error) { return reject(JSON.stringify(error)); });
        });
    }
    exports.getItemInfo = getItemInfo;
    /**
     * Creates the HTML for a textarea using the supplied text.
     *
     * @param text Text to insert into textarea
     * @return textarea HTML
     */
    function textAreaHtml(text) {
        return ('<textarea rows="10" style="width:99%;font-size:x-small">' +
            text +
            "</textarea>");
    }
    /**
     * Creates the HTML for a blob.
     *
     * @param blob Blob or File to display
     * @return Promise resolving to a string of HTML
     */
    function showBlob(blob) {
        // tslint:disable-next-line: no-floating-promises
        return new Promise(function (resolve) {
            if (!blob || blob.size === 0) {
                resolve("<i>none</i>");
                return;
            }
            var file = blob;
            var filename = file.name || "";
            // Make sure that a JSON file has the right MIME type; forms have a JSON file with an unsupported extension
            if (filename.endsWith(".json")) {
                blob = common.convertResourceToFile({
                    blob: file,
                    filename: filename,
                    mimeType: "application/json"
                });
            }
            if (blob.type === "application/json") {
                common.blobToJson(blob).then(function (text) {
                    return resolve(textAreaHtml(JSON.stringify(text, null, 2)) + addFilename(filename));
                }, function (error) { return resolve("<i>problem extracting JSON: " + error + "</i>"); });
            }
            else if (blob.type.startsWith("text/plain") ||
                blob.type === "text/xml" ||
                blob.type === "application/xml") {
                common.blobToText(blob).then(function (text) { return resolve(textAreaHtml(text) + addFilename(filename)); }, function (error) { return resolve("<i>problem extracting text: " + error + "</i>"); });
            }
            else if (blob.type.startsWith("image/")) {
                var html = '<img src="' +
                    window.URL.createObjectURL(blob) +
                    '" style="max-width:256px;border:1px solid lightgray;"/>';
                if (filename) {
                    html +=
                        '&nbsp;&nbsp;&nbsp;&nbsp;<a href="' +
                            window.URL.createObjectURL(file) +
                            '" download="' +
                            filename +
                            '">' +
                            filename +
                            "</a>";
                }
                html += "</p>";
                resolve(html);
            }
            else {
                if (filename) {
                    resolve('<a href="' +
                        window.URL.createObjectURL(file) +
                        '" download="' +
                        filename +
                        '">' +
                        filename +
                        "</a>");
                }
                else {
                    resolve('<a href="' +
                        window.URL.createObjectURL(blob) +
                        '">' +
                        blob.type +
                        "</a>");
                }
            }
        });
    }
    function addFilename(filename) {
        return filename ? "&nbsp;" + filename : "";
    }
});
//# sourceMappingURL=getItemInfo.js.map