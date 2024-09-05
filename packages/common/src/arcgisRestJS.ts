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

export { ICredential, IUserRequestOptions, IUserSessionOptions, UserSession } from "@esri/arcgis-rest-auth";
export {
  IFeature,
  IQueryRelatedOptions,
  IQueryRelatedResponse,
  IRelatedRecordGroup,
  queryFeatures as rest_queryFeatures,
  addFeatures as rest_addFeatures,
  queryRelated,
  applyEdits,
  queryFeatures,
} from "@esri/arcgis-rest-feature-layer";
export {
  IAddFolderResponse,
  IAddItemDataOptions,
  ICreateItemOptions,
  ICreateItemResponse,
  IFolder,
  IFolderIdOptions,
  IGetGroupContentOptions,
  IGetRelatedItemsResponse,
  IGroup,
  IGroupAdd,
  IGroupCategorySchema as restIGroupCategorySchema,
  IItem,
  IItemRelationshipOptions,
  IItemResourceOptions,
  IItemResourceResponse,
  IManageItemRelationshipOptions,
  IMoveItemOptions,
  IMoveItemResponse,
  IPagingParams,
  IPortal,
  IRemoveItemResourceOptions,
  ISearchGroupContentOptions,
  ISearchOptions,
  ISearchResult,
  ISetAccessOptions,
  ISharingResponse,
  ItemRelationshipType,
  IUpdateGroupOptions,
  IUpdateItemOptions,
  IUpdateItemResponse,
  IUser,
  IUserContentResponse,
  IUserGroupOptions,
  IGroupSharingOptions,
  IUserItemOptions,
  addItemData as restAddItemData,
  addItemRelationship,
  addItemResource,
  createFolder,
  createGroup,
  createItem,
  createItemInFolder,
  moveItem,
  protectItem,
  SearchQueryBuilder,
  getGroup,
  getGroupContent,
  getGroupCategorySchema as restGetGroupCategorySchema,
  getItem,
  getItemData,
  getItemResources as restGetItemResources,
  getUserContent,
  getPortal as restGetPortal,
  getPortalUrl,
  getSelf,
  getRelatedItems,
  getUser as restGetUser,
  searchGroupContent,
  searchItems as restSearchItems,
  setItemAccess,
  searchGroups as restSearchGroups,
  shareItemWithGroup,
  removeFolder as restRemoveFolder,
  removeGroup as restRemoveGroup,
  removeGroupUsers,
  removeItem as restRemoveItem,
  removeItemResource,
  unprotectGroup,
  unprotectItem,
  updateGroup as restUpdateGroup,
  updateItem as restUpdateItem,
  updateItemResource,
} from "@esri/arcgis-rest-portal";
export { IRequestOptions, IParams, ArcGISAuthError, encodeFormData, request } from "@esri/arcgis-rest-request";
export {
  ICreateServiceParams,
  ICreateServiceResult,
  IExtent,
  ISpatialReference,
  addToServiceDefinition as svcAdminAddToServiceDefinition,
  createFeatureService as svcAdminCreateFeatureService,
} from "@esri/arcgis-rest-service-admin";
