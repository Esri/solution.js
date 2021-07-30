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

import * as getFormattedItemInfo from "./getFormattedItemInfo";

export interface ISolutionInfoCard {
  id: string;
  title: string;
}


export function deploySolutionsInFolder(
  folderId: string,
  srcAuthentication: common.UserSession,
  destAuthentication: common.UserSession,
  progressCallback: common.ISolutionProgressCallback,
  enableItemReuse: boolean,
  customParams: any
): Promise<string> {
  const query = new portal.SearchQueryBuilder()
  .match(folderId).in("ownerfolder").and()
  .match("Solution").in("type").and()
  .match("Template").in("typekeywords");
  return portal.searchItems({
    q: query,
    num: 100,
    authentication: srcAuthentication
  })
  .then((queryResponse) => {
    if (queryResponse.results.length > 0) {
      const solutionsToDeploy = queryResponse.results.map(
        result => {
          return {
            id: result.id,
            title: result.title
          } as ISolutionInfoCard;
        }
      );
      return deployBatchOfSolutions(solutionsToDeploy, solutionsToDeploy.length, srcAuthentication, destAuthentication, progressCallback, enableItemReuse, customParams);
    } else {
      return Promise.resolve("<i>No solutions found in folder</i>");
    }
  });
}

function deployBatchOfSolutions(
  solutionsToDeploy: ISolutionInfoCard[],
  totalNumberOfSolutions: number,
  srcAuthentication: common.UserSession,
  destAuthentication: common.UserSession,
  progressCallback: common.ISolutionProgressCallback,
  enableItemReuse: boolean,
  customParams: any
): Promise<string> {
  // Deploy the first item in the list
  let solution: ISolutionInfoCard = null;
  let solutionHtml = "";
  let deployPromise = Promise.resolve("");
  if (solutionsToDeploy.length > 0) {
    solution = solutionsToDeploy.shift();
    const index = totalNumberOfSolutions - solutionsToDeploy.length;
    deployPromise = deploySolution(
      solution,
      index + '/' + totalNumberOfSolutions + ' "' + solution.title + '"',
      srcAuthentication,
      destAuthentication,
      progressCallback,
      enableItemReuse,
      customParams
    );
  }
  return deployPromise
  .then(html => {
    solutionHtml = html;

    // Are there any more items in the list?
    let remainingDeployPromise = Promise.resolve("");
    if (solutionsToDeploy.length > 0) {
      remainingDeployPromise = deployBatchOfSolutions(solutionsToDeploy, totalNumberOfSolutions,
        srcAuthentication, destAuthentication, progressCallback, enableItemReuse, customParams);
    }
    return remainingDeployPromise;
  })
  .then(remainingHtml => {
    return solutionHtml + remainingHtml;
  });
}

export function deploySolution(
  templateSolution: ISolutionInfoCard,
  jobId: string,
  srcAuthentication: common.UserSession,
  destAuthentication: common.UserSession,
  progressCallback: common.ISolutionProgressCallback,
  enableItemReuse: boolean,
  customParams: any
): Promise<string> {
  // Deploy a solution described by the supplied id
  const options: common.IDeploySolutionOptions = {
    jobId,
    progressCallback: progressCallback,
    consoleProgress: true,
    storageAuthentication: srcAuthentication,
    enableItemReuse,
    templateDictionary: {
      params: JSON.parse(customParams)
    }
  };
  const itemUrlPrefix = destAuthentication.portal.replace("/sharing/rest", "");

  return deployer.deploySolution(templateSolution.id, destAuthentication, options)
  .then((deployedSolution: any) => {
    return 'Deployed solution "' + templateSolution.title + '" into <a href="' + itemUrlPrefix +
      '/home/item.html?id=' + deployedSolution + '" target="_blank">' + deployedSolution + '</a><br/>';
  });
}

export function deployAndDisplaySolution(
  templateSolutionId: string,
  srcAuthentication: common.UserSession,
  destAuthentication: common.UserSession,
  progressCallback: common.ISolutionProgressCallback,
  enableItemReuse: boolean,
  customParams: any
): Promise<string> {
  // Deploy a solution described by the supplied id
  const options: common.IDeploySolutionOptions = {
    jobId: templateSolutionId,
    progressCallback: progressCallback,
    consoleProgress: true,
    storageAuthentication: srcAuthentication,
    enableItemReuse,
    templateDictionary: {
      params: JSON.parse(customParams)
    }
  };

  return deployer.deploySolution(templateSolutionId, destAuthentication, options)
  .then((deployedSolution: any) => {
    return getFormattedItemInfo.getFormattedItemInfo(deployedSolution, destAuthentication);
  });
}

export function getFolders(
  authentication: common.UserSession,
) : Promise<ISolutionInfoCard[]>{
  return portal.getUserContent({ authentication })
  .then((response: portal.IUserContentResponse) => {
    return response.folders.map(
      (folder: portal.IFolder) => {
        return {
          id: folder.id,
          title: folder.title
        } as ISolutionInfoCard;
      }
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
