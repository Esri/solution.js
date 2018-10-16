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
import * as items from "@esri/arcgis-rest-items";
import { IRequestOptions, ArcGISRequestError } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
import { Dashboard } from "./dashboard";
import { FeatureService } from "./featureService";
import { Item } from "./item";
import { Group } from "./group";
import { Webmap } from "./webmap";
import { WebMappingApp } from "./webMappingApp";

export interface IItemHash {
  [id:string]: AgolItem | Promise<AgolItem>;
}

export class ItemFactory {
  /**
   * Instantiates an item subclass using an AGOL id to load the item and get its type.
   *
   * ```typescript
   * import { ItemFactory } from "../src/itemFactory";
   * import { AgolItem } from "../src/agolItem";
   * import { Item } from "../src/item";
   *
   * ItemFactory.itemToJSON("6fc5992522d34f26b2210d17835eea21")
   * .then(
   *   (response:AgolItem) => {
   *     console.log(response.type);  // => "Web Mapping Application"
   *     console.log(response.itemSection.title);  // => "ROW Permit Public Comment"
   *     console.log((response as Item).dataSection.source);  // => "bb3fcf7c3d804271bfd7ac6f48290fcf"
   *   },
   *   error => {
   *     // (should not see this as long as above id--a real one--stays available)
   *     console.log(error); // => "Item or group does not exist or is inaccessible."
   *   }
   * );
   * ```
   *
   * @param id AGOL id string
   * @param requestOptions Options for the request
   * @returns A promise that will resolve with a subclass of AgolItem
   */
  static itemToJSON (
    id: string,
    requestOptions?: IRequestOptions
  ): Promise<AgolItem> {
    return new Promise((resolve, reject) => {
      try {
        // Fetch item base section
        items.getItem(this.baseId(id), requestOptions)
        .then(
          itemSection => {
            let newItem:Item;
            switch(itemSection.type) {
              case "Dashboard":
                newItem = new Dashboard(itemSection);
                break;
              case "Feature Service":
                newItem = new FeatureService(itemSection);
                break;
              case "Web Map":
                newItem = new Webmap(itemSection);
                break;
              case "Web Mapping Application":
                newItem = new WebMappingApp(itemSection);
                break;
              default:
                newItem = new Item(itemSection);
                break;
            }
            newItem.init(requestOptions)
            .then(resolve);
          },
          () => {
            // If it fails, try URL for group base section
            groups.getGroup(id, requestOptions)
            .then(
              itemSection => {
                let newGroup:Item = new Group(itemSection);
                newGroup.init(requestOptions)
                .then(resolve);
              },
              () => {
                let error = new ArcGISRequestError(
                  "Item or group does not exist or is inaccessible."
                );
                reject(error);
              }
            );
          }
        );
      } catch (notUsed) {
        let error = new ArcGISRequestError(
          "Item or group does not exist or is inaccessible."
        );
        reject(error);
      }
    });
  }

  /**
   * Instantiates an item subclass and its dependencies using an AGOL id to load the item and get its type.
   *
   * ```typescript
   * import { ItemFactory, IItemHash } from "../src/itemFactory";
   * import { AgolItem } from "../src/agolItem";
   * import { Item } from "../src/item";
   *
   * ItemFactory.itemToJSON(["6fc5992522d34f26b2210d17835eea21", "9bccd0fac5f3422c948e15c101c26934"])
   * .then(
   *   (response:IItemHash) => {
   *     let keys = Object.keys(response);
   *     console.log(keys.length);  // => "6"
   *     console.log((response[keys[0]] as AgolItem).type);  // => "Web Mapping Application"
   *     console.log((response[keys[0]] as AgolItem).itemSection.title);  // => "ROW Permit Public Comment"
   *     console.log((response[keys[0]] as Item).dataSection.source);  // => "bb3fcf7c3d804271bfd7ac6f48290fcf"
   *   },
   *   error => {
   *     // (should not see this as long as both of the above ids--real ones--stay available)
   *     console.log(error); // => "Item or group does not exist or is inaccessible."
   *   }
   * );
   * ```
   *
   * @param rootIds AGOL id string or list of AGOL id strings
   * @param requestOptions Options for the request
   * @param collection A hash of items already converted useful for avoiding duplicate conversions and
   * hierarchy tracing
   * @returns A promise that will resolve with a hash by id of subclasses of AgolItem;
   * if either id is inaccessible, a single error response will be produced for the set
   * of ids
   */
  static itemHierarchyToJSON (
    rootIds: string | string[],
    requestOptions?: IRequestOptions,
    collection?: IItemHash
  ): Promise<IItemHash> {
    if (!collection) {
      collection = {};
    }
    return new Promise((resolve, reject) => {
      if (typeof rootIds === "string") {
        // Handle a single AGOL id
        let rootId = rootIds;
        if (collection[this.baseId(rootId)]) {
          resolve(collection);  // Item and its dependents are already in list or are queued

        } else {
          // Add the id as a placeholder to show that it will be fetched
          let itemFetchDfd = this.itemToJSON(rootId, requestOptions);
          collection[this.baseId(rootId)] = itemFetchDfd;

          // Get the specified item
          itemFetchDfd
          .then(
            item => {
              // Set the value keyed by the id
              collection[this.baseId(rootId)] = item;

              if (item.dependencies.length === 0) {
                resolve(collection);

              } else {
                // Get its dependents, asking each to get its dependents via
                // recursive calls to this function
                let dependentDfds:Promise<IItemHash>[] = [];
                item.dependencies.forEach(dependentId => {
                  if (!collection[this.baseId(dependentId)]) {
                    dependentDfds.push(this.itemHierarchyToJSON(dependentId, requestOptions, collection));
                  }
                });
                Promise.all(dependentDfds)
                .then(() => {
                  resolve(collection);
                });
              }
            },
            () => {
              let error = new ArcGISRequestError(
                "Item or group does not exist or is inaccessible."
              );
              reject(error);
            }
          );
        }

      } else {
        // Handle a list of one or more AGOL ids by stepping through the list
        // and calling this function recursively
        let hierarchyDfds:Promise<IItemHash>[] = [];
        rootIds.forEach(rootId => {
          hierarchyDfds.push(this.itemHierarchyToJSON(rootId, requestOptions, collection));
        });
        Promise.all(hierarchyDfds)
        .then(
          () => {
            resolve(collection);
          },
          () => {
              // A failure to get an id causes an error response from this function regardless of how
              // many valid ids were also supplied
              let error = new ArcGISRequestError(
              "Item or group does not exist or is inaccessible."
            );
            reject(error);
          }
      );
      }
    });
  }

  /**
   * Extracts the AGOL id from the front of a string.
   *
   * @param extendedId A string of hex characters that begins with an AGOL id;
   *   characters including and after "_" are considered a modifier
   * @returns An AGOL id
   */
  private static baseId (
    extendedId: string
  ): string {
    let iModifierFlag = extendedId.indexOf("_");
    if (iModifierFlag < 0) {
      return extendedId;
    } else {
      return extendedId.substr(0, iModifierFlag);
    }
  }

}