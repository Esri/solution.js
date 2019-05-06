/*
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

import * as auth from "@esri/arcgis-rest-auth";

export interface IPortalSubset {
  name: string;
  id: string;
  restUrl: string;
  portalUrl: string;
  urlKey: string;
}

export function convertGroupIntoSolution(
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

    resolve("convertGroupIntoSolution");
  });
}

export function deploySolutionToGroup(
  itemInfo: any,
  portalSubset: IPortalSubset,
  userSession: auth.UserSession
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

    // Fetch solution item & its data infos

    // Create an internal representation of the solution item using the solution item info

    // Create a group to hold the deployed solution

    // Using the contents of its data section, create an ordered graph of solution contents

    // For each solution content item in order from no dependency to dependent,
    //   * replace template symbols using template dictionary
    //   * create item in destination group
    //   * add created item's id into the template dictionary

    // Update solution item's data JSON using template dictionary

    // Create solution item using internal representation & and the updated data JSON

    resolve("deploySolutionToGroup");
  });
}
