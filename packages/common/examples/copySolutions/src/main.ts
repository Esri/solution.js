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
// @esri/solution-common copySolutions example

import * as common from "@esri/solution-common";

/**
 * Copies an item.
 *
 * @param itemId Id of item in source
 * @param sourceAuthentication Authentication for source
 * @param destinationAuthentication Authentication for destination; can be same as source for copying
 * within source organization
 */
export function copyItemInfo(
  itemId: string,
  sourceAuthentication: common.UserSession,
  destinationAuthentication: common.UserSession
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!itemId) {
      reject("Item's ID is not defined");
      return;
    }

    // Get the item information
    const itemBaseDef = common.getItemBase(itemId, sourceAuthentication);
    const itemDataDef = new Promise<File>((resolve2, reject2) => {
      // tslint:disable-next-line: no-floating-promises
      itemBaseDef.then(
        // any error fetching item base will be handled via Promise.all later
        (itemBase: any) => {
          common
            .getItemDataAsFile(itemId, itemBase.name, sourceAuthentication)
            .then(resolve2, (error: any) => reject2(JSON.stringify(error)));
        }
      );
    });
    const itemMetadataDef = common.getItemMetadataAsFile(
      itemId,
      sourceAuthentication
    );
    const itemResourcesDef = common.getItemResourcesFiles(
      itemId,
      sourceAuthentication
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
          sourceAuthentication
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
        common
          .createFullItem(
            getCopyableItemBaseProperties(itemBase),
            undefined, // folder id
            destinationAuthentication,
            itemThumbnailUrl,
            itemDataFile,
            itemMetadataFile,
            itemResourceFiles,
            itemBase.access
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
    accessInformation: sourceItem.accessInformation,
    categories: sourceItem.categories,
    culture: sourceItem.culture,
    description: sourceItem.description,
    documentation: sourceItem.documentation,
    extent: sourceItem.extent,
    licenseInfo: sourceItem.licenseInfo,
    name: sourceItem.name,
    properties: sourceItem.properties,
    snippet: sourceItem.snippet,
    spatialReference: sourceItem.spatialReference,
    tags: sourceItem.tags,
    title: sourceItem.title,
    type: sourceItem.type,
    typeKeywords: sourceItem.typeKeywords
  };
  return copyableItem;
}

/**
 * Creates a UserSession.
 *
 * @param username
 * @param password
 * @param portalUrl Base url for the portal you want to make the request to; defaults
 *        to 'https://www.arcgis.com/sharing/rest'
 * @return solutionCommon.UserSession object
 * @see @esri/arcgis-rest-auth
 * @see @esri/arcgis-rest-request
 */
export function getRequestAuthentication(
  username: string,
  password: string,
  portalUrl: string
): common.UserSession {
  const userSessionOptions = {
    username: username || undefined,
    password: password || undefined,
    portal: portalUrl || "https://www.arcgis.com/sharing/rest"
  };

  return new common.UserSession(userSessionOptions);
}

/**
 * Gets items with "Solution,Template" type keywords.
 *
 * @param authentication Authentication for server to query
 */
export function getTemplates(
  authentication: common.UserSession
): Promise<common.ISearchResult<common.IItem>> {
  return new Promise((resolve, reject) => {
    common.getPortal(null, authentication).then(
      portalResponse => {
        if (!portalResponse.user) {
          reject("Unable to log in");
          return;
        }

        let availSolnsQuery =
          "type:Solution typekeywords:Solution,Template owner:" +
          portalResponse.user.username;
        if (portalResponse.user.orgId) {
          availSolnsQuery += " orgid:" + portalResponse.user.orgId;
        }
        const pagingParam = { start: 1, num: 100 };
        const requestOptions = {
          authentication: authentication
        };
        const searchOptions = {
          q: availSolnsQuery,
          ...requestOptions,
          ...pagingParam
        };
        common.searchItems(searchOptions).then(
          searchResponse => resolve(searchResponse),
          error => reject(error)
        );
      },
      error => reject(error)
    );
  });
}
