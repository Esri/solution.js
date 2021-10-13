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
import * as postProcessSiteModule from "../../src/helpers/_post-process-site";
import * as updateSitePagesModule from "../../src/helpers/_update-site-pages";
import { IUpdateItemResponse } from "@esri/arcgis-rest-portal";

describe("_postProcessSite :: ", () => {
  let model: hubCommon.IModel;
  let infos: any[];
  beforeEach(() => {
    model = {
      item: {
        id: "3ef",
        properties: {
          collaborationGroupId: "bc1-collab",
          contentGroupId: "bc1-collab",
          chk: "{{bc66.itemId}}"
        }
      },
      data: {
        values: {}
      }
    } as unknown as hubCommon.IModel;
    infos = [
      { id: "ef1", type: "Web Map", item: { dependencies: [] } },
      { id: "ef2", type: "Web Mapping Application", item: { dependencies: [] } },
      { id: "ef3", type: "Hub Page", item: { dependencies: [] } },
      { id: "3ef", type: "Hub Site", item: { dependencies: [] } },
      { id: "4ef", type: "Form", item: { dependencies: ["5ef", "6ef"] } },
      { id: "5ef", type: "Feature Service", item: { dependencies: [] } },
      { id: "6ef", type: "Feature Service", item: { dependencies: [] } }
    ];
  });
  it("shared items to site teams", () => {
    const fakeRo = {} as hubCommon.IHubUserRequestOptions;
    const shareSpy = spyOn(hubSites, "_shareItemsToSiteGroups").and.callFake(
      (m, nfos, ro) => {
        return Promise.all(
          nfos.map(i => {
            return Promise.resolve({ itemId: i.itemId });
          })
        );
      }
    );
    const updatePageSpy = spyOn(
      updateSitePagesModule,
      "_updateSitePages"
    ).and.resolveTo([]);
    const updateSiteSpy = spyOn(hubSites, "updateSite").and.resolveTo(
      {} as IUpdateItemResponse
    );
    return postProcessSiteModule
      ._postProcessSite(model, infos, { bc66: { itemId: "ef66" } }, fakeRo)
      .then(result => {
        expect(result).toBe(true, "should return true");
        expect(shareSpy.calls.count()).toBe(1, "should call share fn once");
        expect(shareSpy.calls.argsFor(0)[1].length).toBe(
          3,
          "should share three pseudo models"
        );
        expect(updatePageSpy.calls.count()).toBe(
          1,
          "should call _updateSitePages"
        );
        expect(updateSiteSpy.calls.count()).toBe(1, "should update the site");
        const updateModel = updateSiteSpy.calls.argsFor(0)[0];
        expect(updateModel.item.properties.chk).toBe(
          "ef66",
          "it should do a second pass interpolation before updating"
        );
        expect(updateSiteSpy.calls.argsFor(0)[1]).toEqual({
          ...fakeRo,
          allowList: null
        });
      });
  });

  it("excludes site id from children array", () => {
    const fakeRo = {} as hubCommon.IHubUserRequestOptions;
    spyOn(hubSites, "_shareItemsToSiteGroups").and.callFake((m, nfos, ro) => {
      return Promise.all(
        nfos.map(i => {
          return Promise.resolve({ itemId: i.itemId });
        })
      );
    });
    spyOn(updateSitePagesModule, "_updateSitePages").and.resolveTo([]);
    const updateSiteSpy = spyOn(hubSites, "updateSite").and.resolveTo(
      {} as IUpdateItemResponse
    );
    return postProcessSiteModule
      ._postProcessSite(model, infos, { bc66: { itemId: "ef66" } }, fakeRo)
      .then(_ => {
        expect(updateSiteSpy.calls.count()).toBe(1, "should update the site");
        const updateModel = updateSiteSpy.calls.argsFor(0)[0];
        expect(updateModel.item.properties.children).toEqual(
          ["ef1", "ef2", "ef3", "4ef", "5ef", "6ef"],
          "it should populate children array and exclude site"
        );
        expect(updateSiteSpy.calls.argsFor(0)[1]).toEqual({
          ...fakeRo,
          allowList: null
        });
      });
  });
});
