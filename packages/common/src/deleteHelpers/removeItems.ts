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

/**
 * @module removeItems
 */

import {
  EItemProgressStatus,
  IDeleteSolutionOptions,
  ISolutionPrecis,
  UserSession
} from "../interfaces";
import * as reportProgress from "./reportProgress";
import * as hubSites from "@esri/hub-sites";
import * as portal from "@esri/arcgis-rest-portal";
import * as restHelpers from "../restHelpers";
import { createHubRequestOptions } from "../create-hub-request-options";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Removes a list of items starting from the end.
 *
 * @param itemIds List of ids of items to remove
 * @param hubSiteItemIds List of ids in itemIds that are for Hub Sites
 * @param authentication Credentials for the request
 * @param percentDone Percent done in range 0 to 100
 * @param progressPercentStep Amount that percentDone changes for each item deleted
 * @param solutionDeletedSummary Solution summary containing items successfully deleted
 * @param solutionFailureSummary Solution summary containing items that could not be deleted
 * @param deleteOptions Reporting options
 * @return Promise that will resolve with a list of two solution summaries: successful deletions
 * and failed deletions. Ignored items (e.g., already deleted) will not be in either list.
 */
export function removeItems(
  solutionSummary: ISolutionPrecis,
  hubSiteItemIds: string[],
  authentication: UserSession,
  percentDone: number,
  progressPercentStep: number,
  deleteOptions: IDeleteSolutionOptions = {}
): Promise<ISolutionPrecis[]> {
  let solutionDeletedSummary: ISolutionPrecis;
  let solutionFailureSummary: ISolutionPrecis;
  const itemToDelete = solutionSummary.items.shift();
  const percentDoneReport =
    percentDone + progressPercentStep * (solutionSummary.items.length + 1);

  if (itemToDelete) {
    // On to next item in list
    return removeItems(
      solutionSummary,
      hubSiteItemIds,
      authentication,
      percentDone,
      progressPercentStep,
      deleteOptions
    )
      .then((results: ISolutionPrecis[]) => {
        // Done with subsequent items in list; now delete the current item
        [solutionDeletedSummary, solutionFailureSummary] = results;

        // Remove any delete protection on item
        return portal.unprotectItem({
          id: itemToDelete.id,
          authentication: authentication
        });
      })
      .then(async () => {
        // Delete the item
        if (hubSiteItemIds.includes(itemToDelete.id)) {
          const options = await createHubRequestOptions(authentication);
          return hubSites.removeSite(itemToDelete.id, options);
        } else {
          return restHelpers.removeItem(itemToDelete.id, authentication);
        }
      })
      .then(() => {
        // Successful deletion
        solutionDeletedSummary.items.push(itemToDelete);
        reportProgress.reportProgress(
          percentDoneReport,
          deleteOptions,
          itemToDelete.id,
          EItemProgressStatus.Finished
        );
        return [solutionDeletedSummary, solutionFailureSummary];
      })
      .catch(error => {
        const errorMessage = error.error?.message || error.message;
        if (
          errorMessage &&
          errorMessage.includes("Item does not exist or is inaccessible")
        ) {
          // Filter out errors where the item doesn't exist, such as from a previous delete attempt
          reportProgress.reportProgress(
            percentDoneReport,
            deleteOptions,
            itemToDelete.id,
            EItemProgressStatus.Ignored
          );
        } else {
          // Otherwise, we have a real delete error, including where AGO simply returns "success: false"
          solutionFailureSummary.items.push(itemToDelete);
          reportProgress.reportProgress(
            percentDoneReport,
            deleteOptions,
            itemToDelete.id,
            EItemProgressStatus.Failed
          );
        }
        return [solutionDeletedSummary, solutionFailureSummary];
      });
  } else {
    // We've exhausted our list of items; start building up the lists of results
    solutionDeletedSummary = {
      id: solutionSummary.id,
      title: solutionSummary.title,
      folder: solutionSummary.folder,
      items: [],
      groupIds: []
    };
    solutionFailureSummary = {
      id: solutionSummary.id,
      title: solutionSummary.title,
      folder: solutionSummary.folder,
      items: [],
      groupIds: []
    };
    return Promise.resolve([solutionDeletedSummary, solutionFailureSummary]);
  }
}
