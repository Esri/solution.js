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
 * Supplies the File constructor for Microsoft Edge.
 *
 * @param fileBits
 *
 * @return File
 */
export function new_File(
  fileBits: BlobPart[],
  fileName: string,
  options?: FilePropertyBag
): File {
  let file: File;

  try {
    file = new File(fileBits, fileName, options);
  } catch (error) {
    const blob = new Blob(fileBits, options) as any;
    blob.lastModifiedDate = new Date();
    blob.name = fileName;
    file = blob as File;
  }

  return file;
}
