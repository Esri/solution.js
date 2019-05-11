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
export interface IItemTemplateConversions {
    convertItemToTemplate(itemInfo: any, userSession: auth.UserSession): Promise<IItemTemplate>;
    createItemFromTemplate(template: IItemTemplate, templateDictionary: any, userSession: auth.UserSession, progressTickCallback: () => void): Promise<IItemTemplate>;
}
export interface IItemTypeModuleMap {
    [itemType: string]: IItemTemplateConversions;
}
