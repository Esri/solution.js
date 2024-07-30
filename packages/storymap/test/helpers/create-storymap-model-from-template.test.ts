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
import { createStoryMapModelFromTemplate } from "../../src/helpers/create-storymap-model-from-template";

import * as hubModule from "@esri/hub-common";

import * as utils from "../../../common/test/mocks/utils";
const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

describe("createStoryMapModelFromTemplate :: ", () => {
  it("ammends settings, interpolates", async () => {
    const adlibSpy = spyOn(hubModule, "interpolate").and.callThrough();

    const tmpl = {
      itemId: "bc3",
      type: "StoryMap",
      key: "foo",
      item: {},
      data: {
        chkTs: `{{timestamp}}`,
        chkAgoEnv: `{{agoenv}}`,
        chkSmBase: "{{smBase}}",
      },
    } as hubModule.IModelTemplate;
    const settings = {};

    const result = await createStoryMapModelFromTemplate(tmpl, settings, {}, MOCK_USER_SESSION);
    expect(adlibSpy.calls.count()).withContext("should interpolate").toBe(1);
    const settingsHash = adlibSpy.calls.argsFor(0)[1];
    expect(settingsHash.agoenv).withContext("should pass in agoenv").toBe("www");
    expect(settingsHash.smBase).withContext("should pass in smbase").toBe("storymaps");
    expect(settingsHash.timestamp).withContext("should pass in a timestamp").toBeDefined();
    expect(result.data.chkTs)
      .withContext("timestamp should be less than current time")
      .toBeLessThanOrEqual(new Date().getTime());
    expect(result.data.chkAgoEnv).withContext("should interpolate agoenv").toBe("www");
    expect(result.data.chkSmBase).withContext("should interpolate smBase").toBe("storymaps");
  });
});
