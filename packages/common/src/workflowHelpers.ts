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
 */

/**
 * Provides common functions compressing and decompressing workflow configurations.
 *
 * @module workflowHelpers
 */

import * as interfaces from "./interfaces";
import * as zipUtils from "./zip-utils";
import { createMimeTypedFile } from "./resources/copyDataIntoItem";
import { getAgoIdRegEx } from "./generalHelpers";
import { IRequestOptions, request } from "@esri/arcgis-rest-request";
import JSZip from "jszip";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Compresses a workflow configuration into a zip file.
 *
 * @param workflowConfig Workflow configuration
 * @returns Promise resolving with a zip file
 */
export async function compressWorkflowIntoZipFile(
  workflowConfig: any
): Promise<File> {
  const zip = new JSZip();
  Object.keys(workflowConfig).forEach((key: string) => {
    zip.file(key, JSON.stringify(workflowConfig[key]));
  });

  const zipFile = createMimeTypedFile({
    blob: await zip.generateAsync({ type: "blob" }),
    filename: `workflow_configuration.zip`,
    mimeType: "application/zip"
  })

  return Promise.resolve(zipFile);
}

/**
 * Extracts a workflow configuration from a zip file into a JSON object.
 *
 * @param zipFile Zip file containing a workflow configuration
 * @returns Promise resolving with a workflow configuration as JSON object, with each file being a key
 */
export async function extractWorkflowFromZipFile(
  zipFile: File
): Promise<any> {
  const zippedFiles = await zipUtils.getZipObjectContents(await zipUtils.blobToZipObject(zipFile));

  const workflowConfig: any = {};
  zippedFiles.forEach((zippedFile: interfaces.IZipObjectContentItem) => {
    workflowConfig[zippedFile.file] = zippedFile.content;
  });

  return Promise.resolve(workflowConfig);
}

/**
 * Extracts a workflow configuration from a zip file into a JSON object, with all AGO ids in the
 * configuration templatized.
 *
 * @param zipFile Zip file containing a workflow configuration
 * @returns Promise resolving with a workflow configuration as JSON object, with each file being a key
 */
export async function extractAndTemplatizeWorkflowFromZipFile(
  zipFile: File
): Promise<any> {
  const workflowConfig = await extractWorkflowFromZipFile(zipFile);

  // Replace AGO ids with templatized versions
  let workflowConfigStr = JSON.stringify(workflowConfig);
  const matches = workflowConfigStr.match(getAgoIdRegEx()) || [];
  matches.forEach((match: string) => {
    workflowConfigStr = workflowConfigStr.replace(new RegExp(match, "g"), `{{${match}}}`);
  });

  return Promise.resolve(JSON.parse(workflowConfigStr));
}

/**
 * Check the license capability of Workflow Manager Server.

 * @param orgId Id of organization whose license is to be checked
 * @param authentication Credentials for the request to AGO
 * @param enterpriseWebAdaptorUrl URL of the enterprise web adaptor, e.g., "https://gisserver.domain.com/server"
 * @returns Promise resolving with a boolean indicating whether the organization has the license
 */
export async function getWorkflowManagerAuthorized(
  orgId: string,
  authentication: interfaces.UserSession,
  enterpriseWebAdaptorUrl?: string
): Promise<boolean> {
  const url = enterpriseWebAdaptorUrl
    ? `${enterpriseWebAdaptorUrl}/workflow/${orgId}/checkStatus`
    : `https://workflow.arcgis.com/${orgId}/checkStatus`;
  const options: IRequestOptions = {
    authentication,
    httpMethod: "GET",
    params: {
      f: "json"
    }
  };
  const response = await request(url, options);
  const isAuthorized = response?.hasAdvancedLicense || false;
  return Promise.resolve(isAuthorized);
}