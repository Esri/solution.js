/** @license
 * Copyright 2024 Esri
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
import { UserSession } from "@esri/solution-common";
import * as demoCommon from "./demoCommon";
import * as htmlUtil from "./htmlUtil";
import * as main from "./reuse-deployed-items-main";
import { textAreaHtmlFromJSON } from "./getFormattedItemInfo";

declare var findSolutionsFcn: any;
declare var findRelatedSolutionsFcn: any;

let authentication: UserSession;

//--------------------------------------------------------------------------------------------------------------------//

/**
 * Gets deployable solutions from the user defined group.
 */
function getSolutions() {
  authentication = null;
  document.getElementById("output").innerHTML = "";

  const portal = (htmlUtil.getHTMLValue("portal") || "https://www.arcgis.com") + "/sharing/rest";
  authentication = demoCommon.getRequestAuthentication(
    htmlUtil.getHTMLValue("username"), htmlUtil.getHTMLValue("password"), portal
  );

  const id = htmlUtil.getHTMLValue("groupId");

  main.getDeployableSolutions(authentication, id)
  .then(
    (response: any) => {
      if (response) {
        var list = demoCommon.addItem("sourceSolutionsDiv", "select", "solutionsList");
        list.classList.add("form-control");

        const solutions = response.results.map((r: any) => {
          return {id: r.id, title: r.title}
        });
        solutions.sort((a: any, b: any) => {
          const titleA = a.title.toUpperCase();
          const titleB = b.title.toUpperCase();
          return titleA < titleB ? -1 : titleA > titleB ? 1 : 0;
        });
        solutions.forEach((s: any) => {
          const item = document.createElement("option");
          item.innerHTML = s.title;
          item.value = s.id;
          list.appendChild(item);
        });

        const solutionSelection = document.getElementById("solutionSelection")
        solutionSelection.style.display = "flex";
      } else {
        document.getElementById("output").innerHTML = "No deployable Solution templates found";
      }
    },
    (error: any) => {
      document.getElementById("output").innerHTML =
        "<span style=\"color:red\">Unable to get Solution templates: " + JSON.stringify(error) + "</span>";
    }
  );
}

/**
 * Find deployed items and solutions that leverage one or more of the items in the user selected solution
 */
function findRelatedSolutions() {
  const id = (document.getElementById("solutionsList") as any)?.value;
  main.findReusableSolutionsAndItems(authentication, id).then(results => {
    const example = {
      "item-id-from-the-selected-solution": [
        {
          "created": "deployed-item-created-value",
          "id": "id-of-the-deployed-item",
          "solutions": {
            "solution-id-that-uses-the-deployed-item": {
              "created": "solution-created-value",
              "title": "solution-title"
            }
          },
          "title": "title-of-the-deployed-item",
          "type": "type-of-the-deployed-item"
        }
      ]
    }
    const html =
      '<label style="width:100%;display:inline-block;">Structure of response:</label>' +
      textAreaHtmlFromJSON(example, 16) +
      '<label style="width:100%;display:inline-block;">Potential items for reuse in your org:</label>' +
      '<div style="width:100%;display:inline-block;">' +
      textAreaHtmlFromJSON(results, 20) +
      '</div>';

    document.getElementById("output").innerHTML = html;
  });
}

findSolutionsFcn = getSolutions;
findRelatedSolutionsFcn = findRelatedSolutions;