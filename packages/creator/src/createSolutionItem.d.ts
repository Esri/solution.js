import * as auth from "@esri/arcgis-rest-auth";
export declare function createSolutionItem(title: string, version: string, ids: string | string[], sourceUserSession: auth.UserSession, destinationUserSession: auth.UserSession, progressTickCallback: () => void): Promise<any>;
