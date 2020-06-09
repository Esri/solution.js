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

describe("Module `web-experience`: ", () => {
  describe("convertItemToTemplate :: ", () => {
    it("should fetch the data and delegate to convertToTemplate", () => {
      const getItemDataSpy = spyOn(portalModule, "getItemData").and.resolveTo({
        some: "prop"
      });
      const tmpl = {
        item: {},
        data: {}
      } as common.IItemTemplate;
      const convertSpy = spyOn(
        convertToTmplModule,
        "convertWebExperienceToTemplate"
      ).and.resolveTo(tmpl);

      return WebExperienceProcessor.convertItemToTemplate(
        "2c36d3679e7f4934ac599051df22daf6",
        { id: "bc3" },
        MOCK_USER_SESSION,
        false
      ).then(result => {
        expect(getItemDataSpy.calls.count()).toBe(1, "should get the data");
        expect(convertSpy.calls.count()).toBe(
          1,
          "should convert the model to template"
        );
      });
    });
  });

  describe("createItemFromTemplate", () => {
    it("it exists", () => {
      expect(WebExperienceProcessor.createItemFromTemplate).toBeDefined(
        "Should have createItemFromTemplate method"
      );
    });

    // objects used in following tests
    const fakeExB = {
      item: {
        id: "FAKE3ef"
      }
    } as hubCommon.IModel;
    const tmpl = {
      itemId: "bc8",
      type: "Web Experience",
      item: {}
    } as common.IItemTemplate;
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

    it("happy-path", () => {
      const createFromTmplSpy = spyOn(
        createFromTemplateModule,
        "createWebExperienceModelFromTemplate"
      ).and.resolveTo({ item: {} });

      const createSpy = spyOn(
        createExperienceModule,
        "createWebExperience"
      ).and.resolveTo(fakeExB);
      return WebExperienceProcessor.createItemFromTemplate(
        tmpl,
        td,
        MOCK_USER_SESSION,
        cb
      ).then(result => {
        expect(result.id).toBe("FAKE3ef", "should return the created item id");
        expect(result.type).toBe("Web Experience", "should return the type");
        expect(result.postProcess).toBe(false, "should not postProcess");
        expect(createFromTmplSpy.calls.count()).toBe(
          1,
          "should call createFromTemplate"
        );
        expect(createSpy.calls.count()).toBe(
          1,
          "should call createWebExperience"
        );
      });
    });
    it("early-exits correctly", () => {
      const cbFalse = () => false;
      return WebExperienceProcessor.createItemFromTemplate(
        tmpl,
        td,
        MOCK_USER_SESSION,
        cbFalse
      ).then(result => {
        expect(result.id).toBe("", "should return empty result");
        expect(result.postProcess).toBe(
          false,
          "should return postProcess false"
        );
      });
    });
    it("callsback on exception", done => {
      spyOn(createExperienceModule, "createWebExperience").and.rejectWith(
        "booom"
      );
      return WebExperienceProcessor.createItemFromTemplate(
        tmpl,
        td,
        MOCK_USER_SESSION,
        cb
      )
        .then(result => {
          done.fail();
        })
        .catch(ex => {
          expect(ex).toBe("booom", "should re-throw");
          done();
        });
    });
    it("cleans up if job is cancelled late", () => {
      // fn that returns a fn that closes over a counter so that
      // it can return false after the first call
      const createCb = () => {
        let calls = 0;
        return () => {
          calls = calls + 1;
          return calls < 2;
        };
      };
      const createFromTmplSpy = spyOn(
        createFromTemplateModule,
        "createWebExperienceModelFromTemplate"
      ).and.resolveTo({ item: {} });

      const createSpy = spyOn(
        createExperienceModule,
        "createWebExperience"
      ).and.resolveTo(fakeExB);
      const removeSpy = spyOn(portalModule, "removeItem").and.resolveTo({
        success: true,
        itemId: "3ef"
      });
      return WebExperienceProcessor.createItemFromTemplate(
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
        expect(result.type).toBe("Web Experience", "should return the type");
        expect(createFromTmplSpy.calls.count()).toBe(
          1,
          "should call createFromTemplate"
        );
        expect(createSpy.calls.count()).toBe(
          1,
          "should call createWebExperience"
        );
        expect(removeSpy.calls.count()).toBe(1, "should remove the item");
      });
    });
  });
});
