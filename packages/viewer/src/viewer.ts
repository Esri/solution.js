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
 * Provides the access to the solution's contents.
 *
 * @module viewer
 */

import * as common from "@esri/solution-common";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Compares two AGO items, fetching them if only their id is supplied.
 *
 * @param item1 First item or its AGO id
 * @param item2 Second item or its AGO id
 * @param authentication Credentials for the request to AGO
 * @return True if objects are the same
 * @see Only comparable properties are compared; see deleteItemProps() in the `common` package
 */
export function compareItems(
  item1: string | any,
  item2: string | any,
  authentication: common.UserSession = null
): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    // If an input is a string, fetch the item; otherwise, clone the input because we will modify the
    // item base to remove incomparable properties
    let itemBaseDef1: Promise<any>;
    if (typeof item1 === "string") {
      itemBaseDef1 = common.getItemBase(item1, authentication);
    } else {
      itemBaseDef1 = Promise.resolve(common.cloneObject(item1));
    }

    let itemBaseDef2: Promise<any>;
    if (typeof item2 === "string") {
      itemBaseDef2 = common.getItemBase(item2, authentication);
    } else {
      itemBaseDef2 = Promise.resolve(common.cloneObject(item2));
    }

    Promise.all([itemBaseDef1, itemBaseDef2]).then(
      responses => {
        const [itemBase1, itemBase2] = responses;

        common.deleteItemProps(itemBase1);
        common.deleteItemProps(itemBase2);

        if (itemBase1.type === "Solution") {
          delete itemBase1.typeKeywords;
          delete itemBase1.size;
          delete itemBase2.typeKeywords;
          delete itemBase2.size;
        }

        /*console.log("----------------------------------------------------------------");
        console.log("item 1 " + item1 + ": ", JSON.stringify(itemBase1, null, 2));
        console.log("item 2 " + item2 + ": ", JSON.stringify(itemBase2, null, 2));
        console.log("----------------------------------------------------------------");*/

        resolve(common.compareJSONNoEmptyStrings(itemBase1, itemBase2));
      },
      e => reject(e)
    );
  });
}

/**
 * Checks a Solution for error.
 *
 * @param item Item id
 * @param authentication Credentials for the request to AGO
 * @return List of results of checks of Solution
 */
export function getSolutionErrors(
  itemId: string,
  authentication: common.UserSession = null
): Promise<string[]> {
  const resultsHtml: string[] = [`Item ${itemId}`];
  let item: common.ICompleteItem;
  let isTemplate = true;
  let templateItems: common.IItemTemplate[];
  let templateItemIds: string[];

  let currentAction: string = " while getting complete item";
  return (
    common
      .getCompleteItem(itemId, authentication)

      // ---------- Is it a Template or Deployed Solution? ---------------------------------------------------------------//
      .then((results: common.ICompleteItem) => {
        currentAction = "";
        item = results;

        if (item.base.type !== "Solution") {
          throw new Error(`item is not a Solution`);
        } else if (item.base.typeKeywords.includes("Template")) {
          resultsHtml.push(`&#x2714; item is a Template Solution`);
        } else if (item.base.typeKeywords.includes("Deployed")) {
          isTemplate = false;
          resultsHtml.push(`&#x2714; item is a Deployed Solution`);
        } else {
          throw new Error(
            `item is neither a Template Solution nor a Deployed Solution`
          );
        }

        // base: IItem; text/plain JSON
        // data: File; */*
        // thumbnail: File; image/*
        // metadata: File; application/xml
        // resources: File[]; list of */*
        // fwdRelatedItems: IRelatedItems[]; list of forward relationshipType/relatedItems[] pairs
        // revRelatedItems: IRelatedItems[]; list of reverse relationshipType/relatedItems[] pairs
        return common.blobToJson(item.data);
      })

      // ---------- Check the Solution2Item relationship from a Deployed Solution to each deployed item ------------------//
      .then(itemDataJson => {
        templateItems = itemDataJson?.templates;
        if (!templateItems) {
          throw new Error(
            `Solution's data are not valid JSON or the Solution contains no items`
          );
        }
        templateItemIds = templateItems
          .map((template: common.IItemTemplate) => template.itemId)
          .sort();

        if (!isTemplate) {
          // Make sure that there's a Solution2Item relationship to each deployed item
          const fwdRelatedItemIds = item.fwdRelatedItems
            .filter(
              relationshipSet =>
                relationshipSet.relationshipType === "Solution2Item"
            )
            .reduce(
              (flatSet, relationshipSet) =>
                flatSet.concat(relationshipSet.relatedItemIds),
              []
            )
            .sort();
          if (templateItemIds.length < fwdRelatedItemIds.length) {
            resultsHtml.push(
              "&#x2716; there are forward Solution2Item relationship(s) to unknown item(s)"
            );
          } else if (templateItemIds.length > fwdRelatedItemIds.length) {
            resultsHtml.push(
              "&#x2716; missing forward Solution2Item relationship(s)"
            );
          } else if (
            JSON.stringify(templateItemIds) !==
            JSON.stringify(fwdRelatedItemIds)
          ) {
            resultsHtml.push(
              "&#x2716; mismatching forward Solution2Item relationship(s)"
            );
          } else {
            resultsHtml.push(
              "&#x2714; matching forward Solution2Item relationship(s)"
            );
          }
        }
        return resultsHtml;
      })

      // ---------- Check that all dependency references are items in Solution -------------------------------------------//
      .then(() => {
        const dependencyIds = templateItems
          .reduce(
            (flatSet, template) => flatSet.concat(template.dependencies),
            []
          )
          .reduce((noDupSet, dependency) => {
            if (!noDupSet.includes(dependency)) noDupSet.push(dependency);
            return noDupSet;
          }, [])
          .sort();

        const missingItems = dependencyIds.filter(
          (dependencyId: string) => !templateItemIds.includes(dependencyId)
        );

        if (missingItems.length === 0) {
          resultsHtml.push("&#x2714; all dependencies are in Solution: ");
        } else {
          resultsHtml.push(
            "&#x2716; dependencies that aren't in Solution: " +
              JSON.stringify(missingItems)
          );
        }

        return resultsHtml;
      })

      // ---------- Done -------------------------------------------------------------------------------------------------//
      .then(() => {
        return resultsHtml;
      })

      // ---------- Fatal error ------------------------------------------------------------------------------------------//
      .catch(error => {
        resultsHtml.push(
          `&#x2716; error${currentAction}: ${error?.originalMessage ||
            error?.message ||
            JSON.stringify(error)}`
        );
        return resultsHtml;
      })
  );
}
