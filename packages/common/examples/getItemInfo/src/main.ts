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
// @esri/solution-common getItemInfo example

import * as common from "../lib/common.umd.min";

export function getItemInfo(
  itemId: string,
  authentication: common.UserSession
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!itemId) {
      reject("Item's ID is not defined");
      return;
    }

    // Get the item information
    const itemFwdRelatedItemsDef = common.getItemRelatedItemsInSameDirection(
      itemId,
      "forward",
      authentication
    );
    const itemRevRelatedItemsDef = common.getItemRelatedItemsInSameDirection(
      itemId,
      "reverse",
      authentication
    );

    const itemBaseDef = common.getItemBase(itemId, authentication);
    const itemDataDef = new Promise<Blob>((resolve2, reject2) => {
      // tslint:disable-next-line: no-floating-promises
      itemBaseDef.then(
        // any error fetching item base will be handled via Promise.all later
        (itemBase: any) => {
          common
            .getItemDataAsFile(itemId, itemBase.name, authentication)
            .then(resolve2, (error: any) => reject2(JSON.stringify(error)));
        }
      );
    });
    const itemThumbnailDef = new Promise<Blob>((resolve3, reject3) => {
      // tslint:disable-next-line: no-floating-promises
      itemBaseDef.then(
        // any error fetching item base will be handled via Promise.all later
        (itemBase: any) => {
          common
            .getItemThumbnail(itemId, itemBase.thumbnail, false, authentication)
            .then(resolve3, (error: any) => reject3(JSON.stringify(error)));
        }
      );
    });
    const itemMetadataDef = common.getItemMetadataBlob(itemId, authentication);
    const itemResourcesDef = common.getItemResourcesFiles(
      itemId,
      authentication
    );

    Promise.all([
      itemBaseDef,
      itemDataDef,
      itemThumbnailDef,
      itemMetadataDef,
      itemResourcesDef,
      itemFwdRelatedItemsDef,
      itemRevRelatedItemsDef
    ]).then(
      async responses => {
        const [
          itemBase,
          itemDataFile,
          itemThumbnail,
          itemMetadataBlob,
          itemResourceFiles,
          itemFwdRelatedItems,
          itemRevRelatedItems
        ] = responses;
        // Summarize what we have
        // ----------------------
        // (itemBase: common.IItem)  text/plain JSON
        // (itemData: File)  */*
        // (itemThumbnail: Blob)  image/*
        // (itemMetadata: Blob)  application/xml
        // (itemResources: File[])  list of */*
        // (itemFwdRelatedItems: common.IRelatedItems[])  list of forward relationshipType/relatedItems[] pairs
        // (itemRevRelatedItems: common.IRelatedItems[])  list of reverse relationshipType/relatedItems[] pairs
        console.log("itemBase", itemBase);
        console.log("itemData", itemDataFile);
        console.log("itemThumbnail", itemThumbnail);
        console.log("itemMetadata", itemMetadataBlob);
        console.log("itemResources", JSON.stringify(itemResourceFiles));
        console.log("itemFwdRelatedItems", JSON.stringify(itemFwdRelatedItems));
        console.log("itemRevRelatedItems", JSON.stringify(itemRevRelatedItems));

        const portalUrl = common.getPortalUrlFromAuth(authentication);

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
          '<div style="width:48%;display:inline-block;">' +
          textAreaHtml(JSON.stringify(itemBase, null, 2)) +
          '</div><div style="width:2%;display:inline-block;"></div>' +
          '<div style="width:48%;display:inline-block;vertical-align:top;">';
        html += await showBlob(itemDataFile);
        html += "</div>";

        // Show thumbnail section
        html += "<p>Thumbnail<br/><div>";
        html += await showBlob(itemThumbnail);
        html += "</div></p>";

        // Show metadata section
        html += "<p>Metadata<br/><div>";
        html += await showBlob(itemMetadataBlob);
        html += "</div></p>";

        // Show resources section
        html += "<p>Resources<br/>";
        if (itemResourceFiles.length === 0) {
          html += "<p><i>none</i>";
        } else {
          html += "<ol>";
          // tslint:disable-next-line: prefer-for-of
          for (let i: number = 0; i < itemResourceFiles.length; ++i) {
            html += "<li><div>";
            html += await showBlob(itemResourceFiles[i]);
            html += "</div></li>";
          }
          html += "</ol>";
        }
        html += "</p>";

        // Show related items section
        html += "<p>Related Items<br/>";
        if (
          itemFwdRelatedItems.length === 0 &&
          itemRevRelatedItems.length === 0
        ) {
          html += "<p><i>none</i>";
        } else {
          html +=
            "<ul style='margin-left:-36px;list-style-type:none;font-size:smaller;'>";
          for (const relatedItem of itemFwdRelatedItems) {
            html +=
              "<li>&rarr; " +
              relatedItem.relationshipType +
              " " +
              JSON.stringify(relatedItem.relatedItemIds) +
              "</li>";
          }
          for (const relatedItem of itemRevRelatedItems) {
            html +=
              "<li>&larr; " +
              relatedItem.relationshipType +
              " " +
              JSON.stringify(relatedItem.relatedItemIds) +
              "</li>";
          }
          html += "</ul>";
        }
        html += "</p>";

        // Show sections custom to item types
        if (itemBase.type === "Feature Service") {
          if (authentication.token) {
            // These queries require authentication
            // Show resources section
            common
              .getFeatureServiceProperties(itemBase.url, authentication)
              .then(
                (properties: common.IFeatureServiceProperties) => {
                  html += "<p>Feature Service Properties<br/>";

                  html +=
                    "<p><i>Service description</i><br/>" +
                    textAreaHtml(JSON.stringify(properties.service, null, 2)) +
                    "</p>";

                  html += "<p><i>Layers</i>";
                  properties.layers.forEach(
                    layer =>
                      (html += textAreaHtml(JSON.stringify(layer, null, 2)))
                  );
                  html += "</p>";

                  html += "<p><i>Tables</i>";
                  properties.tables.forEach(
                    layer =>
                      (html += textAreaHtml(JSON.stringify(layer, null, 2)))
                  );
                  html += "</p>";

                  html += "</p>";
                  resolve(html);
                },
                (error: any) => reject(JSON.stringify(error))
              );
          } else {
            resolve(html);
          }
        } else if (itemBase.type === "Form") {
          const formInfoFilenames = [
            "form.json",
            "forminfo.json",
            "form.webform"
          ];
          // tslint:disable-next-line: no-floating-promises
          Promise.all(
            common.getInfoFiles(itemId, formInfoFilenames, authentication)
          )
            .then(results => results.filter(result => !!result))
            .then(
              // (formFiles: Blob[3])  list of a Form's "form.json", "forminfo.json", & "form.webform" info files
              async formFiles => {
                formFiles = formFiles.filter(result => !!result);
                console.log("formFiles", formFiles);
                html += "<p>Form Files<br/>";
                if (formFiles.length === 0) {
                  html += "<p><i>none</i>";
                } else {
                  html += "<ol>";
                  // tslint:disable-next-line: prefer-for-of
                  for (let i: number = 0; i < formFiles.length; ++i) {
                    html += "<li><div>";
                    html += await showBlob(formFiles[i]);
                    html += "</div></li>";
                  }
                  html += "</ol>";
                }
                html += "</p>";
                resolve(html);
              }
            );
        } else {
          resolve(html);
        }
      },
      (error: any) => reject(JSON.stringify(error))
    );
  });
}

