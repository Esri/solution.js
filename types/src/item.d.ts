import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
export declare class Item extends AgolItem {
    /**
     * Item data section JSON
     */
    dataSection?: any;
    init(requestOptions?: IRequestOptions): Promise<AgolItem>;
}
