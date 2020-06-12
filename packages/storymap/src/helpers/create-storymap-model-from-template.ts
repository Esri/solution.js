/**
 * Given a template, process it and interpolate it such that
 * we have a model that is ready to be sent to the Portal API
 */

import { interpolate, IModelTemplate } from "@esri/hub-common";
import { UserSession } from "@esri/arcgis-rest-auth";
import { getPortalEnv } from "./get-portal-env";
import { getStoryMapBaseUrl } from "./get-storymap-base-url";
import { getStoryMapSubdomain } from "./get-storymap-subdomain";

export function createStoryMapModelFromTemplate(
  templateModel: IModelTemplate,
  settings: any,
  transforms: any,
  authentication: UserSession
): Promise<any> {
  const timestamp = new Date().getTime();
  // Keep these around in case we encounter some old templates
  settings.agoenv = getPortalEnv(authentication);
  settings.smBase = getStoryMapSubdomain(authentication);
  settings.timestamp = new Date().getTime();
  // These are used in the oembed resource, as well as the item url
  // they have `{{appid}}` in them so that the id of the created item
  // will be interpolated into it after the item is created
  settings.storyMapBaseUrl = getStoryMapBaseUrl(authentication);
  settings.storyMapTemplateUrl = `${settings.storyMapBaseUrl}/stories/{{appid}}`;
  settings.storyMapThumnailUrl = `${authentication.portal}/content/items/{{appid}}/info/thumbnail/thumbnail.jpg/?w=400&d=${timestamp}`;

  const model = interpolate(templateModel, settings, transforms);

  return Promise.resolve(model);
}
