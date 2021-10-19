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

import {
  getProp,
  getItemBase,
  IItemTemplate,
  UserSession
} from "@esri/solution-common";

/**
 * Get the dependencies from the velocity data sources, feeds, and outputs.
 * Only dependencies that do NOT have the typeKeyword "IoTFeatureLayer" are returned.
 *
 * @param template The template that for the velocity item
 * @param authentication The credentials for any requests
 *
 * @return a list of dependency ids
 */
export function getVelocityDependencies(
  template: IItemTemplate,
  authentication: UserSession
): Promise<string[]> {
  const dependencies: string[] = [];

  _getDependencies(
    getProp(template, "data.sources") ? template.data.sources : [],
    dependencies,
    "feature-layer.portalItemId"
  );

  _getFeedDependencies(
    getProp(template, "data.feeds") ? template.data.feeds : [],
    dependencies
  );

  _getFeedDependencies(
    getProp(template, "data.feed") ? [template.data.feed] : [],
    dependencies
  );

  _getDependencies(
    getProp(template, "data.outputs") ? template.data.outputs : [],
    dependencies,
    "feat-lyr-new.portal.featureServicePortalItemID"
  );

  _getDependencies(
    getProp(template, "data.output") ? [template.data.outputs] : [],
    dependencies,
    "feat-lyr-new.portal.featureServicePortalItemID"
  );

  _getDependencies(
    getProp(template, "data.outputs") ? template.data.outputs : [],
    dependencies,
    "feat-lyr-existing.portalItemId"
  );

  _getDependencies(
    getProp(template, "data.output") ? [template.data.outputs] : [],
    dependencies,
    "feat-lyr-existing.portalItemId"
  );

  return _validateDependencies(dependencies, authentication);
}

/**
 * Any feature services with the typeKeyword "IoTFeatureLayer" should not be templatized or
 * listed as a dependency.
 * We can’t create Velocity feature layers in their spatiotemporal datastore as we have no api.
 *
 * @param dependencies Any dependencies that have been found for this item
 * @param authentication The credentials for any requests
 *
 * @return a list of dependency ids
 */
export function _validateDependencies(
  dependencies: string[],
  authentication: UserSession
): Promise<string[]> {
  const defs: Array<Promise<any>> = dependencies.map(d => {
    return getItemBase(d, authentication);
  });
  return Promise.all(defs).then(itemInfos => {
    return Promise.resolve(
      itemInfos.reduce((prev, cur) => {
        if (cur.typeKeywords.indexOf("IoTFeatureLayer") < 0) {
          prev.push(cur.id);
        }
        return prev;
      }, [])
    );
  });
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

/**
 * Get the dependencies from the velocity outputs or dataSources.
 * This function will update the input dependencies argument
 *
 * @param outputs The list of outputs from the velocity item
 * @param dependencies The current list of dependencies
 * @param prop The individual prop to evaluate
 */
export function _getDependencies(
  outputs: any[],
  dependencies: string[],
  prop: string
): void {
  outputs.reduce((prev: any, cur: any) => {
    const id: string = cur.properties ? cur.properties[prop] : undefined;
    if (id && prev.indexOf(id) < 0) {
      prev.push(id);
    }
    return prev;
  }, dependencies);
}
