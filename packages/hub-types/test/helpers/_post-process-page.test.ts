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

import * as hubCommon from "@esri/hub-common";
import * as hubSites from "@esri/hub-sites";
import * as postProcessPageModule from "../../src/helpers/_post-process-page";
import { IUpdateItemResponse } from "@esri/arcgis-rest-portal";

describe("_postProcessPage :: ", () => {
  let model: hubCommon.IModel;
  beforeEach(() => {
    model = {
      item: {
        id: "3ef",
        properties: {
          chk: "{{bc66.itemId}}"
        }
      },
      data: {}
    } as hubCommon.IModel;
  });
  it("does second-pass interpolatin", () => {
    const fakeRo = {} as hubCommon.IHubRequestOptions;
    const updatePageSpy = spyOn(hubSites, "updatePage").and.resolveTo(
      {} as IUpdateItemResponse
    );
    return postProcessPageModule
      ._postProcessPage(model, [], { bc66: { itemId: "ef66" } }, fakeRo)
      .then(result => {
        expect(result).toBe(true, "should return true");
        expect(updatePageSpy.calls.count()).toBe(1, "should update the site");
        const updateModel = updatePageSpy.calls.argsFor(0)[0];
        expect(updateModel.item.properties.chk).toBe(
          "ef66",
          "it should do a second pass interpolation before updating"
        );
        expect(updatePageSpy.calls.argsFor(0)[1]).toEqual({
          ...fakeRo,
          allowList: []
        });
      });
  });
});
