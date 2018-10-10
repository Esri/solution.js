/* Copyright (c) 2018 Esri
 * Apache-2.0 */

import * as items from "@esri/arcgis-rest-items";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { IItemUpdateResponse } from "@esri/arcgis-rest-items";
import * as sharing from "@esri/arcgis-rest-sharing";
import { ISetAccessRequestOptions } from "@esri/arcgis-rest-sharing";
import { AgolItem } from "./agolItem";
import { IItemHash } from "./itemFactory";

export interface ISortVertex {
  [id:string]: number;
}

export class SolutionItem {

  /**
   * Creates a Solution item containing JSON descriptions of items forming the solution.
   *
   * @param title Title for Solution item to create
   * @param collection List of JSON descriptions of items to publish into Solution
   * @param access Access to set for item: 'public', 'org', 'private'
   * @param requestOptions Options for the request
   * @returns A promise that will resolve with an object reporting success and the Solution id
   */
  static publishItemJSON (
    title: string,
    collection: IItemHash,
    access: string,
    requestOptions?: IUserRequestOptions
  ): Promise<IItemUpdateResponse> {
    return new Promise((resolve) => {
      // Define the solution item
      let itemSection = {
        title: title,
        type: 'Solution',
        itemType: 'text',
        access: access,
        listed: false,
        commentsEnabled: false
      };
      let dataSection = {
        items: collection
      };

      // Create it and add its data section
      let options = {
        title: title,
        item: itemSection,
        ...requestOptions
      };
      items.createItem(options)
      .then(function (results) {
        if (results.success) {
          let options = {
            id: results.id,
            data: dataSection,
            ...requestOptions
          };
          items.addItemJsonData(options)
          .then(function (results) {
            // Set the access manually since the access value in createItem appears to be ignored
            let options = {
              id: results.id,
              access: access,
              ...requestOptions as ISetAccessRequestOptions
            };
            sharing.setItemAccess(options)
            .then(function (results) {
              resolve({
                success: true,
                id: results.itemId
              })
            });
          });
        }
      });
    });
  }

  static topologicallySortItems (
    items:IItemHash
  ): string[] {
    // Topologically sort solution items into build list
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

    let buildList:string[] = [];  // list of ordered vertices--don't need linked list because we just want relative ordering

    // Use nums for algorithm's colors: WHITE = 0; GRAY = 1; BLACK = 2
    let verticesToVisit:ISortVertex = {};
    Object.keys(items).forEach(function(vertexId) {
      verticesToVisit[vertexId] = 0;  // WHITE; not yet visited
    });

    // Algorithm visits each vertex once. Don't need to record times or "from' nodes ("π" in pseudocode)
    Object.keys(verticesToVisit).forEach(function(vertexId) {
      if (!verticesToVisit[vertexId]) {  // if WHITE
        visit(vertexId);
      }
    });

    // Visit vertex
    function visit(vertexId:string) {
      verticesToVisit[vertexId] = 1;  // GRAY; visited, in progress

      // Visit dependents if not already visited
      var dependencies:string[] = (items[vertexId] as AgolItem).dependencies || [];
      dependencies.forEach(function (dependencyId) {
        dependencyId = dependencyId.substr(0, 32);
        if (!verticesToVisit[dependencyId]) {  // if WHITE
          visit(dependencyId);
        }
      });

      verticesToVisit[vertexId] = 2;  // BLACK; finished
      buildList.push(vertexId);  // add to end of list of ordered vertices because we want dependents first
    }

    return buildList;
  }

}