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

import { IRequestOptions, request } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
import { Item } from "./item";

/**
 *  AGOL webmap item
 */
export class Webmap extends Item {

  /**
   * Completes the creation of the item.
   *
   * @param requestOptions Options for initialization request for item's data section
   * @returns A promise that will resolve with the item
   */
  complete (
    requestOptions?: IRequestOptions
  ): Promise<AgolItem> {
    return new Promise((resolve) => {
      // Fetch item data section
      super.complete(requestOptions)
      .then(
        () => {
          // Extract the dependencies
          let dependencyIdsDfd:Promise<string[]>[] = [];
          if (this.dataSection) {
            if (this.dataSection.operationalLayers) {
              dependencyIdsDfd.push(this.getDependencyLayerIds(this.dataSection.operationalLayers, requestOptions));
            }
            if (this.dataSection.tables) {
              dependencyIdsDfd.push(this.getDependencyLayerIds(this.dataSection.tables, requestOptions));
            }
          }

          Promise.all(dependencyIdsDfd)
          .then(results => {
            results.forEach(subarray => {
              this.dependencies = this.dependencies.concat(subarray);
            });
            resolve(this);
          });
        }
      );
    });
  }

  /**
   * Updates the item's list of dependencies.
   *
   * @param layerList List of operational layers or tables to examine
   * @param requestOptions Options for the request
   * @returns A promise that will resolve with the ids of the layers in the layer list
   */
  private getDependencyLayerIds (
    layerList:any,
    requestOptions?: IRequestOptions
  ): Promise<string[]> {
    return new Promise(resolve => {
      // Request the AGOL item id(s)
      let dependencyIdsDfd:Promise<string>[] = [];
      layerList.forEach((layer:any) => {
        let urlStr = layer.url as string;
        let layerDfd:Promise<string> = new Promise(resolve => {
          this.getLayerItemId(layer, requestOptions)
          .then(
            itemId => {
              // Get the feature layer index number
              let id:string = urlStr.substr(urlStr.lastIndexOf("/") + 1);

              // Append the index number to the end of the AGOL item id to uniquely identify the feature layer
              // and save as a dependency
              itemId += "_" + id;

              // Remove the URL parameter from the layer definition and update/add its item id
              delete layer.url;
              layer.itemId = itemId;

              // Return the updated itemId
              resolve(itemId);
            }
          );
        });
        dependencyIdsDfd.push(layerDfd);
      });

      // Assemble the results
      Promise.all(dependencyIdsDfd)
      .then(resolve);
    });
  }

  /**
   * Gets the AGOL id of a layer either from the layer or via a query to its service.
   *
   * @param layer Layer whose id is sought
   * @param requestOptions Options for the request
   * @returns A promise that will resolve with the item id string
   */
  private getLayerItemId (
    layer:any,
    requestOptions?: IRequestOptions
  ): Promise<string> {
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