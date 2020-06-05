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
 * Provides tests for functions involving the creation and deployment of Story Map item types.
 */

import * as common from "@esri/solution-common";
import * as hubCommon from "@esri/hub-common";
import * as StorymapProcessor from "../src/storymap-processor";
import * as mockTemplates from "@esri/solution-common/test/mocks/templates";
import * as utils from "@esri/solution-common/test/mocks/utils";
import * as convertToTemplateModule from "../src/helpers/convert-storymap-to-template";
import * as createFromTemplateModule from "../src/helpers/create-storymap-model-from-template";
import * as createStoryMapModule from "../src/helpers/create-storymap";
import * as portalModule from "@esri/arcgis-rest-portal";

const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `storymap`: ", () => {
  describe("convertItemToTemplate :: ", () => {
    it("happy path", () => {
      const getDataSpy = spyOn(portalModule, "getItemData").and.resolveTo({});
      const tmpl = {
        item: {},
        data: {}
      } as common.IItemTemplate;
      const createTmplSpy = spyOn(
        convertToTemplateModule,
        "convertStoryMapToTemplate"
      ).and.resolveTo(tmpl);

      return StorymapProcessor.convertItemToTemplate(
        "sln1234567890",
        {
          type: "StoryMap",
          id: "bcfake23"
        },
        MOCK_USER_SESSION
      ).then(resp => {
        expect(resp).toBe(tmpl, "should return the template");
        expect(getDataSpy.calls.count()).toBe(1, "should get the data");
        expect(createTmplSpy.calls.count()).toBe(
          1,
          "should delegate to createTemplate fn"
        );
      });
    });
  });

  describe("createItemFromTemplate", () => {
    // objects used in following tests
    const fakeStoryMap = {
      item: {
        id: "FAKE3ef"
      }
    } as hubCommon.IModel;
    const tmpl = {
      itemId: "bc8",
      type: "StoryMap",
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

    it("exists", () => {
      expect(StorymapProcessor.createItemFromTemplate).toBeDefined(
        "Should have createItemFromTemplate method"
      );
    });

    it("happy-path", () => {
      const createFromTmplSpy = spyOn(
        createFromTemplateModule,
        "createStoryMapModelFromTemplate"
      ).and.resolveTo({ assets: [] });

      const createSpy = spyOn(
        createStoryMapModule,
        "createStoryMap"
      ).and.resolveTo(fakeStoryMap);

      return StorymapProcessor.createItemFromTemplate(
        tmpl,
        td,
        MOCK_USER_SESSION,
        cb
      ).then(result => {
        expect(result.id).toBe("FAKE3ef", "should return the created item id");
        expect(result.type).toBe("StoryMap", "should return the type");
        expect(result.postProcess).toBe(false, "should not postProcess");
        expect(createFromTmplSpy.calls.count()).toBe(
          1,
          "should call createFromTemplate"
        );
        expect(createSpy.calls.count()).toBe(1, "should call createStoryMap");
      });
    });
    it("accepts and empty solution hash", () => {
      const createFromTmplSpy = spyOn(
        createFromTemplateModule,
        "createStoryMapModelFromTemplate"
      ).and.resolveTo({});

      const createSpy = spyOn(
        createStoryMapModule,
        "createStoryMap"
      ).and.resolveTo(fakeStoryMap);
      const myTd = hubCommon.cloneObject(td);
      delete myTd.solution;

      return StorymapProcessor.createItemFromTemplate(
        tmpl,
        myTd,
        MOCK_USER_SESSION,
        cb
      ).then(result => {
        expect(result.id).toBe("FAKE3ef", "should return the created item id");
        expect(result.type).toBe("StoryMap", "should return the type");
        expect(result.postProcess).toBe(false, "should not postProcess");
        expect(createFromTmplSpy.calls.count()).toBe(
          1,
          "should call createFromTemplate"
        );
        expect(createSpy.calls.count()).toBe(1, "should call createStoryMap");
      });
    });
    it("early-exits correctly", () => {
      const cbFalse = () => false;
      return StorymapProcessor.createItemFromTemplate(
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
      spyOn(
        createFromTemplateModule,
        "createStoryMapModelFromTemplate"
      ).and.rejectWith("booom");

      return StorymapProcessor.createItemFromTemplate(
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
        "createStoryMapModelFromTemplate"
      ).and.resolveTo({ assets: [] });

      const createSpy = spyOn(
        createStoryMapModule,
        "createStoryMap"
      ).and.resolveTo(fakeStoryMap);
      const removeSpy = spyOn(portalModule, "removeItem").and.resolveTo({
        success: true,
        itemId: "3ef"
      });
      return StorymapProcessor.createItemFromTemplate(
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
        expect(result.type).toBe("StoryMap", "should return the type");
        expect(createFromTmplSpy.calls.count()).toBe(
          1,
          "should call createFromTemplate"
        );
        expect(createSpy.calls.count()).toBe(1, "should call createStoryMap");
        expect(removeSpy.calls.count()).toBe(1, "should remove the item");
      });
    });
  });

  describe("isAStoryMap", () => {
    it("is the StoryMap item type", () => {
      expect(StorymapProcessor.isAStoryMap("StoryMap")).toBeTruthy();
    });
    it("returns false if not", () => {
      expect(StorymapProcessor.isAStoryMap("NotStoryMap")).toBeFalse();
    });
  });
});
