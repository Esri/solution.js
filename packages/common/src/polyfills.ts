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
 * Provides polyfill helper functions.
 *
 * @module polyfills
 */

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Supplies Blob.text for Microsoft Legacy Edge
 *
 * @param blob Blob to read
 * @return Promise resolving to blob's text
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob
 * @see https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 */
export function getBlobText(
  blob: Blob
): Promise<string> {
  let textPromise: Promise<string>;

  /* istanbul ignore else */
  if (typeof blob.text !== "undefined") {
    // Modern browser
    textPromise = blob.text();

  } else {
    // Microsoft Legacy Edge
    textPromise = new Promise<string>(
      (resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
          if (event.target && event.target.result) {
            // event.target.result is typed as "string | ArrayBuffer | null", but for the readAsText function,
            // the result is a string
            resolve(event.target.result as string);
          } else {
            resolve("");
          }
        };
        reader.onerror = function(event) {
          reject(event);
        };
        reader.readAsText(blob);
      }
    );
  }

  return textPromise;
}

/**
 * Supplies the File constructor for Microsoft Legacy Edge.
 *
 * @param fileBits Contents for file
 * @param fileName Name for file
 * @param options Bucket of options, euch as `type` for the MIME type; defaults to empty string for `type`
 * @return File or, for Microsoft Legacy Edge, Blob
 * @see https://developer.mozilla.org/en-US/docs/Web/API/File/File
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob
 */
export function new_File(
  fileBits: BlobPart[],
  fileName: string,
  options?: FilePropertyBag
): File {
  let file: File;

  try {
    // Modern browser
    file = new File(fileBits, fileName, options);
  }

  catch (error) {
    // Microsoft Legacy Edge
    /* istanbul ignore next */
    file = (function(): File {
      if (typeof options === "undefined") {
        // Microsoft Legacy Edge fails in karma if options is not defined
        options = {
          type: ""
        };
      }
      const blob = new Blob(fileBits, options) as any;
      blob.lastModified = new Date();
      blob.name = fileName;
      return blob as File;
    }());
  }

  return file;
}
