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
import * as templates from "../test/mocks/templates";
import * as templatization from "../src/templatization";
import * as utils from "./mocks/utils";

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `templatization`: common functions involving the adlib library", () => {
  describe("findTemplateIndexInList", () => {
    it("should handle an empty list", () => {
      const solnTemplates: interfaces.IItemTemplate[] = [];
      const id: string = "";
      const expected: number = -1;

      const actual = templatization.findTemplateIndexInList(solnTemplates, id);
      expect(actual).toEqual(expected);
    });

    it("should handle list without the sought item", () => {
      const solnTemplates = createItemTemplateList([
        "abc",
        "def",
        "ghi",
        "jkl"
      ]);
      const id: string = "xyz";
      const expected: number = -1;

      const actual = templatization.findTemplateIndexInList(solnTemplates, id);
      expect(actual).toEqual(expected);
    });

    it("should handle list with the sought item", () => {
      const solnTemplates = createItemTemplateList([
        "abc",
        "def",
        "ghi",
        "jkl"
      ]);
      const id: string = "def";
      const expected: number = 1;

      const actual = templatization.findTemplateIndexInList(solnTemplates, id);
      expect(actual).toEqual(expected);
    });
  });

  describe("findTemplateInList", () => {
    it("should handle an empty list", () => {
      const solnTemplates: interfaces.IItemTemplate[] = [];
      const id: string = "";
      const expected: interfaces.IItemTemplate = null;

      const actual = templatization.findTemplateInList(solnTemplates, id);
      expect(actual).toEqual(expected);
    });

    it("should handle list without the sought item", () => {
      const solnTemplates = createItemTemplateList([
        "abc",
        "def",
        "ghi",
        "jkl"
      ]);
      const id: string = "xyz";
      const expected: interfaces.IItemTemplate = null;

      const actual = templatization.findTemplateInList(solnTemplates, id);
      expect(actual).toEqual(expected);
    });

    it("should handle list with the sought item", () => {
      const solnTemplates = createItemTemplateList([
        "abc",
        "def",
        "ghi",
        "jkl"
      ]);
      const id: string = "def";
      const expected: interfaces.IItemTemplate = createItemTemplateList([
        "def"
      ])[0];

      const actual = templatization.findTemplateInList(solnTemplates, id);
      expect(actual).toEqual(expected);
    });
  });

  describe("getIdsInTemplatesList", () => {
    it("gets the ids out of a list of templates", () => {
      const solnTemplates: interfaces.IItemTemplate[] = [
        templates.getItemTemplate("Web Map"),
        templates.getItemTemplate("Web Mapping Application"),
        templates.getItemTemplate("Workforce Project")
      ];
      const actual = templatization.getIdsInTemplatesList(solnTemplates);
      expect(actual).toEqual([
        "map1234567890",
        "wma1234567890",
        "wrk1234567890"
      ]);
    });
  });

  describe("removeTemplate", () => {
    it("removes the specified id out of a list of templates", () => {
      const solnTemplates: interfaces.IItemTemplate[] = [
        templates.getItemTemplate("Web Map"),
        templates.getItemTemplate("Web Mapping Application"),
        templates.getItemTemplate("Workforce Project")
      ];
      templatization.removeTemplate(solnTemplates, "wma1234567890");
      expect(solnTemplates.length).toEqual(2);
      expect(templatization.getIdsInTemplatesList(solnTemplates)).toEqual([
        "map1234567890",
        "wrk1234567890"
      ]);
    });

    it("doesn't change a list of templates if the specified id is not found", () => {
      const solnTemplates: interfaces.IItemTemplate[] = [
        templates.getItemTemplate("Web Map"),
        templates.getItemTemplate("Web Mapping Application"),
        templates.getItemTemplate("Workforce Project")
      ];
      templatization.removeTemplate(solnTemplates, "frm1234567890");
      expect(solnTemplates.length).toEqual(3);
      expect(templatization.getIdsInTemplatesList(solnTemplates)).toEqual([
        "map1234567890",
        "wma1234567890",
        "wrk1234567890"
      ]);
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
        organization: utils.getPortalsSelfResponse()
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

    it("should retain template variables when they are not in the templateDictionary", () => {
      const template: any = {
        item: {
          printProp: "{{organization.helperServices.printTask.url}}",
          routeProp: "{{organization.helperServices.route.url}}",
          geomProp: "{{organization.helperServices.geometry.url}}",
          geocodeProp:
            "{{organization.helperServices.geocode:getDefaultLocatorURL}}"
        }
      };
      const templateDictionary: any = {};
      const expected: any = {
        item: {
          printProp: "{{organization.helperServices.printTask.url}}",
          routeProp: "{{organization.helperServices.route.url}}",
          geomProp: "{{organization.helperServices.geometry.url}}",
          geocodeProp:
            "{{organization.helperServices.geocode:getDefaultLocatorURL}}"
        }
      };
      const actual: any = templatization.replaceInTemplate(
        template,
        templateDictionary
      );
      expect(actual).toEqual(expected);
    });

    it("should handle missing variables", () => {
      const template = "{{organization.name}}<br />{{organization.nonexistantproperty.sharedTheme.logo.small}}<br />{{organization.name}}";
      const templateDictionary: any = {
        organization: {
          name: "myOrg"
        }
      };
      const expected = "myOrg<br />{{organization.nonexistantproperty.sharedTheme.logo.small}}<br />myOrg";
      const actual: any = templatization.replaceInTemplate(
        template,
        templateDictionary
      );
      expect(actual).toEqual(expected);
    });

    it("should handle missing variables with defaults", () => {
      const template = "{{organization.name||My Community}}<br />{{organization.nonexistantproperty.sharedTheme.logo.small||https://www.arcgis.com/sharing/rest/content/items/28989a5ecc2d4b2fbf62ac0f5075b7ff/data}}<br />{{organization.name||My Community}}";
      const templateDictionary: any = {
        organization: {
          name: "myOrg"
        }
      };
      const expected = "myOrg<br />https://www.arcgis.com/sharing/rest/content/items/28989a5ecc2d4b2fbf62ac0f5075b7ff/data<br />myOrg";
      const actual: any = templatization.replaceInTemplate(
        template,
        templateDictionary
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("replaceTemplate", () => {
    it("returns false when there are no templates", () => {
      const solnTemplates: interfaces.IItemTemplate[] = [];
      const newTemplate: interfaces.IItemTemplate = templates.getItemTemplate(
        "Form"
      );
      const actual: boolean = templatization.replaceTemplate(
        solnTemplates,
        "map1234567890",
        newTemplate
      );
      expect(actual).toBeFalsy();
    });

    it("returns false when no template is found", () => {
      const solnTemplates: interfaces.IItemTemplate[] = [
        templates.getItemTemplate("Web Mapping Application"),
        templates.getItemTemplate("Workforce Project")
      ];
      const newTemplate: interfaces.IItemTemplate = templates.getItemTemplate(
        "Form"
      );
      const actual: boolean = templatization.replaceTemplate(
        solnTemplates,
        "map1234567890",
        newTemplate
      );
      expect(actual).toBeFalsy();
      expect(solnTemplates[0].itemId).toEqual("wma1234567890");
      expect(solnTemplates[1].itemId).toEqual("wrk1234567890");
    });

    it("returns true when a template is replaced", () => {
      const solnTemplates: interfaces.IItemTemplate[] = [
        templates.getItemTemplate("Web Map"),
        templates.getItemTemplate("Web Mapping Application"),
        templates.getItemTemplate("Workforce Project")
      ];
      const newTemplate: interfaces.IItemTemplate = templates.getItemTemplate(
        "Form"
      );
      const actual: boolean = templatization.replaceTemplate(
        solnTemplates,
        "map1234567890",
        newTemplate
      );
      expect(actual).toBeTruthy();
      expect(solnTemplates[0].itemId).toEqual("frm1234567890");
      expect(solnTemplates[1].itemId).toEqual("wma1234567890");
      expect(solnTemplates[2].itemId).toEqual("wrk1234567890");
    });
  });

  describe("getDefaultExtent", () => {
    it("should not templatize null extent", () => {
      const itemInfo: any = {
        extent: null
      };
      const expected: any = null;
      const actual: any = templatization.getDefaultExtent(itemInfo);
      expect(actual).toEqual(expected);
    });

    it("should not templatize empty array extent", () => {
      const itemInfo: any = {
        extent: []
      };
      const expected: any = [];
      const actual: any = templatization.getDefaultExtent(itemInfo);
      expect(actual).toEqual(expected);
    });

    it("should templatize extent with a value", () => {
      const itemInfo: any = {
        extent: {}
      };
      const expected: any = "{{solutionItemExtent}}";
      const actual: any = templatization.getDefaultExtent(itemInfo);
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

  describe("templatizeIds", () => {
    it("handle empty object", () => {
      const obj = {};
      const expectedTemplatizedObj = {};

      const templatizedObj: any = templatization.templatizeIds(obj);

      expect(templatizedObj).toEqual(expectedTemplatizedObj);
    });

    it("handle related items record", () => {
      const obj = [
        {
          relationshipType: "Survey2Service",
          relatedItemIds: ["bef773a670c0419f89194a4012320db3"]
        }
      ];
      const expectedTemplatizedObj = [
        {
          relationshipType: "Survey2Service",
          relatedItemIds: ["{{bef773a670c0419f89194a4012320db3.itemId}}"]
        }
      ];

      const templatizedObj: any = templatization.templatizeIds(obj);

      expect(templatizedObj).toEqual(expectedTemplatizedObj);
    });

    it("gracefully handles multiple occurrences of the same id", () => {
      // i.e. prevents things like: {{{{bef773a670c0419f89194a4012320db3.itemId}}.itemId}}
      const obj = [
        {
          relationshipType: "Survey2Service",
          relatedItemIds: ["bef773a670c0419f89194a4012320db3"],
          properties: {
            anotherReference: "bef773a670c0419f89194a4012320db3"
          }
        }
      ];
      const expectedTemplatizedObj = [
        {
          relationshipType: "Survey2Service",
          relatedItemIds: ["{{bef773a670c0419f89194a4012320db3.itemId}}"],
          properties: {
            anotherReference: "{{bef773a670c0419f89194a4012320db3.itemId}}"
          }
        }
      ];

      const templatizedObj: any = templatization.templatizeIds(obj);

      expect(templatizedObj).toEqual(expectedTemplatizedObj);
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
      item: {
        id: "",
        type: ""
      },
      data: "",
      resources: [] as any[],
      dependencies: [] as string[],
      groups: [] as string[],
      properties: "",
      estimatedDeploymentCostFactor: 0
    };
  });
}
