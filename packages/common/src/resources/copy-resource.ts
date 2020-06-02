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
import { UserSession } from "../interfaces";
import { getBlob } from "./get-blob";
import { addResourceFromBlob } from "./add-resource-from-blob";

/**
 * Copies a resource from a URL to an item.
 *
 * @param source.url URL to source resource
 * @param source.authentication Credentials for the request to source
 * @param destination.itemId Id of item to receive copy of resource/metadata/thumbnail
 * @param destination.folderName Folder in destination for resource/metadata/thumbnail; defaults to top level
 * @param destination.filename Filename in destination for resource/metadata/thumbnail
 * @param destination.authentication Credentials for the request to destination
 * @return A promise which resolves to the filename under which the resource/metadata/thumbnail is stored
 */
export function copyResource(
  source: {
    url: string;
    authentication: UserSession;
  },
  destination: {
    itemId: string;
    folder: string;
    filename: string;
    authentication: UserSession;
  }
): Promise<any> {
  return getBlob(source.url, source.authentication)
    .then(blob => {
      // By default, we want to jump to the next block with the blob
      let prms = Promise.resolve(blob);
      // Ok, if the blob has a text-y type, we need to look deeper b/c it may
      // be an ago error. But if not, we return the blob
      if (
        blob.type.startsWith("text/plain") ||
        blob.type === "application/json"
      ) {
        prms = new Response(blob).text().then(text => {
          try {
            const json = JSON.parse(text);
            if (json.error) {
              return Promise.reject();
            }
          } catch (Ignore) {
            return Promise.reject();
          }
          return blob;
        });
      }
      return prms;
    })
    .then(verifiedBlob => {
      return addResourceFromBlob(
        verifiedBlob,
        destination.itemId,
        destination.folder,
        destination.filename,
        destination.authentication
      );
    })
    .catch(ex => {
      throw ex;
    });
}
