import * as auth from "@esri/arcgis-rest-auth";
import * as common from "@esri/solution-common";
export declare function toJSON(argIn: string): string;
export declare function fromJSON(template: common.IItemTemplate, templateDictionary: any, userSession: auth.UserSession, progressTickCallback: () => void): Promise<common.IItemTemplate>;
