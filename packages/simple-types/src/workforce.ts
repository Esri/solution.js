/*
 | Copyright 2019 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

import * as common from "@esri/solution-common";
import * as auth from "@esri/arcgis-rest-auth";
import { queryFeatures, addFeatures } from "@esri/arcgis-rest-feature-layer";

//#region Publish Process ---------------------------------------------------------------------------------------//

/**
 * Templatize source item
 *
 * @param itemTemplate template for the workforce project item
 * @return templatized itemTemplate
 * @protected
 */
export function convertItemToTemplate(
  itemTemplate: common.IItemTemplate
): common.IItemTemplate {
  // Key properties that contain item IDs for the workforce project type
  const keyProperties: string[] = [
    "groupId",
    "workerWebMapId",
    "dispatcherWebMapId",
    "dispatchers",
    "assignments",
    "workers",
    "tracks"
  ];

  // The templates data to process
  const data: any = itemTemplate.data;

  if (data) {
    // Extract dependencies
    itemTemplate.dependencies = extractDependencies(data, keyProperties);

    // templatize key properties
    itemTemplate.data = _templatize(data, keyProperties);
  }

  return itemTemplate;
}

/**
 * Gets the ids of the dependencies of the workforce project.
 *
 * @param data itemTemplate data
 * @param keyProperties workforce project properties that contain references to dependencies
 * @return a list of dependency IDs
 */
export function extractDependencies(
  data: any,
  keyProperties: string[]
): string[] {
  const deps: string[] = [];
  // get the ids for the service dependencies
  // "workerWebMapId" and "dispatcherWebMapId" are already IDs and don't have a serviceItemId
  keyProperties.forEach(p => {
    if (common.getProp(data, p + ".serviceItemId")) {
      if (deps.indexOf(data[p].serviceItemId) === -1) {
        deps.push(data[p].serviceItemId);
      }
    } else if (/[0-9A-F]{32}/gim.test(data[p])) {
      if (deps.indexOf(data[p]) === -1) {
        deps.push(data[p]);
      }
    }
  });
  return deps;
}

/**
 * Templatizes key item properties.
 *
 * @param data itemTemplate data
 * @param keyProperties workforce project properties that should be templatized
 * @return an updated data object to be stored in the template
 */
export function _templatize(
  data: any,
  keyProperties: string[]
): common.IItemTemplate {
  keyProperties.forEach(p => {
    if (common.getProp(data, p)) {
      if (common.getProp(data[p], "serviceItemId")) {
        // templatize properties with id and url
        const id: string = data[p].serviceItemId;
        data[p].serviceItemId = common.templatizeTerm(id, id, ".id");

        if (common.getProp(data[p], "url")) {
          const layerId = data[p].url.substr(
            (data[p].url as string).lastIndexOf("/")
          );
          data[p].url = common.templatizeTerm(id, id, ".url") + layerId;
        }
      } else {
        // templatize simple id properties
        data[p] = common.templatizeTerm(data[p], data[p], ".id");
      }
    }
  });

  data["folderId"] = "{{folderId}}";

  // templatize app integrations
  const templatizeUrlTemplate = function(item: any) {
    let ids: string[];
    if (common.getProp(item, "urlTemplate")) {
      ids = item.urlTemplate.match(/itemID=[0-9A-F]{32}/gim) || [];
      ids.forEach(id => {
        id = id.replace("itemID=", "");
        item.urlTemplate = item.urlTemplate.replace(
          id,
          common.templatizeTerm(id, id, ".id")
        );
      });
    }
  };

  const integrations: any[] = data.assignmentIntegrations || [];
  integrations.forEach(i => {
    templatizeUrlTemplate(i);
    if (common.getProp(i, "assignmentTypes")) {
      const assignmentTypes: string[] = i.assignmentTypes || [];
      assignmentTypes.forEach((assignType: any) => {
        templatizeUrlTemplate(assignType);
      });
    }
  });
  return data;
}

//#endregion

//#region Deploy Process ---------------------------------------------------------------------------------------//

/**
 * Updates the dispatchers service to include the current user as a dispatcher
 *
 * @param newlyCreatedItem Item to be created; n.b.: this item is modified
 * @param destinationUserSession The session used to create the new item(s)
 * @return A promise that will resolve with { "success" === true || false }
 * @protected
 */
export function fineTuneCreatedItem(
  newlyCreatedItem: common.IItemTemplate,
  destinationUserSession: auth.UserSession
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    destinationUserSession.getUser().then(
      user => {
        _updateDispatchers(
          common.getProp(newlyCreatedItem, "data.dispatchers"),
          user.username || "",
          user.fullName || "",
          destinationUserSession
        ).then(
          results => {
            resolve({ success: results });
          },
          e => reject(common.fail(e))
        );
      },
      e => reject(common.fail(e))
    );
  });
}

export function _updateDispatchers(
  dispatchers: any,
  name: string,
  fullName: string,
  destinationUserSession: auth.UserSession
): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    if (dispatchers && dispatchers.url) {
      queryFeatures({
        url: dispatchers.url,
        where: "userId = '" + name + "'",
        authentication: destinationUserSession
      }).then(
        (results: any) => {
          if (results && results.features) {
            if (results.features.length === 0) {
              addFeatures({
                url: dispatchers.url,
                features: [
                  {
                    attributes: {
                      name: fullName,
                      userId: name
                    }
                  }
                ],
                authentication: destinationUserSession
              }).then(
                addResults => {
                  if (addResults && addResults.addResults) {
                    resolve(true);
                  } else {
                    reject(
                      common.fail({
                        success: false,
                        message: "Failed to add dispatch record."
                      })
                    );
                  }
                },
                e =>
                  reject(
                    common.fail({
                      success: false,
                      message: "Failed to add dispatch record.",
                      error: e
                    })
                  )
              );
            } else {
              resolve(true);
            }
          } else {
            resolve(false);
          }
        },
        e => reject(common.fail(e))
      );
    } else {
      resolve(false);
    }
  });
}

//#endregion
