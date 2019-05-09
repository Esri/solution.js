import * as auth from "@esri/arcgis-rest-auth";
import * as interfaces from "./interfaces";
export declare function deployItems(templates: interfaces.IItemTemplate[], templateDictionary: any, userSession: auth.UserSession, progressTickCallback: () => void): Promise<any>;
export declare function findTemplateInList(templates: interfaces.IItemTemplate[], id: string): interfaces.IItemTemplate | null;
