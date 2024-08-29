/** @license
 * Copyright 2024 Esri
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
 * Provides common functions and classes from ArcGIS REST JS.
 */


export { UserSession } from "@esri/arcgis-rest-auth";
export {
  queryFeatures as rest_queryFeatures,
  addFeatures as rest_addFeatures,
  queryRelated,
  applyEdits,
  queryFeatures
} from "@esri/arcgis-rest-feature-layer";
export {
  addItemRelationship,
  addItemResource,
  createItem,
  moveItem,
  protectItem,
  SearchQueryBuilder,
  getGroup,
  getGroupContent,
  getItemData,
  getUserContent,
  getPortalUrl,
  getSelf,
  getUser as restGetUser,
  searchItems as restSearchItems,
  shareItemWithGroup,
  removeFolder as restRemoveFolder,
  removeGroup as restRemoveGroup,
  removeItem as restRemoveItem,
  removeItemResource,
  unprotectGroup,
  unprotectItem,
  updateGroup as restUpdateGroup,
  updateItem as restUpdateItem,
  updateItemResource
} from "@esri/arcgis-rest-portal";
export {
  ArcGISAuthError,
  encodeFormData,
  request
} from "@esri/arcgis-rest-request";


