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
 * Provides tests for common functions involving the management of item and group resources.
 */

import { convertItemToTemplate, fineTuneCreatedItem } from "../src/workforce";

import { IItemTemplate } from "../../common/src/interfaces";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as mockSolutions from "../../common/test/mocks/templates";
import * as fetchMock from "fetch-mock";
import { IUserRequestOptions, UserSession } from "@esri/arcgis-rest-auth";

import {
  TOMORROW,
  createMockSettings,
  createRuntimeMockUserSession,
  checkForArcgisRestSuccessRequestError
} from "../../common/test/mocks/utils";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

// Set up a UserSession to use in all these tests
const MOCK_USER_SESSION = new UserSession({
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

const MOCK_USER_REQOPTS: IUserRequestOptions = {
  authentication: MOCK_USER_SESSION
};

afterEach(() => {
  fetchMock.restore();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `workforce`: manages the creation and deployment of wprkforce project item types", () => {
  describe("convertItemToTemplate", () => {
    it("should extract dependencies", () => {
      const itemTemplate: IItemTemplate = mockItems.getAGOLItem(
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

      const newItemTemplate = convertItemToTemplate(itemTemplate);
      const newDependencies: string[] = newItemTemplate.dependencies;
      expect(newDependencies.length).toEqual(expectedDependencies.length);

      expectedDependencies.forEach(d => {
        expect(newDependencies.indexOf(d)).toBeGreaterThan(-1);
      });
    });

    it("should templatize key properties in the template", () => {
      const itemTemplate: IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      itemTemplate.item = {
        id: "abc0cab401af4828a25cc6eaeb59fb69"
      };

      const expectedTemplateData: any = {
        workerWebMapId: "{{abc116555b16437f8435e079033128d0.id}}",
        dispatcherWebMapId: "{{abc26a244163430590151395821fb845.id}}",
        dispatchers: {
          serviceItemId: "{{abc302ec12b74d2f9f2b3cc549420086.id}}",
          url: "{{abc302ec12b74d2f9f2b3cc549420086.url}}/0"
        },
        assignments: {
          serviceItemId: "{{abc4494043c3459faabcfd0e1ab557fc.id}}",
          url: "{{abc4494043c3459faabcfd0e1ab557fc.url}}/0"
        },
        workers: {
          serviceItemId: "{{abc5dd4bdd18437f8d5ff1aa2d25fd7c.id}}",
          url: "{{abc5dd4bdd18437f8d5ff1aa2d25fd7c.url}}/0"
        },
        tracks: {
          serviceItemId: "{{abc64329e69144c59f69f3f3e0d45269.id}}",
          url: "{{abc64329e69144c59f69f3f3e0d45269.url}}/0",
          enabled: true,
          updateInterval: 300
        },
        version: "1.2.0",
        groupId: "{{abc715c2df2b466da05577776e82d044.id}}",
        folderId: "{{folderId}}",
        assignmentIntegrations: [
          {
            id: "default-navigator",
            prompt: "Navigate to Assignment",
            urlTemplate:
              "arcgis-navigator://?stop=${assignment.latitude},{itemID={{cad3483e025c47338d43df308c117308.id}}},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt={itemID={{bad3483e025c47338d43df308c117308.id}}}://Workforce",
            assignmentTypes: [
              {
                urlTemplate:
                  "arcgis-navigator://?stop=${assignment.latitude},{itemID={{cad3483e025c47338d43df308c117308.id}}},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt={itemID={{bad3483e025c47338d43df308c117308.id}}}://Workforce"
              }
            ]
          }
        ]
      };

      const newItemTemplate = convertItemToTemplate(itemTemplate);
      expect(newItemTemplate.data).toEqual(expectedTemplateData);
    });
  });

  describe("_extractDependencies", () => {
    xit("_extractDependencies", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_templatize", () => {
    xit("_templatize", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("fineTuneCreatedItem", () => {
    it("should update dispatchers service", done => {
      const itemTemplate: IItemTemplate = mockItems.getAGOLItem(
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

      fineTuneCreatedItem(itemTemplate, MOCK_USER_SESSION).then(r => {
        expect(r).toEqual({ success: true });
        done();
      }, done.fail);
    });

    it("should handle error on update dispatchers", done => {
      const itemTemplate: IItemTemplate = mockItems.getAGOLItem(
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
        .get(queryUrl, mockItems.get400Failure());

      fineTuneCreatedItem(itemTemplate, MOCK_USER_SESSION).then(
        done.fail,
        done
      );
    });

    it("should handle error on getUser", done => {
      const itemTemplate: IItemTemplate = mockItems.getAGOLItem(
        "Workforce Project",
        null
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const userUrl: string =
        "https://myorg.maps.arcgis.com/sharing/rest/community/users/casey?f=json&token=fake-token";

      fetchMock.get(userUrl, mockItems.get400Failure());

      fineTuneCreatedItem(itemTemplate, MOCK_USER_SESSION).then(
        done.fail,
        done
      );
    });

    it("should not update dispatchers service if it contains records", done => {
      const itemTemplate: IItemTemplate = mockItems.getAGOLItem(
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

      fineTuneCreatedItem(itemTemplate, MOCK_USER_SESSION).then(r => {
        expect(r).toEqual({
          success: true
        });
        done();
      }, done.fail);
    });

    it("should handle failure to add features", done => {
      const itemTemplate: IItemTemplate = mockItems.getAGOLItem(
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

      fineTuneCreatedItem(itemTemplate, MOCK_USER_SESSION).then(
        done.fail,
        e => {
          expect(e).toEqual({
            success: false,
            error: { success: false, message: "Failed to add dispatch record." }
          });
          done();
        }
      );
    });

    it("should handle error on add dispatcher features", done => {
      const itemTemplate: IItemTemplate = mockItems.getAGOLItem(
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
        .post(addUrl, mockItems.get400Failure());

      fineTuneCreatedItem(itemTemplate, MOCK_USER_SESSION).then(
        r => {
          done.fail();
        },
        e => {
          done();
        }
      );
    });

    it("should have success === false when query does not return a features property", done => {
      const itemTemplate: IItemTemplate = mockItems.getAGOLItem(
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

      fineTuneCreatedItem(itemTemplate, MOCK_USER_SESSION).then(r => {
        expect(r).toEqual({
          success: false
        });
        done();
      }, done.fail);
    });

    it("should have success === false when dispatchers does not have url", done => {
      const itemTemplate: IItemTemplate = mockItems.getAGOLItem(
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

      fineTuneCreatedItem(itemTemplate, MOCK_USER_SESSION).then(r => {
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
