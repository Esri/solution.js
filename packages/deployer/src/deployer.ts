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
 * Manages the deployment of a Solution.
 *
 * @module deployer
 */

import * as common from "@esri/solution-common";
import * as deployItems from "./deploySolutionItems";

//#region Entry point ----------------------------------------------------------------------------------------------- //

export function deploySolution(
  templateSolutionId: string,
  authentication: common.UserSession,
  options?: common.IDeploySolutionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const deployOptions: common.IDeploySolutionOptions = options || {};
    /* istanbul ignore else */
    if (deployOptions.progressCallback) {
      deployOptions.progressCallback(1); // let the caller know that we've started
    }

    // Fetch solution item's info
    Promise.all([
      common.getItemBase(templateSolutionId, authentication),
      common.getItemDataAsJson(templateSolutionId, authentication)
    ]).then(
      responses => {
        const [itemBase, itemData] = responses;

        if (
          itemBase.type !== "Solution" ||
          itemBase.typeKeywords.indexOf("Solution") < 0 ||
          itemBase.typeKeywords.indexOf("Template") < 0
        ) {
          reject(
            common.fail(templateSolutionId + " is not a Solution Template")
          );
        } else {
          deployOptions.title = deployOptions.title ?? itemBase.title;
          deployOptions.snippet = deployOptions.snippet ?? itemBase.snippet;
          deployOptions.description =
            deployOptions.description ?? itemBase.description;
          deployOptions.tags = deployOptions.tags ?? itemBase.tags;
          deployOptions.thumbnailUrl = common.getItemThumbnailUrl(
            templateSolutionId,
            itemBase.thumbnail,
            false,
            authentication
          );

          common.deleteItemProps(itemBase);

          _deploySolutionFromTemplate(
            templateSolutionId,
            itemBase,
            itemData,
            authentication,
            deployOptions
          ).then(
            createdSolutionId => {
              /* istanbul ignore else */
              if (deployOptions.progressCallback) {
                deployOptions.progressCallback(100); // we're done
              }
              resolve(createdSolutionId);
            },
            error => {
              // Error deploying solution
              /* istanbul ignore else */
              if (deployOptions.progressCallback) {
                deployOptions.progressCallback(1);
              }
              reject(error);
            }
          );
        }
      },
      error => {
        // Error fetching solution
        /* istanbul ignore else */
        if (deployOptions.progressCallback) {
          deployOptions.progressCallback(1);
        }
        reject(error);
      }
    );
  });
}

//#endregion ---------------------------------------------------------------------------------------------------------//

//#region Supporting routines --------------------------------------------------------------------------------------- //

