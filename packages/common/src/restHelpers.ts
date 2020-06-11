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

import {
  appendQueryParam,
  blobToJson,
  blobToText,
  checkUrlPathTermination,
  deleteProp,
  deleteProps,
  fail,
  getProp,
  getUniqueTitle,
  setCreateProp
} from "./generalHelpers";
import {
  IAddFolderResponse,
  IAddGroupResponse,
  IAdditionalSearchOptions,
  ICreateItemResponse,
  ICreateServiceResult,
  IDependency,
  IExtent,
  IFeatureServiceProperties,
  IFolderStatusResponse,
  IGroup,
  IGroupAdd,
  IItem,
  IItemTemplate,
  IItemUpdate,
  IPostProcessArgs,
  IRelatedItems,
  ISpatialReference,
  IStatusResponse,
  ItemRelationshipType,
  IUpdate,
  IUpdateItemResponse,
  UserSession
} from "./interfaces";
import { createZip } from "./libConnectors";
import {
  addItemData as portalAddItemData,
  addItemRelationship,
  addItemResource,
  createFolder,
  createGroup,
  createItemInFolder,
  getItem,
  IAddItemDataOptions,
  ICreateItemOptions,
  IFolderIdOptions,
  IGroupSharingOptions,
  IItemResourceOptions,
  IItemResourceResponse,
  IManageItemRelationshipOptions,
  ISearchGroupContentOptions,
  ISearchOptions,
  ISearchResult,
  ISetAccessOptions,
  ISharingResponse,
  IUpdateItemOptions,
  IUserGroupOptions,
  IUserItemOptions,
  removeFolder as portalRemoveFolder,
  removeGroup as portalRemoveGroup,
  removeItem as portalRemoveItem,
  searchGroupContent,
  searchGroups as portalSearchGroups,
  searchItems as portalSearchItems,
  SearchQueryBuilder,
  setItemAccess,
  shareItemWithGroup,
  updateItem as portalUpdateItem
} from "@esri/arcgis-rest-portal";
import { IParams, IRequestOptions, request } from "@esri/arcgis-rest-request";
import {
  ICreateServiceParams,
  addToServiceDefinition as svcAdminAddToServiceDefinition,
  createFeatureService as svcAdminCreateFeatureService
} from "@esri/arcgis-rest-service-admin";
import { replaceInTemplate } from "./templatization";

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
  search: string | ISearchOptions | SearchQueryBuilder
): Promise<ISearchResult<IItem>> {
  return portalSearchItems(search);
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
  relationshipType: ItemRelationshipType,
  authentication: UserSession
): Promise<IStatusResponse> {
  return new Promise<IStatusResponse>(resolve => {
    const requestOptions: IManageItemRelationshipOptions = {
      originItemId,
      destinationItemId,
      relationshipType,
      authentication
    };
    addItemRelationship(requestOptions).then(
      response => {
        resolve({
          success: response.success,
          itemId: originItemId
        } as IStatusResponse);
      },
      () => {
        resolve({
          success: false,
          itemId: originItemId
        } as IStatusResponse);
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
  destinationRelationships: IRelatedItems[],
  authentication: UserSession
): Promise<IStatusResponse[]> {
  return new Promise<IStatusResponse[]>(resolve => {
    // Set up relationships using updated relationship information
    const relationshipPromises = new Array<Promise<IStatusResponse>>();
    destinationRelationships.forEach(relationship => {
      relationship.relatedItemIds.forEach(relatedItemId => {
        relationshipPromises.push(
          addForwardItemRelationship(
            originItemId,
            relatedItemId,
            relationship.relationshipType as ItemRelationshipType,
            authentication
          )
        );
      });
    });
    // tslint:disable-next-line: no-floating-promises
    Promise.all(relationshipPromises).then((responses: IStatusResponse[]) =>
      resolve(responses)
    );
  });
}

/**
 * Adds a token to the query parameters of a URL.
 *
 * @param url URL to use as base
 * @param authentication Credentials to be used to generate token for URL
 * @return A promise that will resolve with the supplied URL with `token=&lt;token&gt;` added to its query params
 * unless either the URL doesn't exist or the token can't be generated
 */
export function addTokenToUrl(
  url: string,
  authentication: UserSession
): Promise<string> {
  return new Promise<string>(resolve => {
    if (!url || !authentication) {
      resolve(url);
    } else {
      authentication.getToken(url).then(
        token => {
          /* istanbul ignore else */
          if (token) {
            url = appendQueryParam(url, "token=" + token);
          }
          resolve(url);
        },
        () => resolve(url)
      );
    }
  });
}

export function addToServiceDefinition(
  url: string,
  options: any
): Promise<void> {
  return new Promise((resolve, reject) => {
    svcAdminAddToServiceDefinition(url, options).then(
      () => {
        resolve();
      },
      e => reject(fail(e))
    );
  });
}

/**
 * Simple validate function to ensure all coordinates are numbers
 * In some cases orgs can have null or undefined coordinate values associated with the org extent
 *
 * @param extent the extent to validate
 * @return the provided extent or a default global extent if some coordinates are not numbers
 * @protected
 */
export function _validateExtent(extent: IExtent): IExtent {
  // in some cases orgs can have invalid extents defined
  // this is a simple validate function that will ensure coordiantes are numbers
  // using -179,-89,179,89 because the project call is returning "NaN" when using -180,-90,180,90
  const hasInvalid =
    typeof extent.xmin !== "number" ||
    typeof extent.xmax !== "number" ||
    typeof extent.ymax !== "number" ||
    typeof extent.ymin !== "number";
  if (hasInvalid) {
    extent.xmin = -179;
    extent.xmax = 179;
    extent.ymax = 89;
    extent.ymin = -89;
    extent.spatialReference = { wkid: 4326 };
  }
  return extent;
}

/**
 * If the request to convert the extent fails it has commonly been due to an invalid extent.
 * This function will first attempt to use the provided extent. If it fails it will default to
 * the source items extent and if that fails it will then use a default global extent.
 *
 * @param extent the extent to convert
 * @param fallbackExtent the extent to convert if the main extent does not project to the outSR
 * @param outSR the spatial reference to project to
 * @param geometryServiceUrl the service url for the geometry service to use
 * @param authentication the credentials for the requests
 * @return the extent projected to the provided spatial reference
 * or the world extent projected to the provided spatial reference
 * @protected
 */
export function convertExtentWithFallback(
  extent: IExtent,
  fallbackExtent: any,
  outSR: ISpatialReference,
  geometryServiceUrl: string,
  authentication: UserSession
): Promise<any> {
  return new Promise((resolve, reject) => {
    const defaultExtent = {
      xmin: -179,
      xmax: 179,
      ymin: -89,
      ymax: 89,
      spatialReference: { wkid: 4326 }
    };
    convertExtent(
      _validateExtent(extent),
      outSR,
      geometryServiceUrl,
      authentication
    ).then(
      extentResponse => {
        // in some cases project will complete successfully but return "NaN" values
        // check for this and call convert again if it does
        const extentResponseString = JSON.stringify(extentResponse);
        const validatedExtent = JSON.stringify(_validateExtent(extentResponse));
        if (extentResponseString === validatedExtent) {
          resolve(extentResponse);
        } else {
          convertExtent(
            fallbackExtent || defaultExtent,
            outSR,
            geometryServiceUrl,
            authentication
          ).then(resolve, e => reject(fail(e)));
        }
      },
      // if convert fails try again with default global extent
      () => {
        convertExtent(
          defaultExtent,
          outSR,
          geometryServiceUrl,
          authentication
        ).then(resolve, e => reject(fail(e)));
      }
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
  extent: IExtent,
  outSR: ISpatialReference,
  geometryServiceUrl: string,
  authentication: UserSession
): Promise<any> {
  const _requestOptions: any = Object.assign({}, authentication);
  return new Promise<any>((resolve, reject) => {
    // tslint:disable-next-line:no-unnecessary-type-assertion
    if (extent.spatialReference!.wkid === outSR?.wkid || !outSR) {
      resolve(extent);
    } else {
      _requestOptions.params = {
        f: "json",
        // tslint:disable-next-line:no-unnecessary-type-assertion
        inSR: extent.spatialReference!.wkid,
        outSR: outSR.wkid,
        extentOfInterest: JSON.stringify(extent)
      };
      request(
        checkUrlPathTermination(geometryServiceUrl) + "findTransformations",
        _requestOptions
      ).then(
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
          request(
            checkUrlPathTermination(geometryServiceUrl) + "project",
            _requestOptions
          ).then(
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
            e => reject(fail(e))
          );
        },
        e => reject(fail(e))
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
  newItemTemplate: IItemTemplate,
  authentication: UserSession,
  templateDictionary: any
): Promise<ICreateServiceResult> {
  return new Promise((resolve, reject) => {
    // Create item
    _getCreateServiceOptions(
      newItemTemplate,
      authentication,
      templateDictionary
    ).then(
      createOptions => {
        svcAdminCreateFeatureService(createOptions).then(
          createResponse => {
            resolve(createResponse);
          },
          e => reject(fail(e))
        );
      },
      e => reject(fail(e))
    );
  });
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
export function createFullItem(
  itemInfo: any,
  folderId: string | undefined,
  destinationAuthentication: UserSession,
  itemThumbnailUrl?: string,
  itemThumbnailAuthentication?: UserSession,
  dataFile?: File,
  metadataFile?: File,
  resourcesFiles?: File[],
  access = "private"
): Promise<ICreateItemResponse> {
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
    addTokenToUrl(itemThumbnailUrl, itemThumbnailAuthentication).then(
      updatedThumbnailUrl => {
        /* istanbul ignore else */
        if (updatedThumbnailUrl) {
          createOptions.item.thumbnailurl = appendQueryParam(
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
                      _addItemDataFile(
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
                    updateDefs.push(
                      new Promise<IItemResourceResponse>(
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
                              addItemResource(addResourceOptions).then(
                                rsrcResolve,
                                rsrcReject
                              );
                            },
                            rsrcReject
                          );
                        }
                      )
                    );
                  }

                  // Add the metadata section
                  if (metadataFile) {
                    updateDefs.push(
                      _addItemMetadataFile(
                        createResponse.id,
                        metadataFile,
                        destinationAuthentication
                      )
                    );
                  }

                  // Wait until all adds are done
                  Promise.all(updateDefs).then(
                    () => resolve(createResponse),
                    e => reject(fail(e))
                  );
                },
                e => reject(fail(e))
              );
            } else {
              reject(fail());
            }
          },
          e => reject(fail(e))
        );
      }
    );
  });
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
  authentication: UserSession,
  folderId: string | undefined,
  access = "private"
): Promise<ICreateItemResponse> {
  return new Promise((resolve, reject) => {
    // Create item
    const createOptions: ICreateItemOptions = {
      item: {
        ...itemInfo,
        data: dataInfo
      },
      folderId,
      authentication: authentication
    };

    createItemInFolder(createOptions).then(
      createResponse => {
        if (createResponse.success) {
          if (access !== "private") {
            // Set access if it is not AGOL default
            // Set the access manually since the access value in createItem appears to be ignored
            const accessOptions: ISetAccessOptions = {
              id: createResponse.id,
              access: access === "public" ? "public" : "org", // need to use constants rather than string
              authentication: authentication
            };
            setItemAccess(accessOptions).then(
              () => {
                resolve({
                  folder: createResponse.folder,
                  id: createResponse.id,
                  success: true
                });
              },
              e => reject(fail(e))
            );
          } else {
            resolve({
              folder: createResponse.folder,
              id: createResponse.id,
              success: true
            });
          }
        } else {
          reject(fail());
        }
      },
      e => reject(fail(e))
    );
  });
}

/**
 * Creates a folder using a numeric suffix to ensure uniqueness if necessary.
 *
 * @param title Folder title, used as-is if possible and with suffix otherwise
 * @param templateDictionary Hash of facts: org URL, adlib replacements, user; .user.folders property contains a list
 * of known folder names; function updates list with existing names not yet known, and creates .user.folders if it
 * doesn't exist in the dictionary
 * @param authentication Credentials for creating folder
 * @return Id of created folder
 */
export function createUniqueFolder(
  title: string,
  templateDictionary: any,
  authentication: UserSession
): Promise<IAddFolderResponse> {
  return new Promise<IAddFolderResponse>((resolve, reject) => {
    // Get a title that is not already in use
    const folderTitle: string = getUniqueTitle(
      title,
      templateDictionary,
      "user.folders"
    );
    const folderCreationParam = {
      title: folderTitle,
      authentication: authentication
    };
    createFolder(folderCreationParam).then(
      ok => resolve(ok),
      err => {
        // If the name already exists, we'll try again
        const errorDetails = getProp(err, "response.error.details") as string[];
        if (Array.isArray(errorDetails) && errorDetails.length > 0) {
          const nameNotAvailMsg =
            "Folder title '" + folderTitle + "' not available.";
          if (errorDetails.indexOf(nameNotAvailMsg) >= 0) {
            // Create the user.folders property if it doesn't exist
            /* istanbul ignore else */
            if (!getProp(templateDictionary, "user.folders")) {
              setCreateProp(templateDictionary, "user.folders", []);
            }
            templateDictionary.user.folders.push({
              title: folderTitle
            });
            createUniqueFolder(title, templateDictionary, authentication).then(
              resolve,
              reject
            );
          } else {
            reject(err);
          }
        } else {
          // Otherwise, error out
          reject(err);
        }
      }
    );
  });
}

/**
 * Creates a group using numeric suffix to ensure uniqueness.
 *
 * @param title Group title, used as-is if possible and with suffix otherwise
 * @param templateDictionary Hash of facts: org URL, adlib replacements, user
 * @param authentication Credentials for creating group
 * @return Information about created group
 */
export function createUniqueGroup(
  title: string,
  groupItem: IGroupAdd,
  templateDictionary: any,
  authentication: UserSession
): Promise<IAddGroupResponse> {
  return new Promise<IAddGroupResponse>((resolve, reject) => {
    // Get a title that is not already in use
    groupItem.title = getUniqueTitle(title, templateDictionary, "user.groups");
    const groupCreationParam = {
      group: groupItem,
      authentication: authentication
    };
    createGroup(groupCreationParam).then(resolve, err => {
      // If the name already exists, we'll try again
      const errorDetails = getProp(err, "response.error.details") as string[];
      if (Array.isArray(errorDetails) && errorDetails.length > 0) {
        const nameNotAvailMsg =
          "You already have a group named '" +
          groupItem.title +
          "'. Try a different name.";
        if (errorDetails.indexOf(nameNotAvailMsg) >= 0) {
          templateDictionary.user.groups.push({
            title: groupItem.title
          });
          createUniqueGroup(
            title,
            groupItem,
            templateDictionary,
            authentication
          ).then(resolve, reject);
        } else {
          reject(err);
        }
      } else {
        // Otherwise, error out
        reject(err);
      }
    });
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
  itemTemplate: IItemTemplate,
  authentication?: UserSession
): Promise<IDependency[]> {
  const dependencies: any[] = [];
  return new Promise((resolve, reject) => {
    // Get service dependencies when the item is a view
    if (itemTemplate.properties.service.isView && itemTemplate.item.url) {
      request(
        checkUrlPathTermination(itemTemplate.item.url) + "sources?f=json",
        {
          authentication: authentication
        }
      ).then(
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
        e => reject(fail(e))
      );
    } else {
      resolve(dependencies);
    }
  });
}

export function getLayers(
  serviceUrl: string,
  layerList: any[],
  authentication: UserSession
): Promise<any[]> {
  return new Promise<any[]>((resolve, reject) => {
    if (layerList.length === 0) {
      resolve([]);
    }

    // get the admin URL
    serviceUrl = serviceUrl.replace("/rest/services", "/rest/admin/services");

    const requestsDfd: Array<Promise<any>> = [];
    layerList.forEach(layer => {
      const requestOptions: IRequestOptions = {
        authentication: authentication
      };
      requestsDfd.push(
        request(
          checkUrlPathTermination(serviceUrl) + layer["id"] + "?f=json",
          requestOptions
        )
      );
    });

    // Wait until all layers are heard from
    Promise.all(requestsDfd).then(
      layers => resolve(layers),
      e => reject(fail(e))
    );
  });
}

/**
 * Add additional options to a layers definition.
 *
 * @param args The IPostProcessArgs for the request(s)
 * @return An array of update instructions
 * @protected
 */
export function getLayerUpdates(args: IPostProcessArgs): IUpdate[] {
  const adminUrl: string = args.itemTemplate.item.url.replace(
    "rest/services",
    "rest/admin/services"
  );

  const updates: IUpdate[] = [];
  const refresh: any = _getUpdate(adminUrl, null, null, args, "refresh");
  updates.push(refresh);
  Object.keys(args.objects).forEach(id => {
    const obj: any = Object.assign({}, args.objects[id]);
    // These properties cannot be set in the update definition when working with portal
    deleteProps(obj, ["type", "id", "relationships"]);
    // handle definition deletes
    // removes previous editFieldsInfo fields if their names were changed
    if (obj.hasOwnProperty("deleteFields")) {
      updates.push(_getUpdate(adminUrl, id, obj, args, "delete"));
      deleteProp(obj, "deleteFields");
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
export function getRequest(update: IUpdate): Promise<void> {
  return new Promise((resolveFn, rejectFn) => {
    const options: IRequestOptions = {
      params: update.params,
      authentication: update.args.authentication
    };
    request(update.url, options).then(
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
  itemTemplate: IItemTemplate,
  authentication: UserSession
): Promise<IItemTemplate> {
  return new Promise<IItemTemplate>((resolve, reject) => {
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
        e => reject(fail(e))
      );
    } else {
      resolve(itemTemplate);
    }
  });
}

export function getFeatureServiceProperties(
  serviceUrl: string,
  authentication: UserSession
): Promise<IFeatureServiceProperties> {
  return new Promise<IFeatureServiceProperties>((resolve, reject) => {
    const properties: IFeatureServiceProperties = {
      service: {},
      layers: [],
      tables: []
    };

    // get the admin URL
    serviceUrl = serviceUrl.replace("/rest/services", "/rest/admin/services");

    // Get the service description
    request(serviceUrl + "?f=json", {
      authentication: authentication
    }).then(
      serviceData => {
        properties.service = _parseAdminServiceData(serviceData);

        // Copy cacheMaxAge to top level so that AGO sees it when deploying the service
        // serviceData may have set it if there isn't an adminServiceInfo
        /* istanbul ignore else */
        if (serviceData.adminServiceInfo?.cacheMaxAge) {
          properties.service.cacheMaxAge =
            serviceData.adminServiceInfo.cacheMaxAge;
        }

        // Move the layers and tables out of the service's data section
        /* istanbul ignore else */
        if (serviceData.layers) {
          properties.layers = serviceData.layers;

          // Fill in properties that the service layer doesn't provide
          properties.layers.forEach(layer => {
            layer.serviceItemId = properties.service.serviceItemId;
            layer.extent = null;
          });
        }
        delete serviceData.layers;

        /* istanbul ignore else */
        if (serviceData.tables) {
          properties.tables = serviceData.tables;

          // Fill in properties that the service layer doesn't provide
          properties.tables.forEach(table => {
            table.serviceItemId = properties.service.serviceItemId;
            table.extent = null;
          });
        }
        delete serviceData.tables;

        resolve(properties);
      },
      (e: any) => reject(fail(e))
    );
  });
}

/**
 * Parses the layers array and will filter subsets of Layers and Tables
 * Layers and Tables are both returned in the layers array when we access a feature service from the admin api.
 *
 * @param adminData The data of the feature service
 * @return A mutated version of the provided adminData
 */
export function _parseAdminServiceData(adminData: any): any {
  const layers: any[] = adminData.layers || [];
  const tables: any[] = adminData.tables || [];
  setCreateProp(
    adminData,
    "layers",
    layers.filter(l => l.type === "Feature Layer")
  );
  // TODO understand if the concat is necessary.
  // Not sure if the admin api will ever actually return a tables collection here.
  setCreateProp(
    adminData,
    "tables",
    tables.concat(layers.filter(l => l.type === "Table"))
  );
  return adminData;
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
  authentication: UserSession
): Promise<IFolderStatusResponse> {
  return new Promise<IFolderStatusResponse>((resolve, reject) => {
    const requestOptions: IFolderIdOptions = {
      folderId: folderId,
      authentication: authentication
    };
    portalRemoveFolder(requestOptions).then(
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
  authentication: UserSession
): Promise<IStatusResponse> {
  return new Promise<IStatusResponse>((resolve, reject) => {
    const requestOptions: IUserGroupOptions = {
      id: groupId,
      authentication: authentication
    };
    portalRemoveGroup(requestOptions).then(
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
  authentication: UserSession
): Promise<IStatusResponse> {
  return new Promise<IStatusResponse>((resolve, reject) => {
    const requestOptions: IUserItemOptions = {
      id: itemId,
      authentication: authentication
    };
    return portalRemoveItem(requestOptions).then(
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
  authentication: UserSession
): Promise<IStatusResponse> {
  return new Promise<IStatusResponse>((resolve, reject) => {
    removeItem(itemId, authentication).then(resolve, error => {
      removeGroup(itemId, authentication).then(resolve, () => reject(error));
    });
  });
}

/**
 * Removes a list of items and/or groups from AGO.
 *
 * @param itemIds Ids of items or groups to delete
 * @param authentication Credentials for the request to AGO
 * @return A promise that will resolve when deletion is done or fails
 */
export function removeListOfItemsOrGroups(
  itemIds: string[],
  authentication: UserSession
): Promise<void> {
  return new Promise<void>(resolve => {
    Promise.all(
      itemIds.map(itemId => removeItemOrGroup(itemId, authentication))
    ).then(
      () => resolve(),
      () => resolve()
    );
  });
}

/**
 * Searches for groups matching criteria.
 *
 * @param searchString Text for which to search, e.g., 'redlands+map', 'type:"Web Map" -type:"Web Mapping Application"'
 * @param authentication Credentials for the request to AGO
 * @param additionalSearchOptions Adjustments to search, such as tranche size
 * @return A promise that will resolve with a structure with a tranche of results and
 * describing how many items are available
 * @see https://developers.arcgis.com/rest/users-groups-and-items/group-search.htm
 * @see https://developers.arcgis.com/rest/users-groups-and-items/search-reference.htm
 */
export function searchGroups(
  searchString: string,
  authentication: UserSession,
  additionalSearchOptions?: IAdditionalSearchOptions
): Promise<ISearchResult<IGroup>> {
  const searchOptions: ISearchOptions = {
    q: searchString,
    params: {
      ...additionalSearchOptions
    },
    authentication: authentication
  };
  return portalSearchGroups(searchOptions);
}

/**
 * Searches for group contents matching criteria.
 *
 * @param groupId Group whose contents are to be searched
 * @param searchString Text for which to search, e.g., 'redlands+map', 'type:"Web Map" -type:"Web Mapping Application"'
 * @param authentication Credentials for the request to AGO
 * @param additionalSearchOptions Adjustments to search, such as tranche size and categories of interest
 * @param portalUrl Rest Url of the portal to perform the search
 * @return A promise that will resolve with a structure with a tranche of results and
 * describing how many items are available
 * @see https://developers.arcgis.com/rest/users-groups-and-items/group-content-search.htm
 * @see https://developers.arcgis.com/rest/users-groups-and-items/search-reference.htm
 */
export function searchGroupContents(
  groupId: string,
  searchString: string,
  authentication: UserSession,
  additionalSearchOptions?: IAdditionalSearchOptions,
  portalUrl?: string
): Promise<ISearchResult<IItem>> {
  const searchOptions: ISearchGroupContentOptions = {
    groupId,
    q: searchString,
    params: {
      ...additionalSearchOptions
    },
    authentication: authentication,
    portal: portalUrl
  };
  return searchGroupContent(searchOptions);
}

export function shareItem(
  groupId: string,
  id: string,
  destinationAuthentication: UserSession
): Promise<void> {
  return new Promise((resolve, reject) => {
    const shareOptions: IGroupSharingOptions = {
      groupId,
      id,
      authentication: destinationAuthentication
    };

    shareItemWithGroup(shareOptions).then(
      () => resolve(),
      (e: any) => reject(fail(e))
    );
  });
}

export function updateItem(
  itemInfo: IItemUpdate,
  authentication: UserSession,
  folderId?: string,
  additionalParams?: any
): Promise<IUpdateItemResponse> {
  return new Promise((resolve, reject) => {
    const updateOptions: IUpdateItemOptions = {
      item: itemInfo,
      folderId: folderId,
      authentication: authentication,
      params: {
        ...(additionalParams ?? {})
      }
    };
    portalUpdateItem(updateOptions).then(
      response => (response.success ? resolve(response) : reject(response)),
      err => reject(err)
    );
  });
}

export function updateItemExtended(
  serviceItemId: string,
  itemInfo: IItemUpdate,
  data: any,
  authentication: UserSession,
  access?: string | undefined
): Promise<void> {
  return new Promise((resolve, reject) => {
    const updateOptions: IUpdateItemOptions = {
      item: itemInfo,
      params: {
        text: data
      },
      authentication: authentication
    };
    portalUpdateItem(updateOptions).then(
      () => {
        if (access && access !== "private") {
          // Set access if it is not AGOL default
          // Set the access manually since the access value in createItem appears to be ignored
          const accessOptions: ISetAccessOptions = {
            id: serviceItemId,
            access: access === "public" ? "public" : "org", // need to use constants rather than string
            authentication: authentication
          };
          setItemAccess(accessOptions).then(
            () => resolve(),
            e => reject(fail(e))
          );
        } else {
          resolve();
        }
      },
      e => reject(fail(e))
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
  authentication: UserSession
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
  authentication: UserSession
): Promise<IUpdateItemResponse> {
  return new Promise<IUpdateItemResponse>((resolve, reject) => {
    const addItemData: (data: any) => void = (data: any) => {
      const addDataOptions: IAddItemDataOptions = {
        id: itemId,
        data: data,
        authentication: authentication
      };
      portalAddItemData(addDataOptions).then(resolve, reject);
    };

    // Item data has to be submitted as text or JSON for those file types
    if (dataFile.type.startsWith("text/plain")) {
      blobToText(dataFile).then(addItemData, reject);
    } else if (dataFile.type === "application/json") {
      blobToJson(dataFile).then(addItemData, reject);
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
  authentication: UserSession
): Promise<IUpdateItemResponse> {
  return new Promise<IUpdateItemResponse>((resolve, reject) => {
    const addMetadataOptions: IUpdateItemOptions = {
      item: {
        id: itemId
      },
      params: {
        // Pass metadata in via params because item property is serialized, which discards a blob
        metadata: metadataFile
      },
      authentication: authentication
    };

    portalUpdateItem(addMetadataOptions).then(resolve, reject);
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
  newItemTemplate: IItemTemplate,
  authentication: UserSession,
  templateDictionary: any
): Promise<any> {
  return new Promise((resolve, reject) => {
    const itemInfo: any = {};
    const serviceInfo: any = newItemTemplate.properties;
    const folderId: any = templateDictionary.folderId;
    const isPortal: boolean = templateDictionary.isPortal;
    const solutionItemId: string = templateDictionary.solutionItemId;
    const itemId: string = newItemTemplate.itemId;

    const params: IParams = {};

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

    const _item: ICreateServiceParams = {
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
    convertExtentWithFallback(
      templateDictionary.organization.defaultExtent,
      serviceInfo.defaultExtent,
      serviceInfo.service.spatialReference,
      templateDictionary.organization.helperServices.geometry.url,
      authentication
    ).then(
      extent => {
        templateDictionary[itemId].solutionExtent = extent;
        createOptions.item = replaceInTemplate(
          createOptions.item,
          templateDictionary
        );
        createOptions.params = replaceInTemplate(
          createOptions.params,
          templateDictionary
        );
        resolve(createOptions);
      },
      e => reject(fail(e))
    );
  });
}

/**
 * Add relationships to all layers in one call to retain fully functioning composite relationships
 *
 * @param args The IPostProcessArgs for the request(s)
 * @return Any relationships that should be updated for the service
 * @protected
 */
export function _getRelationshipUpdates(args: IPostProcessArgs): any {
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
    deleteProp(obj, "relationships");
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
 * @return IUpdate that has the request url and arguments
 * @protected
 */
export function _getUpdate(
  url: string,
  id: any,
  obj: any,
  args: any,
  type: "delete" | "update" | "add" | "refresh"
): IUpdate {
  const ops: any = {
    delete: {
      url: checkUrlPathTermination(url) + id + "/deleteFromDefinition",
      params: {
        deleteFromDefinition: {
          fields:
            obj && obj.hasOwnProperty("deleteFields") ? obj.deleteFields : []
        }
      }
    },
    update: {
      url: checkUrlPathTermination(url) + id + "/updateDefinition",
      params: {
        updateDefinition: obj
      }
    },
    add: {
      url: checkUrlPathTermination(url) + "addToDefinition",
      params: {
        addToDefinition: obj
      }
    },
    refresh: {
      url: checkUrlPathTermination(url) + "refresh",
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
  params: IParams,
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
    getProp(serviceInfo, "service.capabilities") || (isPortal ? "" : []);

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
    getProp(item, "editorTrackingInfo.enableEditorTracking")
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
  authentication: UserSession,
  numAttempts = 1
): Promise<string> {
  // Introduce a lag because AGO update appears to choke with rapid subsequent calls
  const msLag = 1000;

  return new Promise((resolve, reject) => {
    // Update the item's URL
    const options = { item: { id, url }, authentication: authentication };

    portalUpdateItem(options).then(
      result => {
        if (!result.success) {
          reject(fail(result));
        } else {
          // Get the item to see if the URL really changed; we'll delay a bit before testing because AGO
          // has a timing problem with URL updates
          setTimeout(() => {
            getItem(id, { authentication: authentication }).then(
              item => {
                const iBrace = item.url.indexOf("{");
                if (iBrace > -1) {
                  console.warn(
                    id + " has template variable: " + item.url.substr(iBrace)
                  );
                }

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
                  if (--numAttempts > 0) {
                    _updateItemURL(id, url, authentication, numAttempts).then(
                      resolve,
                      reject
                    );
                  } else {
                    console.error(id + ": " + errorMsg + "; FAILED");
                    reject(errorMsg);
                  }
                }
              },
              e => reject(fail(e))
            );
          }, msLag);
        }
      },
      e => reject(fail(e))
    );
  });
}
