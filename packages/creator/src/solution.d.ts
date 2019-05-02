import * as items from "@esri/arcgis-rest-items";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import * as mInterfaces from "./interfaces";
/**
 * Creates a solution template item.
 *
 * @param title The title to use for the item
 * @param version The version to include in the item's metadata
 * @param ids AGO id string or list of AGO id strings
 * @param sourceRequestOptions Options for requesting information from AGO about items to be included in solution item
 * @param destinationRequestOptions Options for creating solution item in AGO
 * @return A promise that will resolve with a solution item
 */
export declare function createSolutionItem(title: string, version: string, ids: string | string[], sourceRequestOptions: IUserRequestOptions, destinationRequestOptions?: IUserRequestOptions): Promise<mInterfaces.ISolutionItem>;
/**
 * Converts a solution template into an AGO deployed solution and items.
 *
 * @param solutionItem Solution template to deploy
 * @param requestOptions Options for the request
 * @param settings Hash of facts: org URL, adlib replacements
 * @param progressCallback Function for reporting progress updates from type-specific template handlers
 * @return A promise that will resolve with a list of the ids of items created in AGO
 */
export declare function deploySolutionItem(solutionItem: mInterfaces.ISolutionItem, requestOptions: IUserRequestOptions, settings?: any, progressCallback?: (update: mInterfaces.IProgressUpdate) => void): Promise<mInterfaces.ITemplate[]>;
/**
 * Returns the sum of the estimated cost factors of a set of templates.
 *
 * @param templates A collection of AGO item templates
 * @return Sum of cost factors
 */
export declare function getEstimatedDeploymentCost(templates: mInterfaces.ITemplate[]): number;
/**
 * Returns a list of the currently-supported AGO item types.
 *
 * @return List of item type names; names are all-lowercase forms of standard names
 */
export declare function getSupportedItemTypes(): string[];
/**
 * A parameterized server name to replace the organization URL in a Web Mapping Application's URL to
 * itself; name has to be acceptable to AGO, otherwise it discards the URL, so substitution must be
 * made before attempting to create the item.
 * @protected
 */
export declare const PLACEHOLDER_SERVER_NAME: string;
/**
 * The portion of a Dashboard app URL between the server and the app id.
 * @protected
 */
export declare const OPS_DASHBOARD_APP_URL_PART: string;
/**
 * The portion of a Webmap URL between the server and the map id.
 * @protected
 */
export declare const WEBMAP_APP_URL_PART: string;
/**
 * Copies a conventional (non-thumbnail) resource from one item to another.
 *
 * @param itemId Id of item serving as source of resource
 * @param url URL to source resource
 * @param storageItemId Id of item to receive copy of resource
 * @param sourceRequestOptions Options for requesting information from source
 * @param destinationRequestOptions Options for writing information to destination
 * @return A promise which resolves to the tag under which the resource is stored
 * @protected
 */
export declare function copyRegularResource(itemId: string, url: string, storageItemId: string, sourceRequestOptions: IUserRequestOptions, destinationRequestOptions: IUserRequestOptions): Promise<string>;
/**
 * Copies a resource from a URL to an item.
 *
 * @param url URL to source resource
 * @param folder Folder in destination for resource; defaults to top level
 * @param filename Filename in destination for resource
 * @param storageItemId Id of item to receive copy of resource
 * @param sourceRequestOptions Options for requesting information from source
 * @param destinationRequestOptions Options for writing information to destination
 * @return A promise which resolves to the tag under which the resource is stored
 * @protected
 */
export declare function copyResource(url: string, folder: string, filename: string, storageItemId: string, sourceRequestOptions: IUserRequestOptions, destinationRequestOptions: IUserRequestOptions): Promise<string>;
/**
 * Copies a thumbnail resource from one item to another.
 *
 * @param itemId Id of item serving as source of resource
 * @param url URL to source resource
 * @param storageItemId Id of item to receive copy of resource
 * @param sourceRequestOptions Options for requesting information from source
 * @param destinationRequestOptions Options for writing information to destination
 * @return A promise which resolves to the tag under which the resource is stored
 * @protected
 */
export declare function copyThumbnailResource(itemId: string, url: string, itemType: string, storageItemId: string, sourceRequestOptions: IUserRequestOptions, destinationRequestOptions: IUserRequestOptions): Promise<string>;
/**
 * Creates an empty deployed solution AGO item.
 *
 * @param title Title to use for item
 * @param solutionItem Solution template to deploy; serves as source of text info for new item
 * @param requestOptions Options for the request
 * @param settings Hash of facts: org URL, adlib replacements
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return Empty template item
 * @protected
 */