/**
 * Creates the HTML for a textarea using the supplied text.
 *
 * @param text Text to insert into textarea
 * @return textarea HTML
 */
function textAreaHtml(text: any): string {
  return (
    '<textarea rows="10" style="width:99%;font-size:x-small">' +
    text +
    "</textarea>"
  );
}

/**
 * Creates the HTML for a blob.
 *
 * @param blob Blob or File to display
 * @return Promise resolving to a string of HTML
 */
function showBlob(blob: Blob): Promise<string> {
  // tslint:disable-next-line: no-floating-promises
  return new Promise<string>(resolve => {
    if (!blob || blob.size === 0) {
      resolve("<i>none</i>");
      return;
    }
    const file = blob as File;
    const filename = file.name || "";

    // Make sure that a JSON file has the right MIME type; forms have a JSON file with an unsupported extension
    if (filename.endsWith(".json")) {
      blob = common.convertResourceToFile({
        blob: file,
        filename: filename,
        mimeType: "application/json"
      });
    }

    if (blob.type === "application/json") {
      common.blobToJson(blob).then(
        text =>
          resolve(
            textAreaHtml(JSON.stringify(text, null, 2)) + addFilename(filename)
          ),
        error => resolve("<i>problem extracting JSON: " + error + "</i>")
      );
    } else if (
      blob.type.startsWith("text/plain") ||
      blob.type === "text/xml" ||
      blob.type === "application/xml"
    ) {
      common.blobToText(blob).then(
        text => resolve(textAreaHtml(text) + addFilename(filename)),
        error => resolve("<i>problem extracting text: " + error + "</i>")
      );
    } else if (blob.type.startsWith("image/")) {
      let html =
        '<img src="' +
        window.URL.createObjectURL(blob) +
        '" style="max-width:256px;border:1px solid lightgray;"/>';
      if (filename) {
        html +=
          '&nbsp;&nbsp;&nbsp;&nbsp;<a href="' +
          window.URL.createObjectURL(file) +
          '" download="' +
          filename +
          '">' +
          filename +
          "</a>";
      }
      html += "</p>";
      resolve(html);
    } else {
      if (filename) {
        resolve(
          '<a href="' +
            window.URL.createObjectURL(file) +
            '" download="' +
            filename +
            '">' +
            filename +
            "</a>"
        );
      } else {
        resolve(
          '<a href="' +
            window.URL.createObjectURL(blob) +
            '">' +
            blob.type +
            "</a>"
        );
      }
    }
  });
}

function addFilename(filename: string): string {
  return filename ? "&nbsp;" + filename : "";
}
