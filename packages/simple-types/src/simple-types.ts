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

/**
 * Manages the creation and deployment of simple item types.
 *
 * @module simple-types
 */

import * as common from "@esri/solution-common";
import * as dashboard from "./dashboard";
import * as form from "./form";
import * as webmap from "./webmap";
import * as webmappingapplication from "./webmappingapplication";
import * as workforce from "./workforce";

// ------------------------------------------------------------------------------------------------------------------ //

export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: common.UserSession
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>((resolve, reject) => {
    // Init template
    const itemTemplate: common.IItemTemplate = common.createInitializedItemTemplate(
      itemInfo
    );
    itemTemplate.estimatedDeploymentCostFactor = 2; // minimal set is starting, creating, done|failed

    // Templatize item info property values
    itemTemplate.item.id = common.templatizeTerm(
      itemTemplate.item.id,
      itemTemplate.item.id,
      ".itemId"
    );

    // Request item resources
    const resourcePromise = common
      .getItemResources(itemTemplate.itemId, authentication)
      .then(resourcesResponse => {
        // Save resources to solution item
        itemTemplate.resources = (resourcesResponse.resources as any[]).map(
          (resourceDetail: any) => resourceDetail.resource
        );
        const resourceItemFilePaths: common.ISourceFileCopyPath[] = common.generateSourceFilePaths(
          authentication.portal,
          itemTemplate.itemId,
          itemTemplate.item.thumbnail,
          itemTemplate.resources
        );
        return common.copyFilesToStorageItem(
          authentication,
          resourceItemFilePaths,
          solutionItemId,
          authentication
        );
      })
      .catch(() => Promise.resolve([]));

    // Perform type-specific handling
    let dataPromise = Promise.resolve({});
    let relatedPromise = Promise.resolve({} as common.IGetRelatedItemsResponse);
    switch (itemInfo.type.toLowerCase()) {
      case "dashboard":
      case "feature service":
      case "project package":
      case "workforce project":
      case "web map":
      case "web mapping application":
        dataPromise = common.getItemDataAsJson(
          itemTemplate.itemId,
          authentication
        );
        break;
      case "form":
        dataPromise = common.getItemDataAsFile(
          itemTemplate.itemId,
          itemTemplate.item.name,
          authentication
        );
        relatedPromise = common.getItemRelatedItems(
          itemTemplate.itemId,
          "Survey2Service",
          "forward",
          authentication
        );
        break;
    }

    // Errors are handled as resolved empty values; this means that there's no `reject` clause to handle, hence:
    // tslint:disable-next-line:no-floating-promises
    Promise.all([dataPromise, resourcePromise, relatedPromise]).then(
      responses => {
        const [
          itemDataResponse,
          savedResourceFilenames,
          relatedItemsResponse
        ] = responses;
        itemTemplate.data = itemDataResponse;
        itemTemplate.resources = (savedResourceFilenames as any[]).filter(
          item => !!item
        );

        let wrapupPromise = Promise.resolve();
        let webappPromise = Promise.resolve(itemTemplate);
        switch (itemInfo.type.toLowerCase()) {
          case "dashboard":
            dashboard.convertItemToTemplate(itemTemplate, authentication);
            break;
          case "form":
            itemTemplate.dependencies = itemTemplate.dependencies.concat(
              (relatedItemsResponse as any).relatedItems.map(
                (relatedItem: { id: any }) => relatedItem.id
              )
            );

            // Store the form's data in the solution resources, not in template
            itemTemplate.data = null;
            form.convertItemToTemplate(itemTemplate);

            if (itemDataResponse) {
              const filename =
                itemTemplate.item.name ||
                (itemDataResponse as File).name ||
                "formData.zip";
              itemTemplate.item.name = filename;
              const storageName = common.generateResourceStorageFilename(
                itemTemplate.itemId,
                filename,
                "info_form"
              );
              itemTemplate.resources.push(
                storageName.folder + "/" + storageName.filename
              );
              wrapupPromise = common.addResourceFromBlob(
                itemDataResponse,
                solutionItemId,
                storageName.folder,
                storageName.filename,
                authentication
              );
            }
            break;
          case "web map":
            webappPromise = webmap.convertItemToTemplate(
              itemTemplate,
              authentication
            );
            break;
          case "web mapping application":
            webappPromise = webmappingapplication.convertItemToTemplate(
              itemTemplate,
              authentication
            );
            break;
          case "workforce project":
            workforce.convertItemToTemplate(itemTemplate);
            break;
        }

        wrapupPromise.then(
          () => {
            webappPromise.then(resolve, () => resolve(itemTemplate));
          },
          err => {
            reject(common.fail(err.response));
          }
        );
      },
      error => {
        reject(error);
      }
    );
  });
}

