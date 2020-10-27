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

import { ISolutionItem, IItemTemplate, UserSession } from "../interfaces";
import { getProp, cloneObject, cleanItemId } from "../generalHelpers";

/**
 * Hub creates a Web Map dependency for Form templates
 * that contain map questions. This migration updates
 * any form's map questions to use the default basemap
 * and filters out related Web Map templates.
 *
 * @param {ISolutionItem} model A Solution model
 * @param {UserSession} authentication The user session info
 * @returns {ISolutionItem}
 * @private
 */
export function _upgradeTwoDotSix(
  model: ISolutionItem,
  authentication: UserSession
): ISolutionItem {
  if (getProp(model, "item.properties.schemaVersion") >= 2.6) {
    return model;
  } else {
    const clone: ISolutionItem = cloneObject(model);
    const formTemplates = clone.data.templates.filter(
      ({ type }) => type === "Form"
    );

    const toWebMapIds = (mapIds: string[], formTemplate: IItemTemplate) => {
      if (getProp(formTemplate, "properties.form.questions.length")) {
        formTemplate.properties.form.questions.forEach((question: any) => {
          if (question.maps) {
            question.maps.forEach((webMap: any) => {
              const webMapId = cleanItemId(webMap.itemId);

              // remove the web map dependency from the form template
              formTemplate.dependencies = formTemplate.dependencies.filter(
                dependency => dependency !== webMapId
              );

              // record the web map template id so we can remove them
              mapIds.push(webMapId);
            });
          }
        });
      }
      return mapIds;
    };
    const webMapIds: string[] = formTemplates.reduce(toWebMapIds, []);

    // remove the web map templates
    clone.data.templates = clone.data.templates.filter(
      template => !webMapIds.includes(template.itemId)
    );

    clone.item.properties.schemaVersion = 2.6;

    return clone;
  }
}
