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
import { IItem } from "@esri/arcgis-rest-portal";
import { cloneObject } from "@esri/solution-common/src/generalHelpers";

describe("replaceItemIds :: ", () => {
  const m = {
    itemId: "bc3",
    type: "Hub Site Application",
    key: "unused",
    item: {
      description: "in the ef1 middle and ef1 end"
    } as IItem,
    data: {
      chk: "ef2 and ef2"
    },
    properties: {
      chk: "ef1"
    },
    dependencies: ["ef1", "ef2"]
  } as IModelTemplate;

  it("works with deps", () => {
    const model = cloneObject(m);
    const chk = replaceItemIds(model);
    expect(chk).not.toBe(model, "should return a clone");
    expect(chk.item.description).toBe(
      "in the {{ef1.itemId}} middle and {{ef1.itemId}} end",
      "should interpolate into a string"
    );
    expect(chk.data.chk).toBe(
      "{{ef2.itemId}} and {{ef2.itemId}}",
      "interpolate in data"
    );
    expect(chk.properties.chk).toBe(
      "{{ef1.itemId}}",
      "interpolate in properties"
    );
  });

  it("works with empty deps", () => {
    const model = cloneObject(m);
    model.dependencies = [];
    const chk = replaceItemIds(model);
    expect(chk).not.toBe(model, "should return a clone");
    expect(chk.item.description).toBe(
      "in the ef1 middle and ef1 end",
      "NOT should interpolate into a string"
    );
    expect(chk.data.chk).toBe("ef2 and ef2", "NOT interpolate in data");
    expect(chk.properties.chk).toBe("ef1", "NOT interpolate in properties");
  });

  it("works with no deps", () => {
    const model = cloneObject(m);
    delete model.dependencies;
    const chk = replaceItemIds(model);
    expect(chk).not.toBe(model, "should return a clone");
    expect(chk.item.description).toBe(
      "in the ef1 middle and ef1 end",
      "NOT should interpolate into a string"
    );
    expect(chk.data.chk).toBe("ef2 and ef2", "NOT interpolate in data");
    expect(chk.properties.chk).toBe("ef1", "NOT interpolate in properties");
  });

  it("skips props if missing", () => {
    const model = cloneObject(m);
    delete model.properties;
    const chk = replaceItemIds(model);
    expect(chk).not.toBe(model, "should return a clone");
    expect(chk.item.description).toBe(
      "in the {{ef1.itemId}} middle and {{ef1.itemId}} end",
      "should interpolate into a string"
    );
    expect(chk.data.chk).toBe(
      "{{ef2.itemId}} and {{ef2.itemId}}",
      "interpolate in data"
    );
  });
});
