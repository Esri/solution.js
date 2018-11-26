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

import * as common from "./common";
import { IFullItem } from "./fullItem";
import { IItemHash } from "./fullItemHierarchy";
import { IOrgSession } from "./solution";
import { getTopLevelItemIds } from "./viewing";

//-- Exports ---------------------------------------------------------------------------------------------------------//

export interface IStorymap {
  id: string,
  url: string
}

export function createSolutionStorymapItem (
  title: string,
  solution: IItemHash,
  orgUrl: string,
  folderId = ""
): IFullItem {
  // Prepare the storymap item
  let item = getStorymapItemFundamentals(title, orgUrl);
  let data = getStorymapItemDataFundamentals(title, folderId);

  // Create a story for each top-level item
  let topLevelItemIds:string[] = getTopLevelItemIds(solution);
  let stories = data.values.story.entries;
  topLevelItemIds.forEach(
    topLevelItemId => {
      let solutionItem = solution[topLevelItemId] as IFullItem;
      if (solutionItem.item.url) {
        let itsStory = getWebpageStory(solutionItem.item.title, solutionItem.item.description, solutionItem.item.url);
        stories.push(itsStory);
      }
    }
  );

  return {
    type: item.type,
    item: item,
    data: data
  };
}

/**
 * Creates a Storymap item describing the top-level webpages forming the solution.
 *
 * @param solutionStorymap Storymap AGOL item
 * @param orgSession Options for requesting information from AGOL, including org and portal URLs
 * @param folderId Id of folder to receive item; null indicates that the item goes into the root
 *                 folder; ignored for Group item type
 * @param access Access to set for item: 'public', 'org', 'private'
 * @returns A promise that will resolve with an object reporting the Storymap id
 */
export function publishSolutionStorymapItem (
  solutionStorymap: IFullItem,
  orgSession: IOrgSession,
  folderId = "",
  access = "private"
): Promise<IStorymap> {
  return new Promise((resolve, reject) => {
    common.createItemWithData(solutionStorymap.item, solutionStorymap.data, orgSession, folderId, access)
    .then(
      createResponse => {
        // Update its app URL
        let solutionStorymapId = createResponse.id;
        let solutionStorymapUrl = orgSession.orgUrl + "/apps/MapSeries/index.html?appid=" + solutionStorymapId;
        common.updateItemURL(solutionStorymapId, solutionStorymapUrl, orgSession)
        .then(
          () => resolve({
            id: solutionStorymapId,
            url: solutionStorymapUrl
          }),
          reject
        );

      },
      reject
    );
  });
}

//-- Internals -------------------------------------------------------------------------------------------------------//

function getStorymapItemFundamentals (
  title: string,
  orgUrl: string
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
