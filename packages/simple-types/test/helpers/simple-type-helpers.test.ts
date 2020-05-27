import * as simpleTypeHelpers from "../../src/helpers/simple-type-helpers";

describe("simpleTypeHelpers:: ", () => {
  it("should have createItemFromTemplate", () => {
    expect(simpleTypeHelpers.createItemFromTemplate).toBeDefined();
  });
  it("should have convertItemToTemplate", () => {
    expect(simpleTypeHelpers.convertItemToTemplate).toBeDefined();
  });
  it("should have generateEmptyCreationResponse", () => {
    expect(simpleTypeHelpers.generateEmptyCreationResponse).toBeDefined();
  });
  it("should have shareTemplatesToGroups", () => {
    expect(simpleTypeHelpers.shareTemplatesToGroups).toBeDefined();
  });
});
