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
import * as utils from "../../common/test/mocks/utils";

const now = new Date();
const MOCK_USER_SESSION = utils.createRuntimeMockUserSession(now.getDate());

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `storymap`", () => {
  describe("convertItemToTemplate", () => {
    it("can handle gracefully while unimplemented", done => {
      storymap
        .convertItemToTemplate(
          {
            type: "StoryMap"
          },
          MOCK_USER_SESSION
        )
        .then(response => {
          expect(response).toBeUndefined();
          done();
        }, done.fail);
    });

    it("can handle gracefully while unimplemented and type !== 'StoryMap'", done => {
      storymap
        .convertItemToTemplate(
          {
            type: "FirstGENStoryMap"
          },
          MOCK_USER_SESSION
        )
        .then(response => {
          expect(response).toBeUndefined();
          done();
        }, done.fail);
    });
  });

  describe("createItemFromTemplate", () => {
    it("createItemFromTemplate", done => {
      const templateSTO: common.IItemTemplate = mockTemplates.getItemTemplate(
        "StoryMap"
      );
      storymap
        .createItemFromTemplate(
          templateSTO,
          [],
          MOCK_USER_SESSION,
          {},
          MOCK_USER_SESSION,
          () => {
            return 0;
          }
        )
        .then(response => {
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
    it("has to have a URL", () => {
      const templateWMA: common.IItemTemplate = mockTemplates.getItemTemplate(
        "Web Mapping Application"
      );
      templateWMA.item.url = null;
      expect(storymap.isAStoryMap(templateWMA)).toBeFalsy();

      const templateSTO: common.IItemTemplate = mockTemplates.getItemTemplate(
        "StoryMap"
      );
      templateSTO.item.url = null;
      expect(storymap.isAStoryMap(templateSTO)).toBeTruthy(); // nascent Story Maps don't have a URL
    });

    it("is the StoryMap item type", () => {
      const template: common.IItemTemplate = mockTemplates.getItemTemplate(
        "StoryMap"
      );
      expect(storymap.isAStoryMap(template)).toBeTruthy();
    });

    it("has a StoryMap type in its URL", () => {
      const templateWMA: common.IItemTemplate = mockTemplates.getItemTemplate(
        "Web Mapping Application"
      );
      expect(storymap.isAStoryMap(templateWMA)).toBeFalsy();

      templateWMA.item.url =
        "{{portalBaseUrl}}/apps/Cascade/index.html?appid={{wma1234567890.itemId}}";
      expect(storymap.isAStoryMap(templateWMA)).toBeTruthy();

      templateWMA.item.url =
        "{{portalBaseUrl}}/apps/MapJournal/index.html?appid={{wma1234567890.itemId}}";
      expect(storymap.isAStoryMap(templateWMA)).toBeTruthy();

      templateWMA.item.url =
        "{{portalBaseUrl}}/apps/MapSeries/index.html?appid={{wma1234567890.itemId}}";
      expect(storymap.isAStoryMap(templateWMA)).toBeTruthy();

      templateWMA.item.url =
        "{{portalBaseUrl}}/apps/MapTour/index.html?appid={{wma1234567890.itemId}}";
      expect(storymap.isAStoryMap(templateWMA)).toBeTruthy();

      templateWMA.item.url =
        "{{portalBaseUrl}}/apps/Shortlist/index.html?appid={{wma1234567890.itemId}}";
      expect(storymap.isAStoryMap(templateWMA)).toBeTruthy();

      templateWMA.item.url =
        "{{portalBaseUrl}}/apps/StoryMap/index.html?appid={{wma1234567890.itemId}}";
      expect(storymap.isAStoryMap(templateWMA)).toBeTruthy();

      templateWMA.item.url =
        "{{portalBaseUrl}}/apps/StoryMapBasic/index.html?appid={{wma1234567890.itemId}}";
      expect(storymap.isAStoryMap(templateWMA)).toBeTruthy();

      templateWMA.item.url =
        "{{portalBaseUrl}}/apps/StorytellingSwipe/index.html?appid={{wma1234567890.itemId}}";
      expect(storymap.isAStoryMap(templateWMA)).toBeTruthy();
    });
  });
});
