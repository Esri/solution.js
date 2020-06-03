/** @license
 * Copyright 2020 Esri
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

import { migrateSchema, CURRENT_SCHEMA_VERSION } from "../src/migrator";
import { cloneObject, IItemTemplate } from "@esri/hub-common";
import { ISolutionItem } from "../src/interfaces";
import * as twoDotTwo from "../src/migrations/upgrade-two-dot-two";
import * as twoDotThree from "../src/migrations/upgrade-two-dot-three";
import * as twoDotFour from "../src/migrations/upgrade-two-dot-four";
import * as twoDotFive from "../src/migrations/upgrade-two-dot-five";
import * as threeDotZero from "../src/migrations/upgrade-three-dot-zero";

describe("Schema Migrator", () => {
  const defaultModel = {
    item: {
      type: "Solution",
      typeKeywords: ["Solution", "Template"],
      properties: {
        schemaVersion: CURRENT_SCHEMA_VERSION
      }
    },
    data: {
      metadata: {},
      templates: [] as IItemTemplate[]
    }
  } as ISolutionItem;
  it("returns model if current schema", () => {
    const m = cloneObject(defaultModel);
    const chk = migrateSchema(m);
    expect(chk).toBe(m, "should return the exact same object");
  });
  it("stomps on current schema if not legacy", () => {
    const m = cloneObject(defaultModel);
    // kill the schema version
    delete m.item.properties.schemaVersion;
    const chk = migrateSchema(m);
    expect(chk).toBe(m, "should return the exact same object");
    expect(chk.item.properties.schemaVersion).toBe(
      3,
      "should upgrade to 3 if no schema"
    );
  });
  it("upgrades legacy Solutions", () => {
    const m = cloneObject(defaultModel);
    // kill the schema version
    m.item.properties.schemaVersion = 2.1;
    m.item.typeKeywords = ["hubSolutionTemplate", "solutionTemplate"];
    const sp1 = spyOn(twoDotTwo, "_upgradeTwoDotTwo").and.callFake(model => {
      return cloneObject(model);
    });
    const sp2 = spyOn(twoDotThree, "_upgradeTwoDotThree").and.callFake(
      model => {
        return cloneObject(model);
      }
    );
    const sp3 = spyOn(twoDotFour, "_upgradeTwoDotFour").and.callFake(model => {
      return cloneObject(model);
    });
    const sp4 = spyOn(twoDotFive, "_upgradeTwoDotFive").and.callFake(model => {
      return cloneObject(model);
    });
    const sp5 = spyOn(threeDotZero, "_upgradeThreeDotZero").and.callFake(
      model => {
        return cloneObject(model);
      }
    );
    const chk = migrateSchema(m);
    expect(sp1.calls.count()).toBe(1, "should call first upgrade");
    expect(sp2.calls.count()).toBe(1, "should call second upgrade");
    expect(sp3.calls.count()).toBe(1, "should call third upgrade");
    expect(sp4.calls.count()).toBe(1, "should call fourth upgrade");
    expect(sp5.calls.count()).toBe(1, "should call fifth upgrade");
    expect(chk).not.toBe(m, "should not return the exact same object");
    // since the upgrades are all spies, we don't make assertions on the schemaVersion
  });
  it("does nothing if v3.1", () => {
    // this test will go away once we have a 3.0 -> 3.1 migration but it covers an `else` case
    const m = cloneObject(defaultModel);
    m.item.properties.schemaVersion = 3.1;
    const chk = migrateSchema(m);
    expect(chk).toBe(m, "should return the exact same object");
    expect(chk.item.properties.schemaVersion).toBe(
      3.1,
      "should not change version"
    );
  });
});
