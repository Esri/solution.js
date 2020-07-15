import { IDatasourceInfo } from "@esri/solution-common";
import { _templatizeObject } from "./_templatizeObject";
/**
 * Templatize field references from an array of various objects from the web application.
 *
 * @param objects A list of widgets or objects from the web application that may contain field references.
 * @param datasourceInfos A list of datasource info objects that contain key values to templatize field references
 * @returns The widgets with templatized field references
 * @private
 */

export function _templatizeObjectArray(
  objects: any[],
  datasourceInfos: IDatasourceInfo[]
): any {
  const updateKeyObjects: string[] = ["SmartEditor", "Screening"];
  return objects.map(obj => {
    // only templatize the config and lower
    if (obj.config) {
      const templatizeKeys: boolean = updateKeyObjects.indexOf(obj.name) > -1;
      obj.config = _templatizeObject(
        obj.config,
        datasourceInfos,
        templatizeKeys
      );
    }
    return obj;
  });
}
