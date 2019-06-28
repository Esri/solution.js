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

import * as common from "@esri/solution-common";

export function convertItemToTemplate(
  itemTemplate: common.IItemTemplate
): common.IItemTemplate {
  // Key properties that contain item IDs for the workforce project type
  const keyProperties: string[] = [
    "groupId",
    "workerWebMapId",
    "dispatcherWebMapId",
    "dispatchers",
    "assignments",
    "workers",
    "tracks"
  ];

  // The templates data to process
  const data: any = itemTemplate.data;

  if (data) {
    // Extract dependencies
    itemTemplate.dependencies = extractDependencies(data, keyProperties);

    // templatize key properties
    itemTemplate.data = _templatize(data, keyProperties);
  }

  return itemTemplate;
}

export function extractDependencies(
  data: any,
  keyProperties: string[]
): string[] {
  const deps: string[] = [];
  // get the ids for the service dependencies
  // "workerWebMapId" and "dispatcherWebMapId" are already IDs and don't have a serviceItemId
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
  return deps;
}

export function _templatize(
  data: any,
  keyProperties: string[]
): common.IItemTemplate {
  keyProperties.forEach(p => {
    if (common.getProp(data, p)) {
      if (common.getProp(data[p], "serviceItemId")) {
        // templatize properties with id and url
        const id: string = data[p].serviceItemId;
        data[p].serviceItemId = common.templatizeTerm(id, id, ".id");

        if (common.getProp(data[p], "url")) {
          const layerId = data[p].url.substr(
            (data[p].url as string).lastIndexOf("/")
          );
          data[p].url = common.templatizeTerm(id, id, ".url") + layerId;
        }
      } else {
        // templatize simple id properties
        data[p] = common.templatizeTerm(data[p], data[p], ".id");
      }
    }
  });

  data["folderId"] = "{{folderId}}";

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
  return data;
}
