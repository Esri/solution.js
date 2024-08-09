/** @license
 * Copyright 2021 Esri
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
 * Provides tests for sending resources to AGO.
 */

import * as addMetadataFromBlob from "../../src/resources/addMetadataFromBlob";
import * as copyDataIntoItem from "../../src/resources/copyDataIntoItem";
import * as copyMetadataIntoItem from "../../src/resources/copyMetadataIntoItem";
import * as copyResourceIntoZip from "../../src/resources/copyResourceIntoZip";
import * as copyZipIntoItem from "../../src/resources/copyZipIntoItem";
import * as generalHelpers from "../../src/generalHelpers";
import * as getBlob from "../../src/resources/get-blob";
import * as interfaces from "../../src/interfaces";
import * as portal from "@esri/arcgis-rest-portal";
import * as restHelpers from "../../src/restHelpers";
import * as restHelpersGet from "../../src/restHelpersGet";
import {
  copyFilesAsResources,
  copyAssociatedFilesByType,
  _detemplatizeResources,
} from "../../src/resources/copyAssociatedFiles";
import { createCopyResults } from "../../src/resources/createCopyResults";
import JSZip from "jszip";

import * as mockItems from "../mocks/agolItems";
import * as templates from "../mocks/templates";
import * as utils from "../mocks/utils";

// ------------------------------------------------------------------------------------------------------------------ //

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

