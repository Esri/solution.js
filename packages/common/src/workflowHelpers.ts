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

import * as zipUtils from "./zip-utils";

// ------------------------------------------------------------------------------------------------------------------ //

export function compressWorkflowIntoZipFile(
  //workflow: any
): Promise<File> {







  return Promise.resolve(new File([], ""));
}

export async function extractWorkflowFromZipFile(
    zipFile: File
): Promise<any> {
    const files = zipUtils.getZipFileContents(await zipUtils.blobToZip(zipFile));






    return Promise.resolve(files);
}


  /*const body = {
    "jobTemplateIds": [
      "string"
    ],
    "diagramIds": [
      "string"
    ],
    "includeOtherConfiguration": true,
    "passphrase": "string"
  };*/
  /*
  const diagramsUrl =  `/${orgId}/${itemId}/diagrams`;
  const individualDiagramUrl = `/${orgId}/${itemId}/diagrams/${diagramId}`;

  const jobTemplatesUrl = `/${orgId}/${itemId}/jobTemplates`;
  const individualJobTemplateUrl = `/${orgId}/${itemId}/jobTemplates/${jobTemplateId}`;

  "diagrams": [
    {
      "diagramId": "string",
      "diagramName": "string",
      "description": "string",
      "active": true,
      "draft": true
    }
  ]
  "jobTemplates": [
    {
      "jobTemplateId": "string",
      "jobTemplateName": "string",
      "description": "string",
      "category": "string",
      "diagramId": "string",
      "diagramName": "string",
      "state": "Draft"
    }
  ]
}*/
