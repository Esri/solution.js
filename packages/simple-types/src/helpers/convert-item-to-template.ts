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

import * as common from "@esri/solution-common";
import * as dashboard from "../dashboard";
import * as notebook from "../notebook";
import * as oic from "../oic";
import * as quickcapture from "../quickcapture";
import * as webmap from "../webmap";
import * as webmappingapplication from "../webmappingapplication";
import * as workforce from "../workforce";

/**
 * Converts an item into a template.
 *
 * @param solutionItemId The solution to contain the template
 * @param itemInfo Info about the item
 * @param destAuthentication Credentials for requests to the destination organization
 * @param srcAuthentication Credentials for requests to source items
 * @param templateDictionary Hash of facts: folder id, org URL, adlib replacements
 *
 * @returns A promise that will resolve when the template has been created
 */
export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  destAuthentication: common.UserSession,
  srcAuthentication: common.UserSession,
  templateDictionary: any
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>((resolve, reject) => {
    // Init template
    const itemTemplate: common.IItemTemplate = common.createInitializedItemTemplate(
      itemInfo
    );

    // Templatize item info property values
    itemTemplate.item.id = common.templatizeTerm(
      itemTemplate.item.id,
      itemTemplate.item.id,
      ".itemId"
    );

    // Request related items
    const relatedPromise = common.getItemRelatedItemsInSameDirection(
      itemTemplate.itemId,
      "forward",
      srcAuthentication
    );

    // Perform type-specific handling
    let dataPromise = Promise.resolve({});
    let resourcesPromise = Promise.resolve([]);
    switch (itemInfo.type) {
      case "Dashboard":
      case "Data Pipeline":
      case "Feature Collection":
      case "Feature Service":
      case "Hub Initiative":
      case "Hub Page":
      case "Hub Site Application":
      case "Insights Model":
      case "Oriented Imagery Catalog":
      case "Project Package":
      case "Workforce Project":
      case "Web Map":
      case "Web Mapping Application":
      case "Web Scene":
      case "Notebook":
        dataPromise = new Promise(resolveJSON => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          common
            .getItemDataAsJson(itemTemplate.itemId, srcAuthentication)
            .then(json => resolveJSON(json));
        });
        break;
      case "Form":
        dataPromise = common.getItemDataAsFile(
          itemTemplate.itemId,
          itemTemplate.item.name,
          srcAuthentication
        );
        break;
      case "QuickCapture Project":
        // Fetch all of the resources to get the config
        resourcesPromise = common.getItemResourcesFiles(
          itemTemplate.itemId,
          srcAuthentication
        );
        break;
    }

    // Errors are handled as resolved empty values; this means that there's no `reject` clause to handle, hence:
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Promise.all([dataPromise, relatedPromise, resourcesPromise]).then(responses => {
      const [itemDataResponse, relatedItemsResponse, resourcesResponse] = responses;

      // need to pre-process for velocity urls before they could be templatized by other processors
      itemTemplate.data = common.updateVelocityReferences(
        itemDataResponse,
        itemInfo.type,
        templateDictionary
      );
      const relationships = relatedItemsResponse;

      // Save the mappings to related items & add those items to the dependencies, but not WMA Code Attachments
      itemTemplate.dependencies = [] as string[];
      itemTemplate.relatedItems = [] as common.IRelatedItems[];

      relationships.forEach(relationship => {
        /* istanbul ignore else */
        if (relationship.relationshipType !== "WMA2Code") {
          itemTemplate.relatedItems.push(relationship);
          relationship.relatedItemIds.forEach(relatedItemId => {
            if (itemTemplate.dependencies.indexOf(relatedItemId) < 0) {
              itemTemplate.dependencies.push(relatedItemId);
            }
          });
        }
      });

      // Add Data Pipeline source and sink feature layers to dependencies
      if (itemInfo.type === "Data Pipeline") {
        itemTemplate.dependencies = itemTemplate.dependencies.concat(_getDataPipelineSourcesAndSinks(itemDataResponse));
      }

      // Create the template
      let templateModifyingPromise = Promise.resolve(itemTemplate);
      switch (itemInfo.type) {
        case "Dashboard":
          dashboard.convertItemToTemplate(itemTemplate, templateDictionary);
          break;
        case "Form":
          // Store the form's data in the solution resources, not in template
          itemTemplate.data = null;

          // Add the form data to the template for a post-process resource upload
          if (itemDataResponse) {
            itemTemplate.item.name = _getFormDataFilename(
              itemTemplate.item.name, (itemDataResponse as File).name, `${itemTemplate.itemId}.zip`
            );
            const storageName = common.convertItemResourceToStorageResource(
              itemTemplate.itemId,
              itemTemplate.item.name,
              common.SolutionTemplateFormatVersion,
              common.SolutionResourceType.data
            );

            // Add the data file to the template so that it can be uploaded with the other resources in the solution
            const dataFile: common.ISourceFile = {
              itemId: itemTemplate.itemId,
              file: itemDataResponse as File,
              folder: storageName.folder,
              filename: itemTemplate.item.name
            }
            itemTemplate.dataFile = dataFile;

            // Update the template's resources
            itemTemplate.resources.push(
              storageName.folder + "/" + storageName.filename
            );
          }
          break;
        case "Notebook":
          notebook.convertNotebookToTemplate(itemTemplate);
          break;
        case "Oriented Imagery Catalog":
          templateModifyingPromise = oic.convertItemToTemplate(
            itemTemplate,
            destAuthentication,
            srcAuthentication
          );
          break;
        case "QuickCapture Project":
          // Save all of the resources that we've fetched so as to not fetch them again
          itemTemplate.resources = resourcesResponse;

          // Get the QC config
          templateModifyingPromise = new Promise(
            // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
            async (qcResolve) => {
              // Remove the qc.project.json file from the list of resources
              let qcProjectFile: File = null;
              let iQcProjectFile: number = -1;
              if (resourcesResponse) {
                resourcesResponse.some(
                  (file: File, i: number) => {
                    const haveConfigFile = file.name === "qc.project.json";
                    if (haveConfigFile) {
                      qcProjectFile = file;
                      iQcProjectFile = i;
                    }
                    return haveConfigFile;
                  }
                );

                // Discard the qc.project.json file
                if (iQcProjectFile >= 0) {
                  resourcesResponse.splice(iQcProjectFile, 1);
                }
              }

              // Copy the qc.project.json file into the data section
              if (qcProjectFile) {
                itemTemplate.data = {
                  application: {
                    ...await common.blobToJson(qcProjectFile),
                  },
                  name: "qc.project.json"
                }
              }

              // Save the basemap dependency
              if (itemTemplate.data.application?.basemap?.type === "Web Map") {
                itemTemplate.dependencies.push(itemTemplate.data.application.basemap.itemId);
              }

              // Create the template
              const updatedTemplate = quickcapture.convertQuickCaptureToTemplate(itemTemplate);
              qcResolve(updatedTemplate);
            }
          );
          break;
        case "Vector Tile Service":
        case "Web Map":
        case "Web Scene":
          templateModifyingPromise = webmap.convertItemToTemplate(
            itemTemplate,
            destAuthentication,
            srcAuthentication,
            templateDictionary
          );
          break;
        case "Web Mapping Application":
          if (itemDataResponse) {
            templateModifyingPromise = webmappingapplication.convertItemToTemplate(
              itemTemplate,
              destAuthentication,
              srcAuthentication,
              templateDictionary
            );
          }
          break;
        case "Workforce Project":
          templateModifyingPromise = workforce.convertItemToTemplate(
            itemTemplate,
            destAuthentication,
            srcAuthentication,
            templateDictionary
          );
          break;
      }

      templateModifyingPromise.then(
        resolve,
        err => reject(common.fail(err))
      );
    });
  });
}

