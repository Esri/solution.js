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

import { ISolutionItem } from "./interfaces";
import { _isLegacySolution } from "./migrations/is-legacy-solution";
import { _upgradeThreeDotZero } from "./migrations/upgrade-three-dot-zero";
import { _upgradeTwoDotTwo } from "./migrations/upgrade-two-dot-two";
import { _upgradeTwoDotThree } from "./migrations/upgrade-two-dot-three";
import { _upgradeTwoDotFour } from "./migrations/upgrade-two-dot-four";
import { _upgradeTwoDotFive } from "./migrations/upgrade-two-dot-five";
import { getProp } from "@esri/hub-common";

// Starting at 3.0 because Hub has been versioning Solution items up to 2.x
export const CURRENT_SCHEMA_VERSION = 3.0;

/**
 * Apply schema migrations to a Solution item
 * This system allows the schema of the Solution item to change over time
 * while abstracting those changes into a single set of functional transforms
 * @param model ISolutionItem
 */
export function migrateSchema(model: ISolutionItem): ISolutionItem {
  // ensure properties
  if (!getProp(model, "item.properties")) {
    model.item.properties = {};
  }

  const modelVersion = getProp(model, "item.properties.schemaVersion");
  // if it's already on the current version, return it
  if (modelVersion === CURRENT_SCHEMA_VERSION) {
    return model;
  } else {
    // check if this is a legacy solution created by Hub
    const isLegacy = _isLegacySolution(model);
    // if this is a Solution.js "native" item, it is already at 3.0
    if (!modelVersion && !isLegacy) {
      // bump it up to 3.0
      model.item.properties.schemaVersion = CURRENT_SCHEMA_VERSION;
    } else {
      // Hub created a set of Solution items that are not 100% compatible
      // with the Solution.js deployer.
      // The schemaVersion of these items is 2.1 - prior to that we used
      // Web Mapping Application items, which are deprecated
      if (modelVersion >= 2.1 && modelVersion < 3) {
        model = _upgradeTwoDotTwo(model);
        model = _upgradeTwoDotThree(model);
        model = _upgradeThreeDotZero(model);
        model = _upgradeTwoDotFour(model);
        model = _upgradeTwoDotFive(model);
      }
      // When we need to apply schema upgrades 3.0+ we add those here...
    }
    return model;
  }
}
