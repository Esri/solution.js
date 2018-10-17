import { IRequestOptions } from "@esri/arcgis-rest-request";
export interface AgolItemPrototype {
    /**
     * Item JSON
     */
    itemSection: any;
    /**
     * Item data section JSON
     */
    dataSection?: any;
    /**
     * List of AGOL items needed by this item
     */
    dependencies?: string[];
    /**
     * Estimated cost factor for rehydrating item
     */
    estimatedCost?: number;
}
export declare class AgolItem implements AgolItemPrototype {
    /**
     * AGOL item type name
     */
    type: string;
    /**
     * Item JSON
     */
    itemSection: any;
    /**
     * Item data section JSON
     */
    dataSection?: any;
    /**
     * List of AGOL items needed by this item
     */
    dependencies: string[];
    /**
     * Estimated cost factor for rehydrating item
     */
    estimatedCost: number;
    /**
     * Performs common item initialization.
     *
     * @param itemSection The item's JSON
     */
    constructor(prototype: AgolItemPrototype);
    /**
     * Completes the creation of the item.
     *
     * @param requestOptions Options for initialization request(s)
     * @returns A promise that will resolve with the item
     */
    complete(requestOptions?: IRequestOptions): Promise<AgolItem>;
    /**
     * Removes item properties irrelevant to cloning.
     */
    private removeUncloneableItemProperties;
}
