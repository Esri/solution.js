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

//#region Imports ----------------------------------------------------------------------------------------------//

import * as adlib from "adlib";
import * as featureServiceAdmin from "@esri/arcgis-rest-feature-service-admin";
import * as items from "@esri/arcgis-rest-items";
import { request, IParams } from "@esri/arcgis-rest-request";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

import * as mCommon from "./common";
import { ITemplate, IProgressUpdate, INumberValuePair } from "../interfaces";
import * as objectUtils from "../utils/object-helpers";
import * as fieldUtils from "../utils/field-helpers";

//#endregion

// TODO figure out how to deal with adminLayerInfo geometry field name in terms of templatizing

//#region Publish Process --------------------------------------------------------------------------------------//

export function convertItemToTemplate(
  itemTemplate: ITemplate,
  requestOptions?: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    // Update the estimated cost factor to deploy this item
    itemTemplate.estimatedDeploymentCostFactor = 3;

    fleshOutFeatureService(itemTemplate, requestOptions).then(
      () => {
        // Extract dependencies
        extractDependencies(itemTemplate, requestOptions).then(
          dependencies => {
            // set the dependencies as an array of IDs from the array of IDependency
            itemTemplate.dependencies = dependencies.map(dep => dep.id);

            // templatize values in itemTemplate data
            templatizeData(itemTemplate, dependencies);

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
  });
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
  requestOptions: IUserRequestOptions
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
      layers => {
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

export function templatizeData(
  itemTemplate: ITemplate,
  dependencies: IDependency[]
): void {
  // Common templatizations: extent, item id, item dependency ids
  mCommon.doCommonTemplatizations(itemTemplate);

  const jsonLayers: any[] = itemTemplate.properties.layers || [];
  const jsonTables: any[] = itemTemplate.properties.tables || [];
  const jsonItems: any[] = jsonLayers.concat(jsonTables);

  const data: any = itemTemplate.data || {};
  const layers: any[] = data.layers || [];
  const tables: any[] = data.tables || [];
  const _items: any[] = layers.concat(tables);

  // templatize the service references serviceItemId
  itemTemplate.properties.service.serviceItemId = mCommon.templatize(
    itemTemplate.properties.service.serviceItemId
  );

  jsonItems.forEach((jsonItem: any) => {
    // get the source service json for the given data item
    const matchingItems = _items.filter(item => {
      return jsonItem.id === item.id;
    });

    // templatize the source service json
    const _item: any =
      matchingItems.length === 1 ? matchingItems[0] : undefined;
    templatizeLayer(_item, jsonItem, itemTemplate, dependencies);
  });
}

export function templatizeLayer(
  item: any,
  sourceItem: any,
  itemTemplate: ITemplate,
  dependencies: IDependency[]
): void {
  // Templatize all properties that contain field references
  fieldUtils.templatizeLayerFieldReferences(
    item,
    itemTemplate.itemId,
    sourceItem,
    dependencies
  );

  const updates: any[] = [sourceItem];
  if (item) {
    updates.push(item);
  }

  updates.forEach(update => {
    if (update.hasOwnProperty("serviceItemId")) {
      update["serviceItemId"] = mCommon.templatize(update["serviceItemId"]);
    }

    if (update.hasOwnProperty("adminLayerInfo")) {
      update.adminLayerInfo = templatizeAdminLayerInfo(
        update,
        dependencies,
        itemTemplate.itemId
      );
    }
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

  objectUtils.deleteProp(adminLayerInfo, "xssTrustedFields");
  objectUtils.deleteProp(adminLayerInfo, "tableName");

  // Remove unnecessary properties and templatize key properties from viewLayerDefinition
  if (adminLayerInfo.viewLayerDefinition) {
    const viewDef = Object.assign({}, adminLayerInfo.viewLayerDefinition);

    processAdminObject(viewDef, dependencies);

    // Remove unnecessary properties and templatize key properties from viewLayerDefinition.table
    if (viewDef.table) {
      processAdminObject(viewDef.table, dependencies);

      if (
        viewDef.table.hasOwnProperty("sourceServiceName") &&
        layer.isMultiServicesView
      ) {
        if (adminLayerInfo.geometryField && adminLayerInfo.geometryField.name) {
          adminLayerInfo.geometryField.name =
            viewDef.table.sourceServiceName +
            "." +
            adminLayerInfo.geometryField.name;
        }
      }
      if (viewDef.table.relatedTables) {
        viewDef.table.relatedTables.forEach((table: any) => {
          processAdminObject(table, dependencies);
        });
      }
    }

    adminLayerInfo.viewLayerDefinition = viewDef;
  }
  return adminLayerInfo;
}

export function processAdminObject(
  object: any,
  dependencies: IDependency[]
): void {
  objectUtils.deleteProp(object, "sourceId");
  if (object.hasOwnProperty("sourceServiceName")) {
    object.sourceServiceName = templatizeName(
      object.sourceServiceName,
      dependencies
    );
  }
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
    // cache the popup info to be added later
    const popupInfos: IPopupInfos = cachePopupInfos(itemTemplate);

    // Get the options used to create the new feature service
    const createOptions: any = getCreateServiceOptions(
      itemTemplate,
      settings,
      requestOptions
    );

    // Create the item
    progressCallback &&
      progressCallback({
        processId: itemTemplate.key,
        status: "creating"
      });
    featureServiceAdmin.createFeatureService(createOptions).then(
      createResponse => {
        // Get the source service item ID so we can handle editFieldsInfo
        const sourceServiceItemId: string = itemTemplate.itemId;

        // Detemplatize what we can now that the service has been created
        itemTemplate = updateSettingsAndTemplate(
          itemTemplate,
          settings,
          createResponse
        );

        // Add the feature service's layers and tables to it
        addFeatureServiceLayersAndTables(
          itemTemplate,
          sourceServiceItemId,
          settings,
          popupInfos,
          requestOptions,
          progressCallback
        ).then(
          () => {
            mCommon.finalCallback(itemTemplate.key, true, progressCallback);
            resolve(itemTemplate);
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

export function cachePopupInfos(itemTemplate: ITemplate): any {
  // store any popupInfo so we can update after any potential name changes
  const popupInfos: IPopupInfos = {
    layers: {},
    tables: {}
  };

  const data: any = itemTemplate.data;
  if (data && data.layers && data.layers.length > 0) {
    cachePopupInfo(popupInfos, "layers", data.layers);
  }

  if (data && data.tables && data.tables.length > 0) {
    cachePopupInfo(popupInfos, "tables", data.tables);
  }
  return popupInfos;
}

export function cachePopupInfo(
  popupInfos: IPopupInfos,
  type: "layers" | "tables",
  _items: any
): void {
  _items.forEach((item: any) => {
    if (item && item.hasOwnProperty("popupInfo")) {
      popupInfos[type][item.id] = item.popupInfo;
      item.popupInfo = {};
    }
  });
}

export function getCreateServiceOptions(
  itemTemplate: ITemplate,
  settings: any,
  requestOptions: IUserRequestOptions
): any {
  const params: IParams = {};
  const createOptions = {
    item: itemTemplate.item,
    folderId: settings.folderId,
    params: params,
    preserveLayerIds: true,
    ...requestOptions
  };

  const itemKeys: string[] = Object.keys(itemTemplate.item);
  const serviceKeys: string[] = Object.keys(itemTemplate.properties.service);
  const missingKeys: string[] = serviceKeys.filter(
    key => itemKeys.indexOf(key) === -1
  );

  const skipParams: string[] = [
    "serviceItemId",
    "layers",
    "tables",
    "currentVersion",
    "hasViews",
    "size"
  ];
  missingKeys.forEach(k => {
    if (skipParams.indexOf(k) === -1) {
      createOptions.params[k] = itemTemplate.properties.service[k];
      createOptions.item[k] = itemTemplate.properties.service[k];
    }
  });

  createOptions.item = setItemProperties(
    createOptions.item,
    itemTemplate,
    settings.isPortal
  );

  return createOptions;
}

export function setItemProperties(
  item: any,
  itemTemplate: ITemplate,
  isPortal: boolean
): any {
  if (itemTemplate.data) {
    // Get the items data
    item.text = itemTemplate.data;
    delete itemTemplate.data;
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

  return item;
}

export function updateSettingsAndTemplate(
  itemTemplate: ITemplate,
  settings: any,
  createResponse: any
): any {
  // Add the new item to the settings list
  settings[itemTemplate.itemId] = {
    id: createResponse.serviceItemId,
    url: createResponse.serviceurl,
    name: createResponse.name
  };

  // Update the item template now that the new service has been created
  itemTemplate.itemId = itemTemplate.item.id = createResponse.serviceItemId;
  itemTemplate = adlib.adlib(itemTemplate, settings);
  itemTemplate.item.url = createResponse.serviceurl;
  return itemTemplate;
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
export function addFeatureServiceLayersAndTables(
  itemTemplate: ITemplate,
  sourceServiceItemId: string,
  settings: any,
  popupInfos: IPopupInfos,
  requestOptions: IUserRequestOptions,
  progressCallback?: (update: IProgressUpdate) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create a hash of various properties that contain field references
    const fieldInfos: any = {};
    const adminLayerInfos: any = {};

    // Add the service's layers and tables to it
    const layersAndTables: any[] = getLayersAndTables(itemTemplate);
    if (layersAndTables.length > 0) {
      updateFeatureServiceDefinition(
        itemTemplate.itemId,
        itemTemplate.item.url,
        sourceServiceItemId,
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
          // Detemplatize field references and update the layer properties
          const updates: Array<Promise<void>> = getLayerUpdates(
            itemTemplate,
            fieldInfos,
            popupInfos,
            adminLayerInfos,
            settings,
            requestOptions,
            progressCallback
          );
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

export function getLayersAndTables(itemTemplate: ITemplate): any[] {
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

  return layersAndTables;
}

export function getLayerUpdates(
  itemTemplate: ITemplate,
  fieldInfos: any,
  popupInfos: IPopupInfos,
  adminLayerInfos: any,
  settings: any,
  requestOptions: IUserRequestOptions,
  progressCallback?: (update: IProgressUpdate) => void
): Array<Promise<void>> {
  // Will need to do some post processing for fields
  // to handle any potential field name changes when deploying to portal
  const layerInfos = postProcessFields(
    itemTemplate,
    fieldInfos,
    popupInfos,
    adminLayerInfos,
    settings
  );

  // update popups and relationships independantly
  const updates: Array<Promise<void>> = [
    updatePopupInfo(
      itemTemplate,
      layerInfos.popupInfos,
      requestOptions,
      itemTemplate.key,
      progressCallback
    ),
    updateRelationships({
      message: "updated layer relationships",
      objects: layerInfos.fieldInfos,
      itemTemplate,
      requestOptions,
      progressCallback
    })
  ];

  // update the layer definition properties that contained field references
  return updates.concat(
    postProcess({
      message: "updated layer definition",
      objects: layerInfos.fieldInfos,
      itemTemplate,
      requestOptions,
      progressCallback
    })
  );
}

export function updatePopupInfo(
  itemTemplate: ITemplate,
  popupInfos: any,
  requestOptions: IUserRequestOptions,
  key: string,
  progressCallback?: (update: IProgressUpdate) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const layerUpdates: boolean = updateItemText(
      itemTemplate,
      "layers",
      popupInfos
    );
    const tableUpdates: boolean = updateItemText(
      itemTemplate,
      "tables",
      popupInfos
    );
    if (layerUpdates || tableUpdates) {
      const updateOptions: items.IItemUpdateRequestOptions = {
        item: {
          id: itemTemplate.itemId,
          text: itemTemplate.item.text
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
    } else {
      resolve();
    }
  });
}

export function updateItemText(
  itemTemplate: ITemplate,
  type: "layers" | "tables",
  popupInfos: IPopupInfos
): boolean {
  let hasUpdates: boolean = false;
  const _items: any[] =
    objectUtils.getProp(itemTemplate, "item.text." + type) || [];
  _items.forEach((item: any) => {
    if (
      itemTemplate.item.text &&
      Array.isArray(itemTemplate.item.text[type]) &&
      popupInfos &&
      popupInfos[type] &&
      popupInfos[type].hasOwnProperty(item.id)
    ) {
      item.popupInfo = popupInfos[type][item.id];
      hasUpdates = true;
    }
  });
  return hasUpdates;
}

/**
 * Capture the names of fields for each layer or table after it has been
 * added to the definition
 *
 * @param itemTemplate Item to be created
 * @param fieldInfos Hash map of properties that contain field references
 * @param popupInfos Hash map of a layers popupInfo
 * @param adminLayerInfos Hash map of a layers adminLayerInfo
 * @return An object with detemplatized field references
 * @protected
 */
export function postProcessFields(
  itemTemplate: ITemplate,
  fieldInfos: any,
  popupInfos: any,
  adminLayerInfos: any,
  settings: any
): any {
  const id = itemTemplate.itemId;
  const settingsKeys = Object.keys(settings);

  // concat any layers and tables to process
  const layers = objectUtils.getProp(itemTemplate, "properties.layers") || [];
  const tables = objectUtils.getProp(itemTemplate, "properties.tables") || [];
  const layersAndTables: any[] = layers.concat(tables);

  // Set the newFields property for the fieldInfos...this will contain all fields
  // as they are after being added to the definition.
  // This allows us to handle any potential field name changes after deploy to portal
  layersAndTables.forEach((item: any) => {
    if (fieldInfos && fieldInfos.hasOwnProperty(item.id)) {
      fieldInfos[item.id]["newFields"] = item.fields;
    }
  });

  // Add the fieldInfos to the settings object to be used while detemplatizing
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
 * Add relationships to all layers in one call to retain fully functioning composite relationships
 *
 * @param args The IPostProcessArgs for the request(s)
 * @return A promise that will resolve all layers have been updated
 * @protected
 */
export function updateRelationships(args: IPostProcessArgs): Promise<void> {
  const itemTemplate = args.itemTemplate;
  const rels: any = {
    layers: [],
    tables: []
  };

  Object.keys(args.objects).forEach((k: any) => {
    const obj: any = args.objects[k];
    if (obj.relationships && obj.relationships.length > 0) {
      const _array: any[] = obj.type === "Table" ? rels.tables : rels.layers;
      _array.push({
        id: obj.id,
        relationships: obj.relationships
      });
      objectUtils.deleteProp(obj, "relationships");
    }
  });

  return new Promise((resolveFn, rejectFn) => {
    if (rels.layers.length > 0) {
      const options: featureServiceAdmin.IAddToServiceDefinitionRequestOptions = {
        params: {
          addToDefinition: rels
        },
        ...args.requestOptions
      };
      featureServiceAdmin
        .addToServiceDefinition(itemTemplate.item.url, options)
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
    } else {
      resolveFn();
    }
  });
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
export function updateFeatureServiceDefinition(
  serviceItemId: string,
  serviceUrl: string,
  sourceServiceItemId: string,
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

      fieldInfos = fieldUtils.cacheFieldInfos(
        item,
        fieldInfos,
        sourceServiceItemId
      );

      delete item.serviceItemId; // Updated by updateFeatureServiceDefinition

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
            sourceServiceItemId,
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

//#endregion

//#region Interfaces -------------------------------------------------------------------------------------------//
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

//#endregion
