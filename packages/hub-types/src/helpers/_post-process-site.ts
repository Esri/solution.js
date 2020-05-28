/** @license
 * Copyright 2020 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
        id: e.id,
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
