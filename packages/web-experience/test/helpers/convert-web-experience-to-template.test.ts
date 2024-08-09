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

import { ExBee } from "../fixtures/exb-map-and-images";

describe("convertWebExperienceToTemplate :: ", () => {
  it("converts to a template and extracts dependencies", async () => {
    const model = cloneObject(ExBee);

    return convertWebExperienceToTemplate(model).then((tmpl) => {
      ["itemId", "type", "item", "data", "dependencies"].forEach((p) => {
        expect(tmpl[p]).toBeDefined(`should have ${p} prop defined`);
      });
      expect((tmpl.item.typeKeywords as any).indexOf(`status: Published`))
        .withContext("should have published keyword")
        .toBeGreaterThan(-1);
      expect((tmpl.item.typeKeywords as any).indexOf(`status: Changed`))
        .withContext("should not have changed keyword")
        .toBe(-1);
      expect(tmpl.dependencies.length).withContext("should extract the webmap").toBe(1);
      expect(tmpl.dependencies[0]).withContext("should extract the webmap id").toBe("8644de121e434a368a6221c0498e4e47");
    });
  });

  it("other keyword paths", async () => {
    const model = cloneObject(ExBee);
    // ExB's will always have either status: Changed OR status: Published
    model.item.typeKeywords = without(model.item.typeKeywords ?? [], "status: Changed");
    model.item.typeKeywords.push("status: Published");
    return convertWebExperienceToTemplate(model).then((tmpl) => {
      expect((tmpl.item.typeKeywords as any).indexOf(`status: Published`))
        .withContext("should have published keyword")
        .toBeGreaterThan(-1);
      expect((tmpl.item.typeKeywords as any).indexOf(`status: Changed`))
        .withContext("should not have changed keyword")
        .toBe(-1);
    });
  });
});
