import { IRequestOptions } from "@esri/arcgis-rest-request";
export declare class AgolItem {
    /**
     * AGOL item type name
     */
    type: string;
    /**
     * List of AGOL items needed by this item
     */
    dependencies: string[];
    /**
     * Item JSON
     */
    itemSection: any;
    /**
     * Performs common item initialization.
     *
     * @param itemSection The item's JSON
     */
    constructor(itemSection: any);
    /**
     * Performs item-specific initialization.
     *
     * @param requestOptions Options for initialization request(s)
     * @returns A promise that will resolve with the item
     */
    init(requestOptions?: IRequestOptions): Promise<AgolItem>;
    /**
     * Removes item properties irrelevant to cloning.
     */
    private removeUncloneableItemProperties;
}
