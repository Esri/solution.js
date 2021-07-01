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
  getVelocityUrl,
  IItemTemplate,
  UserSession
} from "@esri/solution-common";

export function getFeedData(
  itemId: string,
  authentication: UserSession
): Promise<any> {
  return getVelocityUrl(authentication, "Feed", itemId).then((url: string) => {
    return fetch(url).then(data => data.json());
  });
}

export function fineTuneCreatedItem(
  authentication: UserSession,
  template: IItemTemplate,
  data: any
): Promise<any> {
  return getVelocityUrl(authentication, template.type, undefined, true).then(
    url => {
      // create the feed with the template data
      // This needs to be a POST
      data.label += Date.now().toString();
      const requestOpts: any = {
        body: JSON.stringify(data),
        headers: {
          Accept: "application/json",
          "Accept-Language": "en-US",
          "Content-Type": "application/json",
          Authorization: "token=" + authentication.token,
          //"Authorization": "token=" + "XBMO3KdwKGyz8Po0DqytgUAfDrjCWxtggsyW8t945889Ccu0kYYwbMNe0XiiwcfAXzZ89xAcEyXj1kh21Cv5xrrRitSx_-soytEhwRfTMeSp1otiWS1umDu_aZCJCtmnhWCmDzPyc8EytKYxYWPJsCf-OD09uqPlAc0VqdswcKEfZ5AyxI-AL0pdp_kIkqWya3bHwSN5bcLZWrla84a99EatJv6taNobKNEhb4qbrPc.",
          // "Referrer": "https://velocity.arcgis.com/",
          // "Referer": "https://velocity.arcgis.com/",
          Referrer: "https://localdeployment.maps.arcgis.com/",
          Referer: "https://localdeployment.maps.arcgis.com/",
          "Referrer-Policy": "strict-origin-when-cross-origin",
          referrerPolicy: "strict-origin-when-cross-origin",
          "Cache-Control": "no-cache",
          method: "POST",
          "access-control-allow-origin": "*"
        },
        // "referrer": "https://velocity.arcgis.com/",
        referrer: "https://localdeployment.maps.arcgis.com/",
        referrerPolicy: "strict-origin-when-cross-origin",
        method: "POST",
        mode: "cors" //,
        //"credentials": "include" // im getting an error when this is included
      };

      return fetch(url, requestOpts)
        .then(
          r => {
            return r.json();
          },
          e => {
            console.log(e);
          }
        )
        .then(
          rr => {
            // check all this
            // thinking ill be able to get the new itemId from r
            return {
              item: template,
              id: rr.id,
              type: template.type,
              postProcess: false
            };
          },
          e => {
            console.log(e);
            //Promise.reject(e);
          }
        );
    }
  );
}
