/** @license
 * Copyright 2024 Esri
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

import { IItemTemplate } from "./interfaces";
import { globalStringReplace } from "./generalHelpers";

/**
 * Store any web tool urls in the templateDictionary so we can use them to search other items
 * after they have been converted to templates
 *
 * @param template the current template
 * @param templateDictionary Hash of facts: folder id, org URL, adlib replacements
 *
 */
export function preProcessWebTool(template: IItemTemplate, templateDictionary: any): void {
  if (template.type === "Geoprocessing Service") {
    const url = template.item.origUrl;
    const urlVar = `{{${template.itemId}.url}}`;
    templateDictionary[url] = urlVar;
  }
}

/**
 * Use any stored GPServer urls to search all other templates for potential references
 * This will allow us to replace the base server name as will as the itemId
 *
 * @param templates the list of all the templates in the solution
 * @param templateDictionary Hash of facts: folder id, org URL, adlib replacements
 *
 * @returns potentially updated list of all the templates in the solution
 */
export function postProcessWebToolReferences(templates: IItemTemplate[], templateDictionary: any): IItemTemplate[] {
  const gpServerUrls = Object.keys(templateDictionary).filter((k) => k.indexOf("GPServer") > -1);

  if (gpServerUrls.length > 0) {
    gpServerUrls.forEach((url) => {
      const itemId = templateDictionary[url].replace("{{", "").replace(".url}}", "");

      _globalTemplatize(templates, url, templateDictionary[url], itemId);

      // handle items that already have a templatized itemId in the url
      const idTest: RegExp = /[0-9A-F]{32}/gim;
      const templatizedUrl = url.replace(idTest, `{{${itemId}.itemId}}`);
      _globalTemplatize(templates, templatizedUrl, templateDictionary[url], itemId);
    });
  }
  return templates;
}

/**
 * Use any stored GPServer urls to search all other templates for potential references
 * This will allow us to replace the base server name as will as the itemId
 *
 * @param templates the list of all the templates in the solution
 * @param orgUrl the item url of the GPServer
 * @param templatizedUrl the templatized GPServer Url
 * @param orgItemId the item id of the GPServer
 *
 * @returns potentially updated list of all the templates in the solution
 */
export function _globalTemplatize(
  templates: IItemTemplate[],
  orgUrl: string,
  templatizedUrl: string,
  orgItemId: string,
): IItemTemplate[] {
  // Cycle through each of the items in the template and scan the `item` and `data` sections of each for replacements
  templates.forEach((template: IItemTemplate) => {
    const itemString = JSON.stringify(template.item);
    const dataString = JSON.stringify(template.data);

    globalStringReplace(template.item, new RegExp(orgUrl, "gi"), templatizedUrl);
    globalStringReplace(template.data, new RegExp(orgUrl, "gi"), templatizedUrl);

    _updateDependencies(template, itemString, dataString, orgItemId);
  });
  return templates;
}

/**
 * Update the templates dependencies if we can detect differences after we try and replace a GPServer url
 *
 * @param template the current template
 * @param itemString stringified version of the the templates item before we replaced anything
 * @param dataString stringified version of the the templates data before we replaced anything
 * @param id the current item Id of the GPServer
 *
 */
export function _updateDependencies(template: IItemTemplate, itemString: string, dataString: string, id: string): void {
  const hasItemDepdendency = template.dependencies.indexOf(id) > -1;

  if (itemString && itemString !== JSON.stringify(template.item) && !hasItemDepdendency) {
    template.dependencies.push(id);
  }

  if (dataString && dataString !== JSON.stringify(template.data) && !hasItemDepdendency) {
    template.dependencies.push(id);
  }
}
