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
import * as addResourceFromBlobModule from "../src/resources/add-resource-from-blob";

// ------------------------------------------------------------------------------------------------------------------ //

let MOCK_USER_SESSION: interfaces.ArcGISIdentityManager;

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

  describe("addResourceFromBlob", () => {
    it("has filename without folder", done => {
      const blob = utils.getSampleMetadataAsBlob();
      const itemId = "itm1234567890";
      const folder = "";
      const filename = "aFilename.xml";
      const updateUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/itm1234567890/addResources";
      const expected = { success: true, id: itemId };

      fetchMock.post(updateUrl, expected);
      addResourceFromBlobModule
        .addResourceFromBlob(blob, itemId, folder, filename, MOCK_USER_SESSION)
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
      const blob = utils.getSampleMetadataAsBlob();
      const itemId = "itm1234567890";
      const folder = "aFolder";
      const filename = "aFilename";
      const expected = new request.ArcGISAuthError(
        "Filename must have an extension indicating its type"
      );

      addResourceFromBlobModule
        .addResourceFromBlob(blob, itemId, folder, filename, MOCK_USER_SESSION)
        .then(
          () => done.fail(),
          (response: any) => {
            expect(response).toEqual(expected);
            done();
          }
        );
    });

    it("has filename with folder", done => {
      const blob = utils.getSampleMetadataAsBlob();
      const itemId = "itm1234567890";
      const folder = "aFolder";
      const filename = "aFilename.xml";
      const updateUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/itm1234567890/addResources";
      const expected = { success: true, id: itemId };

      fetchMock.post(updateUrl, expected);
      addResourceFromBlobModule
        .addResourceFromBlob(blob, itemId, folder, filename, MOCK_USER_SESSION)
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
    it("gets an item's thumbnail from a blob", done => {
      const blob = utils.getSampleImageAsBlob();
      const itemId = "itm1234567890";
      const updateUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/itm1234567890/update";
      const expected = utils.getSuccessResponse({ id: itemId });
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

    it("gets a group's thumbnail from a blob", done => {
      const blob = utils.getSampleImageAsBlob();
      const itemId = "grp1234567890";
      const updateUrl =
        utils.PORTAL_SUBSET.restUrl + "/community/groups/grp1234567890/update";
      const expected = utils.getSuccessResponse({ id: itemId });
      const serverInfoUrl: string =
        "https://myserver/images/thumbnail.png/rest/info";
      const expectedServerInfo = SERVER_INFO;

      fetchMock
        .post(updateUrl, expected)
        .post(serverInfoUrl, expectedServerInfo);
      resourceHelpers
        .addThumbnailFromBlob(blob, itemId, MOCK_USER_SESSION, true)
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

  describe("convertBlobToSupportableResource", () => {
    it("uses blob (file) name if it has one", () => {
      const blob = utils.getSampleTextAsFile("namedBlob.txt");
      expect(blob.name).toEqual("namedBlob.txt");
      expect(blob.type).toEqual("text/plain");

      const convertedBlob: interfaces.IFileMimeTyped = resourceHelpers.convertBlobToSupportableResource(
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

      const convertedBlob: interfaces.IFileMimeTyped = resourceHelpers.convertBlobToSupportableResource(
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

      const convertedBlob: interfaces.IFileMimeTyped = resourceHelpers.convertBlobToSupportableResource(
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

      const convertedBlob: interfaces.IFileMimeTyped = resourceHelpers.convertBlobToSupportableResource(
        blob,
        "alternateName.pkg"
      );
      expect((convertedBlob.blob as File).name).toEqual("namedBlob.pkg.zip");
      expect(convertedBlob.filename).toEqual("namedBlob.pkg");
      expect(convertedBlob.mimeType).toEqual("text/plain");
    });

    it("uses alternate blob name if the supplied filename indicates a MIME type not supported by AGO", () => {
      const blob = utils.getSampleTextAsFile("");
      expect(blob.name).toEqual("");
      expect(blob.type).toEqual("text/plain");

      const convertedBlob: interfaces.IFileMimeTyped = resourceHelpers.convertBlobToSupportableResource(
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
          null,
          destinationItemId,
          destinationAuthentication
        )
        .then((response: any) => {
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });

    it("remaps hub files", done => {
      const storageAuthentication = MOCK_USER_SESSION;
      const filePaths: interfaces.IDeployFileCopyPath[] = [
        {
          type: interfaces.EFileType.Resource,
          folder: "",
          filename: "bc3-storageFilename.png",
          url: "https://myserver/images/bc3-storageFilename.png"
        }
      ];
      const tmpl = { itemId: "bc3" };
      // Spies
      const resourceHelpersSpy = spyOn(
        resourceHelpers,
        "copyFilesFromStorageItem"
      ).and.resolveTo(true);
      resourceHelpers
        .copyFilesFromStorageItem(
          storageAuthentication,
          filePaths,
          null,
          "3ef",
          storageAuthentication,
          tmpl
        )
        .then(resp => {
          expect(resourceHelpersSpy.calls.count()).toBe(
            1,
            "should call copyFilesFromStorageItem once"
          );
          const secondArg = resourceHelpersSpy.calls.argsFor(0)[1];
          expect(secondArg[0].url).toBe(
            filePaths[0].url,
            "url 0 should be the same"
          );
          done();
        })
        .catch(ex => {
          done.fail(ex);
        });
    });

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
      const expectedFetch = utils.getSampleImageAsBlob();
      const updateUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/itm1234567890/update";
      const expectedUpdate = true;

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse()
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/info", expectedServerInfo)
        .post(serverInfoUrl, expectedServerInfo)
        .post(fetchUrl, expectedFetch, { sendAsJson: false })
        .post(updateUrl, { success: true });
      resourceHelpers
        .copyFilesFromStorageItem(
          storageAuthentication,
          filePaths,
          null,
          destinationItemId,
          destinationAuthentication
        )
        .then((response: any) => {
          expect(response).toEqual(expectedUpdate);
          done();
        }, done.fail);
    });

    it("copies a single data file using list of MIME types", done => {
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
      const mimeTypes: interfaces.IMimeTypes = {
        "storageFilename.png": "image/png"
      };
      const serverInfoUrl = "https://myserver/images/resource.png/rest/info";
      const expectedServerInfo = SERVER_INFO;
      const fetchUrl = "https://myserver/images/resource.png";
      const expectedFetch = utils.getSampleImageAsBlob();
      const updateUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/itm1234567890/update";
      const expectedUpdate = true;

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse()
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/info", expectedServerInfo)
        .post(serverInfoUrl, expectedServerInfo)
        .post(fetchUrl, expectedFetch, { sendAsJson: false })
        .post(updateUrl, { success: true });
      resourceHelpers
        .copyFilesFromStorageItem(
          storageAuthentication,
          filePaths,
          null,
          destinationItemId,
          destinationAuthentication,
          { properties: mimeTypes }
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
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse()
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/info", expectedServerInfo)
        .post(serverInfoUrl, expectedServerInfo)
        .post(fetchUrl, expectedFetch, { sendAsJson: false })
        .post(updateUrl, expectedUpdate);
      resourceHelpers
        .copyFilesFromStorageItem(
          storageAuthentication,
          filePaths,
          null,
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
      const expectedFetch = utils.getSampleImageAsBlob();
      const updateUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/itm1234567890/addResources";
      const expectedUpdate = true;

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse()
        )
        .post("https://www.arcgis.com/sharing/rest/info", expectedServerInfo)
        .post(serverInfoUrl, expectedServerInfo)
        .post(fetchUrl, expectedFetch, { sendAsJson: false })
        .post(updateUrl, expectedUpdate);
      resourceHelpers
        .copyFilesFromStorageItem(
          storageAuthentication,
          filePaths,
          null,
          destinationItemId,
          destinationAuthentication
        )
        .then((response: any) => {
          expect(response).toEqual(expectedUpdate);
          done();
        }, done.fail);
    });

    it("copies multiple resource files", done => {
      const storageAuthentication = MOCK_USER_SESSION;
      const template = {
        itemId: "abc"
      };
      const filePaths: interfaces.IDeployFileCopyPath[] = [
        {
          type: interfaces.EFileType.Resource,
          folder: "storageFolder1",
          filename: "storageFilename1.png",
          url: "https://myserver/images/resource.png"
        },
        {
          type: interfaces.EFileType.Resource,
          folder: "storageFolder2",
          filename: "storageFilename2.png",
          url: "https://myserver/images/resource.png"
        },
        {
          type: interfaces.EFileType.Resource,
          folder: "",
          filename: template.itemId + "-storageFilename2.png",
          url: "https://myserver/images/resource.png"
        }
      ];
      const destinationItemId: string = "itm1234567890";
      const destinationAuthentication = MOCK_USER_SESSION;
      const serverInfoUrl = "https://myserver/images/resource.png/rest/info";
      const expectedServerInfo = SERVER_INFO;
      const fetchUrl = "https://myserver/images/resource.png";
      const expectedFetch = utils.getSampleImageAsBlob();
      const updateUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/itm1234567890/addResources";
      const expectedUpdate = true;

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse()
        )
        .post("https://www.arcgis.com/sharing/rest/info", expectedServerInfo)
        .post(serverInfoUrl, expectedServerInfo)
        .post(fetchUrl, expectedFetch, { sendAsJson: false })
        .post(updateUrl, expectedUpdate);
      resourceHelpers
        .copyFilesFromStorageItem(
          storageAuthentication,
          filePaths,
          null,
          destinationItemId,
          destinationAuthentication,
          template
        )
        .then((response: any) => {
          expect(response).toEqual(expectedUpdate);
          done();
        }, done.fail);
    });

    it("does not copy thumbnail files", done => {
      const storageAuthentication = MOCK_USER_SESSION;
      const filePaths: interfaces.IDeployFileCopyPath[] = [
        {
          type: interfaces.EFileType.Thumbnail,
          folder: "",
          filename: "",
          url: utils.PORTAL_SUBSET.restUrl + "/images/thumbnail.png" // Thumbnail uses only URL
        }
      ];
      const destinationItemId: string = "itm1234567890";
      const destinationAuthentication = MOCK_USER_SESSION;

      resourceHelpers
        .copyFilesFromStorageItem(
          storageAuthentication,
          filePaths,
          null,
          destinationItemId,
          destinationAuthentication
        )
        .then((response: any) => {
          expect(response).toBeTruthy();
          done();
        }, done.fail);
    });
  });

  describe("copyFilesToStorageItem", () => {
    it("empty files list", done => {
      const sourceUserSession = MOCK_USER_SESSION;
      const filePaths: interfaces.ISourceFile[] = [] as interfaces.ISourceFile[];
      const storageItemId: string = "itm1234567890";
      const storageAuthentication = MOCK_USER_SESSION;
      const expected: string[] = [];

      resourceHelpers
        .copyFilesToStorageItem(filePaths, storageItemId, storageAuthentication)
        .then((response: any) => {
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });

    it("single file to copy", done => {
      const sourceUserSession = MOCK_USER_SESSION;
      const files: interfaces.ISourceFile[] = [
        {
          itemId: "itm1234567890",
          folder: "storageFolder",
          filename: "storageFilename.png",
          file: utils.getSampleImageAsFile()
        }
      ];
      const storageItemId: string = "itm1234567890";
      const storageAuthentication = MOCK_USER_SESSION;
      const serverInfoUrl = "https://myserver/images/thumbnail.png/rest/info";
      const expectedServerInfo = SERVER_INFO;
      const fetchUrl = "https://myserver/images/thumbnail.png";
      const expectedFetch = utils.getSampleImageAsBlob();
      const updateUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/itm1234567890/addResources";
      const expectedUpdate: string[] = ["storageFolder/storageFilename.png"];

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse()
        )
        .post("https://www.arcgis.com/sharing/rest/info", expectedServerInfo)
        .post(serverInfoUrl, expectedServerInfo)
        .post(fetchUrl, expectedFetch)
        .post(updateUrl, expectedUpdate);
      resourceHelpers
        .copyFilesToStorageItem(files, storageItemId, storageAuthentication)
        .then((response: any) => {
          expect(response).toEqual(expectedUpdate);
          done();
        }, done.fail);
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

  describe("generateSourceFilePaths, template version 0", () => {
    it("without resources", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const thumbnailUrlPart = "thumbnail/thumbnail.png";
      const resourceFilenames: string[] = [];
      const expected: interfaces.ISourceFileCopyPath[] = [
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml"
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png?w=400",
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
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/resources/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f",
          filename: "gtnp2.jpg"
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml"
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png?w=400",
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
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/resources/myFolder/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f_myFolder",
          filename: "gtnp2.jpg"
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml"
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png?w=400",
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
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/resources/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f",
          filename: "gtnp2.jpg"
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/resources/myFolder/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f_myFolder",
          filename: "gtnp2.jpg"
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml"
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png?w=400",
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

  describe("generateSourceFilePaths, template version 1", () => {
    it("without resources", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const thumbnailUrlPart = "thumbnail/thumbnail.png";
      const resourceFilenames: string[] = [];
      const expected: interfaces.ISourceFileCopyPath[] = [
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml"
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png?w=400",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png"
        }
      ];

      const actual = resourceHelpers.generateSourceFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames,
        false,
        1
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
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/resources/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f",
          filename: "gtnp2.jpg"
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml"
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png?w=400",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png"
        }
      ];

      const actual = resourceHelpers.generateSourceFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames,
        false,
        1
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
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/resources/myFolder/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f/myFolder",
          filename: "gtnp2.jpg"
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml"
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png?w=400",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png"
        }
      ];

      const actual = resourceHelpers.generateSourceFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames,
        false,
        1
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
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/resources/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f",
          filename: "gtnp2.jpg"
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/resources/myFolder/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f/myFolder",
          filename: "gtnp2.jpg"
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml"
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png?w=400",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png"
        }
      ];

      const actual = resourceHelpers.generateSourceFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames,
        false,
        1
      );
      expect(actual.length).toEqual(4);
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

  describe("generateStorageFilePaths, template version 0", () => {
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

    it("generates paths with a single file resource in a folder, template version 0", () => {
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

    it("generates paths with a single file resource in a folder, template version 1", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = [
        "8f7ec78195d0479784036387d522e29f/myFolder/gtnp2.jpg"
      ];
      const expected: interfaces.IDeployFileCopyPath[] = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f/myFolder/gtnp2.jpg",
          folder: "myFolder",
          filename: "gtnp2.jpg",
          type: interfaces.EFileType.Resource
        }
      ];

      const actual = resourceHelpers.generateStorageFilePaths(
        portalSharingUrl,
        storageItemId,
        resourceFilenames,
        1
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
          folder: "",
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
          folder: "",
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
      const expected: interfaces.IDeployFileCopyPath[] = [];

      const actual = resourceHelpers.generateStorageFilePaths(
        portalSharingUrl,
        storageItemId
      );
      expect(actual.length).toEqual(0);
      expect(actual).toEqual(expected);
    });
  });

  describe("generateStorageFilePaths, template version 1", () => {
    it("generates paths without resources", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = [];
      const expected: interfaces.IDeployFileCopyPath[] = [];

      const actual = resourceHelpers.generateStorageFilePaths(
        portalSharingUrl,
        storageItemId,
        resourceFilenames,
        1
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
        resourceFilenames,
        1
      );
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("generates paths with a single file resource in a folder", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = [
        "8f7ec78195d0479784036387d522e29f/myFolder/gtnp2.jpg"
      ];
      const expected: interfaces.IDeployFileCopyPath[] = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f/myFolder/gtnp2.jpg",
          folder: "myFolder",
          filename: "gtnp2.jpg",
          type: interfaces.EFileType.Resource
        }
      ];

      const actual = resourceHelpers.generateStorageFilePaths(
        portalSharingUrl,
        storageItemId,
        resourceFilenames,
        1
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
          folder: "",
          filename: "metadata.xml",
          type: interfaces.EFileType.Metadata
        }
      ];

      const actual = resourceHelpers.generateStorageFilePaths(
        portalSharingUrl,
        storageItemId,
        resourceFilenames,
        1
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
          folder: "",
          filename: "thumbnail.png",
          type: interfaces.EFileType.Thumbnail
        }
      ];

      const actual = resourceHelpers.generateStorageFilePaths(
        portalSharingUrl,
        storageItemId,
        resourceFilenames,
        1
      );
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("handles the absence of resource filenames", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const expected: interfaces.IDeployFileCopyPath[] = [];

      const actual = resourceHelpers.generateStorageFilePaths(
        portalSharingUrl,
        storageItemId
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

  describe("getThumbnailFromStorageItem", () => {
    it("handles an empty files list", done => {
      const storageAuthentication = MOCK_USER_SESSION;
      const filePaths: interfaces.IDeployFileCopyPath[] = [] as interfaces.IDeployFileCopyPath[];

      resourceHelpers
        .getThumbnailFromStorageItem(storageAuthentication, filePaths)
        .then(response => {
          expect(response).toBeNull();
          done();
        }, done.fail);
    });

    it("copies a thumbnail file", done => {
      const storageAuthentication = MOCK_USER_SESSION;
      const filePaths: interfaces.IDeployFileCopyPath[] = [
        {
          type: interfaces.EFileType.Thumbnail,
          folder: "",
          filename: "thumbnail.png",
          url: utils.PORTAL_SUBSET.restUrl + "/images/thumbnail.png" // Thumbnail uses only URL
        }
      ];
      const expectedImage = utils.getSampleImageAsFile(filePaths[0].filename);

      fetchMock.post(filePaths[0].url, expectedImage, { sendAsJson: false });
      resourceHelpers
        .getThumbnailFromStorageItem(storageAuthentication, filePaths)
        .then((response: File) => {
          expect(response).toEqual(expectedImage);
          expect(response.name).toEqual(filePaths[0].filename);
          done();
        }, done.fail);
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
});
