/** @license
 * Copyright 2019 Esri
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

/**
 * Provides tests for functions involving the creation and deployment of Workforce item types.
 */

import * as workforceHelpers from "../src/workforceHelpers";
import * as interfaces from "../src/interfaces";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as fetchMock from "fetch-mock";
import * as utils from "../../common/test/mocks/utils";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

afterEach(() => {
  fetchMock.restore();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `workforceHelpers`: manages the creation and deployment of workforce project item types", () => {
  describe("", () => {
    it("", done => {
      done();
    });
  });

  describe("_extractDependencies", () => {
    it("handles serviceItemId variants", done => {
      const data: any = {
        dispatchers: {
          serviceItemId: "1234567890abcdef1234567890abcdef"
        }
      };
      const keyProperties: string[] = [
        "groupId",
        "workerWebMapId",
        "dispatcherWebMapId",
        "dispatchers",
        "assignments",
        "workers",
        "tracks"
      ];

      const expected: any = {
        dependencies: ["1234567890abcdef1234567890abcdef"],
        urlHash: {}
      };

      workforceHelpers
        .extractWorkforceDependencies(data, keyProperties, MOCK_USER_SESSION)
        .then(actual => {
          expect(actual).toEqual(expected);
          done();
        }, done.fail);
    });

    it("handles direct ids", done => {
      const data: any = {
        workerWebMapId: "1234567890abcdef1234567890abcdef"
      };
      const keyProperties: string[] = [
        "groupId",
        "workerWebMapId",
        "dispatcherWebMapId",
        "dispatchers",
        "assignments",
        "workers",
        "tracks"
      ];

      const expected: any = {
        dependencies: ["1234567890abcdef1234567890abcdef"],
        urlHash: {}
      };

      workforceHelpers
        .extractWorkforceDependencies(data, keyProperties, MOCK_USER_SESSION)
        .then(actual => {
          expect(actual).toEqual(expected);
          done();
        }, done.fail);
    });

    it("skips uninteresting id", done => {
      const data: any = {
        folderId: "1234567890abcdef1234567890abcdef"
      };
      const keyProperties: string[] = [
        "groupId",
        "workerWebMapId",
        "dispatcherWebMapId",
        "dispatchers",
        "assignments",
        "workers",
        "tracks"
      ];

      const expected: any = {
        dependencies: [],
        urlHash: {}
      };

      workforceHelpers
        .extractWorkforceDependencies(data, keyProperties, MOCK_USER_SESSION)
        .then(actual => {
          expect(actual).toEqual(expected);
          done();
        }, done.fail);
    });

    it("handles multiple types of id", done => {
      const data: any = {
        workerWebMapId: "abc116555b16437f8435e079033128d0",
        dispatcherWebMapId: "abc26a244163430590151395821fb845",
        dispatchers: {
          serviceItemId: "abc302ec12b74d2f9f2b3cc549420086",
          url: "abc302ec12b74d2f9f2b3cc549420086"
        },
        assignments: {
          serviceItemId: "abc4494043c3459faabcfd0e1ab557fc",
          url: "abc4494043c3459faabcfd0e1ab557fc"
        },
        workers: {
          serviceItemId: "abc5dd4bdd18437f8d5ff1aa2d25fd7c",
          url: "abc5dd4bdd18437f8d5ff1aa2d25fd7c"
        },
        tracks: {
          serviceItemId: "abc64329e69144c59f69f3f3e0d45269",
          url: "abc64329e69144c59f69f3f3e0d45269",
          enabled: true,
          updateInterval: 300
        },
        version: "1.2.0",
        groupId: "abc715c2df2b466da05577776e82d044",
        folderId: "d61c63538d8c45c68de809e4fe01e243"
      };
      const keyProperties: string[] = [
        "groupId",
        "workerWebMapId",
        "dispatcherWebMapId",
        "dispatchers",
        "assignments",
        "workers",
        "tracks"
      ];

      const expected: any = {
        dependencies: [
          "abc715c2df2b466da05577776e82d044",
          "abc116555b16437f8435e079033128d0",
          "abc26a244163430590151395821fb845",
          "abc302ec12b74d2f9f2b3cc549420086",
          "abc4494043c3459faabcfd0e1ab557fc",
          "abc5dd4bdd18437f8d5ff1aa2d25fd7c",
          "abc64329e69144c59f69f3f3e0d45269"
        ],
        urlHash: {}
      };

      workforceHelpers
        .extractWorkforceDependencies(data, keyProperties, MOCK_USER_SESSION)
        .then(actual => {
          expect(actual).toEqual(expected);
          done();
        }, done.fail);
    });

    it("handles id repeats", done => {
      const data: any = {
        workerWebMapId: "abc116555b16437f8435e079033128d0",
        dispatcherWebMapId: "abc116555b16437f8435e079033128d0",
        dispatchers: {
          serviceItemId: "abc302ec12b74d2f9f2b3cc549420086",
          url: "abc302ec12b74d2f9f2b3cc549420086"
        },
        assignments: {
          serviceItemId: "abc4494043c3459faabcfd0e1ab557fc",
          url: "abc4494043c3459faabcfd0e1ab557fc"
        },
        workers: {
          serviceItemId: "abc302ec12b74d2f9f2b3cc549420086",
          url: "abc5dd4bdd18437f8d5ff1aa2d25fd7c"
        },
        tracks: {
          serviceItemId: "abc64329e69144c59f69f3f3e0d45269",
          url: "abc64329e69144c59f69f3f3e0d45269",
          enabled: true,
          updateInterval: 300
        },
        version: "1.2.0",
        groupId: "abc715c2df2b466da05577776e82d044",
        folderId: "d61c63538d8c45c68de809e4fe01e243"
      };
      const keyProperties: string[] = [
        "groupId",
        "workerWebMapId",
        "dispatcherWebMapId",
        "dispatchers",
        "assignments",
        "workers",
        "tracks"
      ];

      const expected: any = {
        dependencies: [
          "abc715c2df2b466da05577776e82d044",
          "abc116555b16437f8435e079033128d0",
          "abc302ec12b74d2f9f2b3cc549420086",
          "abc4494043c3459faabcfd0e1ab557fc",
          "abc64329e69144c59f69f3f3e0d45269"
        ],
        urlHash: {}
      };

      workforceHelpers
        .extractWorkforceDependencies(data, keyProperties, MOCK_USER_SESSION)
        .then(actual => {
          expect(actual).toEqual(expected);
          done();
        }, done.fail);
    });
  });

  describe("_templatize", () => {
    it("should handle missing assignment integrations", () => {
      const data = mockItems.getAGOLItemData("Workforce Project");
      delete data.assignmentIntegrations;

      const expected: any = mockItems.getAGOLItemData("Workforce Project");
      delete expected.assignmentIntegrations;
      expected["folderId"] = "{{folderId}}";

      const actual = workforceHelpers.templatizeWorkforce(data, [], {});
      expect(actual).toEqual(expected);
    });

    it("should bypass invalid props", () => {
      const data = mockItems.getAGOLItemData("Workforce Project");
      delete data.assignmentIntegrations;

      const expected: any = mockItems.getAGOLItemData("Workforce Project");
      delete expected.assignmentIntegrations;
      expected["folderId"] = "{{folderId}}";

      const actual = workforceHelpers.templatizeWorkforce(data, ["fake"], {});
      expect(actual).toEqual(expected);
    });

    it("should bypass missing urls", () => {
      const data = mockItems.getAGOLItemData("Workforce Project");
      delete data.assignmentIntegrations;
      delete data["dispatchers"].url;
      const expected: any = mockItems.getAGOLItemData("Workforce Project");
      delete expected.assignmentIntegrations;
      delete expected["dispatchers"].url;
      expected["dispatchers"].serviceItemId =
        "{{abc302ec12b74d2f9f2b3cc549420086.itemId}}";
      expected["folderId"] = "{{folderId}}";
      expected["assignments"].serviceItemId =
        "{{abc4494043c3459faabcfd0e1ab557fc.layer0.itemId}}";
      expected["assignments"].url =
        "{{abc4494043c3459faabcfd0e1ab557fc.layer0.url}}";

      const actual = workforceHelpers.templatizeWorkforce(
        data,
        ["dispatchers", "assignments"],
        {}
      );
      expect(actual).toEqual(expected);
    });

    it("should bypass missing urlTemplate and missing assignment types", () => {
      const data = mockItems.getAGOLItemData("Workforce Project");
      delete data["assignmentIntegrations"][0].urlTemplate;
      delete data["assignmentIntegrations"][0].assignmentTypes;

      const expected: any = mockItems.getAGOLItemData("Workforce Project");
      expected["folderId"] = "{{folderId}}";
      delete expected["assignmentIntegrations"][0].urlTemplate;
      delete expected["assignmentIntegrations"][0].assignmentTypes;

      const actual = workforceHelpers.templatizeWorkforce(data, [], {});
      expect(actual).toEqual(expected);
    });

    it("should handle urlTemplate without itemId", () => {
      const data = mockItems.getAGOLItemData("Workforce Project");
      data.assignmentIntegrations[0].urlTemplate = "ABC123";
      data.assignmentIntegrations[0].assignmentTypes[0].urlTemplate = "ABC123";

      const expected: any = mockItems.getAGOLItemData("Workforce Project");
      expected.assignmentIntegrations[0].urlTemplate = "ABC123";
      expected.assignmentIntegrations[0].assignmentTypes[0].urlTemplate =
        "ABC123";
      expected["folderId"] = "{{folderId}}";

      const actual = workforceHelpers.templatizeWorkforce(data, [], {});
      expect(actual).toEqual(expected);
    });
  });
});
