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
import * as request from "@esri/arcgis-rest-request";
import { ArcGISRequestError, IRequestOptions, ResponseFormats } from "@esri/arcgis-rest-request";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { IItem } from '@esri/arcgis-rest-common-types';

import * as mCommon from "./itemTypes/common";
import * as mClassifier from "./itemTypes/classifier";
import * as mInterfaces from "./interfaces";
import * as mObjHelpers from "./utils/object-helpers";

// -- Externals ------------------------------------------------------------------------------------------------------//

/**
 * Creates a solution template item.
 *
 * @param title The title to use for the item
 * @param version The version to include in the item's metadata
 * @param ids AGO id string or list of AGO id strings
 * @param sourceRequestOptions Options for requesting information from AGO about items to be included in solution item
 * @param destinationRequestOptions Options for creating solution item in AGO
 * @return A promise that will resolve with a solution item
 */
export function createSolutionItem (
  title: string,
  version: string,
  ids: string | string[],
  sourceRequestOptions: IUserRequestOptions,
  destinationRequestOptions?: IUserRequestOptions
): Promise<mInterfaces.ISolutionItem> {
  return new Promise<mInterfaces.ISolutionItem>((resolve, reject) => {
    if (!destinationRequestOptions) {
      destinationRequestOptions = sourceRequestOptions;
    }

    // Create an empty solution item
    createSolutionAgoItem(title, version, destinationRequestOptions, undefined, "public")
    .then(
      solutionItem => {
        // Get the templates for the items in the solution
        createItemTemplates(ids, sourceRequestOptions)
        .then(
          templates => {
            solutionItem.data.templates = templates;

            // Create an empty solution storage item to hold thumbnails and resources
            // until solution items are enabled to store resources
            createSolutionStorageAgoItem(solutionItem.item.title, destinationRequestOptions, undefined, "public")
            .then(
              solutionStorageItem => {
                solutionItem.data.metadata.resourceStorageItemId = solutionStorageItem.item.id;

                // Save the source item thumbnails and resources
                const saveResourcesDef = saveResourcesInSolutionItem(solutionItem.data.templates,
                  solutionStorageItem.item.id, sourceRequestOptions, destinationRequestOptions);

                // Update the solution item with its templates
                const saveTemplatesDef = updateSolutionAgoItem(solutionItem, destinationRequestOptions);

                Promise.all([
                  saveResourcesDef,
                  saveTemplatesDef
                ])
                .then(
                  responses => {
                    resolve(solutionItem);
                  },
                  (e) => reject(mCommon.fail(e))  // unable to save resources or templates
                );
              },
              (e) => reject(mCommon.fail(e))  // unable to create item to save resources
            );
          },
          (e) => reject(mCommon.fail(e))  // unable to create templates
        );
      },
      (e) => reject(mCommon.fail(e))  // unable to create solution item
    );
  });
}

/**
 * Converts a solution template into an AGO deployed solution and items.
 *
 * @param solutionItem Solution template to deploy
 * @param requestOptions Options for the request
 * @param settings Hash of facts: org URL, adlib replacements
 * @param progressCallback Function for reporting progress updates from type-specific template handlers
 * @return A promise that will resolve with a list of the ids of items created in AGO
 */
export function deploySolutionItem  (
  solutionItem: mInterfaces.ISolutionItem,
  requestOptions: IUserRequestOptions,
  settings = {} as any,
  progressCallback?: (update:mInterfaces.IProgressUpdate) => void
): Promise<mInterfaces.ITemplate[]> {
  return new Promise<mInterfaces.ITemplate[]>((resolve, reject) => {
    const templates:mInterfaces.ITemplate[] = mObjHelpers.getProp(solutionItem, "data.templates");
    const clonedSolution:mInterfaces.ITemplate[] = [];
    settings.solutionName = settings.solutionName || "Solution";

    // Don't bother creating folder if there are no items in solution
    if (!templates || Object.keys(templates).length === 0) {
      resolve(clonedSolution);
    }

    // Run through the list of item ids in clone order
    const cloneOrderChecklist:string[] = topologicallySortItems(templates);

    // -------------------------------------------------------------------------
    // Common launch point whether using an existing folder or following the creation of one
    // Creates deployed solution item, then launches deployment of its items
    function launchDeployment () {
      createDeployedSolutionAgoItem(settings.solutionName, solutionItem, requestOptions, settings, 'public')
      .then(
        deployedSolutionItem => {
          progressCallback && progressCallback({
            processId: deployedSolutionItem.id,
            type: "Solution",
            status: "done"
          });

          runThroughChecklistInParallel();
        },
        (e) => reject(mCommon.fail(e))
      );
    }

    // Trigger creation of all items in list and wait for completion
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
        (e) => reject(mCommon.fail(e))
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
        (e) => reject(mCommon.fail(e))
      );
    }
  });
}

