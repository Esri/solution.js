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
import * as ClassicStorymapProcessor from "../src/classic-storymap-processor";
import * as mockTemplates from "@esri/solution-common/test/mocks/templates";
import * as utils from "@esri/solution-common/test/mocks/utils";

const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `ClassicStorymapProcessor`: ", () => {
  describe("convertItemToTemplate :: ", () => {
    it("recognizes Classic StoryMap", done => {
      const solutionItemId = "sln1234567890";
      ClassicStorymapProcessor.convertItemToTemplate(solutionItemId, {
        type: "Web Mapping Application",
        url:
          "{{portalBaseUrl}}/apps/MapJournal/index.html?appid={{wma1234567890.itemId}}"
      }).then(
        () => done.fail(), // not yet implemented
        response => {
          expect(response).toEqual(
            common.fail("Classic StoryMap is not yet implemented")
          );
          done();
        }
      );
    });

    it("rejects a non-StoryMap", done => {
      const solutionItemId = "sln1234567890";
      ClassicStorymapProcessor.convertItemToTemplate(solutionItemId, {
        id: "wma1234567890",
        type: "Web Mapping Application",
        url:
          "http://anOrg.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=itm1234567890"
      }).then(
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
    it("recognizes Classic StoryMap", done => {
      const templateSTO: common.IItemTemplate = mockTemplates.getItemTemplate(
        "Web Mapping Application"
      );
      templateSTO.item.url =
        "{{portalBaseUrl}}/apps/Cascade/index.html?appid={{wma1234567890.itemId}}";
      ClassicStorymapProcessor.createItemFromTemplate(
        templateSTO,
        {},
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK
      ).then(response => {
        expect(response).toEqual({
          id: "Classic StoryMap is not yet implemented", // temporary
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
      ClassicStorymapProcessor.createItemFromTemplate(
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
    it("has to have a URL if it's a firsst-gen storymap", () => {
      const templateWMA: common.IItemTemplate = mockTemplates.getItemTemplate(
        "Web Mapping Application"
      );
      templateWMA.item.url = null;
      expect(
        ClassicStorymapProcessor.isAStoryMap(
          templateWMA.type,
          templateWMA.item.url
        )
      ).toBeFalsy();
    });

    it("has a StoryMap type in its URL", () => {
      const templateWMA: common.IItemTemplate = mockTemplates.getItemTemplate(
        "Web Mapping Application"
      );
      expect(
        ClassicStorymapProcessor.isAStoryMap(
          templateWMA.type,
          templateWMA.item.url
        )
      ).toBeFalsy();

      templateWMA.item.url =
        "{{portalBaseUrl}}/apps/Cascade/index.html?appid={{wma1234567890.itemId}}";
      expect(
        ClassicStorymapProcessor.isAStoryMap(
          templateWMA.type,
          templateWMA.item.url
        )
      ).toBeTruthy();

      templateWMA.item.url =
        "{{portalBaseUrl}}/apps/MapJournal/index.html?appid={{wma1234567890.itemId}}";
      expect(
        ClassicStorymapProcessor.isAStoryMap(
          templateWMA.type,
          templateWMA.item.url
        )
      ).toBeTruthy();

      templateWMA.item.url =
        "{{portalBaseUrl}}/apps/MapSeries/index.html?appid={{wma1234567890.itemId}}";
      expect(
        ClassicStorymapProcessor.isAStoryMap(
          templateWMA.type,
          templateWMA.item.url
        )
      ).toBeTruthy();

      templateWMA.item.url =
        "{{portalBaseUrl}}/apps/MapTour/index.html?appid={{wma1234567890.itemId}}";
      expect(
        ClassicStorymapProcessor.isAStoryMap(
          templateWMA.type,
          templateWMA.item.url
        )
      ).toBeTruthy();

      templateWMA.item.url =
        "{{portalBaseUrl}}/apps/Shortlist/index.html?appid={{wma1234567890.itemId}}";
      expect(
        ClassicStorymapProcessor.isAStoryMap(
          templateWMA.type,
          templateWMA.item.url
        )
      ).toBeTruthy();

      templateWMA.item.url =
        "{{portalBaseUrl}}/apps/StoryMap/index.html?appid={{wma1234567890.itemId}}";
      expect(
        ClassicStorymapProcessor.isAStoryMap(
          templateWMA.type,
          templateWMA.item.url
        )
      ).toBeTruthy();

      templateWMA.item.url =
        "{{portalBaseUrl}}/apps/StoryMapBasic/index.html?appid={{wma1234567890.itemId}}";
      expect(
        ClassicStorymapProcessor.isAStoryMap(
          templateWMA.type,
          templateWMA.item.url
        )
      ).toBeTruthy();

      templateWMA.item.url =
        "{{portalBaseUrl}}/apps/StorytellingSwipe/index.html?appid={{wma1234567890.itemId}}";
      expect(
        ClassicStorymapProcessor.isAStoryMap(
          templateWMA.type,
          templateWMA.item.url
        )
      ).toBeTruthy();
    });
  });
});
