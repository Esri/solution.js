import { IModel, IHubRequestOptions } from "@esri/hub-common";

import {
  _getSecondPassSharingOptions,
  _shareItemsToSiteGroups,
  _updatePages
} from "@esri/hub-sites";

import { _updateSitePages } from "./_update-site-pages";

// TODO Implement in Hub.js
export function _postProcessSite(
  siteModel: IModel,
  itemInfos: any[],
  hubRequestOptions: IHubRequestOptions
): Promise<boolean> {
  // convert the itemInfo's into things that look enough like a model
  // that we can call _shareItemsToSiteGroups
  const pseudoModels = itemInfos.map(e => {
    return {
      item: {
        id: e.itemId,
        type: e.type
      }
    };
  });

  let secondPassPromises: Array<Promise<any>> = [];
  secondPassPromises = secondPassPromises.concat(
    _shareItemsToSiteGroups(
      siteModel,
      (pseudoModels as unknown) as IModel[],
      hubRequestOptions
    )
  );

  // we can't use that same trick w/ the page sharing
  // because we really need the models themselves
  // so we delegate to a local function
  secondPassPromises = secondPassPromises.concat(
    _updateSitePages(siteModel, itemInfos, hubRequestOptions)
  );
  return Promise.all(secondPassPromises).then(() => {
    return true;
  });
}
