/** @license
 * Copyright 2020 Esri
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
 * Provides tests for third-party helper functions.
 */

//#region uuidv4 ---------------------------------------------------------------------------------------------------- //

import * as libs from "../src/libs/uuidv4";

describe("Module `libs`: pseudo-GUID generator", () => {
  if (typeof window !== "undefined") {
    describe("createPseudoGUID", () => {
      it("creates GUID without dashes", () => {
        const guid = libs.createPseudoGUID();
        expect(guid.length)
          .withContext("length check")
          .toEqual(32);
        expect(/[^0-9a-f]/.test(guid))
          .withContext("character check")
          .toBeFalsy();
      });

      it("creates GUID with dashes", () => {
        const guid = libs.createPseudoGUID(true);
        expect(guid.length)
          .withContext("length check")
          .toEqual(36);
        expect(/[^0-9a-f\-]/.test(guid))
          .withContext("character check")
          .toBeFalsy();
        const guidParts = guid.split("-");
        expect(guidParts[0].length)
          .withContext("part 1 length check")
          .toEqual(8);
        expect(guidParts[1].length)
          .withContext("part 2 length check")
          .toEqual(4);
        expect(guidParts[2].length)
          .withContext("part 3 length check")
          .toEqual(4);
        expect(guidParts[3].length)
          .withContext("part 4 length check")
          .toEqual(4);
        expect(guidParts[4].length)
          .withContext("part 5 length check")
          .toEqual(12);
      });
    });
  }
});

//#endregion ------------------------------------------------------------------------------------------------------------//

//#region arcgis-html-sanitizer ------------------------------------------------------------------------------------- //

import * as arcgisSanitizer from "@esri/arcgis-html-sanitizer";
import * as xssFilterEvasionTestCases from "./XssFilterEvasionTestCases";

describe("Module `arcgis-html-sanitizer`: ", () => {
  describe("Sanitizer", () => {
    it("sanitizes a string", () => {
      // Instantiate a new Sanitizer object
      const sanitizer = new arcgisSanitizer.Sanitizer();

      // Sanitize a string
      const sanitizedHtml = sanitizer.sanitize(
        '<img src="https://example.com/fake-image.jpg" onerror="alert(1);" />'
      );
      expect(sanitizedHtml).toEqual(
        '<img src="https://example.com/fake-image.jpg" />'
      );
    });

    it("validates a string", () => {
      // Instantiate a new Sanitizer object
      const sanitizer = new arcgisSanitizer.Sanitizer();

      // Sanitize a string
      // Check if a string contains invalid HTML
      const validation = sanitizer.validate(
        '<img src="https://example.com/fake-image.jpg" onerror="alert(1);" />'
      );
      expect(validation).toEqual({
        isValid: false,
        sanitized: '<img src="https://example.com/fake-image.jpg" />'
      });
    });

    it("tests XSS cases", () => {
      console.log(
        "Running " +
          xssFilterEvasionTestCases.testCases.length +
          " XSS test cases"
      );
      const sanitizer = new arcgisSanitizer.Sanitizer();

      xssFilterEvasionTestCases.testCases.forEach(
        (testCase: xssFilterEvasionTestCases.IXSSTestCase) => {
          expect(sanitizer.sanitize(testCase.example))
            .withContext(testCase.label)
            .toEqual(testCase.cleanedHtml);
        }
      );
    });
  });
});

//#endregion ------------------------------------------------------------------------------------------------------------//
