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

import { IItemTemplate, IPreProcessWorkflowTemplatesResponse, IZipObjectContentItem } from "./interfaces";
import * as restHelpersGet from "./restHelpersGet";
import * as zipUtils from "./zip-utils";
import { IPortal, IRequestOptions, request, UserSession } from "./arcgisRestJS";
import { removeGroup } from "./restHelpers";
import { getEnterpriseServers, getItemDataAsJson } from "./restHelpersGet";
import { createMimeTypedFile } from "./resources/copyDataIntoItem";
import { getProp } from "./generalHelpers";
import JSZip from "jszip";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Compresses a workflow configuration into a zip file.
 *
 * @param workflowConfig Workflow configuration
 * @returns Promise resolving with a zip file
 */
export async function compressWorkflowIntoZipFile(workflowConfig: any): Promise<File> {
  const zip = new JSZip();
  Object.keys(workflowConfig).forEach((key: string) => {
    zip.file(key, workflowConfig[key]);
  });

  const zipFile = createMimeTypedFile({
    blob: await zip.generateAsync({ type: "blob" }),
    filename: `workflow_configuration.zip`,
    mimeType: "application/zip",
  });

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
  authentication: UserSession,
): Promise<boolean> {
  // Get the id of the Workflow Manager Admin group because the group has to be deleted separately
  const data = await getItemDataAsJson(itemId, authentication);
  const adminGroupId = data?.groupId;

  // Delete the item
  const url = `${workflowBaseUrl}/admin/${itemId}`;

  const options: IRequestOptions = {
    authentication,
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${authentication.token}`,
      "X-Esri-Authorization": `Bearer ${authentication.token}`,
    },
    httpMethod: "DELETE" as any,
    params: {
      f: "json",
    },
  };

  const response = await request(url, options);

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
export async function extractWorkflowFromZipFile(zipFile: File): Promise<any> {
  const zippedFiles = await zipUtils.getZipObjectContents(await zipUtils.blobToZipObject(zipFile));

  const workflowConfig: any = {};
  zippedFiles.forEach((zippedFile: IZipObjectContentItem) => {
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
  authentication: UserSession,
): Promise<boolean> {
  try {
    const url = `${workflowBaseUrl}/checkStatus`;

    const options: IRequestOptions = {
      authentication,
      httpMethod: "GET",
      params: {
        f: "json",
      },
    };

    const response = await request(url, options);
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
  authentication: UserSession,
  portalResponse?: IPortal,
  orgId?: string,
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
    workflowServerUrl = await getWorkflowEnterpriseServerRootURL(portalRestURL, authentication);
  } else {
    // ArcGIS Online
    workflowServerUrl = portalResponse.helperServices?.workflowManager?.url ?? portalURL;
  }

  return Promise.resolve(orgId ? `${workflowServerUrl}/${orgId}` : `${workflowServerUrl}/workflow`);
}

/**
 * Get the URL for the Workflow Manager Enterprise application.
 *
 * @param portalRestUrl URL of the portal REST endpoint, e.g., "https://gisserver.domain.com/server/rest/services"
 * @param authentication Credentials for the request to AGO
 * @returns URL for the Workflow Manager Enterprise application (e.g., "https://abc123.esri.com:6443/arcgis"),
 * or an empty string if Workflow Manager is not enabled
 */
export async function getWorkflowEnterpriseServerRootURL(
  portalRestUrl: string,
  authentication: UserSession,
): Promise<string> {
  // Get the servers
  const servers = await getEnterpriseServers(portalRestUrl, authentication);

  // Find the Workflow Manager server
  const workflowServer = servers.find((server: any) => server.serverFunction === "WorkflowManager");
  if (!workflowServer) {
    return "";
  }
  return workflowServer.url as string;
}

/**
 * Remove feature service templates that will be auto-generated by Workflow when
 * creating the Workflow item.
 *
 * Also store key values from any Workflow items so we can update variables in other items.
 *
 * @param templates The list of all templates from the Solutions
 * @param templateDictionary Hash of facts: folder id, org URL, adlib replacements
 *
 * @returns An object that contains the items that should use standard deployment and
 * templates that will be deployed by Wokflow deployment.
 */
export function preprocessWorkflowTemplates(
  templates: IItemTemplate[],
  templateDictionary: any,
): IPreProcessWorkflowTemplatesResponse {
  const workflowItems = templates.filter((t) => t.type === "Workflow");

  const serviceIds = workflowItems.reduce((prev, cur) => {
    templateDictionary.workflows = { ...templateDictionary.workflows };
    templateDictionary.workflows[cur.itemId] = {};

    storeKeyWorkflowServiceId("viewSchema", templateDictionary, cur, prev);
    storeKeyWorkflowServiceId("workflowLocations", templateDictionary, cur, prev);
    storeKeyWorkflowServiceId("workflowSchema", templateDictionary, cur, prev);

    return prev;
  }, []);
  const workflowManagedTemplates = [];
  const deployTemplates = templates.filter((t) => {
    if (serviceIds.indexOf(t.itemId) < 0) {
      return true;
    } else {
      workflowManagedTemplates.push(t);
    }
  });

  return {
    deployTemplates,
    workflowManagedTemplates,
  };
}

/**
 * Store key values from any Workflow items so we can update variables in other items.
 *
 * @param key property from a workflow item that will contain an item id that we will need for variable replacement
 * @param templateDictionary Hash of facts: folder id, org URL, adlib replacements
 * @param template Workflow template
 * @param ids list of ids that will be auto generated by Workflow
 *
 */
export function storeKeyWorkflowServiceId(
  key: string,
  templateDictionary: any,
  template: IItemTemplate,
  ids: string[],
): void {
  const id = getProp(template, `data.${key}.itemId`).replace("{{", "").replace(".itemId}}", "");
  if (id && ids.indexOf(id) < 0) {
    ids.push(id);
  }
  templateDictionary.workflows[template.itemId][key] = id;
  templateDictionary[id] = {};
}

/**
 * Replace various IDs in the templates based on items that were created by Workflow
 *
 * @param templates The list of all templates from the Solutions
 * @param templateDictionary Hash of facts: folder id, org URL, adlib replacements
 *
 * @returns The updated collection of templates
 */
export function updateWorkflowTemplateIds(
  templates: IItemTemplate[],
  templateDictionary: any,
): IItemTemplate[] {
  if (templateDictionary.workflows) {
    Object.keys(templateDictionary.workflows).forEach((k) => {
      // the ids retained here are that of the source items
      // we justr need to swap them out in the templates arrey
      const workflowHash = templateDictionary.workflows[k];
      const viewSchemaId = workflowHash.viewSchema;
      const workflowLocationsId = workflowHash.workflowLocations;
      const workflowSchemaId = workflowHash.workflowSchema;

      const workflowIds = [viewSchemaId, workflowLocationsId, workflowSchemaId];

      templates = templates.map((t) => {
        if (workflowIds.indexOf(t.itemId) > -1) {
          t.dependencies = t.dependencies.map((d) => {
            if (workflowIds.indexOf(d) > -1) {
              d = templateDictionary[d].itemId;
            }
            return d;
          });
          t.itemId = templateDictionary[t.itemId].itemId;
        }
        return t;
      });
    });
  }
  return templates;
}

/**
 * Get the various dependencies from the workflow item and add them to the current templates dependency list
 *
 * @param template The IItemTemplate of the workflow item
 *
 */
export function getWorkflowDependencies(template: IItemTemplate): void {
  const data = template.data;
  if (data) {
    const keys = ["viewSchema", "workflowLocations", "workflowSchema"];
    keys.forEach((k) => {
      if (Object.keys(data).indexOf(k) > -1) {
        const id = data[k].itemId;
        if (id && template.dependencies.indexOf(id) < 0) {
          template.dependencies.push(id);
        }
      }
    });
  }
}
