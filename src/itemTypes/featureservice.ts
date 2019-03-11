/*
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

import * as adlib from "adlib";
import * as featureServiceAdmin from "@esri/arcgis-rest-feature-service-admin";
import * as items from "@esri/arcgis-rest-items";
import { request } from "@esri/arcgis-rest-request";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

import * as mCommon from "./common";
import { ITemplate, IProgressUpdate } from "../interfaces";

// -- Externals ------------------------------------------------------------------------------------------------------//

// -- Create Bundle Process ------------------------------------------------------------------------------------------//

export function convertItemToTemplate (
  itemTemplate: ITemplate,
  requestOptions?: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    // Update the estimated cost factor to deploy this item
    itemTemplate.estimatedDeploymentCostFactor = 3;

    // Common templatizations: extent, item id, item dependency ids
    mCommon.doCommonTemplatizations(itemTemplate);

    fleshOutFeatureService(itemTemplate, requestOptions)
    .then(
      () => resolve(itemTemplate),
      (e) => reject(mCommon.fail(e))
    );
  });
}

// -- Deploy Bundle Process ------------------------------------------------------------------------------------------//

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
export function createItemFromTemplate (
  itemTemplate: ITemplate,
  settings: any,
  requestOptions: IUserRequestOptions,
  progressCallback?: (update:IProgressUpdate) => void
): Promise<ITemplate> {
  progressCallback && progressCallback({
    processId: itemTemplate.key,
    type: itemTemplate.type,
    status: "starting"
  });

  return new Promise((resolve, reject) => {
    const createOptions = {
      item: itemTemplate.item,
      folderId: settings.folderId,
      ...requestOptions
    }
    if (itemTemplate.data) {
      createOptions.item.text = itemTemplate.data;
    }

    // Make the item name unique
    createOptions.item.name = itemTemplate.item.name + "_" + mCommon.getUTCTimestamp();

    // Create the item
    progressCallback && progressCallback({
      processId: itemTemplate.key,
      status: "creating",
    });
    featureServiceAdmin.createFeatureService(createOptions)
    .then(
      createResponse => {
        // Add the new item to the settings list
        settings[itemTemplate.itemId] = {
          id: createResponse.serviceItemId,
          url: createResponse.serviceurl
        };
        itemTemplate.itemId = itemTemplate.item.id = createResponse.serviceItemId;
        itemTemplate = adlib.adlib(itemTemplate, settings);
        itemTemplate.item.url = createResponse.serviceurl;

        // Update item using a unique name because createFeatureService doesn't provide a way to specify
        // snippet, description, etc.
        const updateOptions:items.IItemUpdateRequestOptions = {
          item: {
            id: itemTemplate.itemId,
            title: itemTemplate.item.title,
            snippet: itemTemplate.item.snippet,
            description: itemTemplate.item.description,
            accessInfo: itemTemplate.item.accessInfo,
            licenseInfo: itemTemplate.item.licenseInfo,
            text: itemTemplate.data
          },
          ...requestOptions
        };

        items.updateItem(updateOptions)
        .then(
          () => {
            // Add the feature service's layers and tables to it
            addFeatureServiceLayersAndTables(itemTemplate, settings, requestOptions, progressCallback)
            .then(
              () => {
                mCommon.finalCallback(itemTemplate.key, true, progressCallback);
                resolve(itemTemplate);
              },
              (e) => {
                mCommon.finalCallback(itemTemplate.key, false, progressCallback);
                reject(mCommon.fail(e));
              }
            );
          },
          (e) => {
            mCommon.finalCallback(itemTemplate.key, false, progressCallback);
            reject(mCommon.fail(e));
          }
        );
      },
      (e) => {
        mCommon.finalCallback(itemTemplate.key, false, progressCallback);
        reject(mCommon.fail(e));
      }
    )
  });
}

// -- Internals ------------------------------------------------------------------------------------------------------//
// (export decoration is for unit testing)

/**
 * Holds the extra information needed by feature services.
 */
export interface IFeatureServiceProperties {
  /**
   * Service description
   */
  service: any;
  /**
   * Description for each layer
   */
  layers: any[];
  /**
   * Description for each table
   */
  tables: any[];
}

