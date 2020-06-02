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

import { addItemResource } from "@esri/arcgis-rest-portal";
import { ArcGISAuthError } from "@esri/arcgis-rest-request";
import { UserSession } from "../interfaces";
/**
 * Add a resource from a blob
 * @param blob
 * @param itemId
 * @param folder
 * @param filename
 * @param authentication
 */
export function addResourceFromBlob(
  blob: any,
  itemId: string,
  folder: string,
  filename: string,
  authentication: UserSession
): Promise<any> {
  // Check that the filename has an extension because it is required by the addResources call
  if (filename && filename.indexOf(".") < 0) {
    return new Promise((resolve, reject) => {
      reject(
        new ArcGISAuthError(
          "Filename must have an extension indicating its type"
        )
      );
    });
  }

  const addRsrcOptions = {
    id: itemId,
    resource: blob,
    name: filename,
    authentication: authentication,
    params: {}
  };
  if (folder) {
    addRsrcOptions.params = {
      resourcesPrefix: folder
    };
  }
  return addItemResource(addRsrcOptions);
}
