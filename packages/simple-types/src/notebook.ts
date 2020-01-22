/*
 | Copyright 2020 Esri
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

import * as common from "@esri/solution-common";

//#region Publish Process ---------------------------------------------------------------------------------------//

/**
 * Converts a Python Notebook item to a template.
 *
 * @param itemTemplate template for the Python Notebook
 * @return templatized itemTemplate
 */
export function convertItemToTemplate(
  itemTemplate: common.IItemTemplate
): common.IItemTemplate {
  // Key properties that contain item IDs for the workforce project type
  const keyProperties: string[] = [];

  // The templates data to process
  const data: any = itemTemplate.data;

  if (data) {
    // Extract dependencies
    itemTemplate.dependencies = _extractDependencies(data, keyProperties);

    // templatize key properties
    itemTemplate.data = _templatize(data, keyProperties);
  }

  return itemTemplate;
}

/**
 * Gets the ids of the dependencies of the notebook.
 *
 * @param data itemTemplate data
 * @param keyProperties notebook properties that contain references to dependencies
 * @return List of dependencies ids
 */
export function _extractDependencies(
  data: any,
  keyProperties: string[]
): string[] {
  const deps: string[] = [];
  return deps;
}

/**
 * Templatizes key item properties.
 *
 * @param data itemTemplate data
 * @param keyProperties notebook properties that should be templatized
 * @return an updated data object to be stored in the template
 */
export function _templatize(data: any, keyProperties: string[]): any {
  return data;
}

//#endregion

//#region Deploy Process ---------------------------------------------------------------------------------------//

//#endregion