describe("Module `copyAssociatedFiles`: functions for sending resources to AGO", () => {
  describe("addMetadataFromBlob", () => {
    it("can add metadata", async () => {
      const blob = utils.getSampleMetadataAsBlob();
      spyOn(portal, "updateItem").and.resolveTo(mockItems.get200Success());

      const results: any = await addMetadataFromBlob.addMetadataFromBlob(blob, "itm1234567890", MOCK_USER_SESSION);
      expect(results.success).toBeTruthy();
    });

    it("can fail to add metadata", async () => {
      const blob = utils.getSampleMetadataAsBlob();
      spyOn(portal, "updateItem").and.rejectWith(mockItems.get400Failure());

      return addMetadataFromBlob
        .addMetadataFromBlob(blob, "itm1234567890", MOCK_USER_SESSION)
        .then(fail, (results: any) => {
          expect(results.error.code).toEqual(400);
          return Promise.resolve();
        });
    });
  });

  describe("copyAssociatedFiles", () => {
    it("handles empty list of files", async () => {
      const fileInfos: interfaces.IAssociatedFileInfo[] = [];

      const copyDataIntoItemSpy = spyOn(copyDataIntoItem, "copyDataIntoItem").and.rejectWith(mockItems.get400Failure());
      const copyMetadataIntoItemSpy = spyOn(copyMetadataIntoItem, "copyMetadataIntoItem").and.rejectWith(
        mockItems.get400Failure(),
      );
      const copyResourceIntoZipSpy = spyOn(copyResourceIntoZip, "copyResourceIntoZip").and.returnValue({} as any);
      const copyZipIntoItemSpy = spyOn(copyZipIntoItem, "copyZipIntoItem").and.rejectWith(mockItems.get400Failure());

      const results: interfaces.IAssociatedFileCopyResults[] = await copyAssociatedFilesByType(
        fileInfos,
        MOCK_USER_SESSION,
        "sln1234567890",
        "itm1234567890",
        MOCK_USER_SESSION,
      );
      expect(results).toEqual([] as interfaces.IAssociatedFileCopyResults[]);

      expect(copyDataIntoItemSpy).not.toHaveBeenCalled();
      expect(copyMetadataIntoItemSpy).not.toHaveBeenCalled();
      expect(copyResourceIntoZipSpy).not.toHaveBeenCalled();
      expect(copyZipIntoItemSpy).not.toHaveBeenCalled();
    });

    it("copies ignoring file type", async () => {
      const files: interfaces.ISourceFile[] = [
        {
          itemId: "itm1234567890",
          folder: "storageFolder",
          filename: "metadata.xml",
          file: utils.getSampleMetadataAsFile(),
        },
        {
          itemId: "itm1234567890",
          folder: "storageFolder",
          filename: "storageFilename.png",
          file: utils.getSampleImageAsFile(),
        },
      ];

      const copyDataIntoItemSpy = spyOn(copyDataIntoItem, "copyDataIntoItem").and.rejectWith(mockItems.get400Failure());
      const copyMetadataIntoItemSpy = spyOn(copyMetadataIntoItem, "copyMetadataIntoItem").and.rejectWith(
        mockItems.get400Failure(),
      );
      spyOn(restHelpersGet, "getBlobAsFile").and.resolveTo(utils.getSampleImageAsFile());
      const copyZipIntoItemSpy = spyOn(copyZipIntoItem, "copyZipIntoItem").and.resolveTo(
        _createIZipCopyResults(true, true, [
          _createIAssociatedFileInfo(interfaces.EFileType.Metadata),
          _createIAssociatedFileInfo(interfaces.EFileType.Resource),
        ]),
      );

      const results: interfaces.IAssociatedFileCopyResults[] = await copyFilesAsResources(
        files,
        "itm1234567890",
        MOCK_USER_SESSION,
      );
      expect(results).toEqual([
        _createIAssociatedFileCopyResults(true, true, interfaces.EFileType.Metadata),
        _createIAssociatedFileCopyResults(true, true, interfaces.EFileType.Resource),
      ] as interfaces.IAssociatedFileCopyResults[]);

      expect(copyDataIntoItemSpy).not.toHaveBeenCalled();
      expect(copyMetadataIntoItemSpy).not.toHaveBeenCalled();
      expect(copyZipIntoItemSpy).toHaveBeenCalled();
    });

    it("copies ignoring file type specifying number of files per zip", async () => {
      const files: interfaces.ISourceFile[] = [
        {
          itemId: "itm1234567890",
          folder: "storageFolder",
          filename: "metadata.xml",
          file: utils.getSampleMetadataAsFile(),
        },
        {
          itemId: "itm1234567890",
          folder: "storageFolder",
          filename: "storageFilename.png",
          file: utils.getSampleImageAsFile(),
        },
      ];

      const copyDataIntoItemSpy = spyOn(copyDataIntoItem, "copyDataIntoItem").and.rejectWith(mockItems.get400Failure());
      const copyMetadataIntoItemSpy = spyOn(copyMetadataIntoItem, "copyMetadataIntoItem").and.rejectWith(
        mockItems.get400Failure(),
      );
      spyOn(restHelpersGet, "getBlobAsFile").and.resolveTo(utils.getSampleImageAsFile());
      const copyZipIntoItemSpy = spyOn(copyZipIntoItem, "copyZipIntoItem").and.returnValues(
        Promise.resolve(
          _createIZipCopyResults(true, true, [_createIAssociatedFileInfo(interfaces.EFileType.Metadata)]),
        ),
        Promise.resolve(
          _createIZipCopyResults(true, true, [_createIAssociatedFileInfo(interfaces.EFileType.Resource)]),
        ),
      );

      const results: interfaces.IAssociatedFileCopyResults[] = await copyFilesAsResources(
        files,
        "itm1234567890",
        MOCK_USER_SESSION,
        1,
      );
      expect(results).toEqual([
        _createIAssociatedFileCopyResults(true, true, interfaces.EFileType.Metadata),
        _createIAssociatedFileCopyResults(true, true, interfaces.EFileType.Resource),
      ] as interfaces.IAssociatedFileCopyResults[]);

      expect(copyDataIntoItemSpy).not.toHaveBeenCalled();
      expect(copyMetadataIntoItemSpy).not.toHaveBeenCalled();
      expect(copyZipIntoItemSpy).toHaveBeenCalled();
    });

    it("copies based on file type", async () => {
      const fileInfos: interfaces.IAssociatedFileInfo[] = [
        _createIAssociatedFileInfo(interfaces.EFileType.Data),
        _createIAssociatedFileInfo(interfaces.EFileType.Info),
        _createIAssociatedFileInfo(interfaces.EFileType.Metadata),
        _createIAssociatedFileInfo(interfaces.EFileType.Resource),
        _createIAssociatedFileInfo(interfaces.EFileType.Thumbnail),
      ];

      const copyDataIntoItemSpy = spyOn(copyDataIntoItem, "copyDataIntoItem").and.resolveTo(
        _createIAssociatedFileCopyResults(true, true, interfaces.EFileType.Data),
      );
      const copyMetadataIntoItemSpy = spyOn(copyMetadataIntoItem, "copyMetadataIntoItem").and.resolveTo(
        _createIAssociatedFileCopyResults(true, true, interfaces.EFileType.Metadata),
      );
      spyOn(restHelpersGet, "getBlobAsFile").and.resolveTo(utils.getSampleImageAsFile());
      const copyZipIntoItemSpy = spyOn(copyZipIntoItem, "copyZipIntoItem").and.resolveTo(
        _createIZipCopyResults(true, true, [
          _createIAssociatedFileInfo(interfaces.EFileType.Info),
          _createIAssociatedFileInfo(interfaces.EFileType.Resource),
        ]),
      );

      const results: interfaces.IAssociatedFileCopyResults[] = await copyAssociatedFilesByType(
        fileInfos,
        MOCK_USER_SESSION,
        "sln1234567890",
        "itm1234567890",
        MOCK_USER_SESSION,
      );
      expect(results).toEqual([
        _createIAssociatedFileCopyResults(true, true, interfaces.EFileType.Data),
        _createIAssociatedFileCopyResults(true, true, interfaces.EFileType.Metadata),
        _createIAssociatedFileCopyResults(true, true, interfaces.EFileType.Info),
        _createIAssociatedFileCopyResults(true, true, interfaces.EFileType.Resource),
      ] as interfaces.IAssociatedFileCopyResults[]);

      expect(copyDataIntoItemSpy).toHaveBeenCalled();
      expect(copyMetadataIntoItemSpy).toHaveBeenCalled();
      expect(copyZipIntoItemSpy).toHaveBeenCalled();
    });

    it("fails to get a resource", async () => {
      const fileInfos: interfaces.IAssociatedFileInfo[] = [_createIAssociatedFileInfo(interfaces.EFileType.Resource)];

      const copyDataIntoItemSpy = spyOn(copyDataIntoItem, "copyDataIntoItem").and.rejectWith(mockItems.get400Failure());
      const copyMetadataIntoItemSpy = spyOn(copyMetadataIntoItem, "copyMetadataIntoItem").and.rejectWith(
        mockItems.get400Failure(),
      );
      spyOn(restHelpersGet, "getBlobAsFile").and.rejectWith(mockItems.get400Failure());
      const copyZipIntoItemSpy = spyOn(copyZipIntoItem, "copyZipIntoItem").and.rejectWith(mockItems.get400Failure());

      const results: interfaces.IAssociatedFileCopyResults[] = await copyAssociatedFilesByType(
        fileInfos,
        MOCK_USER_SESSION,
        "sln1234567890",
        "itm1234567890",
        MOCK_USER_SESSION,
      );
      expect(results).toEqual([
        {
          folder: "fld",
          filename: "Resource",
          type: 3,
          mimeType: "text",
          url: "http://esri.com",
          fetchedFromSource: false,
          copiedToDestination: undefined,
        },
      ] as interfaces.IAssociatedFileCopyResults[]);

      expect(copyDataIntoItemSpy).not.toHaveBeenCalled();
      expect(copyMetadataIntoItemSpy).not.toHaveBeenCalled();
      expect(copyZipIntoItemSpy).not.toHaveBeenCalled();
    });
  });

  describe("copyDataIntoItem", () => {
    it("copies data file", async () => {
      const fileInfo = _createIAssociatedFileInfo();
      const getBlobSpy = spyOn(getBlob, "getBlob").and.resolveTo(utils.getSampleImageAsBlob());
      const updateItemSpy = spyOn(restHelpers, "updateItem").and.resolveTo(mockItems.get200Success());

      const results: interfaces.IAssociatedFileCopyResults = await copyDataIntoItem.copyDataIntoItem(
        fileInfo,
        MOCK_USER_SESSION,
        "itm1234567890",
        MOCK_USER_SESSION,
      );
      expect(results).toEqual(_createIAssociatedFileCopyResults(true, true));
      expect(getBlobSpy).toHaveBeenCalled();
      expect(updateItemSpy).toHaveBeenCalled();
    });

    it("fails to add data file", async () => {
      const fileInfo = _createIAssociatedFileInfo();
      const getBlobSpy = spyOn(getBlob, "getBlob").and.resolveTo(utils.getSampleImageAsBlob());
      const updateItemSpy = spyOn(restHelpers, "updateItem").and.rejectWith(mockItems.get400Failure());

      const results: interfaces.IAssociatedFileCopyResults = await copyDataIntoItem.copyDataIntoItem(
        fileInfo,
        MOCK_USER_SESSION,
        "itm1234567890",
        MOCK_USER_SESSION,
      );
      expect(results).toEqual(_createIAssociatedFileCopyResults(true, false));
      expect(getBlobSpy).toHaveBeenCalled();
      expect(updateItemSpy).toHaveBeenCalled();
    });

    it("fails to fetch data file", async () => {
      const fileInfo = _createIAssociatedFileInfo();
      const getBlobSpy = spyOn(getBlob, "getBlob").and.rejectWith(mockItems.get400Failure());
      const updateItemSpy = spyOn(restHelpers, "updateItem").and.rejectWith(mockItems.get400Failure());

      const results: interfaces.IAssociatedFileCopyResults = await copyDataIntoItem.copyDataIntoItem(
        fileInfo,
        MOCK_USER_SESSION,
        "itm1234567890",
        MOCK_USER_SESSION,
      );
      expect(results).toEqual(_createIAssociatedFileCopyResults(false));
      expect(getBlobSpy).toHaveBeenCalled();
      expect(updateItemSpy).not.toHaveBeenCalled();
    });
  });

  describe("copyMetadataIntoItem", () => {
    it("copies metadata file", async () => {
      const fileInfo = _createIAssociatedFileInfo();
      const getBlobSpy = spyOn(getBlob, "getBlob").and.resolveTo(utils.getSampleMetadataAsBlob());
      const addMetadataFromBlobSpy = spyOn(addMetadataFromBlob, "addMetadataFromBlob").and.resolveTo(
        mockItems.get200Success(),
      );

      const results: interfaces.IAssociatedFileCopyResults = await copyMetadataIntoItem.copyMetadataIntoItem(
        fileInfo,
        MOCK_USER_SESSION,
        "itm1234567890",
        MOCK_USER_SESSION,
      );
      expect(results).toEqual(_createIAssociatedFileCopyResults(true, true));
      expect(getBlobSpy).toHaveBeenCalled();
      expect(addMetadataFromBlobSpy).toHaveBeenCalled();
    });

    it("fails to add metadata file", async () => {
      const fileInfo = _createIAssociatedFileInfo();
      const getBlobSpy = spyOn(getBlob, "getBlob").and.resolveTo(utils.getSampleMetadataAsBlob());
      const addMetadataFromBlobSpy = spyOn(addMetadataFromBlob, "addMetadataFromBlob").and.rejectWith(
        mockItems.get400Failure(),
      );

      const results: interfaces.IAssociatedFileCopyResults = await copyMetadataIntoItem.copyMetadataIntoItem(
        fileInfo,
        MOCK_USER_SESSION,
        "itm1234567890",
        MOCK_USER_SESSION,
      );
      expect(results).toEqual(_createIAssociatedFileCopyResults(true, false));
      expect(getBlobSpy).toHaveBeenCalled();
      expect(addMetadataFromBlobSpy).toHaveBeenCalled();
    });

    it("fails to fetch metadata file", async () => {
      const fileInfo = _createIAssociatedFileInfo();
      const getBlobSpy = spyOn(getBlob, "getBlob").and.rejectWith(mockItems.get400Failure());
      const addMetadataFromBlobSpy = spyOn(addMetadataFromBlob, "addMetadataFromBlob").and.rejectWith(
        mockItems.get400Failure(),
      );

      const results: interfaces.IAssociatedFileCopyResults = await copyMetadataIntoItem.copyMetadataIntoItem(
        fileInfo,
        MOCK_USER_SESSION,
        "itm1234567890",
        MOCK_USER_SESSION,
      );
      expect(results).toEqual(_createIAssociatedFileCopyResults(false));
      expect(getBlobSpy).toHaveBeenCalled();
      expect(addMetadataFromBlobSpy).not.toHaveBeenCalled();
    });

    it("fetches a non-metadata file", async () => {
      const fileInfo = _createIAssociatedFileInfo();
      const getBlobSpy = spyOn(getBlob, "getBlob").and.resolveTo(utils.getSampleImageAsBlob());
      const addMetadataFromBlobSpy = spyOn(addMetadataFromBlob, "addMetadataFromBlob").and.rejectWith(
        mockItems.get400Failure(),
      );

      const results: interfaces.IAssociatedFileCopyResults = await copyMetadataIntoItem.copyMetadataIntoItem(
        fileInfo,
        MOCK_USER_SESSION,
        "itm1234567890",
        MOCK_USER_SESSION,
      );
      expect(results).toEqual(_createIAssociatedFileCopyResults(false));
      expect(getBlobSpy).toHaveBeenCalled();
      expect(addMetadataFromBlobSpy).not.toHaveBeenCalled();
    });
  });

  describe("copyResourceIntoZip", () => {
    it("should handle success copying item not in a folder", () => {
      const file = {
        itemId: "itm1234567890",
        folder: "",
        filename: "storageFilename.png",
        file: utils.getSampleImageAsFile("storageFilename.png"),
      };
      const zipInfo = _createIZipInfo();

      const results: interfaces.IAssociatedFileCopyResults = copyResourceIntoZip.copyResourceIntoZip(file, zipInfo);
      expect(results)
        .withContext("results")
        .toEqual({
          itemId: "itm1234567890",
          folder: "",
          filename: "storageFilename.png",
          file: utils.getSampleImageAsFile("storageFilename.png"),
          fetchedFromSource: true,
          copiedToDestination: undefined,
        } as interfaces.IAssociatedFileCopyResults);
      expect(Object.keys(zipInfo.zip.files).length).withContext("zip object count").toEqual(1); // file
      expect(zipInfo.zip.files["storageFilename.png"]).withContext("zip object").toBeDefined();
      expect(zipInfo.filelist.length).withContext("zip file count").toEqual(1); // file
      expect(zipInfo.filelist[0]).withContext("zip file").toEqual(file);
    });

    it("should handle success copying item in a folder", async () => {
      const fileInfo = _createIAssociatedFileInfo();
      const zipInfo = _createIZipInfo();
      const getBlobAsFileSpy = spyOn(restHelpersGet, "getBlobAsFile").and.resolveTo(utils.getSampleImageAsFile());

      const results: interfaces.IAssociatedFileCopyResults = await copyResourceIntoZip.copyResourceIntoZipFromInfo(
        fileInfo,
        MOCK_USER_SESSION,
        zipInfo,
      );
      expect(results).toEqual(_createIAssociatedFileCopyResults(true));
      expect(getBlobAsFileSpy).toHaveBeenCalled();
      expect(Object.keys(zipInfo.zip.files).length).toEqual(2); // folder + file
      expect(zipInfo.zip.files["fld/"]).toBeDefined();
      expect(zipInfo.zip.files["fld/Data"]).toBeDefined();
      expect(zipInfo.filelist.length).toEqual(1); // file
      expect(zipInfo.filelist[0]).toEqual({
        folder: "fld",
        filename: "Data",
        type: interfaces.EFileType.Data,
        mimeType: "text",
        url: "http://esri.com",
      });
    });

    it("should handle copying a file supplied as a blob rather than a url", async () => {
      const fileInfo = _createIAssociatedFileInfoAsFile();
      const zipInfo = _createIZipInfo();
      const getBlobAsFileSpy = spyOn(restHelpersGet, "getBlobAsFile").and.resolveTo(utils.getSampleImageAsFile());

      const results: interfaces.IAssociatedFileCopyResults = await copyResourceIntoZip.copyResourceIntoZipFromInfo(
        fileInfo,
        MOCK_USER_SESSION,
        zipInfo,
      );
      expect(results).toEqual(_createIAssociatedFileCopyResultsAsFile(true));
      expect(getBlobAsFileSpy).toHaveBeenCalledTimes(0);
      expect(Object.keys(zipInfo.zip.files).length).toEqual(2); // folder + file
      expect(zipInfo.zip.files["fld/"]).toBeDefined();
      expect(zipInfo.zip.files["fld/Data"]).toBeDefined();
      expect(zipInfo.filelist.length).toEqual(1); // file
      expect(zipInfo.filelist[0]).toEqual({
        folder: "fld",
        filename: "Data",
        type: interfaces.EFileType.Data,
        mimeType: "text",
        file: utils.getSampleImageAsFile(),
      });
    });

    it("should handle error copying data", async () => {
      const fileInfo = _createIAssociatedFileInfo();
      const zipInfo = _createIZipInfo();
      const getBlobAsFileSpy = spyOn(restHelpersGet, "getBlobAsFile").and.rejectWith(mockItems.get400Failure());

      const results: interfaces.IAssociatedFileCopyResults = await copyResourceIntoZip.copyResourceIntoZipFromInfo(
        fileInfo,
        MOCK_USER_SESSION,
        zipInfo,
      );
      expect(results).toEqual(_createIAssociatedFileCopyResults(false));
      expect(getBlobAsFileSpy).toHaveBeenCalled();
      expect(Object.keys(zipInfo.zip.files).length).toEqual(0);
      expect(zipInfo.filelist.length).toEqual(0);
    });
  });

  describe("copyZipIntoItem", () => {
    it("should handle success sending to item", async () => {
      const addItemResourceSpy = spyOn(portal, "addItemResource").and.resolveTo(mockItems.get200Success());

      const results: interfaces.IZipCopyResults = await copyZipIntoItem.copyZipIntoItem(
        _createIZipInfo(),
        "itm1234567890",
        MOCK_USER_SESSION,
      );
      delete (results.zip as any).clone; // don't compare clone property in zip object
      const zipInfoResults = _createIZipCopyResults(true, true);
      delete (zipInfoResults.zip as any).clone; // don't compare clone property in zip object
      expect(results).toEqual(zipInfoResults);
      expect(addItemResourceSpy).toHaveBeenCalled();
    });

    it("should handle error sending to item", async () => {
      const addItemResourceSpy = spyOn(portal, "addItemResource").and.rejectWith(mockItems.get400Failure());

      const results: interfaces.IZipCopyResults = await copyZipIntoItem.copyZipIntoItem(
        _createIZipInfo(),
        "itm1234567890",
        MOCK_USER_SESSION,
      );
      delete (results.zip as any).clone; // don't compare clone property in zip object
      const zipInfoResults = _createIZipCopyResults(true, false);
      delete (zipInfoResults.zip as any).clone; // don't compare clone property in zip object
      expect(results).toEqual(zipInfoResults);
      expect(addItemResourceSpy).toHaveBeenCalled();
    });
  });

  describe("createCopyResults", () => {
    it("should create IAssociatedFileCopyResults object", () => {
      const results = createCopyResults(
        _createIAssociatedFileInfo(),
        true,
        true,
      ) as interfaces.IAssociatedFileCopyResults;
      expect(results).toEqual(_createIAssociatedFileCopyResults(true, true));
    });

    it("should create IZipCopyResults object", () => {
      const results = createCopyResults(_createIZipInfo(), true, false) as interfaces.IZipCopyResults;
      delete (results.zip as any).clone; // don't compare clone property in zip object
      const zipInfoResults = _createIZipCopyResults(true, false);
      delete (zipInfoResults.zip as any).clone; // don't compare clone property in zip object
      expect(results).toEqual(zipInfoResults);
    });

    it("should handle defaults", () => {
      const fileInfo = {
        folder: "fld",
        filename: "name",
        type: interfaces.EFileType.Data,
      } as interfaces.IAssociatedFileInfo;
      const results = createCopyResults(fileInfo, true) as interfaces.IAssociatedFileCopyResults;
      expect(results).toEqual({
        folder: "fld",
        filename: "name",
        type: interfaces.EFileType.Data,
        fetchedFromSource: true,
        copiedToDestination: undefined,
      } as interfaces.IAssociatedFileCopyResults);
    });
  });
});

