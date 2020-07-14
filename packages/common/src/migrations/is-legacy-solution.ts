/** @license
 * Copyright 2018 Esri
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

import { ISolutionItem } from "../interfaces";
import { getProp } from "../generalHelpers";

/**
 * Determine if the Solution is a legacy item created by Hub
 * vs one that is 100% compatible with Solution.js
 * @param model ISolutionModel
 * @private
 */
export function _isLegacySolution(model: ISolutionItem): boolean {
  let result = false;
  // if it does not have the `Template` keyword BUT does have `hubSolutionTemplate` it is legacy
  const keywords = getProp(model, "item.typeKeywords") || [];
  if (!keywords.includes("Template")) {
    if (
      keywords.includes("hubSolutionTemplate") &&
      keywords.includes("solutionTemplate")
    ) {
      result = true;
    }
  }
  return result;
}
