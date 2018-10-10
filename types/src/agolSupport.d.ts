import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { IItemUpdateResponse } from "@esri/arcgis-rest-items";
import { IItemHash } from "./itemFactory";
export interface ISortVertex {
    [id: string]: number;
}
export declare class SolutionItem {
    /**
     * Creates a Solution item containing JSON descriptions of items forming the solution.
     *
     * @param title Title for Solution item to create
     * @param collection List of JSON descriptions of items to publish into Solution
     * @param access Access to set for item: 'public', 'org', 'private'
     * @param requestOptions Options for the request
     * @returns A promise that will resolve with an object reporting success and the Solution id
     */
    static publishItemJSON(title: string, collection: IItemHash, access: string, requestOptions?: IUserRequestOptions): Promise<IItemUpdateResponse>;
    static topologicallySortItems(items: IItemHash): string[];
}
