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
import { moduleMap } from "./module-map";
import { getProp } from "@esri/hub-common";

const UNSUPPORTED: common.moduleHandler = null;

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Deploys a set of items defined by templates.
 *
 * @param portalSharingUrl Server/sharing
 * @param storageItemId Id of storage item
 * @param templates A collection of AGO item templates
 * @param storageAuthentication Credentials for the organization with the source items
 * @param templateDictionary Hash of facts: org URL, adlib replacements
 * @param destinationAuthentication Credentials for the destination organization
 * @param options Options to tune deployment
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
  options: common.IDeploySolutionOptions
): Promise<any> {
  return new Promise((resolve, reject) => {
    // Prepare feedback mechanism
    const totalEstimatedCost = _estimateDeploymentCost(templates) + 1; // solution items, plus avoid divide by 0
    let percentDone: number = 10; // allow for previous deployment work
    const progressPercentStep = (99 - percentDone) / totalEstimatedCost; // leave some % for caller for wrapup

    const failedTemplateItemIds: string[] = [];
    const deployedItemIds: string[] = [];
    let statusOK = true;

    // TODO: move to separate fn
    const itemProgressCallback: common.IItemProgressCallback = (
      itemId: string,
      status: common.EItemProgressStatus,
      costUsed: number,
      createdItemId: string // supplied when status is EItemProgressStatus.Created or .Finished
    ) => {
      percentDone += progressPercentStep * costUsed;
      /* istanbul ignore else */
      if (options.progressCallback) {
        if (status === common.EItemProgressStatus.Finished) {
          const event = {
            event: common.SItemProgressStatus[status],
            data: itemId
          } as common.ISolutionProgressEvent;
          options.progressCallback(
            Math.round(percentDone),
            options.jobId,
            event
          );
        } else {
          options.progressCallback(Math.round(percentDone), options.jobId);
        }
      }

      /* istanbul ignore if */
      if (options.consoleProgress) {
        console.log(
          Date.now(),
          itemId,
          options.jobId ?? "",
          common.SItemProgressStatus[status],
          percentDone.toFixed(0) + "%",
          costUsed,
          createdItemId ? "==> " + createdItemId : ""
        );
      }

      if (status === common.EItemProgressStatus.Created) {
        deployedItemIds.push(createdItemId);
      } else if (status === common.EItemProgressStatus.Failed) {
        failedTemplateItemIds.push(itemId);
        console.error("Item " + itemId + " has failed");
        statusOK = false;
      }

      return statusOK;
      // ---------------------------------------------------------------------------------------------------------------
    };

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
      options.enableItemReuse ?? false,
      templateDictionary,
      destinationAuthentication
    );

    existingItemsDef.then(
      () => {
        templates = common.setNamesAndTitles(
          templates,
          templateDictionary.solutionItemId
        );

        // portal does not allow views of a single source to be created at the same time
        if (templateDictionary.organization.isPortal) {
          templates = _evaluateSharedViewSources(templates);
        }

        // why is the return not used?

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
              itemProgressCallback
            )
          );
        });

        // Wait until all items have been created
        // tslint:disable-next-line: no-floating-promises
        Promise.all(awaitAllItems).then(clonedSolutionItemIds => {
          if (failedTemplateItemIds.length === 0) {
            resolve(clonedSolutionItemIds);
          } else {
            // Delete created items
            // tslint:disable-next-line: no-floating-promises
            common
              .removeListOfItemsOrGroups(
                deployedItemIds,
                destinationAuthentication
              )
              .then(() => reject(common.failWithIds(failedTemplateItemIds)));
          }
        });
      },
      e => {
        console.error(e);
        reject(common.fail(e));
      }
    );
  });
}

/**
 * Portal does not allow views of a single source to be created at the same time.
 *
 * Update view templates with an array of other view template ids that it should wait on.
 *
 * @param templates a collection of AGO item templates
 *
 * @returns An updated array of item templates
 *
 */
