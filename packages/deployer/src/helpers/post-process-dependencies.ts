import {
  UserSession,
  IItemTemplate,
  ICreateItemFromTemplateResponse,
  getItemDataAsJson,
  hasUnresolvedVariables,
  replaceInTemplate,
  updateItemExtended
} from "@esri/solution-common";
import { _getGroupUpdates } from "../deploySolutionItems";
import { moduleMap } from "../module-map";

export function postProcess(
  templates: IItemTemplate[],
  clonedSolutions: ICreateItemFromTemplateResponse[],
  authentication: UserSession,
  templateDictionary: any
): Promise<any> {
  // what needs post processing?
  const itemsToProcess = clonedSolutions.filter(entry => entry.postProcess);

  // map over these items
  const postProcessPromises = itemsToProcess.reduce((acc, entry) => {
    const itemHandler: any = moduleMap[entry.type];
    // only delegate if the handler has a postProcess method
    if (itemHandler.postProcess) {
      acc.push(
        itemHandler.postProcess(
          entry.id,
          entry.type,
          templates,
          templateDictionary,
          authentication
        )
      );
    }
    return acc;
  }, []);

  return Promise.all(postProcessPromises);
}

/**
 * Checks all item types with data and group references after all other processing has completed.
 * Evaluates if the items data has any remaining variables that have not been swapped.
 * Also shares any items that have group references with the appropriate group.
 *
 * @param templates Array of item templates to evaluate
 * @param clonedSolutionsResponse Has the item id, type, and data
 * @param authentication Credentials for the requests to the destination
 * @param templateDictionary Hash of facts: org URL, adlib replacements, deferreds for dependencies
 *
 * @return A promise that will resolve once any updates have been made
 */
export function postProcessDependencies(
  templates: IItemTemplate[],
  clonedSolutionsResponse: ICreateItemFromTemplateResponse[],
  authentication: UserSession,
  templateDictionary: any
): Promise<any> {
  // In most cases this is a generic item update
  // However, if an item needs special handeling it should be listed here and...
  // uniqueUpdateTypes must implement postProcessDependencies that should return a promise for the update
  const uniqueUpdateTypes: string[] = ["Notebook", "Hub Site Application"];

  // get the things to process
  const itemsToProcess = clonedSolutionsResponse.filter(
    entry => entry.postProcess
  );

  // TODO: refactor to delegate all this to type-specific processors
  return Promise.all(
    itemsToProcess.map(entry => {
      return getItemDataAsJson(entry.id, authentication).then(dataJson => {
        // append data into into entry and return that
        // cleaner than wragling two arrays later
        entry.itemData = dataJson;
        return entry;
      });
    })
  )
    .then(results => {
      // now map over things handling the updates
      return Promise.all(
        results.reduce((acc, itemInfo) => {
          // re-interpolate if needed
          // TODO: remove this gating for post-processing
          if (hasUnresolvedVariables(itemInfo.itemData)) {
            // re-interpolate over the item data
            itemInfo.itemData = replaceInTemplate(
              itemInfo.itemData,
              templateDictionary
            );
            // check if we have a "unique" item
            // TODO: everything should do this type of delegation
            if (uniqueUpdateTypes.indexOf(itemInfo.type) > -1) {
              const itemHandler: any = moduleMap[itemInfo.type];
              // check if the itemHandler can do postProcessing...
              if (itemHandler.postProcessItemDependencies) {
                acc.push(
                  itemHandler.postProcessItemDependencies(
                    itemInfo.id,
                    itemInfo.type,
                    itemInfo.itemData,
                    authentication
                  ) as Promise<void>
                );
              } else {
                // TODO: Log this as an error condition?
                acc.push(Promise.resolve());
              }
            } else {
              // No special processing, so just update the item
              acc.push(
                updateItemExtended(
                  itemInfo.id,
                  { id: itemInfo.id },
                  itemInfo.itemData,
                  authentication
                )
              );
            }
          }
          return acc;
        }, [] as Array<Promise<any>>)
      );
    })
    .then(_ => {
      // share with groups
      // Filter to entries with groups to share to
      const templatesWithGroups = templates.filter(e => {
        return e.groups && e.groups.length > 0;
      });
      // fire off all the promises
      return Promise.all(
        templatesWithGroups.map(tmpl => {
          return _getGroupUpdates(tmpl, authentication, templateDictionary);
        })
      );
    })
    .catch(e => {
      return Promise.reject(fail(e));
    });
}

// /**
//  * Checks all item types with data and group references after all other processing has completed.
//  * Evaluates if the items data has any remaining variables that have not been swapped.
//  * Also shares any items that have group references with the appropriate group.
//  *
//  * @param templates Array of item templates to evaluate
//  * @param clonedSolutionsResponse Has the item id, type, and data
//  * @param authentication Credentials for the requests to the destination
//  * @param templateDictionary Hash of facts: org URL, adlib replacements, deferreds for dependencies
//  *
//  * @return A promise that will resolve once any updates have been made
//  */
// export function postProcessDependencies(
//   templates: IItemTemplate[],
//   clonedSolutionsResponse: ICreateItemFromTemplateResponse[],
//   authentication: UserSession,
//   templateDictionary: any
// ): Promise<any> {
//   // TODO: rework to remove extra promise wrapper
//   return new Promise<any>((resolve, reject) => {
//     // In most cases this is a generic item update
//     // However, if an item needs special handeling it should be listed here and...
//     // uniqueUpdateTypes must implement postProcessDependencies that should return a promise for the update
//     const uniqueUpdateTypes: string[] = ["Notebook"];

//     const dataRequests: Array<Promise<any>> = [];
//     const requestedItemInfos: any = clonedSolutionsResponse.filter(
//       solutionInfo => {
//         if (solutionInfo.postProcess) {
//           dataRequests.push(getItemDataAsJson(solutionInfo.id, authentication));
//           return true;
//         }
//       }
//     );

//     Promise.all(dataRequests).then(
//       data => {
//         let updates: Array<Promise<any>> = [Promise.resolve()];
//         for (let i = 0; i < requestedItemInfos.length; i++) {
//           const itemInfo = requestedItemInfos[i];
//           /* istanbul ignore else */
//           if (hasUnresolvedVariables(data[i])) {
//             const template: IItemTemplate = getTemplateById(
//               templates,
//               itemInfo.id
//             );
//             const update: any = replaceInTemplate(data[i], templateDictionary);
//             if (uniqueUpdateTypes.indexOf(template.type) < 0) {
//               updates.push(
//                 updateItemExtended(
//                   itemInfo.id,
//                   { id: itemInfo.id },
//                   update,
//                   authentication
//                 )
//               );
//             } else {
//               const itemHandler: any = moduleMap[template.type];
//               /* istanbul ignore else */
//               if (itemHandler.postProcessItemDependencies) {
//                 updates.push(
//                   itemHandler.postProcessItemDependencies(
//                     itemInfo.id,
//                     template.type,
//                     update,
//                     authentication
//                   )
//                 );
//               }
//             }
//           }
//         }

//         // share the template with any groups it references
//         templates.forEach(template => {
//           updates = updates.concat(
//             _getGroupUpdates(template, authentication, templateDictionary)
//           );
//         });

//         Promise.all(updates).then(
//           () => resolve(),
//           e => reject(fail(e))
//         );
//       },
//       e => reject(fail(e))
//     );
//   });
// }
