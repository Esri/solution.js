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
import * as appConfig from "../data/appConfig.json";
import * as common from "@esri/solution-common";
import * as htmlUtil from "./htmlUtil";
import * as main from "./deploy-solution-main";

declare var fetchFoldersFcn: any;
declare var goFcn: any;
declare var updateDestAuthFcn: any;

//--------------------------------------------------------------------------------------------------------------------//

function fetchFolders(
): void {
  // Source credentials
  const srcPortal = (htmlUtil.getHTMLValue("srcPortal") || "https://www.arcgis.com") + "/sharing/rest";
  const srcCreds = new common.UserSession({
    username: htmlUtil.getHTMLValue("srcUsername"),
    password: htmlUtil.getHTMLValue("srcPassword"),
    portal: srcPortal
  });

  // Populate folders picklist
  const foldersSelect = document.getElementById("foldersPicklist") as HTMLSelectElement;
  const numOptions = foldersSelect.options.length - 1;
  for(let i = numOptions; i >= 0; i--) {
    foldersSelect.remove(i);
  }
  foldersSelect.add(document.createElement("option"));

  main.getFolders(srcCreds)
  .then(folders => {
    folders.forEach((folder) => {
      var option = document.createElement("option");
      option.value = folder.id;
      option.text = folder.title + " ( " + folder.id + " )";
      foldersSelect.add(option);
    });
  });
}

// Deploy!
function deploySolution(
  solutionId: string,
  folderId: string,
  srcCreds: common.UserSession,
  destCreds: common.UserSession,
  useExisting: boolean,
  customParams: any
): void {
  const startTime = Date.now();
  const createdItems = [] as any[];

  let deployPromise = Promise.resolve("<i>No Solution(s) provided</i>");
  const progressFcn =
    function (percentDone, jobId, progressEvent) {
      if (progressEvent) {
        createdItems.push(progressEvent.data);
      }
      let html = "Deploying " + jobId + "..." + percentDone.toFixed().toString() + "%" + "<br><br>Finished items:<ol>";
      createdItems.forEach(function (item) { return html += "<li>" + item + "</li>" });
      html += "</ol>";
      document.getElementById("output").innerHTML = html;
    } as common.ISolutionProgressCallback;
  if (solutionId.length > 0) {
    deployPromise = main.deployAndDisplaySolution(
      solutionId,
      srcCreds,
      destCreds,
      progressFcn,
      useExisting,
      customParams
    );
  } else if (folderId.length > 0) {
    deployPromise = main.deploySolutionsInFolder(
      folderId,
      srcCreds,
      destCreds,
      progressFcn,
      useExisting,
      customParams
    );
  }

  deployPromise.then(function (html){
      reportElapsedTime(startTime);
      document.getElementById("output").innerHTML = html;
    },
    function (error) {
      const message = error?.error || JSON.stringify(error) || "Unspecified error";
      reportElapsedTime(startTime);
      document.getElementById("output").innerHTML = "<span style=\"color:red\">" + message + "</span>";
    }
  );
}

/**
 * Runs the solution deployment.
 */
function go(
): void {
  document.getElementById("input").style.display = "none";
  document.getElementById("output").style.display = "block";

  // use the manually entered value, falling back to the select lists
  const solutionId =
    htmlUtil.getHTMLValue("solutionId") ||
    htmlUtil.getHTMLValue("solutionPicklist");
  const folderId = htmlUtil.getHTMLValue("foldersPicklist");

  // Use Existing
  const useExisting = htmlUtil.getHTMLChecked("useExistingChk");

  // Custom Params
  const customParams = htmlUtil.getHTMLValue("customParams");

  // Source credentials
  const srcPortal = (htmlUtil.getHTMLValue("srcPortal") || "https://www.arcgis.com") + "/sharing/rest";
  const srcCreds = new common.UserSession({
    username: htmlUtil.getHTMLValue("srcUsername"),
    password: htmlUtil.getHTMLValue("srcPassword"),
    portal: srcPortal
  });

  // Dest credentials
  const destPortal = (htmlUtil.getHTMLValue("destPortal") || "https://www.arcgis.com") + "/sharing/rest";
  let destCreds;
  if (!htmlUtil.getHTMLChecked("destAuthType")) {
    destCreds = new common.UserSession({
      username: htmlUtil.getHTMLValue("destUsername"),
      password: htmlUtil.getHTMLValue("destPassword"),
      portal: destPortal,
      clientId: htmlUtil.getHTMLValue("clientId")
    });
    deploySolution(solutionId, folderId, srcCreds, destCreds, useExisting, customParams);
  } else {
    const redirect_uri = window.location.origin + window.location.pathname;
    const clientId = htmlUtil.getHTMLValue("clientId");
    common.UserSession.beginOAuth2({
      clientId: clientId,
      redirectUri: redirect_uri + 'authenticate.html?clientID=' + clientId,
      popup: true,
    }).then(function (newSession) {
      // Upon a successful login, update the session with the new session.
      session = newSession;
      updateSessionInfo(session);
      deploySolution(solutionId, folderId, srcCreds, session, useExisting, customParams);
    }).catch(function (error) {
      console.log(error);
    });
  }
}

function updateDestAuth(
  checkbox: HTMLInputElement
): void {
  var destCredentials = document.getElementById("destCredentials");
  var clientIdParent = document.getElementById("clientIdParent");

  if (checkbox.checked) {
    clientIdParent.classList.remove("display-none");
    destCredentials.classList.add("display-none");
  } else {
    clientIdParent.classList.add("display-none");
    destCredentials.classList.remove("display-none");
  }
}

// Function to update the UI with session info.
function updateSessionInfo(
  session: common.UserSession
): void {
  if (session) {
    localStorage.setItem('__SOLUTION_JS_USER_SESSION__', session.serialize());
  }
}

/**
 * Reports an elapsed time to the console log.
 *
 * @param startTime `Date` to use as a start time
 */
function reportElapsedTime(
  startTime: number
): void {
  var endTime = Date.now();
  console.log("Elapsed time: " + ((endTime - startTime) / 1000).toFixed(1) + " seconds");
}

//--------------------------------------------------------------------------------------------------------------------//

fetchFoldersFcn = fetchFolders;
goFcn = go;
updateDestAuthFcn = updateDestAuth;

// Populate solution picklist
const solutionsSelect = document.getElementById("solutionPicklist") as HTMLSelectElement;
solutionsSelect.add(document.createElement("option"));

main.getTemplates(
  appConfig.primarySolutionsGroupId, appConfig.agoBasedEnterpriseSolutionsGroupId
).then((solutions) => {
  solutions.forEach((solution) => {
    var option = document.createElement("option");
    option.value = solution.id
    option.text = solution.title + " ( " + solution.id + " )";
    solutionsSelect.add(option);
  });
});

// Define a global session variable.
let session: common.UserSession = null;

// Check to see if there is a serialized session in local storage.
const serializedSession = localStorage.getItem('__SOLUTION_JS_USER_SESSION__');
if (serializedSession !== null && serializedSession !== "undefined") {
  // If there is a serialized session, parse it and create a new session object.
  let parsed = JSON.parse(serializedSession);
  // Cast the tokenExpires property back into a date.
  parsed.tokenExpires = new Date(parsed.tokenExpires);
  // Create the new session object.
  session = new common.UserSession(parsed);

  // Clear the previous session.
  localStorage.removeItem('__SOLUTION_JS_USER_SESSION__');
}

// Call the function on page load to set current state.
updateSessionInfo(session);

document.getElementById("container").style.display = "block";