/**
 * Returns the sum of the estimated cost factors of a set of templates.
 *
 * @param templates A collection of AGO item templates
 * @return Sum of cost factors
 */
export function getEstimatedDeploymentCost (
  templates: mInterfaces.ITemplate[]
): number {
  // Get the total estimated cost of creating this solution
  const reducer = (accumulator:number, currentTemplate:mInterfaces.ITemplate) =>
    accumulator + (currentTemplate.estimatedDeploymentCostFactor ?
    currentTemplate.estimatedDeploymentCostFactor : 3);
  return templates.reduce(reducer, 0);
}

/**
 * Returns a list of the currently-supported AGO item types.
 *
 * @return List of item type names; names are all-lowercase forms of standard names
 */
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
 * Copies a conventional (non-thumbnail) resource from one item to another.
 *
 * @param itemId Id of item serving as source of resource
 * @param url URL to source resource
 * @param storageItemId Id of item to receive copy of resource
 * @param sourceRequestOptions Options for requesting information from source
 * @param destinationRequestOptions Options for writing information to destination
 * @return A promise which resolves to the tag under which the resource is stored
 * @protected
 */
export function copyRegularResource (
  itemId: string,
  url: string,
  storageItemId: string,
  sourceRequestOptions: IUserRequestOptions,
  destinationRequestOptions: IUserRequestOptions
): Promise<string> {
  // Extract the resource's filename; we'll use the source item's id as a folder name so that the destination
  // item can store resources from more than one source item; supplement the folder name with the source
  // folder name if there is one
  let folder = itemId;
  let filename = url.substring(url.indexOf("/resources/") + "/resources/".length);
  const filenameParts = filename.split("/");
  if (filenameParts.length > 1) {
    folder += "_" + filenameParts[0];
    filename = filenameParts[1];
  }

  return copyResource(url, folder, filename, storageItemId, sourceRequestOptions, destinationRequestOptions);
}

/**
 * Copies a resource from a URL to an item.
 *
 * @param url URL to source resource
 * @param folder Folder in destination for resource; defaults to top level
 * @param filename Filename in destination for resource
 * @param storageItemId Id of item to receive copy of resource
 * @param sourceRequestOptions Options for requesting information from source
 * @param destinationRequestOptions Options for writing information to destination
 * @return A promise which resolves to the tag under which the resource is stored
 * @protected
 */
export function copyResource (
  url: string,
  folder = null as string,
  filename: string,
  storageItemId: string,
  sourceRequestOptions: IUserRequestOptions,
  destinationRequestOptions: IUserRequestOptions
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // Get the resource from the URL
    const requestOptions = {
      rawResponse: true,
      ...sourceRequestOptions
    } as IRequestOptions;
    request.request(url, requestOptions)
    .then(
      content => {
        // Add it to the storage item
        content.blob()
        .then(
          (blob:any) => {
            const resourceTag = folder + "/" + filename;
            const addRsrcOptions = {
              id: storageItemId,
              resource: blob,
              name: filename,
              ...destinationRequestOptions,
              params: {
                resourcesPrefix: folder
              }
            };
            items.addItemResource(addRsrcOptions)
            .then(
              () => resolve(resourceTag),
              (e) => reject(mCommon.fail(e))
            );
          },
          (e:any) => reject(mCommon.fail(e))
        );
      },
      (e) => reject(mCommon.fail(e))
    );
  });
}

/**
 * Copies a thumbnail resource from one item to another.
 *
 * @param itemId Id of item serving as source of resource
 * @param url URL to source resource
 * @param storageItemId Id of item to receive copy of resource
 * @param sourceRequestOptions Options for requesting information from source
 * @param destinationRequestOptions Options for writing information to destination
 * @return A promise which resolves to the tag under which the resource is stored
 * @protected
 */
