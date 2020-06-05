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
