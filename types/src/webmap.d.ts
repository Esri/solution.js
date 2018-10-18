import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { AgolItem } from "./agolItem";
import { ItemWithData } from "./itemWithData";
/**
 *  AGOL webmap item
 */
export declare class Webmap extends ItemWithData {
    /**
     * Completes the creation of the item.
     *
     * @param requestOptions Options for initialization request for item's data section
     * @returns A promise that will resolve with the item
     */
    complete(requestOptions?: IUserRequestOptions): Promise<AgolItem>;
    /**
     * Updates the item's list of dependencies.
     *
     * @param layerList List of operational layers or tables to examine
     * @param requestOptions Options for the request
     * @returns A promise that will resolve with the ids of the layers in the layer list
     */
    private getDependencyLayerIds;
    /**
     * Gets the AGOL id of a layer either from the layer or via a query to its service.
     *
     * @param layer Layer whose id is sought
     * @param requestOptions Options for the request
     * @returns A promise that will resolve with the item id string
     */
    private getLayerItemId;
}
