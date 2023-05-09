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
import * as demoCommon from "./demoCommon";
import * as htmlUtil from "./htmlUtil";
import * as main from "./delete-solution-main";

declare var confirmDeletionFcn: any;
declare var connectFcn: any;
declare var continueFcn: any;
declare var launchDeleteSolutionsFcn: any;
declare var toggleSelectAllFcn: any;
declare var updateSolutionSelectionFcn: any;

//--------------------------------------------------------------------------------------------------------------------//

/**
 * Gets deployed Solutions from an organization and shows them as a checklist in the div "sourceSolutionsDiv".
 */
function getDeployedSolutions() {
  demoCommon.removeItem("sourceSolutionsListDiv");
  authentication = null;
  haveSolutions = false;
  numSelected = 0;
  selectAllToggle = true;
  document.getElementById("toggleBtn").innerHTML = "Select all";
  document.getElementById("output").innerHTML = "";

  const portal = (htmlUtil.getHTMLValue("portal") || "https://www.arcgis.com") + "/sharing/rest";
  authentication = demoCommon.getRequestAuthentication(
    htmlUtil.getHTMLValue("username"), htmlUtil.getHTMLValue("password"), portal
  );

  main.getDeployedSolutions(authentication)
  .then(
    searchResponse => {
      if (searchResponse.results.length > 0) {
        var listDiv = demoCommon.addItem("sourceSolutionsDiv", "DIV", "sourceSolutionsListDiv");
        listDiv.innerHTML = demoCommon.createChecklist(
          searchResponse.results,
          htmlUtil.getHTMLValue("portal")  || "https://www.arcgis.com",
          "sourceSolutionsList",
          false,
          "updateSolutionSelectionFcn(this)"
        );
        updateDeleteBtn();
        document.getElementById("toggleBtn").style.display = "inline-block";
        document.getElementById("solutionSelection").style.display = "block";
      } else {
        document.getElementById("output").innerHTML = "No deployed Solution templates found";
      }
    },
    error => {
      document.getElementById("output").innerHTML =
        "<span style=\"color:red\">Unable to get Solution templates: " + JSON.stringify(error) + "</span>";
    }
  );
}

/**
 * Toggles selection of all solutions or no solutions .
 */
function toggleSelectAll() {
  const sourceSolutionsList = document.getElementById("sourceSolutionsList");
  for(let i = 0; i < sourceSolutionsList.children.length; i++) {
    (sourceSolutionsList.children[i].children[0] as HTMLInputElement).checked = selectAllToggle;
  }

  selectAllToggle = !selectAllToggle;
  document.getElementById("toggleBtn").innerHTML = selectAllToggle ? "Select all" : "Select none";
  numSelected = selectAllToggle ? 0 : sourceSolutionsList.children.length;
  updateDeleteBtn();
}

/**
 * Launches the deletion of a list of solutions.
 *
 * @param checkBeforeEachDelete Switch indicating if a display of what's about to be deleted appears
 * before each solution is deleted, which provides an opportunity to cancel deleting that solution
 */
function launchDeleteSolutions(checkBeforeEachDelete: boolean) {
  document.getElementById("toggleBtn").style.display = "none";
  document.getElementById("deleteInteractiveBtn").style.display = "none";
  document.getElementById("deleteBlastBtn").style.display = "none";

  // Get list of solutions to delete
  const solutionsToDelete = [];
  const sourceSolutionsList = document.getElementById("sourceSolutionsList");
  for(let i = 0; i < sourceSolutionsList.children.length; i++) {
    if ((sourceSolutionsList.children[i].children[0] as HTMLInputElement).checked) {
      solutionsToDelete.push((sourceSolutionsList.children[i].children[0] as HTMLInputElement).value);
    }
  }

  if (!checkBeforeEachDelete) {
    alert("Warning: every checked Solution will be deleted! Refresh page to cancel.");
  }

  // Run the deletes
  deleteListOfSolutions(solutionsToDelete, checkBeforeEachDelete);
}

/**
 * Recursively delete a list of deployed solutions, double-checking each before doing the delete.
 *
 * @param solutionsToDelete List of solution ids
 * @param checkBeforeEachDelete Switch indicating if a display of what's about to be deleted appears
 * before each solution is deleted, which provides an opportunity to cancel deleting that solution
 */
