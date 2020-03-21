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
 * Provides tests for arcgis-html-sanitizer helper functions.
 * This utility is a simple wrapper around the js-xss library that will configure js-xss to sanitize
 * a value according to the ArcGIS Supported HTML spec
 * (https://doc.arcgis.com/en/arcgis-online/reference/supported-html.htm).
 * It also includes a few additional helper methods to validate strings and prevent XSS attacks.
 */

import * as arcgisSanitizer from "../src/arcgis-html-sanitizer";
import * as xssFilterEvasionTestCases from "./XssFilterEvasionTestCases";

// ------------------------------------------------------------------------------------------------------------------ //

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
