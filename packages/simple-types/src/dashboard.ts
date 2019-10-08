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

import * as auth from "@esri/arcgis-rest-auth";
import * as request from "@esri/arcgis-rest-request";
import * as common from "@esri/solution-common";

/**
 * The relevant elements of a Dashboard widget.
 * @protected
 */
interface IDashboardWidget {
  /**
   * AGOL item id for some widget types
   */
  itemId: string;
  /**
   * Dashboard widget type
   */
  type: string;
  /**
   * Dashboard widget datasets if any
   * These can be relative references to layers in map a map widget or external datasources
   */
  datasets?: IDashboardDataset[];
}

/**
 * The relevant elements of a data source that are used for templatization
 * @protected
 */
interface IDashboardDatasourceInfo {
  /**
   * Calculated pattern used for templatization eg. "{{itemId.fields.layerId.fieldname}}"
   */
  basePath: string;
  /**
   * This is a property we are adding...may not stick around
   */
  type: string;
  /**
   * The portal item id eg. "4efe5f693de34620934787ead6693f19"
   */
  itemId: string;
  /**
   * The id for the layer from the service eg. "0"
   */

  layerId: number;
  /**
   * The webmap layer id eg. "TestLayerForDashBoardMap_632"
   */
  id?: string;
  /**
   * The url used for fields lookup
   */
  url: string; //
  /**
   * The fields this datasource contains
   */
  fields: any[];
  /**
   * The ids of objects that reference a datasource.
   * In some cases a field reference will come from a datset referenced in another widget.
   */
  references: string[];
}

/**
 * The relevant elements of a dashboards dataset
 * @protected
 */
interface IDashboardDataset {
  /**
   * These can be relative references to layers in map a map widget or external datasources
   */
  dataSource: IDashboardDatasource;
  /**
   * Dashboard dataset type...we are only concerend with service datasets
   */
  type: string;
}

/**
 * The relevant datasource properties that describe a dataset
 * @protected
 */
interface IDashboardDatasource {
  /**
   * When it's an external datasource it will contain the portal itemId
   * as well as the individual layerId
   */
  itemId?: string;
  layerId?: number;
  /**
   * When it's a datasource from a map widget it will contain a reltive path
   * DashboardMapId#OperationalLayerId
   * For example: b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632
   */
  id?: string;
}

/**
 * Extract all item dependencies and templatize field references
 * @public
 */
export function convertItemToTemplate(
  itemTemplate: common.IItemTemplate,
  authentication: auth.UserSession
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>((resolve, reject) => {
    _extractDependencies(itemTemplate, authentication).then(
      results => {
        resolve(_templatize(results.itemTemplate, results.datasourceInfos));
      },
      e => reject(common.fail(e))
    );
  });
}

/**
 * Gets the dependencies and data for all widgets
 * ..allows us to understand relative dashboard references and external datasource references
 * ..also allows us to get the fieldnames for each of the layers fields
 * @protected
 */
export function _extractDependencies(
  itemTemplate: common.IItemTemplate,
  authentication: auth.UserSession
) {
  return new Promise<any>((resolve, reject) => {
    // Object containing any map and or data source promises that will fetch field information.
    // As well as the currently known data source info
    const promises: any = _getItemPromises(itemTemplate, authentication, []);

    // get info for all map layer datasources
    // tslint:disable-next-line: no-floating-promises
    _getMapDatasources(promises.mapPromises, promises.datasourceInfos).then(
      datasourceInfos => {
        // get info for all external datasources
        _getExternalDatasources(
          promises.datasourcePromises,
          datasourceInfos,
          authentication
        ).then(
          updates => {
            resolve({
              itemTemplate,
              datasourceInfos: updates
            });
          },
          e => reject(common.fail(e))
        );
      }
    );
  });
}

/**
 * get datasource info for all map datasources
 * @protected
 */
