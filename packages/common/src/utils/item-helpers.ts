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


import {getProp} from '../utils/object-helpers';
import isGuid from '../utils/is-guid';

/**
 * Does the model have a specific typeKeyword?
 */
export function hasTypeKeyword (
  model:any,
  keyword:string
  ):boolean {
  const typeKeywords = getProp(model, 'item.typeKeywords') || model.typeKeywords || [];
  return typeKeywords.includes(keyword);
};

/**
 * Does the model have any of a set of keywords
 */
export function hasAnyKeyword (
  model:any,
  keywords:string[]
  ):boolean {
  const typeKeywords = getProp(model, 'item.typeKeywords') || model.typeKeywords || [];
  return keywords.reduce((a, kw) => {
    if (!a) {
      a = typeKeywords.includes(kw);
    }
    return a;
  }, false);
};

/**
 * Given the url of a webapp, parse our the id from the url
 */
export function parseIdFromUrl (
  url:string
  ):string {
  let id = null;
  if (!url) {
    return id;
  }
  const qs = url.split('?')[1];
  if (qs) {
    id = qs.split('&').reduce((a, p) => {
      const part = p.split('=')[1];
      if (part && isGuid(part)) {
        a = part;
      }
      return a;
    }, null);
  }
  return id;
};

/**
 * Return a random number, prefixed with a string. Used for unique identifiers that do not require
 * the rigor of a full UUID - i.e. node id's, process ids etc.
 * @param prefix String to prefix the random number with so the result is a valid javascript property
 */
export function createId (
  prefix: string = "i"
  ): string {
  // prepend some char so it's always a valid dotable property name
  // get a random number, convert to base 36 representation, then grab chars 2-8
  return `${prefix}${Math.random()
    .toString(36)
    .substr(2, 8)}`;
}