export function _evaluateSharedViewSources(
  templates: common.IItemTemplate[]
): common.IItemTemplate[] {
  // update the templates so we can defer the deployment when more than one view shares the same source
  // these are not classic dependencies but are in some ways similar
  const views: any[] = _getViews(templates);

  _updateViewTemplates(templates, views);

  const viewHash: any = _getViewHash(views);

  let i: number = 0;
  const processed: string[] = [];

  Object.keys(viewHash).forEach(k => {
    const _views: string[] = viewHash[k];
    _views.forEach(cv => {
      const template = common.findTemplateInList(templates, cv);
      const syncViews = common.getProp(template, "properties.syncViews");
      /* istanbul ignore else */
      if (syncViews && syncViews.length > 0) {
        common.setProp(
          template,
          "properties.syncViews",
          i === 0 ? [] : common.cloneObject(processed)
        );
      }
      processed.push(cv);
      i += 1;
    });
    i = 0;
  });

  return templates;
}

/**
 * Add a syncViews array to each template that will hold all other view ids that
 * have the same FS dependency.
 * These arrays will be processed later to only contain ids that each view will need to wait on.
 *
 * @param templates a collection of AGO item templates
 * @param views an array of view template details
 *
 * @returns An updated array of item templates
 *
 */
export function _updateViewTemplates(
  templates: common.IItemTemplate[],
  views: any[]
): common.IItemTemplate[] {
  views.forEach(v => {
    v.dependencies.forEach((id: string) => {
      templates = templates.map(t => {
        /* istanbul ignore else */
        if (
          common.getProp(t, "properties.service.isView") &&
          t.dependencies.indexOf(id) > -1 &&
          t.itemId !== v.id
        ) {
          /* istanbul ignore else */
          if (!Array.isArray(t.properties.syncViews)) {
            t.properties.syncViews = [];
          }
          /* istanbul ignore else */
          if (t.properties.syncViews.indexOf(v.id) < 0) {
            t.properties.syncViews.push(v.id);
          }
        }
        return t;
      });
    });
  });
  return templates;
}

/**
 * Get all view templates from the source templates collection
 *
 * @param views A collection of view ID and dependencies
 *
 * @returns an array of objects with th source FS id as the key and a list of views that are
 * dependant upon it
 *
 * @protected
 */
export function _getViewHash(views: any[]): any {
  const viewHash: any = {};
  views.forEach(v => {
    v.dependencies.forEach((d: string) => {
      /* istanbul ignore else */
      if (Object.keys(viewHash).indexOf(d) < 0) {
        viewHash[d] = [v.id];
      } else if (viewHash[d].indexOf(v.id) < 0) {
        viewHash[d].push(v.id);
      }
    });
  });
  return viewHash;
}

/**
 * Get all view templates from the source templates collection
 *
 * @param templates A collection of AGO item templates
 *
 * @returns an array with the view id and its dependencies
 *
 * @protected
 */
export function _getViews(templates: common.IItemTemplate[]): any[] {
  return templates.reduce((acc, v) => {
    /* istanbul ignore else */
    if (common.getProp(v, "properties.service.isView")) {
      acc.push({
        id: v.itemId,
        dependencies: v.dependencies
      });
    }
    return acc;
  }, []);
}

/**
 * Search for existing items and update the templateDictionary with key details
 *
 * @param templates A collection of AGO item templates
 * @param reuseItems Option to search for existing items
 * @param templateDictionary Hash of facts: org URL, adlib replacements, deferreds for dependencies
 * @param authentication Credentials for the requests
 *
 * @returns A Promise that will resolve once existing items have been evaluated
 *
 * @protected
 */
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

/**
 * Update the templateDictionary with key details by item type
 *
 * @param templates A collection of AGO item templates
 * @param templateDictionary Hash of facts: org URL, adlib replacements, deferreds for dependencies
 *
 * @protected
 */
