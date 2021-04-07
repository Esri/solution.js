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
// @esri/solution-deployer deploySolution example

import * as common from "@esri/solution-common";
import * as deployer from "@esri/solution-deployer";
import * as portal from "@esri/arcgis-rest-portal";

import * as getItemInfo from "./getItemInfo";

export interface ISolutionInfoCard {
  id: string;
  title: string;
}

export function deploySolution(
  templateSolutionId: string,
  srcAuthentication: common.UserSession,
  destAuthentication: common.UserSession,
  progressCallback: common.ISolutionProgressCallback,
  enableItemReuse: boolean
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!templateSolutionId) {
      reject("Solution's ID is not defined");
      return;
    }

    // Deploy a solution described by the supplied id
    const options: common.IDeploySolutionOptions = {
      jobId: common.createShortId(),
      progressCallback: progressCallback,
      consoleProgress: true,
      storageAuthentication: srcAuthentication,
      enableItemReuse
    };

    deployer.deploySolution(templateSolutionId, destAuthentication, options).then(
      (deployedSolution: any) => {
        getItemInfo.getItemInfo(deployedSolution, destAuthentication).then(
          itemInfoHtml => resolve(itemInfoHtml),
          error => reject(error.error)
        );
      },
      (error: any) => reject(error)
    );
  });
}

export function getTemplates(
  groupId: string,
  currentCards? : ISolutionInfoCard[],
  inPagingParams? : portal.IPagingParams
) : Promise<ISolutionInfoCard[]>{
  const query = "type: Solution typekeywords:Solution,Template"
  const pagingParams: portal.IPagingParams = inPagingParams ? inPagingParams : {
    start: 0,
    num: 24
  };
  const cardList = currentCards ? currentCards : [];
  const additionalSearchOptions = {
    sortField: "title",
    sortOrder: "asc",
    ...pagingParams
  }

  return new Promise<ISolutionInfoCard[]>((resolve,reject) => {
    const anonUS = new common.UserSession({portal:"https://www.arcgis.com/sharing/rest"});
    common.searchGroupContents(groupId, query, anonUS, additionalSearchOptions)
    .then((response: portal.ISearchResult<portal.IItem>) => {
      const cleanResults = common.sanitizeJSON(response.results);
      cleanResults.forEach((result:any) => {
        const card: ISolutionInfoCard = {
          id: result.id,
          title: result.title
        }
        cardList.push(card)
      });
      if (response.nextStart > 0){
        pagingParams.start = response.nextStart;
        resolve(getTemplates(groupId,cardList,pagingParams));
      }
      else{
        resolve(cardList);
      }
    },(error:any) => {
      reject(error)
      console.log(error);
    }
    );
  });

}
