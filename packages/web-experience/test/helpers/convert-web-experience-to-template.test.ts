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

import { cloneObject, without } from "@esri/hub-common";

import { convertWebExperienceToTemplate } from "../../src/helpers/convert-web-experience-to-template";
import * as utils from "../../../common/test/mocks/utils";

import { ExBee } from "../fixtures/exb-map-and-images";

const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

describe("convertWebExperienceToTemplate :: ", () => {
  it("converts to a template and extracts dependencies", () => {
    const model = cloneObject(ExBee);

    return convertWebExperienceToTemplate(model, MOCK_USER_SESSION).then(
      tmpl => {
        ["itemId", "type", "item", "data", "dependencies"].forEach(p => {
          expect(tmpl[p]).toBeDefined(`should have ${p} prop defined`);
        });
        expect(
          tmpl.item.typeKeywords.indexOf(`status: Published`)
        ).toBeGreaterThan(-1, "should have published keyword");
        expect(tmpl.item.typeKeywords.indexOf(`status: Changed`)).toBe(
          -1,
          "should not have changed keyword"
        );
        expect(tmpl.dependencies.length).toBe(1, "should extract the webmap");
        expect(tmpl.dependencies[0]).toBe(
          "8644de121e434a368a6221c0498e4e47",
          "should extract the webmap id"
        );
      }
    );
  });

  it("other keyword paths", () => {
    const model = cloneObject(ExBee);
    // ExB's will always have either status: Changed OR status: Published
    model.item.typeKeywords = without(
      model.item.typeKeywords,
      "status: Changed"
    );
    model.item.typeKeywords.push("status: Published");
    return convertWebExperienceToTemplate(model, MOCK_USER_SESSION).then(
      tmpl => {
        expect(
          tmpl.item.typeKeywords.indexOf(`status: Published`)
        ).toBeGreaterThan(-1, "should have published keyword");
        expect(tmpl.item.typeKeywords.indexOf(`status: Changed`)).toBe(
          -1,
          "should not have changed keyword"
        );
      }
    );
  });
});
