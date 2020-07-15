import { getProps } from "@esri/solution-common";
/**
 * Generic Web App Dependencies
 * @param model
 * @private
 */

export function _getGenericWebAppDependencies(model: any): any {
  const props = ["data.values.webmap", "data.values.group"];
  return getProps(model, props);
}
