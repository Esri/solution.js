/** @license
 * Copyright 2021 Esri
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
 * Provides tests for functions for determining key properties of the local time zone
 */

import * as interfaces from "../src/interfaces";
import * as utils from "./mocks/utils";
import {
  getPreferredTimeReference,
  _getRespectsDaylightSaving,
  _getTimeZoneName
} from "../src/timeHelpers";

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `timeHelpers`: functions for determining key properties of the local time zone", () => {
  describe("getPreferredTimeReference", () => {
    it("", () => {
      let actual = getPreferredTimeReference("America/Denver");
      expect(actual).toEqual({
        preferredTimeReference: {
          timeZone:"Mountain Standard Time",
          respectsDaylightSaving: true
        }
      });

      actual = getPreferredTimeReference("N/A");
      expect(actual).toEqual({
        preferredTimeReference: {
          timeZone:"Pacific Standard Time",
          respectsDaylightSaving: true
        }
      });
    });
  });

  describe("_getRespectsDaylightSaving", () => {
    it("will evaluate time zones", () => {
      let actual = _getRespectsDaylightSaving("America/Phoenix");
      expect(actual).toEqual(false);

      actual = _getRespectsDaylightSaving("America/Denver");
      expect(actual).toEqual(true);
    });

  });

  describe("_getTimeZoneName", () => {
    it("", () => {
      let actual = _getTimeZoneName("N/A");
      expect(actual).toEqual("");

      actual = _getTimeZoneName("America/Denver");
      expect(actual).toEqual("Mountain Standard Time");
    });
  });

});