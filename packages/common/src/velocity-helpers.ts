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
  ISubscriptionInfo,
  getSubscriptionInfo
} from "./get-subscription-info";
import { UserSession, IItemTemplate } from "./interfaces";

export function getVelocityUrlBase(
  authentication: UserSession
): Promise<string> {
  return getSubscriptionInfo(undefined, { authentication }).then(
    (subscriptionInfo: ISubscriptionInfo) => {
      let velocityUrl = "";
      const orgCapabilities = subscriptionInfo?.orgCapabilities;
      if (Array.isArray(orgCapabilities)) {
        orgCapabilities.some(c => {
          velocityUrl = c.velocityUrl;
          return velocityUrl;
        });
      }
      return Promise.resolve(velocityUrl);
    }
  );
}

export function getVelocityUrl(
  authentication: UserSession,
  type: string,
  id?: string,
  isDeploy: boolean = false
): Promise<string> {
  return getVelocityUrlBase(authentication).then(url => {
    const _type: string =
      type === "Feed"
        ? "feed"
        : type === "Real Time Analytic"
        ? "analytics/realtime"
        : "analytics/bigdata";

    return Promise.resolve(
      isDeploy
        ? `${url}/iot/${_type}`
        : `${url}/iot/${_type}/${id}/?f=json&token=${authentication.token}`
    );
  });
}

export function postVelocityData(
  authentication: UserSession,
  template: IItemTemplate,
  data: any
): Promise<any> {
  return getVelocityUrl(authentication, template.type, undefined, true).then(
    url => {
      // TODO remove as this is just used for testing...will need to
      // handle rename though..
      data.label += Date.now().toString();
      const requestOpts: any = {
        body: JSON.stringify(data),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "token=" + authentication.token
        },
        method: "POST"
      };

      return fetch(url, requestOpts)
        .then(
          r => r.json(),
          e => {
            console.log(e);
          }
        )
        .then(
          rr => {
            return {
              item: template,
              id: rr.id,
              type: template.type,
              postProcess: false
            };
          },
          e => {
            console.log(e);
          }
        );
    }
  );
}
