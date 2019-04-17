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
import {
  ITemplate,
  IProgressUpdate,
  IStringValuePair,
  INumberValuePair
} from "../interfaces";
import * as objectUtils from "../utils/object-helpers";
import * as fieldUtils from "../utils/field-helpers";

// TODO figure out how to deal with adminLayerInfo geometry field name in terms of templatizing

// -- Externals ------------------------------------------------------------------------------------------------------//

// -- Create Bundle Process ------------------------------------------------------------------------------------------//

//#region Publish

export function convertItemToTemplate(
  itemTemplate: ITemplate,
  requestOptions?: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    // Update the estimated cost factor to deploy this item
    itemTemplate.estimatedDeploymentCostFactor = 3;

    // Common templatizations: extent, item id, item dependency ids
    mCommon.doCommonTemplatizations(itemTemplate);

    fleshOutFeatureService(itemTemplate, requestOptions).then(
      () => {
        // Extract dependencies
        extractDependencies(itemTemplate, requestOptions).then(
          dependencies => {
            // set the dependencies as an array of IDs from the array of IDependency
            itemTemplate.dependencies = dependencies.map(dep => dep.id);

            // update each layers adminLayerInfo
            itemTemplate.properties.layers.forEach((layer: any) => {
              layer.adminLayerInfo = templatizeAdminLayerInfo(
                layer,
                dependencies,
                itemTemplate.itemId
              );
            });

            // update each tables adminLayerInfo
            itemTemplate.properties.tables.forEach((table: any) => {
              table.adminLayerInfo = templatizeAdminLayerInfo(
                table,
                dependencies,
                itemTemplate.itemId
              );
            });

            // templatize values in itemTemplate data
            templatizeData(itemTemplate);

            resolve(itemTemplate);
          },
          e => reject(mCommon.fail(e))
        );
      },
      e => reject(mCommon.fail(e))
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
  itemTemplate: ITemplate,
  requestOptions: IUserRequestOptions
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const properties: IFeatureServiceProperties = {
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
        serviceData.serviceItemId = mCommon.templatize(
          serviceData.serviceItemId
        );
        properties.service = serviceData;

        // Get adminLayerInfo for the service
        // adminLayerInfo allowsus to map a views source service name and any joins that may exist
        getAdminLayersAndTables(itemTemplate, requestOptions).then(
          adminData => {
            // Get the affiliated layer and table items
            Promise.all([
              getLayers(
                serviceUrl,
                serviceData["layers"],
                adminData.adminLayers,
                requestOptions
              ),
              getLayers(
                serviceUrl,
                serviceData["tables"],
                adminData.adminTables,
                requestOptions
              )
            ]).then(
              results => {
                properties.layers = results[0];
                properties.tables = results[1];
                itemTemplate.properties = properties;

                itemTemplate.estimatedDeploymentCostFactor +=
                  properties.layers.length + // layers
                  countRelationships(properties.layers) + // layer relationships
                  properties.tables.length + // tables & estimated single relationship for each
                  countRelationships(properties.tables); // table relationships

                resolve();
              },
              e => reject(mCommon.fail(e))
            );
          },
          e => reject(mCommon.fail(e))
        );
      },
      e => reject(mCommon.fail(e))
    );
  });
}

/**
 * Gets layers and tables via the admin api
 * Must be item owner to publish a solution from a given item
 *
 * @param itemTemplate Feature service item, data, and dependencies
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve after the admin api has been checked
 * @protected
 */
