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

import * as simpleTypes from "../../src/simple-types";
import * as utils from "../../../common/test/mocks/utils";
import * as staticRelatedItemsMocks from "../../../common/test/mocks/staticRelatedItemsMocks";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../../../common/test/mocks/agolItems";
import * as notebook from "../../src/notebook";
import * as templates from "../../../common/test/mocks/templates";
import * as common from "@esri/solution-common";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

const noResourcesResponse: any = {
  total: 0,
  start: 1,
  num: 0,
  nextStart: -1,
  resources: []
};

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

afterEach(() => {
  fetchMock.restore();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("simpleTypeCreateItemFromTemplate", () => {
  describe("notebook", () => {
    if (typeof window !== "undefined") {
      it("should create and fine tune python notebook", done => {
        const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
          "Notebook"
        );
        itemTemplate.data = mockItems.getAGOLItemData("Notebook");

        const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";
        const expected: any = {};
        expected[itemTemplate.itemId] = { itemId: newItemID };
        const templateDictionary: any = {};

        const userUrl: string =
          utils.PORTAL_SUBSET.restUrl +
          "/community/users/casey?f=json&token=fake-token";

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
            utils.getSuccessResponse({ id: newItemID, folder: null })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/" +
              newItemID +
              "/update",
            { success: true }
          )
          .get(userUrl, {
            username: "casey",
            fullName: "casey"
          });

        const expectedClone: common.IItemTemplate = common.cloneObject(
          itemTemplate
        );
        expectedClone.itemId = newItemID;
        expectedClone.item.id = "abc1cab401af4828a25cc6eaeb59fb69";

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        simpleTypes
          .createItemFromTemplate(
            itemTemplate,
            templateDictionary,
            MOCK_USER_SESSION,
            utils.ITEM_PROGRESS_CALLBACK
          )
          .then(r => {
            expect(templateDictionary).toEqual(expected);
            expect(r).toEqual({
              item: expectedClone,
              id: newItemID,
              type: itemTemplate.type,
              postProcess: false
            });
            done();
          });
      });

      it("should handle error on python notebook update item", done => {
        const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
          "Notebook"
        );
        itemTemplate.data = mockItems.getAGOLItemData("Notebook");

        const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";
        const expected: any = {};
        expected[itemTemplate.itemId] = { itemId: newItemID };
        const templateDictionary: any = {};

        const userUrl: string =
          utils.PORTAL_SUBSET.restUrl +
          "/community/users/casey?f=json&token=fake-token";

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
            utils.getSuccessResponse({ id: newItemID, folder: null })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/" +
              newItemID +
              "/update",
            mockItems.get400Failure()
          )
          .get(userUrl, {
            username: "casey",
            fullName: "casey"
          })
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/map1234567890/delete",
            utils.getSuccessResponse({ itemId: "map1234567890" })
          );

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        simpleTypes
          .createItemFromTemplate(
            itemTemplate,
            templateDictionary,
            MOCK_USER_SESSION,
            utils.ITEM_PROGRESS_CALLBACK
          )
          .then(response => {
            done();
          });
      });
    }

    it("should handle missing python notebook content: no data", () => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Notebook"
      );
      itemTemplate.data = null;
      const expected = common.cloneObject(itemTemplate);

      const result: common.IItemTemplate = notebook.convertNotebookToTemplate(
        itemTemplate
      );
      expect(result).toEqual(expected);
    });

    it("should handle missing python notebook content: duplicate ids, but not in dependencies", () => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Notebook"
      );
      itemTemplate.data.cells.push(itemTemplate.data.cells[0]);
      const expected = common.cloneObject(itemTemplate);
      expected.dependencies = ["3b927de78a784a5aa3981469d85cf45d"];
      itemTemplate.data.cells[0].source = "3b927de78a784a5aa3981469d85cf45d";
      itemTemplate.data.cells[1].source = "3b927de78a784a5aa3981469d85cf45d";

      const result: common.IItemTemplate = notebook.convertNotebookToTemplate(
        itemTemplate
      );
      expect(result).toEqual(expected);
    });

    it("should handle missing python notebook content: duplicate ids in dependencies", () => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Notebook",
        ["3b927de78a784a5aa3981469d85cf45d"]
      );
      itemTemplate.data.cells.push(itemTemplate.data.cells[0]);
      const expected = common.cloneObject(itemTemplate);
      itemTemplate.data.cells[0].source = "3b927de78a784a5aa3981469d85cf45d";
      itemTemplate.data.cells[1].source = "3b927de78a784a5aa3981469d85cf45d";

      const result: common.IItemTemplate = notebook.convertNotebookToTemplate(
        itemTemplate
      );
      expect(result).toEqual(expected);
    });
  });

  describe("quick capture", () => {
    it("should create quick capture project", done => {
      const newItemId: string = "xxx79c91fc7642ebb4c0bbacfbacd510";

      const templateDictionary: any = {
        user: {
          email: "casey@esri.com"
        },
        "4efe5f693de34620934787ead6693f10": {
          itemId: "xxxe5f693de34620934787ead6693f10",
          layer0: {
            url: "https://abc123/name/FeatureServer/0"
          },
          layer1: {
            url: "https://abc123/name/FeatureServer/1"
          }
        },
        "9da79c91fc7642ebb4c0bbacfbacd510": {}
      };

      const expectedTemplateDictionary: any = {
        user: {
          email: "casey@esri.com"
        },
        "4efe5f693de34620934787ead6693f10": {
          itemId: "xxxe5f693de34620934787ead6693f10",
          layer0: {
            url: "https://abc123/name/FeatureServer/0"
          },
          layer1: {
            url: "https://abc123/name/FeatureServer/1"
          }
        },
        "9da79c91fc7642ebb4c0bbacfbacd510": {
          itemId: "xxx79c91fc7642ebb4c0bbacfbacd510"
        }
      };

      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "QuickCapture Project",
        null
      );

      itemTemplate.itemId = "9da79c91fc7642ebb4c0bbacfbacd510";

      itemTemplate.dependencies = ["4efe5f693de34620934787ead6693f10"];

      itemTemplate.data = {
        application: {
          basemap: {},
          dataSources: [
            {
              featureServiceItemId:
                "{{4efe5f693de34620934787ead6693f10.itemId}}",
              dataSourceId: "1d4de1e4-ef58-4e02-9159-7a6e6701cada",
              url: "{{4efe5f693de34620934787ead6693f10.layer0.url}}"
            },
            {
              featureServiceItemId:
                "{{4efe5f693de34620934787ead6693f10.itemId}}",
              dataSourceId: "1687a71b-cf77-48ed-b948-c66e228a0f74",
              url: "{{4efe5f693de34620934787ead6693f10.layer1.url}}"
            }
          ],
          itemId: "{{9da79c91fc7642ebb4c0bbacfbacd510.itemId}}",
          preferences: {
            adminEmail: "{{user.email}}"
          },
          templateGroups: [],
          userInputs: [],
          version: 0.1
        },
        name: "qc.project.json"
      };

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: newItemId, folder: null })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemId +
            "/update",
          { success: true }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemId +
            "/addResources",
          { success: true }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemId +
            "/updateResources",
          { success: true }
        );

      const expectedClone: common.IItemTemplate = common.cloneObject(
        itemTemplate
      );
      expectedClone.itemId = newItemId;
      expectedClone.data.application.dataSources[0].featureServiceItemId =
        "xxxe5f693de34620934787ead6693f10";
      expectedClone.data.application.dataSources[0].url =
        "https://abc123/name/FeatureServer/0";
      expectedClone.data.application.dataSources[1].featureServiceItemId =
        "xxxe5f693de34620934787ead6693f10";
      expectedClone.data.application.dataSources[1].url =
        "https://abc123/name/FeatureServer/1";
      expectedClone.data.application.itemId =
        "xxx79c91fc7642ebb4c0bbacfbacd510";
      expectedClone.data.application.preferences.adminEmail = "casey@esri.com";

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(actual => {
          expect(actual).toEqual({
            item: expectedClone,
            id: newItemId,
            type: itemTemplate.type,
            postProcess: true
          });
          expect(templateDictionary).toEqual(expectedTemplateDictionary);
          done();
        });
    });

    it("should handle error on update resources", done => {
      const newItemId: string = "xxx79c91fc7642ebb4c0bbacfbacd510";

      const templateDictionary: any = {};

      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "QuickCapture Project",
        null
      );

      itemTemplate.data = {
        application: {
          basemap: {},
          dataSources: [],
          itemId: "{{9da79c91fc7642ebb4c0bbacfbacd510.itemId}}",
          preferences: {
            adminEmail: "{{user.email}}"
          },
          templateGroups: [],
          userInputs: [],
          version: 0.1
        },
        name: "qc.project.json"
      };

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: newItemId, folder: null })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemId +
            "/update",
          { success: true }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemId +
            "/updateResources",
          mockItems.get400Failure()
        );

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          done();
        });
    });
  });

  describe("web mapping application", () => {
    it("should handle web mapping application that is a WAB", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Web Mapping Application",
        null
      );
      itemTemplate.itemId = "abc0cab401af4828a25cc6eaeb59fb69";
      itemTemplate.item = {
        title: "Voting Centers",
        id: "{{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
        type: "Web Mapping Application",
        typeKeywords: ["WAB2D"],
        url:
          "{{portalBaseUrl}}/home/item.html?id={{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
        properties: null
      };
      itemTemplate.data = {
        appItemId: "{{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
        values: {
          webmap: "{{myMapId.itemId}}"
        },
        map: {
          appProxy: {
            mapItemId: "{{myMapId.itemId}}"
          },
          itemId: "{{myMapId.itemId}}"
        },
        folderId: "{{folderId}}"
      };
      itemTemplate.dependencies = ["myMapId"];

      const layer0: any = {
        serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
        id: 0
      };

      const updatedItem = mockItems.getAGOLItem(
        "Web Mapping Application",
        utils.PORTAL_SUBSET.portalUrl +
          "/home/item.html?id=abc0cab401af4828a25cc6eaeb59fb69"
      );
      updatedItem.id = "abc0cab401af4828a25cc6eaeb59fb69";

      const expectedData: any = {
        appItemId: "abc0cab401af4828a25cc6eaeb59fb69",
        values: {
          webmap: "map0cab401af4828a25cc6eaeb59fb69"
        },
        map: {
          appProxy: {
            mapItemId: "map0cab401af4828a25cc6eaeb59fb69"
          },
          itemId: "map0cab401af4828a25cc6eaeb59fb69"
        },
        folderId: "folderb401af4828a25cc6eaeb59fb69"
      };

      fetchMock
        .post(
          "https://fake.com/arcgis/rest/services/test/FeatureServer/0",
          layer0
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/folderb401af4828a25cc6eaeb59fb69/addItem",
          utils.getSuccessResponse({
            id: "abc0cab401af4828a25cc6eaeb59fb69",
            folder: null
          })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/abc0cab401af4828a25cc6eaeb59fb69/update",
          { success: true }
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69?f=json&token=fake-token",
          updatedItem
        );
      staticRelatedItemsMocks.fetchMockRelatedItems(
        "abc0cab401af4828a25cc6eaeb59fb69",
        { total: 0, relatedItems: [] }
      );

      const expectedClone: common.IItemTemplate = common.cloneObject(
        itemTemplate
      );
      expectedClone.itemId = updatedItem.id;
      expectedClone.item.id = "abc0cab401af4828a25cc6eaeb59fb69";
      expectedClone.item.url =
        "https://myorg.maps.arcgis.com/home/item.html?id=abc0cab401af4828a25cc6eaeb59fb69";
      expectedClone.data.appItemId = "abc0cab401af4828a25cc6eaeb59fb69";
      expectedClone.data.values.webmap = "map0cab401af4828a25cc6eaeb59fb69";
      expectedClone.data.map.appProxy.mapItemId =
        "map0cab401af4828a25cc6eaeb59fb69";
      expectedClone.data.map.itemId = "map0cab401af4828a25cc6eaeb59fb69";
      expectedClone.data.folderId = "folderb401af4828a25cc6eaeb59fb69";

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          {
            portalBaseUrl: utils.PORTAL_SUBSET.portalUrl,
            folderId: "folderb401af4828a25cc6eaeb59fb69",
            myMapId: {
              itemId: "map0cab401af4828a25cc6eaeb59fb69"
            }
          },
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(actual => {
          expect(actual).toEqual({
            item: expectedClone,
            id: "abc0cab401af4828a25cc6eaeb59fb69",
            type: itemTemplate.type,
            postProcess: false
          });
          done();
        });
    });

    it("should handle web mapping application that's not a WAB", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Web Mapping Application",
        null
      );
      itemTemplate.itemId = "abc0cab401af4828a25cc6eaeb59fb69";
      itemTemplate.item = {
        title: "Voting Centers",
        id: "{{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
        type: "Web Mapping Application",
        typeKeywords: [],
        url:
          "{{portalBaseUrl}}/home/item.html?id={{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
        properties: null
      };
      itemTemplate.data = {
        appItemId: "{{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
        values: {
          webmap: "{{myMapId.itemId}}"
        },
        map: {
          appProxy: {
            mapItemId: "{{myMapId.itemId}}"
          },
          itemId: "{{myMapId.itemId}}"
        },
        folderId: "{{folderId}}"
      };
      itemTemplate.dependencies = ["myMapId"];

      const layer0: any = {
        serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
        id: 0
      };

      const updatedItem = mockItems.getAGOLItem(
        "Web Mapping Application",
        utils.PORTAL_SUBSET.portalUrl +
          "/home/item.html?id=abc0cab401af4828a25cc6eaeb59fb69"
      );
      updatedItem.id = "abc0cab401af4828a25cc6eaeb59fb69";

      const expectedData: any = {
        appItemId: "abc0cab401af4828a25cc6eaeb59fb69",
        values: {
          webmap: "map0cab401af4828a25cc6eaeb59fb69"
        },
        map: {
          appProxy: {
            mapItemId: "map0cab401af4828a25cc6eaeb59fb69"
          },
          itemId: "map0cab401af4828a25cc6eaeb59fb69"
        },
        folderId: "folderb401af4828a25cc6eaeb59fb69"
      };

      fetchMock
        .post(
          "https://fake.com/arcgis/rest/services/test/FeatureServer/0",
          layer0
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/folderb401af4828a25cc6eaeb59fb69/addItem",
          utils.getSuccessResponse({
            id: "abc0cab401af4828a25cc6eaeb59fb69",
            folder: null
          })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/abc0cab401af4828a25cc6eaeb59fb69/update",
          { success: true }
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69?f=json&token=fake-token",
          updatedItem
        );
      staticRelatedItemsMocks.fetchMockRelatedItems(
        "abc0cab401af4828a25cc6eaeb59fb69",
        { total: 0, relatedItems: [] }
      );

      const expectedClone: common.IItemTemplate = common.cloneObject(
        itemTemplate
      );
      expectedClone.itemId = updatedItem.id;
      expectedClone.item.id = "abc0cab401af4828a25cc6eaeb59fb69";
      expectedClone.item.url =
        "https://myorg.maps.arcgis.com/home/item.html?id=abc0cab401af4828a25cc6eaeb59fb69";
      expectedClone.data.appItemId = "abc0cab401af4828a25cc6eaeb59fb69";
      expectedClone.data.values.webmap = "map0cab401af4828a25cc6eaeb59fb69";
      expectedClone.data.map.appProxy.mapItemId =
        "map0cab401af4828a25cc6eaeb59fb69";
      expectedClone.data.map.itemId = "map0cab401af4828a25cc6eaeb59fb69";
      expectedClone.data.folderId = "folderb401af4828a25cc6eaeb59fb69";

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          {
            portalBaseUrl: utils.PORTAL_SUBSET.portalUrl,
            folderId: "folderb401af4828a25cc6eaeb59fb69",
            myMapId: {
              itemId: "map0cab401af4828a25cc6eaeb59fb69"
            },
            abc0cab401af4828a25cc6eaeb59fb69: {
              itemId: "abc0cab401af4828a25cc6eaeb59fb69"
            }
          },
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(actual => {
          expect(actual).toEqual({
            item: expectedClone,
            id: "abc0cab401af4828a25cc6eaeb59fb69",
            type: itemTemplate.type,
            postProcess: false
          });
          done();
        });
    });

    it("should handle web mapping application with related items", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Web Mapping Application",
        null
      );
      itemTemplate.itemId = "abc0cab401af4828a25cc6eaeb59fb69";
      itemTemplate.item = {
        title: "Voting Centers",
        id: "{{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
        type: "Web Mapping Application",
        typeKeywords: ["WAB2D"],
        url:
          "{{portalBaseUrl}}/home/item.html?id={{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
        properties: null
      };
      itemTemplate.data = {
        appItemId: "{{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
        values: {
          webmap: "{{myMapId.itemId}}"
        },
        map: {
          appProxy: {
            mapItemId: "{{myMapId.itemId}}"
          },
          itemId: "{{myMapId.itemId}}"
        },
        folderId: "{{folderId}}"
      };
      itemTemplate.relatedItems = [
        {
          relationshipType: "Survey2Service",
          relatedItemIds: ["srv1234567890"]
        },
        {
          relationshipType: "Survey2Data",
          relatedItemIds: ["srv1234567890", "abc1234567890"]
        }
      ];
      itemTemplate.dependencies = ["myMapId", "srv1234567890", "abc1234567890"];

      const layer0: any = {
        serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
        id: 0
      };

      const updatedItem = mockItems.getAGOLItem(
        "Web Mapping Application",
        utils.PORTAL_SUBSET.portalUrl +
          "/home/item.html?id=abc0cab401af4828a25cc6eaeb59fb69"
      );
      updatedItem.id = "abc0cab401af4828a25cc6eaeb59fb69";

      fetchMock
        .post(
          "https://fake.com/arcgis/rest/services/test/FeatureServer/0",
          layer0
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/folderb401af4828a25cc6eaeb59fb69/addItem",
          utils.getSuccessResponse({
            id: "abc0cab401af4828a25cc6eaeb59fb69",
            folder: null
          })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addRelationship",
          { success: true }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/abc0cab401af4828a25cc6eaeb59fb69/update",
          { success: true }
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69?f=json&token=fake-token",
          updatedItem
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/map1234567890/delete",
          utils.getSuccessResponse({ itemId: "map1234567890" })
        );

      staticRelatedItemsMocks.fetchMockRelatedItems(
        itemTemplate.itemId,
        { total: 0, relatedItems: [] },
        ["Survey2Data", "Survey2Service"]
      );
      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/content/items/" +
          itemTemplate.itemId +
          "/relatedItems?f=json&direction=forward&relationshipType=Survey2Data&token=fake-token",
        {
          total: 2,
          relatedItems: [
            {
              id: "srv1234567890"
            },
            {
              id: "abc1234567890"
            }
          ]
        }
      );
      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/content/items/" +
          itemTemplate.itemId +
          "/relatedItems?f=json&direction=forward&relationshipType=Survey2Service&token=fake-token",
        {
          total: 1,
          relatedItems: [
            {
              id: "srv1234567890"
            }
          ]
        }
      );

      const expectedClone: common.IItemTemplate = common.cloneObject(
        itemTemplate
      );
      expectedClone.itemId = updatedItem.id;
      expectedClone.item.id = updatedItem.id;
      expectedClone.item.url =
        "https://myorg.maps.arcgis.com/home/item.html?id=abc0cab401af4828a25cc6eaeb59fb69";
      expectedClone.data = {
        appItemId: updatedItem.id,
        values: {
          webmap: "map0cab401af4828a25cc6eaeb59fb69"
        },
        map: {
          appProxy: {
            mapItemId: "map0cab401af4828a25cc6eaeb59fb69"
          },
          itemId: "map0cab401af4828a25cc6eaeb59fb69"
        },
        folderId: "folderb401af4828a25cc6eaeb59fb69"
      };

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          {
            portalBaseUrl: utils.PORTAL_SUBSET.portalUrl,
            folderId: "folderb401af4828a25cc6eaeb59fb69",
            myMapId: {
              itemId: "map0cab401af4828a25cc6eaeb59fb69"
            }
          },
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(actual => {
          expect(actual).toEqual({
            item: expectedClone,
            id: updatedItem.id,
            type: itemTemplate.type,
            postProcess: false
          });
          done();
        });
    });

    it("should handle web mapping application with missing data section and templatized URL", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Web Mapping Application",
        null
      );
      itemTemplate.itemId = "abc0cab401af4828a25cc6eaeb59fb69";
      itemTemplate.item = {
        title: "Voting Centers",
        id: "{{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
        type: "Web Mapping Application",
        properties: null,
        typeKeywords: ["WAB2D"],
        url:
          "{{portalBaseUrl}}/home/item.html?id={{abc0cab401af4828a25cc6eaeb59fb69.itemId}}"
      };
      itemTemplate.data = undefined;
      itemTemplate.dependencies = [];

      const updatedItem = mockItems.getAGOLItem(
        "Web Mapping Application",
        utils.PORTAL_SUBSET.portalUrl +
          "/home/item.html?id=abc0cab401af4828a25cc6eaeb59fb69"
      );
      updatedItem.id = "abc0cab401af4828a25cc6eaeb59fb69";
      updatedItem.thumbnail = null;

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({
            id: "abc0cab401af4828a25cc6eaeb59fb69",
            folder: null
          })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/abc0cab401af4828a25cc6eaeb59fb69/update",
          { success: true }
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69?f=json&token=fake-token",
          updatedItem
        );

      const expectedClone: common.IItemTemplate = common.cloneObject(
        itemTemplate
      );
      expectedClone.itemId = updatedItem.id;
      expectedClone.item.id = "abc0cab401af4828a25cc6eaeb59fb69";
      expectedClone.item.url =
        "https://myorg.maps.arcgis.com/home/item.html?id=abc0cab401af4828a25cc6eaeb59fb69";

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          {
            portalBaseUrl: utils.PORTAL_SUBSET.portalUrl
          },
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(actual => {
          expect(actual).toEqual({
            item: expectedClone,
            id: "abc0cab401af4828a25cc6eaeb59fb69",
            type: itemTemplate.type,
            postProcess: false
          });
          done();
        });
    });

    it("should handle error web mapping application", done => {
      const itemTemplate: common.IItemTemplate = mockItems.getAGOLItem(
        "Web Mapping Application",
        null
      );
      itemTemplate.itemId = "abc0cab401af4828a25cc6eaeb59fb69";
      itemTemplate.item = {
        title: "Voting Centers",
        id: "{{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
        type: "Web Mapping Application",
        typeKeywords: ["WAB2D"],
        url:
          "{{portalBaseUrl}}/home/item.html?id={{abc0cab401af4828a25cc6eaeb59fb69.itemId}}"
      };
      itemTemplate.data = {
        appItemId: "{{myAppItemId.itemId}}",
        values: {
          webmap: "{{myMapId.itemId}}"
        },
        map: {
          appProxy: {
            mapItemId: "{{mapItemId.itemId}}"
          },
          itemId: "{{mapItemId.itemId}}"
        },
        folderId: "{{folderId}}"
      };
      itemTemplate.dependencies = ["myMapId"];

      const layer0: any = {
        serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
        id: 0
      };

      fetchMock
        .post(
          "https://fake.com/arcgis/rest/services/test/FeatureServer/0",
          layer0
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({
            id: "abc0cab401af4828a25cc6eaeb59fb69",
            folder: null
          })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/folderId/addItem",
          utils.getSuccessResponse({
            id: "abc2cab401af4828a25cc6eaeb59fb69",
            folder: null
          })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/abc2cab401af4828a25cc6eaeb59fb69/update",
          mockItems.get400FailureResponse()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/abc0cab401af4828a25cc6eaeb59fb69/update",
          mockItems.get400FailureResponse()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/map1234567890/delete",
          utils.getSuccessResponse({ itemId: "map1234567890" })
        );

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          {
            folderId: "folderId",
            abc0cab401af4828a25cc6eaeb59fb69: {
              id: "abc1cab401af4828a25cc6eaeb59fb69"
            }
          },
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          done();
        });
    });
  });

  describe("workforce", () => {
    it("should create and fine tune workforce project", done => {
      const communitySelfResponse: any = utils.getUserResponse();
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Workforce Project"
      );
      itemTemplate.data = mockItems.getAGOLItemData("Workforce Project");

      const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";
      const expected: any = {};
      expected[itemTemplate.itemId] = { itemId: newItemID };
      const templateDictionary: any = {};

      const userUrl: string =
        utils.PORTAL_SUBSET.restUrl +
        "/community/users/casey?f=json&token=fake-token";
      const queryUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/query?f=json&where=userId%20%3D%20%27LocalGovDeployCasey%27&outFields=*&token=fake-token";
      const addUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/dispatchers_47bb15c2df2b466da05577776e82d044/FeatureServer/0/applyEdits";

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/self?f=json&token=fake-token",
          communitySelfResponse
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: newItemID, folder: null })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemID +
            "/update",
          { success: true }
        )
        .get(queryUrl, {
          features: []
        })
        .post(addUrl, {
          addResults: [{}]
        });

      const expectedClone: common.IItemTemplate = common.cloneObject(
        itemTemplate
      );
      expectedClone.itemId = newItemID;
      expectedClone.item.id = newItemID;

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(r => {
          expect(templateDictionary).toEqual(expected);
          expect(r).toEqual({
            item: expectedClone,
            id: newItemID,
            type: itemTemplate.type,
            postProcess: false
          });
          done();
        });
    });
  });
});
