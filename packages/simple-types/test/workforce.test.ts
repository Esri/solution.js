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

import * as common from "@esri/solution-common";
import * as workforce from "../src/workforce";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as fetchMock from "fetch-mock";
import * as utils from "../../common/test/mocks/utils";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

afterEach(() => {
  fetchMock.restore();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `workforce`: manages the creation and deployment of workforce project item types", () => {
  describe("convertItemToTemplate", () => {
    it("should extract dependencies", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const expectedDependencies: string[] = [
        "abc116555b16437f8435e079033128d0",
        "abc26a244163430590151395821fb845",
        "abc302ec12b74d2f9f2b3cc549420086",
        "abc4494043c3459faabcfd0e1ab557fc",
        "abc5dd4bdd18437f8d5ff1aa2d25fd7c",
        "abc64329e69144c59f69f3f3e0d45269",
        "abc715c2df2b466da05577776e82d044",
        "cad3483e025c47338d43df308c117308",
        "bad3483e025c47338d43df308c117308"
      ];

      workforce
        .convertItemToTemplate(itemTemplate, MOCK_USER_SESSION)
        .then(newItemTemplate => {
          const newDependencies: string[] = newItemTemplate.dependencies;
          expect(newDependencies.length).toEqual(expectedDependencies.length);

          expectedDependencies.forEach(d => {
            expect(newDependencies.indexOf(d)).toBeGreaterThan(-1);
            done();
          });
        }, done.fail);
    });

    it("should templatize key properties in the template", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");
      itemTemplate.data.assignmentIntegrations = [
        {
          id: "default-navigator",
          prompt: "Navigate to Assignment",
          urlTemplate:
            "arcgis-navigator://?stop=${assignment.latitude},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt=Workforce"
        },
        {
          id: "default-collector",
          prompt: "Collect at Assignment",
          assignmentTypes: {
            "1": {
              urlTemplate:
                "arcgis-collector://?itemID=b5142b618da74f92af9e84f7459b64a8&center=${assignment.latitude},${assignment.longitude}"
            },
            "2": {
              urlTemplate:
                "arcgis-collector://?itemID=b5142b618da74f92af9e84f7459b64a8&center=${assignment.latitude},${assignment.longitude}&featureSourceURL=https://services123.arcgis.com/org1234567890/arcgis/rest/services/ProposedSiteAddress_field/FeatureServer/0&featureAttributes=%7B%22placename%22:%22${assignment.location}%22%7D"
            }
          }
        }
      ];

      itemTemplate.item = {
        id: "abc0cab401af4828a25cc6eaeb59fb69",
        type: "Workforce Project"
      };

      const expectedTemplateData: any = {
        workerWebMapId: "{{abc116555b16437f8435e079033128d0.itemId}}",
        dispatcherWebMapId: "{{abc26a244163430590151395821fb845.itemId}}",
        dispatchers: {
          serviceItemId: "{{abc302ec12b74d2f9f2b3cc549420086.layer0.itemId}}",
          url: "{{abc302ec12b74d2f9f2b3cc549420086.layer0.url}}"
        },
        assignments: {
          serviceItemId: "{{abc4494043c3459faabcfd0e1ab557fc.layer0.itemId}}",
          url: "{{abc4494043c3459faabcfd0e1ab557fc.layer0.url}}"
        },
        workers: {
          serviceItemId: "{{abc5dd4bdd18437f8d5ff1aa2d25fd7c.layer0.itemId}}",
          url: "{{abc5dd4bdd18437f8d5ff1aa2d25fd7c.layer0.url}}"
        },
        tracks: {
          serviceItemId: "{{abc64329e69144c59f69f3f3e0d45269.layer0.itemId}}",
          url: "{{abc64329e69144c59f69f3f3e0d45269.layer0.url}}",
          enabled: true,
          updateInterval: 300
        },
        version: "1.2.0",
        groupId: "{{abc715c2df2b466da05577776e82d044.itemId}}",
        folderId: "{{folderId}}",
        assignmentIntegrations: [
          {
            id: "default-navigator",
            prompt: "Navigate to Assignment",
            urlTemplate:
              "arcgis-navigator://?stop=${assignment.latitude},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt=Workforce"
          },
          {
            id: "default-collector",
            prompt: "Collect at Assignment",
            assignmentTypes: {
              "1": {
                urlTemplate:
                  "arcgis-collector://?itemID={{b5142b618da74f92af9e84f7459b64a8.itemId}}&center=${assignment.latitude},${assignment.longitude}"
              },
              "2": {
                urlTemplate:
                  "arcgis-collector://?itemID={{b5142b618da74f92af9e84f7459b64a8.itemId}}&center=${assignment.latitude},${assignment.longitude}&featureSourceURL={{bb142b618da74f92af9e84f7459b64a8.layer0.url}}&featureAttributes=%7B%22placename%22:%22${assignment.location}%22%7D"
              }
            }
          }
        ]
      };

      fetchMock.post(
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ProposedSiteAddress_field/FeatureServer/0",
        {
          serviceItemId: "bb142b618da74f92af9e84f7459b64a8"
        }
      );

      workforce
        .convertItemToTemplate(itemTemplate, MOCK_USER_SESSION)
        .then(newItemTemplate => {
          expect(newItemTemplate.data).toEqual(expectedTemplateData);
          done();
        }, done.fail);
    });

    it("should extract dependencies", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const expectedDependencies: string[] = [
        "abc116555b16437f8435e079033128d0",
        "abc26a244163430590151395821fb845",
        "abc302ec12b74d2f9f2b3cc549420086",
        "abc4494043c3459faabcfd0e1ab557fc",
        "abc5dd4bdd18437f8d5ff1aa2d25fd7c",
        "abc64329e69144c59f69f3f3e0d45269",
        "abc715c2df2b466da05577776e82d044",
        "cad3483e025c47338d43df308c117308",
        "bad3483e025c47338d43df308c117308"
      ];

      workforce
        .convertItemToTemplate(itemTemplate, MOCK_USER_SESSION)
        .then(newItemTemplate => {
          const newDependencies: string[] = newItemTemplate.dependencies;
          expect(newDependencies.length).toEqual(expectedDependencies.length);

          expectedDependencies.forEach(d => {
            expect(newDependencies.indexOf(d)).toBeGreaterThan(-1);
            done();
          });
        }, done.fail);
    });

    it("should handle workforce projects without data", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project"
      );

      workforce
        .convertItemToTemplate(itemTemplate, MOCK_USER_SESSION)
        .then(newItemTemplate => {
          expect(newItemTemplate.data).not.toBeDefined();
          done();
        }, done.fail);
    });

    it("should handle error on extract dependencies", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");
      itemTemplate.data.assignmentIntegrations = [
        {
          id: "default-collector",
          prompt: "Collect at Assignment",
          assignmentTypes: {
            "1": {
              urlTemplate:
                "arcgis-collector://?itemID=b5142b618da74f92af9e84f7459b64a8&center=${assignment.latitude},${assignment.longitude}&featureSourceURL=https://services123.arcgis.com/org1234567890/arcgis/rest/services/ProposedSiteAddress_field/FeatureServer&featureAttributes=%7B%22placename%22:%22${assignment.location}%22%7D"
            }
          }
        }
      ];

      itemTemplate.item = {
        id: "abc0cab401af4828a25cc6eaeb59fb69",
        type: "Workforce Project"
      };

      fetchMock.post(
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ProposedSiteAddress_field/FeatureServer",
        mockItems.get400Failure()
      );

      workforce
        .convertItemToTemplate(itemTemplate, MOCK_USER_SESSION)
        .then(() => {
          done.fail();
        }, done);
    });

    it("should handle url without layer id", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");
      itemTemplate.data.assignmentIntegrations = [
        {
          id: "default-collector",
          prompt: "Collect at Assignment",
          assignmentTypes: {
            "1": {
              urlTemplate:
                "arcgis-collector://?itemID=b5142b618da74f92af9e84f7459b64a8&center=${assignment.latitude},${assignment.longitude}&featureSourceURL=https://services123.arcgis.com/org1234567890/arcgis/rest/services/ProposedSiteAddress_field/FeatureServer&featureAttributes=%7B%22placename%22:%22${assignment.location}%22%7D"
            }
          }
        }
      ];

      itemTemplate.item = {
        id: "abc0cab401af4828a25cc6eaeb59fb69",
        type: "Workforce Project"
      };

      const expectedTemplateData: any = {
        workerWebMapId: "{{abc116555b16437f8435e079033128d0.itemId}}",
        dispatcherWebMapId: "{{abc26a244163430590151395821fb845.itemId}}",
        dispatchers: {
          serviceItemId: "{{abc302ec12b74d2f9f2b3cc549420086.layer0.itemId}}",
          url: "{{abc302ec12b74d2f9f2b3cc549420086.layer0.url}}"
        },
        assignments: {
          serviceItemId: "{{abc4494043c3459faabcfd0e1ab557fc.layer0.itemId}}",
          url: "{{abc4494043c3459faabcfd0e1ab557fc.layer0.url}}"
        },
        workers: {
          serviceItemId: "{{abc5dd4bdd18437f8d5ff1aa2d25fd7c.layer0.itemId}}",
          url: "{{abc5dd4bdd18437f8d5ff1aa2d25fd7c.layer0.url}}"
        },
        tracks: {
          serviceItemId: "{{abc64329e69144c59f69f3f3e0d45269.layer0.itemId}}",
          url: "{{abc64329e69144c59f69f3f3e0d45269.layer0.url}}",
          enabled: true,
          updateInterval: 300
        },
        version: "1.2.0",
        groupId: "{{abc715c2df2b466da05577776e82d044.itemId}}",
        folderId: "{{folderId}}",
        assignmentIntegrations: [
          {
            id: "default-collector",
            prompt: "Collect at Assignment",
            assignmentTypes: {
              "1": {
                urlTemplate:
                  "arcgis-collector://?itemID={{b5142b618da74f92af9e84f7459b64a8.itemId}}&center=${assignment.latitude},${assignment.longitude}&featureSourceURL={{bb142b618da74f92af9e84f7459b64a8.url}}&featureAttributes=%7B%22placename%22:%22${assignment.location}%22%7D"
              }
            }
          }
        ]
      };

      fetchMock.post(
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ProposedSiteAddress_field/FeatureServer",
        {
          serviceItemId: "bb142b618da74f92af9e84f7459b64a8"
        }
      );

      workforce
        .convertItemToTemplate(itemTemplate, MOCK_USER_SESSION)
        .then(newItemTemplate => {
          expect(newItemTemplate.data).toEqual(expectedTemplateData);
          done();
        }, done.fail);
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

      workforce
        ._extractDependencies(data, keyProperties, MOCK_USER_SESSION)
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

      workforce
        ._extractDependencies(data, keyProperties, MOCK_USER_SESSION)
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

      workforce
        ._extractDependencies(data, keyProperties, MOCK_USER_SESSION)
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

      workforce
        ._extractDependencies(data, keyProperties, MOCK_USER_SESSION)
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

      workforce
        ._extractDependencies(data, keyProperties, MOCK_USER_SESSION)
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

      const actual = workforce._templatize(data, [], {});
      expect(actual).toEqual(expected);
    });

    it("should bypass invalid props", () => {
      const data = mockItems.getAGOLItemData("Workforce Project");
      delete data.assignmentIntegrations;

      const expected: any = mockItems.getAGOLItemData("Workforce Project");
      delete expected.assignmentIntegrations;
      expected["folderId"] = "{{folderId}}";

      const actual = workforce._templatize(data, ["fake"], {});
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

      const actual = workforce._templatize(
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

      const actual = workforce._templatize(data, [], {});
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

      const actual = workforce._templatize(data, [], {});
      expect(actual).toEqual(expected);
    });
  });

  describe("fineTuneCreatedItem", () => {
    it("should update dispatchers service", done => {
      const communitySelfResponse: any = utils.getUserResponse();
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const userUrl: string =
        utils.PORTAL_SUBSET.restUrl +
        "/community/users/casey?f=json&token=fake-token";
      const queryUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/query?f=json&where=userId%20%3D%20%27LocalGovDeployCasey%27&outFields=*&token=fake-token";
      const addUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/addFeatures";

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/self?f=json&token=fake-token",
          communitySelfResponse
        )
        .get(queryUrl, {
          features: []
        })
        .post(addUrl, {
          addResults: [{}]
        });

      workforce.fineTuneCreatedItem(itemTemplate, MOCK_USER_SESSION).then(r => {
        expect(r).toEqual({ success: true });
        done();
      }, done.fail);
    });

    it("should update dispatchers service even with default names", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const userUrl: string =
        utils.PORTAL_SUBSET.restUrl +
        "/community/users/casey?f=json&token=fake-token";
      const queryUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/query?f=json&where=userId%20%3D%20%27%27&outFields=*&token=fake-token";
      const addUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/addFeatures";

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/self?f=json&token=fake-token",
          {}
        )
        .get(queryUrl, {
          features: []
        })
        .post(addUrl, {
          addResults: [{}]
        });

      workforce.fineTuneCreatedItem(itemTemplate, MOCK_USER_SESSION).then(r => {
        expect(r).toEqual({ success: true });
        done();
      }, done.fail);
    });

    it("should handle error on update dispatchers", done => {
      const communitySelfResponse: any = utils.getUserResponse();
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const userUrl: string =
        utils.PORTAL_SUBSET.restUrl +
        "/community/users/casey?f=json&token=fake-token";
      const queryUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/query?f=json&where=userId%20%3D%20%27LocalGovDeployCasey%27&outFields=*&token=fake-token";

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/self?f=json&token=fake-token",
          communitySelfResponse
        )
        .get(queryUrl, mockItems.get400Failure());

      workforce
        .fineTuneCreatedItem(itemTemplate, MOCK_USER_SESSION)
        .then(done.fail, done);
    });

    it("should handle error on getUser", done => {
      const communitySelfResponse: any = utils.getUserResponse();
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const userUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/query?f=json&where=userId%20%3D%20%27LocalGovDeployCasey%27&outFields=*&token=fake-token";

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl + "/community/self?f=json&token=fake-token",
        mockItems.get400Failure()
      );

      workforce
        .fineTuneCreatedItem(itemTemplate, MOCK_USER_SESSION)
        .then(done.fail, done);
    });

    it("should not update dispatchers service if it contains records", done => {
      const communitySelfResponse: any = utils.getUserResponse();
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const userUrl: string =
        utils.PORTAL_SUBSET.restUrl +
        "/community/users/casey?f=json&token=fake-token";
      const queryUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/query?f=json&where=userId%20%3D%20%27LocalGovDeployCasey%27&outFields=*&token=fake-token";

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/self?f=json&token=fake-token",
          communitySelfResponse
        )
        .get(queryUrl, {
          features: [{}]
        });

      workforce.fineTuneCreatedItem(itemTemplate, MOCK_USER_SESSION).then(r => {
        expect(r).toEqual({
          success: true
        });
        done();
      }, done.fail);
    });

    it("should handle failure to add features", done => {
      const communitySelfResponse: any = utils.getUserResponse();
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const userUrl: string =
        utils.PORTAL_SUBSET.restUrl +
        "/community/users/casey?f=json&token=fake-token";
      const queryUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/query?f=json&where=userId%20%3D%20%27LocalGovDeployCasey%27&outFields=*&token=fake-token";
      const addUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/addFeatures";

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/self?f=json&token=fake-token",
          communitySelfResponse
        )
        .get(queryUrl, {
          features: []
        })
        .post(addUrl, {});

      workforce
        .fineTuneCreatedItem(itemTemplate, MOCK_USER_SESSION)
        .then(done.fail, e => {
          expect(e).toEqual({
            success: false,
            error: { success: false, message: "Failed to add dispatch record." }
          });
          done();
        });
    });

    it("should handle error on add dispatcher features", done => {
      const communitySelfResponse: any = utils.getUserResponse();
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const userUrl: string =
        utils.PORTAL_SUBSET.restUrl +
        "/community/users/casey?f=json&token=fake-token";
      const queryUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/query?f=json&where=userId%20%3D%20%27LocalGovDeployCasey%27&outFields=*&token=fake-token";
      const addUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/addFeatures";

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/self?f=json&token=fake-token",
          communitySelfResponse
        )
        .get(queryUrl, {
          features: []
        })
        .post(addUrl, mockItems.get400Failure());

      workforce.fineTuneCreatedItem(itemTemplate, MOCK_USER_SESSION).then(
        r => {
          done.fail();
        },
        e => {
          done();
        }
      );
    });

    it("should have success === false when query does not return a features property", done => {
      const communitySelfResponse: any = utils.getUserResponse();
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const userUrl: string =
        utils.PORTAL_SUBSET.restUrl +
        "/community/users/casey?f=json&token=fake-token";
      const queryUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/query?f=json&where=userId%20%3D%20%27LocalGovDeployCasey%27&outFields=*&token=fake-token";

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/self?f=json&token=fake-token",
          communitySelfResponse
        )
        .get(queryUrl, {});

      workforce.fineTuneCreatedItem(itemTemplate, MOCK_USER_SESSION).then(r => {
        expect(r).toEqual({
          success: false
        });
        done();
      }, done.fail);
    });

    it("should have success === false when dispatchers does not have url", done => {
      const communitySelfResponse: any = utils.getUserResponse();
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const userUrl: string =
        utils.PORTAL_SUBSET.restUrl +
        "/community/users/casey?f=json&token=fake-token";
      const queryUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/query?f=json&where=userId%20%3D%20%27MrClaypool%27&outFields=*&token=fake-token";

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/self?f=json&token=fake-token",
          communitySelfResponse
        )
        .get(userUrl, {
          username: "MrClaypool",
          fullName: "Mr Claypool"
        })
        .get(queryUrl, {});

      delete itemTemplate.data.dispatchers.url;

      workforce.fineTuneCreatedItem(itemTemplate, MOCK_USER_SESSION).then(r => {
        expect(r).toEqual({
          success: false
        });
        done();
      }, done.fail);
    });
  });
});