export function _getMapDatasources(
  mapPromises: any[],
  datasourceInfos: IDashboardDatasourceInfo[]
) {
  // get data for all maps referenced
  // this will always resolve...will return null when no data
  return new Promise<any>(resolve => {
    // tslint:disable-next-line: no-floating-promises
    Promise.all(mapPromises).then(results => {
      if (Array.isArray(results)) {
        results.forEach(mapData => {
          if (mapData) {
            datasourceInfos = _getDatasourcesFromMap(mapData, datasourceInfos);
          }
        });
      }
      resolve(datasourceInfos);
    });
  });
}

/**
 * get datasource info for all external datasources
 * @protected
 */
export function _getExternalDatasources(
  datasourcePromises: any[],
  datasourceInfos: IDashboardDatasourceInfo[],
  authentication: auth.UserSession
) {
  return new Promise<any>((resolve, reject) => {
    Promise.all(datasourcePromises).then(
      _results => {
        _results.forEach((item: any) => {
          if (item && item.url) {
            // update url for external datasorceInfo items
            datasourceInfos.forEach(ds => {
              if (ds.itemId === item.id) {
                ds.url = item.url + "/" + ds.layerId;
              }
            });
          }
        });
        _updateDatasourceInfoFields(datasourceInfos, authentication).then(
          updates => resolve(updates),
          e => reject(common.fail(e))
        );
      },
      e => reject(common.fail(e))
    );
  });
}

/**
 * loop through the datasets of widgets, panels, and urlParameters to gather field collections
 * for any referenced datasets
 * @protected
 */
export function _getItemPromises(
  itemTemplate: common.IItemTemplate,
  authentication: auth.UserSession,
  datasourceInfos: IDashboardDatasourceInfo[]
): any {
  let datasourcePromises: any[] = [Promise.resolve(null)];
  let mapPromises: any[] = [Promise.resolve(null)];

  // handle widgets
  const widgetPromises: any = _getWidgetPromises(
    itemTemplate,
    authentication,
    datasourceInfos
  );
  mapPromises = mapPromises.concat(widgetPromises.mapPromises);
  datasourcePromises = datasourcePromises.concat(
    widgetPromises.datasourcePromises
  );

  // handle panels
  const headerPromises: any = _getPromises(
    itemTemplate,
    authentication,
    datasourceInfos,
    common.getProp(itemTemplate, "data.headerPanel.selectors")
  );
  datasourcePromises = datasourcePromises.concat(
    headerPromises.datasourcePromises
  );

  const leftPanelPromises: any = _getPromises(
    itemTemplate,
    authentication,
    datasourceInfos,
    common.getProp(itemTemplate, "data.leftPanel.selectors")
  );
  datasourcePromises = datasourcePromises.concat(
    leftPanelPromises.datasourcePromises
  );

  // handle urlParameters
  const urlParameterPromises: any = _getPromises(
    itemTemplate,
    authentication,
    datasourceInfos,
    common.getProp(itemTemplate, "data.urlParameters")
  );
  datasourcePromises = datasourcePromises.concat(
    urlParameterPromises.datasourcePromises
  );

  return {
    mapPromises: mapPromises,
    datasourcePromises: datasourcePromises,
    datasourceInfos: datasourceInfos
  };
}

/**
 * loop through all widgets and find dataset datasources
 * add map itemId to the items dependency list
 * @protected
 */
export function _getWidgetPromises(
  itemTemplate: common.IItemTemplate,
  authentication: auth.UserSession,
  datasourceInfos: IDashboardDatasourceInfo[]
): any {
  let datasourcePromises: any[] = [];
  const mapPromises: any[] = [];
  const widgets: IDashboardWidget[] = common.getProp(
    itemTemplate,
    "data.widgets"
  );
  if (itemTemplate.data && Array.isArray(widgets)) {
    widgets.forEach((widget: IDashboardWidget) => {
      if (widget.type === "mapWidget") {
        if (itemTemplate.dependencies.indexOf(widget.itemId) < 0) {
          // get map data so we can understand the relative path layer references
          mapPromises.push(common.getItemData(widget.itemId, authentication));
          itemTemplate.dependencies.push(widget.itemId);
        }
        widget.itemId = common.templatizeToLowerCase(widget.itemId, "id");
      }
      if (Array.isArray(widget.datasets)) {
        datasourcePromises = datasourcePromises.concat(
          _getDatasourcePromises(
            widget,
            itemTemplate,
            datasourceInfos,
            authentication
          )
        );
      }
    });
  }
  return {
    mapPromises,
    datasourcePromises
  };
}

