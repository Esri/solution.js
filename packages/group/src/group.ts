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
            itemTemplate.item = {
              ...groupResponse,
              type: "Group"
            };

            // Request resources
            common.getItemResources(itemTemplate.itemId, authentication).then(
              resourcesResponse => {
                // Save resources to solution item
                itemTemplate.resources = (resourcesResponse.resources as any[]).map(
                  (resourceDetail: any) => resourceDetail.resource
                );
                const resourceFilePaths: common.ISourceFileCopyPath[] = common.generateSourceFilePaths(
                  authentication.portal,
                  itemTemplate.itemId,
                  itemTemplate.item.thumbnail,
                  itemTemplate.resources,
                  true
                );
                common
                  .copyFilesToStorageItem(
                    authentication,
                    resourceFilePaths,
                    solutionItemId,
                    authentication
                  )
                  .then(savedResourceFilenames => {
                    itemTemplate.resources = (savedResourceFilenames as any[]).filter(
                      item => !!item
                    );
                    resolve(itemTemplate);
                  }, reject);
              },
              () => resolve(itemTemplate)
            );
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
    const title: string = common.getUniqueTitle(
      newItemTemplate.item.title || "",
      templateDictionary,
      "user.groups"
    );
    // Set the item title with a valid name for the ORG
    newItemTemplate.item.title = title;
    newItemTemplate.item.access = "private";
    common.createGroup(newItemTemplate.item, destinationAuthentication).then(
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
              destinationAuthentication,
              true
            )
            .then(
              () => {
                // Update the template dictionary with the new id
                templateDictionary[template.itemId].itemId =
                  createResponse.group.id;

                _updateGroup(
                  newItemTemplate,
                  destinationAuthentication,
                  templateDictionary,
                  newItemTemplate.dependencies
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
  });
}

/**
 * Shares dependencies with the group
 *
 * @param newItemTemplate the items template with key properties
 * @param authentication The session used to create the new item(s)
 * @param templateDictionary Hash of facts: org URL, adlib replacements, deferreds for dependencies
 * @param dependencies Array of dependencies to share with the group
 *
 * @return A promise that will resolve when the items have been shared
 */
export function _updateGroup(
  newItemTemplate: common.IItemTemplate,
  authentication: common.UserSession,
  templateDictionary: any,
  dependencies: string[]
): Promise<any> {
  return new Promise<string>((resolve, reject) => {
    const defArray: any[] = [];
    const groupId: string = newItemTemplate.itemId;
    dependencies.forEach(d => {
      defArray.push(
        common.shareItem(groupId, templateDictionary[d].itemId, authentication)
      );
    });
    Promise.all(defArray).then(
      () => resolve(),
      e => reject(common.fail(e))
    );
  });
}

/**
 * Shares any circular dependencies with the group
 *
 * @param newItemTemplate the items template with key properties
 * @param authentication The session used to create the new item(s)
 * @param templateDictionary Hash of facts: org URL, adlib replacements, deferreds for dependencies
 *
 * @return A promise that will resolve when circular dependencies have been handled
 */
export function postProcessCircularDependencies(
  newItemTemplate: common.IItemTemplate,
  authentication: common.UserSession,
  templateDictionary: any
): Promise<any> {
  return _updateGroup(
    newItemTemplate,
    authentication,
    templateDictionary,
    newItemTemplate.circularDependencies
  );
}
