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

import { IDeployFilename, EFileType, SFileType } from "../interfaces";

/**
 * Extracts an item's resource folder and filename from the filename used to store a copy in a storage item.
 *
 * @param storageResourceFilename Filename used to store the resource, metadata, or thumbnail of an item
 * @param storageVersion Version of the Solution template
 * @return Folder and filename for storing information in an item, as well as the type (resource, metadata,
 * or thumbnail) of the information; the folder property is only meaningful for the resource type
 * @see generateResourceStorageFilename
 * @see generateMetadataStorageFilename
 * @see generateThumbnailStorageFilename
 * @see convertItemResourceToStorageResource
 */
export function convertStorageResourceToItemResource(
  storageResourceFilename: string,
  storageVersion = 0
): IDeployFilename {
  const nameParts = storageResourceFilename.split("/");
  let filename = nameParts.pop();
  let folder = "";
  const firstPrefixPart = nameParts.shift(); // undefined if there's no folder

  // Handle special "folders"
  let type = EFileType.Resource;
  if (firstPrefixPart) {
    if (firstPrefixPart.endsWith("_info_thumbnail")) {
      type = EFileType.Thumbnail;
    } else if (firstPrefixPart.endsWith("_info_metadata")) {
      type = EFileType.Metadata;
      filename = "metadata.xml";
    } else if (firstPrefixPart.endsWith("_info_data")) {
      type = EFileType.Data;
    } else if (folder.endsWith("_info_dataz")) {
      filename = filename.replace(/\.zip$/, "");
      type = EFileType.Data;

      // Otherwise, strip off item id
    } else if (storageVersion < 1) {
      // Version 0
      const folderStart = firstPrefixPart.indexOf("_");
      if (folderStart > 0) {
        folder = firstPrefixPart.substr(folderStart + 1);
      }
    } else {
      // Version ≥ 1
      folder = nameParts.join("/"); // folder is optional, in which case this will be ""
    }
  }

  return { type, folder, filename };
}
