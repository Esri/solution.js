import * as auth from "@esri/arcgis-rest-auth";
export * from "./generalHelpers";
export * from "./restHelpers";
export * from "./templatization";
export interface IItemTemplate {
    itemId: string;
    type: string;
    key: string;
    dependencies: string[];
    estimatedDeploymentCostFactor: number;
    properties: any;
    item: any;
    data: any;
    resources: any;
}
export interface ISolutionItemData {
    metadata: any;
    templates: IItemTemplate[];
}
export interface IItemJson {
    toJSON(argIn: string): string;
    fromJSON(template: IItemTemplate, templateDictionary: any, userSession: auth.UserSession, progressTickCallback: () => void): Promise<IItemTemplate>;
}
export interface IItemTypeModuleMap {
    [itemType: string]: IItemJson;
}
