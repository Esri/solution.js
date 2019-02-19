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

import * as adlib from "adlib";
import * as items from "@esri/arcgis-rest-items";
import { ArcGISRequestError } from "@esri/arcgis-rest-request";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { IItem } from '@esri/arcgis-rest-common-types';

import * as mCommon from "./itemTypes/common";
import * as mClassifier from "./itemTypes/classifier";
import * as mInterfaces from "./interfaces";

// -- Externals ------------------------------------------------------------------------------------------------------//

/**
 * Creates a solution template item.
 *
 * @param title
 * @param version
 * @param ids AGO id string or list of AGO id strings
 * @param sourceRequestOptions Options for requesting information from AGO about items to be
 *                             included in solution template
 * @param destinationRequestOptions Options for creating solution template item in AGO
 * @return A promise that will resolve with a solution template item
 */
export function createSolutionTemplate (
  title: string,
  version: string,
  ids: string | string[],
  sourceRequestOptions: IUserRequestOptions,
  destinationRequestOptions: IUserRequestOptions
): Promise<mInterfaces.ISolutionTemplateItem> {
  return new Promise<mInterfaces.ISolutionTemplateItem>((resolve, reject) => {
    // Create the solution template item
    createSolutionTemplateItem(title, version, destinationRequestOptions, undefined, "public")
    .then(
      solutionTemplateItem => {
        // Get the templates for the items in the solution
        createSolutionItemTemplates(ids, solutionTemplateItem, sourceRequestOptions)
        .then(
          templates => {
            solutionTemplateItem.data.templates = templates;

            // Update the solution template item
            updateSolutionTemplateItem(solutionTemplateItem, destinationRequestOptions)
            .then(
              updatedSolutionTemplateItem => {
                resolve(updatedSolutionTemplateItem);
              },
              () => reject({ success: false })
            )
          },
          () => reject({ success: false })
        );
      },
      () => reject({ success: false })
    );
  });
}

/**
 * Converts a solution template into an AGO deployed solution and items.
 *
 * @param solutionTemplate Solution template to deploy
 * @param requestOptions Options for the request
 * @param settings
 * @param progressCallback
 * @return A promise that will resolve with a list of the ids of items created in AGO
 */
export function createSolutionFromTemplate  (
  solutionTemplate: mInterfaces.ISolutionTemplateItem,
  requestOptions: IUserRequestOptions,
  settings = {} as any,
  progressCallback?: (update:mInterfaces.IProgressUpdate) => void
): Promise<mInterfaces.ITemplate[]> {
  return new Promise<mInterfaces.ITemplate[]>((resolve, reject) => {
    const templates:mInterfaces.ITemplate[] = solutionTemplate.data.templates;
    const clonedSolution:mInterfaces.ITemplate[] = [];
    settings.solutionName = settings.solutionName || "Solution";

    // Don't bother creating folder if there are no items in solution
    if (!templates || Object.keys(templates).length === 0) {
      resolve(clonedSolution);
    }

    // Run through the list of item ids in clone order
    const cloneOrderChecklist:string[] = topologicallySortItems(templates);

    // -------------------------------------------------------------------------
    function launchDeployment () {
      createDeployedSolutionItem(settings.solutionName, solutionTemplate.item,
        requestOptions, settings, 'public')
      .then(
        solutionItem => {
          progressCallback({
            processId: solutionItem.id,
            type: "Solution",
            status: "done"
          });

          runThroughChecklistInParallel();
        },
        () => reject({ success: false })
      );
    }

    function runThroughChecklistInParallel () {
      const awaitAllItems = [] as Array<Promise<mInterfaces.ITemplate>>;
      cloneOrderChecklist.forEach(
        id => awaitAllItems.push(createItemFromTemplateWhenReady(id,
          templates, requestOptions, settings, progressCallback))
      );

      // Wait until all items have been created
      Promise.all(awaitAllItems)
      .then(
        clonedSolutionItems => resolve(clonedSolutionItems),
        () => reject({ success: false })
      );
    }
    // -------------------------------------------------------------------------

    // Use specified folder to hold the hydrated items to avoid name clashes
    if (settings.folderId) {
      launchDeployment();
    } else {
      // Create a folder to hold the hydrated items to avoid name clashes
      const folderName = settings.solutionName + " (" + mCommon.getUTCTimestamp() + ")";
      const options = {
        title: folderName,
        authentication: requestOptions.authentication
      };
      items.createFolder(options)
      .then(
        createdFolderResponse => {
          settings.folderId = createdFolderResponse.folder.id;
          launchDeployment();
        },
        () => reject({ success: false })
      );
    }
  });
}

