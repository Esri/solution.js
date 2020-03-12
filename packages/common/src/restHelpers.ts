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
 * Provides common functions involving the arcgis-rest-js library.
 *
 * @module restHelpers
 */

import * as generalHelpers from "./generalHelpers";
import * as interfaces from "./interfaces";
import * as portal from "@esri/arcgis-rest-portal";
import * as request from "@esri/arcgis-rest-request";
import * as restHelpersGet from "./restHelpersGet";
import * as serviceAdmin from "@esri/arcgis-rest-service-admin";
import * as templatization from "./templatization";

// ------------------------------------------------------------------------------------------------------------------ //

export { request as rest_request } from "@esri/arcgis-rest-request";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Searches for items matching a query and that the caller has access to.
 *
 * @param search Search string (e.g., "q=redlands+map")
 * @return Promise resolving with search results
 * @see https://developers.arcgis.com/rest/users-groups-and-items/search.htm
 */
export function searchItems(
  search: string | portal.ISearchOptions | portal.SearchQueryBuilder
): Promise<interfaces.ISearchResult<interfaces.IItem>> {
  return portal.searchItems(search);
}

/**
 * Adds a forward relationship between two items.
 *
 * @param originItemId Origin of relationship
 * @param destinationItemId Destination of relationship
 * @param relationshipType Type of relationship
 * @param authentication Credentials for the request
 * @return A Promise to add item resources.
 */
export function addForwardItemRelationship(
  originItemId: string,
  destinationItemId: string,
  relationshipType: interfaces.ItemRelationshipType,
  authentication: interfaces.UserSession
): Promise<interfaces.IStatusResponse> {
  return new Promise<interfaces.IStatusResponse>(resolve => {
    const requestOptions: portal.IManageItemRelationshipOptions = {
      originItemId,
      destinationItemId,
      relationshipType,
      authentication
    };
    portal.addItemRelationship(requestOptions).then(
      response => {
        resolve({
          success: response.success,
          itemId: originItemId
        } as interfaces.IStatusResponse);
      },
      () => {
        resolve({
          success: false,
          itemId: originItemId
        } as interfaces.IStatusResponse);
      }
    );
  });
}

/**
 * Adds forward relationships for an item.
 *
 * @param originItemId Origin of relationship
 * @param destinationRelationships Destinations
 * @param authentication Credentials for the request
 * @return A Promise to add item resources.
 */
export function addForwardItemRelationships(
  originItemId: string,
  destinationRelationships: interfaces.IRelatedItems[],
  authentication: interfaces.UserSession
): Promise<interfaces.IStatusResponse[]> {
  return new Promise<interfaces.IStatusResponse[]>(resolve => {
    // Set up relationships using updated relationship information
    const relationshipPromises = new Array<
      Promise<interfaces.IStatusResponse>
    >();
    destinationRelationships.forEach(relationship => {
      relationship.relatedItemIds.forEach(relatedItemId => {
        relationshipPromises.push(
          addForwardItemRelationship(
            originItemId,
            relatedItemId,
            relationship.relationshipType as interfaces.ItemRelationshipType,
            authentication
          )
        );
      });
    });
    // tslint:disable-next-line: no-floating-promises
    Promise.all(
      relationshipPromises
    ).then((responses: interfaces.IStatusResponse[]) => resolve(responses));
  });
}

export function addToServiceDefinition(
  url: string,
  options: any
): Promise<void> {
  return new Promise((resolve, reject) => {
    serviceAdmin.addToServiceDefinition(url, options).then(
      () => {
        resolve();
      },
      e => reject(generalHelpers.fail(e))
    );
  });
}

/**
 * Converts an extent to a specified spatial reference.
 *
 * @param extent Extent object to check and (possibly) to project
 * @param outSR Desired spatial reference
 * @param geometryServiceUrl Path to geometry service providing `findTransformations` and `project` services
 * @param authentication Credentials for the request
 * @return Original extent if it's already using outSR or the extents projected into the outSR
 */
