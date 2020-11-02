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
import * as deployItems from "./deploySolutionItems";
import { getProp, getWithDefault } from "@esri/hub-common";
import { postProcess } from "./helpers/post-process";
import { UserSession } from "@esri/arcgis-rest-auth";

// NOTE: Moved to separate file to allow stubbing in main deploySolution tests

export function deploySolutionFromTemplate(
  templateSolutionId: string,
  solutionTemplateBase: any,
  solutionTemplateData: any,
  solutionTemplateMetadata: File,
  authentication: common.UserSession,
  options: common.IDeploySolutionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Replacement dictionary and high-level deployment ids for cleanup

    // TODO: Extract all templateDictionary prep into a separate function
    const templateDictionary = options.templateDictionary ?? {};
    let deployedFolderId: string;
    let deployedSolutionId: string;

    ["title", "snippet", "description", "tags", "thumbnailurl"].forEach(
      property => {
        if (options[property]) {
          solutionTemplateBase[property] = options[property];
          // carry these options forward on the templateDict
          templateDictionary[property] = options[property];
        }
      }
    );

    if (options.additionalTypeKeywords) {
      solutionTemplateBase.typeKeywords = [].concat(
        solutionTemplateBase.typeKeywords,
        options.additionalTypeKeywords
      );
    }

    _replaceParamVariables(solutionTemplateData, templateDictionary);

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
        // TODO: Add more computed properties here
        // portal: portalResponse
        // orgextent as bbox for assignment onto items
        // more info in #266 https://github.com/Esri/solution.js/issues/266

        templateDictionary.portalBaseUrl = _getPortalBaseUrl(
          portalResponse,
          authentication
        );

        templateDictionary.user = userResponse;
        templateDictionary.user.folders = foldersAndGroupsResponse.folders;
        templateDictionary.user.groups = foldersAndGroupsResponse.groups.filter(
          (group: common.IGroup) =>
            group.owner === templateDictionary.user.username
        );

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
        const extentsPromise = common.convertExtentWithFallback(
          portalExtent,
          undefined,
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
        // Hub Solutions depend on organization defaultExtentBBox as a nested array not a string
        templateDictionary.organization.defaultExtentBBox = [
          [wgs84Extent.xmin, wgs84Extent.ymin],
          [wgs84Extent.xmax, wgs84Extent.ymax]
        ];
        // Create a deployed Solution item
        const createSolutionItemBase = {
          ...common.sanitizeJSONAndReportChanges(solutionTemplateBase),
          type: "Solution",
          typeKeywords: ["Solution"]
        };

        if (options.additionalTypeKeywords) {
          createSolutionItemBase.typeKeywords = ["Solution"].concat(
            options.additionalTypeKeywords
          );
        }

        return common.createItemWithData(
          createSolutionItemBase,
          {},
          authentication,
          deployedFolderId
        );
      })
      .then(createSolutionResponse => {
        deployedSolutionId = createSolutionResponse.id;
        // TODO: Attach the whole solution model so we can
        // have stuff like `{{solution.item.title}}
        templateDictionary.solutionItemId = deployedSolutionId;
        solutionTemplateBase.id = deployedSolutionId;

        return options.thumbnailurl
          ? common.addTokenToUrl(options.thumbnailurl, authentication)
          : Promise.resolve(null);
      })
      .then(updatedThumbnailUrl => {
        /* istanbul ignore else */
        if (updatedThumbnailUrl) {
          solutionTemplateBase.thumbnailurl = common.appendQueryParam(
            updatedThumbnailUrl,
            "w=400"
          );
        }

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

        // It is possible to provide a separate authentication for the source
        const storageAuthentication: UserSession = options.storageAuthentication
          ? options.storageAuthentication
          : authentication;

        // Handle the contained item templates
        return deployItems.deploySolutionItems(
          storageAuthentication.portal,
          templateSolutionId,
          solutionTemplateData.templates,
          storageAuthentication,
          templateDictionary,
          authentication,
          options
        );
      })
      .then(
        (clonedSolutionsResponse: common.ICreateItemFromTemplateResponse[]) => {
          // TODO: if deploySolutionItems returned what was pushed into the templateDictionary
          // we could add that at this point vs mutating
          // why is this a reassignment?
          solutionTemplateData.templates = solutionTemplateData.templates.map(
            (itemTemplate: common.IItemTemplate) => {
              // Update ids present in template dictionary
              const itemId = getProp(
                templateDictionary,
                `${itemTemplate.itemId}.itemId`
              );
              // why a guard? can this ever be false? what happens if so?
              // why are we updating this same property vs adding a new one? seems confusing
              /* istanbul ignore else */
              if (itemId) {
                itemTemplate.originalItemId = itemTemplate.itemId;
                itemTemplate.itemId = itemId;
              }
              // update the dependencies hash to point to the new item ids
              itemTemplate.dependencies = itemTemplate.dependencies.map(id =>
                getWithDefault(templateDictionary, `${id}.itemId`, id)
              );
              return itemTemplate;
            }
          );
          return postProcess(
            solutionTemplateData.templates,
            clonedSolutionsResponse,
            authentication,
            templateDictionary
          );
        }
      )
      .then(() => {
        // Update solution item using internal representation & and the updated data JSON
        solutionTemplateBase.typeKeywords = [].concat(
          solutionTemplateBase.typeKeywords,
          ["Deployed"]
        );
        const iTemplateKeyword = solutionTemplateBase.typeKeywords.indexOf(
          "Template"
        );
        /* istanbul ignore else */
        if (iTemplateKeyword >= 0) {
          solutionTemplateBase.typeKeywords.splice(iTemplateKeyword, 1);
        }

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

        // Write any user defined params to the solution
        /* istanbul ignore else */
        if (templateDictionary.params) {
          solutionTemplateBase.data.params = templateDictionary.params;
        }

        // Pass metadata in via params because item property is serialized, which discards a File
        const additionalParams: any = {};
        /* istanbul ignore else */
        if (solutionTemplateMetadata) {
          additionalParams.metadata = solutionTemplateMetadata;
        }
        return common.updateItem(
          solutionTemplateBase,
          authentication,
          deployedFolderId,
          additionalParams
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

export function _replaceParamVariables(
  solutionTemplateData: any,
  templateDictionary: any
): void {
  // a custom params object can be passed in with the options to deploy a solution
  // in most cases we can defer to the item type handlers to use these values
  // for variable replacement
  // for spatial reference specifically we need to replace up front so the default extent
  // logic can execute as expected
  solutionTemplateData.templates = solutionTemplateData.templates.map(
    (template: common.IItemTemplate) => {
      // can't do this as it causes other values that don't exist in the dict yet to revert to defaults they may have defined
      // return common.replaceInTemplate(template, templateDictionary);
      /* istanbul ignore else */
      if (template.type === "Feature Service") {
        const paramsLookup: string = "params.";

        const wkidItemPath: string = "item.spatialReference.wkid";
        template = _updateProp(
          template,
          wkidItemPath,
          paramsLookup,
          templateDictionary
        );

        const wkidServicePath: string =
          "properties.service.spatialReference.wkid";
        template = _updateProp(
          template,
          wkidServicePath,
          paramsLookup,
          templateDictionary
        );
      }
      return template;
    }
  );
}

export function _updateProp(
  template: common.IItemTemplate,
  path: string,
  lookup: string,
  templateDictionary: any
): common.IItemTemplate {
  const wkid: any = common.getProp(template, path);
  /* istanbul ignore else */
  if (wkid && typeof wkid === "string" && wkid.indexOf(lookup) > -1) {
    common.setProp(
      template,
      path,
      common.replaceInTemplate(wkid, templateDictionary)
    );
  }
  return template;
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

export function _getPortalBaseUrl(
  portalResponse: common.IPortal,
  authentication: common.UserSession
): string {
  // As of Spring 2020, only HTTPS (see
  // https://www.esri.com/arcgis-blog/products/product/administration/2019-arcgis-transport-security-improvements/)
  const scheme: string = "https"; // portalResponse.allSSL ? "https" : "http";
  const urlKey: string = common.getProp(portalResponse, "urlKey");
  const customBaseUrl: string = common.getProp(portalResponse, "customBaseUrl");
  const enterpriseBaseUrl = common.getProp(portalResponse, "portalHostname");

  return urlKey && customBaseUrl
    ? `${scheme}://${urlKey}.${customBaseUrl}`
    : enterpriseBaseUrl
    ? `${scheme}://${enterpriseBaseUrl}`
    : authentication.portal.replace("/sharing/rest", "");
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
        t.groups = t.groups.map((id: string) => (id === k ? newId : id));
      });
    }
  });
  return itemTemplates;
}

export function _purgeTemplateProperties(itemTemplate: any): any {
  const retainProps: string[] = ["itemId", "type", "dependencies", "groups"];
  const deleteProps: string[] = Object.keys(itemTemplate).filter(
    k => retainProps.indexOf(k) < 0
  );
  common.deleteProps(itemTemplate, deleteProps);
  return itemTemplate;
}

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
