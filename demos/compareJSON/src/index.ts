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
import * as main from "./compare-json-main";

declare var goFcn: any;
declare var loadFcn: any;

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
 * Runs the JSON comparison.
 */
function go () {
  document.getElementById("input").style.display = "none";
  document.getElementById("output").style.display = "block";

  var json1 = htmlUtil.getHTMLValue("json1");
  var json2 = htmlUtil.getHTMLValue("json2");
  json1 = json1 ? JSON.parse(json1) : null;
  json2 = json2 ? JSON.parse(json2) : null;

  document.getElementById("output").innerHTML = main.compareJSON(json1, json2);
}

//--------------------------------------------------------------------------------------------------------------------//

goFcn = go;
loadFcn = load;

document.getElementById("input").style.display = "block";
