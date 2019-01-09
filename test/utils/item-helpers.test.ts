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
   hasTypeKeyword,
   hasAnyKeyword,
   parseIdFromUrl
 } from '../../src/utils/item-helpers';

describe('item-helpers', () => {
  
  describe('hasKeyword', () => {
    it('accepts a model', () => {
      const m = {
        item: {
          typeKeywords: ['foo', 'bar']
        }
      }
      expect(hasTypeKeyword(m,'foo')).toBeTruthy();
      expect(hasTypeKeyword(m,'not-present')).toBeFalsy();
    });
    it('accepts an item', () => {
      const i = {
        typeKeywords: ['foo', 'bar']
      };
      expect(hasTypeKeyword(i,'foo')).toBeTruthy();
      expect(hasTypeKeyword(i,'not-present')).toBeFalsy();
    });
    it('works if typeKeywords is undefined', () => {
      const i = {
        notTypeKeywords: ['foo', 'bar']
      };
      expect(hasTypeKeyword(i,'foo')).toBeFalsy();
      expect(hasTypeKeyword(i,'not-present')).toBeFalsy();
    });
  });

  describe('hasAnyKeyword', () => {
    it('accepts a model', () => {
      const m = {
        item: {
          typeKeywords: ['foo', 'bar']
        }
      }
      expect(hasAnyKeyword(m,['bar'])).toBeTruthy();
      expect(hasAnyKeyword(m,['not-present'])).toBeFalsy();
    });
    it('accepts an item', () => {
      const i = {
        typeKeywords: ['foo', 'bar']
      };
      expect(hasAnyKeyword(i,['foo', 'bar'])).toBeTruthy();
      expect(hasAnyKeyword(i,['not-present'])).toBeFalsy();
    });
    it('works if typeKeywords is undefined', () => {
      const i = {
        notTypeKeywords: ['foo', 'bar']
      };
      expect(hasAnyKeyword(i,['foo', 'bar'])).toBeFalsy();
      expect(hasAnyKeyword(i,['not-present'])).toBeFalsy();
    });
  });


  describe('parseIdFromUrl', () => {
    it('works for common types', () => {
      const examples = [
        {
          url: 'https://www.arcgis.com/home/webscene/viewer.html?webscene=91b46c2b162c48dba264b2190e1dbcff&ui=min',
          expected: '91b46c2b162c48dba264b2190e1dbcff'
        },
        {
          url: 'https://www.arcgis.com/home/webscene/viewer.html?webmap=81b46c2b162c48dba264b2190e1dbcff&ui=min',
          expected: '81b46c2b162c48dba264b2190e1dbcff'
        },
        {
          url: 'https://www.arcgis.com/home/webscene/viewer.html?webmap=notaguid&ui=min',
          expected: null
        },
        {
          url: 'https://www.arcgis.com/home/webscene/viewer.html',
          expected: null
        },
      ];
      examples.forEach(ex => {
        const r = parseIdFromUrl(ex.url);
        expect(r).toEqual(ex.expected);
      });
    });
  });

});