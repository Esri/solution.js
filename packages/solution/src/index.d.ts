import * as auth from "@esri/arcgis-rest-auth";
export interface IPortalSubset {
    name: string;
    id: string;
    restUrl: string;
    portalUrl: string;
    urlKey: string;
}
export declare function convertGroupIntoSolution(groupId: string, destUrl: string, userSession: auth.UserSession): Promise<string>;
export declare function deploySolutionToGroup(itemInfo: any, portalSubset: IPortalSubset, userSession: auth.UserSession): Promise<string>;
