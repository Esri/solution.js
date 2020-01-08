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
  templateSolutionId: string,
  authentication: common.UserSession,
  options?: common.IDeploySolutionOptions
): Promise<common.ISolutionItem> {
  return new Promise<common.ISolutionItem>((resolve, reject) => {
    let percentDone = 1; // Let the caller know that we've started
    if (options?.progressCallback) {
      options.progressCallback(percentDone); // Let the caller know that we've started
    }
    const templateDictionary = options?.templateDictionary ?? {};

    // Fetch solution item's info
    const solutionItemBaseDef = common.getItemBase(
      templateSolutionId,
      authentication
    );
    const solutionItemDataDef = common.getItemDataAsJson(
      templateSolutionId,
      authentication
    );

    // Determine if we are deploying to portal
    const portalDef = common.getPortal("", authentication);

    const userDef = common.getUser(authentication);
    const foldersDef = common.getUserFolders(authentication);

    // Await completion of async actions
    Promise.all([
      // TODO IE11 does not support Promise
      solutionItemBaseDef,
      solutionItemDataDef,
      portalDef,
      userDef,
      foldersDef
    ]).then(
      responses => {
        const [
          itemBase,
          itemData,
          portalResponse,
          userResponse,
          foldersResponse
        ] = responses;

        const deployOptions: common.IDeploySolutionOptions = options ?? {};
        deployOptions.title = deployOptions.title ?? itemBase.title;
        deployOptions.snippet = deployOptions.snippet ?? itemBase.snippet;
        deployOptions.description =
          deployOptions.description ?? itemBase.description;
        deployOptions.tags = deployOptions.tags ?? itemBase.tags; // deployOptions.thumbnail needs to be a full URL

        _purgeItemProperties(itemBase);

        templateDictionary.isPortal = portalResponse.isPortal;
        templateDictionary.organization = Object.assign(
          templateDictionary.organization || {},
          portalResponse
        );

        // As of Spring 2020, only HTTPS (see
        // https://www.esri.com/arcgis-blog/products/product/administration/2019-arcgis-transport-security-improvements/)
        const scheme: string = "https"; // portalResponse.allSSL ? "https" : "http";
        const urlKey: string = common.getProp(portalResponse, "urlKey");
        const customBaseUrl: string = common.getProp(
          portalResponse,
          "customBaseUrl"
        );
        templateDictionary.portalBaseUrl =
          urlKey && customBaseUrl
            ? `${scheme}://${urlKey}.${customBaseUrl}`
            : authentication.portal;

        templateDictionary.user = userResponse;
        templateDictionary.user.folders = foldersResponse;

        // Create a folder to hold the deployed solution. We use the solution name, appending a sequential
        // suffix if the folder exists, e.g.,
        //  * Manage Right of Way Activities
        //  * Manage Right of Way Activities 1
        //  * Manage Right of Way Activities 2
        common
          .createUniqueFolder(
            itemBase.title,
            templateDictionary,
            authentication
          )
          .then(
            folderResponse => {
              templateDictionary.folderId = folderResponse.folder.id;
              const portalExtent: any = portalResponse.defaultExtent;
              common
                .convertExtent(
                  portalExtent,
                  { wkid: 4326 },
                  portalResponse.helperServices.geometry.url,
                  authentication
                )
                .then(
                  function(wgs84Extent) {
                    templateDictionary.solutionItemExtent =
                      wgs84Extent.xmin +
                      "," +
                      wgs84Extent.ymin +
                      "," +
                      wgs84Extent.xmax +
                      "," +
                      wgs84Extent.ymax;

                    const totalEstimatedCost =
                      _estimateDeploymentCost(itemData.templates) + 3; // overhead for data fetch and folder & solution item creation
                    const progressPercentStep = 100 / totalEstimatedCost;
                    console.log(
                      "Deploying solution " +
                        itemBase.title +
                        " (" +
                        itemBase.id +
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
                    if (deployOptions.progressCallback) {
                      deployOptions.progressCallback(
                        (percentDone += 2 * progressPercentStep)
                      ); // for data fetch and folder creation
                    }

                    // Create a deployed Solution item
                    const updateItemInfo = {
                      ...itemBase,
                      type: "Solution",
                      typeKeywords: ["Solution"]
                    };

                    common
                      .createItemWithData(
                        updateItemInfo,
                        {},
                        authentication,
                        templateDictionary.folderId
                      )
                      .then(
                        updateResponse => {
                          const oldID: string = templateSolutionId;
                          const newID: string = updateResponse.id;
                          console.log("Solution " + newID + " created");
                          templateDictionary.solutionItemId = newID;
                          itemBase.id = newID;
                          itemBase.thumbnailUrl = _checkedReplaceAll(
                            itemBase.thumbnailUrl,
                            oldID,
                            newID
                          );
                          itemBase.tryitUrl = _checkedReplaceAll(
                            itemBase.tryitUrl,
                            oldID,
                            newID
                          );
                          itemBase.url = _checkedReplaceAll(
                            itemBase.url,
                            oldID,
                            newID
                          );

                          // Handle the contained item templates
                          deployItems
                            .deploySolutionItems(
                              authentication.portal,
                              templateSolutionId,
                              itemData.templates,
                              authentication,
                              templateDictionary,
                              authentication,
                              () => {
                                if (deployOptions.progressCallback) {
                                  deployOptions.progressCallback(
                                    (percentDone += progressPercentStep)
                                  ); // progress tick callback from deployItems
                                }
                              }
                            )
                            .then(
                              clonedSolutionItemIds => {
                                if (deployOptions.progressCallback) {
                                  deployOptions.progressCallback(
                                    (percentDone += progressPercentStep)
                                  ); // for solution item creation
                                }

                                // Update solution item's data JSON using template dictionary, and then update the
                                // itemId & dependencies in each item template
                                itemBase.data = common.replaceInTemplate(
                                  itemData,
                                  templateDictionary
                                );
                                itemData.templates = itemData.templates.map(
                                  (itemTemplate: common.IItemTemplate) => {
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
                                    return _purgeTemplateProperties(
                                      itemTemplate
                                    );
                                  }
                                );

                                deployItems
                                  .postProcessCircularDependencies(
                                    itemData.templates,
                                    authentication,
                                    templateDictionary
                                  )
                                  .then(
                                    () => {
                                      // Create solution item using internal representation & and the updated data JSON
                                      itemBase.typeKeywords = [
                                        "Solution",
                                        "Deployed"
                                      ];
                                      common
                                        .updateItem(
                                          itemBase,
                                          authentication,
                                          templateDictionary.folderId
                                        )
                                        .then(
                                          () => {
                                            if (
                                              deployOptions.progressCallback
                                            ) {
                                              deployOptions.progressCallback(
                                                100
                                              );
                                            }
                                            delete itemBase.data;
                                            resolve({
                                              item: itemBase,
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

export function _purgeItemProperties(itemTemplate: any): any {
  const retainProps: string[] = [
    "access",
    "accessInformation",
    "appCategories",
    "banner",
    "categories",
    "culture",
    "description",
    "documentation",
    "extent",
    "groupDesignations",
    "industries",
    "languages",
    "largeThumbnail",
    "licenseInfo",
    "listed",
    "name",
    "properties",
    "proxyFilter",
    "screenshots",
    "snippet",
    "spatialReference",
    "tags",
    "thumbnail",
    "title",
    "type",
    "typeKeywords",
    "url"
  ];
  const deleteProps: string[] = Object.keys(itemTemplate).filter(
    k => retainProps.indexOf(k) < 0
  );
  common.deleteProps(itemTemplate, deleteProps);
  return itemTemplate;
}

export function _purgeTemplateProperties(itemTemplate: any): any {
  const retainProps: string[] = [
    "itemId",
    "type",
    "dependencies",
    "circularDependencies"
  ];
  const deleteProps: string[] = Object.keys(itemTemplate).filter(
    k => retainProps.indexOf(k) < 0
  );
  common.deleteProps(itemTemplate, deleteProps);
  return itemTemplate;
}

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
