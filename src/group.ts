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

import * as groups from "@esri/arcgis-rest-groups";
import * as sharing from "@esri/arcgis-rest-sharing";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { IPagingParamsRequestOptions } from "@esri/arcgis-rest-groups";
import { AgolItemPrototype, AgolItem, ISwizzleHash } from "./agolItem";

//--------------------------------------------------------------------------------------------------------------------//

export class Group extends AgolItem {
  /**
   * Performs common item initialization.
   *
   * @param itemSection The item's JSON
   */
  constructor (prototype:AgolItemPrototype) {
    super(prototype);
    this.type = "Group";
  }

  /**
   * Completes the creation of the item.
   *
   * @param requestOptions Options for initialization request for group contents
   * @returns A promise that will resolve with the item
   */
  complete (
    requestOptions?: IUserRequestOptions
  ): Promise<AgolItem> {
    return new Promise((resolve, reject) => {
      let pagingRequest:IPagingParamsRequestOptions = {
        paging: {
          start: 0,
          num: 100
        },
        ...requestOptions
      };
      // Fetch group items
      this.getGroupContentsTranche (this.itemSection.id, pagingRequest)
      .then(
        contents => {
          this.dependencies = contents;
          this.estimatedCost += this.dependencies.length;
          resolve(this);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  /**
   * Clones the item into the destination organization and folder
   *
   * @param notUsed (not used by subclass)
   * @param requestOptions Options for creation request(s)
   * @returns A promise that will resolve with the item's id
   */
  clone (
    notUsed: string,
    swizzles: ISwizzleHash,
    requestOptions?: IUserRequestOptions
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log("Clone " + (this.itemSection.name || this.itemSection.title) + " (" + this.type + ")");//???

      let options = {
        group: this.itemSection,
        ...requestOptions
      }
      options.group.title += '_' + this.cloningUniquenessTimestamp();

      // Create the item
      groups.createGroup(options)
      .then(
        createResp => {
          swizzles[this.itemSection.id].id = createResp.group.id;
          this.itemSection.id = createResp.group.id;

          if (this.dependencies.length > 0) {
            // Add each of the group's items to it
            var awaitGroupAdds:Promise<null>[] = [];
            this.dependencies.forEach(depId => {
              awaitGroupAdds.push(new Promise(resolve => {
                var swizzledDepId = swizzles[depId].id;
                sharing.shareItemWithGroup({
                  id: swizzledDepId,
                  groupId: createResp.group.id,
                  ...requestOptions
                })
                .then(
                  () => {
                    //progressIncrement();
                    resolve();
                  },
                  error => {
                    console.log("Unable to share group's items with it: " + JSON.stringify(error));
                  }
                );
              }));
            });
            // After all items have been added to the group
            Promise.all(awaitGroupAdds)
            .then(
              () => {
                resolve(createResp.group.id);
              }
            );
          } else {
            // No items in this group
            resolve(createResp.group.id);
          }
        },
        error => {
          reject('Unable to create ' + this.type + ': ' + JSON.stringify(error));
        }
      )
    });
  }

  //------------------------------------------------------------------------------------------------------------------//

  /**
   * Gets the ids of a group's contents.
   *
   * @param id Group id
   * @param pagingRequest Options for requesting group contents
   * @returns A promise that will resolve with a list of the ids of the group's contents
   */
  private getGroupContentsTranche (
    id:string,
    pagingRequest:IPagingParamsRequestOptions
  ):Promise<string[]> {
    return new Promise((resolve, reject) => {
      // Fetch group items
      groups.getGroupContent(id, pagingRequest)
      .then(
        contents => {
          // Extract the list of content ids from the JSON returned
          let trancheIds:string[] = contents.items.map((item:any) => item.id);
          //console.log(JSON.stringify(trancheIds));

          // Are there more contents to fetch?
          if (contents.nextStart > 0) {
            pagingRequest.paging.start = contents.nextStart;
            this.getGroupContentsTranche (id, pagingRequest)
            .then(
              function (allSubsequentTrancheIds:string[]) {
                // Append all of the following tranches to this tranche and return it
                Array.prototype.push.apply(trancheIds, allSubsequentTrancheIds);
                resolve(trancheIds);
              },
              () => {
                resolve(trancheIds);
              }
            );
          } else {
            resolve(trancheIds);
          }
        },
        error => {
          reject(error);
        }
      );
    });
  }

}