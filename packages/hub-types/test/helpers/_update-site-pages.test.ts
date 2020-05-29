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
import * as updateSitePagesModule from "../../src/helpers/_update-site-pages";

describe("_postProcessSite :: ", () => {
  let model: hubCommon.IModel;
  let infos: any[];
  beforeEach(() => {
    model = {
      item: {
        id: "3ef",
        properties: {
          collaborationGroupId: "bc1-collab",
          contentGroupId: "bc1-collab"
        }
      },
      data: {}
    } as hubCommon.IModel;
    infos = [
      { itemId: "ef1", type: "Web Map" },
      { itemId: "ef2", type: "Web Mapping Application" },
      { itemId: "ef3", type: "Hub Page" }
    ];
  });

  it("updateSitePages gets models and updates them", () => {
    infos.push({ itemId: "ef4", type: "Hub Page" });
    const fakeRo = {} as hubCommon.IHubRequestOptions;
    const getModelSpy = spyOn(hubCommon, "getModel").and.resolveTo(
      {} as hubCommon.IModel
    );
    const updatePage = spyOn(hubSites, "_updatePages").and.resolveTo([]);

    return updateSitePagesModule
      ._updateSitePages(model, infos, fakeRo)
      .then(() => {
        expect(getModelSpy.calls.count()).toBe(2, "should fetch two models");
        expect(updatePage.calls.count()).toBe(1, "should call updatePage once");
        expect(updatePage.calls.argsFor(0)[1].length).toBe(
          2,
          "should pass two page models"
        );
      });
  });
});
