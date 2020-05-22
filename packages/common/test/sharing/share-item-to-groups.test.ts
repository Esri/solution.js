import { shareItemToGroups } from "../../src/sharing/index";
import * as portal from "@esri/arcgis-rest-portal";
import * as testUtils from "../mocks/utils";
import { UserSession } from "../../src";

let MOCK_USER_SESSION: UserSession;

describe("shareItemToGroups", () => {
  beforeEach(() => {
    MOCK_USER_SESSION = testUtils.createRuntimeMockUserSession();
  });
  it("it does not share if no groups sent", () => {
    const shareSpy = spyOn(portal, "shareItemWithGroup").and.resolveTo({
      itemId: "3ef"
    });
    return shareItemToGroups([], "3ef", MOCK_USER_SESSION).then(() => {
      expect(shareSpy.calls.count()).toBe(
        0,
        "should not share if no groups passed"
      );
    });
  });
  it("it shares a item to a single group", () => {
    const shareSpy = spyOn(portal, "shareItemWithGroup").and.resolveTo({
      itemId: "3ef"
    });
    return shareItemToGroups(["bc1"], "3ef", MOCK_USER_SESSION).then(() => {
      expect(shareSpy.calls.count()).toBe(1, "call shareItemToGroups once");
    });
  });
  it("it shares a item to a single group", () => {
    const shareSpy = spyOn(portal, "shareItemWithGroup").and.resolveTo({
      itemId: "3ef"
    });
    return shareItemToGroups(["bc1", "bc2"], "3ef", MOCK_USER_SESSION).then(
      () => {
        expect(shareSpy.calls.count()).toBe(2, "call shareItemToGroups twice");
      }
    );
  });
});
