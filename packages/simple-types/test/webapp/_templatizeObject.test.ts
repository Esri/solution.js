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
import { _templatizeObject } from "../../src/webapp/_templatizeObject";
import * as prioritizeModule from "../../src/webapp/_prioritizedTests";
import * as common from "@esri/solution-common";
import * as replaceOrderModule from "../../src/webapp/_getReplaceOrder";

describe("webapp :: _templatizeObject ::", () => {
  it("returns object if no dataources", () => {
    // fake implementation so we can focus on the logic in this function, not the others
    const prioritizeSpy = spyOn(
      prioritizeModule,
      "_prioritizedTests"
    ).and.callThrough();
    const tmplObjSpy = spyOn(
      common,
      "templatizeFieldReferences"
    ).and.callThrough();
    const orderSpy = spyOn(
      replaceOrderModule,
      "_getReplaceOrder"
    ).and.callThrough();
    const obj = {};
    const actual = _templatizeObject(obj, [], false);
    expect(actual).toBe(obj, "should return the object unchanged");
    expect(orderSpy.calls.count()).toBe(1, "should call replaceOrder");
    expect(prioritizeSpy.calls.count()).toBe(1, "should call prioritize");
    expect(tmplObjSpy.calls.count()).toBe(0, "should not call templatize");
  });
  it("returns object if no dataources, not passed last arg", () => {
    // fake implementation so we can focus on the logic in this function, not the others
    const prioritizeSpy = spyOn(
      prioritizeModule,
      "_prioritizedTests"
    ).and.callThrough();
    const tmplObjSpy = spyOn(
      common,
      "templatizeFieldReferences"
    ).and.callThrough();
    const orderSpy = spyOn(
      replaceOrderModule,
      "_getReplaceOrder"
    ).and.callThrough();
    const obj = {};
    const actual = _templatizeObject(obj, []);
    expect(actual).toBe(obj, "should return the object unchanged");
    expect(orderSpy.calls.count()).toBe(1, "should call replaceOrder");
    expect(prioritizeSpy.calls.count()).toBe(1, "should call prioritize");
    expect(tmplObjSpy.calls.count()).toBe(0, "should not call templatize");
  });

  it("does replacements in order", () => {
    // fake implementation so we can focus on the logic in this function, not the others
    const prioritizeSpy = spyOn(
      prioritizeModule,
      "_prioritizedTests"
    ).and.callFake(obj => {
      return obj;
    });
    const orderSpy = spyOn(replaceOrderModule, "_getReplaceOrder").and.callFake(
      (obj, ds) => {
        return ds;
      }
    );
    const tmplObjSpy = spyOn(common, "templatizeFieldReferences").and.callFake(
      (obj, fields, basePath) => {
        obj[basePath] = `updated by ${basePath}`;
        return obj;
      }
    );
    const obj = {};
    const dataSources = [
      { itemId: "3ef", basePath: "one", fields: [] },
      { itemId: "bc4", basePath: "two", fields: [] },
      { itemId: "00f", basePath: "three", fields: [] }
    ] as common.IDatasourceInfo[];
    const actual = _templatizeObject(obj, dataSources, false);
    const expected = {
      one: "updated by one",
      two: "updated by two",
      three: "updated by three"
    };
    expect(actual).toEqual(expected, "should return the object unchanged");
    expect(prioritizeSpy.calls.count()).toBe(1, "should call prioritize");
    expect(orderSpy.calls.count()).toBe(1, "should call replaceOrder");
    expect(tmplObjSpy.calls.count()).toBe(
      3,
      "should call templatizeObject 3 times"
    );
  });
});
