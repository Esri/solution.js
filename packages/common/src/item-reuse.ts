/** @license
 * Copyright 2024 Esri
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
 *
 * @module item-reuse
 */

import { UserSession } from "./interfaces";
import { getItemData, IItem, ISearchResult, searchItems, SearchQueryBuilder} from "@esri/arcgis-rest-portal";

/**
 * Object that contains key details for items that could be leveraged for reuse
 */
export interface IReuseItems {
  /**
   * The key is the id of the item as it is within the solution template that will be deployed
   */
  [key: string]: IReuseItem;
}

/**
 * Object that contains key details for an item that could be leveraged for reuse
 */
export interface IReuseItem {
  /**
   *  The date/time the item was created
   */
  created: number;

  /**
   * A collection of key details from solutions that leverage this item
   */
  solutions: IReuseSolutions;

  /**
   * The title of the item that is already deployed
   */
  title: string;

  /**
   * The type of item that is already deployed
   */
  type: string;
}

/**
 * A collection of key details from a solutions that leverage one or more reuse items
 */
export interface IReuseSolutions {
  /**
   * A collection of key details from a solution that leverages one or more reuse items
   * The key is the id of the deployed solution.
   */
  [key: string]: IReuseSolution;
}

/**
 * A collection of key details from a solution that leverages one or more reuse items
 */
export interface IReuseSolution {
  /**
   * The date/time the solution was created
   */
  created: number;

  /**
   * The title of the solution is already deployed
   */
  title: string;
}

/**
 * Collection of key details about one or more solutions
 */
export interface ISolutionInfos {
  /**
   * Key details about a solution
   * The key value is the solutions item id
   */
  [key: string]: ISolutionInfo;
}

/**
 * Key details about a solution
 */
export interface ISolutionInfo {
  /**
   * Array of template ids from the solution
   */
  templates: string[];
/**
 * A collection of key details from a solution that leverages one or more reuse items
 */
  solutionInfo: IReuseSolution;
}

/**
 * Find all deployed solutions and their items from the current org for the current user
 *
 * @param authentication Credentials for the request
 */
export function getDeployedSolutionsAndItems(
  authentication: UserSession
): Promise<ISolutionInfos> {
  return getDeployedSolutions(authentication).then(
    (searchResults: ISearchResult<IItem>) => {
      return getSolutionItemsFromDeployedSolutions(authentication, searchResults);
    }
  );
}

/**
 * Find all deployed solutions from the current org for the current user
 *
 * @param authentication Credentials for the request
 */
export function getDeployedSolutions(
  authentication: UserSession
): Promise<ISearchResult<IItem>> {
  const query = new SearchQueryBuilder()
  .match(authentication.username).in("owner").and()
  .match("Solution").in("type").and()
  .match("Deployed").in("typekeywords");
  return searchItems({
    q: query,
    num: 100,
    authentication
  })
  .then((searchResponse: ISearchResult<IItem>) => {
    // Sort the results by title and then id
    searchResponse.results.sort(
      (e1, e2) => {
        if (e1.title !== e2.title) {
          return e1.title < e2.title ? -1 : 1;
        } else {
          return e1.id < e2.id ? -1 : 1;
        }
      }
    );
    return searchResponse;
  });
}

/**
 * Find key details for the items from each of the deployed solutions
 *
 * @param authentication Credentials for the request
 * @param searchResults key details of the deployed solutions
 */
export function getSolutionItemsFromDeployedSolutions(
  authentication: UserSession,
  searchResults: ISearchResult<IItem>
): Promise<ISolutionInfos> {
  const promises = [];
  const itemIds = [];
  const solutions = {};
  if (searchResults?.results?.length > 0) {
    searchResults.results.forEach((r) => {
      itemIds.push(r.id);
      solutions[r.id] = {
        created: r.created,
        title: r.title
      }
      promises.push(getItemData(r.id, { authentication }));
    });
  }

  return Promise.all(promises).then(results => {
    return results.reduce((prev, cur, i) => {
      const id = itemIds[i];
      prev[id] = {
        templates: cur.templates.map(template => template.itemId),
        solutionInfo: solutions[id]
      };
      return prev;
    }, {});
  });
}

/**
 * Get the ids for each template in a solution
 *
 * @param authentication Credentials for the request
 */
export function getIdsFromSolutionTemplates(
  id: string,
  authentication: UserSession
): Promise<string[]> {
  return getItemData(id, { authentication }).then(data => {
    return data?.templates.map(t => t.itemId);
  })
}

/**
 * Fetch key details for the solution that will be deployed and find any solutions
 * that leverage any of the source items that exist in the solution to be deployed.
 *
 * @param id The id of the solution that will be deployed
 * @param authentication Credentials for the request
 */
export function findReusableSolutionsAndItems(
  id: string,
  authentication: UserSession
): Promise<IReuseItems> {
  return getItemHash(id, authentication).then(itemHash => {
    return getDeployedSolutionsAndItems(authentication).then(results => {
      const sourceIds = Object.keys(itemHash);
      Object.keys(results).forEach(solutionId => {
        const solution = results[solutionId];
        sourceIds.forEach(sourceId => {
          const itemKeys = Object.keys(itemHash[sourceId]);
          itemKeys.forEach(deployedId => {
            const item = itemHash[sourceId][deployedId];
            if (solution.templates.indexOf(deployedId) > -1 && Object.keys(item.solutions).indexOf(solutionId) < 0) {
              item.solutions[solutionId] = solution.solutionInfo;
            }
          });
        })
      });
      return itemHash;
    });
  })
}

/**
 * Fetch key details for the solution that will be deployed
 *
 * @param id The id of the solution that will be deployed
 * @param authentication Credentials for the request
 */
export function getItemHash(
  id: string,
  authentication: UserSession
): Promise<IReuseItems> {
  return getIdsFromSolutionTemplates(id, authentication).then(ids => {
    // search for existing items that reference any of these ids in their typeKeywords
    const promises = ids.map(id => {
      const q = `typekeywords:source-${id} owner:${authentication.username}`;
      const searchOptions = {
        q,
        authentication
      };
      return searchItems(searchOptions);
    });

    return Promise.all(promises).then(results => {
      // if we have a result from the typeKeyword search we need to understand what solution it came from and what its id is
      if (results.length > 0) {
        return results.reduce((prev: any, cur: any, i: number) => {
          // key is source id and value is any ids for items that were deployed based on this source
          prev[ids[i]] = cur.results.reduce((prev, cur) => {
            prev[cur.id] = {
              created: cur.created,
              solutions: {},
              title: cur.title,
              type: cur.type
            }
            return prev;
          }, {});
          return prev;
        }, {});
      } else {
        return undefined;
      }
    });
  });
}