/**
 * used for datasets referenced in panel selectors and urlParameters
 * @protected
 */
export function _getPromises(
  itemTemplate: common.IItemTemplate,
  authentication: auth.UserSession,
  datasourceInfos: IDashboardDatasourceInfo[],
  objs: any[]
): any {
  let datasourcePromises: any[] = [];
  if (objs && Array.isArray(objs)) {
    objs.forEach(obj => {
      if (Array.isArray(obj.datasets)) {
        datasourcePromises = datasourcePromises.concat(
          _getDatasourcePromises(
            obj,
            itemTemplate,
            datasourceInfos,
            authentication
          )
        );
      }
    });
    return {
      datasourcePromises
    };
  }
}

/**
 * loop through all the datsets datasources for a widget, selector, or urlParameter and look for external
 * datasource references
 * @protected
 */
export function _getDatasourcePromises(
  obj: any,
  itemTemplate: common.IItemTemplate,
  datasourceInfos: IDashboardDatasourceInfo[],
  authentication: auth.UserSession
): any[] {
  const datasourcePromises: any[] = [];
  obj.datasets.forEach((dataset: IDashboardDataset) => {
    // when the datasource has an itemId is an external datasource
    const itemId: string = common.getProp(dataset, "dataSource.itemId");
    if (itemId) {
      if (itemTemplate.dependencies.indexOf(itemId) < 0) {
        itemTemplate.dependencies.push(itemId);
      }
      dataset.dataSource.itemId = common.templatizeToLowerCase(itemId, "id");

      const layerId: number = common.getProp(dataset, "dataSource.layerId");
      const hasItem: boolean = datasourceInfos.some(ds => {
        return ds.itemId === itemId;
      });
      let datasource: any;
      const hasDatasource: boolean = datasourceInfos.some(ds => {
        datasource = ds;
        return hasItem && ds.layerId === layerId;
      });
      // if we don't have the datasource placeholder yet add it to datasourceInfos
      if (!hasDatasource) {
        // add the base datasourceInfo url and fields will be completed when possible
        datasourceInfos.push({
          type: "externalDataset",
          layerId: layerId,
          itemId: itemId,
          basePath: itemId + ".layer" + layerId + ".fields",
          url: "",
          fields: [],
          references: [obj.id]
        });
        // if this is a new entry to datasouceInfos and we do not already have a promise
        // established to query for the url and fields add a new promise to fetch the necessary details
        if (!hasItem) {
          datasourcePromises.push(common.getItem(itemId, authentication));
        }
      } else {
        if (datasource.references.indexOf(obj.id) < 0) {
          datasource.references.push(obj.id);
        }
      }
    } else {
      // add placeholder for map layer datasource info so we can know the items that reference them
      // needed when item field reference are derived from another widgets datasource eg. <dashboardWidgetId>#datasetname
      const id: any = common.getProp(dataset, "dataSource.id");
      if (id) {
        const dashboardLayerId: string = id.split("#")[1];
        // verify that the datasource placeholder is not there already
        let datasource: any;
        const hasDatasource: boolean = datasourceInfos.some(ds => {
          datasource = ds;
          return ds.id === dashboardLayerId;
        });
        if (!hasDatasource) {
          datasourceInfos.push({
            type: "mapDataset",
            id: dashboardLayerId,
            layerId: NaN,
            itemId: "",
            basePath: "",
            url: "",
            fields: [],
            references: [obj.id]
          });
        } else {
          if (datasource.references.indexOf(obj.id) < 0) {
            datasource.references.push(obj.id);
          }
        }
      }
    }
  });
  return datasourcePromises;
}

/**
 * fetch the fields collection for each datasource found
 * @protected
 */
