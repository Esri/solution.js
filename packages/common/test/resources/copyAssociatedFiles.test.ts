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
import * as getBlob from "../../src/resources/get-blob";
import * as interfaces from "../../src/interfaces";
import * as portal from "@esri/arcgis-rest-portal";
import * as resourceHelpers from "../../src/resourceHelpers";
import * as restHelpers from "../../src/restHelpers";
import * as restHelpersGet from "../../src/restHelpersGet";
import {
  copyFilesAsResources,
  copyAssociatedFilesByType
} from "../../src/resources/copyAssociatedFiles";
import { createCopyResults } from "../../src/resources/createCopyResults";
import JSZip from "jszip";

import * as mockItems from "../mocks/agolItems";
import * as utils from "../mocks/utils";

// ------------------------------------------------------------------------------------------------------------------ //

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

describe("Module `copyAssociatedFiles`: functions for sending resources to AGO", () => {
  describe("addMetadataFromBlob", () => {
    it("can add metadata", done => {
      const blob = utils.getSampleMetadataAsBlob();
      const updateItemSpy = spyOn(portal, "updateItem").and.resolveTo(
        mockItems.get200Success()
      );

      addMetadataFromBlob
        .addMetadataFromBlob(blob, "itm1234567890", MOCK_USER_SESSION)
        .then((results: any) => {
          expect(results.success).toBeTruthy();
          done();
        }, done.fail);
    });

    it("can fail to add metadata", done => {
      const blob = utils.getSampleMetadataAsBlob();
      const updateItemSpy = spyOn(portal, "updateItem").and.rejectWith(
        mockItems.get400Failure()
      );

      addMetadataFromBlob
        .addMetadataFromBlob(blob, "itm1234567890", MOCK_USER_SESSION)
        .then(done.fail, (results: any) => {
          expect(results.error.code).toEqual(400);
          done();
        });
    });
  });

  describe("copyAssociatedFiles", () => {
    it("handles empty list of files", done => {
      const fileInfos: interfaces.IAssociatedFileInfo[] = [];

      const copyDataIntoItemSpy = spyOn(
        copyDataIntoItem,
        "copyDataIntoItem"
      ).and.rejectWith(mockItems.get400Failure());
      const copyMetadataIntoItemSpy = spyOn(
        copyMetadataIntoItem,
        "copyMetadataIntoItem"
      ).and.rejectWith(mockItems.get400Failure());
      const copyResourceIntoZipSpy = spyOn(
        copyResourceIntoZip,
        "copyResourceIntoZip"
      ).and.returnValue(null);
      const copyZipIntoItemSpy = spyOn(
        copyZipIntoItem,
        "copyZipIntoItem"
      ).and.rejectWith(mockItems.get400Failure());

      copyAssociatedFilesByType(
        fileInfos,
        MOCK_USER_SESSION,
        "itm1234567890",
        MOCK_USER_SESSION
      ).then((results: interfaces.IAssociatedFileCopyResults[]) => {
        expect(results).toEqual([] as interfaces.IAssociatedFileCopyResults[]);

        expect(copyDataIntoItemSpy).not.toHaveBeenCalled();
        expect(copyMetadataIntoItemSpy).not.toHaveBeenCalled();
        expect(copyResourceIntoZipSpy).not.toHaveBeenCalled();
        expect(copyZipIntoItemSpy).not.toHaveBeenCalled();

        done();
      }, done.fail);
    });

    it("copies ignoring file type", done => {
      const files: interfaces.ISourceFile[] = [
        {
          itemId: "itm1234567890",
          folder: "storageFolder",
          filename: "metadata.xml",
          file: utils.getSampleMetadataAsFile()
        },
        {
          itemId: "itm1234567890",
          folder: "storageFolder",
          filename: "storageFilename.png",
          file: utils.getSampleImageAsFile()
        }
      ];

      const copyDataIntoItemSpy = spyOn(
        copyDataIntoItem,
        "copyDataIntoItem"
      ).and.rejectWith(mockItems.get400Failure());
      const copyMetadataIntoItemSpy = spyOn(
        copyMetadataIntoItem,
        "copyMetadataIntoItem"
      ).and.rejectWith(mockItems.get400Failure());
      const getBlobAsFileSpy = spyOn(
        restHelpersGet,
        "getBlobAsFile"
      ).and.resolveTo(utils.getSampleImageAsFile());
      const copyZipIntoItemSpy = spyOn(
        copyZipIntoItem,
        "copyZipIntoItem"
      ).and.resolveTo(
        _createIZipCopyResults(true, true, [
          _createIAssociatedFileInfo(interfaces.EFileType.Metadata),
          _createIAssociatedFileInfo(interfaces.EFileType.Resource)
        ])
      );

      copyFilesAsResources(files, "itm1234567890", MOCK_USER_SESSION).then(
        (results: interfaces.IAssociatedFileCopyResults[]) => {
          expect(results).toEqual([
            _createIAssociatedFileCopyResults(
              true,
              true,
              interfaces.EFileType.Metadata
            ),
            _createIAssociatedFileCopyResults(
              true,
              true,
              interfaces.EFileType.Resource
            )
          ] as interfaces.IAssociatedFileCopyResults[]);

          expect(copyDataIntoItemSpy).not.toHaveBeenCalled();
          expect(copyMetadataIntoItemSpy).not.toHaveBeenCalled();
          expect(copyZipIntoItemSpy).toHaveBeenCalled();

          done();
        },
        done.fail
      );
    });

    it("copies ignoring file type specifying number of files per zip", done => {
      const files: interfaces.ISourceFile[] = [
        {
          itemId: "itm1234567890",
          folder: "storageFolder",
          filename: "metadata.xml",
          file: utils.getSampleMetadataAsFile()
        },
        {
          itemId: "itm1234567890",
          folder: "storageFolder",
          filename: "storageFilename.png",
          file: utils.getSampleImageAsFile()
        }
      ];

      const copyDataIntoItemSpy = spyOn(
        copyDataIntoItem,
        "copyDataIntoItem"
      ).and.rejectWith(mockItems.get400Failure());
      const copyMetadataIntoItemSpy = spyOn(
        copyMetadataIntoItem,
        "copyMetadataIntoItem"
      ).and.rejectWith(mockItems.get400Failure());
      const getBlobAsFileSpy = spyOn(
        restHelpersGet,
        "getBlobAsFile"
      ).and.resolveTo(utils.getSampleImageAsFile());
      const copyZipIntoItemSpy = spyOn(
        copyZipIntoItem,
        "copyZipIntoItem"
      ).and.returnValues(
        Promise.resolve(
          _createIZipCopyResults(true, true, [
            _createIAssociatedFileInfo(interfaces.EFileType.Metadata)
          ])
        ),
        Promise.resolve(
          _createIZipCopyResults(true, true, [
            _createIAssociatedFileInfo(interfaces.EFileType.Resource)
          ])
        )
      );

      copyFilesAsResources(files, "itm1234567890", MOCK_USER_SESSION, 1).then(
        (results: interfaces.IAssociatedFileCopyResults[]) => {
          expect(results).toEqual([
            _createIAssociatedFileCopyResults(
              true,
              true,
              interfaces.EFileType.Metadata
            ),
            _createIAssociatedFileCopyResults(
              true,
              true,
              interfaces.EFileType.Resource
            )
          ] as interfaces.IAssociatedFileCopyResults[]);

          expect(copyDataIntoItemSpy).not.toHaveBeenCalled();
          expect(copyMetadataIntoItemSpy).not.toHaveBeenCalled();
          expect(copyZipIntoItemSpy).toHaveBeenCalled();

          done();
        },
        done.fail
      );
    });

    it("copies based on file type", done => {
      const fileInfos: interfaces.IAssociatedFileInfo[] = [
        _createIAssociatedFileInfo(interfaces.EFileType.Data),
        _createIAssociatedFileInfo(interfaces.EFileType.Info),
        _createIAssociatedFileInfo(interfaces.EFileType.Metadata),
        _createIAssociatedFileInfo(interfaces.EFileType.Resource),
        _createIAssociatedFileInfo(interfaces.EFileType.Thumbnail)
      ];

      const copyDataIntoItemSpy = spyOn(
        copyDataIntoItem,
        "copyDataIntoItem"
      ).and.resolveTo(
        _createIAssociatedFileCopyResults(true, true, interfaces.EFileType.Data)
      );
      const copyMetadataIntoItemSpy = spyOn(
        copyMetadataIntoItem,
        "copyMetadataIntoItem"
      ).and.resolveTo(
        _createIAssociatedFileCopyResults(
          true,
          true,
          interfaces.EFileType.Metadata
        )
      );
      const getBlobAsFileSpy = spyOn(
        restHelpersGet,
        "getBlobAsFile"
      ).and.resolveTo(utils.getSampleImageAsFile());
      const copyZipIntoItemSpy = spyOn(
        copyZipIntoItem,
        "copyZipIntoItem"
      ).and.resolveTo(
        _createIZipCopyResults(true, true, [
          _createIAssociatedFileInfo(interfaces.EFileType.Info),
          _createIAssociatedFileInfo(interfaces.EFileType.Resource)
        ])
      );

      copyAssociatedFilesByType(
        fileInfos,
        MOCK_USER_SESSION,
        "itm1234567890",
        MOCK_USER_SESSION
      ).then((results: interfaces.IAssociatedFileCopyResults[]) => {
        expect(results).toEqual([
          _createIAssociatedFileCopyResults(
            true,
            true,
            interfaces.EFileType.Data
          ),
          _createIAssociatedFileCopyResults(
            true,
            true,
            interfaces.EFileType.Metadata
          ),
          _createIAssociatedFileCopyResults(
            true,
            true,
            interfaces.EFileType.Info
          ),
          _createIAssociatedFileCopyResults(
            true,
            true,
            interfaces.EFileType.Resource
          )
        ] as interfaces.IAssociatedFileCopyResults[]);

        expect(copyDataIntoItemSpy).toHaveBeenCalled();
        expect(copyMetadataIntoItemSpy).toHaveBeenCalled();
        expect(copyZipIntoItemSpy).toHaveBeenCalled();

        done();
      }, done.fail);
    });

    it("fails to get a resource", done => {
      const fileInfos: interfaces.IAssociatedFileInfo[] = [
        _createIAssociatedFileInfo(interfaces.EFileType.Resource)
      ];

      const copyDataIntoItemSpy = spyOn(
        copyDataIntoItem,
        "copyDataIntoItem"
      ).and.rejectWith(mockItems.get400Failure());
      const copyMetadataIntoItemSpy = spyOn(
        copyMetadataIntoItem,
        "copyMetadataIntoItem"
      ).and.rejectWith(mockItems.get400Failure());
      const getBlobAsFileSpy = spyOn(
        restHelpersGet,
        "getBlobAsFile"
      ).and.rejectWith(mockItems.get400Failure());
      const copyZipIntoItemSpy = spyOn(
        copyZipIntoItem,
        "copyZipIntoItem"
      ).and.rejectWith(mockItems.get400Failure());

      copyAssociatedFilesByType(
        fileInfos,
        MOCK_USER_SESSION,
        "itm1234567890",
        MOCK_USER_SESSION
      ).then((results: interfaces.IAssociatedFileCopyResults[]) => {
        expect(results).toEqual([
          {
            folder: "fld",
            filename: "Resource",
            type: 3,
            mimeType: "text",
            url: "http://esri.com",
            fetchedFromSource: false,
            copiedToDestination: undefined
          }
        ] as interfaces.IAssociatedFileCopyResults[]);

        expect(copyDataIntoItemSpy).not.toHaveBeenCalled();
        expect(copyMetadataIntoItemSpy).not.toHaveBeenCalled();
        expect(copyZipIntoItemSpy).not.toHaveBeenCalled();

        done();
      }, done.fail);
    });
  });

  describe("copyDataIntoItem", () => {
    it("copies data file", done => {
      const fileInfo = _createIAssociatedFileInfo();
      const getBlobSpy = spyOn(getBlob, "getBlob").and.resolveTo(
        utils.getSampleImageAsBlob()
      );
      const updateItemSpy = spyOn(restHelpers, "updateItem").and.resolveTo(
        mockItems.get200Success()
      );

      copyDataIntoItem
        .copyDataIntoItem(
          fileInfo,
          MOCK_USER_SESSION,
          "itm1234567890",
          MOCK_USER_SESSION
        )
        .then((results: interfaces.IAssociatedFileCopyResults) => {
          expect(results).toEqual(
            _createIAssociatedFileCopyResults(true, true)
          );
          expect(getBlobSpy).toHaveBeenCalled();
          expect(updateItemSpy).toHaveBeenCalled();
          done();
        }, done.fail);
    });

    it("fails to add data file", done => {
      const fileInfo = _createIAssociatedFileInfo();
      const getBlobSpy = spyOn(getBlob, "getBlob").and.resolveTo(
        utils.getSampleImageAsBlob()
      );
      const updateItemSpy = spyOn(restHelpers, "updateItem").and.rejectWith(
        mockItems.get400Failure()
      );

      copyDataIntoItem
        .copyDataIntoItem(
          fileInfo,
          MOCK_USER_SESSION,
          "itm1234567890",
          MOCK_USER_SESSION
        )
        .then((results: interfaces.IAssociatedFileCopyResults) => {
          expect(results).toEqual(
            _createIAssociatedFileCopyResults(true, false)
          );
          expect(getBlobSpy).toHaveBeenCalled();
          expect(updateItemSpy).toHaveBeenCalled();
          done();
        }, done.fail);
    });

    it("fails to fetch data file", done => {
      const fileInfo = _createIAssociatedFileInfo();
      const getBlobSpy = spyOn(getBlob, "getBlob").and.rejectWith(
        mockItems.get400Failure()
      );
      const updateItemSpy = spyOn(restHelpers, "updateItem").and.rejectWith(
        mockItems.get400Failure()
      );

      copyDataIntoItem
        .copyDataIntoItem(
          fileInfo,
          MOCK_USER_SESSION,
          "itm1234567890",
          MOCK_USER_SESSION
        )
        .then((results: interfaces.IAssociatedFileCopyResults) => {
          expect(results).toEqual(_createIAssociatedFileCopyResults(false));
          expect(getBlobSpy).toHaveBeenCalled();
          expect(updateItemSpy).not.toHaveBeenCalled();
          done();
        }, done.fail);
    });
  });

  describe("copyMetadataIntoItem", () => {
    it("copies metadata file", done => {
      const fileInfo = _createIAssociatedFileInfo();
      const getBlobSpy = spyOn(getBlob, "getBlob").and.resolveTo(
        utils.getSampleMetadataAsBlob()
      );
      const addMetadataFromBlobSpy = spyOn(
        addMetadataFromBlob,
        "addMetadataFromBlob"
      ).and.resolveTo(mockItems.get200Success());

      copyMetadataIntoItem
        .copyMetadataIntoItem(
          fileInfo,
          MOCK_USER_SESSION,
          "itm1234567890",
          MOCK_USER_SESSION
        )
        .then((results: interfaces.IAssociatedFileCopyResults) => {
          expect(results).toEqual(
            _createIAssociatedFileCopyResults(true, true)
          );
          expect(getBlobSpy).toHaveBeenCalled();
          expect(addMetadataFromBlobSpy).toHaveBeenCalled();
          done();
        }, done.fail);
    });

    it("fails to add metadata file", done => {
      const fileInfo = _createIAssociatedFileInfo();
      const getBlobSpy = spyOn(getBlob, "getBlob").and.resolveTo(
        utils.getSampleMetadataAsBlob()
      );
      const addMetadataFromBlobSpy = spyOn(
        addMetadataFromBlob,
        "addMetadataFromBlob"
      ).and.rejectWith(mockItems.get400Failure());

      copyMetadataIntoItem
        .copyMetadataIntoItem(
          fileInfo,
          MOCK_USER_SESSION,
          "itm1234567890",
          MOCK_USER_SESSION
        )
        .then((results: interfaces.IAssociatedFileCopyResults) => {
          expect(results).toEqual(
            _createIAssociatedFileCopyResults(true, false)
          );
          expect(getBlobSpy).toHaveBeenCalled();
          expect(addMetadataFromBlobSpy).toHaveBeenCalled();
          done();
        }, done.fail);
    });

    it("fails to fetch metadata file", done => {
      const fileInfo = _createIAssociatedFileInfo();
      const getBlobSpy = spyOn(getBlob, "getBlob").and.rejectWith(
        mockItems.get400Failure()
      );
      const addMetadataFromBlobSpy = spyOn(
        addMetadataFromBlob,
        "addMetadataFromBlob"
      ).and.rejectWith(mockItems.get400Failure());

      copyMetadataIntoItem
        .copyMetadataIntoItem(
          fileInfo,
          MOCK_USER_SESSION,
          "itm1234567890",
          MOCK_USER_SESSION
        )
        .then((results: interfaces.IAssociatedFileCopyResults) => {
          expect(results).toEqual(_createIAssociatedFileCopyResults(false));
          expect(getBlobSpy).toHaveBeenCalled();
          expect(addMetadataFromBlobSpy).not.toHaveBeenCalled();
          done();
        }, done.fail);
    });

    it("fetches a non-metadata file", done => {
      const fileInfo = _createIAssociatedFileInfo();
      const getBlobSpy = spyOn(getBlob, "getBlob").and.resolveTo(
        utils.getSampleImageAsBlob()
      );
      const addMetadataFromBlobSpy = spyOn(
        addMetadataFromBlob,
        "addMetadataFromBlob"
      ).and.rejectWith(mockItems.get400Failure());

      copyMetadataIntoItem
        .copyMetadataIntoItem(
          fileInfo,
          MOCK_USER_SESSION,
          "itm1234567890",
          MOCK_USER_SESSION
        )
        .then((results: interfaces.IAssociatedFileCopyResults) => {
          expect(results).toEqual(_createIAssociatedFileCopyResults(false));
          expect(getBlobSpy).toHaveBeenCalled();
          expect(addMetadataFromBlobSpy).not.toHaveBeenCalled();
          done();
        }, done.fail);
    });
  });

  describe("copyResourceIntoZip", () => {
    it("should handle success copying item not in a folder", () => {
      const file = {
        itemId: "itm1234567890",
        folder: "",
        filename: "storageFilename.png",
        file: utils.getSampleImageAsFile("storageFilename.png")
      };
      const zipInfo = _createIZipInfo();

      const results: interfaces.IAssociatedFileCopyResults = copyResourceIntoZip.copyResourceIntoZip(
        file,
        zipInfo
      );
      expect(results)
        .withContext("results")
        .toEqual({
          itemId: "itm1234567890",
          folder: "",
          filename: "storageFilename.png",
          file: utils.getSampleImageAsFile("storageFilename.png"),
          fetchedFromSource: true,
          copiedToDestination: undefined
        } as interfaces.IAssociatedFileCopyResults);
      expect(Object.keys(zipInfo.zip.files).length)
        .withContext("zip object count")
        .toEqual(1); // file
      expect(zipInfo.zip.files["storageFilename.png"])
        .withContext("zip object")
        .toBeDefined();
      expect(zipInfo.filelist.length)
        .withContext("zip file count")
        .toEqual(1); // file
      expect(zipInfo.filelist[0])
        .withContext("zip file")
        .toEqual(file);
    });

    it("should handle success copying item in a folder", done => {
      const fileInfo = _createIAssociatedFileInfo();
      const zipInfo = _createIZipInfo();
      const getBlobAsFileSpy = spyOn(
        restHelpersGet,
        "getBlobAsFile"
      ).and.resolveTo(utils.getSampleImageAsFile());

      copyResourceIntoZip
        .copyResourceIntoZipFromInfo(fileInfo, MOCK_USER_SESSION, zipInfo)
        .then((results: interfaces.IAssociatedFileCopyResults) => {
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
            url: "http://esri.com"
          });
          done();
        }, done.fail);
    });

    it("should handle error copying data", done => {
      const fileInfo = _createIAssociatedFileInfo();
      const zipInfo = _createIZipInfo();
      const getBlobAsFileSpy = spyOn(
        restHelpersGet,
        "getBlobAsFile"
      ).and.rejectWith(mockItems.get400Failure());

      copyResourceIntoZip
        .copyResourceIntoZipFromInfo(fileInfo, MOCK_USER_SESSION, zipInfo)
        .then((results: interfaces.IAssociatedFileCopyResults) => {
          expect(results).toEqual(_createIAssociatedFileCopyResults(false));
          expect(getBlobAsFileSpy).toHaveBeenCalled();
          expect(Object.keys(zipInfo.zip.files).length).toEqual(0);
          expect(zipInfo.filelist.length).toEqual(0);
          done();
        }, done.fail);
    });
  });

  describe("copyZipIntoItem", () => {
    it("should handle success sending to item", done => {
      const addItemResourceSpy = spyOn(portal, "addItemResource").and.resolveTo(
        mockItems.get200Success()
      );

      copyZipIntoItem
        .copyZipIntoItem(_createIZipInfo(), "itm1234567890", MOCK_USER_SESSION)
        .then((results: interfaces.IZipCopyResults) => {
          delete (results.zip as any).clone; // don't compare clone property in zip object
          const zipInfoResults = _createIZipCopyResults(true, true);
          delete (zipInfoResults.zip as any).clone; // don't compare clone property in zip object
          expect(results).toEqual(zipInfoResults);
          expect(addItemResourceSpy).toHaveBeenCalled();
          done();
        }, done.fail);
    });

    it("should handle error sending to item", done => {
      const addItemResourceSpy = spyOn(
        portal,
        "addItemResource"
      ).and.rejectWith(mockItems.get400Failure());

      copyZipIntoItem
        .copyZipIntoItem(_createIZipInfo(), "itm1234567890", MOCK_USER_SESSION)
        .then((results: interfaces.IZipCopyResults) => {
          delete (results.zip as any).clone; // don't compare clone property in zip object
          const zipInfoResults = _createIZipCopyResults(true, false);
          delete (zipInfoResults.zip as any).clone; // don't compare clone property in zip object
          expect(results).toEqual(zipInfoResults);
          expect(addItemResourceSpy).toHaveBeenCalled();
          done();
        }, done.fail);
    });
  });

  describe("createCopyResults", () => {
    it("should create IAssociatedFileCopyResults object", () => {
      const results = createCopyResults(
        _createIAssociatedFileInfo(),
        true,
        true
      ) as interfaces.IAssociatedFileCopyResults;
      expect(results).toEqual(_createIAssociatedFileCopyResults(true, true));
    });

    it("should create IZipCopyResults object", () => {
      const results = createCopyResults(
        _createIZipInfo(),
        true,
        false
      ) as interfaces.IZipCopyResults;
      delete (results.zip as any).clone; // don't compare clone property in zip object
      const zipInfoResults = _createIZipCopyResults(true, false);
      delete (zipInfoResults.zip as any).clone; // don't compare clone property in zip object
      expect(results).toEqual(zipInfoResults);
    });

    it("should handle defaults", () => {
      const fileInfo = {
        folder: "fld",
        filename: "name",
        type: interfaces.EFileType.Data
      } as interfaces.IAssociatedFileInfo;
      const results = createCopyResults(
        fileInfo,
        true
      ) as interfaces.IAssociatedFileCopyResults;
      expect(results).toEqual({
        folder: "fld",
        filename: "name",
        type: interfaces.EFileType.Data,
        fetchedFromSource: true,
        copiedToDestination: undefined
      } as interfaces.IAssociatedFileCopyResults);
    });
  });
});

