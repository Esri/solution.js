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
  getProp,
  cloneObject,
  getProps,
  getDeepValues
} from '../../src/utils/object-helpers';

describe('object-helpers', () => {

  describe('getDeepValues', () => {
    
  it('returns empty array if non object sent in', () => {
    expect(Array.isArray(getDeepValues(null, 'foo'))).toBeTruthy();
  });

  it('only looks at own props', () => {
    const parent = {
      prop: 'fromParent'
    };
    const child = Object.create(parent);
    child.childProp = 'red';
    expect(getDeepValues(child, 'childProp')).toEqual(['red'], 'finds own prop');
    expect(getDeepValues(child, 'prop')).toEqual([], 'does not find parent prop');
  });


  it('plucks a top level value', () => {
    const m = {
      webmap: '3ef'
    };
    expect(getDeepValues(m, 'webmap')).toEqual(['3ef'], 'finds top level prop');
  });

  it('finds a nested value', () => {
    const m = {
      nest: {
        webmap: '3ef',
        str: 'just a string'
      }
    };
    expect(getDeepValues(m, 'webmap')).toEqual(['3ef'], 'finds nested prop');
  });

  it('finds multiple values', () => {
    const n = {
      arr: [
        {
          webmap: '3ef'
        },
        {
          component: {
            type: {
              webmap: 'bcf'
            }
          }
        }
      ]
    };
    const chk = getDeepValues(n, 'webmap');
    expect(chk.length).toEqual(2, 'should find two in array');
    expect(chk[0]).toEqual('3ef', 'should find string');
    expect(chk[1]).toEqual('bcf', 'should find nested');
  });

  it('looks into arrays', () => {
    const o = {
      webmap: {
        id: 'in-the-obj'
      },
      other: {
        thing: {
          webmap: {
            id: 'three-deep'
          }
        }
      },
      arr: [
        {
          nest: [
            {
              webmap: {
                id: 'two-arrys'
              }
            }
          ]
        }
      ]
    };
    const chk2 = getDeepValues(o, 'webmap');
    expect(chk2.length).toEqual(3, 'should find 3');
    expect(chk2[0] as any).toEqual({id: 'in-the-obj'}, 'should find first obj');
    expect(chk2[1] as any).toEqual({id: 'three-deep'}, 'should find nested obj');
    expect(chk2[2] as any).toEqual({id: 'two-arrys'}, 'should find nested obj');
  });
  });
  
  describe('cloneObject', () => {
    it("can clone a shallow object", () => {
      const obj = {
        color: "red",
        length: 12
      } as any;
      const c = cloneObject(obj);
      expect(c).not.toBe(obj);
  
      ["color", "length"].map(prop => {
        expect(c[prop]).toEqual(obj[prop]);
      });
    });
  
    it("can clone a deep object", () => {
      const obj = {
        color: "red",
        length: 12,
        field: {
          name: "origin",
          type: "string"
        }
      } as any;
      const c = cloneObject(obj);
      expect(c).not.toBe(obj);
      expect(c.field).not.toBe(obj.field);
  
      ["color", "length"].map(prop => {
        expect(c[prop]).toEqual(obj[prop]);
      });
      ["name", "type"].map(prop => {
        expect(c.field[prop]).toEqual(obj.field[prop]);
      });
    });
  
    it("does not stringify null", () => {
      const obj = {
        color: "red",
        length: 12,
        field: {
          name: "origin",
          type: null
        }
      } as any;
      const c = cloneObject(obj);
      expect(c).not.toBe(obj);
      expect(c.field).not.toBe(obj.field);
      expect(c.field.type).toBe(null);
  
      ["color", "length"].map(prop => {
        expect(c[prop]).toEqual(obj[prop]);
      });
      ["name", "type"].map(prop => {
        expect(c.field[prop]).toEqual(obj.field[prop]);
      });
    });
  
    it("can clone a deep object with an array", () => {
      const obj = {
        color: "red",
        length: 12,
        field: {
          name: "origin",
          type: "string"
        },
        names: ["steve", "james", "bob"],
        deep: [
          {
            things: ["one", "two", "red", "blue"]
          }
        ],
        addresses: [
          {
            street: "123 main",
            city: "anytown",
            zip: 82729
          },
          {
            street: "876 main",
            city: "anytown",
            zip: 123992
          }
        ]
      } as any;
  
      const c = cloneObject(obj);
      expect(c).not.toBe(obj);
      expect(c.field).not.toBe(obj.field);
      expect(c.names).not.toBe(obj.names);
      expect(c.names.length).toEqual(obj.names.length);
      expect(Array.isArray(c.deep)).toBeTruthy();
      expect(c.deep[0].things.length).toBe(4);
      ["color", "length"].map(prop => {
        expect(c[prop]).toEqual(obj[prop]);
      });
      ["name", "type"].map(prop => {
        expect(c.field[prop]).toEqual(obj.field[prop]);
      });
      // deep array...
      expect(Array.isArray(c.addresses)).toBeTruthy();
      expect(c.addresses.length).toEqual(obj.addresses.length);
  
      c.addresses.forEach((entry: any, idx: number) => {
        const orig = obj.addresses[idx];
        expect(entry).not.toBe(orig);
        ["street", "city", "zip"].map(prop => {
          expect(entry[prop]).toBe(orig[prop]);
        });
      });
    });
  });

  describe('getProp', () => {
    
    it('should return a property given a path', () => {
      expect(getProp({color:'red'}, 'color')).toEqual('red', 'should return the prop');
    });

    it('should return a deep property given a path', () => {
      expect(getProp({color: {r: 'ff', g:'00', b:'ff'}}, 'color.r')).toEqual('ff', 'should return the prop');
    });

  });

  describe('getProps', () => {
    
    it('should return an array of props', () => {
      const  o = {
        one: {
          two: {
            three: {
              color: 'red'
            },
            threeB: {
              color: 'orange'
            }
          },
          other: 'value'
        }
      };

      const vals = getProps(o, ['one.two.three.color', 'one.two.threeB.color']);
      expect(vals.length).toEqual(2, 'should return two values');
      expect(vals.indexOf('red')).toBeGreaterThan(-1, 'should have red');
      expect(vals.indexOf('orange')).toBeGreaterThan(-1, 'should have orange');

    });

    it('should push an array into the return values', () => {
      const o = {
        one: {
          two: [
            'a', 'b'
          ],
          color: 'red'
        }
      };
      const vals = getProps(o, ['one.two', 'one.color']);
      expect(vals.length).toEqual(2, 'should return two values');
      expect(vals.indexOf('red')).toBeGreaterThan(-1, 'should have red');

    });

    it('should handle missing props', () => {
      const o = {
        one: {
          two: [
            'a', 'b'
          ],
          color: 'red'
        }
      };
      const vals = getProps(o, ['one.two', 'one.color', 'thing.three']);
      expect(vals.length).toEqual(2, 'should return two values');
      expect(vals.indexOf('red')).toBeGreaterThan(-1, 'should have red');
    });
    

  });

});