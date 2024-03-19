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
 * Templatizes the URLs in webhooks in a form's zip object.
 *
 * @param zipObject Form zip object to templatize; it is modified in place
 * @param sourceOrgUrl URL of the source organization,  e.g., "https://myorg.maps.arcgis.com"
 * @returns Promise that resolves to the modified zip object
 */
export async function templatizeFormWebHooks(
  zipObject: JSZip,
  sourceOrgUrl: string
): Promise<JSZip> {
  const webhooks = await common.getWebHooksFromZipObject(zipObject);
  if (webhooks.length > 0) {
    webhooks.forEach((webhook: any) => {
      // Templatize the webhook URL
      let url = webhook.url;
      const urlObj = new URL(url);

      const server = `${urlObj.protocol}//${urlObj.host}`;
      const workflowServer = "https://workflow.arcgis.com";

      if (server === workflowServer) {
        // Templatize organization
        const partialPath = url.substring(workflowServer.length);
        const partialPathParts = partialPath.split("/");
        const orgId = partialPathParts[1];
        url = url.replace(orgId, "{{user.orgId}}");

      } else {
        // Templatize server, but only if it matches the source org URL
        url = url.replace(sourceOrgUrl, "{{portalBaseUrl}}");
      }

      webhook.url = url;
    });
    zipObject = await common.setWebHooksInZipObject(zipObject, webhooks);
  }

  // Return the modified zip object
  return Promise.resolve(zipObject);
}
