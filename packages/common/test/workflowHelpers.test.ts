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
 * Provides tests for functions involving deployment of workflow items via the REST API.
 */

import * as interfaces from "../src/interfaces";
import * as utils from "../../common/test/mocks/utils";
import * as workflowHelpers from "../src/workflowHelpers";
import JSZip from "jszip";

// ------------------------------------------------------------------------------------------------------------------ //

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

describe("Module `workflowHelpers`", () => {

  describe("compressWorkflowIntoZipFile", () => {
    it("initial test", async () => {
      /*const zipFile =*/ await workflowHelpers.compressWorkflowIntoZipFile();
    });
  });

  describe("extractWorkflowFromZipFile", () => {
    it("initial test", async () => {
      const sampleWorkflowConfig = await generateWorkflowZipFile();
      const zipFile = await workflowHelpers.extractWorkflowFromZipFile(sampleWorkflowConfig);
    });
  });

});

export function generateWorkflowZipFile(
): Promise<File> {
  const zip = new JSZip();
  return zip.generateAsync({ type: "blob" })
  .then((blob) => {
    return Promise.resolve(new File([blob], "workflow.zip"));
  });
}
