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
 * Manages creation of the template of a Solution item via the REST API.
 *
 * @module createSolutionItem
 */

import * as common from "@esri/solution-common";
import * as solutionFeatureLayer from "@esri/solution-feature-layer";
import * as solutionSimpleTypes from "@esri/solution-simple-types";
import * as solutionStoryMap from "@esri/solution-storymap";

/**
 * Mapping from item type to module with type-specific template-handling code
 */
const moduleMap: common.IItemTypeModuleMap = {
  dashboard: solutionSimpleTypes,

  // //??? Temporary assignments
  "project package": solutionSimpleTypes,
  "workforce project": solutionSimpleTypes,
  // //???

  "feature layer": solutionFeatureLayer,
  "feature service": solutionFeatureLayer,
  form: solutionSimpleTypes,
  group: solutionSimpleTypes,
  // "openstreetmap": solutionStoryMap,
  // "project package": solutionStoryMap,
  // "storymap": solutionStoryMap,
  // table: solutionFeatureLayer,
  // vectortilelayer: solutionFeatureLayer,
  "web map": solutionSimpleTypes,
  "web mapping application": solutionSimpleTypes
};

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Creates template for an AGO item and its dependencies
 *
 * @param solutionItemId The solution to contain the item
 * @param itemId AGO id string
 * @param requestOptions Options for requesting information from AGO about items to be included in solution item
 * @param existingTemplates A collection of AGO item templates that can be referenced by newly-created templates
 * @return A promise that will resolve with the created template items
 * @protected
 */
export function createItemTemplate(
  portalSharingUrl: string,
  solutionItemId: string,
  itemId: string,
  requestOptions: common.IUserRequestOptions,
  existingTemplates: common.IItemTemplate[]
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // Check if item and its dependents are already in list or are queued
    if (common.findTemplateInList(existingTemplates, itemId)) {
      resolve(true);
    } else {
      // Add the id as a placeholder to show that it is being fetched
      existingTemplates.push(common.createPlaceholderTemplate(itemId));
      /* console.log(
        "added placeholder template " +
          itemId +
          " [" +
          existingTemplates.length +
          "]"
      ); */

      // For each item,
      //   * fetch item & data infos
      //   * create item & data JSONs
      //   * extract dependency ids & add them into list of group contents
      //   * templatize select components in item & data JSONs (e.g., extents)
      //   * copy item's resources, metadata, & thumbnail to solution item as resources
      //   * add JSONs to solution item's data JSON accumulation
      // Fetch the item
      /* console.log("fetching item " + itemId); */
      common.rest_getItem(itemId, requestOptions).then(
        itemInfo => {
          if (common.getProp(itemInfo, "extent")) {
            // @ts-ignore
            itemInfo.extent = "{{initiative.orgExtent:optional}}";
          }
          // Check if this is the solution's thumbnail
          if (itemInfo.tags.find(tag => tag === "deploy.thumbnail")) {
            // Set the thumbnail
            const thumbnailUrl =
              portalSharingUrl + "/content/items/" + itemId + "/data";
            common
              .getBlob(thumbnailUrl, requestOptions.authentication)
              .then(
                blob =>
                  common
                    .addThumbnailFromBlob(
                      blob,
                      solutionItemId,
                      requestOptions.authentication
                    )
                    .then(() => resolve(true), () => resolve(true)),
                () => resolve(true)
              );
          } else {
            const itemHandler: common.IItemTemplateConversions =
              moduleMap[itemInfo.type.toLowerCase()];
            if (!itemHandler) {
              console.warn(
                "Unimplemented item type (module level) " +
                  itemInfo.type +
                  " for " +
                  itemInfo.id
              );
              resolve(true);
            } else {
              itemHandler
                .convertItemToTemplate(
                  solutionItemId,
                  itemInfo,
                  requestOptions.authentication
                )
                .then(
                  itemTemplate => {
                    // Set the value keyed by the id to the created template, replacing the placeholder template
                    _replaceTemplate(
                      existingTemplates,
                      itemTemplate.itemId,
                      itemTemplate
                    );

                    // Trace item dependencies
                    if (itemTemplate.dependencies.length === 0) {
                      resolve(true);
                    } else {
                      // Get its dependencies, asking each to get its dependents via
                      // recursive calls to this function
                      const dependentDfds: Array<Promise<boolean>> = [];
                      /* console.log(
                        "item " +
                          itemId +
                          " has dependencies " +
                          JSON.stringify(itemTemplate.dependencies)
                      ); */
                      itemTemplate.dependencies.forEach(dependentId => {
                        if (
                          !common.findTemplateInList(
                            existingTemplates,
                            dependentId
                          )
                        ) {
                          dependentDfds.push(
                            createItemTemplate(
                              portalSharingUrl,
                              solutionItemId,
                              dependentId,
                              requestOptions,
                              existingTemplates
                            )
                          );
                        }
                      });
                      Promise.all(dependentDfds).then(
                        () => resolve(true),
                        e => reject(common.fail(e))
                      );
                    }
                  },
                  e => reject(common.fail(e))
                );
            }
          }
        },
        () => {
          // If item query fails, try URL for group base section
          /* console.log("fetching group " + itemId); */
          common.rest_getGroup(itemId, requestOptions).then(
            itemInfo => {
              solutionSimpleTypes
                .convertItemToTemplate(
                  solutionItemId,
                  itemInfo,
                  requestOptions.authentication,
                  true
                )
                .then(
                  itemTemplate => {
                    // Set the value keyed by the id to the created template, replacing the placeholder template
                    _replaceTemplate(
                      existingTemplates,
                      itemTemplate.itemId,
                      itemTemplate
                    );

                    // Trace item dependencies
                    if (itemTemplate.dependencies.length === 0) {
                      resolve(true);
                    } else {
                      // Get its dependencies, asking each to get its dependents via
                      // recursive calls to this function
                      const dependentDfds: Array<Promise<boolean>> = [];
                      /* console.log(
                        "item " +
                          itemId +
                          " has dependencies " +
                          JSON.stringify(itemTemplate.dependencies)
                      ); */
                      itemTemplate.dependencies.forEach(dependentId => {
                        if (
                          !common.findTemplateInList(
                            existingTemplates,
                            dependentId
                          )
                        ) {
                          dependentDfds.push(
                            createItemTemplate(
                              portalSharingUrl,
                              solutionItemId,
                              dependentId,
                              requestOptions,
                              existingTemplates
                            )
                          );
                        }
                      });
                      Promise.all(dependentDfds).then(
                        () => resolve(true),
                        e => reject(common.fail(e))
                      );
                    }
                  },
                  e => reject(common.fail(e))
                );
            },
            e => reject(common.fail(e))
          );
        }
      );
    }
  });
}

