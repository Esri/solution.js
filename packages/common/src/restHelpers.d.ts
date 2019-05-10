import * as auth from "@esri/arcgis-rest-auth";
import * as portal from "@esri/arcgis-rest-portal";
export declare function createItemWithData(itemInfo: any, dataInfo: any, requestOptions: auth.IUserRequestOptions, folderId: string | undefined, access?: string): Promise<portal.ICreateItemResponse>;
