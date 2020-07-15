/** @license
 * Copyright 2020 Esri
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
import {
  ICreateItemFromTemplateResponse,
  IDatasourceInfo,
  IItemProgressCallback,
  IItemTemplate,
  IItemUpdate,
  SERVER_NAME,
  checkUrlPathTermination,
  createItemWithData,
  hasAnyKeyword,
  placeholder,
  replaceInTemplate,
  setProp,
  templatizeTerm,
  fail,
  updateItem
} from "@esri/solution-common";
import { UserSession } from "@esri/solution-common";
import { convertGenericItemToTemplate } from "../helpers/convert-generic-item-to-template";
import { getProp } from "@esri/hub-common";
import * as simpleTypeHelpers from "../helpers/simple-type-helpers";
import { refineWebAppTemplate } from "./refine-webapp-template";
import { _templatizeObject } from "./_templatizeObject";
import { _templatizeObjectArray } from "./_templatizeObjectArray";

/**
 * Converts a WebApp item to a template.
 *
 * @param itemTemplate Template for the dashboard item
 * @param authentication Credentials for any requests
 * @return templatized itemTemplate
 */
export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: UserSession
): Promise<IItemTemplate> {
  // delegate to generic item templating
  return convertGenericItemToTemplate(
    solutionItemId,
    itemInfo,
    authentication
  ).then(itemTemplate => {
    // do additional type-specific work
    return refineWebAppTemplate(itemTemplate, authentication);
  });
}

/**
 * Templatizes field references within specific template types.
 *
 * called from creator::add-conent-to-solution
 *
 * @param template A solution template
 * @param datasourceInfos A list of objects that store key datasource info used to templatizing field references
 * @param type The item type
 * @return The updated solution template
 */
export function postProcessFieldReferences(
  solutionTemplate: IItemTemplate,
  datasourceInfos: IDatasourceInfo[],
  type: string
): IItemTemplate {
  // handle datasources common for WAB apps
  const dataSources: any = getProp(
    solutionTemplate,
    "data.dataSource.dataSources"
  );
  if (dataSources && Object.keys(dataSources).length > 0) {
    Object.keys(dataSources).forEach(k => {
      const ds: any = dataSources[k];
      dataSources[k] = _templatizeObject(ds, datasourceInfos);
    });
    setProp(solutionTemplate, "data.dataSource.dataSources", dataSources);
  }

  // handle widgets common for WAB apps
  const paths: string[] = [
    "data.widgetPool.widgets",
    "data.widgetOnScreen.widgets"
  ];
  paths.forEach(path => {
    const widgets = getProp(solutionTemplate, path);
    if (widgets) {
      setProp(
        solutionTemplate,
        path,
        _templatizeObjectArray(widgets, datasourceInfos)
      );
    }
  });

  // handle values common for web app templates
  const values: any = getProp(solutionTemplate, "data.values");
  if (values) {
    setProp(
      solutionTemplate,
      "data.values",
      _templatizeObject(values, datasourceInfos)
    );
  }

  return solutionTemplate;
}

/**
 * Delegate to simpleType creator
 * @param template
 * @param templateDictionary
 * @param destinationAuthentication
 * @param itemProgressCallback
 */
export function createItemFromTemplate(
  template: IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: UserSession,
  itemProgressCallback: IItemProgressCallback
): Promise<ICreateItemFromTemplateResponse> {
  return simpleTypeHelpers.createItemFromTemplate(
    template,
    templateDictionary,
    destinationAuthentication,
    itemProgressCallback
  );
}

/**
 * "Fine Tune" the created Web Mapping Application item that was just created
 *
 * If this is a Web App Builder (WAB) we create a Code Attachment item
 *
 * @param originalTemplate
 * @param newlyCreatedItem
 * @param templateDictionary
 * @param destinationAuthentication
 * @private
 */
export function fineTuneCreatedItem(
  originalTemplate: IItemTemplate,
  newlyCreatedItem: IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: UserSession
): Promise<void> {
  const WABKeywords = ["WAB2D", "WAB3D", "Web AppBuilder"];
  const isWAB = hasAnyKeyword(originalTemplate, WABKeywords);

  if (isWAB) {
    const promises = [];
    // Update item so properties like appItemId can now be set
    // now that we know the new apps ID
    const updateOptions: IItemUpdate = {
      id: newlyCreatedItem.itemId,
      url: newlyCreatedItem.item.url,
      data: newlyCreatedItem.data
    };
    promises.push(updateItem(updateOptions, destinationAuthentication));

    const codeAttachmentItem = {
      tags: originalTemplate.item.tags,
      title: originalTemplate.item.title,
      type: "Code Attachment",
      typeKeywords: ["Code", "Javascript", "Web Mapping Application"],
      relationshipType: "WMA2Code",
      originItemId: newlyCreatedItem.itemId,
      url:
        checkUrlPathTermination(
          replaceInTemplate(placeholder(SERVER_NAME), templateDictionary)
        ) +
        "sharing/rest/content/items/" +
        newlyCreatedItem.itemId +
        "/package"
    };

    promises.push(
      createItemWithData(
        codeAttachmentItem,
        {},
        destinationAuthentication,
        templateDictionary.folderId
      )
    );

    return Promise.all(promises)
      .then(() => {
        // intentionally empty
      })
      .catch(() => {
        // apparently we swallow errors and move on
      });
  } else {
    // Otherwise, nothing extra needed
    return Promise.resolve();
  }
}

/**
 * Templatizes id properties for the paths provided
 *
 * @param itemTemplate The solution item template
 * @param paths A list of property paths that contain ids
 * @private
 */
export function _templatizeIdPaths(
  itemTemplate: IItemTemplate,
  paths: string[]
) {
  paths.forEach(path => {
    const id: any = getProp(itemTemplate, path);
    _templatizeIdPath(itemTemplate, path, id);
  });
}

/**
 * Templatizes id property for the path provided
 *
 * @param itemTemplate The solution item template
 * @param path A path to an id property
 * @param id The base id to use when templatizing
 * @private
 */
export function _templatizeIdPath(
  itemTemplate: IItemTemplate,
  path: string,
  id: string
) {
  setProp(itemTemplate, path, templatizeTerm(id, id, ".itemId"));
}
