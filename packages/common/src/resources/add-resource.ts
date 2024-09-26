/** @license
 * Copyright 2018 Esri
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

import { IItemResourceOptions, ArcGISAuthError, addItemResource, UserSession } from "../arcgisRestJS";

/**
 * Adds a blob resource.
 *
 * @param blob Blob containing the resource to add
 * @param itemId Id of the item to add the resource to
 * @param folder A prefix string added to the filename in the storage; use null or undefined for no folder
 * @param filename File name used to rename an existing file resource uploaded.
 * File name must have the file resource extension.
 * @param authentication Credentials for the request
 */
export function addBlobResource(
  blob: any,
  itemId: string,
  folder: string,
  filename: string,
  authentication: UserSession,
): Promise<any> {
  // Check that the filename has an extension because it is required by the addResources call
  if (filename && filename.indexOf(".") < 0) {
    return new Promise((resolve, reject) => {
      reject(new ArcGISAuthError("Filename must have an extension indicating its type"));
    });
  }

  const addRsrcOptions: IItemResourceOptions = {
    id: itemId,
    resource: blob,
    name: filename,
    authentication: authentication,
    params: {},
  };
  if (folder) {
    addRsrcOptions.params = {
      resourcesPrefix: folder,
    };
  }
  return addItemResource(addRsrcOptions);
}

/**
 * Adds a text resource.
 *
 * @param content Text to add as a resource
 * @param itemId Id of the item to add the resource to
 * @param folder A prefix string added to the filename in the storage; use null or undefined for no folder
 * @param filename File name used to rename an existing file resource uploaded, or to be used together with
 * text as file name for it. File name must have the file resource extension.
 * @param authentication Credentials for the request
 */
export function addTextResource(
  content: string,
  itemId: string,
  folder: string,
  filename: string,
  authentication: UserSession,
): Promise<any> {
  // Check that the filename has an extension because it is required by the addResources call
  if (filename && filename.indexOf(".") < 0) {
    return new Promise((resolve, reject) => {
      reject(new ArcGISAuthError("Filename must have an extension indicating its type"));
    });
  }

  const addRsrcOptions: IItemResourceOptions = {
    id: itemId,
    content,
    name: filename,
    authentication: authentication,
    params: {},
  };
  if (folder) {
    addRsrcOptions.params = {
      resourcesPrefix: folder,
    };
  }
  return addItemResource(addRsrcOptions);
}
