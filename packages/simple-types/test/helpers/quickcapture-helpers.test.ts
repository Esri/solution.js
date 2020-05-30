import * as quickcaptureHelpers from "../../src/helpers/quickcapture-helpers";

describe("quickcaptureHelpers:: ", () => {
  it("should have createItemFromTemplate", () => {
    expect(quickcaptureHelpers.createItemFromTemplate).toBeDefined();
  });
  it("should have convertItemToTemplate", () => {
    expect(quickcaptureHelpers.convertItemToTemplate).toBeDefined();
  });
  it("should have generateEmptyCreationResponse", () => {
    expect(quickcaptureHelpers.generateEmptyCreationResponse).toBeDefined();
  });
});
