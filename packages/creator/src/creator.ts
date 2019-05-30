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
 * Manages the creation of a Solution item.
 *
 * @module creator
 */

import * as auth from "@esri/arcgis-rest-auth";
import * as common from "@esri/solution-common";
import * as createSolutionItem from "./createSolutionItem";
import * as portal from "@esri/arcgis-rest-portal";

// ------------------------------------------------------------------------------------------------------------------ //

export interface IPortalSubset {
  name: string;
  id: string;
  restUrl: string;
  portalUrl: string;
  urlKey: string;
}

export function createSolution(
  solutionName: string,
  groupId: string,
  templateDictionary: any,
  portalSubset: IPortalSubset,
  destinationUserSession: auth.UserSession
): Promise<string> {
  console.log('Create solution "' + solutionName + '" from group ' + groupId);
  return new Promise<string>((resolve, reject) => {
    const requestOptions: auth.IUserRequestOptions = {
      authentication: destinationUserSession
    };

    const solutionData: common.ISolutionItemData = {
      metadata: {},
      templates: []
    };

    // Fetch group item info and use it to create the solution item
    const solutionItemDef = new Promise<string>((itemResolve, itemReject) => {
      portal.getGroup(groupId, requestOptions).then(groupItem => {
        console.log("Group " + JSON.stringify(groupItem, null, 2));

        const solutionItem: any = {
          type: "Solution",
          title: groupItem.title,
          snippet: groupItem.snippet,
          description: groupItem.description,
          tags: groupItem.tags,
          typeKeywords: ["Solution", "Template"]
        };

        // Create new solution item using group item info
        common
          .createItemWithData(
            solutionItem,
            solutionData,
            requestOptions,
            undefined
          )
          .then(updateResponse => {
            if (groupItem.thumbnail) {
              // Copy the group's thumbnail to the new item; need to add token to thumbnail because requestOptions
              // only applies to updating solution item, not fetching group thumbnail image
              const groupItemThumbnail =
                common.generateSourceThumbnailUrl(
                  portalSubset.restUrl,
                  groupId,
                  groupItem.thumbnail,
                  true
                ) +
                "?token=" +
                destinationUserSession.token;
              common
                .addThumbnailFromUrl(
                  groupItemThumbnail,
                  updateResponse.id,
                  requestOptions
                )
                .then(() => itemResolve(updateResponse.id), itemReject);
            } else {
              itemResolve(updateResponse.id);
            }
          }, itemReject);
      }, itemReject);
    });

    // Fetch group contents
    const groupContentsDef = common.getGroupContents(groupId, requestOptions);

    // When we have the solution item and the group contents, we can add the contents to the solution
    Promise.all([solutionItemDef, groupContentsDef]).then(
      responses => {
        const [solutionItemId, groupContents] = responses;
        console.log("Created solution " + solutionItemId);
        console.log("Group members: " + JSON.stringify(groupContents, null, 2));

        // For each group content item,
        //   * fetch item & data infos
        //   * create item & data JSONs
        //   * extract dependency ids & add them into list of group contents
        //   * templatize select components in item & data JSONs (e.g., extents)
        //   * copy item's resources, metadata, & thumbnail to solution item as resources
        //   * add JSONs to solution item's data JSON accumulation

        // Update solution item with its data JSON

        resolve("createSolution");
      },
      e => reject(common.fail(e))
    );
  });
}

// ------------------------------------------------------------------------------------------------------------------ //