export function convertExtent(
  extent: interfaces.IExtent,
  outSR: interfaces.ISpatialReference,
  geometryServiceUrl: string,
  authentication: interfaces.UserSession
): Promise<interfaces.IExtent> {
  const _requestOptions: any = Object.assign({}, authentication);
  return new Promise<any>((resolve, reject) => {
    // tslint:disable-next-line:no-unnecessary-type-assertion
    if (extent.spatialReference!.wkid === outSR.wkid) {
      resolve(extent);
    } else {
      _requestOptions.params = {
        f: "json",
        // tslint:disable-next-line:no-unnecessary-type-assertion
        inSR: extent.spatialReference!.wkid,
        outSR: outSR.wkid,
        extentOfInterest: JSON.stringify(extent)
      };
      request
        .request(geometryServiceUrl + "/findTransformations", _requestOptions)
        .then(
          response => {
            const transformations =
              response && response.transformations
                ? response.transformations
                : undefined;
            let transformation: any;
            if (transformations && transformations.length > 0) {
              // if a forward single transformation is found use that...otherwise check for and use composite
              transformation = transformations[0].wkid
                ? transformations[0].wkid
                : transformations[0].geoTransforms
                ? transformations[0]
                : undefined;
            }

            _requestOptions.params = {
              f: "json",
              outSR: outSR.wkid,
              // tslint:disable-next-line:no-unnecessary-type-assertion
              inSR: extent.spatialReference!.wkid,
              geometries: {
                geometryType: "esriGeometryPoint",
                geometries: [
                  { x: extent.xmin, y: extent.ymin },
                  { x: extent.xmax, y: extent.ymax }
                ]
              },
              transformation: transformation
            };
            request
              .request(geometryServiceUrl + "/project", _requestOptions)
              .then(
                projectResponse => {
                  const projectGeom: any =
                    projectResponse.geometries.length === 2
                      ? projectResponse.geometries
                      : undefined;
                  if (projectGeom) {
                    resolve({
                      xmin: projectGeom[0].x,
                      ymin: projectGeom[0].y,
                      xmax: projectGeom[1].x,
                      ymax: projectGeom[1].y,
                      spatialReference: outSR
                    });
                  } else {
                    resolve(undefined);
                  }
                },
                e => reject(generalHelpers.fail(e))
              );
          },
          e => reject(generalHelpers.fail(e))
        );
    }
  });
}

/**
 * Publishes a feature service as an AGOL item; it does not include its layers and tables
 *
 * @param itemInfo Item's `item` section
 * @param authentication Credentials for the request
 * @param folderId Id of folder to receive item; null indicates that the item goes into the root
 *                 folder
 * @param access Access to set for item: "public", "org", "private"
 * @return A promise that will resolve with an object reporting success and the Solution id
 */
export function createFeatureService(
  newItemTemplate: interfaces.IItemTemplate,
  authentication: interfaces.UserSession,
  templateDictionary: any
): Promise<interfaces.ICreateServiceResult> {
  return new Promise((resolve, reject) => {
    // Create item
    _getCreateServiceOptions(
      newItemTemplate,
      authentication,
      templateDictionary
    ).then(
      createOptions => {
        serviceAdmin.createFeatureService(createOptions).then(
          createResponse => {
            resolve(createResponse);
          },
          e => reject(generalHelpers.fail(e))
        );
      },
      e => reject(generalHelpers.fail(e))
    );
  });
}

/**
 * Publishes an item and its data, metadata, and resources as an AGOL item.
 *
 * @param itemInfo Item's `item` section
 * @param folderId Id of folder to receive item; null indicates that the item goes into the root
 *                 folder; ignored for Group item type
 * @param authentication Credentials for the request
 * @param itemThumbnailUrl URL to image to use for item thumbnail
 * @param dataFile Item's `data` section
 * @param metadataFile Item's metadata file
 * @param resourcesFiles Item's resources
 * @param access Access to set for item: "public", "org", "private"
 * @return A promise that will resolve with an object reporting success or failure and the Solution id
 */
