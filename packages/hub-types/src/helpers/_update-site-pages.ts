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
import { IModel, IHubUserRequestOptions, getModel } from "@esri/hub-common";
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
  hubRequestOptions: IHubUserRequestOptions
): Promise<any> {
  const pageIds = itemInfos
    .filter(e => {
      return e.type.indexOf("Page") > -1;
    })
    .map(e => e.id);

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
