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
  SItemProgressStatus,
  DeployedSolutionFormatVersion,
  IBuildOrdering,
  IDeleteSolutionOptions,
  IItemGeneralized,
  IItemTemplate,
  ISolutionItemData,
  ISolutionItemPrecis,
  ISolutionPrecis,
  IStatusResponse,
  UserSession
} from "./interfaces";
import * as portal from "@esri/arcgis-rest-portal";
import * as dependencies from "./dependencies";
import * as hubSites from "@esri/hub-sites";
import * as restHelpers from "./restHelpers";
import * as restHelpersGet from "./restHelpersGet";
import * as templatization from "./templatization";
import { createHubRequestOptions } from "./create-hub-request-options";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Reports if a deployed Solution can be automatically deleted.
 *
 * @param solutionItemId Id of a deployed Solution
 * @param authentication Credentials for the request
 * @return Promise resolving to deletable or not
 */
export function isSolutionDeletable(
  solutionItemId: string,
  authentication: UserSession
): Promise<boolean> {
  return getSolutionSummary(solutionItemId, authentication).then(
    (solutionSummary: ISolutionPrecis) => {
      console.log(
        "solution is deletable: " + (solutionSummary.items.length > 0)
      ); //???
      return solutionSummary.items.length > 0;
    }
  );
}

/**
 * Creates a summary of a deployed Solution.
 *
 * @param solutionItemId Id of a deployed Solution
 * @param authentication Credentials for the request
 * @return Promise resolving to a summary of the deployed Solution
 */
export function getSolutionSummary(
  solutionItemId: string,
  authentication: UserSession
): Promise<ISolutionPrecis> {
  const solutionSummary: ISolutionPrecis = {
    id: solutionItemId,
    title: "",
    folder: "",
    items: []
  };
  let templates: IItemTemplate[] = [];
  let deployedSolutionVersion = DeployedSolutionFormatVersion;

  return Promise.all([
    restHelpersGet.getItemBase(solutionItemId, authentication),
    restHelpersGet.getItemDataAsJson(solutionItemId, authentication)
  ])
    .then((response: any) => {
      const itemBase: IItemGeneralized = response[0];
      const itemData: ISolutionItemData = response[1];

      solutionSummary.title = itemBase.title;
      solutionSummary.folder = itemBase.ownerFolder;
      deployedSolutionVersion = templatization.extractSolutionVersion(itemData);
      templates = itemData.templates;

      // Make sure that the item is a deployed Solution
      if (
        !(
          itemBase.typeKeywords.includes("Solution") &&
          itemBase.typeKeywords.includes("Deployed")
        )
      ) {
        throw new Error(
          "Item " + solutionItemId + " is not a deployed Solution"
        );
      }

      // The Solution item must have a forward Solution2Item relationship to be deletable
      return restHelpersGet.getItemsRelatedToASolution(
        solutionItemId,
        authentication
      );
    })
    .then((relatedItems: portal.IItem[]) => {
      solutionSummary.items = relatedItems.map(relatedItem => {
        return {
          id: relatedItem.id,
          type: relatedItem.type,
          title: relatedItem.title,
          modified: relatedItem.modified,
          owner: relatedItem.owner
        };
      });

      // Get the build order
      let buildOrderIds = [] as string[];
      if (deployedSolutionVersion < 1) {
        // Version 0
        buildOrderIds = _reconstructBuildOrderIds(templates);
      } else {
        // Version ≥ 1
        buildOrderIds = templates.map((template: any) => template.itemId);
      }

      // Sort the related items into build order
      solutionSummary.items.sort(
        (first, second) =>
          buildOrderIds.indexOf(first.id) - buildOrderIds.indexOf(second.id)
      );
      console.log("got getSolutionSummary"); //???
      return solutionSummary;
    });
}

/**
 * Returns a list of items in a deployed Solution that would be deleted by the `deleteSolution` function; list
 * does not include the Solution folder, Solution items that are shared with any item other than the deployed
 * Solution, or the Solution item itself.
 *
 * @param solutionItemId Id of a deployed Solution
 * @param authentication Credentials for the request
 * @return Promise resolving to the list of items in the solution that would be deleted.
 */
export function getDeletableSolutionInfo(
  solutionItemId: string,
  authentication: UserSession
): Promise<ISolutionPrecis> {
  let solutionSummary: ISolutionPrecis;

  return new Promise<ISolutionPrecis>((resolve, reject) => {
    getSolutionSummary(solutionItemId, authentication)
      .then((response: ISolutionPrecis) => {
        // Fetch each item's relationships back to Solution items
        solutionSummary = response;
        const awaitAllItems: Array<Promise<
          string[]
        >> = solutionSummary.items.map((item: ISolutionItemPrecis) =>
          restHelpersGet.getSolutionsRelatedToAnItem(item.id, authentication)
        );

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        return Promise.all(awaitAllItems);
      })
      .then((responses: string[][]) => {
        // Filter out items that are shared with another Solution
        solutionSummary.items = solutionSummary.items.filter(
          (item: ISolutionItemPrecis, index: number) =>
            responses[index].length === 1
        );
        console.log("got getDeletableSolutionInfo"); //???
        resolve(solutionSummary);
      }) //???
      /* //???
    .catch(reject);
    */ .catch(err => {
        console.log(
          "failed getDeletableSolutionInfo",
          JSON.stringify(err, null, 2)
        );
        reject(err);
      }); //???
  });
}

