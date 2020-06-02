/** @license
 * Copyright 2018 Esri
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

import { isHubFormTemplate } from "../../src/helpers/is-hub-form-template";
import * as templates from "../../../common/test/mocks/templates";

// ------------------------------------------------------------------------------------------------------------------ //

describe("isHubFormTemplate", () => {
  it("should return true for Hub Form templates", function() {
    const template = {
      ...templates.getItemTemplate("Form"),
      properties: {
        services: {
          service: {
            serviceInfo: {},
            layers: [] as any[]
          }
        }
      }
    };
    const result = isHubFormTemplate(template);
    expect(result).toBeTrue();
  });
  it("should return false for Solutions.js Form templates", function() {
    const template = templates.getItemTemplate("Form");
    const result = isHubFormTemplate(template);
    expect(result).toBeFalse();
  });
});