/**
 * Extracts the feature layer ids for a Data Pipeline's sources and sinks.
 *
 * @param itemData Data Pipeline's data section
 * @return List of feature layer ids or an empty list if there are no sources or sinks in the pipeline
 */
export function _getDataPipelineSourcesAndSinks(
  itemData: any
): string[] {
  const dependencies = [] as string[];
  const sourcesAndSinks = (itemData?.inputs ?? []).concat(itemData?.outputs ?? []);

  sourcesAndSinks.forEach(
    sourceOrSink => {
      if (sourceOrSink.type === "FeatureServiceSource" || sourceOrSink.type === "FeatureServiceSink") {
        const featureServiceId = common.getProp(sourceOrSink, "parameters.layer.value.itemId")
        if (featureServiceId) {
          dependencies.push(featureServiceId);
        }
      }
    }
  );

  return dependencies;
}

/**
 * Encapsulates the rules for naming a form's data file.
 * Chooses the first parameter that's defined and is not the string "undefined".
 *
 * @param itemName Template's item name
 * @param dataFilename The data file name
 * @param itemIdAsName A name constructed from the template's id suffixed with ".zip"
 *
 * @return A name for the data file
 */
export function _getFormDataFilename(
  itemName: string,
  dataFilename: string,
  itemIdAsName: string
): string {
  const originalFilename = itemName || dataFilename;
  const filename =
    originalFilename && originalFilename !== "undefined"
      ? originalFilename
      : itemIdAsName;
  return filename;
}
