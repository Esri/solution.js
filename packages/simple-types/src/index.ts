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
 * Manages the creation and deployment of simple item types.
 *
 * @module simple-types
 */

import * as auth from "@esri/arcgis-rest-auth";
import * as common from "@esri/solution-common";
import * as DashboardModule from "./dashboard";
import * as FormModule from "./form";
import * as GroupModule from "./group";
import * as portal from "@esri/arcgis-rest-portal";
import * as WebMapModule from "./webmap";
import * as WebMappingApplicationModule from "./webmappingapplication";

/**
 * Mapping from item type to module with type-specific template-handling code
 */
const moduleMap: common.IItemTypeModuleMap = {
  "dashboard": DashboardModule,
  "form": FormModule,
  "group": GroupModule,
  "web map": WebMapModule,
  "web mapping application": WebMappingApplicationModule
};

// ------------------------------------------------------------------------------------------------------------------ //

export function convertItemToTemplate(
  itemInfo: any,
  userSession: auth.UserSession
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>(resolve => {
    const itemHandler: common.IItemTemplateConversions = moduleMap[itemInfo.type.toLowerCase()];
    if (!itemHandler) {
      console.warn("Unimplemented item type (module level) " + itemInfo.type + " for " + itemInfo.itemId);
      resolve(undefined);
    } else {
      console.log("jsonize item type " + itemInfo.type + " for " + itemInfo.itemId);
      resolve(itemInfo);
    }
  });
}

export function createItemFromTemplate(
  template: common.IItemTemplate,
  templateDictionary: any,
  userSession: auth.UserSession,
  progressTickCallback: () => void
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>((resolve, reject) => {
    const itemHandler: common.IItemTemplateConversions = moduleMap[template.type.toLowerCase()];
    if (!itemHandler) {
      console.warn("Unimplemented item type (module level) " + template.type + " for " + template.itemId);
      resolve(undefined);
    } else {
      console.log("deploy item type " + template.type + " for " + template.itemId);
      resolve(template);
    }
  });
}
