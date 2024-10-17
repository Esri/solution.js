/** @license
 * Copyright 2021 Esri
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
 * Provides functions for accessing a complete item.
 *
 * @module completeItem
 */

import { UserSession } from "./arcgisRestJS";
import { ICompleteItem } from "./interfaces";
import * as restHelpers from "./restHelpers";
import * as restHelpersGet from "./restHelpersGet";
import * as workflowHelpers from "./workflowHelpers";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Gets everything about an item.
 *
 * @param itemId Id of an item whose information is sought
 * @param authentication Credentials for the request
 * @returns Promise that will resolve with everything known about the item
 */
export async function getCompleteItem(itemId: string, authentication: UserSession): Promise<ICompleteItem> {
  const itemBase: any = await restHelpersGet.getItemBase(itemId, authentication);

  const responses = await Promise.all([
    restHelpersGet.getItemDataAsFile(itemId, itemBase.name, authentication),
    restHelpersGet.getItemThumbnailAsFile(itemId, itemBase.thumbnail, false, authentication),
    restHelpersGet.getItemMetadataAsFile(itemId, authentication),
    restHelpersGet.getItemResourcesFiles(itemId, authentication),
    restHelpersGet.getItemRelatedItemsInSameDirection(itemId, "forward", authentication),
    restHelpersGet.getItemRelatedItemsInSameDirection(itemId, "reverse", authentication),
  ]);

  const [itemData, itemThumbnail, itemMetadata, itemResources, itemFwdRelatedItems, itemRevRelatedItems] = responses;
  // Summarize what we have
  // ----------------------
  // (itemBase: IItem)  text/plain JSON
  // (itemData: File)  */*
  // (itemThumbnail: File)  image/*
  // (itemMetadata: File)  application/xml
  // (itemResources: File[])  list of */*
  // (itemFwdRelatedItems: IRelatedItems[])  list of forward relationshipType/relatedItems[] pairs
  // (itemRevRelatedItems: IRelatedItems[])  list of reverse relationshipType/relatedItems[] pairs
  const completeItem: ICompleteItem = {
    base: itemBase,
    data: itemData,
    thumbnail: itemThumbnail,
    metadata: itemMetadata,
    resources: itemResources,
    fwdRelatedItems: itemFwdRelatedItems,
    revRelatedItems: itemRevRelatedItems,
  };

  if (itemBase.type === "Feature Service") {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    completeItem.featureServiceProperties = await restHelpers.getFeatureServiceProperties(itemBase.url, authentication);
  } else if (itemBase.type === "Workflow") {
    const workflowBaseUrl = await workflowHelpers.getWorkflowBaseURL(authentication);
    const workflowConfigZip = await restHelpers.getWorkflowConfigurationZip(
      itemBase.id,
      workflowBaseUrl,
      authentication,
    );
    completeItem.workflowConfiguration = await workflowHelpers.extractWorkflowFromZipFile(workflowConfigZip);
  }

  return Promise.resolve(completeItem);
}
