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
import * as applyOne from "../src/migrations/apply-schema";
import * as twoDotZero from "../src/migrations/upgrade-two-dot-zero";
import * as twoDotOne from "../src/migrations/upgrade-two-dot-one";
import * as twoDotTwo from "../src/migrations/upgrade-two-dot-two";
import * as twoDotThree from "../src/migrations/upgrade-two-dot-three";
import * as twoDotFour from "../src/migrations/upgrade-two-dot-four";
import * as twoDotFive from "../src/migrations/upgrade-two-dot-five";
import * as twoDotSix from "../src/migrations/upgrade-two-dot-six";
import * as twoDotSeven from "../src/migrations/upgrade-two-dot-seven";
import * as threeDotZero from "../src/migrations/upgrade-three-dot-zero";
import * as threeDotOne from "../src/migrations/upgrade-three-dot-one";
import * as utils from "../../common/test/mocks/utils";

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
  const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
  it("returns model if current schema", done => {
    const m = cloneObject(defaultModel);
    migrateSchema(m)
      .then(chk => {
        expect(chk).toBe(m, "should return the exact same object");
        done();
      })
      .catch(done.fail);
  });
  it("upgrades schemaless to current", done => {
    const m = cloneObject(defaultModel);
    // kill the item properties
    delete m.item.properties;
    migrateSchema(m)
      .then(chk => {
        expect(chk).not.toBe(m, "should return the exact same object");
        expect(chk.item.properties.schemaVersion).toBe(
          CURRENT_SCHEMA_VERSION,
          `should upgrade to ${CURRENT_SCHEMA_VERSION} if no schema`
        );
        done();
      })
      .catch(done.fail);
  });
  it("upgrades legacy Solutions", done => {
    const m = cloneObject(defaultModel);
    // kill the schema version
    delete m.item.properties.schemaVersion;
    // change to web mapping application
    m.item.type = "Web Mapping Application";
    m.item.typeKeywords = ["hubSolutionTemplate", "solutionTemplate"];

    const as = spyOn(applyOne, "_applySchema").and.callFake(model => {
      return cloneObject(model);
    });
    const sp20 = spyOn(twoDotZero, "_upgradeTwoDotZero").and.callFake(model => {
      return cloneObject(model);
    });
    const sp21 = spyOn(twoDotOne, "_upgradeTwoDotOne").and.callFake(model => {
      return cloneObject(model);
    });
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
    const sp5 = spyOn(twoDotSix, "_upgradeTwoDotSix").and.callFake(model => {
      return cloneObject(model);
    });
    const sp6 = spyOn(twoDotSeven, "_upgradeTwoDotSeven").and.callFake(
      model => {
        return cloneObject(model);
      }
    );
    const threeZeroUpgradeSpy = spyOn(
      threeDotZero,
      "_upgradeThreeDotZero"
    ).and.callFake(model => {
      return cloneObject(model);
    });
    const threeOneUpgradeSpy = spyOn(
      threeDotOne,
      "_upgradeThreeDotOne"
    ).and.callFake(model => {
      return cloneObject(model);
    });
    migrateSchema(m)
      .then(chk => {
        expect(as.calls.count()).toBe(1, "should apply schema");
        expect(sp20.calls.count()).toBe(1, "should apply 2.0");
        expect(sp21.calls.count()).toBe(1, "should apply 2.1");
        expect(sp1.calls.count()).toBe(1, "should call first upgrade");
        expect(sp2.calls.count()).toBe(1, "should call second upgrade");
        expect(sp3.calls.count()).toBe(1, "should call third upgrade");
        expect(sp4.calls.count()).toBe(1, "should call fourth upgrade");
        expect(sp5.calls.count()).toBe(1, "should call fifth upgrade");
        expect(sp6.calls.count()).toBe(1, "should call sixth upgrade");
        expect(threeZeroUpgradeSpy.calls.count()).toBe(
          1,
          "should call 3.0 upgrade"
        );
        // expect(threeOneUpgradeSpy.calls.count()).toBe(
        //   1,
        //   "should call 3.1 upgrade"
        // );
        expect(chk).not.toBe(m, "should not return the exact same object");
        // since the upgrades are all spies, we don't make assertions on the schemaVersion
        done();
      })
      .catch(done.fail);
  });

  xit("upgrades hub 3.0 to 3.1", done => {
    const m = cloneObject(defaultModel);
    m.item.properties.schemaVersion = 3.0;
    m.item.typeKeywords = ["hubSolutionTemplate", "solutionTemplate"];
    const threeZeroUpgradeSpy = spyOn(
      threeDotZero,
      "_upgradeThreeDotZero"
    ).and.callFake(model => {
      return cloneObject(model);
    });
    const threeOneUpgradeSpy = spyOn(
      threeDotOne,
      "_upgradeThreeDotOne"
    ).and.callFake(model => {
      return cloneObject(model);
    });
    return migrateSchema(m).then(chk => {
      expect(threeZeroUpgradeSpy.calls.count()).toBe(
        1,
        "should call 3.0 upgrade"
      );
      expect(threeOneUpgradeSpy.calls.count()).toBe(
        1,
        "should call 3.1 upgrade"
      );
      expect(chk).not.toBe(m, "should not return the exact same object");
      // since the upgrades are all spies, we don't make assertions on the schemaVersion
      done();
    });
  });

  it("does nothing if v3.1", done => {
    // this test will go away once we have a 3.0 -> 3.1 migration but it covers an `else` case
    const m = cloneObject(defaultModel);
    m.item.properties.schemaVersion = 3.1;
    migrateSchema(m)
      .then(chk => {
        expect(chk).toBe(m, "should return the exact same object");
        expect(chk.item.properties.schemaVersion).toBe(
          3.1,
          "should not change version"
        );
        done();
      })
      .catch(done.fail);
  });
});
