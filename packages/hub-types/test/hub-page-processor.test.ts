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
import * as moveHelper from "../src/helpers/move-model-to-folder";
const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

import * as HubPageProcessor from "../src/hub-page-processor";
import * as common from "@esri/solution-common";
import * as hubCommon from "@esri/hub-common";

describe("HubPageProcessor: ", () => {
  describe("convertItemToTemplate: ", () => {
    it("exists", () => {
      expect(HubPageProcessor.convertItemToTemplate).toBeDefined(
        "Should have convertItemToTemplate method"
      );
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
        expect(result.postProcess).toBe(false, "should not flag postProcess");
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
      return HubPageProcessor.createItemFromTemplate(
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
});