export function createFullItem(
  itemInfo: any,
  folderId: string | undefined,
  authentication: interfaces.UserSession,
  itemThumbnailUrl?: string,
  dataFile?: File,
  metadataFile?: File,
  resourcesFiles?: File[],
  access = "private"
): Promise<interfaces.ICreateItemResponse> {
  return new Promise((resolve, reject) => {
    // Create item
    const createOptions: portal.ICreateItemOptions = {
      item: {
        ...itemInfo
      },
      folderId,
      authentication: authentication
    };
    if (itemThumbnailUrl) {
      createOptions.item.thumbnailurl = itemThumbnailUrl;
    }

    portal.createItemInFolder(createOptions).then(
      createResponse => {
        if (createResponse.success) {
          let accessDef: Promise<portal.ISharingResponse>;

          // Set access if it is not AGOL default
          // Set the access manually since the access value in createItem appears to be ignored
          // Need to run serially; will not work reliably if done in parallel with adding the data section
          if (access !== "private") {
            const accessOptions: portal.ISetAccessOptions = {
              id: createResponse.id,
              access: access === "public" ? "public" : "org", // need to use constants rather than string
              authentication: authentication
            };
            accessDef = portal.setItemAccess(accessOptions);
          } else {
            accessDef = Promise.resolve({
              itemId: createResponse.id
            } as portal.ISharingResponse);
          }

          // Now add attached items
          accessDef.then(
            () => {
              const updateDefs: Array<Promise<any>> = [];

              // Add the data section
              if (dataFile) {
                updateDefs.push(
                  _addItemDataFile(createResponse.id, dataFile, authentication)
                );
              }

              // Add the resources
              if (Array.isArray(resourcesFiles) && resourcesFiles.length > 0) {
                resourcesFiles.forEach(file => {
                  const addResourceOptions: portal.IItemResourceOptions = {
                    id: createResponse.id,
                    resource: file,
                    name: file.name,
                    authentication: authentication,
                    params: {}
                  };

                  // Check for folder in resource filename
                  const filenameParts = file.name.split("/");
                  if (filenameParts.length > 1) {
                    addResourceOptions.name = filenameParts[1];
                    addResourceOptions.params = {
                      resourcesPrefix: filenameParts[0]
                    };
                  }
                  updateDefs.push(portal.addItemResource(addResourceOptions));
                });
              }

              // Add the metadata section
              if (metadataFile) {
                updateDefs.push(
                  _addItemMetadataFile(
                    createResponse.id,
                    metadataFile,
                    authentication
                  )
                );
              }

              // Wait until all adds are done
              Promise.all(updateDefs).then(
                () => resolve(createResponse),
                e => reject(generalHelpers.fail(e))
              );
            },
            e => reject(generalHelpers.fail(e))
          );
        } else {
          reject(generalHelpers.fail());
        }
      },
      e => reject(generalHelpers.fail(e))
    );
  });
}

export function createGroup(
  groupItem: any,
  authentication: interfaces.UserSession
): Promise<{ success: boolean; group: interfaces.IGroup }> {
  const requestOptions = {
    group: groupItem,
    authentication: authentication
  };
  return portal.createGroup(requestOptions);
}

/**
 * Publishes an item and its data as an AGOL item.
 *
 * @param itemInfo Item's `item` section
 * @param dataInfo Item's `data` section
 * @param authentication Credentials for the request
 * @param folderId Id of folder to receive item; null indicates that the item goes into the root
 *                 folder; ignored for Group item type
 * @param access Access to set for item: "public", "org", "private"
 * @return A promise that will resolve with an object reporting success and the Solution id
 */
export function createItemWithData(
  itemInfo: any,
  dataInfo: any,
  authentication: interfaces.UserSession,
  folderId: string | undefined,
  access = "private"
): Promise<interfaces.ICreateItemResponse> {
  return new Promise((resolve, reject) => {
    // Create item
    const createOptions: portal.ICreateItemOptions = {
      item: {
        ...itemInfo,
        data: dataInfo
      },
      folderId,
      authentication: authentication
    };

    portal.createItemInFolder(createOptions).then(
      createResponse => {
        if (createResponse.success) {
          if (access !== "private") {
            // Set access if it is not AGOL default
            // Set the access manually since the access value in createItem appears to be ignored
            const accessOptions: portal.ISetAccessOptions = {
              id: createResponse.id,
              access: access === "public" ? "public" : "org", // need to use constants rather than string
              authentication: authentication
            };
            portal.setItemAccess(accessOptions).then(
              () => {
                resolve({
                  folder: createResponse.folder,
                  id: createResponse.id,
                  success: true
                });
              },
              e => reject(generalHelpers.fail(e))
            );
          } else {
            resolve({
              folder: createResponse.folder,
              id: createResponse.id,
              success: true
            });
          }
        } else {
          reject(generalHelpers.fail());
        }
      },
      e => reject(generalHelpers.fail(e))
    );
  });
}

/**
 * Creates a folder using numeric suffix to ensure uniqueness.
 *
 * @param title Folder title, used as-is if possible and with suffix otherwise
 * @param templateDictionary Hash of facts: org URL, adlib replacements, user
 * @param authentication Credentials for creating folder
 * @return Id of created folder
 */
