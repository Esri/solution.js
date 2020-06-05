import { UserSession } from "@esri/arcgis-rest-auth";
/* istanbul ignore next */
export function getExperieceSubdomain(authentication: UserSession): string {
  const portalUrl =
    authentication.portal || "https://www.arcgis.com/sharing/rest";
  // TODO: Sort out how we locate storymaps on portal?
  let result;
  if (portalUrl.match(/(qaext|\.mapsqa)\.arcgis.com/)) {
    result = "experienceqa";
  } else if (portalUrl.match(/(devext|\.mapsdevext)\.arcgis.com/)) {
    result = "experiencedev";
  } else if (portalUrl.match(/(www|\.maps)\.arcgis.com/)) {
    result = "experience";
  }
  return result;
}
