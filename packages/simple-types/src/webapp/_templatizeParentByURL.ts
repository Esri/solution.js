import * as common from "@esri/solution-common";
/**
 * This is very close to cloneObject but will test if an object
 * has one of the datasource urls as a property. If it finds one it will
 * templatize it's parent based on the fields from that datasource
 *
 * @param obj The dataSource or widget object from the application
 * @param ds A datasourceInfo object to use for testing against the current dataSource or widget
 * @returns The updated instance of the object with as many field references templatized as possible
 * @private
 */

export function _templatizeParentByURL(
  obj: { [index: string]: any },
  ds: common.IDatasourceInfo,
  templatizeKeys: boolean
): any {
  let clone: { [index: string]: any } = {};
  const url = ds.url;
  const layerId = ds.layerId;

  let urlTest: any;

  if (url && !isNaN(layerId)) {
    const exp = url.replace(/[.]/, ".layer" + layerId + ".");
    urlTest = new RegExp(exp, "gm");
  }

  if (Array.isArray(obj)) {
    clone = obj.map(c => {
      return _templatizeParentByURL(c, ds, templatizeKeys);
    });
  } else if (typeof obj === "object") {
    for (const i in obj) {
      if (obj[i] != null && typeof obj[i] === "object") {
        clone[i] = _templatizeParentByURL(obj[i], ds, templatizeKeys);
      } else {
        if (urlTest && urlTest.test(obj[i])) {
          debugger;
          obj = common.templatizeFieldReferences(
            obj,
            ds.fields,
            ds.basePath,
            templatizeKeys
          );
        }
        clone[i] = obj[i];
      }
    }
  } else {
    clone = obj;
  }
  return clone;
}
