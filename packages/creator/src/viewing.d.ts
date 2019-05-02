import * as mInterfaces from "./interfaces";
/**
 * A recursive structure describing the hierarchy of a collection of AGOL items.
 */
export interface IHierarchyEntry {
    /**
     * AGOL item id
     */
    id: string;
    /**
     * Item's dependencies
     */
    dependencies: IHierarchyEntry[];
}
/**
 * Extracts item hierarchy structure from a solution template.
 *
 * @param templates A collection of AGO item templates
 * @return JSON structure reflecting dependency hierarchy of items; shared dependencies are
 * repeated; each element of the structure contains the AGOL id of an item and a list of ids of the
 * item's dependencies
 */
export declare function getItemHierarchy(templates: mInterfaces.ITemplate[]): IHierarchyEntry[];
/**
 * Gets a list of the top-level items in a Solution, i.e., the items that no other item depends on.
 *
 * @param templates A collection of AGO item templates
 * @return List of ids of top-level items in Solution
 */
export declare function getTopLevelItemIds(templates: mInterfaces.ITemplate[]): string[];
