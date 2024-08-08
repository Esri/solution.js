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
import { _upgradeTwoDotOne } from "../../src/migrations/upgrade-two-dot-one";
import { ISolutionItem } from "../../src/interfaces";

describe("upgradeTwoDotOne :: ", () => {
  it("passes same object through if schema >= 2.1", () => {
    const m = {
      item: {
        properties: {
          schemaVersion: 2.1,
        },
      },
    } as ISolutionItem;
    const chk = _upgradeTwoDotOne(m);
    expect(chk).withContext("should pass model through without cloning").toBe(m);
  });

  it("remaps templates", () => {
    const m = {
      item: {
        properties: {
          schemaVersion: 2.0,
        },
      },
      data: {
        templates: [
          {
            fieldName: "becomesKey",
          },
          {
            key: "staysKey",
          },
          {
            key: "staysKey",
            itemId: "staysItemId",
          },
        ],
      },
    } as unknown as ISolutionItem;
    const chk = _upgradeTwoDotOne(m);
    expect(chk.item.properties.schemaVersion).withContext("should set schemaVersion to 2.1").toBe(2.1);
    const chkTmpl0 = chk.data.templates[0];
    expect(chkTmpl0.key).withContext("should use fieldName if present").toBe("becomesKey");
    expect(chkTmpl0.itemId).withContext("should use key if present").toBe("becomesKey");
    const chkTmpl1 = chk.data.templates[1];
    expect(chkTmpl1.key).withContext("should keep key if present").toBe("staysKey");
    expect(chkTmpl1.itemId).withContext("should use key if present").toBe("staysKey");
    const chkTmpl2 = chk.data.templates[2];
    expect(chkTmpl2.key).withContext("should keep key if present").toBe("staysKey");
    expect(chkTmpl2.itemId).withContext("should use itemId if present").toBe("staysItemId");
  });
});
