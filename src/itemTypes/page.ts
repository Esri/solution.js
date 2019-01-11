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

/**
 * Page Item Utility Functions
 */
import { getProp } from '../utils/object-helpers';
import { getLayoutDependencies } from '../utils/layout-dependencies';

/**
 * Return a list of items this page depends on.
 * Currently this is just considering the layout
 */
export function getDependencies (
  model: any
  ): Promise<string[]>  {
  const layout = getProp(model, 'data.values.layout') || {};
  return Promise.resolve(getLayoutDependencies(layout));
};

