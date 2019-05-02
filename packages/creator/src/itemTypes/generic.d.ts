import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { ITemplate, IProgressUpdate } from "../interfaces";
export declare function convertItemToTemplate(itemTemplate: ITemplate, requestOptions?: IUserRequestOptions): Promise<ITemplate>;
export declare function createItemFromTemplate(itemTemplate: ITemplate, settings: any, requestOptions: IUserRequestOptions, progressCallback?: (update: IProgressUpdate) => void): Promise<ITemplate>;
