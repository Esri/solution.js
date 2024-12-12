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
import {
  IFolderIdOptions,
  IGetGroupContentOptions,
  IGetUserOptions,
  IGroup,
  IGroupContentResult,
  IGetRelatedItemsResponse,
  IGroupSharingOptions,
  IItem,
  IItemRelationshipOptions,
  IItemResourceOptions,
  IItemResourceResponse,
  IPortal,
  IRemoveItemResourceOptions,
  ISearchOptions,
  ISearchResult,
  ISharingResponse,
  IUpdateGroupOptions,
  IUpdateItemOptions,
  IUpdateItemResponse,
  IUser,
  IUserGroupOptions,
  IUserItemOptions,
  addItemResource as restAddItemResource,
  getGroup as restGetGroup,
  getGroupContent as restGetGroupContent,
  getRelatedItems as restGetRelatedItems,
  getSelf as restGetSelf,
  getUser,
  removeFolder,
  removeGroup,
  removeItemResource as restRemoveItemResource,
  searchItems,
  SearchQueryBuilder,
  shareItemWithGroup as restShareItemWithGroup,
  unprotectGroup as restUnprotectGroup,
  unprotectItem as restUnprotectItem,
  updateGroup,
  updateItem,
  updateItemResource as restUpdateItemResource,
} from "@esri/arcgis-rest-portal";
import { IRequestOptions, request as restRequest } from "@esri/arcgis-rest-request";
import {
  //IFeature,
  IQueryRelatedOptions,
  IQueryRelatedResponse,
  //IRelatedRecordGroup,
  queryRelated as restQueryRelated,
} from "@esri/arcgis-rest-feature-layer";
import {
  IAddToServiceDefinitionOptions,
  IAddToServiceDefinitionResult,
  addToServiceDefinition,
} from "@esri/arcgis-rest-service-admin";

export { ICredential, IUserRequestOptions, IUserSessionOptions, UserSession } from "@esri/arcgis-rest-auth";
export {
  IFeature,
  IQueryRelatedOptions,
  IQueryRelatedResponse,
  IRelatedRecordGroup,
  queryFeatures as rest_queryFeatures,
  addFeatures as rest_addFeatures,
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
  IPagedResponse,
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
  createFolder,
  createGroup,
  createItem,
  createItemInFolder,
  moveItem,
  protectItem,
  SearchQueryBuilder,
  getGroupCategorySchema as restGetGroupCategorySchema,
  getItem,
  getItemData,
  getItemResources as restGetItemResources,
  getUserContent,
  getPortal as restGetPortal,
  getPortalUrl,
  searchGroupContent,
  setItemAccess,
  searchGroups as restSearchGroups,
  removeGroupUsers,
  removeItem as restRemoveItem,
} from "@esri/arcgis-rest-portal";
export { IRequestOptions, IParams, ArcGISAuthError, encodeFormData } from "@esri/arcgis-rest-request";
export {
  ICreateServiceParams,
  ICreateServiceResult,
  IExtent,
  ISpatialReference,
  createFeatureService as svcAdminCreateFeatureService,
} from "@esri/arcgis-rest-service-admin";
export interface IFolderSuccessResult {
  success: boolean;
  folder: {
    username: string;
    id: string;
    title: string;
  };
}
export interface IGroupSuccessResult {
  success: boolean;
  groupId: string;
}
export interface ISuccessResult {
  success: boolean;
}
//custom export functions that mimic the same export function from arcgis-rest-js
//to bypass unit test error:
//Error: <spyOn> : <functon or property> is not declared writable or has no setter
export function addItemResource(requestOptions: IItemResourceOptions): Promise<IItemResourceResponse> {
  return restAddItemResource(requestOptions);
}
export function getGroup(id: string, requestOptions?: IRequestOptions): Promise<IGroup> {
  return restGetGroup(id, requestOptions);
}
export function getGroupContent(id: string, requestOptions?: IGetGroupContentOptions): Promise<IGroupContentResult> {
  return restGetGroupContent(id, requestOptions);
}
export function getRelatedItems(requestOptions: IItemRelationshipOptions): Promise<IGetRelatedItemsResponse> {
  return restGetRelatedItems(requestOptions);
}
export function getSelf(requestOptions?: IRequestOptions): Promise<IPortal> {
  return restGetSelf(requestOptions);
}
export function queryRelated(requestOptions: IQueryRelatedOptions): Promise<IQueryRelatedResponse> {
  return restQueryRelated(requestOptions);
}
export function removeItemResource(requestOptions: IRemoveItemResourceOptions): Promise<ISuccessResult> {
  return restRemoveItemResource(requestOptions);
}
export function request(url: string, requestOptions?: IRequestOptions): Promise<any> {
  return restRequest(url, requestOptions);
}
//getUser already exists as an custom export in restHelperGet so this export has 'rest' prefix to denote it's from rest.
export function restGetUser(requestOptions?: string | IGetUserOptions): Promise<IUser> {
  return getUser(requestOptions);
}
//removeFolder already exists as an custom export in restHelperGet so this export has 'rest' prefix to denote it's from rest.
export function restRemoveFolder(requestOptions: IFolderIdOptions): Promise<IFolderSuccessResult> {
  return removeFolder(requestOptions);
}
//removeGroup already exists as an custom export in restHelperGet so this export has 'rest' prefix to denote it's from rest.
export function restRemoveGroup(requestOptions: IUserGroupOptions): Promise<any> {
  return removeGroup(requestOptions);
}
//searchItems already exists as an custom export in restHelperGet so this export has 'rest' prefix to denote it's from rest.
export function restSearchItems(search: string | ISearchOptions | SearchQueryBuilder): Promise<ISearchResult<IItem>> {
  return searchItems(search);
}
//supdateItem already exists as an custom export in restHelperGet so this export has 'rest' prefix to denote it's from rest.
export function restUpdateItem(requestOptions: IUpdateItemOptions): Promise<IUpdateItemResponse> {
  return updateItem(requestOptions);
}
export function restUpdateGroup(requestOptions: IUpdateGroupOptions): Promise<IGroupSuccessResult> {
  return updateGroup(requestOptions);
}
export function shareItemWithGroup(requestOptions: IGroupSharingOptions): Promise<ISharingResponse> {
  return restShareItemWithGroup(requestOptions);
}
export function svcAdminAddToServiceDefinition(
  url: string,
  requestOptions: IAddToServiceDefinitionOptions,
): Promise<IAddToServiceDefinitionResult> {
  return addToServiceDefinition(url, requestOptions);
}
export function updateItemResource(requestOptions: IItemResourceOptions): Promise<IItemResourceResponse> {
  return restUpdateItemResource(requestOptions);
}
export function unprotectGroup(requestOptions: IUserGroupOptions): Promise<ISuccessResult> {
  return restUnprotectGroup(requestOptions);
}
export function unprotectItem(requestOptions: IUserItemOptions): Promise<ISuccessResult> {
  return restUnprotectItem(requestOptions);
}
