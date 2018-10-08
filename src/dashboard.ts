/* Copyright (c) 2018 Esri
 * Apache-2.0 */

import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
import { Item } from "./item";

/**
 *  AGOL web map application item
 */
export class Dashboard extends Item {

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