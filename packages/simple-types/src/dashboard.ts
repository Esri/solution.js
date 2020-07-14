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
  layerId?: any;
  /**
   * When it's a datasource from a map widget it will contain a reltive path
   * DashboardMapId#OperationalLayerId
   * For example: b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632
   */
  id?: string;
}

/**
 * Converts a dashboard item to a template.
 *
 * @param itemTemplate Template for the dashboard item
 * @param authentication Credentials for any requests
 * @return templatized itemTemplate
 */
export function convertItemToTemplate(
  itemTemplate: common.IItemTemplate,
  authentication: common.UserSession
): common.IItemTemplate {
  return _extractDependencies(itemTemplate);
}

/**
 * Templatizes all itemIds and updates the dependency array
 *
 * @param itemTemplate Template for the dashboard item
 * @return The updated itemTemplate
 * @protected
 */
export function _extractDependencies(
  itemTemplate: common.IItemTemplate
): common.IItemTemplate {
  // get dependencies from any
  const updatePaths: string[] = [
    "data.widgets",
    "data.headerPanel.selectors",
    "data.leftPanel.selectors",
    "data.urlParameters"
  ];

  updatePaths.forEach(path => {
    const objs: IDashboardWidget[] = common.getProp(itemTemplate, path);
    if (Array.isArray(objs)) {
      objs.forEach(obj => {
        /* istanbul ignore else */
        if (obj.type === "mapWidget") {
          /* istanbul ignore else */
          if (itemTemplate.dependencies.indexOf(obj.itemId) < 0) {
            itemTemplate.dependencies.push(obj.itemId);
          }
          obj.itemId = common.templatizeTerm(obj.itemId, obj.itemId, ".itemId");
        }
        /* istanbul ignore else */
        if (Array.isArray(obj.datasets)) {
          _getDatasourceDependencies(obj, itemTemplate);
        }
      });
    }
  });

  return itemTemplate;
}

/**
 * Templatize datasource itemIds and update the dependency array
 *
 * @param obj A widget, selector, or urlParameter that contains a datasets collection
 * @param itemTemplate Template for the dashboard item
 */
export function _getDatasourceDependencies(
  obj: any,
  itemTemplate: common.IItemTemplate
): void {
  obj.datasets.forEach((dataset: IDashboardDataset) => {
    // when the datasource has an itemId is an external datasource
    const itemId: string = common.getProp(dataset, "dataSource.itemId");
    if (itemId) {
      if (itemTemplate.dependencies.indexOf(itemId) < 0) {
        itemTemplate.dependencies.push(itemId);
      }
      const layerId: number = common.getProp(dataset, "dataSource.layerId");
      dataset.dataSource.itemId = common.templatizeTerm(
        itemId,
        itemId,
        layerId !== undefined ? ".layer" + layerId + ".itemId" : ".itemId"
      );
      /* istanbul ignore else */
      if (layerId !== undefined) {
        dataset.dataSource.layerId = common.templatizeTerm(
          itemId,
          itemId,
          ".layer" + layerId + ".layerId"
        );
      }
    }
  });
}

/**
 * Templatize field references for datasources and widgets.
 *
 * @param solutionTemplate The solution item template
 * @param datasourceInfos A list of datasource info objects that contain key values to templatize field references
 * @returns The solutionTemplate with templatized field references
 */
export function postProcessFieldReferences(
  solutionTemplate: common.IItemTemplate,
  datasourceInfos: common.IDatasourceInfo[]
): common.IItemTemplate {
  const updatePaths: string[] = [
    "data.widgets",
    "data.headerPanel.selectors",
    "data.leftPanel.selectors",
    "data.urlParameters"
  ];

  // dashboards reference datasets from other widgets
  // add reference IDs to the appropriate datasourceInfos
  updatePaths.forEach(path => {
    const objs: any = common.getProp(solutionTemplate, path);
    _updateDatasourceReferences(objs, datasourceInfos);
  });

  // after we know the potential references go ahead and templatize
  updatePaths.forEach(path => {
    _templatize(solutionTemplate, path, datasourceInfos);
  });

  return solutionTemplate;
}

/**
 * Add all dataset ids to the appropriate datasource info object so we can navigate any relative references
 *
 * @param objs Thes can be widgets, selectors, or urlParameters
 * @param datasourceInfos A list of objects that contain key details about the datasources from the application
 * @protected
 */
