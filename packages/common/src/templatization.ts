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
 * Provides common functions involving the adlib library.
 *
 * @module templatization
 */

import * as adlib from "adlib";
import * as interfaces from "./interfaces";
import * as generalHelpers from "./generalHelpers";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * A parameterized server name to replace the organization URL in a Web Mapping Application's URL to
 * itself; name has to be acceptable to AGOL, otherwise it discards the URL, so substitution must be
 * made before attempting to create the item.
 * @protected
 */
export const PLACEHOLDER_SERVER_NAME: string = "{{portalBaseUrl}}";

/**
 * A parameterized geometry server name
 * @protected
 */
export const PLACEHOLDER_GEOMETRY_SERVER_NAME: string =
  "{{organization.helperServices.geometry.url}}";

/**
 * A parameterized geocode server name
 * @protected
 */
export const PLACEHOLDER_GEOCODE_SERVER_NAME: string =
  "{{organization.helperServices.geocode:getDefaultLocatorURL}}";

/**
 * A parameterized network analyst server name
 * @protected
 */
export const PLACEHOLDER_NA_SERVER_NAME: string =
  "{{organization.helperServices.route.url}}";

/**
 * A parameterized network analyst server name
 * @protected
 */
export const PLACEHOLDER_PRINT_SERVER_NAME: string =
  "{{organization.helperServices.printTask.url}}";

export const TRANSFORMS: any = {
  getDefaultLocatorURL(key: string, val: any, settings: any) {
    return val[0].url;
  }
};

/**
 * Creates a random 8-character alphanumeric string that begins with an alphabetic character.
 *
 * @return An alphanumeric string in the range [a0000000..zzzzzzzz]
 */
export function createId(): string {
  // Return a random number, but beginning with an alphabetic character so that it can be used as a valid
  // dotable property name. Used for unique identifiers that do not require the rigor of a full UUID -
  // i.e. node ids, process ids, etc.
  const min = 0.2777777777777778; // 0.a in base 36
  const max = 0.9999999999996456; // 0.zzzzzzzz in base 36
  return (_getRandomNumberInRange(min, max).toString(36) + "0000000").substr(
    2,
    8
  );
}

export function createInitializedGroupTemplate(
  itemInfo: any
): interfaces.IItemTemplate {
  const itemTemplate = createPlaceholderTemplate(itemInfo.id, itemInfo.type);
  itemTemplate.item = {
    ...itemTemplate.item,
    description: itemInfo.description,
    snippet: itemInfo.snippet,
    tags: itemInfo.tags,
    title: itemInfo.title,
    thumbnail: itemInfo.thumbnail
  };
  return itemTemplate;
}

export function createInitializedItemTemplate(
  itemInfo: any
): interfaces.IItemTemplate {
  const itemTemplate = createPlaceholderTemplate(itemInfo.id, itemInfo.type);
  itemTemplate.item = {
    ...itemTemplate.item,
    accessInformation: itemInfo.accessInformation,
    categories: itemInfo.categories,
    contentStatus: itemInfo.contentStatus,
    culture: itemInfo.culture,
    description: itemInfo.description,
    extent: "{{solutionItemExtent}}",
    licenseInfo: itemInfo.licenseInfo,
    name: itemInfo.name,
    properties: itemInfo.properties,
    snippet: itemInfo.snippet,
    spatialReference: undefined,
    tags: itemInfo.tags,
    thumbnail: itemInfo.thumbnail,
    title: itemInfo.title,
    typeKeywords: itemInfo.typeKeywords,
    url: itemInfo.url
  };
  return itemTemplate;
}

/**
 * Creates an empty template.
 *
 * @param id AGO id of item
 * @param type AGO item type; defaults to ""
 * @return Empty template containing supplied id, optional type, and a key created using the function createId()
 */
export function createPlaceholderTemplate(
  id: string,
  type = ""
): interfaces.IItemTemplate {
  return {
    itemId: id,
    type,
    key: createId(),
    item: {
      id,
      type
    },
    data: {},
    resources: [],
    dependencies: [],
    groups: [],
    properties: {},
    estimatedDeploymentCostFactor: 0
  };
}