export function createUniqueFolder(
  title: string,
  templateDictionary: any,
  authentication: interfaces.UserSession
): Promise<interfaces.IAddFolderResponse> {
  return new Promise<interfaces.IAddFolderResponse>((resolve, reject) => {
    const folderTitle: string = generalHelpers.getUniqueTitle(
      title,
      templateDictionary,
      "user.folders"
    );
    const folderCreationParam = {
      title: folderTitle,
      authentication: authentication
    };
    portal.createFolder(folderCreationParam).then(
      ok => resolve(ok),
      err => {
        reject(err);
      }
    );
  });
}

/**
 * Gets the ids of the dependencies of an AGOL feature service item.
 * Dependencies will only exist when the service is a view.
 *
 * @param itemTemplate Template of item to be created
 * @param authentication Credentials for the request
 * @return A promise that will resolve a list of dependencies
 */
export function extractDependencies(
  itemTemplate: interfaces.IItemTemplate,
  authentication?: interfaces.UserSession
): Promise<interfaces.IDependency[]> {
  const dependencies: any[] = [];
  return new Promise((resolve, reject) => {
    // Get service dependencies when the item is a view
    if (itemTemplate.properties.service.isView && itemTemplate.item.url) {
      request
        .request(itemTemplate.item.url + "/sources?f=json", {
          authentication: authentication
        })
        .then(
          response => {
            /* istanbul ignore else */
            if (response && response.services) {
              response.services.forEach((layer: any) => {
                dependencies.push({
                  id: layer.serviceItemId,
                  name: layer.name
                });
              });
            }
            resolve(dependencies);
          },
          e => reject(generalHelpers.fail(e))
        );
    } else {
      resolve(dependencies);
    }
  });
}

export function getLayers(
  serviceUrl: string,
  layerList: any[],
  authentication: interfaces.UserSession
): Promise<any[]> {
  return new Promise<any[]>((resolve, reject) => {
    if (!Array.isArray(layerList) || layerList.length === 0) {
      resolve([]);
    }

    // get the admin URL
    serviceUrl = serviceUrl.replace("/rest/services", "/rest/admin/services");

    const requestsDfd: Array<Promise<any>> = [];
    layerList.forEach(layer => {
      const requestOptions: request.IRequestOptions = {
        authentication: authentication
      };
      requestsDfd.push(
        request.request(
          serviceUrl + "/" + layer["id"] + "?f=json",
          requestOptions
        )
      );
    });

    // Wait until all layers are heard from
    Promise.all(requestsDfd).then(
      layers => resolve(layers),
      e => reject(generalHelpers.fail(e))
    );
  });
}

/**
 * Add additional options to a layers definition.
 *
 * @param args The interfaces.IPostProcessArgs for the request(s)
 * @return An array of update instructions
 * @protected
 */
export function getLayerUpdates(
  args: interfaces.IPostProcessArgs
): interfaces.IUpdate[] {
  const adminUrl: string = args.itemTemplate.item.url.replace(
    "rest/services",
    "rest/admin/services"
  );

  const updates: interfaces.IUpdate[] = [];
  const refresh: any = _getUpdate(adminUrl, null, null, args, "refresh");
  updates.push(refresh);
  Object.keys(args.objects).forEach(id => {
    const obj: any = Object.assign({}, args.objects[id]);
    // These properties cannot be set in the update definition when working with portal
    generalHelpers.deleteProps(obj, ["type", "id", "relationships"]);
    // handle definition deletes
    // removes previous editFieldsInfo fields if their names were changed
    if (obj.hasOwnProperty("deleteFields")) {
      updates.push(_getUpdate(adminUrl, id, obj, args, "delete"));
      generalHelpers.deleteProp(obj, "deleteFields");
      updates.push(_getUpdate(adminUrl, null, null, args, "refresh"));
    }
    // handle definition updates
    updates.push(_getUpdate(adminUrl, id, obj, args, "update"));
    updates.push(refresh);
  });
  if (!args.itemTemplate.properties.service.isView) {
    const relUpdates: any = _getRelationshipUpdates({
      message: "updated layer relationships",
      objects: args.objects,
      itemTemplate: args.itemTemplate,
      authentication: args.authentication
    });
    /* istanbul ignore else */
    if (relUpdates.layers.length > 0) {
      updates.push(_getUpdate(adminUrl, null, relUpdates, args, "add"));
      updates.push(refresh);
    }
  }
  return updates;
}

/**
 * Add additional options to a layers definition
 *
 * @param Update will contain either add, update, or delete from service definition call
 * @return A promise that will resolve when service definition call has completed
 * @protected
 */
export function getRequest(update: interfaces.IUpdate): Promise<void> {
  return new Promise((resolveFn, rejectFn) => {
    const options: request.IRequestOptions = {
      params: update.params,
      authentication: update.args.authentication
    };
    request.request(update.url, options).then(
      () => resolveFn(),
      (e: any) => rejectFn(e)
    );
  });
}

