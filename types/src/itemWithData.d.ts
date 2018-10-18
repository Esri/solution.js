import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { AgolItem } from "./agolItem";
export declare class ItemWithData extends AgolItem {
    /**
     * Completes the creation of the item.
     *
     * @param requestOptions Options for initialization request for item's data section
     * @returns A promise that will resolve with the item
     */
    complete(requestOptions?: IUserRequestOptions): Promise<AgolItem>;
}
