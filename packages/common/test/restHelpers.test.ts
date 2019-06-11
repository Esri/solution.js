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
 * Provides tests for functions involving the arcgis-rest-js library.
 */

import * as auth from "@esri/arcgis-rest-auth";
import * as portal from "@esri/arcgis-rest-portal";
import * as restHelpers from "../src/restHelpers";

import { TOMORROW } from "./lib/utils";
import * as fetchMock from "fetch-mock";

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `restHelpers`: common functions involving the arcgis-rest-js library", () => {
  // Set up a UserSession to use in all of these tests
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

  const MOCK_USER_REQOPTS: auth.IUserRequestOptions = {
    authentication: MOCK_USER_SESSION,
    portal: "https://myorg.maps.arcgis.com/sharing/rest"
  };

  afterEach(() => {
    fetchMock.restore();
  });

  describe("createUniqueFolder", () => {
    it("folder doesn't already exist", done => {
      const folderTitleRoot = "folder name";
      const suffix = 0;
      const expectedSuccess = successfulFolderCreation(folderTitleRoot, suffix);

      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
        JSON.stringify(expectedSuccess)
      );
      restHelpers
        .createUniqueFolder(folderTitleRoot, MOCK_USER_SESSION)
        .then((response: portal.IAddFolderResponse) => {
          expect(response).toEqual(expectedSuccess);
          done();
        }, done.fail);
    });

    it("initial version of folder exists", done => {
      const folderTitleRoot = "folder name";
      const expectedSuffix = 1;
      const expectedSuccess = successfulFolderCreation(
        folderTitleRoot,
        expectedSuffix
      );

      let suffix = 0;
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
        () => {
          const response =
            suffix === expectedSuffix
              ? JSON.stringify(
                  successfulFolderCreation(folderTitleRoot, suffix)
                )
              : JSON.stringify(failedFolderCreation(folderTitleRoot, suffix));
          ++suffix;
          return response;
        }
      );
      restHelpers
        .createUniqueFolder(folderTitleRoot, MOCK_USER_SESSION)
        .then((response: portal.IAddFolderResponse) => {
          expect(response).toEqual(expectedSuccess);
          done();
        }, done.fail);
    });

    it("two versions of folder exist", done => {
      const folderTitleRoot = "folder name";
      const expectedSuffix = 2;
      const expectedSuccess = successfulFolderCreation(
        folderTitleRoot,
        expectedSuffix
      );

      let suffix = 0;
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
        () => {
          const response =
            suffix === expectedSuffix
              ? JSON.stringify(
                  successfulFolderCreation(folderTitleRoot, suffix)
                )
              : JSON.stringify(failedFolderCreation(folderTitleRoot, suffix));
          ++suffix;
          return response;
        }
      );
      restHelpers
        .createUniqueFolder(folderTitleRoot, MOCK_USER_SESSION)
        .then((response: portal.IAddFolderResponse) => {
          expect(response).toEqual(expectedSuccess);
          done();
        }, done.fail);
    });

    it("three versions of folder exist", done => {
      const folderTitleRoot = "folder name";
      const expectedSuffix = 3;
      const expectedSuccess = successfulFolderCreation(
        folderTitleRoot,
        expectedSuffix
      );

      let suffix = 0;
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
        () => {
          const response =
            suffix === expectedSuffix
              ? JSON.stringify(
                  successfulFolderCreation(folderTitleRoot, suffix)
                )
              : JSON.stringify(failedFolderCreation(folderTitleRoot, suffix));
          ++suffix;
          return response;
        }
      );
      restHelpers
        .createUniqueFolder(folderTitleRoot, MOCK_USER_SESSION)
        .then((response: portal.IAddFolderResponse) => {
          expect(response).toEqual(expectedSuccess);
          done();
        }, done.fail);
    });
  });
});

// ------------------------------------------------------------------------------------------------------------------ //

function successfulFolderCreation(
  folderTitleRoot: string,
  suffix: number
): any {
  const folderName =
    folderTitleRoot + (suffix > 0 ? " " + suffix.toString() : "");
  return {
    success: true,
    folder: {
      id: "fld1234567890",
      title: folderName,
      username: "casey"
    }
  };
}

function failedFolderCreation(folderTitleRoot: string, suffix: number): any {
  const folderName =
    folderTitleRoot + (suffix > 0 ? " " + suffix.toString() : "");
  return {
    error: {
      code: 400,
      message: "Unable to create folder.",
      details: ["Folder title '" + folderName + "' not available."]
    }
  };
}
