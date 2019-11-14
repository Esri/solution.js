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
 * Provides tests for general helper functions.
 */

import * as generalHelpers from "../src/generalHelpers";
import * as interfaces from "../src/interfaces";

describe("Module `generalHelpers`: common utility functions shared across packages", () => {
  // Blobs are only available in the browser
  if (typeof window !== "undefined") {
    describe("blobToJson", () => {
      it("extracts JSON from a blob", done => {
        const srcJson: any = {
          a: "b",
          c: 4
        };
        const blob: Blob = new Blob([JSON.stringify(srcJson)], {
          type: "application/json"
        });

        generalHelpers.blobToJson(blob).then(extractedJson => {
          expect(extractedJson).toEqual(srcJson);
          done();
        }, done.fail);
      });

      it("fails to extract JSON from a blob 1", done => {
        const blob: Blob = new Blob([], { type: "application/json" });

        generalHelpers.blobToJson(blob).then(extractedJson => {
          expect(extractedJson).toBeNull();
          done();
        }, done.fail);
      });

      it("fails to extract JSON from a blob 2", done => {
        const blob: Blob = null;

        generalHelpers.blobToJson(blob).then(extractedJson => {
          expect(extractedJson).toBeNull();
          done();
        }, done.fail);
      });
    });
  }

  describe("cloneObject", () => {
    it("can clone a shallow object", () => {
      const obj = {
        color: "red",
        length: 12
      } as any;
      const c = generalHelpers.cloneObject(obj);
      expect(c).not.toBe(obj);

      ["color", "length"].map(prop => {
        expect(c[prop]).toEqual(obj[prop]);
      });
    });

    it("can clone a deep object", () => {
      const obj = {
        color: "red",
        length: 12,
        field: {
          name: "origin",
          type: "string"
        }
      } as any;
      const c = generalHelpers.cloneObject(obj);
      expect(c).not.toBe(obj);
      expect(c.field).not.toBe(obj.field);

      ["color", "length"].map(prop => {
        expect(c[prop]).toEqual(obj[prop]);
      });
      ["name", "type"].map(prop => {
        expect(c.field[prop]).toEqual(obj.field[prop]);
      });
    });

    it("does not stringify null", () => {
      const obj = {
        color: "red",
        length: 12,
        field: {
          name: "origin",
          type: null
        }
      } as any;
      const c = generalHelpers.cloneObject(obj);
      expect(c).not.toBe(obj);
      expect(c.field).not.toBe(obj.field);
      expect(c.field.type).toBe(null);

      ["color", "length"].map(prop => {
        expect(c[prop]).toEqual(obj[prop]);
      });
      ["name", "type"].map(prop => {
        expect(c.field[prop]).toEqual(obj.field[prop]);
      });
    });

    it("can clone a deep object with an array", () => {
      const obj = {
        color: "red",
        length: 12,
        field: {
          name: "origin",
          type: "string"
        },
        names: ["steve", "james", "bob"],
        deep: [
          {
            things: ["one", "two", "red", "blue"]
          }
        ],
        addresses: [
          {
            street: "123 main",
            city: "anytown",
            zip: 82729
          },
          {
            street: "876 main",
            city: "anytown",
            zip: 123992
          }
        ]
      } as any;

      const c = generalHelpers.cloneObject(obj);
      expect(c).not.toBe(obj);
      expect(c.field).not.toBe(obj.field);
      expect(c.names).not.toBe(obj.names);
      expect(c.names.length).toEqual(obj.names.length);
      expect(Array.isArray(c.deep)).toBeTruthy();
      expect(c.deep[0].things.length).toBe(4);
      ["color", "length"].map(prop => {
        expect(c[prop]).toEqual(obj[prop]);
      });
      ["name", "type"].map(prop => {
        expect(c.field[prop]).toEqual(obj.field[prop]);
      });
      // deep array...
      expect(Array.isArray(c.addresses)).toBeTruthy();
      expect(c.addresses.length).toEqual(obj.addresses.length);

      c.addresses.forEach((entry: any, idx: number) => {
        const orig = obj.addresses[idx];
        expect(entry).not.toBe(orig);
        ["street", "city", "zip"].map(prop => {
          expect(entry[prop]).toBe(orig[prop]);
        });
      });
    });
  });

  describe("deleteProp", () => {
    it("should handle missing prop", () => {
      const testObject: any = {};
      generalHelpers.deleteProp(testObject, "prop1");
      expect(testObject).toEqual({});
    });

    it("should delete a prop", () => {
      const testObject: any = {
        prop1: true,
        prop2: true
      };
      const expected: any = {
        prop2: true
      };
      generalHelpers.deleteProp(testObject, "prop1");
      expect(testObject).toEqual(expected);
    });
  });

  describe("deleteProps", () => {
    it("should handle missing props", () => {
      const testObject: any = {};
      generalHelpers.deleteProps(testObject, ["prop1", "prop2"]);
      expect(testObject).toEqual({});
    });

    it("should delete props", () => {
      const testObject: any = {
        prop1: true,
        prop2: true,
        prop3: true
      };
      const expected: any = {
        prop2: true
      };
      generalHelpers.deleteProps(testObject, ["prop1", "prop3"]);
      expect(testObject).toEqual(expected);
    });
  });

  describe("fail", () => {
    it("can return failure with no error argument", () => {
      const error: any = undefined;
      const expected: any = { success: false };
      expect(generalHelpers.fail(error)).toEqual(expected);
    });

    it("can return failure with no error property on error argument", () => {
      const error: any = "Error";
      const expected: any = { success: false, error: "Error" };
      expect(generalHelpers.fail(error)).toEqual(expected);
    });

    it("can return failure with error property on error argument", () => {
      const error: any = { error: "Error" };
      const expected: any = { success: false, error: "Error" };
      expect(generalHelpers.fail(error)).toEqual(expected);
    });
  });

  describe("getProp", () => {
    it("should return a property given a path", () => {
      expect(generalHelpers.getProp({ color: "red" }, "color")).toEqual(
        "red",
        "should return the prop"
      );
    });

    it("should return a deep property given a path", () => {
      expect(
        generalHelpers.getProp(
          { color: { r: "ff", g: "00", b: "ff" } },
          "color.r"
        )
      ).toEqual("ff", "should return the prop");
    });
  });

  describe("getProps", () => {
    it("should return an array of props", () => {
      const o = {
        one: {
          two: {
            three: {
              color: "red"
            },
            threeB: {
              color: "orange"
            }
          },
          other: "value"
        }
      };

      const vals = generalHelpers.getProps(o, [
        "one.two.three.color",
        "one.two.threeB.color"
      ]);
      expect(vals.length).toEqual(2, "should return two values");
      expect(vals.indexOf("red")).toBeGreaterThan(-1, "should have red");
      expect(vals.indexOf("orange")).toBeGreaterThan(-1, "should have orange");
    });

    it("should push an array into the return values", () => {
      const o = {
        one: {
          two: ["a", "b"],
          color: "red"
        }
      };
      const vals = generalHelpers.getProps(o, ["one.two", "one.color"]);
      expect(vals.length).toEqual(2, "should return two values");
      expect(vals.indexOf("red")).toBeGreaterThan(-1, "should have red");
    });

    it("should handle missing props", () => {
      const o = {
        one: {
          two: ["a", "b"],
          color: "red"
        }
      };
      const vals = generalHelpers.getProps(o, [
        "one.two",
        "one.color",
        "thing.three"
      ]);
      expect(vals.length).toEqual(2, "should return two values");
      expect(vals.indexOf("red")).toBeGreaterThan(-1, "should have red");
    });
  });

  describe("getUTCTimestamp", () => {
    it("can get a well formed timestamp", () => {
      const timestamp: string = generalHelpers.getUTCTimestamp();
      const exp: string = "^\\d{8}_\\d{4}_\\d{5}$";
      const regEx = new RegExp(exp, "gm");
      expect(regEx.test(timestamp)).toBe(true);
    });
  });

  describe("hasAnyKeyword", () => {
    it("can handle a model with no typeKeywords", () => {
      const model: any = {};
      const keywords: string[] = [];
      const expected: boolean = false;
      expect(generalHelpers.hasAnyKeyword(model, keywords)).toBe(expected);
    });

    it("can handle empty keywords argument", () => {
      const model: any = {
        item: {
          typeKeywords: ["A", "B", "C"]
        }
      };
      const keywords: string[] = [];
      const expected: boolean = false;
      expect(generalHelpers.hasAnyKeyword(model, keywords)).toBe(expected);
    });

    it("can test for a set of keywords from model.item.typeKeywords", () => {
      const model: any = {
        item: {
          typeKeywords: ["A", "B", "C"]
        }
      };
      const keywords: string[] = ["A"];
      const expected: boolean = true;
      expect(generalHelpers.hasAnyKeyword(model, keywords)).toBe(expected);
    });

    it("can test for a set of keywords from model.typeKeywords", () => {
      const model: any = {
        typeKeywords: ["A", "B", "C"]
      };
      const keywords: string[] = ["C"];
      const expected: boolean = true;
      expect(generalHelpers.hasAnyKeyword(model, keywords)).toBe(expected);
    });

    it("can handle an actual set of keywords from model.item.typeKeywords", () => {
      const model: any = {
        item: {
          typeKeywords: [
            "Map",
            "Mapping Site",
            "Online Map",
            "source-ed27522a057b466587ddd2ffabd33661",
            "WAB2D",
            "Web AppBuilder"
          ]
        }
      };
      const keywords: string[] = ["WAB2D", "WAB3D", "Web AppBuilder"];
      const expected: boolean = true;
      expect(generalHelpers.hasAnyKeyword(model, keywords)).toBe(expected);
    });
  });

  describe("hasTypeKeyword", () => {
    it("can handle an object with no typeKeywords", () => {
      const model: any = {};
      const keyword: string = "";
      const expected: boolean = false;
      expect(generalHelpers.hasTypeKeyword(model, keyword)).toBe(expected);
    });

    it("can handle an object with item.typeKeywords", () => {
      const model: any = {
        item: {
          typeKeywords: ["A", "B", "C"]
        }
      };
      const keyword: string = "A";
      const expected: boolean = true;
      expect(generalHelpers.hasTypeKeyword(model, keyword)).toBe(expected);
    });

    it("can handle an object with typeKeywords", () => {
      const model: any = {
        typeKeywords: ["A", "B", "C"]
      };
      const keyword: string = "B";
      const expected: boolean = true;
      expect(generalHelpers.hasTypeKeyword(model, keyword)).toBe(expected);
    });
  });

  describe("hasDatasource", () => {
    it("will return true when datasource is found", () => {
      const itemId: string = "solutionItem0123456";
      const layerId: number = 0;
      const datasource: interfaces.IDatasourceInfo = {
        layerId: layerId,
        ids: [],
        itemId: itemId,
        basePath: "",
        fields: [],
        relationships: [],
        adminLayerInfo: {}
      };
      const actual: boolean = generalHelpers.hasDatasource(
        [datasource],
        itemId,
        layerId
      );
      expect(actual).toBe(true);
    });

    it("will return false when itemId is NOT found", () => {
      const itemId: string = "solutionItem0123456";
      const layerId: number = 0;
      const datasource: interfaces.IDatasourceInfo = {
        layerId: layerId,
        ids: [],
        itemId: itemId,
        basePath: "",
        fields: [],
        relationships: [],
        adminLayerInfo: {}
      };
      const actual: boolean = generalHelpers.hasDatasource(
        [datasource],
        itemId + "1",
        layerId
      );
      expect(actual).toBe(false);
    });

    it("will return false when layerId is NOT found", () => {
      const itemId: string = "solutionItem0123456";
      const layerId: number = 0;
      const datasource: interfaces.IDatasourceInfo = {
        layerId: layerId,
        ids: [],
        itemId: itemId,
        basePath: "",
        fields: [],
        relationships: [],
        adminLayerInfo: {}
      };
      const actual: boolean = generalHelpers.hasDatasource(
        [datasource],
        itemId,
        1
      );
      expect(actual).toBe(false);
    });
  });

  describe("cleanItemId", () => {
    it("should handle empty id", () => {
      expect(generalHelpers.cleanItemId(null)).toBeNull();
      expect(generalHelpers.cleanItemId(undefined)).toBeUndefined();
      expect(generalHelpers.cleanItemId("")).toEqual("");
    });

    it("should remove template braces and itemId property", () => {
      expect(generalHelpers.cleanItemId("{{itm1234567890.itemId}}")).toEqual(
        "itm1234567890"
      );
    });
  });

  describe("cleanLayerBasedItemId", () => {
    xit("cleanLayerBasedItemId", done => {
      console.warn("========== TODO cleanLayerBasedItemId ========== ");
      done.fail();
    });
  });

  describe("cleanLayerId", () => {
    it("handles a null or empty string", () => {
      expect(generalHelpers.cleanLayerId(null)).toEqual(null);
      expect(generalHelpers.cleanLayerId("")).toEqual("");
    });

    it("handles a templatized layer id", () => {
      expect(
        generalHelpers.cleanLayerId(
          "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.layerId}}"
        )
      ).toEqual(0);
      expect(
        generalHelpers.cleanLayerId(
          "{{934a9ef8efa7448fa8ddf7b13cef0240.layer5.layerId}}"
        )
      ).toEqual(5);
      expect(
        generalHelpers.cleanLayerId(
          "{{934a9ef8efa7448fa8ddf7b13cef0240.layer12.layerId}}"
        )
      ).toEqual(12);
    });
  });

  describe("_padPositiveNum", () => {
    it("handles numbers wider than minimum width", () => {
      expect(generalHelpers._padPositiveNum(0, 0)).toEqual("0");
      expect(generalHelpers._padPositiveNum(123, 0)).toEqual("123");
    });

    it("handles numbers the same width as the minimum width", () => {
      expect(generalHelpers._padPositiveNum(0, 1)).toEqual("0");
      expect(generalHelpers._padPositiveNum(123, 3)).toEqual("123");
    });

    it("handles numbers narrower than the minimum width", () => {
      expect(generalHelpers._padPositiveNum(0, 10)).toEqual("0000000000");
      expect(generalHelpers._padPositiveNum(123, 10)).toEqual("0000000123");
    });
  });
});
