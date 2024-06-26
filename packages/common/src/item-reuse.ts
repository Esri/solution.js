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

export interface IDeployedSolutionsAndItems  {
  creationDate: string;
  id: string;
  title: string;
  type: string;
  items: IDeployedItem[];
}

export interface IDeployedItem {
  creationDate: string;
  id: string;
  title: string;
  type: string;
}

export function getDeployedSolutionsAndItems(
  authentication: UserSession
): Promise<any> {
  return getDeployedSolutions(authentication).then(
    (searchResults: ISearchResult<IItem>) => {
      return getSolutionItemsFromDeployedSolutions(authentication, searchResults);
    }
  );
}

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

export function getSolutionItemsFromDeployedSolutions(
  authentication: UserSession,
  searchResults: ISearchResult<IItem>
): Promise<any> {
  const promises = [];
  const itemIds = [];
  if (searchResults?.results?.length > 0) {
    searchResults.results.forEach(r => {
      itemIds.push(r.id);
      promises.push(getItemData(r.id, { authentication }));
    });
  }

  return Promise.all(promises).then(results => {
    return results.reduce((prev, cur, i) => {
      prev[itemIds[i]] = cur.templates.map(template => template.itemId);
      return prev;
    }, {});
  });
}

export function findReusableSolutionsAndItems(
  id: string,
  authentication: UserSession
) {
  return getItemHash(id, authentication).then(itemHash => {
    return getDeployedSolutionsAndItems(authentication).then(results => {
      console.log("results")
      console.log(results)

      const ids = Object.keys(itemHash);
      Object.keys(results).forEach(solutionId => {
        const solutionItemIds = results[solutionId];
        ids.forEach(id => {
          const items = itemHash[id]
          items.forEach(item => {
            if (solutionItemIds.indexOf(item.id) > -1 && item.solutions.indexOf(solutionId) < 0) {
              item.solutions.push(solutionId);
            }
          });
        })
      });
      return itemHash;
    });
  })
}

export function getItemHash(
  id: string,
  authentication: UserSession
) {
  return getIdsFromSolutionTemplates(id, authentication).then(ids => {
    // search for existing items that reference any of these ids in their typeKeywords
    //const q = `typekeywords:source-${template.itemId} type:${template.item.type} owner:${templateDictionary.user.username}`;
    const promises = ids.map(id => {
      const q = `typekeywords:source-${id} owner:${authentication.username}`;
      const searchOptions = {
        q,
        authentication,
        pagingParam: { start: 1, num: 100 }
      };
      return searchItems(searchOptions);
    });

    return Promise.all(promises).then(results => {
      // if we have a result from the typeKeyword search we need to understand what solution it came from and what its id is
      if (results.length > 0) {
        return results.reduce((prev: any, cur: any, i: number) => {
          // key is source id and value is any ids for items that were deployed based on this source
          prev[ids[i]] = cur.results.map(r => {
            return {
              created: r.created,
              id: r.id,
              solutions: [],
              title: r.title,
              type: r.type
            };
          });
          return prev;
        }, {});
      } else {
        return undefined;
      }
    });
  });
}

export function getIdsFromSolutionTemplates(
  id: string,
  authentication: UserSession
) {
  return getItemData(id, { authentication }).then(data => {
    return data?.templates.map(t => t.itemId);
  })
}