import * as auth from "@esri/arcgis-rest-auth";
import * as common from "@esri/solution-common";
export declare function deployItems(templates: common.IItemTemplate[], templateDictionary: any, userSession: auth.UserSession, progressTickCallback: () => void): Promise<any>;
export declare function findTemplateInList(templates: common.IItemTemplate[], id: string): common.IItemTemplate | null;
