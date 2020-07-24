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

import {
  _upgradeTwoDotZero,
  _convertIndicatorField,
  _convertIndicatorToDefinition,
  _convertIndicatorsToDefinitions
} from "../../src/migrations/upgrade-two-dot-zero";
import * as utils from "../mocks/utils";
import {
  ISolutionItem,
  IItemGeneralized,
  IItemTemplate
} from "../../src/interfaces";
const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

describe("_upgradeTwoDotZero :: ", () => {
  describe("upgrade :: ", () => {
    it("passes same object through if schema >= 1", () => {
      const m = {
        item: {
          properties: {
            schemaVersion: 2
          }
        }
      } as ISolutionItem;
      const chk = _upgradeTwoDotZero(m, MOCK_USER_SESSION);
      expect(chk).toBe(m, "should pass model through without cloning");
    });

    it("removes configurationSettings", () => {
      const m = ({
        item: {
          properties: {
            schemaVersion: 1
          }
        },
        data: {
          configurationSettings: []
        }
      } as unknown) as ISolutionItem;
      const chk = _upgradeTwoDotZero(m, MOCK_USER_SESSION);
      expect(chk).not.toBe(m, "should clone model");
      expect(chk.item.properties.schemaVersion).toBe(
        2,
        "should set schemaVersion to 2"
      );
      expect(chk.data.configurationSettings).not.toBeDefined(
        "should remove config settings"
      );
    });

    it("handles missing configurationSettings", () => {
      const m = ({
        item: {
          properties: {
            schemaVersion: 1
          }
        },
        data: {}
      } as unknown) as ISolutionItem;
      const chk = _upgradeTwoDotZero(m, MOCK_USER_SESSION);
      expect(chk).not.toBe(m, "should clone model");
      expect(chk.item.properties.schemaVersion).toBe(
        2,
        "should set schemaVersion to 2"
      );
      expect(chk.data.configurationSettings).not.toBeDefined(
        "should remove config settings"
      );
    });

    it("converts indicators", () => {
      const m = ({
        item: {
          properties: {
            schemaVersion: 1
          }
        },
        data: {
          configurationSettings: [
            {
              category: "Indicators"
            }
          ]
        }
      } as unknown) as ISolutionItem;
      const chk = _upgradeTwoDotZero(m, MOCK_USER_SESSION);
      expect(chk).not.toBe(m, "should clone model");
      expect(chk.item.properties.schemaVersion).toBe(
        2,
        "should set schemaVersion to 2"
      );
      expect(chk.data.configurationSettings).not.toBeDefined(
        "should remove config settings"
      );
    });
  });

  describe("helper functions", () => {
    it("can convert cas indicator to definition", done => {
      const ind = {
        label: "Collision Data",
        type: "layerAndFieldSelector",
        fieldName: "collisionLayer",
        layerOptions: {
          geometryTypes: [
            "esriGeometryPoint",
            "esriGeometryLine",
            "esriGeometryPolygon"
          ],
          supportedTypes: ["FeatureLayer", "FeatureCollection"]
        },
        fields: [
          {
            tooltip: "Count of people…",
            label: "Number of Injuries",
            fieldName: "numInjuries",
            supportedTypes: ["esriFieldTypeInteger"]
          },
          {
            tooltip: "Count of deaths…",
            label: "Number of Fatalities",
            fieldName: "numFatalities",
            supportedTypes: ["esriFieldTypeInteger"]
          }
        ]
      } as any;
      const c = _convertIndicatorToDefinition(ind);
      expect(c).not.toBe(ind, "returned field should not be the same object");
      expect(c.id).toEqual(ind.fieldName, "fieldName becomes id");
      expect(c.name).toEqual(ind.label, "label becomes name");
      expect(c.definition.description).toEqual(
        ind.label,
        "label becomes description"
      );
      expect(c.definition.supportedTypes.length).toEqual(
        ind.layerOptions.supportedTypes.length,
        "supported types have same contents"
      );
      expect(c.definition.geometryTypes).not.toBe(
        ind.layerOptions.geometryTypes,
        "geometryTypes should not be same instance"
      );
      expect(c.definition.geometryTypes.length).toEqual(
        ind.layerOptions.geometryTypes.length,
        "geometryTypes have same contents"
      );
      expect(c.definition.fields.length).toEqual(
        ind.fields.length,
        "fields have same contents"
      );
      done();
    });
    it("can convert cas indicator without label to definition", done => {
      const ind = {
        // label: "Collision Data",
        type: "layerAndFieldSelector",
        fieldName: "collisionLayer",
        layerOptions: {
          geometryTypes: [
            "esriGeometryPoint",
            "esriGeometryLine",
            "esriGeometryPolygon"
          ],
          supportedTypes: ["FeatureLayer", "FeatureCollection"]
        },
        fields: [
          {
            tooltip: "Count of people…",
            label: "Number of Injuries",
            fieldName: "numInjuries",
            supportedTypes: ["esriFieldTypeInteger"]
          },
          {
            tooltip: "Count of deaths…",
            label: "Number of Fatalities",
            fieldName: "numFatalities",
            supportedTypes: ["esriFieldTypeInteger"]
          }
        ]
      } as any;
      const c = _convertIndicatorToDefinition(ind);
      expect(c).not.toBe(ind, "returned field should not be the same object");
      expect(c.id).toEqual(ind.fieldName, "fieldName becomes id");
      expect(c.name).toEqual(
        ind.fieldName,
        "fieldName becomes name if not label"
      );
      expect(c.definition.description).toEqual(
        ind.fieldName,
        "field becomes description if no label"
      );
      expect(c.definition.supportedTypes.length).toEqual(
        ind.layerOptions.supportedTypes.length,
        "supported types have same contents"
      );
      expect(c.definition.geometryTypes).not.toBe(
        ind.layerOptions.geometryTypes,
        "geometryTypes should not be same instance"
      );
      expect(c.definition.geometryTypes.length).toEqual(
        ind.layerOptions.geometryTypes.length,
        "geometryTypes have same contents"
      );
      expect(c.definition.fields.length).toEqual(
        ind.fields.length,
        "fields have same contents"
      );
      done();
    });
    it("can convert cas field to definition field", done => {
      const fld = {
        tooltip: "Count of people…",
        label: "Number of Injuries",
        fieldName: "numInjuries",
        supportedTypes: ["esriFieldTypeInteger"]
      } as any;
      const c = _convertIndicatorField(fld);
      expect(c).not.toEqual(
        fld,
        "returned field should not be the same object"
      );
      expect(c.id).toEqual(fld.fieldName, "fieldName becomes id");
      expect(c.name).toEqual(fld.label, "label becomes name");
      expect(c.supportedTypes).not.toBe(
        fld.supportedTypes,
        "supported types should not be same instance"
      );
      expect(c.supportedTypes.length).toEqual(
        fld.supportedTypes.length,
        "supported types have same contents"
      );
      done();
    });
    it("can convert configSettings indicator structure to indicators hash", done => {
      const cs = {
        category: "Indicators",
        fields: [
          {
            fieldName: "collisionLayer",
            label: "Collision Data",
            type: "layerAndFieldSelector",
            layerOptions: {
              geometryTypes: [
                "esriGeometryPoint",
                "esriGeometryLine",
                "esriGeometryPolygon"
              ],
              supportedTypes: ["FeatureLayer", "FeatureCollection"]
            },
            fields: [
              {
                tooltip: "Count of people…",
                label: "Number of Injuries",
                fieldName: "numInjuries",
                supportedTypes: ["esriFieldTypeInteger"]
              },
              {
                tooltip: "Count of deaths…",
                label: "Number of Fatalities",
                fieldName: "numFatalities",
                supportedTypes: ["esriFieldTypeInteger"]
              }
            ]
          }
        ]
      } as any;

      // now pass this into the converter...
      const c = _convertIndicatorsToDefinitions(cs);
      expect(Array.isArray(c)).toBeTruthy("should return an array");
      expect(c[0].id).toEqual(
        "collisionLayer",
        "collisionLayer should be the id of the first entry"
      );
      done();
    });
    it("handles configSettings with no fields", done => {
      const cs = {
        category: "Indicators"
      } as any;

      // now pass this into the converter...
      const c = _convertIndicatorsToDefinitions(cs);
      expect(Array.isArray(c)).toBeTruthy("should return an array");
      expect(c.length).toEqual(0, "should have no entries");
      done();
    });
  });
});
