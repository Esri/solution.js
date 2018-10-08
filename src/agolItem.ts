/* Copyright (c) 2018 Esri
 * Apache-2.0 */

 import { IRequestOptions } from "@esri/arcgis-rest-request";

export class AgolItem {
  /**
   * AGOL item type name
   */
  type: string;
  /**
   * List of AGOL items needed by this item
   */
  dependencies: string[];
  /**
   * Item JSON
   */
  itemSection: any;

  /**
   * Performs common item initialization.
   * 
   * @param itemSection The item's JSON
   */
  constructor (itemSection:any) {
    if (itemSection.type) {
      this.type = itemSection.type;
    }
    this.dependencies = [];
    this.itemSection = itemSection;
    this.removeUncloneableItemProperties();
  }

  /**
   * Performs item-specific initialization.
   * 
   * @param requestOptions Options for initialization request(s)
   * @returns A promise that will resolve with the item
   */
  init (requestOptions?: IRequestOptions): Promise<AgolItem> {
    return new Promise(resolve => {
      resolve(this);
    });
  }

  /**
   * Removes item properties irrelevant to cloning.
   */
  private removeUncloneableItemProperties (): void {
    let itemSection = this.itemSection;

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