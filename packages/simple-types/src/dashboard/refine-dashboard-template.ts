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
import { IItemTemplate, templatizeTerm } from "@esri/solution-common";

import { getProp, getWithDefault } from "@esri/hub-common";

import { IDashboardWidget, IDashboardDataset } from "../interfaces";

/**
 * Templatizes all itemIds and updates the dependency array
 *
 * @param itemTemplate Template for the dashboard item
 * @return The updated itemTemplate
 * @protected
 */
export function refineDashboardTemplate(
  itemTemplate: IItemTemplate
): IItemTemplate {
  // get dependencies from any
  const updatePaths: string[] = [
    "data.widgets",
    "data.headerPanel.selectors",
    "data.leftPanel.selectors",
    "data.urlParameters"
  ];

  updatePaths.forEach(path => {
    const objs: IDashboardWidget[] = getWithDefault(itemTemplate, path, []);
    objs.forEach(obj => {
      /* istanbul ignore else */
      if (obj.type === "mapWidget") {
        /* istanbul ignore else */
        if (itemTemplate.dependencies.indexOf(obj.itemId) < 0) {
          itemTemplate.dependencies.push(obj.itemId);
        }
        obj.itemId = templatizeTerm(obj.itemId, obj.itemId, ".itemId");
      }
      /* istanbul ignore else */
      if (Array.isArray(obj.datasets)) {
        _getDatasourceDependencies(obj, itemTemplate);
      }
    });
  });

  return itemTemplate;
}

/**
 * Templatize datasource itemIds and update the dependency array
 *
 * @param obj A widget, selector, or urlParameter that contains a datasets collection
 * @param itemTemplate Template for the dashboard item
 * @private
 */
export function _getDatasourceDependencies(
  obj: any,
  itemTemplate: IItemTemplate
): void {
  obj.datasets.forEach((dataset: IDashboardDataset) => {
    // when the datasource has an itemId is an external datasource
    const itemId: string = getProp(dataset, "dataSource.itemId");
    if (itemId) {
      if (itemTemplate.dependencies.indexOf(itemId) < 0) {
        itemTemplate.dependencies.push(itemId);
      }
      const layerId: number = getProp(dataset, "dataSource.layerId");
      dataset.dataSource.itemId = templatizeTerm(
        itemId,
        itemId,
        layerId !== undefined ? ".layer" + layerId + ".itemId" : ".itemId"
      );
      /* istanbul ignore else */
      if (layerId !== undefined) {
        dataset.dataSource.layerId = templatizeTerm(
          itemId,
          itemId,
          ".layer" + layerId + ".layerId"
        );
      }
    }
  });
}
