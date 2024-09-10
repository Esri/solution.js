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

/**
 * Provides tests for the creation and deployment of item types that contain files.
 */

import * as WebExperienceProcessor from "../src/web-experience-processor";
import * as utils from "../../common/test/mocks/utils";
import * as common from "@esri/solution-common";
import * as hubCommon from "@esri/hub-common";
import * as portalModule from "@esri/arcgis-rest-portal";
import * as convertToTmplModule from "../src/helpers/convert-web-experience-to-template";

import * as createFromTemplateModule from "../src/helpers/create-web-experience-model-from-template";
import * as createExperienceModule from "../src/helpers/create-web-experience";

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `web-experience-processor`: ", () => {
  describe("convertItemToTemplate :: ", () => {
    it("should fetch the data and delegate to convertToTemplate", async() => {
      const getItemDataSpy = spyOn(portalModule, "getItemData").and.resolveTo({
        some: "prop",
      });
      const tmpl = {
        item: {},
        data: {},
      } as common.IItemTemplate;
      const convertSpy = spyOn(convertToTmplModule, "convertWebExperienceToTemplate").and.resolveTo(tmpl);

      await WebExperienceProcessor.convertItemToTemplate({ id: "bc3" }, MOCK_USER_SESSION, MOCK_USER_SESSION);
      expect(getItemDataSpy.calls.count()).withContext("should get the data").toBe(1);
      expect(convertSpy.calls.count()).withContext("should convert the model to template").toBe(1);
    });
  });

  describe("createItemFromTemplate", () => {
    it("it exists", () => {
      expect(WebExperienceProcessor.createItemFromTemplate)
        .withContext("Should have createItemFromTemplate method")
        .toBeDefined();
    });

    // objects used in following tests
    const fakeExB = {
      item: {
        id: "FAKE3ef",
      },
    } as hubCommon.IModel;
    const tmpl = {
      itemId: "bc8",
      type: "Web Experience",
      item: {},
    } as common.IItemTemplate;
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

    it("happy-path", async() => {
      const createFromTmplSpy = spyOn(createFromTemplateModule, "createWebExperienceModelFromTemplate").and.resolveTo({
        item: {},
      });

      const createSpy = spyOn(createExperienceModule, "createWebExperience").and.resolveTo(fakeExB);

      const result = await WebExperienceProcessor.createItemFromTemplate(tmpl, td, MOCK_USER_SESSION, cb);
      expect(result.id).withContext("should return the created item id").toBe("FAKE3ef");
      expect(result.type).withContext("should return the type").toBe("Web Experience");
      expect(result.postProcess).withContext("should not postProcess").toBe(false);
      expect(createFromTmplSpy.calls.count()).withContext("should call createFromTemplate").toBe(1);
      expect(createSpy.calls.count()).withContext("should call createWebExperience").toBe(1);
    });

    it("early-exits correctly", async() => {
      const cbFalse = () => false;

      const result = await WebExperienceProcessor.createItemFromTemplate(tmpl, td, MOCK_USER_SESSION, cbFalse);
      expect(result.id).withContext("should return empty result").toBe("");
      expect(result.postProcess).withContext("should return postProcess false").toBe(false);
    });

    it("callsback on exception", async() => {
      spyOn(createExperienceModule, "createWebExperience").and.rejectWith("booom");

      return WebExperienceProcessor.createItemFromTemplate(tmpl, td, MOCK_USER_SESSION, cb)
        .then(() => fail())
        .catch((ex) => {
          expect(ex).withContext("should re-throw").toBe("booom");
          return Promise.resolve();
        });
    });
    it("cleans up if job is cancelled late", async() => {
      // fn that returns a fn that closes over a counter so that
      // it can return false after the first call
      const createCb = () => {
        let calls = 0;
        return () => {
          calls = calls + 1;
          return calls < 2;
        };
      };
      const createFromTmplSpy = spyOn(createFromTemplateModule, "createWebExperienceModelFromTemplate").and.resolveTo({
        item: {},
      });

      const createSpy = spyOn(createExperienceModule, "createWebExperience").and.resolveTo(fakeExB);
      const removeSpy = spyOn(portalModule, "removeItem").and.resolveTo({
        success: true,
        itemId: "3ef",
      });

      const result = await WebExperienceProcessor.createItemFromTemplate(tmpl, td, MOCK_USER_SESSION, createCb());
      expect(result.id).withContext("should return empty result").toBe("");
      expect(result.postProcess).withContext("should return postProcess false").toBe(false);
      expect(result.type).withContext("should return the type").toBe("Web Experience");
      expect(createFromTmplSpy.calls.count()).withContext("should call createFromTemplate").toBe(1);
      expect(createSpy.calls.count()).withContext("should call createWebExperience").toBe(1);
      expect(removeSpy.calls.count()).withContext("should remove the item").toBe(1);
    });
  });

  describe("postProcess :: ", () => {
    it("should call updateItemTemplateFromDictionary", async() => {
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
      const returnValue: common.IUpdateItemResponse = {
        success: true,
        id: "abc",
      };
      spyOn(common, "updateItemTemplateFromDictionary").and.resolveTo(returnValue);

      const result = await WebExperienceProcessor.postProcess(
        "abc",
        "Web Experience",
        [],
        null as any,
        [],
        td,
        MOCK_USER_SESSION,
      );
      expect(result.success).toBeTruthy();
      expect(result.id).toBe("abc");
    });
  });
});
