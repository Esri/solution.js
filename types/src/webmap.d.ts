import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
import { Item } from "./item";
/**
 *  AGOL webmap item
 */
export declare class Webmap extends Item {
    init(requestOptions?: IRequestOptions): Promise<AgolItem>;
    private getDependencyLayerIds;
    private getLayerItemId;
}
