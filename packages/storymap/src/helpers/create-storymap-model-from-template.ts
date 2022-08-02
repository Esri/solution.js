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
/**
 * Given a template, process it and interpolate it such that
 * we have a model that is ready to be sent to the Portal API
 */

import { interpolate, IModelTemplate } from "@esri/hub-common";
import { ArcGISIdentityManager } from "@esri/solution-common";
import { getPortalEnv } from "./get-portal-env";
import { getStoryMapBaseUrl } from "./get-storymap-base-url";
import { getStoryMapSubdomain } from "./get-storymap-subdomain";

export function createStoryMapModelFromTemplate(
  templateModel: IModelTemplate,
  settings: any,
  transforms: any,
  authentication: ArcGISIdentityManager
): Promise<any> {
  const timestamp = new Date().getTime();
  // Keep these around in case we encounter some old templates
  settings.agoenv = getPortalEnv(authentication);
  settings.smBase = getStoryMapSubdomain(authentication);
  settings.timestamp = new Date().getTime();
  // These are used in the oembed resource, as well as the item url
  // they have `{{appid}}` in them so that the id of the created item
  // will be interpolated into it after the item is created
  settings.storyMapBaseUrl = getStoryMapBaseUrl(authentication);
  settings.storyMapTemplateUrl = `${settings.storyMapBaseUrl}/stories/{{appid}}`;
  settings.storyMapThumnailUrl = `${authentication.portal}/content/items/{{appid}}/info/thumbnail/thumbnail.jpg/?w=400&d=${timestamp}`;

  const model = interpolate(templateModel, settings, transforms);

  return Promise.resolve(model);
}
