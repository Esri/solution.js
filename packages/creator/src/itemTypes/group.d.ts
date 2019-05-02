import { IPagingParamsRequestOptions } from "@esri/arcgis-rest-groups";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { ITemplate, IProgressUpdate } from "../interfaces";
export declare function convertItemToTemplate(itemTemplate: ITemplate, requestOptions?: IUserRequestOptions): Promise<ITemplate>;
export declare function createItemFromTemplate(itemTemplate: ITemplate, settings: any, requestOptions: IUserRequestOptions, progressCallback?: (update: IProgressUpdate) => void): Promise<ITemplate>;
/**
 * Adds the members of a group to it.
 *
 * @param itemTemplate Group
 * @param swizzles Hash mapping Solution source id to id of its clone
 * @param requestOptions Options for the request
 * @return A promise that will resolve when fullItem has been updated
 * @protected
 */
export declare function addGroupMembers(itemTemplate: ITemplate, requestOptions: IUserRequestOptions, progressCallback?: (update: IProgressUpdate) => void): Promise<void>;
/**
 * Gets the ids of the dependencies (contents) of an AGOL group.
 *
 * @param fullItem A group whose contents are sought
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve with list of dependent ids or an empty list
 * @protected
 */
export declare function getGroupContents(itemTemplate: ITemplate, requestOptions: IUserRequestOptions): Promise<string[]>;
/**
 * Gets the ids of a group's contents.
 *
 * @param id Group id
 * @param pagingRequest Options for requesting group contents; note: its paging.start parameter may
 *                      be modified by this routine
 * @return A promise that will resolve with a list of the ids of the group's contents or an empty
 *         list
 * @protected
 */
export declare function getGroupContentsTranche(id: string, pagingRequest: IPagingParamsRequestOptions): Promise<string[]>;
