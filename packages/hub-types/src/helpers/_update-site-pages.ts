import { IModel, IHubRequestOptions, getModel } from "@esri/hub-common";
import { _updatePages } from "@esri/hub-sites";
/**
 *
 * @param siteModel
 * @param itemInfos
 * @param hubRequestOptions
 */
export function _updateSitePages(
  siteModel: IModel,
  itemInfos: any[],
  hubRequestOptions: IHubRequestOptions
): Promise<any> {
  const pageIds = itemInfos
    .filter(e => {
      return e.type.indexOf("Page") > -1;
    })
    .map(e => e.itemId);

  // now get all those models
  return Promise.all(
    pageIds.map(id => {
      return getModel(id, hubRequestOptions);
    })
  ).then((pageModels: any) => {
    // now delegate back to hub.js internal _updatePages fn
    return _updatePages(siteModel, pageModels, hubRequestOptions);
  });
}
