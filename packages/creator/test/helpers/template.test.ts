/** @license
 * Copyright 2022 Esri
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

import {
  IItemTemplate,
  ISourceFile
} from "@esri/solution-common";
import {
  getDataFilesFromTemplates,
  removeDataFilesFromTemplates
} from "../../src/helpers/template";
import {
  getItemTemplate
} from "../../../common/test/mocks/templates";

describe("template", () => {
  function fakeSourceFile(filename: string): ISourceFile {
    return {
      itemId: "id",
      folder: "",
      filename
    } as ISourceFile;
  }

  it("extracts resource data files from templates", () => {
    // Create a list of 6 templates of which 3 have data
    const templates: IItemTemplate[] = Array(6).fill(null).map(() => getItemTemplate("Form"));
    templates[1].dataFile = fakeSourceFile("file 1");
    templates[4].dataFile = fakeSourceFile("file 4");
    templates[5].dataFile = fakeSourceFile("file 5");

    const dataFiles: ISourceFile[] = getDataFilesFromTemplates(templates);
    expect(dataFiles.length).toEqual(3);
    expect(dataFiles[0].filename).toEqual("file 1");
    expect(dataFiles[1].filename).toEqual("file 4");
    expect(dataFiles[2].filename).toEqual("file 5");
  });

  it("removes data files from templates", () => {
    // Create a list of 6 templates of which 3 have data
    const templates: IItemTemplate[] = Array(6).fill(null).map(() => getItemTemplate("Form"));
    templates[1].dataFile = fakeSourceFile("file 1");
    templates[4].dataFile = fakeSourceFile("file 4");
    templates[5].dataFile = fakeSourceFile("file 5");

    removeDataFilesFromTemplates(templates);
    const dataFiles: ISourceFile[] = getDataFilesFromTemplates(templates);
    expect(dataFiles.length).toEqual(0);
  });
});
