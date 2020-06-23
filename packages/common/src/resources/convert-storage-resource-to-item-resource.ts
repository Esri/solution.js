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


import {
  IDeployFilename,
  EFileType
} from '../interfaces'

/**
 * Extracts an item's resource folder and filename from the filename used to store a copy in a storage item.
 *
 * @param storageResourceFilename Filename used to store the resource, metadata, or thumbnail of an item
 * @return Folder and filename for storing information in an item, as well as the type (resource, metadata,
 * or thumbnail) of the information; the folder property is only meaningful for the resource type
 * @see generateResourceStorageFilename
 * @see generateMetadataStorageFilename
 * @see generateThumbnailStorageFilename
 */
export function convertStorageResourceToItemResource(
  storageResourceFilename: string
): IDeployFilename {
  let type = EFileType.Resource;
  // Older Hub Solution Templates don't have folders, so
  // we have some extra logic to handle this
  let folder = "";
  let filename = storageResourceFilename;
  if (storageResourceFilename.indexOf("/") > -1) {
    [folder, filename] = storageResourceFilename.split("/");
  }
  // let [folder, filename] = storageResourceFilename.split("/");

  // Handle special "folders"
  if (folder.endsWith("_info_thumbnail")) {
    type = EFileType.Thumbnail;
  } else if (folder.endsWith("_info_metadata")) {
    type = EFileType.Metadata;
    filename = "metadata.xml";
  } else if (folder.endsWith("_info")) {
    type = EFileType.Info;
  } else if (folder.endsWith("_info_data")) {
    type = EFileType.Data;
  } else if (folder.endsWith("_info_dataz")) {
    filename = filename.replace(/\.zip$/, "");
    type = EFileType.Data;
  } else {
    const folderStart = folder.indexOf("_");
    if (folderStart > 0) {
      folder = folder.substr(folderStart + 1);
    } else {
      folder = "";
    }
  }

  return { type, folder, filename };
}