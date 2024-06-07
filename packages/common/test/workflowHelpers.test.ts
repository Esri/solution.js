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
import * as request from "@esri/arcgis-rest-request";
import * as restHelpers from "../src/restHelpers";
import * as restHelpersGet from "../src/restHelpersGet";
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
    it("basic test", async () => {
      const workflowConfig: any = { "jsTemplates": "Fred" };
      const zipFile = await workflowHelpers.compressWorkflowIntoZipFile(workflowConfig);
      expect(zipFile.name).toEqual("workflow_configuration.zip");
    });
  });

  describe("deleteWorkflowItem", () => {
    it("basic test", async () => {
      MOCK_USER_SESSION.getUser = () => Promise.resolve({ orgId: "org123" });
      MOCK_USER_SESSION.getPortal = () => Promise.resolve({ helperServices: { workflowManager: { url: "https://workflow.arcgis.com" } } });
      spyOn(restHelpersGet, "getItemDataAsJson").and.resolveTo({ "groupId": "grp1234567890" });
      const requestSpy = spyOn(request, "request").and.resolveTo(utils.getSuccessResponse());
      const removeGroupSpy = spyOn(restHelpers, "removeGroup").and.resolveTo(utils.getSuccessResponse({ id: "grp1234567890" }));

      const result: boolean = await workflowHelpers.deleteWorkflowItem(
        "itm1234567890", "https://workflow.arcgis.com/org123", MOCK_USER_SESSION);

      expect(requestSpy.calls.argsFor(0)[0]).toEqual("https://workflow.arcgis.com/org123/admin/itm1234567890");
      expect(result).toBeTrue();
      expect(removeGroupSpy).toHaveBeenCalled();
    });

    it("handles missing group id", async () => {
      MOCK_USER_SESSION.getUser = () => Promise.resolve({ orgId: "org123" });
      MOCK_USER_SESSION.getPortal = () => Promise.resolve({ helperServices: { workflowManager: { url: "https://workflow.arcgis.com" } } });
      spyOn(restHelpersGet, "getItemDataAsJson").and.resolveTo(null);
      spyOn(request, "request").and.resolveTo(utils.getSuccessResponse());
      const removeGroupSpy = spyOn(restHelpers, "removeGroup").and.resolveTo(utils.getSuccessResponse({ id: "grp1234567890" }));

      const result: boolean = await workflowHelpers.deleteWorkflowItem(
        "itm1234567890", "https://workflow.arcgis.com/myOrgId", MOCK_USER_SESSION);

      expect(result).toBeTrue();
      expect(removeGroupSpy).not.toHaveBeenCalled();
    });
  });

  describe("extractWorkflowFromZipFile", () => {
    it("basic test", async () => {
      const sampleWorkflowConfig = await generateWorkflowZipFileWithId();
      const zipFiles = await workflowHelpers.extractWorkflowFromZipFile(sampleWorkflowConfig);
      expect(zipFiles).toEqual({
        "jobExtPropertyTableDefinitions.json": "[{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"table_name\":\"tree_request\",\"table_alias\":\"Tree Request\",\"table_order\":-1,\"relationship_type\":1,\"item_id\":\"7a69f67e4c6744918fbea49b8241640e\",\"item_type\":\"SurveyForm\",\"layer_id\":\"0\",\"portal_type\":\"Current\",\"feature_service_unique_id\":\"globalid\",\"secure\":1,\"searchable\":0}]",
        "jobExtPropertyDefinitions.json": "[{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"reqid\",\"property_alias\":\"Request ID\",\"property_order\":0,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"reqcategory\",\"property_alias\":\"Request Category\",\"property_order\":1,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"reqtype\",\"property_alias\":\"Request Type\",\"property_order\":2,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"details\",\"property_alias\":\"Details\",\"property_order\":3,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"pocfirstname\",\"property_alias\":\"First Name\",\"property_order\":4,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"poclastname\",\"property_alias\":\"Last Name\",\"property_order\":5,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"pocphone\",\"property_alias\":\"Phone Number\",\"property_order\":6,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"pocemail\",\"property_alias\":\"Email\",\"property_order\":7,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"locdesc\",\"property_alias\":\"Location\",\"property_order\":8,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"publicview\",\"property_alias\":\"Visible to Public\",\"property_order\":9,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"source\",\"property_alias\":\"Source\",\"property_order\":10,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"assetglobalid\",\"property_alias\":\"Asset GlobalID\",\"property_order\":11,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"assignmentglobalid\",\"property_alias\":\"Assignment GlobalID\",\"property_order\":12,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"status\",\"property_alias\":\"Status\",\"property_order\":13,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"notes\",\"property_alias\":\"Notes\",\"property_order\":14,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"assignedto\",\"property_alias\":\"Assigned To\",\"property_order\":15,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"resolutiondt\",\"property_alias\":\"Resolved On\",\"property_order\":16,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"resolution\",\"property_alias\":\"Resolution\",\"property_order\":17,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"globalid\",\"property_alias\":\"GlobalID\",\"property_order\":18,\"data_type\":-1,\"required\":0,\"editable\":1,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"created_date\",\"property_alias\":\"Submitted On\",\"property_order\":19,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"created_user\",\"property_alias\":\"Submitted By\",\"property_order\":20,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"last_edited_date\",\"property_alias\":\"Last Edited On\",\"property_order\":21,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"last_edited_user\",\"property_alias\":\"Last Edited By\",\"property_order\":22,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1}]"
      });
    });
  });

  describe("getWorkflowManagerAuthorized", () => {
    it("handles AGO authorized", async () => {
      const orgId = "abcdef";
      spyOn(request, "request").and.resolveTo({ hasAdvancedLicense: true });

      const isAuthorized = await workflowHelpers.getWorkflowManagerAuthorized(
        "https://workflow.arcgis.com/myOrgId", MOCK_USER_SESSION);
      expect(isAuthorized).toBeTrue();
    });

    it("handles AGO unauthorized", async () => {
      const orgId = "abcdef";
      spyOn(request, "request").and.resolveTo({ hasAdvancedLicense: false });

      const isAuthorized = await workflowHelpers.getWorkflowManagerAuthorized(
        "https://workflow.arcgis.com/myOrgId", MOCK_USER_SESSION);
      expect(isAuthorized).toBeFalse();
    });

    it("handles Enterprise authorized", async () => {
      const orgId = "abcdef";
      const enterpriseWebAdaptorUrl = "https://myserver.mycompany.com/webadaptor/workflow";
      spyOn(request, "request").and.resolveTo({ hasAdvancedLicense: true });

      const isAuthorized = await workflowHelpers.getWorkflowManagerAuthorized(
        enterpriseWebAdaptorUrl, MOCK_USER_SESSION);
      expect(isAuthorized).toBeTrue();
    });

    it("handles Enterprise unauthorized", async () => {
      const orgId = "abcdef";
      const enterpriseWebAdaptorUrl = "https://myserver.mycompany.com/webadaptor/workflow";
      spyOn(request, "request").and.resolveTo({ hasAdvancedLicense: false });

      const isAuthorized = await workflowHelpers.getWorkflowManagerAuthorized(
        enterpriseWebAdaptorUrl, MOCK_USER_SESSION);
      expect(isAuthorized).toBeFalse();
    });

    it("handles AGO unauthorized via throw", async () => {
      const orgId = "abcdef";
      spyOn(request, "request").and.throwError("Unauthorized");

      const isAuthorized = await workflowHelpers.getWorkflowManagerAuthorized(
        "https://workflow.arcgis.com/myOrgId", MOCK_USER_SESSION);
      expect(isAuthorized).toBeFalse();
    });

    it("handles failure from `request`", async () => {
      const orgId = "abcdef";
      spyOn(request, "request").and.resolveTo(null);

      const isAuthorized = await workflowHelpers.getWorkflowManagerAuthorized(
        "https://workflow.arcgis.com/myOrgId", MOCK_USER_SESSION);
      expect(isAuthorized).toBeFalse();
    });

    it("handles undefined args", async () => {
      spyOn(request, "request").and.resolveTo(null);

      const isAuthorized = await workflowHelpers.getWorkflowManagerAuthorized("", new interfaces.UserSession({}));
      expect(isAuthorized).toBeFalse();
    });
  });

  describe("getWorkflowBaseURL", () => {
    it("handles AGO with supplied portal info", async () => {
      const orgId = "abcdef";
      const portalResponse = {
        portalHostname: "myOrg.maps.arcgis.com",
        isPortal: false,
        helperServices: {
          workflowManager: {
            url: "https://workflow.arcgis.com"
          }
        }
      }

      const actual = await workflowHelpers.getWorkflowBaseURL(
        MOCK_USER_SESSION, portalResponse as any, orgId);

      expect(actual).toEqual(`https://workflow.arcgis.com/${orgId}`);
    });

    it("handles AGO with supplied portal info but workflow not supported 1", async () => {
      const orgId = "abcdef";
      const portalResponse = {
        portalHostname: "myOrg.maps.arcgis.com",
        isPortal: false,
        helperServices: {}
      }

      const actual = await workflowHelpers.getWorkflowBaseURL(
        MOCK_USER_SESSION, portalResponse as any, orgId);

      expect(actual).toEqual(`https://${portalResponse.portalHostname}/${orgId}`);
    });

    it("handles AGO with supplied portal info but workflow not supported 2", async () => {
      const orgId = "abcdef";
      const portalResponse = {
        portalHostname: "myOrg.maps.arcgis.com",
        isPortal: false
      }

      const actual = await workflowHelpers.getWorkflowBaseURL(
        MOCK_USER_SESSION, portalResponse as any, orgId);

      expect(actual).toEqual(`https://${portalResponse.portalHostname}/${orgId}`);
    });

    it("handles AGO with missing portal info", async () => {
      const orgId = "abcdef";
      const portalResponse = undefined;

      spyOn(restHelpersGet, "getUser").and.resolveTo({ orgId });
      spyOn(restHelpersGet, "getPortal").and.resolveTo({
        portalHostname: "myOrg.maps.arcgis.com",
        isPortal: false,
        helperServices: {
          workflowManager: {
            url: "https://workflow.arcgis.com"
          }
        }
      } as any);

      const actual = await workflowHelpers.getWorkflowBaseURL(
        MOCK_USER_SESSION, portalResponse as any, orgId);

      expect(actual).toEqual(`https://workflow.arcgis.com/${orgId}`);
    });

    it("handles AGO with missing orgId and portal info", async () => {
      const orgId = "ghijkl";
      const portalResponse = undefined;

      spyOn(restHelpersGet, "getUser").and.resolveTo({ orgId });
      spyOn(restHelpersGet, "getPortal").and.resolveTo({
        portalHostname: "myOrg.maps.arcgis.com",
        isPortal: false,
        helperServices: {
          workflowManager: {
            url: "https://workflow.arcgis.com"
          }
        }
      } as any);

      const actual = await workflowHelpers.getWorkflowBaseURL(
        MOCK_USER_SESSION, portalResponse as any);

      expect(actual).toEqual(`https://workflow.arcgis.com/${orgId}`);
    });

    it("handles Enterprise with supplied portal info", async () => {
      const portalResponse = {
        portalHostname: "myOrg.maps.arcgis.com",
        isPortal: true,
        helperServices: {
          workflowManager: {
            url: "https://workflow.arcgis.com"
          }
        }
      }

      spyOn(restHelpersGet, "getEnterpriseServers").and.resolveTo([{
        "id": "ghi",
        "name": "serverGHI.esri.com:6443",
        "adminUrl": "https://serverGHI.esri.com:6443/arcgis",
        "url": "https://serverGHI.ags.esri.com/server",
        "isHosted": true,
        "serverType": "ArcGIS",
        "serverRole": "HOSTING_SERVER",
        "serverFunction": "WorkflowManager"
      }]);

      const actual = await workflowHelpers.getWorkflowBaseURL(
        MOCK_USER_SESSION, portalResponse as any);

      expect(actual).toEqual(`https://serverGHI.ags.esri.com/server/workflow`);
    });
  });

  describe("_getWorkflowEnterpriseServerRootURL", () => {
    it("fetches the Workflow Manager URL on Enterprise", async () => {
      const portalRestUrl = utils.PORTAL_SUBSET.restUrl;
      const servers = [
        {
          "id": "abc",
          "name": "serverABC.esri.com:11443",
          "adminUrl": "https://serverABC.esri.com:11443/arcgis",
          "url": "https://serverABC.ags.esri.com/gis",
          "isHosted": false,
          "serverType": "ARCGIS_NOTEBOOK_SERVER",
          "serverRole": "FEDERATED_SERVER",
          "serverFunction": "NotebookServer"
        },
        {
          "id": "def",
          "name": "serverDEF.ags.esri.com",
          "adminUrl": "https://serverDEF.ags.esri.com/video",
          "url": "https://serverDEF.ags.esri.com/video",
          "isHosted": false,
          "serverType": "ARCGIS_VIDEO_SERVER",
          "serverRole": "FEDERATED_SERVER",
          "serverFunction": "VideoServer"
        },
        {
          "id": "ghi",
          "name": "serverGHI.esri.com:6443",
          "adminUrl": "https://serverGHI.esri.com:6443/arcgis",
          "url": "https://serverGHI.ags.esri.com/server",
          "isHosted": true,
          "serverType": "ArcGIS",
          "serverRole": "HOSTING_SERVER",
          "serverFunction": "WorkflowManager"
        }
      ];

      spyOn(restHelpersGet, "getEnterpriseServers").and.resolveTo(servers);

      const actual = await workflowHelpers._getWorkflowEnterpriseServerRootURL(portalRestUrl, MOCK_USER_SESSION);

      expect(actual).toEqual("https://serverGHI.ags.esri.com/server");
    });

    it("handles case where the Workflow Manager is not enabled on Enterprise", async () => {
      const portalRestUrl = utils.PORTAL_SUBSET.restUrl;
      const servers = [
        {
          "id": "abc",
          "name": "serverABC.esri.com:11443",
          "adminUrl": "https://serverABC.esri.com:11443/arcgis",
          "url": "https://serverABC.ags.esri.com/gis",
          "isHosted": false,
          "serverType": "ARCGIS_NOTEBOOK_SERVER",
          "serverRole": "FEDERATED_SERVER",
          "serverFunction": "NotebookServer"
        },
        {
          "id": "def",
          "name": "serverDEF.ags.esri.com",
          "adminUrl": "https://serverDEF.ags.esri.com/video",
          "url": "https://serverDEF.ags.esri.com/video",
          "isHosted": false,
          "serverType": "ARCGIS_VIDEO_SERVER",
          "serverRole": "FEDERATED_SERVER",
          "serverFunction": "VideoServer"
        }
      ];

      spyOn(restHelpersGet, "getEnterpriseServers").and.resolveTo(servers);

      const actual = await workflowHelpers._getWorkflowEnterpriseServerRootURL(portalRestUrl, MOCK_USER_SESSION);

      expect(actual).toEqual("");
    });
  });

});

