import { IDatasourceInfo } from "@esri/solution-common";
import { _templatizeParentByWebMapLayerId } from "./_templatizeParentByWebMapLayerId";
import { _templatizeParentByURL } from "./_templatizeParentByURL";
/**
 * These tests will run prior to the tests associated with the higher level tests based on sort order.
 * The tests work more like cloning an object where we go through and review each individual property.
 * If we find a url or webmap layer id we will templatize the parent object that contains this property.
 * Many widgets will store one of these two properties in an object that will also contain various field references.
 *
 * @param obj The dataSource or widget object from the application
 * @param datasourceInfos A list of datasource info objects that contain key values to templatize field references
 * @returns An updated instance of the dataSource or widget with as many field references templatized as possible.
 * @private
 */

export function _prioritizedTests(
  obj: any,
  datasourceInfos: IDatasourceInfo[],
  templatizeKeys: boolean
): any {
  const objString: string = JSON.stringify(obj);
  const hasDatasources = datasourceInfos.filter(ds => {
    let urlTest: any;
    if (ds.url && !isNaN(ds.layerId)) {
      urlTest = new RegExp(ds.url.replace(/[.]/, `.layer${ds.layerId}.`), "gm");
    }

    let hasMapLayerId: boolean = false;
    if (ds.ids.length > 0) {
      hasMapLayerId = ds.ids.some(id => {
        const idTest: any = new RegExp(id, "gm");
        return idTest.test(objString);
      });
    }

    if (hasMapLayerId || (urlTest && urlTest.test(objString))) {
      return ds;
    }
  });
  if (hasDatasources.length > 0) {
    hasDatasources.forEach(ds => {
      // specific url reference is the most common
      obj = _templatizeParentByURL(obj, ds, templatizeKeys);
      // the second most common is to use the layerId from the webmap
      ds.ids.forEach(id => {
        obj = _templatizeParentByWebMapLayerId(obj, ds, id, templatizeKeys);
      });
    });
  }
  return obj;
}
