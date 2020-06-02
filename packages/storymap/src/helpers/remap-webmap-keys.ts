/** @license
 * Copyright 2018 Esri
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

import { getProp } from "@esri/hub-common";

/**
 * For some reason, the webmap resource key names are fancier than other resource keys
 * They look like this: r-<webmap-item-id>-<timestamp>
 * This interpolation is hard to accomplish given our current setup, so we're just overwriting
 * them with "webmap0", "webmap1" and so forth. This _seems_ to make no difference.
 * @param model
 */
export function remapWebmapKeys(resources: any = {}): any[] {
  let webmapCounter = 0;
  return Object.keys(resources).reduce((acc, key) => {
    if (getProp(resources, `${key}.type`) === "webmap") {
      acc.push({
        original: key,
        updated: `webmap${webmapCounter}`
      });
      webmapCounter++;
    }
    return acc;
  }, []);
}
