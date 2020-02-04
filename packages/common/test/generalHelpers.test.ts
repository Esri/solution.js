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
import * as mockItems from "../test/mocks/agolItems";

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

    it("handles empty path", () => {
      const obj: any = {
        child: 1
      };
      generalHelpers.deleteProp(obj, "");
      expect(obj).toEqual({
        child: 1
      });
    });

    it("handles non-existent property", () => {
      const obj: any = {
        child: 1
      };
      generalHelpers.deleteProp(obj, "nephew");
      expect(obj).toEqual({
        child: 1
      });
    });

    it("handles single-level property", () => {
      const obj: any = {
        child: 1
      };
      generalHelpers.deleteProp(obj, "child");
      expect(obj).toEqual({});
    });

    it("handles double-level property", () => {
      const obj: any = {
        child: {
          grandchildA: "a",
          grandchildB: "b"
        }
      };
      generalHelpers.deleteProp(obj, "child.grandchildB");
      expect(obj).toEqual({
        child: {
          grandchildA: "a"
        }
      });
    });

    it("handles second-level delete of triple-level property", () => {
      const obj: any = {
        child: {
          grandchildA: "a",
          grandchildB: {
            greatGrandchildC: {
              greatGreatGrandchildD: 4
            }
          }
        }
      };
      generalHelpers.deleteProp(obj, "child.grandchildB");
      expect(obj).toEqual({
        child: {
          grandchildA: "a"
        }
      });
    });

    it("handles triple-level property", () => {
      const obj: any = {
        child: {
          grandchildA: "a",
          grandchildB: {
            greatGrandchildC: {
              greatGreatGrandchildD: 4
            }
          }
        }
      };
      generalHelpers.deleteProp(obj, "child.grandchildB.greatGrandchildC");
      expect(obj).toEqual({
        child: {
          grandchildA: "a",
          grandchildB: {}
        }
      });
    });

    it("doesn't skip levels", () => {
      const obj: any = {
        child: {
          grandchildA: "a",
          grandchildB: "b"
        }
      };
      generalHelpers.deleteProp(obj, "grandchildB");
      expect(obj).toEqual({
        child: {
          grandchildA: "a",
          grandchildB: "b"
        }
      });
    });

    it("handles level-one array", () => {
      const obj: any = {
        child: ["a", "b"]
      };
      generalHelpers.deleteProp(obj, "child");
      expect(obj).toEqual({});
    });

    it("handles second-level array", () => {
      const obj: any = {
        child: {
          grandchildA: ["a", "b"],
          grandchildB: ["a", "b"]
        }
      };
      generalHelpers.deleteProp(obj, "child.grandchildA");
      expect(obj).toEqual({
        child: {
          grandchildB: ["a", "b"]
        }
      });
    });

    it("handles third-level array", () => {
      const obj: any = {
        child: {
          grandchildA: [
            {
              greatGrandchildC: ["a", "b"],
              greatGrandchildD: ["a", "b"]
            },
            {
              greatGrandchildE: ["a", "b"],
              greatGrandchildF: ["a", "b"]
            }
          ],
          grandchildB: ["a", "b"]
        }
      };
      generalHelpers.deleteProp(obj, "child.grandchildA.greatGrandchildD");
      expect(obj).toEqual({
        child: {
          grandchildA: [
            {
              greatGrandchildC: ["a", "b"]
            },
            {
              greatGrandchildE: ["a", "b"],
              greatGrandchildF: ["a", "b"]
            }
          ],
          grandchildB: ["a", "b"]
        }
      });
    });

    it("handles third-level array property", () => {
      const obj: any = {
        child: {
          grandchildA: [
            {
              greatGrandchildC: [
                {
                  greatGreatGrandchildG: 10
                }
              ],
              greatGrandchildD: ["a", "b"]
            },
            {
              greatGrandchildE: ["a", "b"],
              greatGrandchildF: [
                {
                  greatGreatGrandchildG: 10,
                  greatGreatGrandchildH: 15,
                  greatGreatGrandchildI: 20
                }
              ]
            }
          ],
          grandchildB: ["a", "b"]
        }
      };
      generalHelpers.deleteProp(
        obj,
        "child.grandchildA.greatGrandchildF.greatGreatGrandchildH"
      );
      expect(obj).toEqual({
        child: {
          grandchildA: [
            {
              greatGrandchildC: [
                {
                  greatGreatGrandchildG: 10
                }
              ],
              greatGrandchildD: ["a", "b"]
            },
            {
              greatGrandchildE: ["a", "b"],
              greatGrandchildF: [
                {
                  greatGreatGrandchildG: 10,
                  greatGreatGrandchildI: 20
                }
              ]
            }
          ],
          grandchildB: ["a", "b"]
        }
      });
    });

    it("handles third-level array solo property", () => {
      const obj: any = {
        child: {
          grandchildA: [
            {
              greatGrandchildC: [
                {
                  greatGreatGrandchildG: 10
                }
              ],
              greatGrandchildD: ["a", "b"]
            },
            {
              greatGrandchildE: ["a", "b"],
              greatGrandchildF: [
                {
                  greatGreatGrandchildG: 10,
                  greatGreatGrandchildH: 15,
                  greatGreatGrandchildI: 20
                }
              ]
            }
          ],
          grandchildB: ["a", "b"]
        }
      };
      generalHelpers.deleteProp(
        obj,
        "child.grandchildA.greatGrandchildC.greatGreatGrandchildG"
      );
      expect(obj).toEqual({
        child: {
          grandchildA: [
            {
              greatGrandchildC: [{}],
              greatGrandchildD: ["a", "b"]
            },
            {
              greatGrandchildE: ["a", "b"],
              greatGrandchildF: [
                {
                  greatGreatGrandchildG: 10,
                  greatGreatGrandchildH: 15,
                  greatGreatGrandchildI: 20
                }
              ]
            }
          ],
          grandchildB: ["a", "b"]
        }
      });
    });

    it("doesn't skip array levels", () => {
      const obj: any = {
        child: {
          grandchildA: ["a", "b"],
          grandchildB: ["a", "b"]
        }
      };
      generalHelpers.deleteProp(obj, "grandchildA");
      expect(obj).toEqual({
        child: {
          grandchildA: ["a", "b"],
          grandchildB: ["a", "b"]
        }
      });
    });

    it("handles same property in multiple array items", () => {
      const obj: any = {
        total: 29,
        start: 1,
        num: 2,
        nextStart: 3,
        items: [
          {
            documentation: null,
            screenshots: [],
            listed: false,
            numComments: 0,
            numRatings: 0,
            groupDesignations: null
          },
          {
            documentation: null,
            screenshots: [],
            listed: false,
            numComments: 0,
            numRatings: 0,
            groupDesignations: null
          }
        ]
      };
      generalHelpers.deleteProp(obj, "items.numComments");
      expect(obj).toEqual({
        total: 29,
        start: 1,
        num: 2,
        nextStart: 3,
        items: [
          {
            documentation: null,
            screenshots: [],
            listed: false,
            numRatings: 0,
            groupDesignations: null
          },
          {
            documentation: null,
            screenshots: [],
            listed: false,
            numRatings: 0,
            groupDesignations: null
          }
        ]
      });
    });
  });

  describe("compareJSON", () => {
    let sampleItemTemplate: any;
    beforeEach(() => {
      sampleItemTemplate = {
        item: {
          name: null,
          title: "z2g9f4nv",
          type: "Solution",
          typeKeywords: ["Solution", "Deployed"],
          description: null,
          tags: [],
          snippet: null,
          thumbnail: null,
          documentation: null,
          extent: "{{solutionItemExtent}}",
          categories: [],
          spatialReference: null,
          accessInformation: null,
          licenseInfo: null,
          culture: "english (united states)",
          properties: null,
          url: null,
          proxyFilter: null,
          access: "private",
          appCategories: [],
          industries: [],
          languages: [],
          largeThumbnail: null,
          banner: null,
          screenshots: [],
          listed: false,
          groupDesignations: null,
          id: "itm1234567890"
        },
        data: {
          metadata: {},
          templates: [
            {
              itemId: "geo1234567890",
              type: "GeoJson",
              dependencies: []
            }
          ]
        }
      };
    });

    it("empty objects", () => {
      expect(generalHelpers.compareJSON({}, {})).toBeTruthy();
    });

    it("one empty object", () => {
      expect(generalHelpers.compareJSON({ a: 1 }, {})).toBeFalsy();
      expect(generalHelpers.compareJSON({}, { a: 1 })).toBeFalsy();
    });

    it("two single-level objects", () => {
      expect(
        generalHelpers.compareJSON(
          { a: 1, b: 2, c: "3" },
          { a: 1, b: 2, c: "3" }
        )
      ).toBeTruthy();
      expect(
        generalHelpers.compareJSON({ a: 1, b: 2, c: "3" }, { a: 1 })
      ).toBeFalsy();
    });

    it("multiple-level objects", () => {
      expect(generalHelpers.compareJSON(sampleItemTemplate, sampleItemTemplate))
        .withContext("compare sampleItemTemplate, sampleItemTemplate")
        .toBeTruthy();

      let clone = generalHelpers.cloneObject(sampleItemTemplate);
      expect(generalHelpers.compareJSON(sampleItemTemplate, clone))
        .withContext("compare sampleItemTemplate, clone")
        .toBeTruthy();

      generalHelpers.deleteItemProps(clone);
      expect(generalHelpers.compareJSON({}, clone))
        .withContext("compare {}, clone")
        .toBeTruthy();
      expect(generalHelpers.compareJSON(sampleItemTemplate, clone))
        .withContext("compare sampleItemTemplate, clone")
        .toBeFalsy();

      clone = generalHelpers.deleteItemProps(
        generalHelpers.cloneObject(sampleItemTemplate.item)
      );
      const sampleItemBase = generalHelpers.deleteItemProps(
        generalHelpers.cloneObject(sampleItemTemplate.item)
      );
      expect(generalHelpers.compareJSON(sampleItemBase, clone))
        .withContext("compare sampleItemBase, clone")
        .toBeTruthy();
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

  describe("getUniqueTitle", () => {
    it("can return base title if it doesn't exist at path", () => {
      const title: string = "The Title";
      const templateDictionary: any = {
        user: {
          folders: []
        }
      };
      const path: string = "user.folders";
      const expected: string = "The Title";
      const actual: string = generalHelpers.getUniqueTitle(
        title,
        templateDictionary,
        path
      );
      expect(actual).toEqual(expected);
    });

    it("can return base title + 1 if the base title exists", () => {
      const title: string = "The Title";
      const templateDictionary: any = {
        user: {
          folders: [
            {
              title: "The Title"
            }
          ]
        }
      };
      const path: string = "user.folders";
      const expected: string = "The Title 1";
      const actual: string = generalHelpers.getUniqueTitle(
        title,
        templateDictionary,
        path
      );
      expect(actual).toEqual(expected);
    });

    it("can return base title + unique number if the base title + 1 exists", () => {
      const title: string = "The Title";
      const templateDictionary: any = {
        user: {
          folders: [
            {
              title: "The Title"
            },
            {
              title: "The Title 1"
            },
            {
              title: "The Title 3"
            }
          ]
        }
      };
      const path: string = "user.folders";
      const expected: string = "The Title 2";
      const actual: string = generalHelpers.getUniqueTitle(
        title,
        templateDictionary,
        path
      );
      expect(actual).toEqual(expected);
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

  describe("setCreateProp", () => {
    it("one-item path doesn't exist", () => {
      const obj = {} as any;
      generalHelpers.setCreateProp(obj, "level1", "value");
      expect(obj.level1).not.toBeUndefined();
      expect(obj.level1).toEqual("value");
    });

    it("two-item path doesn't exist", () => {
      const obj = {} as any;
      generalHelpers.setCreateProp(obj, "level1.level2", "value");
      expect(obj.level1).not.toBeUndefined();
      expect(obj.level1.level2).not.toBeUndefined();
      expect(obj.level1.level2).toEqual("value");
    });

    it("three-item path doesn't exist", () => {
      const obj = {} as any;
      generalHelpers.setCreateProp(obj, "level1.level2.level3", "value");
      expect(obj.level1).not.toBeUndefined();
      expect(obj.level1.level2).not.toBeUndefined();
      expect(obj.level1.level2.level3).not.toBeUndefined();
      expect(obj.level1.level2.level3).toEqual("value");
    });

    it("one-item path exists", () => {
      const obj = {
        level1: "placeholder"
      } as any;
      generalHelpers.setCreateProp(obj, "level1", "value");
      expect(obj.level1).not.toBeUndefined();
      expect(obj.level1).toEqual("value");
    });

    it("two-item path exists", () => {
      const obj = {
        level1: {
          level2: "placeholder"
        }
      } as any;
      generalHelpers.setCreateProp(obj, "level1.level2", "value");
      expect(obj.level1).not.toBeUndefined();
      expect(obj.level1.level2).not.toBeUndefined();
      expect(obj.level1.level2).toEqual("value");
    });

    it("three-item path exists", () => {
      const obj = {
        level1: {
          level2: {
            level3: "placeholder"
          }
        }
      } as any;
      generalHelpers.setCreateProp(obj, "level1.level2.level3", "value");
      expect(obj.level1).not.toBeUndefined();
      expect(obj.level1.level2).not.toBeUndefined();
      expect(obj.level1.level2.level3).not.toBeUndefined();
      expect(obj.level1.level2.level3).toEqual("value");
    });

    it("three-item path exists; merges without overwrite", () => {
      const obj = {
        level1: {
          sibling1: 5,
          level2: {
            level3: "placeholder",
            sibling3: 4
          },
          sibling2: {
            siblingChild: "child"
          }
        }
      } as any;
      const expectedObj = {
        level1: {
          sibling1: 5,
          level2: {
            level3: "value",
            sibling3: 4
          },
          sibling2: {
            siblingChild: "child"
          }
        }
      } as any;
      generalHelpers.setCreateProp(obj, "level1.level2.level3", "value");
      expect(obj.level1).not.toBeUndefined();
      expect(obj.level1.level2).not.toBeUndefined();
      expect(obj.level1.level2.level3).not.toBeUndefined();
      expect(obj).toEqual(expectedObj);
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

  describe("getTemplateById", () => {
    it("return template that matches id", () => {
      const item0 = mockItems.getAGOLItemWithId("Feature Service", 0);
      item0.itemId = "ABC123";
      const item1 = mockItems.getAGOLItemWithId("Feature Service", 1);
      item1.itemId = "ABC124";
      const item2 = mockItems.getAGOLItemWithId("Feature Service", 2);
      item2.itemId = "ABC125";

      const templates: interfaces.IItemTemplate[] = [item0, item1, item2];

      const id: string = "ABC124";
      const expected: any = item1;

      const actual: any = generalHelpers.getTemplateById(templates, id);

      expect(actual).toEqual(expected);
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
