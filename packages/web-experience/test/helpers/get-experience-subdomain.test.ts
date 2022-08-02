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

import { getExperienceSubdomain } from "../../src/helpers/get-experience-subdomain";
import { ArcGISIdentityManager } from "@esri/solution-common";

describe("getExperienceSubdomain :: ", () => {
  it("works", () => {
    const data = [
      { portal: "https://qaext.arcgis.com", expected: "experienceqa" },
      { portal: "https://dc.mapsqa.arcgis.com", expected: "experienceqa" },
      { portal: "https://devext.arcgis.com", expected: "experiencedev" },
      { portal: "https://dc.mapsdevext.arcgis.com", expected: "experiencedev" },
      { portal: "https://www.arcgis.com", expected: "experience" },
      { portal: "https://dc.maps.arcgis.com", expected: "experience" },
      { portal: "https://some.com/portal", expected: undefined },
      { portal: undefined, expected: "experience" }
    ];

    data.forEach(entry => {
      const us = { portal: entry.portal } as ArcGISIdentityManager;
      expect(getExperienceSubdomain(us)).toBe(
        entry.expected,
        `Should convert ${entry.portal} to ${entry.expected}`
      );
    });
  });
});
