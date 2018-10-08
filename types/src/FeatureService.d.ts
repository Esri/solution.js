import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
import { Item } from "./item";
/**
 *  AGOL web map application item
 */
export declare class FeatureService extends Item {
    /**
     * Service description
     */
    serviceSection: any;
    /**
     * Description for each layer
     */
    layers: any[];
    /**
     * Description for each table
     */
    tables: any[];
    init(requestOptions?: IRequestOptions): Promise<AgolItem>;
    private getLayers;
    private getFirstUsableName;
}
