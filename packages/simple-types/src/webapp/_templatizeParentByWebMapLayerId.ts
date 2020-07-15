import {
  IDatasourceInfo,
  templatizeFieldReferences
} from "@esri/solution-common";
/**
 * This is very close to cloneObject but will test if an object
 * has one of the datasource webmap layer ids as a property. If it finds one it will
 * templatize it's parent based on the fields from that datasource.
 *
 * @param obj The dataSource or widget object from the application
 * @param ds A datasourceInfo object to use for testing against the current dataSource or widget
 * @param id A webmap layer id to test with.
 * @returns The updated instance of the object with as many field references templatized as possible
 * @private
 */

export function _templatizeParentByWebMapLayerId(
  obj: { [index: string]: any },
  ds: IDatasourceInfo,
  id: string,
  templatizeKeys: boolean
): any {
  let clone: { [index: string]: any } = {};
  const idTest: any = new RegExp(id, "gm");
  if (Array.isArray(obj)) {
    clone = obj.map(c => {
      return _templatizeParentByWebMapLayerId(c, ds, id, templatizeKeys);
    });
  } else if (typeof obj === "object") {
    for (const i in obj) {
      if (obj[i] !== null) {
        // In some web application templates they store a stringified version of an object that can
        // contain multiple layer references at a very high level on the main values collection.
        // This was causing many other more typical layer references to be set incorrectly as the first
        // layerId found in this high level string would be used against the main object.
        let parsedProp: any;
        try {
          parsedProp = JSON.parse(obj[i]);
        } catch (error) {
          parsedProp = undefined;
        }
        if (parsedProp && typeof parsedProp === "object") {
          clone[i] = JSON.stringify(
            _templatizeParentByWebMapLayerId(parsedProp, ds, id, templatizeKeys)
          );
        } else if (typeof obj[i] === "object") {
          // some widgets store the layerId as a key to a collection of details that contain field references
          if (idTest.test(i) && templatizeKeys) {
            obj[i] = templatizeFieldReferences(
              obj[i],
              ds.fields,
              ds.basePath,
              templatizeKeys
            );
          }
          clone[i] = _templatizeParentByWebMapLayerId(
            obj[i],
            ds,
            id,
            templatizeKeys
          );
        } else {
          if (idTest.test(obj[i])) {
            obj = templatizeFieldReferences(
              obj,
              ds.fields,
              ds.basePath,
              templatizeKeys
            );
          }
          clone[i] = obj[i];
        }
      } else {
        clone[i] = obj[i];
      }
    }
  } else {
    clone = obj;
  }
  return clone;
}
