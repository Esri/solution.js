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

import { IModel, getProp, failSafe } from "@esri/hub-common";
import { UserSession } from "@esri/solution-common";
import { moveItem } from "@esri/arcgis-rest-portal";

/**
 * Move the created site item, and optionally the Initiative, into
 * the solution folder
 * @param siteModel
 * @param folderId
 * @param authentication
 */
export function moveModelToFolder(
  siteModel: IModel,
  folderId: string,
  authentication: UserSession
): Promise<any> {
  // Fail-Safe the move call as it's not critical if it fails
  const failSafeMove = failSafe(moveItem, { success: true });

  const movePromises = [
    failSafeMove({
      itemId: siteModel.item.id,
      folderId,
      authentication
    })
  ];
  // if an initiative was created...
  if (getProp(siteModel, "item.properties.parentInitiativeId")) {
    movePromises.push(
      failSafeMove({
        itemId: siteModel.item.properties.parentInitiativeId,
        folderId,
        authentication
      })
    );
  }

  return Promise.all(movePromises);
}
