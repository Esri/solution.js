export declare class CloneableItem {
    /**
     * AGOL item type name
     */
    type: string;
    /**
     * List of AGOL items needed by this item
     */
    dependencies: CloneableItem[];
    /**
     * Relative path to icon file for this item
     */
    iconFilename: string;
    /**
     * Item JSON
     */
    itemSection: any;
    constructor(itemSection: any);
}
