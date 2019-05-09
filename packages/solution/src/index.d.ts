import * as auth from "@esri/arcgis-rest-auth";
export interface IPortalSubset {
    name: string;
    id: string;
    restUrl: string;
    portalUrl: string;
    urlKey: string;
}
export declare function createSolution(groupId: string, destUrl: string, userSession: auth.UserSession): Promise<string>;
export declare function deploySolution(itemInfo: any, templateDictionary: any, portalSubset: IPortalSubset, userSession: auth.UserSession, progressCallback: (percentDone: number) => void): Promise<string>;
