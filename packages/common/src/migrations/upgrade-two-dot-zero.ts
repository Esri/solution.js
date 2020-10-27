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
import { UserSession } from "../interfaces";
import { getProp, cloneObject } from "@esri/hub-common";

/**
 * Convert indicator "definitions" from the CAS style to the Indicator schema
 * see https://github.com/ArcGIS/Hub/blob/master/indicators.md
 *
 * @param model
 * @param authentication
 * @private
 */
export function _upgradeTwoDotZero(
  model: any,
  authentication: UserSession
): any {
  if (getProp(model, "item.properties.schemaVersion") >= 2) {
    return model;
  }
  // get the indicators from the .configurationSettings...
  const clone = cloneObject(model);
  const configSettings = getProp(clone, "data.configurationSettings") || [];

  const indicatorsHash = configSettings.find(
    (e: any) => e.category === "Indicators"
  );
  clone.data.indicators = _convertIndicatorsToDefinitions(indicatorsHash);
  // remove CAS structure
  delete clone.data.configurationSettings;

  // set the schemaVersion...
  clone.item.properties.schemaVersion = 2;
  return clone;
}

/**
 * Given the Indicators entry from a CAS configurationSettings array,
 * convert to an indicators object in the new schema
 *
 * @private
 */
export function _convertIndicatorsToDefinitions(indicatorsHash: any = {}) {
  // the incoming structure should have a .fields property, and what we want will be in there...
  if (!indicatorsHash.fields || !Array.isArray(indicatorsHash.fields)) {
    indicatorsHash.fields = [];
  }
  const defs = indicatorsHash.fields.map(_convertIndicatorToDefinition);
  // now we need to create an object which has props for each def
  return defs;
}

/**
 * Convert a CAS formatted indicator to the .definition in the new schama
 *
 * @private
 */
export const _convertIndicatorToDefinition = function(ind: any) {
  const def = {
    id: ind.fieldName,
    type: "Data",
    name: ind.label || ind.fieldName,
    optional: ind.optional || false,
    definition: {
      description: ind.label || ind.fieldName,
      supportedTypes: [...ind.layerOptions.supportedTypes],
      geometryTypes: [...ind.layerOptions.geometryTypes],
      fields: ind.fields.map(_convertIndicatorField)
    }
  };
  return def;
};

/**
 * Convert the CAS formatted "field" into the new schema
 *
 * @private
 */
export const _convertIndicatorField = function(field: any) {
  return {
    id: field.fieldName,
    name: field.label,
    optional: field.optional || false,
    description: field.tooltip,
    supportedTypes: [...field.supportedTypes]
  };
};
