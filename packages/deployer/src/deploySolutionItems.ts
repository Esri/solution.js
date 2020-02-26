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

import * as common from "@esri/solution-common";
import * as featureLayer from "@esri/solution-feature-layer";
import * as file from "@esri/solution-file";
import * as group from "@esri/solution-group";
import * as simpleTypes from "@esri/solution-simple-types";
import * as storyMap from "@esri/solution-storymap";

const UNSUPPORTED: common.moduleHandler = null;
/**
 * Mapping from item type to module with type-specific template-handling code.
 * AGO types come from a blend of arcgis-portal-app\src\js\arcgisonline\pages\item\_Info.js and
 * arcgis-portal-app\src\js\arcgis-components\src\_utils\metadata\item\displayName.ts
 */
export const moduleMap: common.IItemTypeModuleMap = {
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
  Form: simpleTypes,
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
  Notebook: simpleTypes,
  "Ortho Mapping Project": undefined,
  "QuickCapture Project": simpleTypes,
  "Site Application": undefined,
  "Site Initiative": undefined,
  "Site Page": undefined,
  Solution: UNSUPPORTED,
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
  "Code Attachment": UNSUPPORTED,
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
  reuseItems: boolean,
  progressTickCallback: common.IItemProgressCallback
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
    const awaitAllItems = [] as Array<
      Promise<common.ICreateItemFromTemplateResponse>
    >;

    const existingItemsDef: Promise<any> = _evaluateExistingItems(
      templates,
      reuseItems,
      templateDictionary,
      destinationAuthentication
    );

    existingItemsDef.then(
      () => {
        cloneOrderChecklist.forEach(id => {
          // Get the item's template out of the list of templates
          const template = common.findTemplateInList(templates, id);
          awaitAllItems.push(
            _createItemFromTemplateWhenReady(
              template!,
              common.generateStorageFilePaths(
                portalSharingUrl,
                storageItemId,
                template!.resources
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
      },
      e => reject(common.fail(e))
    );
  });
}

// ------------------------------------------------------------------------------------------------------------------ //

// TODO make sure an item that was shared with group but deleted before reuseItems is shared back properly
// TODO make sure that recreated map has vars set when ruse
export function _evaluateExistingItems(
  templates: common.IItemTemplate[],
  reuseItems: boolean,
  templateDictionary: any,
  authentication: common.UserSession
): Promise<any> {
  return new Promise((resolve, reject) => {
    if (reuseItems) {
      const existingItemsByKeyword: Array<Promise<
        any
      >> = _findExistingItemByKeyword(
        templates,
        templateDictionary,
        authentication
      );

      Promise.all(existingItemsByKeyword).then(
        (existingItemsByKeywordResponse: any) => {
          const existingItemsByTag = _handleExistingItems(
            existingItemsByKeywordResponse,
            templateDictionary,
            authentication,
            true
          );

          Promise.all(existingItemsByTag).then(
            existingItemsByTagResponse => {
              _handleExistingItems(
                existingItemsByTagResponse,
                templateDictionary,
                authentication,
                false
              );
              _updateTemplateDictionary(templates, templateDictionary);
              resolve();
            },
            e => reject(common.fail(e))
          );
        },
        e => reject(common.fail(e))
      );
    } else {
      resolve();
    }
  });
}

export function _updateTemplateDictionary(
  templates: common.IItemTemplate[],
  templateDictionary: any
): void {
  templates.forEach(t => {
    if (t.item.type === "Feature Service") {
      const templateInfo: any = templateDictionary[t.itemId];
      if (templateInfo && templateInfo.url && templateInfo.itemId) {
        Object.assign(
          templateDictionary[t.itemId],
          common.getLayerSettings(
            common.getLayersAndTables(t),
            templateInfo.url,
            templateInfo.itemId
          )
        );
      }
    }
  });
}

export function _handleExistingItems(
  existingItemsResponse: any[],
  templateDictionary: any,
  destinationAuthentication: common.UserSession,
  addTagQuery: boolean
): Array<Promise<any>> {
  // if items are not found by type keyword search by tag
  const existingItemsByTag: Array<Promise<any>> = [Promise.resolve()];
  if (existingItemsResponse && Array.isArray(existingItemsResponse)) {
    existingItemsResponse.forEach(existingItem => {
      if (Array.isArray(existingItem?.results)) {
        let result: any;
        const results: any[] = existingItem.results;
        if (results.length === 1) {
          result = results[0];
        } else if (results.length > 1) {
          result = results.reduce((a: any, b: any) =>
            a.created > b.created ? a : b
          );
        } else {
          if (addTagQuery && existingItem.query) {
            const tagQuery: string = existingItem.query.replace(
              "typekeywords",
              "tags"
            );
            existingItemsByTag.push(
              _findExistingItem(tagQuery, destinationAuthentication)
            );
          }
        }
        if (result) {
          const sourceId: any = existingItem.query
            ? existingItem.query.match(/[0-9A-F]{32}/i)[0]
            : existingItem.sourceId;
          if (sourceId) {
            templateDictionary[sourceId] = {
              def: Promise.resolve({
                id: result.id,
                type: result.type,
                postProcess: false
              }),
              itemId: result.id,
              name: result.name,
              title: result.title,
              url: result.url
            };
          }
        }
      }
    });
  }
  return existingItemsByTag;
}

export function _findExistingItemByKeyword(
  templates: common.IItemTemplate[],
  templateDictionary: any,
  authentication: common.UserSession
): Array<Promise<any>> {
  const existingItemsDefs: Array<Promise<any>> = [];
  templates.forEach(template => {
    if (template.item.type === "Group") {
      const userGroups: any = templateDictionary.user?.groups;
      if (Array.isArray(userGroups)) {
        existingItemsDefs.push(
          Promise.resolve({
            results: userGroups.filter(
              g => g.tags.indexOf(`source-${template.itemId}`) > -1
            ),
            sourceId: template.itemId
          })
        );
      }
    } else {
      existingItemsDefs.push(
        _findExistingItem(
          `typekeywords:source-${template.itemId} type:${template.item.type} owner:${templateDictionary.user.username}`,
          authentication
        )
      );
    }
  });
  return existingItemsDefs;
}

export function _findExistingItem(
  query: string,
  authentication: common.UserSession
): Promise<any> {
  const searchOptions = {
    q: query,
    authentication: authentication,
    pagingParam: { start: 1, num: 100 }
  };
  return common.searchItems(searchOptions);
}

/**
 * Creates an item from a template once the item's dependencies have been created.
 *
 * @param template Template of item to deploy
 * @param resourceFilePaths URL, folder, and filename for each item resource/metadata/thumbnail
 * @param templateDictionary Hash of facts: org URL, adlib replacements, deferreds for dependencies
 * @param userSession Options for the request
 * @param progressTickCallback Function for reporting progress updates from type-specific template handlers
 * @return A promise that will resolve with the id of the deployed item (which is simply returned if it's
 *         already in the templates list
 * @protected
 */
export function _createItemFromTemplateWhenReady(
  template: common.IItemTemplate,
  resourceFilePaths: common.IDeployFileCopyPath[],
  storageAuthentication: common.UserSession,
  templateDictionary: any,
  destinationAuthentication: common.UserSession,
  progressTickCallback: common.IItemProgressCallback
): Promise<common.ICreateItemFromTemplateResponse> {
  let itemDef;
  if (!templateDictionary.hasOwnProperty(template.itemId)) {
    templateDictionary[template.itemId] = {};
    itemDef = new Promise<common.ICreateItemFromTemplateResponse>(
      (resolve, reject) => {
        // Wait until all of the item's dependencies are deployed
        const awaitDependencies = [] as Array<
          Promise<common.ICreateItemFromTemplateResponse>
        >;
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
                templateType +
                " for " +
                template.itemId
            );
            resolve({
              id: "",
              type: templateType,
              postProcess: false
            });
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
                createResponse => {
                  // Copy resources, metadata, thumbnail, form
                  common
                    .copyFilesFromStorageItem(
                      storageAuthentication,
                      resourceFilePaths,
                      createResponse.id,
                      destinationAuthentication,
                      templateType === "Group",
                      template.properties
                    )
                    .then(
                      () => {
                        progressTickCallback(
                          template.itemId,
                          common.EItemProgressStatus.Finished,
                          template.estimatedDeploymentCostFactor / 2
                        );
                        resolve(createResponse);
                      },
                      e => reject(common.fail(e))
                    );
                },
                e => reject(common.fail(e))
              );
          }
        }, common.fail);
      }
    );

    // Save the deferred for the use of items that depend on this item being created first
    templateDictionary[template.itemId].def = itemDef;
  } else {
    itemDef = templateDictionary[template.itemId].def;
    progressTickCallback(
      template.itemId,
      common.EItemProgressStatus.Finished,
      template.estimatedDeploymentCostFactor / 2
    );
  }
  return itemDef;
}

