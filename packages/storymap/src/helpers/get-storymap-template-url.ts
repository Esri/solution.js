
import { UserSession } from "@esri/arcgis-rest-auth";

/**
 * For a given environment Prod/qa/dev/portal 
 * return the correct url with `{{appid}}` in the
 * right place so it can be interpoalted
 * @param authentication 
 */
export function getStoryMapTemplateUrl(authentication: UserSession): string {

  const portalUrl = authentication.portal || "https://www.arcgis.com/sharing/rest";




}