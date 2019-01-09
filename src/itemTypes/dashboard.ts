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

import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

import * as mCommon from "../common";
import {getProp} from '../utils/object-helpers';
import { ITemplate } from "../interfaces";

// -- Exports -------------------------------------------------------------------------------------------------------//

/**
 * The relevant elements of a Dashboard widget.
 * @protected
 */
interface IDashboardWidget {
  /**
   * AGOL item id for some widget types
   */
  itemId: string;
  /**
   * Dashboard widget type
   */
  type: string;
}

/**
 * Gets the ids of the dependencies of an AGOL dashboard item.
 *
 * @param fullItem A dashboard item whose dependencies are sought
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve with list of dependent ids
 * @protected
 */
export function getDependencies (
  fullItem: ITemplate,
  requestOptions: IUserRequestOptions
): Promise<string[]> {
  return new Promise(resolve => {
    const dependencies:string[] = [];

    const widgets:IDashboardWidget[] = getProp(fullItem, "data.widgets");
    if (widgets) {
      widgets.forEach((widget:any) => {
        if (widget.type === "mapWidget") {
          dependencies.push(widget.itemId);
        }
      })
    }

    resolve(dependencies);
  });
}

/**
 * Swizzles the ids of the dependencies of an AGOL dashboard item.
 *
 * @param fullItem A dashboard item whose dependencies are to be swizzled
 * @param swizzles Hash mapping original ids to replacement ids
 * @protected
 */
export function swizzleDependencies (
  fullItem: ITemplate,
  swizzles: mCommon.ISwizzleHash
): void {
  // Swizzle its webmap(s)
  const widgets:IDashboardWidget[] = getProp(fullItem, "data.widgets");
  if (Array.isArray(widgets)) {
    widgets.forEach(widget => {
      if (widget.type === "mapWidget") {
        widget.itemId = swizzles[widget.itemId].id;
      }
    });
  }
}
