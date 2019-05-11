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
 * Provides common functions.
 */

// ------------------------------------------------------------------------------------------------------------------ //

export function fail(
  e?: any
): any {
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
export function getProp(
  obj: { [index: string]: any }, 
  path: string
): any {
  return path.split(".").reduce(function(prev, curr) {
    /* istanbul ignore next no need to test undefined scenario */
    return prev ? prev[curr] : undefined;
  }, obj);
}

/**
 * Creates a timestamp string using the current date and time.
 *
 * @return Timestamp
 * @protected
 */
export function getUTCTimestamp(
): string {
  const now = new Date();
  return (
    padPositiveNum(now.getUTCFullYear(), 4) +
    padPositiveNum(now.getUTCMonth() + 1, 2) +
    padPositiveNum(now.getUTCDate(), 2) +
    "_" +
    padPositiveNum(now.getUTCHours(), 2) +
    padPositiveNum(now.getUTCMinutes(), 2) +
    "_" +
    padPositiveNum(now.getUTCSeconds(), 2) +
    padPositiveNum(now.getUTCMilliseconds(), 3)
  );
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Pads the string representation of a number to a minimum width.
 * 
 * @param n Number to pad
 * @param totalSize Desired *minimum* width of number after padding with zeroes
 * @return Number converted to string and padded as needed
 * @protected
 */
function padPositiveNum(
  n: number, 
  totalSize: number
): string {
  let numStr = n.toString();
  const numPads = totalSize - numStr.length;
  if (numPads > 0) {
    numStr = "0".repeat(numPads) + numStr; // TODO IE11 does not support repeat()
  }
  return numStr;
}

