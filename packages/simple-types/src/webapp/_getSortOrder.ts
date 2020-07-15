import { IDatasourceInfo } from "@esri/solution-common";
/**
 * Determine an order for checking field names against a dataSource or widget.
 * Sort order preference is set in this order: layer url, web map layer id, service url, agol itemId
 *
 * @param datasourceInfo The datasource object with key properties about the service.
 * @param testString A stringified version of a widget or dataSource
 * @returns The prioritized order for testing
 * @private
 */

export function _getSortOrder(
  datasourceInfo: IDatasourceInfo,
  testString: string
): number {
  const url = datasourceInfo.url;
  const itemId = datasourceInfo.itemId;
  const layerId = datasourceInfo.layerId;

  // if we have the url and the layerID and its found prioritize it first
  // else if we find the maps layer id prioritze it first
  let layerUrlTest: any;
  if (url && !isNaN(layerId)) {
    layerUrlTest = new RegExp(
      url.replace(/[.]/, ".layer" + layerId + "."),
      "gm"
    );
  }
  if (layerUrlTest && layerUrlTest.test(testString)) {
    return 1;
  } else if (datasourceInfo.ids.length > 0) {
    if (
      datasourceInfo.ids.some(id => {
        const layerMapIdTest: any = new RegExp(id, "gm");
        return layerMapIdTest.test(testString);
      })
    ) {
      return 1;
    }
  }

  // if neither full layer url or map layer id are found...check to see if we can
  // find the base service url
  if (url) {
    const serviceUrlTest: any = new RegExp(url, "gm");
    if (serviceUrlTest.test(testString)) {
      return 2;
    }
  }
  // if none of the above see if we can find an AGOL item id reference
  if (itemId) {
    const itemIdTest: any = new RegExp(itemId, "gm");
    if (itemIdTest.test(testString)) {
      return 3;
    }
  }
  return 4;
}
