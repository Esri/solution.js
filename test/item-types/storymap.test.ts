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

import {
  extractDependencies,
  getCascadeDependencies,
  getMapJournalDependencies,
  getMapSeriesDependencies
 } from '../../src/itemTypes/storymap';
import TestCascade from '../fixtures/cascade-storymap';
import TestMapJournal from '../fixtures/mapjournal-storymap';
import TestMapSeries from '../fixtures/mapseries-storymap';
import {cloneObject} from '../../src/utils/object-helpers';

describe('Story Maps :: ', () => {
  describe('generic functions', () => {

    describe('getting dependencies', () => {
      it('can get dependencies for a cascade', () => {
        const m = {
          item: {
            typeKeywords: ['Story Map', 'Cascade']
          },
          data: cloneObject(TestCascade)
        };
        const r = extractDependencies(m);
        expect(r).toBeTruthy('should return a value');
        expect(Array.isArray(r)).toBeTruthy('should be an array');
        expect(r.length).toEqual(4, 'should find 4');
        expect(r.includes('234a94478490445cb4a57878451cb4b8')).toBeTruthy();
        expect(r.includes('7db923b748c44666b09afc83ce833b87')).toBeTruthy();
      });

      it('works for Map Journal', () => {
        const m = cloneObject(TestMapJournal);
        m.typeKeywords = ['Story Map', 'MapJournal']

        const r = extractDependencies(m);
        expect(r).toBeTruthy('should return a value');
        expect(Array.isArray(r)).toBeTruthy('should be an array');
        expect(r.length).toEqual(3, 'should have 3 entries');
        expect(r).toEqual(['234', '567', '91b46c2b162c48dba264b2190e1dbcff']);
      });

      it('works for Map Series', () => {
        const m = cloneObject(TestMapSeries);
        m.typeKeywords = ['Story Map', 'mapseries']

        const r = extractDependencies(m);
        expect(r).toBeTruthy('should return a value');
        expect(Array.isArray(r)).toBeTruthy('should be an array');
        expect(r.length).toEqual(3, 'should have 3 entries');
        expect(r).toEqual(['123','234', '567']);
      });

      it('returns empty array if run on a non-storymap item', () => {
        const m = {
          item: {
            typeKeywords: ['other']
          },
          data: {}
        };

        const r = extractDependencies(m);
        expect(r).toBeTruthy('should return a value');
        expect(Array.isArray(r)).toBeTruthy('should be an array');
        expect(r.length).toEqual(0, 'should have 0 entries');

      });
    });




  });
  describe('Cascade :: ', () => {
    it('gets deps from deep in cascade', () => {
      const m = {
        item: {},
        data: cloneObject(TestCascade)
      };
      const r = getCascadeDependencies(m);
      expect(r).toBeTruthy('should return a value');
      expect(Array.isArray(r)).toBeTruthy('should be an array');
      expect(r.length).toEqual(4, 'should find 4');
      expect(r.includes('234a94478490445cb4a57878451cb4b8')).toBeTruthy();
      expect(r.includes('7db923b748c44666b09afc83ce833b87')).toBeTruthy();
    });

    it('works with no sections', () => {
      const m = {
        item: {},
        data: cloneObject(TestCascade)
      };
      delete m.data.values.sections;
      const r = getCascadeDependencies(m);
      expect(r).toBeTruthy('should return a value');
      expect(Array.isArray(r)).toBeTruthy('should be an array');
      expect(r.length).toEqual(0, 'should find 0');
    });

  });

  describe('MapJournal :: ', () => {

    it('gets dependencies for a map journal', () => {
      const r = getMapJournalDependencies(cloneObject(TestMapJournal));
      expect(r).toBeTruthy('should return a value');
      expect(Array.isArray(r)).toBeTruthy('should be an array');
      expect(r.length).toEqual(3, 'should have 3 entries');
      expect(r).toEqual(['234', '567', '91b46c2b162c48dba264b2190e1dbcff']);

    });

    it('works if no sections present', () => {
      const m = cloneObject(TestMapJournal);
      delete m.data.values.story.sections;
      const r = getMapJournalDependencies(m);
      expect(r).toBeTruthy('should return a value');
      expect(Array.isArray(r)).toBeTruthy('should be an array');
      expect(r.length).toEqual(0, 'should have 0 entries');
    });

  });

  describe('Map Series :: ', () => {
    it('gets dependencies', () => {
      const r = getMapSeriesDependencies(cloneObject(TestMapSeries));
      expect(r).toBeTruthy('should return a value');
      expect(Array.isArray(r)).toBeTruthy('should be an array');
      expect(r.length).toEqual(3, 'should have 3 entries');
      expect(r).toEqual(['123','234', '567']);
    });

    it('removes duplicates', () => {
      const m = cloneObject(TestMapSeries);
      // create a dupe
      m.data.values.webmap = '234';
      const r = getMapSeriesDependencies(m);
      expect(r).toBeTruthy('should return a value');
      expect(Array.isArray(r)).toBeTruthy('should be an array');
      expect(r.length).toEqual(2, 'should have 2 entries');
      expect(r).toEqual(['234', '567']);
    });

    it('works if no webmap is present', () => {
      const m = cloneObject(TestMapSeries);
      delete m.data.values.webmap;
      const r = getMapSeriesDependencies(m);
      expect(r).toBeTruthy('should return a value');
      expect(Array.isArray(r)).toBeTruthy('should be an array');
      expect(r.length).toEqual(2, 'should have 2 entries');
      expect(r).toEqual(['234', '567']);
    });

    it('works if no entries are present', () => {
      const m = cloneObject(TestMapSeries);
      delete m.data.values.story.entries;
      const r = getMapSeriesDependencies(m);
      expect(r).toBeTruthy('should return a value');
      expect(Array.isArray(r)).toBeTruthy('should be an array');
      expect(r.length).toEqual(1, 'should have 1 entries');
      expect(r).toEqual(['123']);
    });

  });

});