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
 * @module createItemTemplate
 */

import * as common from "@esri/solution-common";
import * as featureLayer from "@esri/solution-feature-layer";
import * as fileProcessor from "@esri/solution-file";
import * as group from "@esri/solution-group";
import { simpleTypes, notebookProcessor } from "@esri/solution-simple-types";
import * as storyMap from "@esri/solution-storymap";

const UNSUPPORTED: common.moduleHandler = null;
/**
 * Mapping from item type to module with type-specific template-handling code.
 * AGO types come from a blend of arcgis-portal-app\src\js\arcgisonline\pages\item\_Info.js and
 * arcgis-portal-app\src\js\arcgis-components\src\_utils\metadata\item\displayName.ts
 */
export const moduleMap: common.IItemTypeModuleMap = {
  ////////////////////////////////////////////////////////
  // Group type
  Group: group,

  ////////////////////////////////////////////////////////
  // Layer types
  "Big Data Analytic": undefined,
  "Feature Collection": undefined,
  "Feature Service": featureLayer,
  Feed: undefined,
  "Geocoding Service": undefined,
  "Geodata Service": undefined,
  "Geometry Service": undefined,
  "Geoprocessing Service": undefined,
  "Globe Service": undefined,
  "Image Service": undefined,
  KML: undefined,
  "Map Service": featureLayer,
  "Network Analysis Service": undefined,
  "Real Time Analytic": undefined,
  "Relational Database Connection": undefined,
  "Scene Service": undefined,
  "Stream Service": undefined,
  Tool: undefined,
  "Vector Tile Service": undefined,
  WFS: undefined,
  WMS: undefined,
  WMTS: undefined,
  "Workflow Manager Service": undefined,

  ////////////////////////////////////////////////////////
  // Map types
  "3D Web Scene": undefined,
  "Web Map": simpleTypes,
  "Web Scene": undefined,

  ////////////////////////////////////////////////////////
  // App types
  Application: undefined,
  Dashboard: simpleTypes,
  "Data Store": undefined,
  "Desktop Application": undefined,
  "Excalibur Imagery Project": undefined,
  Form: simpleTypes,
  "Hub Initiative": undefined,
  "Hub Page": undefined,
  "Hub Site Application": undefined,
  "Insights Model": undefined,
  "Insights Page": undefined,
  "Insights Theme": undefined,
  "Insights Workbook": undefined,
  Mission: undefined,
  "Mobile Application": undefined,
  "Native Application": undefined,
  Notebook: notebookProcessor,
  "Ortho Mapping Project": undefined,
  "QuickCapture Project": simpleTypes,
  "Site Application": undefined,
  "Site Initiative": undefined,
  "Site Page": undefined,
  Solution: UNSUPPORTED,
  StoryMap: undefined,
  "Urban Model": undefined,
  "Web Experience Template": undefined,
  "Web Experience": undefined,
  "Web Mapping Application": simpleTypes,
  "Workforce Project": simpleTypes,

  ////////////////////////////////////////////////////////
  // File types
  "360 VR Experience": fileProcessor,
  "AppBuilder Extension": fileProcessor,
  "AppBuilder Widget Package": fileProcessor,
  "Application Configuration": fileProcessor,
  "ArcGIS Pro Add In": fileProcessor,
  "ArcGIS Pro Configuration": fileProcessor,
  "ArcPad Package": fileProcessor,
  "Basemap Package": fileProcessor,
  "CAD Drawing": fileProcessor,
  "CityEngine Web Scene": fileProcessor,
  "Code Attachment": UNSUPPORTED,
  "Code Sample": fileProcessor,
  "Color Set": fileProcessor,
  "Compact Tile Package": fileProcessor,
  "CSV Collection": fileProcessor,
  CSV: fileProcessor,
  "Deep Learning Package": fileProcessor,
  "Desktop Add In": fileProcessor,
  "Desktop Application Template": fileProcessor,
  "Desktop Style": fileProcessor,
  "Document Link": fileProcessor,
  "Explorer Add In": fileProcessor,
  "Explorer Layer": fileProcessor,
  "Explorer Map": fileProcessor,
  "Feature Collection Template": fileProcessor,
  "File Geodatabase": fileProcessor,
  GeoJson: fileProcessor,
  GeoPackage: fileProcessor,
  "Geoprocessing Package": fileProcessor,
  "Geoprocessing Sample": fileProcessor,
  "Globe Document": fileProcessor,
  "Image Collection": fileProcessor,
  Image: fileProcessor,
  "iWork Keynote": fileProcessor,
  "iWork Numbers": fileProcessor,
  "iWork Pages": fileProcessor,
  "KML Collection": fileProcessor,
  "Layer Package": fileProcessor,
  "Layer Template": fileProcessor,
  Layer: fileProcessor,
  Layout: fileProcessor,
  "Locator Package": fileProcessor,
  "Map Document": fileProcessor,
  "Map Package": fileProcessor,
  "Map Template": fileProcessor,
  "Microsoft Excel": fileProcessor,
  "Microsoft Powerpoint": fileProcessor,
  "Microsoft Word": fileProcessor,
  "Mobile Basemap Package": fileProcessor,
  "Mobile Map Package": fileProcessor,
  "Mobile Scene Package": fileProcessor,
  "Native Application Installer": fileProcessor,
  "Native Application Template": fileProcessor,
  netCDF: fileProcessor,
  "Operation View": fileProcessor,
  "Operations Dashboard Add In": fileProcessor,
  "Operations Dashboard Extension": fileProcessor,
  PDF: fileProcessor,
  "Pro Layer Package": fileProcessor,
  "Pro Layer": fileProcessor,
  "Pro Map Package": fileProcessor,
  "Pro Map": fileProcessor,
  "Pro Report": fileProcessor,
  "Project Package": fileProcessor,
  "Project Template": fileProcessor,
  "Published Map": fileProcessor,
  "Raster function template": fileProcessor,
  "Report Template": fileProcessor,
  "Rule Package": fileProcessor,
  "Scene Document": fileProcessor,
  "Scene Package": fileProcessor,
  "Service Definition": fileProcessor,
  Shapefile: fileProcessor,
  "Statistical Data Collection": fileProcessor,
  Style: fileProcessor,
  "Survey123 Add In": fileProcessor,
  "Symbol Set": fileProcessor,
  "Task File": fileProcessor,
  "Tile Package": fileProcessor,
  "Toolbox Package": fileProcessor,
  "Vector Tile Package": fileProcessor,
  "Viewer Configuration": fileProcessor,
  "Visio Document": fileProcessor,
  "Window Mobile Package": fileProcessor,
  "Windows Mobile Package": fileProcessor,
  "Windows Viewer Add In": fileProcessor,
  "Windows Viewer Configuration": fileProcessor,
  "Workflow Manager Package": fileProcessor,

  ////////////////////////////////////////////////////////
  // Testing "types"
  Undefined: undefined,
  Unsupported: UNSUPPORTED
};

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Creates template for an AGO item and its dependencies
 *
 * @param solutionItemId The solution to contain the item
 * @param itemId AGO id string
 * @param authentication Authentication for requesting information from AGO about items to be included in solution item
 * @param existingTemplates A collection of AGO item templates that can be referenced by newly-created templates
 * @return A promise that will resolve when creation is done
 * @protected
 */
