/** @license
 * Copyright 2018 Esri
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
import { ArcGISIdentityManager } from "../interfaces";
import { request, IRequestOptions } from "@esri/arcgis-rest-request";
/**
 * Gets a Blob from a web site.
 *
 * @param url Address of Blob
 * @param authentication Credentials for the request
 * @param requestOptions - Options for the request, including parameters relevant to the endpoint.
 * @returns Promise that will resolve with Blob or an AGO-style JSON failure response
 */
export function getBlob(
  url: string,
  authentication: ArcGISIdentityManager,
  requestOptions: IRequestOptions = {}
): Promise<Blob> {
  if (!url) {
    return Promise.reject("Url must be provided");
  }

  const blobRequestOptions = {
    authentication: authentication,
    rawResponse: true,
    ...requestOptions
  } as IRequestOptions;

  return request(url, blobRequestOptions).then(response => {
    return response.blob();
  });
}
