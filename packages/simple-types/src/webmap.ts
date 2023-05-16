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

/**
 * The portion of a Webmap URL between the server and the map id.
 *
 * @private
 */
const WEBMAP_APP_URL_PART: string = "home/webmap/viewer.html?webmap=";

/**
 * A flag inserted used as a vector tile layer's styleUrl to indicate that the layer is unsupported and should
 * be removed.
 */
const unsupportedTileLayerUrl = "unsupported";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Converts an AGOL webmap item to a template.
 *
 * @param itemTemplate Template for the webmap item
 * @param destAuthentication Credentials for requests to the destination organization
 * @param srcAuthentication Credentials for requests to source items
 * @param templateDictionary Hash of key details used for variable replacement
 * @returns Template for the solution item that contains key details for item reconstruction
 */
export function convertItemToTemplate(
  itemTemplate: common.IItemTemplate,
  destAuthentication: common.UserSession,
  srcAuthentication: common.UserSession,
  templateDictionary: any
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>((resolve, reject) => {
    // Templatize the app URL if it's not a vector tile service
    if (itemTemplate.type !== "Vector Tile Service") {
      itemTemplate.item.url = itemTemplate.item.url ?
        common.checkUrlPathTermination(common.placeholder(common.SERVER_NAME)) +
        WEBMAP_APP_URL_PART +
        itemTemplate.item.id : itemTemplate.item.url; // templatized id
    }

    // Extract dependencies
    _extractDependencies(itemTemplate, srcAuthentication).then(
      (results: common.IWebmapDependencies) => {
        itemTemplate.dependencies = results.dependencies;

        // Templatize the map layer ids after we've extracted them as dependencies
        if (itemTemplate.data) {
          const baseMapLayers = itemTemplate.data.baseMap?.baseMapLayers;
          if (baseMapLayers) {
            itemTemplate.data.baseMap.baseMapLayers =
              baseMapLayers.filter(layer => layer.styleUrl !== unsupportedTileLayerUrl);
            _templatizeWebmapLayerIdsAndUrls(
              itemTemplate.data.baseMap.baseMapLayers,
              results.urlHash,
              templateDictionary
            );
          }

          const operationalLayers = itemTemplate.data.operationalLayers;
          if (operationalLayers) {
            itemTemplate.data.operationalLayers =
              operationalLayers.filter(layer => layer.styleUrl !== unsupportedTileLayerUrl);
            _templatizeWebmapLayerIdsAndUrls(
              itemTemplate.data.operationalLayers,
              results.urlHash,
              templateDictionary
            );
          }

          _templatizeWebmapLayerIdsAndUrls(
            itemTemplate.data.tables,
            results.urlHash,
            templateDictionary
          );

          // Exclude intialState
          _excludeInitialState(itemTemplate.data);
        }

        resolve(itemTemplate);
      },
      e => reject(common.fail(e))
    );
  });
}

/**
 * Gets the ids of the dependencies of an AGOL webmap item.
 *
 * @param itemTemplate A webmap item whose dependencies are sought
 * @param authentication Credentials for any requests
 * @returns List of dependencies ids and url/itemId hash
 * @private
 */
