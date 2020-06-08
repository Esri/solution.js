import { getPortalEnv } from "../../src/helpers/get-portal-env";
import { UserSession } from "@esri/solution-common";

describe("getPortalEnv", () => {
  it("works", () => {
    const data = [
      { portal: "https://qaext.arcgis.com", expected: "qaext" },
      { portal: "https://dc.mapsqa.arcgis.com", expected: "qaext" },
      { portal: "https://devext.arcgis.com", expected: "devext" },
      { portal: "https://dc.mapsdevext.arcgis.com", expected: "devext" },
      { portal: "https://www.arcgis.com", expected: "www" },
      { portal: "https://dc.maps.arcgis.com", expected: "www" },
      { portal: "https://some.com/portal", expected: "portal" },
      { portal: undefined, expected: "www" }
    ];

    data.forEach(entry => {
      const us = { portal: entry.portal } as UserSession;
      expect(getPortalEnv(us)).toBe(
        entry.expected,
        `Should convert ${entry.portal} to ${entry.expected}`
      );
    });
  });
});
