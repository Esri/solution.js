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

import * as utils from "@esri/solution-common/test/mocks/utils";
import { IItem } from "@esri/solution-common";
const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

describe("createWebExperienceModelFromTemplate :: ", () => {
  it("interpolates values", () => {
    const adlibSpy = spyOn(hubModule, "interpolate").and.callThrough();
    const tmpl = {
      itemId: "bc3",
      type: "Web Experience",
      key: "foo",
      item: {
        properties: {
          key: "{{val}}"
        }
      } as IItem,
      data: {
        chk: `{{val2}}`
      }
    } as hubModule.IModelTemplate;

    const settings = {
      val: "rabbit",
      val2: "cat"
    };
    return createWebExperienceModelFromTemplate(
      tmpl,
      settings,
      {},
      MOCK_USER_SESSION
    ).then(model => {
      expect(model.item.properties.key).toBe(
        "rabbit",
        "should interpolate item"
      );
      expect(model.data.chk).toBe("cat", "should interpolate data");
      expect(adlibSpy.calls.count()).toBe(1, "should interpolate");
    });
  });
});
