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
import {
  IModel,
  cloneObject,
  failSafe,
  serializeModel,
  interpolateItemId,
  stringToBlob
} from "@esri/hub-common";

import { UserSession } from "@esri/solution-common";

import {
  createItem,
  updateItem,
  addItemResource,
  ICreateItemOptions,
  ICreateItemResponse,
  IUpdateItemOptions,
  moveItem
} from "@esri/arcgis-rest-portal";

/**
 * Given a Model for a Web Experience, create the item in the Portal API
 *
 * @param model
 * @param options
 * @param authentication
 */
export function createWebExperience(
  model: IModel,
  folderId: string,
  options: any,
  authentication: UserSession
): Promise<IModel> {
  const resources: any[] = [];

  // For unkown reasons we can not seem to spy on createItemInFolder
  // so we will create-then-move for now
  const createOptions: ICreateItemOptions = {
    // need to serialize
    item: serializeModel(model),
    authentication
  };

  /* istanbul ignore else */
  if (model.item.thumbnail) {
    createOptions.params = {
      // Pass thumbnail file in via params because item property is serialized, which discards a blob
      thumbnail: model.item.thumbnail
    };
    delete createOptions.item.thumbnail;
  }

  // Create the item
  return (
    createItem(createOptions)
      .then((createResponse: ICreateItemResponse) => {
        model.item.id = createResponse.id;

        const savedThumbnail = model.item.thumbnail;
        model = interpolateItemId(model);
        model.item.thumbnail = savedThumbnail; // interpolation trashes thumbnail binary

        // Experiences store draft data in a resource attached to the item
        // We'll just use the published data for the first "draft"
        const draftResourceModel = cloneObject(model.data);
        resources.push({
          name: "config.json",
          prefix: "config",
          file: stringToBlob(JSON.stringify(draftResourceModel))
        });
        // there may also be this image resources list
        const imageListModel = cloneObject(model.properties.imageResourcesList);
        if (imageListModel) {
          resources.push({
            name: "image-resources-list.json",
            prefix: "images",
            file: stringToBlob(JSON.stringify(imageListModel))
          });
        }

        delete model.properties;
        // update the experience with the newly interpolated model
        const updateOptions: IUpdateItemOptions = {
          item: serializeModel(model),
          authentication
        };
        if (model.item.thumbnail) {
          updateOptions.params = {
            // Pass thumbnail file in via params because item property is serialized, which discards a blob
            thumbnail: model.item.thumbnail
          };
          delete updateOptions.item.thumbnail;
        }

        return Promise.all([
          updateItem(updateOptions),
          authentication.getUsername()
        ]);
      })
      .then((responses: any[]) => {
        const username = responses[1];
        const failSafeAddItemResource = failSafe(addItemResource, {
          success: true
        });
        // upload the data and oembed resources
        const resourceUploadPromises = resources.map(resource =>
          failSafeAddItemResource({
            id: model.item.id,
            owner: username,
            resource: resource.file,
            name: resource.name,
            prefix: resource.prefix,
            authentication
          })
        );
        // fire and forget
        return Promise.all(resourceUploadPromises);
      })
      // .then(() => {
      //   // TODO: Can we leave this to the main process?
      //   return uploadResourcesFromUrl(model, options.assets || [], authentication);
      // })
      .then(() => {
        // Move it
        return moveItem({
          itemId: model.item.id,
          folderId,
          authentication
        });
      })
      .then(() => {
        return model;
      })
  );
}
