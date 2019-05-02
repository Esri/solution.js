import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
/**
 * A solution template AGO item
 */
export interface ISolutionItem {
    /**
     * Item base section JSON
     */
    item: any;
    /**
     * Item data section JSON
     */
    data: ISolutionTemplates;
}
/**
 * A solution template: a collection of AGO item templates
 */
export interface ISolutionTemplates {
    /**
     * General information about the solution template
     */
    metadata: ISolutionTemplateMetadata;
    /**
     * The collection of templates
     */
    templates: ITemplate[];
}
/**
 * General information about a solution template
 */
export interface ISolutionTemplateMetadata {
    /**
     * Version of the solution template definition
     */
    version: string;
    /**
     * Id of item holding templates's thumbnails and resources
     */
    resourceStorageItemId?: string;
}
/**
 * A templatized form of an AGO item
 */
export interface ITemplate {
    /**
     * Item's AGO id
     */
    itemId: string;
    /**
     * AGO item type name
     */
    type: string;
    /**
     * Fairly unique identifier; set to 'i' + chars 2-8 of a random number in base 36
     */
    key: string;
    /**
     * Item base section JSON
     */
    item: any;
    /**
     * Item data section JSON
     */
    data?: any;
    /**
     * References to item resources
     */
    resources?: any[];
    /**
     * List of ids of AGO items needed by this item
     */
    dependencies?: string[];
    /**
     * Miscellaneous item-specific properties
     */
    properties?: any;
    /**
     * Item-type-specific functions
     */
    fcns?: IItemTypeModule;
    /**
     * Estimated relative cost of deploying this item; corresponds to number of progressCallback
     * function calls made during while deploying it
     */
    estimatedDeploymentCostFactor?: number;
}
/**
 * A package for information useful for accessing an AGO item
 */
export interface IAGOItemAccess {
    /**
     * Item's AGO id
     */
    id: string;
    /**
     * URL to item in AGO
     */
    url: string;
}
/**
 * The minimum functions for a type-specific template handler
 */
export interface IItemTypeModule {
    convertItemToTemplate(itemTemplate: ITemplate, requestOptions?: IUserRequestOptions): Promise<ITemplate>;
    createItemFromTemplate(itemTemplate: ITemplate, settings: any, requestOptions: IUserRequestOptions, progressCallback?: (update: IProgressUpdate) => void): Promise<ITemplate>;
}
/**
 * A package for reporting progress updates from type-specific template handlers
 */
export interface IProgressUpdate {
    /**
     * An identifier for the reporting process
     */
    processId?: string;
    /**
     * The item type
     */
    type?: string;
    /**
     * A keyword summarizing the progress checkpoint, e.g., starting, creating, updating URL, updated
     * relationship, added layer, added group member, done, failed
     */
    status?: string;
    /**
     * Reserved property
     */
    activeStep?: string;
}
