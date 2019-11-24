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
  "360 vr experience": null,
  "3d web scene": null,
  "appbuilder extension": null,
  "application configuration": null,
  application: null,
  "arcgis pro add in": null,
  "arcgis pro configuration": null,
  "arcpad package": null,
  "basemap package": null,
  "big data analytic": null,
  "cad drawing": null,
  "cityengine web scene": null,
  "code attachment": null,
  "code sample": null,
  "color set": null,
  "compact tile package": null,
  "csv collection": null,
  csv: null,
  dashboard: simpleTypes,
  "data store": null,
  "deep learning package": null,
  default: null,
  "desktop add in": null,
  "desktop application template": null,
  "desktop application": null,
  "desktop style": null,
  "document link": null,
  "elevation layer": null,
  "excalibur imagery project": null,
  "explorer add in": null,
  "explorer layer": null,
  "explorer map": null,
  "feature collection template": null,
  "feature collection": null,
  "feature service": featureLayer,
  feed: null,
  "file geodatabase": null,
  form: simpleTypes,
  "geocoding service": null,
  "geodata service": null,
  geojson: null,
  "geometry service": null,
  geopackage: null,
  "geoprocessing package": null,
  "geoprocessing sample": null,
  "geoprocessing service": null,
  "globe document": null,
  "globe service": null,
  group: simpleTypes,
  "hub initiative": null,
  "hub page": null,
  "hub site application": null,
  "image collection": null,
  "image service": null,
  image: null,
  "insights model": null,
  "insights page": null,
  "insights theme": null,
  "insights workbook": null,
  "iwork keynote": null,
  "iwork numbers": null,
  "iwork pages": null,
  "kml collection": null,
  kml: null,
  "layer package": null,
  "layer template": null,
  layer: null,
  layout: null,
  "locator package": null,
  "map document": null,
  "map image layer": null,
  "map package": null,
  "map service": null,
  "map template": null,
  markup: null,
  "microsoft excel": null,
  "microsoft powerpoint": null,
  "microsoft word": null,
  mission: null,
  "mobile application": null,
  "mobile basemap package": null,
  "mobile map package": null,
  "mobile scene package": null,
  "native application installer": null,
  "native application template": null,
  "native application": null,
  netcdf: null,
  "network analysis service": null,
  notebook: null,
  "operation view": null,
  "operations dashboard add in": null,
  "operations dashboard extension": null,
  "ortho mapping project": null,
  pdf: null,
  "pro layer package": null,
  "pro layer": null,
  "pro map package": null,
  "pro map": null,
  "pro report": null,
  "project package": simpleTypes,
  "project template": null,
  "published map": null,
  "quickcapture project": null,
  "raster function template": null,
  "real time analytic": null,
  "relational database connection": null,
  "report template": null,
  "route layer": null,
  "rule package": null,
  "scene document": null,
  "scene layer package": null,
  "scene service": null,
  shapefile: null,
  "site application": null,
  "site initiative": null,
  "site page": null,
  solution: null,
  "statistical data collection": null,
  storymap: null,
  "stream service": null,
  style: null,
  "survey123 add in": null,
  "symbol set": null,
  table: featureLayer,
  "task file": null,
  "tile package": null,
  tool: null,
  "toolbox package": null,
  "urban model": null,
  "vector tile package": null,
  "vector tile service": null,
  "viewer configuration": null,
  "visio document": null,
  "web experience template": null,
  "web experience": null,
  "web map": simpleTypes,
  "web mapping application": simpleTypes,
  "web scene": null,
  wfs: null,
  "window mobile package": null,
  "windows mobile package": null,
  "windows viewer add in": null,
  "windows viewer configuration": null,
  wms: null,
  wmts: null,
  "workflow manager package": null,
  "workflow manager service": null,
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
      const templateType = template.type.toLowerCase();
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
