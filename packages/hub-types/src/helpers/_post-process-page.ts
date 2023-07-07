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
import { IModel, IHubUserRequestOptions, interpolate } from "@esri/hub-common";
import { updatePage } from "@esri/hub-sites";

//TODO: function doc
export function _postProcessPage(
  pageModel: IModel,
  itemInfos: any[],
  templateDictionary: any,
  hubRequestOptions: IHubUserRequestOptions
): Promise<boolean> {
  // re-interpolate the siteModel using the itemInfos; no patches supplied
  pageModel = interpolate(pageModel, templateDictionary, {});
  return updatePage(pageModel, {
    ...hubRequestOptions,
    allowList: []
  }).then(() => {
    return true;
  });
}
