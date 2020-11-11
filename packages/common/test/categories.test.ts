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
 * Provides tests for functions involving request encoding to help with searching by category.
 */

import * as interfaces from "../src/interfaces";
import * as utils from "./mocks/utils";
import {
  encodeFormData,
  _encodeParam,
  _processParams
} from "../src/categories";
import { requiresFormData } from "@esri/arcgis-rest-request";

// ------------------------------------------------------------------------------------------------------------------ //

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

describe("Module `categories`: functions involving request encoding to help with searching by category", () => {
  describe("encodeFormData clone", () => {
    it("should encode in form data for multipart file requests", () => {
      const binaryObj = _attachmentFile();

      const formData = encodeFormData({ binary: binaryObj });
      expect(formData instanceof FormData).toBeTruthy();

      const data = formData as FormData;
      if (data.get) {
        expect(data.get("binary") instanceof File).toBeTruthy();
        expect((data.get("binary") as File).name).toBe("foo.txt");
      }
    });

    it("should encode in form data for multipart blob requests", () => {
      const binaryObj =
        typeof Blob !== "undefined"
          ? new Blob([], {
              type: "text/plain"
            })
          : Buffer.from("");

      const formData = encodeFormData({ binary: binaryObj });
      expect(formData instanceof FormData).toBeTruthy();

      const data = formData as FormData;
      if (data.get) {
        expect(data.get("binary") instanceof File).toBeTruthy();
        expect((data.get("binary") as File).name).toBe("binary");
      }
    });

    it("should encode as query string for basic types", () => {
      const dateValue = 1471417200000;

      // null, undefined, function are excluded. If you want to send an empty key you need to send an empty string "".
      // See https://github.com/Esri/arcgis-rest-js/issues/18
      const params = {
        myArray1: new Array(8),
        myArray2: [1, 2, 4, 16],
        myArray3: [{ a: 1, b: 2 }, { c: "abc" }],
        myDate: new Date(dateValue),
        myFunction: () => {
          return 3.1415;
        },
        myBoolean: true,
        myString: "Hello, world!",
        myEmptyString: "",
        myNumber: 380
      };

      expect(requiresFormData(params)).toBeFalsy();

      const formData = _processParams(params);
      expect(typeof formData).toBe("object");
      expect(formData.myArray1).toBe(",,,,,,,");
      expect(formData.myArray2).toBe("1,2,4,16");
      expect(formData.myArray3).toBe('[{"a":1,"b":2},{"c":"abc"}]');
      expect(formData.myDate).toBe(dateValue);
      expect(formData.myBoolean).toBeTruthy();
      expect(formData.myString).toBe("Hello, world!");
      expect(formData.myEmptyString).toBe("");
      expect(formData.myNumber).toBe(380);

      const encodedFormData = encodeFormData(params);
      expect(typeof encodedFormData).toBe("string");
      expect(encodedFormData).toBe(
        "myArray1=%2C%2C%2C%2C%2C%2C%2C&" +
          "myArray2=1%2C2%2C4%2C16&" +
          "myArray3=%5B%7B%22a%22%3A1%2C%22b%22%3A2%7D%2C%7B%22c%22%3A%22abc%22%7D%5D&" +
          "myDate=1471417200000&" +
          "myBoolean=true&" +
          "myString=Hello%2C%20world!&" +
          "myEmptyString=&" +
          "myNumber=380"
      );
    });

    it("should switch to form data if any item is not a basic type", () => {
      const dateValue = 1471417200000;
      const file = _attachmentFile();
      if (!file.name) {
        // The file's name is used for adding files to a form, so supply a name when we're in a testing
        // environment that doesn't support File (_attachmentFile creates a File with the name "foo.txt"
        // if File is supported and a file stream otherwise)
        file.name = "foo.txt";
      }

      // null, undefined, function are excluded. If you want to send an empty key you need to send an empty string "".
      // See https://github.com/Esri/arcgis-rest-js/issues/18
      const params = {
        myArray1: new Array(8),
        myArray2: [1, 2, 4, 16],
        myArray3: [{ a: 1, b: 2 }, { c: "abc" }],
        myDate: new Date(dateValue),
        myFunction: () => {
          return 3.1415;
        },
        myBoolean: true,
        myString: "Hello, world!",
        myEmptyString: "",
        myNumber: 380,
        file
      };

      expect(requiresFormData(params)).toBeTruthy();

      const formData = _processParams(params);
      expect(typeof formData).toBe("object");
      expect(formData.myArray1).toBe(",,,,,,,");
      expect(formData.myArray2).toBe("1,2,4,16");
      expect(formData.myArray3).toBe('[{"a":1,"b":2},{"c":"abc"}]');
      expect(formData.myDate).toBe(dateValue);
      expect(formData.myBoolean).toBeTruthy();
      expect(formData.myString).toBe("Hello, world!");
      expect(formData.myEmptyString).toBe("");
      expect(formData.myNumber).toBe(380);
      expect(typeof formData.file).toBe("object");

      const encodedFormData = encodeFormData(params);
      expect(encodedFormData instanceof FormData).toBeTruthy();
    });
  });

  describe("encodeQueryString clone", () => {
    it("should encode parameters other than categories", () => {
      const encodedParam = _encodeParam("q", "look for this");
      expect(encodedParam).toEqual("q=look%20for%20this");
    });

    it("should encode single categories parameter", () => {
      const encodedParam = _encodeParam("categories", [
        "/Categories/Water,/Categories/Forest"
      ]);
      expect(encodedParam).toEqual(
        "categories=%2FCategories%2FWater%2C%2FCategories%2FForest"
      );
    });

    it("should encode multiple categories parameters", () => {
      const encodedParam = _encodeParam("categories", [
        "/Categories/Water,/Categories/Forest",
        "/Region/United States"
      ]);
      expect(encodedParam).toEqual(
        "categories=%2FCategories%2FWater%2C%2FCategories%2FForest&categories=%2FRegion%2FUnited%20States"
      );
    });
  });

  describe("processParams clone", () => {
    it("should pass non Date, Function, Array and Object params through", () => {
      const params = {
        foo: "foo",
        bar: 1
      };

      const expected = {
        foo: "foo",
        bar: 1
      };
      expect(_processParams(params)).toEqual(expected);
    });

    it("should encode Dates as timestamps", () => {
      const date = new Date();

      const params = {
        foo: date
      };

      const expected = {
        foo: date.getTime()
      };
      expect(_processParams(params)).toEqual(expected);
    });

    it("should not encode a function", () => {
      const params = {
        foo() {} // tslint:disable-line no-empty
      };

      expect(_processParams(params)).toEqual({});
    });

    it("should stringify objects", () => {
      const params = {
        foo: {
          bar: "bar"
        }
      };

      const expected = {
        foo: '{"bar":"bar"}'
      };

      expect(_processParams(params)).toEqual(expected);
    });

    it("should stringify arrays of objects", () => {
      const params = {
        foo: [
          {
            bar: "bar"
          }
        ]
      };

      const expected = {
        foo: '[{"bar":"bar"}]'
      };

      expect(_processParams(params)).toEqual(expected);
    });

    it("should comma seperate arrays of non objects", () => {
      const params = {
        foo: ["bar", "baz"]
      };

      const expected = {
        foo: "bar,baz"
      };

      expect(_processParams(params)).toEqual(expected);
    });

    it("should stringify booleans", () => {
      const params = {
        foo: true,
        bar: false
      };

      const expected = {
        foo: "true",
        bar: "false"
      };

      expect(_processParams(params)).toEqual(expected);
    });

    it("should exclude null and undefined, but not a zero", () => {
      const params: any = {
        foo: null,
        bar: undefined,
        baz: 0
      };

      const expected = {
        baz: 0
      };

      expect(_processParams(params)).toEqual(expected);
    });

    it("should not require form data for simple requests", () => {
      expect(
        requiresFormData({
          string: "string"
        })
      ).toBeFalsy();

      expect(
        requiresFormData({
          number: 123
        })
      ).toBeFalsy();

      expect(
        requiresFormData({
          date: new Date()
        })
      ).toBeFalsy();

      expect(
        requiresFormData({
          boolean: true
        })
      ).toBeFalsy();

      expect(
        requiresFormData({
          array: []
        })
      ).toBeFalsy();

      expect(
        requiresFormData({
          object: {}
        })
      ).toBeFalsy();

      expect(
        requiresFormData({
          fn: () => {
            return;
          }
        })
      ).toBeFalsy();

      expect(
        requiresFormData({
          falsy: null
        })
      ).toBeFalsy();
    });

    it("should require form data for multipart requests", () => {
      const binaryObj =
        typeof File !== "undefined"
          ? new File(["foo"], "foo.txt", {
              type: "text/plain"
            })
          : Buffer.from("");

      expect(
        requiresFormData({
          binary: binaryObj
        })
      ).toBeTruthy();
    });

    it("should require form data for mixed multipart requests", () => {
      const binaryObj =
        typeof File !== "undefined"
          ? new File(["foo"], "foo.txt", {
              type: "text/plain"
            })
          : Buffer.from("");

      expect(
        requiresFormData({
          string: "string",
          binary: binaryObj
        })
      ).toBeTruthy();
    });

    it("uses the `toParam` feature in the SearchQueryBuilder", () => {
      const params = {
        foo: true,
        bar: false,
        builder: {
          toParam: () => "true or false"
        }
      };

      const expected = {
        foo: "true",
        bar: "false",
        builder: "true or false"
      };

      expect(_processParams(params)).toEqual(expected);
    });
  });

  describe("additional category-specific tests", () => {
    it("should switch to form data if any item is not a basic type", () => {
      const dateValue = 1471417200000;
      const file = _attachmentFile();
      if (!file.name) {
        // The file's name is used for adding files to a form, so supply a name when we're in a testing
        // environment that doesn't support File (_attachmentFile creates a File with the name "foo.txt"
        // if File is supported and a file stream otherwise)
        file.name = "foo.txt";
      }

      // null, undefined, function are excluded. If you want to send an empty key you need to send an empty string "".
      // See https://github.com/Esri/arcgis-rest-js/issues/18
      const params = {
        myArray1: new Array(8),
        myArray2: [1, 2, 4, 16],
        myArray3: [{ a: 1, b: 2 }, { c: "abc" }],
        myDate: new Date(dateValue),
        myFunction: () => {
          return 3.1415;
        },
        myBoolean: true,
        myString: "Hello, world!",
        myEmptyString: "",
        myNumber: 380,
        file,
        categories: [
          "/Categories/Water,/Categories/Forest",
          "/Region/United States"
        ]
      };

      expect(requiresFormData(params)).toBeTruthy();

      const formData = _processParams(params);
      expect(typeof formData).toBe("object");
      expect(formData.myArray1).toBe(",,,,,,,");
      expect(formData.myArray2).toBe("1,2,4,16");
      expect(formData.myArray3).toBe('[{"a":1,"b":2},{"c":"abc"}]');
      expect(formData.myDate).toBe(dateValue);
      expect(formData.myBoolean).toBeTruthy();
      expect(formData.myString).toBe("Hello, world!");
      expect(formData.myEmptyString).toBe("");
      expect(formData.myNumber).toBe(380);
      expect(typeof formData.file).toBe("object");
      expect(Array.isArray(formData.categories)).toBeTruthy();
      expect(formData.categories.length).toEqual(2);

      const encodedFormData = encodeFormData(params);
      expect(encodedFormData instanceof FormData).toBeTruthy();
      // Test where supported
      if ((encodedFormData as FormData).forEach) {
        let numCategoriesParams = 0;
        (encodedFormData as FormData).forEach(
          (value: FormDataEntryValue, key: string, parent: FormData) => {
            numCategoriesParams += key === "categories" ? 1 : 0;
          }
        );
        expect(numCategoriesParams).toEqual(2);
      }
    });
  });
});

// ------------------------------------------------------------------------------------------------------------------ //

function _attachmentFile() {
  if (typeof File !== "undefined" && File) {
    return new File(["foo"], "foo.txt", { type: "text/plain" });
  } else {
    const fs = require("fs");
    return fs.createReadStream(
      "./packages/arcgis-rest-feature-layer/test/mocks/foo.txt"
    );
  }
}
