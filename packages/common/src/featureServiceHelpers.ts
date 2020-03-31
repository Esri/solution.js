/** @license
 * Copyright 2019 Esri
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
 * Provides general helper functions.
 *
 * @module featureServiceHelpers
 */

// ------------------------------------------------------------------------------------------------------------------ //

export {
  queryFeatures as rest_queryFeatures,
  addFeatures as rest_addFeatures
} from "@esri/arcgis-rest-feature-layer";

//#region Imports -------------------------------------------------------------------------------------------------------//

import * as interfaces from "./interfaces";
import * as generalHelpers from "./generalHelpers";
import * as templatization from "./templatization";
import * as restHelpers from "./restHelpers";

//#endregion ------------------------------------------------------------------------------------------------------------//

//#region Public functions ----------------------------------------------------------------------------------------------//

/**
 * Templatize the ID, url, field references ect
 *
 * @param itemTemplate Template for feature service item
 * @param dependencies Array of IDependency for name mapping
 * @return A promise that will resolve when template has been updated
 * @protected
 */
export function templatize(
  itemTemplate: interfaces.IItemTemplate,
  dependencies: interfaces.IDependency[],
  templatizeFieldReferences: boolean
): interfaces.IItemTemplate {
  // Common templatizations
  const id: string = itemTemplate.item.id;

  itemTemplate.item.url = _templatize(id, "url");
  itemTemplate.item.id = templatization.templatizeTerm(id, id, ".itemId");

  const jsonLayers: any[] = itemTemplate.properties.layers || [];
  const jsonTables: any[] = itemTemplate.properties.tables || [];
  const jsonItems: any[] = jsonLayers.concat(jsonTables);

  const data: any = itemTemplate.data || {};
  const layers: any[] = data.layers || [];
  const tables: any[] = data.tables || [];
  const _items: any[] = layers.concat(tables);

  // templatize the service references serviceItemId
  itemTemplate.properties.service.serviceItemId = templatization.templatizeTerm(
    itemTemplate.properties.service.serviceItemId,
    itemTemplate.properties.service.serviceItemId,
    ".itemId"
  );

  /* istanbul ignore else */
  if (generalHelpers.getProp(itemTemplate, "properties.service.fullExtent")) {
    itemTemplate.properties.service.fullExtent = templatization.templatizeTerm(
      id,
      id,
      ".solutionExtent"
    );
  }
  /* istanbul ignore else */
  if (
    generalHelpers.getProp(itemTemplate, "properties.service.initialExtent")
  ) {
    itemTemplate.properties.service.initialExtent = templatization.templatizeTerm(
      id,
      id,
      ".solutionExtent"
    );
  }

  jsonItems.forEach((jsonItem: any) => {
    // get the source service json for the given data item
    const matchingItems = _items.filter(item => {
      return jsonItem.id === item.id;
    });

    // templatize the source service json
    const _item: any =
      matchingItems.length === 1 ? matchingItems[0] : undefined;
    _templatizeLayer(
      _item,
      jsonItem,
      itemTemplate,
      dependencies,
      templatizeFieldReferences
    );
  });

  return itemTemplate;
}

/**
 * Delete key properties that are system managed
 *
 * @param layer The data layer instance with field name references within
 */
export function deleteViewProps(layer: any) {
  const props: string[] = ["definitionQuery"];

  props.forEach(prop => {
    generalHelpers.deleteProp(layer, prop);
  });
}

/**
 * Cache properties that contain field references
 *
 * @param layer The data layer instance with field name references within
 * @param fieldInfos the object that stores the cached field infos
 * @return An updated instance of the fieldInfos
 */
export function cacheFieldInfos(layer: any, fieldInfos: any): any {
  // cache the source fields as they are in the original source
  if (layer && layer.fields) {
    fieldInfos[layer.id] = {
      sourceFields: JSON.parse(JSON.stringify(layer.fields)),
      type: layer.type,
      id: layer.id
    };
  }

  // cache each of these properties as they each can contain field references
  const props: string[] = [
    "editFieldsInfo",
    "types",
    "templates",
    "relationships",
    "drawingInfo",
    "timeInfo",
    "viewDefinitionQuery"
  ];

  props.forEach(prop => {
    _cacheFieldInfo(layer, prop, fieldInfos);
  });

  return fieldInfos;
}

/**
 * Helper function to cache a single property into the fieldInfos object
 * This property will be removed from the layer instance.
 *
 * @param layer the data layer being cloned
 * @param prop the property name used to cache
 * @param fieldInfos the object that will store the cached property
 */
export function _cacheFieldInfo(
  layer: any,
  prop: string,
  fieldInfos: any
): void {
  if (
    layer &&
    layer.hasOwnProperty(prop) &&
    fieldInfos &&
    fieldInfos.hasOwnProperty(layer.id)
  ) {
    fieldInfos[layer.id][prop] = layer[prop];
    // editFieldsInfo does not come through unless its with the layer
    // when it's being added
    if (prop !== "editFieldsInfo") {
      layer[prop] = null;
    }
  }
}

/**
 * Cache popup info that can contain field references
 *
 * @param data The items data property
 * @return An updated instance of the popupInfos
 */
export function cachePopupInfos(data: any): any {
  // store any popupInfo so we can update after any potential name changes
  const popupInfos: IPopupInfos = {
    layers: {},
    tables: {}
  };

  if (data && data.layers && data.layers.length > 0) {
    _cachePopupInfo(popupInfos, "layers", data.layers);
  }

  if (data && data.tables && data.tables.length > 0) {
    _cachePopupInfo(popupInfos, "tables", data.tables);
  }
  return popupInfos;
}

/**
 * Helper function to cache a single popupInfo
 * This property will be reset on the layer
 *
 * @param popupInfos object to store the cahced popupInfo
 * @param type is it a layer or table
 * @param _items list or either layers or tables
 */
