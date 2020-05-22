import { generateEmptyCreationResponse } from "../../src/simpleTypeHelpers/generate-empty-creation-response";

describe("generateEmptyCreationResponse", () => {
  it("returns an empty response", () => {
    const chk = generateEmptyCreationResponse("Some Type");
    expect(chk.id).toBe("", "id should be empty");
    expect(chk.type).toBe("Some Type", "type should be set");
    expect(chk.postProcess).toBe(false, "postProcess set to false");
  });
});
