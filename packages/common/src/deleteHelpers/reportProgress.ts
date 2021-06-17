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
 * @module reportProgress
 */

import {
  EItemProgressStatus,
  SItemProgressStatus,
  IDeleteSolutionOptions
} from "../interfaces";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Reports progress as specified via options.
 *
 * @param percentDone Percent done in range 0 to 100
 * @param deleteOptions Reporting options
 * @param deletedItemId Id of item deleted
 */
export function reportProgress(
  percentDone: number,
  deleteOptions: IDeleteSolutionOptions,
  deletedItemId = "",
  status = EItemProgressStatus.Started
): void {
  const iPercentDone = Math.round(percentDone);

  /* istanbul ignore else */
  if (deleteOptions.progressCallback) {
    deleteOptions.progressCallback(iPercentDone, deleteOptions.jobId, {
      event: "",
      data: deletedItemId
    });
  }

  /* istanbul ignore else */
  if (deleteOptions.consoleProgress) {
    console.log(
      Date.now(),
      deletedItemId,
      deleteOptions.jobId ?? "",
      SItemProgressStatus[status],
      iPercentDone + "%"
    );
  }
}
