import { UserSession } from "@esri/arcgis-rest-auth";

export function getPortalEnv(authentication: UserSession): string {
  const portalUrl =
    authentication.portal || "https://www.arcgis.com/sharing/rest";
  let result = "portal";
  if (portalUrl.match(/(qaext|\.mapsqa)\.arcgis.com/)) {
    result = "qaext";
  } else if (portalUrl.match(/(devext|\.mapsdevext)\.arcgis.com/)) {
    result = "devext";
  } else if (portalUrl.match(/(www|\.maps)\.arcgis.com/)) {
    result = "www";
  }
  return result;
}
