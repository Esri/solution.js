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
 * Provides common functions involving the arcgis-rest-js library.
 *
 * @module restHelpers
 */

import * as auth from "@esri/arcgis-rest-auth";
import * as generalHelpers from "./generalHelpers";
import * as portal from "@esri/arcgis-rest-portal";
import * as serviceAdmin from "@esri/arcgis-rest-service-admin";
import { IDependency, IItemTemplate } from "./interfaces";
import { request } from "@esri/arcgis-rest-request";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Publishes a feature service as an AGOL item; it does not include its layers and tables
 *
 * @param itemInfo Item's `item` section
 * @param requestOptions Options for the request
 * @param folderId Id of folder to receive item; null indicates that the item goes into the root
 *                 folder
 * @param access Access to set for item: "public", "org", "private"
 * @return A promise that will resolve with an object reporting success and the Solution id
 */
export function createFeatureService(
  itemInfo: any,
  dataInfo: any,
  requestOptions: auth.IUserRequestOptions,
  folderId: string | undefined,
  access = "private"
): Promise<serviceAdmin.ICreateServiceResult> {
  return new Promise((resolve, reject) => {
    // Create item
    const createOptions: serviceAdmin.ICreateServiceOptions = {
      item: {
        ...itemInfo,
        data: dataInfo
      },
      folderId,
      ...requestOptions
    };

    // Make the item name unique
    createOptions.item.name =
      itemInfo.name + "_" + generalHelpers.getUTCTimestamp();

    serviceAdmin.createFeatureService(createOptions).then(
      createResponse => {
        // Update item because createFeatureService doesn't provide a way to specify
        // snippet, description, etc.
        const updateOptions: portal.IUpdateItemOptions = {
          item: {
            id: createResponse.serviceItemId,
            title: itemInfo.title,
            snippet: itemInfo.snippet,
            description: itemInfo.description,
            accessInfo: itemInfo.accessInfo,
            licenseInfo: itemInfo.licenseInfo,
            text: itemInfo.data
          },
          ...requestOptions
        };

        portal.updateItem(updateOptions).then(
          () => {
            if (access !== "private") {
              // Set access if it is not AGOL default
              // Set the access manually since the access value in createItem appears to be ignored
              const accessOptions: portal.ISetAccessOptions = {
                id: createResponse.serviceItemId,
                access: access === "public" ? "public" : "org", // need to use constants rather than string
                ...requestOptions
              };
              portal.setItemAccess(accessOptions).then(
                () => {
                  resolve(createResponse);
                },
                e => reject(generalHelpers.fail(e))
              );
            } else {
              resolve(createResponse);
            }
          },
          e => reject(generalHelpers.fail(e))
        );
      },
      e => reject(generalHelpers.fail(e))
    );
  });
}

/**
 * Publishes an item and its data as an AGOL item.
 *
 * @param itemInfo Item's `item` section
 * @param dataInfo Item's `data` section
 * @param requestOptions Options for the request
 * @param folderId Id of folder to receive item; null indicates that the item goes into the root
 *                 folder; ignored for Group item type
 * @param access Access to set for item: "public", "org", "private"
 * @return A promise that will resolve with an object reporting success and the Solution id
 */
export function createItemWithData(
  itemInfo: any,
  dataInfo: any,
  requestOptions: auth.IUserRequestOptions,
  folderId: string | undefined,
  access = "private"
): Promise<portal.ICreateItemResponse> {
  return new Promise((resolve, reject) => {
    // Create item
    const createOptions: portal.ICreateItemOptions = {
      item: {
        ...itemInfo,
        data: dataInfo
      },
      folderId,
      ...requestOptions
    };

    portal.createItemInFolder(createOptions).then(
      createResponse => {
        if (access !== "private") {
          // Set access if it is not AGOL default
          // Set the access manually since the access value in createItem appears to be ignored
          const accessOptions: portal.ISetAccessOptions = {
            id: createResponse.id,
            access: access === "public" ? "public" : "org", // need to use constants rather than string
            ...requestOptions
          };
          portal.setItemAccess(accessOptions).then(
            () => {
              resolve({
                folder: createResponse.folder,
                id: createResponse.id,
                success: true
              });
            },
            e => reject(generalHelpers.fail(e))
          );
        } else {
          resolve({
            folder: createResponse.folder,
            id: createResponse.id,
            success: true
          });
        }
      },
      e => reject(generalHelpers.fail(e))
    );
  });
}

/**
 * Gets the ids of the dependencies (contents) of an AGOL group.
 *
 * @param fullItem A group whose contents are sought
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve with list of dependent ids or an empty list
 * @protected
 */
export function getGroupContents(
  groupId: string,
  requestOptions: auth.IUserRequestOptions
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const pagingRequest: portal.IGetGroupContentOptions = {
      paging: {
        start: 1,
        num: 100
      },
      ...requestOptions
    };

    // Fetch group items
    getGroupContentsTranche(groupId, pagingRequest).then(
      contents => {
        resolve(contents);
      },
      e => reject(generalHelpers.fail(e))
    );
  });
}

/**
 * Gets the ids of a group's contents.
 *
 * @param groupId Group id
 * @param pagingRequest Options for requesting group contents; note: its paging.start parameter may
 *                      be modified by this routine
 * @return A promise that will resolve with a list of the ids of the group's contents or an empty
 *         list
 * @protected
 */
