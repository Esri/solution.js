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
 * @param template The template that for the velocity item
 *
 * @return a list of dependency ids
 */
export function getVelocityDependencies(template: IItemTemplate): string[] {
  const dependencies: string[] = [];

  // get dependencies from data sources
  _getDatasourceDependencies(
    getProp(template, "data.source") ? [template.data.source] : [],
    dependencies
  );
  _getDatasourceDependencies(
    getProp(template, "data.sources") ? template.data.sources : [],
    dependencies
  );

  // get dependencies from feeds
  _getFeedDependencies(
    getProp(template, "data.feed") ? [template.data.feed] : [],
    dependencies
  );
  _getFeedDependencies(
    getProp(template, "data.feeds") ? template.data.feeds : [],
    dependencies
  );

  return dependencies;
}

/**
 * Get the dependencies from the velocity data sources
 * This function will update the input dependencies argument
 *
 * @param dataSources The data sources listed in the velocity template
 * @param dependencies The current dependency list
 */
export function _getDatasourceDependencies(
  dataSources: any[],
  dependencies: string[]
): void {
  dataSources.reduce((prev: any, cur: any) => {
    const id: string = cur.properties
      ? cur.properties["feature-layer.portalItemId"]
      : undefined;
    if (id && prev.indexOf(id) < 0) {
      prev.push(id);
    }
    return prev;
  }, dependencies);
}

/**
 * Get the dependencies from the velocity feeds
 * This function will update the input dependencies argument
 *
 * @param feeds The list of feeds from the velocity template
 * @param dependencies The current list of dependencies
 */
export function _getFeedDependencies(
  feeds: any[],
  dependencies: string[]
): void {
  feeds.reduce((prev: any, cur: any) => {
    const id: string = cur.id || undefined;
    /* istanbul ignore else */
    if (id && prev.indexOf(id) < 0) {
      prev.push(id);
    }
    return prev;
  }, dependencies);
}