export function _cachePopupInfo(
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

/**
 * Creates an item in a specified folder (except for Group item type).
 *
 * @param itemTemplate Item to be created; n.b.: this item is modified
 * @param templateDictionary Hash mapping property names to replacement values
 * @param createResponse Response from create service
 * @return An updated instance of the template
 * @protected
 */
export function updateTemplate(
  itemTemplate: interfaces.IItemTemplate,
  templateDictionary: any,
  createResponse: any
): interfaces.IItemTemplate {
  // Add the new item to the template dictionary
  templateDictionary[itemTemplate.itemId] = Object.assign(
    templateDictionary[itemTemplate.itemId] || {},
    {
      itemId: createResponse.serviceItemId,
      url: createResponse.serviceurl,
      name: createResponse.name
    }
  );
  // Update the item template now that the new service has been created
  itemTemplate.itemId = createResponse.serviceItemId;
  return templatization.replaceInTemplate(itemTemplate, templateDictionary);
}

/**
 * Create the name mapping object that will allow for all templatized field
 * references to be de-templatized.
 * This also removes the stored sourceFields and newFields arrays from fieldInfos.
 *
 * Example... { layer0: { fields: { lowerCaseSourceFieldName: newFieldNameAfterDeployment } } }
 *
 * @param layerInfos The object that stores the cached layer properties and name mapping
 * @return The settings object that will be used to de-templatize the field references.
 */
export function getLayerSettings(
  layerInfos: any,
  url: string,
  itemId: string
): any {
  const settings: any = {};
  const ids = Object.keys(layerInfos);
  ids.forEach((id: any) => {
    settings["layer" + id] = {
      fields: _getNameMapping(layerInfos, id),
      url: url + "/" + id,
      layerId: id,
      itemId: itemId
    };
    generalHelpers.deleteProp(layerInfos[id], "newFields");
    generalHelpers.deleteProp(layerInfos[id], "sourceFields");
  });
  return settings;
}

/**
 * This is used when deploying views.
 * We need to update fields referenced in adminLayerInfo for relationships prior to deploying the view.
 * This moves the fieldInfos for the views source layers from the item settings for the source layer
 * to the item settings for the view.
 *
 * @param itemTemplate The current itemTemplate being processed.
 * @param settings The settings object used to de-templatize the various templates within the item.
 */
export function updateSettingsFieldInfos(
  itemTemplate: interfaces.IItemTemplate,
  settings: any
): void {
  const dependencies = itemTemplate.dependencies;
  const id = itemTemplate.itemId;
  const settingsKeys = Object.keys(settings);
  settingsKeys.forEach((k: any) => {
    if (id === settings[k].itemId) {
      dependencies.forEach((d: any) => {
        settingsKeys.forEach((_k: any) => {
          if (d === settings[_k].itemId) {
            const layerKeys = Object.keys(settings[_k]);
            layerKeys.forEach(layerKey => {
              if (layerKey.startsWith("layer")) {
                settings[k][layerKey] = settings[_k][layerKey];
              }
            });
          }
        });
      });
    }
  });
}

/**
 * Add flag to indicate item should be ignored.
 * Construct template dictionary to detemplatize any references to this item by other items.
 *
 * @param template Template for feature service item
 * @param authentication Credentials for the request
 * @return A promise that will resolve when template has been updated
 * @protected
 */
export function updateTemplateForInvalidDesignations(
  template: interfaces.IItemTemplate,
  authentication: interfaces.UserSession
): Promise<interfaces.IItemTemplate> {
  return new Promise<interfaces.IItemTemplate>((resolve, reject) => {
    template.properties.hasInvalidDesignations = true;
    if (template.item.url) {
      const url: string = template.item.url;
      restHelpers
        .rest_request(url + "?f=json", {
          authentication: authentication
        })
        .then(
          serviceData => {
            const layerInfos: any = {};
            const layersAndTables: any[] = (serviceData.layers || []).concat(
              serviceData.tables || []
            );
            layersAndTables.forEach((l: any) => {
              /* istanbul ignore else */
              if (l && l.hasOwnProperty("id")) {
                layerInfos[l.id] = l;
              }
            });

            template.data[template.itemId] = Object.assign(
              {
                itemId: template.itemId
              },
              getLayerSettings(layerInfos, url, template.itemId)
            );
            resolve(template);
          },
          e => reject(generalHelpers.fail(e))
        );
    } else {
      resolve(template);
    }
  });
}

/**
 * Replace the field name reference templates with the new field names after deployment.
 *
 * @param fieldInfos The object that stores the cached layer properties and name mapping
 * @param popupInfos The object from the popupInfo property for the layer
 * @param adminLayerInfos The object from the adminLayerInfo property for the layer
 * @param settings The settings object that has all of the mappings for de-templatizing.
 * @return An object that contains updated instances of popupInfos, fieldInfos, and adminLayerInfos
 */
export function deTemplatizeFieldInfos(
  fieldInfos: any,
  popupInfos: any,
  adminLayerInfos: any,
  settings: any
): any {
  const fieldInfoKeys = Object.keys(fieldInfos);
  fieldInfoKeys.forEach(id => {
    if (fieldInfos[id].hasOwnProperty("templates")) {
      fieldInfos[id].templates = JSON.parse(
        templatization.replaceInTemplate(
          JSON.stringify(fieldInfos[id].templates),
          settings
        )
      );
    }

    if (fieldInfos[id].hasOwnProperty("adminLayerInfo")) {
      adminLayerInfos[id].viewLayerDefinition.table.relatedTables =
        fieldInfos[id].adminLayerInfo;
      generalHelpers.deleteProp(fieldInfos[id], "adminLayerInfo");
    }

    if (fieldInfos[id].hasOwnProperty("types")) {
      fieldInfos[id].types = JSON.parse(
        templatization.replaceInTemplate(
          JSON.stringify(fieldInfos[id].types),
          settings
        )
      );
    }
  });

  return {
    popupInfos: templatization.replaceInTemplate(popupInfos, settings),
    fieldInfos: templatization.replaceInTemplate(fieldInfos, settings),
    adminLayerInfos: templatization.replaceInTemplate(adminLayerInfos, settings)
  };
}

/**
 * This is used when deploying views.
 * We need to update fields referenced in adminLayerInfo for relationships prior to deploying the view.
 * This moves the fieldInfos for the views source layers from the item settings for the source layer
 * to the item settings for the view.
 *
 * @param itemTemplate The current itemTemplate being processed.
 * @return array of layers and tables
 */
export function getLayersAndTables(
  itemTemplate: interfaces.IItemTemplate
): any[] {
  const properties: any = itemTemplate.properties;
  const layersAndTables: any[] = [];
  (properties.layers || []).forEach(function(layer: any) {
    layersAndTables.push({
      item: layer,
      type: "layer"
    });
  });
  (properties.tables || []).forEach(function(table: any) {
    layersAndTables.push({
      item: table,
      type: "table"
    });
  });
  return layersAndTables;
}

/**
 * Adds the layers and tables of a feature service to it and restores their relationships.
 *
 * @param itemTemplate Feature service
 * @param templateDictionary Hash mapping Solution source id to id of its clone (and name & URL for feature
 *            service)
 * @param popupInfos the cached popup info from the layers
 * @param authentication Credentials for the request
 * @return A promise that will resolve when all layers and tables have been added
 * @protected
 */
export function addFeatureServiceLayersAndTables(
  itemTemplate: interfaces.IItemTemplate,
  templateDictionary: any,
  popupInfos: IPopupInfos,
  authentication: interfaces.UserSession
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create a hash of various properties that contain field references
    const fieldInfos: any = {};
    const adminLayerInfos: any = {};
    // Add the service's layers and tables to it
    const layersAndTables: any[] = getLayersAndTables(itemTemplate);
    if (layersAndTables.length > 0) {
      updateFeatureServiceDefinition(
        itemTemplate.item.url || "",
        layersAndTables,
        templateDictionary,
        authentication,
        itemTemplate.key,
        adminLayerInfos,
        fieldInfos,
        itemTemplate
      ).then(
        () => {
          // Detemplatize field references and update the layer properties
          updateLayerFieldReferences(
            itemTemplate,
            fieldInfos,
            popupInfos,
            adminLayerInfos,
            templateDictionary,
            authentication
          ).then(
            r => {
              // Update relationships and layer definitions
              const updates: interfaces.IUpdate[] = restHelpers.getLayerUpdates(
                {
                  message: "updated layer definition",
                  objects: r.layerInfos.fieldInfos,
                  itemTemplate: r.itemTemplate,
                  authentication
                } as interfaces.IPostProcessArgs
              );
              // Process the updates sequentially
              updates
                .reduce((prev, update) => {
                  return prev.then(() => {
                    return restHelpers.getRequest(update);
                  });
                }, Promise.resolve())
                .then(
                  () => resolve(),
                  (e: any) => reject(generalHelpers.fail(e))
                );
            },
            e => reject(generalHelpers.fail(e))
          );
        },
        e => reject(generalHelpers.fail(e))
      );
    } else {
      resolve();
    }
  });
}

/**
 * Updates a feature service with a list of layers and/or tables.
 *
 * @param serviceUrl URL of feature service
 * @param listToAdd List of layers and/or tables to add
 * @param templateDictionary Hash mapping Solution source id to id of its clone (and name & URL for feature
 *            service)
 * @param authentication Credentials for the request
 * @param key
 * @param adminLayerInfos Hash map of a layers adminLayerInfo
 * @param fieldInfos Hash map of properties that contain field references
 * @param itemTemplate
 * @return A promise that will resolve when the feature service has been updated
 * @protected
 */
