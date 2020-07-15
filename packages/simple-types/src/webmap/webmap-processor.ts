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

import {
  ICreateItemFromTemplateResponse,
  IDatasourceInfo,
  IItemTemplate,
  IItemProgressCallback,
  SERVER_NAME,
  _templatizeDefinitionEditor,
  _templatizeDefinitionExpression,
  _templatizeDrawingInfo,
  _templatizeFieldName,
  _templatizePopupInfo,
  checkUrlPathTermination,
  placeholder,
  rest_request,
  setProp,
  templatizeTerm,
  fail
} from "@esri/solution-common";
import { UserSession } from "@esri/solution-common";
import { convertGenericItemToTemplate } from "../helpers/convert-generic-item-to-template";
import { getProp } from "@esri/hub-common";
import * as simpleTypeHelpers from "../helpers/simple-type-helpers";

/**
 * The portion of a Webmap URL between the server and the map id.
 * @protected
 */
const WEBMAP_APP_URL_PART: string = "home/webmap/viewer.html?webmap=";

/**
 * Converts a dashboard item to a template.
 *
 * @param itemTemplate Template for the dashboard item
 * @param authentication Credentials for any requests
 * @return templatized itemTemplate
 */
export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: UserSession
): Promise<IItemTemplate> {
  // delegate to generic item templating
  return convertGenericItemToTemplate(
    solutionItemId,
    itemInfo,
    authentication
  ).then(itemTemplate => {
    // do additional type-specific work
    return convertWebMapToTemplate(itemTemplate, authentication);
  });
}

/**
 * Templatizes field references within specific template types.
 *
 * @param template A solution template
 * @param datasourceInfos A list of objects that store key datasource info used to templatizing field references
 * @param type The item type
 * @return The updated solution template
 */
export function postProcessFieldReferences(
  solutionTemplate: IItemTemplate,
  datasourceInfos: IDatasourceInfo[],
  type: string
): IItemTemplate {
  return postProcessWebMapFieldReferences(solutionTemplate, datasourceInfos);
}

/**
 * Converts an AGOL webmap item to a template.
 *
 * @param itemTemplate Template for the webmap item
 * @param authentication credentials for the request
 * @return Template for the solution item that contains key details for item reconstruction
 */
export function convertWebMapToTemplate(
  itemTemplate: IItemTemplate,
  authentication: UserSession
): Promise<IItemTemplate> {
  return new Promise<IItemTemplate>((resolve, reject) => {
    // Templatize the app URL
    itemTemplate.item.url =
      checkUrlPathTermination(placeholder(SERVER_NAME)) +
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
      e => reject(fail(e))
    );
  });
}

/**
 * Delegate to simpleType creator
 * @param template
 * @param templateDictionary
 * @param destinationAuthentication
 * @param itemProgressCallback
 */
export function createItemFromTemplate(
  template: IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: UserSession,
  itemProgressCallback: IItemProgressCallback
): Promise<ICreateItemFromTemplateResponse> {
  return simpleTypeHelpers.createItemFromTemplate(
    template,
    templateDictionary,
    destinationAuthentication,
    itemProgressCallback
  );
}

/**
 * Gets the ids of the dependencies of an AGOL webmap item.
 *
 * @param itemTemplate A webmap item whose dependencies are sought
 * @param authentication Credentials for any requests
 * @return List of dependencies ids and url/itemId hash
 * @protected
 */
export function _extractDependencies(
  itemTemplate: IItemTemplate,
  authentication: UserSession
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const dependencies: string[] = [];
    if (itemTemplate.data) {
      const layers: any[] = itemTemplate.data.operationalLayers || [];
      const tables: any[] = itemTemplate.data.tables || [];
      const layersAndTables: any[] = layers.concat(tables);
      _getLayerIds(layersAndTables, dependencies, authentication).then(
        results => {
          resolve(results);
        },
        e => reject(fail(e))
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
 * Extracts the AGOL itemId for each layer or table object in a list using the url.
 *
 * @param layerList List of map layers or tables
 * @param dependencies Current list of dependencies
 * @param authentication Credentials for any requests
 * @return List of dependencies ids and url/itemId hash
 * @protected
 */
export function _getLayerIds(
  layerList: any[],
  dependencies: string[],
  authentication: UserSession
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const urlHash: any = {};

    const options: any = {
      f: "json",
      authentication: authentication
    };
    const layerPromises: Array<Promise<any>> = [];
    const layerChecks: any = {};
    const layers: any[] = layerList.filter(layer => {
      if (layer.url) {
        const results: any = /.+FeatureServer/g.exec(layer.url);
        const baseUrl: string =
          Array.isArray(results) && results.length > 0 ? results[0] : undefined;
        if (baseUrl) {
          // avoid redundant checks when we have a layer with subLayers
          if (Object.keys(layerChecks).indexOf(baseUrl) < 0) {
            layerChecks[baseUrl] = rest_request(layer.url, options);
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
            if (getProp(serviceResponse, "serviceItemId")) {
              const id: string = serviceResponse.serviceItemId;
              if (dependencies.indexOf(id) < 0) {
                dependencies.push(id);
              }
              urlHash[layers[i].url] = id;
            }
          });
          resolve({
            dependencies: dependencies,
            urlHash: urlHash
          });
        },
        e => reject(fail(e))
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
      const id: any =
        Object.keys(urlHash).indexOf(layer.url) > -1
          ? urlHash[layer.url]
          : undefined;
      if (id) {
        layer.url = templatizeTerm(id, id, ".layer" + layerId + ".url");
        layer.itemId = templatizeTerm(id, id, ".layer" + layerId + ".itemId");
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
export function postProcessWebMapFieldReferences(
  solutionTemplate: IItemTemplate,
  datasourceInfos: IDatasourceInfo[]
): IItemTemplate {
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
  solutionTemplate: IItemTemplate,
  datasourceInfos: IDatasourceInfo[],
  path: string
): void {
  const objs: any[] = getProp(solutionTemplate, path);
  if (objs) {
    setProp(solutionTemplate, path, _templatize(objs, datasourceInfos));
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
  datasourceInfos: IDatasourceInfo[]
): any[] {
  objs.forEach(obj => {
    const ds: IDatasourceInfo = _getDatasourceInfo(obj, datasourceInfos);
    if (ds) {
      const fieldNames: string[] = ds.fields.map(f => f.name);

      _templatizePopupInfo(obj, ds, ds.basePath, ds.itemId, fieldNames);

      _templatizeDefinitionEditor(obj, ds.basePath, fieldNames);

      if (obj.layerDefinition) {
        _templatizeDrawingInfo(obj.layerDefinition, ds.basePath, fieldNames);

        _templatizeDefinitionExpression(
          obj.layerDefinition,
          ds.basePath,
          fieldNames
        );
      }

      // used for applicationProperties search layers
      const fieldName: any = getProp(obj, "field.name");
      if (fieldName) {
        setProp(
          obj,
          "field.name",
          _templatizeFieldName(fieldName, obj, ds.itemId, ds.basePath)
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
  datasourceInfos: IDatasourceInfo[]
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
