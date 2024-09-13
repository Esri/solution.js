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

import { replaceItemIds } from "../../src/helpers/replace-item-ids";
import { IModelTemplate } from "@esri/hub-common";
import { IItem } from "../../../common/src/arcgisRestJS";
import { cloneObject } from "../../../common/src/generalHelpers";

describe("replaceItemIds :: ", () => {
  const m = {
    itemId: "bc3",
    type: "Hub Site Application",
    key: "unused",
    item: {
      description: "in the ef1 middle and ef1 end",
    } as IItem,
    data: {
      chk: "ef2 and ef2",
    },
    properties: {
      chk: "ef1",
    },
    dependencies: ["ef1", "ef2"],
  } as IModelTemplate;

  it("works with deps", () => {
    const model = cloneObject(m);
    const chk = replaceItemIds(model);
    expect(chk).withContext("should return a clone").not.toBe(model);
    expect(chk.item.description)
      .withContext("should interpolate into a string")
      .toBe("in the {{ef1.itemId}} middle and {{ef1.itemId}} end");
    expect(chk.data.chk).withContext("interpolate in data").toBe("{{ef2.itemId}} and {{ef2.itemId}}");
    expect(chk.properties?.chk).withContext("interpolate in properties").toBe("{{ef1.itemId}}");
  });

  it("works with empty deps", () => {
    const model = cloneObject(m);
    model.dependencies = [];
    const chk = replaceItemIds(model);
    expect(chk).withContext("should return a clone").not.toBe(model);
    expect(chk.item.description)
      .withContext("NOT should interpolate into a string")
      .toBe("in the ef1 middle and ef1 end");
    expect(chk.data.chk).withContext("NOT interpolate in data").toBe("ef2 and ef2");
    expect(chk.properties?.chk).withContext("NOT interpolate in properties").toBe("ef1");
  });

  it("works with no deps", () => {
    const model = cloneObject(m);
    delete model.dependencies;
    const chk = replaceItemIds(model);
    expect(chk).withContext("should return a clone").not.toBe(model);
    expect(chk.item.description)
      .withContext("NOT should interpolate into a string")
      .toBe("in the ef1 middle and ef1 end");
    expect(chk.data.chk).withContext("NOT interpolate in data").toBe("ef2 and ef2");
    expect(chk.properties?.chk).withContext("NOT interpolate in properties").toBe("ef1");
  });

  it("skips props if missing", () => {
    const model = cloneObject(m);
    delete model.properties;
    const chk = replaceItemIds(model);
    expect(chk).withContext("should return a clone").not.toBe(model);
    expect(chk.item.description)
      .withContext("should interpolate into a string")
      .toBe("in the {{ef1.itemId}} middle and {{ef1.itemId}} end");
    expect(chk.data.chk).withContext("interpolate in data").toBe("{{ef2.itemId}} and {{ef2.itemId}}");
  });
});
