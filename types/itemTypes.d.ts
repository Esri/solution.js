export interface IItem {
    /**
     * AGOL item type name
     */
    type: string;
    /**
     * List of AGOL items needed by this item
     */
    dependencies: IItem[];
    /**
     * Relative path to icon file for this item
     */
    iconFilename: string;
    /**
     * Item JSON
     */
    itemSection: any;
    /**
     * Item data/ JSON
     */
    dataSection: any;
    getData(): any;
}
export interface IWebmap extends IItem {
    /**
     * AGOL item type name
     */
    doc: string;
    getMap(): any;
}
