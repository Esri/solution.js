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
import * as moveHelper from "../src/helpers/move-model-to-folder";
const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

import * as HubSiteProcessor from "../src/hub-site-processor";
import * as common from "@esri/solution-common";
import * as hubCommon from "@esri/hub-common";
import * as postProcessSiteModule from "../src/helpers/_post-process-site";

describe("HubSiteProcessor: ", () => {
  describe("convertItemToTemplate: ", () => {
    it("exists", () => {
      expect(HubSiteProcessor.convertItemToTemplate).toBeDefined(
        "Should have convertItemToTemplate method"
      );
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
    it("other branches:: delegates to hub.js", () => {
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
    it("callsback on exception", done => {
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
      const tmpls = [
        { itemId: "bc3" },
        { itemId: "bc4" }
      ] as common.IItemTemplate[];
      return HubSiteProcessor.postProcess(
        "bc3",
        "Hub Site Application",
        tmpls,
        {},
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
});
