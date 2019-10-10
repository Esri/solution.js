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
import * as storymap from "../src/storymap";
import * as mockTemplates from "../../common/test/mocks/templates";

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `storymap`", () => {
  describe("convertItemToTemplate", () => {
    xit("convertItemToTemplate", done => {
      console.warn("========== TODO ========== storymap convertItemToTemplate");
      done.fail();
    });
  });

  describe("createItemFromTemplate", () => {
    xit("createItemFromTemplate", done => {
      console.warn(
        "========== TODO ========== storymap createItemFromTemplate"
      );
      done.fail();
    });
  });

  describe("isAStoryMap", () => {
    it("has to have a URL", () => {
      const templateWMA: common.IItemTemplate = mockTemplates.getItemTemplatePart(
        "Web Mapping Application"
      );
      templateWMA.item.url = null;
      expect(storymap.isAStoryMap(templateWMA)).toBeFalsy();

      const templateSTO: common.IItemTemplate = mockTemplates.getItemTemplatePart(
        "StoryMap"
      );
      templateSTO.item.url = null;
      expect(storymap.isAStoryMap(templateSTO)).toBeFalsy();
    });

    it("is the StoryMap item type", () => {
      const template: common.IItemTemplate = mockTemplates.getItemTemplatePart(
        "StoryMap"
      );
      expect(storymap.isAStoryMap(template)).toBeTruthy();
    });

    it("has a StoryMap type in its URL", () => {
      const templateWMA: common.IItemTemplate = mockTemplates.getItemTemplatePart(
        "Web Mapping Application"
      );
      expect(storymap.isAStoryMap(templateWMA)).toBeFalsy();

      templateWMA.item.url =
        "{{organization.portalBaseUrl}}/apps/Cascade/index.html?appid={{wma1234567890.id}}";
      expect(storymap.isAStoryMap(templateWMA)).toBeTruthy();

      templateWMA.item.url =
        "{{organization.portalBaseUrl}}/apps/MapJournal/index.html?appid={{wma1234567890.id}}";
      expect(storymap.isAStoryMap(templateWMA)).toBeTruthy();

      templateWMA.item.url =
        "{{organization.portalBaseUrl}}/apps/MapSeries/index.html?appid={{wma1234567890.id}}";
      expect(storymap.isAStoryMap(templateWMA)).toBeTruthy();

      templateWMA.item.url =
        "{{organization.portalBaseUrl}}/apps/MapTour/index.html?appid={{wma1234567890.id}}";
      expect(storymap.isAStoryMap(templateWMA)).toBeTruthy();

      templateWMA.item.url =
        "{{organization.portalBaseUrl}}/apps/Shortlist/index.html?appid={{wma1234567890.id}}";
      expect(storymap.isAStoryMap(templateWMA)).toBeTruthy();

      templateWMA.item.url =
        "{{organization.portalBaseUrl}}/apps/StoryMap/index.html?appid={{wma1234567890.id}}";
      expect(storymap.isAStoryMap(templateWMA)).toBeTruthy();

      templateWMA.item.url =
        "{{organization.portalBaseUrl}}/apps/StoryMapBasic/index.html?appid={{wma1234567890.id}}";
      expect(storymap.isAStoryMap(templateWMA)).toBeTruthy();

      templateWMA.item.url =
        "{{organization.portalBaseUrl}}/apps/StorytellingSwipe/index.html?appid={{wma1234567890.id}}";
      expect(storymap.isAStoryMap(templateWMA)).toBeTruthy();
    });
  });
});
