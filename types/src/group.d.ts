import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
export declare class Group extends AgolItem {
    /**
     * AGOL item type name
     */
    type: string;
    /**
     * Performs item-specific initialization.
     *
     * @param requestOptions Options for initialization request for group contents
     * @returns A promise that will resolve with the item
     */
    init(requestOptions?: IRequestOptions): Promise<AgolItem>;
    /**
     * Gets the ids of a group's contents.
     *
     * @param id Group id
     * @param pagingRequest Options for requesting group contents
     * @returns A promise that will resolve with a list of the ids of the group's contents
     */
    private getGroupContentsTranche;
}
