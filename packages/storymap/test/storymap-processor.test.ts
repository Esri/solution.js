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
import * as utils from "../../common/test/mocks/utils";
import * as convertToTemplateModule from "../src/helpers/convert-storymap-to-template";
import * as createFromTemplateModule from "../src/helpers/create-storymap-model-from-template";
import * as createStoryMapModule from "../src/helpers/create-storymap";
import * as portalModule from "@esri/arcgis-rest-portal";

const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `storymap-processor`: ", () => {
  describe("convertItemToTemplate :: ", () => {
    it("happy path", async() => {
      const getDataSpy = spyOn(portalModule, "getItemData").and.resolveTo({});
      const tmpl = {
        item: {},
        data: {},
      } as common.IItemTemplate;
      const createTmplSpy = spyOn(convertToTemplateModule, "convertStoryMapToTemplate").and.resolveTo(tmpl);

      const resp = await StorymapProcessor.convertItemToTemplate(
        {
          type: "StoryMap",
          id: "bcfake23",
        },
        MOCK_USER_SESSION,
        MOCK_USER_SESSION,
      );
      expect(resp).withContext("should return the template").toBe(tmpl);
      expect(getDataSpy.calls.count()).withContext("should get the data").toBe(1);
      expect(createTmplSpy.calls.count()).withContext("should delegate to createTemplate fn").toBe(1);
    });
  });

  describe("createItemFromTemplate", () => {
    // objects used in following tests
    const fakeStoryMap = {
      item: {
        id: "FAKE3ef",
      },
    } as hubCommon.IModel;
    const tmpl = {
      itemId: "bc8",
      type: "StoryMap",
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

    it("exists", () => {
      expect(StorymapProcessor.createItemFromTemplate)
        .withContext("Should have createItemFromTemplate method")
        .toBeDefined();
    });

    it("happy-path", async() => {
      const createFromTmplSpy = spyOn(createFromTemplateModule, "createStoryMapModelFromTemplate").and.resolveTo({
        assets: [],
      });

      const createSpy = spyOn(createStoryMapModule, "createStoryMap").and.resolveTo(fakeStoryMap);

      const result = await StorymapProcessor.createItemFromTemplate(tmpl, td, MOCK_USER_SESSION, cb);
      expect(result.id).withContext("should return the created item id").toBe("FAKE3ef");
      expect(result.type).withContext("should return the type").toBe("StoryMap");
      expect(result.postProcess).withContext("should not postProcess").toBe(false);
      expect(createFromTmplSpy.calls.count()).withContext("should call createFromTemplate").toBe(1);
      expect(createSpy.calls.count()).withContext("should call createStoryMap").toBe(1);
    });

    it("accepts and empty solution hash", async() => {
      const createFromTmplSpy = spyOn(createFromTemplateModule, "createStoryMapModelFromTemplate").and.resolveTo({});

      const createSpy = spyOn(createStoryMapModule, "createStoryMap").and.resolveTo(fakeStoryMap);
      const myTd = hubCommon.cloneObject(td);
      delete (myTd as any).solution;

      const result = await StorymapProcessor.createItemFromTemplate(tmpl, myTd, MOCK_USER_SESSION, cb);
      expect(result.id).withContext("should return the created item id").toBe("FAKE3ef");
      expect(result.type).withContext("should return the type").toBe("StoryMap");
      expect(result.postProcess).withContext("should not postProcess").toBe(false);
      expect(createFromTmplSpy.calls.count()).withContext("should call createFromTemplate").toBe(1);
      expect(createSpy.calls.count()).withContext("should call createStoryMap").toBe(1);
    });

    it("early-exits correctly", async() => {
      const cbFalse = () => false;

      const result = await StorymapProcessor.createItemFromTemplate(tmpl, td, MOCK_USER_SESSION, cbFalse);
      expect(result.id).withContext("should return empty result").toBe("");
      expect(result.postProcess).withContext("should return postProcess false").toBe(false);
    });

    it("callsback on exception", async() => {
      spyOn(createFromTemplateModule, "createStoryMapModelFromTemplate").and.rejectWith("booom");

      return StorymapProcessor.createItemFromTemplate(tmpl, td, MOCK_USER_SESSION, cb)
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
      const createFromTmplSpy = spyOn(createFromTemplateModule, "createStoryMapModelFromTemplate").and.resolveTo({
        assets: [],
      });

      const createSpy = spyOn(createStoryMapModule, "createStoryMap").and.resolveTo(fakeStoryMap);
      const removeSpy = spyOn(portalModule, "removeItem").and.resolveTo({
        success: true,
        itemId: "3ef",
      });

      const result = await StorymapProcessor.createItemFromTemplate(tmpl, td, MOCK_USER_SESSION, createCb());
      expect(result.id).withContext("should return empty result").toBe("");
      expect(result.postProcess).withContext("should return postProcess false").toBe(false);
      expect(result.type).withContext("should return the type").toBe("StoryMap");
      expect(createFromTmplSpy.calls.count()).withContext("should call createFromTemplate").toBe(1);
      expect(createSpy.calls.count()).withContext("should call createStoryMap").toBe(1);
      expect(removeSpy.calls.count()).withContext("should remove the item").toBe(1);
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
