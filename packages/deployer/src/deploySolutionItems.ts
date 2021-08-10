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
 * @param deployedSolutionId Id of deployed Solution item
 * @param destinationAuthentication Credentials for the destination organization
 * @param options Options to tune deployment
 * @return A promise that will resolve with the list of information about the created items
 */
export function deploySolutionItems(
  portalSharingUrl: string,
  storageItemId: string,
  templates: common.IItemTemplate[],
  storageAuthentication: common.UserSession,
  templateDictionary: any,
  deployedSolutionId: string,
  destinationAuthentication: common.UserSession,
  options: common.IDeploySolutionOptions
): Promise<common.ICreateItemFromTemplateResponse[]> {
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

    // portal does not allow views of a single source to be created at the same time
    if (common.getProp(templateDictionary, "organization.isPortal")) {
      templates = _evaluateSharedViewSources(templates);
    }

    // Create an ordered graph of the templates so that dependencies are created before the items that need them.
    // Because cycles are permitted, we also keep track of items that need to be patched later because their
    // dependencies are necessarily created after they are created.
    const { buildOrder, itemsToBePatched } = common.topologicallySortItems(
      templates
    );

    // For each item in order from no dependencies to dependent on other items,
    //   * replace template symbols using template dictionary
    //   * create item in destination group
    //   * add created item's id into the template dictionary
    const awaitAllItems = [] as Array<
      Promise<common.ICreateItemFromTemplateResponse>
    >;

    const reuseItemsDef: Promise<any> = _reuseDeployedItems(
      templates,
      options.enableItemReuse ?? false,
      templateDictionary,
      destinationAuthentication
    );
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    reuseItemsDef.then(
      () => {
        const useExistingItemsDef: Promise<any> = _useExistingItems(
          templates,
          common.getProp(templateDictionary, "params.useExisting"),
          templateDictionary,
          destinationAuthentication
        );
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        useExistingItemsDef.then(() => {
          templates = common.setNamesAndTitles(
            templates,
            templateDictionary.solutionItemId
          );

          buildOrder.forEach((id: string) => {
            // Get the item's template out of the list of templates
            const template = common.findTemplateInList(templates, id);
            awaitAllItems.push(
              _createItemFromTemplateWhenReady(
                template,
                common.generateStorageFilePaths(
                  portalSharingUrl,
                  storageItemId,
                  template.resources,
                  options.storageVersion
                ),
                storageAuthentication,
                templateDictionary,
                destinationAuthentication,
                itemProgressCallback
              )
            );
          });

          // Wait until all items have been created
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          Promise.all(awaitAllItems).then(
            (clonedSolutionItems: common.ICreateItemFromTemplateResponse[]) => {
              if (failedTemplateItemIds.length === 0) {
                // Do we have any items to be patched (i.e., they refer to dependencies using the template id rather
                // than the cloned id because the item had to be created before the dependency)? Flag these items
                // for post processing in the list of clones.
                _flagPatchItemsForPostProcessing(
                  itemsToBePatched,
                  templateDictionary,
                  clonedSolutionItems
                );

                resolve(clonedSolutionItems);
              } else {
                // Delete created items
                const progressOptions: common.IDeleteSolutionOptions = {
                  consoleProgress: true
                };
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                common
                  .deleteSolutionByComponents(
                    deployedSolutionId,
                    deployedItemIds,
                    templates,
                    templateDictionary,
                    destinationAuthentication,
                    progressOptions
                  )
                  .then(() =>
                    reject(common.failWithIds(failedTemplateItemIds))
                  );
              }
            }
          );
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
 * For each item to be patched, convert it to its cloned id and mark the item as needing post processing.
 *
 * @param itemsToBePatched List of items that need to have their dependencies patched
 * @param templateDictionary Hash of facts: org URL, adlib replacements
 * @param templates A collection of AGO item templates
 */
export function _flagPatchItemsForPostProcessing(
  itemsToBePatched: common.IKeyedListsOfStrings,
  templateDictionary: any,
  templates: common.ICreateItemFromTemplateResponse[]
): void {
  let itemIdsToBePatched = Object.keys(itemsToBePatched);

  /* istanbul ignore else */
  if (itemIdsToBePatched.length > 0) {
    // Replace the ids of the items to be patched (which are template ids) with their cloned versions
    itemIdsToBePatched = itemIdsToBePatched.map(
      id => templateDictionary[id].itemId
    );

    // Make sure that the items to be patched are flagged for post processing
    templates.forEach(item => {
      /* istanbul ignore else */
      if (itemIdsToBePatched.includes(item.id)) {
        item.postProcess = true;
      }
    });
  }
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

  let processed: string[] = [];

  const visited: string[] = [];

  Object.keys(viewHash).forEach(k => {
    const _views: string[] = viewHash[k];
    _views.forEach(cv => {
      const template = common.findTemplateInList(templates, cv);
      const syncViews = common.getProp(template, "properties.syncViews");

      /* istanbul ignore else */
      if (visited.indexOf(template.itemId) > -1) {
        processed = processed.concat(syncViews);
      }
      /* istanbul ignore else */
      if (syncViews && syncViews.length > 0) {
        // when a view has multiple dependencies we need to retain the syncViews if they have been set already...
        common.setProp(
          template,
          "properties.syncViews",
          common.cloneObject(processed)
        );
      }
      /* istanbul ignore else */
      if (processed.indexOf(cv) < 0) {
        processed.push(cv);
      }
      /* istanbul ignore else */
      if (visited.indexOf(template.itemId) < 0) {
        visited.push(template.itemId);
      }
    });
    processed = [];
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
 * @returns an array of objects with the source FS id as the key and a list of views that are
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
export function _reuseDeployedItems(
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
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              _updateTemplateDictionary(
                templates,
                templateDictionary,
                authentication
              ).then(resolve);
            },
            e => reject(common.fail(e))
          );
        },
        e => reject(common.fail(e))
      );
    } else {
      resolve(null);
    }
  });
}

/**
 * Search for existing items and update the templateDictionary with key details
 *
 * Subtle difference between _reuseDeployedItems and _useExistingItems
 * _reuseDeployedItems: will search all existing items based on specific type keywords
 *   that would have been added by a previous deployment
 * _useExistingItems: will search for an existing item that the user provided
 *   the item id for while configuring in the deployment app.
 *   This type of item would not necessarily have been laid down by a previous deployment and
 *   can thus not expect that it will have the type keywords
 *
 * @param templates A collection of AGO item templates
 * @param useExisting Option to search for existing items
 * @param templateDictionary Hash of facts: org URL, adlib replacements, deferreds for dependencies
 * @param authentication Credentials for the requests
 *
 * @returns A Promise that will resolve once existing items have been evaluated
 *
 * @protected
 */
export function _useExistingItems(
  templates: common.IItemTemplate[],
  useExisting: boolean,
  templateDictionary: any,
  authentication: common.UserSession
): Promise<any> {
  return new Promise((resolve, reject) => {
    if (useExisting) {
      const itemDefs: Array<Promise<any>> = [];
      const sourceIdHash: any = {};
      const itemIds: string[] = [];
      Object.keys(templateDictionary.params).forEach(k => {
        const v: any = templateDictionary.params[k];
        /* istanbul ignore else */
        if (v.itemId && v.sourceId) {
          _updateTemplateDictionaryById(
            templateDictionary,
            v.sourceId,
            v.itemId,
            v
          );

          // need to check and set the typeKeyword if it doesn't exist on this service yet
          // when the user has passed in an itemId that does not come from a previous deployment
          itemDefs.push(common.getItemBase(v.itemId, authentication));
          sourceIdHash[v.itemId] = v.sourceId;

          /* istanbul ignore else */
          if (itemIds.indexOf(v.sourceId) < 0) {
            itemIds.push(v.sourceId);
          }
        }
      });
      _setTypekeywordForExisting(itemDefs, sourceIdHash, authentication).then(
        () => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          _updateTemplateDictionary(
            itemIds.map(id => common.getTemplateById(templates, id)),
            templateDictionary,
            authentication
          ).then(resolve);
        },
        reject
      );
    } else {
      resolve(null);
    }
  });
}

