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
import * as utils from "@esri/solution-common/test/mocks/utils";
import * as sitesPackage from "@esri/hub-sites";
import * as portalPackage from "@esri/arcgis-rest-portal";
import * as moveHelper from "../src/helpers/move-model-to-folder";
const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

import * as HubSiteProcessor from "../src/hub-site-processor";
import * as common from "@esri/solution-common";
import * as hubCommon from "@esri/hub-common";
import * as postProcessSiteModule from "../src/helpers/_post-process-site";
import * as hubRoModule from "../src/helpers/create-hub-request-options";
import * as replacerModule from "../src/helpers/replace-item-ids";
import { fail } from "@esri/solution-common/src/generalHelpers";

describe("HubSiteProcessor: ", () => {
  describe("convertItemToTemplate: ", () => {
    it("exists", () => {
      expect(HubSiteProcessor.convertItemToTemplate).toBeDefined(
        "Should have convertItemToTemplate method"
      );
    });
    it("should fetch the model, convert it, and swap ids", () => {
      // we are not testing the conversion, so the model can be empty
      const model = {} as hubCommon.IModel;
      // we are testing some post-templating logic, so the rawTmpl needs to have some props
      const rawTmpl = {
        item: {
          typeKeywords: ["doNotDelete"]
        },
        itemId: "ef4",
        key: "not-used",
        type: "Hub Site Application",
        data: {},
        properties: {}
      } as hubCommon.IModelTemplate;
      const getModelSpy = spyOn(sitesPackage, "getSiteById").and.resolveTo(
        model
      );
      const hubRoSpy = spyOn(
        hubRoModule,
        "createHubRequestOptions"
      ).and.resolveTo({} as hubCommon.IHubRequestOptions);
      const convertSpy = spyOn(
        sitesPackage,
        "convertSiteToTemplate"
      ).and.resolveTo(rawTmpl);
      const replaceSpy = spyOn(
        replacerModule,
        "replaceItemIds"
      ).and.callThrough();
      return HubSiteProcessor.convertItemToTemplate(
        "bc3",
        { id: "ef4" },
        MOCK_USER_SESSION
      ).then(tmpl => {
        expect(tmpl.item.typeKeywords.length).toBe(
          0,
          "should remove doNotDelete kwd"
        );
        expect(tmpl.groups).toBeDefined("should have groups");
        expect(tmpl.resources).toBeDefined("should have resources");
        expect(tmpl.properties).toBeDefined("should have properties");
        expect(tmpl.estimatedDeploymentCostFactor).toBeDefined(
          "should have estimatedDeploymentCostFactor"
        );
        expect(convertSpy.calls.count()).toBe(1, "should convert model");
        expect(hubRoSpy.calls.count()).toBe(1, "should create requestOptions");
        expect(getModelSpy.calls.count()).toBe(1, "should get the page model");
        expect(replaceSpy.calls.count()).toBe(1, "should replace ids");
      });
    });
    it("appends properties to template if missing", () => {
      // we are not testing the conversion, so the model can be empty
      const model = {} as hubCommon.IModel;
      // we are testing some post-templating logic, so the rawTmpl needs to have some props
      const rawTmpl = {
        item: {
          typeKeywords: ["doNotDelete"]
        },
        itemId: "ef4",
        key: "not-used",
        type: "Hub Site Application",
        data: {}
      } as hubCommon.IModelTemplate;
      const getModelSpy = spyOn(sitesPackage, "getSiteById").and.resolveTo(
        model
      );
      const hubRoSpy = spyOn(
        hubRoModule,
        "createHubRequestOptions"
      ).and.resolveTo({} as hubCommon.IHubRequestOptions);
      const convertSpy = spyOn(
        sitesPackage,
        "convertSiteToTemplate"
      ).and.resolveTo(rawTmpl);
      const replaceSpy = spyOn(
        replacerModule,
        "replaceItemIds"
      ).and.callThrough();
      return HubSiteProcessor.convertItemToTemplate(
        "bc3",
        { id: "ef4" },
        MOCK_USER_SESSION
      ).then(tmpl => {
        expect(tmpl.item.typeKeywords.length).toBe(
          0,
          "should remove doNotDelete kwd"
        );
        expect(tmpl.groups).toBeDefined("should have groups");
        expect(tmpl.resources).toBeDefined("should have resources");
        expect(tmpl.properties).toBeDefined("should have properties");
        expect(tmpl.estimatedDeploymentCostFactor).toBeDefined(
          "should have estimatedDeploymentCostFactor"
        );
        expect(convertSpy.calls.count()).toBe(1, "should convert model");
        expect(hubRoSpy.calls.count()).toBe(1, "should create requestOptions");
        expect(getModelSpy.calls.count()).toBe(1, "should get the page model");
        expect(replaceSpy.calls.count()).toBe(1, "should replace ids");
      });
    });
  });
  describe("createItemFromTemplate: ", () => {
    // objects used in following tests
    const fakeSite = {
      item: {
        id: "FAKE3ef"
      }
    } as hubCommon.IModel;
    const tmpl = {
      itemId: "bc7",
      type: "Hub Site Application",
      item: {}
    } as common.IItemTemplate;
    const tmplThmb = {
      itemId: "bc7",
      type: "Hub Site Application",
      item: {
        thumbnail: "yoda"
      }
    } as any;

    it("exists", () => {
      expect(HubSiteProcessor.createItemFromTemplate).toBeDefined(
        "Should have createItemFromTemplate method"
      );
    });
    it("happy-path:: delegates to hub.js", () => {
      const createFromTmplSpy = spyOn(
        sitesPackage,
        "createSiteModelFromTemplate"
      ).and.resolveTo({ assets: [] });
      const createSiteSpy = spyOn(sitesPackage, "createSite").and.resolveTo(
        fakeSite
      );
      const moveSiteSpy = spyOn(
        moveHelper,
        "moveModelToFolder"
      ).and.resolveTo();
      const thumbnailSpy = spyOn(portalPackage, "updateItem").and.resolveTo({
        success: true,
        id: "fred"
      });
      const hubRoSpy = spyOn(
        hubRoModule,
        "createHubRequestOptions"
      ).and.resolveTo({} as hubCommon.IHubRequestOptions);

      const td = {
        organization: {
          id: "somePortalId",
          portalHostname: "www.arcgis.com"
        },
        user: {
          username: "vader"
        },
        solutionItemExtent: "10,10,20,20",
        solution: {
          title: "Some Title"
        }
      };
      const cb = () => true;
      return HubSiteProcessor.createItemFromTemplate(
        tmpl,
        td,
        MOCK_USER_SESSION,
        cb
      ).then(result => {
        expect(result.id).toBe("FAKE3ef", "should return the created item id");
        expect(result.type).toBe(
          "Hub Site Application",
          "should return the type"
        );
        expect(result.postProcess).toBe(true, "should flag postProcess");
        expect(createFromTmplSpy.calls.count()).toBe(
          1,
          "should call createFromTemplate"
        );
        expect(createSiteSpy.calls.count()).toBe(1, "should call createSite");
        expect(moveSiteSpy.calls.count()).toBe(1, "should call moveSite");
      });
    });
    it("happy-path with thumbnail", () => {
      const hubRoSpy = spyOn(
        hubRoModule,
        "createHubRequestOptions"
      ).and.resolveTo({} as hubCommon.IHubRequestOptions);
      const createFromTmplSpy = spyOn(
        sitesPackage,
        "createSiteModelFromTemplate"
      ).and.resolveTo({ assets: [] });
      const createSiteSpy = spyOn(sitesPackage, "createSite").and.resolveTo(
        fakeSite
      );
      const moveSiteSpy = spyOn(moveHelper, "moveModelToFolder").and.resolveTo([
        tmplThmb.itemId
      ]);
      const thumbnailSpy = spyOn(portalPackage, "updateItem").and.resolveTo({
        success: true,
        id: "fred"
      });

      const td = {
        organization: {
          id: "somePortalId",
          portalHostname: "www.arcgis.com"
        },
        user: {
          username: "vader"
        },
        solutionItemExtent: "10,10,20,20",
        solution: {
          title: "Some Title"
        }
      };
      const cb = () => true;
      return HubSiteProcessor.createItemFromTemplate(
        tmplThmb,
        td,
        MOCK_USER_SESSION,
        cb
      ).then(result => {
        expect(result.id).toBe("FAKE3ef", "should return the created item id");
        expect(result.type).toBe(
          "Hub Site Application",
          "should return the type"
        );
        expect(result.postProcess).toBe(true, "should flag postProcess");
        expect(createFromTmplSpy.calls.count()).toBe(
          1,
          "should call createFromTemplate"
        );
        expect(createSiteSpy.calls.count()).toBe(1, "should call createSite");
        expect(moveSiteSpy.calls.count()).toBe(1, "should call moveSite");
      });
    });

    it("other branches:: delegates to hub.js", () => {
      const hubRoSpy = spyOn(
        hubRoModule,
        "createHubRequestOptions"
      ).and.resolveTo({} as hubCommon.IHubRequestOptions);
      const createFromTmplSpy = spyOn(
        sitesPackage,
        "createSiteModelFromTemplate"
      ).and.resolveTo({});
      const createSiteSpy = spyOn(sitesPackage, "createSite").and.resolveTo(
        fakeSite
      );
      const moveSiteSpy = spyOn(
        moveHelper,
        "moveModelToFolder"
      ).and.resolveTo();
      const thumbnailSpy = spyOn(portalPackage, "updateItem").and.resolveTo({
        success: true,
        id: "fred"
      });

      const td = {
        organization: {
          id: "somePortalId",
          portalHostname: "www.arcgis.com"
        },
        user: {
          username: "vader"
        }
      };
      const cb = () => true;
      return HubSiteProcessor.createItemFromTemplate(
        tmpl,
        td,
        MOCK_USER_SESSION,
        cb
      ).then(result => {
        expect(result.id).toBe("FAKE3ef", "should return the created item id");
        expect(result.type).toBe(
          "Hub Site Application",
          "should return the type"
        );
        expect(result.postProcess).toBe(true, "should flag postProcess");
        expect(createFromTmplSpy.calls.count()).toBe(
          1,
          "should call createFromTemplate"
        );
        expect(createSiteSpy.calls.count()).toBe(1, "should call createSite");
        expect(moveSiteSpy.calls.count()).toBe(1, "should call moveSite");
      });
    });
    it("asset and resource juggling", () => {
      const hubRoSpy = spyOn(
        hubRoModule,
        "createHubRequestOptions"
      ).and.resolveTo({} as hubCommon.IHubRequestOptions);
      const createFromTmplSpy = spyOn(
        sitesPackage,
        "createSiteModelFromTemplate"
      ).and.resolveTo({});
      const createSiteSpy = spyOn(sitesPackage, "createSite").and.resolveTo(
        fakeSite
      );
      const moveSiteSpy = spyOn(
        moveHelper,
        "moveModelToFolder"
      ).and.resolveTo();
      const thumbnailSpy = spyOn(portalPackage, "updateItem").and.resolveTo({
        success: true,
        id: "fred"
      });

      const td = {
        organization: {
          id: "somePortalId",
          portalHostname: "www.arcgis.com"
        },
        user: {
          username: "vader"
        }
      };
      const tmplWithAssetsAndResources = hubCommon.cloneObject(tmpl);
      tmplWithAssetsAndResources.assets = [];
      tmplWithAssetsAndResources.resources = [];
      const cb = () => true;
      return HubSiteProcessor.createItemFromTemplate(
        tmplWithAssetsAndResources,
        td,
        MOCK_USER_SESSION,
        cb
      ).then(result => {
        expect(result.id).toBe("FAKE3ef", "should return the created item id");
        expect(result.type).toBe(
          "Hub Site Application",
          "should return the type"
        );
        expect(result.postProcess).toBe(true, "should flag postProcess");
        expect(createFromTmplSpy.calls.count()).toBe(
          1,
          "should call createFromTemplate"
        );
        expect(createSiteSpy.calls.count()).toBe(1, "should call createSite");
        expect(moveSiteSpy.calls.count()).toBe(1, "should call moveSite");
      });
    });
    it("callsback on exception", done => {
      const hubRoSpy = spyOn(
        hubRoModule,
        "createHubRequestOptions"
      ).and.resolveTo({} as hubCommon.IHubRequestOptions);
      spyOn(sitesPackage, "createSiteModelFromTemplate").and.rejectWith(
        "Whoa thats bad"
      );

      const td = {
        organization: {
          id: "somePortalId",
          portalHostname: "www.arcgis.com"
        },
        user: {
          username: "vader"
        }
      };
      const cb = () => true;
      return HubSiteProcessor.createItemFromTemplate(
        tmpl,
        td,
        MOCK_USER_SESSION,
        cb
      )
        .then(() => {
          done.fail();
        })
        .catch(ex => {
          expect(ex).toBe("Whoa thats bad", "should re-throw");
          done();
        });
    });
    it("it early-exits correctly", () => {
      const hubRoSpy = spyOn(
        hubRoModule,
        "createHubRequestOptions"
      ).and.resolveTo({} as hubCommon.IHubRequestOptions);
      const td = {};
      const cb = () => false;
      return HubSiteProcessor.createItemFromTemplate(
        tmpl,
        td,
        MOCK_USER_SESSION,
        cb
      ).then(result => {
        expect(result.id).toBe("", "should return empty result");
        expect(result.postProcess).toBe(
          false,
          "should return postProcess false"
        );
      });
    });
    it("it cleans up if job is cancelled late", () => {
      const hubRoSpy = spyOn(
        hubRoModule,
        "createHubRequestOptions"
      ).and.resolveTo({} as hubCommon.IHubRequestOptions);
      const createFromTmplSpy = spyOn(
        sitesPackage,
        "createSiteModelFromTemplate"
      ).and.resolveTo({ assets: [] });
      const createSiteSpy = spyOn(sitesPackage, "createSite").and.resolveTo(
        fakeSite
      );
      const moveSiteSpy = spyOn(
        moveHelper,
        "moveModelToFolder"
      ).and.resolveTo();
      const thumbnailSpy = spyOn(portalPackage, "updateItem").and.resolveTo({
        success: true,
        id: "fred"
      });

      const removeSiteSpy = spyOn(sitesPackage, "removeSite").and.resolveTo({
        success: true
      });

      const td = {
        organization: {
          id: "somePortalId",
          portalHostname: "www.arcgis.com"
        },
        user: {
          username: "vader"
        },
        solutionItemExtent: "10,10,20,20",
        solution: {
          title: "Some Title"
        }
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

      return HubSiteProcessor.createItemFromTemplate(
        tmpl,
        td,
        MOCK_USER_SESSION,
        createCb()
      ).then(result => {
        expect(result.id).toBe("", "should return empty result");
        expect(result.postProcess).toBe(
          false,
          "should return postProcess false"
        );
        expect(result.type).toBe(
          "Hub Site Application",
          "should return the type"
        );
        expect(createFromTmplSpy.calls.count()).toBe(
          1,
          "should call createFromTemplate"
        );
        expect(createSiteSpy.calls.count()).toBe(1, "should call createSite");
        expect(moveSiteSpy.calls.count()).toBe(1, "should call moveSite");
        expect(removeSiteSpy.calls.count()).toBe(1, "should call removeSite");
      });
    });
  });
  describe("postProcess ::", () => {
    it("delegates to _postProcessSite", () => {
      const hubRoSpy = spyOn(
        hubRoModule,
        "createHubRequestOptions"
      ).and.resolveTo({} as hubCommon.IHubRequestOptions);
      const getSiteByIdSpy = spyOn(sitesPackage, "getSiteById").and.resolveTo({
        item: {},
        data: {}
      } as hubCommon.IModel);
      const postProcessSpy = spyOn(
        postProcessSiteModule,
        "_postProcessSite"
      ).and.resolveTo(true);
      const td = {
        organization: {
          id: "somePortalId",
          portalHostname: "www.arcgis.com"
        },
        user: {
          username: "vader"
        },
        bc3: {
          id: "new-bc3"
        },
        bc4: {
          id: "new-bc4"
        }
      };
      const itemInfos = [{ itemId: "bc3" }, { itemId: "bc4" }] as any[];
      const templates = [
        { itemId: "bc3", data: {} },
        { itemId: "bc4", data: {} }
      ] as common.IItemTemplate[];
      return HubSiteProcessor.postProcess(
        "bc3",
        "Hub Site Application",
        itemInfos,
        {},
        templates,
        td,
        MOCK_USER_SESSION
      ).then(result => {
        expect(result).toBe(true, "should return true");
        expect(getSiteByIdSpy.calls.count()).toBe(1, "should call getSiteById");
        expect(postProcessSpy.calls.count()).toBe(
          1,
          "should call _postProcessSite"
        );
      });
    });
  });
  describe("isASite :: ", () => {
    it("recognizes both types", () => {
      expect(HubSiteProcessor.isASite("Hub Site Application")).toBe(
        true,
        "Ago Type"
      );
      expect(HubSiteProcessor.isASite("Site Application")).toBe(
        true,
        "Portal type"
      );
      expect(HubSiteProcessor.isASite("Web Map")).toBe(false, "other type");
    });
  });
});
