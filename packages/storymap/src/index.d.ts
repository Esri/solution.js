import * as auth from "@esri/arcgis-rest-auth";
import * as common from "@esri/solution-common";
export declare function convertItemToTemplate(itemInfo: any, userSession: auth.UserSession): Promise<common.IItemTemplate>;
export declare function createItemFromTemplate(template: common.IItemTemplate, templateDictionary: any, userSession: auth.UserSession, progressTickCallback: () => void): Promise<string>;
export declare function isAStoryMap(template: common.IItemTemplate): boolean;
