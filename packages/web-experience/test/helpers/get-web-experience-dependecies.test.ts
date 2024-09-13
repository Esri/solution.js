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

import { getWebExperienceDependencies } from "../../src/helpers/get-web-experience-dependencies";
import { IModel } from "@esri/hub-common";
import { IItem } from "../../../common/src/arcgisRestJS";

describe("getWebExperienceDependencies :: ", () => {
  it("extracts itemIds from datasources", () => {
    const input = {
      item: {} as IItem,
      data: {
        dataSources: {
          one: {
            itemId: "bc1",
          },
          two: {
            itemId: "bc2",
          },
          three: {
            other: {
              itemId: "notincluded",
            },
          },
        },
      },
    } as IModel;

    const chk = getWebExperienceDependencies(input);

    expect(Array.isArray(chk)).withContext("should return an array").toBe(true);
    expect(chk.length).withContext("should have two entries").toBe(2);
    expect(chk.indexOf("bc1")).withContext("should have bc1").toBeGreaterThan(-1);
    expect(chk.indexOf("bc2")).withContext("should have bc2").toBeGreaterThan(-1);
  });

  it("returns empty array if no datasources", () => {
    const input = {
      item: {} as IItem,
      data: {},
    } as IModel;

    const chk = getWebExperienceDependencies(input);
    expect(Array.isArray(chk)).withContext("should return an array").toBe(true);
    expect(chk.length).withContext("should have no entries").toBe(0);
  });
});
