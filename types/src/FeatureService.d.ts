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
    /**
     * Performs item-specific initialization.
     *
     * @param requestOptions Options for initialization request for item's data section
     * @returns A promise that will resolve with the item
     */
    init(requestOptions?: IRequestOptions): Promise<AgolItem>;
    private getLayers;
    private getFirstUsableName;
}
