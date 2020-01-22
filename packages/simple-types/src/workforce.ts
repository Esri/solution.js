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

//#region Publish Process ---------------------------------------------------------------------------------------//

/**
 * Converts an workforce item to a template.
 *
 * @param itemTemplate template for the workforce project item
 * @return templatized itemTemplate
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
    itemTemplate.dependencies = _extractDependencies(data, keyProperties);

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
 * @return List of dependencies ids
 */
export function _extractDependencies(
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
export function _templatize(data: any, keyProperties: string[]): any {
  keyProperties.forEach(p => {
    if (common.getProp(data, p)) {
      if (common.getProp(data[p], "serviceItemId")) {
        // templatize properties with id and url
        const id: string = data[p].serviceItemId;
        let serviceItemIdSuffix: string = ".itemId";

        if (common.getProp(data[p], "url")) {
          const layerId = data[p].url.substr(
            (data[p].url as string).lastIndexOf("/") + 1
          );
          data[p].url = common.templatizeTerm(
            id,
            id,
            ".layer" + layerId + ".url"
          );
          serviceItemIdSuffix = ".layer" + layerId + serviceItemIdSuffix;
        }
        data[p].serviceItemId = common.templatizeTerm(
          id,
          id,
          serviceItemIdSuffix
        );
      } else {
        // templatize simple id properties
        data[p] = common.templatizeTerm(data[p], data[p], ".itemId");
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
          common.templatizeTerm(id, id, ".itemId")
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
 * Gets the current user and updates the dispatchers service
 *
 * @param newlyCreatedItem Item to be created; n.b.: this item is modified
 * @param destinationAuthentication The session used to create the new item(s)
 * @return A promise that will resolve with { "success" === true || false }
 */
export function fineTuneCreatedItem(
  newlyCreatedItem: common.IItemTemplate,
  destinationAuthentication: common.UserSession
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    destinationAuthentication.getUser().then(
      user => {
        _updateDispatchers(
          common.getProp(newlyCreatedItem, "data.dispatchers"),
          user.username || "",
          user.fullName || "",
          destinationAuthentication
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

/**
 * Updates the dispatchers service to include the current user as a dispatcher
 *
 * @param dispatchers The dispatchers object from the workforce items data
 * @param name Current users name
 * @param fullName Current users full name
 * @param destinationAuthentication The session used to create the new item(s)
 * @return A promise that will resolve with true || false
 * @protected
 */
export function _updateDispatchers(
  dispatchers: any,
  name: string,
  fullName: string,
  destinationAuthentication: common.UserSession
): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    if (dispatchers && dispatchers.url) {
      try{
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ workforce._updateDispatchers.rest_queryFeatures... ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");//???
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                                           url: \"" + dispatchers.url + "\"");//???
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                                         where: \"" + "userId = '" + name + "'\"");//???
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                                          auth: " + JSON.stringify(destinationAuthentication,null,2));//???
      common
        .rest_queryFeatures({
          url: dispatchers.url,
          where: "userId = '" + name + "'",
          authentication: destinationAuthentication
        })
        .then(
          (results: any) => {
            if (results && results.features) {
              if (results.features.length === 0) {
                common
                  .rest_addFeatures({
                    url: dispatchers.url,
                    features: [
                      {
                        attributes: {
                          name: fullName,
                          userId: name
                        }
                      }
                    ],
                    authentication: destinationAuthentication
                  })
                  .then(
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
      } catch (e){
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ workforce._updateDispatchers.rest_queryFeatures exception ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~", JSON.stringify(common.fail(e), null, 2));//???
        reject(common.fail(e));
      }
    } else {
      resolve(false);
    }
  });
}

//#endregion
