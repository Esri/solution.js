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
import * as request from "@esri/arcgis-rest-request";
import * as restHelpersGet from "./restHelpersGet";
import * as zipUtils from "./zip-utils";
import { removeGroup } from "./restHelpers";
import { getEnterpriseServers, getItemDataAsJson } from "./restHelpersGet";
import { createMimeTypedFile } from "./resources/copyDataIntoItem";
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
    zip.file(key, workflowConfig[key]);
  });

  const zipFile = createMimeTypedFile({
    blob: await zip.generateAsync({ type: "blob" }),
    filename: `workflow_configuration.zip`,
    mimeType: "application/zip"
  })

  return Promise.resolve(zipFile);
}

/**
 * Deletes a workflow.
 *
 * @param itemId Id of the workflow item
 * @param workflowBaseUrl URL of the workflow manager, e.g., "https://workflow.arcgis.com/orgId"
 * @param authentication Credentials for the request to AGOL
 * @returns Promise resolving with success or faliure of the request
 */
export async function deleteWorkflowItem(
  itemId: string,
  workflowBaseUrl: string,
  authentication: interfaces.UserSession,
): Promise<boolean> {
  // Get the id of the Workflow Manager Admin group because the group has to be deleted separately
  const data = await getItemDataAsJson(itemId, authentication);
  const adminGroupId = data?.groupId;

  // Delete the item
  const url = `${workflowBaseUrl}/admin/${itemId}`;

  const options: request.IRequestOptions = {
    authentication,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${authentication.token}`,
      "X-Esri-Authorization": `Bearer ${authentication.token}`
    },
    httpMethod: "DELETE" as any,
    params: {
      f: "json"
    }
  };

  const response = await request.request(url, options);

  // Delete the admin group
  if (adminGroupId) {
    await removeGroup(adminGroupId, authentication);
  }

  return Promise.resolve(response.success);
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
 * Check the license capability of Workflow Manager Server.
 *
 * @param workflowBaseUrl URL of the workflow manager, e.g., "https://workflow.arcgis.com/orgId"
 * @param authentication Credentials for the request to AGO
 * @returns Promise resolving with a boolean indicating whether the organization has the license
 * @throws {WorkflowJsonExceptionDTO} if request to workflow manager fails
 */
export async function getWorkflowManagerAuthorized(
  workflowBaseUrl: string,
  authentication: interfaces.UserSession
): Promise<boolean> {
  try {
    const url = `${workflowBaseUrl}/checkStatus`;

    const options: request.IRequestOptions = {
      authentication,
      httpMethod: "GET",
      params: {
        f: "json"
      }
    };

    const response = await request.request(url, options);
    const isAuthorized = response?.hasAdvancedLicense || false;
    return Promise.resolve(isAuthorized);
  } catch (err) {
    // User is not authorized for Workflow Manager
    return Promise.resolve(false);
  }
}

/**
 * Determines the URL to the Workflow Manager.
 *
 * @param authentication Authenticated user session
 * @param portalResponse Response from portal "self" call; will be fetched if not supplied
 * @param orgId Id of organization whose license is to be checked; if truthy, the URL will be for AGO;
 * if falsy, the URL will be for Workflow Manager Enterprise
 * @returns A URL based on ArcGIS Online or Enterprise, e.g., "https://abc123.esri.com:6443/arcgis"
 */
export async function getWorkflowBaseURL(
  authentication: interfaces.UserSession,
  portalResponse?: interfaces.IPortal,
  orgId?: string
): Promise<string> {
  let workflowServerUrl: string;

  if (!portalResponse) {
    const user = await restHelpersGet.getUser(authentication);
    orgId = orgId ?? user.orgId;

    portalResponse = await restHelpersGet.getPortal("", authentication);
  }

  const portalURL = `https://${portalResponse.portalHostname}`;
  const portalRestURL = `${portalURL}/sharing/rest`;

  if (portalResponse.isPortal) {
    // Enterprise
    workflowServerUrl = await _getWorkflowEnterpriseServerRootURL(portalRestURL, authentication);
  } else {
    // ArcGIS Online
    workflowServerUrl = portalResponse.helperServices?.workflowManager?.url ?? portalURL;
  }

  return Promise.resolve(
    orgId
    ? `${workflowServerUrl}/${orgId}`
    : `${workflowServerUrl}/workflow`
  );
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Get the URL for the Workflow Manager Enterprise application.
 *
 * @param portalRestUrl URL of the portal REST endpoint, e.g., "https://gisserver.domain.com/server/rest/services"
 * @param authentication Credentials for the request to AGO
 * @returns URL for the Workflow Manager Enterprise application (e.g., "https://abc123.esri.com:6443/arcgis"),
 * or an empty string if Workflow Manager is not enabled
 */
export async function _getWorkflowEnterpriseServerRootURL(
  portalRestUrl: string,
  authentication: interfaces.UserSession
): Promise<string> {
  // Get the servers
  const servers = await getEnterpriseServers(portalRestUrl, authentication);

  // Find the Workflow Manager server
  const workflowServer = servers.find(
    (server: any) => server.serverFunction === "WorkflowManager"
  );
  if (!workflowServer) {
    return "";
  }
  return workflowServer.url as string;
}