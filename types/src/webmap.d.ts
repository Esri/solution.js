import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
import { Item } from "./item";
/**
 *  AGOL webmap item
 */
export declare class Webmap extends Item {
    /**
     * Performs item-specific initialization.
     *
     * @param requestOptions Options for initialization request for item's data section
     * @returns A promise that will resolve with the item
     */
    init(requestOptions?: IRequestOptions): Promise<AgolItem>;
    /**
     * Updates the item's list of dependencies.
     *
     * @param layerList List of operational layers or tables to examine
     */
    private getDependencyLayerIds;
    private getLayerItemId;
}
