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
import { _getGenericWebAppDependencies } from "../../src/webapp/_getGenericWebAppDependencies";

describe("webapp :: _getGenericWebAppDependencies :: ", () => {
  it("handles null", () => {
    const model: any = null;
    const expected = [] as string[];
    const actual = _getGenericWebAppDependencies(model);
    expect(actual).toEqual(expected);
  });

  it("handles empty model", () => {
    const model = {};
    const expected = [] as string[];
    const actual = _getGenericWebAppDependencies(model);
    expect(actual).toEqual(expected);
  });

  it("handles model without data", () => {
    const model = { data: {} };
    const expected = [] as string[];
    const actual = _getGenericWebAppDependencies(model);
    expect(actual).toEqual(expected);
  });

  it("handles model without values", () => {
    const model = { data: { values: {} } };
    const expected = [] as string[];
    const actual = _getGenericWebAppDependencies(model);
    expect(actual).toEqual(expected);
  });

  it("handles model without webmap or group", () => {
    const model = { data: { values: { prop1: "1", prop2: "2" } } };
    const expected = [] as string[];
    const actual = _getGenericWebAppDependencies(model);
    expect(actual).toEqual(expected);
  });

  it("handles model with webmap", () => {
    const model = {
      data: { values: { prop1: "1", prop2: "2", webmap: "myMapId" } }
    };
    const expected = ["myMapId"];
    const actual = _getGenericWebAppDependencies(model);
    expect(actual).toEqual(expected);
  });

  it("handles model with group", () => {
    const model = {
      data: { values: { prop1: "1", prop2: "2", group: "myGroupId" } }
    };
    const expected = ["myGroupId"];
    const actual = _getGenericWebAppDependencies(model);
    expect(actual).toEqual(expected);
  });

  it("handles model with both webmap and group", () => {
    const model = {
      data: {
        values: {
          group: "myGroupId",
          prop1: "1",
          webmap: "myMapId",
          prop2: "2"
        }
      }
    };
    const expected = ["myMapId", "myGroupId"];
    const actual = _getGenericWebAppDependencies(model);
    expect(actual).toEqual(expected);
  });
});
