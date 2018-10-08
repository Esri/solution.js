/* Copyright (c) 2018 Esri
 * Apache-2.0 */

import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
import { Item } from "./item";

/**
 *  AGOL web map application item
 */
export class WebMappingApp extends Item {

  init (requestOptions?: IRequestOptions): Promise<AgolItem> {
    return new Promise((resolve) => {
      // Fetch item data section
      super.init(requestOptions)
      .then(
        () => {
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