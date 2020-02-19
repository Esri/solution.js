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

const SERVER_INFO = {
  currentVersion: 10.1,
  fullVersion: "10.1",
  soapUrl: "http://server/arcgis/services",
  secureSoapUrl: "https://server/arcgis/services",
  owningSystemUrl: "https://www.arcgis.com",
  authInfo: {}
};

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
            postProcess: false
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
          "https://www.arcgis.com/sharing/rest/generateToken",
          '{"token":"abc123"}'
        )
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
            postProcess: true
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
              postProcess: true
            });
            done();
          }, done.fail);
      });

      it("fails to deploy file data to the item", done => {
        const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
          "Web Map"
        );
        itemTemplate.item.thumbnail = null;
        const resourceFilePaths: common.IDeployFileCopyPath[] = [
          {
            type: common.EFileType.Data,
            folder: "cod1234567890_info_data",
            filename: "Name of an AGOL item.zip",
            url:
              "https://myserver/doc/cod1234567890_info_data/Name of an AGOL item.zip"
          }
        ];
        const templateDictionary: any = {};
        const newItemID: string = "map1234567891";

        fetchMock
          .post(
            "https://www.arcgis.com/sharing/rest/content/users/casey/addItem",
            { success: true, id: newItemID }
          )
          .post(
            "https://myserver/doc/cod1234567890_info_data/Name of an AGOL item.zip/rest/info",
            SERVER_INFO
          )
          .post(
            "https://myserver/doc/cod1234567890_info_data/Name of an AGOL item.zip",
            utils.getSampleZipFile("Name of an AGOL item.zip")
          )
          .post(
            "https://myserver/doc/metadata.xml",
            new Blob(["<meta><value1>a</value1><value2>b</value2></meta>"], {
              type: "text/xml"
            }),
            { sendAsJson: false }
          )
          .post(
            "https://www.arcgis.com/sharing/rest/content/users/casey/items/" +
              newItemID +
              "/update",
            { success: false }
          )
          .post(
            "https://www.arcgis.com/sharing/rest/generateToken",
            MOCK_USER_SESSION.token
          )
          .post("https://www.arcgis.com/sharing/rest/info", SERVER_INFO);

        deploySolution
          ._createItemFromTemplateWhenReady(
            itemTemplate,
            resourceFilePaths,
            MOCK_USER_SESSION,
            templateDictionary,
            MOCK_USER_SESSION,
            utils.PROGRESS_CALLBACK
          )
          .then(
            () => done.fail(),
            () => done()
          );
      });

      it("should handle error on copy group resources", done => {
        const itemId: string = "abc9cab401af4828a25cc6eaeb59fb69";
        const templateDictionary: any = {};
        const newItemID: string = "abc8cab401af4828a25cc6eaeb59fb69";

        const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
        itemTemplate.itemId = itemId;
        itemTemplate.type = "Group";
        itemTemplate.item.title = "Dam Inspection Assignments";

        const searchResult: any = {
          query: "Dam Inspection Assignments",
          total: 12,
          start: 1,
          num: 10,
          nextStart: 11,
          results: []
        };

        const filePaths: any[] = [
          {
            type: common.EFileType.Resource,
            folder: "aFolder",
            filename: "git_merge.png",
            url: "http://someurl"
          }
        ];

        fetchMock
          .get(
            "https://www.arcgis.com/sharing/rest/community/groups?f=json&q=Dam%20Inspection%20Assignments&token=fake-token",
            searchResult
          )
          .post("https://www.arcgis.com/sharing/rest/community/createGroup", {
            success: true,
            group: { id: newItemID }
          })
          .post("http://someurl//rest/info", {})
          .post("http://someurl/", mockItems.get400Failure());

        deploySolution
          ._createItemFromTemplateWhenReady(
            itemTemplate,
            filePaths,
            MOCK_USER_SESSION,
            templateDictionary,
            MOCK_USER_SESSION,
            utils.PROGRESS_CALLBACK
          )
          .then(() => {
            done.fail();
          }, done);
      });

      it("can handle error on copyFilesFromStorage", done => {
        const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
          "Web Mapping Application",
          null,
          "https://apl.maps.arcgis.com/apps/Viewer/index.html?appid=map1234567890"
        );
        itemTemplate.item.thumbnail = null;
        const resourceFilePaths: common.IDeployFileCopyPath[] = [
          {
            type: common.EFileType.Thumbnail,
            folder: "9ed8414bb27a441cbddb1227870ed038_info_thumbnail",
            filename: "thumbnail1581708282265.png",
            url:
              "https://www.arcgis.com/sharing/rest/content/items/ffb0b76754ae4ce497bb4789f3940146/resources/9ed8414bb27a441cbddb1227870ed038_info_thumbnail/thumbnail1581708282265.png"
          }
        ];
        const templateDictionary: any = {};
        const newItemID: string = "wma1234567891";

        fetchMock
          .post(
            "https://www.arcgis.com/sharing/rest/generateToken",
            '{"token":"abc123"}'
          )
          .post(
            "https://www.arcgis.com/sharing/rest/content/users/casey/addItem",
            { success: true, id: newItemID }
          )
          .post(
            "https://www.arcgis.com/sharing/rest/content/users/casey/items/wma1234567891/update",
            { success: true, id: newItemID }
          )
          .post(resourceFilePaths[0].url, 503);

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
            done.fail();
          }, done);
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
            postProcess: false
          },
          {
            id: "NEW123ABC",
            type: "Workforce Project",
            postProcess: true
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
            postProcess: true
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
            postProcess: false
          },
          {
            id: "NEW123ABC",
            type: "Workforce Project",
            postProcess: false
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
            postProcess: false
          },
          {
            id: "NEW123ABC",
            type: "Workforce Project",
            postProcess: true
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
            postProcess: false
          },
          {
            id: "NEW123ABC",
            type: "Workforce Project",
            postProcess: true
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
