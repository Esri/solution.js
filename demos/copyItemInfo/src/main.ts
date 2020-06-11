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
// @esri/solution-common copyItemInfo example

import {
  ICreateItemOptions,
  IItemResourceOptions,
  IItemResourceResponse,
  ISetAccessOptions,
  ISharingResponse,
  addItemResource,
  createItemInFolder,
  setItemAccess
} from "@esri/arcgis-rest-portal";
import * as common from "@esri/solution-common";
import {
  createZip
} from "./libConnectors";

export function copyItemInfo(
  itemId: string,
  authentication: common.UserSession
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!itemId) {
      reject("Item's ID is not defined");
      return;
    }

    // Get the item information
    const itemBaseDef = common.getItemBase(itemId, authentication);
    const itemDataDef = new Promise<File>((resolve2, reject2) => {
      // tslint:disable-next-line: no-floating-promises
      itemBaseDef.then(
        // any error fetching item base will be handled via Promise.all later
        (itemBase: any) => {
          common
            .getItemDataAsFile(itemId, itemBase.name, authentication)
            .then(resolve2, (error: any) => reject2(JSON.stringify(error)));
        }
      );
    });
    const itemMetadataDef = common.getItemMetadataAsFile(
      itemId,
      authentication
    );
    const itemResourcesDef = common.getItemResourcesFiles(
      itemId,
      authentication
    );

    Promise.all([
      itemBaseDef,
      itemDataDef,
      itemMetadataDef,
      itemResourcesDef
    ]).then(
      responses => {
        const [
          itemBase,
          itemDataFile,
          itemMetadataFile,
          itemResourceFiles
        ] = responses;
        // Construct the thumbnail URL from the item base info
        const itemThumbnailUrl = common.getItemThumbnailUrl(
          itemId,
          itemBase.thumbnail,
          false,
          authentication
        );

        // Summarize what we have
        // ----------------------
        // (itemBase: any)  text/plain JSON
        // (itemDataDef: File)  */*
        // (itemThumbnailUrl: string)
        // (itemMetadataDef: Blob)  application/xml
        // (itemResourcesDef: File[])  list of */*
        console.log("itemBase", itemBase);
        console.log("itemData", itemDataFile);
        console.log("itemThumbnail", itemThumbnailUrl);
        console.log("itemMetadata", itemMetadataFile);
        console.log("itemResources", itemResourceFiles);

        // Create the copy after extracting properties that aren't specific to the source
        _createFullItem(
          getCopyableItemBaseProperties(itemBase),
          undefined, // folder id
          authentication,
          itemThumbnailUrl,
          authentication,
          itemDataFile,
          itemMetadataFile,
          itemResourceFiles,
          "public"
        )
        .then(
          (createResponse: common.ICreateItemResponse) => {
            resolve(JSON.stringify(createResponse));
          },
          (error: any) => reject(JSON.stringify(error))
        );
      },
      (error: any) => reject(JSON.stringify(error))
    );
  });
}

/**
 * Extracts the properties of an item that can be copied.
 *
 * @param sourceItem Item from which to copy properties
 * @return Object containing copyable properties from sourceItem
 */
export function getCopyableItemBaseProperties(sourceItem: any): any {
  const copyableItem: any = {
    name: sourceItem.name,
    title: sourceItem.title,
    type: sourceItem.type,
    typeKeywords: sourceItem.typeKeywords,
    description: sourceItem.description,
    tags: sourceItem.tags,
    snippet: sourceItem.snippet,
    documentation: sourceItem.documentation,
    extent: sourceItem.extent,
    categories: sourceItem.categories,
    spatialReference: sourceItem.spatialReference
  };
  return copyableItem;
}

