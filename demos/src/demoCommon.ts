/** @license
 * Copyright 2021 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* Functions shareable across demos */

import * as common from "@esri/solution-common";
import * as portal from "@esri/arcgis-rest-portal";


/**
 * Adds a loading GIF to a container.
 *
 * @param containerElementId Id of HTML container to receive image element
 * @return Created HTML item
 */
export function addBusySymbol (containerElementId: string): HTMLElement {
  const busySymbol = addItem(containerElementId, "IMG", containerElementId + "_busySymbol");
  (busySymbol as HTMLImageElement).src = "../images/loading.gif";
  return busySymbol;
}

/**
 * Creates an HTML element and adds it to a container.
 *
 * @param containerElementId Id of HTML container to receive image element
 * @param itemType Type of HTML element to create
 * @param itemId Id to assign to created HTML element
 * @param itemClasses Space-separated HTML class names to include in new item
 * @return Created HTML item
 */
export function addItem (containerElementId: string, itemType: string, itemId?: string, itemClasses?: string): HTMLElement {
  const item = document.createElement(itemType);
  if (itemId) {
    item.id = itemId;
  }
  if (itemClasses) {
    const attribute = document.createAttribute("class");
    attribute.value = itemClasses;
    item.setAttributeNode(attribute);
  }

  const containerItem = document.getElementById(containerElementId);
  containerItem.appendChild(item);
  return item;
}

/**
 * Creates an unordered list of checkbox entries from a list of AGO items returned by the arcgis-rest-js library;
 * each item's title and AGO id are displayed.
 *
 * @param searchResults List of items to display
 * @param portal Portal containing items, e.g., https://www.arcgis.com; if provided, the item's id will be a link
 * to the item in AGO
 * @param itemId ID to assign to created unordered list element
 * @param includeCustom Indicates if a fill-in-the blank checkbox entry should be added to the end of the list
 * @param onChange Text to provide to each checklist element's `onChange` attribute, e.g., "myCallback(this)"
 * @return Generated HTML
 */
export function createChecklist (
  searchResults: portal.IItem[],
  portal?: string,
  itemId?: string,
  includeCustom=false,
  onChange?: string
): string {
  let html = '<ul';
  if (itemId) {
    html += ' id="' + itemId + '"';
  }
  html += ' class="checklist">';
  searchResults.forEach(
    result => {
      html += '<li><input type="checkbox" ';
      if (onChange) {
        html += ' onChange="' + onChange + '" ';
      }
      html += 'value="' + result.id + '"> ' +
        result.type + ' "' + result.title + '" (';
      if (portal) {
        html += '<a href="' + portal + '/home/item.html?id=' + result.id + '" target="_blank">' +
          result.id + '</a>';
      } else {
        html += result.id;
      }
      html += ')</li>';
    }
  );

  if (includeCustom) {
    html += '<li><input type="checkbox" value="custom"> Solution ';
    html += '<input type="text" size="40">';
    html += '</li>';
  }

  return html += '</ul>';
}

/**
 * Creates an unordered list of AGO items returned by the arcgis-rest-js library;
 * each item's title and AGO id are displayed.
 *
 * @param searchResults List of items to display
 * @param portal Portal containing items, e.g., https://www.arcgis.com; if provided, the item's id will be a link
 * to the item in AGO
 * @param itemId ID to assign to created unordered list element
 * @return Generated HTML
 */
export function createSimpleList (searchResults: portal.IItem[], portal: string, itemId: string) {
  let html = '<ul';
  if (itemId) {
    html += ' id="' + itemId + '"';
  }
  html += ' class="simpleList">';
  searchResults.forEach(
    result => {
      html += '<li>' + result.type + ' "' + result.title + '" (';
      if (portal) {
        html += '<a href="' + portal + '/home/item.html?id=' + result.id + '" target="_blank">' +
          result.id + '</a>';
      } else {
        html += result.id;
      }
      html += ')</li>';
    }
  );
  return html += '</ul>';
}

/**
 * Sets the opacity of an HTML element to "1".
 *
 * @param elementId HTML id of element to modify
 */
export function fadeItemIn (elementId: string) {
  const item = document.getElementById(elementId);
  if (item) {
    item.style.opacity = "1";
  }
}

/**
 * Sets the opacity of an HTML element to "0".
 *
 * @param elementId HTML id of element to modify
 */
export function fadeItemOut (elementId: string) {
  const item = document.getElementById(elementId);
  if (item) {
    item.style.opacity = "0";
  }
}

/**
 * Creates a UserSession.
 *
 * @param username
 * @param password
 * @param portalUrl Base url for the portal you want to make the request to; defaults
 *        to 'https://www.arcgis.com/sharing/rest'
 * @return solutionCommon.UserSession object
 * @see @esri/arcgis-rest-auth
 * @see @esri/arcgis-rest-request
 */
export function getRequestAuthentication(
  username: string,
  password: string,
  portalUrl: string
): common.UserSession {
  const userSessionOptions = {
    username: username || undefined,
    password: password || undefined,
    portal: portalUrl || "https://www.arcgis.com/sharing/rest"
  };

  return new common.UserSession(userSessionOptions);
}

/**
 * Removes an HTML element from the DOM.
 *
 * @param elementId HTML id of element to remove
 */
export function removeItem (elementId: string) {
  const item = document.getElementById(elementId);
  item && item.remove();
}
