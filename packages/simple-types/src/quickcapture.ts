/** @license
 * Copyright 2018 Esri
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

import * as common from "@esri/solution-common";
import * as quickcaptureHelpers from "./helpers/quickcapture-helpers";

//#region Publish Process ---------------------------------------------------------------------------------------//

// Delegate back to simple-types, which will in-turn delegate
// to convertNotebookToTemplate at the correct point in the process
// This is a temporary refactor step
export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: common.UserSession
): Promise<common.IItemTemplate> {
  return quickcaptureHelpers.convertItemToTemplate(
    solutionItemId,
    itemInfo,
    authentication
  );
}

/**
 * Converts an quick capture item to a template.
 *
 * @param itemTemplate template for the quick capture project item
 * @return templatized itemTemplate
 */
export function convertQuickCaptureToTemplate(
  itemTemplate: common.IItemTemplate
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>((resolve, reject) => {
    // The templates data to process
    const data: any = itemTemplate.data;
    if (data && Array.isArray(data)) {
      let applicationRequest: Promise<any> = Promise.resolve();
      let applicationName: string = "";
      data.some((item: File) => {
        if (item.type === "application/json") {
          applicationName = item.name;
          applicationRequest = common.getBlobText(item);
          return true;
        }
      });

      applicationRequest.then(result => {
        // replace the template data array with the templatized application JSON
        itemTemplate.data = result
          ? {
              application: _templatizeApplication(
                JSON.parse(result),
                itemTemplate
              ),
              name: applicationName
            }
          : {};
        resolve(itemTemplate);
      }, reject);
    } else {
      resolve(itemTemplate);
    }
  });
}

/**
 * Templatizes key properties for a quick capture project and gathers item dependencies
 *
 * @param data the projects json
 * @param itemTemplate template for the quick capture project item
 * @return templatized itemTemplate
 */
export function _templatizeApplication(
  data: any,
  itemTemplate: common.IItemTemplate
): any {
  // Quick Project item id
  _templatizeId(data, "itemId");

  // Set the admin email
  _templatizeAdminEmail(data);

  // datasource item id and url
  const dataSources: common.IQuickCaptureDatasource[] = data.dataSources;
  if (dataSources && Array.isArray(dataSources)) {
    dataSources.forEach(ds => {
      const id: string = ds.featureServiceItemId;
      if (id) {
        _updateDependencies(id, itemTemplate);
        _templatizeUrl(ds, "featureServiceItemId", "url");
        _templatizeId(ds, "featureServiceItemId");
      }
    });
  }
  return data;
}

/**
 * Templatize the email property
 *
 * @param data the quick capture application
 */
export function _templatizeAdminEmail(data: any): void {
  if (common.getProp(data, "preferences.adminEmail")) {
    common.setProp(data, "preferences.adminEmail", "{{user.email}}");
  }
}

/**
 * Updates the templates dependencies list with unique item ids
 *
 * @param id the item id of the dependency
 * @param itemTemplate template for the quick capture project item
 * @return templatized itemTemplate
 */
export function _updateDependencies(
  id: string,
  itemTemplate: common.IItemTemplate
): void {
  if (itemTemplate.dependencies.indexOf(id) === -1) {
    itemTemplate.dependencies.push(id);
  }
}

/**
 * Templatize a url property
 *
 * @param obj the datasource object
 * @param idPath the path to the id property
 * @param urlPath the path to the url property
 */
export function _templatizeUrl(
  obj: any,
  idPath: string,
  urlPath: string
): void {
  const id: any = common.getProp(obj, idPath);
  const url: string = common.getProp(obj, urlPath);
  if (url) {
    const layerId = url.substr(url.lastIndexOf("/") + 1);
    common.setProp(
      obj,
      urlPath,
      common.templatizeTerm(id, id, ".layer" + layerId + ".url")
    );
  }
}

/**
 * Templatize the item id property
 *
 * @param obj the datasource or object that contains the item id property
 * @param path the path to the id property
 */
export function _templatizeId(obj: any, path: string): void {
  const id: any = common.getProp(obj, path);
  if (id) {
    common.setProp(obj, path, common.templatizeTerm(id, id, ".itemId"));
  }
}

//#endregion

//#region Deploy Process ---------------------------------------------------------------------------------------//

// Delegate back to simple-types
// This is a temporary refactor step
export function createItemFromTemplate(
  template: common.IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: common.UserSession,
  itemProgressCallback: common.IItemProgressCallback
): Promise<common.ICreateItemFromTemplateResponse> {
  return quickcaptureHelpers.createItemFromTemplate(
    template,
    templateDictionary,
    destinationAuthentication,
    itemProgressCallback
  );
}

/**
 * QuickCapture post-processing actions
 * @param {string} itemId The item ID
 * @param {string} type The template type
 * @param {any[]} itemInfos Array of {id: 'ef3', type: 'Web Map'} objects
 * @param {any} templateDictionary The template dictionary
 * @param {UserSession} authentication The destination session info
 * @returns Promise resolving to successfulness of update
 */
export function postProcess(
  itemId: string,
  type: string,
  itemInfos: any[],
  template: common.IItemTemplate,
  templates: common.IItemTemplate[],
  templateDictionary: any,
  authentication: common.UserSession
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    template.data = common.replaceInTemplate(template.data, templateDictionary);
    common.updateItemTemplateFromDictionary(
      itemId,
      templateDictionary,
      authentication
    ).then(
      () => {
        common.updateItemResourceText(
          itemId,
          template.data.name,
          JSON.stringify(template.data.application),
          authentication
        ).then(resolve, reject);
      },
      reject
    );
  });
}

//#endregion
