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

import * as arcGISRestJS from "../src/arcgisRestJS";
import * as restHelpers from "../src/restHelpers";
import * as restHelpersGet from "../src/restHelpersGet";
import * as utils from "../../common/test/mocks/utils";
import * as workflowHelpers from "../src/workflowHelpers";
import JSZip from "jszip";

// ------------------------------------------------------------------------------------------------------------------ //

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

let MOCK_USER_SESSION: arcGISRestJS.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

describe("Module `workflowHelpers`", () => {
  describe("compressWorkflowIntoZipFile", () => {
    it("basic test", async () => {
      const workflowConfig: any = { jsTemplates: "Fred" };
      const zipFile = await workflowHelpers.compressWorkflowIntoZipFile(workflowConfig);
      expect(zipFile.name).toEqual("workflow_configuration.zip");
    });
  });

  describe("deleteWorkflowItem", () => {
    it("basic test", async () => {
      MOCK_USER_SESSION.getUser = () => Promise.resolve({ orgId: "org123" });
      MOCK_USER_SESSION.getPortal = () =>
        Promise.resolve({
          helperServices: {
            workflowManager: { url: "https://workflow.arcgis.com" },
          },
        });
      spyOn(restHelpersGet, "getItemDataAsJson").and.resolveTo({
        groupId: "grp1234567890",
      });
      const requestSpy = spyOn(arcGISRestJS, "request").and.resolveTo(utils.getSuccessResponse());
      const removeGroupSpy = spyOn(restHelpers, "removeGroup").and.resolveTo(
        utils.getSuccessResponse({ id: "grp1234567890" }),
      );

      const result: boolean = await workflowHelpers.deleteWorkflowItem(
        "itm1234567890",
        "https://workflow.arcgis.com/org123",
        MOCK_USER_SESSION,
      );

      expect(requestSpy.calls.argsFor(0)[0]).toEqual("https://workflow.arcgis.com/org123/admin/itm1234567890");
      expect(result).toBeTrue();
      expect(removeGroupSpy).toHaveBeenCalled();
    });

    it("handles missing group id", async () => {
      MOCK_USER_SESSION.getUser = () => Promise.resolve({ orgId: "org123" });
      MOCK_USER_SESSION.getPortal = () =>
        Promise.resolve({
          helperServices: {
            workflowManager: { url: "https://workflow.arcgis.com" },
          },
        });
      spyOn(restHelpersGet, "getItemDataAsJson").and.resolveTo(null);
      spyOn(arcGISRestJS, "request").and.resolveTo(utils.getSuccessResponse());
      const removeGroupSpy = spyOn(restHelpers, "removeGroup").and.resolveTo(
        utils.getSuccessResponse({ id: "grp1234567890" }),
      );

      const result: boolean = await workflowHelpers.deleteWorkflowItem(
        "itm1234567890",
        "https://workflow.arcgis.com/myOrgId",
        MOCK_USER_SESSION,
      );

      expect(result).toBeTrue();
      expect(removeGroupSpy).not.toHaveBeenCalled();
    });
  });

  describe("extractWorkflowFromZipFile", () => {
    it("basic test", async () => {
      const sampleWorkflowConfig = await generateWorkflowZipFileWithId();
      const zipFiles = await workflowHelpers.extractWorkflowFromZipFile(sampleWorkflowConfig);
      expect(zipFiles).toEqual({
        "jobExtPropertyTableDefinitions.json":
          '[{"table_id":"xMkNNrbMTga4mrWnoREGWA","table_name":"tree_request","table_alias":"Tree Request","table_order":-1,"relationship_type":1,"item_id":"7a69f67e4c6744918fbea49b8241640e","item_type":"SurveyForm","layer_id":"0","portal_type":"Current","feature_service_unique_id":"globalid","secure":1,"searchable":0}]',
        "jobExtPropertyDefinitions.json":
          '[{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"reqid","property_alias":"Request ID","property_order":0,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"reqcategory","property_alias":"Request Category","property_order":1,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"reqtype","property_alias":"Request Type","property_order":2,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"details","property_alias":"Details","property_order":3,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"pocfirstname","property_alias":"First Name","property_order":4,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"poclastname","property_alias":"Last Name","property_order":5,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"pocphone","property_alias":"Phone Number","property_order":6,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"pocemail","property_alias":"Email","property_order":7,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"locdesc","property_alias":"Location","property_order":8,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"publicview","property_alias":"Visible to Public","property_order":9,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"source","property_alias":"Source","property_order":10,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"assetglobalid","property_alias":"Asset GlobalID","property_order":11,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"assignmentglobalid","property_alias":"Assignment GlobalID","property_order":12,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"status","property_alias":"Status","property_order":13,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"notes","property_alias":"Notes","property_order":14,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"assignedto","property_alias":"Assigned To","property_order":15,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"resolutiondt","property_alias":"Resolved On","property_order":16,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"resolution","property_alias":"Resolution","property_order":17,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"globalid","property_alias":"GlobalID","property_order":18,"data_type":-1,"required":0,"editable":1,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"created_date","property_alias":"Submitted On","property_order":19,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"created_user","property_alias":"Submitted By","property_order":20,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"last_edited_date","property_alias":"Last Edited On","property_order":21,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"last_edited_user","property_alias":"Last Edited By","property_order":22,"data_type":-1,"required":0,"editable":0,"visible":1}]',
      });
    });
  });

  describe("getWorkflowManagerAuthorized", () => {
    it("handles AGO authorized", async () => {
      spyOn(arcGISRestJS, "request").and.resolveTo({ hasAdvancedLicense: true });

      const isAuthorized = await workflowHelpers.getWorkflowManagerAuthorized(
        "https://workflow.arcgis.com/myOrgId",
        MOCK_USER_SESSION,
      );
      expect(isAuthorized).toBeTrue();
    });

    it("handles AGO unauthorized", async () => {
      spyOn(arcGISRestJS, "request").and.resolveTo({ hasAdvancedLicense: false });

      const isAuthorized = await workflowHelpers.getWorkflowManagerAuthorized(
        "https://workflow.arcgis.com/myOrgId",
        MOCK_USER_SESSION,
      );
      expect(isAuthorized).toBeFalse();
    });

    it("handles Enterprise authorized", async () => {
      const enterpriseWebAdaptorUrl = "https://myserver.mycompany.com/webadaptor/workflow";
      spyOn(arcGISRestJS, "request").and.resolveTo({ hasAdvancedLicense: true });

      const isAuthorized = await workflowHelpers.getWorkflowManagerAuthorized(
        enterpriseWebAdaptorUrl,
        MOCK_USER_SESSION,
      );
      expect(isAuthorized).toBeTrue();
    });

    it("handles Enterprise unauthorized", async () => {
      const enterpriseWebAdaptorUrl = "https://myserver.mycompany.com/webadaptor/workflow";
      spyOn(arcGISRestJS, "request").and.resolveTo({ hasAdvancedLicense: false });

      const isAuthorized = await workflowHelpers.getWorkflowManagerAuthorized(
        enterpriseWebAdaptorUrl,
        MOCK_USER_SESSION,
      );
      expect(isAuthorized).toBeFalse();
    });

    it("handles AGO unauthorized via throw", async () => {
      spyOn(arcGISRestJS, "request").and.throwError("Unauthorized");

      const isAuthorized = await workflowHelpers.getWorkflowManagerAuthorized(
        "https://workflow.arcgis.com/myOrgId",
        MOCK_USER_SESSION,
      );
      expect(isAuthorized).toBeFalse();
    });

    it("handles failure from `request`", async () => {
      spyOn(arcGISRestJS, "request").and.resolveTo(null);

      const isAuthorized = await workflowHelpers.getWorkflowManagerAuthorized(
        "https://workflow.arcgis.com/myOrgId",
        MOCK_USER_SESSION,
      );
      expect(isAuthorized).toBeFalse();
    });

    it("handles undefined args", async () => {
      spyOn(arcGISRestJS, "request").and.resolveTo(null);

      const isAuthorized = await workflowHelpers.getWorkflowManagerAuthorized("", new arcGISRestJS.UserSession({}));
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
            url: "https://workflow.arcgis.com",
          },
        },
      };

      const actual = await workflowHelpers.getWorkflowBaseURL(MOCK_USER_SESSION, portalResponse as any, orgId);

      expect(actual).toEqual(`https://workflow.arcgis.com/${orgId}`);
    });

    it("handles AGO with supplied portal info but workflow not supported 1", async () => {
      const orgId = "abcdef";
      const portalResponse = {
        portalHostname: "myOrg.maps.arcgis.com",
        isPortal: false,
        helperServices: {},
      };

      const actual = await workflowHelpers.getWorkflowBaseURL(MOCK_USER_SESSION, portalResponse as any, orgId);

      expect(actual).toEqual(`https://${portalResponse.portalHostname}/${orgId}`);
    });

    it("handles AGO with supplied portal info but workflow not supported 2", async () => {
      const orgId = "abcdef";
      const portalResponse = {
        portalHostname: "myOrg.maps.arcgis.com",
        isPortal: false,
      };

      const actual = await workflowHelpers.getWorkflowBaseURL(MOCK_USER_SESSION, portalResponse as any, orgId);

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
            url: "https://workflow.arcgis.com",
          },
        },
      } as any);

      const actual = await workflowHelpers.getWorkflowBaseURL(MOCK_USER_SESSION, portalResponse, orgId);

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
            url: "https://workflow.arcgis.com",
          },
        },
      } as any);

      const actual = await workflowHelpers.getWorkflowBaseURL(MOCK_USER_SESSION, portalResponse);

      expect(actual).toEqual(`https://workflow.arcgis.com/${orgId}`);
    });

    it("handles Enterprise with supplied portal info", async () => {
      const portalResponse = {
        portalHostname: "myOrg.maps.arcgis.com",
        isPortal: true,
        helperServices: {
          workflowManager: {
            url: "https://workflow.arcgis.com",
          },
        },
      };

      spyOn(restHelpersGet, "getEnterpriseServers").and.resolveTo([
        {
          id: "ghi",
          name: "serverGHI.esri.com:6443",
          adminUrl: "https://serverGHI.esri.com:6443/arcgis",
          url: "https://serverGHI.ags.esri.com/server",
          isHosted: true,
          serverType: "ArcGIS",
          serverRole: "HOSTING_SERVER",
          serverFunction: "WorkflowManager",
        },
      ]);

      const actual = await workflowHelpers.getWorkflowBaseURL(MOCK_USER_SESSION, portalResponse as any);

      expect(actual).toEqual(`https://serverGHI.ags.esri.com/server/workflow`);
    });
  });

  describe("getWorkflowEnterpriseServerRootURL", () => {
    it("fetches the Workflow Manager URL on Enterprise", async () => {
      const portalRestUrl = utils.PORTAL_SUBSET.restUrl;
      const servers = [
        {
          id: "abc",
          name: "serverABC.esri.com:11443",
          adminUrl: "https://serverABC.esri.com:11443/arcgis",
          url: "https://serverABC.ags.esri.com/gis",
          isHosted: false,
          serverType: "ARCGIS_NOTEBOOK_SERVER",
          serverRole: "FEDERATED_SERVER",
          serverFunction: "NotebookServer",
        },
        {
          id: "def",
          name: "serverDEF.ags.esri.com",
          adminUrl: "https://serverDEF.ags.esri.com/video",
          url: "https://serverDEF.ags.esri.com/video",
          isHosted: false,
          serverType: "ARCGIS_VIDEO_SERVER",
          serverRole: "FEDERATED_SERVER",
          serverFunction: "VideoServer",
        },
        {
          id: "ghi",
          name: "serverGHI.esri.com:6443",
          adminUrl: "https://serverGHI.esri.com:6443/arcgis",
          url: "https://serverGHI.ags.esri.com/server",
          isHosted: true,
          serverType: "ArcGIS",
          serverRole: "HOSTING_SERVER",
          serverFunction: "WorkflowManager",
        },
      ];

      spyOn(restHelpersGet, "getEnterpriseServers").and.resolveTo(servers);

      const actual = await workflowHelpers.getWorkflowEnterpriseServerRootURL(portalRestUrl, MOCK_USER_SESSION);

      expect(actual).toEqual("https://serverGHI.ags.esri.com/server");
    });

    it("handles case where the Workflow Manager is not enabled on Enterprise", async () => {
      const portalRestUrl = utils.PORTAL_SUBSET.restUrl;
      const servers = [
        {
          id: "abc",
          name: "serverABC.esri.com:11443",
          adminUrl: "https://serverABC.esri.com:11443/arcgis",
          url: "https://serverABC.ags.esri.com/gis",
          isHosted: false,
          serverType: "ARCGIS_NOTEBOOK_SERVER",
          serverRole: "FEDERATED_SERVER",
          serverFunction: "NotebookServer",
        },
        {
          id: "def",
          name: "serverDEF.ags.esri.com",
          adminUrl: "https://serverDEF.ags.esri.com/video",
          url: "https://serverDEF.ags.esri.com/video",
          isHosted: false,
          serverType: "ARCGIS_VIDEO_SERVER",
          serverRole: "FEDERATED_SERVER",
          serverFunction: "VideoServer",
        },
      ];

      spyOn(restHelpersGet, "getEnterpriseServers").and.resolveTo(servers);

      const actual = await workflowHelpers.getWorkflowEnterpriseServerRootURL(portalRestUrl, MOCK_USER_SESSION);

      expect(actual).toEqual("");
    });
  });

  describe("preprocessWorkflowTemplates", () => {
    it("will remove feature service templates that will be auto-generated by Workflow", () => {
      const templates = [
        {
          data: {
            viewSchema: {
              itemId: "{{aa396097307d4a42984b4a9d758cb3bc.itemId}}",
            },
            workflowLocations: {
              itemId: "{{bb6d6c06e27646568513758e85f24465.itemId}}",
            },
            workflowSchema: {
              itemId: "{{cc34534832e64bdeb5743a150aa917c2.itemId}}",
            },
          },
          dependencies: [
            "aa396097307d4a42984b4a9d758cb3bc",
            "bb6d6c06e27646568513758e85f24465",
            "cc34534832e64bdeb5743a150aa917c2",
          ],
          groups: [],
          itemId: "dd9b83cfa75c4828b9e3ba48dc242c31",
          type: "Workflow",
        },
        {
          itemId: "aa396097307d4a42984b4a9d758cb3bc",
          type: "Feature Service",
        },
        {
          itemId: "bb6d6c06e27646568513758e85f24465",
          type: "Feature Service",
        },
        {
          itemId: "cc34534832e64bdeb5743a150aa917c2",
          type: "Feature Service",
        },
        {
          itemId: "ee34534832e64bdeb5743a150aa917c2",
          type: "Feature Service",
        },
      ] as any;
      const templateDictionary = {};
      const actual = workflowHelpers.preprocessWorkflowTemplates(templates, templateDictionary);

      const expectedResult = {
        deployTemplates: [
          {
            data: {
              viewSchema: {
                itemId: "{{aa396097307d4a42984b4a9d758cb3bc.itemId}}",
              },
              workflowLocations: {
                itemId: "{{bb6d6c06e27646568513758e85f24465.itemId}}",
              },
              workflowSchema: {
                itemId: "{{cc34534832e64bdeb5743a150aa917c2.itemId}}",
              },
            },
            dependencies: [
              "aa396097307d4a42984b4a9d758cb3bc",
              "bb6d6c06e27646568513758e85f24465",
              "cc34534832e64bdeb5743a150aa917c2",
            ],
            groups: [],
            itemId: "dd9b83cfa75c4828b9e3ba48dc242c31",
            type: "Workflow",
          },
          {
            itemId: "ee34534832e64bdeb5743a150aa917c2",
            type: "Feature Service",
          },
        ],
        workflowManagedTemplates: [
          {
            itemId: "aa396097307d4a42984b4a9d758cb3bc",
            type: "Feature Service",
          },
          {
            itemId: "bb6d6c06e27646568513758e85f24465",
            type: "Feature Service",
          },
          {
            itemId: "cc34534832e64bdeb5743a150aa917c2",
            type: "Feature Service",
          },
        ],
      };

      const expectedTemplateDict = {
        workflows: {
          dd9b83cfa75c4828b9e3ba48dc242c31: {
            viewSchema: "aa396097307d4a42984b4a9d758cb3bc",
            workflowLocations: "bb6d6c06e27646568513758e85f24465",
            workflowSchema: "cc34534832e64bdeb5743a150aa917c2",
          },
        },
        aa396097307d4a42984b4a9d758cb3bc: {},
        bb6d6c06e27646568513758e85f24465: {},
        cc34534832e64bdeb5743a150aa917c2: {},
      };

      expect(actual).toEqual(expectedResult as any);
      expect(templateDictionary).toEqual(expectedTemplateDict);
    });
  });

  describe("updateWorkflowTemplateIds", () => {
    it("replace various IDs in the templates based on items that were created by Workflow", () => {
      const templateDictionary = {
        "workflows": {
          "5a007c90da4f4574987b03bb00e06bc9": {
            viewSchema: "37848a457d5d4f0495f89476b6b3dcff",
            workflowLocations: "14857382b2de441e95e81a6cd1740558",
            workflowSchema: "494a067c851a47449f162a1a716748a3",
          },
        },
        "37848a457d5d4f0495f89476b6b3dcff": {
          itemId: "f6fab03ad56548798f4b329852eb612d",
          url: "https://org/arcgis/rest/services/workflow_views_5a007c90da4f4574987b03bb00e06bc9/FeatureServer",
          name: "workflow_views_5a007c90da4f4574987b03bb00e06bc9",
          layer0: {
            fields: {
              jobs_objectid: {
                alias: "jobs_objectid",
                name: "jobs_objectid",
                type: "esriFieldTypeInteger",
              },
              job_id: {
                alias: "jobId",
                name: "job_id",
                type: "esriFieldTypeString",
              },
              job_name: {
                alias: "jobName",
                name: "job_name",
                type: "esriFieldTypeString",
              },
              objectid: {
                alias: "ObjectId",
                name: "ObjectId",
                type: "esriFieldTypeOID",
              },
            },
            itemId: "f6fab03ad56548798f4b329852eb612d",
            layerId: 0,
            url: "https://org/arcgis/rest/services/workflow_views_5a007c90da4f4574987b03bb00e06bc9/FeatureServer/0",
          },
        },
        "14857382b2de441e95e81a6cd1740558": {
          itemId: "7d0335ccc8fa47e58e04e0695785961a",
          url: "https://org/arcgis/rest/services/WorkflowLocations_5a007c90da4f4574987b03bb00e06bc9/FeatureServer",
          name: "WorkflowLocations_5a007c90da4f4574987b03bb00e06bc9",
          layer0: {
            fields: {
              created_user__not_used: {
                alias: "created_user",
                name: "created_user__not_used",
                type: "esriFieldTypeString",
              },
              job_id: {
                alias: "jobId",
                name: "job_id",
                type: "esriFieldTypeString",
              },
              objectid: {
                alias: "ObjectId",
                name: "ObjectId",
                type: "esriFieldTypeOID",
              },
            },
            itemId: "7d0335ccc8fa47e58e04e0695785961a",
            layerId: 0,
            url: "https://org/arcgis/rest/services/WorkflowLocations_5a007c90da4f4574987b03bb00e06bc9/FeatureServer/0",
          },
        },
        "494a067c851a47449f162a1a716748a3": {
          itemId: "bbd0b91e181a4889957d225dfba063b0",
          url: "https://org/arcgis/rest/services/workflow_5a007c90da4f4574987b03bb00e06bc9/FeatureServer",
          name: null,
          layer0: {
            fields: {
              objectid: {
                alias: "OBJECTID",
                name: "OBJECTID",
                type: "esriFieldTypeOID",
              },
              job_id: {
                alias: "job_id",
                name: "job_id",
                type: "esriFieldTypeString",
              },
            },
            itemId: "bbd0b91e181a4889957d225dfba063b0",
            layerId: 0,
            url: "https://org/arcgis/rest/services/workflow_5a007c90da4f4574987b03bb00e06bc9/FeatureServer/0",
          },
        },
        "title": "Workflow Services",
        "e82908aca67c410ea05eb949510b3450": {
          itemId: "e82908aca67c410ea05eb949510b3450",
        },
        "6e637a5807cb4e8886ae3066fddaedee": {
          def: {},
          itemId: "b8a8612eb445464bb69d2e7581fac195",
          url: "https://org/arcgis/rest/services/Layer1_e22767d30acf4f6eb1223f0ae6a9a9a2/FeatureServer/",
          name: "Layer1_e22767d30acf4f6eb1223f0ae6a9a9a2",
          layer0: {
            fields: {
              objectid: {
                name: "OBJECTID",
                alias: "OBJECTID",
                type: "esriFieldTypeOID",
              },
            },
            url: "https://org/arcgis/rest/services/Layer1_e22767d30acf4f6eb1223f0ae6a9a9a2/FeatureServer/0",
            layerId: "0",
            itemId: "b8a8612eb445464bb69d2e7581fac195",
          },
        },
        "5a007c90da4f4574987b03bb00e06bc9": {
          itemId: "a63f0de6c6204d8a882bc2af258de850",
        },
        "5a7e9bcb201f45db995939d5039d2aae": {
          itemId: "45444764bdb1434a9bbebcf36a7fa3b6",
          itemUrl: "https://org/sharing/rest/content/items/45444764bdb1434a9bbebcf36a7fa3b6",
        },
        "bb0337a672ac4352b465db4628af4b8c": {
          itemId: "3e3117fb944f421598839a34da21aa00",
          itemUrl: "https://org/sharing/rest/content/items/3e3117fb944f421598839a34da21aa00",
        },
        "b8a8612eb445464bb69d2e7581fac195": {
          itemId: "b8a8612eb445464bb69d2e7581fac195",
          url: "https://org/arcgis/rest/services/Layer1_e22767d30acf4f6eb1223f0ae6a9a9a2/FeatureServer/",
          name: "Layer1_e22767d30acf4f6eb1223f0ae6a9a9a2",
        },
      } as any;
      const templates = [
        {
          itemId: "b8a8612eb445464bb69d2e7581fac195",
          type: "Feature Service",
          dependencies: [],
          groups: [],
        },
        {
          itemId: "a63f0de6c6204d8a882bc2af258de850",
          type: "Workflow",
          dependencies: [
            "7d0335ccc8fa47e58e04e0695785961a",
            "f6fab03ad56548798f4b329852eb612d",
            "bbd0b91e181a4889957d225dfba063b0",
          ],
          groups: [],
        },
        {
          itemId: "45444764bdb1434a9bbebcf36a7fa3b6",
          type: "Web Map",
          dependencies: [
            "7d0335ccc8fa47e58e04e0695785961a",
            "f6fab03ad56548798f4b329852eb612d",
            "bbd0b91e181a4889957d225dfba063b0",
            "b8a8612eb445464bb69d2e7581fac195",
          ],
          groups: [],
        },
        {
          itemId: "3e3117fb944f421598839a34da21aa00",
          type: "Dashboard",
          dependencies: [
            "bbd0b91e181a4889957d225dfba063b0",
            "45444764bdb1434a9bbebcf36a7fa3b6",
            "b8a8612eb445464bb69d2e7581fac195",
          ],
          groups: [],
        },
        {
          itemId: "494a067c851a47449f162a1a716748a3",
          type: "Feature Service",
          dependencies: [],
          groups: [],
        },
        {
          itemId: "37848a457d5d4f0495f89476b6b3dcff",
          type: "Feature Service",
          dependencies: ["494a067c851a47449f162a1a716748a3"],
          groups: [],
        },
        {
          itemId: "14857382b2de441e95e81a6cd1740558",
          type: "Feature Service",
          dependencies: ["494a067c851a47449f162a1a716748a3"],
          groups: [],
        },
      ] as any;

      const actual = workflowHelpers.updateWorkflowTemplateIds(templates, templateDictionary);

      const expected = [
        {
          itemId: "b8a8612eb445464bb69d2e7581fac195",
          type: "Feature Service",
          dependencies: [],
          groups: [],
        },
        {
          itemId: "a63f0de6c6204d8a882bc2af258de850",
          type: "Workflow",
          dependencies: [
            "7d0335ccc8fa47e58e04e0695785961a",
            "f6fab03ad56548798f4b329852eb612d",
            "bbd0b91e181a4889957d225dfba063b0",
          ],
          groups: [],
        },
        {
          itemId: "45444764bdb1434a9bbebcf36a7fa3b6",
          type: "Web Map",
          dependencies: [
            "7d0335ccc8fa47e58e04e0695785961a",
            "f6fab03ad56548798f4b329852eb612d",
            "bbd0b91e181a4889957d225dfba063b0",
            "b8a8612eb445464bb69d2e7581fac195",
          ],
          groups: [],
        },
        {
          itemId: "3e3117fb944f421598839a34da21aa00",
          type: "Dashboard",
          dependencies: [
            "bbd0b91e181a4889957d225dfba063b0",
            "45444764bdb1434a9bbebcf36a7fa3b6",
            "b8a8612eb445464bb69d2e7581fac195",
          ],
          groups: [],
        },
        {
          itemId: "bbd0b91e181a4889957d225dfba063b0",
          type: "Feature Service",
          dependencies: [],
          groups: [],
        },
        {
          itemId: "f6fab03ad56548798f4b329852eb612d",
          type: "Feature Service",
          dependencies: ["bbd0b91e181a4889957d225dfba063b0"],
          groups: [],
        },
        {
          itemId: "7d0335ccc8fa47e58e04e0695785961a",
          type: "Feature Service",
          dependencies: ["bbd0b91e181a4889957d225dfba063b0"],
          groups: [],
        },
      ] as any;
      expect(actual).toEqual(expected);
    });
  });

  describe("getWorkflowDependencies", () => {
    it("will fetch workflow dependencies", () => {
      const template = {
        data: {
          viewSchema: {
            itemId: "ABC123",
          },
          workflowLocations: {
            itemId: "DEF456",
          },
          workflowSchema: {
            itemId: "GHI789",
          },
        },
        dependencies: [],
      } as any;
      workflowHelpers.getWorkflowDependencies(template);
      expect(template.dependencies.length).toEqual(3);
    });
  });
});

