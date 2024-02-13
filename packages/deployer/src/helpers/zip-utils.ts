/** @license
 * Copyright 2024 Esri
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

import * as common from "@esri/solution-common";
import JSZip from "jszip";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Swizzles the source item id with the destination item id in the form zip file and updates the destination item
 * with the swizzled zip file.
 *
 * @param sourceItemId Source item id
 * @param destinationItemId Destination item id
 * @param zipBlob Form zip file
 * @param filesOfInterest Array of file names to extract from the zip file. If empty, all files are extracted.
 * @returns Promise that resolves to the modified zip file if the swizzle was successful
 */
export async function swizzleIdsInZipFile(
  sourceItemId: string,
  destinationItemId: string,
  zip: JSZip,
  filesOfInterest: string[] = []
): Promise<JSZip> {
  const updatedZip = await common.modifyFilesinZipObject(
    (zipFile: common.IZipObjectContentItem) => {
      return zipFile.content.replace(new RegExp(sourceItemId, "g"), destinationItemId);
    }, zip, filesOfInterest
  );

  return Promise.resolve(updatedZip);
}
