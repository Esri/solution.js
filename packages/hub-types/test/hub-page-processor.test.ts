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

describe("HubPageProcessor: ", () => {
  describe("convertItemToTemplate: ", () => {
    it("exists", () => {
      expect(HubPageProcessor.convertItemToTemplate)
        .withContext("Should have convertItemToTemplate method")
        .toBeDefined();
    });

    it("should fetch the model, convert it, and swap ids", async () => {
      // we are not testing the conversion, so the model can be empty
      const model = {
        item: {
          created: 1520968147000,
          modified: 1522178539000,
        },
      } as hubCommon.IModel;
      // we are testing some post-templating logic, so the rawTmpl needs to have some props
      const rawTmpl = {
        item: {
          typeKeywords: ["doNotDelete"],
        },
        itemId: "ef4",
        key: "not-used",
        type: "Hub Page",
        data: {},
        properties: {},
      } as hubCommon.IModelTemplate;
      const getModelSpy = spyOn(hubCommon, "getModel").and.resolveTo(model);
      const hubRoSpy = spyOn(common, "createHubRequestOptions").and.resolveTo({} as hubCommon.IHubUserRequestOptions);
      const convertSpy = spyOn(sitesPackage, "convertPageToTemplate").and.resolveTo(rawTmpl);
      const replaceSpy = spyOn(replacerModule, "replaceItemIds").and.callThrough();

      const tmpl = await HubPageProcessor.convertItemToTemplate({ id: "ef4" }, MOCK_USER_SESSION);
      expect((tmpl.item.typeKeywords ?? []).length)
        .withContext("should remove doNotDelete kwd")
        .toBe(0);
      expect(tmpl.groups).withContext("should have groups").toBeDefined();
      expect(tmpl.resources).withContext("should have resources").toBeDefined();
      expect(tmpl.properties).withContext("should have properties").toBeDefined();
      expect(tmpl.estimatedDeploymentCostFactor).withContext("should have estimatedDeploymentCostFactor").toBeDefined();
      expect(convertSpy.calls.count()).withContext("should convert model").toBe(1);
      expect(hubRoSpy.calls.count()).withContext("should create requestOptions").toBe(1);
      expect(getModelSpy.calls.count()).withContext("should get the page model").toBe(1);
      expect(replaceSpy.calls.count()).withContext("should replace ids").toBe(1);
    });

    it("appends properties to template if missing", async () => {
      // we are not testing the conversion, so the model can be empty
      const model = {
        item: {
          created: 1520968147000,
          modified: 1522178539000,
        },
      } as hubCommon.IModel;
      // we are testing some post-templating logic, so the rawTmpl needs to have some props
      const rawTmpl = {
        item: {
          typeKeywords: ["doNotDelete"],
        },
        itemId: "ef4",
        key: "not-used",
        type: "Hub Page",
        data: {},
      } as hubCommon.IModelTemplate;
      const getModelSpy = spyOn(hubCommon, "getModel").and.resolveTo(model);
      const hubRoSpy = spyOn(common, "createHubRequestOptions").and.resolveTo({} as hubCommon.IHubUserRequestOptions);
      const convertSpy = spyOn(sitesPackage, "convertPageToTemplate").and.resolveTo(rawTmpl);
      const replaceSpy = spyOn(replacerModule, "replaceItemIds").and.callThrough();

      const tmpl = await HubPageProcessor.convertItemToTemplate({ id: "ef4" }, MOCK_USER_SESSION, MOCK_USER_SESSION);
      expect((tmpl.item.typeKeywords ?? []).length)
        .withContext("should remove doNotDelete kwd")
        .toBe(0);
      expect(tmpl.groups).withContext("should have groups").toBeDefined();
      expect(tmpl.resources).withContext("should have resources").toBeDefined();
      expect(tmpl.properties).withContext("should have properties").toBeDefined();
      expect(tmpl.estimatedDeploymentCostFactor).withContext("should have estimatedDeploymentCostFactor").toBeDefined();
      expect(convertSpy.calls.count()).withContext("should convert model").toBe(1);
      expect(hubRoSpy.calls.count()).withContext("should create requestOptions").toBe(1);
      expect(getModelSpy.calls.count()).withContext("should get the page model").toBe(1);
      expect(replaceSpy.calls.count()).withContext("should replace ids").toBe(1);
    });
  });

  describe("createItemFromTemplate: ", () => {
    // objects used in following tests
    const fakePage = {
      item: {
        id: "FAKE3ef",
      },
    } as hubCommon.IModel;
    const tmpl = {
      itemId: "bc7",
      type: "Hub Page",
      item: {},
    } as common.IItemTemplate;

    it("exists", () => {
      expect(HubPageProcessor.createItemFromTemplate)
        .withContext("Should have createItemFromTemplate method")
        .toBeDefined();
    });

    it("happy-path:: delegates to hub.js", async () => {
      const createFromTmplSpy = spyOn(sitesPackage, "createPageModelFromTemplate").and.resolveTo(fakePage);
      const createPageSpy = spyOn(sitesPackage, "createPage").and.resolveTo(fakePage);
      const movePageSpy = spyOn(moveHelper, "moveModelToFolder").and.resolveTo();
      spyOn(portalPackage, "updateItem").and.resolveTo({
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

      const result = await HubPageProcessor.createItemFromTemplate(tmpl, td, MOCK_USER_SESSION, cb);
      expect(result.id).withContext("should return the created item id").toBe("FAKE3ef");
      expect(result.type).withContext("should return the type").toBe("Hub Page");
      expect(result.postProcess).withContext("should flag postProcess").toBe(true);
      expect(createFromTmplSpy.calls.count()).withContext("should call createFromTemplate").toBe(1);
      expect(createPageSpy.calls.count()).withContext("should call createPage").toBe(1);
      expect(movePageSpy.calls.count()).withContext("should call move").toBe(1);
    });

    it("asset and resource juggling", async () => {
      spyOn(common, "createHubRequestOptions").and.resolveTo({} as hubCommon.IHubUserRequestOptions);
      const createFromTmplSpy = spyOn(sitesPackage, "createPageModelFromTemplate").and.resolveTo(fakePage);
      const createPageSpy = spyOn(sitesPackage, "createPage").and.resolveTo(fakePage);
      const movePageSpy = spyOn(moveHelper, "moveModelToFolder").and.resolveTo();
      spyOn(portalPackage, "updateItem").and.resolveTo({
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
      const tmplWithAssetsAndResources = common.cloneObject(tmpl);
      tmplWithAssetsAndResources.assets = [];
      tmplWithAssetsAndResources.resources = [];

      const cb = () => true;

      const result = await HubPageProcessor.createItemFromTemplate(
        tmplWithAssetsAndResources,
        td,
        MOCK_USER_SESSION,
        cb,
      );
      expect(result.id).withContext("should return the created item id").toBe("FAKE3ef");
      expect(result.type).withContext("should return the type").toBe("Hub Page");
      expect(result.postProcess).withContext("should flag postProcess").toBe(true);
      expect(createFromTmplSpy.calls.count()).withContext("should call createFromTemplate").toBe(1);
      expect(createPageSpy.calls.count()).withContext("should call createPage").toBe(1);
      expect(movePageSpy.calls.count()).withContext("should call move").toBe(1);
    });

    it("callsback on exception", async () => {
      spyOn(sitesPackage, "createPageModelFromTemplate").and.rejectWith("Whoa thats bad");
      spyOn(common, "createHubRequestOptions").and.resolveTo({} as hubCommon.IHubUserRequestOptions);
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

      return HubPageProcessor.createItemFromTemplate(tmpl, td, MOCK_USER_SESSION, cb)
        .then(() => {
          common.fail();
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

      const result = await HubPageProcessor.createItemFromTemplate(tmpl, td, MOCK_USER_SESSION, cb);
      expect(result.id).withContext("should return empty result").toBe("");
      expect(result.postProcess).withContext("should return postProcess false").toBe(false);
    });

    it("cleans up if job is cancelled late", async () => {
      spyOn(common, "createHubRequestOptions").and.resolveTo({} as hubCommon.IHubUserRequestOptions);
      const createFromTmplSpy = spyOn(sitesPackage, "createPageModelFromTemplate").and.resolveTo(fakePage);
      const createPageSpy = spyOn(sitesPackage, "createPage").and.resolveTo(fakePage);
      const movePageSpy = spyOn(moveHelper, "moveModelToFolder").and.resolveTo();
      spyOn(portalPackage, "updateItem").and.resolveTo({
        success: true,
        id: "fred",
      });
      const removePageSpy = spyOn(sitesPackage, "removePage").and.resolveTo({
        success: true,
        itemId: "FAKE3ef",
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

      const result = await HubPageProcessor.createItemFromTemplate(tmpl, td, MOCK_USER_SESSION, createCb());
      expect(result.id).withContext("should return empty result").toBe("");
      expect(result.type).withContext("should return the type").toBe("Hub Page");
      expect(result.postProcess).withContext("should not flag postProcess").toBe(false);
      expect(createFromTmplSpy.calls.count()).withContext("should call createFromTemplate").toBe(1);
      expect(createPageSpy.calls.count()).withContext("should call createPage").toBe(1);
      expect(movePageSpy.calls.count()).withContext("should call move").toBe(1);
      expect(removePageSpy.calls.count()).withContext("should call removePage").toBe(1);
    });
  });

  describe("postProcess :: ", () => {
    it("fetches page model and delegates to _postProcessPage", async () => {
      const model = {} as hubCommon.IModel;
      const getModelSpy = spyOn(hubCommon, "getModel").and.resolveTo(model);
      const hubRoSpy = spyOn(common, "createHubRequestOptions").and.resolveTo({} as hubCommon.IHubUserRequestOptions);
      const postProcessSpy = spyOn(postProcessModule, "_postProcessPage").and.resolveTo(true);
      const templates = [
        { itemId: "bc3", data: {} },
        { itemId: "bc4", data: {} },
      ] as common.IItemTemplate[];
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

      const result = await HubPageProcessor.postProcess("ef3", "Hub Page", [], templates, [], td, MOCK_USER_SESSION);
      expect(result).withContext("should return true").toBe(true);
      expect(hubRoSpy.calls.count()).withContext("should create requestOptions").toBe(1);
      expect(getModelSpy.calls.count()).withContext("should get the page model").toBe(1);
      expect(postProcessSpy.calls.count()).withContext("should delegate").toBe(1);
    });
  });

  describe("isAPage :: ", () => {
    it("recognizes both types", () => {
      expect(HubPageProcessor.isAPage("Hub Page")).withContext("Ago Type").toBe(true);
      expect(HubPageProcessor.isAPage("Site Page")).withContext("Portal type").toBe(true);
      expect(HubPageProcessor.isAPage("Web Map")).withContext("other type").toBe(false);
    });
  });
});
