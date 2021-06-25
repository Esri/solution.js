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

import { request, IRequestOptions } from "@esri/arcgis-rest-request";
import { getPortalUrl } from "@esri/arcgis-rest-portal";

export interface ISubscriptionInfo {
  id: string;
  [key: string]: any;
}

/**
 * Fetch subscription information about the current portal by id.
 * If no id is passed, portals/self/subscriptionInfo will be called.
 *
 * @param id
 * @param requestOptions
 */
export function getSubscriptionInfo(
  id?: string,
  requestOptions?: IRequestOptions
): Promise<ISubscriptionInfo> {
  // construct the search url
  const idOrSelf = id ? id : "self";
  const url = `${getPortalUrl(
    requestOptions
  )}/portals/${idOrSelf}/subscriptioninfo`;

  // default to a GET request
  const options: IRequestOptions = {
    ...{ httpMethod: "GET" },
    ...requestOptions
  };

  // send the request
  return request(url, options);
}
