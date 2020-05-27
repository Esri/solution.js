import * as hubCommon from "@esri/hub-common";
import * as hubSites from "@esri/hub-sites";
import * as postProcessSiteModule from "../../src/helpers/_post-process-site";
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
  it("shared items to site teams", () => {
    const fakeRo = {} as hubCommon.IHubRequestOptions;
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
    return postProcessSiteModule
      ._postProcessSite(model, infos, fakeRo)
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
      });
  });
});
