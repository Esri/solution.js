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
  EItemProgressStatus,
  IDeleteSolutionOptions,
  ISolutionPrecis,
  IStatusResponse,
  UserSession
} from "./interfaces";
import * as deleteEmptyGroups from "./deleteHelpers/deleteEmptyGroups";
import * as deleteSolutionFolder from "./deleteHelpers/deleteSolutionFolder";
import * as deleteSolutionItem from "./deleteHelpers/deleteSolutionItem";
import * as removeItems from "./deleteHelpers/removeItems";
import * as reportProgress from "./deleteHelpers/reportProgress";
import * as getDeletableSolutionInfo from "./getDeletableSolutionInfo";
import * as restHelpers from "./restHelpers";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Deletes a deployed Solution item and and all of the items that were created
 * as part of that deployment.
 *
 * @param solutionItemId Id of a deployed Solution
 * @param authentication Credentials for the request
 * @return Promise that will resolve with a list of two solution summaries: successful deletions
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
  const deleteOptions: IDeleteSolutionOptions = options || {};
  let progressPercentStep = 0;
  let percentDone = 0;
  let solutionSummary: ISolutionPrecis;
  let solutionDeletedSummary: ISolutionPrecis;
  let solutionFailureSummary: ISolutionPrecis;
  let solutionIds = [] as string[];

  return new Promise<ISolutionPrecis[]>(resolve => {
    getDeletableSolutionInfo
      .getDeletableSolutionInfo(solutionItemId, authentication)
      .then(response => {
        solutionSummary = response;
        if (solutionSummary.items.length === 0) {
          return Promise.resolve([
            {
              id: solutionSummary.id,
              title: solutionSummary.title,
              folder: solutionSummary.folder,
              items: [],
              groups: []
            },
            {
              id: solutionSummary.id,
              title: solutionSummary.title,
              folder: solutionSummary.folder,
              items: [],
              groups: []
            }
          ]);
        } else {
          // Save a copy of the Solution item ids for the deleteSolutionFolder call because removeItems
          // destroys the solutionSummary.items list
          solutionIds = solutionSummary.items
            .map(item => item.id)
            .concat([solutionItemId]);

          const hubSiteItemIds: string[] = solutionSummary.items
            .filter((item: any) => item.type === "Hub Site Application")
            .map((item: any) => item.id);

          // Delete the items
          progressPercentStep = 100 / (solutionSummary.items.length + 2); // one extra for starting plus one extra for solution itself
          reportProgress.reportProgress(
            (percentDone += progressPercentStep),
            deleteOptions
          ); // let the caller know that we've started

          // Proceed with the deletion
          return removeItems.removeItems(
            solutionSummary,
            hubSiteItemIds,
            authentication,
            percentDone,
            progressPercentStep,
            deleteOptions
          );
        }
      })
      .then((results: ISolutionPrecis[]) => {
        // Attempt to delete groups; we won't be checking success
        return new Promise<ISolutionPrecis[]>(resolve => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          deleteEmptyGroups
            .deleteEmptyGroups(solutionSummary.groups, authentication)
            .then(() => {
              resolve(results);
            });
        });
      })
      .then((results: ISolutionPrecis[]) => {
        [solutionDeletedSummary, solutionFailureSummary] = results;
        // If there were no failed deletes, it's OK to delete Solution item
        if (solutionFailureSummary.items.length === 0) {
          return deleteSolutionItem.deleteSolutionItem(
            solutionItemId,
            authentication
          );
        } else {
          // Not all items were deleted, so don't delete solution
          return Promise.resolve({ success: false, itemId: solutionItemId });
        }
      })
      .then((solutionItemDeleteStatus: IStatusResponse) => {
        // If all deletes succeeded, see if we can delete the folder that contained them
        if (solutionItemDeleteStatus.success) {
          reportProgress.reportProgress(
            99,
            deleteOptions,
            solutionItemId,
            EItemProgressStatus.Finished
          );

          return deleteSolutionFolder.deleteSolutionFolder(
            solutionIds,
            solutionSummary.folder,
            authentication
          );
        } else {
          return Promise.resolve(false);
        }
      })
      .then(() => {
        resolve([solutionDeletedSummary, solutionFailureSummary]);
      })
      .catch(() => {
        resolve([solutionDeletedSummary, solutionFailureSummary]);
      });
  });
}
