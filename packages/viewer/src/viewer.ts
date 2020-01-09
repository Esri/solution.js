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
 * Provides the access to the solution's contents.
 *
 * @module viewer
 */

import * as common from "@esri/solution-common";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Compares two AGO items, fetching them if only their id is supplied.
 *
 * @param item1 First item or its AGO id
 * @param item2 Second item or its AGO id
 * @param authentication Credentials for the request to AGO
 * @return True if objects are the same
 * @see Only comparable properties are compared; see deleteItemProps() in the `common` package
 */
export function compareItems(
  item1: string | any,
  item2: string | any,
  authentication: common.UserSession
): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    // If an input is a string, fetch the item; otherwise, clone the input because we will modify the
    // item base to remove incomparable properties
    let itemBaseDef1: Promise<boolean>;
    if (typeof item1 === "string") {
      itemBaseDef1 = common.getItemBase(item1, authentication);
    } else {
      itemBaseDef1 = Promise.resolve(common.cloneObject(item1));
    }

    let itemBaseDef2: Promise<boolean>;
    if (typeof item2 === "string") {
      itemBaseDef2 = common.getItemBase(item2, authentication);
    } else {
      itemBaseDef2 = Promise.resolve(common.cloneObject(item2));
    }

    Promise.all([itemBaseDef1, itemBaseDef2]).then(
      responses => {
        const [itemBase1, itemBase2] = responses;
        resolve(
          _compareJSON(
            common.deleteItemProps(itemBase1),
            common.deleteItemProps(itemBase2)
          )
        );
      },
      e => reject(e)
    );
  });
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Compares two JSON objects using JSON.stringify.
 *
 * @param json1 First object
 * @param json2 Second object
 * @return True if objects are the same
 */
export function _compareJSON(json1: any, json2: any): boolean {
  return JSON.stringify(json1) === JSON.stringify(json2);
}
