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
import { _getWABDependencies } from "../../src/webapp/_getWABDependencies";
describe("webapp :: _getWABDependencies ::", () => {
  it("handles null", () => {
    const model: any = null;
    const expected = [] as string[];
    const actual = _getWABDependencies(model);
    expect(actual).toEqual(expected);
  });

  it("handles empty model", () => {
    const model = {};
    const expected = [] as string[];
    const actual = _getWABDependencies(model);
    expect(actual).toEqual(expected);
  });

  it("handles model without data", () => {
    const model = { data: {} };
    const expected = [] as string[];
    const actual = _getWABDependencies(model);
    expect(actual).toEqual(expected);
  });

  it("handles model with similar but unmatching path", () => {
    const model = { data: { itemId: "abc" } };
    const expected = [] as string[];
    const actual = _getWABDependencies(model);
    expect(actual).toEqual(expected);
  });

  it("handles model with matching path", () => {
    const model = { data: { map: { itemId: "abc" } } };
    const expected = ["abc"];
    const actual = _getWABDependencies(model);
    expect(actual).toEqual(expected);
  });

  it("handles model without matching dataSource", () => {
    const model = {
      data: {
        map: {
          other: "abc"
        },
        dataSource: {
          dataSources: {
            src123456: {
              id: "2ea59a64b34646f8972a71c7d536e4a3",
              type: "source type"
            }
          }
        }
      }
    };
    const expected = [] as string[];
    const actual = _getWABDependencies(model);
    expect(actual).toEqual(expected);
  });
});
