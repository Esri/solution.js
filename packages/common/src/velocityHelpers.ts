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

import { UserSession } from "./interfaces";
import {
  getSubscriptionInfo,
  ISubscriptionInfo
} from "./get-subscription-info";
import { getProp } from "./generalHelpers";

/**
 * Get the base velocity url from the current orgs subscription info
 *
 * This function will update the input templateDictionary arg with the velocity url
 * so we can reuse it without pinging the org again for subsequent requests to the
 * velocity api.
 *
 * @param authentication Credentials for the requests
 * @param templateDictionary Hash of facts: folder id, org URL, adlib replacements
 *
 * @return a promise that will resolve with the velocity url
 *
 */
export function getVelocityUrlBase(
  authentication: UserSession,
  templateDictionary: any
): Promise<string> {
  // if we already have the base url no need to make any additional requests
  if (templateDictionary.hasOwnProperty("velocityUrl")) {
    return Promise.resolve(templateDictionary.velocityUrl);
  } else {
    // get the url from the orgs subscription info
    return getSubscriptionInfo({ authentication }).then(
      (subscriptionInfo: ISubscriptionInfo) => {
        let velocityUrl = "";
        const orgCapabilities = getProp(subscriptionInfo, "orgCapabilities");
        /* istanbul ignore else */
        if (Array.isArray(orgCapabilities)) {
          orgCapabilities.some(c => {
            velocityUrl = c.velocityUrl;
            return velocityUrl;
          });
        }
        // add the base url to the templateDictionary for reuse
        templateDictionary.velocityUrl = velocityUrl;

        return Promise.resolve(velocityUrl);
      }
    );
  }
}

/**
 * Update any velocity urls found in the data
 *
 * This function can be extended to support any item type specific functions such as
 * removing the itemId from operational layers in a webmap
 *
 * @param data The data object of the item
 * @param type The item type
 * @param templateDictionary Hash of facts: folder id, org URL, adlib replacements
 *
 * @return an updated instance of the data object that was supplied.
 *
 */
export function updateVelocityReferences(
  data: any,
  type: string,
  templateDictionary: any
): any {
  const velocityUrl: any = templateDictionary.velocityUrl;
  if (data && type === "Web Map" && velocityUrl) {
    (data.operationalLayers || []).forEach((l: any) => {
      if (l.url && l.url.indexOf(velocityUrl) > -1 && l.itemId) {
        delete l.itemId;
      }
    });
  }
  return velocityUrl && data ? _replaceVelocityUrls(data, velocityUrl) : data;
}

/**
 * Helper function to update velocity urls found in the data
 *
 *
 * @param data The data object of the item
 * @param velocityUrl The velocity url from the current organization
 *
 * @return an updated instance of the data object that was supplied.
 *
 */
export function _replaceVelocityUrls(data: any, velocityUrl: string): any {
  let dataString: string = JSON.stringify(data);
  if (dataString.indexOf(velocityUrl) > -1) {
    // replace any instance of the velocity base url
    dataString = dataString.replace(
      new RegExp(`${velocityUrl}`, "gi"),
      "{{velocityUrl}}"
    );

    // add solutionItemId to any velocity service names
    const regex = new RegExp("{{velocityUrl}}.+?(?=/[A-Za-z]+Server)", "gi");
    const results = regex.exec(dataString);
    /* istanbul ignore else */
    if (results) {
      results.forEach(result => {
        dataString = dataString.replace(
          new RegExp(result, "g"),
          `${result}_{{solutionItemId}}`
        );
      });
    }
    return JSON.parse(dataString);
  } else {
    return data;
  }
}
