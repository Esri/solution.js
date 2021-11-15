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

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Converts an AGOL OIC (Oriented Imagery Catalog) item to a template.
 *
 * @param itemTemplate Template for the OIC (Oriented Imagery Catalog) item
 * @param destAuthentication Credentials for requests to the destination organization
 * @param srcAuthentication Credentials for requests to source items
 * @return Template for the solution item that contains key details for item reconstruction
 */
export function convertItemToTemplate(
  itemTemplate: common.IItemTemplate,
  destAuthentication: common.UserSession,
  srcAuthentication: common.UserSession
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>((resolve, reject) => {
    // Extract dependencies
    _extractDependencies(itemTemplate, srcAuthentication).then(
      (results: any) => {
        itemTemplate.dependencies = results.dependencies;

        // Templatize the map layer ids after we've extracted them as dependencies
        /* istanbul ignore else */
        if (itemTemplate.data?.properties) {
          itemTemplate.data.properties.ServiceURL = _templatizeOicLayerUrl(
            itemTemplate.data.properties.ServiceURL,
            results.urlHash
          );
          itemTemplate.data.properties.OverviewURL = _templatizeOicLayerUrl(
            itemTemplate.data.properties.OverviewURL,
            results.urlHash
          );
        }

        resolve(itemTemplate);
      },
      e => reject(common.fail(e))
    );
  });
}

/**
 * Gets the ids of the dependencies of an AGOL OIC (Oriented Imagery Catalog) item.
 *
 * @param itemTemplate A OIC (Oriented Imagery Catalog) item whose dependencies are sought
 * @param authentication Credentials for any requests
 * @return List of dependencies ids and url/itemId hash
 * @protected
 */
export function _extractDependencies(
  itemTemplate: common.IItemTemplate,
  authentication: common.UserSession
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const dependencies: string[] = [];
    if (itemTemplate.data?.properties) {
      const layerURLs = [];
      /* istanbul ignore else */
      if (itemTemplate.data.properties.ServiceURL) {
        layerURLs.push(itemTemplate.data.properties.ServiceURL);
      }
      /* istanbul ignore else */
      if (
        itemTemplate.data.properties.OverviewURL &&
        itemTemplate.data.properties.OverviewURL !==
          itemTemplate.data.properties.ServiceURL
      ) {
        layerURLs.push(itemTemplate.data.properties.OverviewURL);
      }
      _getLayerIds(layerURLs, dependencies, authentication).then(
        results => {
          resolve(results);
        },
        e => reject(common.fail(e))
      );
    } else {
      resolve({
        dependencies: dependencies,
        urlHash: {}
      });
    }
  });
}

/**
 * Extracts the AGOL itemId for each layer in a list using the url.
 *
 * @param layerURLs List of OIC layer URLs
 * @param dependencies Current list of dependencies
 * @param authentication Credentials for any requests
 * @return List of dependencies ids and url/itemId hash
 * @protected
 */
export function _getLayerIds(
  layerURLs: string[],
  dependencies: string[],
  authentication: common.UserSession
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const urlHash: any = {};

    const options: any = {
      f: "json",
      authentication: authentication
    };
    const layerPromises: Array<Promise<any>> = [];
    const layerChecks: any = {};
    const filteredLayerURLs: any[] = layerURLs.filter(layerURL => {
      if (layerURL) {
        const results: any = /.+FeatureServer/g.exec(layerURL);
        const baseUrl: string =
          Array.isArray(results) && results.length > 0 ? results[0] : undefined;
        if (baseUrl) {
          // avoid redundant checks when we have a layer with subLayers
          /* istanbul ignore else */
          if (Object.keys(layerChecks).indexOf(baseUrl) < 0) {
            layerChecks[baseUrl] = common.rest_request(layerURL, options);
          }
          layerPromises.push(layerChecks[baseUrl]);
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    });

    if (layerPromises.length > 0) {
      Promise.all(layerPromises).then(
        serviceResponses => {
          serviceResponses.forEach((serviceResponse, i) => {
            /* istanbul ignore else */
            if (common.getProp(serviceResponse, "serviceItemId")) {
              const id: string = serviceResponse.serviceItemId;
              /* istanbul ignore else */
              if (dependencies.indexOf(id) < 0) {
                dependencies.push(id);
              }
              urlHash[filteredLayerURLs[i]] = id;
            }
          });
          resolve({
            dependencies: dependencies,
            urlHash: urlHash
          });
        },
        e => reject(common.fail(e))
      );
    } else {
      resolve({
        dependencies: dependencies,
        urlHash: urlHash
      });
    }
  });
}

/**
 * Templatizes the url and item id for a layer.
 *
 * @param layerURL OIC layer URL
 * @param urlHash Lookup object for analysis layers
 * @return Templatized URL if layerURL is in the urlHash
 * @protected
 */
export function _templatizeOicLayerUrl(layerURL: string, urlHash: any): string {
  let templatizedURL = layerURL;
  if (layerURL) {
    const id: any = urlHash[layerURL];
    if (id) {
      const layerId = layerURL.substr(layerURL.lastIndexOf("/") + 1);
      templatizedURL = common.templatizeTerm(
        id,
        id,
        ".layer" + layerId + ".url"
      );
    }
    
    // replace everything up until /home with portalBaseUrl var and templatize the itemId
    templatizedURL = common.templatizeIds(
      templatizedURL.replace(/.+?(?=\/home)/, "{{portalBaseUrl}}")
    );
  }
  return templatizedURL;
}