export function _updateDatasourceInfoFields(
  datasourceInfos: IDashboardDatasourceInfo[],
  authentication: auth.UserSession
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    // get the item data for the layers referenced in the webmap and external data
    const layerPromises: any[] = [];
    datasourceInfos.forEach(datasourceInfo => {
      if (datasourceInfo.url) {
        layerPromises.push(
          request.request(datasourceInfo.url + "?f=json", {
            authentication: authentication
          })
        );
      }
    });

    // get the fields for each layer referenced
    Promise.all(layerPromises).then(
      layerResults => {
        // get the fields for each layer
        layerResults.forEach(layer => {
          datasourceInfos.some(datasourceInfo => {
            if (
              layer.serviceItemId === datasourceInfo.itemId &&
              layer.id === datasourceInfo.layerId
            ) {
              datasourceInfo.fields = layer.fields;
            }
            return (
              layer.serviceItemId === datasourceInfo.itemId &&
              layer.id === datasourceInfo.layerId
            );
          });
        });

        resolve(datasourceInfos);
      },
      e => reject(common.fail(e))
    );
  });
}

/**
 * loop through the fetched map data and if we don't already have each operational layer
 * added to datasourceInfos...add the placeholder
 * @protected
 */
export function _getDatasourcesFromMap(
  mapData: any,
  datasourceInfos: IDashboardDatasourceInfo[]
): any {
  if (mapData && Array.isArray(mapData.operationalLayers)) {
    mapData.operationalLayers.forEach((layer: any) => {
      // only add if the itemId and layerId are unique
      if (!_hasDatasourceInfo(datasourceInfos, layer)) {
        const layerId: number = parseInt(
          String(layer.url).substring(layer.url.lastIndexOf("/") + 1),
          10
        );

        // get the placeholder...it will contain the type, id and fields placeholder
        let datasourceInfo: any;
        datasourceInfos.some(datasource => {
          if (layer.id === datasource.id) {
            datasourceInfo = datasource;
          }
          return layer.id === datasource.id;
        });
        if (datasourceInfo) {
          datasourceInfo = Object.assign(datasourceInfo, {
            layerId: layerId,
            itemId: layer.itemId,
            basePath: layer.itemId + ".layer" + layerId + ".fields",
            url: layer.url
          });
        }
      }
    });
  }
  return datasourceInfos;
}

/**
 * test if the itemId and layerId already exist in the collection
 * @protected
 */
export function _hasDatasourceInfo(
  datasourceInfos: IDashboardDatasourceInfo[],
  layer: any
): boolean {
  return datasourceInfos.some(di => {
    const hasProps: boolean =
      di.itemId &&
      layer.itemId &&
      di.hasOwnProperty("layerId") &&
      layer.hasOwnProperty("layerId");
    return (
      hasProps && (di.itemId === layer.itemId && di.layerId === layer.layerId)
    );
  });
}

/**
 * now that we know the the path and fields for each datasource
 * tempatize all field references
 * @protected
 */
export function _templatize(
  itemTemplate: common.IItemTemplate,
  datasourceInfos: IDashboardDatasourceInfo[]
): common.IItemTemplate {
  // widgets
  const widgets: IDashboardWidget[] = common.getProp(
    itemTemplate,
    "data.widgets"
  );
  if (widgets) {
    itemTemplate.data.widgets = _templatizeByDatasource(
      widgets,
      datasourceInfos
    );
  }

  // headerPanel
  const headerSelectors: IDashboardWidget[] = common.getProp(
    itemTemplate,
    "data.headerPanel.selectors"
  );
  if (headerSelectors) {
    itemTemplate.data.headerPanel.selectors = _templatizeByDatasource(
      headerSelectors,
      datasourceInfos
    );
  }

  // leftPanel
  const leftSelectors: IDashboardWidget[] = common.getProp(
    itemTemplate,
    "data.leftPanel.selectors"
  );
  if (leftSelectors) {
    itemTemplate.data.leftPanel.selectors = _templatizeByDatasource(
      leftSelectors,
      datasourceInfos
    );
  }

  // urlParameters
  const urlParameters: IDashboardWidget[] = common.getProp(
    itemTemplate,
    "data.urlParameters"
  );
  if (urlParameters) {
    itemTemplate.data.urlParameters = _templatizeByDatasource(
      urlParameters,
      datasourceInfos
    );
  }

  return itemTemplate;
}

