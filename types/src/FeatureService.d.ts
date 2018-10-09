import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
import { Item } from "./item";
/**
 *  AGOL hosted feature service item
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
    /**
     * Gets the full definitions of the layers affiliated with a hosted service.
     *
     * @param serviceUrl URL to hosted service
     * @param layerList List of layers at that service
     * @param requestOptions Options for the request
     */
    private getLayers;
    /**
     * Gets the name of the first layer in list of layers that has a name
     * @param layerList List of layers to use as a name source
     * @returns The name of the found layer or an empty string if no layers have a name
     */
    private getFirstUsableName;
}
