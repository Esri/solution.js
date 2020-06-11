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

import * as libConnectors from "../src/libConnectors"; // JSZip, arcgis-html-sanitizer
import * as uuidv4 from "../src/libs/uuidv4"; // uuidv4
import * as xssFilterEvasionTestCases from "./XssFilterEvasionTestCases"; // arcgis-html-sanitizer
import { getSampleMetadataAsFile } from "../../common/test/mocks/utils";
import JSZip from "jszip";

//#region uuidv4 ---------------------------------------------------------------------------------------------------- //

describe("Module `uuidv4`: pseudo-GUID generator", () => {
  if (typeof window !== "undefined") {
    describe("createPseudoGUID", () => {
      it("creates GUID without dashes", () => {
        const guid = uuidv4.createPseudoGUID();
        expect(guid.length)
          .withContext("length check")
          .toEqual(32);
        expect(/[^0-9a-f]/.test(guid))
          .withContext("character check")
          .toBeFalsy();
      });

      it("creates GUID with dashes", () => {
        const guid = uuidv4.createPseudoGUID(true);
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

//#region JSZip ----------------------------------------------------------------------------------------------------- //

describe("Module `JSZip`: JavaScript-based zip utility", () => {
  if (typeof window !== "undefined") {
    describe("createZip", () => {
      it("handles empty file list", done => {
        libConnectors.createZip("zipfile", []).then(zipfile => {
          expect(zipfile.name)
            .withContext("zip created")
            .toEqual("zipfile");
          done();
        }, done.fail);
      });

      it("handles one file", done => {
        libConnectors
          .createZip("zipfile", [getSampleMetadataAsFile()])
          .then(zipfile => {
            expect(zipfile.name)
              .withContext("zip created")
              .toEqual("zipfile");

            const zip = new JSZip();
            zip.loadAsync(zipfile).then(() => {
              expect(zip.folder(/info/).length)
                .withContext("zip does not have folder")
                .toEqual(0);
              expect(zip.file(/metadata/).length)
                .withContext("zip has file")
                .toEqual(1);
              done();
            }, done.fail);
          }, done.fail);
      });

      it("handles one file in a folder", done => {
        libConnectors
          .createZip("zipfile", [getSampleMetadataAsFile("info/metadata")])
          .then(zipfile => {
            expect(zipfile.name)
              .withContext("zip created")
              .toEqual("zipfile");

            const zip = new JSZip();
            zip.loadAsync(zipfile).then(() => {
              expect(zip.folder(/info/).length)
                .withContext("zip has a folder")
                .toEqual(1);
              expect(zip.file(/metadata/).length)
                .withContext("zip has file")
                .toEqual(1);
              done();
            }, done.fail);
          }, done.fail);
      });
    });
  }
});

//#endregion ------------------------------------------------------------------------------------------------------------//

//#region arcgis-html-sanitizer ------------------------------------------------------------------------------------- //

describe("Module `arcgis-html-sanitizer`: HTML sanitizing", () => {
  describe("Sanitizer", () => {
    it("sanitizes a string", () => {
      // from https://github.com/esri/arcgis-html-sanitizer
      const sanitized = libConnectors.sanitizeHTML(
        '<img src="https://example.com/fake-image.jpg" onerror="alert(1);" />'
      );
      expect(sanitized).toEqual(
        '<img src="https://example.com/fake-image.jpg" />'
      );
    });

    it("sanitizes a string, supplying a sanitizer", () => {
      // Instantiate a new Sanitizer object
      const sanitizer = new libConnectors.Sanitizer();

      // Sanitize
      // from https://github.com/esri/arcgis-html-sanitizer
      const sanitized = libConnectors.sanitizeHTML(
        '<img src="https://example.com/fake-image.jpg" onerror="alert(1);" />',
        sanitizer
      );
      expect(sanitized).toEqual(
        '<img src="https://example.com/fake-image.jpg" />'
      );
    });

    it("sanitizes JSON", () => {
      // from https://github.com/esri/arcgis-html-sanitizer
      const sanitized = libConnectors.sanitizeJSON({
        sample: [
          '<img src="https://example.com/fake-image.jpg" onerror="alert(1);\
          " />'
        ]
      });
      expect(sanitized).toEqual({
        sample: ['<img src="https://example.com/fake-image.jpg" />']
      });
    });

    it("sanitizes JSON, supplying a sanitizer", () => {
      // Instantiate a new Sanitizer object
      const sanitizer = new libConnectors.Sanitizer();

      // Sanitize
      // from https://github.com/esri/arcgis-html-sanitizer
      const sanitized = libConnectors.sanitizeJSON(
        {
          sample: [
            '<img src="https://example.com/fake-image.jpg" onerror="alert(1);\
          " />'
          ]
        },
        sanitizer
      );
      expect(sanitized).toEqual({
        sample: ['<img src="https://example.com/fake-image.jpg" />']
      });
    });

    it("handles a missing value", () => {
      const sanitized = libConnectors.sanitizeJSON(null);
      expect(sanitized).toEqual(null);
    });

    it("handles a an empty structure", () => {
      const sanitized = libConnectors.sanitizeJSON({});
      expect(sanitized).toEqual({});
    });

    it("handles a an empty array", () => {
      const sanitized = libConnectors.sanitizeJSON([]);
      expect(sanitized).toEqual([]);
    });

    it("sanitizes an unsupported URL protocol", () => {
      // from https://github.com/esri/arcgis-html-sanitizer
      const sanitized = libConnectors.sanitizeURLProtocol(
        "smb://example.com/path/to/file.html"
      );
      expect(sanitized).toEqual("");
    });

    it("sanitizes a supported URL protocol", () => {
      // from https://github.com/esri/arcgis-html-sanitizer
      const sanitized = libConnectors.sanitizeURLProtocol(
        "https://example.com/about/index.html"
      );
      expect(sanitized).toEqual("https://example.com/about/index.html");
    });

    it("sanitizes a supported URL protocol, supplying a sanitizer", () => {
      // Instantiate a new Sanitizer object
      const sanitizer = new libConnectors.Sanitizer();

      // Sanitize
      // from https://github.com/esri/arcgis-html-sanitizer
      const sanitized = libConnectors.sanitizeURLProtocol(
        "https://example.com/about/index.html",
        sanitizer
      );
      expect(sanitized).toEqual("https://example.com/about/index.html");
    });

    it("validates a string containing valid HTML", () => {
      // Check if a string contains invalid HTML
      // from https://github.com/esri/arcgis-html-sanitizer
      const validation = libConnectors.validateHTML(
        '<img src="https://example.com/fake-image.jpg" />'
      );
      expect(validation).toEqual({
        isValid: true,
        sanitized: '<img src="https://example.com/fake-image.jpg" />'
      });
    });

    it("validates a string containing invalid HTML", () => {
      // Check if a string contains invalid HTML
      // from https://github.com/esri/arcgis-html-sanitizer
      const validation = libConnectors.validateHTML(
        '<img src="https://example.com/fake-image.jpg" onerror="alert(1);" />'
      );
      expect(validation).toEqual({
        isValid: false,
        sanitized: '<img src="https://example.com/fake-image.jpg" />'
      });
    });

    it("validates a string, supplying a sanitizer", () => {
      // Instantiate a new Sanitizer object
      const sanitizer = new libConnectors.Sanitizer();

      // Check if a string contains invalid HTML
      // from https://github.com/esri/arcgis-html-sanitizer
      const validation = libConnectors.validateHTML(
        '<img src="https://example.com/fake-image.jpg" onerror="alert(1);" />',
        sanitizer
      );
      expect(validation).toEqual({
        isValid: false,
        sanitized: '<img src="https://example.com/fake-image.jpg" />'
      });
    });

    it("tests XSS cases", () => {
      const sanitizer = new libConnectors.Sanitizer();

      xssFilterEvasionTestCases.testCases.forEach(
        (testCase: xssFilterEvasionTestCases.IXSSTestCase) => {
          expect(libConnectors.sanitizeHTML(testCase.example, sanitizer))
            .withContext(testCase.label)
            .toEqual(testCase.cleanedHtml);
        }
      );
    });
  });
});

//#endregion ------------------------------------------------------------------------------------------------------------//
