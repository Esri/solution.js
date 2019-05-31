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

/**
 * Provides common interfaces.
 */

import * as auth from "@esri/arcgis-rest-auth";
import { IDeployFileCopyPath } from "./resourceHelpers";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * A solution template AGO item
 */
export interface ISolutionItem {
  /**
   * Item base section JSON
   */
  item: any;
  /**
   * Item data section JSON
   */
  data: ISolutionItemData;
}

export interface ISolutionItemData {
  /**
   * General information about the solution template
   */
  metadata: any;
  /**
   * The collection of templates
   */
  templates: IItemTemplate[];
}

export interface IItemTemplate {
  /**
   * Item's AGO id
   */
  itemId: string;
  /**
   * AGO item type name
   */
  type: string;
  /**
   * Fairly unique identifier; set to 'i' + chars 2-8 of a random number in base 36
   */
  key: string;
  /**
   * Item base section JSON
   */
  item: any;
  /**
   * Item data section JSON
   */
  data: any;
  /**
   * References to item resources
   */
  resources: any[];
  /**
   * List of ids of AGO items needed by this item
   */
  dependencies: string[];
  /**
   * Miscellaneous item-specific properties
   */
  properties: any;
  /**
   * Estimated relative cost of deploying this item; corresponds to number of progressCallback
   * function calls made during while deploying it
   */
  estimatedDeploymentCostFactor: number;
}

export interface IItemTemplateConversions {
  convertItemToTemplate(
    itemInfo: any,
    userSession: auth.UserSession
  ): Promise<IItemTemplate>;
  createItemFromTemplate(
    template: IItemTemplate,
    resourceFilePaths: IDeployFileCopyPath[],
    storageUserSession: auth.UserSession,
    templateDictionary: any,
    destinationUserSession: auth.UserSession,
    progressTickCallback: () => void
  ): Promise<string>;
}

/**
 * Structure for mapping from item type to module with type-specific template-handling code
 */
export interface IItemTypeModuleMap {
  [itemType: string]: IItemTemplateConversions;
}

/**
 * Creates an empty template.
 *
 * @param id AGO id of item
 * @param type AGO item type; defaults to ""
 * @return Empty template containing supplied id, optional type, and a key created using the function createId()
 */
export function createPlaceholderTemplate(
  id: string,
  type = ""
): IItemTemplate {
  return {
    itemId: id,
    type,
    key: createId(),
    item: {
      id
    },
    data: {},
    resources: [],
    dependencies: [],
    properties: {},
    estimatedDeploymentCostFactor: 0
  };
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Return a random number, prefixed with a string. Used for unique identifiers that do not require
 * the rigor of a full UUID - i.e. node id's, process ids, etc.
 * @param prefix String to prefix the random number with so the result is a valid javascript property
 * @return 9-character string usable as a dotable property name
 * @protected
 */
function createId(prefix: string = "i"): string {
  // prepend some char so it's always a valid dotable property name
  // get a random number, convert to base 36 representation, then grab chars 2-8
  return `${prefix}${Math.random()
    .toString(36)
    .substr(2, 8)}`;
}
