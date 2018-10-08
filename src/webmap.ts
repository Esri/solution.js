/* Copyright (c) 2018 Esri
 * Apache-2.0 */

import { IRequestOptions, request } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
import { Item } from "./item";

/**
 *  AGOL webmap item
 */
export class Webmap extends Item {

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
          if (this.dataSection) {
            if (this.dataSection.operationalLayers) {
              this.getDependencyLayerIds(this.dataSection.operationalLayers);
            }
            if (this.dataSection.tables) {
              this.getDependencyLayerIds(this.dataSection.tables);
            }
          }

          resolve(this);
        }
      );
    });
  }

  /**
   * Updates the item's list of dependencies.
   * 
   * @param layerList List of operational layers or tables to examine
   */
  private getDependencyLayerIds (layerList:any, requestOptions?: IRequestOptions): void {
    layerList.forEach((layer:any) => {
      let urlStr = layer.url as string;
      // Get the AGOL item id
      this.getLayerItemId(layer, requestOptions)
      .then(
        itemId => {
          // Get the feature layer index number
          let id:string = urlStr.substr(urlStr.lastIndexOf("/") + 1);

          // Append the index number to the end of the AGOL item id to uniquely identify the feature layer
          // and save as a dependency
          itemId += "_" + id;
          this.dependencies.push(itemId);

          // Remove the URL parameter from the layer definition and update/add its item id
          delete layer.url;
          layer.itemId = itemId;
        }
      );
    });
  }

  private getLayerItemId (layer:any, requestOptions?: IRequestOptions): Promise<string> {
    return new Promise(resolve => {
      let urlStr = layer.url as string;
      let itemId = layer.itemId as string;
      if (!itemId) {  // no itemId if the feature layer is specified only via a URL, e.g.; need to fetch it
        let serviceUrl = urlStr.substr(0, urlStr.lastIndexOf("/")) + "?f=json";
        request(serviceUrl, requestOptions)
        .then(
          serviceData => {
            resolve(serviceData.serviceItemId);
          }
        );
      } else {
        resolve(itemId);
      }
    })
  }

}