function deleteListOfSolutions(solutionsToDelete: string[], checkBeforeEachDelete: boolean) {
  console.log(solutionsToDelete);
  document.getElementById("checkOutput").innerHTML = "";
  document.getElementById("continue").style.display = "none";
  if (solutionsToDelete.length > 0) {
    const solutionId = solutionsToDelete.shift();

    if (!checkBeforeEachDelete) {
      deleteSolution(solutionId)
      .then(() => {
        // Continue with list of solutions
        deleteListOfSolutions(solutionsToDelete, checkBeforeEachDelete);
      });
    } else {

      (new Promise((resolve) => {
        confirmDeletionFcn = (okToDelete: boolean) => resolve(okToDelete);
        doublecheck(solutionId);
      })).then(okToDelete => {
        let deletePromise = Promise.resolve();
        if (okToDelete) {
          deletePromise = deleteSolution(solutionId);
        } else {
          document.getElementById("doublecheck").style.display = "none";
          document.getElementById("output").innerHTML += "<br>Solution " + solutionId + " is unchanged";
        }
        deletePromise.then(() => {
          (new Promise((resolve) => {
            continueFcn = () => resolve(null);
            document.getElementById("continue").style.display = "block";
          })).then(() => {
            document.getElementById("output").innerHTML = "";

            // Continue with list of solutions
            deleteListOfSolutions(solutionsToDelete, checkBeforeEachDelete);
          });
        });
      });
    }
  } else {
    getDeployedSolutions();
  }
}

/**
 * Displays the items that are going to be deleted in a solution to provide the user the opportunity
 * cancel the deletion.
 *
 * @param solutionId Id of solution to delete
 */
function doublecheck(solutionId: string) {
  main.checkDeleteSolution(solutionId, authentication).then(
    html => {
      document.getElementById("checkOutput").innerHTML = html;
      document.getElementById("doublecheck").style.display = "block";
      document.getElementById("output").innerHTML = "";
      document.getElementById("toggleBtn").style.display = "none";
    },
    error => {
      var message = solutionId + "<br>" + (error?.error || error?.message || "Unspecified error");
      if (error.itemIds) {
        message += "<ul>";
        error.itemIds.forEach(
          (itemId: string) => {
            message += "<li>" + itemId + "</li>";
          }
        );
        message += "</ul>";
      }
      document.getElementById("output").innerHTML = "<span style=\"color:red\">" + message + "</span>";
      confirmDeletionFcn(false);
    }
  );
}

/**
 * Deletes a deployed solution.
 *
 * @param solutionId Id of solution to delete
 */
function deleteSolution(solutionId: string) {
  document.getElementById("doublecheck").style.display = "none";
  var startTime = Date.now();

  return main.deleteSolution(
    solutionId,
    authentication,
    percentDone => {
      document.getElementById("output").innerHTML = "Deleting " + solutionId + "..." + percentDone.toFixed().toString() + "%";
    }
  ).then(
    html => {
      reportElapsedTime(startTime);
      document.getElementById("output").innerHTML = html;
    },
    error => {
      var message = error?.error || error?.message
        || "Unspecified error";
      if (error.itemIds) {
        message += "<ul>";
        error.itemIds.forEach(
          (itemId: string) => {
            message += "<li>" + itemId + "</li>";
          }
        );
        message += "</ul>";
      }
      reportElapsedTime(startTime);
      document.getElementById("output").innerHTML = "<span style=\"color:red\">" + message + "</span>";
    }
  );
}

/**
 * Reports the seconds between a supplied start time and the current time.
 *
 * @param startTime Start time in the Date.now() format
 */
function reportElapsedTime(startTime: number) {
  var endTime = Date.now();
  console.log("Elapsed time: " + ((endTime - startTime) / 1000).toFixed(1) + " seconds");
}

/**
 * Updates the visibility of copy button based on presence of templates in source organization.
 */
function updateDeleteBtn() {
  var deleteInteractiveBtn = document.getElementById("deleteInteractiveBtn");
  var deleteBlastBtn = document.getElementById("deleteBlastBtn");
  if (numSelected > 0) {
    document.getElementById("deleteInteractiveBtn").style.display = "inline-block";
    document.getElementById("deleteBlastBtn").style.display = "inline-block";
  } else {
    document.getElementById("deleteInteractiveBtn").style.display = "none";
    document.getElementById("deleteBlastBtn").style.display = "none";
  }
}

/**
 * Updates the count of currently-selected solutions based on the onChange event on a checklist item.
 *
 * @param element Checklist item that has changed its "checked" state
 */
function updateSolutionSelection(element: HTMLInputElement) {
  numSelected += element.checked ? 1 : -1;
  updateDeleteBtn();
}

//--------------------------------------------------------------------------------------------------------------------//

let haveSolutions = false;
let authentication: common.UserSession;
let selectAllToggle = true;
let numSelected = 0;

connectFcn = getDeployedSolutions;
launchDeleteSolutionsFcn = launchDeleteSolutions;
toggleSelectAllFcn = toggleSelectAll;
updateSolutionSelectionFcn = updateSolutionSelection;

document.getElementById("input").style.display = "block";
