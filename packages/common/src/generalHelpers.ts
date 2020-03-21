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
 * Provides general helper functions.
 *
 * @module generalHelpers
 */

import * as interfaces from "./interfaces";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Returns a URL with a query parameter appended
 *
 * @param url URL to append to
 * @param parameter Query parameter to append, prefixed with "?" or "&" as appropriate to what url already has
 * @return New URL combining url and parameter
 */
export function appendQueryParam(url: string, parameter: string): string {
  return url + (url.indexOf("?") === -1 ? "?" : "&") + parameter;
}

/**
 * Extracts JSON from a Blob.
 *
 * @param blob Blob to use as source
 * @return A promise that will resolve with JSON or null
 */
export function blobToJson(blob: Blob): Promise<any> {
  return new Promise<any>(resolve => {
    blobToText(blob).then(
      blobContents => {
        try {
          resolve(JSON.parse(blobContents));
        } catch (err) {
          resolve(null);
        }
      },
      () => resolve(null)
    );
  });
}

/**
 * Converts a Blob to a File.
 *
 * @param blob Blob to use as source
 * @param filename Name to use for file
 * @param mimeType MIME type to override blob's MIME type
 * @return File created out of Blob and filename
 */
export function blobToFile(
  blob: Blob,
  filename: string,
  mimeType?: string
): File {
  return new File([blob], filename ? filename : "", {
    type: mimeType || blob.type
  });
}

/**
 * Extracts text from a Blob.
 *
 * @param blob Blob to use as source
 * @return A promise that will resolve with text read from blob
 */
export function blobToText(blob: Blob): Promise<string> {
  return new Promise<string>(resolve => {
    const reader = new FileReader();
    reader.onload = function(evt) {
      // Disable needed because Node requires cast
      // tslint:disable-next-line: no-unnecessary-type-assertion
      const blobContents = (evt.target as FileReader).result;
      resolve(blobContents ? (blobContents as string) : ""); // not handling ArrayContents variant
    };
    reader.readAsText(blob);
  });
}

/**
 * Converts JSON to a Blob.
 *
 * @param json JSON to use as source
 * @return A blob from the source JSON
 */
export function jsonToBlob(json: any): Blob {
  const _json = JSON.stringify(json);

  const charArray = [];
  for (let i = 0; i < _json.length; i++) {
    charArray[i] = _json.charCodeAt(i);
  }

  return new Blob([new Uint8Array(charArray)], {
    type: "application/octet-stream"
  });
}

/**
 * Makes a deep clone, including arrays but not functions.
 *
 * @param obj Object to be cloned
 * @return Clone of obj
 * @example
 * ```js
 * import { cloneObject } from "utils/object-helpers";
 * const original = { foo: "bar" }
 * const copy = cloneObject(original)
 * copy.foo // "bar"
 * copy === original // false
 * ```
 */
export function cloneObject(obj: { [index: string]: any }): any {
  let clone: { [index: string]: any } = {};
  // first check array
  if (Array.isArray(obj)) {
    clone = obj.map(cloneObject);
  } else if (typeof obj === "object") {
    for (const i in obj) {
      if (obj[i] != null && typeof obj[i] === "object") {
        clone[i] = cloneObject(obj[i]);
      } else {
        clone[i] = obj[i];
      }
    }
  } else {
    clone = obj;
  }
  return clone;
}

/**
 * Compares two JSON objects using JSON.stringify.
 *
 * @param json1 First object
 * @param json2 Second object
 * @return True if objects are the same
 */
export function compareJSON(json1: any, json2: any): boolean {
  return JSON.stringify(json1) === JSON.stringify(json2);
}

/**
 * Compares two JSON objects using JSON.stringify, converting empty strings to nulls.
 *
 * @param json1 First object
 * @param json2 Second object
 * @return True if objects are the same
 */
