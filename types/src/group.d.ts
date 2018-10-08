import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
export declare class Group extends AgolItem {
    /**
     * AGOL item type name
     */
    type: string;
    init(requestOptions?: IRequestOptions): Promise<AgolItem>;
    private getGroupContentsTranche;
}