export function copyThumbnailResource (
  itemId: string,
  url: string,
  itemType: string,
  storageItemId: string,
  sourceRequestOptions: IUserRequestOptions,
  destinationRequestOptions: IUserRequestOptions
): Promise<string> {
  // Extract the resource's filename; we'll use the source item's id as a folder name so that the destination
  // item can store resources from more than one source item; supplement the folder name with text indicating
  // that it's a thumbnail resource
  let folder = itemId + "_info_thumbnail";
  let filename = url.substring(url.indexOf("/info/thumbnail/") + "/info/thumbnail/".length);
  if (itemType === "Group") {
    folder = itemId + "_info";
    filename = url.substring(url.indexOf("/info/") + "/info/".length);
  }

  return copyResource(url, folder, filename, storageItemId, sourceRequestOptions, destinationRequestOptions);
}

/**
 * Creates an empty template.
 *
 * @param id AGO id of item
 * @return Empty template containing supplied id
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

/**
 * Creates an empty deployed solution AGO item.
 *
 * @param title Title to use for item
 * @param solutionItem Solution template to deploy; serves as source of text info for new item
 * @param requestOptions Options for the request
 * @param settings Hash of facts: org URL, adlib replacements
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return Empty template item
 * @protected
 */
export function createDeployedSolutionAgoItem (
  title: string,
  solutionItem: mInterfaces.ISolutionItem,
  requestOptions: IUserRequestOptions,
  settings = {} as any,
  access = "private"
): Promise<mInterfaces.IAGOItemAccess> {
  return new Promise((resolve, reject) => {
    const templateItem = solutionItem.item;
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
      (e) => reject(mCommon.fail(e))
    );
  });
}

/**
 * Fetches an AGO item and converts it into a template after its dependencies have been fetched and
 * converted.
 *
 * @param itemId AGO id of solution template item to deploy
 * @param itemTemplates A collection of AGO item templates
 * @param requestOptions Options for the request
 * @param settings Hash of facts: org URL, adlib replacements
 * @param progressCallback Function for reporting progress updates from type-specific template handlers
 * @return A promise that will resolve with the item's template (which is simply returned if it's
 *         already in the templates list
 * @protected
 */
export function createItemFromTemplateWhenReady (
  itemId: string,
  itemTemplates: mInterfaces.ITemplate[],
  requestOptions: IUserRequestOptions,
  settings: any,
  progressCallback?: (update:mInterfaces.IProgressUpdate) => void
): Promise<mInterfaces.ITemplate> {
  settings[itemId] = {};
  const itemDef = new Promise<mInterfaces.ITemplate>((resolve, reject) => {
    const template = findTemplateInList(itemTemplates, itemId);
    if (!template) {
      reject(mCommon.fail());
    }

    // Wait until all dependencies are deployed
    const awaitDependencies = [] as Array<Promise<mInterfaces.ITemplate>>;
    (template.dependencies || []).forEach(dependencyId => awaitDependencies.push(settings[dependencyId].def));
    Promise.all(awaitDependencies)
    .then(
      () => {
        // Prepare template
        let itemTemplate = mClassifier.initItemTemplateFromJSON(findTemplateInList(itemTemplates, itemId));

        // Interpolate it
        itemTemplate.dependencies = itemTemplate.dependencies ?
          mCommon.templatize(itemTemplate.dependencies) as string[] : [];
        itemTemplate = adlib.adlib(itemTemplate, settings);

        // Deploy it
        itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, requestOptions, progressCallback)
        .then(
          itemClone => resolve(itemClone),
          (e) => reject(mCommon.fail(e))
        )
      },
      (e) => reject(mCommon.fail(e))
    );
  });

  // Save the deferred for the use of items that depend on this item being created first
  settings[itemId].def = itemDef;
  return itemDef;
}

/**
 * Creates templates for a set of AGO items.
 *
 * @param ids AGO id string or list of AGO id strings
 * @param sourceRequestOptions Options for requesting information from AGO about items to be included in solution item
 * @param existingTemplates A collection of AGO item templates that can be referenced by newly-created templates
 * @return A promise that will resolve with the created template items
 * @protected
 */
