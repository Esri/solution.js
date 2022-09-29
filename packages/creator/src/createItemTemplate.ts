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

import {
  cleanLayerBasedItemId,
  createPlaceholderTemplate,
  EItemProgressStatus,
  SolutionTemplateFormatVersion,
  findTemplateInList,
  getGroupBase,
  getItemBase,
  hasDatasource,
  IDatasourceInfo,
  IItemGeneralized,
  IItemProgressCallback,
  IItemTemplate,
  ISourceFile,
  ISourceFileCopyPath,
  getItemResourcesFilesFromPaths,
  getItemResourcesPaths,
  replaceTemplate,
  sanitizeJSONAndReportChanges,
  fail,
  UserSession
} from "@esri/solution-common";
import { getProp } from "@esri/hub-common";
import { moduleMap, UNSUPPORTED } from "./module-map";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Creates template for an AGO item and its dependencies
 *
 * @param solutionItemId The solution to contain the item
 * @param itemId AGO id string
 * @param templateDictionary Hash of facts
 * @param srcAuthentication Credentials for requests to source items
 * @param destAuthentication Authentication for requesting information from AGO about items to be included in solution item
 * @param existingTemplates A collection of AGO item templates that can be referenced by newly-created templates
 * @returns A promise which resolves with an array of resources for the item and its dependencies
 * @private
 */