// ------------------------------------------------------------------------------------------------------------------ //

export function generateWorkflowZipFileWithId(
): Promise<File> {
  const zip = new JSZip();
  zip.file("jobExtPropertyTableDefinitions.json", "[{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"table_name\":\"tree_request\",\"table_alias\":\"Tree Request\",\"table_order\":-1,\"relationship_type\":1,\"item_id\":\"7a69f67e4c6744918fbea49b8241640e\",\"item_type\":\"SurveyForm\",\"layer_id\":\"0\",\"portal_type\":\"Current\",\"feature_service_unique_id\":\"globalid\",\"secure\":1,\"searchable\":0}]");
  zip.file("jobExtPropertyDefinitions.json", "[{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"reqid\",\"property_alias\":\"Request ID\",\"property_order\":0,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"reqcategory\",\"property_alias\":\"Request Category\",\"property_order\":1,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"reqtype\",\"property_alias\":\"Request Type\",\"property_order\":2,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"details\",\"property_alias\":\"Details\",\"property_order\":3,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"pocfirstname\",\"property_alias\":\"First Name\",\"property_order\":4,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"poclastname\",\"property_alias\":\"Last Name\",\"property_order\":5,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"pocphone\",\"property_alias\":\"Phone Number\",\"property_order\":6,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"pocemail\",\"property_alias\":\"Email\",\"property_order\":7,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"locdesc\",\"property_alias\":\"Location\",\"property_order\":8,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"publicview\",\"property_alias\":\"Visible to Public\",\"property_order\":9,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"source\",\"property_alias\":\"Source\",\"property_order\":10,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"assetglobalid\",\"property_alias\":\"Asset GlobalID\",\"property_order\":11,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"assignmentglobalid\",\"property_alias\":\"Assignment GlobalID\",\"property_order\":12,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"status\",\"property_alias\":\"Status\",\"property_order\":13,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"notes\",\"property_alias\":\"Notes\",\"property_order\":14,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"assignedto\",\"property_alias\":\"Assigned To\",\"property_order\":15,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"resolutiondt\",\"property_alias\":\"Resolved On\",\"property_order\":16,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"resolution\",\"property_alias\":\"Resolution\",\"property_order\":17,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"globalid\",\"property_alias\":\"GlobalID\",\"property_order\":18,\"data_type\":-1,\"required\":0,\"editable\":1,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"created_date\",\"property_alias\":\"Submitted On\",\"property_order\":19,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"created_user\",\"property_alias\":\"Submitted By\",\"property_order\":20,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"last_edited_date\",\"property_alias\":\"Last Edited On\",\"property_order\":21,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"last_edited_user\",\"property_alias\":\"Last Edited By\",\"property_order\":22,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1}]");

  return zip.generateAsync({ type: "blob" })
  .then((blob) => {
    return Promise.resolve(new File([blob], "workflow_configuration.zip"));
  });
}

