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
import * as auth from "@esri/arcgis-rest-auth";
import * as main from "./getFormattedItemInfo";

declare var goFcn: any;

//--------------------------------------------------------------------------------------------------------------------//

/**
 * Runs the item fetch and formatting.
 */
function go () {
  document.getElementById("input").style.display = "none";
  document.getElementById("output").style.display = "block";

  main.getFormattedItemInfo(
    (document.getElementById("id") as HTMLInputElement).value.trim(),
    new auth.UserSession({
      username: (document.getElementById("username") as HTMLInputElement).value,
      password: (document.getElementById("password") as HTMLInputElement).value,
      portal: (document.getElementById("srcPortal") as HTMLInputElement).value + "/sharing/rest"
    })
  ).then(
    html => {
      document.getElementById("output").innerHTML = html;
    },
    error => {
      document.getElementById("output").innerHTML = "<span style=\"color:red\">" + error + "</span>";
    }
  );
}

//--------------------------------------------------------------------------------------------------------------------//

goFcn = go;

(document.getElementById("srcPortal") as HTMLInputElement).value = "https://www.arcgis.com";
document.getElementById("input").style.display = "block";
