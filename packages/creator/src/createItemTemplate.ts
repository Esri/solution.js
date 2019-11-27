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
import * as featureLayer from "@esri/solution-feature-layer";
import * as group from "@esri/solution-group";
import * as simpleTypes from "@esri/solution-simple-types";
import * as storyMap from "@esri/solution-storymap";

/**
 * Mapping from item type to module with type-specific template-handling code.
 * All of the AGO types listed in arcgis-portal-app\src\js\arcgisonline\pages\item\_Info.js
 * whether they are supported for solution items or not.
 */
const moduleMap: common.IItemTypeModuleMap = {
  "360 vr experience": undefined,
  "3d web scene": undefined,
  "appbuilder extension": undefined,
  "application configuration": undefined,
  application: undefined,
  "arcgis pro add in": undefined,
  "arcgis pro configuration": undefined,
  "arcpad package": undefined,
  "basemap package": undefined,
  "big data analytic": undefined,
  "cad drawing": undefined,
  "cityengine web scene": undefined,
  "code attachment": undefined,
  "code sample": undefined,
  "color set": undefined,
  "compact tile package": undefined,
  "csv collection": undefined,
  csv: undefined,
  dashboard: simpleTypes,
  "data store": undefined,
  "deep learning package": undefined,
  default: undefined,
  "desktop add in": undefined,
  "desktop application template": undefined,
  "desktop application": undefined,
  "desktop style": undefined,
  "document link": undefined,
  "elevation layer": undefined,
  "excalibur imagery project": undefined,
  "explorer add in": undefined,
  "explorer layer": undefined,
  "explorer map": undefined,
  "feature collection template": undefined,
  "feature collection": undefined,
  "feature service": featureLayer,
  feed: undefined,
  "file geodatabase": undefined,
  form: simpleTypes,
  "geocoding service": undefined,
  "geodata service": undefined,
  geojson: undefined,
  "geometry service": undefined,
  geopackage: undefined,
  "geoprocessing package": undefined,
  "geoprocessing sample": undefined,
  "geoprocessing service": undefined,
  "globe document": undefined,
  "globe service": undefined,
  group: group,
  "hub initiative": undefined,
  "hub page": undefined,
  "hub site application": undefined,
  "image collection": undefined,
  "image service": undefined,
  image: undefined,
  "insights model": undefined,
  "insights page": undefined,
  "insights theme": undefined,
  "insights workbook": undefined,
  "iwork keynote": undefined,
  "iwork numbers": undefined,
  "iwork pages": undefined,
  "kml collection": undefined,
  kml: undefined,
  "layer package": undefined,
  "layer template": undefined,
  layer: undefined,
  layout: undefined,
  "locator package": undefined,
  "map document": undefined,
  "map image layer": undefined,
  "map package": undefined,
  "map service": undefined,
  "map template": undefined,
  markup: undefined,
  "microsoft excel": undefined,
  "microsoft powerpoint": undefined,
  "microsoft word": undefined,
  mission: undefined,
  "mobile application": undefined,
  "mobile basemap package": undefined,
  "mobile map package": undefined,
  "mobile scene package": undefined,
  "native application installer": undefined,
  "native application template": undefined,
  "native application": undefined,
  netcdf: undefined,
  "network analysis service": undefined,
  notebook: undefined,
  "operation view": undefined,
  "operations dashboard add in": undefined,
  "operations dashboard extension": undefined,
  "ortho mapping project": undefined,
  pdf: undefined,
  "pro layer package": undefined,
  "pro layer": undefined,
  "pro map package": undefined,
  "pro map": undefined,
  "pro report": undefined,
  "project package": undefined,
  "project template": undefined,
  "published map": undefined,
  "quickcapture project": undefined,
  "raster function template": undefined,
  "real time analytic": undefined,
  "relational database connection": undefined,
  "report template": undefined,
  "route layer": undefined,
  "rule package": undefined,
  "scene document": undefined,
  "scene layer package": undefined,
  "scene service": undefined,
  shapefile: undefined,
  "site application": undefined,
  "site initiative": undefined,
  "site page": undefined,
  solution: undefined,
  "statistical data collection": undefined,
  storymap: undefined,
  "stream service": undefined,
  style: undefined,
  "survey123 add in": undefined,
  "symbol set": undefined,
  table: undefined,
  "task file": undefined,
  "tile package": undefined,
  tool: undefined,
  "toolbox package": undefined,
  "urban model": undefined,
  "vector tile package": undefined,
  "vector tile service": undefined,
  "viewer configuration": undefined,
  "visio document": undefined,
  "web experience template": undefined,
  "web experience": undefined,
  "web map": simpleTypes,
  "web mapping application": simpleTypes,
  "web scene": undefined,
  wfs: undefined,
  "window mobile package": undefined,
  "windows mobile package": undefined,
  "windows viewer add in": undefined,
  "windows viewer configuration": undefined,
  wms: undefined,
  wmts: undefined,
  "workflow manager package": undefined,
  "workflow manager service": undefined,
  "workforce project": undefined
};

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Creates template for an AGO item and its dependencies
 *
 * @param solutionItemId The solution to contain the item
 * @param itemId AGO id string
 * @param authentication Authentication for requesting information from AGO about items to be included in solution item
 * @param existingTemplates A collection of AGO item templates that can be referenced by newly-created templates
 * @return A promise that will resolve with the created template items
 * @protected
 */
