
import { UserSession } from "@esri/arcgis-rest-auth";
import { getStoryMapSubdomain } from './get-storymap-subdomain';
/**
 * For a given environment Prod/qa/dev/portal 
 * return the correct storymaps base url 
 * @param authentication 
 */
export function getStoryMapBaseUrl(authentication: UserSession): string {
  let baseUrl = '';
  
  const subdomain = getStoryMapSubdomain(authentication);
  if (subdomain) {
    baseUrl = `https://${subdomain}.arcgis.com`;
  } else {
    // we're on portal
    // chop off the /sharing/rest to get the baseUrl
    const portalBaseUrl = authentication.portal.replace('/sharing/rest', '');
    baseUrl = `${portalBaseUrl}/apps/storymaps`;
  }

  return baseUrl;

}