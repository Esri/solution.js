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

import * as deploySolution from "../src/deploySolutionItems";
import * as utils from "../../common/test/mocks/utils";
import * as templates from "../../common/test/mocks/templates";
import fetchMock = require("fetch-mock");
import * as mockItems from "../../common/test/mocks/agolItems";

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
          [templates.getItemTemplate()],
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
    xit("_createItemFromTemplateWhenReady", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("postProcessCircularDependencies", () => {
    if (typeof window !== "undefined") {
      it("should handle circular dependencies based on item type", done => {
        const _templates: any[] = [
          {
            type: "Group",
            itemId: "ABC123",
            circularDependencies: ["123ABC"]
          },
          {
            type: "Workforce Project",
            itemId: "123ABC",
            circularDependencies: ["ABC123"]
          }
        ];

        const templateDictionary: any = {
          ABC123: {
            itemId: "NEWABC123"
          },
          "123ABC": {
            itemId: "NEW123ABC"
          }
        };

        const itemData: any = {
          groupId: "{{ABC123.itemId}}"
        };

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

        const expectedBody: string =
          "f=json&text=%7B%22groupId%22%3A%22NEWABC123%22%7D&id=123ABC";

        const updateUrl: string =
          "https://www.arcgis.com/sharing/rest/content/users/casey/items/123ABC/update";

        fetchMock
          .post(
            "https://www.arcgis.com/sharing/rest/content/users/casey/items/NEW123ABC/share",
            { notSharedWith: [], itemId: "ABC123" }
          )
          .post(
            "https://www.arcgis.com/sharing/rest/generateToken",
            MOCK_USER_SESSION.token
          )
          .post(
            "https://www.arcgis.com/sharing/rest/content/items/123ABC/data",
            itemData
          )
          .post(updateUrl, '{"success":true}')
          .get(
            "https://www.arcgis.com/sharing/rest/community/users/casey?f=json",
            {}
          )
          .get(
            "https://www.arcgis.com/sharing/rest/community/groups/ABC123?f=json",
            groupResponse
          )
          .post("https://www.arcgis.com/sharing/rest/search", {
            results: []
          });

        deploySolution
          .postProcessCircularDependencies(
            _templates,
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

      it("should handle error with circular dependencies based on item type", done => {
        const _templates: any[] = [
          {
            type: "Group",
            itemId: "ABC123",
            circularDependencies: ["123ABC"]
          },
          {
            type: "Workforce Project",
            itemId: "123ABC",
            circularDependencies: ["ABC123"]
          }
        ];

        const itemData: any = {
          groupId: "{{ABC123.itemId}}"
        };

        const templateDictionary: any = {
          ABC123: {
            itemId: "NEWABC123"
          },
          "123ABC": {
            itemId: "NEW123ABC"
          }
        };

        fetchMock
          .post(
            "https://www.arcgis.com/sharing/rest/search",
            mockItems.get400Failure()
          )
          .post(
            "https://www.arcgis.com/sharing/rest/generateToken",
            MOCK_USER_SESSION.token
          )
          .post(
            "https://www.arcgis.com/sharing/rest/content/items/123ABC/data",
            itemData
          )
          .get(
            "https://www.arcgis.com/sharing/rest/community/users/casey?f=json",
            {}
          );

        deploySolution
          .postProcessCircularDependencies(
            _templates,
            MOCK_USER_SESSION,
            templateDictionary
          )
          .then(() => {
            done.fail();
          }, done);
      });
    }
  });
});
