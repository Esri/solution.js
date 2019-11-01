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
    const cloneOrderChecklist: string[] = _topologicallySortItems(templates);

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
 * A vertex used in the topological sort algorithm.
 * @protected
 */
interface ISortVertex {
  /**
   * Vertex (AGO) id and its visited status, described by the SortVisitColor enum
   */
  [id: string]: number;
}

/**
 * A visit flag used in the topological sort algorithm.
 * @protected
 */
enum SortVisitColor {
  /** not yet visited */
  White,
  /** visited, in progress */
  Gray,
  /** finished */
  Black
}

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

/**
 * Topologically sorts a list of items into a build list.
 *
 * @param templates A collection of AGO item templates
 * @return List of ids of items in the order in which they need to be built so that dependencies
 * are built before items that require those dependencies
 * @throws Error("Cyclical dependency graph detected")
 * @protected
 */
export function _topologicallySortItems(
  templates: common.IItemTemplate[]
): string[] {
  // Cormen, Thomas H.; Leiserson, Charles E.; Rivest, Ronald L.; Stein, Clifford (2009)
  // Sections 22.3 (Depth-first search) & 22.4 (Topological sort), pp. 603-615
  // Introduction to Algorithms (3rd ed.), The MIT Press, ISBN 978-0-262-03384-8
  //
  // DFS(G)
  // 1 for each vertex u ∈ G,V
  // 2     u.color = WHITE
  // 3     u.π = NIL
  // 4 time = 0
  // 5 for each vertex u ∈ G,V
  // 6     if u.color == WHITE
  // 7         DFS-VISIT(G,u)
  //
  // DFS-VISIT(G,u)
  // 1 time = time + 1    // white vertex u has just been discovered
  // 2 u.d = time
  // 3 u.color = GRAY
  // 4 for each v ∈ G.Adj[u]     // explore edge (u,v)
  // 5     if v.color == WHITE
  // 6         v.π = u
  // 7         DFS-VISIT(G,v)
  // 8 u.color = BLACK         // blacken u; it is finished
  // 9 time = time + 1
  // 10 u.f = time
  //
  // TOPOLOGICAL-SORT(G)
  // 1 call DFS(G) to compute finishing times v.f for each vertex v
  // 2 as each vertex is finished, insert it onto front of a linked list
  // 3 return the linked list of vertices

  const buildList: string[] = []; // list of ordered vertices--don't need linked list because
  // we just want relative ordering

  const verticesToVisit: ISortVertex = {};
  templates.forEach(function(template) {
    verticesToVisit[template.itemId] = SortVisitColor.White; // not yet visited
  });

  // Algorithm visits each vertex once. Don't need to record times or "from' nodes ("π" in pseudocode)
  templates.forEach(function(template) {
    if (verticesToVisit[template.itemId] === SortVisitColor.White) {
      // if not yet visited
      visit(template.itemId);
    }
  });

  // Visit vertex
  function visit(vertexId: string) {
    verticesToVisit[vertexId] = SortVisitColor.Gray; // visited, in progress

    // Visit dependents if not already visited
    const template = common.findTemplateInList(templates, vertexId);
    const dependencies: string[] =
      template && template.dependencies ? template.dependencies : [];
    dependencies.forEach(function(dependencyId) {
      if (verticesToVisit[dependencyId] === SortVisitColor.White) {
        // if not yet visited
        visit(dependencyId);
      } else if (verticesToVisit[dependencyId] === SortVisitColor.Gray) {
        // visited, in progress
        throw Error("Cyclical dependency graph detected");
      }
    });

    verticesToVisit[vertexId] = SortVisitColor.Black; // finished
    buildList.push(vertexId); // add to end of list of ordered vertices because we want dependents first
  }

  return buildList;
}