export function getEstimatedDeploymentCost (
  solution: mInterfaces.ITemplate[]
): number {
  // Get the total estimated cost of creating this solution
  const reducer = (accumulator:number, currentTemplate:mInterfaces.ITemplate) =>
    accumulator + (currentTemplate.estimatedDeploymentCostFactor ?
    currentTemplate.estimatedDeploymentCostFactor : 3);
  return solution.reduce(reducer, 0);
}

export function getSupportedItemTypes (
): string[] {
  return mClassifier.getSupportedItemTypes();
}

// -- Internals ------------------------------------------------------------------------------------------------------//
// (export decoration is for unit testing)

/**
 * A parameterized server name to replace the organization URL in a Web Mapping Application's URL to
 * itself; name has to be acceptable to AGO, otherwise it discards the URL, so substitution must be
 * made before attempting to create the item.
 * @protected
 */
export const PLACEHOLDER_SERVER_NAME:string = "{{organization.portalBaseUrl}}";

/**
 * The portion of a Dashboard app URL between the server and the app id.
 * @protected
 */
export const OPS_DASHBOARD_APP_URL_PART:string = "/apps/opsdashboard/index.html#/";

/**
 * The portion of a Webmap URL between the server and the map id.
 * @protected
 */
export const WEBMAP_APP_URL_PART:string = "/home/webmap/viewer.html?webmap=";

/**
 * A vertex used in the topological sort algorithm.
 * @protected
 */
interface ISortVertex {
  /**
   * Vertex (AGO) id and its visited status, described by the SortVisitColor enum
   */
  [id:string]: number;
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
 * Creates an empty template.
 *
 * @param id AGO id of item
 * @return Empty item containing supplied id
 * @protected
 */
function createPlaceholderTemplate (
  id: string
): mInterfaces.ITemplate {
  return {
    itemId: id,
    type: "",
    key: "",
    item: null
  };
}

export function createDeployedSolutionItem (
  title: string,
  templateItem: IItem,
  requestOptions: IUserRequestOptions,
  settings = {} as any,
  access = "private"
): Promise<mInterfaces.IAGOItemAccess> {
  return new Promise((resolve, reject) => {
    const thumbnailUrl:string = "https://www.arcgis.com/sharing/content/items/" +
      templateItem.id + "/info/" + templateItem.thumbnail;
    const item = {
      itemType: "text",
      name: null as string,
      title,
      description: templateItem.description,
      tags: templateItem.tags,
      snippet: templateItem.snippet,
      thumbnailurl: thumbnailUrl,
      accessInformation: templateItem.accessInformation,
      type: "Solution",
      typeKeywords: ["Solution", "Deployed"],
      commentsEnabled: false
    };

    mCommon.createItemWithData(item, null, requestOptions, settings.folderId, access)
    .then(
      createResponse => {
        const orgUrl = (settings.organization && settings.organization.orgUrl) || "https://www.arcgis.com";
        const deployedSolutionItem:mInterfaces.IAGOItemAccess = {
          id: createResponse.id,
          url: orgUrl + "/home/item.html?id=" + createResponse.id
        }
        resolve(deployedSolutionItem);
      },
      () => reject({ success: false })
    );
  });
}

export function createItemFromTemplateWhenReady (
  itemId: string,
  templates: mInterfaces.ITemplate[],
  requestOptions: IUserRequestOptions,
  settings: any,
  progressCallback?: (update:mInterfaces.IProgressUpdate) => void
): Promise<mInterfaces.ITemplate> {
  settings[itemId] = {};
  const itemDef = new Promise<mInterfaces.ITemplate>((resolve, reject) => {
    const template = getTemplateInSolution(templates, itemId);
    if (!template) {
      reject({ success: false });
    }

    // Wait until all dependencies are deployed
    const awaitDependencies = [] as Array<Promise<mInterfaces.ITemplate>>;
    (template.dependencies || []).forEach(dependencyId => awaitDependencies.push(settings[dependencyId].def));
    Promise.all(awaitDependencies)
    .then(
      () => {
        // Prepare template
        let itemTemplate = mClassifier.initItemTemplateFromJSON(getTemplateInSolution(templates, itemId));

        // Interpolate it
        itemTemplate.dependencies = itemTemplate.dependencies ?
          mCommon.templatize(itemTemplate.dependencies) as string[] : [];
        itemTemplate = adlib.adlib(itemTemplate, settings);

        // Deploy it
        itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, requestOptions, progressCallback)
        .then(
          itemClone => resolve(itemClone),
          () => reject({ success: false })
        )
      },
      () => reject({ success: false })
    );
  });