export function _extractDependencies(
  itemTemplate: common.IItemTemplate,
  authentication: common.UserSession
): Promise<common.IWebmapDependencies> {
  return new Promise<any>((resolve, reject) => {
    const dependencies: string[] = [];
    if (itemTemplate.data) {
      const basemapLayers: any[] = itemTemplate.data.baseMap?.baseMapLayers || [];
      const opLayers: any[] = itemTemplate.data.operationalLayers || [];
      const tables: any[] = itemTemplate.data.tables || [];
      const layersAndTables: any[] = basemapLayers.concat(opLayers).concat(tables);
      _getLayerIds(layersAndTables, dependencies, authentication).then(
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
 * Remove the initialState prop from webmaps saved from the new map viewer.
 * This allows the map to use the item extent property that we templatize.
 *
 * Added for issue #662
 *
 * @param data the data for the web maps item template
 * @returns void
 * @private
 */
export function _excludeInitialState(data: any): void {
  common.deleteProp(data, "initialState");
}

/**
 * Extracts the AGOL itemId for each layer or table object in a list using the url.
 *
 * @param layerList List of map layers or tables; supported vector tile layers have their styleUrls templatized
 * @param dependencies Current list of dependencies
 * @param authentication Credentials for any requests
 * @returns Updated list of dependencies ids, url/itemId hash (for feature layers),
 * and id/styleUrl hash (for vector tile layers)
 * @private
 */
export function _getLayerIds(
  layerList: any[],
  dependencies: string[],
  authentication: common.UserSession
): Promise<common.IWebmapDependencies> {
  return new Promise<any>((resolve, reject) => {
    const urlHash: common.IKeyedStrings = {};

    const options: any = {
      f: "json",
      authentication: authentication
    };
    const layerPromises: Array<Promise<any>> = [];
    const layerChecks: any = {};
    const layers: any[] = layerList.filter(layer => {

      // Test for Vector Tile Layers
      if (layer.itemId && layer.layerType === "VectorTileLayer") {
        // Fetch the item so that we can check if it has the typeKeyword "Vector Tile Style Editor", which ensures
        // that the user has edited the style and it is something that could be reasonably be packaged with the
        // solution
        layerPromises.push(common.getItemBase(layer.itemId, authentication));
        return true;

      // Handle a feature server layer
      } else if (layer.url && layer.url.indexOf("{{velocityUrl}}") < 0) {
        const results: any = /.+FeatureServer/g.exec(layer.url);
        const baseUrl: string =
          Array.isArray(results) && results.length > 0 ? results[0] : undefined;
        if (baseUrl) {
          // avoid redundant checks when we have a layer with subLayers
          if (Object.keys(layerChecks).indexOf(baseUrl) < 0) {
            layerChecks[baseUrl] = common.rest_request(layer.url, options);
          }
          layerPromises.push(layerChecks[baseUrl]);
          return true;
        } else {
          return false;
        }

      // This layer is not a dependency
      } else {
        return false;
      }
    });

    // We have a mix of Vector Tile Layer item base requests and Feature Server info requests
    if (layerPromises.length > 0) {
      Promise.all(layerPromises).then(
        (responses) => {
          responses.forEach((response, i) => {

            if (layers[i].layerType === "VectorTileLayer") {
              const typeKeywords = common.getProp(response, "typeKeywords");
              if (typeKeywords && typeKeywords.includes("Vector Tile Style Editor")) {
                // Vector tiles edited by the style editor
                if (dependencies.indexOf(response.id) < 0) {
                  dependencies.push(response.id);
                }

                // Templatize the URL to the style resource
                const iSuffix = layers[i].styleUrl.indexOf(response.id) + response.id.length;
                layers[i].styleUrl = common.templatizeTerm(
                  layers[i].styleUrl.replace(layers[i].styleUrl.substring(0, iSuffix), response.id),
                  response.id,
                  ".itemUrl"
                );
              } else {
                // Unsupported vector tiles
                layers[i].styleUrl = unsupportedTileLayerUrl;
              }

            } else if (common.getProp(response, "serviceItemId")) {
              // Feature Service
              const id: string = response.serviceItemId;
              if (dependencies.indexOf(id) < 0) {
                dependencies.push(id);
              }
              urlHash[layers[i].url] = id;
            }

          });

          resolve({
            dependencies,
            urlHash
          } as common.IWebmapDependencies);
        },
        e => reject(common.fail(e))
      );
    } else {
      resolve({
        dependencies,
        urlHash
      } as common.IWebmapDependencies);
    }
  });
}

/**
 * Templatizes the url and item id for layers or tables within the webmap.
 *
 * @param layerList List of map layers or tables
 * @param urlHash Lookup object for analysis layers; hash from URL to AGO item id
 * @param templateDictionary Hash of key details used for variable replacement
 * @returns void
 * @private
 */
export function _templatizeWebmapLayerIdsAndUrls(
  layerList = [] as any[],
  urlHash: common.IKeyedStrings,
  templateDictionary: any
): void {
  layerList.forEach((layer: any) => {

    // Test for Vector Tile Layers
    if (layer.itemId && layer.layerType === "VectorTileLayer") {
      // No further test needed: we've already pruned out unsupported vector tile layers
      layer.itemId = common.templatizeTerm(layer.itemId, layer.itemId, ".itemId");

    // Handle a feature server layer
    } else if (layer.url) {
      const layerId = layer.url.substr(
        (layer.url as string).lastIndexOf("/") + 1
      );
      const id: string =
        Object.keys(urlHash).indexOf(layer.url) > -1
          ? urlHash[layer.url]
          : undefined;
      if (id) {
        common.cacheLayerInfo(layerId, id, layer.url, templateDictionary);
        layer.url = common.templatizeTerm(id, id, ".layer" + layerId + ".url");
        layer.itemId = common.templatizeTerm(
          id,
          id,
          ".layer" + layerId + ".itemId"
        );
      }
    }

  });
}

/**
 * Templatize field references.
 *
 * @param solutionTemplate The solution item template
 * @param datasourceInfos A list of datasource info objects that contain key values to templatize field references
 * @returns The solutionTemplate with templatized field references
 */
export function postProcessFieldReferences(
  solutionTemplate: common.IItemTemplate,
  datasourceInfos: common.IDatasourceInfo[]
): common.IItemTemplate {
  const paths: string[] = [
    "data.operationalLayers",
    "data.tables",
    "data.applicationProperties.viewing.search.layers"
  ];
  paths.forEach(p => _templatizeProperty(solutionTemplate, datasourceInfos, p));
  return solutionTemplate;
}

/**
 * Templatize field references.
 *
 * @param solutionTemplate The solution item template
 * @param datasourceInfos A list of datasource info objects that contain key values to templatize field references
 * @param path A string path to the object property to templatize
 * @private
 */
export function _templatizeProperty(
  solutionTemplate: common.IItemTemplate,
  datasourceInfos: common.IDatasourceInfo[],
  path: string
): void {
  const objs: any[] = common.getProp(solutionTemplate, path);
  if (objs) {
    common.setProp(solutionTemplate, path, _templatize(objs, datasourceInfos));
  }
}

/**
 * Templatize field references.
 *
 * @param objs Can be operationalLayers or tables or appProperties search layers
 * @param datasourceInfos A list of datasource info objects that contain key values to templatize field references
 * @returns updated instances of the objects
 * @private
 */
export function _templatize(
  objs: any[],
  datasourceInfos: common.IDatasourceInfo[]
): any[] {
  objs.forEach(obj => {
    const ds: common.IDatasourceInfo = _getDatasourceInfo(obj, datasourceInfos);
    if (ds) {
      const fieldNames: string[] = ds.fields.map(f => f.name);

      common._templatizePopupInfo(obj, ds, ds.basePath, ds.itemId, fieldNames);

      common._templatizeDefinitionEditor(obj, ds.basePath, fieldNames);

      if (obj.layerDefinition) {
        common._templatizeDrawingInfo(
          obj.layerDefinition,
          ds.basePath,
          fieldNames
        );

        common._templatizeDefinitionExpression(
          obj.layerDefinition,
          ds.basePath,
          fieldNames
        );
      }

      // used for applicationProperties search layers
      const fieldName: any = common.getProp(obj, "field.name");
      if (fieldName) {
        common.setProp(
          obj,
          "field.name",
          common._templatizeFieldName(fieldName, obj, ds.itemId, ds.basePath)
        );
      }
    }
  });

  return objs;
}

/**
 * Get datasourceInfo by map layer id
 *
 * @param obj Can be operationalLayer or table or appProperties search layer
 * @param datasourceInfos A list of datasource info objects that contain key values to templatize field references
 * @returns datasourceInfo for the given object id
 * @private
 */
export function _getDatasourceInfo(
  obj: any,
  datasourceInfos: common.IDatasourceInfo[]
): any {
  let datasourceInfo: any;
  datasourceInfos.some(ds => {
    if (ds.ids.indexOf(obj.id) > -1) {
      datasourceInfo = ds;
      return true;
    } else {
      return false;
    }
  });
  return datasourceInfo;
}
