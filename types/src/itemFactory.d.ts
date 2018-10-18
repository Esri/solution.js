import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { AgolItem, ISwizzleHash } from "./agolItem";
export interface IItemHash {
    [id: string]: AgolItem | Promise<AgolItem>;
}
export declare class ItemFactory {
    /**
     * Converts an AGOL item into a generic JSON item description.
     *
     * ```typescript
     * import { ItemFactory } from "../src/itemFactory";
     * import { AgolItem } from "../src/agolItem";
     * import { ItemWithData } from "../src/itemWithData";
     *
     * ItemFactory.itemToJSON("6fc5992522d34f26b2210d17835eea21")
     * .then(
     *   (response:AgolItem) => {
     *     console.log(response.type);  // => "Web Mapping Application"
     *     console.log(response.itemSection.title);  // => "ROW Permit Public Comment"
     *     console.log((response as ItemWithData).dataSection.source);  // => "bb3fcf7c3d804271bfd7ac6f48290fcf"
     *   },
     *   error => {
     *     // (should not see this as long as above id--a real one--stays available)
     *     console.log(error); // => "Item or group does not exist or is inaccessible."
     *   }
     * );
     * ```
     *
     * @param id AGOL id string
     * @param requestOptions Options for the request
     * @returns A promise that will resolve with a subclass of AgolItem
     */
    static itemToJSON(id: string, requestOptions?: IUserRequestOptions): Promise<AgolItem>;
    /**
     * Converts one or more AGOL items and their dependencies into a hash by id of generic JSON item descriptions.
     *
     * ```typescript
     * import { ItemFactory, IItemHash } from "../src/itemFactory";
     * import { AgolItem } from "../src/agolItem";
     * import { ItemWithData } from "../src/itemWithData";
     *
     * ItemFactory.itemToJSON(["6fc5992522d34f26b2210d17835eea21", "9bccd0fac5f3422c948e15c101c26934"])
     * .then(
     *   (response:IItemHash) => {
     *     let keys = Object.keys(response);
     *     console.log(keys.length);  // => "6"
     *     console.log((response[keys[0]] as AgolItem).type);  // => "Web Mapping Application"
     *     console.log((response[keys[0]] as AgolItem).itemSection.title);  // => "ROW Permit Public Comment"
     *     console.log((response[keys[0]] as ItemWithData).dataSection.source);  // => "bb3fcf7c3d804271bfd7ac6f48290fcf"
     *   },
     *   error => {
     *     // (should not see this as long as both of the above ids--real ones--stay available)
     *     console.log(error); // => "Item or group does not exist or is inaccessible."
     *   }
     * );
     * ```
     *
     * @param rootIds AGOL id string or list of AGOL id strings
     * @param requestOptions Options for the request
     * @param collection A hash of items already converted useful for avoiding duplicate conversions and
     * hierarchy tracing
     * @returns A promise that will resolve with a hash by id of subclasses of AgolItem;
     * if either id is inaccessible, a single error response will be produced for the set
     * of ids
     */
    static itemHierarchyToJSON(rootIds: string | string[], requestOptions?: IUserRequestOptions, collection?: IItemHash): Promise<IItemHash>;
    /**
     * Converts a generic JSON item description into an AGOL item.
     * @param itemJson Generic JSON form of item
     * @param folderId AGOL id of folder to receive item, or null/empty if item is destined for root level
     * @returns A promise that will resolve with the item's id
     */
    static JSONToItem(itemJson: any, folderId: string, swizzles: ISwizzleHash, requestOptions?: IUserRequestOptions): Promise<string>;
    /**
     * Converts a hash by id of generic JSON item descriptions into AGOL items.
     * @param itemJson A hash of item descriptions to convert
     * @param folderId AGOL id of folder to receive item, or null/empty if item is destined for root level
     * @returns A promise that will resolve with a list of the ids of items created in AGOL
     */
    static JSONToItemHierarchy(collection: IItemHash, folderId: string, requestOptions?: IUserRequestOptions): Promise<string[]>;
    /**
     * Extracts the AGOL id from the front of a string.
     *
     * @param extendedId A string of hex characters that begins with an AGOL id;
     *   characters including and after "_" are considered a modifier
     * @returns An AGOL id
     */
    private static baseId;
}