export function createItemFromTemplate(
  template: common.IItemTemplate,
  resourceFilePaths: common.IDeployFileCopyPath[],
  storageAuthentication: common.UserSession,
  templateDictionary: any,
  destinationAuthentication: common.UserSession,
  progressTickCallback: () => void
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // Replace the templatized symbols in a copy of the template
    let newItemTemplate: common.IItemTemplate = common.cloneObject(template);
    newItemTemplate = common.replaceInTemplate(
      newItemTemplate,
      templateDictionary
    );

    // Create the item, then update its URL with its new id

    // some fieldnames are used as keys for objects
    // when we templatize field references for web applications we first stringify the components of the
    // web application that could contain field references and then serach for them with a regular expression.
    // We also need to stringify the web application when de-templatizing so it will find all of these occurrences as well.
    if (template.type.toLowerCase() === "web mapping application") {
      newItemTemplate = JSON.parse(
        common.replaceInTemplate(
          JSON.stringify(newItemTemplate),
          templateDictionary
        )
      );
    }
    common
      .createItemWithData(
        newItemTemplate.item,
        newItemTemplate.data,
        destinationAuthentication,
        templateDictionary.folderId
      )
      .then(
        createResponse => {
          progressTickCallback();
          // Add the new item to the settings
          newItemTemplate.itemId = createResponse.id;
          templateDictionary[template.itemId] = {
            itemId: createResponse.id
          };

          // Set the appItemId manually to get around cases where the path was incorrectly set
          // in legacy deployments
          if (
            newItemTemplate.type.toLowerCase() === "web mapping application"
          ) {
            common.setProp(
              newItemTemplate,
              "data.appItemId",
              createResponse.id
            );
          }

          // Update the template again now that we have the new item id
          newItemTemplate = common.replaceInTemplate(
            newItemTemplate,
            templateDictionary
          );

          // Copy resources, metadata, thumbnail, form
          const resourcesDef = common.copyFilesFromStorageItem(
            storageAuthentication,
            resourceFilePaths,
            createResponse.id,
            destinationAuthentication
          );

          // The item's URL includes its id, so it needs to be updated
          const updateUrlDef = common.updateItemURL(
            createResponse.id,
            common.replaceInTemplate(
              newItemTemplate.item.url,
              templateDictionary
            ),
            destinationAuthentication
          );

          // Check for extra processing for web mapping application
          let customProcDef: Promise<void>;
          if (template.type.toLowerCase() === "web mapping application") {
            customProcDef = webmappingapplication.fineTuneCreatedItem(
              template,
              newItemTemplate,
              templateDictionary,
              destinationAuthentication
            );
          } else if (template.type.toLowerCase() === "workforce project") {
            customProcDef = workforce.fineTuneCreatedItem(
              newItemTemplate,
              destinationAuthentication
            );
          } else {
            customProcDef = Promise.resolve();
          }

          Promise.all([resourcesDef, updateUrlDef, customProcDef]).then(
            () => {
              progressTickCallback();

              // Update the template dictionary with the new id
              templateDictionary[template.itemId].itemId = createResponse.id;

              resolve(createResponse.id);
            },
            e => reject(common.fail(e))
          );
        },
        e => reject(common.fail(e))
      );
  });
}

/**
 * Templatizes field references within specific template types.
 * Currently only handles web mapping applications
 *
 * @param template A solution template
 * @param datasourceInfos A list of objects that store key datasource info used to templatizing field references
 * @param type The item type
 * @return The updated solution template
 */
export function postProcessFieldReferences(
  solutionTemplate: common.IItemTemplate,
  datasourceInfos: common.IDatasourceInfo[],
  type: string
): common.IItemTemplate {
  switch (type.toLowerCase()) {
    case "web mapping application":
      webmappingapplication.postProcessFieldReferences(
        solutionTemplate,
        datasourceInfos
      );
      break;
    case "dashboard":
      dashboard.postProcessFieldReferences(solutionTemplate, datasourceInfos);
      break;
    case "web map":
      webmap.postProcessFieldReferences(solutionTemplate, datasourceInfos);
      break;
  }
  return solutionTemplate;
}
