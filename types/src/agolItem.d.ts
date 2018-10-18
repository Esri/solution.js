import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { IItemAddRequestOptions } from "@esri/arcgis-rest-items";
export interface ISwizzleHash {
    [id: string]: string;
}
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
    complete(requestOptions?: IUserRequestOptions): Promise<AgolItem>;
    /**
     * Clones the item into the destination organization and folder
     *
     * @param folderId AGOL id of folder to receive item, or null/empty if item is destined for root level
     * @param requestOptions Options for creation request(s)
     * @returns A promise that will resolve with the item's id
     */
    clone(folderId: string, swizzles: ISwizzleHash, requestOptions?: IUserRequestOptions): Promise<string>;
    prepareForCreate(swizzles: ISwizzleHash): void;
    concludeCreation(clonedItemId: string, swizzles: ISwizzleHash): Promise<string>;
    swizzleContainedItems(swizzles: ISwizzleHash): void;
    /**
     * Assembles the standard contents needed to create an item.
     *
     * @param folderId AGOL id of folder to receive item, or null/empty if item is destined for root level
     * @param requestOptions Options for creation request(s)
     * @returns An options structure for calling arcgis-rest-js' createItemInFolder function
     */
    getCreateItemOptions(folderId: string, requestOptions?: IUserRequestOptions): IItemAddRequestOptions;
    cloningUniquenessTimestamp(): number;
    /**
     * Removes item properties irrelevant to cloning.
     */
    private removeUncloneableItemProperties;
}