export function _updateDatasourceReferences(
  objs: any,
  datasourceInfos: common.IDatasourceInfo[]
) {
  // objects can be events or widgets
  /* istanbul ignore else */
  if (objs && Array.isArray(objs)) {
    objs.forEach(obj => {
      if (Array.isArray(obj.datasets)) {
        obj.datasets.forEach((dataset: IDashboardDataset) => {
          // when the datasource has an itemId it's an external datasource
          const itemId: string = common.cleanLayerBasedItemId(
            common.getProp(dataset, "dataSource.itemId")
          );
          if (itemId) {
            const layerId: number = common.cleanLayerId(
              common.getProp(dataset, "dataSource.layerId")
            );
            datasourceInfos.some(ds => {
              if (ds.itemId === itemId && ds.layerId === layerId) {
                _updateReferences(ds, obj.id);
                return true;
              } else {
                return false;
              }
            });
          } else {
            // add placeholder for map layer datasource info so we can know the items that reference them
            // needed when item field reference are derived from another widgets datasource eg. <dashboardWidgetId>#datasetname
            const id: any = common.getProp(dataset, "dataSource.id");
            if (id) {
              const dashboardLayerId: string = id.split("#")[1];
              datasourceInfos.some(ds => {
                if (ds.ids.indexOf(dashboardLayerId) > -1) {
                  _updateReferences(ds, obj.id);
                  return true;
                } else {
                  return false;
                }
              });
            }
          }
        });
      }
    });
  }
}

/**
 * Templatize all datasets and/or events for the objects at the given path
 *
 * @param itemTemplate Template for the dashboard item
 * @param path A property path to an array of objects that could contain datasets or events
 * @param datasourceInfos A list of objects that contain key details about the datasources from the application
 * @protected
 */
export function _templatize(
  itemTemplate: common.IItemTemplate,
  path: string,
  datasourceInfos: common.IDatasourceInfo[]
) {
  const obj: any[] = common.getProp(itemTemplate, path);
  /* istanbul ignore else */
  if (obj) {
    common.setProp(
      itemTemplate,
      path,
      _templatizeByDatasource(obj, datasourceInfos)
    );
  }
}

/**
 * For any service dataset datasource templatize all field references
 *
 * @param objs A list of objects that can contain field references
 * @param datasourceInfos A list of objects that contain key details about the datasources from the application
 * @return An updated list of objects with templatized field references
 * @protected
 */
export function _templatizeByDatasource(
  objs: any[],
  datasourceInfos: common.IDatasourceInfo[]
): any {
  if (Array.isArray(objs)) {
    return objs.map(obj => {
      let _obj: any = obj;
      if (Array.isArray(_obj.events)) {
        // Events can be associated with datasets but they can also be associated with a target
        // In some cases an event will have a source and a target.
        // Handle these specifically first to ensure that it has the correct layer reference
        _obj.events = _obj.events.map((event: any) => {
          const _event: any = event;
          /* istanbul ignore else */
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
                /* istanbul ignore else */
                if (datasourceInfo) {
                  const fields: any[] = common.getProp(
                    datasourceInfo,
                    "fields"
                  );
                  const basePath: string = common.getProp(
                    datasourceInfo,
                    "basePath"
                  );
                  /* istanbul ignore else */
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
            /* istanbul ignore else */
            if (datasourceInfo) {
              const fields: any[] = common.getProp(datasourceInfo, "fields");
              const basePath: string = common.getProp(
                datasourceInfo,
                "basePath"
              );
              /* istanbul ignore else */
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
  } else {
    return objs;
  }
}

/**
 * Find the appropriate datasource info object from the datasourceInfo collection
 *
 * @param obj Can be a Dataset or an event
 * @param datasourceInfos A list of objects that contain key details about the datasources from the application
 * @return The supporting datasource info for the given object
 * @protected
 */
export function _getDatasourceInfo(
  obj: any,
  datasourceInfos: common.IDatasourceInfo[]
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
        info = di.ids.indexOf(dashboardLayerId) > -1 ? di : info;
        return di.ids.indexOf(dashboardLayerId) > -1;
      })
    ) {
      // in some cases the id will not contain a layer name...it will have the dashboard id for another widget
      // in that case lookup the datasource from referenced widget
      const dashboardWidgetId: string = id.split("#")[0];
      datasourceInfos.some(di => {
        const references: string[] = di.references || [];
        const hasRef: boolean = references.indexOf(dashboardWidgetId) > -1;
        info = hasRef ? di : info;
        return hasRef;
      });
    }
  } else {
    // otherwise match the itemId and the layerId to get the correct fields and path
    const itemId: any = common.cleanLayerBasedItemId(
      common.getProp(obj, "dataSource.itemId")
    );
    const layerId: any = common.cleanLayerId(
      common.getProp(obj, "dataSource.layerId")
    );
    /* istanbul ignore else */
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

/**
 * Verifies if the datasource info contains the given id and adds it if not
 *
 * @param ds The datasource info to add the reference to
 * @param id The id from dashboard object, commonly another widget
 * @protected
 */
export function _updateReferences(
  ds: common.IDatasourceInfo,
  id: string
): void {
  ds.references = Array.isArray(ds.references) ? ds.references : [];
  if (ds.references.indexOf(id) < 0) {
    ds.references.push(id);
  }
}
