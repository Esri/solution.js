/* Copyright (c) 2018 Esri
 * Apache-2.0 */

import * as items from "@esri/arcgis-rest-items";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { IItemUpdateResponse } from "@esri/arcgis-rest-items";
import * as sharing from "@esri/arcgis-rest-sharing";
import { ISetAccessRequestOptions } from "@esri/arcgis-rest-sharing";
import { IItemHash } from "./itemFactory";

export class SolutionItem {

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

}
