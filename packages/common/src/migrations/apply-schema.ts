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
  ISolutionItem,
  ISolutionItemData,
  UserSession,
  IItemGeneralized,
  IItemTemplate
} from "../interfaces";
import { getProp, cloneObject } from "@esri/hub-common";

/**
 * Apply the initial schema for old Hub Solutions
 *
 * @param model
 * @param authentication
 */
export function _applySchema(
  model: ISolutionItem,
  authentication: UserSession
): ISolutionItem {
  if (getProp(model, "item.properties.schemaVersion") >= 1) {
    return model;
  }

  const clone = cloneObject(model);
  if (!clone.item.properties) {
    clone.item.properties = {};
  }

  // upgrade the schema of the Templates
  const templates = getProp(clone, "data.templates") || [];
  clone.data.templates = templates.map((entry: any) => {
    return {
      key: entry.fieldName || entry.key,
      type: entry.type,
      item: entry.item as IItemGeneralized,
      data: entry.data,
      itemId: entry.itemId || entry.fieldName || entry.key,
      resources: entry.resources || []
    } as IItemTemplate;
  });
  clone.item.properties.schemaVersion = 1;
  return clone;
}
