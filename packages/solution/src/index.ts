/* @license
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

/**
 * Manages the highest-level of Solution creation and deployment.
 *
 * @module Solution
 */

import * as auth from "@esri/arcgis-rest-auth";
import * as portal from "@esri/arcgis-rest-portal";
import * as generalHelpers from "./generalHelpers";
import * as restHelpers from "./restHelpers";

export interface IPortalSubset {
  name: string;
  id: string;
  restUrl: string;
  portalUrl: string;
  urlKey: string;
}

export function createSolution(
  groupId: string,
  destUrl: string,
  userSession: auth.UserSession
): Promise<string> {
  return new Promise<string>((resolve, reject) => {

    // Fetch group item info

    // Create an internal representation of the new solution item using group item info

    // Fetch group contents

    // For each group content item,
    //   * fetch item & data infos
    //   * create item & data JSONs
    //   * extract dependency ids & add them into list of group contents
    //   * templatize select components in item & data JSONs (e.g., extents)
    //   * add JSONs into items list in solution item representation

    // Create solution item using internal representation & and the data JSON

    resolve("createSolution");
  });
}

export function deploySolution(
  itemInfo: any,
  portalSubset: IPortalSubset,
  userSession: auth.UserSession,
  progressCallback: (percentDone: number) => void
): Promise<string> {
  return new Promise<string>((resolve, reject) => {

    /*
    itemInfo: 
      { id : String
      , title : String
      , snippet : String
      , description : String
      , itemUrl : String
      , thumbnailUrl : String
      , tryitUrl : String
      , tags : List String
      , categories : List String
      , deployCommonId : String
      , deployVersion : Float
      , deployPercentage : Int
      }

    portalSubset:
      {
        fullName: string;
        username: string;
        thumbnailUrl: string;
        privileges: string[];
      }

    userSession:
      {
        clientId: this.clientId,
        refreshToken: this.refreshToken,
        refreshTokenExpires: this.refreshTokenExpires,
        username: this.username,
        password: this.password,
        token: this.token,
        tokenExpires: this.tokenExpires,
        portal: this.portal,
        ssl: this.ssl,
        tokenDuration: this.tokenDuration,
        redirectUri: this.redirectUri,
        refreshTokenTTL: this.refreshTokenTTL
      }    
    */
    const sourceId = itemInfo.id;
    let percentDone = 1;  // Let the caller know that we've started
    progressCallback(percentDone);

    // Fetch solution item's data info (partial item info is supplied via function's parameters)
    const itemDataParam: portal.IItemDataOptions = {
      authentication: userSession
    }
    const solutionItemDataDef = portal.getItemData(sourceId, itemDataParam);

    // Create a folder to hold the deployed solution
    const folderName = itemInfo.title + " (" + generalHelpers.getUTCTimestamp() + ")";
    const folderCreationParam = {
      title: folderName,
      authentication: userSession
    };
    const folderCreationDef = portal.createFolder(folderCreationParam);

    // Await completion of async actions
    Promise.all([  // TODO IE11 does not support Promise
      solutionItemDataDef,
      folderCreationDef
    ])
    .then(
      responses => {
        const itemData = responses[0];
        const folderResponse = responses[1];

        percentDone = 50;
        progressCallback(percentDone);




        // Using the contents of its data section, create an ordered graph of solution contents

        // For each solution content item in order from no dependency to dependent,
        //   * replace template symbols using template dictionary
        //   * create item in destination group
        //   * add created item's id into the template dictionary

        // Update solution item's data JSON using template dictionary




        // Create solution item using internal representation & and the updated data JSON
        restHelpers.createItemWithData(
          {
            type: "Solution",
            typeKeywords: ["Solution", "Deployed"],
            ...itemInfo
          },
          itemData, 
          {
            authentication: userSession
          },
          folderResponse.folder.id
        )
        .then(
          response => {
            progressCallback(100);
            resolve(response.id);
          },
          error => {
            console.error("createItemWithData", error);
          }
        )
      },
      error => {
        console.error("Promise.all(solutionItemDataDef,folderCreationDef)", error);
      }
    );
  });
}
