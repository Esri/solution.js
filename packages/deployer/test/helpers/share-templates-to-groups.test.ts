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

import { shareTemplatesToGroups } from "../../src/helpers/share-templates-to-groups";
import * as common from "@esri/solution-common";
import * as testUtils from "@esri/solution-common/test/mocks/utils";

let MOCK_USER_SESSION: common.ArcGISIdentityManager;

describe("shareItemsToGroups", () => {
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
    return shareTemplatesToGroups([tmpl], tmplDict, MOCK_USER_SESSION).then(
      () => {
        expect(shareSpy.calls.count()).toBe(1, "call shareItemToGroups once");
      }
    );
  });

  it("shares tracking template to tracking group", () => {
    const shareSpy = spyOn(common, "shareItemToGroups").and.resolveTo();
    const tmpl = {
      itemId: "3ef",
      groups: ["newAb4"],
      item: {
        typeKeywords: ["Location Tracking View"],
        properties: {
          trackViewGroup: "{{ab4.itemId}}"
        }
      }
    } as common.IItemTemplate;
    const tmplDict = {
      bc3: {
        itemId: "newBc3"
      },
      ab4: {
        itemId: "newAb4"
      },
      locationTracking: {
        userIsOwner: false,
        owner: "LocationTrackingServiceOwner"
      }
    };
    return shareTemplatesToGroups([tmpl], tmplDict, MOCK_USER_SESSION).then(
      () => {
        expect(shareSpy.calls.count()).toBe(1, "call shareItemToGroups once");
      }
    );
  });

  it("shares tracking template to groups", () => {
    const shareSpy = spyOn(common, "shareItemToGroups").and.resolveTo();
    const tmpl = {
      itemId: "3ef",
      groups: ["ab4", "bc3"],
      item: {
        typeKeywords: ["Location Tracking View"],
        properties: {
          trackViewGroup: "{{ab4.itemId}}"
        }
      }
    } as common.IItemTemplate;
    const tmplDict = {
      bc3: {
        itemId: "newBc3"
      },
      ab4: {
        itemId: "newAb4"
      },
      locationTracking: {
        userIsOwner: false,
        owner: "LocationTrackingServiceOwner"
      }
    };
    return shareTemplatesToGroups([tmpl], tmplDict, MOCK_USER_SESSION).then(
      () => {
        expect(shareSpy.calls.count()).toBe(2, "call shareItemToGroups once");
      }
    );
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
    return shareTemplatesToGroups(tmpls, tmplDict, MOCK_USER_SESSION).then(
      () => {
        expect(shareSpy.calls.count()).toBe(2, "call shareItemToGroups twice");
      }
    );
  });

  it("handles a template without a groups property", () => {
    const shareSpy = spyOn(common, "shareItemToGroups").and.resolveTo();
    const tmpl = {
      itemId: "3ef"
    } as common.IItemTemplate;
    return shareTemplatesToGroups([tmpl], {}, MOCK_USER_SESSION).then(() => {
      expect(shareSpy.calls.count()).toBe(0, "should not attempt to share");
    });
  });
  it("handles empty groups array", () => {
    const shareSpy = spyOn(common, "shareItemToGroups").and.resolveTo();
    const tmpl = {
      itemId: "3ef",
      groups: []
    } as common.IItemTemplate;
    return shareTemplatesToGroups([tmpl], {}, MOCK_USER_SESSION).then(() => {
      expect(shareSpy.calls.count()).toBe(0, "should not attempt to share");
    });
  });
});
