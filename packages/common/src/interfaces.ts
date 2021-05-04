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

import {
  IGroup,
  IGetRelatedItemsResponse as IPortalGetRelatedItemsResponse,
  IItem
} from "@esri/arcgis-rest-portal";
import { ISpatialReference } from "@esri/arcgis-rest-service-admin";
import { UserSession } from "@esri/arcgis-rest-auth";

//#region Re-exports -------------------------------------------------------------------------------------------------//

export {
  IUserRequestOptions,
  IUserSessionOptions,
  UserSession
} from "@esri/arcgis-rest-auth";
export {
  IAddFolderResponse,
  ICreateItemResponse,
  IGroup,
  IGroupAdd,
  IItem,
  IPagingParams,
  IPortal,
  IUser,
  ItemRelationshipType,
  ISearchResult,
  IUpdateItemResponse
} from "@esri/arcgis-rest-portal";
export {
  ICreateServiceResult,
  IExtent,
  ISpatialReference
} from "@esri/arcgis-rest-service-admin";

//#endregion ---------------------------------------------------------------------------------------------------------//

export const SSolutionTemplateFormatVersion = "0";
export const SDeployedSolutionFormatVersion = "1";

//#region Enums ------------------------------------------------------------------------------------------------------//

/**
 * Flag for storing an item's binary resources.
 */
export enum EFileType {
  Data,
  Info,
  Metadata,
  Resource,
  Thumbnail
}

/**
 * Flags for reporting the status of creating or deploying an item.
 */
export enum EItemProgressStatus {
  Started,
  Created,
  Cancelled,
  Finished,
  Ignored,
  Failed,
  Unknown
}

export const SItemProgressStatus = [
  "1 Started",
  "2 Created",
  "3 Cancelled",
  "3 Finished",
  "3 Ignored",
  "3 Failed",
  "Unknown"
];

//#endregion ---------------------------------------------------------------------------------------------------------//

//#region Types ------------------------------------------------------------------------------------------------------//

export type IItemProgressCallback = (
  itemId: string,
  status: EItemProgressStatus,
  costUsed: number,
  createdItemId?: string // supplied when status is EItemProgressStatus.Created or .Finished
) => boolean;

export type ISolutionProgressCallback = (
  percentDone: number,
  jobId?: string,
  progressEvent?: ISolutionProgressEvent
) => void;

export type INoArgFunction = () => any;

//#endregion ---------------------------------------------------------------------------------------------------------//

//#region Interfaces -------------------------------------------------------------------------------------------------//

export interface IAddGroupResponse {
  success: boolean;
  group: IGroup;
}

export interface IAdditionalSearchOptions {
  start?: number;
  num?: number;
  sortField?: string;
  sortOrder?: string;
  bbox?: string; // e.g., "-118,32,-116,34"
  categories?: string[]; // maximum of 8
  [key: string]: any;
}

export interface IBuildOrdering {
  /**
   * Item ids in order in which items are to be built.
   */
  buildOrder: string[];
  /**
   * Item ids of dependencies that were not supplied to ordering algorithm.
   */
  missingDependencies: string[];
  /**
   * Dictionary of item ids that need dependency patching; each id has a list of the ids of the dependencies to be patched.
   */
  itemsToBePatched: IKeyedListsOfStrings;
}

export interface ICompleteItem {
  // text/plain JSON
  base: IItem;
  // */*
  data: File;
  // image/*
  thumbnail: File;
  // application/xml
  metadata: File;
  // list of */*
  resources: File[];
  // list of forward relationshipType/relatedItems[] pairs
  fwdRelatedItems: IRelatedItems[];
  // list of reverse relationshipType/relatedItems[] pairs
  revRelatedItems: IRelatedItems[];
  //
  featureServiceProperties?: IFeatureServiceProperties;
}

export interface ICreateItemFromTemplateResponse {
  /**
   * Created item
   */
  item?: IItemTemplate;
  /**
   * Item's AGO id
   */
  id: string;
  /**
   * AGO item type name
   */
  type: string;
  /**
   * Does the item need post processing to handle unresolved variables
   */
  postProcess: boolean;
}

/**
 * Options for creating a solution item.
 */
