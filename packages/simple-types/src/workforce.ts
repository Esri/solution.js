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

import * as common from "@esri/solution-common";

//#region Publish Process ---------------------------------------------------------------------------------------//

/**
 * Converts an workforce item to a template.
 *
 * @param itemTemplate template for the workforce project item
 * @param authentication credentials for any requests
 * @return templatized itemTemplate
 */
export function convertItemToTemplate(
  itemTemplate: common.IItemTemplate,
  authentication: common.UserSession
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>((resolve, reject) => {
    // Key properties that contain item IDs for the workforce project type
    const keyProperties: string[] = [
      "groupId",
      "workerWebMapId",
      "dispatcherWebMapId",
      "dispatchers",
      "assignments",
      "workers",
      "tracks"
    ];

    // The templates data to process
    const data: any = itemTemplate.data;

    if (data) {
      // Extract dependencies
      _extractDependencies(data, keyProperties, authentication).then(
        results => {
          itemTemplate.dependencies = results.dependencies;
          // templatize key properties
          itemTemplate.data = _templatize(data, keyProperties, results.urlHash);
          resolve(itemTemplate);
        },
        e => reject(common.fail(e))
      );
    } else {
      resolve(itemTemplate);
    }
  });
}

/**
 * Gets the ids of the dependencies of the workforce project.
 *
 * @param data itemTemplate data
 * @param keyProperties workforce project properties that contain references to dependencies
 * @param authentication credentials for any requests
 * @return List of dependencies ids
 */
export function _extractDependencies(
  data: any,
  keyProperties: string[],
  authentication: common.UserSession
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const deps: string[] = [];

    // get the ids for the service dependencies
    // "workerWebMapId" and "dispatcherWebMapId" are already IDs and don't have a serviceItemId
    keyProperties.forEach(p => {
      const serviceItemId: string = common.getProp(data, p + ".serviceItemId");
      const v: string = common.getProp(data, p);
      if (serviceItemId) {
        if (deps.indexOf(serviceItemId) === -1) {
          deps.push(serviceItemId);
        }
      } else {
        idTest(v, deps);
      }
    });

    if (common.getProp(data, "assignmentIntegrations")) {
      let requests: Array<Promise<any>> = [];
      let urls: string[] = [];
      data.assignmentIntegrations.forEach((ai: any) => {
        if (ai.assignmentTypes) {
          const assignmentKeys: string[] = Object.keys(ai.assignmentTypes);
          assignmentKeys.forEach(k => {
            const urlTemplate: any = ai.assignmentTypes[k].urlTemplate;
            idTest(urlTemplate, deps);
            const serviceRequests: any = urlTest(urlTemplate, authentication);
            if (
              Array.isArray(serviceRequests.requests) &&
              serviceRequests.requests.length > 0
            ) {
              requests = requests.concat(serviceRequests.requests);
              urls = urls.concat(serviceRequests.urls);
            }
          });
        }
      });

      if (requests.length > 0) {
        Promise.all(requests).then(
          results => {
            const urlHash: any = {};
            // Get the serviceItemId for the url
            /* istanbul ignore else */
            if (Array.isArray(results)) {
              results.forEach((result, i) => {
                /* istanbul ignore else */
                if (result.serviceItemId) {
                  urlHash[urls[i]] = result.serviceItemId;
                  /* istanbul ignore else */
                  if (deps.indexOf(result.serviceItemId) === -1) {
                    deps.push(result.serviceItemId);
                  }
                }
              });
            }
            resolve({
              dependencies: deps,
              urlHash: urlHash
            });
          },
          e => reject(common.fail(e))
        );
      } else {
        resolve({
          dependencies: deps,
          urlHash: {}
        });
      }
    } else {
      resolve({
        dependencies: deps,
        urlHash: {}
      });
    }
  });
}

/**
 * Evaluates a value with a regular expression
 *
 * @param v a string value to test with the expression
 * @param ex the regular expresion to test with
 * @return an array of matches
 */
export function regExTest(v: any, ex: RegExp): any[] {
  return v && ex.test(v) ? v.match(ex) : [];
}

/**
 * Updates a list of the items dependencies if more are found in the
 * provided value.
 *
 * @param v a string value to check for ids
 * @param deps a list of the items dependencies
 */
export function idTest(v: any, deps: string[]): void {
  const ids: any[] = _getIDs(v);
  ids.forEach(id => {
    /* istanbul ignore else */
    if (deps.indexOf(id) === -1) {
      deps.push(id);
    }
  });
}

/**
 * Test the provided value for any urls and submit a request to obtain the service item id for the url
 *
 * @param v a string value to test for urls
 * @param authentication credentials for the requests
 * @returns an object with any pending requests and the urls that requests were made to
 */
export function urlTest(v: any, authentication: common.UserSession): any {
  const urls: any[] = _getURLs(v);
  const requests: Array<Promise<any>> = [];
  urls.forEach(url => {
    const options: any = {
      f: "json",
      authentication: authentication
    };
    requests.push(common.rest_request(url, options));
  });
  return {
    requests: requests,
    urls: urls
  };
}

/**
 * Templatizes key item properties.
 *
 * @param data itemTemplate data
 * @param keyProperties workforce project properties that should be templatized
 * @param urlHash a key value pair of url and itemId
 * @return an updated data object to be stored in the template
 */
