/** @license
 * Copyright 2020 Esri
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
// @esri/solution-common getSolutions example

import * as common from "../lib/common.umd.min";

interface ISolutionCard {
  id: string;
  title: string;
  solutionid: string;
  solutionversion: string;
};

export function getSolutions(
  authentication: common.UserSession
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let queryString = "type:Solution typekeywords:Solution,Template,solutionid-";

    // Limit the search to the user's organization?
    let orgPromise: Promise<common.IUser> = Promise.resolve(null);
    if (authentication) {
      orgPromise = authentication.getUser();
    }

    orgPromise.then(
      user => {
        if(user?.orgId) {
          queryString += " orgid:" + user.orgId;
        }

        // Run the search
        const pagingParam: common.IPagingParams = { start: 1, num: 100 };
        const searchOptions: common.ISearchOptions =
        {
          q: queryString
          , authentication
          , ...pagingParam
        };
        common.searchItems(searchOptions).then(
          response => {
            if (response.results.length > 0) {
              // "typeKeywords":["Solution","solutionid-b00190d537784a80a2e7472e7e4272f6","solutionversion-1.1","Template"]
              const solutionCards: ISolutionCard[] = response.results.map(
                item => {
                  return {
                    id: item.id,
                    title: item.title,
                    solutionid: getTypeKeyword(item.typeKeywords, "solutionid-"),
                    solutionversion: getTypeKeyword(item.typeKeywords, "solutionversion-")
                  }
                }
              );
              resolve(JSON.stringify(solutionCards));
            } else {
              reject(JSON.stringify(response));
            }
          },
          error => reject(JSON.stringify(error))
        );
      },
      error => reject(JSON.stringify(error))
    );
  });
}

function getTypeKeyword(
  typeKeywords: string[],
  prefix: string
): string {
  let keyword = "";
  typeKeywords.some(
    typeKeyword => {
      if (typeKeyword.startsWith(prefix)) {
        keyword = typeKeyword.substr(prefix.length);
        return true;
      }
      return false;
    }
  );
  return keyword;
}