export function compareJSONNoEmptyStrings(json1: any, json2: any): boolean {
  const jsonStr1 = JSON.stringify(json1).replace(/\"\:\"\"/g, '":null');
  const jsonStr2 = JSON.stringify(json2).replace(/\"\:\"\"/g, '":null');
  return jsonStr1 === jsonStr2;
}

export function deleteItemProps(itemTemplate: any): any {
  const propsToRetain: string[] = [
    "accessInformation",
    "appCategories",
    "banner",
    "categories",
    "culture",
    "description",
    "documentation",
    "extent",
    "groupDesignations",
    "industries",
    "languages",
    "licenseInfo",
    "listed",
    "name",
    "properties",
    "proxyFilter",
    "screenshots",
    "size",
    "snippet",
    "spatialReference",
    "tags",
    "title",
    "type",
    "typeKeywords",
    "url"
  ];
  const propsToDelete: string[] = Object.keys(itemTemplate).filter(
    k => propsToRetain.indexOf(k) < 0
  );
  deleteProps(itemTemplate, propsToDelete);
  return itemTemplate;
}

/**
 * Deletes a property from an object.
 *
 * @param obj Object with property to delete
 * @param path Path into an object to property, e.g., "data.values.webmap", where "data" is a top-level property
 *             in obj
 */
export function deleteProp(obj: any, path: string): void {
  const pathParts: string[] = path.split(".");

  if (Array.isArray(obj)) {
    obj.forEach((child: any) => deleteProp(child, path));
  } else {
    const subpath = pathParts.slice(1).join(".");
    if (typeof obj[pathParts[0]] !== "undefined") {
      if (pathParts.length === 1) {
        delete obj[path];
      } else {
        deleteProp(obj[pathParts[0]], subpath);
      }
    }
  }
}

/**
 * Deletes properties from an object.
 *
 * @param obj Object with properties to delete
 * @param props Array of properties on object that should be deleted
 */
export function deleteProps(obj: any, props: string[]): void {
  props.forEach(prop => {
    deleteProp(obj, prop);
  });
}

/**
 * Creates an AGO-style JSON failure response with success property.
 *
 * @param e Optional error information
 * @return JSON structure with property success set to false and optionally including `e`
 */
export function fail(e?: any): any {
  if (e) {
    return { success: false, error: e.error || e };
  } else {
    return { success: false };
  }
}

/**
 * Creates an AGO-style JSON failure response with success property and extended with ids list.
 *
 * @param ids List of ids
 * @param e Optional error information
 * @return JSON structure with property success set to false and optionally including `e`
 */
export function failWithIds(itemIds: string[], e?: any): any {
  if (e) {
    return { success: false, itemIds, error: e.error || e };
  } else {
    return { success: false, itemIds };
  }
}

/**
 * Gets a property out of a deeply nested object.
 * Does not handle anything but nested object graph
 *
 * @param obj Object to retrieve value from
 * @param path Path into an object, e.g., "data.values.webmap", where "data" is a top-level property
 *             in obj
 * @return Value at end of path
 */
export function getProp(obj: { [index: string]: any }, path: string): any {
  return path.split(".").reduce(function(prev, curr) {
    /* istanbul ignore next no need to test undefined scenario */
    return prev ? prev[curr] : undefined;
  }, obj);
}

/**
 * Returns an array of values from an object based on an array of property paths.
 *
 * @param obj Object to retrieve values from
 * @param props Array of paths into the object e.g., "data.values.webmap", where "data" is a top-level property
 * @return Array of the values plucked from the object; only defined values are returned
 */
export function getProps(obj: any, props: string[]): any {
  return props.reduce((a, p) => {
    const v = getProp(obj, p);
    if (v) {
      a.push(v);
    }
    return a;
  }, [] as any[]);
}

/**
 * Sets a deeply nested property of an object.
 * Creates the full path if it does not exist.
 *
 * @param obj Object to set value of
 * @param path Path into an object, e.g., "data.values.webmap", where "data" is a top-level property in obj
 * @param value The value to set at the end of the path
 */
export function setCreateProp(obj: any, path: string, value: any) {
  const pathParts: string[] = path.split(".");
  pathParts.reduce((a: any, b: any, c: any) => {
    if (c === pathParts.length - 1) {
      a[b] = value;
      return value;
    } else {
      if (!a[b]) {
        a[b] = {};
      }
      return a[b];
    }
  }, obj);
}

/**
 * Sets a deeply nested property of an object.
 * Does nothing if the full path does not exist.
 *
 * @param obj Object to set value of
 * @param path Path into an object, e.g., "data.values.webmap", where "data" is a top-level property in obj
 * @param value The value to set at the end of the path
 */
export function setProp(obj: any, path: string, value: any) {
  if (getProp(obj, path)) {
    const pathParts: string[] = path.split(".");
    pathParts.reduce((a: any, b: any, c: any) => {
      if (c === pathParts.length - 1) {
        a[b] = value;
        return value;
      } else {
        return a[b];
      }
    }, obj);
  }
}

/**
 * Creates a timestamp string using the current UTC date and time.
 *
 * @return Timestamp formatted as YYYYMMDD_hhmm_ssmmm, with month one-based and all values padded with zeroes on the
 * left as needed (`ssmmm` stands for seconds from 0..59 and milliseconds from 0..999)
 * @protected
 */
export function getUTCTimestamp(): string {
  const now = new Date();
  return (
    _padPositiveNum(now.getUTCFullYear(), 4) +
    _padPositiveNum(now.getUTCMonth() + 1, 2) +
    _padPositiveNum(now.getUTCDate(), 2) +
    "_" +
    _padPositiveNum(now.getUTCHours(), 2) +
    _padPositiveNum(now.getUTCMinutes(), 2) +
    "_" +
    _padPositiveNum(now.getUTCSeconds(), 2) +
    _padPositiveNum(now.getUTCMilliseconds(), 3)
  );
}

/**
 * Tests if an object's `item.typeKeywords` or `typeKeywords` properties has any of a set of keywords.
 *
 * @param jsonObj Object to test
 * @param keywords List of keywords to look for in jsonObj
 * @return Boolean indicating result
 */
export function hasAnyKeyword(jsonObj: any, keywords: string[]): boolean {
  const typeKeywords =
    getProp(jsonObj, "item.typeKeywords") || jsonObj.typeKeywords || [];
  return keywords.reduce((a, kw) => {
    if (!a) {
      a = typeKeywords.includes(kw);
    }
    return a;
  }, false);
}

/**
 * Tests if an object's `item.typeKeywords` or `typeKeywords` properties has a specific keyword.
 *
 * @param jsonObj Object to test
 * @param keyword Keyword to look for in jsonObj
 * @return Boolean indicating result
 */
export function hasTypeKeyword(jsonObj: any, keyword: string): boolean {
  const typeKeywords =
    getProp(jsonObj, "item.typeKeywords") || jsonObj.typeKeywords || [];
  return typeKeywords.includes(keyword);
}

/**
 * Will return the provided title if it does not exist as a property
 * in one of the objects at the defined path. Otherwise the title will
 * have a numerical value attached.
 *
 * @param title The root title to test
 * @param templateDictionary Hash of the facts
 * @param path to the objects to evaluate for potantial name clashes
 * @return string The unique title to use
 */
export function getUniqueTitle(
  title: string,
  templateDictionary: any,
  path: string
): string {
  const objs: any[] = getProp(templateDictionary, path) || [];
  const titles: string[] = objs.map(obj => {
    return obj.title;
  });
  let newTitle: string = title;
  let i: number = 0;
  while (titles.indexOf(newTitle) > -1) {
    i++;
    newTitle = title + " " + i;
  }
  return newTitle;
}

/**
 * Tests if an array of DatasourceInfos has a given item and layer id already.
 *
 * @param datasourceInfos Array of DatasourceInfos to evaluate
 * @param itemId The items id to check for
 * @param layerId The layers id to check for
 * @return Boolean indicating result
 */
export function hasDatasource(
  datasourceInfos: interfaces.IDatasourceInfo[],
  itemId: string,
  layerId: number
): boolean {
  return datasourceInfos.some(
    ds => ds.itemId === itemId && ds.layerId === layerId
  );
}

/**
 * remove templatization from item id to compare
 *
 * eg {{934a9ef8efa7448fa8ddf7b13cef0240.itemId}}
 * returns 934a9ef8efa7448fa8ddf7b13cef0240
 */
export function cleanItemId(id: any): any {
  return id ? id.replace("{{", "").replace(".itemId}}", "") : id;
}

/**
 * remove templatization from layer based item id to compare
 * eg {{934a9ef8efa7448fa8ddf7b13cef0240.layer0.itemId}}
 * returns 934a9ef8efa7448fa8ddf7b13cef0240
 */
export function cleanLayerBasedItemId(id: any): any {
  return id
    ? id
        .replace("{{", "")
        .replace(/([.]layer([0-9]|[1-9][0-9])[.](item|layer)Id)[}]{2}/, "")
    : id;
}

/**
 * remove templatization from layer id to compare
 * eg {{934a9ef8efa7448fa8ddf7b13cef0240.layer0.layerId}}
 * returns 0
 */
export function cleanLayerId(id: any) {
  return id?.toString()
    ? parseInt(
        id
          .toString()
          .replace(/[{]{2}.{32}[.]layer/, "")
          .replace(/[.]layerId[}]{2}/, ""),
        10
      )
    : id;
}

/**
 * Get template from list of templates by ID
 *
 * @param templates Array of item templates to search
 * @param id of template we are searching for
 *
 * @return Template associated with the user provided id argument
 */
export function getTemplateById(
  templates: interfaces.IItemTemplate[],
  id: string
): any {
  let template;
  (templates || []).some(_template => {
    if (_template.itemId === id) {
      template = _template;
      return true;
    }
    return false;
  });
  return template;
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Pads the string representation of a number to a minimum width. Requires modern browser.
 *
 * @param n Number to pad
 * @param totalSize Desired *minimum* width of number after padding with zeroes
 * @return Number converted to string and padded on the left as needed
 * @protected
 */
export function _padPositiveNum(n: number, totalSize: number): string {
  let numStr = n.toString();
  const numPads = totalSize - numStr.length;
  if (numPads > 0) {
    numStr = "0".repeat(numPads) + numStr; // TODO IE11 does not support repeat()
  }
  return numStr;
}
