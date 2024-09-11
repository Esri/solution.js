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

import { UserSession, ArcGISAuthError } from "../src/arcgisRestJS";
import * as interfaces from "../src/interfaces";
import * as portal from "@esri/arcgis-rest-portal";
import * as resourceHelpers from "../src/resourceHelpers";

import * as utils from "./mocks/utils";
const fetchMock = require("fetch-mock");
import * as addResourceFromBlobModule from "../src/resources/add-resource-from-blob";

// ------------------------------------------------------------------------------------------------------------------ //

let MOCK_USER_SESSION: UserSession;

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
    authInfo: {},
  };

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

  afterEach(() => {
    fetchMock.restore();
  });

  describe("addResourceFromBlob", () => {
    it("has filename without folder", async () => {
      const blob = utils.getSampleMetadataAsBlob();
      const itemId = "itm1234567890";
      const folder = "";
      const filename = "aFilename.xml";
      const updateUrl = utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/itm1234567890/addResources";
      const expected = { success: true, id: itemId };

      fetchMock.post(updateUrl, expected);

      const response: any = await addResourceFromBlobModule.addResourceFromBlob(
        blob,
        itemId,
        folder,
        filename,
        MOCK_USER_SESSION,
      );
      expect(response).toEqual(expected);
      const options: any = fetchMock.lastOptions(updateUrl);
      const fetchBody = options.body;
      expect(typeof fetchBody).toEqual("object");
      const form = fetchBody as FormData;
      expect(form.get("fileName")).toEqual(filename);
    });

    it("has a filename without an extension", async () => {
      const blob = utils.getSampleMetadataAsBlob();
      const itemId = "itm1234567890";
      const folder = "aFolder";
      const filename = "aFilename";
      const expected = new ArcGISAuthError("Filename must have an extension indicating its type");

      return addResourceFromBlobModule.addResourceFromBlob(blob, itemId, folder, filename, MOCK_USER_SESSION).then(
        () => fail(),
        (response: any) => {
          expect(response).toEqual(expected);
          return Promise.resolve();
        },
      );
    });

    it("has filename with folder", async () => {
      const blob = utils.getSampleMetadataAsBlob();
      const itemId = "itm1234567890";
      const folder = "aFolder";
      const filename = "aFilename.xml";
      const updateUrl = utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/itm1234567890/addResources";
      const expected = { success: true, id: itemId };

      fetchMock.post(updateUrl, expected);

      const response: any = await addResourceFromBlobModule.addResourceFromBlob(
        blob,
        itemId,
        folder,
        filename,
        MOCK_USER_SESSION,
      );
      expect(response).toEqual(expected);
      const options: any = fetchMock.lastOptions(updateUrl);
      const fetchBody = options.body;
      expect(typeof fetchBody).toEqual("object");
      const form = fetchBody as FormData;
      expect(form.get("resourcesPrefix")).toEqual(folder);
      expect(form.get("fileName")).toEqual(filename);
    });
  });

  describe("addThumbnailFromBlob", () => {
    it("gets an item's thumbnail from a blob", async () => {
      const blob = utils.getSampleImageAsBlob();
      const itemId = "itm1234567890";
      const updateUrl = utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/itm1234567890/update";
      const expected = utils.getSuccessResponse({ id: itemId });
      const serverInfoUrl: string = "https://myserver/images/thumbnail.png/rest/info";
      const expectedServerInfo = SERVER_INFO;

      fetchMock.post(updateUrl, expected).post(serverInfoUrl, expectedServerInfo);

      const response: any = await resourceHelpers.addThumbnailFromBlob(blob, itemId, MOCK_USER_SESSION);
      expect(response).toEqual(expected);
      const options: any = fetchMock.lastOptions(updateUrl);
      const fetchBody = options.body;
      expect(typeof fetchBody).toEqual("object");
    });

    it("gets a group's thumbnail from a blob", async () => {
      const blob = utils.getSampleImageAsBlob();
      const itemId = "grp1234567890";
      const updateUrl = utils.PORTAL_SUBSET.restUrl + "/community/groups/grp1234567890/update";
      const expected = utils.getSuccessResponse({ id: itemId });
      const serverInfoUrl: string = "https://myserver/images/thumbnail.png/rest/info";
      const expectedServerInfo = SERVER_INFO;

      fetchMock.post(updateUrl, expected).post(serverInfoUrl, expectedServerInfo);

      const response: any = await resourceHelpers.addThumbnailFromBlob(blob, itemId, MOCK_USER_SESSION, true);
      expect(response).toEqual(expected);
      const options: any = fetchMock.lastOptions(updateUrl);
      const fetchBody = options.body;
      expect(typeof fetchBody).toEqual("object");
    });
  });

  describe("convertBlobToSupportableResource", () => {
    it("uses blob (file) name if it has one", () => {
      const blob = utils.getSampleTextAsFile("namedBlob.txt");
      expect(blob.name).toEqual("namedBlob.txt");
      expect(blob.type).toEqual("text/plain");

      const convertedBlob: interfaces.IFileMimeTyped = resourceHelpers.convertBlobToSupportableResource(
        blob,
        "alternateName.txt",
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
        "alternateName.txt",
      );
      expect((convertedBlob.blob as File).name).toEqual("alternateName.txt");
      expect(convertedBlob.filename).toEqual("alternateName.txt");
      expect(convertedBlob.mimeType).toEqual("text/plain");
    });

    it("uses an empty file name if the blob (file) doesn't have a name and a name is not supplied", () => {
      const blob = utils.getSampleTextAsFile("");
      expect(blob.name).toEqual("");
      expect(blob.type).toEqual("text/plain");

      const convertedBlob: interfaces.IFileMimeTyped = resourceHelpers.convertBlobToSupportableResource(blob);
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
        "alternateName.pkg",
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
        "alternateName.pkg",
      );
      expect((convertedBlob.blob as File).name).toEqual("alternateName.pkg.zip");
      expect(convertedBlob.filename).toEqual("alternateName.pkg");
      expect(convertedBlob.mimeType).toEqual("text/plain");
    });
  });

  describe("copyFilesFromStorageItem", () => {
    it("handles an empty files list", async () => {
      const storageAuthentication = MOCK_USER_SESSION;
      const filePaths: interfaces.IDeployFileCopyPath[] = [] as interfaces.IDeployFileCopyPath[];
      const sourceItemId = "sln1234567890;";
      const destinationItemId: string = "itm1234567890";
      const destinationAuthentication = MOCK_USER_SESSION;
      const expected = true;

      const response: any = await resourceHelpers.copyFilesFromStorageItem(
        storageAuthentication,
        filePaths,
        sourceItemId,
        "",
        destinationItemId,
        destinationAuthentication,
      );
      expect(response).toEqual(expected);
    });

    it("remaps hub files", async () => {
      const storageAuthentication = MOCK_USER_SESSION;
      const sourceItemId = "sln1234567890;";
      const filePaths: interfaces.IDeployFileCopyPath[] = [
        {
          type: interfaces.EFileType.Resource,
          folder: "",
          filename: "bc3-storageFilename.png",
          url: "https://myserver/images/bc3-storageFilename.png",
        },
      ];
      const tmpl = { itemId: "bc3" };
      // Spies
      const resourceHelpersSpy = spyOn(resourceHelpers, "copyFilesFromStorageItem").and.resolveTo(true);

      await resourceHelpers.copyFilesFromStorageItem(
        storageAuthentication,
        filePaths,
        sourceItemId,
        "",
        "3ef",
        storageAuthentication,
        tmpl,
      );
      expect(resourceHelpersSpy.calls.count()).withContext("should call copyFilesFromStorageItem once").toBe(1);
      const secondArg = resourceHelpersSpy.calls.argsFor(0)[1];
      expect(secondArg[0].url).withContext("url 0 should be the same").toBe(filePaths[0].url);
    });

    it("copies a single data file", async () => {
      const storageAuthentication = MOCK_USER_SESSION;
      const filePaths: interfaces.IDeployFileCopyPath[] = [
        {
          type: interfaces.EFileType.Data,
          folder: "storageFolder",
          filename: "storageFilename.png",
          url: "https://myserver/images/resource.png",
        },
      ];
      const sourceItemId = "sln1234567890;";
      const destinationItemId: string = "itm1234567890";
      const destinationAuthentication = MOCK_USER_SESSION;
      const serverInfoUrl = "https://myserver/images/resource.png/rest/info";
      const expectedServerInfo = SERVER_INFO;
      const fetchUrl = "https://myserver/images/resource.png";
      const expectedFetch = utils.getSampleImageAsBlob();
      const updateUrl = utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/itm1234567890/update";
      const expectedUpdate = true;

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse(),
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/info", expectedServerInfo)
        .post(serverInfoUrl, expectedServerInfo)
        .post(fetchUrl, expectedFetch, { sendAsJson: false })
        .post(updateUrl, { success: true });

      const response: any = await resourceHelpers.copyFilesFromStorageItem(
        storageAuthentication,
        filePaths,
        sourceItemId,
        "",
        destinationItemId,
        destinationAuthentication,
      );
      expect(response).toEqual(expectedUpdate);
    });

    it("copies a single data file using list of MIME types", async () => {
      const storageAuthentication = MOCK_USER_SESSION;
      const filePaths: interfaces.IDeployFileCopyPath[] = [
        {
          type: interfaces.EFileType.Data,
          folder: "storageFolder",
          filename: "storageFilename.png",
          url: "https://myserver/images/resource.png",
        },
      ];
      const sourceItemId = "sln1234567890;";
      const destinationItemId: string = "itm1234567890";
      const destinationAuthentication = MOCK_USER_SESSION;
      const mimeTypes: interfaces.IKeyedStrings = {
        "storageFilename.png": "image/png",
      };
      const serverInfoUrl = "https://myserver/images/resource.png/rest/info";
      const expectedServerInfo = SERVER_INFO;
      const fetchUrl = "https://myserver/images/resource.png";
      const expectedFetch = utils.getSampleImageAsBlob();
      const updateUrl = utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/itm1234567890/update";
      const expectedUpdate = true;

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse(),
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/info", expectedServerInfo)
        .post(serverInfoUrl, expectedServerInfo)
        .post(fetchUrl, expectedFetch, { sendAsJson: false })
        .post(updateUrl, { success: true });

      const response: any = await resourceHelpers.copyFilesFromStorageItem(
        storageAuthentication,
        filePaths,
        sourceItemId,
        "",
        destinationItemId,
        destinationAuthentication,
        { properties: mimeTypes },
      );
      expect(response).toEqual(expectedUpdate);
    });

    it("copies a single metadata file", async () => {
      const storageAuthentication = MOCK_USER_SESSION;
      const filePaths: interfaces.IDeployFileCopyPath[] = [
        {
          type: interfaces.EFileType.Metadata,
          folder: "",
          filename: "",
          url: "https://myserver/doc/metadata.xml", // Metadata uses only URL
        },
      ];
      const sourceItemId = "sln1234567890;";
      const destinationItemId: string = "itm1234567890";
      const destinationAuthentication = MOCK_USER_SESSION;
      const serverInfoUrl = "https://myserver/doc/metadata.xml/rest/info";
      const expectedServerInfo = SERVER_INFO;
      const fetchUrl = "https://myserver/doc/metadata.xml";
      const expectedFetch = new Blob(["<meta><value1>a</value1><value2>b</value2></meta>"], { type: "text/xml" });
      const updateUrl = utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/itm1234567890/update";
      const expectedUpdate = true;

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse(),
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/info", expectedServerInfo)
        .post(serverInfoUrl, expectedServerInfo)
        .post(fetchUrl, expectedFetch, { sendAsJson: false })
        .post(updateUrl, expectedUpdate);

      const response: any = await resourceHelpers.copyFilesFromStorageItem(
        storageAuthentication,
        filePaths,
        sourceItemId,
        "",
        destinationItemId,
        destinationAuthentication,
      );
      expect(response).toEqual(expectedUpdate);
    });

    it("copies a single resource file", async () => {
      const storageAuthentication = MOCK_USER_SESSION;
      const filePaths: interfaces.IDeployFileCopyPath[] = [
        {
          type: interfaces.EFileType.Resource,
          folder: "storageFolder",
          filename: "storageFilename.png",
          url: "https://myserver/images/resource.png",
        },
      ];
      const sourceItemId = "sln1234567890;";
      const destinationItemId: string = "itm1234567890";
      const destinationAuthentication = MOCK_USER_SESSION;
      const serverInfoUrl = "https://myserver/images/resource.png/rest/info";
      const expectedServerInfo = SERVER_INFO;
      const fetchUrl = "https://myserver/images/resource.png";
      const expectedFetch = utils.getSampleImageAsBlob();
      const updateUrl = utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/itm1234567890/addResources";
      const expectedUpdate = true;

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse(),
        )
        .post("https://www.arcgis.com/sharing/rest/info", expectedServerInfo)
        .post(serverInfoUrl, expectedServerInfo)
        .post(fetchUrl, expectedFetch, { sendAsJson: false })
        .post(updateUrl, expectedUpdate);

      const response: any = await resourceHelpers.copyFilesFromStorageItem(
        storageAuthentication,
        filePaths,
        sourceItemId,
        "",
        destinationItemId,
        destinationAuthentication,
      );
      expect(response).toEqual(expectedUpdate);
    });

    it("copies multiple resource files", async () => {
      const storageAuthentication = MOCK_USER_SESSION;
      const template = {
        itemId: "abc",
      };
      const filePaths: interfaces.IDeployFileCopyPath[] = [
        {
          type: interfaces.EFileType.Resource,
          folder: "storageFolder1",
          filename: "storageFilename1.png",
          url: "https://myserver/images/resource.png",
        },
        {
          type: interfaces.EFileType.Resource,
          folder: "storageFolder2",
          filename: "storageFilename2.png",
          url: "https://myserver/images/resource.png",
        },
        {
          type: interfaces.EFileType.Resource,
          folder: "",
          filename: template.itemId + "-storageFilename2.png",
          url: "https://myserver/images/resource.png",
        },
      ];
      const sourceItemId = "sln1234567890;";
      const destinationItemId: string = "itm1234567890";
      const destinationAuthentication = MOCK_USER_SESSION;
      const serverInfoUrl = "https://myserver/images/resource.png/rest/info";
      const expectedServerInfo = SERVER_INFO;
      const fetchUrl = "https://myserver/images/resource.png";
      const expectedFetch = utils.getSampleImageAsBlob();
      const updateUrl = utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/itm1234567890/addResources";
      const expectedUpdate = true;

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse(),
        )
        .post("https://www.arcgis.com/sharing/rest/info", expectedServerInfo)
        .post(serverInfoUrl, expectedServerInfo)
        .post(fetchUrl, expectedFetch, { sendAsJson: false })
        .post(updateUrl, expectedUpdate);

      const response: any = await resourceHelpers.copyFilesFromStorageItem(
        storageAuthentication,
        filePaths,
        sourceItemId,
        "",
        destinationItemId,
        destinationAuthentication,
        template,
      );
      expect(response).toEqual(expectedUpdate);
    });

    it("does not copy thumbnail files", async () => {
      const storageAuthentication = MOCK_USER_SESSION;
      const sourceItemId = "sln1234567890;";
      const filePaths: interfaces.IDeployFileCopyPath[] = [
        {
          type: interfaces.EFileType.Thumbnail,
          folder: "",
          filename: "",
          url: utils.PORTAL_SUBSET.restUrl + "/images/thumbnail.png", // Thumbnail uses only URL
        },
      ];
      const destinationItemId: string = "itm1234567890";
      const destinationAuthentication = MOCK_USER_SESSION;

      const response: any = await resourceHelpers.copyFilesFromStorageItem(
        storageAuthentication,
        filePaths,
        sourceItemId,
        "",
        destinationItemId,
        destinationAuthentication,
      );
      expect(response).toBeTruthy();
    });
  });

  describe("copyFilesToStorageItem", () => {
    it("empty files list", async () => {
      const filePaths: interfaces.ISourceFile[] = [] as interfaces.ISourceFile[];
      const storageItemId: string = "itm1234567890";
      const storageAuthentication = MOCK_USER_SESSION;
      const expected: string[] = [];

      const response: any = await resourceHelpers.copyFilesToStorageItem(
        filePaths,
        storageItemId,
        storageAuthentication,
      );
      expect(response).toEqual(expected);
    });

    it("single file to copy", async () => {
      const files: interfaces.ISourceFile[] = [
        {
          itemId: "itm1234567890",
          folder: "storageFolder",
          filename: "storageFilename.png",
          file: utils.getSampleImageAsFile(),
        },
      ];
      const storageItemId: string = "itm1234567890";
      const storageAuthentication = MOCK_USER_SESSION;
      const serverInfoUrl = "https://myserver/images/thumbnail.png/rest/info";
      const expectedServerInfo = SERVER_INFO;
      const fetchUrl = "https://myserver/images/thumbnail.png";
      const expectedFetch = utils.getSampleImageAsBlob();
      const updateUrl = utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/itm1234567890/addResources";
      const expectedUpdate: string[] = ["storageFolder/storageFilename.png"];

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse(),
        )
        .post("https://www.arcgis.com/sharing/rest/info", expectedServerInfo)
        .post(serverInfoUrl, expectedServerInfo)
        .post(fetchUrl, expectedFetch)
        .post(updateUrl, expectedUpdate);

      const response: any = await resourceHelpers.copyFilesToStorageItem(files, storageItemId, storageAuthentication);
      expect(response).toEqual(expectedUpdate);
    });
  });

  describe("generateMetadataStorageFilename", () => {
    it("generates storage name for metadata", () => {
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
        filename: "metadata.xml",
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
            utils.PORTAL_SUBSET.restUrl + "/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml",
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png?w=400",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png",
        },
      ];

      const actual = resourceHelpers.generateSourceFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames,
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
          url: utils.PORTAL_SUBSET.restUrl + "/content/items/8f7ec78195d0479784036387d522e29f/resources/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f",
          filename: "gtnp2.jpg",
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl + "/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml",
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png?w=400",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png",
        },
      ];

      const actual = resourceHelpers.generateSourceFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames,
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
          filename: "gtnp2.jpg",
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl + "/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml",
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png?w=400",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png",
        },
      ];

      const actual = resourceHelpers.generateSourceFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames,
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
          url: utils.PORTAL_SUBSET.restUrl + "/content/items/8f7ec78195d0479784036387d522e29f/resources/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f",
          filename: "gtnp2.jpg",
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/resources/myFolder/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f_myFolder",
          filename: "gtnp2.jpg",
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl + "/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml",
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png?w=400",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png",
        },
      ];

      const actual = resourceHelpers.generateSourceFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames,
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
            utils.PORTAL_SUBSET.restUrl + "/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml",
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png?w=400",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png",
        },
      ];

      const actual = resourceHelpers.generateSourceFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames,
        false,
        1,
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
          url: utils.PORTAL_SUBSET.restUrl + "/content/items/8f7ec78195d0479784036387d522e29f/resources/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f",
          filename: "gtnp2.jpg",
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl + "/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml",
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png?w=400",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png",
        },
      ];

      const actual = resourceHelpers.generateSourceFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames,
        false,
        1,
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
          filename: "gtnp2.jpg",
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl + "/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml",
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png?w=400",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png",
        },
      ];

      const actual = resourceHelpers.generateSourceFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames,
        false,
        1,
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
          url: utils.PORTAL_SUBSET.restUrl + "/content/items/8f7ec78195d0479784036387d522e29f/resources/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f",
          filename: "gtnp2.jpg",
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/resources/myFolder/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f/myFolder",
          filename: "gtnp2.jpg",
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl + "/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml",
        },
        {
          itemId,
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png?w=400",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png",
        },
      ];

      const actual = resourceHelpers.generateSourceFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames,
        false,
        1,
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
        utils.PORTAL_SUBSET.restUrl + "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/info/metadata/metadata.xml";

      const actual = resourceHelpers.generateSourceMetadataUrl(portalSharingUrl, itemId);
      expect(actual).toEqual(expected);
    });
  });

  describe("generateSourceResourceUrl", () => {
    it("top-level", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceFilename = "gtnp2.jpg";
      const expected =
        utils.PORTAL_SUBSET.restUrl + "/content/items/8f7ec78195d0479784036387d522e29f/resources/gtnp2.jpg";

      const actual = resourceHelpers.generateSourceResourceUrl(portalSharingUrl, itemId, sourceResourceFilename);
      expect(actual).toEqual(expected);
    });

    it("in folder", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceFilename = "aFolder/git_merge.png";
      const expected =
        utils.PORTAL_SUBSET.restUrl + "/content/items/8f7ec78195d0479784036387d522e29f/resources/aFolder/git_merge.png";

      const actual = resourceHelpers.generateSourceResourceUrl(portalSharingUrl, itemId, sourceResourceFilename);
      expect(actual).toEqual(expected);
    });
  });

  describe("generateSourceThumbnailUrl", () => {
    it("item", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const itemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const thumbnailUrlPart = "thumbnail/thumbnail.png";
      const expected =
        utils.PORTAL_SUBSET.restUrl + "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/info/thumbnail/thumbnail.png";

      const actual = resourceHelpers.generateSourceThumbnailUrl(portalSharingUrl, itemId, thumbnailUrlPart);
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

      const actual = resourceHelpers.generateSourceThumbnailUrl(portalSharingUrl, itemId, thumbnailUrlPart, isGroup);
      expect(actual).toEqual(expected);
    });
  });

  describe("generateStorageFilePaths, template version 0", () => {
    it("generates paths without resources", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = [];
      const expected: interfaces.IDeployFileCopyPath[] = [];

      const actual = resourceHelpers.generateStorageFilePaths(portalSharingUrl, storageItemId, resourceFilenames);
      expect(actual.length).toEqual(0);
      expect(actual).toEqual(expected);
    });

    it("generates paths with a single top-level file resource", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = ["8f7ec78195d0479784036387d522e29f/gtnp2.jpg"];
      const expected: interfaces.IDeployFileCopyPath[] = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f/gtnp2.jpg",
          folder: "",
          filename: "gtnp2.jpg",
          type: interfaces.EFileType.Resource,
        },
      ];

      const actual = resourceHelpers.generateStorageFilePaths(portalSharingUrl, storageItemId, resourceFilenames);
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("generates paths with a single file resource in a folder, template version 0", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = ["8f7ec78195d0479784036387d522e29f_myFolder/gtnp2.jpg"];
      const expected: interfaces.IDeployFileCopyPath[] = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f_myFolder/gtnp2.jpg",
          folder: "myFolder",
          filename: "gtnp2.jpg",
          type: interfaces.EFileType.Resource,
        },
      ];

      const actual = resourceHelpers.generateStorageFilePaths(portalSharingUrl, storageItemId, resourceFilenames);
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("generates paths with a single file resource in a folder, template version 1", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = ["8f7ec78195d0479784036387d522e29f/myFolder/gtnp2.jpg"];
      const expected: interfaces.IDeployFileCopyPath[] = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f/myFolder/gtnp2.jpg",
          folder: "myFolder",
          filename: "gtnp2.jpg",
          type: interfaces.EFileType.Resource,
        },
      ];

      const actual = resourceHelpers.generateStorageFilePaths(portalSharingUrl, storageItemId, resourceFilenames, 1);
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("generates paths with metadata", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = ["8f7ec78195d0479784036387d522e29f_info_metadata/metadata.xml"];
      const expected: interfaces.IDeployFileCopyPath[] = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f_info_metadata/metadata.xml",
          folder: "",
          filename: "metadata.xml",
          type: interfaces.EFileType.Metadata,
        },
      ];

      const actual = resourceHelpers.generateStorageFilePaths(portalSharingUrl, storageItemId, resourceFilenames);
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("generates paths with a thumbnail", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = ["8f7ec78195d0479784036387d522e29f_info_thumbnail/thumbnail.png"];
      const expected: interfaces.IDeployFileCopyPath[] = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f_info_thumbnail/thumbnail.png",
          folder: "",
          filename: "thumbnail.png",
          type: interfaces.EFileType.Thumbnail,
        },
      ];

      const actual = resourceHelpers.generateStorageFilePaths(portalSharingUrl, storageItemId, resourceFilenames);
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("handles the absence of resource filenames", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const expected: interfaces.IDeployFileCopyPath[] = [];

      const actual = resourceHelpers.generateStorageFilePaths(portalSharingUrl, storageItemId);
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

      const actual = resourceHelpers.generateStorageFilePaths(portalSharingUrl, storageItemId, resourceFilenames, 1);
      expect(actual.length).toEqual(0);
      expect(actual).toEqual(expected);
    });

    it("generates paths with a single top-level file resource", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = ["8f7ec78195d0479784036387d522e29f/gtnp2.jpg"];
      const expected: interfaces.IDeployFileCopyPath[] = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f/gtnp2.jpg",
          folder: "",
          filename: "gtnp2.jpg",
          type: interfaces.EFileType.Resource,
        },
      ];

      const actual = resourceHelpers.generateStorageFilePaths(portalSharingUrl, storageItemId, resourceFilenames, 1);
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("generates paths with a single file resource in a folder", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = ["8f7ec78195d0479784036387d522e29f/myFolder/gtnp2.jpg"];
      const expected: interfaces.IDeployFileCopyPath[] = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f/myFolder/gtnp2.jpg",
          folder: "myFolder",
          filename: "gtnp2.jpg",
          type: interfaces.EFileType.Resource,
        },
      ];

      const actual = resourceHelpers.generateStorageFilePaths(portalSharingUrl, storageItemId, resourceFilenames, 1);
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("generates paths with metadata", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = ["8f7ec78195d0479784036387d522e29f_info_metadata/metadata.xml"];
      const expected: interfaces.IDeployFileCopyPath[] = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f_info_metadata/metadata.xml",
          folder: "",
          filename: "metadata.xml",
          type: interfaces.EFileType.Metadata,
        },
      ];

      const actual = resourceHelpers.generateStorageFilePaths(portalSharingUrl, storageItemId, resourceFilenames, 1);
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("generates paths with a thumbnail", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = ["8f7ec78195d0479784036387d522e29f_info_thumbnail/thumbnail.png"];
      const expected: interfaces.IDeployFileCopyPath[] = [
        {
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f_info_thumbnail/thumbnail.png",
          folder: "",
          filename: "thumbnail.png",
          type: interfaces.EFileType.Thumbnail,
        },
      ];

      const actual = resourceHelpers.generateStorageFilePaths(portalSharingUrl, storageItemId, resourceFilenames, 1);
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("handles the absence of resource filenames", () => {
      const portalSharingUrl = utils.PORTAL_SUBSET.restUrl;
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const expected: interfaces.IDeployFileCopyPath[] = [];

      const actual = resourceHelpers.generateStorageFilePaths(portalSharingUrl, storageItemId);
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
        filename: "thumbnail1553812391084.png",
      };

      const actual = resourceHelpers.generateThumbnailStorageFilename(itemId, sourceResourceFilename);
      expect(actual).toEqual(expected);
    });

    it("with subpath", () => {
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceFilename = "thumbnail/thumbnail.png";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
        filename: "thumbnail.png",
      };

      const actual = resourceHelpers.generateThumbnailStorageFilename(itemId, sourceResourceFilename);
      expect(actual).toEqual(expected);
    });
  });

  describe("getThumbnailFromStorageItem", () => {
    it("handles an empty files list", async () => {
      const storageAuthentication = MOCK_USER_SESSION;
      const filePaths: interfaces.IDeployFileCopyPath[] = [] as interfaces.IDeployFileCopyPath[];

      const response: any = await resourceHelpers.getThumbnailFromStorageItem(storageAuthentication, filePaths);
      expect(response).toBeNull();
    });

    it("copies a thumbnail file", async () => {
      const storageAuthentication = MOCK_USER_SESSION;
      const filePaths: interfaces.IDeployFileCopyPath[] = [
        {
          type: interfaces.EFileType.Thumbnail,
          folder: "",
          filename: "thumbnail.png",
          url: utils.PORTAL_SUBSET.restUrl + "/images/thumbnail.png", // Thumbnail uses only URL
        },
      ];
      const expectedImage = utils.getSampleImageAsFile(filePaths[0].filename);

      fetchMock.post(filePaths[0].url, expectedImage, { sendAsJson: false });

      const response: File = await resourceHelpers.getThumbnailFromStorageItem(storageAuthentication, filePaths);
      expect(response).toEqual(expectedImage);
      expect(response.name).toEqual(filePaths[0].filename);
    });
  });

  describe("isSupportedFileType", () => {
    it("recognizes supported file types for resource", () => {
      const fileTypes = ".json|.xml|.txt|.png|.pbf|.zip|.jpeg|.jpg|.gif|.bmp|.gz|.svg|.svgz|.geodatabase";
      fileTypes.split("|").forEach((fileType) =>
        expect(resourceHelpers.isSupportedFileType(fileType))
          .withContext(fileType + "is not supported")
          .toBeTruthy(),
      );
    });

    it("recognizes unsupported file types for resource", () => {
      const fileTypes =
        ".bin|.cpg|.css|.csv|.dbf|.doc|.docx|.htm|.html|.ico|.jar|.js|.mxd|.mxs|.pdf|.ppt|.pptx" +
        "|.prj|.rtf|.shp|.tar|.tif|.tiff|.ts|.ttf|.vsd|.wav|.xls|.xlsx";
      fileTypes.split("|").forEach((fileType) =>
        expect(resourceHelpers.isSupportedFileType(fileType))
          .withContext(fileType + "is supported")
          .toBeFalsy(),
      );
    });
  });

  describe("removeItemResourceFile", () => {
    it("correctly maps call", async () => {
      const itemId = "abcde";
      const filename = "fghij";

      const resourceHelpersSpy = spyOn(portal, "removeItemResource").and.resolveTo({ success: true });

      await resourceHelpers.removeItemResourceFile(itemId, filename, MOCK_USER_SESSION);
      const restjsArg = resourceHelpersSpy.calls.argsFor(0)[0];
      expect(restjsArg).toEqual({
        id: itemId,
        resource: filename,
        authentication: MOCK_USER_SESSION,
      });
    });
  });

  describe("updateItemResourceFile", () => {
    it("correctly maps call", async () => {
      const itemId = "abcde";
      const filename = "fghij";

      const resourceHelpersSpy = spyOn(portal, "updateItemResource").and.resolveTo({
        success: true,
        itemId,
        owner: "Fred",
        folder: "MGM",
      } as portal.IItemResourceResponse);

      await resourceHelpers.updateItemResourceFile(itemId, filename, utils.getSampleImageAsFile(), MOCK_USER_SESSION);
      const restjsArg = resourceHelpersSpy.calls.argsFor(0)[0];
      expect(restjsArg).toEqual({
        id: itemId,
        prefix: undefined,
        name: filename,
        resource: utils.getSampleImageAsFile(),
        authentication: MOCK_USER_SESSION,
      });
    });

    it("correctly maps call with prefixed filename", async () => {
      const itemId = "abcde";
      const filename = "fghij/folder/myfile";

      const resourceHelpersSpy = spyOn(portal, "updateItemResource").and.resolveTo({
        success: true,
        itemId,
        owner: "Fred",
        folder: "MGM",
      } as portal.IItemResourceResponse);

      await resourceHelpers.updateItemResourceFile(itemId, filename, utils.getSampleImageAsFile(), MOCK_USER_SESSION);
      const restjsArg = resourceHelpersSpy.calls.argsFor(0)[0];
      expect(restjsArg).toEqual({
        id: itemId,
        prefix: "fghij/folder",
        name: "myfile",
        resource: utils.getSampleImageAsFile(),
        authentication: MOCK_USER_SESSION,
      });
    });
  });
});
