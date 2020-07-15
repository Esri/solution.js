import { getProp } from "@esri/hub-common";
/**
 *
 * @param model
 * @private
 */

export function _getWABDependencies(model: any): string[] {
  const deps = [] as string[];
  const v = getProp(model, "data.map.itemId");
  if (v) {
    deps.push(v);
  }
  const dataSources = getProp(model, "data.dataSource.dataSources");
  if (dataSources) {
    Object.keys(dataSources).forEach(k => {
      const ds: any = dataSources[k];
      if (ds.itemId) {
        deps.push(ds.itemId);
      }
    });
  }
  return deps;
}
