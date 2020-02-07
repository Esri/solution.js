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
 * Provides tests for functions involving deployment of items via the REST API.
 */

import * as common from "@esri/solution-common";
import * as deploySolution from "../src/deploySolutionItems";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as notebook from "../../simple-types/src/notebook";
import * as templates from "../../common/test/mocks/templates";
import * as utils from "../../common/test/mocks/utils";

// ------------------------------------------------------------------------------------------------------------------ //

const now = new Date();
const MOCK_USER_SESSION = utils.createRuntimeMockUserSession(now.getDate());

describe("Module `deploySolutionItems`", () => {
  describe("deploySolutionItems", () => {
    it("can handle unimplemented item type gracefully", done => {
      deploySolution
        .deploySolutionItems(
          "",
          "",
          [templates.getItemTemplateSkeleton()],
          MOCK_USER_SESSION,
          {},
          MOCK_USER_SESSION,
          utils.PROGRESS_CALLBACK
        )
        .then(
          () => {
            done();
          },
          () => {
            done.fail();
          }
        );
    });
  });

  describe("_createItemFromTemplateWhenReady", () => {
    it("flags unimplemented item types", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Unsupported"
      );
      itemTemplate.item.thumbnail = null;
      const resourceFilePaths: common.IDeployFileCopyPath[] = [];
      const templateDictionary: any = {};

      deploySolution
        ._createItemFromTemplateWhenReady(
          itemTemplate,
          resourceFilePaths,
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.PROGRESS_CALLBACK
        )
        .then((response: common.ICreateItemFromTemplateResponse) => {
          expect(response).toEqual({
            id: "",
            type: itemTemplate.type,
            data: undefined
          });
          done();
        }, done.fail);
    });

    it("handles Web Mapping Applications that are not Storymaps", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Web Mapping Application",
        null,
        "https://apl.maps.arcgis.com/apps/Viewer/index.html?appid=map1234567890"
      );
      itemTemplate.item.thumbnail = null;
      const resourceFilePaths: common.IDeployFileCopyPath[] = [];
      const templateDictionary: any = {};
      const newItemID: string = "wma1234567891";

      fetchMock
        .post(
          "https://www.arcgis.com/sharing/rest/content/users/casey/addItem",
          { success: true, id: newItemID }
        )
        .post(
          "https://www.arcgis.com/sharing/rest/content/users/casey/items/wma1234567891/update",
          { success: true, id: newItemID }
        );

      deploySolution
        ._createItemFromTemplateWhenReady(
          itemTemplate,
          resourceFilePaths,
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.PROGRESS_CALLBACK
        )
        .then((response: common.ICreateItemFromTemplateResponse) => {
          expect(response).toEqual({
            id: newItemID,
            type: itemTemplate.type,
            data: itemTemplate.data
          });
          done();
        }, done.fail);
    });
    if (typeof window !== "undefined") {
      it("flags Storymaps implemented as Web Mapping Applications", done => {
        const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
          "Web Mapping Application",
          [],
          "https://apl.maps.arcgis.com/apps/MapJournal/index.html?appid=sto1234567890"
        );
        itemTemplate.item.thumbnail = null;
        const resourceFilePaths: common.IDeployFileCopyPath[] = [];
        const templateDictionary: any = {};
        const newItemID: string = "sto1234567891";

        fetchMock
          .post(
            "https://www.arcgis.com/sharing/rest/content/users/casey/addItem",
            { success: true, id: newItemID }
          )
          .post(
            "https://www.arcgis.com/sharing/rest/content/users/casey/items/sto1234567891/update",
            { success: true, id: newItemID }
          );

        deploySolution
          ._createItemFromTemplateWhenReady(
            itemTemplate,
            resourceFilePaths,
            MOCK_USER_SESSION,
            templateDictionary,
            MOCK_USER_SESSION,
            utils.PROGRESS_CALLBACK
          )
          .then((response: common.ICreateItemFromTemplateResponse) => {
            expect(response).toEqual({
              id: newItemID,
              type: itemTemplate.type,
              data: itemTemplate.data
            });
            done();
          }, done.fail);
      });
    }
  });

  describe("postProcessDependencies", () => {
    if (typeof window !== "undefined") {
      it("should update unresolved variables in an items data", done => {
        const _templates: any[] = [
          {
            type: "Group",
            itemId: "NEWABC123",
            dependencies: []
          },
          {
            type: "Workforce Project",
            itemId: "NEW123ABC",
            dependencies: []
          }
        ];

        const templateDictionary: any = {
          unresolved: {
            itemId: "resolved"
          }
        };

        const workforceData: any = {
          unresolvedVariable: "{{unresolved.itemId}}"
        };

        const clonedSolutionsResponse: common.ICreateItemFromTemplateResponse[] = [
          {
            id: "NEWABC123",
            type: "Group",
            data: undefined
          },
          {
            id: "NEW123ABC",
            type: "Workforce Project",
            data: workforceData
          }
        ];

        const updateUrl: string =
          "https://www.arcgis.com/sharing/rest/content/users/casey/items/NEW123ABC/update";
        const expectedBody: string =
          "f=json&text=%7B%22unresolvedVariable%22%3A%22resolved%22%7D&id=NEW123ABC";

        fetchMock
          .post(
            "https://www.arcgis.com/sharing/rest/content/items/NEW123ABC/data",
            workforceData
          )
          .post(
            "https://www.arcgis.com/sharing/rest/content/users/casey/items/NEW123ABC/update",
            utils.getSuccessResponse()
          );

        deploySolution
          .postProcessDependencies(
            _templates,
            clonedSolutionsResponse,
            MOCK_USER_SESSION,
            templateDictionary
          )
          .then(() => {
            const options: fetchMock.MockOptions = fetchMock.lastOptions(
              updateUrl
            );
            const fetchBody = (options as fetchMock.MockResponseObject).body;
            expect(fetchBody).toEqual(expectedBody);
            done();
          }, done.fail);
      });

      it("should update unresolved variables in Notebook item data", done => {
        const _templates: any[] = [
          {
            type: "Notebook",
            itemId: "NEW123ABC"
          }
        ];

        const templateDictionary: any = {
          unresolved: {
            itemId: "resolved"
          }
        };

        const notebookData: any = {
          unresolvedVariable: "{{unresolved.itemId}}"
        };

        const expected: any = { unresolvedVariable: "resolved" };

        const clonedSolutionsResponse: common.ICreateItemFromTemplateResponse[] = [
          {
            id: "NEW123ABC",
            type: "Notebook",
            data: notebookData
          }
        ];

        fetchMock
          .post(
            "https://www.arcgis.com/sharing/rest/content/items/NEW123ABC/data",
            notebookData
          )
          .post(
            "https://www.arcgis.com/sharing/rest/content/users/casey/items/NEW123ABC/update",
            utils.getSuccessResponse()
          );

        spyOn(notebook, "postProcessItemDependencies").and.callThrough();

        deploySolution
          .postProcessDependencies(
            _templates,
            clonedSolutionsResponse,
            MOCK_USER_SESSION,
            templateDictionary
          )
          .then(() => {
            expect(notebook.postProcessItemDependencies).toHaveBeenCalledWith(
              clonedSolutionsResponse[0].id,
              expected,
              MOCK_USER_SESSION
            );
            done();
          }, done.fail);
      });

      it("should share items with groups", done => {
        const _templates: any[] = [
          {
            type: "Group",
            itemId: "NEWABC123",
            dependencies: []
          },
          {
            type: "Workforce Project",
            itemId: "NEW123ABC",
            dependencies: [],
            groups: ["ABC123"]
          }
        ];

        const templateDictionary: any = {
          ABC123: {
            itemId: "NEWABC123"
          },
          "123ABC": {
            itemId: "NEW123ABC"
          },
          unresolved: {
            itemId: "resolved"
          }
        };

        const clonedSolutionsResponse: common.ICreateItemFromTemplateResponse[] = [
          {
            id: "NEWABC123",
            type: "Group",
            data: undefined
          },
          {
            id: "NEW123ABC",
            type: "Workforce Project",
            data: undefined
          }
        ];

        const groupResponse: any = {
          id: "ABC123",
          title:
            "Dam Inspection Assignments_9402a6f176f54415ad4b8cb07598f42d_20190627_2025_59807",
          isInvitationOnly: true,
          owner: "casey",
          description:
            "<span style='color: rgb(77, 77, 77); font-family: &quot;Lucida Grande&quot;, &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 14px;'>A group used to configure the Dam Inspection Assignments application.</span>",
          snippet: null,
          tags: ["workforce"],
          phone: null,
          sortField: "title",
          sortOrder: "asc",
          isViewOnly: true,
          thumbnail: null,
          created: 1561667160000,
          modified: 1561667160000,
          access: "public",
          capabilities: [],
          isFav: false,
          isReadOnly: false,
          protected: false,
          autoJoin: false,
          notificationsEnabled: false,
          provider: null,
          providerGroupName: null,
          leavingDisallowed: false,
          hiddenMembers: false,
          displaySettings: {
            itemTypes: ""
          },
          userMembership: {
            username: "casey",
            memberType: "owner",
            applications: 0
          },
          collaborationInfo: {}
        };

        fetchMock
          .get(
            "https://www.arcgis.com/sharing/rest/community/users/casey?f=json",
            {}
          )
          .get(
            "https://www.arcgis.com/sharing/rest/community/groups/NEWABC123?f=json",
            groupResponse
          )
          .post(
            "https://www.arcgis.com/sharing/rest/generateToken",
            MOCK_USER_SESSION.token
          )
          .post("https://www.arcgis.com/sharing/rest/search", {
            results: []
          })
          .post(
            "https://www.arcgis.com/sharing/rest/content/users/casey/items/NEW123ABC/share",
            { notSharedWith: [], itemId: "NEW123ABC" }
          );

        deploySolution
          .postProcessDependencies(
            _templates,
            clonedSolutionsResponse,
            MOCK_USER_SESSION,
            templateDictionary
          )
          .then(() => {
            done();
          }, done.fail);
      });

      it("should handle error on update", done => {
        const _templates: any[] = [
          {
            type: "Group",
            itemId: "NEWABC123",
            dependencies: []
          },
          {
            type: "Workforce Project",
            itemId: "NEW123ABC",
            dependencies: []
          }
        ];

        const templateDictionary: any = {
          unresolved: {
            itemId: "resolved"
          }
        };

        const workforceData: any = {
          unresolvedVariable: "{{unresolved.itemId}}"
        };

        const clonedSolutionsResponse: common.ICreateItemFromTemplateResponse[] = [
          {
            id: "NEWABC123",
            type: "Group",
            data: undefined
          },
          {
            id: "NEW123ABC",
            type: "Workforce Project",
            data: workforceData
          }
        ];

        fetchMock
          .post(
            "https://www.arcgis.com/sharing/rest/content/items/NEW123ABC/data",
            workforceData
          )
          .post(
            "https://www.arcgis.com/sharing/rest/content/users/casey/items/NEW123ABC/update",
            mockItems.get400Failure()
          );

        deploySolution
          .postProcessDependencies(
            _templates,
            clonedSolutionsResponse,
            MOCK_USER_SESSION,
            templateDictionary
          )
          .then(() => done.fail(), done);
      });

      it("should handle error on get data", done => {
        const _templates: any[] = [
          {
            type: "Group",
            itemId: "NEWABC123",
            dependencies: []
          },
          {
            type: "Workforce Project",
            itemId: "NEW123ABC",
            dependencies: []
          }
        ];

        const templateDictionary: any = {
          unresolved: {
            itemId: "resolved"
          }
        };

        const workforceData: any = {
          unresolvedVariable: "{{unresolved.itemId}}"
        };

        const clonedSolutionsResponse: common.ICreateItemFromTemplateResponse[] = [
          {
            id: "NEWABC123",
            type: "Group",
            data: undefined
          },
          {
            id: "NEW123ABC",
            type: "Workforce Project",
            data: workforceData
          }
        ];

        fetchMock.post(
          "https://www.arcgis.com/sharing/rest/content/items/NEW123ABC/data",
          mockItems.get400Failure()
        );

        deploySolution
          .postProcessDependencies(
            _templates,
            clonedSolutionsResponse,
            MOCK_USER_SESSION,
            templateDictionary
          )
          .then(done.fail, done);
      });
    }
  });
});
