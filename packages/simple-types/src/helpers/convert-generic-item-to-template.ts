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
import * as common from "@esri/solution-common";
import { addRelatedItemsToDependencies } from "./add-related-items-to-dependencies";

import { UserSession } from "@esri/arcgis-rest-auth";
import { getItemData } from "@esri/arcgis-rest-portal";

/**
 * Convert an item to a template
 * This handles the "Simple Types". Types that require additional processing should
 * implement their own function vs adding special case logic here
 *
 * This should return
 *
 * @param solutionItemId
 * @param itemInfo
 * @param authentication
 */
export function convertGenericItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: common.UserSession
): Promise<common.IItemTemplate> {
  // Init template
  const itemTemplate: common.IItemTemplate = common.createInitializedItemTemplate(
    itemInfo
  );

  // Templatize item info property values
  // Note: We cannot hoist this into createInitializedItemTemplate as that breaks featureLayer processor
  itemTemplate.item.id = common.templatizeTerm(
    itemTemplate.item.id,
    itemTemplate.item.id,
    ".itemId"
  );

  return _getItemData(itemInfo.id, itemInfo.type, authentication)
    .then(itemData => {
      itemTemplate.data = itemData;
      return common.getItemRelatedItemsInSameDirection(
        itemInfo.id,
        "forward",
        authentication
      );
    })
    .then(relatedItems => {
      // remove WMA2Code
      relatedItems = relatedItems.filter(
        e => e.relationshipType !== "WMA2Code"
      );
      // store on template
      itemTemplate.relatedItems = relatedItems;
      // update dependencies
      itemTemplate.dependencies = addRelatedItemsToDependencies(
        relatedItems,
        itemTemplate.dependencies
      );
      return itemTemplate;
    });
}

/**
 * Fetch the item data if it's a type that has json data... or quick capture
 * @param itemId
 * @param itemType
 * @param authentication
 * @private
 */
export function _getItemData(
  itemId: string,
  itemType: string,
  authentication: UserSession
): Promise<any> {
  // we only fetch data for some types of items
  const typesWithJsonData = [
    "Dashboard",
    "Feature Service",
    "Project Package",
    "Workforce Project",
    "Web Map",
    "Web Mapping Application",
    "Notebook"
  ];
  if (typesWithJsonData.includes(itemType)) {
    return getItemData(itemId, { authentication });
  } else {
    // resolve with an empty object which we will attach as model.data
    return Promise.resolve({});
  }
}

// export function convertItemToTemplateOld(
//   solutionItemId: string,
//   itemInfo: any,
//   authentication: common.UserSession
// ): Promise<common.IItemTemplate> {
//   return new Promise<common.IItemTemplate>((resolve, reject) => {
//     // Init template
//     const itemTemplate: common.IItemTemplate = common.createInitializedItemTemplate(
//       itemInfo
//     );

//     // Templatize item info property values
//     itemTemplate.item.id = common.templatizeTerm(
//       itemTemplate.item.id,
//       itemTemplate.item.id,
//       ".itemId"
//     );

//     // Request related items
//     const relatedPromise = common.getItemRelatedItemsInSameDirection(
//       itemTemplate.itemId,
//       "forward",
//       authentication
//     );

//     // Perform type-specific handling
//     let dataPromise = Promise.resolve({});
//     switch (itemInfo.type) {
//       case "Dashboard":
//       case "Feature Service":
//       case "Project Package":
//       case "Workforce Project":
//       case "Web Map":
//       case "Web Mapping Application":
//       case "Notebook":
//         dataPromise = new Promise((resolveJSON, rejectJSON) => {
//           common
//             .getItemDataAsJson(itemTemplate.itemId, authentication)
//             .then(json => resolveJSON(json), rejectJSON);
//         });
//         break;
//       // Forms have their own handler
//       // case "Form":
//       //   dataPromise = common.getItemDataAsFile(
//       //     itemTemplate.itemId,
//       //     itemTemplate.item.name,
//       //     authentication
//       //   );
//       //   break;
//       // Handled in QuickCapture Processor
//       // case "QuickCapture Project":
//       //   dataPromise = common.getItemResourcesFiles(
//       //     itemTemplate.itemId,
//       //     authentication
//       //   );
//       //   break;
//     }

//     // Errors are handled as resolved empty values; this means that there's no `reject` clause to handle, hence:
//     // tslint:disable-next-line:no-floating-promises
//     Promise.all([dataPromise, relatedPromise]).then(
//       responses => {
//         const [itemDataResponse, relationships] = responses;
//         itemTemplate.data = itemDataResponse;

//         // Save the mappings to related items & add those items to the dependencies, but not WMA Code Attachments
//         itemTemplate.dependencies = [] as string[];
//         itemTemplate.relatedItems = [] as common.IRelatedItems[];

//         relationships.forEach(relationship => {
//           /* istanbul ignore else */
//           if (relationship.relationshipType !== "WMA2Code") {
//             itemTemplate.relatedItems!.push(relationship);
//             relationship.relatedItemIds.forEach(relatedItemId => {
//               if (itemTemplate.dependencies.indexOf(relatedItemId) < 0) {
//                 itemTemplate.dependencies.push(relatedItemId);
//               }
//             });
//           }
//         });

//         let wrapupPromise = Promise.resolve();
//         let webappPromise = Promise.resolve(itemTemplate);
//         switch (itemInfo.type) {
//           // case "Dashboard":
//           //   dashboard.convertItemToTemplate(itemTemplate, authentication);
//           //   break;
//           // case "Form":
//           //   // Store the form's data in the solution resources, not in template
//           //   itemTemplate.data = null;
//           //   form.convertItemToTemplate(itemTemplate);

//           //   wrapupPromise = new Promise(
//           //     (resolveFormStorage, rejectFormStorage) => {
//           //       common
//           //         .storeFormItemFiles(
//           //           itemTemplate,
//           //           itemDataResponse,
//           //           solutionItemId,
//           //           authentication
//           //         )
//           //         .then(formFilenames => {
//           //           // update the templates resources
//           //           itemTemplate.resources = itemTemplate.resources.concat(
//           //             formFilenames
//           //           );
//           //           resolveFormStorage();
//           //         }, rejectFormStorage);
//           //     }
//           //   );
//           //   break;
//           // case "Notebook":
//           //   notebook.convertNotebookToTemplate(itemTemplate);
//           //   break;
//           // case "Web Map":
//           //   webappPromise = webmap.convertItemToTemplate(
//           //     itemTemplate,
//           //     authentication
//           //   );
//           //   break;
//           // case "Web Mapping Application":
//           //   if (itemDataResponse) {
//           //     webappPromise = webmappingapplication.convertItemToTemplate(
//           //       itemTemplate,
//           //       authentication
//           //     );
//           //   }
//           //   break;
//           // case "Workforce Project":
//           //   webappPromise = workforce.convertItemToTemplate(
//           //     itemTemplate,
//           //     authentication
//           //   );
//           //   break;
//           // case "QuickCapture Project":
//           //   webappPromise = quickcapture.convertQuickCaptureToTemplate(
//           //     itemTemplate
//           //   );
//           //   break;
//         }

//         wrapupPromise.then(
//           () => {
//             webappPromise.then(resolve, err => reject(common.fail(err)));
//           },
//           err => reject(common.fail(err))
//         );
//       },
//       error => {
//         reject(error);
//       }
//     );
//   });
// }
