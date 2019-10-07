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
// @esri/solution-common getItemInfo TypeScript example

import * as auth from "@esri/arcgis-rest-auth";
import * as portal from "@esri/arcgis-rest-portal";
// import * as solutionCommon from "@esri/solution-common";
import * as solutionCommon from "../src/common.umd.min";

export function copyItemInfo(
  itemId: string,
  authentication: auth.UserSession
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!itemId) {
      reject("Item's ID is not defined");
      return;
    }

    // Get the item information
    const itemBaseDef = solutionCommon.getItemBase(itemId, authentication);
    const itemDataDef = new Promise<File>((resolve2, reject2) => {
      // tslint:disable-next-line: no-floating-promises
      itemBaseDef.then(
        // any error fetching item base will be handled via Promise.all later
        (itemBase: any) => {
          solutionCommon
            .getItemDataAsFile(itemId, itemBase.name, authentication)
            .then(resolve2, (error: any) => reject2(error));
        }
      );
    });
    const itemMetadataDef = solutionCommon.getItemMetadataAsFile(
      itemId,
      authentication
    );
    const itemResourcesDef = solutionCommon.getItemResourcesFiles(
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
        const itemThumbnailUrl = solutionCommon.getItemThumbnailUrl(
          itemId,
          itemBase.thumbnail,
          false,
          authentication
        );

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
        solutionCommon
          .createItemWithData2(
            getCopyableItemBaseProperties(itemBase),
            undefined, // folder id
            authentication,
            itemThumbnailUrl,
            itemDataFile,
            itemMetadataFile,
            itemResourceFiles,
            "public"
          )
          .then(
            (createResponse: portal.ICreateItemResponse) => {
              resolve(JSON.stringify(createResponse));
            },
            (error: any) => reject(JSON.stringify(error))
          );
      },
      (error: any) => reject(JSON.stringify(error))
    );
  });
}

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
