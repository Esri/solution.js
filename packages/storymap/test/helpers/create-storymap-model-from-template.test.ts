import { createStoryMapModelFromTemplate } from "../../src/helpers/create-storymap-model-from-template";

import * as hubModule from "@esri/hub-common";

import * as utils from "@esri/solution-common/test/mocks/utils";
const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

describe("createStoryMapModelFromTemplate :: ", () => {
  it("ammends settings, interpolates", () => {
    const adlibSpy = spyOn(hubModule, "interpolate").and.callThrough();

    const tmpl = {
      itemId: "bc3",
      type: "StoryMap",
      key: "foo",
      item: {},
      data: {
        chkTs: `{{timestamp}}`,
        chkAgoEnv: `{{agoenv}}`,
        chkSmBase: "{{smBase}}"
      }
    } as hubModule.IModelTemplate;
    const settings = {};

    return createStoryMapModelFromTemplate(
      tmpl,
      settings,
      {},
      MOCK_USER_SESSION
    ).then(result => {
      expect(adlibSpy.calls.count()).toBe(1, "should interpolate");
      const settingsHash = adlibSpy.calls.argsFor(0)[1];
      expect(settingsHash.agoenv).toBe("www", "should pass in agoenv");
      expect(settingsHash.smBase).toBe("storymaps", "should pass in smbase");
      expect(settingsHash.timestamp).toBeDefined("should pass in a timestamp");
      expect(result.data.chkTs).toBeLessThanOrEqual(
        new Date().getTime(),
        "timestamp should be less than current time"
      );
      expect(result.data.chkAgoEnv).toBe("www", "should interpolate agoenv");
      expect(result.data.chkSmBase).toBe(
        "storymaps",
        "should interpolate smBase"
      );
    });
  });
});
