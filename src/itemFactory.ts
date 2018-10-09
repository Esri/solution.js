/* Copyright (c) 2018 Esri
 * Apache-2.0 */

import * as groups from "@esri/arcgis-rest-groups";
import * as items from "@esri/arcgis-rest-items";
import * as sharing from "@esri/arcgis-rest-sharing";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { IItemUpdateResponse } from "@esri/arcgis-rest-items";
import { IRequestOptions, ArcGISRequestError } from "@esri/arcgis-rest-request";
import { ISetAccessRequestOptions } from "@esri/arcgis-rest-sharing";
import { AgolItem } from "./agolItem";
import { Dashboard } from "./dashboard";
import { FeatureService } from "./FeatureService";
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
   * @param collection A hash of items already converted useful for avoiding duplicate conversions and 
   * hierarchy tracing
   * @param requestOptions Options for the request
   * @returns A promise that will resolve with a hash by id of subclasses of AgolItem;
   * if either id is inaccessible, a single error response will be produced for the set
   * of ids
   */
  static itemHierarchyToJSON (
    rootIds: string | string[],
    collection?: IItemHash,
    requestOptions?: IRequestOptions
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
                    dependentDfds.push(this.itemHierarchyToJSON(dependentId, collection, requestOptions));
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
          hierarchyDfds.push(this.itemHierarchyToJSON(rootId, collection, requestOptions));
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
   * Creates a Solution item containing JSON descriptions of items forming the solution.
   *
   * @param title Title for Solution item to create
   * @param collection List of JSON descriptions of items to publish into Solution
   * @param access Access to set for item: 'public', 'org', 'private'
   * @param requestOptions Options for the request
   * @returns A promise that will resolve with an object reporting success and the Solution id
   */
  static publishItemJSON (
    title: string,
    collection: IItemHash,
    access: string,
    requestOptions?: IUserRequestOptions
  ): Promise<IItemUpdateResponse> {
    return new Promise((resolve) => {
      // Define the solution item
      let itemSection = {
        title: title,
        type: 'Solution',
        itemType: 'text',
        access: access,
        listed: false,
        commentsEnabled: false
      };
      let dataSection = {
        items: collection
      };

      // Create it and add its data section
      let options = {
        title: title,
        item: itemSection,
        ...requestOptions
      };
      items.createItem(options)
      .then(function (results) {
        if (results.success) {
          let options = {
            id: results.id,
            data: dataSection,
            ...requestOptions
          };
          items.addItemJsonData(options)
          .then(function (results) {
            // Set the access manually since the access value in createItem appears to be ignored
            let options = {
              id: results.id,
              access: access,
              ...requestOptions as ISetAccessRequestOptions
            };
            sharing.setItemAccess(options)
            .then(function (results) {
              resolve({
                success: true,
                id: results.itemId
              })
            });
          });
        }
      });
    });
  }

  /**
   * Extracts the 32-character AGOL id from the front of a string.
   *
   * @param extendedId A string of 32 or more characters that begins with an AGOL id
   * @returns A 32-character string
   */
  private static baseId (
    extendedId: string
  ): string {
    // AGOL ids are 32 characters long; additional chars after that hold modifiers
    return extendedId.substr(0,32);
  }

}