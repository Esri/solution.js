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

import * as common from "@esri/solution-common";
import * as createItemTemplate from "../src/createItemTemplate";
import * as creator from "../src/creator";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as staticRelatedItemsMocks from "../../common/test/mocks/staticRelatedItemsMocks";
import * as templates from "../../common/test/mocks/templates";
import * as utils from "../../common/test/mocks/utils";

// Set up a UserSession to use in all these tests
const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

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
    describe("createSolution", () => {
      it("createSolution fails to get group or item", done => {
        const solutionGroupId: string = "grp1234567890";
        const authentication: common.UserSession = MOCK_USER_SESSION;

        const options: common.ICreateSolutionOptions = {
          progressCallback: utils.SOLUTION_PROGRESS_CALLBACK
        };

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
            utils.getSuccessResponse({ id: "sln1234567890", folder: null })
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.get400Failure()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.get400Failure()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/grp1234567890?f=json&token=fake-token",
            mockItems.get400Failure()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/update",
            utils.getSuccessResponse({ itemId: "sln1234567890" })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/delete",
            utils.getSuccessResponse({ itemId: "sln1234567890" })
          );
        creator.createSolution(solutionGroupId, authentication, options).then(
          () => done.fail(),
          response => {
            expect(response.success).toBeFalsy();
            done();
          }
        );
      });

      it("createSolution fails to get item in group", done => {
        const solutionGroupId: string = "grp1234567890";
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const expectedSolutionId = "sln1234567890";
        const expectedImage = mockItems.getAnImageResponse();

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
            utils.getSuccessResponse({ id: expectedSolutionId, folder: null })
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsList(1, "Web Map")
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678900?f=json&token=fake-token",
            mockItems.get400Failure()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/map12345678900?f=json&token=fake-token",
            mockItems.get400Failure()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890/info/ROWPermitManager.png",
            expectedImage
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/delete",
            utils.getSuccessResponse({ itemId: expectedSolutionId })
          )
          .post(
            // for missing item's placeholder
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/update",
            utils.getSuccessResponse({ id: expectedSolutionId })
          );
        spyOn(common, "createId").and.callFake(() => "xfakeidx");
        creator.createSolution(solutionGroupId, authentication).then(
          () => done.fail(),
          response => {
            done();
          }
        );
      });

      it("createSolution fails to update solution item", done => {
        const solutionGroupId: string = "grp1234567890";
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const expectedSolutionId = "sln1234567890";

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
            utils.getSuccessResponse({ id: expectedSolutionId, folder: null })
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsList(1, "Web Map")
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678900?f=json&token=fake-token",
            mockItems.get400Failure()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/map12345678900?f=json&token=fake-token",
            mockItems.get400Failure()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890/info/ROWPermitManager.png",
            mockItems.getAnImageResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/delete",
            { success: true, itemId: expectedSolutionId }
          )
          .post(
            // for missing item's placeholder
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/update",
            utils.getSuccessResponse({ id: expectedSolutionId })
          );
        spyOn(common, "createId").and.callFake(() => "xfakeidx");
        creator.createSolution(solutionGroupId, authentication).then(
          () => done.fail(),
          response => {
            done();
          }
        );
      });

      it("createSolution with default name", done => {
        const solutionGroupId: string = "grp1234567890";
        const authentication: common.UserSession = MOCK_USER_SESSION;

        const expectedSolutionId = "sln1234567890";
        const expectedImage = mockItems.getAnImageResponse();

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsList(2, "Web Map")
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
            utils.getSuccessResponse({ id: expectedSolutionId, folder: null })
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678900?f=json&token=fake-token",
            mockItems.getAGOLItemWithId("Web Map", 0)
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678900/info/thumbnail/ago_downloaded.png",
            mockItems.getAnImageResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/items/map12345678900/data",
            noDataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678900/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678900/resources",
            noResourcesResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678901?f=json&token=fake-token",
            mockItems.getAGOLItemWithId("Web Map", 1)
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678901/info/thumbnail/ago_downloaded.png",
            mockItems.getAnImageResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/items/map12345678901/data",
            noDataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678901/resources",
            noResourcesResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678901/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890/info/ROWPermitManager.png",
            expectedImage
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/update",
            utils.getSuccessResponse({ id: expectedSolutionId })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: expectedSolutionId }
          );
        staticRelatedItemsMocks.fetchMockRelatedItems("map12345678900", {
          total: 0,
          relatedItems: []
        });
        staticRelatedItemsMocks.fetchMockRelatedItems("map12345678901", {
          total: 0,
          relatedItems: []
        });

        creator.createSolution(solutionGroupId, authentication).then(
          solutionId => {
            expect(solutionId).toEqual(expectedSolutionId);

            const addSolnCall = fetchMock.calls(
              utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem"
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

      it("createSolution with specified name", done => {
        const solutionName: string = "scratch_" + common.getUTCTimestamp();
        const solutionGroupId: string = "grp1234567890";
        const authentication: common.UserSession = MOCK_USER_SESSION;

        const expectedSolutionId = "sln1234567890";

        const expectedImage = mockItems.getAnImageResponse();

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsList(2, "Web Map")
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
            utils.getSuccessResponse({ id: expectedSolutionId, folder: null })
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678900?f=json&token=fake-token",
            mockItems.getAGOLItemWithId("Web Map", 0)
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678900/info/thumbnail/ago_downloaded.png",
            mockItems.getAnImageResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/items/map12345678900/data",
            noDataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678900/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678900/resources",
            noResourcesResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678901?f=json&token=fake-token",
            mockItems.getAGOLItemWithId("Web Map", 1)
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678901/info/thumbnail/ago_downloaded.png",
            mockItems.getAnImageResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/items/map12345678901/data",
            noDataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678901/resources",
            noResourcesResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678901/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890/info/ROWPermitManager.png",
            expectedImage
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/update",
            utils.getSuccessResponse({ id: expectedSolutionId })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: expectedSolutionId }
          );
        staticRelatedItemsMocks.fetchMockRelatedItems("map12345678900", {
          total: 0,
          relatedItems: []
        });
        staticRelatedItemsMocks.fetchMockRelatedItems("map12345678901", {
          total: 0,
          relatedItems: []
        });

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
                utils.PORTAL_SUBSET.restUrl +
                "/content/users/casey/items/wma1234567890",
              name: "a map"
            }
          },
          // tslint:disable-next-line: no-empty
          progressCallback: () => {}
        };
        creator.createSolution(solutionGroupId, authentication, options).then(
          solutionId => {
            expect(solutionId).toEqual(expectedSolutionId);

            const addSolnCall = fetchMock.calls(
              utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem"
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

      it("createSolution with empty group with defaults without progress callback", done => {
        const solutionGroupId: string = "grp1234567890";
        const authentication: common.UserSession = MOCK_USER_SESSION;

        const expectedSolutionId = "sln1234567890";
        const expectedImage = mockItems.getAnImageResponse();

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsList(0)
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
            utils.getSuccessResponse({ id: expectedSolutionId, folder: null })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678901/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890/info/ROWPermitManager.png",
            expectedImage
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/update",
            utils.getSuccessResponse({ id: expectedSolutionId })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: expectedSolutionId }
          );

        creator.createSolution(solutionGroupId, authentication).then(
          solutionId => {
            expect(solutionId).toEqual(expectedSolutionId);

            const addSolnCall = fetchMock.calls(
              utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem"
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

      it("createSolution with empty group without progress callback", done => {
        const solutionName: string = "scratch_" + common.getUTCTimestamp();
        const solutionGroupId: string = "grp1234567890";
        const authentication: common.UserSession = MOCK_USER_SESSION;

        const expectedSolutionId = "sln1234567890";

        const expectedImage = mockItems.getAnImageResponse();

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsList(0)
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
            utils.getSuccessResponse({ id: expectedSolutionId, folder: null })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678901/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890/info/ROWPermitManager.png",
            expectedImage
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/update",
            utils.getSuccessResponse({ id: expectedSolutionId })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: expectedSolutionId }
          );

        const options: common.ICreateSolutionOptions = {
          title: solutionName,
          templatizeFields: true
        };
        creator.createSolution(solutionGroupId, authentication, options).then(
          solutionId => {
            expect(solutionId).toEqual(expectedSolutionId);

            const addSolnCall = fetchMock.calls(
              utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem"
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

      it("createSolution with empty group and progress callback", done => {
        const solutionName: string = "scratch_" + common.getUTCTimestamp();
        const solutionGroupId: string = "grp1234567890";
        const authentication: common.UserSession = MOCK_USER_SESSION;

        const expectedSolutionId = "sln1234567890";

        const expectedImage = mockItems.getAnImageResponse();

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsList(0)
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
            utils.getSuccessResponse({ id: expectedSolutionId, folder: null })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map12345678901/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890/info/ROWPermitManager.png",
            expectedImage
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/update",
            utils.getSuccessResponse({ id: expectedSolutionId })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: expectedSolutionId }
          );

        const options: common.ICreateSolutionOptions = {
          title: solutionName,
          templatizeFields: true,
          // tslint:disable-next-line: no-empty
          progressCallback: () => {}
        };
        creator.createSolution(solutionGroupId, authentication, options).then(
          solutionId => {
            expect(solutionId).toEqual(expectedSolutionId);

            const addSolnCall = fetchMock.calls(
              utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem"
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

      it("createSolution fails to get item or group", done => {
        const itemIds: string = "itm1234567890";
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const expectedSolutionId = "sln1234567890";
        const expectedImage = mockItems.getAnImageResponse();

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
            utils.getSuccessResponse({ id: expectedSolutionId, folder: null })
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/itm1234567890?f=json&token=fake-token",
            mockItems.get400Failure()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/itm1234567890?f=json&token=fake-token",
            mockItems.get400Failure()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/groups/itm1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.get400Failure()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/grp1234567890/info/ROWPermitManager.png",
            expectedImage
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/delete",
            { success: true, itemId: expectedSolutionId }
          )
          .post(
            // for missing item's placeholder
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/update",
            utils.getSuccessResponse({ id: expectedSolutionId })
          );
        spyOn(common, "createId").and.callFake(() => "xfakeidx");
        creator.createSolution(itemIds, authentication).then(
          () => done.fail(),
          response => {
            done();
          }
        );
      });

      it("createSolution fails to add items to solution item", done => {
        const itemIds: string = "itm1234567890";
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const expectedSolutionId = "sln1234567890";
        const expectedItem = mockItems.getAGOLItem("Web Map");

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
            utils.getSuccessResponse({ id: expectedSolutionId, folder: null })
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups/itm1234567890?f=json&token=fake-token",
            mockItems.get400Failure()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/groups/itm1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.get400Failure()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/itm1234567890?f=json&token=fake-token",
            JSON.stringify(expectedItem)
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/items/map1234567890/data",
            noDataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890/resources",
            noResourcesResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890/info/metadata/metadata.xml",
            noMetadataResponse
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890/info/thumbnail/ago_downloaded.png",
            utils.getSampleImage(),
            { sendAsJson: false }
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/addResources",
            { success: true, id: expectedSolutionId }
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/update",
            utils.getFailureResponse({ id: "sln1234567890" })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/delete",
            { success: true, itemId: expectedSolutionId }
          );
        staticRelatedItemsMocks.fetchMockRelatedItems("map1234567890", {
          total: 0,
          relatedItems: []
        });

        spyOn(common, "createId").and.callFake(() => "xfakeidx");
        creator.createSolution(itemIds, authentication).then(
          () => done.fail(),
          error => {
            expect(error.success).toBeFalsy();
            done();
          }
        );
      });
    });
  }

  describe("_addContentToSolution", () => {
    it("_addContentToSolution item progress callback with new item", done => {
      const solutionId = "sln1234567890";
      const itemIds = ["map1234567890"];

      let numSpyCalls = 0;
      spyOn(createItemTemplate, "createItemTemplate").and.callFake(
        (
          solutionItemId: string,
          itemId: string,
          templateDictionary: any,
          authentication: common.UserSession,
          existingTemplates: common.IItemTemplate[],
          itemProgressCallback: common.IItemProgressCallback
        ) => {
          if (++numSpyCalls === 1) {
            itemProgressCallback(
              "wma1234567890",
              common.EItemProgressStatus.Started,
              0
            );
          }
          return Promise.resolve();
        }
      );

      // tslint:disable-next-line: no-floating-promises
      creator
        ._addContentToSolution(solutionId, itemIds, MOCK_USER_SESSION, {})
        .then(() => {
          expect(itemIds).toEqual(["map1234567890", "wma1234567890"]);
          done();
        });
    });

    it("_addContentToSolution item progress callback with ignored item", done => {
      const solutionId = "sln1234567890";
      const itemIds = ["map1234567890", "wma1234567890"];

      let numSpyCalls = 0;
      spyOn(createItemTemplate, "createItemTemplate").and.callFake(
        (
          solutionItemId: string,
          itemId: string,
          templateDictionary: any,
          authentication: common.UserSession,
          existingTemplates: common.IItemTemplate[],
          itemProgressCallback: common.IItemProgressCallback
        ) => {
          if (++numSpyCalls === 1) {
            itemProgressCallback(
              "wma1234567890",
              common.EItemProgressStatus.Ignored,
              0
            );
          }
          return Promise.resolve();
        }
      );

      // tslint:disable-next-line: no-floating-promises
      creator
        ._addContentToSolution(solutionId, itemIds, MOCK_USER_SESSION, {})
        .then(() => done());
    });
  });

  describe("_createSolutionFromItemIds", () => {
    it("handles failure to create the solution", done => {
      const solutionCreationError = "Cannot create solution";
      const itemIds = ["map1234567890", "wma1234567890"];

      spyOn(common, "createItemWithData").and.returnValue(
        Promise.reject(solutionCreationError)
      );

      creator._createSolutionFromItemIds(itemIds, MOCK_USER_SESSION, {}).then(
        () => done.fail(),
        response => {
          expect(response).toEqual(solutionCreationError);
          done();
        }
      );
    });

    it("handles failure to delete the solution if items can't be added to it", done => {
      const solutionId = "sln1234567890";
      const itemIds = ["wma1234567890"];

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: solutionId, folder: null })
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/wma1234567890?f=json&token=fake-token",
          mockItems.get400Failure()
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/groups/wma1234567890?f=json&token=fake-token",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/sln1234567890/update",
          utils.getSuccessResponse({ id: solutionId })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/sln1234567890/delete",
          utils.getFailureResponse({ itemId: solutionId })
        );

      creator._createSolutionFromItemIds(itemIds, MOCK_USER_SESSION, {}).then(
        () => done.fail(),
        response => {
          done();
        }
      );
    });
  });

  describe("_createSolutionItem", () => {
    it("creates a solution item with defaults", done => {
      const authentication: common.UserSession = MOCK_USER_SESSION;
      const url = utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem";
      const expectedSolutionId = "sln1234567890";

      fetchMock.post(
        url,
        utils.getSuccessResponse({ id: expectedSolutionId, folder: null })
      );
      spyOn(common, "createId").and.callFake(() => "xfakeidx");
      creator._createSolutionItem(authentication).then(
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

    if (typeof window !== "undefined") {
      it("creates a solution item with options", done => {
        const options: common.ICreateSolutionOptions = {
          title: "Solution Name",
          snippet: "Solution's snippet",
          description: "Solution's description",
          tags: ["Test", "a tag"],
          thumbnailUrl: utils.PORTAL_SUBSET.portalUrl + "/logo.png",
          templatizeFields: true,
          additionalTypeKeywords: ["Esri", "Government Solutions"]
        };
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const url =
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem";
        const expectedSolutionId = "sln1234567890";

        const blob = new Blob(["fake-blob"], { type: "text/plain" });

        fetchMock
          .post(
            url,
            utils.getSuccessResponse({ id: expectedSolutionId, folder: null })
          )
          .post(utils.PORTAL_SUBSET.portalUrl + "/logo.png", blob, {
            sendAsJson: false
          })
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/update",
            utils.getSuccessResponse({ id: expectedSolutionId })
          );
        spyOn(common, "createId").and.callFake(() => "xfakeidx");
        creator._createSolutionItem(authentication, options).then(
          solutionId => {
            expect(solutionId).toEqual(expectedSolutionId);
            const fetchOptions: fetchMock.MockOptions = fetchMock.lastOptions(
              url
            );
            const fetchBody = (fetchOptions as fetchMock.MockResponseObject)
              .body;
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
    }

    it("handles failure to create the solution item", done => {
      const authentication: common.UserSession = MOCK_USER_SESSION;
      const url = utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem";

      fetchMock.post(url, utils.getFailureResponse());
      spyOn(common, "createId").and.callFake(() => "xfakeidx");
      creator._createSolutionItem(authentication).then(
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

    it("handles failure to update the solution item with its icon; success property", done => {
      const authentication: common.UserSession = MOCK_USER_SESSION;
      const solutionId = "sln1234567890";
      const options: common.ICreateSolutionOptions = {
        thumbnailUrl: utils.PORTAL_SUBSET.portalUrl + "/thumbnail.png"
      };
      const updateUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/sln1234567890/update";

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: solutionId, folder: null })
        )
        .post(
          utils.PORTAL_SUBSET.portalUrl + "/thumbnail.png",
          utils.getSampleImage(),
          { sendAsJson: false }
        )
        .post(updateUrl, utils.getFailureResponse({ id: solutionId }))
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/sln1234567890/delete",
          utils.getSuccessResponse({ itemId: solutionId })
        );
      spyOn(common, "createId").and.callFake(() => solutionId);
      creator._createSolutionItem(authentication, options).then(
        () => done.fail(),
        () => done()
      );
    });

    it("handles failure to update the solution item with its icon; reject", done => {
      const authentication: common.UserSession = MOCK_USER_SESSION;
      const solutionId = "sln1234567890";
      const options: common.ICreateSolutionOptions = {
        thumbnailUrl: utils.PORTAL_SUBSET.portalUrl + "/thumbnail.png"
      };
      const updateUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/sln1234567890/update";

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: solutionId, folder: null })
        )
        .post(
          utils.PORTAL_SUBSET.portalUrl + "/thumbnail.png",
          utils.getSampleImage(),
          { sendAsJson: false }
        )
        .post(updateUrl, mockItems.get400Failure())
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/sln1234567890/delete",
          utils.getSuccessResponse({ itemId: solutionId })
        );
      spyOn(common, "createId").and.callFake(() => solutionId);
      creator._createSolutionItem(authentication, options).then(
        () => done.fail(),
        () => done()
      );
    });

    it("handles failure to delete solution after failing to update the solution item with its icon; success property", done => {
      const authentication: common.UserSession = MOCK_USER_SESSION;
      const solutionId = "sln1234567890";
      const options: common.ICreateSolutionOptions = {
        thumbnailUrl: utils.PORTAL_SUBSET.portalUrl + "/thumbnail.png"
      };
      const updateUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/sln1234567890/update";

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: solutionId, folder: null })
        )
        .post(
          utils.PORTAL_SUBSET.portalUrl + "/thumbnail.png",
          utils.getSampleImage(),
          { sendAsJson: false }
        )
        .post(updateUrl, utils.getFailureResponse({ id: solutionId }))
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/sln1234567890/delete",
          utils.getFailureResponse()
        );
      spyOn(common, "createId").and.callFake(() => solutionId);
      creator._createSolutionItem(authentication, options).then(
        () => done.fail(),
        () => done()
      );
    });

    it("handles failure to delete solution after failing to update the solution item with its icon; reject", done => {
      const authentication: common.UserSession = MOCK_USER_SESSION;
      const solutionId = "sln1234567890";
      const options: common.ICreateSolutionOptions = {
        thumbnailUrl: utils.PORTAL_SUBSET.portalUrl + "/thumbnail.png"
      };
      const updateUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/sln1234567890/update";

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: solutionId, folder: null })
        )
        .post(
          utils.PORTAL_SUBSET.portalUrl + "/thumbnail.png",
          utils.getSampleImage(),
          { sendAsJson: false }
        )
        .post(updateUrl, mockItems.get400Failure())
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/sln1234567890/delete",
          utils.getFailureResponse()
        );
      spyOn(common, "createId").and.callFake(() => solutionId);
      creator._createSolutionItem(authentication, options).then(
        () => done.fail(),
        () => done()
      );
    });
  });

  describe("_postProcessGroupDependencies", () => {
    it("remove group dependencies if we find a circular dependency with one of its items", done => {
      const groupTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      groupTemplate.item = mockItems.getAGOLItem("Group", null);
      groupTemplate.itemId = "grpb15c2df2b466da05577776e82d044";
      groupTemplate.type = "Group";

      const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.item = mockItems.getAGOLItem("Workforce Project", null);
      itemTemplate.itemId = "wrkccab401af4828a25cc6eaeb59fb69";
      itemTemplate.type = "Workforce Project";

      groupTemplate.dependencies = [itemTemplate.itemId];

      itemTemplate.dependencies = [groupTemplate.itemId];

      const _templates: common.IItemTemplate[] = [groupTemplate, itemTemplate];

      const expectedGroupTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      expectedGroupTemplate.item = mockItems.getAGOLItem("Group", null);
      expectedGroupTemplate.itemId = "grpb15c2df2b466da05577776e82d044";
      expectedGroupTemplate.type = "Group";
      expectedGroupTemplate.dependencies = [];

      const expectedItemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      expectedItemTemplate.item = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      expectedItemTemplate.itemId = "wrkccab401af4828a25cc6eaeb59fb69";
      expectedItemTemplate.type = "Workforce Project";
      expectedItemTemplate.groups = [expectedGroupTemplate.itemId];
      expectedItemTemplate.dependencies = [expectedGroupTemplate.itemId];

      const expected: common.IItemTemplate[] = [
        expectedGroupTemplate,
        expectedItemTemplate
      ];

      const actual = creator._postProcessGroupDependencies(_templates);
      expect(actual).toEqual(expected);
      done();
    });

    it("add group dependencies to groups array", done => {
      const groupTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      groupTemplate.item = mockItems.getAGOLItem("Group", null);
      groupTemplate.itemId = "grpb15c2df2b466da05577776e82d044";
      groupTemplate.type = "Group";
      groupTemplate.dependencies = [];

      const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.item = mockItems.getAGOLItem(
        "Web Mapping Application",
        null
      );
      itemTemplate.itemId = "wmaccab401af4828a25cc6eaeb59fb69";
      itemTemplate.type = "Web Mapping Application";
      itemTemplate.dependencies = [groupTemplate.itemId];

      const _templates: common.IItemTemplate[] = [groupTemplate, itemTemplate];

      const expectedGroupTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      expectedGroupTemplate.item = mockItems.getAGOLItem("Group", null);
      expectedGroupTemplate.itemId = "grpb15c2df2b466da05577776e82d044";
      expectedGroupTemplate.type = "Group";
      expectedGroupTemplate.dependencies = [];

      const expectedItemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      expectedItemTemplate.item = mockItems.getAGOLItem(
        "Web Mapping Application",
        null
      );
      expectedItemTemplate.itemId = "wmaccab401af4828a25cc6eaeb59fb69";
      expectedItemTemplate.type = "Web Mapping Application";
      expectedItemTemplate.dependencies = [expectedGroupTemplate.itemId];

      const expected: common.IItemTemplate[] = [
        expectedGroupTemplate,
        expectedItemTemplate
      ];

      const actual = creator._postProcessGroupDependencies(_templates);
      expect(actual).toEqual(expected);
      done();
    });
  });
});
