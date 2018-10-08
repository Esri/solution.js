/* Copyright (c) 2018 Esri
 * Apache-2.0 */

import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
import { Item } from "./item";

/**
 *  AGOL web map application item
 */
export class Dashboard extends Item {

  /**
   * Performs item-specific initialization.
   * 
   * @param requestOptions Options for initialization request for item's data section
   * @returns A promise that will resolve with the item
   */
  init (requestOptions?: IRequestOptions): Promise<AgolItem> {
    return new Promise((resolve) => {
      // Fetch item data section
      super.init(requestOptions)
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