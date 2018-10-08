/* Copyright (c) 2018 Esri
 * Apache-2.0 */

import * as items from "@esri/arcgis-rest-items";
import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";

export class Item extends AgolItem {
  /**
   * Item data section JSON
   */
  dataSection?: any;

  init (requestOptions?: IRequestOptions): Promise<AgolItem> {
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