/**
 * Creates a solution template.
 *
 * @param ids List of AGO id strings
 * @param destinationRequestOptions Options for creating solution item in AGO
 * @return A promise without value
 */
export function createSolutionTemplate(
  portalSharingUrl: string,
  solutionItemId: string,
  ids: string[],
  templateDictionary: any,
  destinationAuthentication: common.UserSession,
  progressTickCallback: () => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    const requestOptions: common.IUserRequestOptions = {
      authentication: destinationAuthentication
    };
    let solutionTemplates: common.IItemTemplate[] = [];

    // Handle a list of one or more AGO ids by stepping through the list
    // and calling this function recursively
    const getItemsPromise: Array<Promise<boolean>> = [];

    ids.forEach(itemId => {
      getItemsPromise.push(
        createItemTemplate(
          portalSharingUrl,
          solutionItemId,
          itemId,
          requestOptions,
          solutionTemplates
        )
      );
      progressTickCallback();
    });
    Promise.all(getItemsPromise).then(
      () => {
        // Remove remnant placeholder items from the templates list
        const origLen = solutionTemplates.length;
        solutionTemplates = solutionTemplates.filter(
          template => template.type // `type` needs to be defined
        );
        /* console.log(
          "removed " +
            (origLen - solutionTemplates.length) +
            " placeholder templates"
        ); */

        resolve(solutionTemplates);
      },
      e => reject(common.fail(e))
    );
  });
}

/**
 * Templatizes field references within specific template types.
 * Currently only handles web applications
 *
 * @param templates List of solution templates
 * @return A list of templates that have templatized field references
 */
export function postProcessFieldReferences(
  templates: common.IItemTemplate[]
): common.IItemTemplate[] {
  const datasourceInfos: common.IDatasourceInfo[] = _getDatasourceInfos(
    templates
  );
  const templateTypeHash: any = _getTemplateTypeHash(templates);

  return templates.map(template => {
    if (
      template.type === "Web Mapping Application" ||
      template.type === "Dashboard" ||
      template.type === "Web Map"
    ) {
      const webMapFSDependencies: string[] = _getWebMapFSDependencies(
        template,
        templateTypeHash
      );
      const itemHandler: any = moduleMap[template.item.type.toLowerCase()];
      if (itemHandler) {
        const dependencies: string[] = webMapFSDependencies.concat(
          template.dependencies
        );
        let dependantDatasources: common.IDatasourceInfo[] = datasourceInfos.filter(
          ds => {
            if (dependencies.indexOf(ds.itemId) > -1) {
              return ds;
            }
          }
        );
        dependantDatasources = _addMapLayerIds(
          dependantDatasources,
          templateTypeHash
        );
        if (dependantDatasources.length > 0) {
          template = itemHandler.postProcessFieldReferences(
            template,
            dependantDatasources,
            template.item.type
          );
        }
      }
    }
    return template;
  });
}

/**
 * Get common properties that will support the templatization of field references
 *
 * @param templates List of solution templates
 * @return A list of IDataSourceInfo objects with key properties
 */
