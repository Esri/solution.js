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

import { ISourceFile, ISourceFileCopyPath, UserSession } from "../interfaces";
import { getBlobAsFile } from "../restHelpersGet";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Fetches a set of resources defined by paths.
 *
 * @param resourceItemFilePaths Paths to resources in source
 * @param authentication Credentials for the request to the source
 * @returns A promise which resolves with an array of resource files
 */
export function getItemResourcesFilesFromPaths(
  resourceItemFilePaths: ISourceFileCopyPath[],
  authentication: UserSession
): Promise<ISourceFile[]> {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  return Promise.all(
    resourceItemFilePaths.map(fileInfo => {
      return new Promise<ISourceFile>(resolve => {
        getBlobAsFile(fileInfo.url, fileInfo.filename, authentication).then(
          file => {
            resolve({
              itemId: fileInfo.itemId,
              file,
              folder: fileInfo.folder,
              filename: fileInfo.filename
            } as ISourceFile);
          },
          () => {
            if (fileInfo.filename !== "metadata.xml") console.log("failed fetch " + fileInfo.folder + "/" + fileInfo.filename);//???
            resolve(null);
          }
        );
      });
    })
  ).then((files: ISourceFile[]) => {
    // Discard failures
    return files.filter(file => !!file);
  });
}
