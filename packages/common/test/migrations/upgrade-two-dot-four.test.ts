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

import { _upgradeTwoDotFour } from "../../src/migrations/upgrade-two-dot-four";
import { cloneObject, IItemTemplate } from "@esri/hub-common";
import { ISolutionItem } from "../../src/interfaces";
import * as utils from "../../../common/test/mocks/utils";

describe("Upgrade 2.4 ::", () => {
  const defaultModel = {
    item: {
      type: "Solution",
      typeKeywords: ["Solution", "Template"],
      properties: {
        schemaVersion: 2.3
      }
    },
    data: {
      metadata: {
        chk1: "behold {{fakeKey.item.id}} it changed",
        chk2: "{{fakeKey.item.id}} {{fakeKey2.item.id}}"
      },
      templates: [
        {
          key: "fakeKey",
          itemId: "fakeId"
        },
        {
          key: "fakeKey2",
          itemId: "fakeId2"
        }
      ] as IItemTemplate[]
    }
  } as ISolutionItem;

  const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

  it("returns same model if on or above 2.4", () => {
    const m = cloneObject(defaultModel);
    m.item.properties.schemaVersion = 2.4;
    const chk = _upgradeTwoDotFour(m, MOCK_USER_SESSION);
    expect(chk).toBe(m, "should return the exact same object");
  });

  it("replaces key tokens with ids", () => {
    const m = cloneObject(defaultModel);
    // add something with one of the old tags into the .data
    m.data.metadata.chk = {
      solName: "{{solution.name}}"
    };
    const chk = _upgradeTwoDotFour(m, MOCK_USER_SESSION);
    expect(chk).not.toBe(m, "should not return the exact same object");
    expect(chk.data.metadata.chk1).toBe(
      "behold {{fakeId.itemId}} it changed",
      "should swap key.item.id => id.itemId"
    );
    expect(chk.data.metadata.chk2).toBe(
      "{{fakeId.itemId}} {{fakeId2.itemId}}",
      "should swap multiple entries in the same string"
    );
  });
  it("reworks hub asset names", () => {
    const m = cloneObject(defaultModel);
    m.data.templates[0].assets = [{ name: "somefile.png" }];
    const chk = _upgradeTwoDotFour(m, MOCK_USER_SESSION);
    const tmpl = chk.data.templates[0];
    expect(Array.isArray(tmpl.resources)).toBe(true, "should add resources");
    expect(Array.isArray(tmpl.assets)).toBe(true, "should leave assets");
    expect(tmpl.resources[0]).toBe(
      "fakeId-somefile.png",
      "should strip the old id out of the filename"
    );
  });
  it("reworks hub asset names, dropping leading folders", () => {
    const m = cloneObject(defaultModel);
    m.data.templates[0].assets = [
      { name: "thumbnail/somefile.png" },
      { name: "other/foo.png" }
    ];
    const chk = _upgradeTwoDotFour(m, MOCK_USER_SESSION);
    const tmpl = chk.data.templates[0];
    expect(Array.isArray(tmpl.resources)).toBe(true, "should add resources");
    expect(Array.isArray(tmpl.assets)).toBe(true, "should leave assets");
    expect(tmpl.resources[0]).toBe(
      "fakeId-somefile.png",
      "should strip the old id and thumbnail folder out of the filename"
    );
    expect(tmpl.resources[1]).toBe(
      "fakeId-foo.png",
      "should strip the old id and folder out of the filename"
    );
  });
  it("adds estimatedDeploymentCostFactor", () => {
    const m = cloneObject(defaultModel);
    m.data.templates[0].estimatedDeploymentCostFactor = 2;
    const chk = _upgradeTwoDotFour(m, MOCK_USER_SESSION);
    expect(chk.data.templates[1].estimatedDeploymentCostFactor).toBe(
      1,
      "should add cost factor of 1 if missing"
    );
  });
});
