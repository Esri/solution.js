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

import { TOMORROW } from "../../common/test/mocks/utils";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

// Set up a UserSession to use in all these tests
const MOCK_USER_SESSION = new common.UserSession({
  clientId: "clientId",
  redirectUri: "https://example-app.com/redirect-uri",
  token: "fake-token",
  tokenExpires: TOMORROW,
  refreshToken: "refreshToken",
  refreshTokenExpires: TOMORROW,
  refreshTokenTTL: 1440,
  username: "casey",
  password: "123456",
  portal: "https://myorg.maps.arcgis.com/sharing/rest"
});

afterEach(() => {
  fetchMock.restore();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `workforce`: manages the creation and deployment of workforce project item types", () => {
  describe("convertItemToTemplate", () => {
    it("should extract dependencies", () => {
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
        "abc715c2df2b466da05577776e82d044"
      ];

      const newItemTemplate = workforce.convertItemToTemplate(itemTemplate);
      const newDependencies: string[] = newItemTemplate.dependencies;
      expect(newDependencies.length).toEqual(expectedDependencies.length);

      expectedDependencies.forEach(d => {
        expect(newDependencies.indexOf(d)).toBeGreaterThan(-1);
      });
    });

    it("should templatize key properties in the template", () => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

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
              "arcgis-navigator://?stop=${assignment.latitude},{itemID={{cad3483e025c47338d43df308c117308.itemId}}},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt={itemID={{bad3483e025c47338d43df308c117308.itemId}}}://Workforce",
            assignmentTypes: [
              {
                urlTemplate:
                  "arcgis-navigator://?stop=${assignment.latitude},{itemID={{cad3483e025c47338d43df308c117308.itemId}}},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt={itemID={{bad3483e025c47338d43df308c117308.itemId}}}://Workforce"
              }
            ]
          }
        ]
      };

      const newItemTemplate = workforce.convertItemToTemplate(itemTemplate);
      expect(newItemTemplate.data).toEqual(expectedTemplateData);
    });

    it("should extract dependencies", () => {
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
        "abc715c2df2b466da05577776e82d044"
      ];

      const newItemTemplate = workforce.convertItemToTemplate(itemTemplate);
      const newDependencies: string[] = newItemTemplate.dependencies;
      expect(newDependencies.length).toEqual(expectedDependencies.length);

      expectedDependencies.forEach(d => {
        expect(newDependencies.indexOf(d)).toBeGreaterThan(-1);
      });
    });

    it("should handle workforce projects without data", () => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project"
      );

      const newItemTemplate = workforce.convertItemToTemplate(itemTemplate);
      expect(newItemTemplate.data).not.toBeDefined();
    });
  });

  describe("_extractDependencies", () => {
    it("handles serviceItemId variants", () => {
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

      const dependencies: string[] = workforce._extractDependencies(
        data,
        keyProperties
      );
      expect(dependencies).toEqual(["1234567890abcdef1234567890abcdef"]);
    });

    it("handles direct ids", () => {
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

      const dependencies: string[] = workforce._extractDependencies(
        data,
        keyProperties
      );
      expect(dependencies).toEqual(["1234567890abcdef1234567890abcdef"]);
    });

    it("skips uninteresting id", () => {
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

      const dependencies: string[] = workforce._extractDependencies(
        data,
        keyProperties
      );
      expect(dependencies).toEqual([]);
    });

    it("handles multiple types of id", () => {
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

      const dependencies: string[] = workforce._extractDependencies(
        data,
        keyProperties
      );
      expect(dependencies).toEqual([
        "abc715c2df2b466da05577776e82d044",
        "abc116555b16437f8435e079033128d0",
        "abc26a244163430590151395821fb845",
        "abc302ec12b74d2f9f2b3cc549420086",
        "abc4494043c3459faabcfd0e1ab557fc",
        "abc5dd4bdd18437f8d5ff1aa2d25fd7c",
        "abc64329e69144c59f69f3f3e0d45269"
      ]);
    });

    it("handles id repeats", () => {
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

      const dependencies: string[] = workforce._extractDependencies(
        data,
        keyProperties
      );
      expect(dependencies).toEqual([
        "abc715c2df2b466da05577776e82d044",
        "abc116555b16437f8435e079033128d0",
        "abc302ec12b74d2f9f2b3cc549420086",
        "abc4494043c3459faabcfd0e1ab557fc",
        "abc64329e69144c59f69f3f3e0d45269"
      ]);
    });
  });

  describe("_templatize", () => {
    it("should handle missing assignment integrations", () => {
      const data = mockItems.getAGOLItemData("Workforce Project");
      delete data.assignmentIntegrations;

      const expected: any = mockItems.getAGOLItemData("Workforce Project");
      delete expected.assignmentIntegrations;
      expected["folderId"] = "{{folderId}}";

      const actual = workforce._templatize(data, []);
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

      const actual = workforce._templatize(data, []);
      expect(actual).toEqual(expected);
    });
  });

  describe("fineTuneCreatedItem", () => {
    it("should update dispatchers service", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const userUrl: string =
        "https://myorg.maps.arcgis.com/sharing/rest/community/users/casey?f=json&token=fake-token";
      const queryUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/query?f=json&where=userId%20%3D%20%27MrClaypool%27&outFields=*&token=fake-token";
      const addUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/addFeatures";

      fetchMock
        .get(userUrl, {
          username: "MrClaypool",
          fullName: "Mr Claypool"
        })
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
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const userUrl: string =
        "https://myorg.maps.arcgis.com/sharing/rest/community/users/casey?f=json&token=fake-token";
      const queryUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/query?f=json&where=userId%20%3D%20%27MrClaypool%27&outFields=*&token=fake-token";

      fetchMock
        .get(userUrl, {
          username: "MrClaypool"
        })
        .get(queryUrl, mockItems.get400Failure());

      workforce
        .fineTuneCreatedItem(itemTemplate, MOCK_USER_SESSION)
        .then(done.fail, done);
    });

    it("should handle error on getUser", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const userUrl: string =
        "https://myorg.maps.arcgis.com/sharing/rest/community/users/casey?f=json&token=fake-token";

      fetchMock.get(userUrl, mockItems.get400Failure());

      workforce
        .fineTuneCreatedItem(itemTemplate, MOCK_USER_SESSION)
        .then(done.fail, done);
    });

    it("should not update dispatchers service if it contains records", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const userUrl: string =
        "https://myorg.maps.arcgis.com/sharing/rest/community/users/casey?f=json&token=fake-token";
      const queryUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/query?f=json&where=userId%20%3D%20%27MrClaypool%27&outFields=*&token=fake-token";

      fetchMock
        .get(userUrl, {
          username: "MrClaypool",
          fullName: "Mr Claypool"
        })
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
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const userUrl: string =
        "https://myorg.maps.arcgis.com/sharing/rest/community/users/casey?f=json&token=fake-token";
      const queryUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/query?f=json&where=userId%20%3D%20%27MrClaypool%27&outFields=*&token=fake-token";
      const addUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/addFeatures";

      fetchMock
        .get(userUrl, {
          username: "MrClaypool",
          fullName: "Mr Claypool"
        })
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
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const userUrl: string =
        "https://myorg.maps.arcgis.com/sharing/rest/community/users/casey?f=json&token=fake-token";
      const queryUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/query?f=json&where=userId%20%3D%20%27MrClaypool%27&outFields=*&token=fake-token";
      const addUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/addFeatures";

      fetchMock
        .get(userUrl, {
          fullName: "Mr Claypool"
        })
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
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const userUrl: string =
        "https://myorg.maps.arcgis.com/sharing/rest/community/users/casey?f=json&token=fake-token";
      const queryUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/query?f=json&where=userId%20%3D%20%27MrClaypool%27&outFields=*&token=fake-token";

      fetchMock
        .get(userUrl, {
          username: "MrClaypool",
          fullName: "Mr Claypool"
        })
        .get(queryUrl, {});

      workforce.fineTuneCreatedItem(itemTemplate, MOCK_USER_SESSION).then(r => {
        expect(r).toEqual({
          success: false
        });
        done();
      }, done.fail);
    });

    it("should have success === false when dispatchers does not have url", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const userUrl: string =
        "https://myorg.maps.arcgis.com/sharing/rest/community/users/casey?f=json&token=fake-token";
      const queryUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/query?f=json&where=userId%20%3D%20%27MrClaypool%27&outFields=*&token=fake-token";

      fetchMock
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

  describe("_updateDispatchers", () => {
    xit("_updateDispatchers", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });
});