export function getAdminLayersAndTables(
  itemTemplate: ITemplate,
  requestOptions: IUserRequestOptions
): Promise<any> {
  return new Promise((resolve, reject) => {
    const serviceUrl = itemTemplate.item.url;

    // get the admin URL
    const adminUrl = serviceUrl.replace(
      "/rest/services",
      "/rest/admin/services"
    );

    request(adminUrl + "?f=json", requestOptions)
      .then(
        adminData => {
          resolve({
            adminLayers: adminData.layers.filter(
              (l: any) => l.type === "Feature Layer"
            ),
            adminTables: adminData.layers.filter((l: any) => l.type === "Table")
          });
        },
        e => reject(mCommon.fail(e))
      )
      .catch(e => reject(mCommon.fail(e)));
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
export function getLayers(
  serviceUrl: string,
  layerList: any[],
  adminList: any[],
  requestOptions: IUserRequestOptions
): Promise<any[]> {
  return new Promise<any[]>((resolve, reject) => {
    if (!Array.isArray(layerList) || layerList.length === 0) {
      resolve([]);
    }

    const requestsDfd: Array<Promise<any>> = [];
    layerList.forEach(layer => {
      requestsDfd.push(
        request(serviceUrl + "/" + layer["id"] + "?f=json", requestOptions)
      );
    });

    // Wait until all layers are heard from
    Promise.all(requestsDfd).then(
      layers => {
        layers.forEach(layer => {
          const sID = layer["serviceItemId"];
          // templatize the layer's serviceItemId
          layer["serviceItemId"] = mCommon.templatize(layer["serviceItemId"]);

          // Get default adminLayerInfo and add to layer
          // Source service name for views will be templitized when the dependecies are extracted
          if (adminList && adminList.length > 0) {
            // Ensure the name and id match between the adminLayerInfo and current layer
            const subList = adminList.filter(
              l => l.id === layer.id && l.name === layer.name
            );
            layer.adminLayerInfo =
              subList.length === 1 ? subList[0].adminLayerInfo : {};
          }

          fieldUtils.templatizeLayerFieldReferences(layer, sID);
        });
        resolve(layers);
      },
      e => reject(mCommon.fail(e))
    );
  });
}

export function countRelationships(layers: any[]): number {
  const reducer = (accumulator: number, currentLayer: any) =>
    accumulator +
    (currentLayer.relationships ? currentLayer.relationships.length : 0);

  return layers.reduce(reducer, 0);
}

export function templatizeData(itemTemplate: ITemplate): void {
  const data: any = itemTemplate.data || {};

  const jsonLayers: any[] = itemTemplate.properties.layers || [];
  const jsonTables: any[] = itemTemplate.properties.tables || [];
  const jsonItems: any[] = jsonLayers.concat(jsonTables);

  const layers: any[] = data.layers || [];
  const tables: any[] = data.tables || [];
  const _items: any[] = layers.concat(tables);

  _items.forEach((item: any) => {
    const matchingItems = jsonItems.filter(jsonItem => jsonItem.id === item.id);
    fieldUtils.templatizeLayerFieldReferences(
      item,
      itemTemplate.itemId,
      matchingItems.length === 1 ? matchingItems[0] : undefined
    );
  });
}

/**
 * Templatize a layers adminLayerInfo by removing properties that will case issues with clone.
 * Also templatizes the source service name when we are dealing with a view.
 *
 * @param layer The layer to be modified
 * @param dependencies Array of service dependencies
 * @return A new copy of the modified adminLayerInfo for the given layer
 * @protected
 */
export function templatizeAdminLayerInfo(
  layer: any,
  dependencies: IDependency[],
  itemId: string
): any {
  // Create new instance of adminLayerInfo to update for clone
  const adminLayerInfo = Object.assign({}, layer.adminLayerInfo);

  deleteProp(adminLayerInfo, "xssTrustedFields");
  deleteProp(adminLayerInfo, "tableName");

  // const basePath: string = itemId + ".layer" + layer.id + ".fields";

  // const deps = dependencies.filter(dependency => {
  //   return dependency.id === itemId;
  // });
  // return (deps.length === 1) ? mCommon.templatize(deps[0].id, 'name') : undefined;

  // TODO will need to investigate this further...don't see the shape field listed after adding to the definition
  // if (adminLayerInfo.hasOwnProperty("geometryField") && adminLayerInfo.geometryField) {
  //   adminLayerInfo.geometryField = fieldUtils._templatize(
  //     basePath,
  //     adminLayerInfo.geometryField.name
  //   );
  // }

  // Remove unnecessary properties and templatize key properties from viewLayerDefinition
  if (adminLayerInfo.viewLayerDefinition) {
    const viewDef = Object.assign({}, adminLayerInfo.viewLayerDefinition);

    deleteProp(viewDef, "sourceId");
    viewDef.sourceServiceName = templatizeName(
      viewDef.sourceServiceName,
      dependencies
    );

    // Remove unnecessary properties and templatize key properties from viewLayerDefinition.table
    if (viewDef.table) {
      deleteProp(viewDef.table, "sourceId");

      if (viewDef.table.hasOwnProperty("sourceServiceName")) {
        const tName = templatizeName(
          viewDef.table.sourceServiceName,
          dependencies
        );
        viewDef.table.sourceServiceName = tName;

        if (adminLayerInfo.geometryField && adminLayerInfo.geometryField.name) {
          adminLayerInfo.geometryField.name =
            tName + "." + adminLayerInfo.geometryField.name;
          // const name: string = objectUtils.getProp(adminLayerInfo, "geometryField.name") || false;
          // if (name) {
          // TODO will need to investigate this further...don't see the shape field listed after adding to the definition
          //   adminLayerInfo.geometryField.name = tName + "." + fieldUtils._templatize(basePath, name);
          //  adminLayerInfo.geometryField.name = tName + "." + name;
          // }
        }
      }
      if (viewDef.table.relatedTables) {
        viewDef.table.relatedTables.forEach((table: any) => {
          deleteProp(table, "sourceId");
          if (table.hasOwnProperty("sourceServiceName")) {
            table.sourceServiceName = templatizeName(
              table.sourceServiceName,
              dependencies
            );
          }
        });
      }
    }

    adminLayerInfo.viewLayerDefinition = viewDef;
  }
  return adminLayerInfo;
}

/**
 * Templatize the name based on the given dependencies
 *
 * @param lookupName The current name from the source service
 * @param dependencies Array of IDependency for name mapping
 * @return The templatized name || undefined when no matching dependency is found
 * @protected
 */
export function templatizeName(
  lookupName: string,
  dependencies: IDependency[]
): string | string[] | undefined {
  const deps = dependencies.filter(
    dependency => dependency.name === lookupName
  );
  return deps.length === 1 ? mCommon.templatize(deps[0].id, "name") : undefined;
}

//#endregion

// -- Deploy Bundle Process ------------------------------------------------------------------------------------------//

//#region Deploy

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
  itemTemplate: ITemplate,
  settings: any,
  requestOptions: IUserRequestOptions,
  progressCallback?: (update: IProgressUpdate) => void
): Promise<ITemplate> {
  progressCallback &&
    progressCallback({
      processId: itemTemplate.key,
      type: itemTemplate.type,
      status: "starting"
    });

  return new Promise((resolve, reject) => {
    const createOptions = {
      item: itemTemplate.item,
      folderId: settings.folderId,
      params: {
        isView: Boolean(itemTemplate.properties.service.isView)
      },
      preserveLayerIds: true,
      ...requestOptions
    };

    const popupInfos: any = itemTemplate.data
      ? cachePopupInfos(itemTemplate.data)
      : {};

    createOptions.item = setItemProperties(
      createOptions.item,
      itemTemplate,
      ["sourceSchemaChangesAllowed", "serviceDescription", "copyrightText"],
      settings.isPortal
    );

    // Create the item
    progressCallback &&
      progressCallback({
        processId: itemTemplate.key,
        status: "creating"
      });
    featureServiceAdmin.createFeatureService(createOptions).then(
      createResponse => {
        // Add the new item to the settings list
        settings[itemTemplate.itemId] = {
          id: createResponse.serviceItemId,
          url: createResponse.serviceurl,
          name: createResponse.name
        };
        itemTemplate.itemId = itemTemplate.item.id =
          createResponse.serviceItemId;
        itemTemplate = adlib.adlib(itemTemplate, settings);
        itemTemplate.item.url = createResponse.serviceurl;

        // Update item using a unique name because createFeatureService doesn't provide a way to specify
        // snippet, description, etc.
        const updateOptions: items.IItemUpdateRequestOptions = {
          item: {
            id: itemTemplate.itemId,
            title: itemTemplate.item.title,
            snippet: itemTemplate.item.snippet,
            description: itemTemplate.item.description,
            accessInfo: itemTemplate.item.accessInfo,
            licenseInfo: itemTemplate.item.licenseInfo,
            text: itemTemplate.data,
            tags: itemTemplate.item.tags
          },
          ...requestOptions
        };

        items.updateItem(updateOptions).then(
          () => {
            // Add the feature service's layers and tables to it
            addFeatureServiceLayersAndTables(
              itemTemplate,
              settings,
              requestOptions,
              popupInfos,
              progressCallback
            ).then(
              () => {
                mCommon.finalCallback(itemTemplate.key, true, progressCallback);
                resolve(itemTemplate);
              },
              e => {
                mCommon.finalCallback(
                  itemTemplate.key,
                  false,
                  progressCallback
                );
                reject(mCommon.fail(e));
              }
            );
          },
          e => {
            mCommon.finalCallback(itemTemplate.key, false, progressCallback);
            reject(mCommon.fail(e));
          }
        );
      },
      e => {
        mCommon.finalCallback(itemTemplate.key, false, progressCallback);
        reject(mCommon.fail(e));
      }
    );
  });
}

export function setItemProperties(
  item: any,
  itemTemplate: ITemplate,
  properties: string[],
  isPortal: boolean
): any {
  if (itemTemplate.data) {
    // Get the items data
    item.text = itemTemplate.data;
  }

  // Make the item name unique
  item.name = itemTemplate.item.name + "_" + mCommon.getUTCTimestamp();

  // Set the capabilities
  const supportedPortalCapabilities = [
    "Create",
    "Query",
    "Editing",
    "Update",
    "Delete",
    "Uploads",
    "Sync",
    "Extract"
  ];
  const capabilities = objectUtils.getProp(
    itemTemplate,
    "properties.service.capabilities"
  );

  item.capabilities = isPortal
    ? capabilities.filter((capability: any) => {
        return supportedPortalCapabilities.indexOf(capability) > -1;
      })
    : capabilities;

  properties.forEach((p: string) => {
    item[p] = objectUtils.getProp(itemTemplate, "properties.service." + p);
  });
  return item;
}

// -- Internals ------------------------------------------------------------------------------------------------------//
// (export decoration is for unit testing)

//#region Interfaces
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
export interface IRelationship {
  /**
   * Relationship id and the ids of the items that it is related to.
   */
  [id: string]: string[];
}

/**
 * Storage of dependencies.
 * @protected
 */
export interface IDependency {
  /**
   * Dependency item id for templatization.
   */
  id: string;

  /**
   * Dependency service name for name mapping.
   * This is used to find appropriate source service name for views.
   */
  name: string;
}

/**
 * Storage of arguments for postProcess function
 * @protected
 */
export interface IPostProcessArgs {
  /**
   * Status message to show after the layerDefinition is updated.
   */
  message: string;

  /**
   * Key objects to add to the layerDefinition.
   */
  objects: any;

  /**
   * Template of item to be created
   */

  itemTemplate: any;

  /**
   * Options for the request
   */
  requestOptions: IUserRequestOptions;

  /**
   * Callback for IProgressUpdate
   */
  progressCallback: any;
}

export interface IPopupInfos {
  layers: INumberValuePair;
  tables: INumberValuePair;
}

/**
 * Adds the chached popupInfo back to the layer after the service is created.
 * Popup info will be added after the service is created.
 *
 * @param itemTemplate Item to be created; n.b.: this item is modified
 * @param IPopupInfos layer id as the key and popupinfo as the value
 * @protected
 */

/**
 * Removes and caches the current popupInfo from layers in the template.
 * Popup info will be added after the service is created.
 *
 * Some popupInfo causes createService to fail...for example:
 * https://localdeployment.maps.arcgis.com/home/item.html?id=a009c140ad5442abaac377bedf1c6b39
 *
 * @param layers Array of layers from the template.
 * @return IPopupInfos key value pair object with the layer id as the key and popupinfo as the value.
 * @protected
 */
export function cachePopupInfos(data: any): IPopupInfos {
  const popupInfos: IPopupInfos = {
    layers: {},
    tables: {}
  };
  if (data.layers && Array.isArray(data.layers) && data.layers.length > 0) {
    data.layers.forEach((layer: any) => {
      if (layer.hasOwnProperty("popupInfo")) {
        popupInfos.layers[layer.id] = layer.popupInfo;
        layer.popupInfo = {};
      }
    });
  }

  if (data.tables && Array.isArray(data.tables) && data.tables.length > 0) {
    data.tables.forEach((table: any) => {
      if (table.hasOwnProperty("popupInfo")) {
        popupInfos.tables[table.id] = table.popupInfo;
        table.popupInfo = {};
      }
    });
  }
  return popupInfos;
}

/**
 * Gets the ids of the dependencies of an AGOL feature service item.
 * Dependencies will only exist when the service is a view.
 *
 * @param itemTemplate Template of item to be created
 * @param requestOptions Options for the request
 * @return A promise that will resolve a list of dependencies
 * @protected
 */
export function extractDependencies(
  itemTemplate: ITemplate,
  requestOptions?: IUserRequestOptions
): Promise<IDependency[]> {
  const dependencies: any[] = [];
  return new Promise((resolve, reject) => {
    const serviceUrl: string = itemTemplate.item.url;
    itemTemplate.item.url = mCommon.templatize(itemTemplate.itemId, "url");
    // Get service dependencies when the item is a view
    if (itemTemplate.properties.service.isView) {
      request(serviceUrl + "/sources?f=json", requestOptions).then(
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
        e => reject(mCommon.fail(e))
      );
    } else {
      resolve(dependencies);
    }
  });
}
//#endregion

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
export function addFeatureServiceLayersAndTables(
  itemTemplate: ITemplate,
  settings: any,
  requestOptions: IUserRequestOptions,
  popupInfos: any,
  progressCallback?: (update: IProgressUpdate) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Sort layers and tables by id so that they're added with the same ids
    const properties: any = itemTemplate.properties as IFeatureServiceProperties;
    const layersAndTables: any[] = [];

    (properties.layers || []).forEach(function(layer: any) {
      layersAndTables[layer.id] = {
        item: layer,
        type: "layer"
      };
    });

    (properties.tables || []).forEach(function(table: any) {
      layersAndTables[table.id] = {
        item: table,
        type: "table"
      };
    });

    // Hold a hash of relationships
    const fieldInfos: any = {};
    const adminLayerInfos: any = {};

    // Add the service's layers and tables to it
    if (layersAndTables.length > 0) {
      updateFeatureServiceDefinition(
        itemTemplate.itemId,
        itemTemplate.item.url,
        layersAndTables,
        settings,
        requestOptions,
        itemTemplate.key,
        adminLayerInfos,
        fieldInfos,
        itemTemplate,
        progressCallback
      ).then(
        () => {
          // Will need to do some post processing for fields
          const layerInfos = postProcessFields(
            itemTemplate,
            fieldInfos,
            popupInfos,
            adminLayerInfos,
            settings
          );

          const updates: any[] = [
            updatePopupInfo(
              itemTemplate,
              layerInfos.popupInfos,
              requestOptions,
              itemTemplate.key,
              progressCallback
            ),
            postProcess({
              message: "updated layer definition",
              objects: layerInfos.fieldInfos,
              itemTemplate,
              requestOptions,
              progressCallback
            })
          ];

          Promise.all(updates).then(
            () => resolve(),
            e => reject(mCommon.fail(e))
          );
        },
        e => reject(mCommon.fail(e))
      );
    } else {
      resolve();
    }
  });
}

