/*
 | Copyright 2018 Esri
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

import * as items from "@esri/arcgis-rest-items";
import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItemPrototype, AgolItem } from "./agolItem";

export class Item extends AgolItem {

  /**
   * Completes the creation of the item.
   *
   * @param requestOptions Options for initialization request for item's data section
   * @returns A promise that will resolve with the item
   */
  complete (
    requestOptions?: IRequestOptions
  ): Promise<AgolItem> {
    return new Promise((resolve) => {
      // Fetch item data section
      items.getItemData(this.itemSection.id, requestOptions)
      .then(
        dataSection => {
          this.dataSection = dataSection;
          resolve(this);
        },
        () => {
          // Items without a data section return an error from the REST library
          resolve(this);
        }
      );
    });
  }

}