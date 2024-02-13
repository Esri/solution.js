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
  const agoIdRegEx = common.getAgoIdRegEx();
  const zipObject = await common.blobToZipObject(zip);

  // Replace AGO ids
  common.modifyFilesinZipObject(
    (zipContentStr: common.IZipObjectContentItem): string => {
      const agoIdMatches = zipContentStr.content.match(agoIdRegEx) ?? [];
      agoIdMatches.forEach((match: string) => {
        zipContentStr.content = zipContentStr.content.replace(match, `{{${match}}}`);
      });
      return zipContentStr.content;
    },
    zipObject);

  // Get the index file to get the name used for the other files
  const filenameRoot = JSON.parse(await zipObject.file("esriinfo/forminfo.json").async("string")).name;

  // Get the file that contains any webhooks
  const infoFilename = `esriinfo/${filenameRoot}.info`;
  const infoFile =  JSON.parse(await zipObject.file(infoFilename).async("string"));

  // Templatize each webhook
  const webhooks = infoFile.notificationsInfo?.webhooks ?? [];

  webhooks.forEach((webhook: any) => {
    const urlObj = new URL(webhook.url);
    let url = urlObj.toString();

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

    // Templatize all AGO ids in the URL
    const agoIdMatches = url.match(agoIdRegEx) ?? [];
    agoIdMatches.forEach((match: string) => {
      const idRE = common.getSpecificAgoIdRegEx(match);
      const templatizedId = `{{${match}}}`;
      url = url.replace(idRE, templatizedId);
    });

    webhook.url = url;
  });

  // Return the modified zip file
  if (webhooks.length > 0) {
    infoFile.notificationsInfo.webhooks = webhooks;
    zipObject.file(infoFilename, JSON.stringify(infoFile));
    return common.zipObjectToZipFile(zipObject, filename)
  } else {
    return common.createMimeTypedFile({
      blob: zip,
      filename,
      mimeType: "application/zip"
    });

  }
}
