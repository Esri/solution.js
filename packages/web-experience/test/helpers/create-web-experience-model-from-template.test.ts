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

import { createWebExperienceModelFromTemplate } from "../../src/helpers/create-web-experience-model-from-template";
import * as hubModule from "@esri/hub-common";

import * as utils from "../../../common/test/mocks/utils";
const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

describe("createWebExperienceModelFromTemplate :: ", () => {
  it("interpolates values", async () => {
    const adlibSpy = spyOn(hubModule, "interpolate").and.callThrough();
    const tmpl = {
      itemId: "bc3",
      type: "Web Experience",
      key: "foo",
      item: {
        thumbnail: "thumbnail",
        properties: {
          key: "{{val}}",
        },
      } as any,
      data: {
        chk: `{{val2}}`,
      },
    } as hubModule.IModelTemplate;

    const settings = {
      val: "rabbit",
      val2: "cat",
    };
    const model = await createWebExperienceModelFromTemplate(tmpl, settings, {}, MOCK_USER_SESSION);
    expect(model.item.thumbnail).toEqual("thumbnail");
    expect(model.item.properties.key).withContext("should interpolate item").toBe("rabbit");
    expect(model.data.chk).withContext("should interpolate data").toBe("cat");
    expect(adlibSpy.calls.count()).withContext("should interpolate").toBe(1);
  });
});
