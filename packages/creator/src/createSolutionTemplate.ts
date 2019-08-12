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

import * as auth from "@esri/arcgis-rest-auth";
import * as common from "@esri/solution-common";
import * as portal from "@esri/arcgis-rest-portal";
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
  requestOptions: auth.IUserRequestOptions,
  existingTemplates: common.IItemTemplate[]
): Promise<boolean> {
  return new Promise((resolve, reject) => {
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

      // For each item,
      //   * fetch item & data infos
      //   * create item & data JSONs
      //   * extract dependency ids & add them into list of group contents
      //   * templatize select components in item & data JSONs (e.g., extents)
      //   * copy item's resources, metadata, & thumbnail to solution item as resources
      //   * add JSONs to solution item's data JSON accumulation
      // Fetch the item
      console.log("fetching item " + itemId);
      portal.getItem(itemId, requestOptions).then(
        itemInfo => {
          // Check if this is the solution's thumbnail
          if (itemInfo.tags.find(tag => tag === "deploy.thumbnail")) {
            // Set the thumbnail
            const thumbnailUrl =
              portalSharingUrl + "/content/items/" + itemId + "/data";
            common
              .getBlob(thumbnailUrl, requestOptions)
              .then(
                blob =>
                  common
                    .addThumbnailFromBlob(blob, solutionItemId, requestOptions)
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
          console.log("fetching group " + itemId);
          portal.getGroup(itemId, requestOptions).then(
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
  destinationUserSession: auth.UserSession,
  progressTickCallback: () => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    const requestOptions: auth.IUserRequestOptions = {
      authentication: destinationUserSession
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
        console.log(
          "removed " +
            (origLen - solutionTemplates.length) +
            " placeholder templates"
        );

        resolve(solutionTemplates);
      },
      e => reject(common.fail(e))
    );
  });
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
