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
import * as solutionFeatureLayer from "@esri/solution-feature-layer";
import * as solutionSimpleTypes from "@esri/solution-simple-types";
import * as solutionStoryMap from "@esri/solution-storymap";

/**
 * Mapping from item type to module with type-specific template-handling code
 */
const moduleMap: common.IItemTypeModuleMap = {
  // //??? Temporary assignments
  "project package": solutionSimpleTypes,
  "workforce project": solutionSimpleTypes,
  // //???

  dashboard: solutionSimpleTypes,
  "feature layer": solutionFeatureLayer,
  "feature service": solutionFeatureLayer,
  form: solutionSimpleTypes,
  group: solutionSimpleTypes,
  table: solutionFeatureLayer,
  vectortilelayer: solutionFeatureLayer,
  "web map": solutionSimpleTypes,
  "web mapping application": solutionSimpleTypes
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
      let itemHandler: common.IItemTemplateConversions =
        moduleMap[templateType];
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
          if (solutionStoryMap.isAStoryMap(template)) {
            itemHandler = solutionStoryMap;
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
