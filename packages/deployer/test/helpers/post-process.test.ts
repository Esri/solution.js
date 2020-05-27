import { postProcess } from "../../src/helpers/post-process";
import { HubSiteProcessor } from "@esri/solution-hub-types";
import * as testUtils from "@esri/solution-common/test/mocks/utils";
import {
  UserSession,
  IItemTemplate,
  ICreateItemFromTemplateResponse
} from "@esri/solution-common";

let MOCK_USER_SESSION: UserSession;
describe("postProcess Module", () => {
  const tmpls = [] as IItemTemplate[];
  const tmplDict = {};
  beforeEach(() => {
    MOCK_USER_SESSION = testUtils.createRuntimeMockUserSession();
  });
  it("delegates to type specific processor", () => {
    const siteProcessorSpy = spyOn(
      HubSiteProcessor,
      "postProcess"
    ).and.resolveTo();

    const sols = [
      {
        id: "bc3",
        type: "Hub Site Application",
        postProcess: true
      }
    ] as ICreateItemFromTemplateResponse[];

    return postProcess(tmpls, sols, MOCK_USER_SESSION, tmplDict).then(resp => {
      expect(resp.length).toBe(1, "should return one promise");
      expect(siteProcessorSpy.calls.count()).toBe(
        1,
        "should delegate to item type processor"
      );
      const args = siteProcessorSpy.calls.argsFor(0) as any[];
      expect(args[0]).toBe("bc3");
      expect(args[1]).toBe("Hub Site Application");
      expect(args[2]).toBe(tmpls, "should pass templates through");
      expect(args[3]).toBe(tmplDict, "should pass template dictionary through");
      expect(args[4]).toBe(MOCK_USER_SESSION, "should pass auth through");
    });
  });
  it("only processes multiple solutions with postProcess true", () => {
    const siteProcessorSpy = spyOn(
      HubSiteProcessor,
      "postProcess"
    ).and.resolveTo();

    const sols = [
      {
        id: "bc3",
        type: "Hub Site Application",
        postProcess: true
      },
      {
        id: "bc4",
        type: "Hub Site Application",
        postProcess: true
      }
    ] as ICreateItemFromTemplateResponse[];

    return postProcess(tmpls, sols, MOCK_USER_SESSION, tmplDict).then(resp => {
      expect(resp.length).toBe(2, "should return two promises");
      expect(siteProcessorSpy.calls.count()).toBe(
        2,
        "should call postProcess twice"
      );
    });
  });
  it("only processes solutions with postProcess true", () => {
    const siteProcessorSpy = spyOn(
      HubSiteProcessor,
      "postProcess"
    ).and.resolveTo();

    const sols = [
      {
        id: "bc3",
        type: "Hub Site Application",
        postProcess: true
      },
      {
        id: "bc4",
        type: "Hub Site Application",
        postProcess: false
      }
    ] as ICreateItemFromTemplateResponse[];

    return postProcess(tmpls, sols, MOCK_USER_SESSION, tmplDict).then(resp => {
      expect(resp.length).toBe(1, "should return one promise");
      expect(siteProcessorSpy.calls.count()).toBe(
        1,
        "should call postProcess once"
      );
    });
  });

  it("it skips undefined itemHandlers", () => {
    const sols = [
      {
        id: "bc3",
        type: "Death Star",
        postProcess: true
      }
    ] as ICreateItemFromTemplateResponse[];

    return postProcess(tmpls, sols, MOCK_USER_SESSION, tmplDict).then(resp => {
      expect(resp.length).toBe(0, "should not process anything");
    });
  });
});
