import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { AgolItemPrototype, AgolItem, ISwizzleHash } from "./agolItem";
export declare class Group extends AgolItem {
    /**
     * Performs common item initialization.
     *
     * @param itemSection The item's JSON
     */
    constructor(prototype: AgolItemPrototype);
    /**
     * Completes the creation of the item.
     *
     * @param requestOptions Options for initialization request for group contents
     * @returns A promise that will resolve with the item
     */
    complete(requestOptions?: IUserRequestOptions): Promise<AgolItem>;
    /**
     * Gets the ids of a group's contents.
     *
     * @param id Group id
     * @param pagingRequest Options for requesting group contents
     * @returns A promise that will resolve with a list of the ids of the group's contents
     */
    private getGroupContentsTranche;
    /**
     * Clones the item into the destination organization and folder
     *
     * @param folderId AGOL id of folder to receive item, or null/empty if item is destined for root level
     * @param requestOptions Options for creation request(s)
     * @returns A promise that will resolve with the item's id
     */
    clone(folderId: string, swizzles: ISwizzleHash, requestOptions?: IUserRequestOptions): Promise<string>;
}