// ------------------------------------------------------------------------------------------------------------------ //

export function generateWorkflowZipFileWithId(): Promise<File> {
  const zip = new JSZip();
  zip.file(
    "jobExtPropertyTableDefinitions.json",
    '[{"table_id":"xMkNNrbMTga4mrWnoREGWA","table_name":"tree_request","table_alias":"Tree Request","table_order":-1,"relationship_type":1,"item_id":"7a69f67e4c6744918fbea49b8241640e","item_type":"SurveyForm","layer_id":"0","portal_type":"Current","feature_service_unique_id":"globalid","secure":1,"searchable":0}]',
  );
  zip.file(
    "jobExtPropertyDefinitions.json",
    '[{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"reqid","property_alias":"Request ID","property_order":0,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"reqcategory","property_alias":"Request Category","property_order":1,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"reqtype","property_alias":"Request Type","property_order":2,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"details","property_alias":"Details","property_order":3,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"pocfirstname","property_alias":"First Name","property_order":4,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"poclastname","property_alias":"Last Name","property_order":5,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"pocphone","property_alias":"Phone Number","property_order":6,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"pocemail","property_alias":"Email","property_order":7,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"locdesc","property_alias":"Location","property_order":8,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"publicview","property_alias":"Visible to Public","property_order":9,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"source","property_alias":"Source","property_order":10,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"assetglobalid","property_alias":"Asset GlobalID","property_order":11,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"assignmentglobalid","property_alias":"Assignment GlobalID","property_order":12,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"status","property_alias":"Status","property_order":13,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"notes","property_alias":"Notes","property_order":14,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"assignedto","property_alias":"Assigned To","property_order":15,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"resolutiondt","property_alias":"Resolved On","property_order":16,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"resolution","property_alias":"Resolution","property_order":17,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"globalid","property_alias":"GlobalID","property_order":18,"data_type":-1,"required":0,"editable":1,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"created_date","property_alias":"Submitted On","property_order":19,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"created_user","property_alias":"Submitted By","property_order":20,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"last_edited_date","property_alias":"Last Edited On","property_order":21,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"last_edited_user","property_alias":"Last Edited By","property_order":22,"data_type":-1,"required":0,"editable":0,"visible":1}]',
  );

  return zip.generateAsync({ type: "blob" }).then((blob) => {
    return Promise.resolve(new File([blob], "workflow_configuration.zip"));
  });
}

