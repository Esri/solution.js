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
 * Provides tests for removing items from AGO.
 */

import * as interfaces from "../../src/interfaces";
import * as portal from "@esri/arcgis-rest-portal";
import * as removeItems from "../../src/deleteHelpers/removeItems";
import * as utils from "../mocks/utils";
import * as workflowHelpers from "../../src/workflowHelpers";

// ------------------------------------------------------------------------------------------------------------------ //

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

describe("Module `removeItems`: removing items from AGO", () => {
  it("handles defaulting all options", async () => {
    const solutionSummary: interfaces.ISolutionPrecis = {
      id: "sln1234567890",
      title: "Solution Title",
      folder: "fld1234567890",
      items: [
        {
          id: "itm1234567890",
          type: "Workflow",
          title: "Item Title",
          modified: 1234567890,
          owner: "fred",
        },
      ],
      groups: [],
    };

    spyOn(portal, "unprotectItem").and.resolveTo(utils.getSuccessResponse());
    spyOn(workflowHelpers, "deleteWorkflowItem").and.resolveTo(true);
    spyOn(workflowHelpers, "getWorkflowBaseURL").and.resolveTo("https://workflow.arcgis.com/workflow");

    const expectedResult: interfaces.ISolutionPrecis[] = [
      {
        // Successful deletions
        id: "sln1234567890",
        title: "Solution Title",
        folder: "fld1234567890",
        items: [
          {
            id: "itm1234567890",
            type: "Workflow",
            title: "Item Title",
            modified: 1234567890,
            owner: "fred",
          },
        ],
        groups: [],
      },
      {
        // Failed deletions
        id: "sln1234567890",
        title: "Solution Title",
        folder: "fld1234567890",
        items: [],
        groups: [],
      },
    ];

    const result: interfaces.ISolutionPrecis[] = await removeItems.removeItems(
      solutionSummary,
      [], // hubSiteItemIds
      MOCK_USER_SESSION,
      50, // percentDone
      10, // progressPercentStep
      {}, // deleteOptions
    );

    expect(result).toEqual(expectedResult);
  });
});
