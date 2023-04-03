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
import * as main from "./compare-json-main";

declare var goFcn: any;
declare var loadFcn: any;

//--------------------------------------------------------------------------------------------------------------------//

/**
 * Loads the second window with a sanitized version of the first window.
 */
function load () {
  var json1 = (document.getElementById("json1") as HTMLInputElement).value;
  (document.getElementById("json2") as HTMLInputElement).value = !json1 ? "" :
    JSON.stringify(
      common.sanitizeJSON(
        JSON.parse((document.getElementById("json1") as HTMLInputElement).value)
      ), null, 2
    );
}

/**
 * Runs the JSON comparison.
 */
function go () {
  document.getElementById("input").style.display = "none";
  document.getElementById("output").style.display = "block";

  var json1 = (document.getElementById("json1") as HTMLInputElement).value;
  var json2 = (document.getElementById("json2") as HTMLInputElement).value;
  json1 = json1 ? JSON.parse(json1) : null;
  json2 = json2 ? JSON.parse(json2) : null;

  document.getElementById("output").innerHTML = main.compareJSON(json1, json2);
}

//--------------------------------------------------------------------------------------------------------------------//

goFcn = go;
loadFcn = load;

document.getElementById("input").style.display = "block";
