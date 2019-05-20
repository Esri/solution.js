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

import * as auth from "@esri/arcgis-rest-auth";
import * as common from "@esri/solution-common";

// ------------------------------------------------------------------------------------------------------------------ //

export function convertItemToTemplate(
  itemInfo: any,
  userSession: auth.UserSession
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>(resolve => {
    console.log("convertItemToTemplate for a feature-layer");
    resolve(undefined);
  });
}

export function createItemFromTemplate(
  template: common.IItemTemplate,
  templateDictionary: any,
  userSession: auth.UserSession,
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
      .createFeatureService(
        newItemTemplate.item,
        newItemTemplate.data,
        { authentication: userSession },
        templateDictionary.folderId
      )
      .then(
        createResponse => {
          progressTickCallback();

          if (createResponse.success) {
            // Update the template dictionary with the new id & url
            templateDictionary[template.itemId] = {
              id: createResponse.serviceItemId,
              url: createResponse.serviceurl
            };

            // Add the feature service's layers and tables to it
            resolve(createResponse.serviceItemId);
          } else {
            reject(common.fail());
          }
        },
        e => reject(common.fail(e))
      );
  });
}
