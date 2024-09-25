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
 * Provides tests for functions involving deployment of workflow items.
 */

import * as common from "@esri/solution-common";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as templates from "../../common/test/mocks/templates";
import * as utils from "../../common/test/mocks/utils";
import * as workflowHelpers from "../src/workflowHelpers";
const fetchMock = require("fetch-mock");

// ------------------------------------------------------------------------------------------------------------------ //

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

afterEach(() => {
  fetchMock.restore();
});

describe("Module `workflowHelpers`", () => {
  describe("addWorkflowItem", () => {
    it("basically works", async () => {
      const itemId = "wfw1234567890";

      const agolItem = templates.getItemTemplate("Workflow");
      agolItem.thumbnail = null;

      spyOn(common, "request").and.resolveTo({
        success: true,
        itemId,
      });

      spyOn(common, "getItemBase").and.callFake(() => {
        return Promise.resolve(mockItems.getAGOLItem("Workflow", "", itemId) as common.IItem);
      });

      const createdItemId = await workflowHelpers.addWorkflowItem(
        agolItem,
        "https://arcgis.com/orgId",
        MOCK_USER_SESSION,
      );

      expect(createdItemId).toEqual(itemId);
    });
  });

  describe("fetchAuxiliaryItems", () => {
    it("handles failure to add workflow item", async () => {
      const itemId = "wfw1234567890";

      const searchItemsSpy = spyOn(common, "searchItems").and.resolveTo({
        results: [{ id: "item1" }, { id: "item2" }, { id: "item3" }],
      } as common.ISearchResult<common.IItem>);

      const auxiliaryItemsIds = await workflowHelpers.fetchAuxiliaryItems(itemId, MOCK_USER_SESSION);

      expect(searchItemsSpy.calls.count()).toBe(1);
      expect((searchItemsSpy.calls.argsFor(0)[0] as any).q).toBe(
        "title:workflow_wfw1234567890 OR title:WorkflowLocations_wfw1234567890 OR title:workflow_views_wfw1234567890",
      );

      expect(auxiliaryItemsIds).toEqual(["item1", "item2", "item3"]);
    });
  });

  describe("postProcessFormItems", () => {
    it("updates the dependencies of the workflow item from its configuration", () => {
      const templatesList = [templates.getItemTemplate("Workflow")];
      templatesList[0].dependencies = [
        "3d8ce2442920473ba735470e07427614",
        "61918b9f50ac4b569200194aa615d9d1",
        "b594de65c4ad4e7fa812528f879f2404",
        "3819f129d0704404bdbb50d4a565e80a",
      ];
      templatesList[0].properties = {
        configuration: {
          "diagrams.json":
            '[{"diagram_id":"sqVI1V4vQ1K9hBDheI1i0Q","diagram_version":9,"diagram_name":"New Tree Request","description":"Handle a new Tree Service Request","diagram_details":"{\\"initialStepId\\":\\"3701ae2f-62c8-4417-aa9d-5c8c6ffd8b48\\",\\"initialStepName\\":\\"Send Email\\",\\"steps\\":[{\\"id\\":\\"3701ae2f-62c8-4417-aa9d-5c8c6ffd8b48\\",\\"name\\":\\"Send Email\\",\\"description\\":\\"Send an email to specified recipients. Job attachments can be included with the email.\\",\\"stepTemplateId\\":\\"AVw8eAS3yiKjHtuS9dEZ\\",\\"automatic\\":true,\\"proceedNext\\":true,\\"canSkip\\":false,\\"position\\":\\"200, -100, 120, 60\\",\\"shape\\":1,\\"color\\":\\"170, 184, 242\\",\\"action\\":{\\"actionType\\":\\"Email\\",\\"args\\":{\\"subject\\":\\"\'New \' +jobExtendedProperty($job, \'tree_request\', \'reqtype\') + \' Request Submitted\'\\",\\"body\\":\\"&#39;<p><b>Details: </b>&#39; &#43; jobExtendedProperty($job, &#39;tree_request&#39;, &#39;details&#39;) &#43; &#39;</p>&#39; &#43; &#39;<p><b>Location: </b>&#39; &#43; jobExtendedProperty($job, &#39;tree_request&#39;, &#39;locdesc&#39;) &#43; &#39;</p>&#39; &#43; &#39;<a href=\\\\\\"{{portalBaseUrl}}/apps/workflowmanager/{{661e0e38d4ad4a8f97731b22cb6c95dd.itemId}}/work\\\\\\">Triage &#39; &#43; JobName($Job) &#43; &#39;</a>&#39;\\",\\"notificationServiceRecipients\\":{\\"toUsers\\":[\\"\\\\\\"$currentUser\\\\\\"\\"]}}},\\"paths\\":[{\\"nextStep\\":\\"1fb54c73-f386-4a84-b8ad-5fe808a5fbe3\\",\\"expression\\":\\"$retVal == $stepSuccess\\",\\"points\\":[{\\"x\\":263,\\"y\\":100},{\\"x\\":338,\\"y\\":100}],\\"ports\\":[\\"RIGHT\\",\\"LEFT\\"],\\"assignedType\\":\\"Unassigned\\",\\"notifications\\":[],\\"isAssignedToCustomExpression\\":false,\\"forceGroupAssignment\\":false}],\\"helpText\\":\\"Send email with request details\\"},{\\"id\\":\\"1fb54c73-f386-4a84-b8ad-5fe808a5fbe3\\",\\"name\\":\\"Triage Tree Request\\",\\"description\\":\\"Open a web page\\",\\"stepTemplateId\\":\\"AVw8eAS3yiKjHtuS9dK3\\",\\"automatic\\":true,\\"proceedNext\\":true,\\"canSkip\\":false,\\"position\\":\\"400, -100, 120, 60\\",\\"shape\\":1,\\"color\\":\\"170, 219, 164\\",\\"action\\":{\\"actionType\\":\\"OpenApp\\",\\"args\\":{\\"appUrl\\":{\\"value\\":\\"\'{{portalBaseUrl}}/apps/instant/manager/index.html?appid={{3819f129d0704404bdbb50d4a565e80a.itemId}}&webmap={{0e6278419e1040dab61379669068dd54.itemId}}&layer=1921fffdf48-layer-3&globalid=\' + jobExtendedProperty($job, \'tree_request\', \'globalid\')\\"},\\"openInNewBrowser\\":true,\\"encodeArcadeResults\\":true}},\\"paths\\":[],\\"helpText\\":\\"Open Tree Request Manager and triage request\\"}],\\"dataSources\\":[],\\"annotations\\":[],\\"displayGrid\\":true}"},{"diagram_id":"99o2QTePTqq-BHRHK_Aeag","diagram_version":1,"diagram_name":"Introduction to Workflow Manager","description":"This diagram will provide a walkthrough of some of the basic steps that can be used to make up a Workflow","diagram_details":"{\\"initialStepId\\":\\"df4c8d20-5c99-457f-0be1-21fa8f830760\\",\\"initialStepName\\":\\"Welcome\\",\\"steps\\":[{\\"id\\":\\"7b707614-c6dc-20b3-c232-e03bf6d007bc\\",\\"name\\":\\"Modify Location?\\",\\"description\\":\\"Ask the User a question\\",\\"stepTemplateId\\":\\"AVw8eAS3yiKjHtuS9dQ1\\",\\"automatic\\":true,\\"proceedNext\\":true,\\"canSkip\\":false,\\"position\\":\\"600, -100, 120, 90\\",\\"shape\\":4,\\"color\\":\\"170, 219, 164\\",\\"labelColor\\":\\"black\\",\\"action\\":{\\"actionType\\":\\"Question\\",\\"args\\":{\\"question\\":\\"Would you like to modify the location?\\",\\"questionResponses\\":{\\"Yes\\":{\\"displayName\\":\\"Yes\\",\\"value\\":1,\\"order\\":0},\\"No\\":{\\"displayName\\":\\"No\\",\\"value\\":0,\\"order\\":1}}}},\\"paths\\":[{\\"nextStep\\":\\"63e51e9e-1e1d-206e-88c8-ef8c89d36575\\",\\"expression\\":\\"$retVal == 1\\",\\"points\\":[{\\"x\\":600,\\"y\\":53},{\\"x\\":600,\\"y\\":48},{\\"x\\":400,\\"y\\":48},{\\"x\\":400,\\"y\\":68}],\\"ports\\":[\\"TOP\\",\\"TOP\\"],\\"assignedType\\":\\"Unassigned\\",\\"notifications\\":[],\\"lineColor\\":\\"black\\"},{\\"nextStep\\":\\"e4ecf530-f36d-ba65-bcdc-7315a3abffce\\",\\"expression\\":\\"$retVal == 0\\",\\"points\\":[{\\"x\\":600,\\"y\\":148},{\\"x\\":600,\\"y\\":255},{\\"x\\":-600,\\"y\\":255},{\\"x\\":-600,\\"y\\":368}],\\"ports\\":[\\"BOTTOM\\",\\"TOP\\"],\\"assignedType\\":\\"Unassigned\\",\\"notifications\\":[],\\"lineColor\\":\\"black\\"}],\\"helpUrl\\":\\"Question step help url\\",\\"helpText\\":\\"Steps can also ask questions, and the answers can be used to guide the workflow. Click Yes to return back to the map step you were just on, or click No to continue through the workflow.\\"},{\\"id\\":\\"5ab308af-6961-a654-1247-6b7cb9a65268\\",\\"name\\":\\"Click Complete Step\\",\\"description\\":\\"Step to indicate manual work, with no additional logic\\",\\"stepTemplateId\\":\\"AVw8d-MryiKjHtuS9dJ7\\",\\"automatic\\":false,\\"proceedNext\\":true,\\"canSkip\\":true,\\"position\\":\\"-200, -100, 120, 60\\",\\"shape\\":1,\\"color\\":\\"242, 226, 121\\",\\"outlineColor\\":\\"242, 226, 121\\",\\"labelColor\\":\\"black\\",\\"action\\":{\\"actionType\\":\\"Manual\\",\\"args\\":{\\"userPrompt\\":\\"Whoops! You actually chose to run the step instead of finishing it directly in the tile to skip it\\"}},\\"paths\\":[{\\"nextStep\\":\\"eed77c14-83bf-37f2-022c-601cb6c75e1a\\",\\"expression\\":\\"$retVal == $stepSuccess\\",\\"points\\":[{\\"x\\":-137,\\"y\\":100},{\\"x\\":-62,\\"y\\":100}],\\"ports\\":[\\"RIGHT\\",\\"LEFT\\"],\\"assignedType\\":\\"Unassigned\\",\\"notifications\\":[],\\"lineColor\\":\\"black\\"}],\\"helpUrl\\":\\"Manual Step help url\\",\\"helpText\\":\\"Click Pause and try again. When back on the tile click the checkbox to finish and skip the step.\\"},{\\"id\\":\\"585a63b8-99d3-c4f2-152b-1b2e907c9e3c\\",\\"name\\":\\"Open Web App Explanation\\",\\"description\\":\\"\\",\\"stepTemplateId\\":\\"AVw8d-MryiKjHtuS9dJ7\\",\\"automatic\\":true,\\"proceedNext\\":true,\\"canSkip\\":false,\\"position\\":\\"-400, -400, 120, 60\\",\\"shape\\":1,\\"color\\":\\"242, 226, 121\\",\\"action\\":{\\"actionType\\":\\"Manual\\",\\"args\\":{\\"userPrompt\\":\\"The next step will launch a web application as part of the workflow. The app will take over the Work page, so don\'t be surprised!\\"}},\\"paths\\":[{\\"nextStep\\":\\"e2359dcf-5094-810a-3d01-06a230ff20b1\\",\\"expression\\":\\"$retVal == $stepSuccess\\",\\"points\\":[{\\"x\\":-337,\\"y\\":400},{\\"x\\":-262,\\"y\\":400}],\\"ports\\":[\\"RIGHT\\",\\"LEFT\\"],\\"assignedType\\":\\"Unassigned\\",\\"notifications\\":[],\\"lineColor\\":\\"black\\"}],\\"helpUrl\\":\\"Manual Step help url\\",\\"helpText\\":\\"Information about the job will be available in the Job Panel after it is opened. The job panel can be minimized after launch. Click Pause or Finish on the Panel (or its collapsed version) to complete the step and return to the regular view.\\"},{\\"id\\":\\"324e7883-8a4b-855e-4319-31072c5f2c37\\",\\"name\\":\\"Skippable Step Info\\",\\"description\\":\\"Step to indicate manual work, with no additional logic\\",\\"stepTemplateId\\":\\"AVw8d-MryiKjHtuS9dJ7\\",\\"automatic\\":true,\\"proceedNext\\":true,\\"canSkip\\":false,\\"position\\":\\"-400, -100, 120, 60\\",\\"shape\\":1,\\"color\\":\\"242, 226, 121\\",\\"outlineColor\\":\\"242, 226, 121\\",\\"labelColor\\":\\"black\\",\\"action\\":{\\"actionType\\":\\"Manual\\",\\"args\\":{\\"userPrompt\\":\\"Steps can be configured to be optional, so that you’re not forced to run them every time. Be prepared, the next step after this one is!\\"}},\\"paths\\":[{\\"nextStep\\":\\"5ab308af-6961-a654-1247-6b7cb9a65268\\",\\"expression\\":\\"$retVal == $stepSuccess\\",\\"points\\":[{\\"x\\":-337,\\"y\\":100},{\\"x\\":-262,\\"y\\":100}],\\"ports\\":[\\"RIGHT\\",\\"LEFT\\"],\\"assignedType\\":\\"Unassigned\\",\\"notifications\\":[]}],\\"helpUrl\\":\\"Manual Step help url\\",\\"helpText\\":\\"Optional (Can be skipped) steps will return to the default card style to allow them to be completed without running them.\\"},{\\"id\\":\\"f7eff49a-93b6-146e-8ef8-cbb1ac45e682\\",\\"name\\":\\"Parallel Step 3\\",\\"description\\":\\"Step to indicate manual work, with no additional logic\\",\\"stepTemplateId\\":\\"AVw8d-MryiKjHtuS9dJ7\\",\\"automatic\\":false,\\"proceedNext\\":true,\\"canSkip\\":true,\\"position\\":\\"200, -200, 120, 60\\",\\"shape\\":1,\\"color\\":\\"242, 226, 121\\",\\"action\\":{\\"actionType\\":\\"Manual\\",\\"args\\":{\\"userPrompt\\":\\"This is Parallel Step 3 of 3. Click Proceed to finish it.\\"}},\\"paths\\":[{\\"nextStep\\":\\"63e51e9e-1e1d-206e-88c8-ef8c89d36575\\",\\"expression\\":\\"$retVal == $stepSuccess\\",\\"points\\":[{\\"x\\":263,\\"y\\":200},{\\"x\\":298,\\"y\\":200},{\\"x\\":298,\\"y\\":100},{\\"x\\":338,\\"y\\":100}],\\"ports\\":[\\"RIGHT\\",\\"LEFT\\"],\\"assignedType\\":\\"Unassigned\\",\\"notifications\\":[],\\"lineColor\\":\\"black\\"}],\\"helpUrl\\":\\"Manual Step help url\\",\\"helpText\\":\\"\\"},{\\"id\\":\\"e2359dcf-5094-810a-3d01-06a230ff20b1\\",\\"name\\":\\"Open Web App\\",\\"description\\":\\"Open a web app\\",\\"stepTemplateId\\":\\"AVw8eAS3yiKjHtuS9dK3\\",\\"automatic\\":false,\\"proceedNext\\":true,\\"canSkip\\":false,\\"position\\":\\"-200, -400, 120, 60\\",\\"shape\\":1,\\"color\\":\\"170, 219, 164\\",\\"action\\":{\\"actionType\\":\\"OpenApp\\",\\"args\\":{\\"appUrl\\":{\\"value\\":\\"https://livingatlas.arcgis.com/topoexplorer/\\"}}},\\"paths\\":[{\\"nextStep\\":\\"b82508b3-fd8f-bfac-5a1c-a68751fa0c0f\\",\\"expression\\":\\"$retVal == $stepSuccess\\",\\"points\\":[{\\"x\\":-137,\\"y\\":400},{\\"x\\":-62,\\"y\\":400}],\\"ports\\":[\\"RIGHT\\",\\"LEFT\\"],\\"assignedType\\":\\"Unassigned\\",\\"notifications\\":[],\\"lineColor\\":\\"black\\"}],\\"helpUrl\\":\\"Open a web app help url\\",\\"helpText\\":\\"The Open Web App steps allows you to open nearly any web application within the context of Workflow Manager.\\\\n\\\\nTip: You can collapse this panel and dock the resulting pane in any of the corners of the app to allow more space for the app\\"},{\\"id\\":\\"18a1fb20-2211-2d3c-4bfc-66494938dc4d\\",\\"name\\":\\"Finished\\",\\"description\\":\\"Step to indicate manual work, with no additional logic\\",\\"stepTemplateId\\":\\"AVw8d-MryiKjHtuS9dJ7\\",\\"automatic\\":true,\\"proceedNext\\":true,\\"canSkip\\":false,\\"position\\":\\"200, -400, 120, 60\\",\\"shape\\":3,\\"color\\":\\"130, 202, 237\\",\\"outlineColor\\":\\"242, 226, 121\\",\\"labelColor\\":\\"black\\",\\"action\\":{\\"actionType\\":\\"Manual\\",\\"args\\":{\\"userPrompt\\":\\"That\'s it for this quick tour! There are many more types of steps for you to explore, but they all follow some of the basic principles we\'ve reviewed in this introduction. \\"}},\\"paths\\":[],\\"helpUrl\\":\\"Manual Step help url\\",\\"helpText\\":\\"Click the Design tab to explore this workflow (If you have access to it - it’s also privilege controlled &#x1f60a; )\\"},{\\"id\\":\\"a8b78e13-4940-13e6-3700-f7d6bc8e1361\\",\\"name\\":\\"Parallel Step 1\\",\\"description\\":\\"Step to indicate manual work, with no additional logic\\",\\"stepTemplateId\\":\\"AVw8d-MryiKjHtuS9dJ7\\",\\"automatic\\":true,\\"proceedNext\\":true,\\"canSkip\\":false,\\"position\\":\\"200, 0, 120, 60\\",\\"shape\\":1,\\"color\\":\\"242, 226, 121\\",\\"action\\":{\\"actionType\\":\\"Manual\\",\\"args\\":{\\"userPrompt\\":\\"More than one step can be active in a job at one time. This is called a parallel workflow.  They can be assigned to different people or automated processes to run at the same time\\"}},\\"paths\\":[{\\"nextStep\\":\\"63e51e9e-1e1d-206e-88c8-ef8c89d36575\\",\\"expression\\":\\"$retVal == $stepSuccess\\",\\"points\\":[{\\"x\\":263,\\"y\\":0},{\\"x\\":298,\\"y\\":0},{\\"x\\":298,\\"y\\":100},{\\"x\\":338,\\"y\\":100}],\\"ports\\":[\\"RIGHT\\",\\"LEFT\\"],\\"assignedType\\":\\"Unassigned\\",\\"notifications\\":[],\\"lineColor\\":\\"black\\"}],\\"helpUrl\\":\\"Manual Step help url\\",\\"helpText\\":\\"This is one step in parallel of three. When you click Proceed the other two will be available on the job tile. Toggle between them using the Current Step dropdown.\\"},{\\"id\\":\\"b82508b3-fd8f-bfac-5a1c-a68751fa0c0f\\",\\"name\\":\\"Job Panel\\",\\"description\\":\\"Step to indicate manual work, with no additional logic\\",\\"stepTemplateId\\":\\"AVw8d-MryiKjHtuS9dJ7\\",\\"automatic\\":true,\\"proceedNext\\":true,\\"canSkip\\":true,\\"position\\":\\"0, -400, 120, 60\\",\\"shape\\":1,\\"color\\":\\"242, 226, 121\\",\\"action\\":{\\"actionType\\":\\"Manual\\",\\"args\\":{\\"userPrompt\\":\\"The Job Panel can be opened on the Work Page by clicking the Details tab in the top right. It allows you to interact with the job information outside of the workflow.\\"}},\\"paths\\":[{\\"nextStep\\":\\"18a1fb20-2211-2d3c-4bfc-66494938dc4d\\",\\"expression\\":\\"$retVal == $stepSuccess\\",\\"points\\":[{\\"x\\":63,\\"y\\":400},{\\"x\\":138,\\"y\\":400}],\\"ports\\":[\\"RIGHT\\",\\"LEFT\\"],\\"assignedType\\":\\"Unassigned\\",\\"notifications\\":[],\\"lineColor\\":\\"black\\"}],\\"helpUrl\\":\\"Manual Step help url\\",\\"helpText\\":\\"Everything shown in the Job Panel (including the panel itself) can be controlled by application level privileges. You can control visibility or editability of anything.\\\\nPrivileges are assigned to Workflow Manager Roles, and those roles assigned to Groups. Access is dependent on the Groups the user is a member of. This is configured in the Workflow Manager web app by clicking on the Design tab, and then the Settings tab.\\"},{\\"id\\":\\"63e51e9e-1e1d-206e-88c8-ef8c89d36575\\",\\"name\\":\\"Define Location\\",\\"description\\":\\"Define a location for the job\\",\\"stepTemplateId\\":\\"AVw8eAS3yiKjHtuS9dK4\\",\\"automatic\\":true,\\"proceedNext\\":true,\\"canSkip\\":false,\\"position\\":\\"400, -100, 120, 60\\",\\"shape\\":1,\\"color\\":\\"130, 202, 237\\",\\"labelColor\\":\\"black\\",\\"action\\":{\\"actionType\\":\\"DefineLocation\\",\\"args\\":{\\"name\\":\\"\\",\\"url\\":\\"https://www.arcgis.com/home/item.html?id=8b3d38c0819547faa83f7b7aca80bd76\\",\\"existingData\\":{\\"itemId\\":\\"8b3d38c0819547faa83f7b7aca80bd76\\",\\"itemType\\":null,\\"portalType\\":\\"ArcGISOnline\\",\\"portalUrl\\":null,\\"tableAlias\\":\\"Light Gray Canvas\\",\\"tableName\\":null},\\"itemType\\":\\"Map\\",\\"geometryType\\":\\"Polygon\\",\\"methodType\\":\\"Draw\\",\\"userPrompt\\":\\"Jobs can have locations associated to them. Locations are useful for reporting and analysis. Draw a polygon on the map to define the location\\"}},\\"paths\\":[{\\"nextStep\\":\\"7b707614-c6dc-20b3-c232-e03bf6d007bc\\",\\"expression\\":\\"$retVal == $stepSuccess\\",\\"points\\":[{\\"x\\":463,\\"y\\":100},{\\"x\\":538,\\"y\\":100}],\\"ports\\":[\\"RIGHT\\",\\"LEFT\\"],\\"assignedType\\":\\"Unassigned\\",\\"notifications\\":[],\\"lineColor\\":\\"black\\"}],\\"helpUrl\\":\\"Define Location step help url\\",\\"helpText\\":\\"A job&#39;s location can be used as input into other steps in the diagram (eg. GP tools, web apps) using the appropriate Workflow Manager Arcade expression jobLocation($job).\\"},{\\"id\\":\\"df4c8d20-5c99-457f-0be1-21fa8f830760\\",\\"name\\":\\"Welcome\\",\\"description\\":\\"\\",\\"stepTemplateId\\":\\"AVw8d6MdyiKjHtuS9dJ6\\",\\"automatic\\":false,\\"proceedNext\\":true,\\"canSkip\\":false,\\"position\\":\\"-600, -100, 120, 60\\",\\"shape\\":3,\\"color\\":\\"130, 202, 237\\",\\"outlineColor\\":\\"130, 202, 237\\",\\"labelColor\\":\\"black\\",\\"action\\":{\\"actionType\\":\\"Manual\\",\\"args\\":{\\"userPrompt\\":\\"Welcome to ArcGIS Workflow Manager. This workflow will guide you through some of the basic step types and options for how to use them. This one is a manual step.\\"}},\\"paths\\":[{\\"nextStep\\":\\"324e7883-8a4b-855e-4319-31072c5f2c37\\",\\"expression\\":\\"$retVal == $stepSuccess\\",\\"points\\":[{\\"x\\":-537,\\"y\\":100},{\\"x\\":-462,\\"y\\":100}],\\"ports\\":[\\"RIGHT\\",\\"LEFT\\"],\\"assignedType\\":\\"Unassigned\\",\\"notifications\\":[],\\"lineColor\\":\\"black\\"}],\\"helpUrl\\":\\"Start/End help url\\",\\"helpText\\":\\"To finish this step, click Proceed. If you want to take a break and run it again later, click Pause.\\"},{\\"id\\":\\"7fbfd81d-6406-c50c-e4c4-35b47f06ccf3\\",\\"name\\":\\"Parallel Step 2\\",\\"description\\":\\"Step to indicate manual work, with no additional logic\\",\\"stepTemplateId\\":\\"AVw8d-MryiKjHtuS9dJ7\\",\\"automatic\\":false,\\"proceedNext\\":true,\\"canSkip\\":true,\\"position\\":\\"200, -100, 120, 60\\",\\"shape\\":1,\\"color\\":\\"242, 226, 121\\",\\"action\\":{\\"actionType\\":\\"Manual\\",\\"args\\":{\\"userPrompt\\":\\"This is Parallel Step 2 of 3. Click Proceed to finish it\\"}},\\"paths\\":[{\\"nextStep\\":\\"63e51e9e-1e1d-206e-88c8-ef8c89d36575\\",\\"expression\\":\\"$retVal == $stepSuccess\\",\\"points\\":[{\\"x\\":263,\\"y\\":100},{\\"x\\":338,\\"y\\":100}],\\"ports\\":[\\"RIGHT\\",\\"LEFT\\"],\\"assignedType\\":\\"Unassigned\\",\\"notifications\\":[],\\"lineColor\\":\\"black\\"}],\\"helpUrl\\":\\"Manual Step help url\\",\\"helpText\\":\\"\\"},{\\"id\\":\\"eed77c14-83bf-37f2-022c-601cb6c75e1a\\",\\"name\\":\\"Automatic Step\\",\\"description\\":\\"Step to indicate manual work, with no additional logic\\",\\"stepTemplateId\\":\\"AVw8d-MryiKjHtuS9dJ7\\",\\"automatic\\":true,\\"proceedNext\\":true,\\"canSkip\\":false,\\"position\\":\\"0, -100, 120, 60\\",\\"shape\\":1,\\"color\\":\\"242, 226, 121\\",\\"action\\":{\\"actionType\\":\\"Manual\\",\\"args\\":{\\"userPrompt\\":\\"Most steps are set to run automatically (like this one) without the user having to click the run button to start it. \\"}},\\"paths\\":[{\\"nextStep\\":\\"a8b78e13-4940-13e6-3700-f7d6bc8e1361\\",\\"expression\\":\\"$retVal == $stepSuccess\\",\\"points\\":[{\\"x\\":63,\\"y\\":100},{\\"x\\":98,\\"y\\":100},{\\"x\\":98,\\"y\\":0},{\\"x\\":138,\\"y\\":0}],\\"ports\\":[\\"RIGHT\\",\\"LEFT\\"],\\"assignedType\\":\\"Unassigned\\",\\"notifications\\":[],\\"lineColor\\":\\"black\\"},{\\"nextStep\\":\\"f7eff49a-93b6-146e-8ef8-cbb1ac45e682\\",\\"expression\\":\\"$retVal == $stepSuccess\\",\\"points\\":[{\\"x\\":63,\\"y\\":100},{\\"x\\":98,\\"y\\":100},{\\"x\\":98,\\"y\\":200},{\\"x\\":138,\\"y\\":200}],\\"ports\\":[\\"RIGHT\\",\\"LEFT\\"],\\"assignedType\\":\\"Unassigned\\",\\"notifications\\":[],\\"lineColor\\":\\"black\\"},{\\"nextStep\\":\\"7fbfd81d-6406-c50c-e4c4-35b47f06ccf3\\",\\"expression\\":\\"$retVal == $stepSuccess\\",\\"points\\":[{\\"x\\":63,\\"y\\":100},{\\"x\\":138,\\"y\\":100}],\\"ports\\":[\\"RIGHT\\",\\"LEFT\\"],\\"assignedType\\":\\"Unassigned\\",\\"notifications\\":[],\\"lineColor\\":\\"black\\"}],\\"helpUrl\\":\\"Manual Step help url\\",\\"helpText\\":\\"This behavior makes sense for most steps (eg. Running a GP service), but not all steps (eg. A mapping step) so it is a configurable option.\\"},{\\"id\\":\\"e4ecf530-f36d-ba65-bcdc-7315a3abffce\\",\\"name\\":\\"Add Attachment\\",\\"description\\":\\"Add an attachment\\",\\"stepTemplateId\\":\\"AVw8eAS3yiKjHtuS9dD1\\",\\"automatic\\":true,\\"proceedNext\\":true,\\"canSkip\\":false,\\"position\\":\\"-600, -400, 120, 60\\",\\"shape\\":1,\\"color\\":\\"170, 219, 164\\",\\"labelColor\\":\\"black\\",\\"action\\":{\\"actionType\\":\\"Attachment\\",\\"args\\":{\\"folder\\":\\"General\\",\\"userPrompt\\":\\"Please add attachments\\",\\"acceptEmbedded\\":true,\\"acceptLinked\\":false,\\"viewExisting\\":false,\\"editExisting\\":false}},\\"paths\\":[{\\"nextStep\\":\\"585a63b8-99d3-c4f2-152b-1b2e907c9e3c\\",\\"expression\\":\\"$retVal == $stepSuccess\\",\\"points\\":[{\\"x\\":-537,\\"y\\":400},{\\"x\\":-462,\\"y\\":400}],\\"ports\\":[\\"RIGHT\\",\\"LEFT\\"],\\"assignedType\\":\\"Unassigned\\",\\"notifications\\":[],\\"lineColor\\":\\"black\\"}],\\"helpUrl\\":\\"Add Attachment help url\\",\\"helpText\\":\\"The add attachment step allows users to upload attachments related to their work\\"}],\\"dataSources\\":[],\\"annotations\\":[],\\"displayGrid\\":true}"}]',
          "info.json": '{"schemaVersion":"24.2.0.1"}',
          "jobExtPropertyDefinitions.json":
            '[{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"reqid","property_alias":"Request ID","property_order":0,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"reqcategory","property_alias":"Request Category","property_order":1,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"reqtype","property_alias":"Request Type","property_order":2,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"details","property_alias":"Details","property_order":3,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"pocfirstname","property_alias":"First Name","property_order":4,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"poclastname","property_alias":"Last Name","property_order":5,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"pocphone","property_alias":"Phone Number","property_order":6,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"pocemail","property_alias":"Email","property_order":7,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"locdesc","property_alias":"Location","property_order":8,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"publicview","property_alias":"Visible to Public","property_order":9,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"source","property_alias":"Source","property_order":10,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"assetglobalid","property_alias":"Asset GlobalID","property_order":11,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"assignmentglobalid","property_alias":"Assignment GlobalID","property_order":12,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"status","property_alias":"Status","property_order":13,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"notes","property_alias":"Notes","property_order":14,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"assignedto","property_alias":"Assigned To","property_order":15,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"resolutiondt","property_alias":"Resolved On","property_order":16,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"resolution","property_alias":"Resolution","property_order":17,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"globalid","property_alias":"GlobalID","property_order":18,"data_type":-1,"required":0,"editable":1,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"created_date","property_alias":"Submitted On","property_order":19,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"created_user","property_alias":"Submitted By","property_order":20,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"last_edited_date","property_alias":"Last Edited On","property_order":21,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"last_edited_user","property_alias":"Last Edited By","property_order":22,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","property_name":"job_created","property_alias":"Job Created","property_order":23,"data_type":-1,"required":0,"editable":0,"visible":1}]',
          "jobExtPropertyTableDefinitions.json":
            '[{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","table_name":"tree_request","table_alias":"tree_request","table_order":-1,"relationship_type":0,"item_id":"{{4ea43a65b76140648ab107162b904e7a.itemId}}","layer_id":"0","portal_type":"Current","feature_service_unique_id":"globalid","secure":1,"searchable":0}]',
          "jobTemplateAutomatedCreation.json": "[]",
          "jobTemplates.json":
            '[{"job_template_id":"Q5-nYVlCTBOZ4ShEdDsglA","job_template_name":"Introduction to Workflow Manager","default_job_duration":1,"default_assigned_to":"JobCreator($job)","job_start_date_type":"CreationDate","diagram_id":"99o2QTePTqq-BHRHK_Aeag","default_priority_rank":0,"default_assigned_type":"User","description":"A sample workflow introducing some key concepts","state":"Active","default_job_name":"JOB_[index]","default_final_status":"Closed","default_status":"Ready"},{"job_template_id":"toKxLD9VRi6A8YR9eb7TUw","job_template_name":"New Tree Request","default_job_duration":2,"default_assigned_to":"jobCreator($job)","job_start_date_type":"CreationDate","diagram_id":"sqVI1V4vQ1K9hBDheI1i0Q","default_priority_rank":10,"default_assigned_type":"User","state":"Active","default_job_name":"Tree Request [index]","default_final_status":"Closed","default_status":"Ready","activities":"[]"}]',
          "jobTemplatesToExtPropertyTableDefXref.json":
            '[{"table_id":"44MNoGH1Q0WPCDqMs9RaOg","table_order":0,"job_template_id":"toKxLD9VRi6A8YR9eb7TUw"}]',
          "lookups.json":
            '[{"lookup_type":"status","lookup_name":"Created","value":1},{"lookup_type":"status","lookup_name":"Ready","value":2},{"lookup_type":"status","lookup_name":"In Progress","value":3},{"lookup_type":"status","lookup_name":"Incomplete","value":4},{"lookup_type":"status","lookup_name":"Revised","value":5},{"lookup_type":"status","lookup_name":"Pending","value":6},{"lookup_type":"status","lookup_name":"On Hold","value":7},{"lookup_type":"status","lookup_name":"Approved","value":8},{"lookup_type":"status","lookup_name":"Completed","value":9},{"lookup_type":"status","lookup_name":"Closed","value":10},{"lookup_type":"priority","lookup_name":"Low","value":0},{"lookup_type":"priority","lookup_name":"Medium","value":5},{"lookup_type":"priority","lookup_name":"High","value":10},{"lookup_type":"percentComplete","lookup_name":"X-Small","value":1},{"lookup_type":"percentComplete","lookup_name":"Small","value":2},{"lookup_type":"percentComplete","lookup_name":"Medium","value":3},{"lookup_type":"percentComplete","lookup_name":"Large","value":5},{"lookup_type":"percentComplete","lookup_name":"X-Large","value":8},{"lookup_type":"percentComplete","lookup_name":"XX-Large","value":13}]',
          "roleGroups.json":
            '[{"role_name":"Workflow Administrator","group_id":"a2fb27c70d6d4244870a7a27f2da3580","group_name":""}]',
          "roles.json":
            '[{"role_name":"Workflow Administrator","description":"Role with all privileges.","workflow_privileges":"[\\"adminAdvanced\\",\\"jobAssignGroup\\",\\"jobForceStop\\",\\"jobUpdateHolds\\",\\"jobUpdateAttachments\\",\\"queryUpdate\\",\\"jobAssignIndividual\\",\\"jobAssignAny\\",\\"jobCreate\\",\\"jobReopenClosed\\",\\"jobUpdateDate\\",\\"jobUpdateDescription\\",\\"jobUpdateName\\",\\"jobUpdateOwner\\",\\"jobUpdatePriority\\",\\"jobUpdateStatus\\",\\"jobUpdateNotes\\",\\"AOIOverideOverlap\\",\\"jobUpdateDependencies\\",\\"jobUpdateParentJob\\",\\"jobUpdateAOI\\",\\"jobClose\\",\\"jobUpdateExtendedProperties\\",\\"jobUpdateVersions\\",\\"pathAssignAny\\",\\"workflowSetStepCurrent\\",\\"jobheldUpdateProperties\\",\\"jobheldAddComments\\",\\"jobheldAddAttachments\\",\\"jobUpdateLocation\\",\\"jobDelete\\",\\"jobUpgrade\\",\\"jobDeleteMap\\",\\"viewManagePage\\",\\"viewWorkPage\\",\\"viewCreatePanel\\",\\"viewDetailsPanelAttachments\\",\\"viewDetailsPanelProperties\\",\\"viewDetailsPanelDiagram\\",\\"viewDetailsPanelLocation\\",\\"viewDetailsPanelNotes\\",\\"viewDetailsPanelHistory\\",\\"viewDetailsPanelHolds\\",\\"viewDetailsPanelComments\\",\\"viewCustomSearch\\"]"},{"role_name":"Workflow Designer","description":"Role with all privileges except advanced administration.","workflow_privileges":"[\\"adminBasic\\",\\"jobAssignGroup\\",\\"jobUpdateHolds\\",\\"jobUpdateAttachments\\",\\"queryUpdate\\",\\"jobAssignIndividual\\",\\"jobAssignAny\\",\\"jobCreate\\",\\"jobReopenClosed\\",\\"jobUpdateDate\\",\\"jobUpdateDescription\\",\\"jobUpdateName\\",\\"jobUpdateOwner\\",\\"jobUpdatePriority\\",\\"jobUpdateStatus\\",\\"jobUpdateNotes\\",\\"AOIOverideOverlap\\",\\"jobUpdateDependencies\\",\\"jobUpdateParentJob\\",\\"jobUpdateAOI\\",\\"jobClose\\",\\"jobUpdateExtendedProperties\\",\\"jobUpdateVersions\\",\\"pathAssignAny\\",\\"workflowSetStepCurrent\\",\\"jobheldUpdateProperties\\",\\"jobheldAddComments\\",\\"jobheldAddAttachments\\",\\"jobDelete\\",\\"jobUpgrade\\",\\"jobDeleteMap\\",\\"jobUpdateLocation\\"]"},{"role_name":"Manage Jobs - Basic","description":"Role with basic privileges to manage jobs. Privileges assigned are assign job to group, assign job to individual, update holds, attachments and queries","workflow_privileges":"[\\"jobAssignGroup\\",\\"jobUpdateHolds\\",\\"jobUpdateAttachments\\",\\"jobUpdateNotes\\",\\"queryUpdate\\",\\"jobAssignIndividual\\",\\"viewWorkPage\\",\\"viewCreatePanel\\",\\"viewDetailsPanelAttachments\\",\\"viewDetailsPanelProperties\\",\\"viewDetailsPanelLocation\\",\\"viewDetailsPanelNotes\\",\\"viewDetailsPanelComments\\",\\"viewCustomSearch\\"]"},{"role_name":"Manage Jobs - Advanced","description":"Role with advanced privileges to manage jobs. Privileges assigned are assign job to any, update job owner, create a new job, re-open a closed job, update a job\'s location, delete a job update job properties, override location overlap and update job date","workflow_privileges":"[\\"jobAssignAny\\",\\"jobCreate\\",\\"jobReopenClosed\\",\\"jobUpdateDate\\",\\"jobUpdateDescription\\",\\"jobUpdateName\\",\\"jobDelete\\",\\"jobUpdateOwner\\",\\"jobUpdatePriority\\",\\"jobUpdateStatus\\",\\"AOIOverideOverlap\\",\\"jobUpdateExtendedProperties\\",\\"jobUpdateLocation\\",\\"jobUpdateHolds\\",\\"jobUpdateNotes\\",\\"jobUpdateParentJob\\",\\"jobUpdateVersions\\",\\"viewManagePage\\",\\"viewWorkPage\\",\\"viewCreatePanel\\",\\"viewDetailsPanelAttachments\\",\\"viewDetailsPanelProperties\\",\\"viewDetailsPanelDiagram\\",\\"viewDetailsPanelLocation\\",\\"viewDetailsPanelNotes\\",\\"viewDetailsPanelHistory\\",\\"viewDetailsPanelHolds\\",\\"viewDetailsPanelComments\\",\\"viewCustomSearch\\"]"}]',
          "searches.json":
            '[{"search_id":"rrUF60TFQCe2K0vtgSsYpA","search_name":"My Jobs","definition":"{\\"q\\":\\"\\\\\\"assignedType=\'User\' AND closed=0 AND assignedTo=\'\\\\\\" + $currentUser + \\\\\\"\' \\\\\\"\\",\\"fields\\":[\\"assignedTo\\",\\"jobName\\",\\"dueDate\\",\\"jobTemplateName\\",\\"currentStep\\",\\"priority\\",\\"jobStatus\\"],\\"displayNames\\":[\\"Assigned To\\",\\"Name\\",\\"Due\\",\\"Type\\",\\"Step\\",\\"Priority\\",\\"Status\\"],\\"sortFields\\":[{\\"field\\":\\"jobName\\",\\"sortOrder\\":\\"Asc\\"},{\\"field\\":\\"priority\\",\\"sortOrder\\":\\"Asc\\"}],\\"start\\":0,\\"num\\":50}","search_type":"Standard","sort_index":1000},{"search_id":"OnjS_8SoR6-iLE3oMCN44A","search_name":"My Group Jobs","definition":"{\\"q\\":\\"\\\\\\"assignedType=\'Group\' AND closed=0 AND assignedTo IN (\\\\\\" + userGroups($currentUser) + \')\' \\",\\"fields\\":[\\"assignedTo\\",\\"jobName\\",\\"dueDate\\",\\"jobTemplateName\\",\\"currentStep\\",\\"priority\\",\\"jobStatus\\"],\\"displayNames\\":[\\"Assigned To\\",\\"Name\\",\\"Due\\",\\"Type\\",\\"Step\\",\\"Priority\\",\\"Status\\"],\\"sortFields\\":[{\\"field\\":\\"jobName\\",\\"sortOrder\\":\\"Asc\\"},{\\"field\\":\\"priority\\",\\"sortOrder\\":\\"Asc\\"}],\\"start\\":0,\\"num\\":50}","search_type":"Standard","sort_index":2000},{"search_id":"L46soUSzRD62LqwFvp5pVQ","search_name":"All Jobs","definition":"{\\"q\\":\\"closed=0\\",\\"fields\\":[\\"assignedTo\\",\\"jobName\\",\\"dueDate\\",\\"jobTemplateName\\",\\"currentStep\\",\\"priority\\",\\"jobStatus\\"],\\"displayNames\\":[\\"Assigned To\\",\\"Name\\",\\"Due\\",\\"Type\\",\\"Step\\",\\"Priority\\",\\"Status\\"],\\"sortFields\\":[{\\"field\\":\\"jobName\\",\\"sortOrder\\":\\"Asc\\"},{\\"field\\":\\"priority\\",\\"sortOrder\\":\\"Asc\\"}],\\"start\\":0,\\"num\\":50}","search_type":"Standard","sort_index":3000},{"search_id":"KPHh4-l1SaKRkO8eZLoeEA","search_name":"Job Type Chart","definition":"{\\"fields\\":[\\"job_template_name\\"],\\"displayNames\\":[\\"Type\\"],\\"sortFields\\":[{\\"field\\":\\"job_template_name\\",\\"sortOrder\\":\\"Asc\\"}],\\"start\\":0,\\"num\\":50}","search_type":"Chart","color_ramp":"Default","sort_index":2000},{"search_id":"m1nOdfkvQAmPL4s3sUuvkw","search_name":"Job Status Chart","definition":"{\\"fields\\":[\\"job_status\\"],\\"displayNames\\":[\\"Status\\"],\\"sortFields\\":[{\\"field\\":\\"job_status\\",\\"sortOrder\\":\\"Asc\\"}],\\"start\\":0,\\"num\\":50}","search_type":"Chart","color_ramp":"Default","sort_index":2000},{"search_id":"syvlYUxjSkCtER2UdNqkOw","search_name":"Job Priority Chart","definition":"{\\"fields\\":[\\"priority\\"],\\"displayNames\\":[\\"Priority\\"],\\"sortFields\\":[{\\"field\\":\\"priority\\",\\"sortOrder\\":\\"Asc\\"}],\\"start\\":0,\\"num\\":50}","search_type":"Chart","color_ramp":"Default","sort_index":3000}]',
          "settings.json": "[]",
          "shareRelationships.json": "[]",
          "templates.json": "[]",
        },
      };

      workflowHelpers.postProcessFormItems(templatesList);

      expect(templatesList[0].dependencies).toEqual([
        "3d8ce2442920473ba735470e07427614",
        "61918b9f50ac4b569200194aa615d9d1",
        "b594de65c4ad4e7fa812528f879f2404",
        "3819f129d0704404bdbb50d4a565e80a",
        "661e0e38d4ad4a8f97731b22cb6c95dd",
        "0e6278419e1040dab61379669068dd54",
        "4ea43a65b76140648ab107162b904e7a",
      ]);
    });
  });

  describe("_cacheLayerDetails", () => {
    it("will capture fields and update tempate dict", () => {
      const layers = [
        {
          id: "layerA",
          fields: [
            {
              alias: "a",
              name: "A",
              type: "string",
            },
          ],
        },
      ];
      const templateDictionary = {};
      const baseUrl = "http://src";
      const srcId = "src123";
      const itemId = "new123";

      templateDictionary[srcId] = {};

      const actual = {
        src123: {
          layerlayerA: {
            fields: {
              a: {
                alias: "a",
                name: "A",
                type: "string",
              },
            },
            itemId: "new123",
            layerId: "layerA",
            url: "http://src/layerA",
          },
        },
      };

      workflowHelpers._cacheLayerDetails(layers, templateDictionary, baseUrl, srcId, itemId);

      expect(templateDictionary).toEqual(actual);
    });
  });

  describe("updateTemplateDictionaryForWorkflow", () => {
    it("store ids and key values", async () => {
      const sourceId = "src123";
      const newId = "new123";

      const templateDictionary = {
        workflows: {},
        aa848a457d5d4f0495f89476b6b3dcff: {},
        bb857382b2de441e95e81a6cd1740558: {},
        cc4a067c851a47449f162a1a716748a3: {},
      };
      templateDictionary.workflows[sourceId] = {
        viewSchema: "aa848a457d5d4f0495f89476b6b3dcff",
        workflowLocations: "bb857382b2de441e95e81a6cd1740558",
        workflowSchema: "cc4a067c851a47449f162a1a716748a3",
      };
      const authentication = MOCK_USER_SESSION;

      const completeItemData = {
        base: {
          url: "http://baseurl",
          name: "basename3",
        },
        featureServiceProperties: {
          layers: [
            {
              id: "layer",
              fields: [
                {
                  alias: "layer-alias",
                  name: "layer-name",
                  type: "layer-type",
                  someotherprop: "someotherprop",
                },
              ],
            },
          ],
          tables: [
            {
              id: "table",
              fields: [
                {
                  alias: "table-alias",
                  name: "table-name",
                  type: "table-type",
                  someotherprop: "someotherprop",
                },
              ],
            },
          ],
        },
      };

      spyOn(common, "getCompleteItem").and.resolveTo(completeItemData as any);

      const workflowData = {
        groupId: "1507c6dbc36d48acaaa02ed196cb583f",
        workflowSchema: {
          itemId: "2517d1763b594b15977ed769c40cf68a",
        },
        workflowLocations: {
          itemId: "e763e40e9dbb4abda7133d6b32ac99f5",
        },
        viewSchema: {
          itemId: "7ed90e023736486c9caf9839a7acca17",
        },
        cleanupTask: {
          itemId: "2229f3386bf64f5592ed11000c184fd3",
        },
      };
      spyOn(common, "getItemDataAsJson").and.resolveTo(workflowData as any);

      const expected = {
        workflows: {
          src123: {
            viewSchema: "aa848a457d5d4f0495f89476b6b3dcff",
            workflowLocations: "bb857382b2de441e95e81a6cd1740558",
            workflowSchema: "cc4a067c851a47449f162a1a716748a3",
          },
        },
        aa848a457d5d4f0495f89476b6b3dcff: {
          itemId: "7ed90e023736486c9caf9839a7acca17",
          url: "http://baseurl",
          name: "basename3",
          layerlayer: {
            fields: {
              "layer-name": {
                alias: "layer-alias",
                name: "layer-name",
                type: "layer-type",
              },
            },
            itemId: "7ed90e023736486c9caf9839a7acca17",
            layerId: "layer",
            url: "http://baseurl/layer",
          },
          layertable: {
            fields: {
              "table-name": {
                alias: "table-alias",
                name: "table-name",
                type: "table-type",
              },
            },
            itemId: "7ed90e023736486c9caf9839a7acca17",
            layerId: "table",
            url: "http://baseurl/table",
          },
        },
        bb857382b2de441e95e81a6cd1740558: {
          itemId: "e763e40e9dbb4abda7133d6b32ac99f5",
          url: "http://baseurl",
          name: "basename3",
          layerlayer: {
            fields: {
              "layer-name": {
                alias: "layer-alias",
                name: "layer-name",
                type: "layer-type",
              },
            },
            itemId: "e763e40e9dbb4abda7133d6b32ac99f5",
            layerId: "layer",
            url: "http://baseurl/layer",
          },
          layertable: {
            fields: {
              "table-name": {
                alias: "table-alias",
                name: "table-name",
                type: "table-type",
              },
            },
            itemId: "e763e40e9dbb4abda7133d6b32ac99f5",
            layerId: "table",
            url: "http://baseurl/table",
          },
        },
        cc4a067c851a47449f162a1a716748a3: {
          itemId: "2517d1763b594b15977ed769c40cf68a",
          url: "http://baseurl",
          name: "basename3",
          layerlayer: {
            fields: {
              "layer-name": {
                alias: "layer-alias",
                name: "layer-name",
                type: "layer-type",
              },
            },
            itemId: "2517d1763b594b15977ed769c40cf68a",
            layerId: "layer",
            url: "http://baseurl/layer",
          },
          layertable: {
            fields: {
              "table-name": {
                alias: "table-alias",
                name: "table-name",
                type: "table-type",
              },
            },
            itemId: "2517d1763b594b15977ed769c40cf68a",
            layerId: "table",
            url: "http://baseurl/table",
          },
        },
      };

      await workflowHelpers.updateTemplateDictionaryForWorkflow(sourceId, newId, templateDictionary, authentication);
      expect(templateDictionary).toEqual(expected);
    });
  });
});
