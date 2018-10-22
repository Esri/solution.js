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

import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { AgolItem, IOrgSession, ISwizzleHash } from "./agolItem";
import { ItemWithData } from "./itemWithData";
import * as items from "@esri/arcgis-rest-items";

//--------------------------------------------------------------------------------------------------------------------//

/**
 *  AGOL web map application item
 */
export class WebMappingApp  extends ItemWithData {

  /**
   * Completes the creation of the item.
   *
   * @param requestOptions Options for initialization request for item's data section
   * @returns A promise that will resolve with the item
   */
  complete (
    requestOptions?: IUserRequestOptions
  ): Promise<AgolItem> {
    return new Promise((resolve) => {
      // Fetch item data section
      super.complete(requestOptions)
      .then(
        () => {
          this.estimatedCost += 1;  // cost to update URL after item is created

          // Simplify app URL for cloning: remove org base URL and app id
          // Need to add fake server because otherwise AGOL makes URL null
          let orgUrl = this.itemSection.url.replace(this.itemSection.id, "");
          let iSep = orgUrl.indexOf("//");
          this.itemSection.url = "https://arcgis.com" + orgUrl.substr(orgUrl.indexOf("/", iSep + 2));

          // Extract the dependencies
          if (this.dataSection && this.dataSection.values) {
            let values = this.dataSection.values;
            if (values.webmap) {
              this.dependencies.push(values.webmap);
            }
            if (values.group) {
              this.dependencies.push(values.group);
            }
          }

          resolve(this);
        }
      );
    });
  }

  swizzleContainedItems (
    swizzles: ISwizzleHash
  ): void {
    // Swizzle its webmap or group
    let values = this.dataSection && this.dataSection.values;
    if (values) {
      if (values.webmap) {
        values.webmap = swizzles[values.webmap].id;
      } else if (values.group) {
        values.group = swizzles[values.group].id;
      }
    }
  }

  concludeCreation (
    swizzles: ISwizzleHash,
    orgSession: IOrgSession
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Update its URL
      var options = {
        item: {
          'id': this.itemSection.id,
          'url': orgSession.orgUrl + this.itemSection.url + this.itemSection.id
        },
        authentication: orgSession.authentication
      };
      items.updateItem(options)
      .then(
        updateResp => {
          //progressIncrement();
          resolve(this.itemSection.id);
        },
        error => {
          reject('Unable to update webmap');
        }
      );
    });
  }

}