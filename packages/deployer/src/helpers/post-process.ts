/** @license
 * Copyright 2020 Esri
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
  UserSession,
  IItemTemplate,
  ICreateItemFromTemplateResponse,
  getTemplateById
} from "@esri/solution-common";
import { addItemRelationship } from "@esri/arcgis-rest-portal";
import { moduleMap } from "../module-map";
import { shareTemplatesToGroups } from "./share-templates-to-groups";

/**
 * Delegate post-processing to the type specific
 * processors. This allows each type to have fine-grained
 * control over what they do. Common post-processing is
 * exposed as functions that can be imported
 *
 * @param deployedSolutionId
 * @param templates
 * @param clonedSolutions
 * @param authentication
 * @param templateDictionary
 */
export function postProcess(
  deployedSolutionId: string,
  templates: IItemTemplate[],
  clonedSolutions: ICreateItemFromTemplateResponse[],
  authentication: UserSession,
  templateDictionary: any
): Promise<any> {
  // connect the solution with its items; groups cannot be connected
  const relationshipPromises = clonedSolutions
    .filter(entry => entry.type !== "Group")
    .map(
      entry =>
        addItemRelationship({
          originItemId: deployedSolutionId,
          destinationItemId: entry.id,
          relationshipType: "Solution2Item",
          authentication: authentication
        } as any) // TODO: remove `as any`, which is here until arcgis-rest-js' ItemRelationshipType defn catches up
    );

  // delegate sharing to groups
  const sharePromises = shareTemplatesToGroups(
    templates,
    templateDictionary,
    authentication
  );

  // what needs post processing?
  const itemsToProcess = clonedSolutions.filter(entry => entry.postProcess);

  // map over these items
  const postProcessPromises = itemsToProcess.reduce((acc, entry) => {
    const itemHandler: any = moduleMap[entry.type];
    // only delegate if the handler has a postProcess method
    if (itemHandler && itemHandler.postProcess) {
      acc.push(
        itemHandler.postProcess(
          entry.id,
          entry.type,
          clonedSolutions,
          getTemplateById(templates, entry.id),
          templates,
          templateDictionary,
          authentication
        )
      );
    }
    return acc;
  }, []);

  return Promise.all(
    [sharePromises].concat(postProcessPromises, relationshipPromises)
  );
}