export function generateWorkflowZipFileWithoutId(
  ): Promise<File> {
    const zip = new JSZip();
    zip.file("jobExtPropertyDefinitions.json", "[{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"reqid\",\"property_alias\":\"Request ID\",\"property_order\":0,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"reqcategory\",\"property_alias\":\"Request Category\",\"property_order\":1,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"reqtype\",\"property_alias\":\"Request Type\",\"property_order\":2,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"details\",\"property_alias\":\"Details\",\"property_order\":3,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"pocfirstname\",\"property_alias\":\"First Name\",\"property_order\":4,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"poclastname\",\"property_alias\":\"Last Name\",\"property_order\":5,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"pocphone\",\"property_alias\":\"Phone Number\",\"property_order\":6,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"pocemail\",\"property_alias\":\"Email\",\"property_order\":7,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"locdesc\",\"property_alias\":\"Location\",\"property_order\":8,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"publicview\",\"property_alias\":\"Visible to Public\",\"property_order\":9,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"source\",\"property_alias\":\"Source\",\"property_order\":10,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"assetglobalid\",\"property_alias\":\"Asset GlobalID\",\"property_order\":11,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"assignmentglobalid\",\"property_alias\":\"Assignment GlobalID\",\"property_order\":12,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"status\",\"property_alias\":\"Status\",\"property_order\":13,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"notes\",\"property_alias\":\"Notes\",\"property_order\":14,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"assignedto\",\"property_alias\":\"Assigned To\",\"property_order\":15,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"resolutiondt\",\"property_alias\":\"Resolved On\",\"property_order\":16,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"resolution\",\"property_alias\":\"Resolution\",\"property_order\":17,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"globalid\",\"property_alias\":\"GlobalID\",\"property_order\":18,\"data_type\":-1,\"required\":0,\"editable\":1,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"created_date\",\"property_alias\":\"Submitted On\",\"property_order\":19,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"created_user\",\"property_alias\":\"Submitted By\",\"property_order\":20,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"last_edited_date\",\"property_alias\":\"Last Edited On\",\"property_order\":21,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1},{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"property_name\":\"last_edited_user\",\"property_alias\":\"Last Edited By\",\"property_order\":22,\"data_type\":-1,\"required\":0,\"editable\":0,\"visible\":1}]");
    zip.file("jobTemplatesToExtPropertyTableDefXref.json", "[{\"table_id\":\"xMkNNrbMTga4mrWnoREGWA\",\"table_order\":0,\"job_template_id\":\"Gk9IjgBWQdGCFlRMf6fplw\"}]");

    return zip.generateAsync({ type: "blob" })
    .then((blob) => {
      return Promise.resolve(new File([blob], "workflow_configuration.zip"));
    });
  }
