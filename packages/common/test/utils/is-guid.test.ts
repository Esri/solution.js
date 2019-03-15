/*
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

import isGuid from "../../src/utils/is-guid";

describe("isGuid", () => {
  it("works", () => {
    expect(isGuid(1234)).toBeFalsy();
    expect(isGuid({ prop: "val" })).toBeFalsy();
    expect(isGuid("1234")).toBeFalsy();
    expect(isGuid("imnotaguid")).toBeFalsy();
    expect(isGuid("76c3db4812d44f0087850093837e7a90")).toBeTruthy();
    expect(isGuid("{371acc8b-85cf-4251-8c01-7d0e48bac7e3}")).toBeTruthy();
  });
});
