/**
 * Walk the tree and templatize the layout...
 */
/**
 * Convert a Layout instance to a Template
 *
 * @param layout Layout Object
 *
 * @returns Hash with the converted Layout, as well as an array of assets
 */
export declare function convertLayoutToTemplate(layout: any): any;
/**
 * Convert a section, collecting assets along the way...
 */
export declare function convertSection(section: any): any;
export declare function extractAssets(obj: any): any;
/**
 * Convert a row, really just iterates the cards and collects their outputs
 * @param row Row object, which will contain cards
 *
 * @returns Hash of assets and converted cards
 */
export declare function convertRow(row: any): any;
/**
 * Convert a card to a templatized version of itself
 * @param card Card object
 *
 * @returns Hash of the conveted card and any assets
 */
export declare function convertCard(card: any): any;
/**
 * Convert an Image Card
 * @param card Card Object
 *
 * @returns Hash including the converted card, and any assets
 */
export declare function convertImageCard(card: any): any;
/**
 * Convert an Jumbotron Card
 * @param card Card Object
 *
 * @returns Hash including the converted card, and any assets
 */
export declare function convertJumbotronCard(card: any): any;
/**
 * Convert an Item Gallery Card
 * @param card Card Object
 *
 * @returns Hash including the converted card, and any assets
 */
export declare function convertItemGalleryCard(card: any): any;
/**
 * Convert an Follow Initiative Card
 * @param card Card Object
 *
 * @returns Hash including the converted card, and any assets
 */
export declare function convertFollowCard(card: any): any;
/**
 * Convert an Event List Card
 * @param card Card Object
 *
 * @returns Hash including the converted card, and any assets
 */
export declare function convertEventListCard(card: any): any;
