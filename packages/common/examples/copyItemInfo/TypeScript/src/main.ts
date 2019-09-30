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
import * as solutionCommon from "@esri/solution-common";

export function copyItemInfo(
  authorization: auth.UserSession,
  itemId: string
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!itemId) {
      reject("Item's ID is not defined");
      return;
    }

    // Get the item base, data, and resources
    const itemBaseDef = solutionCommon.getItem(itemId, authorization);
    const itemDataDef = solutionCommon.getItemData(itemId, authorization);
    const resourcesDef = portal.getItemResources(itemId, authorization);

    // tslint:disable-next-line: no-floating-promises
    Promise.all([itemBaseDef, itemDataDef, resourcesDef]).then(responses => {
      const [itemBase, itemDataRaw, resources] = responses;

      // Create item and data sections
      let html =
        "<h3>" +
        itemBase.type +
        ' "' +
        itemBase.title +
        '" (<a href="' +
        authorization.portal.replace(/\/sharing\/rest/, "") +
        "/home/item.html?id=" +
        itemBase.id +
        '" target="_blank">' +
        itemBase.id +
        "</a>)</h3>";

      html +=
        '<div style="width:48%;display:inline-block;">Item</div>' +
        '<div style="width:2%;display:inline-block;"></div>' +
        '<div style="width:48%;display:inline-block;">Data</div>' +
        '<div style="width:48%;display:inline-block;"><textarea rows="10" style="width:99%;font-size:x-small">' +
        JSON.stringify(itemBase, null, 2) +
        "</textarea></div>" +
        '<div style="width:2%;display:inline-block;"></div>' +
        '<div id="dataSection" style="width:48%;display:inline-block;vertical-align: top;">';

      if (itemDataRaw) {
        const itemType = itemBase.type.toLowerCase();
        switch (itemType) {
          case "arcgis pro add in":
          case "code sample":
          case "csv":
          case "dashboard":
          case "desktop application template":
          case "layer package":
          case "microsoft excel":
          case "microsoft powerpoint":
          case "microsoft word":
          case "pdf":
            html +=
              '<a href="https://arcgis4localgov2.maps.arcgis.com/sharing/rest/content/items/' +
              itemId +
              '/data" target="_blank">' +
              (itemBase.title || itemBase.name) +
              "</a>";
            break;

          case "image":
            itemDataRaw.blob().then((data: any) => {
              if (data.type === "image/tiff") {
                document.getElementById("dataSection").innerHTML =
                  "<span>TIFF image; size " + data.size + "</span>";
              } else {
                const objectURL = URL.createObjectURL(data);
                document.getElementById("dataSection").innerHTML =
                  '<img src="' +
                  objectURL +
                  '" style="max-width:99%;border:1px solid lightgray;"/>';
              }
            });
            break;

          case "feature service":
          case "form":
          case "locator":
          case "storymap":
          case "geojson":
          case "tile layer":
          case "web map":
          case "web mapping application":
          case "web scene":
            html += // Blob is JSON, so it is converted by default
              '<textarea rows="10" style="width:99%;font-size:x-small">' +
              (itemDataRaw ? JSON.stringify(itemDataRaw, null, 2) : "") +
              "</textarea>";
            break;

          case "document link":
          default:
            html += "<i>no data</i>";
            break;
        }
      } else {
        html += "<i>no data</i>";
      }
      html += "</div>";

      // Figure out URLs to the resource information
      const resourceNames = (resources.resources as any[]).map(
        (resourceDetail: any) => resourceDetail.resource
      );
      const itemFilePaths: solutionCommon.ISourceFileCopyPath[] = solutionCommon.generateSourceItemFilePaths(
        authorization.portal,
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
        '" style="max-width:256px;border:1px solid lightgray;"/>&nbsp;&nbsp;<a href="' +
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
      // tslint:disable-next-line: no-floating-promises
      solutionCommon
        .getText(metadataFilePath[0].url, authorization)
        .then(metadata => {
          if (metadata) {
            document.getElementById("metadataOutput").innerHTML =
              '<textarea rows="10" style="width:99%;font-size:x-small">' +
              metadata +
              "</textarea>";
          } else {
            document.getElementById("metadataOutput").innerHTML =
              "<i>no metadata</i>";
          }
        });
      html += "</p>";

      // Fetch the remaining resources, assuming that they're images for now
      html += "<p>Resources<br/>";
      marker = "/resources/";
      const resourceFilePaths = itemFilePaths.filter(
        filePathInfo => filePathInfo.url.indexOf(marker) >= 0
      );
      if (resourceFilePaths.length === 0) {
        html += "<p><i>no resources</i></p>";
      } else {
        resourceFilePaths.forEach(filePathInfo => {
          const name = filePathInfo.url.substr(
            filePathInfo.url.indexOf(marker) + marker.length
          );
          html +=
            '<p><img src="' +
            filePathInfo.url +
            '" style="max-width:256px"/>&nbsp;&nbsp;<a href="' +
            filePathInfo.url +
            '" target="_blank">' +
            name +
            "</a></p>";
        });
      }
      html += "</p>";

      resolve(html);
    });
  });
}