/**
 * Deletes a deployed Solution item and and all of the items that were created
 * as part of that deployment.
 *
 * @param solutionItemId Id of a deployed Solution
 * @param authentication Credentials for the request
 * @return Promise that will resolve if deletion was successful and fail if any part of it failed;
 * note that Solution item will only be deleted if all of its deployed items were deleted so that
 * deletion can be re-attempted
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
    getDeletableSolutionInfo(solutionItemId, authentication)
      .then(response => {
        solutionSummary = response;
        solutionDeletedSummary = {
          id: solutionSummary.id,
          title: solutionSummary.title,
          folder: solutionSummary.folder,
          items: []
        };
        solutionFailureSummary = {
          id: solutionSummary.id,
          title: solutionSummary.title,
          folder: solutionSummary.folder,
          items: []
        };

        // Save a copy of the Solution item ids for the _deleteSolutionFolder call because _removeItems
        // destroys the solutionSummary.items list
        solutionIds = solutionSummary.items
          .map(item => item.id)
          .concat([solutionItemId]);

        const hubSiteItemIds: string[] = solutionSummary.items
          .filter((item: any) => item.type === "Hub Site Application")
          .map((item: any) => item.id);

        // Reverse the build order to get the delete order
        solutionSummary.items.reverse();

        // Delete the items
        progressPercentStep = 100 / (solutionSummary.items.length + 2); // one extra for starting plus one extra for solution itself
        _reportProgress((percentDone += progressPercentStep), deleteOptions); // let the caller know that we've started
        console.log("_removeItems..."); //???

        return _removeItems(
          solutionSummary,
          hubSiteItemIds,
          authentication,
          percentDone,
          progressPercentStep,
          deleteOptions,
          solutionDeletedSummary,
          solutionFailureSummary
        );
      })
      .then(() => {
        // If there were no failed deletes, it's OK to delete Solution item
        if (solutionFailureSummary.items.length === 0) {
          return restHelpers.removeItem(solutionItemId, authentication);
        } else {
          // Not all items were deleted, so don't delete solution
          return Promise.resolve({ success: false, itemId: solutionItemId });
        }
      })
      .then((solutionItemDeleteStatus: IStatusResponse) => {
        // If all deletes succeeded, see if we can delete the folder that contained them
        if (solutionItemDeleteStatus.success) {
          _reportProgress(
            99,
            deleteOptions,
            solutionItemId,
            EItemProgressStatus.Finished
          );

          return _deleteSolutionFolder(
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

/**
 * Deletes a deployed Solution's folder if the folder is empty.
 *
 * @param solutionFolderId Id of the folder of a deployed Solution
 * @param deletedItemIds Ids in the Solution, including the Solution item; used to deal with lagging folder deletion
 * @param authentication Credentials for the request
 * @return Promise that will resolve if deletion was successful and fail if any part of it failed;
 * if the folder has a non-Solution item, it will not be deleted, but the function will return true
 */
export function _deleteSolutionFolder(
  solutionIds: string[],
  folderId: string,
  authentication: UserSession
): Promise<boolean> {
  // See if the deployment folder is empty and can be deleted; first, we need info about user
  return authentication
    .getUser({ authentication })
    .then(user => {
      // And then we need to be sure that the folder is empty
      const query = new portal.SearchQueryBuilder()
        .match(authentication.username)
        .in("owner")
        .and()
        .match(user.orgId)
        .in("orgid")
        .and()
        .match(folderId)
        .in("ownerfolder");

      return portal.searchItems({
        q: query,
        authentication
      });
    })
    .then((searchResult: portal.ISearchResult<portal.IItem>) => {
      // If the search results are all in the deletedItemIds list, then we're dealing with AGO lagging:
      // successfully reporting a deletion and yet still returning the item in search results.
      // Filter the Solution items out of the search results.
      const nonSolutionItems = searchResult.results
        .map(foundItem => foundItem.id)
        .filter(foundItemId => !solutionIds.includes(foundItemId)); // only save non-solution items

      // If the list is empty, then there are no non-solution items
      if (nonSolutionItems.length === 0) {
        // OK to delete the folder
        return portal.removeFolder({
          folderId: folderId,
          owner: authentication.username,
          authentication
        });
      } else {
        // A non-deployment item is in the folder, so leave it alone
        return Promise.resolve({ success: true });
      }
    })
    .then(deleteFolderResponse => {
      // Extract the success property
      return deleteFolderResponse.success;
    })
    .catch(() => {
      return Promise.resolve(false);
    });
}