export function updatePopupInfo(
  itemTemplate: ITemplate,
  popupInfos: any,
  requestOptions: IUserRequestOptions,
  key: string,
  progressCallback?: (update: IProgressUpdate) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const itemLayers: any[] =
      objectUtils.getProp(itemTemplate, "data.layers") || [];
    const itemTables: any[] =
      objectUtils.getProp(itemTemplate, "data.tables") || [];
    const layersAndTables: any[] = itemLayers.concat(itemTables);

    layersAndTables.forEach((item: any) => {
      const id = item.id;

      const type =
        Object.keys(popupInfos.layers).indexOf(String(id)) > -1
          ? "layers"
          : Object.keys(popupInfos.tables).indexOf(String(id)) > -1
          ? "tables"
          : false;

      if (type) {
        if (itemTemplate.data && Array.isArray(itemTemplate.data[type])) {
          const objects = itemTemplate.data[type].filter((o: any) => {
            return o.id === id;
          });
          if (objects.length === 1) {
            objects[0].popupInfo = popupInfos[type][id];
          }
        }
      }
    });

    const updateOptions: items.IItemUpdateRequestOptions = {
      item: {
        id: itemTemplate.itemId,
        text: itemTemplate.data
      },
      ...requestOptions
    };
    items.updateItem(updateOptions).then(
      () => {
        progressCallback &&
          progressCallback({
            processId: key,
            status: "updated popupInfo"
          });
        resolve();
      },
      e => reject(mCommon.fail(e))
    );
  });
}

