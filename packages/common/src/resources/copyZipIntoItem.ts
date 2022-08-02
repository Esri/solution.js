/** @license
 * Copyright 2021 Esri
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

import { IZipCopyResults, IZipInfo, ArcGISIdentityManager } from "../interfaces";
import {
  IItemResourceOptions,
  addItemResource
} from "@esri/arcgis-rest-portal";
import { blobToFile } from "../generalHelpers";
import { createCopyResults } from "./createCopyResults";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Copies a zipfile into an AGO item.
 *
 * @param zipInfo Information about a zipfile such as its name and its zip object
 * @param destinationItemId Id of item to receive copy of resource/metadata/thumbnail
 * @param destinationAuthentication Credentials for the request to the storage
 * @returns A promise which resolves to the result of the copy
 */
export function copyZipIntoItem(
  zipInfo: IZipInfo,
  destinationItemId: string,
  destinationAuthentication: ArcGISIdentityManager
): Promise<IZipCopyResults> {
  return new Promise<IZipCopyResults>(resolve => {
    zipInfo.zip
      .generateAsync({ type: "blob" })
      .then((content: Blob) => {
        return blobToFile(content, zipInfo.filename, "application/zip");
      })
      .then((zipfile: File) => {
        const addResourceOptions: IItemResourceOptions = {
          id: destinationItemId,
          resource: zipfile,
          authentication: destinationAuthentication,
          params: {
            archive: true
          }
        };
        return addItemResource(addResourceOptions);
      })
      .then(
        () =>
          resolve(createCopyResults(zipInfo, true, true) as IZipCopyResults),
        () =>
          resolve(createCopyResults(zipInfo, true, false) as IZipCopyResults) // unable to add resource
      );
  });
}
