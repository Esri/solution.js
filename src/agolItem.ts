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

import { IRequestOptions } from "@esri/arcgis-rest-request";

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
    requestOptions?: IRequestOptions
  ): Promise<AgolItem> {
    return new Promise(resolve => {
      resolve(this);
    });
  }

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