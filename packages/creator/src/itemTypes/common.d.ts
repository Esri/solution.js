import * as items from "@esri/arcgis-rest-items";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { IProgressUpdate } from "../interfaces";
/**
 * A parameterized server name to replace the organization URL in a Web Mapping Application's URL to
 * itself; name has to be acceptable to AGOL, otherwise it discards the URL, so substitution must be
 * made before attempting to create the item.
 * @protected
 */
export declare const PLACEHOLDER_SERVER_NAME: string;
export declare function fail(e?: any): any;
export declare function doCommonTemplatizations(itemTemplate: any): void;
/**
 * Publishes an item and its data as an AGOL item.
 *
 * @param item Item's `item` section
 * @param data Item's `data` section
 * @param requestOptions Options for the request
 * @param folderId Id of folder to receive item; null indicates that the item goes into the root
 *                 folder; ignored for Group item type
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return A promise that will resolve with an object reporting success and the Solution id
 */
export declare function createItemWithData(item: any, data: any, requestOptions: IUserRequestOptions, folderId?: string, access?: string): Promise<items.IItemUpdateResponse>;
export declare function deTemplatize(id: string | string[]): string | string[];
export declare function finalCallback(key: string, successful: boolean, progressCallback?: (update: IProgressUpdate) => void): void;
/**
 * Creates a timestamp string using the current date and time.
 *
 * @return Timestamp
 * @protected
 */
export declare function getUTCTimestamp(): string;
export declare function templatize(id: string | string[], param?: string): string | string[];
export declare function templatizeList(ids: string[], param?: string): string[];
export declare function updateItemData(id: string, data: any, requestOptions: IUserRequestOptions): Promise<string>;
/**
 * Updates the URL of an item.
 *
 * @param id AGOL id of item to update
 * @param url URL to assign to item's base section
 * @param requestOptions Options for the request
 * @return A promise that will resolve when the item has been updated
 */
export declare function updateItemURL(id: string, url: string, requestOptions: IUserRequestOptions): Promise<string>;
