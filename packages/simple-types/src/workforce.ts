/*
 | Copyright 2019 Esri
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
  // Extract dependencies
  itemTemplate.dependencies = extractDependencies(itemTemplate);

  // templatize key properties
  return _templatize(itemTemplate);
}

export function extractDependencies(
  itemTemplate: common.IItemTemplate
): string[] {
  const deps: string[] = [];
  const data: any = itemTemplate.data;
  if (data) {
    const regEx: any = new RegExp("[0-9A-F]{32}", "gmi");
    // get the ids for the service dependencies
    // "workerWebMapId" and "dispatcherWebMapId" are already IDs and don't have a serviceItemId
    const keyProperties: string[] = [
      "workerWebMapId",
      "dispatcherWebMapId",
      "dispatchers",
      "assignments",
      "workers",
      "tracks"
    ];
    keyProperties.forEach(p => {
      if (common.getProp(data, p + ".serviceItemId")) {
        if (deps.indexOf(data[p].serviceItemId) === -1) {
          deps.push(data[p].serviceItemId);
        }
      } else if (/[0-9A-F]{32}/gim.test(data[p])) {
        if (deps.indexOf(data[p]) === -1) {
          deps.push(data[p]);
        }
      }
    });
  }
  return deps;
}

export function _templatize(
  itemTemplate: common.IItemTemplate
): common.IItemTemplate {
  const itemId: string = itemTemplate.itemId;
  if (itemTemplate.data) {
    const data: any = itemTemplate.data;

    // templatize properties with id and url
    let keyProperties: string[] = [
      "dispatchers",
      "assignments",
      "workers",
      "tracks"
    ];
    keyProperties.forEach(p => {
      if (common.getProp(data, p)) {
        const id: string = data[p].serviceItemId;
        data[p].serviceItemId = common.templatizeTerm(id, id, ".id");

        const layerId = data[p].url.substr(
          (data[p].url as string).lastIndexOf("/")
        );
        data[p].url = common.templatizeTerm(id, id, ".url") + layerId;
      }
    });

    // templatize simple id properties
    keyProperties = [
      "folderId",
      "groupId",
      "workerWebMapId",
      "dispatcherWebMapId"
    ];
    keyProperties.forEach(p => {
      if (common.getProp(data, p)) {
        data[p] = common.templatizeTerm(data[p], data[p], "." + p);
      }
    });

    // templatize app integrations
    const templatizeUrlTemplate = function(item: any) {
      let ids: string[];
      if (common.getProp(item, "urlTemplate")) {
        ids = item.urlTemplate.match(/itemID=[0-9A-F]{32}/gim) || [];
        ids.forEach(id => {
          id = id.replace("itemID=", "");
          item.urlTemplate = item.urlTemplate.replace(
            id,
            common.templatizeTerm(id, id, ".id")
          );
        });
      }
    };

    const integrations: any[] = data.assignmentIntegrations || [];
    integrations.forEach(i => {
      templatizeUrlTemplate(i);
      if (common.getProp(i, "assignmentTypes")) {
        const assignmentTypes: string[] = i.assignmentTypes || [];
        assignmentTypes.forEach((assignType: any) => {
          templatizeUrlTemplate(assignType);
        });
      }
    });
  }
  return itemTemplate;
}

export function createItemFromTemplate(
  template: common.IItemTemplate,
  newItemTemplate: common.IItemTemplate,
  templateDictionary: any,
  destinationUserSession: auth.UserSession
): Promise<void> {
  return new Promise<void>(resolve => {
    resolve();
  });
}

// ------------------------------------------------------------------------------------------------------------------ //
