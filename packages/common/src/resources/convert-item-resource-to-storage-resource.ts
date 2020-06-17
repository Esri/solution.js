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
 * Generates a folder and filename for storing a copy of an item's resource in a storage item.
 *
 * @param itemId Id of item
 * @param sourceResourceFilename Either filename or folder/filename to resource
 * @param storageFolder An additional folder level inserted between the itemId and the sourceResourceFilename
 * @return Folder and filename for storage; folder is the itemID plus ("_" + storageFolder) if storageFolder
 * exists plus ("_" + part of sourceResourceFilename before "/" if that separator exists);
 * file is sourceResourceFilename
 * @see generateResourceFilenameFromStorage
 */
export function convertItemResourceToStorageResource(
  itemId: string,
  sourceResourceFilename: string,
  storageFolder = ""
): {
  folder: string;
  filename: string;
} {
  let folder = itemId + (storageFolder ? `_${storageFolder}` : '');
  // let filename = sourceResourceFilename;
  const parts = sourceResourceFilename.split("/");
  const filename = parts[parts.length - 1];
  // remove the filename, and for any part of the path, swap any _'s to -'s
  const pathParts = parts.filter(p => p !== filename).map(e => e.replace('_', '-'));
  // if we have any pathParts, join'em all into the folder with _'s as separators
  if (pathParts.length) {
    folder = `${folder}_${pathParts.join('_')}`;
  }

  return { folder, filename };
}