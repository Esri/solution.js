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

import * as auth from "@esri/arcgis-rest-auth";

export * from "./generalHelpers";
export * from "./restHelpers";
export * from "./templatization";

// ------------------------------------------------------------------------------------------------------------------ //

export interface IItemTemplate {
  itemId: string,
  type: string,
  key: string,
  dependencies: string[],
  estimatedDeploymentCostFactor: number,
  properties: any,
  item: any,
  data: any,
  resources: any
}

export interface ISolutionItemData {
  metadata: any,
  templates: IItemTemplate[]
}


export interface IItemJson {
  toJSON(argIn: string): string;
  fromJSON(
    template: IItemTemplate,
    templateDictionary: any,
    userSession: auth.UserSession,
    progressTickCallback: () => void
  ): Promise<IItemTemplate>;
}

/**
 * Structure for mapping from item type to module with type-specific template-handling code
 */
export interface IItemTypeModuleMap {
  [itemType: string]: IItemJson;
}
