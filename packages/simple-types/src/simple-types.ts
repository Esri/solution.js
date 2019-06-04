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

import * as auth from "@esri/arcgis-rest-auth";
import * as common from "@esri/solution-common";
import * as portal from "@esri/arcgis-rest-portal";
import * as webmap from "./webmap";
import * as webmappingapplication from "./webmappingapplication";

// ------------------------------------------------------------------------------------------------------------------ //

export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  userSession: auth.UserSession
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>(resolve => {
    console.log(
      "convertItemToTemplate for a " +
        itemInfo.type +
        " (" +
        itemInfo.title +
        ";" +
        itemInfo.id +
        ")"
    );
    const requestOptions: auth.IUserRequestOptions = {
      authentication: userSession
    };

    // Init template
    const itemTemplate: common.IItemTemplate = common.createInitializedTemplate(
      itemInfo
    );
    itemTemplate.estimatedDeploymentCostFactor = 2; // minimal set is starting, creating, done|failed

    // Templatize item info property values
    itemTemplate.item.id = common.templatizeTerm(
      itemTemplate.item.id,
      itemTemplate.item.id,
      ".id"
    );
    if (itemTemplate.item.item) {
      itemTemplate.item.item = common.templatizeTerm(
        itemTemplate.item.item,
        itemTemplate.item.item,
        ".id"
      );
    }

    // Use the initiative's extent
    // itemTemplate.item.extent = "{{initiative.extent:optional}}";

    // Request item resources
    const resourcePromise = portal
      .getItemResources(itemTemplate.itemId, requestOptions)
      .then(resourcesResponse => {
        // Save resources to solution item
        itemTemplate.resources = (resourcesResponse.resources as any[]).map(
          (resourceDetail: any) => resourceDetail.resource
        );
        const resourceItemFilePaths: common.ISourceFileCopyPath[] = common.generateSourceItemFilePaths(
          "https://www.arcgis.com/sharing/",
          itemTemplate.itemId,
          itemTemplate.item.thumbnail,
          itemTemplate.resources
        );
        return common.copyFilesToStorageItem(
          requestOptions,
          resourceItemFilePaths,
          solutionItemId,
          requestOptions
        );
      })
      .catch(() => Promise.resolve([]));

    // Perform type-specific handling
    let itemDataPromise = Promise.resolve({});
    switch (itemInfo.type.toLowerCase()) {
      case "dashboard":
      case "feature service":
      case "project package":
      case "workforce project":
      case "web map":
      case "web mapping application":
        itemDataPromise = getItemData(itemTemplate.itemId, userSession);
        break;
      case "code attachment":
      case "form":
        break;
    }

    Promise.all([itemDataPromise, resourcePromise]).then(responses => {
      const [itemDataResponse, savedResourceFilenames] = responses;
      itemTemplate.data = itemDataResponse;
      itemTemplate.resources = savedResourceFilenames;

      switch (itemInfo.type.toLowerCase()) {
        case "web map":
          /* tslint:disable-next-line:no-floating-promises */
          webmap.convertItemToTemplate(itemTemplate, userSession);
          break;
        case "web mapping application":
          /* tslint:disable-next-line:no-floating-promises */
          webmappingapplication.convertItemToTemplate(
            itemTemplate,
            userSession
          );
          break;
      }

      resolve(itemTemplate);
    }, common.fail);
  });
}

export function createItemFromTemplate(
  template: common.IItemTemplate,
  resourceFilePaths: common.IDeployFileCopyPath[],
  storageUserSession: auth.UserSession,
  templateDictionary: any,
  destinationUserSession: auth.UserSession,
  progressTickCallback: () => void
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    console.log(
      "createItemFromTemplate for a " +
        template.type +
        " (" +
        template.itemId +
        ")"
    );

    // Replace the templatized symbols in a copy of the template
    let newItemTemplate = common.cloneObject(template) as common.IItemTemplate;
    newItemTemplate = common.replaceInTemplate(
      newItemTemplate,
      templateDictionary
    );

    // Create the item, then update its URL with its new id
    common
      .createItemWithData(
        newItemTemplate.item,
        newItemTemplate.data,
        { authentication: destinationUserSession },
        templateDictionary.folderId
      )
      .then(
        createResponse => {
          progressTickCallback();

          if (createResponse.success) {
            // Add the new item to the settings
            templateDictionary[template.itemId] = {
              id: createResponse.id
            };

            // Copy resources, metadata, thumbnail
            const resourcesDef = common.copyFilesFromStorageItem(
              { authentication: storageUserSession },
              resourceFilePaths,
              createResponse.id,
              { authentication: destinationUserSession }
            );

            // The item's URL includes its id, so it needs to be updated
            const updateUrlDef = common.updateItemURL(
              createResponse.id,
              common.replaceInTemplate(
                newItemTemplate.item.url,
                templateDictionary
              ),
              { authentication: destinationUserSession }
            );

            Promise.all([resourcesDef, updateUrlDef]).then(
              () => {
                progressTickCallback();

                // Update the template dictionary with the new id
                templateDictionary[template.itemId].id = createResponse.id;

                resolve(createResponse.id);
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

// ------------------------------------------------------------------------------------------------------------------ //

function getItemData(
  itemId: string,
  userSession: auth.UserSession
): Promise<any> {
  // Get item data
  const itemDataParam: portal.IItemDataOptions = {
    authentication: userSession
  };
  return portal.getItemData(itemId, itemDataParam);
}
