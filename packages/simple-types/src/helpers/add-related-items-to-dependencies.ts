/**
 * Given a set of relations, add the item ids to the dependencies array
 *
 * @param relations
 * @param dependencies
 * @private
 */
export function addRelatedItemsToDependencies(
  relations: any[],
  dependencies: string[]
): any {
  relations.forEach(rel => {
    rel.relatedItems.forEach((id: string) => {
      if (dependencies.indexOf(id) === -1) {
        dependencies.push(id);
      }
    });
  });
  return dependencies;
}
