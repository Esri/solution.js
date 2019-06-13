/** @license
 * Copyright 2018 Esri
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

/**
 * Manages the deployment of a Solution.
 *
 * @module deployer
 */

import * as auth from "@esri/arcgis-rest-auth";
import * as common from "@esri/solution-common";
import * as deployItems from "./deploySolutionItems";
import * as portal from "@esri/arcgis-rest-portal";

// ------------------------------------------------------------------------------------------------------------------ //

export interface IPortalSubset {
  name: string;
  id: string;
  restUrl: string;
  portalUrl: string;
  urlKey: string;
}

export function deploySolution(
  itemInfo: any,
  templateDictionary: any,
  portalSubset: IPortalSubset,
  destinationUserSession: auth.UserSession,
  progressCallback: (percentDone: number) => void
): Promise<common.ISolutionItem> {
  return new Promise<common.ISolutionItem>((resolve, reject) => {
    const sourceId = itemInfo.id;
    let percentDone = 1; // Let the caller know that we've started
    progressCallback(percentDone);
    templateDictionary.organization = {
      portalBaseUrl: portalSubset.portalUrl
    };

    // Fetch solution item's data info (partial item info is supplied via function's parameters)
    const itemDataParam: portal.IItemDataOptions = {
      authentication: destinationUserSession
    };
    const solutionItemDataDef = portal.getItemData(sourceId, itemDataParam);

    // Create a folder to hold the deployed solution. We use the solution name, appending a sequential
    // suffix if the folder exists, e.g.,
    //   * Manage Right of Way Activities
    //   * Manage Right of Way Activities 1
    //   * Manage Right of Way Activities 2
    const folderCreationDef = common.createUniqueFolder(
      itemInfo.title,
      destinationUserSession
    );

    // Determine if we are deploying to portal
    const portalDef = portal.getPortal(undefined, destinationUserSession);

    // Await completion of async actions
    Promise.all([
      // TODO IE11 does not support Promise
      solutionItemDataDef,
      folderCreationDef,
      portalDef
    ]).then(
      responses => {
        let itemData = responses[0] as common.ISolutionItemData;
        const folderResponse = responses[1];
        templateDictionary.folderId = folderResponse.folder.id;
        const portalResponse = responses[2];
        templateDictionary.isPortal = portalResponse.isPortal;

        const totalEstimatedCost =
          estimateDeploymentCost(itemData.templates) + 3; // overhead for data fetch and folder & solution item creation
        const progressPercentStep = 100 / totalEstimatedCost;
        console.log(
          "Deploying solution " +
            itemInfo.title +
            " (" +
            itemInfo.id +
            ") into folder " +
            folderResponse.folder.title +
            " (" +
            folderResponse.folder.id +
            ")"
        );
        console.log(
          "totalEstimatedCost, progressPercentStep",
          totalEstimatedCost.toString(),
          progressPercentStep.toFixed(2).toString()
        );
        progressCallback((percentDone += 2 * progressPercentStep)); // for data fetch and folder creation

        // Handle the contained item templates
        deployItems
          .deploySolutionItems(
            portalSubset.restUrl,
            sourceId,
            itemData.templates,
            destinationUserSession,
            templateDictionary,
            destinationUserSession,
            () => {
              progressCallback((percentDone += progressPercentStep)); // progress tick callback from deployItems
            }
          )
          .then(
            clonedSolutionItemIds => {
              progressCallback((percentDone += progressPercentStep)); // for solution item creation

              // Update solution item's data JSON using template dictionary, and then update the
              // itemId & dependencies in each item template
              itemData = common.replaceInTemplate(itemData, templateDictionary);
              itemData.templates = itemData.templates.map(itemTemplate => {
                // Update ids present in template dictionary
                const itemId = common.getProp(
                  templateDictionary,
                  itemTemplate.itemId + ".id"
                );
                if (itemId) {
                  itemTemplate.itemId = itemId;
                }
                itemTemplate.dependencies = itemTemplate.dependencies.map(
                  id => {
                    const dependId = common.getProp(
                      templateDictionary,
                      id + ".id"
                    );
                    return dependId ? dependId : id;
                  }
                );
                return itemTemplate;
              });

              // Create solution item using internal representation & and the updated data JSON
              const updatedItemInfo = {
                ...itemInfo,
                type: "Solution",
                typeKeywords: ["Solution", "Deployed"]
              };
              common
                .createItemWithData(
                  updatedItemInfo,
                  itemData,
                  {
                    authentication: destinationUserSession
                  },
                  templateDictionary.folderId
                )
                .then(
                  response => {
                    updatedItemInfo.id = response.id;
                    updatedItemInfo.url = updatedItemInfo.url.replace(
                      itemInfo.id,
                      response.id
                    );
                    // console.log(JSON.stringify(templateDictionary, null, 2));
                    progressCallback(100);
                    resolve({
                      item: updatedItemInfo,
                      data: itemData
                    });
                  },
                  error => {
                    console.error("createItemWithData", error);
                  }
                );
            },
            error => {
              console.error("createItemWithData", error);
            }
          );
      },
      error => {
        console.error(
          "Promise.all(solutionItemDataDef,folderCreationDef)",
          error
        );
      }
    );
  });
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Accumulates the estimated deployment cost of a set of templates.
 *
 * @param templates Templates to examine
 * @return Sum of estimated deployment costs
 * @protected
 */
function estimateDeploymentCost(templates: common.IItemTemplate[]): number {
  return templates.reduce(
    (accumulatedEstimatedCost: number, template: common.IItemTemplate) => {
      return accumulatedEstimatedCost + template.estimatedDeploymentCostFactor;
    },
    0
  );
}
