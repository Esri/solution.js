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
  getDependencies
} from '../../src/itemTypes/survey'

describe('Surveys', () => {
  
  describe('get dependencies', () => {
    
    it('always returns an empty array', (done) => {
      getDependencies({item:{}, data:{}})
        .then((r) => {
          expect(r).toBeTruthy('should return a value');
            expect(Array.isArray(r)).toBeTruthy('should be an array');
            expect(r.length).toEqual(0, 'should have 0 entries');
          done();
        });
    });

  });

});