export function getAddToDefArgs(layerInfos: any): IPostProcessArgs[] {
  const args: IPostProcessArgs[] = [];
  const _fieldInfos = layerInfos.fieldInfos;
  const addObjects: any = {};
  const fieldInfosKeys = Object.keys(_fieldInfos);

  fieldInfosKeys.forEach((k: any) => {
    const fieldInfoKeys = Object.keys(_fieldInfos[k]);
    fieldInfoKeys.forEach((_k: any) => {
      if (Object.keys(addObjects).indexOf(_k) === -1) {
        addObjects[_k] = [];
      }
      addObjects[_k].push(_fieldInfos[k][_k]);
      console.log(_fieldInfos[k][_k]);
    });
  });

  return args;
}

//
export function postProcessFields(
  itemTemplate: ITemplate,
  fieldInfos: any,
  popupInfos: any,
  adminLayerInfos: any,
  settings: any
) {
  const id = itemTemplate.itemId;
  const settingsKeys = Object.keys(settings);

  const layers = objectUtils.getProp(itemTemplate, "properties.layers") || [];
  const tables = objectUtils.getProp(itemTemplate, "properties.tables") || [];
  const layersAndTables: any[] = layers.concat(tables);

  layersAndTables.forEach((item: any) => {
    fieldInfos[item.id]["newFields"] = item.fields;
  });

  settingsKeys.forEach((k: any) => {
    if (id === settings[k].id) {
      settings[k]["fieldInfos"] = fieldUtils.getFieldSettings(fieldInfos);
    }
  });

  // update the fieldInfos object with current field names
  return fieldUtils.deTemplatizeFieldInfos(
    fieldInfos,
    popupInfos,
    adminLayerInfos,
    settings
  );
}