describe("_detemplatizeResources", () => {
  it("handles item types that don't need resource templatization", async () => {
    const fileInfos: interfaces.IAssociatedFileInfo[] = [
      {
        folder: "",
        filename: "",
        url: "",
      },
    ];

    const getBlobAsFileSpy = spyOn(restHelpersGet, "getBlobAsFile").and.resolveTo(utils.getSampleImageAsFile());

    await _detemplatizeResources(
      MOCK_USER_SESSION,
      "web1234567890",
      templates.getDeployedItemTemplate("web1234567981", "Web Map"),
      fileInfos,
      MOCK_USER_SESSION,
    );
    expect(getBlobAsFileSpy).toHaveBeenCalledTimes(0);
  });

  it("should create IAssociatedFileCopyResults object", async () => {
    const fileInfos: interfaces.IAssociatedFileInfo[] =
      templates.getItemTemplateResourcesAsTemplatizedFiles("Vector Tile Service");

    const getBlobAsFileSpy = spyOn(restHelpersGet, "getBlobAsFile").and.callFake(
      (
        url: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _filename: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _auth: interfaces.UserSession,
      ): Promise<File> => {
        switch (url) {
          case "https://www.arcgis.com/sharing/rest/content/items/sln1234567890/resources/vts1234567890/info/root.json":
            return Promise.resolve(generalHelpers.jsonToFile(templates.sampleInfoRootJson, "root.json"));
          case "https://www.arcgis.com/sharing/rest/content/items/sln1234567890/resources/vts1234567890/styles/root.json":
            return Promise.resolve(generalHelpers.jsonToFile(templates.sampleStylesRootJson, "root.json"));
        }
        throw new Error("Unexpected file request");
      },
    );

    await _detemplatizeResources(
      MOCK_USER_SESSION,
      "vts1234567890",
      templates.getDeployedItemTemplate("vts1234567981", "Vector Tile Service"),
      fileInfos,
      MOCK_USER_SESSION,
    );
    expect(getBlobAsFileSpy).toHaveBeenCalledTimes(2);
  });

  it("should create IAssociatedFileCopyResults object for Geoprocessing Service", async () => {
    const fileInfos: interfaces.IAssociatedFileInfo[] =
      templates.getItemTemplateResourcesAsTemplatizedFiles("Geoprocessing Service");

    const getBlobAsFileSpy = spyOn(restHelpersGet, "getBlobAsFile").and.callFake(
      (
        url: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _filename: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _auth: interfaces.UserSession,
      ): Promise<File> => {
        switch (url) {
          case "https://www.arcgis.com/sharing/rest/content/items/sln1234567890/resources/gs1234567890/info/webtoolDefinition.json":
            return Promise.resolve(
              generalHelpers.jsonToFile(templates.sampleWebToolTemplatizedJson, "webtoolDefinition.json"),
            );
        }
        throw new Error("Unexpected file request");
      },
    );

    const templateDictionary = {};
    templateDictionary["aaa637ded3a74a7f9c2325a043f59fb6"] = {
      itemId: "bbb637ded3a74a7f9c2325a043f59fb6",
    };

    await _detemplatizeResources(
      MOCK_USER_SESSION,
      "gs1234567890",
      templates.getDeployedItemTemplate("gs1234567981", "Geoprocessing Service", ["aaa637ded3a74a7f9c2325a043f59fb6"]),
      fileInfos,
      MOCK_USER_SESSION,
      templateDictionary,
    );
    expect(getBlobAsFileSpy).toHaveBeenCalledTimes(1);
  });
});