  // Save the deferred for the use of items that depend on this item being created first
  settings[itemId].def = itemDef;
  return itemDef;
}

export function createSolutionItemTemplates (
  ids: string | string[],
  solutionTemplateItem: mInterfaces.ISolutionTemplateItem,
  requestOptions: IUserRequestOptions,
  templates?: mInterfaces.ITemplate[]
): Promise<mInterfaces.ITemplate[]> {
  if (!templates) {
    templates = [];
  }

  return new Promise((resolve, reject) => {
    if (typeof ids === "string") {
      // Handle a single AGO id
      const rootId = ids;
      if (getTemplateInSolution(templates, rootId)) {
        resolve(templates);  // Item and its dependents are already in list or are queued

      } else {
        // Add the id as a placeholder to show that it will be fetched
        const getItemPromise = mClassifier.convertItemToTemplate(rootId, requestOptions);
        templates.push(createPlaceholderTemplate(rootId));

        // Get the specified item
        getItemPromise
        .then(
          itemTemplate => {
            // Set the value keyed by the id, replacing the placeholder
            replaceTemplate(templates, itemTemplate.itemId, itemTemplate);

            // Trace item dependencies
            if (itemTemplate.dependencies.length === 0) {
              resolve(templates);

            } else {
              // Get its dependents, asking each to get its dependents via
              // recursive calls to this function
              const dependentDfds:Array<Promise<mInterfaces.ITemplate[]>> = [];

              itemTemplate.dependencies.forEach(
                dependentId => {
                  if (!getTemplateInSolution(templates, dependentId)) {
                    dependentDfds.push(createSolutionItemTemplates(dependentId,
                      solutionTemplateItem, requestOptions, templates));
                  }
                }
              );
              Promise.all(dependentDfds)
              .then(
                () => {
                  resolve(templates);
                },
                () => reject({ success: false })
              );
            }
          },
          () => reject({ success: false })
        );
      }

    } else if (Array.isArray(ids) && ids.length > 0) {
      // Handle a list of one or more AGO ids by stepping through the list
      // and calling this function recursively
      const getHierarchyPromise:Array<Promise<mInterfaces.ITemplate[]>> = [];

      ids.forEach(id => {
        getHierarchyPromise.push(createSolutionItemTemplates(id, solutionTemplateItem, requestOptions, templates));
      });
      Promise.all(getHierarchyPromise)
      .then(
        () => {
          resolve(templates);
        },
        () => reject({ success: false })
      );

    } else {
      reject({ success: false });
    }
  });
}

export function createSolutionTemplateItem (
  title: string,
  version: string,
  requestOptions: IUserRequestOptions,
  settings = {} as any,
  access = "private"
): Promise<mInterfaces.ISolutionTemplateItem> {
  return new Promise((resolve, reject) => {
    const solutionTemplateItem:mInterfaces.ISolutionTemplateItem = {
      item: {
        itemType: "text",
        name: null as string,
        title,
        type: "Solution",
        typeKeywords: ["Solution", "Template"],
        commentsEnabled: false
      },
      data: {
        metadata: {
          version
        },
        templates: [] as mInterfaces.ITemplate[]
      }
    }

    mCommon.createItemWithData(solutionTemplateItem.item, solutionTemplateItem.data,
      requestOptions, settings.folderId, access)
    .then(
      createResponse => {
        const orgUrl = (settings.organization && settings.organization.orgUrl) || "https://www.arcgis.com";
        solutionTemplateItem.item.id = createResponse.id;
        solutionTemplateItem.item.url = orgUrl + "/home/item.html?id=" + createResponse.id;
        resolve(solutionTemplateItem);
      },
      () => reject({ success: false })
    );
  });
}

/**
 * Finds index of template by id in a list of templates.
 *
 * @param templates List of templates to search
 * @param id AGO id of template to find
 * @return Id of matching template or -1 if not found
 * @protected
 */
function getTemplateIndexInSolution (
  templates: mInterfaces.ITemplate[],
  id: string
): number {
  const baseId = mCommon.deTemplatize(id);
  return templates.findIndex(
    template => {
      return baseId === mCommon.deTemplatize(template.itemId);
    }
  );
}