/**
 * Add additional options to a layers definition
 *
 * @param args The IPostProcessArgs for the request(s)
 * @return A promise that will resolve when fullItem has been updated
 * @protected
 */
export function postProcess(args: IPostProcessArgs): Array<Promise<void>> {
  const updates: Array<Promise<void>> = [];

  const itemTemplate = args.itemTemplate;
  const objects = args.objects;

  Object.keys(objects).forEach(id => {
    updates.push(
      new Promise((resolveFn, rejectFn) => {
        const options: featureServiceAdmin.IAddToServiceDefinitionRequestOptions = {
          params: {
            addToDefinition: {}
          },
          ...args.requestOptions
        };
        options.params.addToDefinition = objects[id];
        featureServiceAdmin
          .addToServiceDefinition(itemTemplate.item.url + "/" + id, options)
          .then(
            () => {
              args.progressCallback &&
                args.progressCallback({
                  processId: itemTemplate.key,
                  status: args.message
                });
              resolveFn();
            },
            e => rejectFn(e)
          );
      })
    );
  });

  return updates;
}

/**
 * Helper function to test if object and property exist and if so delete the property
 *
 * @param obj object instance to test and update
 * @param prop name of the property we are after
 */
function deleteProp(obj: any, prop: string) {
  if (obj && obj.hasOwnProperty(prop)) {
    delete obj[prop];
  }
}