export interface ICreateSolutionOptions {
  jobId?: string; // default: group id
  title?: string; // defaults: for a group, group title; for an item, random string from common.createShortId()
  snippet?: string; // defaults: for a group, group snippet; for an item, ""
  description?: string; // defaults: for a group, group description; for an item, ""
  tags?: string[]; // defaults: for a group, group tags; for an item, []
  thumbnailurl?: string; // default: ""
  thumbnail?: File; // default: null; has priority over thumbnailurl
  folderId?: string; // default is top level
  templateDictionary?: any; // default: {}
  templatizeFields?: boolean; // default: false
  additionalTypeKeywords?: string[]; // default: []; supplements ["Solution", "Template"]
  progressCallback?: ISolutionProgressCallback;
  consoleProgress?: boolean; // default: false
  itemIds?: string[];
}

/**
 * Result of creating a solution item.
 */
export interface ICreateSolutionResult {
  success: boolean;
  solutionTemplateItemId: string;
  enableItemReuse?: boolean; // when true items with source-itemId type keyword will be reused
}

/**
 * The relevant elements of a data source that are used for templatization
 */
export interface IDatasourceInfo {
  /**
   * Calculated pattern used for templatization eg. "{{itemId.fields.layerId.fieldname}}"
   */
  basePath: string;
  /**
   * The portal item id eg. "4efe5f693de34620934787ead6693f19"
   */
  itemId: string;
  /**
   * The id for the layer from the service eg. 0
   */
  layerId: number;
  /**
   * The webmap layer id eg. "TestLayerForDashBoardMap_632"
   */
  id?: string;
  /**
   * The id for the layer from a map could be referenced by more than one map for a solution
   */
  ids: string[];
  /**
   * The url used for fields lookup
   */
  url?: string;
  /**
   * The fields this datasource contains
   */
  fields: any[];
  /**
   * The ralative ids for references to a datasource
   * Application types like dashboard can reference datasources via realtive widget reference ids
   */
  references?: any[];
  /**
   * The details on any relationships that the datasource is involved in
   */
  relationships: any[];
  /**
   * The layers adminLayerInfo
   * Used to fetch relationship info in some cases
   */
  adminLayerInfo: any;
}

/**
 * Storage of dependencies.
 */
export interface IDependency {
  /**
   * Dependency item id for templatization.
   */
  id: string;

  /**
   * Dependency service name for name mapping.
   * This is used to find appropriate source service name for views.
   */
  name: string;
}

/**
 * IDeployFilename extended to include the URL to the stored resource.
 */
export interface IDeployFileCopyPath extends IDeployFilename {
  url: string;
}

/**
 * File type, folder, and filename for deploying an item's binary resource.
 */
export interface IDeployFilename {
  type: EFileType;
  folder: string;
  filename: string;
}

/**
 * Options for deploying a solution item and for creating the solution index item representing the deployment
 */
export interface IDeploySolutionOptions {
  jobId?: string; // default: solution id
  title?: string; // default: copied from solution item
  snippet?: string; // default: copied from solution item
  description?: string; // default: copied from solution item
  tags?: string[]; // default: copied from solution item
  thumbnailurl?: string; // default: copied from solution item
  thumbnail?: File; // default: null; has priority over thumbnailurl
  templateDictionary?: any; // default: {}
  additionalTypeKeywords?: string[]; // default: []; supplements ["Solution", "Deployed"]
  enableItemReuse?: boolean; // when true items with source-itemId type keyword will be reused
  progressCallback?: ISolutionProgressCallback;
  consoleProgress?: boolean; // default: false
  storageAuthentication?: UserSession; // credentials for the organization with the source items; default: use
  // authentication supplied for deployment destination
}

/**
 * Result of deploying a solution item.
 */
export interface IDeploySolutionResult {
  success: boolean;
  deployedSolutionItemId: string;
}

export interface IFeatureServiceProperties {
  service: any;
  layers: any[];
  tables: any[];
  workforceInfos?: any;
}

/**
 * File folder, filename, and data.
 */
export interface IFile {
  folder: string;
  filename: string;
  blob: Blob;
}

export interface IFileMimeType {
  blob: Blob;
  filename: string;
  mimeType: string;
}

export interface IFolderStatusResponse {
  success: boolean;
  folder: {
    username: string;
    id: string;
    title: string;
  };
}

