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
import * as utils from "../../common/test/mocks/utils";
import * as sitesPackage from "@esri/hub-sites";
import * as portalPackage from "@esri/arcgis-rest-portal";
import * as moveHelper from "../src/helpers/move-model-to-folder";
const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

import * as HubPageProcessor from "../src/hub-page-processor";
import * as postProcessModule from "../src/helpers/_post-process-page";
import * as common from "@esri/solution-common";
import * as hubCommon from "@esri/hub-common";
import * as replacerModule from "../src/helpers/replace-item-ids";
import { cloneObject, fail } from "@esri/solution-common/src/generalHelpers";

describe("HubPageProcessor: ", () => {
  describe("convertItemToTemplate: ", () => {
    it("exists", () => {
      expect(HubPageProcessor.convertItemToTemplate).toBeDefined(
        "Should have convertItemToTemplate method"
      );
    });
    it("should fetch the model, convert it, and swap ids", () => {
      // we are not testing the conversion, so the model can be empty
      const model = {
        item: {
          created: 1520968147000,
          modified: 1522178539000
        }
      } as hubCommon.IModel;
      // we are testing some post-templating logic, so the rawTmpl needs to have some props
      const rawTmpl = {
        item: {
          typeKeywords: ["doNotDelete"]
        },
        itemId: "ef4",
        key: "not-used",
        type: "Hub Page",
        data: {},
        properties: {}
      } as hubCommon.IModelTemplate;
      const getModelSpy = spyOn(hubCommon, "getModel").and.resolveTo(model);
      const hubRoSpy = spyOn(common, "createHubRequestOptions").and.resolveTo(
        {} as hubCommon.IHubUserRequestOptions
      );
      const convertSpy = spyOn(
        sitesPackage,
        "convertPageToTemplate"
      ).and.resolveTo(rawTmpl);
      const replaceSpy = spyOn(
        replacerModule,
        "replaceItemIds"
      ).and.callThrough();
      return HubPageProcessor.convertItemToTemplate(
        "bc3",
        { id: "ef4" },
        MOCK_USER_SESSION,
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
      const model = {
        item: {
          created: 1520968147000,
          modified: 1522178539000
        }
      } as hubCommon.IModel;
      // we are testing some post-templating logic, so the rawTmpl needs to have some props
      const rawTmpl = {
        item: {
          typeKeywords: ["doNotDelete"]
        },
        itemId: "ef4",
        key: "not-used",
        type: "Hub Page",
        data: {}
      } as hubCommon.IModelTemplate;
      const getModelSpy = spyOn(hubCommon, "getModel").and.resolveTo(model);
      const hubRoSpy = spyOn(common, "createHubRequestOptions").and.resolveTo(
        {} as hubCommon.IHubUserRequestOptions
      );
      const convertSpy = spyOn(
        sitesPackage,
        "convertPageToTemplate"
      ).and.resolveTo(rawTmpl);
      const replaceSpy = spyOn(
        replacerModule,
        "replaceItemIds"
      ).and.callThrough();
      return HubPageProcessor.convertItemToTemplate(
        "bc3",
        { id: "ef4" },
        MOCK_USER_SESSION,
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
    const fakePage = {
      item: {
        id: "FAKE3ef"
      }
    } as hubCommon.IModel;
    const tmpl = {
      itemId: "bc7",
      type: "Hub Page",
      item: {}
    } as common.IItemTemplate;
    const tmplThmb = {
      itemId: "bc7",
      type: "Hub Page",
      item: {
        thumbnail: "yoda"
      }
    } as any;

    it("exists", () => {
      expect(HubPageProcessor.createItemFromTemplate).toBeDefined(
        "Should have createItemFromTemplate method"
      );
    });
    it("happy-path:: delegates to hub.js", () => {
      const createFromTmplSpy = spyOn(
        sitesPackage,
        "createPageModelFromTemplate"
      ).and.resolveTo(fakePage);
      const createPageSpy = spyOn(sitesPackage, "createPage").and.resolveTo(
        fakePage
      );
      const movePageSpy = spyOn(
        moveHelper,
        "moveModelToFolder"
      ).and.resolveTo();
      const thumbnailSpy = spyOn(portalPackage, "updateItem").and.resolveTo({
        success: true,
        id: "fred"
      });
      const hubRoSpy = spyOn(common, "createHubRequestOptions").and.resolveTo(
        {} as hubCommon.IHubUserRequestOptions
      );
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
      return HubPageProcessor.createItemFromTemplate(
        tmpl,
        td,
        MOCK_USER_SESSION,
        cb
      ).then(result => {
        expect(result.id).toBe("FAKE3ef", "should return the created item id");
        expect(result.type).toBe("Hub Page", "should return the type");
        expect(result.postProcess).toBe(true, "should flag postProcess");
        expect(createFromTmplSpy.calls.count()).toBe(
          1,
          "should call createFromTemplate"
        );
        expect(createPageSpy.calls.count()).toBe(1, "should call createPage");
        expect(movePageSpy.calls.count()).toBe(1, "should call move");
      });
    });

    it("asset and resource juggling", () => {
      const hubRoSpy = spyOn(common, "createHubRequestOptions").and.resolveTo(
        {} as hubCommon.IHubUserRequestOptions
      );
      const createFromTmplSpy = spyOn(
        sitesPackage,
        "createPageModelFromTemplate"
      ).and.resolveTo(fakePage);
      const createPageSpy = spyOn(sitesPackage, "createPage").and.resolveTo(
        fakePage
      );
      const movePageSpy = spyOn(
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
        },
        solutionItemExtent: "10,10,20,20",
        solution: {
          title: "Some Title"
        }
      };
      const tmplWithAssetsAndResources = cloneObject(tmpl);
      tmplWithAssetsAndResources.assets = [];
      tmplWithAssetsAndResources.resources = [];

      const cb = () => true;
      return HubPageProcessor.createItemFromTemplate(
        tmplWithAssetsAndResources,
        td,
        MOCK_USER_SESSION,
        cb
      ).then(result => {
        expect(result.id).toBe("FAKE3ef", "should return the created item id");
        expect(result.type).toBe("Hub Page", "should return the type");
        expect(result.postProcess).toBe(true, "should flag postProcess");
        expect(createFromTmplSpy.calls.count()).toBe(
          1,
          "should call createFromTemplate"
        );
        expect(createPageSpy.calls.count()).toBe(1, "should call createPage");
        expect(movePageSpy.calls.count()).toBe(1, "should call move");
      });
    });
    it("callsback on exception", done => {
      spyOn(sitesPackage, "createPageModelFromTemplate").and.rejectWith(
        "Whoa thats bad"
      );
      const hubRoSpy = spyOn(common, "createHubRequestOptions").and.resolveTo(
        {} as hubCommon.IHubUserRequestOptions
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
      HubPageProcessor.createItemFromTemplate(tmpl, td, MOCK_USER_SESSION, cb)
        .then(() => {
          done.fail();
        })
        .catch(ex => {
          expect(ex).toBe("Whoa thats bad", "should re-throw");
          done();
        });
    });
    it("it early-exits correctly", () => {
      const hubRoSpy = spyOn(common, "createHubRequestOptions").and.resolveTo(
        {} as hubCommon.IHubUserRequestOptions
      );
      const td = {};
      const cb = () => false;
      return HubPageProcessor.createItemFromTemplate(
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
    it("cleans up if job is cancelled late", () => {
      const hubRoSpy = spyOn(common, "createHubRequestOptions").and.resolveTo(
        {} as hubCommon.IHubUserRequestOptions
      );
      const createFromTmplSpy = spyOn(
        sitesPackage,
        "createPageModelFromTemplate"
      ).and.resolveTo(fakePage);
      const createPageSpy = spyOn(sitesPackage, "createPage").and.resolveTo(
        fakePage
      );
      const movePageSpy = spyOn(
        moveHelper,
        "moveModelToFolder"
      ).and.resolveTo();
      const thumbnailSpy = spyOn(portalPackage, "updateItem").and.resolveTo({
        success: true,
        id: "fred"
      });
      const removePageSpy = spyOn(sitesPackage, "removePage").and.resolveTo({
        success: true,
        itemId: "FAKE3ef"
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
      return HubPageProcessor.createItemFromTemplate(
        tmpl,
        td,
        MOCK_USER_SESSION,
        createCb()
      ).then(result => {
        expect(result.id).toBe("", "should return empty result");
        expect(result.type).toBe("Hub Page", "should return the type");
        expect(result.postProcess).toBe(false, "should not flag postProcess");
        expect(createFromTmplSpy.calls.count()).toBe(
          1,
          "should call createFromTemplate"
        );
        expect(createPageSpy.calls.count()).toBe(1, "should call createPage");
        expect(movePageSpy.calls.count()).toBe(1, "should call move");
        expect(removePageSpy.calls.count()).toBe(1, "should call removePage");
      });
    });
  });
  describe("postProcess :: ", () => {
    it("fetches page model and delegates to _postProcessPage", done => {
      const model = {} as hubCommon.IModel;
      const getModelSpy = spyOn(hubCommon, "getModel").and.resolveTo(model);
      const hubRoSpy = spyOn(common, "createHubRequestOptions").and.resolveTo(
        {} as hubCommon.IHubUserRequestOptions
      );
      const postProcessSpy = spyOn(
        postProcessModule,
        "_postProcessPage"
      ).and.resolveTo(true);
      const templates = [
        { itemId: "bc3", data: {} },
        { itemId: "bc4", data: {} }
      ] as common.IItemTemplate[];
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
      HubPageProcessor.postProcess(
        "ef3",
        "Hub Page",
        [],
        templates,
        [],
        td,
        MOCK_USER_SESSION
      ).then(result => {
        expect(result).toBe(true, "should return true");
        expect(hubRoSpy.calls.count()).toBe(1, "should create requestOptions");
        expect(getModelSpy.calls.count()).toBe(1, "should get the page model");
        expect(postProcessSpy.calls.count()).toBe(1, "should delegate");
        done();
      });
    });
  });
  describe("isAPage :: ", () => {
    it("recognizes both types", () => {
      expect(HubPageProcessor.isAPage("Hub Page")).toBe(true, "Ago Type");
      expect(HubPageProcessor.isAPage("Site Page")).toBe(true, "Portal type");
      expect(HubPageProcessor.isAPage("Web Map")).toBe(false, "other type");
    });
  });
});
