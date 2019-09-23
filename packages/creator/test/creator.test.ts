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
import { TOMORROW } from "../../common/test/mocks/utils";

import * as auth from "@esri/arcgis-rest-auth";
import * as creator from "../src/creator";

// Set up a UserSession to use in all these tests
const MOCK_USER_SESSION = new auth.UserSession({
  clientId: "clientId",
  redirectUri: "https://example-app.com/redirect-uri",
  token: "fake-token",
  tokenExpires: TOMORROW,
  refreshToken: "refreshToken",
  refreshTokenExpires: TOMORROW,
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
    describe("createSolution", () => {
      it("createSolution with default name", done => {
        const solutionName: string = "";
        const solutionGroupId: string = "grp1234567890";
        const templateDictionary: any = {};
        const portalSubset = {
          name: "",
          id: "",
          restUrl: "https://www.arcgis.com/sharing/rest",
          portalUrl: "",
          urlKey: ""
        } as creator.IPortalSubset;
        const destinationUserSession: auth.UserSession = MOCK_USER_SESSION;
        // tslint:disable-next-line: no-empty
        const progressCallback = (percentDone: number) => {};

        const expectedSolutionId = "sln1234567890";

        fetchMock
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsList("Web Map", 2)
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
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678900/data?token=fake-token",
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
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678901/data?token=fake-token",
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

        creator
          .createSolution(
            solutionName,
            solutionGroupId,
            templateDictionary,
            portalSubset,
            destinationUserSession,
            progressCallback
          )
          .then(
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

      it("createSolution with specified name", done => {
        const solutionName: string = "scratch_" + getUTCTimestamp();
        const solutionGroupId: string = "grp1234567890";
        const templateDictionary: any = {};
        const portalSubset = {
          name: "",
          id: "",
          restUrl: "https://www.arcgis.com/sharing/rest",
          portalUrl: "",
          urlKey: ""
        } as creator.IPortalSubset;
        const destinationUserSession: auth.UserSession = MOCK_USER_SESSION;
        // tslint:disable-next-line: no-empty
        const progressCallback = (percentDone: number) => {};

        const expectedSolutionId = "sln1234567890";

        fetchMock
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/community/groups/grp1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem("Group")
          )
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=1&num=100&token=fake-token",
            mockItems.getAGOLGroupContentsList("Web Map", 2)
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
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678900/data?token=fake-token",
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
          .get(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/map12345678901/data?token=fake-token",
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

        creator
          .createSolution(
            solutionName,
            solutionGroupId,
            templateDictionary,
            portalSubset,
            destinationUserSession,
            progressCallback
          )
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
});

// -------------------------------------------------------------------------------------------------------------------//

/**
 * Creates a timestamp string using the current date and time.
 *
 * @return Timestamp
 * @protected
 */
export function getUTCTimestamp(): string {
  const now = new Date();
  return (
    padPositiveNum(now.getUTCFullYear(), 4) +
    padPositiveNum(now.getUTCMonth() + 1, 2) +
    padPositiveNum(now.getUTCDate(), 2) +
    "_" +
    padPositiveNum(now.getUTCHours(), 2) +
    padPositiveNum(now.getUTCMinutes(), 2) +
    "_" +
    padPositiveNum(now.getUTCSeconds(), 2) +
    padPositiveNum(now.getUTCMilliseconds(), 3)
  );
}

function padPositiveNum(n: number, totalSize: number): string {
  let numStr = n.toString();
  const numPads = totalSize - numStr.length;
  if (numPads > 0) {
    numStr = "0".repeat(numPads) + numStr; // TODO IE11 does not support repeat()
  }
  return numStr;
}
