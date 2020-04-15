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
 * Manages the creation and deployment of simple item types.
 *
 * @module simple-types
 */

import * as common from "@esri/solution-common";
import * as dashboard from "./dashboard";
import * as form from "./form";
import * as notebook from "./notebook";
import * as webmap from "./webmap";
import * as webmappingapplication from "./webmappingapplication";
import * as workforce from "./workforce";
import * as quickcapture from "./quickcapture";

// ------------------------------------------------------------------------------------------------------------------ //

export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: common.UserSession
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>((resolve, reject) => {
    // Init template
    const itemTemplate: common.IItemTemplate = common.createInitializedItemTemplate(
      itemInfo
    );

    // Templatize item info property values
    itemTemplate.item.id = common.templatizeTerm(
      itemTemplate.item.id,
      itemTemplate.item.id,
      ".itemId"
    );

    // Request related items
    const relatedPromise = common.getItemRelatedItemsInSameDirection(
      itemTemplate.itemId,
      "forward",
      authentication
    );

    // Perform type-specific handling
    let dataPromise = Promise.resolve({});
    switch (itemInfo.type) {
      case "Dashboard":
      case "Feature Service":
      case "Project Package":
      case "Workforce Project":
      case "Web Map":
      case "Web Mapping Application":
      case "Notebook":
        dataPromise = new Promise((resolveJSON, rejectJSON) => {
          common
            .getItemDataAsJson(itemTemplate.itemId, authentication)
            .then(
              json => resolveJSON(common.sanitizeJSONAndReportChanges(json)),
              rejectJSON
            );
        });
        break;
      case "Form":
        dataPromise = common.getItemDataAsFile(
          itemTemplate.itemId,
          itemTemplate.item.name,
          authentication
        );
        break;
      case "QuickCapture Project":
        dataPromise = common.getItemResourcesFiles(
          itemTemplate.itemId,
          authentication
        );
        break;
    }

    // Errors are handled as resolved empty values; this means that there's no `reject` clause to handle, hence:
    // tslint:disable-next-line:no-floating-promises
    Promise.all([dataPromise, relatedPromise]).then(
      responses => {
        const [itemDataResponse, relatedItemsResponse] = responses;
        itemTemplate.data = itemDataResponse;
        const relationships = relatedItemsResponse as common.IRelatedItems[];

        // Save the mappings to related items & add those items to the dependencies, but not WMA Code Attachments
        itemTemplate.dependencies = [] as string[];
        itemTemplate.relatedItems = [] as common.IRelatedItems[];

        relationships.forEach(relationship => {
          /* istanbul ignore else */
          if (relationship.relationshipType !== "WMA2Code") {
            itemTemplate.relatedItems!.push(relationship);
            relationship.relatedItemIds.forEach(relatedItemId => {
              if (itemTemplate.dependencies.indexOf(relatedItemId) < 0) {
                itemTemplate.dependencies.push(relatedItemId);
              }
            });
          }
        });

        let wrapupPromise = Promise.resolve();
        let webappPromise = Promise.resolve(itemTemplate);
        switch (itemInfo.type) {
          case "Dashboard":
            dashboard.convertItemToTemplate(itemTemplate, authentication);
            break;
          case "Form":
            // Store the form's data in the solution resources, not in template
            itemTemplate.data = null;
            form.convertItemToTemplate(itemTemplate);

            wrapupPromise = new Promise(
              (resolveFormStorage, rejectFormStorage) => {
                common
                  .storeFormItemFiles(
                    itemTemplate,
                    itemDataResponse,
                    solutionItemId,
                    authentication
                  )
                  .then(formFilenames => {
                    // update the templates resources
                    itemTemplate.resources = itemTemplate.resources.concat(
                      formFilenames
                    );
                    resolveFormStorage();
                  }, rejectFormStorage);
              }
            );
            break;
          case "Notebook":
            notebook.convertItemToTemplate(itemTemplate);
            break;
          case "Web Map":
            webappPromise = webmap.convertItemToTemplate(
              itemTemplate,
              authentication
            );
            break;
          case "Web Mapping Application":
            if (itemDataResponse) {
              webappPromise = webmappingapplication.convertItemToTemplate(
                itemTemplate,
                authentication
              );
            }
            break;
          case "Workforce Project":
            workforce.convertItemToTemplate(itemTemplate);
            break;
          case "QuickCapture Project":
            webappPromise = quickcapture.convertItemToTemplate(itemTemplate);
            break;
        }

        wrapupPromise.then(
          () => {
            webappPromise.then(resolve, err =>
              reject(common.fail(err.response))
            );
          },
          err => reject(common.fail(err.response))
        );
      },
      error => {
        reject(error);
      }
    );
  });
}

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
      resolve(_generateEmptyCreationResponse(template.type));
    } else {
      // Replace the templatized symbols in a copy of the template
      let newItemTemplate: common.IItemTemplate = common.cloneObject(template);
      newItemTemplate = common.replaceInTemplate(
        newItemTemplate,
        templateDictionary
      );

      // Create the item, then update its URL with its new id

      // some fieldnames are used as keys for objects
      // when we templatize field references for web applications we first stringify the components of the
      // web application that could contain field references and then serach for them with a regular expression.
      // We also need to stringify the web application when de-templatizing so it will find all of these occurrences as well.
      if (template.type === "Web Mapping Application" && template.data) {
        newItemTemplate = JSON.parse(
          common.replaceInTemplate(
            JSON.stringify(newItemTemplate),
            templateDictionary
          )
        );
      }
      common
        .createItemWithData(
          newItemTemplate.item,
          newItemTemplate.data,
          destinationAuthentication,
          templateDictionary.folderId
        )
        .then(
          createResponse => {
            // Interrupt process if progress callback returns `false`
            if (
              !itemProgressCallback(
                template.itemId,
                common.EItemProgressStatus.Created,
                template.estimatedDeploymentCostFactor / 2,
                createResponse.id
              )
            ) {
              itemProgressCallback(
                template.itemId,
                common.EItemProgressStatus.Cancelled,
                0
              );
              common
                .removeItem(createResponse.id, destinationAuthentication)
                .then(
                  () => resolve(_generateEmptyCreationResponse(template.type)),
                  () => resolve(_generateEmptyCreationResponse(template.type))
                );
            } else {
              // Add the new item to the settings
              templateDictionary[template.itemId] = {
                itemId: createResponse.id
              };
              newItemTemplate.itemId = createResponse.id;

              // Set the appItemId manually to get around cases where the path was incorrectly set
              // in legacy deployments
              if (
                newItemTemplate.type === "Web Mapping Application" &&
                template.data
              ) {
                common.setProp(
                  newItemTemplate,
                  "data.appItemId",
                  createResponse.id
                );
              }
              const postProcess: boolean = common.hasUnresolvedVariables(
                newItemTemplate.data
              );

              // Update the template again now that we have the new item id
              const originalURL = newItemTemplate.item.url;
              newItemTemplate = common.replaceInTemplate(
                newItemTemplate,
                templateDictionary
              );

              // Update relationships
              let relationshipsDef = Promise.resolve(
                [] as common.IStatusResponse[]
              );
              if (newItemTemplate.relatedItems) {
                // Templatize references in relationships obj
                const updatedRelatedItems = common.replaceInTemplate(
                  common.templatizeIds(newItemTemplate.relatedItems),
                  templateDictionary
                ) as common.IRelatedItems[];

                // Add the relationships
                relationshipsDef = common.addForwardItemRelationships(
                  newItemTemplate.itemId,
                  updatedRelatedItems,
                  destinationAuthentication
                );
              }

              // Check for extra processing for web mapping application et al.
              let customProcDef: Promise<void>;
              if (
                template.type === "Web Mapping Application" &&
                template.data &&
                common.hasAnyKeyword(template, [
                  "WAB2D",
                  "WAB3D",
                  "Web AppBuilder"
                ])
              ) {
                // If this is a Web AppBuilder application, we will create a Code Attachment for downloading
                customProcDef = webmappingapplication.fineTuneCreatedItem(
                  template,
                  newItemTemplate,
                  templateDictionary,
                  destinationAuthentication
                );
              } else if (template.type === "Workforce Project") {
                customProcDef = workforce.fineTuneCreatedItem(
                  newItemTemplate,
                  destinationAuthentication
                );
              } else if (template.type === "Notebook") {
                customProcDef = notebook.fineTuneCreatedItem(
                  template,
                  newItemTemplate,
                  templateDictionary,
                  destinationAuthentication
                );
              } else if (originalURL !== newItemTemplate.item.url) {
                // For web mapping applications that are not Web AppBuilder apps
                customProcDef = new Promise<void>((resolve2, reject2) => {
                  common
                    .updateItemURL(
                      createResponse.id,
                      newItemTemplate.item.url,
                      destinationAuthentication
                    )
                    .then(() => resolve2(), reject2);
                });
              } else {
                customProcDef = Promise.resolve();
              }

              Promise.all([relationshipsDef, customProcDef]).then(
                results => {
                  const [relationships, customProcs] = results;

                  let updateResourceDef: Promise<void> = Promise.resolve();
                  if (template.type === "QuickCapture Project") {
                    updateResourceDef = quickcapture.fineTuneCreatedItem(
                      newItemTemplate,
                      destinationAuthentication
                    );
                  }
                  updateResourceDef.then(
                    () => {
                      // Interrupt process if progress callback returns `false`
                      if (
                        !itemProgressCallback(
                          template.itemId,
                          common.EItemProgressStatus.Finished,
                          template.estimatedDeploymentCostFactor / 2
                        )
                      ) {
                        itemProgressCallback(
                          template.itemId,
                          common.EItemProgressStatus.Cancelled,
                          0
                        );
                        common
                          .removeItem(
                            createResponse.id,
                            destinationAuthentication
                          )
                          .then(
                            () =>
                              resolve(
                                _generateEmptyCreationResponse(template.type)
                              ),
                            () =>
                              resolve(
                                _generateEmptyCreationResponse(template.type)
                              )
                          );
                      } else {
                        resolve({
                          id: createResponse.id,
                          type: newItemTemplate.type,
                          postProcess: postProcess
                        });
                      }
                    },
                    () => {
                      itemProgressCallback(
                        template.itemId,
                        common.EItemProgressStatus.Failed,
                        0
                      );
                      resolve(_generateEmptyCreationResponse(template.type)); // fails to update after fine tuning
                    }
                  );
                },
                () => {
                  itemProgressCallback(
                    template.itemId,
                    common.EItemProgressStatus.Failed,
                    0
                  );
                  resolve(_generateEmptyCreationResponse(template.type)); // fails to deploy all resources to the item
                }
              );
            }
          },
          () => {
            itemProgressCallback(
              template.itemId,
              common.EItemProgressStatus.Failed,
              0
            );
            resolve(_generateEmptyCreationResponse(template.type)); // fails to create item
          }
        );
    }
  });
}

