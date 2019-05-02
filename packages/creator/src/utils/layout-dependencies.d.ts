/**
 * Entry point that walks the Layout object graph and inspects
 * the Sections/Rows/Cards for dependencies
 *
 * @param layout Layout object
 *
 * @returns Array of the id's of the dependant items
 */
export declare function getLayoutDependencies(layout: any): any;
/**
 * Iterate the Rows in the Section...
 * @param section Section Object
 *
 * @returns Array of the id's of the dependant items
 */
export declare function getSectionDependencies(section: any): any;
/**
 * Iterate the Cards in the Row...
 * @param row Row Object
 *
 * @returns Array of the id's of the dependant items
 */
export declare function getRowDependencies(row: any): any;
/**
 * Parse the card settings to extract the dependency ids.
 * This is where the actual useful work happens
 *
 * @param card Card Object
 *
 * @returns Array of the id's of the dependant items
 */
export declare function getCardDependencies(card: any): any;
