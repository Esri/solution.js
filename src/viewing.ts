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
 * Extracts item hierarchy structure from a Solution's items list.
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

/**
 * Creates a Storymap from the Web Mapping Applications in a Solution.
 *
 * @param title Title of Storymap
 * @param solution Solution to examine for content
 * @param requestOptions Options for requesting information from AGOL
 * @param orgUrl The base URL for the AGOL organization, e.g., https://myOrg.maps.arcgis.com
 * @param folderId Id of folder to receive item; null/empty indicates that the item goes into the root folder
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return Storymap item that was published into AGOL
 */
export function createSolutionStorymap (
  title: string,
  solution: mInterfaces.ITemplate[],
  requestOptions: IUserRequestOptions,
  orgUrl: string,
  folderId = null as string,
  access = "private"
): Promise<mInterfaces.ITemplate> {
  return new Promise((resolve, reject) => {
    publishSolutionStorymapItem(createSolutionStorymapItem(title, solution, folderId), requestOptions, orgUrl,
    folderId, access)
    .then(
      storymap  => resolve(storymap),
      reject
    );
  });
}

// -- Internals ------------------------------------------------------------------------------------------------------//
// (export decoration is for unit testing)

/**
 * Creates a Storymap AGOL item.
 *
 * @param title Title of Storymap
 * @param solution Solution to examine for content
 * @param folderId Id of folder to receive item; null/empty indicates that the item goes into the root folder
 * @return Storymap AGOL item
 * @protected
 */
export function createSolutionStorymapItem (
  title: string,
  solution: mInterfaces.ITemplate[],
  folderId = null as string
): mInterfaces.ITemplate {
  // Prepare the storymap item
  const item = getStorymapItemFundamentals(title);
  const data = getStorymapItemDataFundamentals(title, folderId);

  // Create a story for each top-level item
  const topLevelItemIds:string[] = getTopLevelItemIds(solution);
  const stories = data.values.story.entries;
  topLevelItemIds.forEach(
    topLevelItemId => {
      const solutionItem = mSolution.getTemplateInSolution(solution, topLevelItemId);
            if (solutionItem.item.url) {
        const itsStory = getWebpageStory(solutionItem.item.title, solutionItem.item.description, solutionItem.item.url);
        stories.push(itsStory);
      }
    }
  );

  return {
    itemId: "",
    type: item.type,
    key: "",
    item,
    data
  };
}

/**
 * Generates the data section of a Storymap AGOL item.
 *
 * @param title Title of Storymap
 * @param folderId Id of folder to receive item; null/empty indicates that the item goes into the root folder
 * @return Storymap AGOL item's data section
 * @protected
 */
function getStorymapItemDataFundamentals (
  title: string,
  folderId: string
): any {
    return {
    "source": "32f733be56ce48b5993932715e1070ee",
    "folderId": folderId,
    "values": {
      "settings": {
        "layout": {
          "id": "accordion"
        },
        "layoutOptions": {
          "description": true,
          "legend": "dropdown",
          "panel": {
            "position": "left",
            "size": "medium"
          },
          "numbering": true,
          "reverse": false
        },
        "theme": {
          "colors": {
            "name": "accordion-org",
            "accordionNumber": "#004da8",
            "accordionTitle": "#004da8",
            "accordionArrowActive": "#004da8",
            "accordionArrow": "rgba(0, 77, 168, 0.6)",
            "accordionArrowHover": "rgba(0, 77, 168, 0.8)",
            "group": "org",
            "themeMajor": "black",
            "header": "#999999",
            "headerText": "#242424",
            "headerTitle": "#242424",
            "panel": "#ebebeb",
            "text": "#474747",
            "textLink": "#004da8",
            "media": "#eee",
            "mapControls": "#ebebeb",
            "softText": "#474747",
            "softBtn": "#474747",
            "esriLogo": "black",
            "esriLogoMobile": "black"
          }
        },
        "appGeocoders": [{
          "singleLineFieldName": "SingleLine",
          "name": "ArcGIS World Geocoding Service",
          "url": "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
        }]
      },
      "title": title,
      "story": {
        "storage": "WEBAPP",
        "entries": []
      },
      "template": {
        "name": "Map Series",
        "createdWith": "1.13.0",
        "editedWith": "1.13.0"
      }
    },
    "_ssl": null
  };
}

/**
 * Generates the base section of a Storymap AGOL item.
 *
 * @param title Title of Storymap
 * @return Storymap AGOL item's base section
 * @protected
 */
export function getStorymapItemFundamentals (
  title = ""
): any {
  return {
    "itemType": "text",
    "name": null,
    "title": title,
    "type": "Web Mapping Application",
    "typeKeywords": ["JavaScript", "layout-accordion", "Map", "Mapping Site", "mapseries", "Online Map",
      "Ready To Use", "selfConfigured", "Story Map", "Story Maps", "Web Map"],
    "tags": ["Solutions"],
    "commentsEnabled": false
  };
}

/**
 * Generates a Storymap page.
 *
 * @param title Title of Storymap page
 * @param description Body text of Storymap page
 * @param url URL to web page to embed in the Storymap page
 * @return Storymap page JSON
 * @protected
 */
function getWebpageStory (
  title: string,
  description: string,
  url: string
): any {
  return {
    "title": title,
    "contentActions": [],
    "creaDate": 1542325264964,
    "status": "PUBLISHED",
    "media": {
      "type": "webpage",
      "webpage": {
        "url": url,
        "type": "webpage",
        "altText": "",
        "display": "stretch",
        "unload": true
      }
    },
    "description": "<p>" + description + "</p>\n"
  }
}

/**
 * Creates a Storymap item describing the top-level webpages forming the solution.
 *
 * @param solutionStorymap Storymap AGOL item; item is modified
 * @param requestOptions Options for requesting information from AGOL
 * @param orgUrl The base URL for the AGOL organization, e.g., https://myOrg.maps.arcgis.com
 * @param folderId Id of folder to receive item; null indicates that the item goes into the root
 * folder
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return A promise that will resolve with an updated solutionStorymap reporting the Storymap id
 * and URL
 * @protected
 */
export function publishSolutionStorymapItem (
  solutionStorymap: mInterfaces.ITemplate,
  requestOptions: IUserRequestOptions,
  orgUrl: string,
  folderId = null as string,
  access = "private"
): Promise<mInterfaces.ITemplate> {
  return new Promise((resolve, reject) => {
    mCommon.createItemWithData(solutionStorymap.item, solutionStorymap.data, requestOptions, folderId, access)
    .then(
      createResponse => {
        // Update its app URL
        const solutionStorymapId = createResponse.id;
        const solutionStorymapUrl = orgUrl + "/apps/MapSeries/index.html?appid=" + solutionStorymapId;
        mCommon.updateItemURL(solutionStorymapId, solutionStorymapUrl, requestOptions)
        .then(
          () => {
            solutionStorymap.item.id = solutionStorymapId;
            solutionStorymap.item.url = solutionStorymapUrl;
            resolve(solutionStorymap);
          },
          reject
        );

      },
      reject
    );
  });
}
