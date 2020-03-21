/**
 * Provides miscelleous external functions.
 *
 * @module libs
 */

//#region arcgis-html-sanitizer.min ----------------------------------------------------------------------------------//

/** @license
 * @esri/arcgis-html-sanitizer - v2.2.0 - Tue Feb 04 2020 08:00:46 GMT-0500 (Eastern Standard Time)
 * Copyright (c) 2020 - Environmental Systems Research Institute, Inc.
 * Apache-2.0
 *
 * js-xss
 * Copyright (c) 2012-2017 Zongmin Lei(雷宗民) <leizongmin@gmail.com>
 * http://ucdok.com
 * MIT License, see https://github.com/leizongmin/js-xss/blob/master/LICENSE for details
 *
 * Lodash/isPlainObject
 * Copyright (c) JS Foundation and other contributors <https://js.foundation/>
 * MIT License, see https://raw.githubusercontent.com/lodash/lodash/4.17.10-npm/LICENSE for details
 */

/**
 * @esri/arcgis-html-sanitizer
 * @see https://www.npmjs.com/package/@esri/arcgis-html-sanitizer
 *
 * ```ts
 * // Instantiate a new Sanitizer object
 * const sanitizer = new Sanitizer();
 *
 * // Sanitize a string
 * const sanitizedHtml = sanitizer.sanitize(
 *   '<img src="https://example.com/fake-image.jpg" onerror="alert(1);" />'
 * );
 * // sanitizedHtml => <img src="https://example.com/fake-image.jpg" />
 *
 * // Check if a string contains invalid HTML
 * const validation = sanitizer.validate(
 *   '<img src="https://example.com/fake-image.jpg" onerror="alert(1);" />'
 * );
 * // validation => {
 * //  isValid: false
 * //  sanitized: '<img src="https://example.com/fake-image.jpg" />'
 * // }
 * ```
 */
// export * from "./arcgis-html-sanitizer";

//#endregion ---------------------------------------------------------------------------------------------------------//

//#region uuidv4 -----------------------------------------------------------------------------------------------------//

/** @license
 * Harps (https://stackoverflow.com/users/1073588/harps) TypeScript adaptation of work by
 * broofa (https://stackoverflow.com/users/109538)
 * https://stackoverflow.com/a/2117523
 * cc by-sa 4.0 with attribution required
 * Modified to create string without dashes
 */

/**
 * Creates a GUID-like string.
 *
 * @param withDashes Should the GUID have dashes (e.g., 7632b505-43fa-4c28-8e47-cdda4b5226df)
 * or not (e.g., 7632b50543fa4c288e47cdda4b5226df); defaults to true
 * @return GUID-like string; does not have uniqueness properties of a true GUID
 */
export function createPseudoGUID(withDashes = false): string {
  const baseString = withDashes
    ? "" + 1e7 + -1e3 + -4e3 + -8e3 + -1e11
    : "" + 1e7 + 1e3 + 4e3 + 8e3 + 1e11;
  return baseString.replace(
    /[018]/g,
    (c: any) =>
      // tslint:disable: no-bitwise
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    // tslint:enable: no-bitwise
  );
}

//#endregion ---------------------------------------------------------------------------------------------------------//
