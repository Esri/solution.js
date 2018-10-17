import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItemPrototype, AgolItem } from "./agolItem";
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
    complete(requestOptions?: IRequestOptions): Promise<AgolItem>;
    /**
     * Gets the ids of a group's contents.
     *
     * @param id Group id
     * @param pagingRequest Options for requesting group contents
     * @returns A promise that will resolve with a list of the ids of the group's contents
     */
    private getGroupContentsTranche;
}
