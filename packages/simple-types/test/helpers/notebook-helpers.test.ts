import * as notebookHelpers from "../../src/helpers/notebook-helpers";

describe("notebookHelpers:: ", () => {
  it("should have createItemFromTemplate", () => {
    expect(notebookHelpers.createItemFromTemplate).toBeDefined();
  });
  it("should have convertItemToTemplate", () => {
    expect(notebookHelpers.convertItemToTemplate).toBeDefined();
  });
  it("should have generateEmptyCreationResponse", () => {
    expect(notebookHelpers.generateEmptyCreationResponse).toBeDefined();
  });
  it("should have shareTemplatesToGroups", () => {
    expect(notebookHelpers.shareTemplatesToGroups).toBeDefined();
  });
  it("should have updateNotebookData", () => {
    expect(notebookHelpers.updateNotebookData).toBeDefined();
  });
});