export function updateFeatureServiceDefinition(
  serviceUrl: string,
  listToAdd: any[],
  templateDictionary: any,
  authentication: interfaces.UserSession,
  key: string,
  adminLayerInfos: any,
  fieldInfos: any,
  itemTemplate: interfaces.IItemTemplate
): Promise<void> {
  return new Promise((resolve, reject) => {
    const options: any = {
      layers: [],
      tables: [],
      authentication
    };

    listToAdd.forEach(toAdd => {
      const item = toAdd.item;
      const originalId = item.id;
      fieldInfos = cacheFieldInfos(item, fieldInfos);
      /* istanbul ignore else */
      if (item.isView) {
        deleteViewProps(item);
      }
      // when the item is a view we need to grab the supporting fieldInfos
      /* istanbul ignore else */
      if (itemTemplate.properties.service.isView) {
        adminLayerInfos[originalId] = item.adminLayerInfo;
        // need to update adminLayerInfo before adding to the service def
        // bring over the fieldInfos from the source layer
        updateSettingsFieldInfos(itemTemplate, templateDictionary);
        // update adminLayerInfo before add to definition with view source fieldInfo settings
        item.adminLayerInfo = templatization.replaceInTemplate(
          item.adminLayerInfo,
          templateDictionary
        );
      }
      if (templateDictionary.isPortal) {
        // When deploying to portal we need to adjust the uniquie ID field up front
        /* istanbul ignore else */
        if (item.uniqueIdField && item.uniqueIdField.name) {
          item.uniqueIdField.name = String(
            item.uniqueIdField.name
          ).toLocaleLowerCase();
        }
      }
      if (toAdd.type === "layer") {
        options.layers.push(item);
      } else {
        // Portal will fail if the geometryField is null
        if (item.adminLayerInfo) {
          generalHelpers.deleteProp(item.adminLayerInfo, "geometryField");
        }
        options.tables.push(item);
      }
    });
    restHelpers.addToServiceDefinition(serviceUrl, options).then(
      () => resolve(),
      e => reject(generalHelpers.fail(e))
    );
  });
}

/**
 * Updates a feature service with a list of layers and/or tables.
 *
 * @param itemTemplate
 * @param fieldInfos Hash map of properties that contain field references
 * @param popupInfos Hash map of a layers popupInfo
 * @param adminLayerInfos Hash map of a layers adminLayerInfo
 * @param templateDictionary Hash mapping Solution source id to id of its clone (and name & URL for feature service)
 * @param authentication Credentials for the request
 * @return A promise that will resolve when the feature service has been updated
 * @protected
 */
export function updateLayerFieldReferences(
  itemTemplate: interfaces.IItemTemplate,
  fieldInfos: any,
  popupInfos: IPopupInfos,
  adminLayerInfos: any,
  templateDictionary: any,
  authentication: interfaces.UserSession
): Promise<any> {
  return new Promise((resolveFn, rejectFn) => {
    // Will need to do some post processing for fields
    // to handle any potential field name changes when deploying to portal
    postProcessFields(
      itemTemplate,
      fieldInfos,
      popupInfos,
      adminLayerInfos,
      templateDictionary,
      authentication
    ).then(
      (layerInfos: any) => {
        // Update the items text with detemplatized popupInfo
        updatePopupInfo(itemTemplate, layerInfos.popupInfos);
        resolveFn({
          itemTemplate,
          layerInfos
        });
      },
      e => rejectFn(generalHelpers.fail(e))
    );
  });
}

/**
 * Update the names of fields for each layer or table after it has been
 * added to the definition
 *
 * @param itemTemplate Item to be created
 * @param layerInfos Hash map of properties that contain field references and various layer info
 * @param popupInfos Hash map of a layers popupInfo
 * @param adminLayerInfos Hash map of a layers adminLayerInfo
 * @param templateDictionary
 * @param authentication Credentials for the request
 * @return An object with detemplatized field references
 * @protected
 */
export function postProcessFields(
  itemTemplate: interfaces.IItemTemplate,
  layerInfos: any,
  popupInfos: any,
  adminLayerInfos: any,
  templateDictionary: any,
  authentication: interfaces.UserSession
): Promise<any> {
  return new Promise((resolveFn, rejectFn) => {
    if (!itemTemplate.item.url) {
      rejectFn(
        generalHelpers.fail(
          "Feature layer " + itemTemplate.itemId + " does not have a URL"
        )
      );
    } else {
      const id = itemTemplate.itemId;
      const settingsKeys = Object.keys(templateDictionary);

      // concat any layers and tables to process
      const url: string = itemTemplate.item.url;

      const serviceData: any = itemTemplate.properties;
      Promise.all([
        restHelpers.getLayers(url, serviceData["layers"], authentication),
        restHelpers.getLayers(url, serviceData["tables"], authentication)
      ]).then(
        results => {
          const layers: any[] = results[0];
          const tables: any[] = results[1];
          const layersAndTables: any[] = layers.concat(tables);
          // Set the newFields property for the layerInfos...this will contain all fields
          // as they are after being added to the definition.
          // This allows us to handle any potential field name changes after deploy to portal
          layersAndTables.forEach((item: any) => {
            /* istanbul ignore else */
            if (layerInfos && layerInfos.hasOwnProperty(item.id)) {
              layerInfos[item.id]["isView"] = item.isView;
              layerInfos[item.id]["newFields"] = item.fields;
              layerInfos[item.id]["sourceSchemaChangesAllowed"] =
                item.sourceSchemaChangesAllowed;
              /* istanbul ignore else */
              if (item.editFieldsInfo) {
                // more than case change when deployed to protal so keep track of the new names
                layerInfos[item.id]["newEditFieldsInfo"] = JSON.parse(
                  JSON.stringify(item.editFieldsInfo)
                );
              }

              // fields that are marked as visible false on a view are all set to
              // visible true when added with the layer definition
              // update the field visibility to match that of the source
              /* istanbul ignore else */
              if (item.isView) {
                let fieldUpdates: any[] = _getFieldVisibilityUpdates(
                  layerInfos[item.id]
                );

                // view field domains can contain different values than the source field domains
                // use the cached view domain when it differs from the source view domain
                fieldUpdates = _validateDomains(
                  layerInfos[item.id],
                  fieldUpdates
                );

                if (fieldUpdates.length > 0) {
                  layerInfos[item.id].fields = fieldUpdates;
                }
              }
            }
          });

          // Add the layerInfos to the settings object to be used while detemplatizing
          settingsKeys.forEach((k: any) => {
            if (id === templateDictionary[k].itemId) {
              templateDictionary[k] = Object.assign(
                templateDictionary[k],
                getLayerSettings(layerInfos, templateDictionary[k].url, id)
              );
            }
          });

          // update the layerInfos object with current field names
          resolveFn(
            deTemplatizeFieldInfos(
              layerInfos,
              popupInfos,
              adminLayerInfos,
              templateDictionary
            )
          );
        },
        e => rejectFn(generalHelpers.fail(e))
      );
    }
  });
}

/**
 * Update a views field visibility to match that of the source
 *  Fields that are marked as visible false on a view are all set to
 *  visible true when added with the layer definition
 *
 * @param fieldInfo current layers or tables fieldInfo
 * @return Array of fields that should not be visible in the view
 * @protected
 */
export function _getFieldVisibilityUpdates(fieldInfo: any): any[] {
  const visibilityUpdates: any[] = [];
  if (fieldInfo && fieldInfo["sourceFields"] && fieldInfo["newFields"]) {
    const sourceFields: any = fieldInfo["sourceFields"].reduce(
      (hash: any, f: any) => {
        hash[String(f.name).toLocaleLowerCase()] = f.visible;
        return hash;
      },
      {}
    );

    fieldInfo["newFields"].forEach((f: any) => {
      const name: string = String(f.name).toLocaleLowerCase();
      // only add fields that are not visible
      if (sourceFields.hasOwnProperty(name) && !sourceFields[name]) {
        visibilityUpdates.push({
          name: f.name,
          visible: sourceFields[name]
        });
      }
    });
  }
  return visibilityUpdates;
}

