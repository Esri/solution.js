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
    itemTemplate.estimatedDeploymentCostFactor = 2; // minimal set is starting, creating, done|failed

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
        common.getGroup(itemInfo.id, authentication).then(
          groupResponse => {
            groupResponse.id = itemTemplate.item.id;
            itemTemplate.item = groupResponse;
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
  resourceFilePaths: common.IDeployFileCopyPath[],
  storageAuthentication: common.UserSession,
  templateDictionary: any,
  destinationAuthentication: common.UserSession,
  progressTickCallback: () => void
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // Replace the templatized symbols in a copy of the template
    let newItemTemplate: common.IItemTemplate = common.cloneObject(template);
    newItemTemplate = common.replaceInTemplate(
      newItemTemplate,
      templateDictionary
    );

    // handle group
    getAvailableGroupTitle(
      newItemTemplate.item.title,
      newItemTemplate.itemId,
      destinationAuthentication
    ).then(
      title => {
        // Set the item title with a valid name for the ORG
        newItemTemplate.item.title = title;
        newItemTemplate.item.access = "private";
        common
          .createGroup(newItemTemplate.item, destinationAuthentication)
          .then(
            createResponse => {
              progressTickCallback();
              if (createResponse.success) {
                newItemTemplate.itemId = createResponse.group.id;
                templateDictionary[template.itemId] = {
                  itemId: createResponse.group.id
                };

                // Update the template again now that we have the new item id
                newItemTemplate = common.replaceInTemplate(
                  newItemTemplate,
                  templateDictionary
                );

                // Copy resources
                common
                  .copyFilesFromStorageItem(
                    storageAuthentication,
                    resourceFilePaths,
                    createResponse.group.id,
                    destinationAuthentication
                  )
                  .then(
                    () => {
                      // Update the template dictionary with the new id
                      templateDictionary[template.itemId].itemId =
                        createResponse.group.id;

                      updateGroup(
                        newItemTemplate,
                        destinationAuthentication,
                        templateDictionary
                      ).then(
                        () => {
                          progressTickCallback();
                          resolve(createResponse.group.id);
                        },
                        e => reject(common.fail(e))
                      );
                    },
                    e => reject(common.fail(e))
                  );
              } else {
                reject(common.fail());
              }
            },
            e => reject(common.fail(e))
          );
      },
      e => reject(common.fail(e))
    );
  });
}

export function getAvailableGroupTitle(
  name: string,
  id: string,
  authentication: common.UserSession
): Promise<any> {
  return new Promise<string>((resolve, reject) => {
    common.searchGroups(name, authentication).then(
      searchResult => {
        // if we find a group call the func again with a new name
        const results: any[] = common.getProp(searchResult, "results");
        if (results && results.length > 0) {
          getAvailableGroupTitle(
            name + "_" + id,
            common.getUTCTimestamp(),
            authentication
          ).then(
            title => {
              resolve(title);
            },
            e => reject(common.fail(e))
          );
        } else {
          resolve(name);
        }
      },
      e => reject(common.fail(e))
    );
  });
}

export function updateGroup(
  newItemTemplate: common.IItemTemplate,
  authentication: common.UserSession,
  templateDictionary: any
): Promise<any> {
  return new Promise<string>((resolve, reject) => {
    const defArray: any[] = [];
    const groupId: string = newItemTemplate.itemId;
    newItemTemplate.dependencies.forEach(d => {
      defArray.push(
        common.shareItem(groupId, templateDictionary[d].itemId, authentication)
      );
    });
    Promise.all(defArray).then(
      a => {
        resolve();
      },
      e => reject(common.fail(e))
    );
  });
}
