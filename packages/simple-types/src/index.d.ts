import * as auth from "@esri/arcgis-rest-auth";
import * as interfaces from "./interfaces";
export declare function toJSON(argIn: string): string;
export declare function fromJSON(template: interfaces.IItemTemplate, templateDictionary: any, userSession: auth.UserSession, progressTickCallback: () => void): Promise<interfaces.IItemTemplate>;
