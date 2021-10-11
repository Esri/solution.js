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
 * Manages the creation and deployment of feature layers and services.
 *
 * @module feature-layer
 */

//#region Imports ----------------------------------------------------------------------------------------------//

import * as common from "@esri/solution-common";

//#endregion

//#region Publish Process --------------------------------------------------------------------------------------//

/**
 * Fills in missing data, including full layer and table definitions, in a feature services' definition.
 *
 * @param solutionItemId
 * @param itemInfo Feature service item
 * @param userSession The session used to interact with the service the template is based on
 * @param templateDictionary Hash mapping property names to replacement values
 * @return A promise that will resolve when fullItem has been updated
 */
export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: common.UserSession,
  templateDictionary?: any
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>((resolve, reject) => {
    // Init template
    const template: common.IItemTemplate = common.createInitializedItemTemplate(
      itemInfo
    );

    const hasInvalidDesignations: boolean = common.hasInvalidGroupDesignations(
      itemInfo.groupDesignations
    );
    if (hasInvalidDesignations) {
      common
        .updateTemplateForInvalidDesignations(template, authentication)
        .then(
          _template => resolve(_template),
          e => reject(common.fail(e))
        );
    } else {
      // Update the estimated cost factor to deploy this item
      template.estimatedDeploymentCostFactor = 10;

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      common.getItemDataAsJson(template.item.id, authentication).then(data => {
        template.data = data;
        common.getServiceLayersAndTables(template, authentication).then(
          itemTemplate => {
            // Extract dependencies
            common.extractDependencies(itemTemplate, authentication).then(
              (dependencies: common.IDependency[]) => {
                // set the dependencies as an array of IDs from the array of IDependency
                itemTemplate.dependencies = dependencies.map(
                  (dep: any) => dep.id
                );

                // resolve the template with templatized values
                resolve(
                  common.templatize(
                    itemTemplate,
                    dependencies,
                    false,
                    templateDictionary
                  )
                );
              },
              (e: any) => reject(common.fail(e))
            );
          },
          e => reject(common.fail(e))
        );
      });
    }
  });
}

//#endregion

//#region Deploy Process ---------------------------------------------------------------------------------------//

/**
 * Creates an item in a specified folder (except for Group item type).
 *
 * @param itemTemplate Item to be created; n.b.: this item is modified
 * @param folderId Id of folder to receive item; null indicates that the item goes into the root
 *                 folder; ignored for Group item type
 * @param settings Hash mapping property names to replacement values
 * @param authentication Credentials for the request
 * @return A promise that will resolve with the id of the created item
 * @protected
 */
