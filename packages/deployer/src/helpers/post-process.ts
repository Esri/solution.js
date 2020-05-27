import {
  UserSession,
  IItemTemplate,
  ICreateItemFromTemplateResponse
} from "@esri/solution-common";
import { _getGroupUpdates } from "../deploySolutionItems";
import { moduleMap } from "../module-map";

/**
 * Delegate post-processing to the type specific
 * processors. This allows each type to have fine-grained
 * control over what they do. Common post-processing is
 * exposed as functions that can be imported
 * @param templates
 * @param clonedSolutions
 * @param authentication
 * @param templateDictionary
 */
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
    if (itemHandler && itemHandler.postProcess) {
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