/**
 * Verify if the existing item has the source-<itemId> typeKeyword and set it if not
 * This allows items that did not come from deployment to be found for reuse after they
 * have been used once via a custom itemId param
 *
 * @param itemDefs
 * @param sourceIdHash key value pairs..actual itemId is the key and the source itemId is the value
 * @param authentication credentials for the requests
 *
 * @return a promise to indicate when the requests are complete
 */
export function _setTypekeywordForExisting(
  itemDefs: Array<Promise<any>>,
  sourceIdHash: any,
  authentication: common.UserSession
): Promise<any> {
  return new Promise(resolve => {
    if (itemDefs.length > 0) {
      Promise.all(itemDefs).then(
        results => {
          const itemUpdateDefs: Array<Promise<any>> = [];
          results.forEach(result => {
            const sourceId: string = sourceIdHash[result.id];
            if (result && sourceId && result.typeKeywords) {
              const sourceKeyword = `source-${sourceId}`;
              const typeKeywords: string[] = result.typeKeywords;
              /* istanbul ignore else */
              if (typeKeywords.indexOf(sourceKeyword) < 0) {
                typeKeywords.push(sourceKeyword);
                const itemUpdate: any = { id: result.id, typeKeywords };
                itemUpdateDefs.push(
                  common.updateItem(itemUpdate, authentication)
                );
              }
            }
          });

          // wait for updates to finish before we resolve
          if (itemUpdateDefs.length > 0) {
            Promise.all(itemUpdateDefs).then(resolve, () => resolve(undefined));
          } else {
            resolve(undefined);
          }
        },
        () => resolve(undefined)
      );
    } else {
      resolve(undefined);
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
  templateDictionary: any,
  authentication: common.UserSession
): Promise<any> {
  return new Promise(resolve => {
    const defs: Array<Promise<any>> = [];
    const urls: string[] = [];
    const types: string[] = [];
    const ids: string[] = [];
    templates.forEach(t => {
      const templateInfo: any = templateDictionary[t.itemId];
      /* istanbul ignore else */
      if (templateInfo && templateInfo.url && templateInfo.itemId) {
        /* istanbul ignore else */
        if (t.item.type === "Feature Service") {
          Object.assign(
            templateDictionary[t.itemId],
            common.getLayerSettings(
              common.getLayersAndTables(t),
              templateInfo.url,
              templateInfo.itemId
            )
          );

          // if the service has veiws keep track of the fields so we can use them to
          // compare with the view fields
          /* istanbul ignore else */
          if (common.getProp(t, "properties.service.hasViews")) {
            common._updateTemplateDictionaryFields(
              t,
              templateDictionary,
              false
            );
          }
        }

        // for fs query with its url...for non fs query the item
        // this is to verify situations where we have a stale search index that will
        // say some items exist when they don't really exist
        // searching the services url or with the item id will return an error when this condition occurs
        /* istanbul ignore else */
        if (urls.indexOf(templateInfo.url) < 0) {
          defs.push(
            t.item.type === "Feature Service"
              ? common.rest_request(templateInfo.url, { authentication })
              : common.getItemBase(templateInfo.itemId, authentication)
          );
          urls.push(templateInfo.url);
          types.push(t.item.type);
          ids.push(templateInfo.itemId);
        }
      }
    });

    if (defs.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      Promise.all(defs.map(p => p.catch(e => e))).then(results => {
        /* istanbul ignore else */
        if (Array.isArray(results) && results.length > 0) {
          const fieldDefs: Array<Promise<any>> = [];
          results.forEach((r, i) => {
            // a feature service result will contain a serviceItemId if it was successfully fetched
            if (r.serviceItemId && types[i] === "Feature Service") {
              Object.keys(templateDictionary).forEach(k => {
                const v: any = templateDictionary[k];
                /* istanbul ignore else */
                if (v.itemId && v.itemId === r.serviceItemId) {
                  common.setDefaultSpatialReference(
                    templateDictionary,
                    k,
                    r.spatialReference
                  );

                  // keep the extent values from these responses as well
                  common.setCreateProp(
                    templateDictionary,
                    `${k}.defaultExtent`,
                    r.fullExtent || r.initialExtent
                  );

                  const layerIds: number[] = (r.layers || []).map(
                    (l: any) => l.id
                  );
                  const tablesIds: number[] = (r.tables || []).map(
                    (t: any) => t.id
                  );
                  fieldDefs.push(
                    common.getExistingLayersAndTables(
                      urls[i],
                      layerIds.concat(tablesIds),
                      authentication
                    )
                  );
                }
              });
            } else {
              /* istanbul ignore else */
              if (
                types[i] === "Feature Service" ||
                common.getProp(r, "response.error")
              ) {
                // if an error is returned we need to clean up the templateDictionary
                templateDictionary = _updateTemplateDictionaryForError(
                  templateDictionary,
                  ids[i]
                );
              }
            }
          });

          if (fieldDefs.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            Promise.all(fieldDefs).then(layerTableResult => {
              layerTableResult.forEach(l => {
                l.forEach((ll: any) => {
                  Object.keys(templateDictionary).forEach(k => {
                    /* istanbul ignore else */
                    if (templateDictionary[k].itemId === ll.serviceItemId) {
                      const layerInfo: any = common.getProp(
                        templateDictionary,
                        `${k}.layer${ll.id}`
                      );
                      /* istanbul ignore else */
                      if (layerInfo && ll.fields) {
                        layerInfo.fields = ll.fields;
                      }
                    }
                  });
                });
              });
              resolve(null);
            });
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    } else {
      resolve(null);
    }
  });
}

/**
 * In some cases an item id search will return a stale item reference
 * it will subsequently fail when we try to fetch the underlying service.
 *
 * We need to remove the item info that has been added to the template dictionary
 * and treat the item as we do other items that don't already exist on deployment.
 *
 * @param result the service request result
 * @param templateDictionary Hash of facts: org URL, adlib replacements, deferreds for dependencies
 *
 * @protected
 */
export function _updateTemplateDictionaryForError(
  templateDictionary: any,
  itemId: string
): any {
  /* istanbul ignore else */
  if (itemId) {
    let removeKey: string = "";
    Object.keys(templateDictionary).some(k => {
      /* istanbul ignore else */
      if (templateDictionary[k].itemId === itemId) {
        removeKey = k;
        return true;
      }
    });
    /* istanbul ignore else */
    if (removeKey !== "") {
      delete templateDictionary[removeKey];
    }
  }
  return templateDictionary;
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
  const existingItemsByTag: Array<Promise<any>> = [Promise.resolve(null)];
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
            _updateTemplateDictionaryById(
              templateDictionary,
              sourceId,
              result.id,
              result
            );
          }
        }
      }
    });
  }
  return existingItemsByTag;
}

export function _updateTemplateDictionaryById(
  templateDictionary: any,
  sourceId: string,
  itemId: string,
  v: any
): void {
  templateDictionary[sourceId] = Object.assign(
    templateDictionary[sourceId] || {},
    {
      def: Promise.resolve(
        common.generateEmptyCreationResponse(v.type, itemId)
      ),
      itemId,
      name: v.name,
      title: v.title,
      url: v.url
    }
  );
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
  // if there is no entry in the templateDictionary
  // or if we have a basic entry without the deferred request for its creation, add it
  if (
    !templateDictionary.hasOwnProperty(template.itemId) ||
    !common.getProp(templateDictionary[template.itemId], "def")
  ) {
    let createResponse: common.ICreateItemFromTemplateResponse;
    let statusCode: common.EItemProgressStatus =
      common.EItemProgressStatus.Unknown;
    let itemHandler: common.IItemTemplateConversions;

    templateDictionary[template.itemId] =
      templateDictionary[template.itemId] || {};

    // Save the deferred for the use of items that depend on this item being created first
    templateDictionary[template.itemId].def = new Promise<
      common.ICreateItemFromTemplateResponse
    >(resolve => {
      // Wait until all of the item's dependencies are deployed
      const _awaitDependencies = template.dependencies.reduce(
        (acc: any[], id: string) => {
          const def = common.getProp(templateDictionary, `${id}.def`);
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
              const def = common.getProp(templateDictionary, `${v}.def`);
              /* istanbul ignore else */
              if (def) {
                acc.push(def);
              }
              return acc;
            }, _awaitDependencies)
          : _awaitDependencies;

      Promise.all(awaitDependencies)
        .then(() => {
          // Find the conversion handler for this item type
          const templateType = template.type;
          itemHandler = moduleMap[templateType];
          if (!itemHandler || itemHandler === UNSUPPORTED) {
            if (itemHandler === UNSUPPORTED) {
              statusCode = common.EItemProgressStatus.Ignored;
              throw new Error();
            } else {
              statusCode = common.EItemProgressStatus.Failed;
              throw new Error();
            }
          }

          // Get the item's thumbnail
          return common.getThumbnailFromStorageItem(
            storageAuthentication,
            resourceFilePaths
          );
        })
        .then(thumbnail => {
          template.item.thumbnail = thumbnail;

          // Delegate the creation of the item to the handler
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          return itemHandler.createItemFromTemplate(
            template,
            templateDictionary,
            destinationAuthentication,
            itemProgressCallback
          );
        })
        .then((response: common.ICreateItemFromTemplateResponse) => {
          if (response.id === "") {
            statusCode = common.EItemProgressStatus.Failed;
            throw new Error("handled"); // fails to create item
          }

          /* istanbul ignore else */
          createResponse = response;
          if (createResponse.item.item.url) {
            common.setCreateProp(
              templateDictionary,
              template.itemId + ".url",
              createResponse.item.item.url
            );
          }

          if (resourceFilePaths.length > 0) {
            // Copy resources, metadata, form
            return common.copyFilesFromStorageItem(
              storageAuthentication,
              resourceFilePaths,
              templateDictionary.folderId,
              createResponse.id,
              destinationAuthentication,
              createResponse.item
            );
          } else {
            return Promise.resolve(null);
          }
        })
        .then(() => {
          resolve(createResponse);
        })
        .catch(error => {
          if (!error || error.message !== "handled") {
            itemProgressCallback(
              template.itemId,
              statusCode === common.EItemProgressStatus.Unknown
                ? common.EItemProgressStatus.Failed
                : statusCode,
              0
            );
          }

          // Item type not supported or fails to get item dependencies
          resolve(common.generateEmptyCreationResponse(template.type));
        });
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

// TODO: Return a Promise vs array of promises
export function _getGroupUpdates(
  template: common.IItemTemplate,
  authentication: common.UserSession,
  templateDictionary: any
): Array<Promise<any>> {
  const groups = template.groups || [];
  return groups.map((sourceGroupId: string) => {
    return common.shareItem(
      templateDictionary[sourceGroupId].itemId,
      template.itemId,
      authentication
    );
  });
}
