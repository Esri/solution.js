import { hasAnyKeyword } from "@esri/solution-common";
import { _getWABDependencies } from "./_getWABDependencies";
import { _getGenericWebAppDependencies } from "./_getGenericWebAppDependencies";
/**
 * Gets the ids of the dependencies of an AGOL webapp item.
 *
 * @param fullItem A webapp item whose dependencies are sought
 * @return A promise that will resolve with list of dependent ids
 * @private
 */

export function _extractDependencies(model: any): string[] {
  let processor = _getGenericWebAppDependencies;

  if (hasAnyKeyword(model, ["WAB2D", "WAB3D", "Web AppBuilder"])) {
    processor = _getWABDependencies;
  }

  return processor(model);
}