export function createItemTemplate(
  solutionItemId: string,
  itemId: string,
  templateDictionary: any,
  srcAuthentication: UserSession,
  destAuthentication: UserSession,
  existingTemplates: IItemTemplate[],
  itemProgressCallback: IItemProgressCallback
): Promise<ISourceFile[]> {
  return new Promise(resolve => {
    // Check if item and its dependents are already in list or are queued
    if (findTemplateInList(existingTemplates, itemId)) {
      resolve([]);
    } else {
      // Add the id as a placeholder to show that it is being fetched
      existingTemplates.push(createPlaceholderTemplate(itemId));

      itemProgressCallback(itemId, EItemProgressStatus.Started, 0);

      // Fetch the item
      getItemBase(itemId, srcAuthentication)
        .catch(() => {
          // If item query fails, try fetching item as a group
          // Change its placeholder from an empty type to the Group type so that we can later distinguish
          // between items and groups (the base info for a group doesn't include a type property)
          replaceTemplate(
            existingTemplates,
            itemId,
            createPlaceholderTemplate(itemId, "Group")
          );
          return getGroupBase(itemId, srcAuthentication);
        })
        .then(
          itemInfo => {
            itemInfo = sanitizeJSONAndReportChanges(itemInfo);

            // Save the URL as a symbol
            if (itemInfo.url) {
              templateDictionary[itemInfo.url] = "{{" + itemInfo.id + ".url}}";
              itemInfo.origUrl = itemInfo.url;
            }

            const idTest: RegExp = /^source-[0-9A-F]{32}/i;
            // Remove any source-itemId type keywords
            /* istanbul ignore else */
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

            const placeholder = findTemplateInList(existingTemplates, itemId);
            let itemType = placeholder.type;
            if (!itemType) {
              // Groups have this defined when their placeholder is created
              itemType = itemInfo.type;
              placeholder.type = itemType;
            }
            if (!itemInfo.type) {
              itemInfo.type = itemType; // Groups don't have this property, so we'll patch it in
            }
            placeholder.item = {
              ...itemInfo
            } as IItemGeneralized;

            // Interrupt process if progress callback returns `false`
            if (!itemProgressCallback(itemId, EItemProgressStatus.Created, 1)) {
              itemProgressCallback(itemId, EItemProgressStatus.Cancelled, 1);
              resolve(fail("Cancelled"));
              return;
            }

            const itemHandler = moduleMap[itemType];
            if (!itemHandler || itemHandler === UNSUPPORTED) {
              if (itemHandler === UNSUPPORTED) {
                itemProgressCallback(itemId, EItemProgressStatus.Ignored, 1);
                resolve([]);
              } else {
                itemProgressCallback(itemId, EItemProgressStatus.Failed, 1);
                placeholder.properties["failed"] = true;
                replaceTemplate(existingTemplates, itemId, placeholder);
                resolve(
                  fail(
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
                  destAuthentication,
                  srcAuthentication,
                  templateDictionary
                )
                .then(
                  itemTemplate => {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    getItemResourcesPaths(
                      itemTemplate,
                      solutionItemId,
                      srcAuthentication,
                      SolutionTemplateFormatVersion
                    ).then((resourceItemFilePaths: ISourceFileCopyPath[]) => {
                      itemTemplate.item.thumbnail = null; // not needed in this property; handled as a resource

                      // eslint-disable-next-line @typescript-eslint/no-floating-promises
                      getItemResourcesFilesFromPaths(
                        resourceItemFilePaths,
                        srcAuthentication
                      ).then((resourceItemFiles: ISourceFile[]) => {
                        // update the template's resources
                        itemTemplate.resources = itemTemplate.resources.concat(
                          resourceItemFiles.map(
                            (file: ISourceFile) =>
                              file.folder + "/" + file.filename
                          )
                        );

                        // Set the value keyed by the id to the created template, replacing the placeholder template
                        replaceTemplate(
                          existingTemplates,
                          itemTemplate.itemId,
                          itemTemplate
                        );

                        // Trace item dependencies
                        if (itemTemplate.dependencies.length === 0) {
                          itemProgressCallback(
                            itemId,
                            EItemProgressStatus.Finished,
                            1
                          );
                          resolve(resourceItemFiles);
                        } else {
                          // Get its dependencies, asking each to get its dependents via
                          // recursive calls to this function
                          const dependentDfds: Array<Promise<
                            ISourceFile[]
                          >> = [];
                          itemTemplate.dependencies.forEach(dependentId => {
                            if (
                              !findTemplateInList(
                                existingTemplates,
                                dependentId
                              )
                            ) {
                              dependentDfds.push(
                                createItemTemplate(
                                  solutionItemId,
                                  dependentId,
                                  templateDictionary,
                                  srcAuthentication,
                                  destAuthentication,
                                  existingTemplates,
                                  itemProgressCallback
                                )
                              );
                            }
                          });
                          // eslint-disable-next-line @typescript-eslint/no-floating-promises
                          Promise.all(dependentDfds).then(
                            (dependentResourceItemFiles: ISourceFile[][]) => {
                              // Templatization of item and its dependencies done
                              itemProgressCallback(
                                itemId,
                                EItemProgressStatus.Finished,
                                1
                              );
                              resourceItemFiles = dependentResourceItemFiles.reduce(
                                (accumulator, currentValue) =>
                                  accumulator.concat(currentValue),
                                resourceItemFiles
                              );
                              resolve(resourceItemFiles);
                            }
                          );
                        }
                      });
                    });
                  },
                  error => {
                    placeholder.properties["error"] = JSON.stringify(error);
                    replaceTemplate(existingTemplates, itemId, placeholder);
                    itemProgressCallback(itemId, EItemProgressStatus.Failed, 1);
                    resolve([]);
                  }
                );
            }
          },
          // Id not found or item is not accessible
          () => {
            // removed itemProgressCallback Failed per issue #859
            // Skip items that we cannot fetch
            resolve([]);
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
 * @returns A list of templates that have templatized field references
 */
export function postProcessFieldReferences(
  templates: IItemTemplate[]
): IItemTemplate[] {
  const datasourceInfos: IDatasourceInfo[] = _getDatasourceInfos(templates);
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
        let dependantDatasources: IDatasourceInfo[] = datasourceInfos.filter(
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
 * @returns A list of IDataSourceInfo objects with key properties
 * @private
 */
export function _getDatasourceInfos(
  templates: IItemTemplate[]
): IDatasourceInfo[] {
  const datasourceInfos: IDatasourceInfo[] = [];
  templates.forEach(t => {
    if (t.type === "Feature Service") {
      const layers: any[] = getProp(t, "properties.layers") || [];
      const tables: any[] = getProp(t, "properties.tables") || [];
      const layersAndTables: any[] = layers.concat(tables);
      layersAndTables.forEach(obj => {
        /* istanbul ignore else */
        if (!hasDatasource(datasourceInfos, t.itemId, obj.id)) {
          datasourceInfos.push({
            itemId: t.itemId,
            layerId: obj.id,
            fields: obj.fields,
            basePath: t.itemId + ".layer" + obj.id + ".fields",
            url: getProp(t, "item.url"),
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
 * @returns The lookup object with type, dependencies, and webmap layer info
 * @private
 */
export function _getTemplateTypeHash(templates: IItemTemplate[]): any {
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
 * @returns The lookup object with webmap layer info added
 * @private
 */
export function _updateWebMapHashInfo(template: IItemTemplate, hashItem: any) {
  const operationalLayers: any[] =
    getProp(template, "data.operationalLayers") || [];

  const tables: any[] = getProp(template, "data.tables") || [];
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
        obj[cleanLayerBasedItemId(itemId)] = {
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
 * @returns string Amended datasource URL
 * @private
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
 * @returns The updated datasource infos
 * @private
 */
export function _addMapLayerIds(
  datasourceInfos: IDatasourceInfo[],
  templateTypeHash: any
): IDatasourceInfo[] {
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
 * @returns A lsit of feature service item IDs
 * @private
 */
export function _getWebMapFSDependencies(
  template: IItemTemplate,
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
