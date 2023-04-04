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
import * as htmlSanitizer from "@esri/arcgis-html-sanitizer";
import * as main from "./copy-solutions-main";
import * as portal from "@esri/arcgis-rest-portal";

declare var connectToSourceFcn: any;
declare var connectToDestinationFcn: any;

//--------------------------------------------------------------------------------------------------------------------//

/**
 * Gets templates from an organization and shows them as a checklist in the div "sourceSolutionsDiv".
 */
function getSourceTemplates () {
  demoCommon.removeItem("sourceSolutionsListDiv");
  demoCommon.fadeItemOut("copiedSolutionsDiv");
  demoCommon.removeItem("copiedSolutionsListDiv");
  demoCommon.fadeItemIn("sourceSolutionsDiv");
  demoCommon.addBusySymbol("sourceSolutionsDiv");
  haveSourceTemplates = false;
  updateCopyBtn();

  const srcPortal = ((document.getElementById("srcPortal") as HTMLInputElement).value || "https://www.arcgis.com") + "/sharing/rest";
  sourceAuthentication = demoCommon.getRequestAuthentication(
    (document.getElementById("srcUsername") as HTMLInputElement).value,
    (document.getElementById("srcPassword") as HTMLInputElement).value,
    srcPortal
  );


  main.getTemplates(sourceAuthentication, !(document.getElementById("srcOnlyMySolns") as HTMLInputElement).checked)
  .then(
    searchResponse => {
      demoCommon.removeItem("sourceSolutionsDiv_busySymbol");
      var listDiv = demoCommon.addItem ("sourceSolutionsDiv", "DIV", "sourceSolutionsListDiv");
      listDiv.innerHTML = demoCommon.createChecklist(
        searchResponse.results,
        sanitizer.sanitize((document.getElementById("srcPortal") as HTMLInputElement).value) || "https://www.arcgis.com",
        "sourceSolutionsList",
        true
      );
      var copyBtn = demoCommon.addItem("sourceSolutionsListDiv", "BUTTON", "copyBtn", "copyBtn");
      copyBtn.innerHTML = "Copy Solution(s)";
      copyBtn.addEventListener("click", copyTemplates);
      haveSourceTemplates = true;
      updateCopyBtn();
    },
    error => {
      demoCommon.removeItem("sourceSolutionsDiv_busySymbol");
      var listDiv = demoCommon.addItem ("sourceSolutionsDiv", "DIV", "sourceSolutionsListDiv");
      listDiv.innerHTML = "Unable to get Solution templates: " + error;
    }
  );
}

/**
 * Gets templates from an organization and shows them as a list in the div "destinationSolutionsDiv".
 */
 function getDestinationTemplates () {
  demoCommon.removeItem("destinationSolutionsListDiv");
  demoCommon.fadeItemOut("copiedSolutionsDiv");
  demoCommon.removeItem("copiedSolutionsListDiv");
  demoCommon.addBusySymbol("destinationSolutionsDiv");
  demoCommon.fadeItemIn("destinationSolutionsDiv");
  haveDestinationAccess = false;
  updateCopyBtn();

  const destPortal = ((document.getElementById("destPortal") as HTMLInputElement).value || "https://www.arcgis.com") + "/sharing/rest";
  destinationAuthentication = demoCommon.getRequestAuthentication(
    (document.getElementById("destUsername") as HTMLInputElement).value,
    (document.getElementById("destPassword") as HTMLInputElement).value,
    destPortal
  );

  main.getTemplates(destinationAuthentication, !(document.getElementById("destOnlyMySolns") as HTMLInputElement).checked)
  .then(
    searchResponse => {
      demoCommon.removeItem("destinationSolutionsDiv_busySymbol");
      var listDiv = demoCommon.addItem ("destinationSolutionsDiv", "DIV", "destinationSolutionsListDiv");
      if (searchResponse.total === 0) {
        listDiv.innerHTML = "<i>No Solution templates found</i>";
      } else {
        listDiv.innerHTML = demoCommon.createSimpleList(
          searchResponse.results,
          sanitizer.sanitize((document.getElementById("destPortal") as HTMLInputElement).value) || "https://www.arcgis.com"
        );
      }
      haveDestinationAccess = true;
      updateCopyBtn();
    },
    error => {
      demoCommon.removeItem("destinationSolutionsDiv_busySymbol");
      var listDiv = demoCommon.addItem ("destinationSolutionsDiv", "DIV", "destinationSolutionsListDiv");
      listDiv.innerHTML = "Unable to get Solution templates: " + error;
    }
  );
}

/**
 * Copies checked templates in list in the div "sourceSolutionsList" to the destination organization.
 */
function copyTemplates () {
  demoCommon.removeItem("copiedSolutionsListDiv");
  var sourceSolutionsList = document.getElementById("sourceSolutionsList");
  var numSolutionsToCheck = sourceSolutionsList.children.length;
  var solutionsToCopy = [];
  for (var i = 0; i < numSolutionsToCheck; i++) {
    var inputItem = sourceSolutionsList.children[i].children[0] as HTMLInputElement;
    var inputItemSibling = inputItem.nextElementSibling as HTMLInputElement;
    if (inputItem.checked) {
       if (inputItem.value !== "custom") {
         solutionsToCopy.push(inputItem.value);
       } else if (inputItemSibling?.value
         && inputItemSibling.value.length === 32) {
         solutionsToCopy.push(inputItemSibling.value);
       }
    }
  }

  var listDiv = demoCommon.addItem ("copiedSolutionsDiv", "DIV", "copiedSolutionsListDiv");
  demoCommon.fadeItemIn("copiedSolutionsDiv");
  if (solutionsToCopy.length > 0) {
    listDiv.innerHTML = "Copying...";

    var solutionCopyPromises = solutionsToCopy.map(
      solutionId => main.copyItemInfo(solutionId, sourceAuthentication, destinationAuthentication)
    );
    Promise.all(solutionCopyPromises)
    .then(
      responses => {
        listDiv.innerHTML = responses.join("<br>");
        if (responses.filter(response => !JSON.parse(response).success).length === 0) {
          getDestinationTemplates();
        }
      },
      error => {
        listDiv.innerHTML = "Unable to copy Solution templates: " + error;
      }
    );
  } else {
    listDiv.innerHTML = "<i>Nothing to copy</i>";
  }
}

/**
 * Updates the visibility of copy button based on presence of templates in source organization and
 * access to destination organization.
 */
function updateCopyBtn () {
  var btnItem = document.getElementById("copyBtn");
  if (btnItem) {
    btnItem.style.display = haveSourceTemplates && haveDestinationAccess ? "block" : "none";
  }
}

//--------------------------------------------------------------------------------------------------------------------//

connectToSourceFcn = getSourceTemplates;
connectToDestinationFcn = getDestinationTemplates;

demoCommon.removeItem("page_busySymbol");
connectToSourceFcn = getSourceTemplates;
connectToDestinationFcn = getDestinationTemplates;
demoCommon.fadeItemIn("credentialsDiv");

var haveSourceTemplates = false;
var haveDestinationAccess = false;

var sourceAuthentication: common.UserSession;
var sourcePortal = null;
var destinationAuthentication: common.UserSession;
var destinationPortal = null;

var sanitizer = new htmlSanitizer.Sanitizer();
