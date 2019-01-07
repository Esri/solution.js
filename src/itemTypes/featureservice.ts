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
import { request } from "@esri/arcgis-rest-request";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

import * as mCommon from "./common";
import { ITemplate } from "../interfaces";

// -- Externals ------------------------------------------------------------------------------------------------------//

// -- Create Bundle Process ------------------------------------------------------------------------------------------//

export function completeItemTemplate (
  itemTemplate: ITemplate,
  requestOptions?: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    // Common templatizations: extent, item id, item dependency ids
    mCommon.doCommonTemplatizations(itemTemplate);

    fleshOutFeatureService(itemTemplate, requestOptions)
    .then(
      () => resolve(itemTemplate),
      reject
    );
  });
}

export function getDependencyIds (
  itemTemplate: ITemplate,
  requestOptions?: IUserRequestOptions
): Promise<string[]> {
  return new Promise(resolve => {
    resolve([]);
  });
}

// -- Deploy Bundle Process ------------------------------------------------------------------------------------------//

/**
 * Creates an item in a specified folder (except for Group item type).
 *
 * @param itemTemplate Item to be created; n.b.: this item is modified
 * @param folderId Id of folder to receive item; null indicates that the item goes into the root
 *                 folder; ignored for Group item type
 * @param settings Hash mapping Solution source id to id of its clone
 * @param requestOptions Options for the request
 * @param orgUrl The base URL for the AGOL organization, e.g., https://myOrg.maps.arcgis.com
 * @return A promise that will resolve with the id of the created item
 * @protected
 */
export function deployItem (
  itemTemplate: ITemplate,
  folderId: string,
  settings: any,
  requestOptions: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    const options = {
      item: itemTemplate.item,
      folderId,
      ...requestOptions
    }
    if (itemTemplate.data) {
      options.item.text = itemTemplate.data;
    }

    // Make the item name unique
    options.item.name += "_" + mCommon.getTimestamp();

    // Create the item
    featureServiceAdmin.createFeatureService(options)
    .then(
      createResponse => {
        // Add the new item to the settings list
        settings[mCommon.deTemplatize(itemTemplate.itemId)] = {
          id: createResponse.serviceItemId,
          url: createResponse.serviceurl
        };
        itemTemplate = adlib.adlib(itemTemplate, settings);
        const propertyTags = adlib.listDependencies(itemTemplate);  // //???
        if (propertyTags.length !== 0) {
          console.error("item " + itemTemplate.key + " has unadlibbed props " + propertyTags);  // //???
        }
        itemTemplate.item.url = createResponse.serviceurl;

        // Add the feature service's layers and tables to it
        addFeatureServiceLayersAndTables(itemTemplate, settings, requestOptions)
        .then(
          () => resolve(itemTemplate),
          reject
        );
      },
      reject
    );
  });
}

export function interpolateTemplate (
  itemTemplate: ITemplate,
  replacements: any
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    resolve(itemTemplate);// //???
  });
}

export function handlePrecreateLogic (
  itemTemplate: ITemplate
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    resolve(itemTemplate);// //???
  });
}

export function createItem (
  itemTemplate: ITemplate
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    resolve(itemTemplate);// //???
  });
}

export function handlePostcreateLogic (
  itemTemplate: ITemplate
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    resolve(itemTemplate);// //???
  });
}

// -- Internals ------------------------------------------------------------------------------------------------------//

/**
 * Holds the extra information needed by feature services.
 */
interface IFeatureServiceProperties {
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
      updateFeatureServiceDefinition(itemTemplate.item.id, itemTemplate.item.url, layersAndTables,
        settings, relationships, requestOptions)
      .then(
        () => {
          // Restore relationships for all layers and tables in the service
          const awaitRelationshipUpdates:Array<Promise<void>> = [];
          Object.keys(relationships).forEach(
            id => {
              awaitRelationshipUpdates.push(new Promise(resolveFn => {
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
                    resolve();
                  },
                  resolveFn);
              }));
            }
          );
          Promise.all(awaitRelationshipUpdates)
          .then(
            () => {
              resolve();
            },
            reject
          );
        },
        reject
      );
    } else {
      resolve();
    }
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
function fleshOutFeatureService (
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
        // Fill in some missing parts
        // If the service doesn't have a name, try to get a name from its layers or tables
        serviceData["name"] = itemTemplate.item["name"] ||
          getFirstUsableName(serviceData["layers"]) ||
          getFirstUsableName(serviceData["tables"]) ||
          "Feature Service";
        serviceData["snippet"] = itemTemplate.item["snippet"];
        serviceData["description"] = itemTemplate.item["description"];

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
            resolve();
          },
          reject
        );
      },
      reject
    );
  });
}

/**
 * Gets the name of the first layer in list of layers that has a name
 * @param layerList List of layers to use as a name source
 * @return The name of the found layer or an empty string if no layers have a name
 * @protected
 */
function getFirstUsableName (
  layerList: any[]
): string {
  let name = "";
  // Return the first layer name found
  if (Array.isArray(layerList) && layerList.length > 0) {
    layerList.some(layer => {
      if (layer["name"] !== "") {
        name = layer["name"];
        return true;
      }
      return false;
    });
  }
  return name;
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
function getLayers (
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
      reject
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
  requestOptions: IUserRequestOptions
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
          updateFeatureServiceDefinition(serviceItemId, serviceUrl, listToAdd, settings, relationships, requestOptions)
          .then(
            () => resolve(),
            reject
          );
        },
        reject
      );
    } else {
      resolve();
    }
  });
}
