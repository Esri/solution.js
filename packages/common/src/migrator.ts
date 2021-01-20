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
import { _applySchema } from "./migrations/apply-schema";
import { _upgradeTwoDotZero } from "./migrations/upgrade-two-dot-zero";
import { _upgradeTwoDotOne } from "./migrations/upgrade-two-dot-one";
import { _upgradeTwoDotTwo } from "./migrations/upgrade-two-dot-two";
import { _upgradeTwoDotThree } from "./migrations/upgrade-two-dot-three";
import { _upgradeTwoDotFour } from "./migrations/upgrade-two-dot-four";
import { _upgradeTwoDotFive } from "./migrations/upgrade-two-dot-five";
import { _upgradeTwoDotSix } from "./migrations/upgrade-two-dot-six";
import { _upgradeTwoDotSeven } from "./migrations/upgrade-two-dot-seven";
import { _upgradeThreeDotZero } from "./migrations/upgrade-three-dot-zero";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { _upgradeThreeDotOne } from "./migrations/upgrade-three-dot-one";

import { getProp } from "@esri/hub-common";

// Starting at 3.0 because Hub has been versioning Solution items up to 2.x
export const CURRENT_SCHEMA_VERSION = 3.0;

/**
 * Apply schema migrations to a Solution item
 * This system allows the schema of the Solution item to change over time
 * while abstracting those changes into a single set of functional transforms
 *
 * @param model ISolutionItem
 */
export function migrateSchema(model: ISolutionItem): Promise<ISolutionItem> {
  // ensure properties
  if (!getProp(model, "item.properties")) {
    model.item.properties = {};
  }

  const modelVersion = getProp(model, "item.properties.schemaVersion");
  // if it's already on the current version, return it
  if (modelVersion === CURRENT_SCHEMA_VERSION) {
    return Promise.resolve(model);
  } else {
    // check if this is a legacy solution created by Hub
    const isLegacy = _isLegacySolution(model);
    const schemaUpgrades = [];

    // if this is a Solution.js "native" item, it is already at 3.0
    if (!modelVersion && !isLegacy) {
      // apply the 3.0+ transforms
      // TEMP to allow merge to develop w/o breaking things
      schemaUpgrades.push(_upgradeThreeDotZero);
      // schemaUpgrades.push(_upgradeThreeDotZero, _upgradeThreeDotOne);
    } else {
      // Hub created a set of Solution items that are not 100% compatible
      // with the Solution.js deployer.
      schemaUpgrades.push(
        _applySchema,
        _upgradeTwoDotZero,
        _upgradeTwoDotOne,
        _upgradeTwoDotTwo,
        _upgradeTwoDotThree,
        _upgradeTwoDotFour,
        _upgradeTwoDotFive,
        _upgradeTwoDotSix,
        _upgradeTwoDotSeven
      );
      // Apply the 3.x upgrades
      schemaUpgrades.push(
        _upgradeThreeDotZero
        // _upgradeThreeDotOne // Not ready for prod yet
      );
    }
    // Run any migrations serially. Since we start with a promise,
    // individual migrations are free to return either ISolutionItem
    // or Promise<ISolutionItem>
    return schemaUpgrades.reduce(
      (promise, upgradeFn) =>
        promise.then((updatedModel: ISolutionItem) => upgradeFn(updatedModel)),
      Promise.resolve(model)
    );
  }
}
