/*
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

import * as mCommon from "../common";
import {getProp} from '../utils/object-helpers';
import { ITemplate } from "../interfaces";

// -- Exports -------------------------------------------------------------------------------------------------------//

/**
 * Gets the ids of the dependencies of an AGOL webapp item.
 *
 * @param fullItem A webapp item whose dependencies are sought
 * @return A promise that will resolve with list of dependent ids
 * @protected
 */
export function getDependencies (
  fullItem: ITemplate
): Promise<string[]> {
  return new Promise(resolve => {
    const dependencies:string[] = [];

    const values = getProp(fullItem, "data.values");
    if (values) {
      if (values.webmap) {
        dependencies.push(values.webmap);
      }
      if (values.group) {
        dependencies.push(values.group);
      }
    }

    resolve(dependencies);
  });
}

/**
 * Swizzles the ids of the dependencies of an AGOL webapp item.
 *
 * @param fullItem A webapp item whose dependencies are to be swizzled
 * @param swizzles Hash mapping original ids to replacement ids
 * @protected
 */
export function swizzleDependencies (
  fullItem: ITemplate,
  swizzles: mCommon.ISwizzleHash
): void {
  // Swizzle its webmap or group
  const values = getProp(fullItem, "data.values");
  if (values) {
    if (values.webmap) {
      values.webmap = swizzles[values.webmap].id;
    } else if (values.group) {
      values.group = swizzles[values.group].id;
    }
  }
}