export declare function createDeployedSolutionAgoItem(title: string, solutionItem: mInterfaces.ISolutionItem, requestOptions: IUserRequestOptions, settings?: any, access?: string): Promise<mInterfaces.IAGOItemAccess>;
/**
 * Fetches an AGO item and converts it into a template after its dependencies have been fetched and
 * converted.
 *
 * @param itemId AGO id of solution template item to deploy
 * @param itemTemplates A collection of AGO item templates
 * @param requestOptions Options for the request
 * @param settings Hash of facts: org URL, adlib replacements
 * @param progressCallback Function for reporting progress updates from type-specific template handlers
 * @return A promise that will resolve with the item's template (which is simply returned if it's
 *         already in the templates list
 * @protected
 */
export declare function createItemFromTemplateWhenReady(itemId: string, itemTemplates: mInterfaces.ITemplate[], requestOptions: IUserRequestOptions, settings: any, progressCallback?: (update: mInterfaces.IProgressUpdate) => void): Promise<mInterfaces.ITemplate>;
/**
 * Creates templates for a set of AGO items.
 *
 * @param ids AGO id string or list of AGO id strings
 * @param sourceRequestOptions Options for requesting information from AGO about items to be included in solution item
 * @param existingTemplates A collection of AGO item templates that can be referenced by newly-created templates
 * @return A promise that will resolve with the created template items
 * @protected
 */
export declare function createItemTemplates(ids: string | string[], sourceRequestOptions: IUserRequestOptions, existingTemplates?: mInterfaces.ITemplate[]): Promise<mInterfaces.ITemplate[]>;
/**
 * Creates an empty solution template AGO item.
 *
 * @param title The title to use for the item
 * @param version The version to include in the item's metadata
 * @param requestOptions Options for the request
 * @param settings Hash of facts: org URL, adlib replacements
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return Empty template item
 * @protected
 */
export declare function createSolutionAgoItem(title: string, version: string, requestOptions: IUserRequestOptions, settings?: any, access?: string): Promise<mInterfaces.ISolutionItem>;
/**
 * Creates a partner item to a solution; the partner holds the resources for the solution
 * until the solution is upgraded to do this itself.
 *
 * @param title The title to use for the item
 * @param requestOptions Options for the request
 * @param settings Hash of facts: org URL, adlib replacements
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return Empty template item
 * @protected
 */
export declare function createSolutionStorageAgoItem(title: string, requestOptions: IUserRequestOptions, settings?: any, access?: string): Promise<any>;
/**
 * Finds template by id in a list of templates.
 *
 * @param templates A collection of AGO item templates to search
 * @param id AGO id of template to find
 * @return Matching template or null
 */
export declare function findTemplateInList(templates: mInterfaces.ITemplate[], id: string): mInterfaces.ITemplate;
/**
 * Determines a folder and filename for a resource given the resource's item and the URL of the resource.
 *
 * @param itemId Id of item containing resource
 * @param url URL of the resource
 * @return Folder and filename
 */
export declare function getFolderAndFilenameForResource(itemId: string, url: string): {
    folder: string;
    filename: string;
};
/**
 * Creates a Solution item containing JSON descriptions of items forming the solution.
 *
 * @param title Title for Solution item to create
 * @param templates Hash of JSON descriptions of items to publish into Solution
 * @param requestOptions Options for the request
 * @param folderId Id of folder to receive item; null/empty indicates that the item goes into the root
 *                 folder; ignored for Group item type
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return A promise that will resolve with an object reporting success and the solution id
 * @protected
 */
export declare function publishSolutionTemplate(title: string, templates: mInterfaces.ITemplate[], requestOptions: IUserRequestOptions, folderId?: string, access?: string): Promise<items.IItemUpdateResponse>;
/**
 * Replaces a template entry in a list of templates
 *
 * @param templates A collection of AGO item templates
 * @param id Id of item in templates list to find; if not found, no replacement is () => done()
 * @param template Replacement template
 * @return True if replacement was made
 * @protected
 */
export declare function replaceTemplate(templates: mInterfaces.ITemplate[], id: string, template: mInterfaces.ITemplate): boolean;
/**
 * Saves the thumbnails and resources of template items with a solution item.
 *
 * @param templates A collection of AGO item templates
 * @param storageItemId Id of item to receive copies of resources
 * @param sourceRequestOptions Options for requesting information from AGO about items to be included in solution item
 * @param destinationRequestOptions Options for accessing solution item in AGO
 * @return A promise that will resolve a list of thes tag under which the resources are stored
 * @protected
 */
export declare function saveResourcesInSolutionItem(templates: mInterfaces.ITemplate[], storageItemId: string, sourceRequestOptions: IUserRequestOptions, destinationRequestOptions: IUserRequestOptions): Promise<string[]>;
/**
 * Topologically sort a Solution's items into a build list.
 *
 * @param templates A collection of AGO item templates
 * @return List of ids of items in the order in which they need to be built so that dependencies
 * are built before items that require those dependencies
 * @throws Error("Cyclical dependency graph detected")
 * @protected
 */
export declare function topologicallySortItems(templates: mInterfaces.ITemplate[]): string[];
