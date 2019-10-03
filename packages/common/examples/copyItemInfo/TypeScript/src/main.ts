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
// import * as solutionCommon from "@esri/solution-common";
import * as solutionCommon from "../src/common.umd.min";

export function copyItemInfo(
  itemId: string,
  authorization: auth.UserSession
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!itemId) {
      reject("Item's ID is not defined");
      return;
    }

    // Get the item information
    const itemBaseDef = solutionCommon.getItemBase(itemId, authorization);
    const itemDataDef = new Promise<Blob>((resolve2, reject2) => {
      // tslint:disable-next-line: no-floating-promises
      itemBaseDef.then(
        // any error fetching item base will be handled via Promise.all later
        (itemBase: any) => {
          solutionCommon
            .getItemDataAsFile(itemId, itemBase.name, authorization)
            .then(resolve2, (error: any) => reject2(error));
        }
      );
    });
    const itemThumbnailDef = new Promise<Blob>((resolve3, reject3) => {
      // tslint:disable-next-line: no-floating-promises
      itemBaseDef.then(
        // any error fetching item base will be handled via Promise.all later
        (itemBase: any) => {
          solutionCommon
            .getItemThumbnail(itemId, itemBase.thumbnail, false, authorization)
            .then(resolve3, (error: any) => reject3(error));
        }
      );
    });
    const itemMetadataDef = solutionCommon.getItemMetadataBlob(
      itemId,
      authorization
    );
    const itemResourcesDef = solutionCommon.getItemResourcesFiles(
      itemId,
      authorization
    );

    Promise.all([
      itemBaseDef,
      itemDataDef,
      itemThumbnailDef,
      itemMetadataDef,
      itemResourcesDef
    ]).then(
      responses => {
        const [
          itemBase,
          itemDataFile,
          itemThumbnail,
          itemMetadataBlob,
          itemResourceFiles
        ] = responses;
        // (itemBase: any)  text/plain JSON
        // (itemDataDef: File)  */*
        // (itemThumbnail: Blob)  image/*
        // (itemMetadataDef: Blob)  application/xml
        // (itemResourcesDef: Blob[])  list of */*
        console.log("itemBase", itemBase);
        console.log("itemData", itemDataFile);
        console.log("itemThumbnail", itemThumbnail);
        console.log("itemMetadata", itemMetadataBlob);
        console.log("itemResources", itemResourceFiles);

        resolve("OK ");
      },
      (error: any) => reject(error)
    );
  });
}