/**
 * Publishes an item and its data, metadata, and resources as an AGOL item.
 *
 * @param itemInfo Item's `item` section
 * @param folderId Id of folder to receive item; null indicates that the item goes into the root
 *                 folder; ignored for Group item type
 * @param destinationAuthentication Credentials for for requests to where the item is to be created
 * @param itemThumbnailUrl URL to image to use for item thumbnail
 * @param itemThumbnailAuthentication Credentials for requests to the thumbnail source
 * @param dataFile Item's `data` section
 * @param metadataFile Item's metadata file
 * @param resourcesFiles Item's resources
 * @param access Access to set for item: "public", "org", "private"
 * @return A promise that will resolve with an object reporting success or failure and the Solution id
 */
function _createFullItem(
  itemInfo: any,
  folderId: string | undefined,
  destinationAuthentication: common.UserSession,
  itemThumbnailUrl?: string,
  itemThumbnailAuthentication?: common.UserSession,
  dataFile?: File,
  metadataFile?: File,
  resourcesFiles?: File[],
  access = "private"
): Promise<common.ICreateItemResponse> {
  return new Promise((resolve, reject) => {
    // Create item
    const createOptions: ICreateItemOptions = {
      item: {
        ...itemInfo
      },
      folderId,
      authentication: destinationAuthentication
    };

    // tslint:disable-next-line: no-floating-promises
    common.addTokenToUrl(itemThumbnailUrl, itemThumbnailAuthentication).then(
      updatedThumbnailUrl => {
        /* istanbul ignore else */
        if (updatedThumbnailUrl) {
          createOptions.item.thumbnailurl = common.appendQueryParam(
            updatedThumbnailUrl,
            "w=400"
          );
        }

        createItemInFolder(createOptions).then(
          createResponse => {
            if (createResponse.success) {
              let accessDef: Promise<ISharingResponse>;

              // Set access if it is not AGOL default
              // Set the access manually since the access value in createItem appears to be ignored
              // Need to run serially; will not work reliably if done in parallel with adding the data section
              if (access !== "private") {
                const accessOptions: ISetAccessOptions = {
                  id: createResponse.id,
                  access: access === "public" ? "public" : "org", // need to use constants rather than string
                  authentication: destinationAuthentication
                };
                accessDef = setItemAccess(accessOptions);
              } else {
                accessDef = Promise.resolve({
                  itemId: createResponse.id
                } as ISharingResponse);
              }

              // Now add attached items
              accessDef.then(
                () => {
                  const updateDefs: Array<Promise<any>> = [];

                  // Add the data section
                  if (dataFile) {
                    updateDefs.push(
                      common.addItemDataFile(
                        createResponse.id,
                        dataFile,
                        destinationAuthentication
                      )
                    );
                  }

                  // Add the resources via a zip because AGO sometimes loses resources if many are added at the
                  // same time to the same item
                  if (
                    Array.isArray(resourcesFiles) &&
                    resourcesFiles.length > 0
                  ) {
                    updateDefs.push(new Promise<IItemResourceResponse>(
                      (rsrcResolve, rsrcReject) => {
                        createZip("resources.zip", resourcesFiles).then(
                          (zipfile: File) => {
                            const addResourceOptions: IItemResourceOptions = {
                              id: createResponse.id,
                              resource: zipfile,
                              authentication: destinationAuthentication,
                              params: {
                                archive: true
                              }
                            };
                            addItemResource(addResourceOptions).then(rsrcResolve, rsrcReject);
                          },
                          rsrcReject
                        );
                      }
                    ));
                  }

                  // Add the metadata section
                  if (metadataFile) {
                    updateDefs.push(
                      common.addItemMetadataFile(
                        createResponse.id,
                        metadataFile,
                        destinationAuthentication
                      )
                    );
                  }

                  // Wait until all adds are done
                  Promise.all(updateDefs).then(
                    () => resolve(createResponse),
                    e => reject(common.fail(e))
                  );
                },
                e => reject(common.fail(e))
              );
            } else {
              reject(common.fail());
            }
          },
          e => reject(common.fail(e))
        );
      }
    );
  });
}
