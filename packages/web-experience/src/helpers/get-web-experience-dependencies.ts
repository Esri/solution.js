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

import { IModel, getProp, maybePush } from "@esri/hub-common";

/**
 * Given an Web Experience model, extract out all the
 * items it depends on from the `dataSources` hash
 * @param model IModel
 */
export function getWebExperienceDependencies(model: IModel): any[] {
  const dataSources = getProp(model, "data.dataSources") || {};
  return Object.keys(dataSources).reduce((acc, key) => {
    return maybePush(getProp(dataSources, `${key}.itemId`), acc);
  }, []);
}
