/*
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

import { IItemHash } from "./fullItemHierarchy";
import { IFullItem } from "./fullItem";

//--------------------------------------------------------------------------------------------------------------------//

/**
 * A recursive structure describing the hierarchy of a collection of AGOL items.
 */
export interface IHierarchyEntry {
  /**
   * AGOL item type name
   */
  type: string,
  /**
   * AGOL item id
   */
  id: string,
  /**
   * Item's dependencies
   */
  dependencies: IHierarchyEntry[]
}

/**
 * Extract item hierarchy structure from a Solution's items list.
 *
 * @param items Hash of JSON descriptions of items
 * @return JSON structure reflecting dependency hierarchy of items; shared dependencies are repeated;
 * each element of structure contains 1) AGOL type of item, 2) AGOL id of item (groups have a type of 'Group'),
 * 3) list of dependencies, and, for Feature Services only, 4) the feature layer id in the feature service
 */
export function getItemHierarchy (
  items:IItemHash
): IHierarchyEntry[] {
  let hierarchy:IHierarchyEntry[] = [];

  // Find the top-level nodes. Start with all nodes, then remove those that other nodes depend on
  let topLevelNodes:string[] = Object.keys(items);
  Object.keys(items).forEach(function (id) {
    ((items[id] as IFullItem).dependencies || []).forEach(function (dependencyId) {
      let iNode = topLevelNodes.indexOf(dependencyId.substr(0, 32));
      if (iNode >= 0) {
        // Node is somebody's dependency, so remove the node from the list of top-level nodes
        topLevelNodes.splice(iNode, 1);
      }
    });
  });

  // Hierarchically list the children of specified nodes
  function itemChildren(children:string[], hierarchy:IHierarchyEntry[]): void {

    children.forEach(function (id) {
      let child:IHierarchyEntry = {
        id: id,
        type: (items[id] as IFullItem).type,
        dependencies: []
      };

      // Fill in the dependencies array with any children
      let dependencyIds = (items[id] as IFullItem).dependencies;
      if (Array.isArray(dependencyIds) && dependencyIds.length > 0) {
        itemChildren(dependencyIds, child.dependencies);
      }

      hierarchy.push(child);
    });
  }

  itemChildren(topLevelNodes, hierarchy);
  return hierarchy;
}