export function createItemTemplate(
  solutionItemId: string,
  itemId: string,
  templateDictionary: any,
  authentication: common.UserSession,
  existingTemplates: common.IItemTemplate[]
): Promise<boolean> {
  return new Promise(resolve => {
    // Check if item and its dependents are already in list or are queued
    if (common.findTemplateInList(existingTemplates, itemId)) {
      resolve(true);
    } else {
      // Add the id as a placeholder to show that it is being fetched
      existingTemplates.push(common.createPlaceholderTemplate(itemId));
      console.log(
        "added placeholder template " +
          itemId +
          " [" +
          existingTemplates.length +
          "]"
      );

      // Fetch the item
      console.log("fetching item " + itemId + "...");
      common
        .getItem(itemId, authentication)
        .catch(() => {
          // If item query fails, try fetching item as a group
          // Change its placeholder from an empty type to the Group type so that we can later distinguish
          // between items and groups (the base info for a group doesn't include a type property)
          console.log("fetching group " + itemId + "...");
          _replaceTemplate(
            existingTemplates,
            itemId,
            common.createPlaceholderTemplate(itemId, "Group")
          );
          return common.getGroup(itemId, authentication);
        })
        .then(
          itemInfo => {
            const placeholder = common.findTemplateInList(
              existingTemplates,
              itemId
            );
            let itemType = placeholder!.type;
            if (!itemType) {
              itemType = itemInfo.type;
              _replaceTemplate(
                existingTemplates,
                itemId,
                common.createPlaceholderTemplate(itemId, itemType)
              );
            }
            itemInfo.type = itemType; // Groups don't have this property
            console.log("Got item " + itemId + ": " + itemType);

            const itemHandler = moduleMap[itemType.toLowerCase()];
            if (!itemHandler) {
              placeholder!.properties["partial"] = true;
            } else {
              // tslint:disable-next-line: no-floating-promises
              itemHandler
                .convertItemToTemplate(solutionItemId, itemInfo, authentication)
                .then(itemTemplate => {
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
                    console.log(
                      "item " +
                        itemId +
                        " has dependencies " +
                        JSON.stringify(itemTemplate.dependencies)
                    );
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
                            existingTemplates
                          )
                        );
                      }
                    });
                    // tslint:disable-next-line: no-floating-promises
                    Promise.all(dependentDfds).then(() => resolve(true));
                  }
                });
            }
          },
          // Id not found or item is not accessible
          () => {
            console.log("Unknown item " + itemId);
            _replaceTemplate(
              existingTemplates,
              itemId,
              common.createPlaceholderTemplate(itemId, "unknown")
            );
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