export function _templatize(
  data: any,
  keyProperties: string[],
  urlHash: any
): any {
  keyProperties.forEach(p => {
    /* istanbul ignore else */
    if (common.getProp(data, p)) {
      if (common.getProp(data[p], "serviceItemId")) {
        // templatize properties with id and url
        const id: string = data[p].serviceItemId;
        let serviceItemIdSuffix: string = ".itemId";

        /* istanbul ignore else */
        if (common.getProp(data[p], "url")) {
          const layerId = _getLayerId(data[p].url);
          data[p].url = common.templatizeTerm(
            id,
            id,
            _getReplaceValue(layerId, ".url")
          );
          serviceItemIdSuffix = _getReplaceValue(layerId, serviceItemIdSuffix);
        }
        data[p].serviceItemId = common.templatizeTerm(
          id,
          id,
          serviceItemIdSuffix
        );
      } else {
        // templatize simple id properties
        data[p] = common.templatizeTerm(data[p], data[p], ".itemId");
      }
    }
  });

  data["folderId"] = "{{folderId}}";

  // templatize app integrations
  const integrations: any[] = data.assignmentIntegrations || [];
  integrations.forEach(i => {
    _templatizeUrlTemplate(i, urlHash);
    /* istanbul ignore else */
    if (i.assignmentTypes) {
      const assignmentKeys: string[] = Object.keys(i.assignmentTypes);
      assignmentKeys.forEach(k => {
        _templatizeUrlTemplate(i.assignmentTypes[k], urlHash);
      });
    }
  });
  return data;
}

/**
 * Templatizes values from a urlTemplate
 *
 * @param item the object that may contain a urlTemplate
 * @param urlHash a key value pair of url and itemId
 */
export function _templatizeUrlTemplate(item: any, urlHash: any): void {
  /* istanbul ignore else */
  if (common.getProp(item, "urlTemplate")) {
    const ids: string[] = _getIDs(item.urlTemplate);
    ids.forEach(id => {
      item.urlTemplate = item.urlTemplate.replace(
        id,
        common.templatizeTerm(id, id, ".itemId")
      );
    });
    const urls: string[] = _getURLs(item.urlTemplate);
    urls.forEach(url => {
      const layerId = _getLayerId(url);
      const replaceValue: string = _getReplaceValue(layerId, ".url");
      item.urlTemplate = item.urlTemplate.replace(
        url,
        common.templatizeTerm(urlHash[url], urlHash[url], replaceValue)
      );
    });
  }
}

export function _getURLs(v: string): string[] {
  return regExTest(v, /(?<=featureSourceURL=).*?(?=&|$)/gi);
}

export function _getIDs(v: string): string[] {
  return regExTest(v, /[0-9A-F]{32}/gi);
}

export function _getLayerId(url: string): any {
  return url.indexOf("FeatureServer/") > -1
    ? url.substr(url.lastIndexOf("/") + 1)
    : undefined;
}

export function _getReplaceValue(layerId: any, suffix: string): string {
  return isNaN(Number.parseInt(layerId, 10))
    ? `${suffix}`
    : `.layer${layerId}${suffix}`;
}

//#endregion

//#region Deploy Process ---------------------------------------------------------------------------------------//

/**
 * Gets the current user and updates the dispatchers service
 *
 * @param newlyCreatedItem Item to be created; n.b.: this item is modified
 * @param destinationAuthentication The session used to create the new item(s)
 * @return A promise that will resolve with { "success" === true || false }
 */
export function fineTuneCreatedItem(
  newlyCreatedItem: common.IItemTemplate,
  destinationAuthentication: common.UserSession
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    destinationAuthentication.getUser().then(
      user => {
        _updateDispatchers(
          common.getProp(newlyCreatedItem, "data.dispatchers"),
          user.username || "",
          user.fullName || "",
          destinationAuthentication
        ).then(
          results => {
            resolve({ success: results });
          },
          e => reject(common.fail(e))
        );
      },
      e => reject(common.fail(e))
    );
  });
}

/**
 * Updates the dispatchers service to include the current user as a dispatcher
 *
 * @param dispatchers The dispatchers object from the workforce items data
 * @param name Current users name
 * @param fullName Current users full name
 * @param destinationAuthentication The session used to create the new item(s)
 * @return A promise that will resolve with true || false
 * @protected
 */
export function _updateDispatchers(
  dispatchers: any,
  name: string,
  fullName: string,
  destinationAuthentication: common.UserSession
): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    if (dispatchers && dispatchers.url) {
      common
        .rest_queryFeatures({
          url: dispatchers.url,
          where: "userId = '" + name + "'",
          authentication: destinationAuthentication
        })
        .then(
          (results: any) => {
            if (results && results.features) {
              if (results.features.length === 0) {
                common
                  .rest_addFeatures({
                    url: dispatchers.url,
                    features: [
                      {
                        attributes: {
                          name: fullName,
                          userId: name
                        }
                      }
                    ],
                    authentication: destinationAuthentication
                  })
                  .then(
                    addResults => {
                      if (addResults && addResults.addResults) {
                        resolve(true);
                      } else {
                        reject(
                          common.fail({
                            success: false,
                            message: "Failed to add dispatch record."
                          })
                        );
                      }
                    },
                    e =>
                      reject(
                        common.fail({
                          success: false,
                          message: "Failed to add dispatch record.",
                          error: e
                        })
                      )
                  );
              } else {
                resolve(true);
              }
            } else {
              resolve(false);
            }
          },
          e => reject(common.fail(e))
        );
    } else {
      resolve(false);
    }
  });
}

//#endregion
