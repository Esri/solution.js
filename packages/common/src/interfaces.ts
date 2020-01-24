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

import * as portal from "@esri/arcgis-rest-portal";
import { UserSession } from "@esri/arcgis-rest-auth";

// ------------------------------------------------------------------------------------------------------------------ //

export {
  IUserRequestOptions,
  IUserSessionOptions,
  UserSession
} from "@esri/arcgis-rest-auth";
export {
  IAddFolderResponse,
  ICreateItemResponse,
  IGroup,
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

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Flag for storing an item's binary resources.
 */
export enum EFileType {
  Data,
  Metadata,
  Resource,
  Thumbnail
}

/**
 * Options for creating a solution item.
 */
export interface ICreateSolutionOptions {
  title?: string; // default: random string from common.createId()
  snippet?: string; // default: ""
  description?: string; // default: ""
  tags?: string[]; // default: []
  thumbnailUrl?: string; // default: ""
  templateDictionary?: any;
  templatizeFields?: boolean; // default: false
  additionalTypeKeywords?: string[]; // default: []; supplements ["Solution", "Template"]
  progressCallback?: (percentDone: number) => void;
}

/**
 * Options for deploying a solution item and for creating the solution index item representing the deployment
 */
export interface IDeploySolutionOptions {
  title?: string; // default: copied from solution item
  snippet?: string; // default: copied from solution item
  description?: string; // default: copied from solution item
  tags?: string[]; // default: copied from solution item
  thumbnailUrl?: string; // default: copied from solution item
  templateDictionary?: any;
  additionalTypeKeywords?: string[]; // default: []; supplements ["Solution", "Deployed"]
  progressCallback?: (percentDone: number) => void;
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

export interface IFeatureServiceProperties {
  service: any;
  layers: any[];
  tables: any[];
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
  extends portal.IGetRelatedItemsResponse {
  total: number;
  start: number;
  num: number;
  nextStart: number;
  relatedItems: portal.IItem[];
}

export interface IGetResourcesResponse {
  total: number;
  start: number;
  num: number;
  nextStart: number;
  resources: IResource[];
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
   * List of ids of AGO items needed by this item that are circular in nature
   * For example group that references Workforce Project when the Workforce Project also references the group
   */
  circularDependencies: string[];

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

/**
 * Function signatures for use in a function lookup array.
 */
export interface IItemTemplateConversions {
  convertItemToTemplate(
    solutionItemId: string,
    itemInfo: any,
    authentication: UserSession,
    isGroup?: boolean
  ): Promise<IItemTemplate>;
  createItemFromTemplate(
    template: IItemTemplate,
    resourceFilePaths: IDeployFileCopyPath[],
    storageAuthentication: UserSession,
    templateDictionary: any,
    destinationAuthentication: UserSession,
    progressTickCallback: () => void
  ): Promise<string>;
  postProcessCircularDependencies?(
    newItemTemplate: IItemTemplate,
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

  /**
   * Callback for IProgressUpdate
   */
  progressTickCallback: any;
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
