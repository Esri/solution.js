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
 * @param authentication Credentials for the request to AGOL
 * @returns Promise resolving with success or faliure of the request
 */
export async function deleteWorkflowItem(
  itemId: string,
  authentication: interfaces.UserSession,
): Promise<boolean> {
  // Get the user
  const user: interfaces.IUser = await authentication.getUser(authentication);
  const orgId = user.orgId;

  const portal = await authentication.getPortal({ authentication});
  const workflowURL: string | undefined = portal.helperServices?.workflowManager?.url;
  if (!workflowURL) {
    return Promise.reject({
      message: "Workflow Manager is not enabled for this organization."
    });
  }

  // Get the id of the Workflow Manager Admin group because the group has to be deleted separately
  const data = await getItemDataAsJson(itemId, authentication);
  const adminGroupId = data?.groupId;

  // Delete the item
  const workflowUrlRoot = getWorkflowManagerUrlRoot(orgId, workflowURL);
  const url = `${workflowUrlRoot}/admin/${itemId}`;

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
 * @param orgId Id of organization whose license is to be checked; only used if `enterpriseWebAdaptorUrl` is falsy
 * @param workflowURL URL of the workflow manager, e.g., "https://workflow.arcgis.com"
 * @param authentication Credentials for the request to AGO
 * @returns Promise resolving with a boolean indicating whether the organization has the license
 * @throws {WorkflowJsonExceptionDTO} if request to workflow manager fails
 */
export async function getWorkflowManagerAuthorized(
  orgId: string | undefined,
  workflowURL: string,
  authentication?: interfaces.UserSession
): Promise<boolean> {
  try {
    const workflowUrlRoot = getWorkflowManagerUrlRoot(orgId, workflowURL);
    const url = `${workflowUrlRoot}/checkStatus`;

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
 * Get the URL for the Workflow Manager Enterprise application.
 *
 * @param portalRestUrl URL of the portal REST endpoint, e.g., "https://gisserver.domain.com/server/rest/services"
 * @param authentication Credentials for the request to AGO
 * @returns URL for the Workflow Manager Enterprise application, or an empty string if Workflow Manager is not enabled
 */
export async function getWorkflowEnterpriseServerURL(
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

/**
 * Get the root URL for the Workflow Manager application.
 *
 * @param orgId Id of organization whose license is to be checked; if truthy, the URL will be for AGO;
 * if falsy, the URL will be for Workflow Manager Enterprise
 * @param workflowURL URL of the workflow manager, e.g., "https://workflow.arcgis.com"
 * @returns URL for the Workflow Manager application
 */
export function getWorkflowManagerUrlRoot(
  orgId: string | undefined,
  workflowURL: string
): string {
  return orgId
    ? `${workflowURL}/${orgId}`
    : `${workflowURL}/workflow`;
}

/**
 * Determines the Workflow Manager URL to use for the deployment if not supplied.
 *
 * @param workflowURL Existing workflow URL; if supplied, it's simply returned
 * @param portalResponse Response from portal "self" call
 * @param authentication Authenticated user session
 * @returns workflowURL or a URL based on ArcGIS Online or Enterprise
 */
export async function getWorkflowURL(
  workflowURL: string,
  portalResponse: interfaces.IPortal,
  authentication: interfaces.UserSession
): Promise<string> {
  if (!workflowURL) {
    const portalURL = `https://${portalResponse.portalHostname}`;
    const portalRestURL = `${portalURL}/sharing/rest`;

    if (portalResponse.isPortal) {
      // Enterprise
      workflowURL = await getWorkflowEnterpriseServerURL(portalRestURL, authentication);
    } else {
      // ArcGIS Online
      workflowURL = portalResponse.helperServices?.workflowManager?.url ?? portalURL;
    }
  }
  return Promise.resolve(workflowURL);
}