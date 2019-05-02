import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { ITemplate } from "../interfaces";
/**
 * Returns a list of the currently-supported AGO item types.
 *
 * @return List of item type names; names are all-lowercase forms of standard names
 */
export declare function getSupportedItemTypes(): string[];
/**
 * Fetches the item and data sections, the resource and dependencies lists, and the item-type-specific
 * functions for an item using its AGOL item id, and then calls a type-specific function to convert
 * the item into a template.
 *
 * @param itemId AGO id of solution template item to templatize
 * @param requestOptions Options for the request
 * @return A promise which will resolve with an item template
 */
export declare function convertItemToTemplate(itemId: string, requestOptions: IUserRequestOptions): Promise<ITemplate>;
/**
 * Loads the item-type-specific functions for an item.
 *
 * @param itemTemplate Item template to update
 * @return Updated item template
 */
export declare function initItemTemplateFromJSON(itemTemplate: ITemplate): ITemplate;
/**
 * Flattens an array of strings and/or string arrays.
 *
 * @param nestedArray An array to be flattened
 * @return Copy of array, but flattened
 * @protected
 */
export declare function flatten(nestedArray?: string[]): string[];
/**
 * Removes duplicates from an array of strings.
 *
 * @param arrayWithDups An array to be copied
 * @return Copy of array with duplicates removed
 * @protected
 */
export declare function removeDuplicates(arrayWithDups?: string[]): string[];
/**
 * Creates a copy of item base properties with properties irrelevant to cloning removed.
 *
 * @param item The base section of an item
 * @return Cloned copy of item without certain properties such as `created`, `modified`,
 *        `owner`,...; note that is is a shallow copy
 * @protected
 */
export declare function removeUndesirableItemProperties(item: any): any;
