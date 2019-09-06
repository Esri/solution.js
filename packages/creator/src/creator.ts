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
import * as createSolutionTemplate from "./createSolutionTemplate";
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
  destinationUserSession: auth.UserSession,
  progressCallback: (percentDone: number) => void
): Promise<string> {
  let percentDone = 1; // Let the caller know that we've started
  progressCallback(percentDone);

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
        /* console.log(
          'Creating solution "' +
            (solutionName || groupItem.title) +
            '" from group ' +
            groupId
        ); */
        progressCallback((percentDone += 2));

        const solutionItem: any = {
          type: "Solution",
          title: solutionName || groupItem.title,
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
            progressCallback((percentDone += 2));

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
        /* console.log(
          "Created solution template framework for " + solutionItemId
        );
        console.log("Group members: " + JSON.stringify(groupContents, null, 2)); */
        progressCallback((percentDone += 2));
        const progressPercentStep = (100 - 7) / (groupContents.length + 1); // '7' for previously-reported progress

        // Get the template information for the group contents, including their dependency items
        createSolutionTemplate
          .createSolutionTemplate(
            portalSubset.restUrl,
            solutionItemId,
            groupContents,
            templateDictionary,
            destinationUserSession,
            () => {
              progressCallback((percentDone += progressPercentStep)); // progress tick callback from deployItems
            }
          )
          .then(
            (solutionTemplates: common.IItemTemplate[]) => {
              progressCallback(98);

              // Update solution item with its data JSON
              solutionData.templates = solutionTemplates;
              const updateOptions: portal.IUpdateItemOptions = {
                item: {
                  id: solutionItemId,
                  text: solutionData
                },
                ...requestOptions
              };
              portal.updateItem(updateOptions).then(() => {
                progressCallback(0);
                resolve(solutionItemId);
              }, reject);
            },
            e => reject(common.fail(e))
          );
      },
      e => reject(common.fail(e))
    );
  });
}
