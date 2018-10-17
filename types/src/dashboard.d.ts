import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
import { Item } from "./item";
/**
 *  AGOL web map application item
 */
export declare class Dashboard extends Item {
    /**
     * Completes the creation of the item.
     *
     * @param requestOptions Options for initialization request for item's data section
     * @returns A promise that will resolve with the item
     */
    complete(requestOptions?: IRequestOptions): Promise<AgolItem>;
}
