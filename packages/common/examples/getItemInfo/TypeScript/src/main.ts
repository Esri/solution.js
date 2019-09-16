/** @license
 * Copyright 2019 Esri
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
// @esri/solution-common getItemInfo TypeScript example

import * as auth from "@esri/arcgis-rest-auth";
import * as portal from "@esri/arcgis-rest-portal";
import * as request from "@esri/arcgis-rest-request";
import * as solutionCommon from "@esri/solution-common";

export function getItemInfo(itemId: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!itemId) {
      reject("Item's ID is not defined");
      return;
    }
    const defaultPortalUrl = "https://www.arcgis.com/sharing";
    const usOptions: auth.IUserSessionOptions = {};
    const destinationUserSession: auth.UserSession = new auth.UserSession(
      usOptions
    );
    const requestOptions: auth.IUserRequestOptions = {
      authentication: destinationUserSession
    };

    // Get the item base, data, and resources
    const itemBaseDef = solutionCommon.getItem(itemId, requestOptions);
    const itemDataDef = solutionCommon.getItemData(itemId, requestOptions);
    const resourcesDef = portal.getItemResources(itemId, requestOptions);

    // tslint:disable-next-line: no-floating-promises
    Promise.all([itemBaseDef, itemDataDef, resourcesDef]).then(responses => {
      const [itemBase, itemData, resources] = responses;
      let html = "";

      html +=
        "<h3>" +
        itemBase.type +
        ' "' +
        itemBase.title +
        '" (' +
        itemBase.id +
        ")</h3>";

      html +=
        '<table style="width:100%"><tr>' +
        "<td>Item Json</td>" +
        "<td>Data Json</td>" +
        "</tr><tr>" +
        '<td><textarea rows="10" style="width:99%;font-size:x-small">' +
        JSON.stringify(itemBase, null, 2) +
        "</textarea></td>" +
        '<td><textarea rows="10" style="width:99%;font-size:x-small">' +
        JSON.stringify(itemData, null, 2) +
        "</textarea></td>" +
        "</tr></table>";

      // Figure out URLs to the resource information
      const resourceNames = (resources.resources as any[]).map(
        (resourceDetail: any) => resourceDetail.resource
      );
      const itemFilePaths: solutionCommon.ISourceFileCopyPath[] = solutionCommon.generateSourceItemFilePaths(
        defaultPortalUrl,
        itemId,
        itemBase.thumbnail,
        resourceNames
      );

      // Extract the thumbnail URL
      html += "<p>Thumbnail<br/>";
      let marker = "/info/thumbnail/";
      const thumbnailFilePath = itemFilePaths.filter(
        filePathInfo => filePathInfo.url.indexOf(marker) >= 0
      );
      const thumbnailName = thumbnailFilePath[0].url.substring(
        thumbnailFilePath[0].url.indexOf("/info/") + "/info/".length
      );
      html +=
        '<img src="' +
        thumbnailFilePath[0].url +
        '" style="max-width:256px"/> ' +
        '<a href="' +
        thumbnailFilePath[0].url +
        '" target="_blank">' +
        thumbnailName +
        "</a><br/>";
      html += "</p>";

      // Extract the metadata URL and see if it exists
      html += "<p>Metadata<br/>";
      marker = "/info/metadata/";
      const metadataFilePath = itemFilePaths.filter(
        filePathInfo => filePathInfo.url.indexOf(marker) >= 0
      );
      html += '<div id="metadataOutput"></div>';
      const requestOptionsNonJson: auth.IUserRequestOptions = {
        ...requestOptions,
        params: {
          f: "text"
        }
      };
      request.request(metadataFilePath[0].url, requestOptionsNonJson).then(
        metadata => {
          document.getElementById("metadataOutput").innerHTML =
            '<textarea rows="10" style="width:99%;font-size:x-small">' +
            metadata +
            "</textarea>";
        },
        () => {
          document.getElementById("metadataOutput").innerHTML =
            "<i>no metadata</i>";
        }
      );
      html += "</p>";

      // Fetch the remaining resources, assuming that they're images for now
      html += "<p>Resources<br/>";
      marker = "/resources/";
      const resourceFilePaths = itemFilePaths.filter(
        filePathInfo => filePathInfo.url.indexOf(marker) >= 0
      );
      resourceFilePaths.forEach(filePathInfo => {
        const name = filePathInfo.url.substr(
          filePathInfo.url.indexOf(marker) + marker.length
        );
        html +=
          '<img src="' +
          filePathInfo.url +
          '" style="max-width:256px"/> ' +
          '<a href="' +
          filePathInfo.url +
          '" target="_blank">' +
          name +
          "</a><br/>";
      });
      html += "</p>";

      resolve(html);
    });
  });
}
