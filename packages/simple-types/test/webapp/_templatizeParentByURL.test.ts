/** @license
 * Copyright 2020 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as common from "@esri/solution-common";

import { _templatizeParentByURL } from "../../src/webapp/_templatizeParentByURL";

describe("webapp :: _templatizeParentByURL :: ", () => {
  it("handles missing url", () => {
    const datasourceInfo: common.IDatasourceInfo = {
      basePath: "934a9ef8efa7448fa8ddf7b13cef0240.layer1.fields",
      itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
      layerId: 1,
      ids: ["123", "456", "789"],
      fields: [],
      relationships: [],
      adminLayerInfo: {
        geometryField: {
          name: "Shape"
        }
      }
    };

    const expected: any = {} as { [index: string]: any };

    const actual = _templatizeParentByURL(null, datasourceInfo, false);
    expect(actual).toEqual(expected);
  });
  xit("templatizes string properties", () => {
    const dataSource = {
      itemId: "bc4",
      basePath: "two",
      fields: [],
      layerId: 13,
      url: "thing.other" // Honestly I'm not sure what this is expected to look like
    } as common.IDatasourceInfo;

    const obj = {
      noUrl: "just text",
      hasUrl: `test with thing.layer13.other the url`,
      deeper: {
        noUrl: "just text",
        hasUrl: `test with thing.layer13.other the url`,
        when: new Date()
      }
    };
    const actual = _templatizeParentByURL(obj, dataSource, false);
    const tmplObjSpy = spyOn(common, "templatizeFieldReferences").and.callFake(
      (obj, fields, basePath) => {
        obj[basePath] = `updated by ${basePath}`;
        return obj;
      }
    );
    expect(tmplObjSpy.calls.count()).toBe(2, "should call templatize twice");
    expect(actual).toEqual({});
  });
});
