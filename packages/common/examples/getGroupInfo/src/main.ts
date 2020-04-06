/** @license
 * Copyright 2020 Esri
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
// @esri/solution-common getGroupInfo example

import * as common from "../lib/common.umd";

export function getGroupInfo(
  groupId: string,
  authentication: common.UserSession
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!groupId) {
      reject("Group's ID is not defined");
      return;
    }

    // Get the group information
    const groupBaseDef = common.getGroupBase(groupId, authentication);
    const groupCategorySchemaDef = common.getGroupCategorySchema(
      groupId,
      authentication
    );

    Promise.all([
      groupBaseDef,
      groupDataDef,
      groupThumbnailDef,
      groupCategorySchemaDef
    ]).then(
      async responses => {
        const [
          groupBase,
          groupData,
          groupThumbnail,
          groupCategorySchema
        ] = responses;
        // Summarize what we have
        // ----------------------
        // (groupBase: common.IGroup)  text/plain JSON
        // (groupData: string[])  group contents
        // (groupThumbnail: Blob)  image/*
        // (groupCategorySchema: common.IGroupCategorySchema)
        console.log("groupBase", groupBase);
        console.log("groupData", JSON.stringify(groupData));
        console.log("groupThumbnail", groupThumbnail);
        console.log("groupCategorySchema", JSON.stringify(groupCategorySchema));

        const portalUrl = common.getPortalUrlFromAuth(authentication);

        // Show group and data sections
        let html =
          "<h3>" +
          '"' +
          groupBase.title +
          '" (<a href="' +
          portalUrl +
          "/home/group.html?id=" +
          groupBase.id +
          '" target="_blank">' +
          groupBase.id +
          "</a>)</h3>";

        html +=
          '<div style="width:48%;display:inline-block;">Group</div>' +
          '<div style="width:2%;display:inline-block;"></div>' +
          '<div style="width:48%;display:inline-block;">Contents</div>' +
          '<div style="width:48%;display:inline-block;">' +
          textAreaHtml(JSON.stringify(groupBase, null, 2)) +
          '</div><div style="width:2%;display:inline-block;"></div>' +
          '<div style="width:48%;display:inline-block;">' +
          textAreaHtml(JSON.stringify(groupData, null, 2)) +
          "</div>";

        // Show thumbnail section
        html += "<p>Thumbnail<br/><div>";
        html += await showBlob(groupThumbnail);
        html += "</div></p>";

        // Show category schema section
        html += "<p>Category Schema<br/><div>";
        if (groupCategorySchema.categorySchema.length === 0) {
          html += "<p><i>none</i>";
        } else {
          html += textAreaHtml(
            JSON.stringify(groupCategorySchema.categorySchema, null, 2)
          );
        }
        html += "</div></p>";

        resolve(html);
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