export interface IGetRelatedItemsResponse
  extends IPortalGetRelatedItemsResponse {
  total: number;
  start: number;
  num: number;
  nextStart: number;
  relatedItems: IItem[];
}

export interface IGetResourcesResponse {
  total: number;
  start: number;
  num: number;
  nextStart: number;
  resources: IResource[];
}

export interface IGroupCategorySchema {
  categorySchema: IGroupCategory[];
}

export interface IGroupCategory {
  title: string;
  description?: string;
  categories?: IGroupCategory[];
}

/**
 * Subset of portal.IItem containing just the properties that are stored in a template--the item's "base" section.
 */
export interface IItemGeneralized {
  categories?: string[];
  culture?: string;
  description?: string;
  documentation?: string;
  extent?: number[][] | string;
  id: string;
  properties?: any;
  snippet?: string;
  spatialReference?: ISpatialReference;
  tags?: string[];
  title?: string;
  type: string;
  typeKeywords?: string[];
  url?: string;
  [key: string]: any;
}

/**
 * The templatized form of an item or group.
 */
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
  item: IItemGeneralized;

  /**
   * Item data section JSON
   */
  data: any;

  /**
   * References to item resources
   */
  resources: any[];

  /**
   * References to related item
   */
  relatedItems?: IRelatedItems[];

  /**
   * List of ids of AGO items needed by this item
   */
  dependencies: string[];

  /**
   * List of ids of AGO groups the item needs to be shared with
   */
  groups: string[];

  /**
   * Miscellaneous item-specific properties
   */
  properties: any;

  /**
   * Estimated relative cost of deploying this item; corresponds to number of progressCallback
   * function calls made during while deploying it
   */
  estimatedDeploymentCostFactor: number;
  /**
   * Allow for adhoc properties
   */
  [propName: string]: any;
}

/**
 * Function signatures for use in a function lookup array.
 */
export interface IItemTemplateConversions {
  convertItemToTemplate(
    solutionItemId: string,
    itemInfo: any,
    authentication: UserSession,
    templateDictionary?: any
  ): Promise<IItemTemplate>;
  createItemFromTemplate(
    template: IItemTemplate,
    templateDictionary: any,
    destinationAuthentication: UserSession,
    itemProgressCallback: IItemProgressCallback
  ): Promise<ICreateItemFromTemplateResponse>;
  postProcessDependencies?(
    templates: IItemTemplate[],
    clonedSolutionsResponse: ICreateItemFromTemplateResponse[],
    authentication: UserSession,
    templateDictionary: any
  ): Promise<any>;
}

/**
 * Structure for mapping from item type to module with type-specific template-handling code
 */
export type moduleHandler = IItemTemplateConversions | undefined | null;
export interface IItemTypeModuleMap {
  [itemType: string]: moduleHandler;
}

export interface IItemUpdate {
  id: string;
  /**
   * Key-value pair for update parameter.
   * N.B.: Use `data` key for binary data; all other keys are serialized, which zeroes out binary data!
   */
  [key: string]: any;
}

export interface IKeyedListsOfStrings {
  [key: string]: string[];
}

export interface IMimeTypes {
  [key: string]: string;
}

/**
 * A simple interface for a key value pair with number as the key
 */
export interface INumberValuePair {
  [key: number]: any;
}

/**
 * Subset of a esri/portal/Portal used by this library.
 */
export interface IPortalSubset {
  name: string;
  id: string;
  restUrl: string;
  portalUrl: string;
  urlKey: string;
}

/**
 * Storage of arguments for post processing functions
 */
export interface IPostProcessArgs {
  /**
   * Status message to show after the layerDefinition is updated.
   */
  message: string;

  /**
   * Key objects to add to the layerDefinition.
   */
  objects: any;

  /**
   * Template of item to be created
   */

  itemTemplate: any;

  /**
   * Credentials for the request
   */
  authentication: UserSession;
}

/**
 * The relevant elements of a data source that are used for templatization
 */
export interface IQuickCaptureDatasource {
  /**
   * The portal item id for the datasource eg. "4efe5f693de34620934787ead6693f19"
   */
  featureServiceItemId: string;
  /**
   * The application item id for the datasource eg. "1d4de1e4-ef58-4e02-9159-7a6e6701cada"
   */
  dataSourceId: string;
  /**
   * The url used for the datasource
   */
  url: number;
}

