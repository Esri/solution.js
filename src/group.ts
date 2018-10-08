/* Copyright (c) 2018 Esri
 * Apache-2.0 */

import * as groups from "@esri/arcgis-rest-groups";
import { IRequestOptions } from "@esri/arcgis-rest-request";
import { IPagingParamsRequestOptions } from "@esri/arcgis-rest-groups";
import { AgolItem } from "./agolItem";

export class Group extends AgolItem {
  /**
   * AGOL item type name
   */
  type: string = "Group";

  /**
   * Performs item-specific initialization.
   * 
   * @param requestOptions Options for initialization request for group contents
   * @returns A promise that will resolve with the item
   */
  init (requestOptions?: IRequestOptions): Promise<AgolItem> {
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
          resolve(this);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  /**
   * Gets the ids of a group's contents.
   * 
   * @param id Group id
   * @param pagingRequest Options for requesting group contents
   * @returns A promise that will resolve with a list of the ids of the group's contents
   */
  private getGroupContentsTranche (id:string, pagingRequest:IPagingParamsRequestOptions):Promise<string[]> {
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