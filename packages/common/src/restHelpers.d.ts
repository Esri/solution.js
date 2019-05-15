import * as auth from "@esri/arcgis-rest-auth";
import * as portal from "@esri/arcgis-rest-portal";
export declare function createItemWithData(itemInfo: any, dataInfo: any, requestOptions: auth.IUserRequestOptions, folderId: string | undefined, access?: string): Promise<portal.ICreateItemResponse>;
export declare function updateItemURL(id: string, url: string, requestOptions: auth.IUserRequestOptions): Promise<string>;