export function createItemTemplate(
  solutionItemId: string,
  itemId: string,
  templateDictionary: any,
  authentication: common.UserSession,
  existingTemplates: common.IItemTemplate[],
  itemProgressCallback: common.IItemProgressCallback
): Promise<void> {
  return new Promise(resolve => {
    // Check if item and its dependents are already in list or are queued
    if (common.findTemplateInList(existingTemplates, itemId)) {
      resolve();
    } else {
      // Add the id as a placeholder to show that it is being fetched
      existingTemplates.push(common.createPlaceholderTemplate(itemId));

      itemProgressCallback(itemId, common.EItemProgressStatus.Started, 0);

      // Fetch the item
      common
        .getItemBase(itemId, authentication)
        .catch(() => {
          // If item query fails, try fetching item as a group
          // Change its placeholder from an empty type to the Group type so that we can later distinguish
          // between items and groups (the base info for a group doesn't include a type property)
          common.replaceTemplate(
            existingTemplates,
            itemId,
            common.createPlaceholderTemplate(itemId, "Group")
          );
          return common.getGroupBase(itemId, authentication);
        })
        .then(
          itemInfo => {
            itemInfo = common.sanitizeJSONAndReportChanges(itemInfo);

            const idTest: RegExp = /^source-[0-9A-F]{32}/i;
            // Remove any source-itemId type keywords
            if (Array.isArray(itemInfo.typeKeywords)) {
              itemInfo.typeKeywords = itemInfo.typeKeywords.filter(v =>
                idTest.test(v) ? false : true
              );
            }
            // Remove any source-itemId tags
            /* istanbul ignore else */
            if (Array.isArray(itemInfo.tags)) {
              itemInfo.tags = itemInfo.tags.filter(v =>
                idTest.test(v) ? false : true
              );
            }

            const placeholder = common.findTemplateInList(
              existingTemplates,
              itemId
            );
            let itemType = placeholder!.type;
            if (!itemType) {
              // Groups have this defined when their placeholder is created
              itemType = itemInfo.type;
              placeholder!.type = itemType;
            }
            if (!itemInfo.type) {
              itemInfo.type = itemType; // Groups don't have this property, so we'll patch it in
            }
            placeholder!.item = {
              ...itemInfo
            } as common.IItemGeneralized;

            // Interrupt process if progress callback returns `false`
            if (
              !itemProgressCallback(
                itemId,
                common.EItemProgressStatus.Created,
                1
              )
            ) {
              itemProgressCallback(
                itemId,
                common.EItemProgressStatus.Cancelled,
                1
              );
              resolve(common.fail("Cancelled"));
              return;
            }

            // If this is the solution's thumbnail, set the thumbnail rather than include it in solution
            if (
              itemInfo.tags &&
              itemInfo.tags.find(tag => tag === "deploy.thumbnail")
            ) {
              // Resolve the thumbnail setting whether or not there's an error
              common.getItemDataBlob(itemId, authentication).then(
                blob =>
                  common
                    .addThumbnailFromBlob(blob, solutionItemId, authentication)
                    .then(
                      () => {
                        itemProgressCallback(
                          itemId,
                          common.EItemProgressStatus.Ignored,
                          1
                        );
                        resolve();
                      }, // solution thumbnail set
                      () => {
                        itemProgressCallback(
                          itemId,
                          common.EItemProgressStatus.Ignored,
                          1
                        );
                        resolve();
                      } // unable to add thumbnail to solution
                    ),
                () => {
                  itemProgressCallback(
                    itemId,
                    common.EItemProgressStatus.Ignored,
                    1
                  );
                  resolve();
                } // unable to fetch thumbnail
              );
            } else {
              const itemHandler = moduleMap[itemType];
              if (!itemHandler || itemHandler === UNSUPPORTED) {
                if (itemHandler === UNSUPPORTED) {
                  itemProgressCallback(
                    itemId,
                    common.EItemProgressStatus.Ignored,
                    1
                  );
                  resolve();
                } else {
                  itemProgressCallback(
                    itemId,
                    common.EItemProgressStatus.Failed,
                    1
                  );
                  placeholder!.properties["failed"] = true;
                  common.replaceTemplate(
                    existingTemplates,
                    itemId,
                    placeholder!
                  );
                  resolve(
                    common.fail(
                      "The type of AGO item " +
                        itemId +
                        " ('" +
                        itemType +
                        "') is not supported at this time"
                    )
                  );
                }
              } else {
                // Handle original Story Maps with next-gen Story Maps
                /* istanbul ignore else */
                /* Not yet supported
                  if (storyMap.isAStoryMap(itemType, itemInfo.url)) {
                  itemHandler = storyMap;
                } */

                // Delegate the creation of the item to the handler
                itemHandler
                  .convertItemToTemplate(
                    solutionItemId,
                    itemInfo,
                    authentication
                  )
                  .then(
                    itemTemplate => {
                      common
                        .storeItemResources(
                          itemTemplate,
                          solutionItemId,
                          authentication
                        )
                        .then(resources => {
                          // update the templates resources
                          itemTemplate.item.thumbnail = null; // no longer needed; use resources
                          itemTemplate.resources = itemTemplate.resources.concat(
                            resources
                          );

                          // Set the value keyed by the id to the created template, replacing the placeholder template
                          common.replaceTemplate(
                            existingTemplates,
                            itemTemplate.itemId,
                            itemTemplate
                          );

                          // Trace item dependencies
                          if (itemTemplate.dependencies.length === 0) {
                            itemProgressCallback(
                              itemId,
                              common.EItemProgressStatus.Finished,
                              1
                            );
                            resolve();
                          } else {
                            // Get its dependencies, asking each to get its dependents via
                            // recursive calls to this function
                            const dependentDfds: Array<Promise<void>> = [];
                            itemTemplate.dependencies.forEach(dependentId => {
                              if (
                                !common.findTemplateInList(
                                  existingTemplates,
                                  dependentId
                                )
                              ) {
                                dependentDfds.push(
                                  createItemTemplate(
                                    solutionItemId,
                                    dependentId,
                                    templateDictionary,
                                    authentication,
                                    existingTemplates,
                                    itemProgressCallback
                                  )
                                );
                              }
                            });
                            // tslint:disable-next-line: no-floating-promises
                            Promise.all(dependentDfds).then(() => {
                              // Templatization of item and its dependencies done
                              itemProgressCallback(
                                itemId,
                                common.EItemProgressStatus.Finished,
                                1
                              );
                              resolve();
                            });
                          }
                        });
                    },
                    error => {
                      placeholder!.properties["error"] = JSON.stringify(error);
                      common.replaceTemplate(
                        existingTemplates,
                        itemId,
                        placeholder!
                      );
                      itemProgressCallback(
                        itemId,
                        common.EItemProgressStatus.Failed,
                        1
                      );
                      resolve();
                    }
                  );
              }
            }
          },
          // Id not found or item is not accessible
          () => {
            itemProgressCallback(itemId, common.EItemProgressStatus.Failed, 1);
            itemProgressCallback(itemId, common.EItemProgressStatus.Failed, 1);
            resolve();
          }
        );
    }
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
    /* istanbul ignore else */
    if (
      template.type === "Web Mapping Application" ||
      template.type === "Dashboard" ||
      template.type === "Web Map"
    ) {
      const webMapFSDependencies: string[] = _getWebMapFSDependencies(
        template,
        templateTypeHash
      );
      const itemHandler: any = moduleMap[template.item.type];
      /* istanbul ignore else */
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

// ------------------------------------------------------------------------------------------------------------------ //

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
        /* istanbul ignore else */
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
      /* istanbul ignore else */
      if (layer.itemId) {
        itemId = layer.itemId;
      }
      /* istanbul ignore else */
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
 * Updates a templatized datasource URL with a layer id.
 *
 * @param dataSourceUrl Templatized datasource URL
 * @param layerId Layer id
 * @return string Amended datasource URL
 */
export function _addLayerIdToDatasourceUrl(
  datasourceUrl?: string,
  layerId?: any
): string {
  return datasourceUrl && !isNaN(layerId)
    ? datasourceUrl.replace(/[.]/, ".layer" + layerId + ".")
    : "";
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
        const url: string = _addLayerIdToDatasourceUrl(ds.url, ds.layerId);
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
        /* istanbul ignore else */
        if (templateTypeHash[depObjDependency].type === "Feature Service") {
          webMapFSDependencies.push(depObjDependency);
        }
      });
    }
  });
  return webMapFSDependencies;
}
