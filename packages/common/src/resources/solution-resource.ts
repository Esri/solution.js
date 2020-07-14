/** @license
 * Copyright 2020 Esri
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

/**
 * Denotes type information for a SolutionResource
 */
export enum SolutionResourceType {
  thumbnail,
  metadata,
  resource,
  data,
  fakezip,
  info
}

/**
 * Solution Resource information
 */
export interface ISolutionResource {
  /*
   * Resource File Name
   * i.e. country.png
   */
  filename: string;
  /*
   * Resource Type
   * thumbnail | metadata | resource | data | fakezip | info
   */
  type: SolutionResourceType;

  /*
   * Resource Path
   * This is the path the resource will be deployed to on the new item
   * i.e. images/widget_10
   * this represents the `resourcesPrefix` in the REST API
   */
  path: string;

  /*
   * Source Url
   * Either a full url with protocol, from which the resource should be fetched,
   * or a relative path, which is assumed to be on the Solution Item
   * i.e.
   * Source as a static image in a S3 bucket or anywhere else on the internet
   * `https://s3.aws.amazon.com/somebucket/someimage.png`
   * or computed as
   * `3ef/images/widget_02/cake.png` which would be expanded to
   * `https://{rest-api-end-point}/content/items/{solution-item-id}/resources/3ef/images/widget_02/cake.png
   */
  sourceUrl?: string;
}