export function getGroupContentsTranche(
  groupId: string,
  pagingRequest: portal.IGetGroupContentOptions
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    // Fetch group items
    portal.getGroupContent(groupId, pagingRequest).then(
      contents => {
        if (contents.num > 0) {
          // Extract the list of content ids from the JSON returned
          const trancheIds: string[] = contents.items.map(
            (item: any) => item.id
          );

          // Are there more contents to fetch?
          if (contents.nextStart > 0) {
            pagingRequest.paging.start = contents.nextStart;
            getGroupContentsTranche(groupId, pagingRequest).then(
              (allSubsequentTrancheIds: string[]) => {
                // Append all of the following tranches to this tranche and return it
                resolve(trancheIds.concat(allSubsequentTrancheIds));
              },
              e => reject(generalHelpers.fail(e))
            );
          } else {
            resolve(trancheIds);
          }
        } else {
          resolve([]);
        }
      },
      e => reject(generalHelpers.fail(e))
    );
  });
}

/**
 * Updates the URL of an item.
 *
 * @param id AGOL id of item to update
 * @param url URL to assign to item's base section
 * @param requestOptions Options for the request
 * @return A promise that will resolve when the item has been updated
 */
export function updateItemURL(
  id: string,
  url: string,
  requestOptions: auth.IUserRequestOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Update its URL
    const options = {
      item: {
        id,
        url
      },
      ...requestOptions
    };

    portal.updateItem(options).then(
      () => {
        resolve(id);
      },
      e => reject(generalHelpers.fail(e))
    );
  });
}

/**
 * Fills in missing data, including full layer and table definitions, in a feature services' definition.
 *
 * @param itemTemplate Feature service item, data, dependencies definition to be modified
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve when fullItem has been updated
 * @protected
 */
export function fleshOutFeatureService(
  itemTemplate: IItemTemplate,
  requestOptions: auth.IUserRequestOptions
): Promise<IItemTemplate> {
  return new Promise<IItemTemplate>((resolve, reject) => {
    const properties: any = {
      service: {},
      layers: [],
      tables: []
    };

    // To have enough information for reconstructing the service, we'll supplement
    // the item and data sections with sections for the service, full layers, and
    // full tables

    // Get the service description
    const serviceUrl = itemTemplate.item.url;
    request(serviceUrl + "?f=json", requestOptions).then(
      serviceData => {
        properties.service = serviceData;
        Promise.all([
          getLayers(serviceUrl, serviceData["layers"], requestOptions),
          getLayers(serviceUrl, serviceData["tables"], requestOptions)
        ]).then(
          results => {
            properties.layers = results[0];
            properties.tables = results[1];
            itemTemplate.properties = properties;

            itemTemplate.estimatedDeploymentCostFactor +=
              properties.layers.length + // layers
              _countRelationships(properties.layers) + // layer relationships
              properties.tables.length + // tables & estimated single relationship for each
              _countRelationships(properties.tables); // table relationships

            resolve(itemTemplate);
          },
          e => reject(generalHelpers.fail(e))
        );
      },
      (e: any) => reject(generalHelpers.fail(e))
    );
  });
}

export function _countRelationships(layers: any[]): number {
  const reducer = (accumulator: number, currentLayer: any) =>
    accumulator +
    (currentLayer.relationships ? currentLayer.relationships.length : 0);

  return layers.reduce(reducer, 0);
}

/**
 * Gets the full definitions of the layers affiliated with a hosted service.
 *
 * @param serviceUrl URL to hosted service
 * @param layerList List of layers at that service...must contain id
 * @param requestOptions Options for the request
 * @return A promise that will resolve with a list of the layers from the admin api
 */
export function getLayers(
  serviceUrl: string,
  layerList: any[],
  requestOptions: auth.IUserRequestOptions
): Promise<any[]> {
  return new Promise<any[]>((resolve, reject) => {
    if (!Array.isArray(layerList) || layerList.length === 0) {
      resolve([]);
    }

    // get the admin URL
    serviceUrl = serviceUrl.replace("/rest/services", "/rest/admin/services");

    const requestsDfd: Array<Promise<any>> = [];
    layerList.forEach(layer => {
      requestsDfd.push(
        request(serviceUrl + "/" + layer["id"] + "?f=json", requestOptions)
      );
    });

    // Wait until all layers are heard from
    Promise.all(requestsDfd).then(
      layers => resolve(layers),
      e => reject(generalHelpers.fail(e))
    );
  });
}

/**
 * Gets the ids of the dependencies of an AGOL feature service item.
 * Dependencies will only exist when the service is a view.
 *
 * @param itemTemplate Template of item to be created
 * @param requestOptions Options for the request
 * @return A promise that will resolve a list of dependencies
 */
export function extractDependencies(
  itemTemplate: IItemTemplate,
  requestOptions?: auth.IUserRequestOptions
): Promise<IDependency[]> {
  const dependencies: any[] = [];
  return new Promise((resolve, reject) => {
    // Get service dependencies when the item is a view
    if (itemTemplate.properties.service.isView) {
      const url: string = itemTemplate.item.url;
      request(url + "/sources?f=json", requestOptions).then(
        response => {
          if (response && response.services) {
            response.services.forEach((layer: any) => {
              dependencies.push({
                id: layer.serviceItemId,
                name: layer.name
              });
            });
            resolve(dependencies);
          }
        },
        e => reject(generalHelpers.fail(e))
      );
    } else {
      resolve(dependencies);
    }
  });
}
