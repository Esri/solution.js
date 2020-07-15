import {
  IDatasourceInfo,
  templatizeFieldReferences
} from "@esri/solution-common";
import { _prioritizedTests } from "./_prioritizedTests";
import { _getReplaceOrder } from "./_getReplaceOrder";
/**
 * Templatize field references for given dataSource from the web application.
 *
 * @param obj The dataSource or widget object from the web application.
 * @param datasourceInfos A list of datasource info objects that contain key values to templatize field references
 * @returns The dataSource with templatized field references
 * @private
 */

export function _templatizeObject(
  obj: any,
  datasourceInfos: IDatasourceInfo[],
  templatizeKeys: boolean = false
): any {
  obj = _prioritizedTests(obj, datasourceInfos, templatizeKeys);
  const replaceOrder: IDatasourceInfo[] = _getReplaceOrder(
    obj,
    datasourceInfos
  );
  replaceOrder.forEach(ds => {
    obj = templatizeFieldReferences(
      obj,
      ds.fields,
      ds.basePath,
      templatizeKeys
    );
  });
  return obj;
}
