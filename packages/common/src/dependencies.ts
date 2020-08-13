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
 * Provides common functions for organizing dependencies among items.
 *
 * @module dependencies
 */

import { IItemTemplate } from "./interfaces";
import { findTemplateIndexInList } from "./templatization";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Topologically sorts a list of items into a build list.
 *
 * @param templates A collection of AGO item templates
 * @return List of ids of items in the order in which they need to be built so that dependencies
 * are built before items that require those dependencies
 * @throws Error("Cyclical dependency graph detected")
 * @protected
 */
export function topologicallySortItems(
  templates: IItemTemplate[]
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

    // Visit dependents if not already visited; template has to be in templates list because calls to visit()
    // are based on verticiesToVisit[], which is initialized using the templates list
    const template =
      templates[findTemplateIndexInList(templates, vertexId)];
    const dependencies: string[] = template.dependencies || [];
    dependencies.forEach(function(dependencyId) {
      if (verticesToVisit[dependencyId] === SortVisitColor.White) {
        // if not yet visited
        visit(dependencyId);
      } else if (verticesToVisit[dependencyId] === SortVisitColor.Gray) {
        // visited, in progress
        throw Error("Cyclical dependency detected involving items " + vertexId + " and " + dependencyId);
      } else {
        // finished
      }
    });

    verticesToVisit[vertexId] = SortVisitColor.Black; // finished
    buildList.push(vertexId); // add to end of list of ordered vertices because we want dependents first
  }

  return buildList;
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
