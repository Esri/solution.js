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
import {getProp, getProps} from '../utils/object-helpers';
import {hasTypeKeyword, hasAnyKeyword} from '../utils/item-helpers';
import { ITemplate } from "../interfaces";
import {getDependencies as getStoryMapDependencies} from './storymap';
import {getDependencies as getWABDependencies} from './webappbuilder';

// -- Exports -------------------------------------------------------------------------------------------------------//

/**
 * Gets the ids of the dependencies of an AGOL webapp item.
 *
 * @param fullItem A webapp item whose dependencies are sought
 * @return A promise that will resolve with list of dependent ids
 * @protected
 */
export function getDependencies (
  model: any
): Promise<string[]> {

  let processor = getGenericWebAppDependencies;

  if (hasTypeKeyword(model, 'Story Map')) {
    processor = getStoryMapDependencies;
  }

  if (hasAnyKeyword(model, ['WAB2D', 'WAB3D', 'Web AppBuilder'])) {
    processor = getWABDependencies;
  }

  return processor(model);

};

/**
 * Generic Web App Dependencies
 */
export function getGenericWebAppDependencies (
  model:any
  ):Promise<string[]> {
  const props = ['data.webmap', 'data.itemId', 'data.values.webmap', 'data.values.group'];
  return Promise.resolve(getProps(model, props));
};


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
};
