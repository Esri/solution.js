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
 * Templatizes a form's zip file.
 *
 * @param zipObject Form zip object to templatize
 * @param isOrgItem Indicates whether this item and the user whose credential was used to fetch this item belong
 * to the same ArcGIS Enterprise Portal or ArcGIS Online Organization
 * @returns Promise that resolves to the modified zip object if the swizzle was successful
 */
export async function templatizeFormData(
  zipObject: JSZip,
  isOrgItem = false
): Promise<JSZip> {
  // Replace AGO ids
  zipObject = await _templatizeAgoIds(zipObject);

  // Templatize webhooks
  const webhooks = await common.getWebHooksFromZipObject(zipObject);
  if (webhooks.length > 0) {
    _templatizeWebHooks(webhooks, isOrgItem);
    zipObject = await common.setWebHooksInZipObject(zipObject, webhooks);
  }

  // Return the modified zip object
  return Promise.resolve(zipObject);
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Templatizes AGO ids in the supplied zip object.
 *
 * @param zipObject Zip object to templatize
 * @returns Promise that resolves to the modified zip object
 */
export function _templatizeAgoIds(
  zipObject: JSZip
): Promise<JSZip> {
  return common.modifyFilesinZipObject(
    (zippedFile: common.IZipObjectContentItem): string => {
      // Replace AGO ids, but with special handling for ".info" file
      // Save webhook URLs--we don't templatize them because they're handled in _templatizeWebHooks()
      // Save the displayInfo.map.defaultType.name value--we don't templatize it
      let webhookUrls: string[] = [];
      let displayInfo_map_defaultType_name;

      if (zippedFile.file.endsWith(".info")) {
        const infoFileJson = JSON.parse(zippedFile.content);

        webhookUrls = (common.getProp(infoFileJson, "notificationsInfo.webhooks") || [])
          .map((webhook: any) => webhook.url);

        displayInfo_map_defaultType_name = common.getProp(infoFileJson, "displayInfo.map.defaultType.name");
      }

      // Templatize strings that look like AGO ids
      zippedFile.content = common.templatizeIds(zippedFile.content);

      // Restore the webhook URLs & displayInfo.map.defaultType.name value
      if (zippedFile.file.endsWith(".info") && displayInfo_map_defaultType_name) {
        const infoFileJson = JSON.parse(zippedFile.content);

        const webhooks = common.getProp(infoFileJson, "notificationsInfo.webhooks") || [];
        webhooks.forEach((webhook: any, i: number) => {
          webhook.url = webhookUrls[i];
        });
        common.setProp(infoFileJson, "notificationsInfo.webhooks", webhooks);

        common.setProp(infoFileJson, "displayInfo.map.defaultType.name", displayInfo_map_defaultType_name);

        zippedFile.content = JSON.stringify(infoFileJson);
      }

      return zippedFile.content;
    },
    zipObject
  );
}

/**
 * Templatizes the URLs in webhooks.
 *
 * @param webhooks List of Form webhook definitions to templatize
 * @param isOrgItem Indicates whether this item and the user whose credential was used to fetch this item belong
 * to the same ArcGIS Enterprise Portal or ArcGIS Online Organization
 */
export function _templatizeWebHooks(
  webhooks: any[],
  isOrgItem: boolean
): void {
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

    } else if (isOrgItem) {
      // Templatize server
      url = url.replace(server, "{{portalBaseUrl}}");

      // Replace AGO ids
      //???url = common.templatizeIds(url);
    }

    webhook.url = url;
  });
}

