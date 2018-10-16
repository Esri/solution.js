/* Copyright (c) 2018 Esri
 * Apache-2.0 */

import { IRequestOptions, request } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
import { Item } from "./item";

/**
 *  AGOL hosted feature service item
 */
export class FeatureService extends Item {
  /**
   * Service description
   */
  serviceSection: any =  {};
  /**
   * Description for each layer
   */
  layers: any[] = [];
  /**
   * Description for each table
   */
  tables: any[] = [];

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
          // To have enough information for reconstructing the service, we'll supplement
          // the item and data sections with sections for the service, full layers, and
          // full tables

          // Get the service description
          let serviceUrl = this.itemSection.url;
          request(serviceUrl + "?f=json", requestOptions)
          .then(
            serviceData => {
              // Fill in some missing parts
              serviceData["name"] = this.itemSection["name"];
              serviceData["snippet"] = this.itemSection["snippet"];
              serviceData["description"] = this.itemSection["description"];

              // If the service doesn't have a name, try to get a name from its layers or tables
              serviceData["name"] = serviceData["name"] ||
                this.getFirstUsableName(serviceData["layers"]) ||
                this.getFirstUsableName(serviceData["tables"]) ||
                "Feature Service";

              this.serviceSection = serviceData;

              // Update cost estimate because we have to move it to the desired folder in addition to creating it
              this.estimatedCost = 2;

              // Get the affiliated layer and table items
              Promise.all([
                this.getLayers(serviceUrl, serviceData["layers"], requestOptions),
                this.getLayers(serviceUrl, serviceData["tables"], requestOptions)
              ])
              .then(results => {
                this.layers = results[0];
                this.tables = results[1];

                // Update cost based on number of layers & tables
                this.estimatedCost += this.layers.length;
                this.estimatedCost += this.tables.length;

                // Update cost based on number of relationships
                this.layers.forEach(item => {
                  if (Array.isArray(item.relationships)) {
                    this.estimatedCost += item.relationships.length;
                  }
                });
                this.tables.forEach(item => {
                  if (Array.isArray(item.relationships)) {
                    this.estimatedCost += item.relationships.length;
                  }
                });

                resolve(this);
              });
            }
          );
        }
      );
    });
  }

  /**
   * Gets the full definitions of the layers affiliated with a hosted service.
   *
   * @param serviceUrl URL to hosted service
   * @param layerList List of layers at that service
   * @param requestOptions Options for the request
   */
  private getLayers (
    serviceUrl: string,
    layerList: any[],
    requestOptions?: IRequestOptions
  ): Promise<any[]> {
    return new Promise<any[]>(resolve => {
      if (!Array.isArray(layerList)) {
        resolve([]);
      }

      let requestsDfd:Promise<any>[] = [];
      layerList.forEach(layer => {
        requestsDfd.push(request(serviceUrl + "/" + layer["id"] + "?f=json", requestOptions));
      });

      // Wait until all layers are heard from
      Promise.all(requestsDfd)
      .then(layers => {
        // Remove the editFieldsInfo because it references fields that may not be in the layer/table
        layers.forEach(layer => {
          layer["editFieldsInfo"] = null;
        });
        resolve(layers);
      });
    });
  }

  /**
   * Gets the name of the first layer in list of layers that has a name
   * @param layerList List of layers to use as a name source
   * @returns The name of the found layer or an empty string if no layers have a name
   */
  private getFirstUsableName (
    layerList: any[]
  ): string {
    // Return the first layer name found
    if (layerList !== null) {
      layerList.forEach(layer => {
        if (layer["name"] !== "") {
          return layer["name"];
        }
      });
    }
    return "";
  }

}