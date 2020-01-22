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
import * as file from "@esri/solution-file";
import * as group from "@esri/solution-group";
import * as simpleTypes from "@esri/solution-simple-types";
import * as storyMap from "@esri/solution-storymap";

const UNSUPPORTED: common.moduleHandler = null;
/**
 * Mapping from item type to module with type-specific template-handling code.
 * AGO types come from a blend of arcgis-portal-app\src\js\arcgisonline\pages\item\_Info.js and
 * arcgis-portal-app\src\js\arcgis-components\src\_utils\metadata\item\displayName.ts
 */
const moduleMap: common.IItemTypeModuleMap = {
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
  Form: undefined,
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
  Notebook: undefined,
  "Ortho Mapping Project": undefined,
  "QuickCapture Project": undefined,
  "Site Application": undefined,
  "Site Initiative": undefined,
  "Site Page": undefined,
  Solution: undefined,
  StoryMap: undefined,
  "Urban Model": undefined,
  "Web Experience Template": undefined,
  "Web Experience": undefined,
  "Web Mapping Application": simpleTypes,
  "Workforce Project": simpleTypes,

  ////////////////////////////////////////////////////////
  // File types
  "360 VR Experience": file,
  "AppBuilder Extension": file,
  "AppBuilder Widget Package": file,
  "Application Configuration": file,
  "ArcGIS Pro Add In": file,
  "ArcGIS Pro Configuration": file,
  "ArcPad Package": file,
  "Basemap Package": file,
  "CAD Drawing": file,
  "CityEngine Web Scene": file,
  "Code Attachment": UNSUPPORTED,
  "Code Sample": file,
  "Color Set": file,
  "Compact Tile Package": file,
  "CSV Collection": file,
  CSV: file,
  "Deep Learning Package": file,
  "Desktop Add In": file,
  "Desktop Application Template": file,
  "Desktop Style": file,
  "Document Link": file,
  "Explorer Add In": file,
  "Explorer Layer": file,
  "Explorer Map": file,
  "Feature Collection Template": file,
  "File Geodatabase": file,
  GeoJson: file,
  GeoPackage: file,
  "Geoprocessing Package": file,
  "Geoprocessing Sample": file,
  "Globe Document": file,
  "Image Collection": file,
  Image: file,
  "iWork Keynote": file,
  "iWork Numbers": file,
  "iWork Pages": file,
  "KML Collection": file,
  "Layer Package": file,
  "Layer Template": file,
  Layer: file,
  Layout: file,
  "Locator Package": file,
  "Map Document": file,
  "Map Package": file,
  "Map Template": file,
  "Microsoft Excel": file,
  "Microsoft Powerpoint": file,
  "Microsoft Word": file,
  "Mobile Basemap Package": file,
  "Mobile Map Package": file,
  "Mobile Scene Package": file,
  "Native Application Installer": file,
  "Native Application Template": file,
  netCDF: file,
  "Operation View": file,
  "Operations Dashboard Add In": file,
  "Operations Dashboard Extension": file,
  PDF: file,
  "Pro Layer Package": file,
  "Pro Layer": file,
  "Pro Map Package": file,
  "Pro Map": file,
  "Pro Report": file,
  "Project Package": file,
  "Project Template": file,
  "Published Map": file,
  "Raster function template": file,
  "Report Template": file,
  "Rule Package": file,
  "Scene Document": file,
  "Scene Package": file,
  "Service Definition": file,
  Shapefile: file,
  "Statistical Data Collection": file,
  Style: file,
  "Survey123 Add In": file,
  "Symbol Set": file,
  "Task File": file,
  "Tile Package": file,
  "Toolbox Package": file,
  "Vector Tile Package": file,
  "Viewer Configuration": file,
  "Visio Document": file,
  "Window Mobile Package": file,
  "Windows Mobile Package": file,
  "Windows Viewer Add In": file,
  "Windows Viewer Configuration": file,
  "Workflow Manager Package": file
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

      // Fetch the item
      common
        .getItem(itemId, authentication)
        .catch(() => {
          // If item query fails, try fetching item as a group
          // Change its placeholder from an empty type to the Group type so that we can later distinguish
          // between items and groups (the base info for a group doesn't include a type property)
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
              // Groups have this defined when their placeholder is created
              itemType = itemInfo.type;
              placeholder!.type = itemType;
            }
            if (!itemInfo.type) {
              itemInfo.type = itemType; // Groups don't have this property, so we'll patch it in
            }
            placeholder!.item = {
              ...itemInfo
            };

            const itemHandler = moduleMap[itemType];
            if (!itemHandler || itemHandler === UNSUPPORTED) {
              if (itemHandler === UNSUPPORTED) {
                placeholder!.properties["unsupported"] = true;
                _replaceTemplate(existingTemplates, itemId, placeholder!);
                console.log(
                  "!----- " +
                    itemId +
                    " " +
                    itemType +
                    " ----- UNSUPPORTED; skipping -----"
                ); // ???
                resolve(true);
              } else {
                placeholder!.properties["partial"] = true;
                _replaceTemplate(existingTemplates, itemId, placeholder!);
                console.log(
                  "!----- " +
                    itemId +
                    " " +
                    itemType +
                    " ----- UNHANDLED; using placeholder -----"
                ); // ???
                resolve(true);
              }
            } else {
              itemHandler
                .convertItemToTemplate(solutionItemId, itemInfo, authentication)
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
                  },
                  error => {
                    placeholder!.properties["partial"] = true;
                    placeholder!.properties["error"] = JSON.stringify(error);
                    _replaceTemplate(existingTemplates, itemId, placeholder!);
                    resolve(true);
                  }
                );
            }
          },
          // Id not found or item is not accessible
          () => {
            _replaceTemplate(
              existingTemplates,
              itemId,
              common.createPlaceholderTemplate(itemId, "unknown")
            );
            console.log(
              "!----- " +
                itemId +
                " ----- FAILED Id not found or item is not accessible -----"
            ); // ???
            resolve(true);
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
      const itemHandler: any = moduleMap[template.item.type];
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
