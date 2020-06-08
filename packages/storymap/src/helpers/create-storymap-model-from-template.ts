/**
 * Given a template, process it and interpolate it such that
 * we have a model that is ready to be sent to the Portal API
 */

import { interpolate, IModelTemplate } from "@esri/hub-common";
import { UserSession } from "@esri/arcgis-rest-auth";
import { getStoryMapSubdomain } from "./get-storymap-subdomain";
import { getPortalEnv } from "./get-portal-env";

export function createStoryMapModelFromTemplate(
  templateModel: IModelTemplate,
  settings: any,
  transforms: any,
  authentication: UserSession
): Promise<any> {
  settings.agoenv = getPortalEnv(authentication);
  settings.smBase = getStoryMapSubdomain(authentication);
  settings.timestamp = new Date().getTime();

  const model = interpolate(templateModel, settings, transforms);

  return Promise.resolve(model);
}