export function createItemTemplates (
  ids: string | string[],
  sourceRequestOptions: IUserRequestOptions,
  existingTemplates?: mInterfaces.ITemplate[]
): Promise<mInterfaces.ITemplate[]> {
  if (!existingTemplates) {
    existingTemplates = [];
  }

  return new Promise((resolve, reject) => {
    if (typeof ids === "string") {
      // Handle a single AGO id
      const rootId = ids;
      if (findTemplateInList(existingTemplates, rootId)) {
        resolve(existingTemplates);  // Item and its dependents are already in list or are queued

      } else {
        // Init item type
        const getItemPromise = mClassifier.convertItemToTemplate(rootId, sourceRequestOptions);

        // Add the id as a placeholder to show that it will be fetched
        existingTemplates.push(createPlaceholderTemplate(rootId));

        // Await the item
        getItemPromise
        .then(
          itemTemplate => {
            // Set the value keyed by the id to the created template, replacing the placeholder template
            replaceTemplate(existingTemplates, itemTemplate.itemId, itemTemplate);

            // Trace item dependencies
            if (itemTemplate.dependencies.length === 0) {
              resolve(existingTemplates);

            } else {
              // Get its dependents, asking each to get its dependents via
              // recursive calls to this function
              const dependentDfds:Array<Promise<mInterfaces.ITemplate[]>> = [];

              if (itemTemplate.dependencies) {
                itemTemplate.dependencies.forEach(
                  dependentId => {
                    if (!findTemplateInList(existingTemplates, dependentId)) {
                      dependentDfds.push(createItemTemplates(dependentId, sourceRequestOptions, existingTemplates));
                    }
                  }
                );
              }
              Promise.all(dependentDfds)
              .then(
                () => {
                  resolve(existingTemplates);
                },
                (e) => reject(mCommon.fail(e))
              );
            }
          },
          (e) => reject(mCommon.fail(e))
        );
      }

    } else if (Array.isArray(ids) && ids.length > 0) {
      // Handle a list of one or more AGO ids by stepping through the list
      // and calling this function recursively
      const getHierarchyPromise:Array<Promise<mInterfaces.ITemplate[]>> = [];

      ids.forEach(id => {
        getHierarchyPromise.push(createItemTemplates(id, sourceRequestOptions, existingTemplates));
      });
      Promise.all(getHierarchyPromise)
      .then(
        () => {
          resolve(existingTemplates);
        },
        (e) => reject(mCommon.fail(e))
      );

    } else {
      reject(mCommon.fail());
    }
  });
}

/**
 * Creates an empty solution template AGO item.
 *
 * @param title The title to use for the item
 * @param version The version to include in the item's metadata
 * @param requestOptions Options for the request
 * @param settings Hash of facts: org URL, adlib replacements
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return Empty template item
 * @protected
 */
