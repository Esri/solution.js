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

/**
 * Provides request encoding functions to help with searching by category. Functions are compatible with the functions
 * of the same name in arcgis-rest-js' `arcgis-rest-request` package.
 *
 * @module categories
 */

import { requiresFormData } from "@esri/arcgis-rest-request";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Encodes parameters in a [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) object in browsers
 * or in a [FormData](https://github.com/form-data/form-data) in Node.js
 *
 * @param params An object to be encoded.
 * @param forceFormData Force the rendering of the parameters as a FormData
 * @returns The complete [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) object. If a FormData
 * is not required for these parameters and forceFormData is not true, then the parameters are encoded as a query
 * string.
 */
export function encodeFormData(
  params: any,
  forceFormData?: boolean
): FormData | string {
  // see https://github.com/Esri/arcgis-rest-js/issues/499 for more info.
  const useFormData = requiresFormData(params) || forceFormData;
  const newParams = _processParams(params);
  if (useFormData) {
    const formData = new FormData();
    Object.keys(newParams).forEach((key: any) => {
      if (typeof Blob !== "undefined" && newParams[key] instanceof Blob) {
        /* To name the Blob:
         1. look to an alternate request parameter called 'fileName'
         2. see if 'name' has been tacked onto the Blob manually
         3. if all else fails, use the request parameter
        */
        const filename = newParams["fileName"] || newParams[key].name || key;
        formData.append(key, newParams[key], filename);
      } else {
        // Check for and handle `categories` parameter to match API expectation for AND and OR
        // @see https://developers.arcgis.com/rest/users-groups-and-items/search.htm
        // @see https://developers.arcgis.com/rest/users-groups-and-items/group-content-search.htm
        if (key === "categories" && Array.isArray(newParams[key])) {
          newParams[key].forEach((categoryGroup: any) =>
            formData.append(key, categoryGroup)
          );
        } else {
          formData.append(key, newParams[key]);
        }
      }
    });
    return formData;
  } else {
    return encodeQueryString(params);
  }
}

/**
 * Encodes the passed object as a query string.
 *
 * @param params An object to be encoded.
 * @returns An encoded query string.
 */
export function encodeQueryString(params: any): string {
  const newParams = _processParams(params);
  return Object.keys(newParams)
    .map((key: any) => {
      return _encodeParam(key, newParams[key]);
    })
    .join("&");
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Encodes keys and parameters for use in a URL's query string.
 *
 * @param key Parameter's key
 * @param value Parameter's value
 * @returns Query string with key and value pairs separated by "&"
 */
export function _encodeParam(key: string, value: any) {
  // Check for and handle `categories` parameter to match API expectation for AND and OR
  // @see https://developers.arcgis.com/rest/users-groups-and-items/search.htm
  // @see https://developers.arcgis.com/rest/users-groups-and-items/group-content-search.htm
  if (key === "categories") {
    return value
      .map((categoryGroup: string) => {
        return (
          encodeURIComponent(key) + "=" + encodeURIComponent(categoryGroup)
        );
      })
      .join("&");
  }
  return encodeURIComponent(key) + "=" + encodeURIComponent(value);
}

/**
 * Converts parameters to the proper representation to send to the ArcGIS REST API.
 *
 * @param params The object whose keys will be encoded.
 * @return A new object with properly encoded values.
 */
export function _processParams(params: any): any {
  const newParams: any = {};

  Object.keys(params).forEach(key => {
    let param = params[key];

    if (param && param.toParam) {
      param = param.toParam();
    }

    if (
      !param &&
      param !== 0 &&
      typeof param !== "boolean" &&
      typeof param !== "string"
    ) {
      return;
    }

    const type = param.constructor.name;

    let value: any;

    // properly encodes objects, arrays and dates for arcgis.com and other services.
    // ported from https://github.com/Esri/esri-leaflet/blob/master/src/Request.js#L22-L30
    // also see https://github.com/Esri/arcgis-rest-js/issues/18:
    // null, undefined, function are excluded. If you want to send an empty key you need to send an empty string "".
    switch (type) {
      case "Array":
        // Don't process `categories` parameter because API expectation for AND and OR permits multiple `categories`
        // parameters in a query. We can't assign more than one to newParams, so we'll postpone handling.
        // @see https://developers.arcgis.com/rest/users-groups-and-items/search.htm
        // @see https://developers.arcgis.com/rest/users-groups-and-items/group-content-search.htm
        if (key === "categories") {
          value = param;
        } else {
          // Otherwise, based on the first element of the array, classify array as an array of objects to be stringified
          // or an array of non-objects to be comma-separated
          value =
            param[0] &&
            param[0].constructor &&
            param[0].constructor.name === "Object"
              ? JSON.stringify(param)
              : param.join(",");
        }
        break;
      case "Object":
        value = JSON.stringify(param);
        break;
      case "Date":
        value = param.valueOf();
        break;
      case "Function":
        value = null;
        break;
      case "Boolean":
        value = param + "";
        break;
      default:
        value = param;
        break;
    }
    if (value || value === 0 || typeof value === "string") {
      newParams[key] = value;
    }
  });

  return newParams;
}
