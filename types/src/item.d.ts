import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
export declare class Item extends AgolItem {
    /**
     * Completes the creation of the item.
     *
     * @param requestOptions Options for initialization request for item's data section
     * @returns A promise that will resolve with the item
     */
    complete(requestOptions?: IRequestOptions): Promise<AgolItem>;
}