/**
 * Fills in missing data, including full layer and table definitions, in a feature services' definition.
 *
 * @param itemTemplate Feature service item, data, dependencies definition to be modified
 * @param authentication Credentials for the request to AGOL
 * @return A promise that will resolve when fullItem has been updated
 * @protected
 */
export function getServiceLayersAndTables(
  itemTemplate: interfaces.IItemTemplate,
  authentication: interfaces.UserSession
): Promise<interfaces.IItemTemplate> {
  return new Promise<interfaces.IItemTemplate>((resolve, reject) => {
    // To have enough information for reconstructing the service, we'll supplement
    // the item and data sections with sections for the service, full layers, and
    // full tables

    // Get the service description
    if (itemTemplate.item.url) {
      getFeatureServiceProperties(itemTemplate.item.url, authentication).then(
        properties => {
          itemTemplate.properties = properties;
          resolve(itemTemplate);
        },
        e => reject(generalHelpers.fail(e))
      );
    } else {
      resolve(itemTemplate);
    }
  });
}

export function getFeatureServiceProperties(
  serviceUrl: string,
  authentication: interfaces.UserSession
): Promise<interfaces.IFeatureServiceProperties> {
  return new Promise<interfaces.IFeatureServiceProperties>(
    (resolve, reject) => {
      const properties: interfaces.IFeatureServiceProperties = {
        service: {},
        layers: [],
        tables: []
      };

      // Get the service description
      request
        .request(serviceUrl + "?f=json", {
          authentication: authentication
        })
        .then(
          serviceData => {
            properties.service = serviceData;

            Promise.all([
              getLayers(serviceUrl, serviceData["layers"], authentication),
              getLayers(serviceUrl, serviceData["tables"], authentication)
            ]).then(
              results => {
                properties.layers = results[0];
                properties.tables = results[1];
                resolve(properties);
              },
              (e: any) => reject(generalHelpers.fail(e))
            );
          },
          (e: any) => reject(generalHelpers.fail(e))
        );
    }
  );
}

export function hasInvalidGroupDesignations(
  groupDesignations: string
): boolean {
  const invalidGroupDesignations: string[] = ["livingatlas"];
  return groupDesignations
    ? invalidGroupDesignations.indexOf(groupDesignations) > -1
    : false;
}

/**
 * Removes a folder from AGO.
 *
 * @param folderId Id of a folder to delete
 * @param authentication Credentials for the request to AGO
 * @return A promise that will resolve with the result of the request
 */
export function removeFolder(
  folderId: string,
  authentication: interfaces.UserSession
): Promise<interfaces.IFolderStatusResponse> {
  return new Promise<interfaces.IFolderStatusResponse>((resolve, reject) => {
    const requestOptions: portal.IFolderIdOptions = {
      folderId: folderId,
      authentication: authentication
    };
    portal
      .removeFolder(requestOptions)
      .then(
        result => (result.success ? resolve(result) : reject(result)),
        reject
      );
  });
}

/**
 * Removes a group from AGO.
 *
 * @param groupId Id of a group to delete
 * @param authentication Credentials for the request to AGO
 * @return A promise that will resolve with the result of the request
 */
export function removeGroup(
  groupId: string,
  authentication: interfaces.UserSession
): Promise<interfaces.IStatusResponse> {
  return new Promise<interfaces.IStatusResponse>((resolve, reject) => {
    const requestOptions: portal.IUserGroupOptions = {
      id: groupId,
      authentication: authentication
    };
    portal
      .removeGroup(requestOptions)
      .then(
        result => (result.success ? resolve(result) : reject(result)),
        reject
      );
  });
}

/**
 * Removes an item from AGO.
 *
 * @param itemId Id of an item to delete
 * @param authentication Credentials for the request to AGO
 * @return A promise that will resolve with the result of the request
 */
export function removeItem(
  itemId: string,
  authentication: interfaces.UserSession
): Promise<interfaces.IStatusResponse> {
  return new Promise<interfaces.IStatusResponse>((resolve, reject) => {
    const requestOptions: portal.IUserItemOptions = {
      id: itemId,
      authentication: authentication
    };
    return portal
      .removeItem(requestOptions)
      .then(
        result => (result.success ? resolve(result) : reject(result)),
        reject
      );
  });
}