// ----- Helper functions for tests --------------------------------------------------------------------------------- //

function _createIAssociatedFileCopyResults(
  fetchedFromSource?: boolean,
  copiedToDestination?: boolean,
  type = interfaces.EFileType.Data,
): interfaces.IAssociatedFileCopyResults {
  return {
    folder: "fld",
    filename: interfaces.SFileType[type],
    type,
    mimeType: "text",
    url: "http://esri.com",
    fetchedFromSource,
    copiedToDestination,
  } as interfaces.IAssociatedFileCopyResults;
}

function _createIAssociatedFileCopyResultsAsFile(
  fetchedFromSource?: boolean,
  copiedToDestination?: boolean,
  type = interfaces.EFileType.Data,
): interfaces.IAssociatedFileCopyResults {
  return {
    folder: "fld",
    filename: interfaces.SFileType[type],
    type,
    mimeType: "text",
    file: utils.getSampleImageAsFile(),
    fetchedFromSource,
    copiedToDestination,
  } as interfaces.IAssociatedFileCopyResults;
}

function _createIAssociatedFileInfo(type = interfaces.EFileType.Data): interfaces.IAssociatedFileInfo {
  return {
    folder: "fld",
    filename: interfaces.SFileType[type],
    type,
    mimeType: "text",
    url: "http://esri.com",
  } as interfaces.IAssociatedFileInfo;
}

function _createIAssociatedFileInfoAsFile(type = interfaces.EFileType.Data): interfaces.IAssociatedFileInfo {
  return {
    folder: "fld",
    filename: interfaces.SFileType[type],
    type,
    mimeType: "text",
    file: utils.getSampleImageAsFile(),
  } as interfaces.IAssociatedFileInfo;
}

function _createIZipCopyResults(
  fetchedFromSource?: boolean,
  copiedToDestination?: boolean,
  filelist: interfaces.IAssociatedFileInfo[] = [],
): interfaces.IZipCopyResults {
  return {
    filename: "name",
    zip: new JSZip(),
    filelist,
    fetchedFromSource,
    copiedToDestination,
  } as interfaces.IZipCopyResults;
}

function _createIZipInfo(): interfaces.IZipInfo {
  return {
    filename: "name",
    zip: new JSZip(),
    filelist: [] as interfaces.IAssociatedFileInfo[],
  } as interfaces.IZipInfo;
}
