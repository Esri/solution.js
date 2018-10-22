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

import { UserSession, IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { IItemAddRequestOptions } from "@esri/arcgis-rest-items";
import * as items from "@esri/arcgis-rest-items";

//--------------------------------------------------------------------------------------------------------------------//

export interface IOrgSession {
  /**
   * The base URL for the AGOL organization, e.g., https://myOrg.maps.arcgis.com
   */
  orgUrl: string;
  /**
   * The base URL for the portal, e.g., https://www.arcgis.com
   */
  portalUrl: string;
  /**
   * A session representing a logged-in user
   */
  authentication: UserSession;
}

export interface ISwizzle {
  id: string;
  name?: string;
  url?: string;
}

export interface ISwizzleHash {
  [id:string]: ISwizzle;
}

export interface AgolItemPrototype {
  /**
   * Item JSON
   */
  itemSection: any;
  /**
   * Item data section JSON
   */
  dataSection?: any;
  /**
   * List of AGOL items needed by this item
   */
  dependencies?: string[];
  /**
   * Estimated cost factor for rehydrating item
   */
  estimatedCost?: number;
}

export class AgolItem implements AgolItemPrototype {
  /**
   * AGOL item type name
   */
  type: string;
  /**
   * Item JSON
   */
  itemSection: any;
  /**
   * Item data section JSON
   */
  dataSection?: any;
  /**
   * List of AGOL items needed by this item
   */
  dependencies: string[];
  /**
   * Estimated cost factor for rehydrating item
   */
  estimatedCost: number;

  /**
   * Performs common item initialization.
   *
   * @param itemSection The item's JSON
   */
  constructor (prototype:AgolItemPrototype) {
    if (!prototype) {
      throw new Error('Missing item prototype');
    }
    if (prototype.itemSection && prototype.itemSection.type) {
      this.type = prototype.itemSection.type;
    }
    this.itemSection = prototype.itemSection;
    this.dataSection = prototype.dataSection;
    this.dependencies = prototype.dependencies || [];
    this.estimatedCost = prototype.estimatedCost || 1;

    this.removeUncloneableItemProperties();
  }

  /**
   * Completes the creation of the item.
   *
   * @param requestOptions Options for initialization request(s)
   * @returns A promise that will resolve with the item
   */
  complete (
    requestOptions?: IUserRequestOptions
  ): Promise<AgolItem> {
    return new Promise(resolve => {
      resolve(this);
    });
  }

  /**
   * Clones the item into the destination organization and folder
   *
   * @param folderId AGOL id of folder to receive item, or null/empty if item is destined for root level
   * @param orgSession Information about current organization and login: org URL, portal URL, authentication
   * @returns A promise that will resolve with the item's id
   */
  clone (
    folderId: string,
    swizzles: ISwizzleHash,
    orgSession: IOrgSession
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log("Clone " + (this.itemSection.name || this.itemSection.title) + " (" + this.type + ")");//???

      // Prepare for create
      this.prepareForCreate(swizzles);

      // Create the item
      let options = this.getCreateItemOptions(folderId, orgSession);
      items.createItemInFolder(options)
      .then(
        createResp => {
          // Save the swizzle to this new item
          swizzles[this.itemSection.id].id = createResp.id;
          this.itemSection.id = createResp.id;

          // Wrap up creation
          this.concludeCreation(swizzles, orgSession)
          .then(resolve);
        },
        error => {
          reject('Unable to create ' + this.type + ': ' + JSON.stringify(error));
        }
      )
    });
  }

  prepareForCreate (
    swizzles: ISwizzleHash
  ): void {
      // Swizzle the items that this item contains
      this.swizzleContainedItems(swizzles);
  }

  swizzleContainedItems (
    swizzles: ISwizzleHash
  ): void {
  }

  concludeCreation (
    swizzles: ISwizzleHash,
    orgSession: IOrgSession
  ): Promise<string> {
    return new Promise(resolve => {
      resolve(this.itemSection.id);
    });
  }

  /**
   * Assembles the standard contents needed to create an item.
   *
   * @param folderId AGOL id of folder to receive item, or null/empty if item is destined for root level
   * @param orgSession Information about current organization and login: org URL, portal URL, authentication
   * @returns An options structure for calling arcgis-rest-js' createItemInFolder function
   */
  getCreateItemOptions (
    folderId: string,
    orgSession: IOrgSession
  ): IItemAddRequestOptions {
    let options:IItemAddRequestOptions = {
      item: this.itemSection,
      authentication: orgSession.authentication
    };

    if (this.dataSection) {
      options.item.text = this.dataSection;
    }

    if (folderId) {
      options.folder = folderId;
    }

    return options;
  }

  cloningUniquenessTimestamp () {
    return (new Date()).getTime();
  }

  //------------------------------------------------------------------------------------------------------------------//

  /**
   * Removes item properties irrelevant to cloning.
   */
  private removeUncloneableItemProperties (): void {
    let itemSection = this.itemSection;
    if (itemSection) {
      delete itemSection.avgRating;
      delete itemSection.created;
      delete itemSection.modified;
      delete itemSection.numComments;
      delete itemSection.numRatings;
      delete itemSection.numViews;
      delete itemSection.orgId;
      delete itemSection.owner;
      delete itemSection.scoreCompleteness;
      delete itemSection.size;
      delete itemSection.uploaded;
    }
  }

}