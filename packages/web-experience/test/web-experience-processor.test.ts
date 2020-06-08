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

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

// ------------------------------------------------------------------------------------------------------------------ //

xdescribe("Module `web-experience`: ", () => {
  describe("convertItemToTemplate :: ", () => {
    it("should reject with an error response", done => {
      const failSpy = spyOn(common, "fail").and.callThrough();
      return WebExperienceProcessor.convertItemToTemplate(
        "2c36d3679e7f4934ac599051df22daf6",
        {},
        MOCK_USER_SESSION,
        false
      ).then(
        _ => {
          done.fail("convertItemToTemplate should have rejected");
        },
        e => {
          const error =
            "convertItemToTemplate not yet implemented for WebExperienceProcessor";
          const expected = { success: false, error };
          expect(failSpy.calls.count()).toBe(1);
          expect(failSpy.calls.first().args).toEqual([error]);
          expect(e).toEqual(expected);
          done();
        }
      );
    });
  });

  describe("createItemFromTemplate", () => {
    it("should reject with an error response", done => {
      const failSpy = spyOn(common, "fail").and.callThrough();
      const template = {} as common.IItemTemplate;
      const progressCallback = jasmine.createSpy();
      return WebExperienceProcessor.createItemFromTemplate(
        template,
        {},
        MOCK_USER_SESSION,
        progressCallback
      ).then(
        _ => {
          done.fail("createItemFromTemplate should have rejected");
        },
        e => {
          const error =
            "createItemFromTemplate not yet implemented for WebExperienceProcessor";
          const expected = { success: false, error };
          expect(failSpy.calls.count()).toBe(1);
          expect(failSpy.calls.first().args).toEqual([error]);
          expect(e).toEqual(expected);
          done();
        }
      );
    });
  });
});
