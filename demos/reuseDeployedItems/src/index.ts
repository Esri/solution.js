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
import * as common from "@esri/solution-common";
import * as demoCommon from "./demoCommon";
import * as htmlUtil from "./htmlUtil";
import * as main from "./reuse-deployed-items-main";


declare var findSolutionsFcn: any;
declare var continueFcn: any;
declare var findRelatedSolutionsFcn: any;

declare var toggleSelectAllFcn: any;
declare var updateSolutionSelectionFcn: any;

let authentication: common.UserSession;

//--------------------------------------------------------------------------------------------------------------------//

function getSolutions() {
  //demoCommon.removeItem("sourceSolutionsListDiv");
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
        console.log(response)
        var list = demoCommon.addItem("sourceSolutionsDiv", "select", "solutionsList");
        //list.innerHTML = response.results.map((r: any) => r.title);

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

        //document.getElementById("toggleBtn").style.display = "inline-block";
        document.getElementById("solutionSelection").style.display = "block";
      } else {
        document.getElementById("output").innerHTML = "No deployed Solution templates found";
      }
    },
    (error: any) => {
      document.getElementById("output").innerHTML =
        "<span style=\"color:red\">Unable to get Solution templates: " + JSON.stringify(error) + "</span>";
    }
  );
}


function findRelatedSolutions() {
  const id = (document.getElementById("solutionsList") as any)?.value;
  console.log(id);
  main.findReusableSolutionsAndItems(authentication, id).then(s => {
    console.log("s");
    console.log(s);
  });
  // common.getIdsFromSolutionTemplates(id, authentication).then(results => {
  //   console.log(results);
  // });
}

/**
 * Gets deployed Solutions from an organization and shows them as a checklist in the div "sourceSolutionsDiv".
 */
function getDeployedSolutions() {
  demoCommon.removeItem("sourceSolutionsListDiv");
  authentication = null;
  document.getElementById("output").innerHTML = "";

  const portal = (htmlUtil.getHTMLValue("portal") || "https://www.arcgis.com") + "/sharing/rest";
  authentication = demoCommon.getRequestAuthentication(
    htmlUtil.getHTMLValue("username"), htmlUtil.getHTMLValue("password"), portal
  );

  const id = htmlUtil.getHTMLValue("solutionId");

  main.getDeployedSolutionsAndItems(authentication, id)
  .then(
    (response: any) => {
      if (response) {
        var listDiv = demoCommon.addItem("sourceSolutionsDiv", "DIV", "sourceSolutionsListDiv");
        listDiv.innerHTML = response;

        //document.getElementById("toggleBtn").style.display = "inline-block";
        document.getElementById("solutionSelection").style.display = "block";
      } else {
        document.getElementById("output").innerHTML = "No deployed Solution templates found";
      }
    },
    (error: any) => {
      document.getElementById("output").innerHTML =
        "<span style=\"color:red\">Unable to get Solution templates: " + JSON.stringify(error) + "</span>";
    }
  );
}

findSolutionsFcn = getSolutions;
continueFcn = getDeployedSolutions;
findRelatedSolutionsFcn = findRelatedSolutions;