/**
 * Removes an item or group from AGO.
 *
 * @param itemId Id of an item or group to delete
 * @param authentication Credentials for the request to AGO
 * @return A promise that will resolve with the result of the request
 */
export function removeItemOrGroup(
  itemId: string,
  authentication: interfaces.UserSession
): Promise<interfaces.IStatusResponse> {
  return new Promise<interfaces.IStatusResponse>((resolve, reject) => {
    removeItem(itemId, authentication).then(resolve, error => {
      removeGroup(itemId, authentication).then(resolve, () => reject(error));
    });
  });
}

export function searchGroups(
  searchString: string,
  authentication: interfaces.UserSession
): Promise<interfaces.ISearchResult<interfaces.IGroup>> {
  const searchOptions: portal.ISearchOptions = {
    q: searchString,
    authentication: authentication
  };
  return portal.searchGroups(searchOptions);
}

export function shareItem(
  groupId: string,
  id: string,
  destinationAuthentication: interfaces.UserSession
): Promise<void> {
  return new Promise((resolve, reject) => {
    const shareOptions: portal.IGroupSharingOptions = {
      groupId,
      id,
      authentication: destinationAuthentication
    };

    portal.shareItemWithGroup(shareOptions).then(
      () => resolve(),
      (e: any) => reject(generalHelpers.fail(e))
    );
  });
}

export function updateItem(
  itemInfo: interfaces.IItemUpdate,
  authentication: interfaces.UserSession,
  folderId?: string
): Promise<interfaces.IUpdateItemResponse> {
  return new Promise((resolve, reject) => {
    const updateOptions: portal.IUpdateItemOptions = {
      item: itemInfo,
      folderId: folderId,
      authentication: authentication
    };
    portal.updateItem(updateOptions).then(
      response => (response.success ? resolve(response) : reject(response)),
      err => reject(err)
    );
  });
}

export function updateItemExtended(
  serviceItemId: string,
  itemInfo: interfaces.IItemUpdate,
  data: any,
  authentication: interfaces.UserSession,
  access?: string | undefined
): Promise<void> {
  return new Promise((resolve, reject) => {
    const updateOptions: portal.IUpdateItemOptions = {
      item: itemInfo,
      params: {
        text: data
      },
      authentication: authentication
    };
    portal.updateItem(updateOptions).then(
      () => {
        if (access && access !== "private") {
          // Set access if it is not AGOL default
          // Set the access manually since the access value in createItem appears to be ignored
          const accessOptions: portal.ISetAccessOptions = {
            id: serviceItemId,
            access: access === "public" ? "public" : "org", // need to use constants rather than string
            authentication: authentication
          };
          portal.setItemAccess(accessOptions).then(
            () => resolve(),
            e => reject(generalHelpers.fail(e))
          );
        } else {
          resolve();
        }
      },
      e => reject(generalHelpers.fail(e))
    );
  });
}

/**
 * Updates the URL of an item.
 *
 * @param id AGOL id of item to update
 * @param url URL to assign to item's base section
 * @param authentication Credentials for the request
 * @return A promise that will resolve with the item id when the item has been updated or an AGO-style JSON failure
 *         response
 */