export function _updateTemplateDictionary(
  templates: common.IItemTemplate[],
  templateDictionary: any
): void {
  templates.forEach(t => {
    if (t.item.type === "Feature Service") {
      const templateInfo: any = templateDictionary[t.itemId];
      /* istanbul ignore else */
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

/**
 * Optionally search by tags and then update the templateDictionary based on the search results
 *
 * @param existingItemsResponse response object from search by typeKeyword and type
 * @param templateDictionary Hash of facts: org URL, adlib replacements, deferreds for dependencies
 * @param authentication Credentials for the request
 * @param addTagQuery Boolean to indicate if a search by tag should happen
 * @return A promise that will resolve with an array of results
 * @protected
 */
export function _handleExistingItems(
  existingItemsResponse: any[],
  templateDictionary: any,
  authentication: common.UserSession,
  addTagQuery: boolean
): Array<Promise<any>> {
  // if items are not found by type keyword search by tag
  const existingItemsByTag: Array<Promise<any>> = [Promise.resolve()];
  /* istanbul ignore else */
  if (existingItemsResponse && Array.isArray(existingItemsResponse)) {
    existingItemsResponse.forEach(existingItem => {
      /* istanbul ignore else */
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
              _findExistingItem(tagQuery, authentication)
            );
          }
        }
        if (result) {
          const sourceId: any = existingItem.query
            ? existingItem.query.match(/[0-9A-F]{32}/i)[0]
            : existingItem.sourceId;
          /* istanbul ignore else */
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

/**
 * Search items based on user query
 *
 * @param query Query string to use
 * @param authentication Credentials for the request
 * @return A promise that will resolve with an array of results
 * @protected
 */
export function _findExistingItemByKeyword(
  templates: common.IItemTemplate[],
  templateDictionary: any,
  authentication: common.UserSession
): Array<Promise<any>> {
  const existingItemsDefs: Array<Promise<any>> = [];
  templates.forEach(template => {
    if (template.item.type === "Group") {
      const userGroups: any = templateDictionary.user?.groups;
      /* istanbul ignore else */
      if (Array.isArray(userGroups)) {
        existingItemsDefs.push(
          Promise.resolve({
            results: userGroups
              .filter(g => g.tags.indexOf(`source-${template.itemId}`) > -1)
              .map(g => {
                g.type = "Group";
                return g;
              }),
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

/**
 * Search items based on user query
 *
 * @param query Query string to use
 * @param authentication Credentials for the request
 * @return A promise that will resolve with an array of results
 * @protected
 */
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
 * @param itemProgressCallback Function for reporting progress updates from type-specific template handlers
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
  itemProgressCallback: common.IItemProgressCallback
): Promise<common.ICreateItemFromTemplateResponse> {
  // ensure this is present
  template.dependencies = template.dependencies || [];
  // if there is no entry in the templateDictionary, add it
  if (!templateDictionary.hasOwnProperty(template.itemId)) {
    templateDictionary[template.itemId] = {};
    // Save the deferred for the use of items that depend on this item being created first
    templateDictionary[template.itemId].def = new Promise<
      common.ICreateItemFromTemplateResponse
    >(resolve => {
      // Wait until all of the item's dependencies are deployed
      const _awaitDependencies = template.dependencies.reduce(
        (acc: any[], id: string) => {
          const def = getProp(templateDictionary, `${id}.def`);
          // can't use maybePush as that clones the object, which does not work for Promises
          /* istanbul ignore else */
          if (def) {
            acc.push(def);
          }
          return acc;
        },
        []
      );

      const syncViews: string[] = common.getProp(
        template,
        "properties.syncViews"
      );

      const awaitDependencies =
        syncViews && syncViews.length > 0
          ? syncViews.reduce((acc: any[], v: any) => {
              const def = getProp(templateDictionary, `${v}.def`);
              /* istanbul ignore else */
              if (def) {
                acc.push(def);
              }
              return acc;
            }, _awaitDependencies)
          : _awaitDependencies;

      Promise.all(awaitDependencies).then(
        () => {
          // Find the conversion handler for this item type
          const templateType = template.type;
          const itemHandler = moduleMap[templateType];
          if (!itemHandler || itemHandler === UNSUPPORTED) {
            if (itemHandler === UNSUPPORTED) {
              itemProgressCallback(
                template.itemId,
                common.EItemProgressStatus.Ignored,
                template.estimatedDeploymentCostFactor
              );
            } else {
              itemProgressCallback(
                template.itemId,
                common.EItemProgressStatus.Failed,
                0
              );
            }

            resolve({
              id: "",
              type: templateType,
              postProcess: false
            });
          } else {
            // Glean item content that can be added via the create call rather than as an update, e.g.,
            // metadata, thumbnail; this content is moved from the resourceFilePaths into the template
            // tslint:disable-next-line: no-floating-promises
            _moveResourcesIntoTemplate(
              resourceFilePaths,
              template,
              storageAuthentication
            ).then(updatedResourceFilePaths => {
              // Delegate the creation of the template to the handler
              // tslint:disable-next-line: no-floating-promises
              itemHandler
                .createItemFromTemplate(
                  template,
                  templateDictionary,
                  destinationAuthentication,
                  itemProgressCallback
                )
                .then(createResponse => {
                  if (_isEmptyCreationResponse(template.type, createResponse)) {
                    resolve(_generateEmptyCreationResponse(template.type)); // fails to copy resources from storage
                  } else {
                    // Copy resources, metadata, thumbnail, form
                    common
                      .copyFilesFromStorageItem(
                        storageAuthentication,
                        updatedResourceFilePaths,
                        templateDictionary.folderId,
                        createResponse.id,
                        destinationAuthentication,
                        templateType === "Group",
                        template
                      )
                      .then(
                        () => resolve(createResponse),
                        () => {
                          itemProgressCallback(
                            template.itemId,
                            common.EItemProgressStatus.Failed,
                            0
                          );
                          resolve(
                            _generateEmptyCreationResponse(template.type)
                          ); // fails to copy resources from storage
                        }
                      );
                  }
                });
            });
          }
        },
        () => resolve(_generateEmptyCreationResponse(template.type)) // fails to get item dependencies
      );
    });
  }
  return templateDictionary[template.itemId].def;
}

/**
 * Accumulates the estimated deployment cost of a set of templates.
 *
 * @param templates Templates to examine
 * @return Sum of estimated deployment costs
 * @protected
 */
export function _estimateDeploymentCost(
  templates: common.IItemTemplate[]
): number {
  return templates.reduce(
    (accumulatedEstimatedCost: number, template: common.IItemTemplate) => {
      return (
        accumulatedEstimatedCost + (template.estimatedDeploymentCostFactor || 1)
      );
    },
    0
  );
}

export function _generateEmptyCreationResponse(
  templateType: string
): common.ICreateItemFromTemplateResponse {
  return {
    id: "",
    type: templateType,
    postProcess: false
  };
}

// TODO: Return a Promise vs array of promises
export function _getGroupUpdates(
  template: common.IItemTemplate,
  authentication: common.UserSession,
  templateDictionary: any
): Array<Promise<any>> {
  const groups = template.groups || [];
  return groups.map(sourceGroupId => {
    return common.shareItem(
      templateDictionary[sourceGroupId].itemId,
      template.itemId,
      authentication
    );
  });
}

export function _isEmptyCreationResponse(
  templateType: string,
  response: common.ICreateItemFromTemplateResponse
): boolean {
  return response.id === "";
}

export function _moveResourcesIntoTemplate(
  filePaths: common.IDeployFileCopyPath[],
  template: common.IItemTemplate,
  authentication: common.UserSession
): Promise<common.IDeployFileCopyPath[]> {
  return new Promise<common.IDeployFileCopyPath[]>(resolve => {
    // Find content in the file paths that can be moved into the template
    let thumbnailDef = Promise.resolve("");
    const updatedFilePaths = filePaths.filter(filePath => {
      switch (filePath.type) {
        case common.EFileType.Thumbnail:
          delete template.item.thumbnail;
          thumbnailDef = common.addTokenToUrl(filePath.url, authentication);
          return false;
        default:
          return true;
      }
    });

    // tslint:disable-next-line: no-floating-promises
    thumbnailDef.then(updatedThumbnailUrl => {
      /* istanbul ignore else */
      if (updatedThumbnailUrl) {
        template.item.thumbnailurl = common.appendQueryParam(
          updatedThumbnailUrl,
          "w=400"
        );
      }
      resolve(updatedFilePaths);
    });
  });
}
