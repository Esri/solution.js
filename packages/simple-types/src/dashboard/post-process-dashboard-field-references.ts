/** @license
 * Copyright 2020 Esri
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
  IDatasourceInfo,
  setProp,
  IItemTemplate,
  cleanLayerBasedItemId,
  cleanLayerId,
  templatizeFieldReferences
} from "@esri/solution-common";
import { getProp } from "@esri/hub-common";
import { IDashboardDataset } from "../interfaces";

/**
 * Templatize field references for datasources and widgets.
 *
 * @param solutionTemplate The solution item template
 * @param datasourceInfos A list of datasource info objects that contain key values to templatize field references
 * @returns The solutionTemplate with templatized field references
 */
export function postProcessDashboardFieldReferences(
  solutionTemplate: IItemTemplate,
  datasourceInfos: IDatasourceInfo[]
): IItemTemplate {
  const updatePaths: string[] = [
    "data.widgets",
    "data.headerPanel.selectors",
    "data.leftPanel.selectors",
    "data.urlParameters"
  ];

  // dashboards reference datasets from other widgets
  // add reference IDs to the appropriate datasourceInfos
  updatePaths.forEach(path => {
    const objs: any = getProp(solutionTemplate, path);
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
 * @private
 */
export function _updateDatasourceReferences(
  objs: any,
  datasourceInfos: IDatasourceInfo[]
) {
  // objects can be events or widgets
  /* istanbul ignore else */
  if (objs && Array.isArray(objs)) {
    objs.forEach(obj => {
      if (Array.isArray(obj.datasets)) {
        obj.datasets.forEach((dataset: IDashboardDataset) => {
          // when the datasource has an itemId it's an external datasource
          const itemId: string = cleanLayerBasedItemId(
            getProp(dataset, "dataSource.itemId")
          );
          if (itemId) {
            const layerId: number = cleanLayerId(
              getProp(dataset, "dataSource.layerId")
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
            const id: any = getProp(dataset, "dataSource.id");
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
 * @private
 */
export function _templatize(
  itemTemplate: IItemTemplate,
  path: string,
  datasourceInfos: IDatasourceInfo[]
) {
  const obj: any[] = getProp(itemTemplate, path);
  /* istanbul ignore else */
  if (obj) {
    setProp(itemTemplate, path, _templatizeByDatasource(obj, datasourceInfos));
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
  datasourceInfos: IDatasourceInfo[]
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
                  const fields: any[] = getProp(datasourceInfo, "fields");
                  const basePath: string = getProp(datasourceInfo, "basePath");
                  /* istanbul ignore else */
                  if (Array.isArray(fields) && basePath) {
                    _action.fieldMap = _action.fieldMap.map((m: any) => {
                      const _m: any = m;
                      _m.targetName = templatizeFieldReferences(
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
              const fields: any[] = getProp(datasourceInfo, "fields");
              const basePath: string = getProp(datasourceInfo, "basePath");
              /* istanbul ignore else */
              if (Array.isArray(fields) && basePath) {
                _obj = templatizeFieldReferences(_obj, fields, basePath);
                _dataset = templatizeFieldReferences(
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
 * Verifies if the datasource info contains the given id and adds it if not
 *
 * @param ds The datasource info to add the reference to
 * @param id The id from dashboard object, commonly another widget
 * @protected
 */
export function _updateReferences(ds: IDatasourceInfo, id: string): void {
  ds.references = Array.isArray(ds.references) ? ds.references : [];
  if (ds.references.indexOf(id) < 0) {
    ds.references.push(id);
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
  datasourceInfos: IDatasourceInfo[]
): any {
  let info: any;
  // the datasource will have an id property when it's referencing a map layer
  // the fields collection will already be defined
  const id: string = getProp(obj, "dataSource.id") || getProp(obj, "targetId");
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
    const itemId: any = cleanLayerBasedItemId(
      getProp(obj, "dataSource.itemId")
    );
    const layerId: any = cleanLayerId(getProp(obj, "dataSource.layerId"));
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
