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
import { getStoryMapSubdomain } from "../../src/helpers/get-storymap-subdomain";
import { UserSession } from "@esri/solution-common";

describe("getStoryMapSubdomain :: ", () => {
  it("works", () => {
    const data = [
      { portal: "https://qaext.arcgis.com", expected: "storymapsqa" },
      { portal: "https://dc.mapsqa.arcgis.com", expected: "storymapsqa" },
      { portal: "https://devext.arcgis.com", expected: "storymapsdev" },
      { portal: "https://dc.mapsdevext.arcgis.com", expected: "storymapsdev" },
      { portal: "https://www.arcgis.com", expected: "storymaps" },
      { portal: "https://dc.maps.arcgis.com", expected: "storymaps" },
      { portal: "https://some.com/portal", expected: undefined },
      { portal: undefined, expected: "storymaps" }
    ];

    data.forEach(entry => {
      const us = { portal: entry.portal } as UserSession;
      expect(getStoryMapSubdomain(us)).toBe(
        entry.expected,
        `Should convert ${entry.portal} to ${entry.expected}`
      );
    });
  });
});
