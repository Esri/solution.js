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

import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
import { Item } from "./item";

/**
 *  AGOL web map application item
 */
export class Dashboard extends Item {

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
      super.complete(requestOptions)
      .then(
        () => {
          // Extract the dependencies
          if (this.dataSection && this.dataSection.widgets) {
            let widgets = this.dataSection.widgets;
            widgets.forEach((widget:any) => {
              if (widget.type === "mapWidget") {
                this.dependencies.push(widget.itemId);
              }
            })
          }

          resolve(this);
        }
      );
    });
  }

}