export function _getDatasourceInfos(
  templates: common.IItemTemplate[]
): common.IDatasourceInfo[] {
  const datasourceInfos: common.IDatasourceInfo[] = [];
  templates.forEach(t => {
    if (t.type === "Feature Service") {
      const layers: any[] = common.getProp(t, "properties.layers") || [];
      const tables: any[] = common.getProp(t, "properties.tables") || [];
      const layersAndTables: any[] = layers.concat(tables);
      layersAndTables.forEach(obj => {
        if (!common.hasDatasource(datasourceInfos, t.itemId, obj.id)) {
          datasourceInfos.push({
            itemId: t.itemId,
            layerId: obj.id,
            fields: obj.fields,
            basePath: t.itemId + ".layer" + obj.id + ".fields",
            url: common.getProp(t, "item.url"),
            ids: [],
            relationships: obj.relationships || [],
            adminLayerInfo: obj.adminLayerInfo || {}
          });
        }
      });
    }
  });
  return datasourceInfos;
}

/**
 * Creates a simple lookup object to quickly understand an items type and dependencies
 * and associated web map layer ids based on itemId
 *
 * @param templates List of solution templates
 * @return The lookup object with type, dependencies, and webmap layer info
 */
export function _getTemplateTypeHash(templates: common.IItemTemplate[]): any {
  const templateTypeHash: any = {};
  templates.forEach(template => {
    templateTypeHash[template.itemId] = {
      type: template.type,
      dependencies: template.dependencies
    };
    if (template.type === "Web Map") {
      _updateWebMapHashInfo(template, templateTypeHash[template.itemId]);
    }
  });
  return templateTypeHash;
}

/**
 * Updates the lookup object with webmap layer info
 * so we can know the id used within a map for a given feature service
 *
 * @param template A webmap solution template
 * @return The lookup object with webmap layer info added
 */
export function _updateWebMapHashInfo(
  template: common.IItemTemplate,
  hashItem: any
) {
  const operationalLayers: any[] =
    common.getProp(template, "data.operationalLayers") || [];

  const tables: any[] = common.getProp(template, "data.tables") || [];
  const layersAndTables: any[] = operationalLayers.concat(tables);
  if (layersAndTables && layersAndTables.length > 0) {
    hashItem.layersAndTables = [];
    layersAndTables.forEach(layer => {
      const obj: any = {};
      let itemId: any;
      if (layer.itemId) {
        itemId = layer.itemId;
      } else if (layer.url && layer.url.indexOf("{{") > -1) {
        // some layers like heatmap layer don't have a itemId
        itemId = layer.url
          .replace("{{", "")
          .replace(/([.]layer([0-9]|[1-9][0-9])[.]url)[}]{2}/, "");
      }
      if (itemId) {
        obj[common.cleanLayerBasedItemId(itemId)] = {
          id: layer.id,
          url: layer.url
        };
        hashItem.layersAndTables.push(obj);
      }
    });
  }
}

/**
 * Updates the datasource info objects by passing the webmap layer IDs from the lookup hash
 * to the underlying feature service datasource infos
 *
 * @param datasourceInfos A webmap solution template
 * @param templateTypeHash A simple lookup object populated with key item info
 * @return The updated datasource infos
 */
export function _addMapLayerIds(
  datasourceInfos: common.IDatasourceInfo[],
  templateTypeHash: any
): common.IDatasourceInfo[] {
  const webMapIds: any[] = Object.keys(templateTypeHash).filter(k => {
    if (templateTypeHash[k].type === "Web Map") {
      return templateTypeHash[k];
    }
  });

  return datasourceInfos.map(ds => {
    webMapIds.forEach(webMapId => {
      templateTypeHash[webMapId].layersAndTables.forEach((opLayer: any) => {
        const opLayerInfo: any = opLayer[ds.itemId];
        const url: string =
          ds.url && !isNaN(ds.layerId)
            ? ds.url.replace(/[.]/, ".layer" + ds.layerId + ".")
            : "";
        if (
          opLayerInfo &&
          url === opLayerInfo.url &&
          ds.ids.indexOf(opLayerInfo.id) < 0
        ) {
          ds.ids.push(opLayerInfo.id);
        }
      });
    });
    return ds;
  });
}

/**
 * Get feature service item IDs from applications webmaps
 * As they are not explict dependencies of the application but are needed for field references
 *
 * @param template A webmap solution template
 * @param templateTypeHash A simple lookup object populated with key item info
 * @return A lsit of feature service item IDs
 */
export function _getWebMapFSDependencies(
  template: common.IItemTemplate,
  templateTypeHash: any
): string[] {
  const webMapFSDependencies: string[] = [];
  template.dependencies.forEach(dep => {
    const depObj: any = templateTypeHash[dep];
    if (depObj.type === "Web Map") {
      depObj.dependencies.forEach((depObjDependency: string) => {
        if (templateTypeHash[depObjDependency].type === "Feature Service") {
          webMapFSDependencies.push(depObjDependency);
        }
      });
    }
  });
  return webMapFSDependencies;
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Replaces a template entry in a list of templates
 *
 * @param templates A collection of AGO item templates
 * @param id Id of item in templates list to find; if not found, no replacement is () => done()
 * @param template Replacement template
 * @return True if replacement was made
 * @protected
 */
export function _replaceTemplate(
  templates: common.IItemTemplate[],
  id: string,
  template: common.IItemTemplate
): boolean {
  const i = common.findTemplateIndexInList(templates, id);
  if (i >= 0) {
    templates[i] = template;
    return true;
  }
  return false;
}
