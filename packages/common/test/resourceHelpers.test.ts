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

import * as resourceHelpers from "../src/resourceHelpers";

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `resoureHelpers`: common functions involving the management of item and group resources", () => {

  describe("generateSourceResourceUrl", () => {

    // https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/resources?f=json

    it("top-level", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceTag = "gtnp2.jpg";
      const expected = "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/resources/gtnp2.jpg";

      const actual = resourceHelpers.generateSourceResourceUrl(portalSharingUrl, itemId, sourceResourceTag);
      expect(actual).toEqual(expected);
    });

    it("in folder", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceTag = "aFolder/git_merge.png";
      const expected = "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/resources/aFolder/git_merge.png";

      const actual = resourceHelpers.generateSourceResourceUrl(portalSharingUrl, itemId, sourceResourceTag);
      expect(actual).toEqual(expected);
    });

  });

  describe("generateSourceMetadataUrl", () => {

    it("item", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const expected = "https://www.arcgis.com/sharing/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/info/metadata/metadata.xml";

      const actual = resourceHelpers.generateSourceMetadataUrl(portalSharingUrl, itemId);
      expect(actual).toEqual(expected);
    });

  });

  describe("generateSourceThumbnailUrl", () => {

    it("item", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const thumbnailUrlPart = "thumbnail/thumbnail.png";
      const expected = "https://www.arcgis.com/sharing/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/info/thumbnail/thumbnail.png";

      const actual = resourceHelpers.generateSourceThumbnailUrl(portalSharingUrl, itemId, thumbnailUrlPart);
      expect(actual).toEqual(expected);
    });

    it("group", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "b6430e0ca08d4b1380f3a5908985da3c";
      const thumbnailUrlPart = "thumbnail1553812391084.png";
      const expected = "https://www.arcgis.com/sharing/community/groups/b6430e0ca08d4b1380f3a5908985da3c/info/thumbnail1553812391084.png";

      const actual = resourceHelpers.generateSourceThumbnailUrl(portalSharingUrl, itemId, thumbnailUrlPart, true);
      expect(actual).toEqual(expected);
    });

  });

  describe("generateResourceStorageTag", () => {

    it("top-level", () => {
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceTag = "gtnp2.jpg";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f",
        filename: "gtnp2.jpg"
      };

      const actual = resourceHelpers.generateResourceStorageTag(itemId, sourceResourceTag);
      expect(actual).toEqual(expected);
    });

    it("in folder", () => {
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceTag = "aFolder/git_merge.png";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f_aFolder",
        filename: "git_merge.png"
      };

      const actual = resourceHelpers.generateResourceStorageTag(itemId, sourceResourceTag);
      expect(actual).toEqual(expected);
    });

  });

  describe("generateMetadataStorageTag", () => {

    it("metadata", () => {
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
        filename: "metadata.xml"
      };

      const actual = resourceHelpers.generateMetadataStorageTag(itemId);
      expect(actual).toEqual(expected);
    });

  });

  describe("generateThumbnailStorageTag", () => {

    it("without subpath", () => {
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceTag = "thumbnail1553812391084.png";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
        filename: "thumbnail1553812391084.png"
      };

      const actual = resourceHelpers.generateThumbnailStorageTag(itemId, sourceResourceTag);
      expect(actual).toEqual(expected);
    });

    it("with subpath", () => {
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceTag = "thumbnail/thumbnail.png";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
        filename: "thumbnail%2Fthumbnail.png"
      };

      const actual = resourceHelpers.generateThumbnailStorageTag(itemId, sourceResourceTag);
      expect(actual).toEqual(expected);
    });

  });

  describe("generateResourceTagFromStorage", () => {

    it("1", () => {
      const storageResourceTag = "8f7ec78195d0479784036387d522e29f/gtnp2.jpg";
      const expected = {
        folder: "",
        filename: "gtnp2.jpg"
      };

      const actual = resourceHelpers.generateResourceTagFromStorage(storageResourceTag);
      expect(actual).toEqual(expected);
    });

    it("2", () => {
      const storageResourceTag = "8f7ec78195d0479784036387d522e29f_aFolder/git_merge.png";
      const expected = {
        folder: "aFolder",
        filename: "git_merge.png"
      };

      const actual = resourceHelpers.generateResourceTagFromStorage(storageResourceTag);
      expect(actual).toEqual(expected);
    });

    it("3", () => {
      const storageResourceTag = "8f7ec78195d0479784036387d522e29f_info_metadata/metadata.xml";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
        filename: "metadata.xml"
      };

      const actual = resourceHelpers.generateResourceTagFromStorage(storageResourceTag);
      expect(actual).toEqual(expected);
    });

    it("4", () => {
      const storageResourceTag = "8f7ec78195d0479784036387d522e29f_info_thumbnail/thumbnail1553812391084.png";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
        filename: "thumbnail1553812391084.png"
      };

      const actual = resourceHelpers.generateResourceTagFromStorage(storageResourceTag);
      expect(actual).toEqual(expected);
    });

    it("5", () => {
      const storageResourceTag = "8f7ec78195d0479784036387d522e29f_info_thumbnail/thumbnail%2Fthumbnail.png";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
        filename: "thumbnail/thumbnail.png"
      };

      const actual = resourceHelpers.generateResourceTagFromStorage(storageResourceTag);
      expect(actual).toEqual(expected);
    });

  });

});
