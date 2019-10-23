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
 * @return File created out of Blob and filename
 */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename ? filename : "", { type: blob.type });
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
 * Deletes a property from an object.
 *
 * @param obj Object with property to delete
 * @param prop Property on object that should be deleted
 */
export function deleteProp(obj: any, prop: string): void {
  if (obj && obj.hasOwnProperty(prop)) {
    delete obj[prop];
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
  return props.reduce(
    (a, p) => {
      const v = getProp(obj, p);
      if (v) {
        a.push(v);
      }
      return a;
    },
    [] as any[]
  );
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
  return id.toString
    ? parseInt(
        id
          .toString()
          .replace(/[{]{2}.{32}[.]layer/, "")
          .replace(/[.]layerId[}]{2}/, ""),
        10
      )
    : id;
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
