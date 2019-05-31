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

// ------------------------------------------------------------------------------------------------------------------ //

export function convertItemToTemplate(
  itemInfo: any,
  userSession: auth.UserSession
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>(resolve => {
    console.log(
      "convertItemToTemplate for a " + itemInfo.type + " (" + itemInfo.id + ")"
    );

    // Init template
    const itemTemplate = common.createPlaceholderTemplate(
      itemInfo.id,
      itemInfo.type
    );
    itemTemplate.estimatedDeploymentCostFactor = 3; // minimal set is starting, creating, done|failed
    itemTemplate.item = {
      ...itemTemplate.item,
      categories: itemInfo.categories,
      culture: itemInfo.culture,
      description: itemInfo.description,
      extent: itemInfo.extent,
      licenseInfo: itemInfo.licenseInfo,
      snippet: itemInfo.snippet,
      tags: itemInfo.tags,
      title: itemInfo.title,
      type: itemInfo.type,
      typeKeywords: itemInfo.typeKeywords,
      url: common.templatize(itemInfo.url, itemTemplate.item.id, ".id")
    };

    // Templatize item info property values
    itemTemplate.item.id = common.templatize(
      itemTemplate.item.id,
      itemTemplate.item.id,
      ".id"
    );
    if (itemTemplate.item.item) {
      itemTemplate.item.item = common.templatize(
        itemTemplate.item.item,
        itemTemplate.item.item,
        ".id"
      );
    }

    if (itemInfo.type === "Form") {
      resolve(itemTemplate);
    } else {
      // Get item data
      const itemDataParam: portal.IItemDataOptions = {
        authentication: userSession
      };
      portal.getItemData(itemInfo.id, itemDataParam).then(
        itemData => {
          itemTemplate.data = itemData;

          // Update dependencies

          // Templatize item data property values

          resolve(itemTemplate);
        },
        () => resolve(itemTemplate) // No data for item
      );
    }
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