/**
 * Reconstructs the build order of a set of templates.
 *
 * @param templates A collection of AGO item templates
 * @return The ids of the source templates in build order, which is not necessarily the same
 * as the build order used to create the template Solution
 */
export function _reconstructBuildOrderIds(
  templates: IItemTemplate[]
): string[] {
  const buildOrdering: IBuildOrdering = dependencies.topologicallySortItems(
    templates
  );
  return buildOrdering.buildOrder;
}

/**
 * Removes a list of items.
 *
 * @param itemIds List of ids of items to remove
 * @param hubSiteItemIds List of ids in itemIds that are for Hub Sites
 * @param authentication Credentials for the request
 * @param percentDone Percent done in range 0 to 100
 * @param progressPercentStep Amount that percentDone changes for each item deleted
 * @param deleteOptions Reporting options
 * @param solutionDeletedSummary Solution summary containing items successfully deleted
 * @param solutionFailureSummary Solution summary containing items that could not be deleted
 * @return Promise that will resolve with true if all of the items in the list were successfully deleted
 */
export function _removeItems(
  solutionSummary: ISolutionPrecis,
  hubSiteItemIds: string[],
  authentication: UserSession,
  percentDone: number,
  progressPercentStep: number,
  deleteOptions: IDeleteSolutionOptions = {},
  solutionDeletedSummary: ISolutionPrecis,
  solutionFailureSummary: ISolutionPrecis
): Promise<void> {
  const itemToDelete = solutionSummary.items.shift();
  if (itemToDelete) {
    // Remove any delete protection on item
    return portal
      .unprotectItem({ id: itemToDelete.id, authentication: authentication })
      .then(async () => {
        // Delete the item
        console.log("delete " + itemToDelete.id + "..."); //???
        if (hubSiteItemIds.includes(itemToDelete.id)) {
          const options = await createHubRequestOptions(authentication);
          return hubSites.removeSite(itemToDelete.id, options);
        } else {
          /* //???
          return restHelpers.removeItem(itemToDelete.id, authentication);
          */ //???
          const tempAuth = Math.random() < 0.1 ? null : authentication; //???
          return restHelpers.removeItem(itemToDelete.id, tempAuth); //???
        }
      })
      .then(result => {
        if (!result.success) {
          throw new Error("Failed to delete item");
        }

        console.log("deleted " + itemToDelete.id + " OK"); //???
        solutionDeletedSummary.items.push(itemToDelete);
        _reportProgress(
          (percentDone += progressPercentStep),
          deleteOptions,
          itemToDelete.id,
          EItemProgressStatus.Finished
        );

        // On to next item in list
        return _removeItems(
          solutionSummary,
          hubSiteItemIds,
          authentication,
          percentDone,
          progressPercentStep,
          deleteOptions,
          solutionDeletedSummary,
          solutionFailureSummary
        );
      })
      .catch(error => {
        const errorMessage = error.error?.message || error.message;
        if (
          errorMessage &&
          errorMessage.includes("Item does not exist or is inaccessible")
        ) {
          console.log("deleted " + itemToDelete.id + " ignored"); //???
          // Filter out errors where the item doesn't exist, such as from a previous delete attempt
          _reportProgress(
            (percentDone += progressPercentStep),
            deleteOptions,
            itemToDelete.id,
            EItemProgressStatus.Ignored
          );
        } else {
          console.log("deleted " + itemToDelete.id + " failed"); //???
          // Otherwise, we have a real delete error, including where AGO simply returns "success: false"
          solutionFailureSummary.items.push(itemToDelete);
          _reportProgress(
            (percentDone += progressPercentStep),
            deleteOptions,
            itemToDelete.id,
            EItemProgressStatus.Failed
          );
        }
        return _removeItems(
          solutionSummary,
          hubSiteItemIds,
          authentication,
          percentDone,
          progressPercentStep,
          deleteOptions,
          solutionDeletedSummary,
          solutionFailureSummary
        );
      });
  } else {
    return Promise.resolve();
  }
}

/**
 * Reports progress as specified via options.
 *
 * @param percentDone Percent done in range 0 to 100
 * @param deleteOptions Reporting options
 * @param deletedItemId Id of item deleted
 */
export function _reportProgress(
  percentDone: number,
  deleteOptions: IDeleteSolutionOptions,
  deletedItemId = "",
  status = EItemProgressStatus.Started
): void {
  const iPercentDone = Math.round(percentDone);

  /* istanbul ignore else */
  if (deleteOptions.progressCallback) {
    deleteOptions.progressCallback(iPercentDone, deleteOptions.jobId, {
      event: "",
      data: deletedItemId
    });
  }

  /* istanbul ignore else */
  if (deleteOptions.consoleProgress) {
    console.log(
      Date.now(),
      deletedItemId,
      deleteOptions.jobId ?? "",
      SItemProgressStatus[status],
      iPercentDone + "%"
    );
  }
}
