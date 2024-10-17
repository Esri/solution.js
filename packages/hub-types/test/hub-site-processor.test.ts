/** @license
 * Copyright 2018 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as utils from "../../common/test/mocks/utils";
import * as sitesPackage from "@esri/hub-sites";
import * as moveHelper from "../src/helpers/move-model-to-folder";
const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

import * as HubSiteProcessor from "../src/hub-site-processor";
import * as common from "@esri/solution-common";
import * as hubCommon from "@esri/hub-common";
import * as postProcessSiteModule from "../src/helpers/_post-process-site";
import * as replacerModule from "../src/helpers/replace-item-ids";
const fetchMock = require("fetch-mock");

describe("HubSiteProcessor: ", () => {
  afterEach(() => {
    fetchMock.restore();
  });

  describe("convertItemToTemplate: ", () => {
    it("exists", () => {
      expect(HubSiteProcessor.convertItemToTemplate)
        .withContext("Should have convertItemToTemplate method")
        .toBeDefined();
    });

    it("should fetch the model, convert it, and swap ids", async () => {
      // we are testing some post-templating logic, so the rawTmpl needs to have some props
      const rawTmpl = {
        item: {
          typeKeywords: ["doNotDelete"],
          title: "Hub Site Title",
        },
        itemId: "ef4",
        key: "not-used",
        type: "Hub Site Application",
        data: {
          values: {
            title: "Hub Site Title",
          },
        },
        properties: {},
      } as hubCommon.IModelTemplate;
      fetchMock
        .get(
          "https://www.arcgis.com/sharing/rest/content/items/ef4?f=json",
          Promise.resolve({
            properties: {
              schemaVersion: hubCommon.SITE_SCHEMA_VERSION,
            },
          }),
        )
        .get(
          "https://www.arcgis.com/sharing/rest/content/items/ef4/data?f=json",
          Promise.resolve({
            values: {
              title: "Hub Site Title",
            },
          }),
        );
      const hubRoSpy = spyOn(common, "createHubRequestOptions").and.resolveTo({} as hubCommon.IHubUserRequestOptions);
      const convertSpy = spyOn(sitesPackage, "convertSiteToTemplate").and.resolveTo(rawTmpl);
      const replaceSpy = spyOn(replacerModule, "replaceItemIds").and.callThrough();

      const tmpl = await HubSiteProcessor.convertItemToTemplate({ id: "ef4" }, MOCK_USER_SESSION);
      expect((tmpl.item.typeKeywords ?? []).length)
        .withContext("should remove doNotDelete kwd")
        .toBe(0);
      expect(tmpl.groups).withContext("should have groups").toBeDefined();
      expect(tmpl.resources).withContext("should have resources").toBeDefined();
      expect(tmpl.properties).withContext("should have properties").toBeDefined();
      expect(tmpl.estimatedDeploymentCostFactor).withContext("should have estimatedDeploymentCostFactor").toBeDefined();
      expect(convertSpy.calls.count()).withContext("should convert model").toBe(1);
      expect(hubRoSpy.calls.count()).withContext("should create requestOptions").toBe(1);
      expect(replaceSpy.calls.count()).withContext("should replace ids").toBe(1);
    });

    it("appends properties to template if missing", async () => {
      // we are testing some post-templating logic, so the rawTmpl needs to have some props
      const rawTmpl = {
        item: {
          typeKeywords: ["doNotDelete"],
          title: "Hub Site Title",
        },
        itemId: "ef4",
        key: "not-used",
        type: "Hub Site Application",
        data: {
          values: {
            title: "Hub Site Title",
          },
        },
      } as hubCommon.IModelTemplate;
      fetchMock
        .get(
          "https://www.arcgis.com/sharing/rest/content/items/ef4?f=json",
          Promise.resolve({
            properties: {
              schemaVersion: hubCommon.SITE_SCHEMA_VERSION,
            },
          }),
        )
        .get(
          "https://www.arcgis.com/sharing/rest/content/items/ef4/data?f=json",
          Promise.resolve({
            values: {
              title: "Hub Site Title",
            },
          }),
        );
      const hubRoSpy = spyOn(common, "createHubRequestOptions").and.resolveTo({} as hubCommon.IHubUserRequestOptions);
      const convertSpy = spyOn(sitesPackage, "convertSiteToTemplate").and.resolveTo(rawTmpl);
      const replaceSpy = spyOn(replacerModule, "replaceItemIds").and.callThrough();

      const tmpl = await HubSiteProcessor.convertItemToTemplate({ id: "ef4" }, MOCK_USER_SESSION, MOCK_USER_SESSION);
      expect((tmpl.item.typeKeywords ?? []).length)
        .withContext("should remove doNotDelete kwd")
        .toBe(0);
      expect(tmpl.groups).withContext("should have groups").toBeDefined();
      expect(tmpl.resources).withContext("should have resources").toBeDefined();
      expect(tmpl.properties).withContext("should have properties").toBeDefined();
      expect(tmpl.estimatedDeploymentCostFactor).withContext("should have estimatedDeploymentCostFactor).toBeDefined(");
      expect(convertSpy.calls.count()).withContext("should convert model").toBe(1);
      expect(hubRoSpy.calls.count()).withContext("should create requestOptions").toBe(1);
      expect(replaceSpy.calls.count()).withContext("should replace ids").toBe(1);
    });
  });

  describe("createItemFromTemplate: ", () => {
    // objects used in following tests
    const fakeSite = {
      item: {
        id: "FAKE3ef",
      },
    } as hubCommon.IModel;
    const tmpl = {
      itemId: "bc7",
      type: "Hub Site Application",
      item: {},
    } as common.IItemTemplate;
    const tmplThmb = {
      itemId: "bc7",
      type: "Hub Site Application",
      item: {
        thumbnail: "yoda",
      },
    } as any;

    it("exists", () => {
      expect(HubSiteProcessor.createItemFromTemplate)
        .withContext("Should have createItemFromTemplate method")
        .toBeDefined();
    });

    it("happy-path:: delegates to hub.js", async () => {
      const createFromTmplSpy = spyOn(sitesPackage, "createSiteModelFromTemplate").and.resolveTo({ assets: [] });
      const createSiteSpy = spyOn(sitesPackage, "createSite").and.resolveTo(fakeSite);
      const moveSiteSpy = spyOn(moveHelper, "moveModelToFolder").and.resolveTo();
      spyOn(common, "restUpdateItem").and.resolveTo({
        success: true,
        id: "fred",
      });
      spyOn(common, "createHubRequestOptions").and.resolveTo({} as hubCommon.IHubUserRequestOptions);

      const td = {
        organization: {
          id: "somePortalId",
          portalHostname: "www.arcgis.com",
        },
        user: {
          username: "vader",
        },
        solutionItemExtent: "10,10,20,20",
        solution: {
          title: "Some Title",
        },
      };
      const cb = () => true;

      const result = await HubSiteProcessor.createItemFromTemplate(tmpl, td, MOCK_USER_SESSION, cb);
      expect(result.id).withContext("should return the created item id").toBe("FAKE3ef");
      expect(result.type).withContext("should return the type").toBe("Hub Site Application");
      expect(result.postProcess).withContext("should flag postProcess").toBe(true);
      expect(createFromTmplSpy.calls.count()).withContext("should call createFromTemplate").toBe(1);
      expect(createSiteSpy.calls.count()).withContext("should call createSite").toBe(1);
      expect(moveSiteSpy.calls.count()).withContext("should call moveSite").toBe(1);
    });

    it("happy-path with thumbnail", async () => {
      spyOn(common, "createHubRequestOptions").and.resolveTo({} as hubCommon.IHubUserRequestOptions);
      const createFromTmplSpy = spyOn(sitesPackage, "createSiteModelFromTemplate").and.resolveTo({ assets: [] });
      const createSiteSpy = spyOn(sitesPackage, "createSite").and.resolveTo(fakeSite);
      const moveSiteSpy = spyOn(moveHelper, "moveModelToFolder").and.resolveTo([tmplThmb.itemId]);
      spyOn(common, "restUpdateItem").and.resolveTo({
        success: true,
        id: "fred",
      });

      const td = {
        organization: {
          id: "somePortalId",
          portalHostname: "www.arcgis.com",
        },
        user: {
          username: "vader",
        },
        solutionItemExtent: "10,10,20,20",
        solution: {
          title: "Some Title",
        },
      };
      const cb = () => true;
      const result = await HubSiteProcessor.createItemFromTemplate(tmplThmb, td, MOCK_USER_SESSION, cb);
      expect(result.id).withContext("should return the created item id").toBe("FAKE3ef");
      expect(result.type).withContext("should return the type").toBe("Hub Site Application");
      expect(result.postProcess).withContext("should flag postProcess").toBe(true);
      expect(createFromTmplSpy.calls.count()).withContext("should call createFromTemplate").toBe(1);
      expect(createSiteSpy.calls.count()).withContext("should call createSite").toBe(1);
      expect(moveSiteSpy.calls.count()).withContext("should call moveSite").toBe(1);
    });

    it("other branches:: delegates to hub.js", () => {
      spyOn(common, "createHubRequestOptions").and.resolveTo({} as hubCommon.IHubUserRequestOptions);
      const createFromTmplSpy = spyOn(sitesPackage, "createSiteModelFromTemplate").and.resolveTo({});
      const createSiteSpy = spyOn(sitesPackage, "createSite").and.resolveTo(fakeSite);
      const moveSiteSpy = spyOn(moveHelper, "moveModelToFolder").and.resolveTo();
      spyOn(common, "restUpdateItem").and.resolveTo({
        success: true,
        id: "fred",
      });

      const td = {
        organization: {
          id: "somePortalId",
          portalHostname: "www.arcgis.com",
        },
        user: {
          username: "vader",
        },
      };
      const cb = () => true;

      return HubSiteProcessor.createItemFromTemplate(tmpl, td, MOCK_USER_SESSION, cb).then((result) => {
        expect(result.id).withContext("should return the created item id").toBe("FAKE3ef");
        expect(result.type).withContext("should return the type").toBe("Hub Site Application");
        expect(result.postProcess).withContext("should flag postProcess").toBe(true);
        expect(createFromTmplSpy.calls.count()).withContext("should call createFromTemplate").toBe(1);
        expect(createSiteSpy.calls.count()).withContext("should call createSite").toBe(1);
        expect(moveSiteSpy.calls.count()).withContext("should call moveSite").toBe(1);
      });
    });

    it("asset and resource juggling", async () => {
      spyOn(common, "createHubRequestOptions").and.resolveTo({} as hubCommon.IHubUserRequestOptions);
      const createFromTmplSpy = spyOn(sitesPackage, "createSiteModelFromTemplate").and.resolveTo({});
      const createSiteSpy = spyOn(sitesPackage, "createSite").and.resolveTo(fakeSite);
      const moveSiteSpy = spyOn(moveHelper, "moveModelToFolder").and.resolveTo();
      spyOn(common, "restUpdateItem").and.resolveTo({
        success: true,
        id: "fred",
      });

      const td = {
        organization: {
          id: "somePortalId",
          portalHostname: "www.arcgis.com",
        },
        user: {
          username: "vader",
        },
      };
      const tmplWithAssetsAndResources = hubCommon.cloneObject(tmpl);
      tmplWithAssetsAndResources.assets = [];
      tmplWithAssetsAndResources.resources = [];
      const cb = () => true;

      const result = await HubSiteProcessor.createItemFromTemplate(
        tmplWithAssetsAndResources,
        td,
        MOCK_USER_SESSION,
        cb,
      );
      expect(result.id).withContext("should return the created item id").toBe("FAKE3ef");
      expect(result.type).withContext("should return the type").toBe("Hub Site Application");
      expect(result.postProcess).withContext("should flag postProcess").toBe(true);
      expect(createFromTmplSpy.calls.count()).withContext("should call createFromTemplate").toBe(1);
      expect(createSiteSpy.calls.count()).withContext("should call createSite").toBe(1);
      expect(moveSiteSpy.calls.count()).withContext("should call moveSite").toBe(1);
    });

    it("callsback on exception", async () => {
      spyOn(common, "createHubRequestOptions").and.resolveTo({} as hubCommon.IHubUserRequestOptions);
      spyOn(sitesPackage, "createSiteModelFromTemplate").and.rejectWith("Whoa thats bad");

      const td = {
        organization: {
          id: "somePortalId",
          portalHostname: "www.arcgis.com",
        },
        user: {
          username: "vader",
        },
      };
      const cb = () => true;

      return HubSiteProcessor.createItemFromTemplate(tmpl, td, MOCK_USER_SESSION, cb)
        .then(() => {
          fail();
        })
        .catch((ex) => {
          expect(ex).withContext("should re-throw").toBe("Whoa thats bad");
          return Promise.resolve();
        });
    });

    it("it early-exits correctly", async () => {
      spyOn(common, "createHubRequestOptions").and.resolveTo({} as hubCommon.IHubUserRequestOptions);
      const td = {};
      const cb = () => false;

      const result = await HubSiteProcessor.createItemFromTemplate(tmpl, td, MOCK_USER_SESSION, cb);
      expect(result.id).withContext("should return empty result").toBe("");
      expect(result.postProcess).withContext("should return postProcess false").toBe(false);
    });

    it("it cleans up if job is cancelled late", async () => {
      spyOn(common, "createHubRequestOptions").and.resolveTo({} as hubCommon.IHubUserRequestOptions);
      const createFromTmplSpy = spyOn(sitesPackage, "createSiteModelFromTemplate").and.resolveTo({ assets: [] });
      const createSiteSpy = spyOn(sitesPackage, "createSite").and.resolveTo(fakeSite);
      const moveSiteSpy = spyOn(moveHelper, "moveModelToFolder").and.resolveTo();
      spyOn(common, "restUpdateItem").and.resolveTo({
        success: true,
        id: "fred",
      });

      const removeSiteSpy = spyOn(sitesPackage, "removeSite").and.resolveTo({
        success: true,
      });

      const td = {
        organization: {
          id: "somePortalId",
          portalHostname: "www.arcgis.com",
        },
        user: {
          username: "vader",
        },
        solutionItemExtent: "10,10,20,20",
        solution: {
          title: "Some Title",
        },
      };
      // fn that returns a fn that closes over a counter so that
      // it can return false after the first call
      const createCb = () => {
        let calls = 0;
        return () => {
          calls = calls + 1;
          return calls < 2;
        };
      };

      const result = await HubSiteProcessor.createItemFromTemplate(tmpl, td, MOCK_USER_SESSION, createCb());
      expect(result.id).withContext("should return empty result").toBe("");
      expect(result.postProcess).withContext("should return postProcess false").toBe(false);
      expect(result.type).withContext("should return the type").toBe("Hub Site Application");
      expect(createFromTmplSpy.calls.count()).withContext("should call createFromTemplate").toBe(1);
      expect(createSiteSpy.calls.count()).withContext("should call createSite").toBe(1);
      expect(moveSiteSpy.calls.count()).withContext("should call moveSite").toBe(1);
      expect(removeSiteSpy.calls.count()).withContext("should call removeSite").toBe(1);
    });
  });

  describe("postProcess ::", () => {
    it("delegates to _postProcessSite", async () => {
      spyOn(common, "createHubRequestOptions").and.resolveTo({} as hubCommon.IHubUserRequestOptions);
      fetchMock
        .get(
          "https://www.arcgis.com/sharing/rest/content/items/bc3?f=json",
          Promise.resolve({
            properties: {
              schemaVersion: hubCommon.SITE_SCHEMA_VERSION,
            },
          }),
        )
        .get("https://www.arcgis.com/sharing/rest/content/items/bc3/data?f=json", Promise.resolve({}));
      const postProcessSpy = spyOn(postProcessSiteModule, "_postProcessSite").and.resolveTo(true);
      const td = {
        organization: {
          id: "somePortalId",
          portalHostname: "www.arcgis.com",
        },
        user: {
          username: "vader",
        },
        bc3: {
          id: "new-bc3",
        },
        bc4: {
          id: "new-bc4",
        },
      };
      const itemInfos = [{ itemId: "bc3" }, { itemId: "bc4" }] as any[];
      const templates = [
        { itemId: "bc3", data: {} },
        { itemId: "bc4", data: {} },
      ] as common.IItemTemplate[];

      const result = await HubSiteProcessor.postProcess(
        "bc3",
        "Hub Site Application",
        itemInfos,
        {},
        templates,
        td,
        MOCK_USER_SESSION,
      );
      expect(result).withContext("should return true").toBe(true);
      expect(postProcessSpy.calls.count()).withContext("should call _postProcessSite").toBe(1);
    });
  });
  describe("isASite :: ", () => {
    it("recognizes both types", () => {
      expect(HubSiteProcessor.isASite("Hub Site Application")).withContext("Ago Type").toBe(true);
      expect(HubSiteProcessor.isASite("Site Application")).withContext("Portal type").toBe(true);
      expect(HubSiteProcessor.isASite("Web Map")).withContext("other type").toBe(false);
    });
  });
});