export function createSolutionAgoItem (
  title: string,
  version: string,
  requestOptions: IUserRequestOptions,
  settings = {} as any,
  access = "private"
): Promise<mInterfaces.ISolutionItem> {
  return new Promise((resolve, reject) => {
    const solutionItem:mInterfaces.ISolutionItem = {
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

    mCommon.createItemWithData(solutionItem.item, solutionItem.data, requestOptions, settings.folderId, access)
    .then(
      createResponse => {
        const orgUrl = (settings.organization && settings.organization.orgUrl) || "https://www.arcgis.com";
        solutionItem.item.id = createResponse.id;
        solutionItem.item.url = orgUrl + "/home/item.html?id=" + createResponse.id;
        resolve(solutionItem);
      },
      (e) => reject(mCommon.fail(e))
    );
  });
}

export function createSolutionStorageAgoItem (
  title: string,
  requestOptions: IUserRequestOptions,
  settings = {} as any,
  access = "private"
): Promise<any> {
  return new Promise((resolve, reject) => {
    const solutionItem = {
      item: {
        itemType: "text",
        name: null as string,
        title,
        type: "Code Attachment",
        typeKeywords: ["Solution", "Template"],
        commentsEnabled: false
      } as any
    }

    mCommon.createItemWithData(solutionItem.item, null, requestOptions, settings.folderId, access)
    .then(
      createResponse => {
        const orgUrl = (settings.organization && settings.organization.orgUrl) || "https://www.arcgis.com";
        solutionItem.item.id = createResponse.id;
        solutionItem.item.url = orgUrl + "/home/item.html?id=" + createResponse.id;
        resolve(solutionItem);
      },
      (e) => reject(mCommon.fail(e))
    );
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
function findTemplateIndexInSolution (
  templates: mInterfaces.ITemplate[],
  id: string
): number {
  const baseId = id;
  return templates.findIndex(
    template => {
      return baseId === template.itemId;
    }
  );
}

/**
 * Finds template by id in a list of templates.
 *
 * @param templates A collection of AGO item templates to search
 * @param id AGO id of template to find
 * @return Matching template or null
 */
export function findTemplateInList (
  templates: mInterfaces.ITemplate[],
  id: string
): mInterfaces.ITemplate {
  const childId = findTemplateIndexInSolution(templates, id);
  return childId >= 0 ? templates[childId] : null;
}

/**
 * Creates a Solution item containing JSON descriptions of items forming the solution.
 *
 * @param title Title for Solution item to create
 * @param templates Hash of JSON descriptions of items to publish into Solution
 * @param requestOptions Options for the request
 * @param folderId Id of folder to receive item; null/empty indicates that the item goes into the root
 *                 folder; ignored for Group item type
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return A promise that will resolve with an object reporting success and the solution id
 * @protected
 */
export function publishSolutionTemplate (
  title: string,
  templates: mInterfaces.ITemplate[],
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
    templates
  };

  return mCommon.createItemWithData(item, data, requestOptions, folderId, access);
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
export function replaceTemplate (
  templates: mInterfaces.ITemplate[],
  id: string,
  template: mInterfaces.ITemplate
): boolean {
  const i = findTemplateIndexInSolution(templates, id);
  if (i >=  0) {
    templates[i] = template;
    return true;
  }
  return false;
}

/**
 * Saves the thumbnails and resources of template items with a solution item.
 *
 * @param templates A collection of AGO item templates
 * @param storageItemId Id of item to receive copies of resources
 * @param sourceRequestOptions Options for requesting information from AGO about items to be included in solution item
 * @param destinationRequestOptions Options for accessing solution item in AGO
 * @return A promise that will resolve a list of thes tag under which the resources are stored
 * @protected
 */
export function saveResourcesInSolutionItem (
  templates: mInterfaces.ITemplate[],
  storageItemId: string,
  sourceRequestOptions: IUserRequestOptions,
  destinationRequestOptions: IUserRequestOptions
): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    // The classifier returns the item's thumbnail and resources as absolute URLs,
    // so we can fetch them and save them into the solution as resources using the
    // item id as a folder. For resources that are already in a folder, we'll merge
    // that folder name with the item name since only single-level folders are supported.

    // Accumulate each copy's promise
    const copiesDefList = [] as Array<Promise<string>>;

    if (templates) {
      templates.forEach(
        itemTemplate => {
          // Store thumbnail resource
          if (itemTemplate.item.thumbnail) {
            copiesDefList.push(copyThumbnailResource(itemTemplate.itemId, itemTemplate.item.thumbnail as string,
              itemTemplate.type, storageItemId, sourceRequestOptions, destinationRequestOptions));
          }

          // Store regular resources
          if (itemTemplate.resources) {
            itemTemplate.resources.forEach(
              resourceUrl => {
                copiesDefList.push(copyRegularResource(itemTemplate.itemId, resourceUrl as string,
                  storageItemId, sourceRequestOptions, destinationRequestOptions));
              }
            );
          }
        }
      );
    }

    // Await conclusion of copies
    Promise.all(copiesDefList)
    .then(resolve,
      (e) => reject(mCommon.fail(e))
    );
  });
}

/**
 * Topologically sort a Solution's items into a build list.
 *
 * @param templates A collection of AGO item templates
 * @return List of ids of items in the order in which they need to be built so that dependencies
 * are built before items that require those dependencies
 * @throws Error("Cyclical dependency graph detected")
 * @protected
 */
export function topologicallySortItems (
  templates: mInterfaces.ITemplate[]
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
  templates.forEach(function(template) {
    verticesToVisit[template.itemId] = SortVisitColor.White;  // not yet visited
  });

  // Algorithm visits each vertex once. Don't need to record times or "from' nodes ("π" in pseudocode)
  templates.forEach(function(template) {
    if (verticesToVisit[template.itemId] === SortVisitColor.White) {  // if not yet visited
      visit(template.itemId);
    }
  });

  // Visit vertex
  function visit(vertexId:string) {
    verticesToVisit[vertexId] = SortVisitColor.Gray;  // visited, in progress

    // Visit dependents if not already visited
    const template = findTemplateInList(templates, vertexId);
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

/**
 * Updates the data section of an solution template in AGO.
 *
 * @param solutionItem Solution template to update
 * @param requestOptions Options for the request
 * @return A promise that will resolve with solutionTemplateItem
 * @protected
 */
function updateSolutionAgoItem (
  solutionItem: mInterfaces.ISolutionItem,
  requestOptions: IUserRequestOptions
): Promise<mInterfaces.ISolutionItem> {
  return new Promise<mInterfaces.ISolutionItem>((resolve, reject) => {
    // Update the data section of the solution item
    mCommon.updateItemData(solutionItem.item.id, solutionItem.data, requestOptions)
    .then(
      () => resolve(solutionItem),
      (e) => reject(mCommon.fail(e))
    )
  });
}
