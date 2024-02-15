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
 * @param zip Form zip file to templatize
 * @param filename Name of the file to create after modifying the contents of the supplied zip file
 * @returns Promise that resolves to the modified zip object if the swizzle was successful
 */
export async function templatizeFormData(
  zip: File,
  filename: string
): Promise<File> {
  let zipObject = await common.blobToZipObject(zip);

  // Replace AGO ids
  zipObject = await _templatizeAgoIds(zipObject);

  // Get the index file to get the name used for the other files
  const filenameRoot = JSON.parse(await zipObject.file("esriinfo/forminfo.json").async("string")).name;

  // Get the file that contains any webhooks
  const infoFilename = `esriinfo/${filenameRoot}.info`;
  const infoFile =  JSON.parse(await zipObject.file(infoFilename).async("string"));

  // Templatize each webhook
  const webhooks = infoFile.notificationsInfo?.webhooks ?? [];
  if (webhooks.length > 0) {
    _templatizeWebHooks(webhooks);
    infoFile.notificationsInfo.webhooks = webhooks;
    zipObject.file(infoFilename, JSON.stringify(infoFile));
  }

  // Return the modified zip file
  return common.zipObjectToZipFile(zipObject, filename)
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Templatizes AGO ids in the supplied zip object.
 *
 * @param zipObject Zip object to templatize
 * @returns Promise that resolves to the modified zip object
 */
export async function _templatizeAgoIds(
  zipObject: JSZip
): Promise<JSZip> {
  const agoIdRegEx = common.getAgoIdRegEx();

  return common.modifyFilesinZipObject(
    (zippedFile: common.IZipObjectContentItem): string => {
      const agoIdMatches = zippedFile.content.match(agoIdRegEx) ?? [];
      const completedMatches: any = {};
      agoIdMatches.forEach((match: string) => {
        if (completedMatches[match]) {
          return;
        }
        zippedFile.content = zippedFile.content.replace(new RegExp(match, "g"), `{{${match}.itemId}}`);
        completedMatches[match] = true;
      });
      return zippedFile.content;
    },
    zipObject
  );
}

/**
 * Templatizes the URLs in webhooks.
 *
 * @param webhooks List of Form webhook definitions to templatize
 */
export function _templatizeWebHooks(
  webhooks: any[]
): void {
  webhooks.forEach((webhook: any) => {
    let url = webhook.url;
    const urlObj = new URL(url);

    const server = `${urlObj.protocol}//${urlObj.host}`;
    const workflowServer = "https://workflow.arcgis.com";
    if (server === workflowServer) {
      // Templatize organization
      const partialPath = url.substring(workflowServer.length);
      const partialPathParts = partialPath.split("/");
      const orgId = partialPathParts[1];
      url = url.replace(orgId, "{{orgId}}");

    } else {
      // Templatize server
      url = url.replace(server, "{{portalBaseUrl}}");
    }

    webhook.url = url;
  });
}

