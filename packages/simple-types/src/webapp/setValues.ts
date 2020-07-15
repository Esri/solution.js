import { IItemTemplate, setProp } from "@esri/solution-common";
import { getProp } from "@esri/hub-common";
/**
 *
 * @param itemTemplate
 * @param paths
 * @param base
 * @private
 */

export function setValues(
  itemTemplate: IItemTemplate,
  paths: string[],
  base: string
) {
  paths.forEach(path => {
    const url: string = getProp(itemTemplate, path);
    if (url) {
      const subString: string = url.substring(
        url.indexOf("/", url.indexOf("//") + 2)
      );
      setProp(itemTemplate, path, subString !== url ? base + subString : base);
    }
  });
}
