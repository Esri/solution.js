import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { AgolItem, ISwizzleHash } from "./agolItem";
import { ItemWithData } from "./itemWithData";
/**
 *  AGOL web map application item
 */
export declare class Dashboard extends ItemWithData {
    /**
     * Completes the creation of the item.
     *
     * @param requestOptions Options for initialization request for item's data section
     * @returns A promise that will resolve with the item
     */
    complete(requestOptions?: IUserRequestOptions): Promise<AgolItem>;
    swizzleContainedItems(swizzles: ISwizzleHash): void;
}
