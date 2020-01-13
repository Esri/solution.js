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
 * Provides tests for functions involving the adlib library.
 */

import * as interfaces from "../src/interfaces";
import * as templatization from "../src/templatization";
import * as utils from "../test/mocks/utils";

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `templatization`: common functions involving the adlib library", () => {
  describe("createInitializedGroupTemplate", () => {
    xit("createInitializedGroupTemplate", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("createInitializedItemTemplate", () => {
    xit("createInitializedItemTemplate", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("createPlaceholderTemplate", () => {
    xit("createPlaceholderTemplate", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("findTemplateIndexInList", () => {
    it("should handle an empty list", () => {
      const templates: interfaces.IItemTemplate[] = [];
      const id: string = "";
      const expected: number = -1;

      const actual = templatization.findTemplateIndexInList(templates, id);
      expect(actual).toEqual(expected);
    });

    it("should handle list without the sought item", () => {
      const templates = createItemTemplateList(["abc", "def", "ghi", "jkl"]);
      const id: string = "xyz";
      const expected: number = -1;

      const actual = templatization.findTemplateIndexInList(templates, id);
      expect(actual).toEqual(expected);
    });

    it("should handle list with the sought item", () => {
      const templates = createItemTemplateList(["abc", "def", "ghi", "jkl"]);
      const id: string = "def";
      const expected: number = 1;

      const actual = templatization.findTemplateIndexInList(templates, id);
      expect(actual).toEqual(expected);
    });
  });

  describe("findTemplateInList", () => {
    it("should handle an empty list", () => {
      const templates: interfaces.IItemTemplate[] = [];
      const id: string = "";
      const expected: interfaces.IItemTemplate = null;

      const actual = templatization.findTemplateInList(templates, id);
      expect(actual).toEqual(expected);
    });

    it("should handle list without the sought item", () => {
      const templates = createItemTemplateList(["abc", "def", "ghi", "jkl"]);
      const id: string = "xyz";
      const expected: interfaces.IItemTemplate = null;

      const actual = templatization.findTemplateInList(templates, id);
      expect(actual).toEqual(expected);
    });

    it("should handle list with the sought item", () => {
      const templates = createItemTemplateList(["abc", "def", "ghi", "jkl"]);
      const id: string = "def";
      const expected: interfaces.IItemTemplate = createItemTemplateList([
        "def"
      ])[0];

      const actual = templatization.findTemplateInList(templates, id);
      expect(actual).toEqual(expected);
    });
  });

  describe("replaceInTemplate", () => {
    it("should handle helper services", () => {
      const template: any = {
        item: {
          printProp: "{{organization.helperServices.printTask.url}}",
          routeProp: "{{organization.helperServices.route.url}}",
          geomProp: "{{organization.helperServices.geometry.url}}",
          geocodeProp:
            "{{organization.helperServices.geocode:getDefaultLocatorURL}}"
        }
      };
      const templateDictionary: any = {
        organization: utils.getPortalResponse()
      };
      const expected: any = {
        item: {
          printProp:
            "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
          routeProp:
            "https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World",
          geomProp:
            "https://utility.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer",
          geocodeProp:
            "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
        }
      };
      const actual: any = templatization.replaceInTemplate(
        template,
        templateDictionary
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("templatizeTerm", () => {
    it("should handle undefined context", () => {
      const context: string = undefined;
      const term: string = "aTerm";
      const suffix: string = undefined;
      const expected: string = context;

      const actual = templatization.templatizeTerm(context, term, suffix);
      expect(actual).toEqual(expected);
    });

    it("should handle default suffix", () => {
      const context: string = "a sentence with aTerm in it";
      const term: string = "aTerm";
      const suffix: string = undefined;
      const expected: string = "a sentence with {{aTerm}} in it";

      const actual = templatization.templatizeTerm(context, term, suffix);
      expect(actual).toEqual(expected);
    });

    it("should handle supplied suffix", () => {
      const context: string = "a sentence with aTerm in it";
      const term: string = "aTerm";
      const suffix: string = ".itemId";
      const expected: string = "a sentence with {{aTerm.itemId}} in it";

      const actual = templatization.templatizeTerm(context, term, suffix);
      expect(actual).toEqual(expected);
    });

    it("should handle multiple occurrences of term", () => {
      const context: string =
        "a sentence with multiple aTerms in it: aTerm, aTerm";
      const term: string = "aTerm";
      const suffix: string = ".itemId";
      const expected: string =
        "a sentence with multiple {{aTerm.itemId}}s in it: {{aTerm.itemId}}, {{aTerm.itemId}}";

      const actual = templatization.templatizeTerm(context, term, suffix);
      expect(actual).toEqual(expected);
    });
  });

  describe("templatizeToLowerCase", () => {
    it("should handle convert value to lower case", () => {
      const basePath: string = "abc";
      const value: string = "DEF";
      const expected: string = "{{abc.def}}";

      const actual = templatization.templatizeToLowerCase(basePath, value);
      expect(actual).toEqual(expected);
    });

    it("should return the value if its already been templatized", () => {
      const basePath: string = "abc";
      const value: string = "{{abc.def}}";
      const expected: string = "{{abc.def}}";

      const actual = templatization.templatizeToLowerCase(basePath, value);
      expect(actual).toEqual(expected);
    });
  });

  describe("templatizeFieldReferences", () => {
    it("will not templatize fieldnames that have already been templatized", () => {
      const obj: any = {
        field1: {
          fieldname: "test"
        },
        field2: {
          fieldname: "name"
        },
        field3: {
          fieldname: "{{0019226378376276.layer0.fields.test.name}}"
        },
        field4: {
          fieldname: "{{0019226378376276.layer0.fields.name.name}}"
        },
        expression:
          "$feature.name {name} name $feature.{{0019226378376276.layer0.fields.name.name}} {{{0019226378376276.layer0.fields.name.name}}} {{0019226378376276.layer0.fields.name.name}}",
        expression2:
          "$feature.test {test} test $feature.{{0019226378376276.layer0.fields.test.name}} {{{0019226378376276.layer0.fields.test.name}}} {{0019226378376276.layer0.fields.test.name}}",
        icon:
          "{{portalBaseUrl}}${itemId}/resources/inConfig/32951462444715296.png",
        generic: "{{test}}",
        generic2: "{{something.test}}",
        generic3: "{{something.test.something}}",
        generic4: "{{something.test.something.somethingElse}}",
        generic5: '$feature["COUNTY_ID.name"]',
        generic6: '$feature["name"]'
      };
      const fields: any[] = [
        {
          name: "test"
        },
        {
          name: "name"
        }
      ];
      const basePath: string = "0019226378376276.layer0.fields";

      const expected: any = {
        field1: {
          fieldname: "{{0019226378376276.layer0.fields.test.name}}"
        },
        field2: {
          fieldname: "{{0019226378376276.layer0.fields.name.name}}"
        },
        field3: {
          fieldname: "{{0019226378376276.layer0.fields.test.name}}"
        },
        field4: {
          fieldname: "{{0019226378376276.layer0.fields.name.name}}"
        },
        expression:
          "$feature.{{0019226378376276.layer0.fields.name.name}} {{{0019226378376276.layer0.fields.name.name}}} {{0019226378376276.layer0.fields.name.name}} $feature.{{0019226378376276.layer0.fields.name.name}} {{{0019226378376276.layer0.fields.name.name}}} {{0019226378376276.layer0.fields.name.name}}",
        expression2:
          "$feature.{{0019226378376276.layer0.fields.test.name}} {{{0019226378376276.layer0.fields.test.name}}} {{0019226378376276.layer0.fields.test.name}} $feature.{{0019226378376276.layer0.fields.test.name}} {{{0019226378376276.layer0.fields.test.name}}} {{0019226378376276.layer0.fields.test.name}}",
        icon:
          "{{portalBaseUrl}}${itemId}/resources/inConfig/32951462444715296.png",
        generic: "{{test}}",
        generic2: "{{something.test}}",
        generic3: "{{something.test.something}}",
        generic4: "{{something.test.something.somethingElse}}",
        generic5:
          '$feature["COUNTY_ID.{{0019226378376276.layer0.fields.name.name}}"]',
        generic6: '$feature["{{0019226378376276.layer0.fields.name.name}}"]'
      };

      const actual = templatization.templatizeFieldReferences(
        obj,
        fields,
        basePath
      );
      expect(actual).toEqual(expected);
    });

    it("will not templatize keys", () => {
      const obj: any = {
        name: "name",
        test: {
          prop: "name: "
        }
      };
      const fields: any[] = [
        {
          name: "test"
        },
        {
          name: "name"
        }
      ];
      const basePath: string = "0019226378376276.layer0.fields";

      const expected: any = {
        name: "{{0019226378376276.layer0.fields.name.name}}",
        test: {
          prop: "{{0019226378376276.layer0.fields.name.name}}: "
        }
      };

      const actual = templatization.templatizeFieldReferences(
        obj,
        fields,
        basePath
      );
      expect(actual).toEqual(expected);
    });

    it("will templatize keys", () => {
      const obj: any = {
        name: "name",
        test: {
          prop: "name: "
        }
      };
      const fields: any[] = [
        {
          name: "test"
        },
        {
          name: "name"
        }
      ];
      const basePath: string = "0019226378376276.layer0.fields";

      const expected: any = {
        "{{0019226378376276.layer0.fields.name.name}}":
          "{{0019226378376276.layer0.fields.name.name}}",
        "{{0019226378376276.layer0.fields.test.name}}": {
          prop: "{{0019226378376276.layer0.fields.name.name}}: "
        }
      };

      const actual = templatization.templatizeFieldReferences(
        obj,
        fields,
        basePath,
        true
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("createId", () => {
    xit("createId", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_getRandomNumberInRange", () => {
    xit("_getRandomNumberInRange", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });
});

// ------------------------------------------------------------------------------------------------------------------ //

function createItemTemplateList(itemIds: string[]): interfaces.IItemTemplate[] {
  return itemIds.map(itemId => {
    return {
      itemId: itemId,
      type: "",
      key: "",
      item: "",
      data: "",
      resources: [] as any[],
      dependencies: [] as string[],
      circularDependencies: [] as string[],
      properties: "",
      estimatedDeploymentCostFactor: 0
    };
  });
}