export function generateWorkflowZipFileWithoutId(): Promise<File> {
  const zip = new JSZip();
  zip.file(
    "jobExtPropertyDefinitions.json",
    '[{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"reqid","property_alias":"Request ID","property_order":0,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"reqcategory","property_alias":"Request Category","property_order":1,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"reqtype","property_alias":"Request Type","property_order":2,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"details","property_alias":"Details","property_order":3,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"pocfirstname","property_alias":"First Name","property_order":4,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"poclastname","property_alias":"Last Name","property_order":5,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"pocphone","property_alias":"Phone Number","property_order":6,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"pocemail","property_alias":"Email","property_order":7,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"locdesc","property_alias":"Location","property_order":8,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"publicview","property_alias":"Visible to Public","property_order":9,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"source","property_alias":"Source","property_order":10,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"assetglobalid","property_alias":"Asset GlobalID","property_order":11,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"assignmentglobalid","property_alias":"Assignment GlobalID","property_order":12,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"status","property_alias":"Status","property_order":13,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"notes","property_alias":"Notes","property_order":14,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"assignedto","property_alias":"Assigned To","property_order":15,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"resolutiondt","property_alias":"Resolved On","property_order":16,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"resolution","property_alias":"Resolution","property_order":17,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"globalid","property_alias":"GlobalID","property_order":18,"data_type":-1,"required":0,"editable":1,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"created_date","property_alias":"Submitted On","property_order":19,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"created_user","property_alias":"Submitted By","property_order":20,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"last_edited_date","property_alias":"Last Edited On","property_order":21,"data_type":-1,"required":0,"editable":0,"visible":1},{"table_id":"xMkNNrbMTga4mrWnoREGWA","property_name":"last_edited_user","property_alias":"Last Edited By","property_order":22,"data_type":-1,"required":0,"editable":0,"visible":1}]',
  );
  zip.file(
    "jobTemplatesToExtPropertyTableDefXref.json",
    '[{"table_id":"xMkNNrbMTga4mrWnoREGWA","table_order":0,"job_template_id":"Gk9IjgBWQdGCFlRMf6fplw"}]',
  );

  return zip.generateAsync({ type: "blob" }).then((blob) => {
    return Promise.resolve(new File([blob], "workflow_configuration.zip"));
  });
}