/**
 *  view field domains can contain different values than the source feature service field domains
 *  use the cached domain when it differs from the source view field domain
 *
 * @param fieldInfo current view layer or table fieldInfo
 * @param fieldUpdates any existing field updates
 * @return Array of fields to be updated
 * @protected
 */
export function _validateDomains(fieldInfo: any, fieldUpdates: any[]) {
  const domainFields: any[] = [];
  const domainNames: string[] = [];

  // loop through the cached fields from the source view we are cloning
  fieldInfo.sourceFields.forEach((field: any) => {
    if (field.hasOwnProperty("domain") && field.domain) {
      domainFields.push(field.domain);
      domainNames.push(String(field.name).toLocaleLowerCase());
    }
  });

  // loop through the fields from the new view service
  // add an update when the domains don't match
  fieldInfo.newFields.forEach((field: any) => {
    const i: number = domainNames.indexOf(
      String(field.name).toLocaleLowerCase()
    );
    if (i > -1 && field.hasOwnProperty("domain") && field.domain) {
      if (JSON.stringify(field.domain) !== JSON.stringify(domainFields[i])) {
        // should mixin the update if the field already has some other update
        let hasUpdate: boolean = false;
        fieldUpdates.some((update: any) => {
          if (update.name === field.name) {
            hasUpdate = true;
            update.domain = domainFields[i];
          }
          return hasUpdate;
        });
        if (!hasUpdate) {
          fieldUpdates.push({ name: field.name, domain: domainFields[i] });
        }
      }
    }
  });
  return fieldUpdates;
}

/**
 * Add popup info back to the layer item
 *
 * @param itemTemplate
 * @param popupInfos popup info to be added back to the layer
 * @protected
 */
export function updatePopupInfo(
  itemTemplate: interfaces.IItemTemplate,
  popupInfos: any
): void {
  ["layers", "tables"].forEach(type => {
    const _items: any[] = generalHelpers.getProp(itemTemplate, "data." + type);
    /* istanbul ignore else */
    if (_items && Array.isArray(_items)) {
      _items.forEach((item: any) => {
        item.popupInfo =
          generalHelpers.getProp(popupInfos, type + "." + item.id) || {};
      });
    }
  });
}

//#endregion

//#region Private helper functions --------------------------------------------------//

/**
 * Helper function to templatize value and make sure its converted to lowercase
 *
 * @param basePath path used to de-templatize while deploying
 * @param value to be converted to lower case for lookup while deploying
 */
export function _templatize(
  basePath: string,
  value: string,
  suffix?: string
): string {
  if (value.startsWith("{{")) {
    return value;
  } else {
    return String(
      templatization.templatizeTerm(
        basePath,
        basePath,
        "." + String(value).toLowerCase() + (suffix ? "." + suffix : "")
      )
    );
  }
}

/**
 * templatize an objects property
 *
 * @param object the object with the property to templatize
 * @param property the property of the object to templatize
 * @param basePath path used to de-templatize while deploying
 */
export function _templatizeProperty(
  object: any,
  property: string,
  basePath: string,
  suffix: string
): void {
  if (object && object.hasOwnProperty(property) && object[property]) {
    object[property] = _templatize(basePath, object[property], suffix);
  }
}

/**
 * Templatize field references, serviceItemId, and adminLayerInfo for a layer
 *
 * @param dataItem from the items data property
 * @param adminItem from the services admin api
 * @param itemTemplate Template for feature service item
 * @param dependencies Array of IDependency for name mapping
 * @return A promise that will resolve when template has been updated
 * @protected
 */
export function _templatizeLayer(
  dataItem: any,
  adminItem: any,
  itemTemplate: interfaces.IItemTemplate,
  dependencies: interfaces.IDependency[],
  templatizeFieldReferences: boolean
): void {
  // Templatize all properties that contain field references
  /* istanbul ignore else */
  if (templatizeFieldReferences) {
    _templatizeLayerFieldReferences(
      dataItem,
      itemTemplate.itemId,
      adminItem,
      dependencies
    );
  }

  const updates: any[] = [adminItem];
  if (dataItem) {
    updates.push(dataItem);
  }

  updates.forEach(update => {
    if (update.hasOwnProperty("name")) {
      // templatize the name but leave the current name as the optional default
      update.name = templatization.templatizeTerm(
        update["serviceItemId"] + ".layer" + update.id,
        update["serviceItemId"] + ".layer" + update.id,
        ".name||" + update.name
      );
    }
    if (update.hasOwnProperty("extent")) {
      update.extent = templatization.templatizeTerm(
        update["serviceItemId"],
        update["serviceItemId"],
        ".solutionExtent"
      );
    }

    if (update.hasOwnProperty("serviceItemId")) {
      update["serviceItemId"] = templatization.templatizeTerm(
        update["serviceItemId"],
        update["serviceItemId"],
        ".itemId"
      );
    }

    if (update.hasOwnProperty("adminLayerInfo")) {
      update.adminLayerInfo = _templatizeAdminLayerInfo(update, dependencies);
    }
  });
}

/**
 *
 * Templatize all field references within a layer
 * This is necessary to support potential field name changes when deploying to portal
 * Portal will force all field names to be lower case
 *
 * @param dataItem The data layer instance with field name references within
 * @param itemID The id for the item that contains this layer.
 * @param layer JSON return from the layer being templatized.
 * @param dependencies
 * @return An updated instance of the layer
 */
