import { IRequestOptions } from "@esri/arcgis-rest-request";
export declare class AgolItem {
    /**
     * AGOL item type name
     */
    type: string;
    /**
     * List of AGOL items needed by this item
     */
    dependencies: string[];
    /**
     * Item JSON
     */
    itemSection: any;
    constructor(itemSection: any);
    init(requestOptions?: IRequestOptions): Promise<AgolItem>;
    private removeUncloneableItemProperties;
}
