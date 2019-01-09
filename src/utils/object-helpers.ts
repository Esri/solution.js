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
/**
 * Get a property out of a deeply nested object
 * Does not handle anything but nested object graph
 *
 * @param obj Object to retrieve value from
 * @param path Path into an object, e.g., "data.values.webmap", where "data" is a top-level property
 *             in obj
 * @return Value at end of path
 */
export function getProp (
  obj: { [index: string]: any },
  path: string
): any {
  return path.split(".").reduce(function(prev, curr) {
    /* istanbul ignore next no need to test undefined scenario */
    return prev ? prev[curr] : undefined;
  }, obj);
}


/**
 * Return an array of values from an object, based on an array of property paths
 * 
 * @param obj object to retrive values from
 * @param props Array of paths into the object e.g., "data.values.webmap", where "data" is a top-level property
 * 
 * @return Array of the values plucked from the object
 */
export function getProps (
  obj: any,
  props:string[]
): any {
  return props.reduce((a, p) => {
    const v = getProp(obj, p);
    if (v) {
      a.push(v);
    }
    return a;
  }, []);
}

/**
 * ```js
 * import { cloneObject } from "utils/object-helpers";
 * const original = { foo: "bar" }
 * const copy = cloneObject(original)
 * copy.foo // "bar"
 * copy === original // false
 * ```
 * Make a deep clone, including arrays. Does not handle functions!
 */
export function cloneObject(obj: { [index: string]: any }) {
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
 * Look for a specific property name anywhere inside an object graph
 * and return the value
 */
export function getDeepValues (obj:any, prop:string): string[] {
  let result = [] as string[];
  if (!obj) return result;
  let p;
  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      if (p === prop) {
        result.push(obj[p]);
      } else {
        if (Array.isArray(obj[p])) {
          obj[p].forEach((e:any) => {
            result = result.concat(getDeepValues(e, prop));
          });
        } else if (typeof obj[p] === 'object') {
          result = result.concat(getDeepValues(obj[p], prop));
        }
      }
    }
  }
  return result;
}
