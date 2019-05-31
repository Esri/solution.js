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
import { getEstimatedDeploymentCost } from "./solution";

/**
 * Mapping from item type to module with type-specific template-handling code
 */
const moduleMap: common.IItemTypeModuleMap = {
  dashboard: solutionSimpleTypes,

  // //???
  "code attachment": solutionSimpleTypes,
  "feature service": solutionSimpleTypes,
  form: solutionSimpleTypes,
  // //???

  // "feature layer": solutionFeatureLayer,
  // "feature service": solutionFeatureLayer,
  // "form": solutionSimpleTypes,
  // "group": solutionSimpleTypes,
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
 * Creates a solution template.
 *
 * @param ids List of AGO id strings
 * @param destinationRequestOptions Options for creating solution item in AGO
 * @return A promise without value
 */
export function createSolutionTemplate(
  ids: string[],
  destinationUserSession: auth.UserSession,
  templateDictionary: any
): Promise<any> {
  return new Promise((resolve, reject) => {
    const requestOptions: auth.IUserRequestOptions = {
      authentication: destinationUserSession
    };
    const solutionTemplates: common.IItemTemplate[] = [];

    // Handle a list of one or more AGO ids by stepping through the list
    // and calling this function recursively
    const getItemsPromise: Array<Promise<common.IItemTemplate[]>> = [];

    ids.forEach(id => {
      getItemsPromise.push(
        createItemTemplate(id, requestOptions, solutionTemplates)
      );
    });
    Promise.all(getItemsPromise).then(
      () => {
        resolve(solutionTemplates);
      },
      e => reject(common.fail(e))
    );
  });
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Creates template for an AGO item and its dependencies
 *
 * @param ids AGO id string
 * @param requestOptions Options for requesting information from AGO about items to be included in solution item
 * @param existingTemplates A collection of AGO item templates that can be referenced by newly-created templates
 * @return A promise that will resolve with the created template items
 * @protected
 */
export function createItemTemplate(
  id: string,
  requestOptions: auth.IUserRequestOptions,
  existingTemplates: common.IItemTemplate[]
): Promise<common.IItemTemplate[]> {
  return new Promise((resolve, reject) => {
    // Check if item and its dependents are already in list or are queued
    if (findTemplateInList(existingTemplates, id)) {
      resolve(existingTemplates);
    } else {
      // Add the id as a placeholder to show that it is being fetched
      existingTemplates.push(common.createPlaceholderTemplate(id));

      // For each item,
      //   * fetch item & data infos
      //   * create item & data JSONs
      //   * extract dependency ids & add them into list of group contents
      //   * templatize select components in item & data JSONs (e.g., extents)
      //   * copy item's resources, metadata, & thumbnail to solution item as resources
      //   * add JSONs to solution item's data JSON accumulation
      // Fetch the item
      portal.getItem(id, requestOptions).then(
        itemInfo => {
          const itemHandler: common.IItemTemplateConversions =
            moduleMap[itemInfo.type.toLowerCase()];
          if (!itemHandler) {
            console.warn(
              "Unimplemented item type (module level) " +
                itemInfo.type +
                " for " +
                itemInfo.id
            );
            resolve(existingTemplates);
          } else {
            itemHandler
              .convertItemToTemplate(itemInfo, requestOptions.authentication)
              .then(
                itemTemplate => {
                  // Set the value keyed by the id to the created template, replacing the placeholder template
                  replaceTemplate(
                    existingTemplates,
                    itemTemplate.id,
                    itemTemplate
                  );

                  // Trace item dependencies
                  if (itemTemplate.dependencies.length === 0) {
                    resolve(existingTemplates);
                  } else {
                    // Get its dependencies, asking each to get its dependents via
                    // recursive calls to this function
                    const dependentDfds: Array<
                      Promise<common.IItemTemplate[]>
                    > = [];
                    itemTemplate.dependencies.forEach(dependentId => {
                      if (!findTemplateInList(existingTemplates, dependentId)) {
                        dependentDfds.push(
                          createItemTemplate(
                            dependentId,
                            requestOptions,
                            existingTemplates
                          )
                        );
                      }
                    });
                    Promise.all(dependentDfds).then(
                      () => {
                        resolve(existingTemplates);
                      },
                      e => reject(common.fail(e))
                    );
                  }
                },
                e => reject(common.fail(e))
              );
          }
        },
        e => reject(common.fail(e))
      );
    }
  });
}

/**
 * Finds index of template by id in a list of templates.
 *
 * @param templates A collection of AGO item templates to search
 * @param id AGO id of template to find
 * @return Id of matching template or -1 if not found
 * @protected
 */
function findTemplateIndexInSolution(
  templates: common.IItemTemplate[],
  id: string
): number {
  const baseId = id;
  return templates.findIndex(template => {
    return baseId === template.itemId;
  });
}

/**
 * Finds template by id in a list of templates.
 *
 * @param templates A collection of AGO item templates to search
 * @param id AGO id of template to find
 * @return Matching template or null
 */
export function findTemplateInList(
  templates: common.IItemTemplate[],
  id: string
): common.IItemTemplate | null {
  const childId = findTemplateIndexInSolution(templates, id);
  return childId >= 0 ? templates[childId] : null;
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
export function replaceTemplate(
  templates: common.IItemTemplate[],
  id: string,
  template: common.IItemTemplate
): boolean {
  const i = findTemplateIndexInSolution(templates, id);
  if (i >= 0) {
    templates[i] = template;
    return true;
  }
  return false;
}
