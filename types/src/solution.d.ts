import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { IItemUpdateResponse } from "@esri/arcgis-rest-items";
import { IItemHash } from "./itemFactory";
export interface IHierarchyEntry {
    type: string;
    id: string;
    idPart?: string;
    dependencies: IHierarchyEntry[];
}
export declare class Solution {
    /**
     * Creates a Solution item containing JSON descriptions of items forming the solution.
     *
     * @param title Title for Solution item to create
     * @param collection Hash of JSON descriptions of items to publish into Solution
     * @param access Access to set for item: 'public', 'org', 'private'
     * @param requestOptions Options for the request
     * @returns A promise that will resolve with an object reporting success and the Solution id
     */
    static publishItemJSON(title: string, collection: IItemHash, access: string, requestOptions?: IUserRequestOptions): Promise<IItemUpdateResponse>;
    /**
     * Topologically sort a Solution's items into a build list.
     *
     * @param items Hash of JSON descriptions of items
     * @return List of ids of items in the order in which they need to be built so that dependencies
     * are built before items that require those dependencies
     * @throws Error("Cyclical dependency graph detected")
     */
    static topologicallySortItems(items: IItemHash): string[];
    /**
     * Extract item hierarchy structure from a Solution's items list.
     *
     * @param items Hash of JSON descriptions of items
     * @return JSON structure reflecting dependency hierarchy of items; shared dependencies are repeated;
     * each element of structure contains 1) AGOL type of item, 2) AGOL id of item (groups have a type of 'Group'),
     * 3) list of dependencies, and, for Feature Services only, 4) the feature layer id in the feature service
     */
    static getItemHierarchy(items: IItemHash): IHierarchyEntry[];
    /**
     * Extracts the AGOL id from the front of a string.
     *
     * @param extendedId A string of hex characters that begins with an AGOL id;
     *   characters including and after "_" are considered a modifier
     * @returns An AGOL id
     */
    private static baseId;
}
