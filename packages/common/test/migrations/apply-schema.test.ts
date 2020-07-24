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

import { _applySchema } from "../../src/migrations/apply-schema";
import * as utils from "../mocks/utils";
import {
  ISolutionItem,
  IItemGeneralized,
  IItemTemplate
} from "../../src/interfaces";
const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

describe("applySchema :: ", () => {
  it("passes same object through if schema >= 1", () => {
    const m = {
      item: {
        properties: {
          schemaVersion: 1
        }
      }
    } as ISolutionItem;
    const chk = _applySchema(m, MOCK_USER_SESSION);
    expect(chk).toBe(m, "should pass model through without cloning");
  });

  it("adds properties if missing", () => {
    const m = {
      item: {},
      data: {}
    } as ISolutionItem;
    const chk = _applySchema(m, MOCK_USER_SESSION);
    expect(chk).not.toBe(m, "should clone model");
    expect(chk.item.properties).toBeDefined("should add item.properties");
  });

  it("converts template entries", () => {
    const m = ({
      item: {
        properties: {
          otherProp: "exists"
        }
      },
      data: {
        templates: [
          {
            fieldName: "becomesKey",
            type: "staysType",
            item: {
              id: "staysItem"
            } as IItemGeneralized,
            data: {}
          },
          {
            key: "remainsKey",
            type: "staysType",
            item: {
              id: "staysItem"
            } as IItemGeneralized,
            data: {},
            resources: ["theresources"]
          },
          {
            fieldName: "becomesKey",
            itemId: "remainsItemId",
            type: "staysType",
            item: {
              id: "staysItem"
            } as IItemGeneralized,
            data: {},
            resources: ["theresources"]
          }
        ]
      }
    } as unknown) as ISolutionItem;
    const chk = _applySchema(m, MOCK_USER_SESSION);
    expect(chk).not.toBe(m, "should clone model");
    expect(chk.item.properties).toBeDefined("should add item.properties");
    const tmpl0 = chk.data.templates[0];
    const convertedTmpl0 = {
      key: "becomesKey",
      type: "staysType",
      item: ({ id: "staysItem" } as unknown) as IItemGeneralized,
      data: {},
      itemId: "becomesKey",
      resources: []
    } as IItemTemplate;
    expect(tmpl0).toEqual(convertedTmpl0, "should transform first template");
    const tmpl1 = chk.data.templates[1];
    const convertedTmpl1 = {
      key: "remainsKey",
      type: "staysType",
      item: ({ id: "staysItem" } as unknown) as IItemGeneralized,
      data: {},
      itemId: "remainsKey",
      resources: ["theresources"]
    } as IItemTemplate;
    expect(tmpl1).toEqual(convertedTmpl1, "should transform second template");
    const tmpl2 = chk.data.templates[2];
    const convertedTmpl2 = {
      key: "becomesKey",
      type: "staysType",
      item: ({ id: "staysItem" } as unknown) as IItemGeneralized,
      data: {},
      itemId: "remainsItemId",
      resources: ["theresources"]
    } as IItemTemplate;
    expect(tmpl2).toEqual(convertedTmpl2, "should transform third template");
  });
});
