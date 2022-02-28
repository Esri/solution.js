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

import { convertItemResourceToStorageResource } from "../../src/resources/convert-item-resource-to-storage-resource";
import { SolutionResourceType } from "../../src/resources/solution-resource";

describe("convertItemResourceToStorageResource, template version 0", () => {
  it("handles files", () => {
    const chk = convertItemResourceToStorageResource("3ef", "happy.png");
    expect(chk.folder).toBe("3ef");
    expect(chk.filename).toBe("happy.png");
  });

  it("handles files with single level paths", () => {
    const chk = convertItemResourceToStorageResource("3ef", "images/happy.png");
    expect(chk.folder).toBe("3ef_images");
    expect(chk.filename).toBe("happy.png");
  });

  it("handles files with N-level paths", () => {
    const chk = convertItemResourceToStorageResource(
      "3ef",
      "images_widget_12/happy.png"
    );
    expect(chk.folder).toBe("3ef_images_widget_12");
    expect(chk.filename).toBe("happy.png");
  });
});

describe("convertItemResourceToStorageResource, template version 1", () => {
  it("handles files", () => {
    const chk = convertItemResourceToStorageResource("3ef", "happy.png", 1);
    expect(chk.folder).toBe("3ef");
    expect(chk.filename).toBe("happy.png");
  });

  it("handles files with single level paths", () => {
    const chk = convertItemResourceToStorageResource(
      "3ef",
      "images/happy.png",
      1
    );
    expect(chk.folder).toBe("3ef/images");
    expect(chk.filename).toBe("happy.png");
  });

  it("handles files with N-level paths", () => {
    const chk = convertItemResourceToStorageResource(
      "3ef",
      "images/widget_12/happy.png",
      1
    );
    expect(chk.folder).toBe("3ef/images/widget_12");
    expect(chk.filename).toBe("happy.png");
  });
});

describe("convertItemResourceToStorageResource, file types", () => {
  it("handles data", () => {
    const chk = convertItemResourceToStorageResource("3ef", "happy.png", 1, SolutionResourceType.data);
    expect(chk.folder).toBe("3ef_info_data");
    expect(chk.filename).toBe("happy.png");
  });

  it("handles fakezip", () => {
    const chk = convertItemResourceToStorageResource("3ef", "happy.png", 1, SolutionResourceType.fakezip);
    expect(chk.folder).toBe("3ef_info_dataz");
    expect(chk.filename).toBe("happy.png");
  });

  it("handles info", () => {
    const chk = convertItemResourceToStorageResource("3ef", "happy.png", 1, SolutionResourceType.info);
    expect(chk.folder).toBe("3ef_info");
    expect(chk.filename).toBe("happy.png");
  });

  it("handles metadata", () => {
    const chk = convertItemResourceToStorageResource("3ef", "happy.png", 1, SolutionResourceType.metadata);
    expect(chk.folder).toBe("3ef_info_metadata");
    expect(chk.filename).toBe("happy.png");
  });
  
  it("handles thumbnail", () => {
    const chk = convertItemResourceToStorageResource("3ef", "happy.png", 1, SolutionResourceType.thumbnail);
    expect(chk.folder).toBe("3ef_info_thumbnail");
    expect(chk.filename).toBe("happy.png");
  });
});
