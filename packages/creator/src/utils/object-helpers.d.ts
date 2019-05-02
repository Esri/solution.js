/**
 * Get a property out of a deeply nested object
 * Does not handle anything but nested object graph
 *
 * @param obj Object to retrieve value from
 * @param path Path into an object, e.g., "data.values.webmap", where "data" is a top-level property
 *             in obj
 * @return Value at end of path
 */
export declare function getProp(obj: {
    [index: string]: any;
}, path: string): any;
/**
 * Return an array of values from an object, based on an array of property paths
 *
 * @param obj object to retrive values from
 * @param props Array of paths into the object e.g., "data.values.webmap", where "data" is a top-level property
 *
 * @return Array of the values plucked from the object
 */
export declare function getProps(obj: any, props: string[]): any;
/**
 * ```js
 * import { cloneObject } from "utils/object-helpers";
 * const original = { foo: "bar" }
 * const copy = cloneObject(original)
 * copy.foo // "bar"
 * copy === original // false
 * ```
 * Make a deep clone, including arrays. Does not handle functions!
 */
export declare function cloneObject(obj: {
    [index: string]: any;
}): {
    [index: string]: any;
};
/**
 * Look for a specific property name anywhere inside an object graph
 * and return the value
 */
export declare function getDeepValues(obj: any, prop: string): string[];
