/** @license
 * Copyright 2024 Esri
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
 * Provides tests for zip file helper functions.
 */

import { UserSession } from "../src/arcgisRestJS";
import * as getBlobUtil from "../src/resources/get-blob";
import { IZipObjectContentItem } from "../src/interfaces";
import * as utils from "./mocks/utils";
import * as zipHelpers from "../test/mocks/zipHelpers";
import * as zipUtils from "../src/zip-utils";

// ------------------------------------------------------------------------------------------------------------------ //

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

let MOCK_USER_SESSION: UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

describe("Module `zip-utils`", () => {
  describe("blobToZipObject", () => {
    it("handles a non-zip blob", async () => {
      const blob = new Blob(["Hello, world!"], { type: "text/plain" });

      await expectAsync(zipUtils.blobToZipObject(blob)).toBeRejected();
    });
  });

  describe("fetchZipObject", () => {
    it("fetches a zip object", async () => {
      const itemId = "2f56b3b59cdc4ac8b8f5de0399887e1e";
      spyOn(getBlobUtil, "getBlob").and.returnValue(zipHelpers.getSampleFormZipBlob(itemId));

      const zip = await zipUtils.fetchZipObject(itemId, MOCK_USER_SESSION);

      const zipFiles = await zipUtils.getZipObjectContents(zip);

      expect(zipFiles.length).toBe(7);
      expect(zipFiles[1].file).toBe("esriinfo/form.info");
      expect(zipFiles[2].file).toBe("esriinfo/form.itemInfo");
    });
  });

  describe("getZipObjectContents", () => {
    it("returns the contents of a non-binary zip object", async () => {
      const itemId = "2f56b3b59cdc4ac8b8f5de0399887e1e";
      const zip = zipHelpers.generateFormZipObject(itemId);

      const zipFiles = await zipUtils.getZipObjectContents(zip);

      expect(zipFiles.length).toBe(7);
    });

    it("returns just two files out of a zip object", async () => {
      const itemId = "2f56b3b59cdc4ac8b8f5de0399887e1e";
      const zip = zipHelpers.generateFormZipObject(itemId);

      const zipFiles = await zipUtils.getZipObjectContents(zip, ["esriinfo/form.info", "esriinfo/form.json"]);

      expect(zipFiles.length).toBe(2);
      expect(zipFiles[0].file).toBe("esriinfo/form.info");
      expect(zipFiles[1].file).toBe("esriinfo/form.json");
    });

    it("returns the contents of a binary zip object", async () => {
      const zip = zipHelpers.generateBinaryZipObject();

      const zipFiles = await zipUtils.getZipObjectContents(zip);

      expect(zipFiles.length).toBe(1);
      expect(zipFiles[0].file).toBe("sample.png");
    });
  });

  describe("jsonFilesToZipObject", () => {
    it("converts a collection of JSON files to a zip object", async () => {
      const itemId = "2f56b3b59cdc4ac8b8f5de0399887e1e";
      const formJson = zipHelpers.generateFormJsonFiles(itemId);

      const zip = zipUtils.jsonFilesToZipObject(formJson);

      const zipFiles = await zipUtils.getZipObjectContents(zip);
      expect(zipFiles.length).toBe(7);
      expect(zipFiles[1].file).toBe("esriinfo/form.info");
      expect(zipFiles[2].file).toBe("esriinfo/form.itemInfo");
    });
  });

  describe("jsonToZipObject", () => {
    it("converts a JSON object to a zip object", async () => {
      const zippedFileName = "config.json";
      const json = {
        appId: "ABCDEFGHIJKLMNOP",
        portalURL: "https://www.arcgis.com",
        primarySolutionsGroupId: "81f043eecfe8404b8a6121e0016fe6f8",
        agoBasedEnterpriseSolutionsGroupId: "c3cc0b1f0f114861a3427ac0e99925aa",

        isRTL: false,
        locale: "",
      };

      const zip = zipUtils.jsonToZipObject(zippedFileName, json);

      const zipFiles = await zipUtils.getZipObjectContents(zip);
      expect(zipFiles.length).toBe(1);
      expect(zipFiles[0].file).toBe(zippedFileName);
      expect(zipFiles[0].content).toBe(JSON.stringify(json));
    });
  });

  describe("jsonToZipFile", () => {
    it("converts a JSON object to a zip file", async () => {
      const zippedFileName = "config.json";
      const json = {
        appId: "ABCDEFGHIJKLMNOP",
        portalURL: "https://www.arcgis.com",
        primarySolutionsGroupId: "81f043eecfe8404b8a6121e0016fe6f8",
        agoBasedEnterpriseSolutionsGroupId: "c3cc0b1f0f114861a3427ac0e99925aa",

        isRTL: false,
        locale: "",
      };
      const zipFileFilename = "config.zip";

      const zip = await zipUtils.jsonToZipFile(zippedFileName, json, zipFileFilename);

      const zipFiles = await zipUtils.getZipObjectContents(await zipUtils.blobToZipObject(zip));
      expect(zipFiles.length).toBe(1);
      expect(zipFiles[0].file).toBe(zippedFileName);
      expect(zipFiles[0].content).toBe(JSON.stringify(json));
    });
  });

  describe("modifyFilesinZipObject", () => {
    const itemId = "2f56b3b59cdc4ac8b8f5de0399887e1e";

    it("applies a function to all files in the zip", async () => {
      let zip = zipHelpers.generateFormZipObject(itemId);
      const zipFileContents = await zipUtils.getZipObjectContents(zip);
      const zipFiles: string[] = zipFileContents.map((zipFile) => zipFile.file);

      const zipFilesModified: string[] = [];
      zip = await zipUtils.modifyFilesinZipObject((zipFile: IZipObjectContentItem) => {
        zipFilesModified.push(zipFile.file);
        return zipFile.content;
      }, zip);

      expect(zipFilesModified).toEqual(zipFiles);
    });
  });

  describe("zipObjectToZipFile", () => {
    it("converts a zip object to a zip file with full filename", async () => {
      const itemId = "2f56b3b59cdc4ac8b8f5de0399887e1e";
      const zip = zipHelpers.generateFormZipObject(itemId);
      const zipFile = await zipUtils.zipObjectToZipFile(zip, "Fred.zip");
      expect(zipFile.name).toEqual("Fred.zip");
      expect(zipFile.type).toEqual("application/zip");
    });

    it("converts a zip object to a zip file with partial filename", async () => {
      const itemId = "2f56b3b59cdc4ac8b8f5de0399887e1e";
      const zip = zipHelpers.generateFormZipObject(itemId);
      const zipFile = await zipUtils.zipObjectToZipFile(zip, "Fred");
      expect(zipFile.name).toEqual("Fred.zip");
      expect(zipFile.type).toEqual("application/zip");
    });
  });
});