/**
 * Templatizes field references within specific template types.
 * Currently only handles web mapping applications
 *
 * @param template A solution template
 * @param datasourceInfos A list of objects that store key datasource info used to templatizing field references
 * @param type The item type
 * @return The updated solution template
 */
export function postProcessFieldReferences(
  solutionTemplate: common.IItemTemplate,
  datasourceInfos: common.IDatasourceInfo[],
  type: string
): common.IItemTemplate {
  switch (type) {
    case "Web Mapping Application":
      webmappingapplication.postProcessFieldReferences(
        solutionTemplate,
        datasourceInfos
      );
      break;
    case "Dashboard":
      dashboard.postProcessFieldReferences(solutionTemplate, datasourceInfos);
      break;
    case "Web Map":
      webmap.postProcessFieldReferences(solutionTemplate, datasourceInfos);
      break;
  }
  return solutionTemplate;
}

/**
 * Items that require unique updates
 *
 * @param itemId The AGO item id
 * @param type The AGO item type
 * @param data The notebooks data as JSON
 * @param authentication Credentials for the requests to the destination
 *
 * @return A promise that will resolve once any updates have been made
 */
export function postProcessItemDependencies(
  itemId: string,
  type: string,
  data: any,
  authentication: common.UserSession
): Promise<any> {
  let p: Promise<any> = Promise.resolve();
  switch (type) {
    case "Notebook":
      p = notebook.postProcessItemDependencies(itemId, data, authentication);
      break;
  }
  return p;
}

// ------------------------------------------------------------------------------------------------------------------ //

export function _generateEmptyCreationResponse(
  templateType: string
): common.ICreateItemFromTemplateResponse {
  return {
    id: "",
    type: templateType,
    postProcess: false
  };
}
