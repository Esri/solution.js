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

import * as auth from "@esri/arcgis-rest-auth";
import * as common from "@esri/solution-common";
import * as fsUtils from "./featureServiceHelpers";

//#endregion

//#region Publish Process --------------------------------------------------------------------------------------//

/**
 * Fills in missing data, including full layer and table definitions, in a feature services' definition.
 *
 * @param itemInfo Feature service item
 * @param userSession The session used to interact with the service the template is based on
 * @return A promise that will resolve when fullItem has been updated
 * @protected
 */
export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  userSession: auth.UserSession
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>((resolve, reject) => {
    const requestOptions: auth.IUserRequestOptions = {
      authentication: userSession
    };

    // Init template
    const template: common.IItemTemplate = common.createInitializedItemTemplate(
      itemInfo
    );

    // Update the estimated cost factor to deploy this item
    template.estimatedDeploymentCostFactor = 3;

    common.getServiceLayersAndTables(template, requestOptions).then(
      itemTemplate => {
        // Extract dependencies
        common.extractDependencies(itemTemplate, requestOptions).then(
          (dependencies: common.IDependency[]) => {
            // set the dependencies as an array of IDs from the array of IDependency
            itemTemplate.dependencies = dependencies.map((dep: any) => dep.id);

            // resolve the template with templatized values
            resolve(fsUtils.templatize(itemTemplate, dependencies));
          },
          (e: any) => reject(common.fail(e))
        );
      },
      e => reject(common.fail(e))
    );
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
 * @param requestOptions Options for the request
 * @return A promise that will resolve with the id of the created item
 * @protected
 */
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
    const requestOptions: auth.IUserRequestOptions = {
      authentication: destinationUserSession
    };

    let newItemTemplate = common.cloneObject(template) as common.IItemTemplate;

    // cache the popup info to be added later
    const popupInfos: fsUtils.IPopupInfos = fsUtils.cachePopupInfos(
      newItemTemplate.data
    );

    // Create the item, then update its URL with its new id
    common
      .createFeatureService(
        newItemTemplate.item,
        newItemTemplate.data,
        newItemTemplate.properties,
        requestOptions,
        templateDictionary.folderId,
        templateDictionary.isPortal
      )
      .then(
        createResponse => {
          progressTickCallback();

          if (createResponse.success) {
            // Detemplatize what we can now that the service has been created
            newItemTemplate = fsUtils.updateTemplate(
              newItemTemplate,
              templateDictionary,
              createResponse
            );
            // Add the layers and tables to the feature service
            fsUtils
              .addFeatureServiceLayersAndTables(
                newItemTemplate,
                templateDictionary,
                popupInfos,
                requestOptions,
                progressTickCallback
              )
              .then(
                () => {
                  // Update the item with snippet, description, popupInfo, ect.
                  common
                    .updateItem(
                      createResponse.serviceItemId,
                      newItemTemplate.item,
                      requestOptions
                    )
                    .then(
                      () => resolve(createResponse.serviceItemId),
                      (e: any) => reject(common.fail(e))
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

//#endregion
