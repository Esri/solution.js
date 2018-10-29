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

import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import * as items from "@esri/arcgis-rest-items";
import * as sharing from "@esri/arcgis-rest-sharing";
import { request } from "@esri/arcgis-rest-request";
import { IFullItem } from "./fullItem";
import { IItemHash, getFullItemHierarchy} from "./fullItemHierarchy";

//--------------------------------------------------------------------------------------------------------------------//

/**
 * An AGOL item for serializing, expanded to handle the extra information needed by feature services.
 */
export interface IFullItemFeatureService extends IFullItem {
  /**
   * Service description
   */
  service: any;
  /**
   * Description for each layer
   */
  layers: any[];
  /**
   * Description for each table
   */
  tables: any[];
}

/**
 * Converts one or more AGOL items and their dependencies into a hash by id of generic JSON item descriptions.
 *
 * ```typescript
 * import { IItemHash } from "../src/fullItemHierarchy";
 * import { createSolution } from "../src/solution";
 *
 * getFullItemHierarchy(["6fc5992522d34f26b2210d17835eea21", "9bccd0fac5f3422c948e15c101c26934"])
 * .then(
 *   (response:IItemHash) => {
 *     let keys = Object.keys(response);
 *     console.log(keys.length);  // => "6"
 *     console.log((response[keys[0]] as IFullItem).type);  // => "Web Mapping Application"
 *     console.log((response[keys[0]] as IFullItem).item.title);  // => "ROW Permit Public Comment"
 *     console.log((response[keys[0]] as IFullItem).text.source);  // => "bb3fcf7c3d804271bfd7ac6f48290fcf"
 *   },
 *   error => {
 *     // (should not see this as long as both of the above ids--real ones--stay available)
 *     console.log(error); // => "Item or group does not exist or is inaccessible: " + the problem id number
 *   }
 * );
 * ```
 *
 * @param rootIds AGOL id string or list of AGOL id strings
 * @param requestOptions Options for requesting information from AGOL
 * @returns A promise that will resolve with a hash by id of IFullItems;
 * if any id is inaccessible, a single error response will be produced for the set
 * of ids
 */
export function createSolution (
  solutionRootIds: string | string[],
  requestOptions?: IUserRequestOptions
): Promise<IItemHash> {
  return new Promise<IItemHash>(resolve => {

    // Get the items forming the solution
    getFullItemHierarchy(solutionRootIds, requestOptions)
    .then(
      solution => {
        let adjustmentPromises:Promise<void>[] = [];

        // Prepare the Solution by adjusting its items
        Object.keys(solution).forEach(
          key => {
            let fullItem = (solution[key] as IFullItem);

            // 1. remove unwanted properties
            fullItem.item = removeUncloneableItemProperties(fullItem.item);

            // 2. for web mapping apps,
            //    a. generalize app URL
            if (fullItem.type === "Web Mapping Application") {
              generalizeWebMappingApplicationURLs(fullItem);

            // 3. for feature services,
            //    a. fill in missing data
            //    b. get layer & table details
            //    c. generalize layer & table URLs
            } else if (fullItem.type === "Feature Service") {
              adjustmentPromises.push(fleshOutFeatureService(fullItem as IFullItemFeatureService, requestOptions));
            }
          }
        );

        if (adjustmentPromises.length === 0) {
          resolve(solution);
        } else {
          Promise.all(adjustmentPromises)
          .then(
            () => resolve(solution)
          );
        }
      }
    );
  });
}

/**
 * Creates a Solution item containing JSON descriptions of items forming the solution.
 *
 * @param title Title for Solution item to create
 * @param solution Hash of JSON descriptions of items to publish into Solution
 * @param access Access to set for item: 'public', 'org', 'private'
 * @param requestOptions Options for the request
 * @returns A promise that will resolve with an object reporting success and the Solution id
 */
