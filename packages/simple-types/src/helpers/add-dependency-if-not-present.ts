import { IItemTemplate } from "@esri/solution-common";
/**
 * Updates the templates dependencies list with unique item ids
 *
 * @param id the item id of the dependency
 * @param itemTemplate template for the quick capture project item
 * @return void
 * @private
 */

export function addDependencyIfNotPresent(
  id: string,
  itemTemplate: IItemTemplate
): void {
  if (itemTemplate.dependencies.indexOf(id) === -1) {
    itemTemplate.dependencies.push(id);
  }
}
