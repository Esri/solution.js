import { UserSession } from "@esri/arcgis-rest-auth";
import { getExperienceSubdomain } from "./get-experience-subdomain";
/**
 * For a given environment Prod/qa/dev/portal
 * return the correct storymaps base url
 * @param authentication
 */
export function getWebExperiencepUrlTemplate(
  authentication: UserSession
): string {
  let baseUrl = "";

  const subdomain = getExperienceSubdomain(authentication);
  if (subdomain) {
    baseUrl = `https://${subdomain}.arcgis.com/experience/{{appid}}`;
  } else {
    // we're on portal
    // chop off the /sharing/rest to get the baseUrl
    const portalBaseUrl = authentication.portal.replace("/sharing/rest", "");
    baseUrl = `${portalBaseUrl}/apps/experiencebuilder/?id={{appid}}`;
  }

  return baseUrl;
}