/**
 * Storage of a one-way relationship.
 * @protected
 */
interface IRelationship {
  /**
   * Relationship id and the ids of the items that it is related to.
   */
  [id:string]: string[];
}

/**
 * Adds the layers and tables of a feature service to it and restores their relationships.
 *
 * @param itemTemplate Feature service
 * @param settings Hash mapping Solution source id to id of its clone (and name & URL for feature
 *            service)
 * @param requestOptions Options for the request
 * @return A promise that will resolve when fullItem has been updated
 * @protected
 */
export function addFeatureServiceLayersAndTables (
  itemTemplate: ITemplate,
  settings: any,
  requestOptions: IUserRequestOptions,
  progressCallback?: (update:IProgressUpdate) => void
): Promise<void> {
  return new Promise((resolve, reject) => {

    // Sort layers and tables by id so that they're added with the same ids
    const properties:any = itemTemplate.properties as IFeatureServiceProperties;
    const layersAndTables:any[] = [];

    (properties.layers || []).forEach(function (layer:any) {
      layersAndTables[layer.id] = {
        item: layer,
        type: "layer"
      };
    });

    (properties.tables || []).forEach(function (table:any) {
      layersAndTables[table.id] = {
        item: table,
        type: "table"
      };
    });

    // Hold a hash of relationships
    const relationships:IRelationship = {};

    // Add the service's layers and tables to it
    if (layersAndTables.length > 0) {
      updateFeatureServiceDefinition(itemTemplate.itemId, itemTemplate.item.url, layersAndTables,
        settings, relationships, requestOptions, itemTemplate.key, progressCallback)
      .then(
        () => {
          // Restore relationships for all layers and tables in the service
          const awaitRelationshipUpdates:Array<Promise<void>> = [];
          Object.keys(relationships).forEach(
            id => {
              awaitRelationshipUpdates.push(new Promise((resolveFn, rejectFn) => {
                const options = {
                  params: {
                    updateFeatureServiceDefinition: {
                      relationships: relationships[id]
                    }
                  },
                  ...requestOptions
                };
                featureServiceAdmin.addToServiceDefinition(itemTemplate.item.url + "/" + id, options)
                .then(
                  () => {
                    progressCallback && progressCallback({
                      processId: itemTemplate.key,
                      status: "updated relationship"
                    });
                    resolveFn();
                  },
                  () => rejectFn()
                );
              }));
            }
          );
          Promise.all(awaitRelationshipUpdates)
          .then(
            () => resolve(),
            (e) => reject(mCommon.fail(e))
          );
        },
        (e) => reject(mCommon.fail(e))
      );
    } else {
      resolve();
    }
  });
}

export function countRelationships (
  layers: any[]
): number {
  const reducer = (accumulator:number, currentLayer:any) =>
    accumulator + (currentLayer.relationships ? currentLayer.relationships.length : 0);

  return layers.reduce(reducer, 0);
}

/**
 * Fills in missing data, including full layer and table definitions, in a feature services' definition.
 *
 * @param itemTemplate Feature service item, data, dependencies definition to be modified
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve when fullItem has been updated
 * @protected
 */
export function fleshOutFeatureService (
  itemTemplate: ITemplate,
  requestOptions: IUserRequestOptions
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const properties:IFeatureServiceProperties = {
      service: {},
      layers: [],
      tables: []
    };

    // To have enough information for reconstructing the service, we'll supplement
    // the item and data sections with sections for the service, full layers, and
    // full tables

    // Get the service description
    const serviceUrl = itemTemplate.item.url;
    itemTemplate.item.url = mCommon.templatize(itemTemplate.itemId, "url");
    request(serviceUrl + "?f=json", requestOptions)
    .then(
      serviceData => {
        serviceData.serviceItemId = mCommon.templatize(serviceData.serviceItemId);
        properties.service = serviceData;

        // Get the affiliated layer and table items
        Promise.all([
          getLayers(serviceUrl, serviceData["layers"], requestOptions),
          getLayers(serviceUrl, serviceData["tables"], requestOptions)
        ])
        .then(
          results => {
            properties.layers = results[0];
            properties.tables = results[1];
            itemTemplate.properties = properties;

            itemTemplate.estimatedDeploymentCostFactor +=
              properties.layers.length +               // layers
              countRelationships(properties.layers) +  // layer relationships
              properties.tables.length +               // tables & estimated single relationship for each
              countRelationships(properties.tables);   // table relationships

            resolve();
          },
          (e) => reject(mCommon.fail(e))
        );
      },
      (e) => reject(mCommon.fail(e))
    );
  });
}

