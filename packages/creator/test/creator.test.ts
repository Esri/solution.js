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
 * Provides tests for functions involving the creation of a Solution item.
 */

import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as utils from "../../common/test/mocks/utils";

import * as common from "@esri/solution-common";
import * as creator from "../src/creator";

// Set up a UserSession to use in all these tests
const MOCK_USER_SESSION = new common.UserSession({
  clientId: "clientId",
  redirectUri: "https://example-app.com/redirect-uri",
  token: "fake-token",
  tokenExpires: utils.TOMORROW,
  refreshToken: "refreshToken",
  refreshTokenExpires: utils.TOMORROW,
  refreshTokenTTL: 1440,
  username: "casey",
  password: "123456",
  portal: "https://myorg.maps.arcgis.com/sharing/rest"
});

const noDataResponse: any = {};
const noResourcesResponse: any = {
  total: 0,
  start: 1,
  num: 0,
  nextStart: -1,
  resources: []
};
const noMetadataResponse: any = {
  error: {
    code: 400,
    messageCode: "CONT_0036",
    message: "Item info file does not exist or is inaccessible.",
    details: ["Error getting Item Info from DataStore"]
  }
};

afterEach(() => {
  fetchMock.restore();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `creator`", () => {
  // Blobs are only available in the browser
  if (typeof window !== "undefined") {
    describe("createSolutionFromGroupId", () => {
      it("createSolutionFromGroupId fails to get group", done => {
        const solutionGroupId: string = "grp1234567890";
        const authentication: common.UserSession = MOCK_USER_SESSION;

        fetchMock
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/community/groups/grp1234567890?f=json&token=fake-token",
            {
              error: {
                code: 400,
                messageCode: "CONT_0004",
                message: "Item does not exist or is inaccessible.",
                details: []
              }
            }
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            {
              error: {
                code: 400,
                messageCode: "CONT_0004",
                message: "Item does not exist or is inaccessible.",
                details: []
              }
            }
          );
        creator.createSolutionFromGroupId(solutionGroupId, authentication).then(
          () => done.fail(),
          response => {
            expect(response.name).toEqual("ArcGISRequestError");
            expect(response.code).toEqual("CONT_0004");
            done();
          }
        );
      });

      it("createSolutionFromGroupId fails to get item", done => {
        const solutionGroupId: string = "grp1234567890";
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const expectedSolutionId = "sln1234567890";

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
            { success: true, id: expectedSolutionId }
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsList(1, "Web Map")
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678900?f=json&token=fake-token",
            {
              error: {
                code: 400,
                messageCode: "CONT_0004",
                message: "Item does not exist or is inaccessible.",
                details: []
              }
            }
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/community/groups/map12345678900?f=json&token=fake-token",
            {
              error: {
                code: 400,
                messageCode: "CONT_0004",
                message: "Item does not exist or is inaccessible.",
                details: []
              }
            }
          )
          .post(
            // for missing item's placeholder
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/update",
            { success: true, id: expectedSolutionId }
          );
        spyOn(common, "createId").and.callFake(() => "xfakeidx");
        creator.createSolutionFromGroupId(solutionGroupId, authentication).then(
          response => {
            expect(response).toEqual(expectedSolutionId);
            done();
          },
          () => done.fail()
        );
      });

      it("createSolutionFromGroupId fails to update solution item", done => {
        const solutionGroupId: string = "grp1234567890";
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const expectedSolutionId = "sln1234567890";

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
            { success: true, id: expectedSolutionId }
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsList(1, "Web Map")
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678900?f=json&token=fake-token",
            {
              error: {
                code: 400,
                messageCode: "CONT_0004",
                message: "Item does not exist or is inaccessible.",
                details: []
              }
            }
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/community/groups/map12345678900?f=json&token=fake-token",
            {
              error: {
                code: 400,
                messageCode: "CONT_0004",
                message: "Item does not exist or is inaccessible.",
                details: []
              }
            }
          )
          .post(
            // for missing item's placeholder
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/update",
            { success: false, id: expectedSolutionId }
          );
        spyOn(common, "createId").and.callFake(() => "xfakeidx");
        creator.createSolutionFromGroupId(solutionGroupId, authentication).then(
          () => done.fail(),
          response => {
            expect(response.success).toBeFalsy();
            done();
          }
        );
      });

      it("createSolutionFromGroupId with default name", done => {
        const solutionGroupId: string = "grp1234567890";
        const authentication: common.UserSession = MOCK_USER_SESSION;

        const expectedSolutionId = "sln1234567890";

        fetchMock
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsList(2, "Web Map")
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
            { success: true, id: expectedSolutionId }
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678900?f=json&token=fake-token",
            mockItems.getAGOLItemWithId("Web Map", 0)
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678900/info/thumbnail/ago_downloaded.png",
            mockItems.getAnImageResponse()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678900/data",
            noDataResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678900/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678900/resources",
            noResourcesResponse
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678901?f=json&token=fake-token",
            mockItems.getAGOLItemWithId("Web Map", 1)
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678901/info/thumbnail/ago_downloaded.png",
            mockItems.getAnImageResponse()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678901/data",
            noDataResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678901/resources",
            noResourcesResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678901/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/update",
            { success: true, id: expectedSolutionId }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: expectedSolutionId }
          );

        creator.createSolutionFromGroupId(solutionGroupId, authentication).then(
          solutionId => {
            expect(solutionId).toEqual(expectedSolutionId);

            const addSolnCall = fetchMock.calls(
              "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem"
            );
            expect(
              (addSolnCall[0][1]["body"] as string).indexOf(
                "title=" +
                  mockItems.getAGOLItem("Group").title.replace(/ /g, "%20")
              ) > 0
            ).toBeTruthy();

            done();
          },
          () => done.fail()
        );
      });

      it("createSolutionFromGroupId with specified name", done => {
        const solutionName: string = "scratch_" + common.getUTCTimestamp();
        const solutionGroupId: string = "grp1234567890";
        const authentication: common.UserSession = MOCK_USER_SESSION;

        const expectedSolutionId = "sln1234567890";

        fetchMock
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsList(2, "Web Map")
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
            { success: true, id: expectedSolutionId }
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678900?f=json&token=fake-token",
            mockItems.getAGOLItemWithId("Web Map", 0)
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678900/info/thumbnail/ago_downloaded.png",
            mockItems.getAnImageResponse()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678900/data",
            noDataResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678900/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678900/resources",
            noResourcesResponse
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678901?f=json&token=fake-token",
            mockItems.getAGOLItemWithId("Web Map", 1)
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678901/info/thumbnail/ago_downloaded.png",
            mockItems.getAnImageResponse()
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678901/data",
            noDataResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678901/resources",
            noResourcesResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678901/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/update",
            { success: true, id: expectedSolutionId }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: expectedSolutionId }
          );

        const options: common.ICreateSolutionOptions = {
          title: solutionName,
          snippet: "createOptions.snippet",
          description: "createOptions.description",
          tags: ["createOptions.tags"],
          templatizeFields: true,
          templateDictionary: {
            wma1234567890: {
              itemId: "wma1234567890",
              url:
                "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/wma1234567890",
              name: "a map"
            }
          },
          // tslint:disable-next-line: no-empty
          progressCallback: () => {}
        };
        creator
          .createSolutionFromGroupId(solutionGroupId, authentication, options)
          .then(
            solutionId => {
              expect(solutionId).toEqual(expectedSolutionId);

              const addSolnCall = fetchMock.calls(
                "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem"
              );
              expect(
                (addSolnCall[0][1]["body"] as string).indexOf(
                  "title=" + solutionName
                ) > 0
              ).toBeTruthy();

              done();
            },
            () => done.fail()
          );
      });

      it("createSolutionFromGroupId with empty group with defaults without progress callback", done => {
        const solutionGroupId: string = "grp1234567890";
        const authentication: common.UserSession = MOCK_USER_SESSION;

        const expectedSolutionId = "sln1234567890";

        fetchMock
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsList(0)
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
            { success: true, id: expectedSolutionId }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678901/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/update",
            { success: true, id: expectedSolutionId }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: expectedSolutionId }
          );

        creator.createSolutionFromGroupId(solutionGroupId, authentication).then(
          solutionId => {
            expect(solutionId).toEqual(expectedSolutionId);

            const addSolnCall = fetchMock.calls(
              "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem"
            );
            expect(
              (addSolnCall[0][1]["body"] as string).indexOf(
                "title=" +
                  mockItems.getAGOLItem("Group").title.replace(/ /g, "%20")
              ) > 0
            ).toBeTruthy();

            done();
          },
          () => done.fail()
        );
      });

      it("createSolutionFromGroupId with empty group without progress callback", done => {
        const solutionName: string = "scratch_" + common.getUTCTimestamp();
        const solutionGroupId: string = "grp1234567890";
        const authentication: common.UserSession = MOCK_USER_SESSION;

        const expectedSolutionId = "sln1234567890";

        fetchMock
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsList(0)
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
            { success: true, id: expectedSolutionId }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678901/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/update",
            { success: true, id: expectedSolutionId }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: expectedSolutionId }
          );

        const options: common.ICreateSolutionOptions = {
          title: solutionName,
          templatizeFields: true
        };
        creator
          .createSolutionFromGroupId(solutionGroupId, authentication, options)
          .then(
            solutionId => {
              expect(solutionId).toEqual(expectedSolutionId);

              const addSolnCall = fetchMock.calls(
                "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem"
              );
              expect(
                (addSolnCall[0][1]["body"] as string).indexOf(
                  "title=" + solutionName
                ) > 0
              ).toBeTruthy();

              done();
            },
            () => done.fail()
          );
      });

      it("createSolutionFromGroupId with empty group and progress callback", done => {
        const solutionName: string = "scratch_" + common.getUTCTimestamp();
        const solutionGroupId: string = "grp1234567890";
        const authentication: common.UserSession = MOCK_USER_SESSION;

        const expectedSolutionId = "sln1234567890";

        fetchMock
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsList(0)
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
            { success: true, id: expectedSolutionId }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678901/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/update",
            { success: true, id: expectedSolutionId }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: expectedSolutionId }
          );

        const options: common.ICreateSolutionOptions = {
          title: solutionName,
          templatizeFields: true,
          // tslint:disable-next-line: no-empty
          progressCallback: () => {}
        };
        creator
          .createSolutionFromGroupId(solutionGroupId, authentication, options)
          .then(
            solutionId => {
              expect(solutionId).toEqual(expectedSolutionId);

              const addSolnCall = fetchMock.calls(
                "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem"
              );
              expect(
                (addSolnCall[0][1]["body"] as string).indexOf(
                  "title=" + solutionName
                ) > 0
              ).toBeTruthy();

              done();
            },
            () => done.fail()
          );
      });
    });
  }

  describe("createSolutionFromItemIds", () => {
    it("createSolutionFromItemIds fails to create solution item", done => {
      const itemIds: string[] = [];
      const authentication: common.UserSession = MOCK_USER_SESSION;
      const url =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem";

      fetchMock.post(url, { success: false });
      spyOn(common, "createId").and.callFake(() => "xfakeidx");
      creator.createSolutionFromItemIds(itemIds, authentication).then(
        () => done.fail(),
        error => {
          expect(error.success).toBeFalsy();
          done();
        }
      );
    });

    it("createSolutionFromItemIds fails to get item", done => {
      const itemIds: string[] = ["itm1234567890"];
      const authentication: common.UserSession = MOCK_USER_SESSION;
      const expectedSolutionId = "sln1234567890";

      fetchMock
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
          { success: true, id: expectedSolutionId }
        )
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890?f=json&token=fake-token",
          {
            error: {
              code: 400,
              messageCode: "CONT_0004",
              message: "Item does not exist or is inaccessible.",
              details: []
            }
          }
        )
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/groups/itm1234567890?f=json&token=fake-token",
          {
            error: {
              code: 400,
              messageCode: "CONT_0004",
              message: "Item does not exist or is inaccessible.",
              details: []
            }
          }
        )
        .post(
          // for missing item's placeholder
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/update",
          { success: true, id: expectedSolutionId }
        );
      spyOn(common, "createId").and.callFake(() => "xfakeidx");
      creator.createSolutionFromItemIds(itemIds, authentication).then(
        response => {
          expect(response).toEqual(expectedSolutionId);
          done();
        },
        () => done.fail()
      );
    });

    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
      it("createSolutionFromItemIds fails to add items to solution item", done => {
        const itemIds: string[] = ["itm1234567890"];
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const url =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/update";
        const expectedSolutionId = "sln1234567890";
        const expectedItem = mockItems.getAGOLItem("Web Map");

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem",
            { success: true, id: expectedSolutionId }
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890?f=json&token=fake-token",
            JSON.stringify(expectedItem)
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map1234567890/data",
            noDataResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map1234567890/resources",
            noResourcesResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map1234567890/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map1234567890/info/thumbnail/ago_downloaded.png",
            utils.getSampleImage(),
            { sendAsJson: false }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: expectedSolutionId }
          )
          .post(url, { success: false });
        spyOn(common, "createId").and.callFake(() => "xfakeidx");
        creator.createSolutionFromItemIds(itemIds, authentication).then(
          () => done.fail(),
          error => {
            expect(error.success).toBeFalsy();
            done();
          }
        );
      });
    }
  });

  describe("createSolutionItem", () => {
    it("createSolutionItem with defaults", done => {
      const authentication: common.UserSession = MOCK_USER_SESSION;
      const url =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem";
      const expectedSolutionId = "sln1234567890";

      fetchMock.post(url, { success: true, id: expectedSolutionId });
      spyOn(common, "createId").and.callFake(() => "xfakeidx");
      creator.createSolutionItem(authentication).then(
        solutionId => {
          expect(solutionId).toEqual(expectedSolutionId);
          const options: fetchMock.MockOptions = fetchMock.lastOptions(url);
          const fetchBody = (options as fetchMock.MockResponseObject).body;
          expect(fetchBody).toEqual(
            "f=json&type=Solution&title=xfakeidx&snippet=&description=&thumbnailUrl=&tags=" +
              "&typeKeywords=Solution%2CTemplate&text=%7B%22metadata%22%3A%7B%7D%2C%22templates%22%3A%5B%5D%7D" +
              "&token=fake-token"
          );
          done();
        },
        () => done.fail()
      );
    });

    it("createSolutionItem with options", done => {
      const options: common.ICreateSolutionOptions = {
        title: "Solution Name",
        snippet: "Solution's snippet",
        description: "Solution's description",
        tags: ["Test", "a tag"],
        thumbnailUrl: "https://myorg.maps.arcgis.com/logo.png",
        templatizeFields: true,
        additionalTypeKeywords: ["Esri", "Government Solutions"]
      };
      const authentication: common.UserSession = MOCK_USER_SESSION;
      const url =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem";
      const expectedSolutionId = "sln1234567890";

      fetchMock
        .post(url, { success: true, id: expectedSolutionId })
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/sln1234567890/update",
          { success: true, id: expectedSolutionId }
        );
      spyOn(common, "createId").and.callFake(() => "xfakeidx");
      creator.createSolutionItem(authentication, options).then(
        solutionId => {
          expect(solutionId).toEqual(expectedSolutionId);
          const fetchOptions: fetchMock.MockOptions = fetchMock.lastOptions(
            url
          );
          const fetchBody = (fetchOptions as fetchMock.MockResponseObject).body;
          expect(fetchBody).toEqual(
            "f=json&type=Solution&title=" +
              encodeURIComponent(options.title) +
              "&snippet=" +
              encodeURIComponent(options.snippet) +
              "&description=" +
              encodeURIComponent(options.description) +
              "&thumbnailUrl=" +
              encodeURIComponent(options.thumbnailUrl) +
              "&tags=" +
              options.tags.map(encodeURIComponent).join("%2C") +
              "&typeKeywords=" +
              ["Solution", "Template"]
                .concat(options.additionalTypeKeywords)
                .map(encodeURIComponent)
                .join("%2C") +
              "&text=%7B%22metadata%22%3A%7B%7D%2C%22templates%22%3A%5B%5D%7D&token=fake-token"
          );
          done();
        },
        () => done.fail()
      );
    });

    it("createSolutionItem fails", done => {
      const authentication: common.UserSession = MOCK_USER_SESSION;
      const url =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/addItem";

      fetchMock.post(url, { success: false });
      spyOn(common, "createId").and.callFake(() => "xfakeidx");
      creator.createSolutionItem(authentication).then(
        () => done.fail(),
        error => {
          expect(error.success).toBeFalsy();
          const options: fetchMock.MockOptions = fetchMock.lastOptions(url);
          const fetchBody = (options as fetchMock.MockResponseObject).body;
          expect(fetchBody).toEqual(
            "f=json&type=Solution&title=xfakeidx&snippet=&description=&thumbnailUrl=&tags=" +
              "&typeKeywords=Solution%2CTemplate&text=%7B%22metadata%22%3A%7B%7D%2C%22templates%22%3A%5B%5D%7D" +
              "&token=fake-token"
          );
          done();
        }
      );
    });
  });
});
