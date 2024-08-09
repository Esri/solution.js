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

import { remapWebmapKeys } from "../../src/helpers/remap-webmap-keys";

describe("remapWebmapKeys", () => {
  it("handles an undefined resource object", () => {
    const chk = remapWebmapKeys();
    expect(Array.isArray(chk)).withContext("should return an empty array even if passed null").toBe(true);
  });

  it("handles an empty resource object", () => {
    const chk = remapWebmapKeys({});
    expect(Array.isArray(chk)).withContext("should return an empty array even if passed null").toBe(true);
  });

  it("handles an null resource object", () => {
    const chk = remapWebmapKeys({});
    expect(Array.isArray(chk)).withContext("should return an empty array even if passed null").toBe(true);
  });

  it("only handles webmap resources", () => {
    const res = {
      "foo": { type: "something" },
      "bar": { type: "otherthing" },
      "r-3ef-2837172": { type: "webmap" },
    };
    const chk = remapWebmapKeys(res);
    expect(Array.isArray(chk)).withContext("should return an array").toBe(true);
    expect(chk.length).withContext("should only have one entry").toBe(1);
    expect(chk[0].original).withContext("should have the original").toBe("r-3ef-2837172");
    expect(chk[0].updated).withContext("should have the updated").toBe("webmap0");
  });

  it("only handles webmap resources with janky keys", () => {
    const res = {
      "foo": { type: "something" },
      "bar": { type: "otherthing" },
      "webmap0": { type: "webmap" },
      "r-3ef-2837172": { type: "webmap" },
    };
    const chk = remapWebmapKeys(res);
    expect(Array.isArray(chk)).withContext("should return an array").toBe(true);
    expect(chk.length).withContext("should only have one entry").toBe(1);
    expect(chk[0].original).withContext("should have the original").toBe("r-3ef-2837172");
    expect(chk[0].updated).withContext("should have the updated").toBe("webmap0");
  });
});
