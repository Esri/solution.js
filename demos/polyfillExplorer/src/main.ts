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
// @esri/solution-common convertExtent example

import * as common from "@esri/solution-common";

export function runLegacies(): Promise<string> {
  return new Promise<string>(resolve => {
    let html =
      "appVersion: " +
      navigator.appVersion +
      "<br><br>" +
      "userAgent: " +
      navigator.userAgent +
      "<br><br>" +
      "msSaveBlob: " +
      typeof navigator.msSaveBlob +
      "<br><br>";

    html += test_new_File(["foo"], "filename.txt", { type: "text/plain" });

    resolve(html);
  });
}

function test_new_File(
  fileBits: BlobPart[],
  fileName: string,
  options?: FilePropertyBag
): string {
  const file = common.new_File(fileBits, fileName, options);
  if (file) {
    return "Created file";
  } else {
    return "<span style=\"color:red\">Failed to create file</span><br>";
  }
}

// ================================================================================================================== //
