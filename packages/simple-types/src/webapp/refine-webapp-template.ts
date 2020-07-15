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

import {
  GEOMETRY_SERVER_NAME,
  IItemTemplate,
  SERVER_NAME,
  placeholder,
  setProp,
  fail
} from "@esri/solution-common";
import { UserSession } from "@esri/solution-common";
import { _templatizeIdPaths, _templatizeIdPath } from "./webapp-processor";
import { _extractDependencies } from "./_extractDependencies";
import { setValues } from "./setValues";
import { templatizeDatasources } from "./templatizeDatasources";
import { templatizeValues } from "./templatizeValues";
import { templatizeWidgets } from "./templatizeWidgets";
/**
 * Refine the webapp template after the generic processing
 * @param itemTemplate
 * @param authentication
 */
export function refineWebAppTemplate(
  itemTemplate: IItemTemplate,
  authentication: UserSession
): Promise<IItemTemplate> {
  return new Promise<IItemTemplate>((resolve, reject) => {
    // Remove org base URL and app id, e.g.,
    //   http://anOrg.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc5992522d34a6b5ce80d17835eea21
    // to
    //   <placeholder(SERVER_NAME)>/apps/CrowdsourcePolling/index.html?appid={{<itemId>.id}}
    // Need to add placeholder server name because otherwise AGOL makes URL null
    let portalUrl: string = "";
    if (itemTemplate.item.url) {
      const templatizedUrl = itemTemplate.item.url;
      const iSep = templatizedUrl.indexOf("//");
      itemTemplate.item.url =
        placeholder(SERVER_NAME) + // add placeholder server name
        templatizedUrl.substring(
          templatizedUrl.indexOf("/", iSep + 2),
          templatizedUrl.lastIndexOf("=") + 1
        ) +
        itemTemplate.item.id; // templatized id

      portalUrl = templatizedUrl.replace(
        templatizedUrl.substring(templatizedUrl.indexOf("/", iSep + 2)),
        ""
      );
    }

    // Extract dependencies
    itemTemplate.dependencies = _extractDependencies(itemTemplate);

    // Set the folder
    setProp(itemTemplate, "data.folderId", "{{folderId}}");
    // Set the map or group after we've extracted them as dependencies
    _templatizeIdPaths(itemTemplate, [
      "data.map.itemId",
      "data.map.appProxy.mapItemId",
      "data.values.webmap",
      "data.values.group"
    ]);

    // force the appItemId to be pulled directly from the template item
    // this is to address solution.js #124
    _templatizeIdPath(itemTemplate, "data.appItemId", itemTemplate.itemId);

    setValues(
      itemTemplate,
      [
        "data.logo",
        "data.map.portalUrl",
        "data.portalUrl",
        "data.httpProxy.url"
      ],
      placeholder(SERVER_NAME)
    );

    setProp(
      itemTemplate,
      "data.geometryService",
      placeholder(GEOMETRY_SERVER_NAME)
    );

    templatizeDatasources(itemTemplate, authentication, portalUrl).then(
      () => {
        templatizeWidgets(
          itemTemplate,
          authentication,
          portalUrl,
          "data.widgetPool.widgets"
        ).then(
          _itemTemplate => {
            templatizeWidgets(
              _itemTemplate,
              authentication,
              portalUrl,
              "data.widgetOnScreen.widgets"
            ).then(
              updatedItemTemplate => {
                templatizeValues(
                  updatedItemTemplate,
                  authentication,
                  portalUrl,
                  "data.values"
                ).then(
                  _updatedItemTemplate => {
                    resolve(_updatedItemTemplate);
                  },
                  e => reject(fail(e))
                );
              },
              e => reject(fail(e))
            );
          },
          e => reject(fail(e))
        );
      },
      e => reject(fail(e))
    );
  });
}
