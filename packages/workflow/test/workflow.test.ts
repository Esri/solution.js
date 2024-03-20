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
import * as workflow from "../src/workflow";
import * as workflowHelpers from "../src/workflowHelpers";

// ------------------------------------------------------------------------------------------------------------------ //

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

describe("Module `workflow`", () => {

  describe("convertItemToTemplate", () => {
    it("basically works", async () => {
      const agolItem = mockItems.getAGOLItem("Workflow");
      agolItem.thumbnail = null;

      spyOn(common, "getItemRelatedItemsInSameDirection").and.resolveTo([{
        relationshipType: "WMA2JobDependency",
        relatedItemIds: ["job1234567890"]
      }]);

      spyOn(common, "getWorkflowConfigurationZip")
        .and.returnValue(common.jsonToZipFile("jobConfig.json", { "jobTemplates": "abc" }, "config"));

      spyOn(common, "extractWorkflowFromZipFile")
        .and.resolveTo({ "jobTemplates": "abc" });

      const itemTemplate = await workflow.convertItemToTemplate(agolItem, MOCK_USER_SESSION, MOCK_USER_SESSION);

      expect(itemTemplate?.properties?.configuration?.jobTemplates).toEqual("abc");
    });

    it("handles case where item has related items", async () => {
      const agolItem = mockItems.getAGOLItem("Workflow");
      agolItem.thumbnail = null;

      spyOn(common, "getItemRelatedItemsInSameDirection").and.resolveTo([]);

      spyOn(common, "getWorkflowConfigurationZip")
        .and.returnValue(common.jsonToZipFile("jobConfig.json", { "jobTemplates": "abc" }, "config"));

      spyOn(common, "extractWorkflowFromZipFile")
        .and.resolveTo({ "jobTemplates": "abc" });

      const itemTemplate = await workflow.convertItemToTemplate(agolItem, MOCK_USER_SESSION, MOCK_USER_SESSION);

      expect(itemTemplate?.properties?.configuration?.jobTemplates).toEqual("abc");
    });
  });

  describe("createItemFromTemplate", () => {
    it("basically works", async () => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate("Workflow");
      itemTemplate.properties.configuration = getSampleConfigJson(true);
      const templateDictionary: any = {
        "7a69f67e4c6744918fbea49b8241640e": "7a69f67e4c6744918fbea49b8241640e",
        "9ef76d79ed2741a8bf5a3b9b344b3c07": "9ef76d79ed2741a8bf5a3b9b344b3c07"
      };
      const folderId: string = "folder1234567890";
      const newItemID: string = "wfw1234567891";

      spyOn(common, "createItemWithData").and.resolveTo({
        folder: "folder1234567890",
        id: newItemID,
        success: true
      });

      spyOn(common, "setWorkflowConfigurationZip").and.resolveTo({
        itemId: newItemID,
        success: true
      });

      spyOn(workflowHelpers, "addWorkflowItem").and.callFake(
        () => {
          const createdItem: common.IItemTemplate = templates.getItemTemplate("Workflow");
          createdItem.itemId = newItemID;
          createdItem.item.id = newItemID;
          return Promise.resolve(createdItem);
        }
      );

      const response = await workflow.createItemFromTemplate(
        itemTemplate, templateDictionary, MOCK_USER_SESSION, utils.ITEM_PROGRESS_CALLBACK);

      expect(response.id).withContext("created id").toEqual(newItemID);
      expect(response.type).withContext("created type").toEqual("Workflow");
      expect(response.postProcess).withContext("created postProcess").toBeFalse();

      const itemTemplate2: common.IItemTemplate = templates.getItemTemplate("Workflow");
      itemTemplate2.itemId = newItemID;
      itemTemplate2.item.id = newItemID;
      itemTemplate2.properties.configuration = getSampleConfigJson(false);
      expect(response).withContext("final item").toEqual({
        item: itemTemplate2,
        id: newItemID,
        type: "Workflow",
        postProcess: false
      } as common.ICreateItemFromTemplateResponse);
    });

    it("handles failure to add workflow item", async () => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate("Workflow");
      itemTemplate.properties.configuration = getSampleConfigJson(true);
      const templateDictionary: any = {
        "7a69f67e4c6744918fbea49b8241640e": "7a69f67e4c6744918fbea49b8241640e",
        "9ef76d79ed2741a8bf5a3b9b344b3c07": "9ef76d79ed2741a8bf5a3b9b344b3c07"
      };
      const newItemID: string = "wfw1234567891";

      spyOn(common, "createItemWithData").and.resolveTo({
        folder: "folder1234567890",
        id: newItemID,
        success: true
      });

      spyOn(common, "setWorkflowConfigurationZip").and.resolveTo({
        itemId: newItemID,
        success: true
      });

      spyOn(workflowHelpers, "addWorkflowItem").and.resolveTo(undefined);

      spyOn(common, "removeItem").and.resolveTo({ success: true, itemId: newItemID });

      const response = await workflow.createItemFromTemplate(
        itemTemplate, templateDictionary, MOCK_USER_SESSION, utils.ITEM_PROGRESS_CALLBACK);

      expect(response).toEqual(common.generateEmptyCreationResponse("Workflow"));
    });

    it("handles case where overall deployment has been cancelled before we start", async () => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate("Workflow");
      itemTemplate.properties.configuration = getSampleConfigJson(true);
      const templateDictionary: any = {
        "7a69f67e4c6744918fbea49b8241640e": "7a69f67e4c6744918fbea49b8241640e",
        "9ef76d79ed2741a8bf5a3b9b344b3c07": "9ef76d79ed2741a8bf5a3b9b344b3c07"
      };

      const response = await workflow.createItemFromTemplate(
        itemTemplate, templateDictionary, MOCK_USER_SESSION, utils.createFailingItemProgressCallbackOnNthCall(1));

      expect(response).toEqual(
        templates.getFailedItem(itemTemplate.type)
      );
    });

    it("handles case where overall deployment has been cancelled after new item created", async () => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate("Workflow");
      itemTemplate.properties.configuration = getSampleConfigJson(true);
      const templateDictionary: any = {
        "7a69f67e4c6744918fbea49b8241640e": "7a69f67e4c6744918fbea49b8241640e",
        "9ef76d79ed2741a8bf5a3b9b344b3c07": "9ef76d79ed2741a8bf5a3b9b344b3c07"
      };
      const newItemID: string = "wfw1234567891";

      spyOn(common, "createItemWithData").and.resolveTo({
        folder: "folder1234567890",
        id: newItemID,
        success: true
      });

      spyOn(common, "setWorkflowConfigurationZip").and.resolveTo({
        itemId: newItemID,
        success: true
      });

      spyOn(workflowHelpers, "addWorkflowItem").and.callFake(
        () => {
          const createdItem: common.IItemTemplate = templates.getItemTemplate("Workflow");
          createdItem.itemId = newItemID;
          createdItem.item.id = newItemID;
          return Promise.resolve(createdItem);
        }
      );

      spyOn(common, "removeItem").and.resolveTo({ success: true, itemId: newItemID });

      const response = await workflow.createItemFromTemplate(
        itemTemplate, templateDictionary, MOCK_USER_SESSION, utils.createFailingItemProgressCallbackOnNthCall(2));

      expect(response).toEqual(
        templates.getFailedItem(itemTemplate.type)
      );
    });

    it("handles case where new item creation throws an error", async () => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate("Workflow");
      itemTemplate.properties.configuration = getSampleConfigJson(true);
      const templateDictionary: any = {
        "7a69f67e4c6744918fbea49b8241640e": "7a69f67e4c6744918fbea49b8241640e",
        "9ef76d79ed2741a8bf5a3b9b344b3c07": "9ef76d79ed2741a8bf5a3b9b344b3c07"
      };
      const newItemID: string = "wfw1234567891";

      spyOn(common, "createItemWithData").and.rejectWith({
        folder: "",
        id: "",
        success: false
      });

      spyOn(common, "removeItem").and.resolveTo({
        success: true,
        itemId: newItemID
      });

      const response = await workflow.createItemFromTemplate(
        itemTemplate, templateDictionary, MOCK_USER_SESSION, utils.ITEM_PROGRESS_CALLBACK);

      expect(response).toEqual(
        templates.getFailedItem(itemTemplate.type)
      );
    });
  });

});

