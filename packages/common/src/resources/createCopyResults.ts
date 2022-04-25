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

import { IAssociatedFileCopyResults, IZipCopyResults } from "../interfaces";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Generates IAssociatedFileCopyResults object.
 *
 * @param fileInfo Info about item that was to be copied
 * @param fetchedFromSource Status of fetching item from source
 * @param copiedToDestination Status of copying item to destination
 * @returns IAssociatedFileCopyResults object
 */
export function createCopyResults(
  fileInfo: any,
  fetchedFromSource: boolean,
  copiedToDestination?: boolean
): IAssociatedFileCopyResults | IZipCopyResults {
  return {
    ...fileInfo,
    fetchedFromSource,
    copiedToDestination
  };
}