/**
 * Finds index of template by id in a list of templates.
 *
 * @param templates A collection of AGO item templates to search
 * @param id AGO id of template to find
 * @return Offset of of matching template or -1 if not found
 * @protected
 */
export function findTemplateIndexInList(
  templates: interfaces.IItemTemplate[],
  id: string
): number {
  const baseId = id;
  return templates.findIndex(template => {
    return baseId === template.itemId;
  });
}

/**
 * Finds template by id in a list of templates.
 *
 * @param templates A collection of AGO item templates to search
 * @param id AGO id of template to find
 * @return Matching template or null
 */
export function findTemplateInList(
  templates: interfaces.IItemTemplate[],
  id: string
): interfaces.IItemTemplate | null {
  const iTemplate = findTemplateIndexInList(templates, id);
  return iTemplate >= 0 ? templates[iTemplate] : null;
}

export function hasUnresolvedVariables(
  data: any,
  templateDictionary: any
): boolean {
  const getUnresolved = (v: any) => {
    return v ? JSON.stringify(v).match(/{{.+?}}/gim) || [] : [];
  };
  if (data) {
    let _data: any = generalHelpers.cloneObject(data);
    const unresolved: any = getUnresolved(_data);
    if (unresolved.length > 0) {
      _data = replaceInTemplate(_data, templateDictionary);
      return unresolved.length > getUnresolved(_data).length;
    }
  }
  return false;
}

export function replaceInTemplate(template: any, replacements: any): any {
  return adlib.adlib(template, replacements, TRANSFORMS);
}

export function templatizeTerm(
  context: string,
  term: string,
  suffix = ""
): string {
  if (!context) {
    return context;
  }
  const pattern = new RegExp(term, "g");
  return context.replace(pattern, "{{" + term + suffix + "}}");
}

/**
 * Helper function to templatize value and make sure its converted to lowercase
 *
 * @param basePath path used to de-templatize while deploying
 * @param value to be converted to lower case for lookup while deploying
 */
export function templatizeToLowerCase(basePath: string, value: string): string {
  if (value.startsWith("{{")) {
    return value;
  } else {
    return String(
      templatizeTerm(basePath, basePath, "." + String(value).toLowerCase())
    );
  }
}

/**
 * using each field from the datasource replace any occurances
 * of the field name with the templatized value
 * Needs to account for:
 * "NAME"
 * "NAME NAME2"
 * "NAME ASC"
 * "{NAME}"
 * "(NAME = value AND NAME2 = someOtherValue)"
 */
export function templatizeFieldReferences(
  obj: any,
  fields: any[],
  basePath: string,
  templatizeKeys: boolean = false
): any {
  let objString: string = JSON.stringify(obj);
  fields.forEach(field => {
    let expression: string =
      "(?<![{]{2})(?<!" +
      field.name +
      "[.])\\b" +
      field.name +
      "\\b(?![.])(?![}]{2})";
    if (!templatizeKeys) {
      expression += '(?!":)';
    }
    objString = objString.replace(
      // needs to ensure that its not already been templatized
      // cannot be followed by .name and cannot be proceeded by fieldName. in case of {{01922837.name.name}} and cannot be followed by }}
      new RegExp(expression, "g"),
      templatizeToLowerCase(basePath, field.name + ".name")
    );
  });
  return JSON.parse(objString);
}

export function templatizeIds(obj: any): any {
  // Convert object to string
  let objString = JSON.stringify(obj);

  // Find ids
  const idTest: RegExp = /[0-9A-F]{32}/gim;
  if (obj && idTest.test(objString)) {
    // Templatize ids
    const ids: string[] = objString.match(idTest) as string[];
    ids.forEach(id => {
      const regEx = new RegExp(id, "gm");
      objString = objString.replace(regEx, "{{" + id + ".itemId}}");
    });
    obj = JSON.parse(objString);
  }
  return obj;
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Creates a random number between two values.
 *
 * @param min Inclusive minimum desired value
 * @param max Non-inclusive maximum desired value
 * @return Random number in the range [min, max)
 */
export function _getRandomNumberInRange(min: number, max: number): number {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Getting_a_random_number_between_two_values
  // © 2006 IvanWills
  // MIT license https://opensource.org/licenses/mit-license.php
  return Math.random() * (max - min) + min;
}
