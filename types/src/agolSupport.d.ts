import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { IItemUpdateResponse } from "@esri/arcgis-rest-items";
import { IItemHash } from "./itemFactory";
export interface IHierarchyEntry {
    type: string;
    id: string;
    idPart?: string;
    dependencies: IHierarchyEntry[];
}
export declare class SolutionItem {
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
     * Topologically sort solution items into a build list.
     *
     * @param items Hash of JSON descriptions of items
     * @return List of ids of items in the order in which they need to be built so that dependencies
     * are built before items that require those dependencies
     */
    static topologicallySortItems(items: IItemHash): string[];
    /**
     * Extract item hierarchy from solution items list.
     *
     * @param items Hash of JSON descriptions of items
     * @return JSON structure reflecting dependency hierarchy of items; shared dependencies are repeated;
     * each element of structure contains 1) AGOL type of item, 2) AGOL id of item (groups have a type of 'Group'),
     * 3) list of dependencies, and, for Feature Services only, 4) the feature layer id in the feature service
     */
    static getItemHierarchy(items: IItemHash): IHierarchyEntry[];
    /**
     * Extracts the 32-character AGOL id from the front of a string.
     *
     * @param extendedId A string of 32 or more characters that begins with an AGOL id
     * @returns A 32-character string
     */
    private static baseId;
}
