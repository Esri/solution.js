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

import * as common from "@esri/solution-common";

// ------------------------------------------------------------------------------------------------------------------ //

export function convertItemToTemplate(
  itemTemplate: common.IItemTemplate
): common.IItemTemplate {
  // Extract dependencies

  return itemTemplate;
}

export function getFormInfoFiles(
  itemId: string,
  authentication: common.UserSession
): Promise<File[]> {
  return Promise.all(
    common.getInfoFiles(
      itemId,
      ["form.json", "forminfo.json", "form.webform"],
      authentication
    )
  ).then(results => results.filter(result => !!result));
}
