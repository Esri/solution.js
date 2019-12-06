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
 * Manages deployment of items via the REST API.
 *
 * @module deployItems
 */

/* tslint:disable:no-unnecessary-type-assertion */

import * as common from "@esri/solution-common";
import * as featureLayer from "@esri/solution-feature-layer";
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
  group: simpleTypes,
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
  "project package": simpleTypes,
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
  table: featureLayer,
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
  "workforce project": simpleTypes
};

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Deploys a set of items defined by templates.
 *
 * @param portalSharingUrl Server/sharing
 * @param storageItemId Id of storage item
 * @param templates A collection of AGO item templates
 * @param templateDictionary Hash of facts: org URL, adlib replacements
 * @param userSession Options for the request
 * @param progressTickCallback Function for reporting progress updates from type-specific template handlers
 * @return A promise that will resolve with the item's template (which is simply returned if it's
 *         already in the templates list
 */
export function deploySolutionItems(
  portalSharingUrl: string,
  storageItemId: string,
  templates: common.IItemTemplate[],
  storageAuthentication: common.UserSession,
  templateDictionary: any,
  destinationAuthentication: common.UserSession,
  progressTickCallback: () => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    // Create an ordered graph of the templates so that dependencies are created
    // before the items that need them
    const cloneOrderChecklist: string[] = common.topologicallySortItems(
      templates
    );

    // For each item in order from no dependencies to dependent on other items,
    //   * replace template symbols using template dictionary
    //   * create item in destination group
    //   * add created item's id into the template dictionary
    const awaitAllItems = [] as Array<Promise<string>>;
    cloneOrderChecklist.forEach(id => {
      // Get the item's template out of the list of templates
      const template = common.findTemplateInList(templates, id);
      if (!template) {
        reject(common.fail());
      }

      awaitAllItems.push(
        _createItemFromTemplateWhenReady(
          template!,
          common.generateStorageFilePaths(
            portalSharingUrl,
            storageItemId,
            template!.resources || []
          ),
          storageAuthentication,
          templateDictionary,
          destinationAuthentication,
          progressTickCallback
        )
      );
    });

    // Wait until all items have been created
    Promise.all(awaitAllItems).then(
      clonedSolutionItemIds => {
        resolve(clonedSolutionItemIds);
      },
      e => reject(common.fail(e))
    );
  });
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Creates an item from a template once the item's dependencies have been created.
 *
 * @param template Template of item to deploy
 * @param resourceFilePaths URL, folder, and filename for each item resource/metadata/thumbnail
 * @param templateDictionary Hash of facts: org URL, adlib replacements, deferreds for dependencies
 * @param userSession Options for the request
 * @param progressTickCallback Function for reporting progress updates from type-specific template handlers
 * @return A promise that will resolve with the item's template (which is simply returned if it's
 *         already in the templates list
 * @protected
 */
export function _createItemFromTemplateWhenReady(
  template: common.IItemTemplate,
  resourceFilePaths: common.IDeployFileCopyPath[],
  storageAuthentication: common.UserSession,
  templateDictionary: any,
  destinationAuthentication: common.UserSession,
  progressTickCallback: () => void
): Promise<string> {
  templateDictionary[template.itemId] = {};
  const itemDef = new Promise<string>((resolve, reject) => {
    // Wait until all of the item's dependencies are deployed
    const awaitDependencies = [] as Array<Promise<string>>;
    (template.dependencies || []).forEach(dependencyId => {
      awaitDependencies.push(templateDictionary[dependencyId].def);
    });
    Promise.all(awaitDependencies).then(() => {
      // Find the conversion handler for this item type
      const templateType = template.type;
      let itemHandler = moduleMap[templateType];
      if (!itemHandler) {
        console.warn(
          "Unimplemented item type (package level) " +
            template.type +
            " for " +
            template.itemId
        );
        resolve("");
      } else {
        // Handle original Story Maps with next-gen Story Maps
        if (templateType === "web mapping application") {
          if (storyMap.isAStoryMap(template)) {
            itemHandler = storyMap;
          }
        }

        // Delegate the creation of the template to the handler
        itemHandler
          .createItemFromTemplate(
            template,
            resourceFilePaths,
            storageAuthentication,
            templateDictionary,
            destinationAuthentication,
            progressTickCallback
          )
          .then(
            newItemId => resolve(newItemId),
            e => {
              reject(common.fail(e));
            }
          );
      }
    }, common.fail);
  });

  // Save the deferred for the use of items that depend on this item being created first
  templateDictionary[template.itemId].def = itemDef;
  return itemDef;
}
