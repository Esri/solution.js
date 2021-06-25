/** @license
 * Copyright 2021 Esri
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

import { IItemTemplate, getProp } from "@esri/solution-common";

/**
 * Get the dependencies from the velocity data sources and feeds
 *
 * @param template IItemTemplate
 */
export function getVelocityDependencies(template: IItemTemplate): any[] {
  return [].concat(
    _getDatasourceDependencies(template),
    _getFeedDependencies(template)
  );
}

/**
 * Get the dependencies from the velocity data sources
 *
 * @param template IItemTemplate
 */
export function _getDatasourceDependencies(template: IItemTemplate): any[] {
  const dataSources = getProp(template, "data.sources") || [];
  return dataSources.reduce((prev: any, cur: any) => {
    const id: string = cur.properties
      ? cur.properties["feature-layer.portalItemId"]
      : undefined;
    if (id && prev.indexOf(id) < 0) {
      prev.push(id);
    }
    return prev;
  }, []);
}

/**
 * Get the dependencies from the velocity feeds
 *
 * @param template IItemTemplate
 */
export function _getFeedDependencies(template: IItemTemplate): any[] {
  const feeds = getProp(template, "data.feeds") || [];
  return feeds.reduce((prev: any, cur: any) => {
    const id: string = cur.id || undefined;
    if (id && prev.indexOf(id) < 0) {
      prev.push(id);
    }
    return prev;
  }, []);
}