/**
 * Checks all item types with data and group references after all other processing has completed.
 * Evaluates if the items data has any remaining variables that have not been swapped.
 * Also shares any items that have group references with the appropriate group.
 *
 * @param templates Array of item templates to evaluate
 * @param clonedSolutionsResponse Has the item id, type, and data
 * @param authentication Credentials for the requests to the destination
 * @param templateDictionary Hash of facts: org URL, adlib replacements, deferreds for dependencies
 *
 * @return A promise that will resolve once any updates have been made
 */
export function postProcessDependencies(
  templates: common.IItemTemplate[],
  clonedSolutionsResponse: common.ICreateItemFromTemplateResponse[],
  authentication: common.UserSession,
  templateDictionary: any
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    // In most cases this is a generic item update
    // However, if an item needs special handeling it should be listed here and...
    // uniqueUpdateTypes must implement postProcessDependencies that should return a promise for the update
    const uniqueUpdateTypes: string[] = ["Notebook"];

    const dataRequests: Array<Promise<any>> = [];
    const requestedItemInfos: any = clonedSolutionsResponse.filter(
      solutionInfo => {
        if (solutionInfo.postProcess) {
          dataRequests.push(
            common.getItemDataAsJson(solutionInfo.id, authentication)
          );
          return true;
        }
      }
    );

    Promise.all(dataRequests).then(
      data => {
        let updates: Array<Promise<any>> = [Promise.resolve()];
        for (let i = 0; i < requestedItemInfos.length; i++) {
          const itemInfo = requestedItemInfos[i];
          /* istanbul ignore else */
          if (common.hasUnresolvedVariables(data[i])) {
            const template: common.IItemTemplate = common.getTemplateById(
              templates,
              itemInfo.id
            );
            const update: any = common.replaceInTemplate(
              data[i],
              templateDictionary
            );
            if (uniqueUpdateTypes.indexOf(template.type) < 0) {
              updates.push(
                common.updateItemExtended(
                  itemInfo.id,
                  { id: itemInfo.id },
                  update,
                  authentication
                )
              );
            } else {
              const itemHandler: any = moduleMap[template.type];
              /* istanbul ignore else */
              if (itemHandler.postProcessItemDependencies) {
                updates.push(
                  itemHandler.postProcessItemDependencies(
                    itemInfo.id,
                    template.type,
                    update,
                    authentication
                  )
                );
              }
            }
          }
        }

        // share the template with any groups it references
        templates.forEach(template => {
          updates = updates.concat(
            _getGroupUpdates(template, authentication, templateDictionary)
          );
        });

        Promise.all(updates).then(
          () => resolve(),
          e => reject(common.fail(e))
        );
      },
      e => reject(common.fail(e))
    );
  });
}

export function _getGroupUpdates(
  template: common.IItemTemplate,
  authentication: common.UserSession,
  templateDictionary: any
): Array<Promise<any>> {
  const updates = [] as Array<Promise<any>>;
  // share the template with any groups it references
  if (template.groups?.length > 0) {
    template.groups.forEach(sourceGroupId => {
      updates.push(
        common.shareItem(
          templateDictionary[sourceGroupId].itemId,
          template.itemId,
          authentication
        )
      );
    });
  }
  return updates;
}
