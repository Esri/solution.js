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

import * as auth from "@esri/arcgis-rest-auth";
import * as common from "@esri/solution-common";

// ------------------------------------------------------------------------------------------------------------------ //

export function convertItemToTemplate(
  itemTemplate: common.IItemTemplate
): common.IItemTemplate {
  // Remove org base URL and app id, e.g.,
  //   http://anOrg.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc5992522d34a6b5ce80d17835eea21
  // to
  //   <PLACEHOLDER_SERVER_NAME>/apps/CrowdsourcePolling/index.html?appid={{<itemId>.id}}
  // Need to add placeholder server name because otherwise AGOL makes URL null
  if (itemTemplate.item.url) {
    const templatizedUrl = itemTemplate.item.url;
    const iSep = templatizedUrl.indexOf("//");
    itemTemplate.item.url =
      common.PLACEHOLDER_SERVER_NAME + // add placeholder server name
      templatizedUrl.substring(
        templatizedUrl.indexOf("/", iSep + 2),
        templatizedUrl.lastIndexOf("=") + 1
      ) +
      itemTemplate.item.id; // templatized id
  }

  // Set the folder
  if (common.getProp(itemTemplate, "data.folderId")) {
    itemTemplate.data.folderId = "{{folderId}}";
  }

  // Extract dependencies
  itemTemplate.dependencies = extractDependencies(itemTemplate);

  // Templatize dependencies in the data section
  itemTemplate.dependencies.forEach(path => {
    const propertyPath: string = itemTemplate.data[path] as string;
    itemTemplate.data[path] = common.templatizeTerm(
      propertyPath,
      propertyPath,
      ".id"
    );
  });

  // Set the map or group after we've extracted them as dependencies
  if (common.getProp(itemTemplate, "data.values.webmap")) {
    itemTemplate.data.values.webmap = common.templatizeTerm(
      itemTemplate.data.values.webmap,
      itemTemplate.data.values.webmap,
      ".id"
    );
  } else if (common.getProp(itemTemplate, "data.values.group")) {
    itemTemplate.data.values.group = common.templatizeTerm(
      itemTemplate.data.values.group,
      itemTemplate.data.values.group,
      ".id"
    );
  }

  return itemTemplate;
}

export function createItemFromTemplate(
  template: common.IItemTemplate,
  templateDictionary: any,
  destinationUserSession: auth.UserSession
): Promise<void> {
  return new Promise<void>(resolve => {
    // If this is a Web AppBuilder application, we will create a Code Attachment for downloading
    if (template.item.typeKeywords.indexOf("Web AppBuilder") >= 0) {
      console.log("createItemFromTemplate for a Code Attachment");
      common
        .createItemWithData(
          {
            tags: template.item.tags,
            title: template.item.title,
            type: "Code Attachment",
            typeKeywords: ["Code", "Javascript", "Web Mapping Application"],
            url:
              common.replaceInTemplate(
                common.PLACEHOLDER_SERVER_NAME,
                templateDictionary
              ) +
              "/sharing/rest/content/items/" +
              template.itemId +
              "/package"
          },
          {},
          { authentication: destinationUserSession },
          templateDictionary.folderId
        )
        .then(() => resolve(), () => resolve());
    } else {
      // Otherwise, nothing extra needed
      resolve();
    }
  });
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Gets the ids of the dependencies of an AGOL webapp item.
 *
 * @param fullItem A webapp item whose dependencies are sought
 * @return A promise that will resolve with list of dependent ids
 * @protected
 */
function extractDependencies(model: any): string[] {
  let processor = getGenericWebAppDependencies;

  /*
  if (common.hasTypeKeyword(model, "Story Map")) {
    processor = getStoryMapDependencies;
  }
  */

  if (common.hasAnyKeyword(model, ["WAB2D", "WAB3D", "Web AppBuilder"])) {
    processor = getWABDependencies;
  }

  return processor(model);
}

/**
 * Generic Web App Dependencies
 */
function getGenericWebAppDependencies(model: any): string[] {
  const props = ["data.values.webmap", "data.values.group"];
  return common.getProps(model, props);
}

/**
 * Return a list of items this site depends on
 */
export function getWABDependencies(model: any): string[] {
  const deps = [];
  const v = common.getProp(model, "data.map.itemId");
  if (v) {
    deps.push(v);
  }
  return deps;
}
