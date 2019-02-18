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

import * as mCommon from "./itemTypes/common";
import * as mInterfaces from "../src/interfaces";
import * as mSolution from "./solution";
import { IUserRequestOptions } from '@esri/arcgis-rest-auth';
import { IItem } from '@esri/arcgis-rest-common-types';

// -- Externals ------------------------------------------------------------------------------------------------------//

/**
 * A recursive structure describing the hierarchy of a collection of AGOL items.
 */
export interface IHierarchyEntry {
  /**
   * AGOL item id
   */
  id: string,
  /**
   * Item's dependencies
   */
  dependencies: IHierarchyEntry[]
}

export interface IAGOItemAccess {
  id: string,
  url: string
}

/**
 * Gets a list of the top-level items in a Solution, i.e., the items that no other item depends on.
 *
 * @param items Solution to explore
 * @return List of ids of top-level items in Solution
 */
export function getTopLevelItemIds (
  templates: mInterfaces.ITemplate[]
): string[] {
  // Find the top-level nodes. Start with all nodes, then remove those that other nodes depend on
  const topLevelItemCandidateIds:string[] =
    templates.map(
      template => {
        return template.itemId;
      }
    );
  templates.forEach(
    template => {
      (template.dependencies || []).forEach(function (dependencyId) {
        const iNode = topLevelItemCandidateIds.indexOf(dependencyId);
        if (iNode >= 0) {
          // Node is somebody's dependency, so remove the node from the list of top-level nodes
          // If iNode == -1, then it's a shared dependency and it has already been removed
          topLevelItemCandidateIds.splice(iNode, 1);
        }
      });
    }
  );
  return topLevelItemCandidateIds;
}

/**
 * Extracts item hierarchy structure from a solution template.
 *
 * @param items Hash of JSON descriptions of items
 * @return JSON structure reflecting dependency hierarchy of items; shared dependencies are
 * repeated; each element of the structure contains the AGOL id of an item and a list of ids of the
 * item's dependencies
 */
export function getItemHierarchy (
  templates: mInterfaces.ITemplate[]
): IHierarchyEntry[] {
  const hierarchy:IHierarchyEntry[] = [];

  // Find the top-level nodes. Start with all nodes, then remove those that other nodes depend on
  const topLevelItemIds = getTopLevelItemIds(templates);

  // Hierarchically list the children of specified nodes
  function itemChildren(children:string[], accumulatedHierarchy:IHierarchyEntry[]): void {
    // Visit each child
    children.forEach(function (id) {
      const child:IHierarchyEntry = {
        id,
        dependencies: []
      };

      // Fill in the child's dependencies array with its children
      const template = mSolution.getTemplateInSolution(templates, id);
      const dependencyIds = template.dependencies;
      if (Array.isArray(dependencyIds) && dependencyIds.length > 0) {
        itemChildren(dependencyIds, child.dependencies);
      }

      accumulatedHierarchy.push(child);
    });
  }

  itemChildren(topLevelItemIds, hierarchy);
  return hierarchy;
}

export function createDeployedSolutionItem (
  title: string,
  solution: mInterfaces.ITemplate[],
  templateItem: IItem,
  requestOptions: IUserRequestOptions,
  settings = {} as any,
  access = "private"
): Promise<IAGOItemAccess> {
  return new Promise((resolve, reject) => {
    const thumbnailUrl:string = "https://www.arcgis.com/sharing/content/items/" +
      templateItem.id + "/info/" + templateItem.thumbnail;
    const item = {
      itemType: "text",
      name: null as string,
      title,
      description: templateItem.description,
      tags: templateItem.tags,
      snippet: templateItem.snippet,
      thumbnailurl: thumbnailUrl,
      accessInformation: templateItem.accessInformation,
      type: "Solution",
      typeKeywords: ["Solution", "Deployed"],
      commentsEnabled: false
    };
    const data = {
      templates: solution
    };

    mCommon.createItemWithData(item, data, requestOptions, settings.folderId, access)
    .then(
      createResponse => {
        // Update its app URL
        const orgUrl = (settings.organization && settings.organization.orgUrl) || "https://www.arcgis.com";
        const deployedSolutionItemId = createResponse.id;
        const deployedSolutionItemUrl = orgUrl + "/home/item.html?id=" + deployedSolutionItemId;
        mCommon.updateItemURL(deployedSolutionItemId, deployedSolutionItemUrl, requestOptions)
        .then(
          response => {
            const deployedSolutionItem:IAGOItemAccess = {
              id: deployedSolutionItemId,
              url: deployedSolutionItemUrl
            }
            resolve(deployedSolutionItem);
          },
          () => reject({ success: false })
        );
      },
      () => reject({ success: false })
    );
  });
}
