/** @license
 * Copyright 2020 Esri
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

import { convertStorageResourceToItemResource } from "../../src/resources/convert-storage-resource-to-item-resource";

import { IDeployFilename, EFileType } from "../../src/interfaces";

describe("convertStorageResourceToItemResource, template version 0", () => {
  it("handles top-level image file", () => {
    const actual = convertStorageResourceToItemResource("87f/gtnp2.jpg");
    const expected: IDeployFilename = {
      type: EFileType.Resource,
      folder: "",
      filename: "gtnp2.jpg"
    };
    expect(actual).toEqual(expected);
  });

  it("handles image file in folder", () => {
    const actual = convertStorageResourceToItemResource(
      "87f_aFolder/git_merge.png"
    );
    const expected: IDeployFilename = {
      type: EFileType.Resource,
      folder: "aFolder",
      filename: "git_merge.png"
    };
    expect(actual).toEqual(expected);
  });

  it("handles Hub image file at the root", () => {
    const actual = convertStorageResourceToItemResource("87f-git_merge.png");
    const expected: IDeployFilename = {
      type: EFileType.Resource,
      folder: "",
      filename: "87f-git_merge.png"
    };

    expect(actual).toEqual(expected);
  });

  it("handles metadata file", () => {
    const actual = convertStorageResourceToItemResource(
      "87f_info_metadata/metadata.xml"
    );
    const expected: IDeployFilename = {
      type: EFileType.Metadata,
      folder: "",
      filename: "metadata.xml"
    };
    expect(actual).toEqual(expected);
  });

  it("handles thumbnail", () => {
    const actual = convertStorageResourceToItemResource(
      "87f_info_thumbnail/thumbnail.png"
    );
    const expected: IDeployFilename = {
      type: EFileType.Thumbnail,
      folder: "",
      filename: "thumbnail.png"
    };
    expect(actual).toEqual(expected);
  });

  it("handles data file supported by AGO for resources", () => {
    const actual = convertStorageResourceToItemResource(
      "87f_info_data/data.zip"
    );
    const expected: IDeployFilename = {
      type: EFileType.Data,
      folder: "",
      filename: "data.zip"
    };
    expect(actual).toEqual(expected);
  });

  it("handles data file unsupported by AGO for resources and thus masquerading as a ZIP file", () => {
    const actual = convertStorageResourceToItemResource(
      "87f_info_dataz/data.pkg.zip"
    );
    const expected: IDeployFilename = {
      type: EFileType.Data,
      folder: "",
      filename: "data.pkg"
    };

    expect(actual).toEqual(expected);
  });
});

describe("convertStorageResourceToItemResource, template version 1", () => {
  it("handles top-level image file", () => {
    const actual = convertStorageResourceToItemResource("87f/gtnp2.jpg", 1);
    const expected: IDeployFilename = {
      type: EFileType.Resource,
      folder: "",
      filename: "gtnp2.jpg"
    };
    expect(actual).toEqual(expected);
  });

  it("handles image file in folder", () => {
    const actual = convertStorageResourceToItemResource(
      "87f/aFolder/git_merge.png",
      1
    );
    const expected: IDeployFilename = {
      type: EFileType.Resource,
      folder: "aFolder",
      filename: "git_merge.png"
    };
    expect(actual).toEqual(expected);
  });

  it("handles Hub image file at the root", () => {
    const actual = convertStorageResourceToItemResource("87f-git_merge.png", 1);
    const expected: IDeployFilename = {
      type: EFileType.Resource,
      folder: "",
      filename: "87f-git_merge.png"
    };

    expect(actual).toEqual(expected);
  });

  it("handles metadata file", () => {
    const actual = convertStorageResourceToItemResource(
      "87f_info_metadata/metadata.xml",
      1
    );
    const expected: IDeployFilename = {
      type: EFileType.Metadata,
      folder: "",
      filename: "metadata.xml"
    };
    expect(actual).toEqual(expected);
  });

  it("handles thumbnail", () => {
    const actual = convertStorageResourceToItemResource(
      "87f_info_thumbnail/thumbnail.png",
      1
    );
    const expected: IDeployFilename = {
      type: EFileType.Thumbnail,
      folder: "",
      filename: "thumbnail.png"
    };
    expect(actual).toEqual(expected);
  });

  it("handles data file supported by AGO for resources", () => {
    const actual = convertStorageResourceToItemResource(
      "87f_info_data/data.zip",
      1
    );
    const expected: IDeployFilename = {
      type: EFileType.Data,
      folder: "",
      filename: "data.zip"
    };
    expect(actual).toEqual(expected);
  });

  it("handles data file unsupported by AGO for resources and thus masquerading as a ZIP file", () => {
    const actual = convertStorageResourceToItemResource(
      "87f_info_dataz/data.pkg.zip",
      1
    );
    const expected: IDeployFilename = {
      type: EFileType.Data,
      folder: "",
      filename: "data.pkg"
    };

    expect(actual).toEqual(expected);
  });
});
