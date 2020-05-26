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
// @esri/solution-creator createSolution example
define(["require", "exports", "../lib/creator.umd.min", "./getItemInfo"], function (require, exports, creator, getItemInfo) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createSolution = void 0;
    function createSolution(sourceId, authentication, progressCallback) {
        return new Promise(function (resolve, reject) {
            if (!sourceId) {
                reject("The group or item ID is not defined");
                return;
            }
            // Create a solution from the supplied id
            var options = {
                progressCallback: progressCallback
            };
            creator.createSolution(sourceId.trim(), authentication, options).then(function (createdSolutionId) {
                getItemInfo.getItemInfo(createdSolutionId, authentication).then(function (itemInfoHtml) { return resolve(itemInfoHtml); }, function (error) { return reject(error.error); });
            }, function (error) { return reject(error); });
        });
    }
    exports.createSolution = createSolution;
});
//# sourceMappingURL=main.js.map