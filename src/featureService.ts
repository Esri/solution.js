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

import * as featureServiceAdmin from "@esri/arcgis-rest-feature-service-admin";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { request } from "@esri/arcgis-rest-request";
import { AgolItem, IOrgSession, ISwizzleHash } from "./agolItem";
import { ItemWithData } from "./itemWithData";

//--------------------------------------------------------------------------------------------------------------------//

interface IRelationship {
  [id:string]: string[];
}

/**
 *  AGOL hosted feature service item
 */
export class FeatureService  extends ItemWithData {
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
   * Completes the creation of the item.
   *
   * @param requestOptions Options for initialization request for item's data section
   * @returns A promise that will resolve with the item
   */
  complete (
    requestOptions?: IUserRequestOptions
  ): Promise<AgolItem> {
    return new Promise((resolve) => {
      // Fetch item data section
      super.complete(requestOptions)
      .then(
        () => {
          // To have enough information for reconstructing the service, we'll supplement
          // the item and data sections with sections for the service, full layers, and
          // full tables

          // Add to the standard cost of creating an item: extra for creating because they're
          // slower than other items to create and extra because they have to be moved to the
          // desired folder
          this.estimatedCost += 2;

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

              // Get the affiliated layer and table items
              Promise.all([
                this.getLayers(serviceUrl, serviceData["layers"], requestOptions),
                this.getLayers(serviceUrl, serviceData["tables"], requestOptions)
              ])
              .then(results => {
                this.layers = results[0];
                this.tables = results[1];

                // Update cost based on number of layers & tables; doubled because they're extra slow
                this.estimatedCost += this.layers.length * 2;
                this.estimatedCost += this.tables.length * 2;

                // Update cost based on number of relationships; doubled because they're extra slow
                this.layers.forEach(item => {
                  if (Array.isArray(item.relationships)) {
                    this.estimatedCost += item.relationships.length * 2;
                  }
                });
                this.tables.forEach(item => {
                  if (Array.isArray(item.relationships)) {
                    this.estimatedCost += item.relationships.length * 2;
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
   * Clones the item into the destination organization and folder
   *
   * @param folderId AGOL id of folder to receive item, or null/empty if item is destined for root level
   * @param requestOptions Options for creation request(s)
   * @returns A promise that will resolve with the item's id
   */
  clone (
    folderId: string,
    swizzles: ISwizzleHash,
    requestOptions?: IUserRequestOptions
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log("Clone " + (this.itemSection.name || this.itemSection.title) + " (" + this.type + ")");//???

      let options = {
        item: this.itemSection,
        folderId: folderId,
        ...requestOptions
      }

      // Make the item name unique
      options.item.name += '_' + this.cloningUniquenessTimestamp();

      // Remove the layers and tables from the create request because while they aren't added when
      // the service is added, their presence prevents them from being added later via addToDefinition
      options.item.layers = [];
      options.item.tables = [];

      // Create the item
      featureServiceAdmin.createFeatureService(options)
      .then(
        createResp => {
          if (createResp.success) {
            swizzles[this.itemSection.id] = {
              id: createResp.serviceItemId,
              url: createResp.serviceurl
            };

            // Sort layers and tables by id so that they're added with the same ids
            let layersAndTables:any[] = [];

            (this.layers || []).forEach(function (layer) {
              layersAndTables[layer.id] = {
                item: layer,
                type: 'layer'
              };
            });

            (this.tables || []).forEach(function (table) {
              layersAndTables[table.id] = {
                item: table,
                type: 'table'
              };
            });

            // Hold a hash of relationships
            let relationships:IRelationship = {};

            // Add the service's layers and tables to it
            this.addToDefinition(createResp.serviceItemId, createResp.serviceurl, layersAndTables, 
              swizzles, relationships, requestOptions)
            .then(
              () => {
                // Restore relationships for all layers and tables in the service
                let awaitRelationshipUpdates:Promise<void>[] = [];
                Object.keys(relationships).forEach(
                  id => {
                    awaitRelationshipUpdates.push(new Promise(resolve => {
                      var options = {
                        params: {
                          addToDefinition: {
                            relationships: relationships[id]
                          }
                        },
                        ...requestOptions
                      };
                      featureServiceAdmin.addToServiceDefinition(createResp.serviceurl + "/" + id, options)
                      .then(
                        () => {
                          resolve();
                        },
                        resolve);
                    }));
                  }
                );
                Promise.all(awaitRelationshipUpdates)
                .then(
                  () => {
                    resolve(createResp.serviceItemId);
                  }
                );
              }
            );
          } else {
            reject('Unable to create feature service');
          }
        },
        error => {
          reject('Unable to create feature service');
        }
      );
    });
  }

  //------------------------------------------------------------------------------------------------------------------//

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
    requestOptions?: IUserRequestOptions
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

  private addToDefinition(serviceItemId:string, serviceUrl:string, listToAdd:any[], 
    swizzles: ISwizzleHash, relationships:IRelationship, requestOptions?: IUserRequestOptions) {
    // Launch the adds serially because server doesn't support parallel adds
    return new Promise((resolve) => {
      if (listToAdd.length > 0) {
        var toAdd = listToAdd.shift();

        var item = toAdd.item;
        var originalId = item.id;
        //delete item.id;  // Updated by addToDefinition
        delete item.serviceItemId;  // Updated by addToDefinition

        // Need to remove relationships and add them back individually after all layers and tables
        // have been added to the definition
        if (Array.isArray(item.relationships) && item.relationships.length > 0) {
          relationships[originalId] = item.relationships;
          item.relationships = [];
        }

        let options:featureServiceAdmin.IAddToServiceDefinitionRequestOptions = {
          ...requestOptions
        };

        if (toAdd.type === 'layer') {
          item.adminLayerInfo = {  //???
            'geometryField': {
              'name': 'Shape',
              'srid': 102100
            }
          };
          options.layers = [item];
        } else {
          options.tables = [item];
        }

        featureServiceAdmin.addToServiceDefinition(serviceUrl, options)
        .then(
          response => {
            swizzles[serviceItemId + '_' + originalId] = {
              'name': response.layers[0].name,
              'id': serviceItemId,
              'url': serviceUrl + '/' + response.layers[0].id
            };
            this.addToDefinition(serviceItemId, serviceUrl, listToAdd, swizzles, relationships, requestOptions)
            .then(resolve);
          },
          response => {
            this.addToDefinition(serviceItemId, serviceUrl, listToAdd, swizzles, relationships, requestOptions)
            .then(resolve);
          }
        );
      } else {
        resolve();
      }
    });
  }

}