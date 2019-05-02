/**
 * Does the model have a specific typeKeyword?
 */
export declare function hasTypeKeyword(model: any, keyword: string): boolean;
/**
 * Does the model have any of a set of keywords
 */
export declare function hasAnyKeyword(model: any, keywords: string[]): boolean;
/**
 * Given the url of a webapp, parse our the id from the url
 */
export declare function parseIdFromUrl(url: string): string;
/**
 * Return a random number, prefixed with a string. Used for unique identifiers that do not require
 * the rigor of a full UUID - i.e. node id's, process ids etc.
 * @param prefix String to prefix the random number with so the result is a valid javascript property
 */
export declare function createId(prefix?: string): string;
