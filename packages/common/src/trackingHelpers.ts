/** @license
 * Copyright 2021 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Helper functions shared across deploy and create

import { IItemTemplate, UserSession } from "./interfaces";
import { getProp } from "./generalHelpers";
import { getItemBase } from "./restHelpersGet";

/**
 * Used by deploy to evaluate if we have everything we need to deploy tracking views.
 *
 * This function will update the input templateDictionary with a boolean
 * indicating if tracking is enabled on the org and the user is an admin.
 *
 * @param portalResponse portal self response
 * @param userResponse portal user response
 * @param templateDictionary Hash of facts: org URL, adlib replacements, deferreds for dependencies
 * @param templates the list of IItemTemplates from the solution
 *
 * @protected
 */
export function setLocationTrackingEnabled(
  portalResponse: any,
  userResponse: any,
  templateDictionary: any,
  templates?: IItemTemplate[]
): void {
  // set locationTracking...contains service url and id
  const locationTracking = getProp(portalResponse, "helperServices.locationTracking");
  /* istanbul ignore else */
  if (locationTracking) {
    templateDictionary.locationTracking = locationTracking;
  }
  
  // verify we have location tracking service and the user is an admin
  templateDictionary.locationTrackingEnabled =
    templateDictionary.locationTracking &&
    getProp(userResponse, "role") === "org_admin"
      ? true
      : false;

    if (templates) {
      _validateTrackingTemplates(templates, templateDictionary);
    }
}

/**
 * Used by deploy to evaluate if we have everything we need to deploy tracking views.
 *
 * An error is thrown to prevent additional deployment work if we have Tracking items and tracking is
 * not enabled or the deployment user is not an admin in the organization.
 *
 * @param templates the list of IItemTemplates from the solution
 * @param templateDictionary Hash of facts: org URL, adlib replacements, deferreds for dependencies
 *
 * @protected
 */
export function _validateTrackingTemplates(
  templates: IItemTemplate[],
  templateDictionary: any
): void {
  /* istanbul ignore else */
  if (
    !templateDictionary.locationTrackingEnabled &&
    templates.some(template => {
      const typeKeywords: string[] =
        getProp(template, "item.typeKeywords") || [];
      return typeKeywords.indexOf("Location Tracking View") > -1;
    })
  ) {
    console.error("Location tracking not enabled or user is not admin.");
    throw new Error("Location tracking not enabled or user is not admin.");
  }
}

export function getTackingServiceOwner(
  templateDictionary: any,
  authentication: UserSession
): Promise<boolean> {
  if (templateDictionary.locationTrackingEnabled) {
    const locationTrackingId: string = templateDictionary.locationTracking.id;
    return getItemBase(locationTrackingId, authentication).then(itemBase => {
      return Promise.resolve(itemBase && itemBase.owner === authentication.username);
    }, () => Promise.resolve(false));
  } else {
    return Promise.resolve(false);
  }
}
