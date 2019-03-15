/*
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
import { cloneObject } from "../../src/utils/object-helpers";
import {
  getLayoutDependencies,
  getCardDependencies
} from "../../src/utils/layout-dependencies";

const testLayout = {
  sections: [
    {
      rows: [
        {
          cards: [
            {
              component: {
                name: "chart-card",
                settings: {
                  itemId: "cc1"
                }
              }
            },
            {
              component: {
                name: "summary-statistic-card",
                settings: {
                  itemId: "cc2"
                }
              }
            },
            {
              component: {
                name: "items/gallery-card",
                settings: {}
              }
            }
          ]
        }
      ]
    },
    {
      rows: [
        {
          cards: [
            {
              component: {
                name: "webmap-card",
                settings: {
                  webmap: "cc3"
                }
              }
            },
            {
              component: {
                name: "items/gallery-card",
                settings: {
                  ids: [
                    "0ee0b0a435db49969bbd93a7064a321c",
                    "eb173fb9d0084c4bbd19b40ee186965f",
                    "e8201f104dca4d8d87cb4ce1c7367257",
                    "5a14dbb7b2f3417fb4a6ea0506c2eb26"
                  ]
                }
              }
            }
          ]
        }
      ]
    }
  ]
};

describe("Layout Dependencies", () => {
  it("extracts dependencies from a whole layout", () => {
    const r = getLayoutDependencies(cloneObject(testLayout));
    expect(r).toBeTruthy("should return a value");
    expect(Array.isArray(r)).toBeTruthy("should be an array");
    expect(r.length).toEqual(7, "should have 7 entries");
    expect(r).toEqual(
      [
        "cc1",
        "cc2",
        "cc3",
        "0ee0b0a435db49969bbd93a7064a321c",
        "eb173fb9d0084c4bbd19b40ee186965f",
        "e8201f104dca4d8d87cb4ce1c7367257",
        "5a14dbb7b2f3417fb4a6ea0506c2eb26"
      ],
      "should return them"
    );
  });

  describe("card-specific dependencies", () => {
    it("should handle chart-card", () => {
      const c = {
        component: {
          name: "chart-card",
          settings: {
            itemId: "cc1"
          }
        }
      };
      const r = getCardDependencies(c);
      expect(r).toBeTruthy("should return a value");
      expect(Array.isArray(r)).toBeTruthy("should be an array");
      expect(r.length).toEqual(1, "should have 1 entries");
      expect(r[0]).toEqual("cc1", "extract the id");
    });

    it("should handle stats card", () => {
      const c = {
        component: {
          name: "summary-statistic-card",
          settings: {
            itemId: "cc2"
          }
        }
      };
      const r = getCardDependencies(c);
      expect(r).toBeTruthy("should return a value");
      expect(Array.isArray(r)).toBeTruthy("should be an array");
      expect(r.length).toEqual(1, "should have 1 entries");
      expect(r[0]).toEqual("cc2", "extract the id");
    });

    it("should handle gallery-card", () => {
      const c = {
        component: {
          name: "items/gallery-card",
          settings: {
            ids: [
              "0ee0b0a435db49969bbd93a7064a321c",
              "eb173fb9d0084c4bbd19b40ee186965f",
              "e8201f104dca4d8d87cb4ce1c7367257",
              "5a14dbb7b2f3417fb4a6ea0506c2eb26"
            ]
          }
        }
      };
      const r = getCardDependencies(c);
      expect(r).toBeTruthy("should return a value");
      expect(Array.isArray(r)).toBeTruthy("should be an array");
      expect(r.length).toEqual(4, "should have 4 entries");
      expect(r).toEqual(
        [
          "0ee0b0a435db49969bbd93a7064a321c",
          "eb173fb9d0084c4bbd19b40ee186965f",
          "e8201f104dca4d8d87cb4ce1c7367257",
          "5a14dbb7b2f3417fb4a6ea0506c2eb26"
        ],
        "extract the id"
      );
    });

    it("should handle webmap card", () => {
      const c = {
        component: {
          name: "webmap-card",
          settings: {
            webmap: "cc3"
          }
        }
      };
      const r = getCardDependencies(c);
      expect(r).toBeTruthy("should return a value");
      expect(Array.isArray(r)).toBeTruthy("should be an array");
      expect(r.length).toEqual(1, "should have 1 entries");
      expect(r[0]).toEqual("cc3", "extract the id");
    });
  });
});
