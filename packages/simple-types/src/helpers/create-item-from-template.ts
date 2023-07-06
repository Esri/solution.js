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

import * as common from "@esri/solution-common";
import * as notebook from "../notebook";
import * as webmappingapplication from "../webmappingapplication";
import * as workforce from "../workforce";

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
    } else {
      // Replace the templatized symbols in a copy of the template
      let newItemTemplate: common.IItemTemplate = common.cloneObject(template);
      newItemTemplate = common.replaceInTemplate(
        newItemTemplate,
        templateDictionary
      );

      let qcProjectFileContents: string;

      // Create the item, then update its URL with its new id

      // some fieldnames are used as keys for objects
      // when we templatize field references for web applications we first stringify the components of the
      // web application that could contain field references and then search for them with a regular expression.
      // We also need to stringify the web application when de-templatizing so it will find all of these occurrences as well.
      if (template.type === "Web Mapping Application" && template.data) {
        newItemTemplate = JSON.parse(
          common.replaceInTemplate(
            JSON.stringify(newItemTemplate),
            templateDictionary
          )
        );


      } else if (template.type === "QuickCapture Project" && template.data) {
        // Save the data section for creating the qc.project.json later
        qcProjectFileContents = JSON.stringify(newItemTemplate.data.application);

        // Delete the data section
        delete newItemTemplate.data;
      }

      if (template.item.thumbnail) {
        newItemTemplate.item.thumbnail = template.item.thumbnail; // make sure that our File is still there
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
                  () =>
                    resolve(
                      common.generateEmptyCreationResponse(template.type)
                    ),
                  () =>
                    resolve(common.generateEmptyCreationResponse(template.type))
                );
            } else {
              // Add the new item to the settings
              templateDictionary[template.itemId] = {
                itemId: createResponse.id,
                itemUrl: (templateDictionary["portalBaseUrl"] as string) + "/sharing/rest/content/items/" + createResponse.id
              }
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
                  destinationAuthentication,
                  templateDictionary
                );
              } else if (template.type === "QuickCapture Project") {
                if (qcProjectFileContents) {
                  // Generate the qc.project.json file resource from the data section after handling templatized variables
                  const qcProjectFile = common.jsonToFile(
                    common.replaceInTemplate(JSON.parse(qcProjectFileContents), templateDictionary),
                    "qc.project.json"
                  );

                  // Send the created qc.project.json file to the item
                  customProcDef = common.addResourceFromBlob(
                    qcProjectFile, newItemTemplate.itemId, "", qcProjectFile.name, destinationAuthentication);
                }

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
                customProcDef = Promise.resolve(null);
              }

              Promise.all([relationshipsDef, customProcDef]).then(
                () => {
                  // Interrupt process if progress callback returns `false`
                  if (
                    !itemProgressCallback(
                      template.itemId,
                      common.EItemProgressStatus.Finished,
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
                        () =>
                          resolve(
                            common.generateEmptyCreationResponse(template.type)
                          ),
                        () =>
                          resolve(
                            common.generateEmptyCreationResponse(template.type)
                          )
                      );
                  } else {
                    resolve({
                      item: newItemTemplate,
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
                  resolve(common.generateEmptyCreationResponse(template.type)); // fails to deploy all resources to the item
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
            resolve(common.generateEmptyCreationResponse(template.type)); // fails to create item
          }
        );
    }
  });
}