export interface IRelatedItems {
  relationshipType: string;
  relatedItemIds: string[];
}

export interface IResource {
  resource: string;
  created: number;
  size: number;
}

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

  /**
   * Supplemental information
   */
  properties?: IStringValuePair;
  [key: string]: any;
}

/**
 * The data section of a solution item.
 */
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

/**
 * Packet of supplemental information provided via a ISolutionProgressCallback call.
 */
export interface ISolutionProgressEvent {
  /**
   * Tag describing data
   */
  event: string;

  /**
   * Data
   */
  data?: any;
}

/**
 *  Information for storing a resource in a storage item.
 */
export interface ISourceFileCopyPath {
  /**
   * URL where a resource, metadata, or thumbnail of an item or group can be found
   */
  url: string;

  /**
   * Folder for storing a resource in a storage item
   */
  folder: string;

  /**
   * Filename for storing a resource in a storage item
   */
  filename: string;
}

/**
 * A simple interface for a key value pair with string as the key
 */
export interface IStringValuePair {
  [key: string]: any;
}

/**
 * A common status response from AGO.
 */
export interface IStatusResponse {
  /**
   * Success or failure of request
   */
  success: boolean;
  /**
   * AGO id of item for which request was made
   */
  itemId: string;
}

/**
 * Storage of update info
 */
export interface IUpdate {
  /**
   * URL for the update request
   */
  url: string;

  /**
   * object to update the layers definition
   */
  params: any;

  /**
   * arguments for post processing functions
   */
  args: IPostProcessArgs;
}

/**
 * Survey 123 create API parameters
 */
export interface ISurvey123CreateParams {
  /**
   * Title for the survey Form item & folder
   */
  title: string;

  /**
   * Array of tags for the survey Form item
   */
  tags: string[];

  /**
   * Array of typeKeywords for the survey Form item
   */
  typeKeywords: string[];

  /**
   * Description for the survey Form item
   */
  description: string;

  /**
   * The survey form configuration schema. This defines configurable
   * content like the theme, questions, & header/footer text, etc.
   */
  form: any;

  /**
   * The username from the current session
   */
  username: string;

  /**
   * The token from the current session
   */
  token: string;

  /**
   * The portalUrl for Survey123 to direct API requests to
   */
  portalUrl: string;
}

/**
 * Successful Survey123 create API response
 */
export interface ISurvey123CreateSuccess {
  /**
   * Statically defined, always true for success
   */
  success: true;

  /**
   * Resulting Form item ID
   */
  id: string;

  /**
   * Subset of resulting Form item details
   */
  formItemInfo: {
    /**
     * Resulting Form item typeKeywords
     */
    typeKeywords: string[];

    /**
     * Resulting Form item ownerFolder
     */
    ownerFolder: string;

    /**
     * Resulting Form item access
     */
    access: string;

    /**
     * Resulting Form item owner
     */
    owner: string;
  };
  /**
   * Subset of resulting Feature Service(s) details
   */
  featureService: {
    /**
     * Subset of source Feature Service details
     */
    source: {
      /**
       * Resulting Feature Service item ID
       */
      itemId: string;

      /**
       * Generically definines remaining/unused properties
       */
      [key: string]: any;
    };

    /**
     * Generically definines remaining/unused properties
     */
    [key: string]: any;
  };

  /**
   * Generically definines remaining/unused properties
   */
  [key: string]: any;
}

/**
 * Unsuccessful Survey123 create API response
 */
export interface ISurvey123CreateError {
  /**
   * Statically defined, always false when unsuccessful
   */
  success: false;

  /**
   * Error details
   */
  error: {
    /**
     * HTTP error code
     */
    code: number;

    /**
     * Optional, additional details about the error
     */
    details: string[];

    /**
     * Message describing the error
     */
    message: string;
  };
}

/**
 * Result details for a successful Survey123 create
 * API request
 */
export interface ISurvey123CreateResult {
  formId: string;
  featureServiceId: string;
  folderId: string;
}

//#endregion ---------------------------------------------------------------------------------------------------------//
