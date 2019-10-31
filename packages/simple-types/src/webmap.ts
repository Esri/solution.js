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

import * as common from "@esri/solution-common";

/**
 * The portion of a Webmap URL between the server and the map id.
 * @protected
 */
const WEBMAP_APP_URL_PART: string = "/home/webmap/viewer.html?webmap=";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Converts an AGOL webmap item to a template.
 *
 * @param itemTemplate Template for the webmap item
 * @param authentication credentials for the request
 * @return Template for the solution item that contains key details for item reconstruction
 */
export function convertItemToTemplate(
  itemTemplate: common.IItemTemplate,
  authentication: common.UserSession
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>((resolve, reject) => {
    // Templatize the app URL
    itemTemplate.item.url =
      common.PLACEHOLDER_SERVER_NAME +
      WEBMAP_APP_URL_PART +
      itemTemplate.item.id; // templatized id

    // Extract dependencies
    _extractDependencies(itemTemplate, authentication).then(
      (results: any) => {
        itemTemplate.dependencies = results.dependencies;

        // Templatize the map layer ids after we've extracted them as dependencies
        if (itemTemplate.data) {
          _templatizeWebmapLayerIdsAndUrls(
            itemTemplate.data.operationalLayers,
            results.urlHash
          );
          _templatizeWebmapLayerIdsAndUrls(
            itemTemplate.data.tables,
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
 * Gets the ids of the dependencies of an AGOL webmap item.
 *
 * @param itemTemplate A webmap item whose dependencies are sought
 * @param authentication Credentials for any requests
 * @return List of dependencies ids
 * @protected
 */
export function _extractDependencies(
  itemTemplate: common.IItemTemplate,
  authentication: common.UserSession
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    let dependencies: string[] = [];

    if (itemTemplate.data) {
      const layers: any[] = itemTemplate.data.operationalLayers || [];
      const tables: any[] = itemTemplate.data.tables || [];
      const layersAndTables: any[] = layers.concat(tables);
      dependencies = _getWebmapLayerIds(layersAndTables);

      _getAnalysisLayerIds(layersAndTables, dependencies, authentication).then(
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
 * Extracts the AGOL id for each layer or table object in a list.
 *
 * @param layerList List of map layers or tables
 * @return List containing the ids of each layer or table that has an itemId
 * @protected
 */
export function _getWebmapLayerIds(layerList: any[]): string[] {
  return layerList.reduce(
    (ids: string[], layer: any) => {
      const itemId = layer.itemId as string;
      if (itemId && ids.indexOf(itemId) < 0) {
        ids.push(itemId);
      }
      return ids;
    },
    [] as string[]
  );
}

/**
 * Extracts the AGOL id for each layer or table object in a list.
 *
 * @param layerList List of map layers or tables
 * @param dependencies Current list of dependencies
 * @param authentication Credentials for any requests
 * @return An object with a ist containing the ids of each layer or table that has an itemId
 *         and a lookup object for analysis layers that have a url but no itemId stored in the operationalLayer
 * @protected
 */
export function _getAnalysisLayerIds(
  layerList: any[],
  dependencies: string[],
  authentication: common.UserSession
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const urlHash: any = {};
    // find layers that have a url but don't have an itemId
    const layers: any[] = layerList.filter(layer => {
      if (!layer.itemId && layer.url) {
        // in some cases the layer without an itemId is an analysis layer and the source layer is also
        // present in the map...in this case we don't need to query for the itemId
        // we can just get it from the soure layer in the map
        const hasLayer: boolean = layerList.some(l => {
          if (l.itemId && l.url === layer.url) {
            urlHash[l.url] = l.itemId;
            return true;
          } else {
            return false;
          }
        });
        return !hasLayer;
      } else {
        return false;
      }
    });

    if (layers.length > 0) {
      const options: any = {
        f: "json",
        authentication: authentication
      };
      // find itemId
      let i: number = 0;
      const serviceRequests: any[] = layers.map(layer =>
        common.rest_request(layer.url, options)
      );
      Promise.all(serviceRequests).then(
        serviceResponses => {
          serviceResponses.forEach(serviceResponse => {
            if (common.getProp(serviceResponse, "serviceItemId")) {
              if (dependencies.indexOf(serviceResponse.serviceItemId) < 0) {
                dependencies.push(serviceResponse.serviceItemId);
              }
              urlHash[layers[i].url] = serviceResponse.serviceItemId;
            }
            i++;
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
 * Templatizes the url and item id for layers or tables within the webmap.
 *
 * @param layerList List of map layers or tables
 * @param urlHash Lookup object for analysis layers
 * @return void
 * @protected
 */
export function _templatizeWebmapLayerIdsAndUrls(
  layerList = [] as any[],
  urlHash: any
): void {
  layerList.forEach((layer: any) => {
    if (layer.url) {
      const layerId = layer.url.substr(
        (layer.url as string).lastIndexOf("/") + 1
      );
      const hashId: any =
        Object.keys(urlHash).indexOf(layer.url) > -1
          ? urlHash[layer.url]
          : undefined;
      const itemId: string = layer.itemId ? layer.itemId : hashId;
      if (itemId) {
        layer.url = common.templatizeTerm(
          itemId,
          itemId,
          ".layer" + layerId + ".url"
        );
        if (layer.itemId) {
          layer.itemId = common.templatizeTerm(
            itemId,
            itemId,
            ".layer" + layerId + ".itemId"
          );
        }
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
