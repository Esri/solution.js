import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
export declare class Item extends AgolItem {
    /**
     * Item data section JSON
     */
    dataSection?: any;
    /**
     * Performs item-specific initialization.
     *
     * @param requestOptions Options for initialization request for item's data section
     * @returns A promise that will resolve with the item
     */
    init(requestOptions?: IRequestOptions): Promise<AgolItem>;
}
