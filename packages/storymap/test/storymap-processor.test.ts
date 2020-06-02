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
import * as StorymapProcessor from "../src/storymap-processor";
import * as mockTemplates from "@esri/solution-common/test/mocks/templates";
import * as utils from "@esri/solution-common/test/mocks/utils";

const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `storymap`: ", () => {
  describe("convertItemToTemplate :: ", () => {
    it("recognizes StoryMap", done => {
      const solutionItemId = "sln1234567890";
      StorymapProcessor.convertItemToTemplate(
        solutionItemId,
        {
          type: "StoryMap"
        },
        MOCK_USER_SESSION
      ).then(
        () => done.fail(), // not yet implemented
        response => {
          expect(response).toEqual(
            common.fail("StoryMap is not yet implemented")
          );
          done();
        }
      );
    });

    it("rejects a non-StoryMap", done => {
      const solutionItemId = "sln1234567890";
      StorymapProcessor.convertItemToTemplate(
        solutionItemId,
        {
          id: "wma1234567890",
          type: "Web Mapping Application",
          url:
            "http://anOrg.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=itm1234567890"
        },
        MOCK_USER_SESSION
      ).then(
        () => done.fail(), // not yet implemented
        response => {
          expect(response).toEqual(
            common.fail("wma1234567890 is not a StoryMap")
          );
          done();
        }
      );
    });
  });

  describe("createItemFromTemplate", () => {
    it("recognizes StoryMap", done => {
      const templateSTO: common.IItemTemplate = mockTemplates.getItemTemplate(
        "StoryMap"
      );
      StorymapProcessor.createItemFromTemplate(
        templateSTO,
        {},
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK
      ).then(response => {
        expect(response).toEqual({
          id: "Next-gen StoryMap is not yet implemented", // temporary
          type: templateSTO.type,
          postProcess: false
        });
        done();
      }, done.fail);
    });

    it("rejects a non-StoryMap", done => {
      const templateSTO: common.IItemTemplate = mockTemplates.getItemTemplate(
        "Web Mapping Application"
      );
      StorymapProcessor.createItemFromTemplate(
        templateSTO,
        {},
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK
      ).then(response => {
        expect(response).toEqual({
          id: "",
          type: templateSTO.type,
          postProcess: false
        });
        done();
      }, done.fail);
    });
  });

  describe("isAStoryMap", () => {
    it("is the StoryMap item type", () => {
      expect(StorymapProcessor.isAStoryMap("StoryMap")).toBeTruthy();
    });
  });
});
