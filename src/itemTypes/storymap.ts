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

import {getProp, getProps, getDeepValues} from '../utils/object-helpers';
import { hasTypeKeyword, parseIdFromUrl } from '../utils/item-helpers';

/**
 * Return a list of items this depends on
 */
export function getDependencies (
  model:any)
  : Promise<string[]> {
  // unknown types have no deps...
  let processor = (m:any) => [] as any;
  // find known types by typeKeyword
  if (hasTypeKeyword(model, 'Cascade')) {
    processor = getCascadeDependencies;
  }
  if (hasTypeKeyword(model, 'MapJournal')) {
    processor = getMapJournalDependencies;
  }

  if (hasTypeKeyword(model, 'mapseries')) {
    processor = getMapSeriesDependencies;
  }
  // execute
  return Promise.resolve(processor(model));
};

/**
 * Cascade specific logic
 */
export function getCascadeDependencies (
  model:any
  ):string[] {
  // Cascade Example QA b908258efbba4f019450db46382a0c13
  const sections = getProp(model, 'data.values.sections') || [];
  return sections.reduce((a:any, s:any) => {
    return a.concat(getDeepValues(s, 'webmap').map((e:any) => {
      return e.id;
    }));
  }, []);
};

/**
 * Map Series specific logic
 */
export function getMapSeriesDependencies (
  model:any
  ):string[] {
  const deps = getProps(model, ['data.values.webmap']);
  const entries = getProp(model, 'data.values.story.entries') || [];
  entries.forEach((e:any) => {
    const entryWebmaps = getDeepValues(e, 'webmap').map((obj:any) => {
      return obj.id;
    });
    // may be dupes...
    entryWebmaps.forEach((id) => {
      if (deps.indexOf(id) === -1) {
        deps.push(id);
      }
    });
  });
  return deps;
};

export function getMapJournalDependencies (
  model:any
  ):string[] {
  // MapJournal example QA 4c4d084c22d249fdbb032e4143c62546
  const sections = getProp(model, 'data.values.story.sections') || [];

  const deps = sections.reduce((a:any, s:any) => {
    if (s.media) {
      if (s.media.type === 'webmap') {
        const v = getProp(s, 'media.webmap.id');
        if (v) {
          a.push(v);
        }
      }
      if (s.media.type === 'webpage') {
        const url = getProp(s, 'media.webpage.url');
        const id = parseIdFromUrl(url);
        if (id) {
          a.push(id);
        }
      }
    }
    return a;
  }, []);
  return deps;
};