export function updateItemURL(
  id: string,
  url: string,
  authentication: interfaces.UserSession
): Promise<string> {
  const numAttempts = 3;
  return _updateItemURL(id, url, authentication, numAttempts);
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Adds a data section to an item.
 *
 * @param itemId Id of item to receive data file
 * @param dataFile Data to be added
 * @param authentication Credentials for the request
 * @return Promise reporting success or failure
 * @protected
 */
export function _addItemDataFile(
  itemId: string,
  dataFile: File,
  authentication: interfaces.UserSession
): Promise<interfaces.IUpdateItemResponse> {
  return new Promise<interfaces.IUpdateItemResponse>((resolve, reject) => {
    const addItemData: (data: any) => void = (data: any) => {
      const addDataOptions: portal.IAddItemDataOptions = {
        id: itemId,
        data: data,
        authentication: authentication
      };
      portal.addItemData(addDataOptions).then(resolve, reject);
    };

    // Item data has to be submitted as text or JSON for those file types
    if (dataFile.type.startsWith("text/plain")) {
      generalHelpers.blobToText(dataFile).then(addItemData, reject);
    } else if (dataFile.type === "application/json") {
      generalHelpers.blobToJson(dataFile).then(addItemData, reject);
    } else {
      addItemData(dataFile);
    }
  });
}

/**
 * Adds a metadata file to an item.
 *
 * @param itemId Id of item to receive data file
 * @param metadataFile Metadata to be added
 * @param authentication Credentials for the request
 * @return Promise reporting success or failure
 * @protected
 */
export function _addItemMetadataFile(
  itemId: string,
  metadataFile: File,
  authentication: interfaces.UserSession
): Promise<interfaces.IUpdateItemResponse> {
  return new Promise<interfaces.IUpdateItemResponse>((resolve, reject) => {
    const addMetadataOptions: portal.IUpdateItemOptions = {
      item: {
        id: itemId
      },
      params: {
        // Pass metadata in via params because item property is serialized, which discards a blob
        metadata: metadataFile
      },
      authentication: authentication
    };

    portal.updateItem(addMetadataOptions).then(resolve, reject);
  });
}

/**
 * Accumulates the number of relationships in a collection of layers.
 *
 * @param List of layers to examine
 * @return The number of relationships
 * @protected
 */
export function _countRelationships(layers: any[]): number {
  const reducer = (accumulator: number, currentLayer: any) =>
    accumulator +
    (currentLayer.relationships ? currentLayer.relationships.length : 0);

  return layers.reduce(reducer, 0);
}

/**
 * Gets the full definitions of the layers affiliated with a hosted service.
 *
 * @param serviceUrl URL to hosted service
 * @param layerList List of layers at that service...must contain id
 * @param authentication Credentials for the request
 * @return A promise that will resolve with a list of the layers from the admin api
 * @protected
 */
export function _getCreateServiceOptions(
  newItemTemplate: interfaces.IItemTemplate,
  authentication: interfaces.UserSession,
  templateDictionary: any
): Promise<any> {
  return new Promise((resolve, reject) => {
    const itemInfo: any = {};
    const serviceInfo: any = newItemTemplate.properties;
    const folderId: any = templateDictionary.folderId;
    const isPortal: boolean = templateDictionary.isPortal;
    const solutionItemId: string = templateDictionary.solutionItemId;
    const itemId: string = newItemTemplate.itemId;

    const params: request.IParams = {};

    // Retain the existing title but swap with name if it's missing
    itemInfo.title = newItemTemplate.item.title || newItemTemplate.item.name;

    // Need to set the service name: name + "_" + newItemId
    const baseName: string =
      newItemTemplate.item.name || newItemTemplate.item.title;

    // If the name already contains a GUID replace it with the newItemID
    const regEx: any = new RegExp("[0-9A-F]{32}", "gmi");
    itemInfo.name = regEx.exec(baseName)
      ? baseName.replace(regEx, solutionItemId)
      : baseName + "_" + solutionItemId;

    const _item: serviceAdmin.ICreateServiceParams = {
      ...itemInfo,
      preserveLayerIds: true
    };

    const createOptions = {
      item: _item,
      folderId,
      params,
      authentication: authentication
    };

    createOptions.item = _setItemProperties(
      createOptions.item,
      serviceInfo,
      params,
      isPortal
    );

    // project the portals extent to match that of the service
    convertExtent(
      templateDictionary.organization.defaultExtent,
      serviceInfo.service.spatialReference,
      templateDictionary.organization.helperServices.geometry.url,
      authentication
    ).then(
      extent => {
        templateDictionary[itemId].solutionExtent = extent;
        createOptions.item = templatization.replaceInTemplate(
          createOptions.item,
          templateDictionary
        );
        createOptions.params = templatization.replaceInTemplate(
          createOptions.params,
          templateDictionary
        );
        resolve(createOptions);
      },
      e => reject(generalHelpers.fail(e))
    );
  });
}

/**
 * Add relationships to all layers in one call to retain fully functioning composite relationships
 *
 * @param args The interfaces.IPostProcessArgs for the request(s)
 * @return Any relationships that should be updated for the service
 * @protected
 */
export function _getRelationshipUpdates(
  args: interfaces.IPostProcessArgs
): any {
  const rels: any = {
    layers: []
  };
  Object.keys(args.objects).forEach((k: any) => {
    const obj: any = args.objects[k];
    /* istanbul ignore else */
    if (obj.relationships && obj.relationships.length > 0) {
      rels.layers.push({
        id: obj.id,
        relationships: obj.relationships
      });
    }
    generalHelpers.deleteProp(obj, "relationships");
  });
  return rels;
}

/**
 * Get refresh, add, update, or delete definition info
 *
 * @param url the base admin url for the service
 * @param id the id of the layer
 * @param obj parameters for the request
 * @param args various arguments to help support the request
 * @param type type of update the request will handle
 * @return interfaces.IUpdate that has the request url and arguments
 * @protected
 */
export function _getUpdate(
  url: string,
  id: any,
  obj: any,
  args: any,
  type: "delete" | "update" | "add" | "refresh"
): interfaces.IUpdate {
  const ops: any = {
    delete: {
      url: url + "/" + id + "/deleteFromDefinition",
      params: {
        deleteFromDefinition: {
          fields:
            obj && obj.hasOwnProperty("deleteFields") ? obj.deleteFields : []
        }
      }
    },
    update: {
      url: url + "/" + id + "/updateDefinition",
      params: {
        updateDefinition: obj
      }
    },
    add: {
      url: url + "/addToDefinition",
      params: {
        addToDefinition: obj
      }
    },
    refresh: {
      url: url + "/refresh",
      params: {
        f: "json"
      }
    }
  };

  return {
    url: ops[type].url,
    params: ops[type].params,
    args: args
  };
}

/**
 * Updates a feature service item.
 *
 * @param item Item to update
 * @param serviceInfo Service information
 * @param params arcgis-rest-js params to update
 * @param isPortal Is the service hosted in a portal?
 * @return Updated item
 */
export function _setItemProperties(
  item: any,
  serviceInfo: any,
  params: request.IParams,
  isPortal: boolean
): any {
  // Set the capabilities
  const portalCapabilities = [
    "Create",
    "Query",
    "Editing",
    "Update",
    "Delete",
    "Uploads",
    "Sync",
    "Extract"
  ];

  const capabilities =
    generalHelpers.getProp(serviceInfo, "service.capabilities") ||
    (isPortal ? "" : []);

  item.capabilities = isPortal
    ? capabilities
        .split(",")
        .filter((c: any) => portalCapabilities.indexOf(c) > -1)
        .join(",")
    : capabilities;
  if (serviceInfo.service.capabilities) {
    serviceInfo.service.capabilities = item.capabilities;
  }

  // set create options item properties
  const keyProperties: string[] = [
    "isView",
    "sourceSchemaChangesAllowed",
    "isUpdatableView",
    "capabilities",
    "isMultiServicesView"
  ];
  const deleteKeys: string[] = ["layers", "tables"];
  const itemKeys: string[] = Object.keys(item);
  const serviceKeys: string[] = Object.keys(serviceInfo.service);
  serviceKeys.forEach(k => {
    if (itemKeys.indexOf(k) === -1 && deleteKeys.indexOf(k) < 0) {
      item[k] = serviceInfo.service[k];
      // These need to be included via params otherwise...
      // addToDef calls fail when adding adminLayerInfo
      if (serviceInfo.service.isView && keyProperties.indexOf(k) > -1) {
        params[k] = serviceInfo.service[k];
      }
    }
  });

  // Enable editor tracking on layer with related tables is not supported.
  if (
    item.isMultiServicesView &&
    generalHelpers.getProp(item, "editorTrackingInfo.enableEditorTracking")
  ) {
    item.editorTrackingInfo.enableEditorTracking = false;
    params["editorTrackingInfo"] = item.editorTrackingInfo;
  }

  return item;
}

/**
 * Updates the URL of an item.
 *
 * @param id AGOL id of item to update
 * @param url URL to assign to item's base section
 * @param authentication Credentials for the request
 * @param numAttempts Number of times to try to set the URL if AGO says that it updated the URL, but really didn't
 * @return A promise that will resolve with the item id when the item has been updated or an AGO-style JSON failure
 *         response
 */
export function _updateItemURL(
  id: string,
  url: string,
  authentication: interfaces.UserSession,
  numAttempts = 1
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Update the item's URL
    const options = { item: { id, url }, authentication: authentication };

    portal.updateItem(options).then(
      result => {
        if (!result.success) {
          reject(generalHelpers.fail(result));
        } else {
          // Get the item to see if the URL really changed
          return portal
            .getItem(id, { authentication: authentication })
            .then(item => {
              if (url === item.url) {
                resolve(id);
              } else {
                // If it fails, try again if we have sufficient attempts remaining
                const errorMsg =
                  "URL not updated for " +
                  item.type +
                  " " +
                  item.id +
                  ": " +
                  item.url +
                  " (" +
                  numAttempts +
                  ")";
                console.error(errorMsg);
                if (--numAttempts > 0) {
                  _updateItemURL(id, url, authentication, numAttempts).then(
                    resolve,
                    reject
                  );
                } else {
                  reject(errorMsg);
                }
              }
            });
        }
      },
      e => reject(generalHelpers.fail(e))
    );
  });
}
