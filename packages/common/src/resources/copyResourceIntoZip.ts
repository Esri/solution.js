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

import {
  IAssociatedFileCopyResults,
  IAssociatedFileInfo,
  ISourceFile,
  IZipInfo,
  ArcGISIdentityManager
} from "../interfaces";
import { createCopyResults } from "./createCopyResults";
import { getBlobAsFile } from "../restHelpersGet";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Copies a resource into a zipfile.
 *
 * @param file Information about the source and destination of the file such as its URL, folder, filename
 * @param zipInfo Information about a zipfile such as its name and its zip object
 * @returns The result of the copy
 */
export function copyResourceIntoZip(
  file: ISourceFile,
  zipInfo: IZipInfo
): IAssociatedFileCopyResults {
  // Add it to the zip
  if (file.folder) {
    zipInfo.zip
      .folder(file.folder)
      .file(file.filename, file.file, { binary: true });
  } else {
    zipInfo.zip.file(file.filename, file.file, { binary: true });
  }
  zipInfo.filelist.push(file);
  return createCopyResults(file, true) as IAssociatedFileCopyResults;
}

/**
 * Copies a resource into a zipfile.
 *
 * @param fileInfo Information about the source and destination of the file such as its URL, folder, filename
 * @param sourceAuthentication Credentials for the request to the source
 * @param zipInfo Information about a zipfile such as its name and its zip object
 * @returns A promise which resolves to the result of the copy
 */
export function copyResourceIntoZipFromInfo(
  fileInfo: IAssociatedFileInfo,
  sourceAuthentication: ArcGISIdentityManager,
  zipInfo: IZipInfo
): Promise<IAssociatedFileCopyResults> {
  return new Promise<IAssociatedFileCopyResults>(resolve => {
    getBlobAsFile(fileInfo.url, fileInfo.filename, sourceAuthentication).then(
      (file: any) => {
        // And add it to the zip
        if (fileInfo.folder) {
          zipInfo.zip
            .folder(fileInfo.folder)
            .file(fileInfo.filename, file, { binary: true });
        } else {
          zipInfo.zip.file(fileInfo.filename, file, { binary: true });
        }
        zipInfo.filelist.push(fileInfo);
        resolve(
          createCopyResults(fileInfo, true) as IAssociatedFileCopyResults
        );
      },
      () =>
        resolve(
          // unable to get resource
          createCopyResults(fileInfo, false) as IAssociatedFileCopyResults
        )
    );
  });
}