export function createItemFromTemplate(
  template: common.IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: common.UserSession,
  itemProgressCallback: common.IItemProgressCallback
): Promise<common.ICreateItemFromTemplateResponse> {
  return new Promise<common.ICreateItemFromTemplateResponse>(resolve => {
    // Interrupt process if progress callback returns `false`
    if (
      !itemProgressCallback(
        template.itemId,
        common.EItemProgressStatus.Started,
        0
      )
    ) {
      itemProgressCallback(
        template.itemId,
        common.EItemProgressStatus.Ignored,
        0
      );
      resolve(common.generateEmptyCreationResponse(template.type));
      return;
    }

    // Replace the templatized symbols in a copy of the template
    let newItemTemplate: common.IItemTemplate = common.cloneObject(template);
    newItemTemplate = common.replaceInTemplate(
      newItemTemplate,
      templateDictionary
    );

    // Thumbnail has to be updated separately; doesn't work in create service call
    delete newItemTemplate.item.thumbnail;

    // cache the popup info to be added later
    const popupInfos: common.IPopupInfos = common.cachePopupInfos(
      newItemTemplate.data
    );

    // Create the item, then update its URL with its new id
    common
      .createFeatureService(
        newItemTemplate,
        destinationAuthentication,
        templateDictionary
      )
      .then(
        createResponse => {
          if (createResponse.success) {
            // Interrupt process if progress callback returns `false`
            if (
              !itemProgressCallback(
                template.itemId,
                common.EItemProgressStatus.Created,
                template.estimatedDeploymentCostFactor / 2,
                createResponse.serviceItemId
              )
            ) {
              itemProgressCallback(
                template.itemId,
                common.EItemProgressStatus.Cancelled,
                0
              );
              common
                .removeItem(
                  createResponse.serviceItemId,
                  destinationAuthentication
                )
                .then(
                  () =>
                    resolve(
                      common.generateEmptyCreationResponse(template.type)
                    ),
                  () =>
                    resolve(common.generateEmptyCreationResponse(template.type))
                );
            } else {
              // Detemplatize what we can now that the service has been created
              newItemTemplate = common.updateTemplate(
                newItemTemplate,
                templateDictionary,
                createResponse
              );
              // Add the layers and tables to the feature service
              common
                .addFeatureServiceLayersAndTables(
                  newItemTemplate,
                  templateDictionary,
                  popupInfos,
                  destinationAuthentication
                )
                .then(
                  () => {
                    newItemTemplate = common.updateTemplate(
                      newItemTemplate,
                      templateDictionary,
                      createResponse
                    );
                    // Update the item with snippet, description, popupInfo, etc.
                    common
                      .updateItemExtended(
                        {
                          ...newItemTemplate.item,
                          url: undefined // can't update the URL of a feature service
                        },
                        newItemTemplate.data,
                        destinationAuthentication,
                        template.item.thumbnail,
                        undefined,
                        templateDictionary
                      )
                      .then(
                        () => {
                          // Interrupt process if progress callback returns `false`
                          if (
                            !itemProgressCallback(
                              template.itemId,
                              common.EItemProgressStatus.Finished,
                              template.estimatedDeploymentCostFactor / 2,
                              createResponse.serviceItemId
                            )
                          ) {
                            itemProgressCallback(
                              template.itemId,
                              common.EItemProgressStatus.Cancelled,
                              0
                            );
                            common
                              .removeItem(
                                createResponse.serviceItemId,
                                destinationAuthentication
                              )
                              .then(
                                () =>
                                  resolve(
                                    common.generateEmptyCreationResponse(
                                      template.type
                                    )
                                  ),
                                () =>
                                  resolve(
                                    common.generateEmptyCreationResponse(
                                      template.type
                                    )
                                  )
                              );
                          } else {
                            // Update the template to match what we've stored in AGO
                            common
                              .getItemBase(
                                newItemTemplate.itemId,
                                destinationAuthentication
                              )
                              .then(
                                updatedItem => {
                                  newItemTemplate.item = updatedItem;
                                  /* istanbul ignore else */
                                  if (
                                    common.getProp(
                                      newItemTemplate,
                                      "item.url"
                                    ) &&
                                    !newItemTemplate.item.url.endsWith("/")
                                  ) {
                                    newItemTemplate.item.url += "/";
                                  }

                                  resolve({
                                    item: newItemTemplate,
                                    id: createResponse.serviceItemId,
                                    type: newItemTemplate.type,
                                    postProcess:
                                      common.hasUnresolvedVariables({
                                        item: newItemTemplate.item,
                                        data: newItemTemplate.data
                                      }) ||
                                      common.isWorkforceProject(newItemTemplate)
                                  });
                                },
                                () => {
                                  itemProgressCallback(
                                    template.itemId,
                                    common.EItemProgressStatus.Failed,
                                    0
                                  );
                                  common
                                    .removeItem(
                                      createResponse.serviceItemId,
                                      destinationAuthentication
                                    )
                                    .then(
                                      () =>
                                        resolve(
                                          common.generateEmptyCreationResponse(
                                            template.type
                                          )
                                        ),
                                      () =>
                                        resolve(
                                          common.generateEmptyCreationResponse(
                                            template.type
                                          )
                                        )
                                    );
                                } // fails to update item
                              );
                          }
                        },
                        () => {
                          itemProgressCallback(
                            template.itemId,
                            common.EItemProgressStatus.Failed,
                            0
                          );
                          common
                            .removeItem(
                              createResponse.serviceItemId,
                              destinationAuthentication
                            )
                            .then(
                              () =>
                                resolve(
                                  common.generateEmptyCreationResponse(
                                    template.type
                                  )
                                ),
                              () =>
                                resolve(
                                  common.generateEmptyCreationResponse(
                                    template.type
                                  )
                                )
                            );
                        } // fails to update item
                      );
                  },
                  () => {
                    itemProgressCallback(
                      template.itemId,
                      common.EItemProgressStatus.Failed,
                      0
                    );
                    common
                      .removeItem(
                        createResponse.serviceItemId,
                        destinationAuthentication
                      )
                      .then(
                        () =>
                          resolve(
                            common.generateEmptyCreationResponse(template.type)
                          ),
                        () =>
                          resolve(
                            common.generateEmptyCreationResponse(template.type)
                          )
                      );
                  } // fails to add service layers and/or tables
                );
            }
          } else {
            itemProgressCallback(
              template.itemId,
              common.EItemProgressStatus.Failed,
              0
            );
            resolve(common.generateEmptyCreationResponse(template.type)); // fails to create item
          }
        },
        () => {
          itemProgressCallback(
            template.itemId,
            common.EItemProgressStatus.Failed,
            0
          );
          resolve(common.generateEmptyCreationResponse(template.type)); // fails to create item
        }
      );
  });
}

/**
 * Feature Layer post-processing actions
 *
 * @param {string} itemId The item ID
 * @param {string} type The template type
 * @param {any[]} itemInfos Array of {id: 'ef3', type: 'Web Map'} objects
 * @param {any} templateDictionary The template dictionary
 * @param {UserSession} authentication The destination session info
 * @returns Promise resolving to successfulness of update
 */
export function postProcess(
  itemId: string,
  type: string,
  itemInfos: any[],
  template: common.IItemTemplate,
  templates: common.IItemTemplate[],
  templateDictionary: any,
  authentication: common.UserSession
): Promise<common.IUpdateItemResponse> {
  return new Promise<common.IUpdateItemResponse>((resolve, reject) => {
    common
      .updateItemTemplateFromDictionary(
        itemId,
        templateDictionary,
        authentication
      )
      .then(results => {
        if (common.isWorkforceProject(template)) {
          template = common.replaceInTemplate(template, templateDictionary);
          common
            .fineTuneCreatedWorkforceItem(
              template,
              authentication,
              template.item.url,
              templateDictionary
            )
            .then(resolve, reject);
        } else {
          resolve(results);
        }
      }, reject);
  });
}

//#endregion
