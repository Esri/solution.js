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
  IItemTemplate,
  getSubscriptionInfo,
  getUniqueTitle,
  replaceInTemplate,
  UserSession
} from "@esri/solution-common";

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

export function getTitle(
  token: string,
  label: string,
  url: string
): Promise<string> {
  const requestOpts: RequestInit = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "token=" + token
    },
    method: "GET"
  };

  return fetch(`${url}StatusList?view=admin`, requestOpts)
    .then(
      r => r.json(),
      e => Promise.reject(e)
    )
    .then(
      items => {
        const titles: any[] =
          items && Array.isArray(items)
            ? items.map(item => {
                return { title: item.label };
              })
            : [];
        return Promise.resolve(getUniqueTitle(label, { titles }, "titles"));
      },
      e => Promise.reject(e)
    );
}

export function postVelocityData(
  authentication: UserSession,
  template: IItemTemplate,
  data: any,
  templateDictionary: any
): Promise<any> {
  return getVelocityUrl(authentication, template.type, undefined, true).then(
    url => {
      return getTitle(authentication.token, data.label, url).then(
        title => {
          data.label = title;
          data.id = "";

          const requestOpts: any = {
            body: JSON.stringify(replaceInTemplate(data, templateDictionary)),
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
              e => Promise.reject(e)
            )
            .then(
              rr => {
                template.item.url = `${url}/${rr.id}`;

                // Update the template dictionary
                templateDictionary[template.itemId]["itemId"] = rr.id;
                templateDictionary[template.itemId]["url"] = template.item.url;
                templateDictionary[template.itemId]["label"] = data.label;

                return {
                  item: replaceInTemplate(template.item, templateDictionary),
                  id: rr.id,
                  type: template.type,
                  postProcess: false
                };
              },
              e => Promise.reject(e)
            );
        },
        e => Promise.reject(e)
      );
    }
  );
}
