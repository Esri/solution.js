import * as auth from "@esri/arcgis-rest-auth";
export interface IPortalSubset {
    name: string;
    id: string;
    restUrl: string;
    portalUrl: string;
    urlKey: string;
}
export declare function createSolution(groupId: string, destUrl: string, userSession: auth.UserSession): Promise<string>;
