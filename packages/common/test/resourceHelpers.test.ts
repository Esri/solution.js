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

import * as auth from "@esri/arcgis-rest-auth";
import * as portal from "@esri/arcgis-rest-portal";
import * as resourceHelpers from "../src/resourceHelpers";

import { TOMORROW } from "./lib/utils";
import * as fetchMock from "fetch-mock";

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `resourceHelpers`: common functions involving the management of item and group resources", () => {
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

  describe("addMetadataFromBlob", () => {
    // Blob() is only available in the browser
    if (typeof window !== "undefined") {
      it("has metadata", done => {
        const blob = new Blob(["abc", "def", "ghi"], { type: "text/xml" });
        const itemId = "itm1234567890";
        const fetchUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/update";
        const expected = { success: true, id: itemId };

        fetchMock.post(fetchUrl, expected);
        resourceHelpers
          .addMetadataFromBlob(blob, itemId, MOCK_USER_REQOPTS)
          .then((response: any) => {
            expect(response).toEqual(expected);
            const options: RequestInit = fetchMock.lastOptions(fetchUrl);
            expect(typeof options.body).toEqual("object");
            done();
          }, done.fail);
      });
    }
  });

  describe("addResourceFromBlob", () => {
    // Blob() is only available in the browser
    if (typeof window !== "undefined") {
      it("has filename without folder", done => {
        const blob = new Blob(["abc", "def", "ghi"], { type: "text/xml" });
        const itemId = "itm1234567890";
        const folder = "";
        const filename = "aFilename";
        const fetchUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/addResources";
        const expected = { success: true, id: itemId };

        fetchMock.post(fetchUrl, expected);
        resourceHelpers
          .addResourceFromBlob(
            blob,
            itemId,
            folder,
            filename,
            MOCK_USER_REQOPTS
          )
          .then((response: any) => {
            expect(response).toEqual(expected);
            const options: RequestInit = fetchMock.lastOptions(fetchUrl);
            expect(typeof options.body).toEqual("object");
            const form = options.body as FormData;
            expect(form.get("fileName")).toEqual(filename);
            done();
          }, done.fail);
      });

      it("has filename with folder", done => {
        const blob = new Blob(["abc", "def", "ghi"], { type: "text/xml" });
        const itemId = "itm1234567890";
        const folder = "aFolder";
        const filename = "aFilename";
        const fetchUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/addResources";
        const expected = { success: true, id: itemId };

        fetchMock.post(fetchUrl, expected);
        resourceHelpers
          .addResourceFromBlob(
            blob,
            itemId,
            folder,
            filename,
            MOCK_USER_REQOPTS
          )
          .then((response: any) => {
            expect(response).toEqual(expected);
            const options: RequestInit = fetchMock.lastOptions(fetchUrl);
            expect(typeof options.body).toEqual("object");
            const form = options.body as FormData;
            expect(form.get("resourcesPrefix")).toEqual(folder);
            expect(form.get("fileName")).toEqual(filename);
            done();
          }, done.fail);
      });
    }
  });

  describe("addThumbnailFromBlob", () => {
    // Blob() is only available in the browser
    if (typeof window !== "undefined") {
      it("has thumbnail", done => {
        const blob = new Blob(["abc", "def", "ghi"], { type: "text/xml" });
        const itemId = "itm1234567890";
        const fetchUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/update";
        const expected = { success: true, id: itemId };

        fetchMock.post(fetchUrl, expected);
        resourceHelpers
          .addThumbnailFromBlob(blob, itemId, MOCK_USER_REQOPTS)
          .then((response: any) => {
            expect(response).toEqual(expected);
            const options: RequestInit = fetchMock.lastOptions(fetchUrl);
            expect(typeof options.body).toEqual("object");
            done();
          }, done.fail);
      });
    }
  });

  describe("addThumbnailFromUrl", () => {
    it("does something", done => {
      const thumbnailUrl = "https://myserver/images/thumbnail.png";
      const itemId = "itm1234567890";
      const fetchUrl =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/update";
      const expected = { success: true, id: itemId };

      fetchMock.post(fetchUrl, expected);
      resourceHelpers
        .addThumbnailFromUrl(thumbnailUrl, itemId, MOCK_USER_REQOPTS)
        .then((response: any) => {
          expect(response).toEqual(expected);
          const options: RequestInit = fetchMock.lastOptions(fetchUrl);
          expect(options.body).toContain("f=json");
          expect(options.body).toContain("id=itm1234567890");
          expect(options.body).toContain(
            "thumbnailurl=" + encodeURIComponent(thumbnailUrl)
          );
          expect(options.body).toContain("token=fake-token");
          done();
        }, done.fail);
    });
  });

  xdescribe("copyFilesFromStorageItem", () => {
    xit("does something", () => {
      console.log("copyFilesFromStorageItem");
    });
  });

  xdescribe("copyFilesToStorageItem", () => {
    xit("does something", () => {
      console.log("copyFilesToStorageItem");
    });
  });

  xdescribe("copyMetadata", () => {
    xit("does something", () => {
      console.log("copyMetadata");
    });
  });

  xdescribe("copyResource", () => {
    xit("does something", () => {
      console.log("copyResource");
    });
  });

  describe("generateGroupFilePaths", () => {
    it("for a group thumbnail", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const thumbnailUrlPart = "thumbnail.png";
      const expected: resourceHelpers.ISourceFileCopyPath[] = [
        {
          url:
            "https://www.arcgis.com/sharing/community/groups/8f7ec78195d0479784036387d522e29f/info/thumbnail.png",
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
  });

  describe("generateMetadataStorageFilename", () => {
    it("metadata", () => {
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
    it("top-level image file", () => {
      const storageResourceFilename =
        "8f7ec78195d0479784036387d522e29f/gtnp2.jpg";
      const expected: resourceHelpers.IDeployFilename = {
        type: resourceHelpers.EFileType.Resource,
        folder: "",
        filename: "gtnp2.jpg"
      };

      const actual = resourceHelpers.generateResourceFilenameFromStorage(
        storageResourceFilename
      );
      expect(actual).toEqual(expected);
    });

    it("image file in folder", () => {
      const storageResourceFilename =
        "8f7ec78195d0479784036387d522e29f_aFolder/git_merge.png";
      const expected: resourceHelpers.IDeployFilename = {
        type: resourceHelpers.EFileType.Resource,
        folder: "aFolder",
        filename: "git_merge.png"
      };

      const actual = resourceHelpers.generateResourceFilenameFromStorage(
        storageResourceFilename
      );
      expect(actual).toEqual(expected);
    });

    it("metadata file", () => {
      const storageResourceFilename =
        "8f7ec78195d0479784036387d522e29f_info_metadata/metadata.xml";
      const expected: resourceHelpers.IDeployFilename = {
        type: resourceHelpers.EFileType.Metadata,
        folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
        filename: "metadata.xml"
      };

      const actual = resourceHelpers.generateResourceFilenameFromStorage(
        storageResourceFilename
      );
      expect(actual).toEqual(expected);
    });

    it("thumbnail", () => {
      const storageResourceFilename =
        "8f7ec78195d0479784036387d522e29f_info_thumbnail/thumbnail.png";
      const expected: resourceHelpers.IDeployFilename = {
        type: resourceHelpers.EFileType.Thumbnail,
        folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
        filename: "thumbnail.png"
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

  describe("generateSourceItemFilePaths", () => {
    it("without resources", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const thumbnailUrlPart = "thumbnail/thumbnail.png";
      const resourceFilenames: string[] = [];
      const expected: resourceHelpers.ISourceFileCopyPath[] = [
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml"
        },
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png"
        }
      ];

      const actual = resourceHelpers.generateSourceItemFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames
      );
      expect(actual.length).toEqual(2);
      expect(actual).toEqual(expected);
    });

    it("with one resource at top level", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const thumbnailUrlPart = "thumbnail/thumbnail.png";
      const resourceFilenames = ["gtnp2.jpg"];
      const expected: resourceHelpers.ISourceFileCopyPath[] = [
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/resources/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f",
          filename: "gtnp2.jpg"
        },
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml"
        },
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png"
        }
      ];

      const actual = resourceHelpers.generateSourceItemFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames
      );
      expect(actual.length).toEqual(3);
      expect(actual).toEqual(expected);
    });

    it("with one resource in folder", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const thumbnailUrlPart = "thumbnail/thumbnail.png";
      const resourceFilenames = ["myFolder/gtnp2.jpg"];
      const expected: resourceHelpers.ISourceFileCopyPath[] = [
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/resources/myFolder/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f_myFolder",
          filename: "gtnp2.jpg"
        },
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml"
        },
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png"
        }
      ];

      const actual = resourceHelpers.generateSourceItemFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames
      );
      expect(actual.length).toEqual(3);
      expect(actual).toEqual(expected);
    });

    it("with multiple resources", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const thumbnailUrlPart = "thumbnail/thumbnail.png";
      const resourceFilenames = ["gtnp2.jpg", "myFolder/gtnp2.jpg"];
      const expected: resourceHelpers.ISourceFileCopyPath[] = [
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/resources/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f",
          filename: "gtnp2.jpg"
        },
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/resources/myFolder/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f_myFolder",
          filename: "gtnp2.jpg"
        },
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml"
        },
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png"
        }
      ];

      const actual = resourceHelpers.generateSourceItemFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames
      );
      expect(actual.length).toEqual(4);
      expect(actual).toEqual(expected);
    });
  });

  describe("generateSourceMetadataUrl", () => {
    it("item", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const expected =
        "https://www.arcgis.com/sharing/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/info/metadata/metadata.xml";

      const actual = resourceHelpers.generateSourceMetadataUrl(
        portalSharingUrl,
        itemId
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("generateSourceResourceUrl", () => {
    it("top-level", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceFilename = "gtnp2.jpg";
      const expected =
        "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/resources/gtnp2.jpg";

      const actual = resourceHelpers.generateSourceResourceUrl(
        portalSharingUrl,
        itemId,
        sourceResourceFilename
      );
      expect(actual).toEqual(expected);
    });

    it("in folder", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceFilename = "aFolder/git_merge.png";
      const expected =
        "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/resources/aFolder/git_merge.png";

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
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const thumbnailUrlPart = "thumbnail/thumbnail.png";
      const expected =
        "https://www.arcgis.com/sharing/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/info/thumbnail/thumbnail.png";

      const actual = resourceHelpers.generateSourceThumbnailUrl(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart
      );
      expect(actual).toEqual(expected);
    });

    it("group", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "b6430e0ca08d4b1380f3a5908985da3c";
      const thumbnailUrlPart = "thumbnail1553812391084.png";
      const isGroup = true;
      const expected =
        "https://www.arcgis.com/sharing/community/groups/b6430e0ca08d4b1380f3a5908985da3c/info/thumbnail1553812391084.png";

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
    it("without resources", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = [];
      const expected: resourceHelpers.IDeployFileCopyPath[] = [];

      const actual = resourceHelpers.generateStorageFilePaths(
        portalSharingUrl,
        storageItemId,
        resourceFilenames
      );
      expect(actual.length).toEqual(0);
      expect(actual).toEqual(expected);
    });

    it("with a single top-level file resource", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = [
        "8f7ec78195d0479784036387d522e29f/gtnp2.jpg"
      ];
      const expected: resourceHelpers.IDeployFileCopyPath[] = [
        {
          url:
            "https://www.arcgis.com/sharing/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f/gtnp2.jpg",
          folder: "",
          filename: "gtnp2.jpg",
          type: resourceHelpers.EFileType.Resource
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

    it("with a single file resource in a folder", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = [
        "8f7ec78195d0479784036387d522e29f_myFolder/gtnp2.jpg"
      ];
      const expected: resourceHelpers.IDeployFileCopyPath[] = [
        {
          url:
            "https://www.arcgis.com/sharing/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f_myFolder/gtnp2.jpg",
          folder: "myFolder",
          filename: "gtnp2.jpg",
          type: resourceHelpers.EFileType.Resource
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

    it("with a metadata", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = [
        "8f7ec78195d0479784036387d522e29f_info_metadata/metadata.xml"
      ];
      const expected: resourceHelpers.IDeployFileCopyPath[] = [
        {
          url:
            "https://www.arcgis.com/sharing/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f_info_metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml",
          type: resourceHelpers.EFileType.Metadata
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

    it("with a thumbnail", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = [
        "8f7ec78195d0479784036387d522e29f_info_thumbnail/thumbnail.png"
      ];
      const expected: resourceHelpers.IDeployFileCopyPath[] = [
        {
          url:
            "https://www.arcgis.com/sharing/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f_info_thumbnail/thumbnail.png",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png",
          type: resourceHelpers.EFileType.Thumbnail
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
});
