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
// @esri/solution-common deleteSolution example

import * as common from "@esri/solution-common";
import * as portal from "@esri/arcgis-rest-portal";


export function getDeployedSolutions(
  authentication: common.UserSession
): Promise<portal.ISearchResult<portal.IItem>> {
  const query = new portal.SearchQueryBuilder()
  .match(authentication.username).in("owner").and()
  .match("Solution").in("type").and()
  .match("Deployed").in("typekeywords");
  return portal.searchItems({
    q: query,
    num: 100,
    authentication
  })
  .then((searchResponse: portal.ISearchResult<portal.IItem>) => {
    // Sort the results by title and then id
    searchResponse.results.sort(
      (e1, e2) => {
        if (e1.title !== e2.title) {
          return e1.title < e2.title ? -1 : 1;
        } else {
          return e1.id < e2.id ? -1 : 1;
        }
      }
    );
    return searchResponse;
  });
}

export function checkDeleteSolution(
  solutionItemId: string,
  authentication: common.UserSession
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!solutionItemId) {
      reject("The item ID is not defined");
      return;
    }

    // Get the list of solution's deletable (i.e., not shared elsewhere) items
    common.getDeletableSolutionInfo(solutionItemId.trim(), authentication).then(
      (solutionSummary: common.ISolutionPrecis) => {
        let response = "<div><p>The following items will be deleted:</p><table>";
        response += "<tr><th>Item Name</th><th>Type</th><th>Last Modified</th></tr>";
        solutionSummary.items.reverse(); // the reverse of the build order is more interesting
        solutionSummary.items.forEach(
          item => {
            response +=
              "<tr><td>" + item.title +
              "</td><td>" + item.type +
              "</td><td>" + (new Date(item.modified)).toDateString() +
              "</td></tr>";
          }
        );
        response += "</table></div>";
        resolve(response);
      },
      (error: any) => reject(error)
    );
  });
}

export function deleteSolution(
  solutionItemId: string,
  authentication: common.UserSession,
  progressCallback: common.ISolutionProgressCallback
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!solutionItemId) {
      reject("The item ID is not defined");
      return;
    }

    // Delete the solution
    const options: common.IDeleteSolutionOptions = {
      progressCallback: progressCallback,
      consoleProgress: true
    };
    common.deleteSolution(solutionItemId.trim(), authentication, options).then(
      (deleteResults: common.ISolutionPrecis[]) => {
        const [
          solutionDeletedSummary,
          solutionFailureSummary
        ] = deleteResults;

        if (!solutionFailureSummary) {
          resolve("<h5>Solution Could Not be Deleted</h5><p>An error occurred while deleting the Solution</p>");

        } else if (solutionFailureSummary.items.length === 0) {
          resolve("<h5>Solution Successfully Deleted</h5><p>The Solution Item and components were successfully deleted</p>");

        } else {
          let response = "<h5>Solution Partially Deleted</h5><p>Some of the Solution Item components have been deleted</p>";
          response += "<p>Items that could not be deleted:</p><table>";
          response += "<tr><th>Item Name</th><th>Type</th><th>Owner</th><th>Last Modified</th></tr>";
          solutionFailureSummary.items.forEach(
            item => {
              response +=
                "<tr><td>" + item.title +
                "</td><td>" + item.type +
                "</td><td>" + item.owner +
                "</td><td>" + (new Date(item.modified)).toDateString() +
                "</td></tr>";
            }
          );
          response += "</table></div>";
          resolve(response);
        }
      },
      (error: any) => reject(error)
    );
  });
}
