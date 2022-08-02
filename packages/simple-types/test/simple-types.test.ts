/** @license
 * Copyright 2018 Esri
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
 * Provides tests for functions involving the creation and deployment of simple item types.
 */

import * as simpleTypes from "../src/simple-types";
import * as utils from "../../common/test/mocks/utils";
import * as staticDashboardMocks from "../../common/test/mocks/staticDashboardMocks";
import * as staticRelatedItemsMocks from "../../common/test/mocks/staticRelatedItemsMocks";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as templates from "../../common/test/mocks/templates";
import * as common from "@esri/solution-common";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

const noResourcesResponse: any = {
  total: 0,
  start: 1,
  num: 0,
  nextStart: -1,
  resources: []
};

let MOCK_USER_SESSION: common.ArcGISIdentityManager;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

afterEach(() => {
  fetchMock.restore();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `simple-types`: manages the creation and deployment of simple item types", () => {
  describe("convertItemToTemplate", () => {
    it("should handle error on getResources", done => {
      const solutionItemId = "sln1234567890";
      const item: any = mockItems.getAGOLItem("Workforce Project");
      item.title = "Dam Inspection Assignments";
      item.thumbnail = null;
      const expectedTemplate = templates.getItemTemplate("Workforce Project", [
        "abc715c2df2b466da05577776e82d044",
        "abc116555b16437f8435e079033128d0",
        "abc26a244163430590151395821fb845",
        "abc302ec12b74d2f9f2b3cc549420086",
        "abc4494043c3459faabcfd0e1ab557fc",
        "abc5dd4bdd18437f8d5ff1aa2d25fd7c",
        "abc64329e69144c59f69f3f3e0d45269",
        "cad3483e025c47338d43df308c117308",
        "bad3483e025c47338d43df308c117308"
      ]);
      expectedTemplate.item.extent = [];
      expectedTemplate.item.thumbnail = item.thumbnail;
      expectedTemplate.item.title = item.title;
      expectedTemplate.estimatedDeploymentCostFactor = 2;

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/wrk1234567890/resources",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/wrk1234567890/data",
          mockItems.getAGOLItemData("Workforce Project")
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/wrk1234567890/info/metadata/metadata.xml",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/sln1234567890/addResources",
          utils.getSuccessResponse()
        );
      staticRelatedItemsMocks.fetchMockRelatedItems("wrk1234567890", {
        total: 0,
        relatedItems: []
      });

      simpleTypes
        .convertItemToTemplate(solutionItemId, item, MOCK_USER_SESSION, MOCK_USER_SESSION, {})
        .then(newItemTemplate => {
          newItemTemplate.key = expectedTemplate.key;
          expect(newItemTemplate).toEqual(expectedTemplate);
          expect(newItemTemplate.resources).toEqual([]);
          done();
        }, done.fail);
    });

    it("should handle error on dataPromise", done => {
      const solutionItemId = "sln1234567890";
      const itemId: string = "abc0cab401af4828a25cc6eaeb59fb69";
      const item = {
        id: itemId,
        type: "Web Mapping Application",
        title: "Dam Inspection Assignments"
      };

      const url = common.getItemDataBlobUrl(itemId, MOCK_USER_SESSION);
      fetchMock
        .post(url, mockItems.get400Failure())
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69/resources",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/abc0cab401af4828a25cc6eaeb59fb69/info/metadata/metadata.xml",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/sln1234567890/addResources",
          utils.getSuccessResponse()
        );
      staticRelatedItemsMocks.fetchMockRelatedItems(
        "abc0cab401af4828a25cc6eaeb59fb69",
        { total: 0, relatedItems: [] }
      );

      simpleTypes
        .convertItemToTemplate(solutionItemId, item, MOCK_USER_SESSION, MOCK_USER_SESSION, {})
        .then(
          () => done(),
          () => done.fail()
        );
    });

    it("should handle item resource", done => {
      const solutionItemId = "sln1234567890";
      const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.item = mockItems.getAGOLItem("Web Map", "https://myorg.arcgis.com/home/webmap/viewer.html?webmap=map1234567890");
      itemTemplate.item.item = itemTemplate.itemId = itemTemplate.item.id;
      itemTemplate.item.thumbnail = "thumbnail/banner.png";

      const expectedFetch = utils.getSampleImageAsBlob();

      const expectedTemplate: any = {
        itemId: "map1234567890",
        type: "Web Map",
        item: {
          id: "{{map1234567890.itemId}}",
          type: "Web Map",
          accessInformation: "Esri, Inc.",
          categories: [],
          contentStatus: null,
          culture: "en-us",
          description: "Description of an AGOL item",
          extent: [],
          properties: null,
          spatialReference: undefined,
          licenseInfo: null,
          name: "Name of an AGOL item",
          snippet: "Snippet of an AGOL item",
          tags: ["test"],
          thumbnail: "thumbnail/banner.png",
          title: "An AGOL item",
          typeKeywords: ["JavaScript"],
          origUrl: undefined,
          url:
            "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{map1234567890.itemId}}",
          created: 1520968147000,
          modified: 1522178539000
        },
        data: null,
        resources: [],
        dependencies: [],
        relatedItems: [],
        groups: [],
        properties: {},
        estimatedDeploymentCostFactor: 2
      };

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/resources",
          {
            total: 1,
            start: 1,
            num: 1,
            nextStart: -1,
            resources: [
              {
                resource: "image/banner.png",
                created: 1522711362000,
                size: 56945
              }
            ]
          }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/resources/image/banner.png",
          expectedFetch,
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/" +
            MOCK_USER_SESSION.username +
            "/items/" +
            solutionItemId +
            "/addResources",
          {
            success: true,
            itemId: solutionItemId,
            owner: MOCK_USER_SESSION.username,
            folder: null
          }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/info/thumbnail/banner.png",
          expectedFetch,
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/data",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/info/metadata/metadata.xml",
          mockItems.get400Failure()
        );
      staticRelatedItemsMocks.fetchMockRelatedItems("map1234567890", {
        total: 0,
        relatedItems: []
      });

      simpleTypes
        .convertItemToTemplate(
          solutionItemId,
          itemTemplate.item,
          MOCK_USER_SESSION,
          MOCK_USER_SESSION,
          {}
        )
        .then(newItemTemplate => {
          delete newItemTemplate.key; // key is randomly generated, and so is not testable
          expect(newItemTemplate).toEqual(expectedTemplate);
          done();
        }, done.fail);
    });

    it("should catch fetch errors", done => {
      // TODO resolve Karma internal error triggered by this test
      const solutionItemId = "sln1234567890";
      const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.item = mockItems.getAGOLItem("Form", null);
      itemTemplate.itemId = itemTemplate.item.id;
      itemTemplate.item.thumbnail = null;

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/frm1234567890/info/metadata/metadata.xml",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/frm1234567890/resources",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/frm1234567890/data",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            solutionItemId +
            "/addResources",
          { success: true, id: solutionItemId }
        );
      staticRelatedItemsMocks.fetchMockRelatedItems(
        "frm1234567890",
        mockItems.get500Failure()
      );

      simpleTypes
        .convertItemToTemplate(
          solutionItemId,
          itemTemplate.item,
          MOCK_USER_SESSION,
          MOCK_USER_SESSION,
          {}
        )
        .then(
          () => done(),
          () => done.fail()
        );
    });

    it("should catch wrapup errors", done => {
      const solutionItemId = "sln1234567890";
      const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.item = mockItems.getAGOLItem("Form", null);
      itemTemplate.itemId = itemTemplate.item.id;
      itemTemplate.item.thumbnail = null;
      itemTemplate.item.name = "form.zip";

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/data",
          utils.getSampleZip(),
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/resources",
          noResourcesResponse
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/info/metadata/metadata.xml",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/" +
            MOCK_USER_SESSION.username +
            "/items/" +
            solutionItemId +
            "/addResources",
          mockItems.get400Failure()
        );

      staticRelatedItemsMocks.fetchMockRelatedItems(
        "frm1234567890",
        mockItems.get500Failure()
      );

      simpleTypes
        .convertItemToTemplate(
          solutionItemId,
          itemTemplate.item,
          MOCK_USER_SESSION,
          MOCK_USER_SESSION,
          {}
        )
        .then(
          () => done.fail(),
          () => done()
        );
    });
  });

  describe("createItemFromTemplate", () => {
    it("should handle error on addItem", done => {
      const itemId: string = "abc0cab401af4828a25cc6eaeb59fb69";
      const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";
      const templateDictionary: any = {};

      const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.itemId = itemId;
      itemTemplate.type = "Web Map";
      itemTemplate.item = {
        id: itemId,
        type: itemTemplate.type
      };

      const expected: any = {};
      expected[itemId] = newItemID;

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          mockItems.get400Failure()
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
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          done();
        });
    });

    it("should handle success === false", done => {
      const itemId: string = "abc0cab401af4828a25cc6eaeb59fb69";
      const newItemID: string = "abc1cab401af4828a25cc6eaeb59fb69";
      const templateDictionary: any = {};

      const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.itemId = itemId;
      itemTemplate.type = "Web Map";
      itemTemplate.item = {
        id: itemId,
        type: itemTemplate.type
      };

      const expected: any = {};
      expected[itemId] = newItemID;

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getFailureResponse({ id: newItemID, folder: null })
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
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          done();
        });
    });

    it("should handle cancellation before deployment of item starts", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Web Map"
      );
      const templateDictionary: any = {};

      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallbackOnNthCall(1)
        )
        .then(response => {
          expect(response).toEqual(templates.getFailedItem(itemTemplate.type));
          done();
        }, done.fail);
    });

    it("should handle cancellation after deployed item is created", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Web Map"
      );
      const templateDictionary: any = {};

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: itemTemplate.itemId, folder: null })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/map1234567890/delete",
          utils.getSuccessResponse({ itemId: itemTemplate.itemId })
        );

      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallbackOnNthCall(2)
        )
        .then(response => {
          expect(response).toEqual(templates.getFailedItem(itemTemplate.type));
          done();
        }, done.fail);
    });

    it("should handle cancellation failure after deployed item is created", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Web Map"
      );
      const templateDictionary: any = {};

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: itemTemplate.itemId, folder: null })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/map1234567890/delete",
          utils.getFailureResponse({ itemId: itemTemplate.itemId })
        );

      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallbackOnNthCall(2)
        )
        .then(response => {
          expect(response).toEqual(templates.getFailedItem(itemTemplate.type));
          done();
        }, done.fail);
    });

    it("should handle cancellation after deployed item is finished", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Web Map"
      );
      const templateDictionary: any = {
        portalBaseUrl: utils.PORTAL_SUBSET.portalUrl
      };

      const updatedItem = mockItems.getAGOLItem(
        "Web Map",
        "https://myorg.maps.arcgis.com/home/webmap/viewer.html?webmap=map1234567890"
      );

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: itemTemplate.itemId, folder: null })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/map1234567890/update",
          { success: true, id: itemTemplate.itemId }
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/map1234567890?f=json&token=fake-token",
          updatedItem
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/map1234567890/delete",
          utils.getSuccessResponse({ itemId: itemTemplate.itemId })
        );

      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallbackOnNthCall(3)
        )
        .then(response => {
          expect(response).toEqual(templates.getFailedItem(itemTemplate.type));
          done();
        }, done.fail);
    });

    it("should handle cancellation failure after deployed item is finished", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Web Map"
      );
      const templateDictionary: any = {
        portalBaseUrl: utils.PORTAL_SUBSET.portalUrl
      };

      const updatedItem = mockItems.getAGOLItem(
        "Web Map",
        "https://myorg.maps.arcgis.com/home/webmap/viewer.html?webmap=map1234567890"
      );

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: itemTemplate.itemId, folder: null })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/map1234567890/update",
          { success: true, id: itemTemplate.itemId }
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/map1234567890?f=json&token=fake-token",
          updatedItem
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/map1234567890/delete",
          utils.getFailureResponse({ itemId: itemTemplate.itemId })
        );

      simpleTypes
        .createItemFromTemplate(
          itemTemplate,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallbackOnNthCall(3)
        )
        .then(response => {
          expect(response).toEqual(templates.getFailedItem(itemTemplate.type));
          done();
        }, done.fail);
    });
  });

  describe("postProcessFieldReferences", () => {
    it("should process dashboard field references", () => {
      const template: common.IItemTemplate = common.cloneObject(
        staticDashboardMocks._initialDashboardTemplate
      );
      const datasourceInfos: common.IDatasourceInfo[] = common.cloneObject(
        staticDashboardMocks.datasourceInfos
      );
      const expected: common.IItemTemplate = common.cloneObject(
        staticDashboardMocks.expectedTemplate
      );

      // we don't first convert the item to template so the itemIds are not templatized
      // clean those out for this test.
      // This should be handled differently when removing the static mock items in favor of standard mock items.

      // Clean datasource itemIds
      expected.data.headerPanel.selectors[4].datasets[0].dataSource.itemId = common.cleanLayerBasedItemId(
        expected.data.headerPanel.selectors[4].datasets[0].dataSource.itemId
      );
      expected.data.leftPanel.selectors[0].datasets[0].dataSource.itemId = common.cleanLayerBasedItemId(
        expected.data.leftPanel.selectors[0].datasets[0].dataSource.itemId
      );
      expected.data.leftPanel.selectors[4].datasets[0].dataSource.itemId = common.cleanLayerBasedItemId(
        expected.data.leftPanel.selectors[4].datasets[0].dataSource.itemId
      );
      expected.data.widgets[3].datasets[1].dataSource.itemId = common.cleanLayerBasedItemId(
        expected.data.widgets[3].datasets[1].dataSource.itemId
      );
      expected.data.widgets[3].datasets[2].dataSource.itemId = common.cleanLayerBasedItemId(
        expected.data.widgets[3].datasets[2].dataSource.itemId
      );
      expected.data.widgets[4].datasets[0].dataSource.itemId = common.cleanLayerBasedItemId(
        expected.data.widgets[4].datasets[0].dataSource.itemId
      );
      expected.data.widgets[6].datasets[0].dataSource.itemId = common.cleanLayerBasedItemId(
        expected.data.widgets[6].datasets[0].dataSource.itemId
      );
      expected.data.widgets[8].datasets[0].dataSource.itemId = common.cleanLayerBasedItemId(
        expected.data.widgets[8].datasets[0].dataSource.itemId
      );
      expected.data.urlParameters[4].datasets[0].dataSource.itemId = common.cleanLayerBasedItemId(
        expected.data.urlParameters[4].datasets[0].dataSource.itemId
      );

      // clean map itemId
      expected.data.widgets[0].itemId = common.cleanItemId(
        expected.data.widgets[0].itemId
      );

      // clean layerIds
      expected.data.headerPanel.selectors[4].datasets[0].dataSource.layerId = common.cleanLayerId(
        expected.data.headerPanel.selectors[4].datasets[0].dataSource.layerId
      );
      expected.data.leftPanel.selectors[0].datasets[0].dataSource.layerId = common.cleanLayerId(
        expected.data.leftPanel.selectors[0].datasets[0].dataSource.layerId
      );
      expected.data.leftPanel.selectors[4].datasets[0].dataSource.layerId = common.cleanLayerId(
        expected.data.leftPanel.selectors[4].datasets[0].dataSource.layerId
      );
      expected.data.widgets[3].datasets[1].dataSource.layerId = common.cleanLayerId(
        expected.data.widgets[3].datasets[1].dataSource.layerId
      );
      expected.data.widgets[3].datasets[2].dataSource.layerId = common.cleanLayerId(
        expected.data.widgets[3].datasets[2].dataSource.layerId
      );
      expected.data.widgets[4].datasets[0].dataSource.layerId = common.cleanLayerId(
        expected.data.widgets[4].datasets[0].dataSource.layerId
      );
      expected.data.widgets[6].datasets[0].dataSource.layerId = common.cleanLayerId(
        expected.data.widgets[6].datasets[0].dataSource.layerId
      );
      expected.data.widgets[8].datasets[0].dataSource.layerId = common.cleanLayerId(
        expected.data.widgets[8].datasets[0].dataSource.layerId
      );
      expected.data.urlParameters[4].datasets[0].dataSource.layerId = common.cleanLayerId(
        expected.data.urlParameters[4].datasets[0].dataSource.layerId
      );

      // clean dependencies
      expected.dependencies = [];

      const actual = simpleTypes.postProcessFieldReferences(
        template,
        datasourceInfos,
        "Dashboard"
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("utils.createFailingItemProgressCallbackOnNthCall", () => {
    it("fails upon first call", () => {
      const itemId = "itm1234567890";
      const status = common.EItemProgressStatus.Started;
      const costUsed = 0;
      const progressCallback = utils.createFailingItemProgressCallbackOnNthCall(
        1
      );
      expect(progressCallback(itemId, status, costUsed)).toBeFalsy();
    });

    it("fails upon second call", () => {
      const itemId = "itm1234567890";
      const status = common.EItemProgressStatus.Started;
      const costUsed = 0;
      const progressCallback = utils.createFailingItemProgressCallbackOnNthCall(
        2
      );
      expect(progressCallback(itemId, status, costUsed)).toBeTruthy();
      expect(progressCallback(itemId, status, costUsed)).toBeFalsy();
    });

    it("fails upon third call", () => {
      const itemId = "itm1234567890";
      const status = common.EItemProgressStatus.Started;
      const costUsed = 0;
      const progressCallback = utils.createFailingItemProgressCallbackOnNthCall(
        3
      );
      expect(progressCallback(itemId, status, costUsed)).toBeTruthy();
      expect(progressCallback(itemId, status, costUsed)).toBeTruthy();
      expect(progressCallback(itemId, status, costUsed)).toBeFalsy();
    });
  });

  describe("postProcess hook", () => {
    it("fetch, interpolate and share", () => {
      const template = templates.getItemTemplate("Web Map");
      template.item.id = template.itemId = "3ef";
      const td = { owner: "Luke Skywalker" };

      const updateUrl =
        utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/3ef/update";
      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/3ef?f=json&token=fake-token",
          template.item
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/3ef/data", {
          value: "{{owner}}"
        })
        .post(updateUrl, utils.getSuccessResponse({ id: template.item.id }));

      spyOn(console, "log").and.callFake(() => {});
      return simpleTypes
        .postProcess(
          "3ef",
          "Web Map",
          [],
          template,
          [template],
          td,
          MOCK_USER_SESSION
        )
        .then(result => {
          expect(result).toEqual(
            utils.getSuccessResponse({ id: template.item.id })
          );

          const callBody = fetchMock.calls(updateUrl)[0][1].body as string;
          expect(callBody).toEqual(
            "f=json&text=%7B%22value%22%3A%22Luke%20Skywalker%22%7D&id=3ef&name=Name%20of%20an%20AGOL%20item&" +
              "title=An%20AGOL%20item&type=Web%20Map&typeKeywords=JavaScript&description=Description%20of%20an%20" +
              "AGOL%20item&tags=test&snippet=Snippet%20of%20an%20AGOL%20item&thumbnail=https%3A%2F%2F" +
              "myorg.maps.arcgis.com%2Fsharing%2Frest%2Fcontent%2Fitems%2Fmap1234567890%2Finfo%2Fthumbnail%2F" +
              "ago_downloaded.png&extent=%7B%7BsolutionItemExtent%7D%7D&categories=&accessInformation=Esri%2C%20" +
              "Inc.&origUrl=%7B%7BportalBaseUrl%7D%7D%2Fhome%2Fwebmap%2Fviewer.html%3Fwebmap%3D%7B%7B" +
              "map1234567890.itemId%7D%7D&culture=en-us&url=%7B%7BportalBaseUrl%7D%7D%2Fhome%2Fwebmap%2F" +
              "viewer.html%3Fwebmap%3D%7B%7Bmap1234567890.itemId%7D%7D&created=1520968147000&modified=1522178539000" +
              "&token=fake-token"
          );
        });
    });
    it("should update only if interpolation needed", () => {
      const template = templates.getItemTemplate(
        "Web Map",
        [],
        "http://www.esri.com"
      );
      template.item.id = template.itemId = "3ef";
      template.item.extent = null;
      const td = { owner: "Luke Skywalker" };

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/3ef?f=json&token=fake-token",
          template.item
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/3ef/data", {
          value: "Larry"
        });

      return simpleTypes
        .postProcess(
          "3ef",
          "Web Map",
          [],
          template,
          [template],
          td,
          MOCK_USER_SESSION
        )
        .then(result => {
          expect(result).toEqual(
            utils.getSuccessResponse({ id: template.item.id })
          );
        });
    });
  });
});
