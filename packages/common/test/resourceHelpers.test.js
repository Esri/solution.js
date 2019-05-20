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
describe("Module `resoureHelpers`: common functions involving the management of item and group resources", function () {
    describe("generateSourceResourceUrl", function () {
        // https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/resources?f=json
        it("top-level", function () {
            var portalSharingUrl = "https://www.arcgis.com/sharing";
            var itemId = "8f7ec78195d0479784036387d522e29f";
            var sourceResourceTag = "gtnp2.jpg";
            var expected = "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/resources/gtnp2.jpg";
            var actual = resourceHelpers.generateSourceResourceUrl(portalSharingUrl, itemId, sourceResourceTag);
            expect(actual).toEqual(expected);
        });
        it("in folder", function () {
            var portalSharingUrl = "https://www.arcgis.com/sharing";
            var itemId = "8f7ec78195d0479784036387d522e29f";
            var sourceResourceTag = "aFolder/git_merge.png";
            var expected = "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/resources/aFolder/git_merge.png";
            var actual = resourceHelpers.generateSourceResourceUrl(portalSharingUrl, itemId, sourceResourceTag);
            expect(actual).toEqual(expected);
        });
    });
    describe("generateSourceMetadataUrl", function () {
        it("item", function () {
            var portalSharingUrl = "https://www.arcgis.com/sharing";
            var itemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
            var expected = "https://www.arcgis.com/sharing/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/info/metadata/metadata.xml";
            var actual = resourceHelpers.generateSourceMetadataUrl(portalSharingUrl, itemId);
            expect(actual).toEqual(expected);
        });
    });
    describe("generateSourceThumbnailUrl", function () {
        it("item", function () {
            var portalSharingUrl = "https://www.arcgis.com/sharing";
            var itemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
            var thumbnailUrlPart = "thumbnail/thumbnail.png";
            var expected = "https://www.arcgis.com/sharing/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/info/thumbnail/thumbnail.png";
            var actual = resourceHelpers.generateSourceThumbnailUrl(portalSharingUrl, itemId, thumbnailUrlPart);
            expect(actual).toEqual(expected);
        });
        it("group", function () {
            var portalSharingUrl = "https://www.arcgis.com/sharing";
            var itemId = "b6430e0ca08d4b1380f3a5908985da3c";
            var thumbnailUrlPart = "thumbnail1553812391084.png";
            var expected = "https://www.arcgis.com/sharing/community/groups/b6430e0ca08d4b1380f3a5908985da3c/info/thumbnail1553812391084.png";
            var actual = resourceHelpers.generateSourceThumbnailUrl(portalSharingUrl, itemId, thumbnailUrlPart, true);
            expect(actual).toEqual(expected);
        });
    });
    describe("generateResourceStorageTag", function () {
        it("top-level", function () {
            var itemId = "8f7ec78195d0479784036387d522e29f";
            var sourceResourceTag = "gtnp2.jpg";
            var expected = {
                folder: "8f7ec78195d0479784036387d522e29f",
                filename: "gtnp2.jpg"
            };
            var actual = resourceHelpers.generateResourceStorageTag(itemId, sourceResourceTag);
            expect(actual).toEqual(expected);
        });
        it("in folder", function () {
            var itemId = "8f7ec78195d0479784036387d522e29f";
            var sourceResourceTag = "aFolder/git_merge.png";
            var expected = {
                folder: "8f7ec78195d0479784036387d522e29f_aFolder",
                filename: "git_merge.png"
            };
            var actual = resourceHelpers.generateResourceStorageTag(itemId, sourceResourceTag);
            expect(actual).toEqual(expected);
        });
    });
    describe("generateMetadataStorageTag", function () {
        it("metadata", function () {
            var itemId = "8f7ec78195d0479784036387d522e29f";
            var expected = {
                folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
                filename: "metadata.xml"
            };
            var actual = resourceHelpers.generateMetadataStorageTag(itemId);
            expect(actual).toEqual(expected);
        });
    });
    describe("generateThumbnailStorageTag", function () {
        it("without subpath", function () {
            var itemId = "8f7ec78195d0479784036387d522e29f";
            var sourceResourceTag = "thumbnail1553812391084.png";
            var expected = {
                folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
                filename: "thumbnail1553812391084.png"
            };
            var actual = resourceHelpers.generateThumbnailStorageTag(itemId, sourceResourceTag);
            expect(actual).toEqual(expected);
        });
        it("with subpath", function () {
            var itemId = "8f7ec78195d0479784036387d522e29f";
            var sourceResourceTag = "thumbnail/thumbnail.png";
            var expected = {
                folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
                filename: "thumbnail%2Fthumbnail.png"
            };
            var actual = resourceHelpers.generateThumbnailStorageTag(itemId, sourceResourceTag);
            expect(actual).toEqual(expected);
        });
    });
    describe("generateResourceTagFromStorage", function () {
        it("1", function () {
            var storageResourceTag = "8f7ec78195d0479784036387d522e29f/gtnp2.jpg";
            var expected = {
                folder: "",
                filename: "gtnp2.jpg"
            };
            var actual = resourceHelpers.generateResourceTagFromStorage(storageResourceTag);
            expect(actual).toEqual(expected);
        });
        it("2", function () {
            var storageResourceTag = "8f7ec78195d0479784036387d522e29f_aFolder/git_merge.png";
            var expected = {
                folder: "aFolder",
                filename: "git_merge.png"
            };
            var actual = resourceHelpers.generateResourceTagFromStorage(storageResourceTag);
            expect(actual).toEqual(expected);
        });
        it("3", function () {
            var storageResourceTag = "8f7ec78195d0479784036387d522e29f_info_metadata/metadata.xml";
            var expected = {
                folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
                filename: "metadata.xml"
            };
            var actual = resourceHelpers.generateResourceTagFromStorage(storageResourceTag);
            expect(actual).toEqual(expected);
        });
        it("4", function () {
            var storageResourceTag = "8f7ec78195d0479784036387d522e29f_info_thumbnail/thumbnail1553812391084.png";
            var expected = {
                folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
                filename: "thumbnail1553812391084.png"
            };
            var actual = resourceHelpers.generateResourceTagFromStorage(storageResourceTag);
            expect(actual).toEqual(expected);
        });
        it("5", function () {
            var storageResourceTag = "8f7ec78195d0479784036387d522e29f_info_thumbnail/thumbnail%2Fthumbnail.png";
            var expected = {
                folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
                filename: "thumbnail/thumbnail.png"
            };
            var actual = resourceHelpers.generateResourceTagFromStorage(storageResourceTag);
            expect(actual).toEqual(expected);
        });
    });
});
//# sourceMappingURL=resourceHelpers.test.js.map