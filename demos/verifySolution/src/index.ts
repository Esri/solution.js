/** @license
 * Copyright 2023 Esri
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

import "./style.css";
import * as common from "@esri/solution-common";
import * as htmlUtil from "./htmlUtil";
import * as viewer from "@esri/solution-viewer";

declare var goFcn: any;

//--------------------------------------------------------------------------------------------------------------------//

/**
 * Loads the second window with a sanitized version of the first window.
 */
function load () {
  var json1 = htmlUtil.getHTMLValue("json1");
   (document.getElementById("json2") as HTMLInputElement).value = !json1
     ? "" // json1 is empty, so just set json2 to empty
     : JSON.stringify( // load json2 with the sanitized version of json1
       common.sanitizeJSON(
         JSON.parse(htmlUtil.getHTMLValue("json1"))
       ), null, 2
    );
}

/**
 * Runs the verification.
 */
function go () {
  document.getElementById("output").style.display = "block";
  const itemId = htmlUtil.getHTMLValue("id");
  if (!itemId) {
    document.getElementById("output").innerHTML = "<span style=\"color:red\">Item's ID is not defined</span>";
    return;
  }
  document.getElementById("output").innerHTML = "Fetching...";
  document.getElementById("input").style.display = "none";

  viewer.checkSolution(
    itemId,
    new common.UserSession({
      username: htmlUtil.getHTMLValue("username"),
      password: htmlUtil.getHTMLValue("password"),
      portal: htmlUtil.getHTMLValue("srcPortal") + "/sharing/rest"
    })
  ).then(
    html => {
      var displayHtml = "Solution " + itemId + " checks:<br><br><ol><li>";
      displayHtml += html.join("</li><li>");
      displayHtml += "</li></ol>";
      document.getElementById("output").innerHTML = displayHtml;
    }
  );
}

//--------------------------------------------------------------------------------------------------------------------//

goFcn = go;

(document.getElementById("srcPortal") as HTMLInputElement).value = "https://www.arcgis.com";

document.getElementById("input").style.display = "block";