/**
 * for any service dataset datasource templatize all field references
 * @protected
 */
export function _templatizeByDatasource(
  objs: any[],
  datasourceInfos: IDashboardDatasourceInfo[]
): any {
  return objs.map(obj => {
    let _obj: any = obj;
    if (Array.isArray(_obj.events)) {
      // Events can be associated with datasets but they can also be associated with a target
      // In some cases an event will have a source and a target.
      // Handle these specifically first to ensure that it has the correct layer reference
      _obj.events = _obj.events.map((event: any) => {
        const _event: any = event;
        if (Array.isArray(_event.actions)) {
          _event.actions = _event.actions.map((action: any) => {
            const _action: any = action;
            if (
              _action.fieldMap &&
              _action.targetId &&
              _action.targetId.indexOf("#") > -1
            ) {
              const datasourceInfo = _getDatasourceInfo(
                _action,
                datasourceInfos
              );
              if (datasourceInfo) {
                const fields: any[] = common.getProp(datasourceInfo, "fields");
                const basePath: string = common.getProp(
                  datasourceInfo,
                  "basePath"
                );
                if (Array.isArray(fields) && basePath) {
                  _action.fieldMap = _action.fieldMap.map((m: any) => {
                    const _m: any = m;
                    _m.targetName = common.templatizeFieldReferences(
                      _m.targetName,
                      fields,
                      basePath
                    );
                    return _m;
                  });
                }
              }
            }
            return _action;
          });
        }
        return _event;
      });
    }
    if (Array.isArray(_obj.datasets)) {
      _obj.datasets = _obj.datasets.map((dataset: any) => {
        let _dataset: any = dataset;
        if (_dataset.type === "serviceDataset") {
          const datasourceInfo = _getDatasourceInfo(dataset, datasourceInfos);
          if (datasourceInfo) {
            const fields: any[] = common.getProp(datasourceInfo, "fields");
            const basePath: string = common.getProp(datasourceInfo, "basePath");
            if (Array.isArray(fields) && basePath) {
              _obj = common.templatizeFieldReferences(_obj, fields, basePath);
              _dataset = common.templatizeFieldReferences(
                _dataset,
                fields,
                basePath
              );
            }
          }
        }
        return _dataset;
      });
      return _obj;
    } else return _obj;
  });
}

/**
 * obj can be a Dataset or an event
 * find the appropriate datasource info object from the datasourceInfo collection
 * @protected
 */
export function _getDatasourceInfo(
  obj: any,
  datasourceInfos: IDashboardDatasourceInfo[]
): any {
  let info: any;
  // the datasource will have an id property when it's referencing a map layer
  // the fields collection will already be defined
  const id: string =
    common.getProp(obj, "dataSource.id") || common.getProp(obj, "targetId");
  if (id) {
    const dashboardLayerId: string = id.split("#")[1];
    if (
      !datasourceInfos.some(di => {
        info = dashboardLayerId === di.id ? di : info;
        return dashboardLayerId === di.id;
      })
    ) {
      // in some cases the id will not contain a layer name...it will have the dashboard id for another widget
      // in that case lookup the datasource from referenced widget
      const dashboardWidgetId: string = id.split("#")[0];
      datasourceInfos.some(di => {
        const hasRef: boolean = di.references.indexOf(dashboardWidgetId) > -1;
        info = hasRef ? di : info;
        return hasRef;
      });
    }
  } else {
    // otherwise match the itemId and the layerId to get the correct fields and path
    const itemId: any = common.cleanId(
      common.getProp(obj, "dataSource.itemId")
    );
    const layerId: any = common.getProp(obj, "dataSource.layerId");
    if (itemId) {
      datasourceInfos.some(di => {
        const matches: boolean = itemId === di.itemId && layerId === di.layerId;
        info = matches ? di : info;
        return matches;
      });
    }
  }
  return info;
}
