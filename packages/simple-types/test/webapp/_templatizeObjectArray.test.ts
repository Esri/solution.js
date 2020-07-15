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
import * as templatizeObjModule from "../../src/webapp/_templatizeObject";
import * as common from "@esri/solution-common";
import { _templatizeObjectArray } from "../../src/webapp/_templatizeObjectArray";
describe("webapp :: _templatizeObjectArray ::", () => {
  it("does nothing is no configs present", () => {
    const tmplObjSpy = spyOn(
      templatizeObjModule,
      "_templatizeObject"
    ).and.callThrough();
    const objs = [{ id: "001" }, { id: "002" }, { id: "003" }];
    const dataSources = [
      { itemId: "3ef", basePath: "one", fields: [] },
      { itemId: "bc4", basePath: "two", fields: [] },
      { itemId: "00f", basePath: "three", fields: [] }
    ] as common.IDatasourceInfo[];
    const actual = _templatizeObjectArray(objs, dataSources);
    expect(actual).toEqual(objs, "should not change objects if no configs");
    expect(tmplObjSpy.calls.count()).toBe(
      0,
      "should not template if no config node"
    );
  });

  it("templates the object if config present", () => {
    const tmplObjSpy = spyOn(
      templatizeObjModule,
      "_templatizeObject"
    ).and.callFake(config => {
      config.changed = true;
      return config;
    });
    const objs = [
      { id: "001" },
      { id: "002", config: {}, name: "fooScreeningbar" },
      { id: "003" }
    ];
    const dataSources = [
      { itemId: "3ef", basePath: "one", fields: [] },
      { itemId: "bc4", basePath: "two", fields: [] },
      { itemId: "00f", basePath: "three", fields: [] }
    ] as common.IDatasourceInfo[];
    const actual = _templatizeObjectArray(objs, dataSources);
    expect(actual.length).toBe(3, "should still return all objects");
    expect(actual[1]).toEqual(
      { id: "002", config: { changed: true }, name: "fooScreeningbar" },
      "should update config by calling templatizeObject"
    );
    expect(tmplObjSpy.calls.count()).toBe(
      1,
      "should call templatizeObject once"
    );
  });
});
