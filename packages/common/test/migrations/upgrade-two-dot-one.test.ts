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
import * as utils from "../mocks/utils";
import {
  ISolutionItem,
  IItemGeneralized,
  IItemTemplate
} from "../../src/interfaces";
const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

describe("upgradeTwoDotOne :: ", () => {
  it("passes same object through if schema >= 2.1", () => {
    const m = {
      item: {
        properties: {
          schemaVersion: 2.1
        }
      }
    } as ISolutionItem;
    const chk = _upgradeTwoDotOne(m);
    expect(chk).toBe(m, "should pass model through without cloning");
  });

  it("remaps templates", () => {
    const m = ({
      item: {
        properties: {
          schemaVersion: 2.0
        }
      },
      data: {
        templates: [
          {
            fieldName: "becomesKey"
          },
          {
            key: "staysKey"
          },
          {
            key: "staysKey",
            itemId: "staysItemId"
          }
        ]
      }
    } as unknown) as ISolutionItem;
    const chk = _upgradeTwoDotOne(m);
    expect(chk.item.properties.schemaVersion).toBe(
      2.1,
      "should set schemaVersion to 2.1"
    );
    const chkTmpl0 = chk.data.templates[0];
    expect(chkTmpl0.key).toBe("becomesKey", "should use fieldName if present");
    expect(chkTmpl0.itemId).toBe("becomesKey", "should use key if present");
    const chkTmpl1 = chk.data.templates[1];
    expect(chkTmpl1.key).toBe("staysKey", "should keep key if present");
    expect(chkTmpl1.itemId).toBe("staysKey", "should use key if present");
    const chkTmpl2 = chk.data.templates[2];
    expect(chkTmpl2.key).toBe("staysKey", "should keep key if present");
    expect(chkTmpl2.itemId).toBe("staysItemId", "should use itemId if present");
  });
});