export function publishSolution (
  title: string,
  solution: IItemHash,
  access: string,
  requestOptions?: IUserRequestOptions
): Promise<items.IItemUpdateResponse> {
  return new Promise((resolve) => {
    // Define the solution item
    let item = {
      title: title,
      type: 'Solution',
      itemType: 'text',
      access: access,
      listed: false,
      commentsEnabled: false
    };
    let data = {
      items: solution
    };

    // Create it and add its data section
    let options = {
      title: title,
      item: item,
      ...requestOptions
    };
    items.createItem(options)
    .then(function (results) {
      if (results.success) {
        let options = {
          id: results.id,
          data: data,
          ...requestOptions
        };
        items.addItemJsonData(options)
        .then(function (results) {
          // Set the access manually since the access value in createItem appears to be ignored
          let options = {
            id: results.id,
            access: access,
            ...requestOptions as sharing.ISetAccessRequestOptions
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

//--------------------------------------------------------------------------------------------------------------------//

/**
 * A general server name to replace the organization URL in a Web Mapping Application's URL to itself;
 * name has to be acceptable to AGOL.
 */
const aPlaceholderServerName:string = "https://arcgis.com";

/**
 * Creates a copy of item base properties with properties irrelevant to cloning removed.
 *
 * @param item The base section of an item
 * @returns Cloned copy of item without certain properties such as `created`, `modified`, `owner`,...
 */
function removeUncloneableItemProperties (
  item: any
): void {
  if (item) {
    let itemSectionClone = {...item};
    delete itemSectionClone.avgRating;
    delete itemSectionClone.created;
    delete itemSectionClone.guid;
    delete itemSectionClone.modified;
    delete itemSectionClone.numComments;
    delete itemSectionClone.numRatings;
    delete itemSectionClone.numViews;
    delete itemSectionClone.orgId;
    delete itemSectionClone.owner;
    delete itemSectionClone.scoreCompleteness;
    delete itemSectionClone.size;
    delete itemSectionClone.uploaded;
    return itemSectionClone;
  }
  return item;
}

/**
 * Simplifies a web mapping application's app URL for cloning.
 *
 * @param fullItem Web mapping application definition to be modified
 */
function generalizeWebMappingApplicationURLs (
  fullItem: IFullItem
): void {
  // Remove org base URL and app id
  // Need to add fake server because otherwise AGOL makes URL null
  let orgUrl = fullItem.item.url.replace(fullItem.item.id, "");
  let iSep = orgUrl.indexOf("//");
  fullItem.item.url = aPlaceholderServerName + orgUrl.substr(orgUrl.indexOf("/", iSep + 2));
}

/**
 * Fills in missing data, including full layer and table definitions, in a feature services' definition.
 *
 * @param fullItem Feature service item, data, dependencies definition to be modified
 */
function fleshOutFeatureService (
  fullItem: IFullItemFeatureService,
  requestOptions?: IUserRequestOptions
): Promise<void> {
  return new Promise<void>(resolve => {
    fullItem.service = {};
    fullItem.layers = [];
    fullItem.tables = [];

    // To have enough information for reconstructing the service, we'll supplement
    // the item and data sections with sections for the service, full layers, and
    // full tables

    // Get the service description
    let serviceUrl = fullItem.item.url;
    request(serviceUrl + "?f=json", requestOptions)
    .then(
      serviceData => {
        // Fill in some missing parts
        // If the service doesn't have a name, try to get a name from its layers or tables
        serviceData["snippet"] = fullItem.item["snippet"];
        serviceData["description"] = fullItem.item["description"];
        serviceData["name"] = fullItem.item["name"] ||
          getFirstUsableName(serviceData["layers"]) ||
          getFirstUsableName(serviceData["tables"]) ||
          "Feature Service";

        fullItem.service = serviceData;

        // Get the affiliated layer and table items
        Promise.all([
          getLayers(serviceUrl, serviceData["layers"], requestOptions),
          getLayers(serviceUrl, serviceData["tables"], requestOptions)
        ])
        .then(results => {
          fullItem.layers = results[0];
          fullItem.tables = results[1];
          resolve();
        });
      }
    );
  });
}

/**
 * Gets the name of the first layer in list of layers that has a name
 * @param layerList List of layers to use as a name source
 * @returns The name of the found layer or an empty string if no layers have a name
 */
function getFirstUsableName (
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

/**
 * Gets the full definitions of the layers affiliated with a hosted service.
 *
 * @param serviceUrl URL to hosted service
 * @param layerList List of layers at that service
 * @param requestOptions Options for the request
 */
function getLayers (
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