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

/**
 * Manages the creation and deployment of groups.
 *
 * @module group
 */

import * as common from "@esri/solution-common";

// ------------------------------------------------------------------------------------------------------------------ //

export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: common.UserSession
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>((resolve, reject) => {
    // Init template
    const itemTemplate: common.IItemTemplate = common.createInitializedGroupTemplate(
      itemInfo
    );

    // Templatize item info property values
    itemTemplate.item.id = common.templatizeTerm(
      itemTemplate.item.id,
      itemTemplate.item.id,
      ".itemId"
    );

    // Get the group's items--its dependencies
    common.getGroupContents(itemInfo.id, authentication).then(
      groupContents => {
        itemTemplate.type = "Group";
        itemTemplate.dependencies = groupContents;
        common.getGroupBase(itemInfo.id, authentication).then(
          groupResponse => {
            groupResponse.id = itemTemplate.item.id;
            itemTemplate.item = {
              ...groupResponse,
              type: "Group"
            };
            resolve(itemTemplate);
          },
          () => resolve(itemTemplate)
        );
      },
      () => resolve(itemTemplate)
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
      return;
    }

    // Replace the templatized symbols in a copy of the template
    let newItemTemplate: common.IItemTemplate = common.cloneObject(template);
    newItemTemplate = common.replaceInTemplate(
      newItemTemplate,
      templateDictionary
    );

    // Group uses `thumbnail` instead of `thumbnailurl`, and it has to be an actual file
    let thumbnailBlobDef = Promise.resolve(null);
    if (newItemTemplate.item.thumbnailurl) {
      thumbnailBlobDef = new Promise(resolveThumb => {
        common
          .getBlobAsFile(
            newItemTemplate.item.thumbnailurl,
            common.getFilenameFromUrl(newItemTemplate.item.thumbnailurl),
            destinationAuthentication
          )
          .then(resolveThumb, () => resolveThumb(null));
      });
    }

    thumbnailBlobDef.then(thumbnailBlob => {
      // Set up properties needed to create group
      const newGroup: common.IGroupAdd = {
        title: newItemTemplate.item.title || "",
        access: "private",
        owner: newItemTemplate.item.owner,
        tags: newItemTemplate.item.tags,
        description: newItemTemplate.item.description,
        thumbnail: thumbnailBlob,
        snippet: newItemTemplate.item.snippet
      };

      // Create a group, appending a sequential suffix to its name if the group exists, e.g.,
      //  * Manage Right of Way Activities
      //  * Manage Right of Way Activities 1
      //  * Manage Right of Way Activities 2
      common
        .createUniqueGroup(
          newGroup.title,
          newGroup,
          templateDictionary,
          destinationAuthentication
        )
        .then(
          (createResponse: common.IAddGroupResponse) => {
            if (createResponse.success) {
              // Interrupt process if progress callback returns `false`
              if (
                !itemProgressCallback(
                  createResponse.group.id,
                  common.EItemProgressStatus.Created,
                  template.estimatedDeploymentCostFactor / 2,
                  createResponse.group.id
                )
              ) {
                itemProgressCallback(
                  createResponse.group.id,
                  common.EItemProgressStatus.Cancelled,
                  0
                );
                // tslint:disable-next-line: no-floating-promises
                common
                  .removeGroup(
                    createResponse.group.id,
                    destinationAuthentication
                  )
                  .then(
                    () =>
                      resolve(_generateEmptyCreationResponse(template.type)),
                    () => resolve(_generateEmptyCreationResponse(template.type))
                  );
              } else {
                newItemTemplate.itemId = createResponse.group.id;
                templateDictionary[template.itemId] = {
                  itemId: createResponse.group.id
                };

                // Update the template again now that we have the new item id
                newItemTemplate = common.replaceInTemplate(
                  newItemTemplate,
                  templateDictionary
                );

                // Update the template dictionary with the new id
                templateDictionary[template.itemId].itemId =
                  createResponse.group.id;

                // Interrupt process if progress callback returns `false`
                if (
                  !itemProgressCallback(
                    createResponse.group.id,
                    common.EItemProgressStatus.Finished,
                    template.estimatedDeploymentCostFactor / 2
                  )
                ) {
                  itemProgressCallback(
                    createResponse.group.id,
                    common.EItemProgressStatus.Cancelled,
                    0
                  );
                  // tslint:disable-next-line: no-floating-promises
                  common
                    .removeGroup(
                      createResponse.group.id,
                      destinationAuthentication
                    )
                    .then(
                      () =>
                        resolve(_generateEmptyCreationResponse(template.type)),
                      () =>
                        resolve(_generateEmptyCreationResponse(template.type))
                    );
                } else {
                  resolve({
                    id: createResponse.group.id,
                    type: newItemTemplate.type,
                    postProcess: false
                  });
                }
              }
            } else {
              itemProgressCallback(
                template.itemId,
                common.EItemProgressStatus.Failed,
                0
              );
              resolve(_generateEmptyCreationResponse(template.type)); // fails to create item
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
    });
  });
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
