import { simpleTypeShareTemplatesToGroups } from "../../src/simpleTypeHelpers/simple-type-share-templates-to-groups";
import * as common from "@esri/solution-common";
import * as testUtils from "@esri/solution-common/test/mocks/utils";

let MOCK_USER_SESSION: common.UserSession;

describe("simpleTypeShareItemsToGroups", () => {
  beforeEach(() => {
    MOCK_USER_SESSION = testUtils.createRuntimeMockUserSession();
  });
  it("shares template to groups", () => {
    const shareSpy = spyOn(common, "shareItemToGroups").and.resolveTo();
    const tmpl = {
      itemId: "3ef",
      groups: ["bc3", "bc4"]
    } as common.IItemTemplate;
    const tmplDict = {
      bc3: {
        itemId: "newBc3"
      },
      bc4: {
        itemId: "newBc4"
      }
    };
    return simpleTypeShareTemplatesToGroups(
      [tmpl],
      tmplDict,
      MOCK_USER_SESSION
    ).then(() => {
      expect(shareSpy.calls.count()).toBe(1, "call shareItemToGroups once");
    });
  });

  it("shares templates to groups", () => {
    const shareSpy = spyOn(common, "shareItemToGroups").and.resolveTo();
    const tmpls = [
      {
        itemId: "3ef",
        groups: ["bc3", "bc4"]
      },
      {
        itemId: "4ef",
        groups: ["bc3", "bc4"]
      },
      {
        itemId: "5ef"
      }
    ] as common.IItemTemplate[];
    const tmplDict = {
      bc3: {
        itemId: "newBc3"
      },
      bc4: {
        itemId: "newBc4"
      }
    };
    return simpleTypeShareTemplatesToGroups(
      tmpls,
      tmplDict,
      MOCK_USER_SESSION
    ).then(() => {
      expect(shareSpy.calls.count()).toBe(2, "call shareItemToGroups twice");
    });
  });

  it("handles a template without a groups property", () => {
    const shareSpy = spyOn(common, "shareItemToGroups").and.resolveTo();
    const tmpl = {
      itemId: "3ef"
    } as common.IItemTemplate;
    return simpleTypeShareTemplatesToGroups([tmpl], {}, MOCK_USER_SESSION).then(
      () => {
        expect(shareSpy.calls.count()).toBe(0, "should not attempt to share");
      }
    );
  });
  it("handles empty groups array", () => {
    const shareSpy = spyOn(common, "shareItemToGroups").and.resolveTo();
    const tmpl = {
      itemId: "3ef",
      groups: []
    } as common.IItemTemplate;
    return simpleTypeShareTemplatesToGroups([tmpl], {}, MOCK_USER_SESSION).then(
      () => {
        expect(shareSpy.calls.count()).toBe(0, "should not attempt to share");
      }
    );
  });
});