// ----- Helper functions for tests --------------------------------------------------------------------------------- //

function _createIAssociatedFileCopyResults(
  fetchedFromSource?: boolean,
  copiedToDestination?: boolean,
  type = interfaces.EFileType.Data
): interfaces.IAssociatedFileCopyResults {
  return {
    folder: "fld",
    filename: interfaces.SFileType[type],
    type,
    mimeType: "text",
    url: "http://esri.com",
    fetchedFromSource,
    copiedToDestination
  } as interfaces.IAssociatedFileCopyResults;
}

function _createIAssociatedFileInfo(
  type = interfaces.EFileType.Data
): interfaces.IAssociatedFileInfo {
  return {
    folder: "fld",
    filename: interfaces.SFileType[type],
    type,
    mimeType: "text",
    url: "http://esri.com"
  } as interfaces.IAssociatedFileInfo;
}

function _createIZipCopyResults(
  fetchedFromSource?: boolean,
  copiedToDestination?: boolean,
  filelist: interfaces.IAssociatedFileInfo[] = []
): interfaces.IZipCopyResults {
  return {
    filename: "name",
    zip: new JSZip(),
    filelist,
    fetchedFromSource,
    copiedToDestination
  } as interfaces.IZipCopyResults;
}

function _createIZipInfo(): interfaces.IZipInfo {
  return {
    filename: "name",
    zip: new JSZip(),
    filelist: [] as interfaces.IAssociatedFileInfo[]
  } as interfaces.IZipInfo;
}
