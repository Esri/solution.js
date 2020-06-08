import { UserSession } from "@esri/arcgis-rest-auth";

export function getStoryMapSubdomain(authentication: UserSession): string {
  const portalUrl =
    authentication.portal || "https://www.arcgis.com/sharing/rest";
  // TODO: Sort out how we locate storymaps on portal?
  let result;
  if (portalUrl.match(/(qaext|\.mapsqa)\.arcgis.com/)) {
    result = "storymapsqa";
  } else if (portalUrl.match(/(devext|\.mapsdevext)\.arcgis.com/)) {
    result = "storymapsdev";
  } else if (portalUrl.match(/(www|\.maps)\.arcgis.com/)) {
    result = "storymaps";
  }
  return result;
}
