import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { IItemUpdateResponse } from "@esri/arcgis-rest-items";
import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
export interface IItemList {
    [id: string]: AgolItem | Promise<AgolItem>;
}
export declare class ItemFactory {
    /**
     * Instantiates an item subclass using an AGOL id to load the item and get its type.
     * @param id AGOL id string
     */
    static itemToJSON(id: string, requestOptions?: IRequestOptions): Promise<AgolItem>;
    static itemHierarchyToJSON(rootIds: string | string[], collection?: IItemList, requestOptions?: IRequestOptions): Promise<IItemList>;
    static publishItemJSON(title: string, collection: IItemList, access: string, requestOptions?: IUserRequestOptions): Promise<IItemUpdateResponse>;
    private static baseId;
    /**
     * Instantiates an item subclass using generic JSON description to load the item and get its type.
     * @param json Generic JSON form of item
     */
    static JSONToItem(json: any, requestOptions?: IRequestOptions): Promise<AgolItem>;
    static JSONToItemHierarchy(json: any, requestOptions?: IRequestOptions): Promise<IItemList>;
}
