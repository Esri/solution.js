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
import { getBlob } from "../restHelpersGet";
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
  return new Promise<any>((resolve, reject) => {
    getBlob(source.url, source.authentication).then(
      async blob => {
        if (
          blob.type.startsWith("text/plain") ||
          blob.type === "application/json"
        ) {
          try {
            const text = await new Response(blob).text();
            const json = JSON.parse(text);
            if (json.error) {
              reject(); // unable to get resource
              return;
            }
          } catch (Ignore) {
            reject(); // unable to get resource
            return;
          }
        }

        addResourceFromBlob(
          blob,
          destination.itemId,
          destination.folder,
          destination.filename,
          destination.authentication
        ).then(
          resolve,
          e => reject(fail(e)) // unable to add resource
        );
      },
      e => reject(fail(e)) // unable to get resource
    );
  });
}
