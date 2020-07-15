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

import * as common from "@esri/solution-common";
import * as templates from "../../../common/test/mocks/templates";
import { refineNotebookTemplate } from "../../src/notebook/refine-notebook-template";

describe("refineNotebookTemplate :: ", () => {
  it("should handle missing python notebook content: no data", () => {
    const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
      "Notebook"
    );
    itemTemplate.data = null;
    const expected = common.cloneObject(itemTemplate);

    const result: common.IItemTemplate = refineNotebookTemplate(itemTemplate);
    expect(result).toEqual(expected);
  });

  it("should handle missing python notebook content: duplicate ids, but not in dependencies", () => {
    const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
      "Notebook"
    );
    itemTemplate.data.cells.push(itemTemplate.data.cells[0]);
    const expected = common.cloneObject(itemTemplate);
    expected.dependencies = ["3b927de78a784a5aa3981469d85cf45d"];
    itemTemplate.data.cells[0].source = "3b927de78a784a5aa3981469d85cf45d";
    itemTemplate.data.cells[1].source = "3b927de78a784a5aa3981469d85cf45d";

    const result: common.IItemTemplate = refineNotebookTemplate(itemTemplate);
    expect(result).toEqual(expected);
  });

  it("should handle missing python notebook content: duplicate ids in dependencies", () => {
    const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
      "Notebook",
      ["3b927de78a784a5aa3981469d85cf45d"]
    );
    itemTemplate.data.cells.push(itemTemplate.data.cells[0]);
    const expected = common.cloneObject(itemTemplate);
    itemTemplate.data.cells[0].source = "3b927de78a784a5aa3981469d85cf45d";
    itemTemplate.data.cells[1].source = "3b927de78a784a5aa3981469d85cf45d";

    const result: common.IItemTemplate = refineNotebookTemplate(itemTemplate);
    expect(result).toEqual(expected);
  });
});
