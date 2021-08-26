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

import { IItemTemplate } from "./interfaces";
import { getProp } from "./generalHelpers";

// this function will update the templateDictionary arg
export function setLocationTrackingEnabled(
  portalResponse: any,
  userResponse: any,
  templateDictionary: any
): void {
  templateDictionary.locationTrackingEnabled =
    getProp(portalResponse, "helperServices.locationTracking") &&
    getProp(userResponse, "role") === "org_admin"
      ? true
      : false;
}

// used by deploy
// expected that you call this after updating the templateDictionary
export function validateTrackingTemplates(
  templates: IItemTemplate[],
  templateDictionary: any
): void {
  const trackingEnabled: boolean = templateDictionary.locationTrackingEnabled;
  if (!trackingEnabled) {
    if (
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
}
