/* Copyright (c) 2018 Esri
 * Apache-2.0 */

import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
import { Item } from "./item";

/**
 *  AGOL web map application item
 */
export class WebMappingApp extends Item {

  /**
   * Performs item-specific initialization.
   *
   * @param requestOptions Options for initialization request for item's data section
   * @returns A promise that will resolve with the item
   */
  init (
    requestOptions?: IRequestOptions
  ): Promise<AgolItem> {
    return new Promise((resolve) => {
      // Fetch item data section
      super.init(requestOptions)
      .then(
        () => {
          this.estimatedCost += 1;  // cost to update URL after item is created

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

}