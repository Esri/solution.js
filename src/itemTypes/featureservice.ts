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

export function convertToTemplate (
  itemTemplate: ITemplate,
  requestOptions?: IUserRequestOptions
): Promise<void> {
  return new Promise(resolve => {

    // Common templatizations: extent, item id, item dependency ids
    mCommon.doCommonTemplatizations(itemTemplate);

    resolve();
  });
}

// -- Deploy Bundle Process ------------------------------------------------------------------------------------------//

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
        // Remove the editFieldsInfo because it references fields that may not be in the layer/table
        layers.forEach(layer => {
          layer["editFieldsInfo"] = null;
        });
        resolve(layers);
      },
      reject
    );
  });
}
