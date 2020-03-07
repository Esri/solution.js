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
 * Provides tests for common functions involving the management of item and group resources.
 */

import * as interfaces from "../src/interfaces";
import * as request from "@esri/arcgis-rest-request";
import * as resourceHelpers from "../src/resourceHelpers";

import * as staticRelatedItemsMocks from "./mocks/staticRelatedItemsMocks";
import * as templates from "./mocks/templates";
import * as utils from "./mocks/utils";
import * as mockItems from "./mocks/agolItems";
import * as fetchMock from "fetch-mock";

// ------------------------------------------------------------------------------------------------------------------ //

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

describe("Module `resourceHelpers`: common functions involving the management of item and group resources", () => {
  const SERVER_INFO = {
    currentVersion: 10.1,
    fullVersion: "10.1",
    soapUrl: "http://server/arcgis/services",
    secureSoapUrl: "https://server/arcgis/services",
    owningSystemUrl: "https://myorg.maps.arcgis.com",
    authInfo: {}
  };

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

  afterEach(() => {
    fetchMock.restore();
  });

  // Blobs are only available in the browser
  if (typeof window !== "undefined") {
    describe("addMetadataFromBlob", () => {
      it("has metadata", done => {
        const blob = utils.getSampleMetadata();
        const itemId = "itm1234567890";
        const updateUrl =
          utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/update";
        const expected = { success: true, id: itemId };

        fetchMock.post(updateUrl, expected);
        resourceHelpers
          .addMetadataFromBlob(blob, itemId, MOCK_USER_SESSION)
          .then((response: any) => {
            expect(response).toEqual(expected);
            const options: fetchMock.MockOptions = fetchMock.lastOptions(
              updateUrl
            );
            const fetchBody = (options as fetchMock.MockResponseObject).body;
            expect(typeof fetchBody).toEqual("object");
            done();
          }, done.fail);
      });
    });

    describe("addResourceFromBlob", () => {
      it("has filename without folder", done => {
        const blob = utils.getSampleMetadata();
        const itemId = "itm1234567890";
        const folder = "";
        const filename = "aFilename.xml";
        const updateUrl =
          utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/addResources";
        const expected = { success: true, id: itemId };

        fetchMock.post(updateUrl, expected);
        resourceHelpers
          .addResourceFromBlob(
            blob,
            itemId,
            folder,
            filename,
            MOCK_USER_SESSION
          )
          .then((response: any) => {
            expect(response).toEqual(expected);
            const options: fetchMock.MockOptions = fetchMock.lastOptions(
              updateUrl
            );
            const fetchBody = (options as fetchMock.MockResponseObject).body;
            expect(typeof fetchBody).toEqual("object");
            const form = fetchBody as FormData;
            expect(form.get("fileName")).toEqual(filename);
            done();
          }, done.fail);
      });

      it("has a filename without an extension", done => {
        const blob = utils.getSampleMetadata();
        const itemId = "itm1234567890";
        const folder = "aFolder";
        const filename = "aFilename";
        const expected = new request.ArcGISAuthError(
          "Filename must have an extension indicating its type"
        );

        resourceHelpers
          .addResourceFromBlob(
            blob,
            itemId,
            folder,
            filename,
            MOCK_USER_SESSION
          )
          .then(
            () => done.fail(),
            (response: any) => {
              expect(response).toEqual(expected);
              done();
            }
          );
      });

      it("has filename with folder", done => {
        const blob = utils.getSampleMetadata();
        const itemId = "itm1234567890";
        const folder = "aFolder";
        const filename = "aFilename.xml";
        const updateUrl =
          utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/addResources";
        const expected = { success: true, id: itemId };

        fetchMock.post(updateUrl, expected);
        resourceHelpers
          .addResourceFromBlob(
            blob,
            itemId,
            folder,
            filename,
            MOCK_USER_SESSION
          )
          .then((response: any) => {
            expect(response).toEqual(expected);
            const options: fetchMock.MockOptions = fetchMock.lastOptions(
              updateUrl
            );
            const fetchBody = (options as fetchMock.MockResponseObject).body;
            expect(typeof fetchBody).toEqual("object");
            const form = fetchBody as FormData;
            expect(form.get("resourcesPrefix")).toEqual(folder);
            expect(form.get("fileName")).toEqual(filename);
            done();
          }, done.fail);
      });
    });

    describe("addThumbnailFromBlob", () => {
      it("gets a thumbnail from a blob", done => {
        const blob = utils.getSampleImage();
        const itemId = "itm1234567890";
        const updateUrl =
          utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/update";
        const expected = { success: true, id: itemId };
        const serverInfoUrl: string =
          "https://myserver/images/thumbnail.png/rest/info";
        const expectedServerInfo = SERVER_INFO;

        fetchMock
          .post(updateUrl, expected)
          .post(serverInfoUrl, expectedServerInfo);
        resourceHelpers
          .addThumbnailFromBlob(blob, itemId, MOCK_USER_SESSION)
          .then((response: any) => {
            expect(response).toEqual(expected);
            const options: fetchMock.MockOptions = fetchMock.lastOptions(
              updateUrl
            );
            const fetchBody = (options as fetchMock.MockResponseObject).body;
            expect(typeof fetchBody).toEqual("object");
            done();
          }, done.fail);
      });
    });

    describe("addThumbnailFromUrl", () => {
      it("gets a thumbnail from a URL", done => {
        const thumbnailUrl = "https://myserver/images/thumbnail.png";
        const itemId = "itm1234567890";
        const updateUrl =
          utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/update";
        const serverInfoUrl: string =
          "https://myserver/images/thumbnail.png/rest/info";
        const expectedServerInfo = SERVER_INFO;

        const expected = { success: true, id: itemId };
        const expectedImage = mockItems.getAnImageResponse();

        fetchMock
          .post(updateUrl, expected)
          .post(serverInfoUrl, expectedServerInfo)
          .post(thumbnailUrl, expectedImage, { sendAsJson: false });
        resourceHelpers
          .addThumbnailFromUrl(thumbnailUrl, itemId, MOCK_USER_SESSION)
          .then((response: any) => {
            expect(response).toEqual(expected);
            const options: fetchMock.MockOptions = fetchMock.lastOptions(
              updateUrl
            );
            const fetchBody = (options as fetchMock.MockResponseObject).body;
            expect(typeof fetchBody).toEqual("object");
            done();
          }, done.fail);
      });
    });

    describe("copyData", () => {
      it("should handle error", done => {
        const source: any = {
          url: undefined,
          authentication: MOCK_USER_SESSION
        };

        const destination: any = {
          itemId: "itm1234567890",
          filename: "filename.txt",
          mimeType: "text/plain",
          authentication: MOCK_USER_SESSION
        };

        fetchMock.post(
          "https://myserver/files/filename.txt/rest/info",
          mockItems.get400Failure()
        );

        resourceHelpers
          .copyData(source, destination)
          .then(() => done.fail, done);
      });
    });

    describe("convertBlobToSupportableResource", () => {
      it("uses blob (file) name if it has one", () => {
        const blob = utils.getSampleTextAsFile("namedBlob.txt");
        expect(blob.name).toEqual("namedBlob.txt");
        expect(blob.type).toEqual("text/plain");

        const convertedBlob: interfaces.IFileMimeType = resourceHelpers.convertBlobToSupportableResource(
          blob,
          "alternateName.txt"
        );
        expect((convertedBlob.blob as File).name).toEqual("namedBlob.txt");
        expect(convertedBlob.filename).toEqual("namedBlob.txt");
        expect(convertedBlob.mimeType).toEqual("text/plain");
      });

      it("uses supplied file name if blob (file) doesn't have one", () => {
        const blob = utils.getSampleTextAsFile("");
        expect(blob.name).toEqual("");
        expect(blob.type).toEqual("text/plain");

        const convertedBlob: interfaces.IFileMimeType = resourceHelpers.convertBlobToSupportableResource(
          blob,
          "alternateName.txt"
        );
        expect((convertedBlob.blob as File).name).toEqual("alternateName.txt");
        expect(convertedBlob.filename).toEqual("alternateName.txt");
        expect(convertedBlob.mimeType).toEqual("text/plain");
      });

      it("uses an empty file name if the blob (file) doesn't have a name and a name is not supplied", () => {
        const blob = utils.getSampleTextAsFile("");
        expect(blob.name).toEqual("");
        expect(blob.type).toEqual("text/plain");

        const convertedBlob: interfaces.IFileMimeType = resourceHelpers.convertBlobToSupportableResource(
          blob
        );
        expect((convertedBlob.blob as File).name).toEqual("");
        expect(convertedBlob.filename).toEqual("");
        expect(convertedBlob.mimeType).toEqual("text/plain");
      });

      it("uses alters blob name if its extension indicates a MIME type not supported by AGO", () => {
        const blob = utils.getSampleTextAsFile("namedBlob.pkg");
        expect(blob.name).toEqual("namedBlob.pkg");
        expect(blob.type).toEqual("text/plain");

        const convertedBlob: interfaces.IFileMimeType = resourceHelpers.convertBlobToSupportableResource(
          blob,
          "alternateName.pkg"
        );
        expect((convertedBlob.blob as File).name).toEqual("namedBlob.pkg.zip");
        expect(convertedBlob.filename).toEqual("namedBlob.pkg");
        expect(convertedBlob.mimeType).toEqual("text/plain");
      });

      it("uses alters blob name if the supplied filename indicates a MIME type not supported by AGO", () => {
        const blob = utils.getSampleTextAsFile("");
        expect(blob.name).toEqual("");
        expect(blob.type).toEqual("text/plain");

        const convertedBlob: interfaces.IFileMimeType = resourceHelpers.convertBlobToSupportableResource(
          blob,
          "alternateName.pkg"
        );
        expect((convertedBlob.blob as File).name).toEqual(
          "alternateName.pkg.zip"
        );
        expect(convertedBlob.filename).toEqual("alternateName.pkg");
        expect(convertedBlob.mimeType).toEqual("text/plain");
      });
    });
  }

  describe("copyFilesFromStorageItem", () => {
    it("handles an empty files list", done => {
      const storageAuthentication = MOCK_USER_SESSION;
      const filePaths: interfaces.IDeployFileCopyPath[] = [] as interfaces.IDeployFileCopyPath[];
      const destinationItemId: string = "itm1234567890";
      const destinationAuthentication = MOCK_USER_SESSION;
      const expected = true;

      resourceHelpers
        .copyFilesFromStorageItem(
          storageAuthentication,
          filePaths,
          destinationItemId,
          destinationAuthentication
        )
        .then((response: any) => {
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });

    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
      it("copies a single data file", done => {
        const storageAuthentication = MOCK_USER_SESSION;
        const filePaths: interfaces.IDeployFileCopyPath[] = [
          {
            type: interfaces.EFileType.Data,
            folder: "storageFolder",
            filename: "storageFilename.png",
            url: "https://myserver/images/resource.png"
          }
        ];
        const destinationItemId: string = "itm1234567890";
        const destinationAuthentication = MOCK_USER_SESSION;
        const serverInfoUrl = "https://myserver/images/resource.png/rest/info";
        const expectedServerInfo = SERVER_INFO;
        const fetchUrl = "https://myserver/images/resource.png";
        const expectedFetch = mockItems.getAnImageResponse();
        const updateUrl =
          utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/update";
        const expectedUpdate = true;

        fetchMock
          .post(utils.PORTAL_SUBSET.restUrl + "/info", expectedServerInfo)
          .post(serverInfoUrl, expectedServerInfo)
          .post(fetchUrl, expectedFetch, { sendAsJson: false })
          .post(updateUrl, { success: true });
        resourceHelpers
          .copyFilesFromStorageItem(
            storageAuthentication,
            filePaths,
            destinationItemId,
            destinationAuthentication
          )
          .then((response: any) => {
            expect(response).toEqual(expectedUpdate);
            done();
          }, done.fail);
      });

      it("copies a single metadata file", done => {
        const storageAuthentication = MOCK_USER_SESSION;
        const filePaths: interfaces.IDeployFileCopyPath[] = [
          {
            type: interfaces.EFileType.Metadata,
            folder: "",
            filename: "",
            url: "https://myserver/doc/metadata.xml" // Metadata uses only URL
          }
        ];
        const destinationItemId: string = "itm1234567890";
        const destinationAuthentication = MOCK_USER_SESSION;
        const serverInfoUrl = "https://myserver/doc/metadata.xml/rest/info";
        const expectedServerInfo = SERVER_INFO;
        const fetchUrl = "https://myserver/doc/metadata.xml";
        const expectedFetch = new Blob(
          ["<meta><value1>a</value1><value2>b</value2></meta>"],
          { type: "text/xml" }
        );
        const updateUrl =
          utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/update";
        const expectedUpdate = true;

        fetchMock
          .post(utils.PORTAL_SUBSET.restUrl + "/info", expectedServerInfo)
          .post(serverInfoUrl, expectedServerInfo)
          .post(fetchUrl, expectedFetch, { sendAsJson: false })
          .post(updateUrl, expectedUpdate);
        resourceHelpers
          .copyFilesFromStorageItem(
            storageAuthentication,
            filePaths,
            destinationItemId,
            destinationAuthentication
          )
          .then((response: any) => {
            expect(response).toEqual(expectedUpdate);
            done();
          }, done.fail);
      });

      it("copies a single resource file", done => {
        const storageAuthentication = MOCK_USER_SESSION;
        const filePaths: interfaces.IDeployFileCopyPath[] = [
          {
            type: interfaces.EFileType.Resource,
            folder: "storageFolder",
            filename: "storageFilename.png",
            url: "https://myserver/images/resource.png"
          }
        ];
        const destinationItemId: string = "itm1234567890";
        const destinationAuthentication = MOCK_USER_SESSION;
        const serverInfoUrl = "https://myserver/images/resource.png/rest/info";
        const expectedServerInfo = SERVER_INFO;
        const fetchUrl = "https://myserver/images/resource.png";
        const expectedFetch = mockItems.getAnImageResponse();
        const updateUrl =
          utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/addResources";
        const expectedUpdate = true;

        fetchMock
          .post("https://www.arcgis.com/sharing/rest/info", expectedServerInfo)
          .post(serverInfoUrl, expectedServerInfo)
          .post(fetchUrl, expectedFetch, { sendAsJson: false })
          .post(updateUrl, expectedUpdate);
        resourceHelpers
          .copyFilesFromStorageItem(
            storageAuthentication,
            filePaths,
            destinationItemId,
            destinationAuthentication
          )
          .then((response: any) => {
            expect(response).toEqual(expectedUpdate);
            done();
          }, done.fail);
      });

      it("copies a single thumbnail file", done => {
        const storageAuthentication = MOCK_USER_SESSION;
        const filePaths: interfaces.IDeployFileCopyPath[] = [
          {
            type: interfaces.EFileType.Thumbnail,
            folder: "",
            filename: "",
            url: "https://myserver/images/thumbnail.png" // Thumbnail uses only URL
          }
        ];
        const destinationItemId: string = "itm1234567890";
        const destinationAuthentication = MOCK_USER_SESSION;
        const updateUrl =
          utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/update";
        const expectedUpdate = true;
        const expectedImage = mockItems.getAnImageResponse();
        const imageUrl: string = "https://myserver/images/thumbnail.png";
        const serverInfoUrl: string =
          "https://myserver/images/thumbnail.png/rest/info";
        const expectedServerInfo = SERVER_INFO;

        fetchMock
          .post(updateUrl, expectedUpdate)
          .post(serverInfoUrl, expectedServerInfo)
          .post("https://www.arcgis.com/sharing/rest/info", SERVER_INFO)
          .post(imageUrl, expectedImage, { sendAsJson: false });
        resourceHelpers
          .copyFilesFromStorageItem(
            storageAuthentication,
            filePaths,
            destinationItemId,
            destinationAuthentication
          )
          .then((response: any) => {
            expect(response).toEqual(expectedUpdate);
            done();
          }, done.fail);
      });
    }
  });

  describe("copyFilesToStorageItem", () => {
    it("empty files list", done => {
      const sourceUserSession = MOCK_USER_SESSION;
      const filePaths: interfaces.ISourceFileCopyPath[] = [] as interfaces.ISourceFileCopyPath[];
      const storageItemId: string = "itm1234567890";
      const storageAuthentication = MOCK_USER_SESSION;
      const expected: string[] = [];

      resourceHelpers
        .copyFilesToStorageItem(
          sourceUserSession,
          filePaths,
          storageItemId,
          storageAuthentication
        )
        .then((response: any) => {
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });

    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
      it("single file to copy", done => {
        const sourceUserSession = MOCK_USER_SESSION;
        const filePaths: interfaces.ISourceFileCopyPath[] = [
          {
            folder: "storageFolder",
            filename: "storageFilename.png",
            url: "https://myserver/images/thumbnail.png"
          }
        ];
        const storageItemId: string = "itm1234567890";
        const storageAuthentication = MOCK_USER_SESSION;
        const serverInfoUrl = "https://myserver/images/thumbnail.png/rest/info";
        const expectedServerInfo = SERVER_INFO;
        const fetchUrl = "https://myserver/images/thumbnail.png";
        const expectedFetch = mockItems.getAnImageResponse();
        const updateUrl =
          utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/addResources";
        const expectedUpdate: string[] = ["storageFolder/storageFilename.png"];

        fetchMock
          .post("https://www.arcgis.com/sharing/rest/info", expectedServerInfo)
          .post(serverInfoUrl, expectedServerInfo)
          .post(fetchUrl, expectedFetch)
          .post(updateUrl, expectedUpdate);
        resourceHelpers
          .copyFilesToStorageItem(
            sourceUserSession,
            filePaths,
            storageItemId,
            storageAuthentication
          )
          .then((response: any) => {
            expect(response).toEqual(expectedUpdate);
            done();
          }, done.fail);
      });
    }
  });

  // Blobs are only available in the browser
  if (typeof window !== "undefined") {
    describe("copyMetadata", () => {
      it("copies metadata.xml", done => {
        const source = {
          url:
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/c6732556e299f1/info/metadata/metadata.xml",
          authentication: MOCK_USER_SESSION
        };
        const destination = {
          itemId: "itm1234567890",
          authentication: MOCK_USER_SESSION
        };

        const fetchUrl =
          utils.PORTAL_SUBSET.restUrl +
          "/content/items/c6732556e299f1/info/metadata/metadata.xml";
        const updateUrl =
          utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/update";
        const expectedFetch = utils.getSampleMetadata();
        const expectedUpdate = { success: true, id: destination.itemId };
        fetchMock
          .post(fetchUrl, expectedFetch, { sendAsJson: false })
          .post(updateUrl, expectedUpdate);

        resourceHelpers
          .copyMetadata(source, destination)
          .then((response: any) => {
            expect(response).toEqual(expectedUpdate);
            done();
          }, done.fail);
      });

      it("handles inability to get metadata.xml", done => {
        const source = {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/c6732556e299f1/info/metadata/metadata.xml",
          authentication: MOCK_USER_SESSION
        };
        const destination = {
          itemId: "itm1234567890",
          authentication: MOCK_USER_SESSION
        };

        const fetchUrl =
          utils.PORTAL_SUBSET.restUrl +
          "/content/items/c6732556e299f1/info/metadata/metadata.xml";
        const expectedFetch = {
          error: {
            code: 400,
            messageCode: "CONT_0036",
            message: "Item info file does not exist or is inaccessible.",
            details: ["Error getting Item Info from DataStore"]
          }
        };
        fetchMock.post(fetchUrl, expectedFetch);
        resourceHelpers.copyMetadata(source, destination).then(response => {
          response.success ? done.fail() : done();
        }, done);
      });

      it("handles inability to get metadata.xml, hard error", done => {
        const source = {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/c6732556e299f1/info/metadata/metadata.xml",
          authentication: MOCK_USER_SESSION
        };
        const destination = {
          itemId: "itm1234567890",
          authentication: MOCK_USER_SESSION
        };

        const fetchUrl =
          utils.PORTAL_SUBSET.restUrl +
          "/content/items/c6732556e299f1/info/metadata/metadata.xml";
        fetchMock.post(fetchUrl, 500);
        resourceHelpers.copyMetadata(source, destination).then(response => {
          response.success ? done.fail() : done();
        }, done);
      });

      it("handles inability to store metadata.xml", done => {
        const source = {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/c6732556e299f1/info/metadata/metadata.xml",
          authentication: MOCK_USER_SESSION
        };
        const destination = {
          itemId: "itm1234567890",
          authentication: MOCK_USER_SESSION
        };

        const fetchUrl =
          utils.PORTAL_SUBSET.restUrl +
          "/content/items/c6732556e299f1/info/metadata/metadata.xml";
        const updateUrl =
          utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/update";
        const expectedFetch = utils.getSampleMetadata();
        const expectedUpdate = { success: false, id: destination.itemId };
        fetchMock
          .post(fetchUrl, expectedFetch, { sendAsJson: false })
          .post(updateUrl, expectedUpdate);
        resourceHelpers.copyMetadata(source, destination).then(
          response => {
            response.success ? done.fail() : done();
          },
          () => done()
        );
      });

      it("handles inability to store metadata.xml, hard error", done => {
        const source = {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/c6732556e299f1/info/metadata/metadata.xml",
          authentication: MOCK_USER_SESSION
        };
        const destination = {
          itemId: "itm1234567890",
          authentication: MOCK_USER_SESSION
        };

        const fetchUrl =
          utils.PORTAL_SUBSET.restUrl +
          "/content/items/c6732556e299f1/info/metadata/metadata.xml";
        const updateUrl =
          utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/update";
        const expectedFetch = utils.getSampleMetadata();
        const expectedUpdate = 500;
        fetchMock
          .post(fetchUrl, expectedFetch, { sendAsJson: false })
          .post(updateUrl, expectedUpdate);
        resourceHelpers.copyMetadata(source, destination).then(
          response => {
            response.success ? done.fail() : done();
          },
          () => done()
        );
      });
    });

    describe("copyResource", () => {
      it("copies resource", done => {
        const source = {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/c6732556e299f1/resources/image.png",
          authentication: MOCK_USER_SESSION
        };
        const destination = {
          itemId: "itm1234567890",
          folder: "storageFolder",
          filename: "storageFilename.png",
          authentication: MOCK_USER_SESSION
        };
        const fetchUrl =
          utils.PORTAL_SUBSET.restUrl +
          "/content/items/c6732556e299f1/resources/image.png";
        const updateUrl =
          utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/addResources";
        const expected = { success: true, id: destination.itemId };

        fetchMock
          .post(fetchUrl, utils.getSampleImage(), { sendAsJson: false })
          .post(updateUrl, expected);
        resourceHelpers
          .copyResource(source, destination)
          .then((response: any) => {
            expect(response).toEqual(expected);
            done();
          }, done.fail);
      });
    });

    it("handles inexplicable response", done => {
      const source = {
        url:
          utils.PORTAL_SUBSET.restUrl +
          "/content/items/c6732556e299f1/resources/image.png",
        authentication: MOCK_USER_SESSION
      };
      const destination = {
        itemId: "itm1234567890",
        folder: "storageFolder",
        filename: "storageFilename.png",
        authentication: MOCK_USER_SESSION
      };
      const fetchUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/items/c6732556e299f1/resources/image.png";

      fetchMock.post(
        fetchUrl,
        new Blob(["[1, 2, 3, 4, ]"], { type: "text/plain" }),
        { sendAsJson: false }
      );
      resourceHelpers.copyResource(source, destination).then(done.fail, done);
    });

    it("handles inability to get resource", done => {
      const source = {
        url:
          utils.PORTAL_SUBSET.restUrl +
          "/content/items/c6732556e299f1/resources/image.png",
        authentication: MOCK_USER_SESSION
      };
      const destination = {
        itemId: "itm1234567890",
        folder: "storageFolder",
        filename: "storageFilename.png",
        authentication: MOCK_USER_SESSION
      };
      const fetchUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/items/c6732556e299f1/resources/image.png";

      fetchMock.post(fetchUrl, 500);
      resourceHelpers.copyResource(source, destination).then(done.fail, done);
    });

    it("handles inability to copy resource, hard error", done => {
      const source = {
        url:
          utils.PORTAL_SUBSET.restUrl +
          "/content/items/c6732556e299f1/resources/image.png",
        authentication: MOCK_USER_SESSION
      };
      const destination = {
        itemId: "itm1234567890",
        folder: "storageFolder",
        filename: "storageFilename.png",
        authentication: MOCK_USER_SESSION
      };
      const fetchUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/items/c6732556e299f1/resources/image.png";
      const updateUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/itm1234567890/addResources";
      const expected = 500;

      fetchMock
        .post(fetchUrl, utils.getSampleImage(), { sendAsJson: false })
        .post(updateUrl, expected);
      resourceHelpers.copyResource(source, destination).then(done.fail, done);
    });
  }

  describe("generateGroupFilePaths", () => {
    it("generates paths for a group thumbnail", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const thumbnailUrlPart = "thumbnail.png";
      const expected: interfaces.ISourceFileCopyPath[] = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/community/groups/8f7ec78195d0479784036387d522e29f/info/thumbnail.png",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png"
        }
      ];

      const actual = resourceHelpers.generateGroupFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart
      );
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("handles the absence of a group thumbnail", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const thumbnailUrlPart = "";
      const expected: interfaces.IDeployFileCopyPath[] = [];

      const actual = resourceHelpers.generateGroupFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart
      );
      expect(actual.length).toEqual(0);
      expect(actual).toEqual(expected);
    });
  });

  describe("generateInfoStorageFilename", () => {
    it("generates storage name for an info file", () => {
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const filename = "form.info";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f_info",
        filename
      };

      const actual = resourceHelpers.generateInfoStorageFilename(
        itemId,
        filename
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("generateMetadataStorageFilename", () => {
    it("generates storage name for metadata", () => {
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
        filename: "metadata.xml"
      };

      const actual = resourceHelpers.generateMetadataStorageFilename(itemId);
      expect(actual).toEqual(expected);
    });
  });

  describe("generateResourceFilenameFromStorage", () => {
    it("handles top-level image file", () => {
      const storageResourceFilename =
        "8f7ec78195d0479784036387d522e29f/gtnp2.jpg";
      const expected: interfaces.IDeployFilename = {
        type: interfaces.EFileType.Resource,
        folder: "",
        filename: "gtnp2.jpg"
      };

      const actual = resourceHelpers.generateResourceFilenameFromStorage(
        storageResourceFilename
      );
      expect(actual).toEqual(expected);
    });

    it("handles image file in folder", () => {
      const storageResourceFilename =
        "8f7ec78195d0479784036387d522e29f_aFolder/git_merge.png";
      const expected: interfaces.IDeployFilename = {
        type: interfaces.EFileType.Resource,
        folder: "aFolder",
        filename: "git_merge.png"
      };

      const actual = resourceHelpers.generateResourceFilenameFromStorage(
        storageResourceFilename
      );
      expect(actual).toEqual(expected);
    });

    it("handles metadata file", () => {
      const storageResourceFilename =
        "8f7ec78195d0479784036387d522e29f_info_metadata/metadata.xml";
      const expected: interfaces.IDeployFilename = {
        type: interfaces.EFileType.Metadata,
        folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
        filename: "metadata.xml"
      };

      const actual = resourceHelpers.generateResourceFilenameFromStorage(
        storageResourceFilename
      );
      expect(actual).toEqual(expected);
    });

    it("handles thumbnail", () => {
      const storageResourceFilename =
        "8f7ec78195d0479784036387d522e29f_info_thumbnail/thumbnail.png";
      const expected: interfaces.IDeployFilename = {
        type: interfaces.EFileType.Thumbnail,
        folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
        filename: "thumbnail.png"
      };

      const actual = resourceHelpers.generateResourceFilenameFromStorage(
        storageResourceFilename
      );
      expect(actual).toEqual(expected);
    });

    it("handles data file supported by AGO for resources", () => {
      const storageResourceFilename =
        "8f7ec78195d0479784036387d522e29f_info_data/data.zip";
      const expected: interfaces.IDeployFilename = {
        type: interfaces.EFileType.Data,
        folder: "8f7ec78195d0479784036387d522e29f_info_data",
        filename: "data.zip"
      };

      const actual = resourceHelpers.generateResourceFilenameFromStorage(
        storageResourceFilename
      );
      expect(actual).toEqual(expected);
    });

    it("handles data file unsupported by AGO for resources and thus masquerading as a ZIP file", () => {
      const storageResourceFilename =
        "8f7ec78195d0479784036387d522e29f_info_dataz/data.pkg.zip";
      const expected: interfaces.IDeployFilename = {
        type: interfaces.EFileType.Data,
        folder: "8f7ec78195d0479784036387d522e29f_info_dataz",
        filename: "data.pkg"
      };

      const actual = resourceHelpers.generateResourceFilenameFromStorage(
        storageResourceFilename
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("generateResourceStorageFilename", () => {
    it("top-level", () => {
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceFilename = "gtnp2.jpg";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f",
        filename: "gtnp2.jpg"
      };

      const actual = resourceHelpers.generateResourceStorageFilename(
        itemId,
        sourceResourceFilename
      );
      expect(actual).toEqual(expected);
    });

    it("in folder", () => {
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceFilename = "aFolder/git_merge.png";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f_aFolder",
        filename: "git_merge.png"
      };

      const actual = resourceHelpers.generateResourceStorageFilename(
        itemId,
        sourceResourceFilename
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("generateSourceFilePaths", () => {
    it("without resources", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const thumbnailUrlPart = "thumbnail/thumbnail.png";
      const resourceFilenames: string[] = [];
      const expected: interfaces.ISourceFileCopyPath[] = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml"
        },
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png"
        }
      ];

      const actual = resourceHelpers.generateSourceFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames
      );
      expect(actual.length).toEqual(2);
      expect(actual).toEqual(expected);
    });

    it("with one resource at top level", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const thumbnailUrlPart = "thumbnail/thumbnail.png";
      const resourceFilenames = ["gtnp2.jpg"];
      const expected: interfaces.ISourceFileCopyPath[] = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/resources/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f",
          filename: "gtnp2.jpg"
        },
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml"
        },
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png"
        }
      ];

      const actual = resourceHelpers.generateSourceFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames
      );
      expect(actual.length).toEqual(3);
      expect(actual).toEqual(expected);
    });

    it("with one resource in folder", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const thumbnailUrlPart = "thumbnail/thumbnail.png";
      const resourceFilenames = ["myFolder/gtnp2.jpg"];
      const expected: interfaces.ISourceFileCopyPath[] = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/resources/myFolder/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f_myFolder",
          filename: "gtnp2.jpg"
        },
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml"
        },
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png"
        }
      ];

      const actual = resourceHelpers.generateSourceFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames
      );
      expect(actual.length).toEqual(3);
      expect(actual).toEqual(expected);
    });

    it("with multiple resources", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const thumbnailUrlPart = "thumbnail/thumbnail.png";
      const resourceFilenames = ["gtnp2.jpg", "myFolder/gtnp2.jpg"];
      const expected: interfaces.ISourceFileCopyPath[] = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/resources/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f",
          filename: "gtnp2.jpg"
        },
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/resources/myFolder/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f_myFolder",
          filename: "gtnp2.jpg"
        },
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml"
        },
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png"
        }
      ];

      const actual = resourceHelpers.generateSourceFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames
      );
      expect(actual.length).toEqual(4);
      expect(actual).toEqual(expected);
    });
  });

  describe("generateSourceFilePaths", () => {
    it("generates the file paths for the three form info files", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const itemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const expected = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/info/form.json",
          folder: "03744d6b7a9b4b76bfd45dc2d1e642a5_info",
          filename: "form.json"
        },
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/info/forminfo.json",
          folder: "03744d6b7a9b4b76bfd45dc2d1e642a5_info",
          filename: "forminfo.json"
        },
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/info/form.webform",
          folder: "03744d6b7a9b4b76bfd45dc2d1e642a5_info",
          filename: "form.webform.json.zip"
        }
      ];

      const actual = resourceHelpers.generateSourceFormFilePaths(
        portalSharingUrl,
        itemId
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("generateSourceMetadataUrl", () => {
    it("item", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const itemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const expected =
        utils.PORTAL_SUBSET.restUrl +
        "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/info/metadata/metadata.xml";

      const actual = resourceHelpers.generateSourceMetadataUrl(
        portalSharingUrl,
        itemId
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("generateSourceResourceUrl", () => {
    it("top-level", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceFilename = "gtnp2.jpg";
      const expected =
        utils.PORTAL_SUBSET.restUrl +
        "/content/items/8f7ec78195d0479784036387d522e29f/resources/gtnp2.jpg";

      const actual = resourceHelpers.generateSourceResourceUrl(
        portalSharingUrl,
        itemId,
        sourceResourceFilename
      );
      expect(actual).toEqual(expected);
    });

    it("in folder", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceFilename = "aFolder/git_merge.png";
      const expected =
        utils.PORTAL_SUBSET.restUrl +
        "/content/items/8f7ec78195d0479784036387d522e29f/resources/aFolder/git_merge.png";

      const actual = resourceHelpers.generateSourceResourceUrl(
        portalSharingUrl,
        itemId,
        sourceResourceFilename
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("generateSourceThumbnailUrl", () => {
    it("item", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const itemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const thumbnailUrlPart = "thumbnail/thumbnail.png";
      const expected =
        utils.PORTAL_SUBSET.restUrl +
        "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/info/thumbnail/thumbnail.png";

      const actual = resourceHelpers.generateSourceThumbnailUrl(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart
      );
      expect(actual).toEqual(expected);
    });

    it("group", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const itemId = "b6430e0ca08d4b1380f3a5908985da3c";
      const thumbnailUrlPart = "thumbnail1553812391084.png";
      const isGroup = true;
      const expected =
        utils.PORTAL_SUBSET.restUrl +
        "/community/groups/b6430e0ca08d4b1380f3a5908985da3c/info/thumbnail1553812391084.png";

      const actual = resourceHelpers.generateSourceThumbnailUrl(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        isGroup
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("generateStorageFilePaths", () => {
    it("generates paths without resources", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = [];
      const expected: interfaces.IDeployFileCopyPath[] = [];

      const actual = resourceHelpers.generateStorageFilePaths(
        portalSharingUrl,
        storageItemId,
        resourceFilenames
      );
      expect(actual.length).toEqual(0);
      expect(actual).toEqual(expected);
    });

    it("generates paths with a single top-level file resource", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = [
        "8f7ec78195d0479784036387d522e29f/gtnp2.jpg"
      ];
      const expected: interfaces.IDeployFileCopyPath[] = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f/gtnp2.jpg",
          folder: "",
          filename: "gtnp2.jpg",
          type: interfaces.EFileType.Resource
        }
      ];

      const actual = resourceHelpers.generateStorageFilePaths(
        portalSharingUrl,
        storageItemId,
        resourceFilenames
      );
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("generates paths with a single file resource in a folder", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = [
        "8f7ec78195d0479784036387d522e29f_myFolder/gtnp2.jpg"
      ];
      const expected: interfaces.IDeployFileCopyPath[] = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f_myFolder/gtnp2.jpg",
          folder: "myFolder",
          filename: "gtnp2.jpg",
          type: interfaces.EFileType.Resource
        }
      ];

      const actual = resourceHelpers.generateStorageFilePaths(
        portalSharingUrl,
        storageItemId,
        resourceFilenames
      );
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("generates paths with metadata", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = [
        "8f7ec78195d0479784036387d522e29f_info_metadata/metadata.xml"
      ];
      const expected: interfaces.IDeployFileCopyPath[] = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f_info_metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml",
          type: interfaces.EFileType.Metadata
        }
      ];

      const actual = resourceHelpers.generateStorageFilePaths(
        portalSharingUrl,
        storageItemId,
        resourceFilenames
      );
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("generates paths with a thumbnail", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = [
        "8f7ec78195d0479784036387d522e29f_info_thumbnail/thumbnail.png"
      ];
      const expected: interfaces.IDeployFileCopyPath[] = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f_info_thumbnail/thumbnail.png",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png",
          type: interfaces.EFileType.Thumbnail
        }
      ];

      const actual = resourceHelpers.generateStorageFilePaths(
        portalSharingUrl,
        storageItemId,
        resourceFilenames
      );
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("handles the absence of resource filenames", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames = null as string[];
      const expected: interfaces.IDeployFileCopyPath[] = [];

      const actual = resourceHelpers.generateStorageFilePaths(
        portalSharingUrl,
        storageItemId,
        resourceFilenames
      );
      expect(actual.length).toEqual(0);
      expect(actual).toEqual(expected);
    });
  });

  describe("generateThumbnailStorageFilename", () => {
    it("without subpath", () => {
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceFilename = "thumbnail1553812391084.png";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
        filename: "thumbnail1553812391084.png"
      };

      const actual = resourceHelpers.generateThumbnailStorageFilename(
        itemId,
        sourceResourceFilename
      );
      expect(actual).toEqual(expected);
    });

    it("with subpath", () => {
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceFilename = "thumbnail/thumbnail.png";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
        filename: "thumbnail.png"
      };

      const actual = resourceHelpers.generateThumbnailStorageFilename(
        itemId,
        sourceResourceFilename
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("isSupportedFileType", () => {
    it("recognizes supported file types for resource", () => {
      const fileTypes =
        ".json|.xml|.txt|.png|.pbf|.zip|.jpeg|.jpg|.gif|.bmp|.gz|.svg|.svgz|.geodatabase";
      fileTypes.split("|").forEach(fileType =>
        expect(resourceHelpers.isSupportedFileType(fileType))
          .withContext(fileType + "is not supported")
          .toBeTruthy()
      );
    });

    it("recognizes unsupported file types for resource", () => {
      const fileTypes =
        ".bin|.cpg|.css|.csv|.dbf|.doc|.docx|.htm|.html|.ico|.jar|.js|.mxd|.mxs|.pdf|.ppt|.pptx" +
        "|.prj|.rtf|.shp|.tar|.tif|.tiff|.ts|.ttf|.vsd|.wav|.xls|.xlsx";
      fileTypes.split("|").forEach(fileType =>
        expect(resourceHelpers.isSupportedFileType(fileType))
          .withContext(fileType + "is supported")
          .toBeFalsy()
      );
    });
  });

  if (typeof window !== "undefined") {
    describe("storeItemResources", () => {
      it("can update item resources for quick capture project", done => {
        const itemTemplate: interfaces.IItemTemplate = templates.getItemTemplateSkeleton();
        itemTemplate.item = mockItems.getAGOLItem("QuickCapture Project", null);
        itemTemplate.itemId = itemTemplate.item.id;
        const solutionItemId = "ee67658b2a98450cba051fd001463df0";

        const resources: any = {
          total: 1,
          start: 1,
          num: 1,
          nextStart: -1,
          resources: [
            {
              resource: "qc.project.json",
              created: 1579127879000,
              size: 29882,
              access: "inherit",
              type: "application/json"
            }
          ]
        };

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/qck1234567890/resources",
            resources
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/qck1234567890/info/metadata/metadata.xml",
            mockItems.get500Failure()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/qck1234567890/info/thumbnail/ago_downloaded.png",
            utils.getSampleImage(),
            { sendAsJson: false }
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/qck1234567890/resources/qc.project.json",
            {}
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/ee67658b2a98450cba051fd001463df0/addResources",
            utils.getSuccessResponse()
          );

        const expected: string[] = [
          "qck1234567890/qc.project.json",
          "qck1234567890_info_thumbnail/ago_downloaded.png"
        ];

        resourceHelpers
          .storeItemResources(itemTemplate, solutionItemId, MOCK_USER_SESSION)
          .then(actual => {
            expect(actual).toEqual(expected);
            done();
          }, done.fail);
      });

      it("can update item resources for web map", done => {
        const itemTemplate: interfaces.IItemTemplate = templates.getItemTemplateSkeleton();
        itemTemplate.item = mockItems.getAGOLItem("Web Map", null);
        itemTemplate.itemId = itemTemplate.item.id;
        itemTemplate.item.thumbnail = "thumbnail/banner.png";
        const solutionItemId = "ee67658b2a98450cba051fd001463df0";

        const expectedFetch = mockItems.getAnImageResponse();

        const resources: any = {
          total: 1,
          start: 1,
          num: 1,
          nextStart: -1,
          resources: [
            {
              resource: "image/banner.png",
              created: 1522711362000,
              size: 56945
            }
          ]
        };

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemTemplate.itemId +
              "/resources",
            resources
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemTemplate.itemId +
              "/resources/image/banner.png",
            expectedFetch,
            { sendAsJson: false }
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/" +
              MOCK_USER_SESSION.username +
              "/items/" +
              solutionItemId +
              "/addResources",
            {
              success: true,
              itemId: solutionItemId,
              owner: MOCK_USER_SESSION.username,
              folder: null
            }
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemTemplate.itemId +
              "/info/thumbnail/banner.png",
            expectedFetch,
            { sendAsJson: false }
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemTemplate.itemId +
              "/data",
            mockItems.get500Failure()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemTemplate.itemId +
              "/info/metadata/metadata.xml",
            mockItems.get400Failure()
          );
        staticRelatedItemsMocks.fetchMockRelatedItems("map1234567890", {
          total: 0,
          relatedItems: []
        });

        const expected: string[] = [
          "map1234567890_image/banner.png",
          "map1234567890_info_thumbnail/banner.png"
        ];

        resourceHelpers
          .storeItemResources(itemTemplate, solutionItemId, MOCK_USER_SESSION)
          .then(actual => {
            expect(actual).toEqual(expected);
            done();
          }, done.fail);
      });

      it("can store item resources for a form", done => {
        const itemTemplate: interfaces.IItemTemplate = templates.getItemTemplate(
          "Form"
        );
        itemTemplate.item.thumbnail = "thumbnail/banner.png";
        const solutionItemId = "ee67658b2a98450cba051fd001463df0";

        const resources: any = {
          total: 0,
          start: 1,
          num: 0,
          nextStart: -1,
          resources: []
        };

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemTemplate.itemId +
              "/resources",
            resources
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/" +
              MOCK_USER_SESSION.username +
              "/items/" +
              solutionItemId +
              "/addResources",
            {
              success: true,
              itemId: solutionItemId,
              owner: MOCK_USER_SESSION.username,
              folder: null
            }
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemTemplate.itemId +
              "/data",
            mockItems.get500Failure()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemTemplate.itemId +
              "/info/thumbnail/banner.png",
            utils.getSampleImage(),
            { sendAsJson: false }
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemTemplate.itemId +
              "/info/metadata/metadata.xml",
            mockItems.get400Failure()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemTemplate.itemId +
              "/info/form.json",
            utils.getSampleJsonAsFile("form.json")
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemTemplate.itemId +
              "/info/forminfo.json",
            utils.getSampleJsonAsFile("forminfo.json")
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemTemplate.itemId +
              "/info/form.webform",
            utils.getSampleJsonAsFile("form.webform")
          );

        staticRelatedItemsMocks.fetchMockRelatedItems(itemTemplate.itemId, {
          total: 0,
          relatedItems: []
        });

        const expected: string[] = ["frm1234567890_info_thumbnail/banner.png"];

        resourceHelpers
          .storeItemResources(itemTemplate, solutionItemId, MOCK_USER_SESSION)
          .then(actual => {
            expect(actual).toEqual(expected);
            done();
          }, done.fail);
      });

      it("can handle error on add resources", done => {
        const itemTemplate: interfaces.IItemTemplate = templates.getItemTemplateSkeleton();
        itemTemplate.item = mockItems.getAGOLItem("Web Map", null);
        itemTemplate.itemId = itemTemplate.item.id;
        itemTemplate.item.thumbnail = "thumbnail/banner.png";
        const solutionItemId = "ee67658b2a98450cba051fd001463df0";

        const expectedFetch = mockItems.getAnImageResponse();

        const resources: any = {
          total: 1,
          start: 1,
          num: 1,
          nextStart: -1,
          resources: [
            {
              resource: "image/banner.png",
              created: 1522711362000,
              size: 56945
            }
          ]
        };

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemTemplate.itemId +
              "/resources",
            resources
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemTemplate.itemId +
              "/resources/image/banner.png",
            expectedFetch,
            { sendAsJson: false }
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/" +
              MOCK_USER_SESSION.username +
              "/items/" +
              solutionItemId +
              "/addResources",
            mockItems.get500Failure()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemTemplate.itemId +
              "/info/thumbnail/banner.png",
            expectedFetch,
            { sendAsJson: false }
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemTemplate.itemId +
              "/data",
            mockItems.get500Failure()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemTemplate.itemId +
              "/info/metadata/metadata.xml",
            mockItems.get400Failure()
          );

        resourceHelpers
          .storeItemResources(itemTemplate, solutionItemId, MOCK_USER_SESSION)
          .then(actual => {
            expect(actual).toEqual([]);
            done();
          }, done.fail);
      });
    });
  }
});
