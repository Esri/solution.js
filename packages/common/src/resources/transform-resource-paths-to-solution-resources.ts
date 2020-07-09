/** @license
 * Copyright 2020 Esri
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

import { ISolutionResource, SolutionResourceType } from "./solution-resource";
import { isGuid } from "@esri/hub-common";
/**
 * Convert an array of resource strings into an array of ISolutionResources
 *
 * Used to migrate Solutions to a more extensible resource schema
 * @param resourceStrings Array of resource paths
 */
export function transformResourcePathsToSolutionResources(
  resourceStrings: string[] = []
): ISolutionResource[] {
  return resourceStrings.map(transformResourcePathToSolutionResource);
}

/**
 * Convert a resource path to a ISolutionResource
 * @param resourcePath String
 */
export function transformResourcePathToSolutionResource(
  resourcePath: string
): ISolutionResource {
  return {
    filename: _extractFilenameFromResourcePath(resourcePath),
    type: _getSolutionResourceTypeFromResourcePath(resourcePath),
    path: _extractPathFromResourcePath(resourcePath),
    sourceUrl: resourcePath
  } as ISolutionResource;
}

/**
 * Convert a resource path to a SolutionResourceType
 * @param resourcePath String
 */
export function _getSolutionResourceTypeFromResourcePath(
  resourcePath: string
): SolutionResourceType {
  let type = SolutionResourceType.resource;

  const folder =
    resourcePath
      .split("/")
      .slice(0, -1)
      .join("/") || "";

  PATH_TO_TYPE_MAP.forEach(entry => {
    if (folder.endsWith(entry.ending)) {
      type = entry.type;
    }
  });

  return type;
}

/**
 * Mapping of strings that have been appended to the resource path to
 * encode the resource type
 */
const PATH_TO_TYPE_MAP = [
  { ending: "_info_thumbnail", type: SolutionResourceType.thumbnail },
  { ending: "_info_metadata", type: SolutionResourceType.metadata },
  { ending: "_info_data", type: SolutionResourceType.data },
  { ending: "_info_dataz", type: SolutionResourceType.fakezip },
  { ending: "_info", type: SolutionResourceType.info }
];

/**
 * Extract the filename from a path
 * @param path String that is a path
 * @private
 */
export function _extractFilenameFromResourcePath(path: string): string {
  // if we have path separators, split and grab last segment
  if (path.indexOf("/") > -1) {
    return path.split("/").reverse()[0];
  } else {
    // Hub resources are {guid}-{filename.ext}
    if (path.indexOf("-") === 32) {
      // start at 33 to remove the `-` between the filename and the guid
      return path.substr(33, path.length - 1);
    } else {
      // path is the filename
      return path;
    }
  }
}

/**
 * Convert the resource path into the correct output path
 * (aka resource prefix)
 *
 * Original resource paths encoded information in the path
 * including actual sub-folders. The logic is kinda complex
 * thus this function has extensive tests
 * @param path
 * @private
 */
export function _extractPathFromResourcePath(resourcePath: string): string {
  // default case
  let path = "";
  // parse up the path by splittins on `/` and dropping the last segment
  const parsedPath =
    resourcePath
      .split("/")
      .slice(0, -1)
      .join("/") || "";
  // if we got something...
  if (parsedPath) {
    // now we need to see if this has any of the well-known endings
    const isWellKnownPath = PATH_TO_TYPE_MAP.reduce((acc, entry) => {
      if (parsedPath.endsWith(entry.ending)) {
        acc = true;
      }
      return acc;
    }, false);

    // if it does not match a well-known path...
    if (!isWellKnownPath && parsedPath.indexOf("http") !== 0) {
      // see if there is another folder encoded...
      if (parsedPath.indexOf("_") > -1) {
        path = parsedPath.split("_")[1];
      } else {
        // if the path is not a naked guid, we return the parsed path
        if (!isGuid(parsedPath)) {
          path = parsedPath;
        }
      }
    }
  }

  return path;
}
