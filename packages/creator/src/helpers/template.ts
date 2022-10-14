/** @license
 * Copyright 2022 Esri
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

import {
  IItemTemplate,
  ISourceFile
} from "@esri/solution-common";

/**
 * Extracts resource data files from templates.
 *
 * @param templates List of templates to examine
 *
 * @return List of resource data files found in supplied templates
 */
export function getDataFilesFromTemplates(
  templates: IItemTemplate[]
): ISourceFile[] {
  const resourceItemFiles: ISourceFile[] = [];

  templates.forEach(
    (template: IItemTemplate) => {
      if (template.dataFile) {
        resourceItemFiles.push(template.dataFile);
      }
    }
  );

  return resourceItemFiles;
}

/**
 * Removes data files from templates.
 *
 * @param templates List of templates to modify
 */
export function removeDataFilesFromTemplates(
  templates: IItemTemplate[]
): void {
  templates.forEach(
    (template: IItemTemplate) => {
      if (template.dataFile) {
        delete template.dataFile;
      }
    }
  );
}
