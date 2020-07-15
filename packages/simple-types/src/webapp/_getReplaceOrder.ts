import { IDatasourceInfo } from "@esri/solution-common";
import { _getSortOrder } from "./_getSortOrder";
/**
 * Gets an order for testing with the various datasource info objects against the widget or dataSource.
 * A widget or dataSource that contain a layers url or webmap layer id are more likely
 * to have field references from that layer.
 *
 * @param obj The dataSource or widget object from the web application.
 * @param datasourceInfos A list of datasource info objects that contain key values to templatize field references
 * @returns A list of datasourceInfo objects sorted based on the presence of a layers url or id
 * @private
 */
export function _getReplaceOrder(obj: any, datasourceInfos: IDatasourceInfo[]) {
  const objString: string = JSON.stringify(obj);

  // If we don't find any layer url, web map layer id, service url, agol itemId then remove the datasource.
  const _datasourceInfos: IDatasourceInfo[] = datasourceInfos.filter(
    ds => _getSortOrder(ds, objString) < 4
  );
  return _datasourceInfos.sort((a, b) => {
    return _getSortOrder(a, objString) - _getSortOrder(b, objString);
  });
}
