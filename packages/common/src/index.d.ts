import * as auth from "@esri/arcgis-rest-auth";
export * from "./generalHelpers";
export * from "./restHelpers";
export * from "./templatization";
export interface ISolutionItem {
    item: any;
    data: ISolutionItemData;
}
export interface ISolutionItemData {
    metadata: any;
    templates: IItemTemplate[];
}
export interface IItemTemplate {
    itemId: string;
    type: string;
    key: string;
    item: any;
    data: any;
    resources: any[];
    dependencies: string[];
    properties: any;
    estimatedDeploymentCostFactor: number;
}
export interface IItemTemplateConversions {
    convertItemToTemplate(itemInfo: any, userSession: auth.UserSession): Promise<IItemTemplate>;
    createItemFromTemplate(template: IItemTemplate, templateDictionary: any, userSession: auth.UserSession, progressTickCallback: () => void): Promise<string>;
}
export interface IItemTypeModuleMap {
    [itemType: string]: IItemTemplateConversions;
}
