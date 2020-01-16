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
import * as file from "@esri/solution-file";
import * as group from "@esri/solution-group";
import * as simpleTypes from "@esri/solution-simple-types";
import * as storyMap from "@esri/solution-storymap";

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
  "Code Attachment": file,
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
        if (templateType === "Web Mapping Application") {
          if (storyMap.isAStoryMap(template) && template.data) {
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

/**
 * Calls the function to handle the circular dependencies for a given item type on deployment
 * As these are circular in nature we can't just have them wait on their dependency to finish as usual.
 * We need both the item and the dependency to be finished before this can run.
 *
 * @param templates Array of item templates to evaluate
 * @param destinationAuthentication Credentials for the requests to the destination
 * @param templateDictionary Hash of facts: org URL, adlib replacements, deferreds for dependencies
 *
 * @return A promise that will resolve once any updates have been made
 */
export function postProcessCircularDependencies(
  templates: common.IItemTemplate[],
  destinationAuthentication: common.UserSession,
  templateDictionary: any
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const circularDependencyUpdates = [] as Array<Promise<any>>;
    templates.forEach(template => {
      if (
        template.circularDependencies &&
        template.circularDependencies.length > 0
      ) {
        const itemHandler = moduleMap[template.type];
        if (itemHandler && itemHandler.postProcessCircularDependencies) {
          circularDependencyUpdates.push(
            itemHandler.postProcessCircularDependencies(
              template,
              destinationAuthentication,
              templateDictionary
            )
          );
        }
      }
    });

    Promise.all(circularDependencyUpdates).then(
      () => {
        resolve();
      },
      e => {
        reject(common.fail(e));
      }
    );
  });
}
