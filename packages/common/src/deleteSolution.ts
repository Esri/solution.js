/** @license
 * Copyright 2021 Esri
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

/**
 * Provides a function for deleting a deployed Solution item and all of the items that were created
 * as part of that deployment.
 *
 * @module deleteSolution
 */

import {
  IDeleteSolutionOptions,
  IItemTemplate,
  ISolutionItemPrecis,
  ISolutionPrecis,
  UserSession
} from "./interfaces";
import * as deleteSolutionContents from "./deleteHelpers/deleteSolutionContents";
import * as getDeletableSolutionInfo from "./getDeletableSolutionInfo";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Deletes a deployed Solution item and and all of the items that were created
 * as part of that deployment.
 *
 * @param solutionItemId Id of a deployed Solution
 * @param authentication Credentials for the request
 * @param options Progress reporting options
 * @returns Promise that will resolve with a list of two solution summaries: successful deletions
 * and failed deletions. Ignored items (e.g., already deleted) and items shared with more than
 * one Solution will not be in either list.
 * Note that Solution item and its deployment folder will only be deleted if all of its deployed
 * items were deleted (the failure list is empty). This makes it possible to re-attempted
 * deletion using the solutionItemId.
 */
export function deleteSolution(
  solutionItemId: string,
  authentication: UserSession,
  options?: IDeleteSolutionOptions
): Promise<ISolutionPrecis[]> {
  return getDeletableSolutionInfo
    .getDeletableSolutionInfo(solutionItemId, authentication)
    .then((solutionSummary: ISolutionPrecis) => {
      return deleteSolutionContents.deleteSolutionContents(
        solutionItemId,
        solutionSummary,
        authentication,
        options
      );
    })
    .catch(() => {
      return [undefined, undefined];
    });
}

/**
 * Deletes a deployed Solution item and and all of the items that were created
 * as part of that deployment.
 *
 * @param solutionItemId Id of a deployed Solution
 * @param itemIds Item ids to delete; this list is reversed in this function
 * @param templates List of Solution's templates
 * @param templateDictionary Hash of facts: folder id, org URL, adlib replacements
 * @param authentication Credentials for the request
 * @param options Progress reporting options
 * @returns Promise that will resolve with a list of two solution summaries: successful deletions
 * and failed deletions. Ignored items (e.g., already deleted) and items shared with more than
 * one Solution will not be in either list.
 * Note that Solution item and its deployment folder will only be deleted if all of its deployed
 * items were deleted (the failure list is empty). This makes it possible to re-attempted
 * deletion using the solutionItemId.
 */
export function deleteSolutionByComponents(
  solutionItemId: string,
  itemIds: string[],
  templates: IItemTemplate[],
  templateDictionary: any,
  authentication: UserSession,
  options?: IDeleteSolutionOptions
): Promise<ISolutionPrecis[]> {
  // Construct a description of the solution from its id and the itemIds using the templateDictionary to fill in details
  const solutionSummary: ISolutionPrecis = {
    id: solutionItemId,
    title: "",
    folder: templateDictionary.folderId,
    items: [] as ISolutionItemPrecis[],
    groups: [] as string[]
  };

  // Combine the templates and templateDictionary to create summary items
  let summaries = templates
    .map(template => {
      return {
        id: template.itemId,
        type: template.type,
        title: template.item.title,
        modified: 0,
        owner: ""
      } as ISolutionItemPrecis;
    })
    .map(summary => {
      summary.id = templateDictionary[summary.id].itemId;
      return summary;
    })
    .filter(summary => !!summary.id);

  // Filter to only include items in itemIds
  summaries = summaries.filter(summary => itemIds.includes(summary.id));

  // Sort into the order of itemIds (last created is first deleted)
  summaries.sort(
    (summary1, summary2) =>
      itemIds.indexOf(summary1.id) - itemIds.indexOf(summary2.id)
  );

  // Partition into items and groups
  summaries.forEach(summary => {
    if (summary.type === "Group") {
      solutionSummary.groups.push(summary.id);
    } else {
      solutionSummary.items.push(summary);
    }
  });

  // Delete the solution
  return deleteSolutionContents.deleteSolutionContents(
    solutionItemId,
    solutionSummary,
    authentication,
    options
  );
}
