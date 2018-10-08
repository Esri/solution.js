import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
import { Item } from "./item";
/**
 *  AGOL web map application item
 */
export declare class WebMapApp extends Item {
    init(requestOptions?: IRequestOptions): Promise<AgolItem>;
}
