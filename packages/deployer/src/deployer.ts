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

import * as common from "@esri/solution-common";
import * as deployItems from "./deploySolutionItems";

// ------------------------------------------------------------------------------------------------------------------ //

export function deploySolution(
  itemInfoCard: common.ISolutionInfoCard,
  templateDictionary: any,
  portalSubset: common.IPortalSubset,
  destinationAuthentication: common.UserSession,
  progressCallback: (percentDone: number) => void
): Promise<common.ISolutionItem> {
  return new Promise<common.ISolutionItem>((resolve, reject) => {
    const sourceId = itemInfoCard.id;
    let percentDone = 1; // Let the caller know that we've started
    progressCallback(percentDone);
    templateDictionary.organization = {
      portalBaseUrl: portalSubset.portalUrl
    };

    // Fetch solution item's data info (partial item info is supplied via function's parameters)
    const solutionItemDataDef = common.getItemDataAsJson(
      sourceId,
      destinationAuthentication
    );

    // Create a folder to hold the deployed solution. We use the solution name, appending a sequential
    // suffix if the folder exists, e.g.,
    //   * Manage Right of Way Activities
    //   * Manage Right of Way Activities 1
    //   * Manage Right of Way Activities 2
    const folderCreationDef = common.createUniqueFolder(
      itemInfoCard.title,
      destinationAuthentication
    );

    // Determine if we are deploying to portal
    const portalDef = common.getPortal(
      portalSubset.id,
      destinationAuthentication
    );

    // Await completion of async actions
    Promise.all([
      // TODO IE11 does not support Promise
      solutionItemDataDef,
      folderCreationDef,
      portalDef
    ]).then(
      responses => {
        const item = { ...itemInfoCard } as any;
        delete item.deployCommonId;
        delete item.deployVersion;
        let itemData = responses[0] as common.ISolutionItemData;

        const folderResponse = responses[1];
        templateDictionary.folderId = folderResponse.folder.id;

        const portalResponse = responses[2];
        templateDictionary.isPortal = portalResponse.isPortal;
        templateDictionary.organization.geocodeServerUrl =
          portalResponse.helperServices.geocode[0].url;
        templateDictionary.organization.naServerUrl =
          portalResponse.helperServices.route.url;
        templateDictionary.organization.printServiceUrl =
          portalResponse.helperServices.printTask.url;
        templateDictionary.organization.geometryServerUrl =
          portalResponse.helperServices.geometry.url;

        const portalExtent: any = portalResponse.defaultExtent;
        common
          .convertExtent(
            portalExtent,
            { wkid: 4326 },
            portalResponse.helperServices.geometry.url,
            destinationAuthentication
          )
          .then(
            function(wgs84Extent) {
              templateDictionary.initiative = Object.assign(
                templateDictionary.initiative || {},
                {
                  orgExtent:
                    wgs84Extent.xmin +
                    "," +
                    wgs84Extent.ymin +
                    "," +
                    wgs84Extent.xmax +
                    "," +
                    wgs84Extent.ymax,
                  defaultExtent: portalExtent,
                  spatialReference: portalExtent.spatialReference
                }
              );

              const totalEstimatedCost =
                _estimateDeploymentCost(itemData.templates) + 3; // overhead for data fetch and folder & solution item creation
              const progressPercentStep = 100 / totalEstimatedCost;
              console.log(
                "Deploying solution " +
                  item.title +
                  " (" +
                  item.id +
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

              const updateItemInfo = {
                ...item,
                type: "Solution",
                typeKeywords: ["Solution"]
              };
              common
                .createItemWithData(
                  updateItemInfo,
                  {},
                  destinationAuthentication,
                  templateDictionary.folderId
                )
                .then(
                  updateResponse => {
                    const oldID: string = sourceId;
                    const newID: string = updateResponse.id;
                    console.log("Solution " + newID + " created");
                    templateDictionary.solutionItemId = newID;
                    item.id = newID;
                    item.thumbnailUrl = _checkedReplaceAll(
                      item.thumbnailUrl,
                      oldID,
                      newID
                    );
                    item.tryitUrl = _checkedReplaceAll(
                      item.tryitUrl,
                      oldID,
                      newID
                    );
                    item.url = _checkedReplaceAll(item.url, oldID, newID);

                    // Handle the contained item templates
                    deployItems
                      .deploySolutionItems(
                        portalSubset.restUrl,
                        sourceId,
                        itemData.templates,
                        destinationAuthentication,
                        templateDictionary,
                        destinationAuthentication,
                        () => {
                          progressCallback(
                            (percentDone += progressPercentStep)
                          ); // progress tick callback from deployItems
                        }
                      )
                      .then(
                        clonedSolutionItemIds => {
                          progressCallback(
                            (percentDone += progressPercentStep)
                          ); // for solution item creation

                          // Update solution item's data JSON using template dictionary, and then update the
                          // itemId & dependencies in each item template
                          itemData = common.replaceInTemplate(
                            itemData,
                            templateDictionary
                          );
                          itemData.templates = itemData.templates.map(
                            itemTemplate => {
                              // Update ids present in template dictionary
                              const itemId = common.getProp(
                                templateDictionary,
                                itemTemplate.itemId + ".itemId"
                              );
                              if (itemId) {
                                itemTemplate.itemId = itemId;
                              }
                              itemTemplate.dependencies = itemTemplate.dependencies.map(
                                id => {
                                  const dependId = common.getProp(
                                    templateDictionary,
                                    id + ".itemId"
                                  );
                                  return dependId ? dependId : id;
                                }
                              );
                              return itemTemplate;
                            }
                          );

                          // Create solution item using internal representation & and the updated data JSON
                          item.data = itemData;
                          item.typeKeywords = ["Solution", "Deployed"];
                          common
                            .updateItem(
                              item,
                              destinationAuthentication,
                              templateDictionary.folderId
                            )
                            .then(
                              () => {
                                progressCallback(100);
                                delete item.data;
                                resolve({
                                  item: item,
                                  data: itemData
                                });
                              },
                              e => {
                                reject(common.fail(e));
                              }
                            );
                        },
                        e => {
                          reject(common.fail(e));
                        }
                      );
                  },
                  e => {
                    reject(common.fail(e));
                  }
                );
            },
            e => {
              reject(common.fail(e));
            }
          );
      },
      e => {
        reject(common.fail(e));
      }
    );
  });
}

// ------------------------------------------------------------------------------------------------------------------ //

export function _checkedReplaceAll(
  template: string,
  oldValue: string,
  newValue: string
): string {
  let newTemplate;
  if (template && template.indexOf(oldValue) > -1) {
    const re = new RegExp(oldValue, "g");
    newTemplate = template.replace(re, newValue);
  } else {
    newTemplate = template;
  }
  return newTemplate;
}

/**
 * Accumulates the estimated deployment cost of a set of templates.
 *
 * @param templates Templates to examine
 * @return Sum of estimated deployment costs
 * @protected
 */
export function _estimateDeploymentCost(
  templates: common.IItemTemplate[]
): number {
  return templates.reduce(
    (accumulatedEstimatedCost: number, template: common.IItemTemplate) => {
      return accumulatedEstimatedCost + template.estimatedDeploymentCostFactor;
    },
    0
  );
}