/**
 * Finds template by id in a list of templates.
 *
 * @param templates List of templates to search
 * @param id AGO id of template to find
 * @return Matching template or null
 */
export function getTemplateInSolution (
  templates: mInterfaces.ITemplate[],
  id: string
): mInterfaces.ITemplate {
  const childId = getTemplateIndexInSolution(templates, id);
  return childId >= 0 ? templates[childId] : null;
}

/**
 * Creates a Solution item containing JSON descriptions of items forming the solution.
 *
 * @param title Title for Solution item to create
 * @param solution Hash of JSON descriptions of items to publish into Solution
 * @param requestOptions Options for the request
 * @param folderId Id of folder to receive item; null/empty indicates that the item goes into the root
 *                 folder; ignored for Group item type
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return A promise that will resolve with an object reporting success and the Solution id
 */
export function publishSolutionTemplate (
  title: string,
  solution: mInterfaces.ITemplate[],
  requestOptions: IUserRequestOptions,
  folderId = null as string,
  access = "private"
): Promise<items.IItemUpdateResponse> {
  // Define the solution item
  const item = {
    title,
    type: "Solution",
    itemType: "text",
    typeKeywords: ["Template"],
    access,
    listed: false,
    commentsEnabled: false
  };
  const data = {
    templates: solution
  };

  return mCommon.createItemWithData(item, data, requestOptions, folderId, access);
}

/**
 * Replaces a template entry in a list of templates
 *
 * @param templates Templates list
 * @param id Id of item in templates list to find; if not found, no replacement is () => done()
 * @param template Replacement template
 * @return True if replacement was made
 * @protected
 */
export function replaceTemplate (
  templates: mInterfaces.ITemplate[],
  id: string,
  template: mInterfaces.ITemplate
): boolean {
  const i = getTemplateIndexInSolution(templates, id);
  if (i >=  0) {
    templates[i] = template;
    return true;
  }
  return false;
}

/**
 * Topologically sort a Solution's items into a build list.
 *
 * @param items Hash of JSON descriptions of items
 * @return List of ids of items in the order in which they need to be built so that dependencies
 * are built before items that require those dependencies
 * @throws Error("Cyclical dependency graph detected")
 * @protected
 */
export function topologicallySortItems (
  fullItems: mInterfaces.ITemplate[]
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

  const buildList:string[] = [];  // list of ordered vertices--don't need linked list because
                                  // we just want relative ordering

  const verticesToVisit:ISortVertex = {};
  fullItems.forEach(function(template) {
    verticesToVisit[template.itemId] = SortVisitColor.White;  // not yet visited
  });

  // Algorithm visits each vertex once. Don't need to record times or "from' nodes ("π" in pseudocode)
  fullItems.forEach(function(template) {
    if (verticesToVisit[template.itemId] === SortVisitColor.White) {  // if not yet visited
      visit(template.itemId);
    }
  });

  // Visit vertex
  function visit(vertexId:string) {
    verticesToVisit[vertexId] = SortVisitColor.Gray;  // visited, in progress

    // Visit dependents if not already visited
    const template = getTemplateInSolution(fullItems, vertexId);
    const dependencies:string[] = template.dependencies || [];
    dependencies.forEach(function (dependencyId) {
      if (verticesToVisit[dependencyId] === SortVisitColor.White) {  // if not yet visited
        visit(dependencyId);
      } else if (verticesToVisit[dependencyId] === SortVisitColor.Gray) {  // visited, in progress
        throw Error("Cyclical dependency graph detected");
      }
    });

    verticesToVisit[vertexId] = SortVisitColor.Black;  // finished
    buildList.push(vertexId);  // add to end of list of ordered vertices because we want dependents first
  }

  return buildList;
}

function updateSolutionTemplateItem (
  solutionTemplateItem: mInterfaces.ISolutionTemplateItem,
  requestOptions: IUserRequestOptions
): Promise<mInterfaces.ISolutionTemplateItem> {
  return new Promise<mInterfaces.ISolutionTemplateItem>((resolve, reject) => {
    // Update the data section of the solution item
    mCommon.updateItemData(solutionTemplateItem.item.id, solutionTemplateItem.data, requestOptions)
    .then(
      () => resolve(solutionTemplateItem),
      () => reject({ success: false })
    )
  });
}