/**
 * Updates a feature service with a list of layers and/or tables.
 *
 * @param serviceItemId AGOL id of feature service
 * @param serviceUrl URL of feature service
 * @param listToAdd List of layers and/or tables to add
 * @param settings Hash mapping Solution source id to id of its clone (and name & URL for feature
 *            service)
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve when the feature service has been updated
 * @protected
 */
function updateFeatureServiceDefinition(
  serviceItemId: string,
  serviceUrl: string,
  listToAdd: any[],
  settings: any,
  requestOptions: IUserRequestOptions,
  key: string,
  adminLayerInfos: any,
  fieldInfos: any,
  itemTemplate: ITemplate,
  progressCallback?: (update: IProgressUpdate) => void
): Promise<void> {
  // Launch the adds serially because server doesn't support parallel adds
  return new Promise((resolve, reject) => {
    if (listToAdd.length > 0) {
      const toAdd = listToAdd.shift();

      const item = toAdd.item;
      const originalId = item.id;
      delete item.serviceItemId; // Updated by updateFeatureServiceDefinition

      fieldInfos = fieldUtils.cacheFieldInfos(item, fieldInfos);

      // when the item is a view we need to grab the supporting fieldInfos
      if (itemTemplate.properties.service.isView) {
        adminLayerInfos[originalId] = item.adminLayerInfo;

        // need to update adminLayerInfo before adding to the service def
        // bring over the fieldInfos from the source layer
        fieldUtils.updateSettingsFieldInfos(itemTemplate, settings);

        // update adminLayerInfo before add to definition with view source fieldInfo settings
        item.adminLayerInfo = adlib.adlib(item.adminLayerInfo, settings);
      }

      const options: featureServiceAdmin.IAddToServiceDefinitionRequestOptions = {
        ...requestOptions
      };

      // Need to add layers and tables one at a time, waiting until one is complete before moving on to the next one
      if (toAdd.type === "layer") {
        options.layers = [item];
      } else {
        options.tables = [item];
      }

      featureServiceAdmin.addToServiceDefinition(serviceUrl, options).then(
        () => {
          progressCallback &&
            progressCallback({
              processId: key,
              status: "added layer"
            });

          updateFeatureServiceDefinition(
            serviceItemId,
            serviceUrl,
            listToAdd,
            settings,
            requestOptions,
            key,
            adminLayerInfos,
            fieldInfos,
            itemTemplate,
            progressCallback
          ).then(() => resolve(), e => reject(mCommon.fail(e)));
        },
        e => reject(mCommon.fail(e))
      );
    } else {
      resolve();
    }
  });
}