export function _templatizeLayerFieldReferences(
  dataItem: any,
  itemID: string,
  layer: any,
  dependencies: interfaces.IDependency[]
): void {
  // This is the value that will be used as the template for adlib replacement
  const path: string = itemID + ".layer" + layer.id + ".fields";

  // Get the field names for various tests
  const fieldNames: string[] = layer.fields.map((f: any) => f.name);

  // Update the layer from the items data property
  if (dataItem) {
    _templatizeAdminLayerInfoFields(dataItem, dependencies);
    _templatizePopupInfo(dataItem, layer, path, itemID, fieldNames);
  }

  // Update the layer
  _templatizeAdminLayerInfoFields(layer, dependencies);
  _templatizeRelationshipFields(layer, itemID);
  _templatizeDefinitionEditor(layer, path, fieldNames);
  _templatizeDefinitionExpression(layer, path, fieldNames);
  _templatizeDrawingInfo(layer, path, fieldNames);
  _templatizeTemplates(layer, path);
  _templatizeTypeTemplates(layer, path);
  _templatizeTimeInfo(layer, path);
  _templatizeDefinitionQuery(layer, path, fieldNames);
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
export function _templatizeAdminLayerInfo(
  layer: any,
  dependencies: interfaces.IDependency[]
): any {
  // Create new instance of adminLayerInfo to update for clone
  const adminLayerInfo = Object.assign({}, layer.adminLayerInfo);

  generalHelpers.deleteProp(adminLayerInfo, "xssTrustedFields");
  generalHelpers.deleteProp(adminLayerInfo, "tableName");

  // Remove unnecessary properties and templatize key properties from viewLayerDefinition
  /* istanbul ignore else */
  if (adminLayerInfo.viewLayerDefinition) {
    const viewDef = Object.assign({}, adminLayerInfo.viewLayerDefinition);

    _processAdminObject(viewDef, dependencies);

    // Remove unnecessary properties and templatize key properties from viewLayerDefinition.table
    /* istanbul ignore else */
    if (viewDef.table) {
      _processAdminObject(viewDef.table, dependencies);
      /* istanbul ignore else */
      if (
        viewDef.table.hasOwnProperty("sourceServiceName") &&
        layer.isMultiServicesView
      ) {
        /* istanbul ignore else */
        if (adminLayerInfo.geometryField && adminLayerInfo.geometryField.name) {
          adminLayerInfo.geometryField.name =
            viewDef.table.sourceServiceName +
            "." +
            adminLayerInfo.geometryField.name;
        }
      }
      /* istanbul ignore else */
      if (viewDef.table.relatedTables) {
        viewDef.table.relatedTables.forEach((table: any) => {
          _processAdminObject(table, dependencies);
        });
      }
    }

    adminLayerInfo.viewLayerDefinition = viewDef;
  }
  return adminLayerInfo;
}

/**
 * Remove sourceId and templatize the sourceServiceName
 *
 * @param object The layer to be modified
 * @param dependencies Array of service dependencies
 * @protected
 */
export function _processAdminObject(
  object: any,
  dependencies: interfaces.IDependency[]
): void {
  generalHelpers.deleteProp(object, "sourceId");
  if (object.hasOwnProperty("sourceServiceName")) {
    object.sourceServiceName = _templatizeSourceServiceName(
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
export function _templatizeSourceServiceName(
  lookupName: string,
  dependencies: interfaces.IDependency[]
): string | string[] | undefined {
  const deps = dependencies.filter(
    dependency => dependency.name === lookupName
  );
  return deps.length === 1 ? _templatize(deps[0].id, "name") : undefined;
}

/**
 * templatize the fields referenced in adminLayerInfo
 *
 * @param layer the layer object with the adminLayerInfo property to templatize
 * @param basePath path used to de-templatize while deploying
 * @param itemID the id for the item that contains this layer
 */
export function _templatizeAdminLayerInfoFields(
  layer: any,
  dependencies: interfaces.IDependency[]
): void {
  // templatize the source layer fields
  const table = generalHelpers.getProp(
    layer,
    "adminLayerInfo.viewLayerDefinition.table"
  );

  if (table) {
    let id: string = _getDependantItemId(table.sourceServiceName, dependencies);
    const path: string = id + ".layer" + table.sourceLayerId + ".fields";

    _templatizeAdminSourceLayerFields(table.sourceLayerFields || [], path);

    // templatize the releated table fields
    const relatedTables =
      generalHelpers.getProp(
        layer,
        "adminLayerInfo.viewLayerDefinition.table.relatedTables"
      ) || [];

    if (relatedTables.length > 0) {
      relatedTables.forEach((t: any) => {
        id = _getDependantItemId(t.sourceServiceName, dependencies);
        const relatedPath: string = id + ".layer" + t.sourceLayerId + ".fields";

        _templatizeTopFilter(t.topFilter || {}, relatedPath);

        _templatizeAdminSourceLayerFields(
          t.sourceLayerFields || [],
          relatedPath
        );

        const parentKeyFields: any[] = t.parentKeyFields || [];
        t.parentKeyFields = parentKeyFields.map((f: any) => {
          return _templatize(path, f, "name");
        });

        const keyFields: any[] = t.keyFields || [];
        t.keyFields = keyFields.map((f: any) => {
          return _templatize(relatedPath, f, "name");
        });
      });
    }
  }
}

export function _getDependantItemId(
  lookupName: string,
  dependencies: interfaces.IDependency[]
): string {
  const deps = dependencies.filter(
    dependency => dependency.name === lookupName
  );
  return deps.length === 1 ? deps[0].id : "";
}

/**
 * templatize the sourceLayerFields referenced in adminLayerInfo
 *
 * @param fields array of sourceLayerFields to templatize
 * @param basePath path used to de-templatize while deploying
 */
export function _templatizeAdminSourceLayerFields(
  fields: any[],
  basePath: string
): void {
  fields.forEach(f => _templatizeProperty(f, "source", basePath, "name"));
}

/**
 * templatize the topFilter property from adminLayerInfo related tables
 *
 * @param topFilter the topFilter object to templatize
 * @param basePath path used to de-templatize while deploying
 */
export function _templatizeTopFilter(topFilter: any, basePath: string): void {
  /* istanbul ignore else */
  if (topFilter) {
    // templatize the orderByFields prop
    const orderByFields: string = topFilter["orderByFields"] || "";
    /* istanbul ignore else */
    if (orderByFields !== "") {
      const orderByField = orderByFields.split(" ")[0];
      topFilter.orderByFields = topFilter.orderByFields.replace(
        orderByField,
        _templatize(basePath, orderByField, "name")
      );
    }

    const groupByFields = topFilter["groupByFields"] || "";
    /* istanbul ignore else */
    if (groupByFields !== "") {
      const _groupByFields = groupByFields.split(",");
      /* istanbul ignore else */
      if (_groupByFields.length > 0) {
        const mappedFields = _groupByFields.map((f: any) => {
          return _templatize(basePath, f, "name");
        });
        topFilter.groupByFields = mappedFields.join(",");
      }
    }
  }
}

/**
 * templatize the relationships key fields using the related table id in the basePath
 *
 * @param layer the layer that has the relationships to templatize
 * @param itemID the id of the item that contains the related table
 */
export function _templatizeRelationshipFields(
  layer: any,
  itemID: string
): void {
  if (layer && layer.relationships) {
    const relationships: any[] = layer.relationships;
    relationships.forEach(r => {
      /* istanbul ignore else */
      if (r.keyField) {
        const basePath: string = itemID + ".layer" + layer.id + ".fields";
        _templatizeProperty(r, "keyField", basePath, "name");
      }
    });
  }
}

/**
 * templatize the popupInfo
 *
 * @param layerDefinition the layerDefinition that has the popupInfo to templatize
 * @param layer the JSON for the layer being templatized
 * @param basePath path used to de-templatize while deploying
 * @param itemID the id for the item that contains this layer
 * @param fieldNames array of fieldNames
 */
export function _templatizePopupInfo(
  layerDefinition: any,
  layer: any,
  basePath: string,
  itemID: any,
  fieldNames: string[]
): void {
  // the data layer does not have the fields...will need to get those
  // from the associated layer json
  if (fieldNames && layerDefinition.popupInfo) {
    const popupInfo: any = layerDefinition.popupInfo;
    _templatizeName(popupInfo, "title", fieldNames, basePath);
    _templatizeName(popupInfo, "description", fieldNames, basePath);

    const fieldInfos: any[] = popupInfo.fieldInfos || [];
    _templatizePopupInfoFieldInfos(fieldInfos, layer, itemID, basePath);

    const expressionInfos: any[] = popupInfo.expressionInfos || [];
    _templatizeExpressionInfos(expressionInfos, fieldNames, basePath);

    const popupElements: any[] = popupInfo.popupElements || [];
    _templatizePopupElements(
      popupElements,
      basePath,
      layer,
      itemID,
      fieldNames
    );

    const mediaInfos: any = popupInfo.mediaInfos || [];
    _templatizeMediaInfos(mediaInfos, fieldNames, basePath, layer, itemID);
  }
}

/**
 * templatize field name when referenced like this: {{fieldName}}
 * checks each field name from the layer
 *
 * @param object with the property to test for a field name
 * @param property that could have a field name referenced
 * @param fieldNames array for field names for the layer
 * @param basePath path used to de-templatize while deploying
 */
export function _templatizeName(
  object: any,
  property: string,
  fieldNames: string[],
  basePath: string
): void {
  if (object.hasOwnProperty(property)) {
    fieldNames.forEach(name => {
      // Only test and replace instance of the name so any enclosing characters
      // will be retained
      const regEx = new RegExp("(\\b" + name + "\\b(?![}]{2}))", "gm");
      if (regEx.test(object[property])) {
        object[property] = object[property].replace(
          regEx,
          _templatize(basePath, name, "name")
        );
      }
    });
  }
}

/**
 * templatize field name when referenced like this: {{fieldName}}
 * checks each field name from the layer
 *
 * @param fieldInfos object that contains the popups fieldInfos
 * @param layer json of layer being cloned
 * @param itemID id of the item that contains the current layer
 * @param basePath path used to de-templatize while deploying
 */
export function _templatizePopupInfoFieldInfos(
  fieldInfos: any[],
  layer: any,
  itemID: any,
  basePath: string
): void {
  fieldInfos.forEach((f: any) => {
    f.fieldName = _templatizeFieldName(f.fieldName, layer, itemID, basePath);
  });
}

/**
 * templatize field name when referenced like this: {{fieldName}}
 * checks each field name from the layer
 *
 * @param name the field name to templatize
 * @param layer json of layer being cloned
 * @param itemID id of the item that contains the current layer
 * @param basePath path used to de-templatize while deploying
 */
export function _templatizeFieldName(
  name: string,
  layer: any,
  itemID: string,
  basePath: string
): string {
  if (name.indexOf("relationships/") > -1) {
    const rels = name.split("/");
    const relationshipId: any = rels[1];

    const adminRelatedTables: any = generalHelpers.getProp(
      layer,
      "adminLayerInfo.viewLayerDefinition.table.relatedTables"
    );

    const relatedTables: any[] = layer.relationships || adminRelatedTables;
    /* istanbul ignore else */

    if (relatedTables && relatedTables.length > parseInt(relationshipId, 10)) {
      const relatedTable: any = relatedTables[relationshipId];
      // the layers relationships stores the property as relatedTableId
      // the layers adminLayerInfo relatedTables stores the property as sourceLayerId
      const prop: string = generalHelpers.getProp(
        relatedTable,
        "relatedTableId"
      )
        ? "relatedTableId"
        : "sourceLayerId";
      const _basePath: string =
        itemID + ".layer" + relatedTable[prop] + ".fields";
      rels[2] = _templatize(_basePath, rels[2], "name");
      name = rels.join("/");
    }
  } else {
    // do not need to templatize expression references as the expression
    // itself will be templatized
    if (name.indexOf("expression/") === -1) {
      name = _templatize(basePath, name, "name");
    }
  }
  return name;
}

/**
 * templatize field name when referenced in expressionInfos
 *
 * @param expressionInfos the popups expressionInfos to check
 * @param fieldNames array of the layers field names
 * @param basePath path used to de-templatize while deploying
 */
export function _templatizeExpressionInfos(
  expressionInfos: any[],
  fieldNames: string[],
  basePath: string
): any[] {
  return expressionInfos.map((i: any) => {
    fieldNames.forEach(name => {
      i.expression = _templatizeArcadeExpressions(i.expression, name, basePath);
    });
    return i;
  });
}

/**
 * templatize field name when referenced in popupElelments
 *
 * @param popupElelments the popups popupElelments to check
 * @param basePath path used to de-templatize while deploying
 * @param layer json of layer being cloned
 * @param itemID id of the item that contains the current layer
 * @param fieldNames array of field names
 */
export function _templatizePopupElements(
  popupElelments: any[],
  basePath: string,
  layer: any,
  itemID: string,
  fieldNames: any
): void {
  popupElelments.forEach((pe: any) => {
    if (pe.hasOwnProperty("fieldInfos")) {
      _templatizePopupInfoFieldInfos(pe.fieldInfos, layer, itemID, basePath);
    }

    if (pe.hasOwnProperty("mediaInfos")) {
      _templatizeMediaInfos(pe.mediaInfos, fieldNames, basePath, layer, itemID);
    }
  });
}

/**
 * templatize field name when referenced in mediaInfos
 *
 * @param mediaInfos the popups mediaInfos to check
 * @param fieldNames array of the layers field names
 * @param basePath path used to de-templatize while deploying
 * @param layer json of layer being cloned
 * @param itemID id of the item that contains the current layer
 */
export function _templatizeMediaInfos(
  mediaInfos: any,
  fieldNames: string[],
  basePath: string,
  layer: any,
  itemId: string
): void {
  // templatize various properties of mediaInfos
  const props: string[] = ["title", "caption"];
  props.forEach(p => _templatizeName(mediaInfos, p, fieldNames, basePath));

  mediaInfos.forEach((mi: any) => {
    /* istanbul ignore else */
    if (mi.hasOwnProperty("value")) {
      const v: any = mi.value;

      const vfields: any[] = v.fields || [];
      v.fields = vfields.map(f =>
        _templatizeFieldName(f, layer, itemId, basePath)
      );

      if (v.hasOwnProperty("normalizeField")) {
        _templatizeProperty(v, "normalizeField", basePath, "name");
      }

      /* istanbul ignore else */
      if (v.hasOwnProperty("tooltipField")) {
        v.tooltipField = _templatizeFieldName(
          v.tooltipField,
          layer,
          itemId,
          basePath
        );
      }
    }
  });
}

/**
 * templatize field names when referenced in definitionEditor
 *
 * @param layer the layer with the definition editor
 * @param basePath path used to de-templatize while deploying
 * @param fieldNames json of layer being cloned
 */
export function _templatizeDefinitionEditor(
  layer: any,
  basePath: string,
  fieldNames: string[]
): void {
  if (layer) {
    const defEditor: any = layer.definitionEditor || {};
    /* istanbul ignore else */
    if (defEditor) {
      const inputs: any[] = defEditor.inputs;
      if (inputs) {
        inputs.forEach(i => {
          /* istanbul ignore else */
          if (i.parameters) {
            i.parameters.forEach((p: any) => {
              _templatizeProperty(p, "fieldName", basePath, "name");
            });
          }
        });
      }

      if (defEditor.hasOwnProperty("parameterizedExpression")) {
        defEditor.parameterizedExpression = _templatizeSimpleName(
          defEditor.parameterizedExpression || "",
          basePath,
          fieldNames,
          "name"
        );
      }
    }
  }
}

/**
 * templatize field names when referenced in definitionExpression
 *
 * @param layer the layer with the definition editor
 * @param basePath path used to de-templatize while deploying
 * @param fieldNames array of field names
 */
export function _templatizeDefinitionExpression(
  layer: any,
  basePath: string,
  fieldNames: string[]
): void {
  if (layer && layer.hasOwnProperty("definitionExpression")) {
    layer.definitionExpression = _templatizeSimpleName(
      layer.definitionExpression || "",
      basePath,
      fieldNames,
      "name"
    );
  }
}

/**
 * Case sensitive test for field names that appear anywhere within a string
 *
 * @param expression the expression to test for field name references
 * @param basePath path used to de-templatize while deploying
 * @param fieldNames array of the layers field names
 */
export function _templatizeSimpleName(
  expression: string,
  basePath: string,
  fieldNames: string[],
  suffix: string
): string {
  fieldNames.forEach(name => {
    // look for the name but not if its followed by }}
    const regEx = new RegExp("\\b" + name + "\\b(?![}]{2})", "gm");
    if (expression && regEx.test(expression)) {
      expression = expression.replace(
        regEx,
        _templatize(basePath, name, suffix)
      );
    }
  });
  return expression;
}

/**
 * Templatize field references within a layers drawingInfo
 *
 * @param layer the data layer
 * @param basePath path used to de-templatize while deploying
 * @param fieldNames array of the layers field names
 */
export function _templatizeDrawingInfo(
  layer: any,
  basePath: string,
  fieldNames: string[]
): void {
  if (layer) {
    const drawingInfo: any = layer.drawingInfo;

    if (drawingInfo) {
      // templatize the renderer fields
      const renderer: any = drawingInfo.renderer || {};
      _templatizeRenderer(renderer, basePath, fieldNames);

      // templatize the labelingInfo
      const labelingInfo: any = drawingInfo.labelingInfo || [];
      _templatizeLabelingInfo(labelingInfo, basePath, fieldNames);
    }
  }
}

/**
 * Templatize field references within a layers drawingInfo
 *
 * @param renderer the layers renderer
 * @param basePath path used to de-templatize while deploying
 * @param fieldNames array of the layers field names
 */
export function _templatizeRenderer(
  renderer: any,
  basePath: string,
  fieldNames: string[]
): void {
  switch (renderer.type) {
    case "classBreaks":
    case "uniqueValue":
    case "predominance":
    case "simple":
    case "heatmap":
      _templatizeGenRenderer(renderer, basePath, fieldNames);
      break;
    case "temporal":
      _templatizeTemporalRenderer(renderer, basePath, fieldNames);
      break;
    default:
      break;
  }
}

/**
 * Templatize field references within a layers renderer
 *
 * @param renderer the renderer object to check for field references
 * @param basePath path used to de-templatize while deploying
 * @param fieldNames array of field names that will be used to search expressions
 */
export function _templatizeGenRenderer(
  renderer: any,
  basePath: string,
  fieldNames: string[]
): void {
  /* istanbul ignore else */
  if (renderer) {
    // update authoringInfo
    const authoringInfo: any = renderer.authoringInfo;
    if (authoringInfo) {
      _templatizeAuthoringInfo(authoringInfo, basePath, fieldNames);
    }

    const props: string[] = ["field", "normalizationField"];
    props.forEach(p => _templatizeProperty(renderer, p, basePath, "name"));

    const fieldNameProps: string[] = ["field1", "field2", "field3"];
    fieldNameProps.forEach(fnP =>
      _templatizeProperty(renderer, fnP, basePath, "name")
    );

    // When an attribute name is specified, it's enclosed in square brackets
    const rExp: string = renderer.rotationExpression;
    if (rExp) {
      fieldNames.forEach(name => {
        const regEx = new RegExp("(\\[" + name + "\\])", "gm");
        if (regEx.test(rExp)) {
          renderer.rotationExpression = rExp.replace(
            regEx,
            "[" + _templatize(basePath, name, "name") + "]"
          );
        }
      });
    }

    // update valueExpression
    if (renderer.valueExpression) {
      fieldNames.forEach(name => {
        renderer.valueExpression = _templatizeArcadeExpressions(
          renderer.valueExpression,
          name,
          basePath
        );
      });
    }

    // update visualVariables
    const visualVariables: any[] = renderer.visualVariables;
    if (visualVariables) {
      visualVariables.forEach(v => {
        props.forEach(p => _templatizeProperty(v, p, basePath, "name"));
        if (v.valueExpression) {
          fieldNames.forEach(name => {
            v.valueExpression = _templatizeArcadeExpressions(
              v.valueExpression,
              name,
              basePath
            );
          });
        }
      });
    }
  }
}

/**
 * Templatize field references within a layers renderer
 *
 * @param renderer the renderer object to check for field references
 * @param basePath path used to de-templatize while deploying
 * @param fieldNames array of field names that will be used to search expressions
 */
export function _templatizeTemporalRenderer(
  renderer: any,
  basePath: string,
  fieldNames: string[]
): void {
  const renderers: any[] = [
    renderer.latestObservationRenderer,
    renderer.observationRenderer,
    renderer.trackRenderer
  ];

  renderers.forEach(r => {
    _templatizeRenderer(r, basePath, fieldNames);
  });
}

/**
 * Templatize renderers authoringInfo
 *
 * @param authoringInfo  object containing metadata about the authoring process
 * @param basePath path used to de-templatize while deploying
 * @param fieldNames the name of fields from the layer
 */
export function _templatizeAuthoringInfo(
  authoringInfo: any,
  basePath: string,
  fieldNames: string[]
): void {
  /* istanbul ignore else */
  if (authoringInfo) {
    const props: string[] = ["field", "normalizationField"];

    const field1: any = authoringInfo.field1;
    props.forEach(p => _templatizeProperty(field1, p, basePath, "name"));

    const field2: any = authoringInfo.field2;
    props.forEach(p => _templatizeProperty(field2, p, basePath, "name"));

    const fields: any[] = authoringInfo.fields;
    if (fields) {
      authoringInfo.fields = fields.map(f => _templatize(basePath, f, "name"));
    }

    const vProps: string[] = ["endTime", "field", "startTime"];
    const vVars: any = authoringInfo.visualVariables;
    if (vVars) {
      vProps.forEach(p => {
        // endTime and startTime may or may not be a field name
        if (fieldNames.indexOf(vVars[p]) > -1) {
          _templatizeProperty(vVars, p, basePath, "name");
        }
      });
    }
  }
}

/**
 * Templatize field references within an arcade expression
 *
 * @param text the text that contains the expression
 * @param fieldName name of the field to test for
 * @param basePath path used to de-templatize while deploying
 */
export function _templatizeArcadeExpressions(
  text: string,
  fieldName: string,
  basePath: string
): string {
  const t = _templatize(basePath, fieldName, "name");

  if (text) {
    // test for $feature. notation
    // captures VOTED_DEM_2012 from $feature.VOTED_DEM_2012
    let exp: string = "(?:\\$feature\\.)(" + fieldName + ")\\b";
    let regEx = new RegExp(exp, "gm");
    text = regEx.test(text) ? text.replace(regEx, "$feature." + t) : text;

    // test for $feature[] notation
    // captures VOTED_DEM_2012 from $feature["VOTED_DEM_2012"]
    // captures VOTED_DEM_2012 from $feature['VOTED_DEM_2012']
    // captures VOTED_DEM_2012 from $feature[VOTED_DEM_2012]
    exp = "(?:[$]feature)(\\[\\\"?\\'?)" + fieldName + "(\\\"?\\'?\\])";
    regEx = new RegExp(exp, "gm");
    let result = regEx.exec(text);
    if (result) {
      text = text.replace(regEx, "$feature" + result[1] + t + result[2]);
    }

    // test for $feature[] with join case
    // captures VOTED_DEM_2016 from $feature["COUNTY_ID.VOTED_DEM_2016"]
    exp =
      "(?:[$]feature)(\\[\\\"?\\'?)(\\w+)[.]" + fieldName + "(\\\"?\\'?\\])";
    regEx = new RegExp(exp, "gm");
    result = regEx.exec(text);
    if (result && result.length > 3) {
      // TODO result[2] is the table name...this needs to be templatized as well
      text = text.replace(
        regEx,
        "$feature" + result[1] + result[2] + "." + t + result[3]
      );
    }

    // test for "fieldName"
    // captures fieldName from "var names = ["fieldName", "fieldName2"]..."
    // captures fieldName from "var names = ['fieldName', 'fieldName2']..."
    exp = "(\\\"|\\')+" + fieldName + "(\\\"|\\')+";
    regEx = new RegExp(exp, "gm");
    result = regEx.exec(text);
    if (result) {
      text = text.replace(regEx, result[1] + t + result[2]);
    }
  }
  return text;
}

/**
 * templatize field names when referenced in the layers labelingInfo
 *
 * @param labelingInfo the object that contains the labelingInfo
 * @param basePath path used to de-templatize while deploying
 * @param fieldNames array of the layers field names
 */
export function _templatizeLabelingInfo(
  labelingInfo: any,
  basePath: string,
  fieldNames: string[]
): void {
  labelingInfo.forEach((li: any) => {
    /* istanbul ignore else */
    if (li.hasOwnProperty("fieldInfos")) {
      const fieldInfos: any[] = li.fieldInfos || [];
      fieldInfos.forEach(fi =>
        _templatizeProperty(fi, "fieldName", basePath, "name")
      );
    }

    const labelExp: string = li.labelExpression || "";
    const labelExpInfo: any = li.labelExpressionInfo || {};
    fieldNames.forEach(n => {
      const t: string = _templatize(basePath, n, "name");

      // check for [fieldName] or ["fieldName"]
      const regExBracket = new RegExp('(\\[\\"*)+(' + n + ')(\\"*\\])+', "gm");
      let result = regExBracket.exec(labelExp);
      if (result) {
        li.labelExpression = labelExp.replace(
          regExBracket,
          result[1] + t + result[3]
        );
      }
      /* istanbul ignore else */
      if (labelExpInfo.value) {
        let v = labelExpInfo.value;
        // check for {fieldName}
        const regExCurly = new RegExp("(\\{" + n + "\\})", "gm");
        v = regExCurly.test(v) ? v.replace(regExCurly, "{" + t + "}") : v;

        // check for [fieldName] or ["fieldName"]
        result = regExBracket.exec(v);
        v = result ? v.replace(regExBracket, result[1] + t + result[3]) : v;

        li.labelExpressionInfo.value = v;
      }
      /* istanbul ignore else */
      if (labelExpInfo.expression) {
        li.labelExpressionInfo.expression = _templatizeArcadeExpressions(
          labelExpInfo.expression,
          n,
          basePath
        );
      }
    });
  });
}

/**
 * templatize the layers editing templates
 *
 * @param layer the data layer being cloned
 * @param basePath path used to de-templatize while deploying
 */
export function _templatizeTemplates(layer: any, basePath: string): void {
  const templates: any[] = layer.templates || [];
  templates.forEach(t => {
    const attributes: any = generalHelpers.getProp(t, "prototype.attributes");
    const _attributes: any = _templatizeKeys(attributes, basePath, "name");
    /* istanbul ignore else */
    if (_attributes) {
      t.prototype.attributes = _attributes;
    }
  });
}

export function _templatizeTypeTemplates(layer: any, basePath: string): void {
  const types: any[] = layer.types;
  if (types && Array.isArray(types) && types.length > 0) {
    types.forEach((type: any) => {
      const domains: any = _templatizeKeys(type.domains, basePath, "name");
      /* istanbul ignore else */
      if (domains) {
        type.domains = domains;
      }

      const templates: any[] = type.templates;
      /* istanbul ignore else */
      if (templates && templates.length > 0) {
        templates.forEach((t: any) => {
          const attributes = generalHelpers.getProp(t, "prototype.attributes");
          const _attributes: any = _templatizeKeys(
            attributes,
            basePath,
            "name"
          );
          /* istanbul ignore else */
          if (_attributes) {
            t.prototype.attributes = _attributes;
          }
        });
      }
    });
  }
}

export function _templatizeKeys(
  obj: any,
  basePath: string,
  suffix: string
): any {
  let _obj: any;
  /* istanbul ignore else */
  if (obj) {
    _obj = {};
    const objKeys: string[] = Object.keys(obj);
    /* istanbul ignore else */
    if (objKeys && objKeys.length > 0) {
      objKeys.forEach(k => {
        _obj[_templatize(basePath, k, suffix)] = obj[k];
      });
    }
  }

  return _obj;
}

/**
 * templatize fields referenced in the layers time info
 *
 * @param layer the data layer being cloned
 * @param basePath path used to de-templatize while deploying
 */
export function _templatizeTimeInfo(layer: any, basePath: string): void {
  if (layer.timeInfo) {
    const timeInfo: any = layer.timeInfo;
    const timeProps: string[] = [
      "endTimeField",
      "startTimeField",
      "trackIdField"
    ];
    timeProps.forEach(t => {
      if (timeInfo[t] !== "") {
        _templatizeProperty(timeInfo, t, basePath, "name");
      } else {
        timeInfo[t] = null;
      }
    });
  }
}

/**
 * templatize the layers definition query
 *
 * @param layer the data layer being cloned
 * @param basePath path used to de-templatize while deploying
 * @param fieldNames array of the layers field names
 */
export function _templatizeDefinitionQuery(
  layer: any,
  basePath: string,
  fieldNames: string[]
): void {
  // templatize view definition query
  if (layer && layer.hasOwnProperty("viewDefinitionQuery")) {
    layer.viewDefinitionQuery = _templatizeSimpleName(
      layer.viewDefinitionQuery || "",
      basePath,
      fieldNames,
      "name"
    );
  }
  if (layer && layer.hasOwnProperty("definitionQuery")) {
    layer.definitionQuery = _templatizeSimpleName(
      layer.definitionQuery || "",
      basePath,
      fieldNames,
      "name"
    );
  }
}

/**
 * Helper function to create the name mapping used to
 * de-templatize the field reference
 *
 * @param fieldInfos the object that stores the cached information
 * @param id the id for the current layer being processed
 */
export function _getNameMapping(fieldInfos: any, id: string): any {
  // create name mapping
  const fInfo: any = fieldInfos[id];
  const nameMapping: interfaces.IStringValuePair = {};
  const newFields = fInfo.newFields;
  const newFieldNames: string[] = newFields
    ? newFields.map((f: any) => f.name)
    : [];
  const sourceFields: any[] = fInfo.sourceFields || [];
  sourceFields.forEach((field: any) => {
    const lName = String(field.name).toLowerCase();
    newFields.forEach((f: any) => {
      // Names can change more than case
      if (
        newFieldNames.indexOf(field.name) === -1 &&
        newFieldNames.indexOf(lName) === -1
      ) {
        // If both new (f) and source (field) aliases are defined and are equal, map the source name to the new name
        if (f.alias && f.alias === field.alias) {
          nameMapping[lName] = {
            name: f.name,
            alias: f.alias,
            type: f.type ? f.type : ""
          };
        }
      }
      if (String(f.name).toLowerCase() === lName) {
        nameMapping[lName] = {
          name: f.name,
          alias: f.alias ? f.alias : "",
          type: f.type ? f.type : ""
        };
      }
    });
  });

  // update for editFieldsInfo
  if (fInfo.editFieldsInfo && fInfo.newEditFieldsInfo) {
    const efi: any = JSON.parse(JSON.stringify(fInfo.editFieldsInfo));
    const newEfi: any = JSON.parse(JSON.stringify(fInfo.newEditFieldsInfo));
    const nameMappingKeys: string[] = Object.keys(nameMapping);
    Object.keys(efi).forEach(k => {
      const lowerEfi: string = String(efi[k]).toLowerCase();
      if (
        (nameMappingKeys.indexOf(lowerEfi) === -1 ||
          nameMapping[lowerEfi].name !== newEfi[k]) &&
        newFieldNames.indexOf(lowerEfi) > -1
      ) {
        // Only add delete fields if source schema changes allowed
        /* istanbul ignore else */
        if (fInfo.sourceSchemaChangesAllowed && !fInfo.isView) {
          /* istanbul ignore else */
          if (!fInfo.hasOwnProperty("deleteFields")) {
            fInfo.deleteFields = [];
          }
          // This issue only occurs on portal so we
          // need to delete the lcase version of the field
          fInfo.deleteFields.push(lowerEfi);
        }

        // editFieldsInfo only has the name and not the alias and type
        let sourceEfiField: any;
        fInfo.sourceFields.some((sf: any) => {
          if (sf.name === efi[k]) {
            sourceEfiField = sf;
          }
          return sf.name === efi[k];
        });
        nameMapping[lowerEfi] = {
          name: newEfi[k],
          alias:
            sourceEfiField && sourceEfiField.alias ? sourceEfiField.alias : "",
          type: sourceEfiField && sourceEfiField.type ? sourceEfiField.type : ""
        };
      }
    });

    generalHelpers.deleteProp(fInfo, "sourceSchemaChangesAllowed");
    generalHelpers.deleteProp(fInfo, "editFieldsInfo");
    generalHelpers.deleteProp(fInfo, "newEditFieldsInfo");
    generalHelpers.deleteProp(fInfo, "isView");
  }
  return nameMapping;
}

//#endregion

export interface IPopupInfos {
  layers: interfaces.INumberValuePair;
  tables: interfaces.INumberValuePair;
}
