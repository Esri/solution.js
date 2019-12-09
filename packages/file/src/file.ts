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

/**
 * Manages the creation and deployment of item types that contain files.
 *
 * @module file
 */

import * as common from "@esri/solution-common";

// ------------------------------------------------------------------------------------------------------------------ //

export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: common.UserSession
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>((resolve, reject) => {
    // Init template
    const itemTemplate: common.IItemTemplate = common.createInitializedItemTemplate(
      itemInfo
    );
    itemTemplate.estimatedDeploymentCostFactor = 2; // minimal set is starting, creating, done|failed

    // Templatize item info property values
    itemTemplate.item.id = common.templatizeTerm(
      itemTemplate.item.id,
      itemTemplate.item.id,
      ".itemId"
    );

    // Request file
    const dataPromise = new Promise<File>(dataResolve => {
      common
        .getItemDataAsFile(
          itemTemplate.itemId,
          itemTemplate.item.name,
          authentication
        )
        .then(
          response => {
            if (!response || response.size === 0) {
              dataResolve();
            } else {
              dataResolve(response);
            }
          },
          () => {
            dataResolve();
          }
        );
    });

    // Request item resources
    const resourcePromise = common
      .getItemResources(itemTemplate.itemId, authentication)
      .then(resourcesResponse => {
        // Save resources to solution item
        itemTemplate.resources = (resourcesResponse.resources as any[]).map(
          (resourceDetail: any) => resourceDetail.resource
        );
        const resourceItemFilePaths: common.ISourceFileCopyPath[] = common.generateSourceItemFilePaths(
          authentication.portal,
          itemTemplate.itemId,
          itemTemplate.item.thumbnail,
          itemTemplate.resources
        );
        return common.copyFilesToStorageItem(
          authentication,
          resourceItemFilePaths,
          solutionItemId,
          authentication
        );
      });

    // Request related items
    const relatedPromise = Promise.resolve(
      {} as common.IGetRelatedItemsResponse
    );
    /*const relatedPromise = common.getItemRelatedItems(
      itemTemplate.itemId,
      "Survey2Service",
      "forward",
      authentication
    );*/

    // Errors are handled as resolved empty values; this means that there's no `reject` clause to handle, hence:
    // tslint:disable-next-line:no-floating-promises
    Promise.all([dataPromise, resourcePromise, relatedPromise]).then(
      responses => {
        const [
          itemDataResponse,
          savedResourceFilenames,
          relatedItemsResponse
        ] = responses;
        itemTemplate.resources = (savedResourceFilenames as any[]).filter(
          item => !!item
        );

        if (itemDataResponse) {
          // Supported file formats are: .json, .xml, .txt, .png, .pbf, .zip, .jpeg, .jpg, .gif, .bmp, .gz, .svg,
          // .svgz, .geodatabase (https://developers.arcgis.com/rest/users-groups-and-items/add-resources.htm)
          const filename = (itemTemplate.item.name || "file.zip") + ".zip";
          itemTemplate.item.name = filename;
          const storageName = common.generateResourceStorageFilename(
            itemTemplate.itemId,
            filename,
            "info_file"
          );
          common
            .addResourceFromBlob(
              itemDataResponse,
              solutionItemId,
              storageName.folder,
              storageName.filename,
              authentication
            )
            .then(
              response => {
                itemTemplate.resources.push(
                  storageName.folder + "/" + storageName.filename
                );
                resolve(itemTemplate);
              },
              error => {
                itemTemplate.properties["partial"] = true;
                itemTemplate.properties["error"] = JSON.stringify(error);
                resolve(itemTemplate);
              }
            );
        } else {
          resolve(itemTemplate);
        }
      }
    );
  });
}

export function createItemFromTemplate(
  template: common.IItemTemplate,
  resourceFilePaths: common.IDeployFileCopyPath[],
  storageAuthentication: common.UserSession,
  templateDictionary: any,
  destinationAuthentication: common.UserSession,
  progressTickCallback: () => void
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    resolve();
  });
}
