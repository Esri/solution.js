import { convertItemResourceToStorageResource } from "../../src/resources/convert-item-resource-to-storage-resource";

describe("convertItemResourceToStorageResource", () => {
  it("handles files", () => {
    const chk = convertItemResourceToStorageResource("3ef", "happy.png");
    expect(chk.folder).toBe("3ef");
    expect(chk.filename).toBe("happy.png");
    const chkWithFolder = convertItemResourceToStorageResource(
      "3ef",
      "happy.png",
      "some_folder"
    );
    expect(chkWithFolder.folder).toBe("3ef_some_folder");
    expect(chkWithFolder.filename).toBe("happy.png");
  });

  it("handles files with single level paths", () => {
    const chk = convertItemResourceToStorageResource("3ef", "images/happy.png");
    expect(chk.folder).toBe("3ef_images");
    expect(chk.filename).toBe("happy.png");
    const chk2 = convertItemResourceToStorageResource(
      "3ef",
      "images/happy.png",
      "some_folder"
    );
    expect(chk2.folder).toBe("3ef_some_folder_images");
    expect(chk2.filename).toBe("happy.png");
  });

  it("handles files with N-level paths", () => {
    const chk = convertItemResourceToStorageResource(
      "3ef",
      "images/widget_12/happy.png"
    );
    expect(chk.folder).toBe("3ef_images_widget-12");
    expect(chk.filename).toBe("happy.png");
    const chk2 = convertItemResourceToStorageResource(
      "3ef",
      "images/widget_12/happy.png",
      "some_folder"
    );
    expect(chk2.folder).toBe("3ef_some_folder_images_widget-12");
    expect(chk2.filename).toBe("happy.png");
  });
});
