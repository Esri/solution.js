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

import {
  IItemTemplate,
  createPlaceholderTemplate,
  UserSession,
  fail
} from "@esri/solution-common";
import { getVelocityDependencies } from "./get-velocity-dependencies";
import {
  getSubscriptionInfo,
  ISubscriptionInfo
} from "./get-subscription-info";

/**
 * Convert a Velocity item into a template
 *
 *
 * @param itemInfo
 * @param authentication
 */
export function convertVelocityToTemplate(
  itemInfo: any,
  authentication: UserSession
): Promise<IItemTemplate> {
  const template = createPlaceholderTemplate(itemInfo.id, itemInfo.type);
  return getSubscriptionInfo(undefined, { authentication }).then(
    (subscriptionInfo: ISubscriptionInfo) => {
      let velocityUrl;
      const orgCapabilities = subscriptionInfo?.orgCapabilities;
      if (
        Array.isArray(orgCapabilities) &&
        orgCapabilities.some(c => {
          velocityUrl = c.velocityUrl;
          return velocityUrl;
        })
      ) {
        const type: string =
          itemInfo.type === "Real Time Analytic" ? "realtime" : "bigdata";
        // using fetch as I was getting an auth error when I tried with "request"
        return fetch(
          `${velocityUrl}/iot/analytics/${type}/${itemInfo.id}/?f=json&token=${authentication.token}`
        )
          .then(data => data.json())
          .then(data_json => {
            template.data = data_json;
            template.dependencies = getVelocityDependencies(template);
            return Promise.resolve(template);
          });
      } else {
        // TODO need to check what should actually be returned here
        return Promise.resolve(template);
      }
    },
    e => fail(e)
  );
}
