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
// import * as solutionCommon from "@esri/solution-common";
import * as solutionCommon from "../src/common.umd.min";

export function getItemInfo(
  itemId: string,
  authorization: auth.UserSession
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!itemId) {
      reject("Item's ID is not defined");
      return;
    }

    // Get the item information
    const itemBaseDef = solutionCommon.getItemBase(itemId, authorization);
    const itemDataDef = new Promise<Blob>((resolve2, reject2) => {
      // tslint:disable-next-line: no-floating-promises
      itemBaseDef.then(
        // any error fetching item base will be handled via Promise.all later
        (itemBase: any) => {
          solutionCommon
            .getItemDataAsFile(itemId, itemBase.name, authorization)
            .then(resolve2, (error: any) => reject2(error));
        }
      );
    });
    const itemThumbnailDef = new Promise<Blob>((resolve3, reject3) => {
      // tslint:disable-next-line: no-floating-promises
      itemBaseDef.then(
        // any error fetching item base will be handled via Promise.all later
        (itemBase: any) => {
          solutionCommon
            .getItemThumbnail(itemId, itemBase.thumbnail, false, authorization)
            .then(resolve3, (error: any) => reject3(error));
        }
      );
    });
    const itemMetadataDef = solutionCommon.getItemMetadataBlob(
      itemId,
      authorization
    );
    const itemResourcesDef = solutionCommon.getItemResourcesFiles(
      itemId,
      authorization
    );

    Promise.all([
      itemBaseDef,
      itemDataDef,
      itemThumbnailDef,
      itemMetadataDef,
      itemResourcesDef
    ]).then(
      responses => {
        const [
          itemBase,
          itemDataFile,
          itemThumbnail,
          itemMetadataBlob,
          itemResourceFiles
        ] = responses;
        // (itemBase: any)  text/plain JSON
        // (itemDataDef: File)  */*
        // (itemThumbnail: Blob)  image/*
        // (itemMetadataDef: Blob)  application/xml
        // (itemResourcesDef: Blob[])  list of */*
        console.log("itemBase", itemBase);
        console.log("itemData", itemDataFile);
        console.log("itemThumbnail", itemThumbnail);
        console.log("itemMetadata", itemMetadataBlob);
        console.log("itemResources", itemResourceFiles);

        const portalUrl = solutionCommon.getPortalUrlFromAuth(authorization);

        // Show item and data sections
        let html =
          "<h3>" +
          itemBase.type +
          ' "' +
          itemBase.title +
          '" (<a href="' +
          portalUrl +
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
          '<div id="dataSection" style="width:48%;display:inline-block;vertical-align: top;"></div>';
        showBlob(itemDataFile, "dataSection");

        // Show thumbnail section
        html += '<p>Thumbnail<br/><div id="thumbnailOutput"></div></p>';
        showBlob(itemThumbnail, "thumbnailOutput");

        // Show metadata section
        html += '<p>Metadata<br/><div id="metadataOutput"></div></p>';
        showBlob(itemMetadataBlob, "metadataOutput");

        // Show resources section
        html += "<p>Resources<br/>";
        if (itemResourceFiles.length === 0) {
          html += "<p><i>none</i>";
        } else {
          for (let i: number = 0; i < itemResourceFiles.length; ++i) {
            const containerId = "resourceOutput" + i;
            html += '<div id="' + containerId + '"></div>';
            showBlob(itemResourceFiles[i], containerId);
          }
        }
        html += "</p>";

        resolve(html);
      },
      (error: any) => reject(error)
    );
  });
}

function showBlob(blob: Blob, domContainerId: string): void {
  setTimeout(() => {
    const domContainer: HTMLElement = document.getElementById(domContainerId);
    if (!blob) {
      domContainer.innerHTML = "<i>none</i>";
      return;
    }
    const file = blob as File;

    if (blob.type === "application/json") {
      solutionCommon.blobToJson(blob).then(
        text => {
          domContainer.innerHTML =
            '<textarea rows="10" style="width:99%;font-size:x-small">' +
            JSON.stringify(text, null, 2) +
            "</textarea>";
        },
        error =>
          (domContainer.innerHTML =
            "<i>problem extracting JSON: " + error + "</i>")
      );
    } else if (
      blob.type.startsWith("text/plain") ||
      blob.type === "text/xml" ||
      blob.type === "application/xml"
    ) {
      solutionCommon.blobToText(blob).then(
        text => {
          domContainer.innerHTML =
            '<textarea rows="10" style="width:99%;font-size:x-small">' +
            text +
            "</textarea>";
        },
        error =>
          (domContainer.innerHTML =
            "<i>problem extracting text: " + error + "</i>")
      );
    } else if (blob.type.startsWith("image/")) {
      domContainer.innerHTML =
        '<img src="' +
        window.URL.createObjectURL(blob) +
        '" style="max-width:256px;border:1px solid lightgray;"/>';
      if (file.name) {
        domContainer.innerHTML +=
          '&nbsp;&nbsp;&nbsp;&nbsp;<a href="' +
          window.URL.createObjectURL(file) +
          '" download="' +
          file.name +
          '">' +
          file.name +
          "</a>";
      }
      domContainer.innerHTML += "</p>";
    } else {
      if (file.name) {
        domContainer.innerHTML =
          '<a href="' +
          window.URL.createObjectURL(file) +
          '" download="' +
          file.name +
          '">' +
          file.name +
          "</a>";
      } else {
        domContainer.innerHTML =
          '<a href="' +
          window.URL.createObjectURL(blob) +
          '">' +
          blob.type +
          "</a>";
      }
    }
  }, 10);
}