// ------------------------------------------------------------------------------------------------------------------ //

function getSampleConfigJson(
  templatized = false
): any {
  return templatized ?
    {
      "info.json": "{\"schemaVersion\":\"11.2.0.1\"}",
      "diagrams.json": "[{\"diagram_id\":\"w7shJbW2QL-hE9-AZ7nbRA\",\"diagram_version\":1,\"diagram_details\":\"{\\\"initialStepId\\\":\\\"b3722bc9-d658-46bb-a6b7-4d5c67f8f20c\\\",\\\"initialStepName\\\":\\\"Welcome\\\",\\\"steps\\\":[{\\\"id\\\":\\\"b3722bc9-d658-46bb-a6b7-4d5c67f8f20c\\\",\\\"name\\\":\\\"Welcome\\\",\\\"description\\\":\\\"Step to be put at the start and end of a workflow\\\",\\\"stepTemplateId\\\":\\\"AVw8d6MdyiKjHtuS9dJ6\\\",\\\"automatic\\\":true,\\\"proceedNext\\\":true,\\\"canSkip\\\":true,\\\"position\\\":\\\"0.5, -0.5, 120, 60\\\",\\\"shape\\\":3,\\\"color\\\":\\\"130, 202, 237\\\"}]",
      "roles.json": "[{\"workflow_privileges\":\"[\\\"adminAdvanced\\\",\\\"jobAssignGroup\\\",\\\"jobForceStop\\\",\\\"jobUpdateHolds\\\",\\\"jobUpdateAttachments\\\",\\\"queryUpdate\\\",\\\"jobAssignIndividual\\\",\\\"jobAssignAny\\\",\\\"jobCreate\\\",\\\"jobReopenClosed\\\",\\\"jobUpdateDate\\\",\\\"jobUpdateDescription\\\",\\\"jobUpdateName\\\",\\\"jobUpdateOwner\\\",\\\"jobUpdatePriority\\\",\\\"jobUpdateStatus\\\",\\\"jobUpdateNotes\\\",\\\"AOIOverideOverlap\\\",\\\"jobUpdateDependencies\\\",\\\"jobUpdateParentJob\\\",\\\"jobUpdateAOI\\\",\\\"jobClose\\\",\\\"jobheldUpdateProperties\\\"}]",
      "roleGroups.json": "[{\"role_name\":\"Workflow Administrator\",\"group_id\":\"{{9ef76d79ed2741a8bf5a3b9b344b3c07}}\",\"group_name\":\"\"}]",
      "lookups.json": "[{\"lookup_type\":\"status\",\"lookup_name\":\"Created\",\"value\":1},{\"lookup_type\":\"status\",\"lookup_name\":\"Ready\",\"value\":2},{\"lookup_type\":\"status\",\"lookup_name\":\"In Progress\",\"value\":3},{\"lookup_type\":\"status\",\"lookup_name\":\"Incomplete\",\"value\":4},{\"lookup_type\":\"status\",\"lookup_name\":\"Revised\",\"value\":5},{\"lookup_type\":\"status\",\"lookup_name\":\"Pending\",\"value\":6},{\"lookup_type\":\"status\",\"lookup_name\":\"On Hold\",\"value\":7},{\"lookup_type\":\"status\",\"lookup_name\":\"Approved\",\"value\":8},{\"lookup_type\":\"status\",\"lookup_name\":\"Completed\",\"value\":9}]",
      "settings.json": "[]",
      "searches.json": "[{\"search_id\":\"rrUF60TFQCe2K0vtgSsYpA\",\"search_name\":\"My Jobs\",\"definition\":\"{\\\"q\\\":\\\"\\\\\\\"assignedType='User' AND closed=0 AND assignedTo='\\\\\\\" + $currentUser + \\\\\\\"' \\\\\\\"\\\",\\\"fields\\\":[\\\"assignedTo\\\",\\\"jobName\\\",\\\"dueDate\\\",\\\"jobTemplateName\\\",\\\"currentStep\\\",\\\"priority\\\",\\\"jobStatus\\\"],\\\"displayNames\\\":[\\\"Assigned To\\\",\\\"Name\\\",\\\"Due\\\",\\\"Type\\\",\\\"Step\\\",\\\"Priority\\\",\\\"Status\\\"],\\\"sortFields\\\":[{\\\"field\\\":\\\"jobName\\\",\\\"sortOrder\\\":\\\"Asc\\\"},{\\\"field\\\":\\\"priority\\\"}]",
      "shareRelationships.json": "[]",
      "templates.json": "[]",
      "jobTemplates.json": "[{\"job_template_id\":\"Gk9IjgBWQdGCFlRMf6fplw\",\"job_template_name\":\"Test Diagram\",\"default_job_duration\":10,\"default_assigned_to\":\"jobCreator($job)\",\"job_start_date_type\":\"CreationDate\",\"diagram_id\":\"w7shJbW2QL-hE9-AZ7nbRA\",\"default_priority_rank\":0,\"default_assigned_type\":\"User\",\"description\":\"Test Diagram Summary\",\"state\":\"Active\",\"default_job_name\":\"JOB_[index]\",\"default_final_status\":\"Closed\",\"default_status\":\"Ready\",\"activities\":\"[]\"}]",
      "jobTemplateAutomatedCreation.json": "[]",
      "jobExtPropertyTableDefinitions.json": "[{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"table_name\":\"tree_request\",\"table_alias\":\"Tree Request\",\"table_order\":-1,\"relationship_type\":1,\"item_id\":\"{{7a69f67e4c6744918fbea49b8241640e}}\",\"item_type\":\"SurveyForm\",\"layer_id\":\"0\",\"portal_type\":\"Current\",\"feature_service_unique_id\":\"globalid\",\"secure\":1,\"searchable\":0}]",
      "jobExtPropertyDefinitions.json": "[{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"reqid\",\"property_alias\":\"Request ID\",\"property_order\":0,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"reqcategory\",\"property_alias\":\"Request Category\",\"property_order\":1,\"data_type\":-1,\"required\":0}]",
      "jobTemplatesToExtPropertyTableDefXref.json": "[{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"table_order\":0,\"job_template_id\":\"Gk9IjgBWQdGCFlRMf6fplw\"}]"
    }
  :
    {
      "info.json": "{\"schemaVersion\":\"11.2.0.1\"}",
      "diagrams.json": "[{\"diagram_id\":\"w7shJbW2QL-hE9-AZ7nbRA\",\"diagram_version\":1,\"diagram_details\":\"{\\\"initialStepId\\\":\\\"b3722bc9-d658-46bb-a6b7-4d5c67f8f20c\\\",\\\"initialStepName\\\":\\\"Welcome\\\",\\\"steps\\\":[{\\\"id\\\":\\\"b3722bc9-d658-46bb-a6b7-4d5c67f8f20c\\\",\\\"name\\\":\\\"Welcome\\\",\\\"description\\\":\\\"Step to be put at the start and end of a workflow\\\",\\\"stepTemplateId\\\":\\\"AVw8d6MdyiKjHtuS9dJ6\\\",\\\"automatic\\\":true,\\\"proceedNext\\\":true,\\\"canSkip\\\":true,\\\"position\\\":\\\"0.5, -0.5, 120, 60\\\",\\\"shape\\\":3,\\\"color\\\":\\\"130, 202, 237\\\"}]",
      "roles.json": "[{\"workflow_privileges\":\"[\\\"adminAdvanced\\\",\\\"jobAssignGroup\\\",\\\"jobForceStop\\\",\\\"jobUpdateHolds\\\",\\\"jobUpdateAttachments\\\",\\\"queryUpdate\\\",\\\"jobAssignIndividual\\\",\\\"jobAssignAny\\\",\\\"jobCreate\\\",\\\"jobReopenClosed\\\",\\\"jobUpdateDate\\\",\\\"jobUpdateDescription\\\",\\\"jobUpdateName\\\",\\\"jobUpdateOwner\\\",\\\"jobUpdatePriority\\\",\\\"jobUpdateStatus\\\",\\\"jobUpdateNotes\\\",\\\"AOIOverideOverlap\\\",\\\"jobUpdateDependencies\\\",\\\"jobUpdateParentJob\\\",\\\"jobUpdateAOI\\\",\\\"jobClose\\\",\\\"jobheldUpdateProperties\\\"}]",
      "roleGroups.json": "[{\"role_name\":\"Workflow Administrator\",\"group_id\":\"9ef76d79ed2741a8bf5a3b9b344b3c07\",\"group_name\":\"\"}]",
      "lookups.json": "[{\"lookup_type\":\"status\",\"lookup_name\":\"Created\",\"value\":1},{\"lookup_type\":\"status\",\"lookup_name\":\"Ready\",\"value\":2},{\"lookup_type\":\"status\",\"lookup_name\":\"In Progress\",\"value\":3},{\"lookup_type\":\"status\",\"lookup_name\":\"Incomplete\",\"value\":4},{\"lookup_type\":\"status\",\"lookup_name\":\"Revised\",\"value\":5},{\"lookup_type\":\"status\",\"lookup_name\":\"Pending\",\"value\":6},{\"lookup_type\":\"status\",\"lookup_name\":\"On Hold\",\"value\":7},{\"lookup_type\":\"status\",\"lookup_name\":\"Approved\",\"value\":8},{\"lookup_type\":\"status\",\"lookup_name\":\"Completed\",\"value\":9}]",
      "settings.json": "[]",
      "searches.json": "[{\"search_id\":\"rrUF60TFQCe2K0vtgSsYpA\",\"search_name\":\"My Jobs\",\"definition\":\"{\\\"q\\\":\\\"\\\\\\\"assignedType='User' AND closed=0 AND assignedTo='\\\\\\\" + $currentUser + \\\\\\\"' \\\\\\\"\\\",\\\"fields\\\":[\\\"assignedTo\\\",\\\"jobName\\\",\\\"dueDate\\\",\\\"jobTemplateName\\\",\\\"currentStep\\\",\\\"priority\\\",\\\"jobStatus\\\"],\\\"displayNames\\\":[\\\"Assigned To\\\",\\\"Name\\\",\\\"Due\\\",\\\"Type\\\",\\\"Step\\\",\\\"Priority\\\",\\\"Status\\\"],\\\"sortFields\\\":[{\\\"field\\\":\\\"jobName\\\",\\\"sortOrder\\\":\\\"Asc\\\"},{\\\"field\\\":\\\"priority\\\"}]",
      "shareRelationships.json": "[]",
      "templates.json": "[]",
      "jobTemplates.json": "[{\"job_template_id\":\"Gk9IjgBWQdGCFlRMf6fplw\",\"job_template_name\":\"Test Diagram\",\"default_job_duration\":10,\"default_assigned_to\":\"jobCreator($job)\",\"job_start_date_type\":\"CreationDate\",\"diagram_id\":\"w7shJbW2QL-hE9-AZ7nbRA\",\"default_priority_rank\":0,\"default_assigned_type\":\"User\",\"description\":\"Test Diagram Summary\",\"state\":\"Active\",\"default_job_name\":\"JOB_[index]\",\"default_final_status\":\"Closed\",\"default_status\":\"Ready\",\"activities\":\"[]\"}]",
      "jobTemplateAutomatedCreation.json": "[]",
      "jobExtPropertyTableDefinitions.json": "[{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"table_name\":\"tree_request\",\"table_alias\":\"Tree Request\",\"table_order\":-1,\"relationship_type\":1,\"item_id\":\"7a69f67e4c6744918fbea49b8241640e\",\"item_type\":\"SurveyForm\",\"layer_id\":\"0\",\"portal_type\":\"Current\",\"feature_service_unique_id\":\"globalid\",\"secure\":1,\"searchable\":0}]",
      "jobExtPropertyDefinitions.json": "[{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"reqid\",\"property_alias\":\"Request ID\",\"property_order\":0,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"reqcategory\",\"property_alias\":\"Request Category\",\"property_order\":1,\"data_type\":-1,\"required\":0}]",
      "jobTemplatesToExtPropertyTableDefXref.json": "[{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"table_order\":0,\"job_template_id\":\"Gk9IjgBWQdGCFlRMf6fplw\"}]"
    }
}
