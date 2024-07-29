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
 * Provides tests for functions involving the creation and deployment of feature layers and services.
 */

import * as common from "@esri/solution-common";
import * as featureLayer from "../src/feature-layer";
import * as utils from "../../common/test/mocks/utils";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as mockSolutions from "../../common/test/mocks/templates";

let MOCK_USER_SESSION: common.UserSession;
let itemTemplate: common.IItemTemplate;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

  // refresh the template if any temp changes were made
  itemTemplate = mockSolutions.getItemTemplate(
    "Feature Service",
    [],
    "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer",
  );
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

const _organization: any = utils.getPortalsSelfResponse();

const _solutionItemExtent: any = [
  [0, 0],
  [1, 1],
];

afterEach(() => {
  fetchMock.restore();
});

describe("Module `feature-layer`: manages the creation and deployment of feature service types", () => {
  describe("convertItemToTemplate", () => {
    it("templatize common properties", async () => {
      const id: string = "svc1234567890";
      const url: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const expectedUrl: string = "{{" + id + ".url}}";
      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const expectedId: string = "{{" + id + ".itemId}}";
      const keyField: string = "globalid";
      const expectedLayerKeyField: string = "{{" + id + ".layer0.fields.globalid.name}}";
      const expectedTableKeyField: string = "{{" + id + ".layer1.fields.globalid.name}}";
      const defQuery: string = "status = 'BoardReview'";
      const expectedLayerDefQuery: string = "status = '{{" + id + ".layer0.fields.boardreview.name}}'";
      const expectedTableDefQuery: string = "status = '{{" + id + ".layer1.fields.boardreview.name}}'";

      const layer0 = mockItems.getAGOLLayerOrTable(0, "A", "Feature Layer");
      layer0.relationships = [{}];
      layer0.relationships[0].keyField = keyField;
      layer0.viewDefinitionQuery = defQuery;

      const table0 = mockItems.getAGOLLayerOrTable(1, "B", "Table");
      table0.relationships = [{}];
      table0.relationships[0].keyField = keyField;
      table0.viewDefinitionQuery = defQuery;

      const serviceResponse = mockItems.getAGOLService([layer0], [table0]);

      itemTemplate.itemId = id;
      itemTemplate.item.id = id;
      itemTemplate.properties.service.serviceItemId = id;
      itemTemplate.properties.service.cacheMaxAge = serviceResponse.adminServiceInfo.cacheMaxAge;
      itemTemplate.properties.layers[0] = layer0;
      itemTemplate.properties.tables[0] = table0;
      delete itemTemplate.item.item;

      // verify the state up front
      expect(itemTemplate.item.id).toEqual(id);
      expect(itemTemplate.item.url).toEqual(url);
      expect(itemTemplate.item.modified).toEqual(1522178539000); // feature service's modified date
      expect(itemTemplate.dependencies.length).toEqual(0);
      expect(itemTemplate.data.layers).toBeDefined();
      expect(itemTemplate.data.tables).toBeDefined();
      expect(itemTemplate.properties.service.serviceItemId).toEqual(id);

      expect(itemTemplate.properties.layers[0].serviceItemId).toEqual(id);
      expect(itemTemplate.properties.layers[0].relationships[0].keyField).toEqual(keyField);
      expect(itemTemplate.properties.layers[0].viewDefinitionQuery).toEqual(defQuery);
      expect(itemTemplate.properties.layers[0].definitionQuery).toEqual(defQuery);

      expect(itemTemplate.properties.tables[0].serviceItemId).toEqual(id);
      expect(itemTemplate.properties.tables[0].relationships[0].keyField).toEqual(keyField);
      expect(itemTemplate.properties.tables[0].viewDefinitionQuery).toEqual(defQuery);
      expect(itemTemplate.properties.tables[0].definitionQuery).toEqual(defQuery);

      fetchMock
        .post(adminUrl + "?f=json", serviceResponse)
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/svc1234567890/data", mockItems.get500Failure());

      const r = await featureLayer.convertItemToTemplate(itemTemplate.item, MOCK_USER_SESSION, MOCK_USER_SESSION);
      // verify the state up front
      expect(r.item.id).toEqual(expectedId);
      expect(r.item.url).toEqual(expectedUrl);
      expect(r.item.modified).toEqual(1538579807130); // from layer or table, later than item's modified date
      expect(r.dependencies.length).toEqual(1);
      expect(r.data).toBeNull();
      expect(r.properties.service.serviceItemId).toEqual(expectedId);
      expect(r.properties.layers[0].serviceItemId).toEqual(expectedId);
      expect(r.properties.tables[0].serviceItemId).toEqual(expectedId);

      // Templatize layer & table fields
      common.templatize(r, [{ id: "svc1234567890", name: "OtherSourceServiceName" }], true);

      expect(r.properties.layers[0].relationships[0].keyField).toEqual(expectedLayerKeyField);
      expect(r.properties.layers[0].viewDefinitionQuery).toEqual(expectedLayerDefQuery);
      expect(r.properties.layers[0].definitionQuery).toEqual(expectedLayerDefQuery);

      expect(r.properties.tables[0].relationships[0].keyField).toEqual(expectedTableKeyField);
      expect(r.properties.tables[0].viewDefinitionQuery).toEqual(expectedTableDefQuery);
      expect(r.properties.tables[0].definitionQuery).toEqual(expectedTableDefQuery);
    });

    it("handle invalid group designations", async () => {
      const id: string = "svc1234567890";
      const url: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      const serviceResponse = mockItems.getAGOLService(
        [mockItems.getAGOLLayerOrTable(0, "A", "Feature Layer")],
        [mockItems.getAGOLLayerOrTable(1, "B", "Table")],
      );

      itemTemplate.itemId = id;
      itemTemplate.item.id = id;
      itemTemplate.item.groupDesignations = "livingatlas";

      fetchMock.post(url + "?f=json", serviceResponse);

      const expected: any = {};
      expected[id] = {
        itemId: id,
        layer0: {
          fields: {},
          url: url + "/0",
          layerId: "0",
          itemId: id,
        },
        layer1: {
          fields: {},
          url: url + "/1",
          layerId: "1",
          itemId: id,
        },
      };

      const r = await featureLayer.convertItemToTemplate(itemTemplate.item, MOCK_USER_SESSION, MOCK_USER_SESSION);
      // verify the state after
      expect(r.item.id).toEqual(id);
      expect(r.item.url).toEqual(url);
      expect(r.dependencies).toEqual([]);
      expect(r.properties).toEqual({
        hasInvalidDesignations: true,
      });
      expect(r.data).toEqual(expected);
    });

    it("handle error on updateTemplateForInvalidDesignations", async () => {
      const id: string = "svc1234567890";
      const url: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      itemTemplate.itemId = id;
      itemTemplate.item.id = id;
      itemTemplate.item.groupDesignations = "livingatlas";

      fetchMock.post(url + "?f=json", mockItems.get400Failure());

      return featureLayer.convertItemToTemplate(itemTemplate.item, MOCK_USER_SESSION, MOCK_USER_SESSION, true).then(
        () => fail(),
        () => Promise.resolve(),
      );
    });

    it("handle template item with missing url for invalid group designations", async () => {
      const id: string = "svc1234567890";

      itemTemplate.itemId = id;
      itemTemplate.item.id = id;
      itemTemplate.item.groupDesignations = "livingatlas";
      delete itemTemplate.item.url;

      const r = await featureLayer.convertItemToTemplate(itemTemplate.item, MOCK_USER_SESSION, MOCK_USER_SESSION);
      // verify the state after
      expect(r.item.id).toEqual(id);
      expect(r.dependencies).toEqual([]);
      expect(r.properties).toEqual({
        hasInvalidDesignations: true,
      });
    });

    it("handle invalid service data for invalid group designations", async () => {
      const id: string = "svc1234567890";
      const url: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      const serviceResponse = mockItems.getAGOLService();

      itemTemplate.itemId = id;
      itemTemplate.item.id = id;
      itemTemplate.item.groupDesignations = "livingatlas";

      fetchMock.post(url + "?f=json", serviceResponse);

      const r = await featureLayer.convertItemToTemplate(itemTemplate.item, MOCK_USER_SESSION, MOCK_USER_SESSION);
      // verify the state after
      expect(r.item.id).toEqual(id);
      expect(r.item.url).toEqual(url);
      expect(r.dependencies).toEqual([]);
      expect(r.properties).toEqual({
        hasInvalidDesignations: true,
      });
    });

    it("should handle error on extractDependencies", async () => {
      const id: string = "svc1234567890";
      const url: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";
      const itemDataUrl: string = utils.PORTAL_SUBSET.restUrl + "/content/items/svc1234567890/data";

      const keyField: string = "globalid";
      const defQuery: string = "status = 'BoardReview'";

      const layer0 = mockItems.getAGOLLayerOrTable(0, "A", "Feature Layer");
      layer0.relationships = [{}];
      layer0.relationships[0].keyField = keyField;
      layer0.viewDefinitionQuery = defQuery;

      const table0 = mockItems.getAGOLLayerOrTable(1, "B", "Table");
      table0.relationships = [{}];
      table0.relationships[0].keyField = keyField;
      table0.viewDefinitionQuery = defQuery;

      const serviceResponse = mockItems.getAGOLService([layer0], [table0]);

      itemTemplate.itemId = id;
      itemTemplate.item.id = id;
      itemTemplate.properties.service.serviceItemId = id;
      itemTemplate.properties.service.cacheMaxAge = serviceResponse.adminServiceInfo.cacheMaxAge;
      itemTemplate.properties.layers[0] = layer0;
      itemTemplate.properties.tables[0] = table0;
      delete itemTemplate.item.item;

      fetchMock
        .post(itemDataUrl, "{}")
        .post(adminUrl + "?f=json", serviceResponse)
        .post(url + "/sources?f=json", mockItems.get400Failure());

      const templateDictionary = {};
      return featureLayer
        .convertItemToTemplate(itemTemplate.item, MOCK_USER_SESSION, MOCK_USER_SESSION, templateDictionary)
        .then(
          () => fail(),
          () => Promise.resolve(),
        );
    });

    it("should handle error on getItemData", async () => {
      const id: string = "svc1234567890";
      const url: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";
      const itemDataUrl: string = utils.PORTAL_SUBSET.restUrl + "/content/items/svc1234567890/data";

      itemTemplate.itemId = id;
      itemTemplate.item.id = id;

      const keyField: string = "globalid";
      const defQuery: string = "status = 'BoardReview'";

      const layer0 = mockItems.getAGOLLayerOrTable(0, "A", "Feature Layer");
      layer0.relationships = [{}];
      layer0.relationships[0].keyField = keyField;
      layer0.viewDefinitionQuery = defQuery;

      const table0 = mockItems.getAGOLLayerOrTable(1, "B", "Table");
      table0.relationships = [{}];
      table0.relationships[0].keyField = keyField;
      table0.viewDefinitionQuery = defQuery;

      const serviceResponse = mockItems.getAGOLService([layer0], [table0]);

      fetchMock
        .post(url + "?f=json", serviceResponse)
        .post(adminUrl + "?f=json", serviceResponse)
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(itemDataUrl, mockItems.get400Failure());

      const templateDictionary = {};
      return featureLayer.convertItemToTemplate(
        itemTemplate.item,
        MOCK_USER_SESSION,
        MOCK_USER_SESSION,
        templateDictionary,
      );
    });

    it("should handle error on getServiceLayersAndTables", async () => {
      const id: string = "svc1234567890";
      const url: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";
      const itemDataUrl: string = utils.PORTAL_SUBSET.restUrl + "/content/items/svc1234567890/data";

      const keyField: string = "globalid";
      const defQuery: string = "status = 'BoardReview'";

      itemTemplate.itemId = id;
      itemTemplate.item.id = id;
      itemTemplate.properties.service.serviceItemId = id;

      itemTemplate.properties.layers[0].serviceItemId = id;
      itemTemplate.properties.layers[0].relationships[0].keyField = keyField;
      itemTemplate.properties.layers[0].viewDefinitionQuery = defQuery;

      itemTemplate.properties.tables[0].serviceItemId = id;
      itemTemplate.properties.tables[0].relationships[0].keyField = keyField;
      itemTemplate.properties.tables[0].viewDefinitionQuery = defQuery;
      delete itemTemplate.item.item;

      fetchMock
        .post(itemDataUrl, "{}")
        .post(adminUrl + "?f=json", mockItems.get400Failure())
        .post(url + "/sources?f=json", mockItems.get400Failure());

      const templateDictionary = {};
      return featureLayer
        .convertItemToTemplate(itemTemplate.item, MOCK_USER_SESSION, MOCK_USER_SESSION, templateDictionary)
        .then(
          () => fail(),
          () => Promise.resolve(),
        );
    });

    it("gets the most recently-edited layer/table", () => {
      const layers = [
        {
          editingInfo: { lastEditDate: 12345 },
        },
        {
          editingInfo: { lastEditDate: 1234 },
        },
      ];
      expect(featureLayer._mostRecentlyEditedLayer(layers)).toEqual(12345);
    });

    it("handles missing editingInfo for most recently-edited check", () => {
      const layers = [{}, {}];
      expect(featureLayer._mostRecentlyEditedLayer(layers)).toEqual(0);
    });

    it("handles missing lastEditDate for most recently-edited check", () => {
      const layers = [
        {
          editingInfo: {},
        },
        {
          editingInfo: {},
        },
      ];
      expect(featureLayer._mostRecentlyEditedLayer(layers)).toEqual(0);
    });

    it("handles an empty layer/table for most recently-edited check", () => {
      const layers = [];
      expect(featureLayer._mostRecentlyEditedLayer(layers)).toEqual(0);
    });
  });

  describe("createItemFromTemplate", () => {
    it("should create a solution from a template for portal", async () => {
      const expectedId: string = "svc1234567890";
      const id: string = "{{" + expectedId + ".itemId}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string = "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string = "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string = "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string = "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;

      // verify the state up front
      expect(itemTemplate.item.id).withContext("up-front id check").toEqual(id);
      expect(itemTemplate.item.url).withContext("up-front url check").toEqual(expectedUrl);
      expect(itemTemplate.dependencies.length).withContext("up-front dependencies check").toEqual(0);
      expect(itemTemplate.properties.service.serviceItemId).withContext("up-front serviceItemId check").toEqual(id);

      expect(itemTemplate.properties.layers[0].serviceItemId)
        .withContext("up-front layers serviceItemId check")
        .toEqual(id);
      expect(itemTemplate.properties.layers[0].relationships[0].keyField)
        .withContext("up-front layers keyField check")
        .toEqual(layerKeyField);
      expect(itemTemplate.properties.layers[0].viewDefinitionQuery)
        .withContext("up-front layers viewDefinitionQuery check")
        .toEqual(layerDefQuery);
      expect(itemTemplate.properties.layers[0].definitionQuery)
        .withContext("up-front layers definitionQuery check")
        .toEqual(layerDefQuery);

      expect(itemTemplate.properties.tables[0].serviceItemId)
        .withContext("up-front tables withContext check")
        .toEqual(id);
      expect(itemTemplate.properties.tables[0].relationships[0].keyField)
        .withContext("up-front tables keyField check")
        .toEqual(tableKeyField);
      expect(itemTemplate.properties.tables[0].viewDefinitionQuery)
        .withContext("up-front tables viewDefinitionQuery check")
        .toEqual(tableDefQuery);
      expect(itemTemplate.properties.tables[0].definitionQuery)
        .withContext("up-front tables withContext check")
        .toEqual(tableDefQuery);

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      const expectedClone: common.IItemTemplate = common.cloneObject(itemTemplate);
      expectedClone.item.id = "svc1234567890";
      expectedClone.item.extent = [
        [0, 0],
        [1, 1],
      ];
      expectedClone.properties.service.serviceItemId = "svc1234567890";
      expectedClone.properties.layers[0].serviceItemId = "svc1234567890";
      expectedClone.properties.layers[0].relationships = null;
      expectedClone.properties.layers[0].viewDefinitionQuery = "status = 'BoardReview'";
      expectedClone.properties.layers[0].adminLayerInfo = undefined;
      expectedClone.properties.layers[0].uniqueIdField.name = "objectid";
      delete expectedClone.properties.layers[0].definitionQuery;
      delete expectedClone.properties.layers[0].isView;
      expectedClone.properties.tables[0].serviceItemId = "svc1234567890";
      expectedClone.properties.tables[0].relationships = null;
      expectedClone.properties.tables[0].viewDefinitionQuery = "status = 'BoardReview'";
      expectedClone.properties.tables[0].adminLayerInfo = undefined;
      expectedClone.properties.tables[0].uniqueIdField.name = "objectid";
      delete expectedClone.properties.tables[0].definitionQuery;
      delete expectedClone.properties.tables[0].isView;
      expectedClone.item.thumbnail = "thumbnail/ago_downloaded.png";
      delete expectedClone.item.spatialReference;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService", createResponse)
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/updateDefinition",
          '{"success":true}',
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/update", '{"success":true}')
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/svc1234567890?f=json&token=fake-token",
          expectedClone.item,
        );

      const r = await featureLayer.createItemFromTemplate(
        itemTemplate,
        {
          svc1234567890: {},
          organization: _organization,
          solutionItemExtent: _solutionItemExtent,
          isPortal: true,
        },
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK,
      );
      expectedClone.item.url = expectedUrl + "/";
      expect(r).withContext("results").toEqual({
        item: expectedClone,
        id: "svc1234567890",
        type: itemTemplate.type,
        postProcess: false,
      });
    });

    it("should create a solution from a template", async () => {
      const expectedId: string = "svc1234567890";
      const id: string = "{{" + expectedId + ".itemId}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerDefQuery: string = "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string = "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.service.isView = false;
      itemTemplate.properties.service.size = 1009;

      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;

      // verify the state up front
      expect(itemTemplate.item.id).withContext("up-front id check").toEqual(id);
      expect(itemTemplate.item.url).withContext("up-front url check").toEqual(expectedUrl);
      expect(itemTemplate.dependencies.length).withContext("up-front dependencies check").toEqual(0);
      expect(itemTemplate.properties.service.serviceItemId).withContext("up-front serviceItemId check").toEqual(id);

      expect(itemTemplate.properties.layers[0].serviceItemId)
        .withContext("up-front layers serviceItemId check")
        .toEqual(id);
      expect(itemTemplate.properties.layers[0].viewDefinitionQuery)
        .withContext("up-front layers viewDefinitionQuery check")
        .toEqual(layerDefQuery);
      expect(itemTemplate.properties.layers[0].definitionQuery)
        .withContext("up-front layers definitionQuery check")
        .toEqual(layerDefQuery);

      expect(itemTemplate.properties.tables[0].serviceItemId)
        .withContext("up-front tables withContext check")
        .toEqual(id);
      expect(itemTemplate.properties.tables[0].viewDefinitionQuery)
        .withContext("up-front tables viewDefinitionQuery check")
        .toEqual(tableDefQuery);
      expect(itemTemplate.properties.tables[0].definitionQuery)
        .withContext("up-front tables withContext check")
        .toEqual(tableDefQuery);

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      const expectedClone: common.IItemTemplate = common.cloneObject(itemTemplate);
      expectedClone.item.id = "svc1234567890";
      expectedClone.item.extent = [
        [0, 0],
        [1, 1],
      ];
      expectedClone.properties.service.serviceItemId = "svc1234567890";
      expectedClone.properties.layers[0].serviceItemId = "svc1234567890";
      expectedClone.properties.layers[0].relationships = null;
      expectedClone.properties.layers[0].viewDefinitionQuery = "status = 'BoardReview'";
      delete expectedClone.properties.layers[0].definitionQuery;
      expectedClone.properties.tables[0].serviceItemId = "svc1234567890";
      expectedClone.properties.tables[0].relationships = null;
      expectedClone.properties.tables[0].viewDefinitionQuery = "status = 'BoardReview'";
      delete expectedClone.properties.tables[0].definitionQuery;
      expectedClone.item.thumbnail = "thumbnail/ago_downloaded.png";
      delete expectedClone.item.spatialReference;
      delete expectedClone.properties.service.size;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService", createResponse)
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}',
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/update", '{"success":true}')
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/svc1234567890?f=json&token=fake-token",
          expectedClone.item,
        );

      const r = await featureLayer.createItemFromTemplate(
        itemTemplate,
        {
          svc1234567890: {},
          organization: _organization,
          solutionItemExtent: _solutionItemExtent,
        },
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK,
      );
      expectedClone.item.url = expectedUrl + "/";
      expect(r).withContext("results").toEqual({
        item: expectedClone,
        id: "svc1234567890",
        type: itemTemplate.type,
        postProcess: false,
      });
    });

    it("should create a solution with FS from a template", async () => {
      const expectedId: string = "svc1234567890";
      const id: string = "{{" + expectedId + ".itemId}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerDefQuery: string = "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string = "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.service.isView = false;

      itemTemplate.properties.layers[0].isView = false;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].isView = false;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;

      // verify the state up front
      expect(itemTemplate.item.id).withContext("up-front id check").toEqual(id);
      expect(itemTemplate.item.url).withContext("up-front url check").toEqual(expectedUrl);
      expect(itemTemplate.dependencies.length).withContext("up-front dependencies check").toEqual(0);
      expect(itemTemplate.properties.service.serviceItemId).withContext("up-front serviceItemId check").toEqual(id);

      expect(itemTemplate.properties.layers[0].serviceItemId)
        .withContext("up-front layers serviceItemId check")
        .toEqual(id);
      expect(itemTemplate.properties.layers[0].viewDefinitionQuery)
        .withContext("up-front layers viewDefinitionQuery check")
        .toEqual(layerDefQuery);
      expect(itemTemplate.properties.layers[0].definitionQuery)
        .withContext("up-front layers definitionQuery check")
        .toEqual(layerDefQuery);

      expect(itemTemplate.properties.tables[0].serviceItemId)
        .withContext("up-front tables withContext check")
        .toEqual(id);
      expect(itemTemplate.properties.tables[0].viewDefinitionQuery)
        .withContext("up-front tables viewDefinitionQuery check")
        .toEqual(tableDefQuery);
      expect(itemTemplate.properties.tables[0].definitionQuery)
        .withContext("up-front tables withContext check")
        .toEqual(tableDefQuery);

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      const expectedClone: common.IItemTemplate = common.cloneObject(itemTemplate);
      expectedClone.item.id = "svc1234567890";
      expectedClone.item.extent = [
        [0, 0],
        [1, 1],
      ];
      expectedClone.properties.service.serviceItemId = "svc1234567890";
      expectedClone.properties.layers[0].serviceItemId = "svc1234567890";
      expectedClone.properties.layers[0].relationships = null;
      expectedClone.properties.layers[0].viewDefinitionQuery = "status = 'BoardReview'";
      expectedClone.properties.layers[0].definitionQuery = "status = 'BoardReview'";

      expectedClone.properties.tables[0].serviceItemId = "svc1234567890";
      expectedClone.properties.tables[0].relationships = null;
      expectedClone.properties.tables[0].viewDefinitionQuery = "status = 'BoardReview'";
      expectedClone.properties.tables[0].definitionQuery = "status = 'BoardReview'";
      expectedClone.item.thumbnail = "thumbnail/ago_downloaded.png";
      delete expectedClone.item.spatialReference;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService", createResponse)
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}',
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/update", '{"success":true}')
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/svc1234567890?f=json&token=fake-token",
          expectedClone.item,
        );

      const r = await featureLayer.createItemFromTemplate(
        itemTemplate,
        {
          svc1234567890: {},
          organization: _organization,
          solutionItemExtent: _solutionItemExtent,
        },
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK,
      );
      expectedClone.item.url = expectedUrl + "/";
      expect(r).withContext("results").toEqual({
        item: expectedClone,
        id: "svc1234567890",
        type: itemTemplate.type,
        postProcess: false,
      });
    });

    it("should set postProcess to true when the item has unprocessed interpolation tokens", async () => {
      const expectedId: string = "svc1234567890";
      const id: string = "{{" + expectedId + ".itemId}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerDefQuery: string = "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string = "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.layers[0].relationships = null;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].relationships = null;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;

      itemTemplate.item.other = "{{unprocessed.itemId}}";
      itemTemplate.properties.service.isView = false;

      // verify the state up front
      expect(itemTemplate.item.id).withContext("up-front id check").toEqual(id);
      expect(itemTemplate.item.url).withContext("up-front url check").toEqual(expectedUrl);
      expect(itemTemplate.dependencies.length).withContext("up-front dependencies check").toEqual(0);
      expect(itemTemplate.properties.service.serviceItemId).withContext("up-front serviceItemId check").toEqual(id);

      expect(itemTemplate.properties.layers[0].serviceItemId)
        .withContext("up-front layers serviceItemId check")
        .toEqual(id);
      expect(itemTemplate.properties.layers[0].viewDefinitionQuery)
        .withContext("up-front layers viewDefinitionQuery check")
        .toEqual(layerDefQuery);
      expect(itemTemplate.properties.layers[0].definitionQuery)
        .withContext("up-front layers definitionQuery check")
        .toEqual(layerDefQuery);

      expect(itemTemplate.properties.tables[0].serviceItemId)
        .withContext("up-front tables withContext check")
        .toEqual(id);
      expect(itemTemplate.properties.tables[0].viewDefinitionQuery)
        .withContext("up-front tables viewDefinitionQuery check")
        .toEqual(tableDefQuery);
      expect(itemTemplate.properties.tables[0].definitionQuery)
        .withContext("up-front tables withContext check")
        .toEqual(tableDefQuery);

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      const expectedClone: common.IItemTemplate = common.cloneObject(itemTemplate);
      expectedClone.item.id = "svc1234567890";
      expectedClone.item.extent = [
        [0, 0],
        [1, 1],
      ];
      expectedClone.properties.service.serviceItemId = "svc1234567890";
      expectedClone.properties.layers[0].serviceItemId = "svc1234567890";
      expectedClone.properties.layers[0].viewDefinitionQuery = "status = 'BoardReview'";
      delete expectedClone.properties.layers[0].definitionQuery;
      expectedClone.properties.tables[0].serviceItemId = "svc1234567890";
      expectedClone.properties.tables[0].viewDefinitionQuery = "status = 'BoardReview'";
      delete expectedClone.properties.tables[0].definitionQuery;
      expectedClone.item.thumbnail = "thumbnail/ago_downloaded.png";
      delete expectedClone.item.spatialReference;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService", createResponse)
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}',
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/update", '{"success":true}')
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/svc1234567890?f=json&token=fake-token",
          expectedClone.item,
        );

      const r = await featureLayer.createItemFromTemplate(
        itemTemplate,
        {
          svc1234567890: {},
          organization: _organization,
          solutionItemExtent: _solutionItemExtent,
        },
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK,
      );
      expectedClone.item.url = expectedUrl + "/";
      expect(r).toEqual({
        item: expectedClone,
        id: "svc1234567890",
        type: itemTemplate.type,
        postProcess: true,
      });
    });

    it("should set postProcess to true when the item data has unprocessed interpolation tokens", async () => {
      const expectedId: string = "svc1234567890";
      const id: string = "{{" + expectedId + ".itemId}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerDefQuery: string = "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string = "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;

      itemTemplate.properties.service.isView = false;

      itemTemplate.data.other = "{{unprocessed.itemId}}";

      // verify the state up front
      expect(itemTemplate.item.id).withContext("up-front id check").toEqual(id);
      expect(itemTemplate.item.url).withContext("up-front url check").toEqual(expectedUrl);
      expect(itemTemplate.dependencies.length).withContext("up-front dependencies check").toEqual(0);
      expect(itemTemplate.properties.service.serviceItemId).withContext("up-front serviceItemId check").toEqual(id);

      expect(itemTemplate.properties.layers[0].serviceItemId)
        .withContext("up-front layers serviceItemId check")
        .toEqual(id);
      expect(itemTemplate.properties.layers[0].viewDefinitionQuery)
        .withContext("up-front layers viewDefinitionQuery check")
        .toEqual(layerDefQuery);
      expect(itemTemplate.properties.layers[0].definitionQuery)
        .withContext("up-front layers definitionQuery check")
        .toEqual(layerDefQuery);

      expect(itemTemplate.properties.tables[0].serviceItemId)
        .withContext("up-front tables withContext check")
        .toEqual(id);
      expect(itemTemplate.properties.tables[0].viewDefinitionQuery)
        .withContext("up-front tables viewDefinitionQuery check")
        .toEqual(tableDefQuery);
      expect(itemTemplate.properties.tables[0].definitionQuery)
        .withContext("up-front tables withContext check")
        .toEqual(tableDefQuery);

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      const expectedClone: common.IItemTemplate = common.cloneObject(itemTemplate);
      expectedClone.item.id = "svc1234567890";
      expectedClone.item.extent = [
        [0, 0],
        [1, 1],
      ];
      expectedClone.properties.service.serviceItemId = "svc1234567890";
      expectedClone.properties.layers[0].serviceItemId = "svc1234567890";
      expectedClone.properties.layers[0].relationships = null;
      expectedClone.properties.layers[0].viewDefinitionQuery = "status = 'BoardReview'";
      delete expectedClone.properties.layers[0].definitionQuery;
      expectedClone.properties.tables[0].serviceItemId = "svc1234567890";
      expectedClone.properties.tables[0].relationships = null;
      expectedClone.properties.tables[0].viewDefinitionQuery = "status = 'BoardReview'";
      delete expectedClone.properties.tables[0].definitionQuery;
      expectedClone.item.thumbnail = "thumbnail/ago_downloaded.png";
      delete expectedClone.item.spatialReference;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService", createResponse)
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}',
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/update", '{"success":true}')
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/svc1234567890?f=json&token=fake-token",
          expectedClone.item,
        );

      const r = await featureLayer.createItemFromTemplate(
        itemTemplate,
        {
          svc1234567890: {},
          organization: _organization,
          solutionItemExtent: _solutionItemExtent,
        },
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK,
      );
      expectedClone.item.url = expectedUrl + "/";
      expect(r).withContext("results").withContext("result").toEqual({
        item: expectedClone,
        id: "svc1234567890",
        type: itemTemplate.type,
        postProcess: true,
      });
    });

    it("should create a solution from a template in portal", async () => {
      const expectedId: string = "svc1234567890";
      const id: string = "{{" + expectedId + ".itemId}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string = "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string = "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string = "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string = "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].adminLayerInfo = {
        geometryField: {},
      };

      // verify the state up front
      expect(itemTemplate.item.id).withContext("up-front id check").toEqual(id);
      expect(itemTemplate.item.url).withContext("up-front url check").toEqual(expectedUrl);
      expect(itemTemplate.dependencies.length).withContext("up-front dependencies check").toEqual(0);
      expect(itemTemplate.properties.service.serviceItemId).withContext("up-front serviceItemId check").toEqual(id);

      expect(itemTemplate.properties.layers[0].serviceItemId)
        .withContext("up-front layers serviceItemId check")
        .toEqual(id);
      expect(itemTemplate.properties.layers[0].relationships[0].keyField)
        .withContext("up-front layers keyField check")
        .toEqual(layerKeyField);
      expect(itemTemplate.properties.layers[0].viewDefinitionQuery)
        .withContext("up-front layers viewDefinitionQuery check")
        .toEqual(layerDefQuery);
      expect(itemTemplate.properties.layers[0].definitionQuery)
        .withContext("up-front layers definitionQuery check")
        .toEqual(layerDefQuery);

      expect(itemTemplate.properties.tables[0].serviceItemId)
        .withContext("up-front tables withContext check")
        .toEqual(id);
      expect(itemTemplate.properties.tables[0].relationships[0].keyField)
        .withContext("up-front tables keyField check")
        .toEqual(tableKeyField);
      expect(itemTemplate.properties.tables[0].viewDefinitionQuery)
        .withContext("up-front tables viewDefinitionQuery check")
        .toEqual(tableDefQuery);
      expect(itemTemplate.properties.tables[0].definitionQuery)
        .withContext("up-front tables withContext check")
        .toEqual(tableDefQuery);

      const settings = utils.createMockSettings();
      settings.folderId = "fld1234567890";
      settings.isPortal = true;
      settings[expectedId] = {
        id: expectedId,
        url: expectedUrl,
      };

      settings.organization = Object.assign(settings.organization || {}, _organization);
      settings.solutionItemExtent = _solutionItemExtent;

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      const expectedClone: common.IItemTemplate = common.cloneObject(itemTemplate);
      expectedClone.item.id = "svc1234567890";
      expectedClone.item.extent = [
        [0, 0],
        [1, 1],
      ];
      expectedClone.properties.service.serviceItemId = "svc1234567890";
      expectedClone.properties.layers[0].serviceItemId = "svc1234567890";
      expectedClone.properties.layers[0].relationships = null;
      expectedClone.properties.layers[0].viewDefinitionQuery = "status = 'BoardReview'";
      expectedClone.properties.layers[0].adminLayerInfo = undefined;
      expectedClone.properties.layers[0].uniqueIdField.name = "objectid";
      delete expectedClone.properties.layers[0].definitionQuery;
      delete expectedClone.properties.layers[0].isView;
      expectedClone.properties.tables[0].serviceItemId = "svc1234567890";
      expectedClone.properties.tables[0].relationships = null;
      expectedClone.properties.tables[0].viewDefinitionQuery = "status = 'BoardReview'";
      expectedClone.properties.tables[0].adminLayerInfo = {};
      expectedClone.properties.tables[0].uniqueIdField.name = "objectid";
      delete expectedClone.properties.tables[0].definitionQuery;
      delete expectedClone.properties.tables[0].isView;
      expectedClone.item.thumbnail = "thumbnail/ago_downloaded.png";
      delete expectedClone.item.spatialReference;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/fld1234567890/createService", createResponse)
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/updateDefinition",
          '{"success":true}',
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/update", '{"success":true}')
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/svc1234567890?f=json&token=fake-token",
          expectedClone.item,
        );

      const r = await featureLayer.createItemFromTemplate(
        itemTemplate,
        settings,
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK,
      );
      expectedClone.item.url = expectedUrl + "/";
      expect(r).withContext("result").toEqual({
        item: expectedClone,
        id: "svc1234567890",
        type: itemTemplate.type,
        postProcess: false,
      });
    });

    it("should handle error on updateItem", async () => {
      const expectedId: string = "svc1234567890";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string = "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string = "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string = "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string = "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.service.fullExtent = {};
      itemTemplate.properties.service.initialExtent = {};

      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;

      const settings = utils.createMockSettings();
      settings.folderId = "fld1234567890";
      settings[expectedId] = {
        id: expectedId,
        url: expectedUrl,
      };

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService", createResponse)
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/updateDefinition",
          '{"success":true}',
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/update", '{"success":true}')
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/svc1234567890?f=json&token=fake-token",
          mockItems.get400Failure(),
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/delete",
          '{"success":true}',
        );

      const response = await featureLayer.createItemFromTemplate(
        itemTemplate,
        {
          organization: _organization,
          svc1234567890: {},
          solutionItemExtent: _solutionItemExtent,
        },
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK,
      );
      expect(response).toEqual(mockSolutions.getFailedItem(itemTemplate.type));
    });

    it("should handle error deleting item after error on updateItem", async () => {
      const expectedId: string = "svc1234567890";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string = "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string = "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string = "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string = "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.service.fullExtent = {};
      itemTemplate.properties.service.initialExtent = {};

      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;

      const settings = utils.createMockSettings();
      settings.folderId = "fld1234567890";
      settings[expectedId] = {
        id: expectedId,
        url: expectedUrl,
      };

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService", createResponse)
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/updateDefinition",
          '{"success":true}',
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/update", '{"success":true}')
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/svc1234567890?f=json&token=fake-token",
          mockItems.get400Failure(),
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/delete",
          utils.getFailureResponse({ itemId: itemTemplate.itemId }),
        );

      const response = await featureLayer.createItemFromTemplate(
        itemTemplate,
        {
          organization: _organization,
          svc1234567890: {},
          solutionItemExtent: _solutionItemExtent,
        },
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK,
      );
      expect(response).toEqual(mockSolutions.getFailedItem(itemTemplate.type));
    });

    it("should handle error fetching updated item", async () => {
      const expectedId: string = "svc1234567890";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string = "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string = "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string = "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string = "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.service.fullExtent = {};
      itemTemplate.properties.service.initialExtent = {};

      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;

      const settings = utils.createMockSettings();
      settings.folderId = "fld1234567890";
      settings[expectedId] = {
        id: expectedId,
        url: expectedUrl,
      };

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService", createResponse)
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/updateDefinition",
          '{"success":true}',
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/update",
          mockItems.get400Failure(),
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/delete", '{"success":true}');

      const response = await featureLayer.createItemFromTemplate(
        itemTemplate,
        {
          organization: _organization,
          svc1234567890: {},
          solutionItemExtent: _solutionItemExtent,
        },
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK,
      );
      expect(response).toEqual(mockSolutions.getFailedItem(itemTemplate.type));
    });

    it("should handle error deleting item after error fetching updated item", async () => {
      const expectedId: string = "svc1234567890";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string = "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string = "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string = "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string = "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.service.fullExtent = {};
      itemTemplate.properties.service.initialExtent = {};

      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;

      const settings = utils.createMockSettings();
      settings.folderId = "fld1234567890";
      settings[expectedId] = {
        id: expectedId,
        url: expectedUrl,
      };

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService", createResponse)
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/updateDefinition",
          '{"success":true}',
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/update",
          mockItems.get400Failure(),
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/delete",
          utils.getFailureResponse({ itemId: itemTemplate.itemId }),
        );

      const response = await featureLayer.createItemFromTemplate(
        itemTemplate,
        {
          organization: _organization,
          svc1234567890: {},
          solutionItemExtent: _solutionItemExtent,
        },
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK,
      );
      expect(response).toEqual(mockSolutions.getFailedItem(itemTemplate.type));
    });

    it("should handle error on addFeatureServiceLayersAndTables with successful cancellation", async () => {
      const expectedId: string = "svc1234567890";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string = "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string = "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string = "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string = "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;

      const settings = utils.createMockSettings();
      settings.folderId = "fld1234567890";
      settings[expectedId] = {
        id: expectedId,
        url: expectedUrl,
      };

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService", createResponse)
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          mockItems.get400Failure(),
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/delete",
          utils.getSuccessResponse({ itemId: itemTemplate.itemId }),
        );

      const response = await featureLayer.createItemFromTemplate(
        itemTemplate,
        {
          svc1234567890: {},
          organization: _organization,
          solutionItemExtent: _solutionItemExtent,
        },
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK,
      );
      expect(response).toEqual(mockSolutions.getFailedItem(itemTemplate.type));
    });

    it("should handle error on addFeatureServiceLayersAndTables with failed cancellation", async () => {
      const expectedId: string = "svc1234567890";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string = "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string = "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string = "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string = "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;

      const settings = utils.createMockSettings();
      settings.folderId = "fld1234567890";
      settings[expectedId] = {
        id: expectedId,
        url: expectedUrl,
      };

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService", createResponse)
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          mockItems.get400Failure(),
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/delete",
          utils.getFailureResponse({ itemId: itemTemplate.itemId }),
        );

      const response = await featureLayer.createItemFromTemplate(
        itemTemplate,
        {
          svc1234567890: {},
          organization: _organization,
          solutionItemExtent: _solutionItemExtent,
        },
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK,
      );
      expect(response).toEqual(mockSolutions.getFailedItem(itemTemplate.type));
    });

    it("should handle error on createService", async () => {
      const expectedId: string = "svc1234567890";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string = "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string = "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string = "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string = "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;

      const settings = utils.createMockSettings();
      settings.folderId = "fld1234567890";
      settings[expectedId] = {
        id: expectedId,
        url: expectedUrl,
      };

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService", mockItems.get400Failure());

      const response = await featureLayer.createItemFromTemplate(
        itemTemplate,
        {
          organization: _organization,
          svc1234567890: {},
          solutionItemExtent: _solutionItemExtent,
        },
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK,
      );
      expect(response).toEqual(mockSolutions.getFailedItem(itemTemplate.type));
    });

    it("should handle createService success === false", async () => {
      const expectedId: string = "svc1234567890";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const settings = utils.createMockSettings();
      settings.folderId = "fld1234567890";
      settings[expectedId] = {
        id: expectedId,
        url: expectedUrl,
      };

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = false;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService", createResponse);

      const response = await featureLayer.createItemFromTemplate(
        itemTemplate,
        {
          svc1234567890: {},
          organization: _organization,
          solutionItemExtent: _solutionItemExtent,
        },
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK,
      );
      expect(response).toEqual(mockSolutions.getFailedItem(itemTemplate.type));
    });

    it("should handle error on updateItem", async () => {
      const expectedId: string = "svc1234567890";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string = "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string = "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string = "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string = "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.service.fullExtent = {};
      itemTemplate.properties.service.initialExtent = {};

      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;

      const settings = utils.createMockSettings();
      settings.folderId = "fld1234567890";
      settings[expectedId] = {
        id: expectedId,
        url: expectedUrl,
      };

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService", createResponse)
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          mockItems.get400Failure(),
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/updateDefinition",
          '{"success":true}',
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/update",
          mockItems.get400Failure(),
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/delete",
          utils.getFailureResponse({ itemId: itemTemplate.itemId }),
        );

      const response = await featureLayer.createItemFromTemplate(
        itemTemplate,
        {
          organization: _organization,
          svc1234567890: {},
          solutionItemExtent: _solutionItemExtent,
        },
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK,
      );
      expect(response).toEqual(mockSolutions.getFailedItem(itemTemplate.type));
    });

    it("should handle error on updateDefinition", async () => {
      const expectedId: string = "svc1234567890";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string = "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string = "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string = "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string = "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;
      delete itemTemplate.item.item;

      const settings = utils.createMockSettings();
      settings.folderId = "fld1234567890";
      settings[expectedId] = {
        id: expectedId,
        url: expectedUrl,
      };

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", mockItems.get400Failure())
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService", createResponse)
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          mockItems.get400Failure(),
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/updateDefinition",
          '{"success":true}',
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/update",
          mockItems.get400Failure(),
        );

      const response = await featureLayer.createItemFromTemplate(
        itemTemplate,
        {},
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK,
      );
      expect(response).toEqual(mockSolutions.getFailedItem(itemTemplate.type));
    });

    it("should handle empty layers and tables", async () => {
      const expectedId: string = "svc1234567890";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      itemTemplate.properties.layers = [];
      itemTemplate.properties.tables = [];
      itemTemplate.properties.service.layers = [];
      itemTemplate.properties.service.tables = [];

      const settings = utils.createMockSettings();
      settings.folderId = "fld1234567890";
      settings[expectedId] = {
        id: expectedId,
        url: expectedUrl,
      };

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", mockItems.get400Failure())
        .post(adminUrl + "/1?f=json", mockItems.get400Failure())
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService", createResponse)
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          mockItems.get400Failure(),
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/update",
          mockItems.get400Failure(),
        );

      const response = await featureLayer.createItemFromTemplate(
        itemTemplate,
        {},
        MOCK_USER_SESSION,
        utils.ITEM_PROGRESS_CALLBACK,
      );
      expect(response).toEqual(mockSolutions.getFailedItem(itemTemplate.type));
    });

    it("should handle cancellation before deployment of item starts", async () => {
      const templateDictionary: any = {};

      const response = await featureLayer.createItemFromTemplate(
        itemTemplate,
        templateDictionary,
        MOCK_USER_SESSION,
        utils.createFailingItemProgressCallbackOnNthCall(1),
      );
      expect(response).toEqual(mockSolutions.getFailedItem(itemTemplate.type));
    });

    it("should handle cancellation after deployed item is created", async () => {
      const expectedId: string = "svc1234567890";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string = "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string = "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string = "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string = "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService", createResponse)
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/updateDefinition",
          '{"success":true}',
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/update", '{"success":true}')
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/delete",
          utils.getSuccessResponse({ itemId: itemTemplate.itemId }),
        );

      const response = await featureLayer.createItemFromTemplate(
        itemTemplate,
        {
          svc1234567890: {},
          organization: _organization,
          solutionItemExtent: _solutionItemExtent,
        },
        MOCK_USER_SESSION,
        utils.createFailingItemProgressCallbackOnNthCall(2),
      );
      expect(response).toEqual(mockSolutions.getFailedItem(itemTemplate.type));
    });

    it("should handle cancellation failure after deployed item is created", async () => {
      const expectedId: string = "svc1234567890";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string = "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string = "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string = "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string = "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService", createResponse)
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/updateDefinition",
          '{"success":true}',
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/update", '{"success":true}')
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/delete",
          utils.getFailureResponse({ itemId: itemTemplate.itemId }),
        );

      const response = await featureLayer.createItemFromTemplate(
        itemTemplate,
        {
          svc1234567890: {},
          organization: _organization,
          solutionItemExtent: _solutionItemExtent,
        },
        MOCK_USER_SESSION,
        utils.createFailingItemProgressCallbackOnNthCall(2),
      );
      expect(response).toEqual(mockSolutions.getFailedItem(itemTemplate.type));
    });

    it("should handle cancellation after deployed item is finished", async () => {
      const expectedId: string = "svc1234567890";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string = "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string = "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string = "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string = "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService", createResponse)
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/updateDefinition",
          '{"success":true}',
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/update", '{"success":true}')
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/delete",
          utils.getSuccessResponse({ itemId: itemTemplate.itemId }),
        );

      const response = await featureLayer.createItemFromTemplate(
        itemTemplate,
        {
          svc1234567890: {},
          organization: _organization,
          solutionItemExtent: _solutionItemExtent,
        },
        MOCK_USER_SESSION,
        utils.createFailingItemProgressCallbackOnNthCall(3),
      );
      expect(response).toEqual(mockSolutions.getFailedItem(itemTemplate.type));
    });

    it("should handle cancellation failure after deployed item is finished", async () => {
      const expectedId: string = "svc1234567890";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string = "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string = "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string = "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string = "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService", createResponse)
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          '{"success":true}',
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/updateDefinition",
          '{"success":true}',
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/update", '{"success":true}')
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/svc1234567890/delete",
          utils.getFailureResponse({ itemId: itemTemplate.itemId }),
        );

      const response = await featureLayer.createItemFromTemplate(
        itemTemplate,
        {
          svc1234567890: {},
          organization: _organization,
          solutionItemExtent: _solutionItemExtent,
        },
        MOCK_USER_SESSION,
        utils.createFailingItemProgressCallbackOnNthCall(3),
      );
      expect(response).toEqual(mockSolutions.getFailedItem(itemTemplate.type));
    });
  });

  describe("postProcess", () => {
    it("fetch and update the item and data", async () => {
      const item: common.IItem = {
        id: "a369baed619441cfb5e862694d33d44c",
        owner: "brubble",
        tags: ["tag1"],
        created: 1590520700158,
        modified: 1590520700158,
        numViews: 10,
        size: 50,
        title: "My Form",
        type: "Form",
        typeKeywords: ["{{a369baed619441cfb5e862694d33d44c.itemId}}"],
      };
      const data = {
        someProp: "{{a369baed619441cfb5e862694d33d44c.itemId}}",
      };
      const templates = [itemTemplate];
      const itemInfos = [
        {
          item: itemTemplate,
          id: itemTemplate.id,
          type: itemTemplate.type,
          postProcess: true,
        },
      ];
      const templateDictionary = {
        a369baed619441cfb5e862694d33d44c: {
          itemId: "b369baed619441cfb5e862694d33d44c",
        },
      };
      const expected = {
        item: {
          ...item,
          typeKeywords: ["b369baed619441cfb5e862694d33d44c"],
        },
        data: {
          ...data,
          someProp: "b369baed619441cfb5e862694d33d44c",
        },
      };

      const updateUrl =
        utils.PORTAL_SUBSET.restUrl + "/content/users/brubble/items/a369baed619441cfb5e862694d33d44c/update";
      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl + "/content/items/a369baed619441cfb5e862694d33d44c?f=json&token=fake-token",
          item,
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/a369baed619441cfb5e862694d33d44c/data", data)
        .post(updateUrl, utils.getSuccessResponse({ id: item.id }));

      spyOn(common, "replaceInTemplate").and.returnValue(expected);
      const result = await featureLayer.postProcess(
        item.id,
        item.type,
        itemInfos,
        itemTemplate,
        templates,
        templateDictionary,
        MOCK_USER_SESSION,
      );
      expect(result).toEqual(utils.getSuccessResponse({ id: item.id }));

      const callBody = fetchMock.calls(updateUrl)[0][1].body as string;
      expect(callBody).toEqual(
        "f=json&text=%7B%22someProp%22%3A%22b369baed619441cfb5e862694d33d44c%22%7D&id=a369baed619441cfb5e862" +
          "694d33d44c&owner=brubble&tags=tag1&created=1590520700158&modified=1590520700158&numViews=10&size=50" +
          "&title=My%20Form&type=Form&typeKeywords=b369baed619441cfb5e862694d33d44c&token=fake-token",
      );
    });

    it("will fine tune workforce service project", async () => {
      // the fineTuneCreatedWorkforceItem function is tested in workforce helpers
      const template: common.IItemTemplate = mockSolutions.getItemTemplateSkeleton();
      template.item.typeKeywords = ["Workforce Project"];

      spyOn(common, "fineTuneCreatedWorkforceItem").and.resolveTo(undefined);

      spyOn(common, "updateItemTemplateFromDictionary").and.resolveTo(undefined);

      return featureLayer.postProcess("", "", [], template, [], {}, MOCK_USER_SESSION);
    });
  });
});
