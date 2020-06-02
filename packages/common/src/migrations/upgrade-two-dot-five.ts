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

import { ISolutionItem } from "../interfaces";
import { getProp, cloneObject, deleteProp } from "@esri/hub-common";

/**
 * Applies Survey123 Form Config Schema migrations.
 * @param {ISolutionItem} model A Solution model
 * @returns {ISolutionItem}
 */
export function _upgradeTwoDotFive(model: ISolutionItem): ISolutionItem {
  if (getProp(model, "item.properties.schemaVersion") >= 2.5) {
    return model;
  } else {
    const clone = cloneObject(model);

    clone.data.templates.forEach(template => {
      if (template.type === "Form") {
        if (getProp(template, "properties.form.portalUrl")) {
          template.properties.form.portalUrl = "{{portalBaseUrl}}";
        }

        const ver = parseFloat(
          getProp(template, "properties.form.version") || "2.5"
        );
        const hasFormSchema = getProp(template, "properties.form");
        if (!hasFormSchema || ver >= 3.8) {
          return template;
        }

        template.properties.form.layerName = "survey";
        // nest the theme into themes
        if (getProp(template, "properties.form.theme")) {
          template.properties.form.themes = [template.properties.form.theme];
          delete template.properties.form.theme;
        }
        // replace whatever layout on all questions with vertical
        template.properties.form.questions.forEach((q: any) => {
          if (q.appearance && q.appearance.layout) {
            q.appearance.layout = "vertical";
          }
        });
        template.properties.form.version = 3.8;
      }
    });

    // update the schema version
    clone.item.properties.schemaVersion = 2.5;
    return clone;
  }
}
