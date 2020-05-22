import {
  UserSession,
  IItemTemplate,
  ICreateItemFromTemplateResponse,
  getItemDataAsJson,
  hasUnresolvedVariables,
  getTemplateById,
  replaceInTemplate,
  updateItemExtended
} from "@esri/solution-common";
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
  // TODO: rework to remove extra promise wrapper
  return new Promise<any>((resolve, reject) => {
    // In most cases this is a generic item update
    // However, if an item needs special handeling it should be listed here and...
    // uniqueUpdateTypes must implement postProcessDependencies that should return a promise for the update
    const uniqueUpdateTypes: string[] = ["Notebook"];

    const dataRequests: Array<Promise<any>> = [];
    const requestedItemInfos: any = clonedSolutionsResponse.filter(
      solutionInfo => {
        if (solutionInfo.postProcess) {
          dataRequests.push(getItemDataAsJson(solutionInfo.id, authentication));
          return true;
        }
      }
    );

    Promise.all(dataRequests).then(
      data => {
        let updates: Array<Promise<any>> = [Promise.resolve()];
        for (let i = 0; i < requestedItemInfos.length; i++) {
          const itemInfo = requestedItemInfos[i];
          /* istanbul ignore else */
          if (hasUnresolvedVariables(data[i])) {
            const template: IItemTemplate = getTemplateById(
              templates,
              itemInfo.id
            );
            const update: any = replaceInTemplate(data[i], templateDictionary);
            if (uniqueUpdateTypes.indexOf(template.type) < 0) {
              updates.push(
                updateItemExtended(
                  itemInfo.id,
                  { id: itemInfo.id },
                  update,
                  authentication
                )
              );
            } else {
              const itemHandler: any = moduleMap[template.type];
              /* istanbul ignore else */
              if (itemHandler.postProcessItemDependencies) {
                updates.push(
                  itemHandler.postProcessItemDependencies(
                    itemInfo.id,
                    template.type,
                    update,
                    authentication
                  )
                );
              }
            }
          }
        }

        // share the template with any groups it references
        templates.forEach(template => {
          updates = updates.concat(
            _getGroupUpdates(template, authentication, templateDictionary)
          );
        });

        Promise.all(updates).then(
          () => resolve(),
          e => reject(fail(e))
        );
      },
      e => reject(fail(e))
    );
  });
}