/**
 * Gets the full definitions of the layers affiliated with a hosted service.
 *
 * @param serviceUrl URL to hosted service
 * @param layerList List of layers at that service
 * @param requestOptions Options for the request
 * @return A promise that will resolve with a list of the enhanced layers
 * @protected
 */
export function getLayers (
  serviceUrl: string,
  layerList: any[],
  requestOptions: IUserRequestOptions
): Promise<any[]> {
  return new Promise<any[]>((resolve, reject) => {
    if (!Array.isArray(layerList) || layerList.length === 0) {
      resolve([]);
    }

    const requestsDfd:Array<Promise<any>> = [];
    layerList.forEach(layer => {
      requestsDfd.push(request(serviceUrl + "/" + layer["id"] + "?f=json", requestOptions));
    });

    // Wait until all layers are heard from
    Promise.all(requestsDfd)
    .then(
      layers => {
        // Remove the editFieldsInfo because it references fields that may not be in the layer/table;
        // templatize the layer's serviceItemId
        layers.forEach(layer => {
          layer["editFieldsInfo"] = null;
          layer["serviceItemId"] = mCommon.templatize(layer["serviceItemId"]);
        });
        resolve(layers);
      },
      (e) => reject(mCommon.fail(e))
    );
  });
}

/**
 * Updates a feature service with a list of layers and/or tables.
 *
 * @param serviceItemId AGOL id of feature service
 * @param serviceUrl URL of feature service
 * @param listToAdd List of layers and/or tables to add
 * @param settings Hash mapping Solution source id to id of its clone (and name & URL for feature
 *            service)
 * @param relationships Hash mapping a layer's relationship id to the ids of its relationships
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve when the feature service has been updated
 * @protected
 */
function updateFeatureServiceDefinition(
  serviceItemId: string,
  serviceUrl: string,
  listToAdd: any[],
  settings: any,
  relationships: IRelationship,
  requestOptions: IUserRequestOptions,
  key: string,
  progressCallback?: (update:IProgressUpdate) => void
): Promise<void> {
  // Launch the adds serially because server doesn't support parallel adds
  return new Promise((resolve, reject) => {
    if (listToAdd.length > 0) {
      const toAdd = listToAdd.shift();

      const item = toAdd.item;
      const originalId = item.id;
      delete item.serviceItemId;  // Updated by updateFeatureServiceDefinition

      // Need to remove relationships and add them back individually after all layers and tables
      // have been added to the definition
      if (Array.isArray(item.relationships) && item.relationships.length > 0) {
        relationships[originalId] = item.relationships;
        item.relationships = [];
      }

      const options:featureServiceAdmin.IAddToServiceDefinitionRequestOptions = {
        ...requestOptions
      };

      // Need to add layers and tables one at a time, waiting until one is complete before moving on to the next one
      if (toAdd.type === "layer") {
        item.adminLayerInfo = {  // ???
          "geometryField": {
            "name": "Shape",
            "srid": 102100
          }
        };
        options.layers = [item];
      } else {
        options.tables = [item];
      }

      featureServiceAdmin.addToServiceDefinition(serviceUrl, options)
      .then(
        () => {
          progressCallback && progressCallback({
            processId: key,
            status: "added layer"
          });

          updateFeatureServiceDefinition(serviceItemId, serviceUrl, listToAdd, settings, relationships,
            requestOptions, key, progressCallback)
          .then(
            () => resolve(),
            (e) => reject(mCommon.fail(e))
          );
        },
        (e) => reject(mCommon.fail(e))
      );
    } else {
      resolve();
    }
  });
}

