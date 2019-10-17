/** @license
 * Copyright 2019 Esri
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
// @esri/solution-common createExtent TypeScript example

import * as auth from "@esri/arcgis-rest-auth";
import * as portal from "@esri/arcgis-rest-portal";
import * as restTypes from "@esri/arcgis-rest-types";
import * as solutionCommon from "@esri/solution-common";

export function convertPortalExtents(portalId: string): Promise<string> {
  return new Promise<string>(resolve => {
    const usOptions: auth.IUserSessionOptions = {};
    const authorization: auth.UserSession = new auth.UserSession(usOptions);

    // Get the extents of a portal
    // tslint:disable-next-line: no-floating-promises
    portal
      .getPortal(portalId, { authentication: authorization })
      .then(portalResponse => {
        const portalExtent: any = portalResponse.defaultExtent;
        let html = "";

        html += "<h4>Source extents</h4>";
        if (!portalId) {
          html += "<i>Using sample extents</i><br/>";
        }
        html += "<pre>" + JSON.stringify(portalExtent, null, 4) + "</pre>";

        // Convert the extents
        const outSR: restTypes.ISpatialReference = { wkid: 4326 };
        const geometryServiceUrl: string =
          "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer";
        // tslint:disable-next-line: no-floating-promises
        solutionCommon
          .convertExtent(portalExtent, outSR, geometryServiceUrl, authorization)
          .then(conversionResponse => {
            html += "<h4>Projected extents</h4>";
            html +=
              "<pre>" + JSON.stringify(conversionResponse, null, 4) + "</pre>";

            resolve(html);
          });
      });
  });
}