export function _deploySolutionFromTemplate(
  templateSolutionId: string,
  solutionTemplateBase: any,
  solutionTemplateData: any,
  authentication: common.UserSession,
  options: common.IDeploySolutionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Replacement dictionary and high-level deployment ids for cleanup
    const templateDictionary = options.templateDictionary ?? {};
    let deployedFolderId: string;
    let deployedSolutionId: string;

    // Get information about deployment environment
    Promise.all([
      common.getPortal("", authentication), // determine if we are deploying to portal
      common.getUser(authentication), // find out about the user
      common.getFoldersAndGroups(authentication) // get all folders so that we can create a unique one, and all groups
    ])
      .then(responses => {
        const [
          portalResponse,
          userResponse,
          foldersAndGroupsResponse
        ] = responses;

        // Initialize replacement dictionary
        // swap user defined params before we start...no need to wait
        if (solutionTemplateData.params) {
          templateDictionary.params = solutionTemplateData.params;
          solutionTemplateData.templates = solutionTemplateData.templates.map(
            (template: any) => {
              return common.replaceInTemplate(template, templateDictionary);
            }
          );
        }

        // update template items with source-itemId type keyword
        solutionTemplateData.templates = solutionTemplateData.templates.map(
          (template: any) => {
            const sourceId: string = "source-" + template.itemId;
            /* istanbul ignore else */
            if (template.item) {
              /* istanbul ignore else */
              if (template.item!.typeKeywords) {
                template.item!.typeKeywords!.push(sourceId);
              }
              /* istanbul ignore else */
              if (
                template.item!.tags &&
                common.getProp(template, "item.type") === "Group"
              ) {
                template.item!.tags!.push(sourceId);
              }
            }
            return template;
          }
        );

        templateDictionary.isPortal = portalResponse.isPortal;
        templateDictionary.organization = Object.assign(
          templateDictionary.organization || {},
          portalResponse
        );

        // As of Spring 2020, only HTTPS (see
        // https://www.esri.com/arcgis-blog/products/product/administration/2019-arcgis-transport-security-improvements/)
        const scheme: string = "https"; // portalResponse.allSSL ? "https" : "http";
        const urlKey: string = common.getProp(portalResponse, "urlKey");
        const customBaseUrl: string = common.getProp(
          portalResponse,
          "customBaseUrl"
        );
        templateDictionary.portalBaseUrl =
          urlKey && customBaseUrl
            ? `${scheme}://${urlKey}.${customBaseUrl}`
            : authentication.portal;

        templateDictionary.user = userResponse;
        templateDictionary.user.folders = foldersAndGroupsResponse.folders;
        templateDictionary.user.groups = foldersAndGroupsResponse.groups;

        // Create a folder to hold the deployed solution. We use the solution name, appending a sequential
        // suffix if the folder exists, e.g.,
        //  * Manage Right of Way Activities
        //  * Manage Right of Way Activities 1
        //  * Manage Right of Way Activities 2
        const folderPromise = common.createUniqueFolder(
          solutionTemplateBase.title,
          templateDictionary,
          authentication
        );

        // Apply the portal extents to the solution
        const portalExtent: any = portalResponse.defaultExtent;
        const extentsPromise = common.convertExtent(
          portalExtent,
          { wkid: 4326 },
          portalResponse.helperServices.geometry.url,
          authentication
        );

        // Await completion of async actions: folder creation & extents conversion
        return Promise.all([folderPromise, extentsPromise]);
      })
      .then(responses => {
        const [folderResponse, wgs84Extent] = responses;
        deployedFolderId = folderResponse.folder.id;
        templateDictionary.folderId = deployedFolderId;
        templateDictionary.solutionItemExtent =
          wgs84Extent.xmin +
          "," +
          wgs84Extent.ymin +
          "," +
          wgs84Extent.xmax +
          "," +
          wgs84Extent.ymax;

        // Create a deployed Solution item
        const createSolutionItemBase = {
          ...solutionTemplateBase,
          type: "Solution",
          typeKeywords: ["Solution"]
        };

        return common.createItemWithData(
          createSolutionItemBase,
          {},
          authentication,
          deployedFolderId
        );
      })
      .then(createSolutionResponse => {
        deployedSolutionId = createSolutionResponse.id;

        templateDictionary.solutionItemId = deployedSolutionId;
        solutionTemplateBase.id = deployedSolutionId;
        solutionTemplateBase.thumbnailUrl = options.thumbnailUrl;
        solutionTemplateBase.tryitUrl = _checkedReplaceAll(
          solutionTemplateBase.tryitUrl,
          templateSolutionId,
          deployedSolutionId
        );
        solutionTemplateBase.url = _checkedReplaceAll(
          solutionTemplateBase.url,
          templateSolutionId,
          deployedSolutionId
        );

        // Handle the contained item templates
        return deployItems.deploySolutionItems(
          authentication.portal,
          templateSolutionId,
          solutionTemplateData.templates,
          authentication,
          templateDictionary,
          authentication,
          options
        );
      })
      .then(clonedSolutionsResponse => {
        solutionTemplateData.templates = solutionTemplateData.templates.map(
          (itemTemplate: common.IItemTemplate) => {
            // Update ids present in template dictionary
            const itemId = common.getProp(
              templateDictionary,
              itemTemplate.itemId + ".itemId"
            );
            /* istanbul ignore else */
            if (itemId) {
              itemTemplate.itemId = itemId;
            }
            itemTemplate.dependencies = itemTemplate.dependencies.map(id =>
              _getNewItemId(id, templateDictionary)
            );
            return itemTemplate;
          }
        );

        return deployItems.postProcessDependencies(
          solutionTemplateData.templates,
          clonedSolutionsResponse,
          authentication,
          templateDictionary
        );
      })
      .then(() => {
        // Update solution item using internal representation & and the updated data JSON
        solutionTemplateBase.typeKeywords = ["Solution", "Deployed"];

        solutionTemplateData.templates = solutionTemplateData.templates.map(
          (itemTemplate: common.IItemTemplate) =>
            _purgeTemplateProperties(itemTemplate)
        );

        solutionTemplateData.templates = _updateGroupReferences(
          solutionTemplateData.templates,
          templateDictionary
        );

        // Update solution items data using template dictionary, and then update the
        // itemId & dependencies in each item template
        solutionTemplateBase.data = common.replaceInTemplate(
          solutionTemplateData,
          templateDictionary
        );

        return common.updateItem(
          solutionTemplateBase,
          authentication,
          deployedFolderId
        );
      })
      .then(
        () => resolve(solutionTemplateBase.id),
        error => {
          // Cleanup solution folder and deployed solution item
          const cleanupPromises = [] as Array<Promise<any>>;
          if (deployedFolderId) {
            cleanupPromises.push(
              common.removeFolder(deployedFolderId, authentication)
            );
          }
          if (deployedSolutionId) {
            cleanupPromises.push(
              common.removeItem(deployedSolutionId, authentication)
            );
          }
          Promise.all(cleanupPromises).then(
            () => reject(error),
            () => reject(error)
          );
        }
      );
  });
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Returns a match of a supplied id with the suffix ".itemId" in the template dictionary.
 *
 * @param id Id to look for
 * @param templateDictionary Hash mapping property names to replacement values
 * @return Match in template dictionary or original id
 */
export function _getNewItemId(id: string, templateDictionary: any): string {
  return common.getProp(templateDictionary, id + ".itemId") ?? id;
}

export function _checkedReplaceAll(
  template: string,
  oldValue: string,
  newValue: string
): string {
  let newTemplate;
  if (template && template.indexOf(oldValue) > -1) {
    const re = new RegExp(oldValue, "g");
    newTemplate = template.replace(re, newValue);
  } else {
    newTemplate = template;
  }
  return newTemplate;
}

export function _purgeTemplateProperties(itemTemplate: any): any {
  const retainProps: string[] = ["itemId", "type", "dependencies", "groups"];
  const deleteProps: string[] = Object.keys(itemTemplate).filter(
    k => retainProps.indexOf(k) < 0
  );
  common.deleteProps(itemTemplate, deleteProps);
  return itemTemplate;
}

export function _updateGroupReferences(
  itemTemplates: any[],
  templateDictionary: any
): any[] {
  const groupIds = itemTemplates.reduce(
    (result: string[], t: common.IItemTemplate) => {
      if (t.type === "Group") {
        result.push(t.itemId);
      }
      return result;
    },
    []
  );

  Object.keys(templateDictionary).forEach(k => {
    const newId: string = templateDictionary[k].itemId;
    if (groupIds.indexOf(newId) > -1) {
      itemTemplates.forEach(t => {
        t.groups = t.groups.map((id: string) => (id === k ? newId : k));
      });
    }
  });
  return itemTemplates;
}

//#endregion ---------------------------------------------------------------------------------------------------------//
