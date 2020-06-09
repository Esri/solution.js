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
 * Provides connectors to third-party helper functions.
 */

import JSZip from "jszip";
import { blobToFile } from "./generalHelpers";
import { Sanitizer } from "@esri/arcgis-html-sanitizer";
export { Sanitizer } from "@esri/arcgis-html-sanitizer";

//#region JSZip ----------------------------------------------------------------------------------------------------- //

/**
 * Creates a zip File from a collection of Files.
 *
 * @param zipFilename Name to use for zip File
 * @param files List of files to add to zip File
 * @return Promise resolving to a zip File
 */
export function createZip(
  zipFilename: string,
  files: File[]
): Promise<File> {
  return new Promise<File>((resolve, reject) => {
    const zip = new JSZip();

    // Add the files
    files.forEach(
      file => zip.file(file.name, file, { binary: true })
    );

    // Create the ZIP
    zip.generateAsync({ type: "blob" })
      .then(
        (content: Blob) => resolve(blobToFile(content, zipFilename, "application/zip")),
        reject
      );
  });
}

//#endregion ---------------------------------------------------------------------------------------------------------//

//#region arcgis-html-sanitizer ------------------------------------------------------------------------------------- //

/**
 * Result of checking if a string contains invalid HTML.
 */
export interface IValidationResult {
  /*
   * Flag indicating if `html` is valid (i.e., contains no invalid HTML)
   */
  isValid: boolean;
  /*
   * Sanitized version of `html`
   */
  sanitized: string;
}

/**
 * Sanitizes html.
 *
 * @param HTML Text to sanitize
 * @param sanitizer Instance of Sanitizer class
 * @return Sanitized version of `html`
 * @see https://github.com/esri/arcgis-html-sanitizer#basic-usage
 */
export function sanitizeHTML(html: string, sanitizer?: Sanitizer): string {
  if (!sanitizer) {
    sanitizer = new Sanitizer();
  }

  return sanitizer.sanitize(html);
}

/**
 * Sanitizes JSON.
 *
 * @param json JSON to sanitize
 * @param sanitizer Instance of Sanitizer class
 * @return Sanitized version of `json`
 * @see https://github.com/esri/arcgis-html-sanitizer#sanitize-json
 */
export function sanitizeJSON(json: any, sanitizer?: Sanitizer): any {
  if (!sanitizer) {
    sanitizer = new Sanitizer();
  }

  return sanitizer.sanitize(json);
}

/**
 * Sanitizes the protocol in a URL.
 *
 * @param url URL to sanitize
 * @param sanitizer Instance of Sanitizer class
 * @return Sanitized version of `url`
 * @see https://github.com/esri/arcgis-html-sanitizer#sanitize-urls
 */
export function sanitizeURLProtocol(
  url: string,
  sanitizer?: Sanitizer
): string {
  if (!sanitizer) {
    sanitizer = new Sanitizer();
  }

  return sanitizer.sanitizeUrl(url);
}

/**
 * Checks if a string contains invalid HTML.
 *
 * @param html HTML to check
 * @param sanitizer Instance of Sanitizer class
 * @return An object containing a flag indicating if `html` is valid (i.e., contains no invalid HTML)
 * as well as the sanitized version of `html`
 * @see https://github.com/esri/arcgis-html-sanitizer#basic-usage
 */
export function validateHTML(
  html: string,
  sanitizer?: Sanitizer
): IValidationResult {
  if (!sanitizer) {
    sanitizer = new Sanitizer();
  }

  return sanitizer.validate(html);
}

//#endregion ---------------------------------------------------------------------------------------------------------//
