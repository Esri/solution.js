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
  groupId: string,
  templateDictionary: any,
  portalSubset: IPortalSubset,
  destinationUserSession: auth.IUserRequestOptions
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // Fetch group item info
    common.getGroupContents(groupId, destinationUserSession).then(
      groupMemberIds => {
        console.log(JSON.stringify(groupMemberIds, null, 2));

        // Create new solution item using group item info

        // Fetch group contents

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
