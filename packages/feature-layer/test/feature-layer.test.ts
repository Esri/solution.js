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
    "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer"
  );
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

const _organization: any = utils.getPortalResponse();

const _solutionItemExtent: any = [
  [0, 0],
  [1, 1]
];

afterEach(() => {
  fetchMock.restore();
});

describe("Module `feature-layer`: manages the creation and deployment of feature service types", () => {
  describe("convertItemToTemplate", () => {
    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
      it("templatize common properties", done => {
        const id: string = "svc1234567890";
        const url: string =
          "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
        const expectedUrl: string = "{{" + id + ".url}}";
        const adminUrl: string =
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

        const expectedId: string = "{{" + id + ".itemId}}";
        const keyField: string = "globalid";
        const expectedLayerKeyField: string =
          "{{" + id + ".layer0.fields.globalid.name}}";
        const expectedTableKeyField: string =
          "{{" + id + ".layer1.fields.globalid.name}}";
        const defQuery: string = "status = 'BoardReview'";
        const expectedLayerDefQuery: string =
          "status = '{{" + id + ".layer0.fields.boardreview.name}}'";
        const expectedTableDefQuery: string =
          "status = '{{" + id + ".layer1.fields.boardreview.name}}'";

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

        // verify the state up front
        expect(itemTemplate.item.id).toEqual(id);
        expect(itemTemplate.item.url).toEqual(url);
        expect(itemTemplate.dependencies.length).toEqual(0);
        expect(itemTemplate.data.layers).toBeDefined();
        expect(itemTemplate.data.tables).toBeDefined();
        expect(itemTemplate.properties.service.serviceItemId).toEqual(id);

        expect(itemTemplate.properties.layers[0].serviceItemId).toEqual(id);
        expect(
          itemTemplate.properties.layers[0].relationships[0].keyField
        ).toEqual(keyField);
        expect(itemTemplate.properties.layers[0].viewDefinitionQuery).toEqual(
          defQuery
        );
        expect(itemTemplate.properties.layers[0].definitionQuery).toEqual(
          defQuery
        );

        expect(itemTemplate.properties.tables[0].serviceItemId).toEqual(id);
        expect(
          itemTemplate.properties.tables[0].relationships[0].keyField
        ).toEqual(keyField);
        expect(itemTemplate.properties.tables[0].viewDefinitionQuery).toEqual(
          defQuery
        );
        expect(itemTemplate.properties.tables[0].definitionQuery).toEqual(
          defQuery
        );

        fetchMock
          .post(url + "?f=json", itemTemplate.properties.service)
          .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
          .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
          .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/items/svc1234567890/data",
            mockItems.get500Failure()
          );

        featureLayer
          .convertItemToTemplate(
            "A",
            itemTemplate.item,
            MOCK_USER_SESSION,
            true
          )
          .then(r => {
            // verify the state up front
            expect(r.item.id).toEqual(expectedId);
            expect(r.item.url).toEqual(expectedUrl);
            expect(r.dependencies.length).toEqual(1);
            expect(r.data).toBeUndefined();
            expect(r.properties.service.serviceItemId).toEqual(expectedId);

            expect(r.properties.layers[0].serviceItemId).toEqual(expectedId);
            expect(r.properties.layers[0].relationships[0].keyField).toEqual(
              expectedLayerKeyField
            );
            expect(r.properties.layers[0].viewDefinitionQuery).toEqual(
              expectedLayerDefQuery
            );
            expect(r.properties.layers[0].definitionQuery).toEqual(
              expectedLayerDefQuery
            );

            expect(r.properties.tables[0].serviceItemId).toEqual(expectedId);
            expect(r.properties.tables[0].relationships[0].keyField).toEqual(
              expectedTableKeyField
            );
            expect(r.properties.tables[0].viewDefinitionQuery).toEqual(
              expectedTableDefQuery
            );
            expect(r.properties.tables[0].definitionQuery).toEqual(
              expectedTableDefQuery
            );
            done();
          }, done.fail);
      });
    }

    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
      it("should handle error on extractDependencies", done => {
        const id: string = "svc1234567890";
        const url: string =
          "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
        const adminUrl: string =
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";
        const itemDataUrl: string =
          utils.PORTAL_SUBSET.restUrl + "/content/items/svc1234567890/data";

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
          .post(url + "?f=json", itemTemplate.properties.service)
          .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
          .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
          .post(url + "/sources?f=json", mockItems.get400Failure());

        featureLayer
          .convertItemToTemplate("A", itemTemplate.item, MOCK_USER_SESSION)
          .then(r => {
            done.fail();
          }, done);
      });

      it("should handle error on getItemData", done => {
        const id: string = "svc1234567890";
        const url: string =
          "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
        const itemDataUrl: string =
          utils.PORTAL_SUBSET.restUrl + "/content/items/svc1234567890/data";

        itemTemplate.itemId = id;
        itemTemplate.item.id = id;

        fetchMock
          .post(url + "?f=json", mockItems.get400Failure())
          .post(itemDataUrl, mockItems.get400Failure());

        featureLayer
          .convertItemToTemplate("A", itemTemplate.item, MOCK_USER_SESSION)
          .then(r => {
            done.fail();
          }, done);
      });

      it("should handle error on getServiceLayersAndTables", done => {
        const id: string = "svc1234567890";
        const url: string =
          "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
        const adminUrl: string =
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";
        const itemDataUrl: string =
          utils.PORTAL_SUBSET.restUrl + "/content/items/svc1234567890/data";

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
          .post(url + "?f=json", mockItems.get400Failure())
          .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
          .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
          .post(url + "/sources?f=json", mockItems.get400Failure());

        featureLayer
          .convertItemToTemplate("A", itemTemplate.item, MOCK_USER_SESSION)
          .then(r => {
            done.fail();
          }, done);
      });
    }
  });

  describe("createItemFromTemplate", () => {
    it("should create a solution from a template", done => {
      const expectedId: string = "svc1234567890";
      const id: string = "{{" + expectedId + ".itemId}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string =
        "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string =
        "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string =
        "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;

      // verify the state up front
      expect(itemTemplate.item.id).toEqual(id);
      expect(itemTemplate.item.url).toEqual(expectedUrl);
      expect(itemTemplate.dependencies.length).toEqual(0);
      expect(itemTemplate.properties.service.serviceItemId).toEqual(id);

      expect(itemTemplate.properties.layers[0].serviceItemId).toEqual(id);
      expect(
        itemTemplate.properties.layers[0].relationships[0].keyField
      ).toEqual(layerKeyField);
      expect(itemTemplate.properties.layers[0].viewDefinitionQuery).toEqual(
        layerDefQuery
      );
      expect(itemTemplate.properties.layers[0].definitionQuery).toEqual(
        layerDefQuery
      );

      expect(itemTemplate.properties.tables[0].serviceItemId).toEqual(id);
      expect(
        itemTemplate.properties.tables[0].relationships[0].keyField
      ).toEqual(tableKeyField);
      expect(itemTemplate.properties.tables[0].viewDefinitionQuery).toEqual(
        tableDefQuery
      );
      expect(itemTemplate.properties.tables[0].definitionQuery).toEqual(
        tableDefQuery
      );

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
          createResponse
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          '{"success":true}'
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/svc1234567890/update",
          '{"success":true}'
        );

      // tslint:disable-next-line: no-floating-promises
      featureLayer
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          {
            svc1234567890: {},
            organization: _organization,
            solutionItemExtent: _solutionItemExtent
          },
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(r => {
          expect(r).toEqual({
            id: "svc1234567890",
            type: itemTemplate.type,
            postProcess: false
          });
          done();
        });
    });

    it("should create a solution from a template in portal", done => {
      const expectedId: string = "svc1234567890";
      const id: string = "{{" + expectedId + ".itemId}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string =
        "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string =
        "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string =
        "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].adminLayerInfo = {
        geometryField: {}
      };

      // verify the state up front
      expect(itemTemplate.item.id).toEqual(id);
      expect(itemTemplate.item.url).toEqual(expectedUrl);
      expect(itemTemplate.dependencies.length).toEqual(0);
      expect(itemTemplate.properties.service.serviceItemId).toEqual(id);

      expect(itemTemplate.properties.layers[0].serviceItemId).toEqual(id);
      expect(
        itemTemplate.properties.layers[0].relationships[0].keyField
      ).toEqual(layerKeyField);
      expect(itemTemplate.properties.layers[0].viewDefinitionQuery).toEqual(
        layerDefQuery
      );
      expect(itemTemplate.properties.layers[0].definitionQuery).toEqual(
        layerDefQuery
      );

      expect(itemTemplate.properties.tables[0].serviceItemId).toEqual(id);
      expect(
        itemTemplate.properties.tables[0].relationships[0].keyField
      ).toEqual(tableKeyField);
      expect(itemTemplate.properties.tables[0].viewDefinitionQuery).toEqual(
        tableDefQuery
      );
      expect(itemTemplate.properties.tables[0].definitionQuery).toEqual(
        tableDefQuery
      );

      const settings = utils.createMockSettings();
      settings.folderId = "fld1234567890";
      settings.isPortal = true;
      settings[expectedId] = {
        id: expectedId,
        url: expectedUrl
      };

      settings.organization = Object.assign(
        settings.organization || {},
        _organization
      );
      settings.solutionItemExtent = _solutionItemExtent;

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
          createResponse
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          '{"success":true}'
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/svc1234567890/update",
          '{"success":true}'
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/undefined/move",
          '{"success": true, "folderId": 1245}'
        );
      // tslint:disable-next-line: no-floating-promises
      featureLayer
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          settings,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(r => {
          expect(r).toEqual({
            id: "svc1234567890",
            type: itemTemplate.type,
            postProcess: false
          });
          done();
        });
    });

    it("should handle error on updateItem", done => {
      const expectedId: string = "svc1234567890";
      const id: string = "{{" + expectedId + ".itemId}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string =
        "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string =
        "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string =
        "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

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
        url: expectedUrl
      };

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
          createResponse
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          '{"success":true}'
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/svc1234567890/update",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/svc1234567890/delete",
          utils.getFailureResponse({ itemId: itemTemplate.itemId })
        );

      // tslint:disable-next-line: no-floating-promises
      featureLayer
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          {
            organization: _organization,
            svc1234567890: {},
            solutionItemExtent: _solutionItemExtent
          },
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          expect(response).toEqual(
            mockSolutions.getFailedItem(itemTemplate.type)
          );
          done();
        });
    });

    it("should handle error on addFeatureServiceLayersAndTables with successful cancellation", done => {
      const expectedId: string = "svc1234567890";
      const id: string = "{{" + expectedId + ".itemId}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string =
        "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string =
        "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string =
        "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

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
        url: expectedUrl
      };

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
          createResponse
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/svc1234567890/delete",
          utils.getSuccessResponse({ itemId: itemTemplate.itemId })
        );

      // tslint:disable-next-line: no-floating-promises
      featureLayer
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          {
            svc1234567890: {},
            organization: _organization,
            solutionItemExtent: _solutionItemExtent
          },
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          expect(response).toEqual(
            mockSolutions.getFailedItem(itemTemplate.type)
          );
          done();
        });
    });

    it("should handle error on addFeatureServiceLayersAndTables with failed cancellation", done => {
      const expectedId: string = "svc1234567890";
      const id: string = "{{" + expectedId + ".itemId}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string =
        "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string =
        "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string =
        "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

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
        url: expectedUrl
      };

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
          createResponse
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/svc1234567890/delete",
          utils.getFailureResponse({ itemId: itemTemplate.itemId })
        );

      // tslint:disable-next-line: no-floating-promises
      featureLayer
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          {
            svc1234567890: {},
            organization: _organization,
            solutionItemExtent: _solutionItemExtent
          },
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          expect(response).toEqual(
            mockSolutions.getFailedItem(itemTemplate.type)
          );
          done();
        });
    });

    it("should handle error on createService", done => {
      const expectedId: string = "svc1234567890";
      const id: string = "{{" + expectedId + ".itemId}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string =
        "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string =
        "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string =
        "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

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
        url: expectedUrl
      };

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
          mockItems.get400Failure()
        );

      // tslint:disable-next-line: no-floating-promises
      featureLayer
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          {
            organization: _organization,
            svc1234567890: {},
            solutionItemExtent: _solutionItemExtent
          },
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          expect(response).toEqual(
            mockSolutions.getFailedItem(itemTemplate.type)
          );
          done();
        });
    });

    it("should handle createService success === false", done => {
      const expectedId: string = "svc1234567890";
      const id: string = "{{" + expectedId + ".itemId}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const settings = utils.createMockSettings();
      settings.folderId = "fld1234567890";
      settings[expectedId] = {
        id: expectedId,
        url: expectedUrl
      };

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = false;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
          createResponse
        );

      // tslint:disable-next-line: no-floating-promises
      featureLayer
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          {
            svc1234567890: {},
            organization: _organization,
            solutionItemExtent: _solutionItemExtent
          },
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          expect(response).toEqual(
            mockSolutions.getFailedItem(itemTemplate.type)
          );
          done();
        });
    });

    it("should handle error on updateItem", done => {
      const expectedId: string = "svc1234567890";
      const id: string = "{{" + expectedId + ".itemId}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string =
        "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string =
        "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string =
        "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

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
        url: expectedUrl
      };

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
          createResponse
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/svc1234567890/update",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/svc1234567890/delete",
          utils.getFailureResponse({ itemId: itemTemplate.itemId })
        );

      // tslint:disable-next-line: no-floating-promises
      featureLayer
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          {
            organization: _organization,
            svc1234567890: {},
            solutionItemExtent: _solutionItemExtent
          },
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          expect(response).toEqual(
            mockSolutions.getFailedItem(itemTemplate.type)
          );
          done();
        });
    });

    it("should handle error on updateDefinition", done => {
      const expectedId: string = "svc1234567890";
      const id: string = "{{" + expectedId + ".itemId}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string =
        "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string =
        "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string =
        "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

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
        url: expectedUrl
      };

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", mockItems.get400Failure())
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
          createResponse
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/svc1234567890/update",
          mockItems.get400Failure()
        );

      // tslint:disable-next-line: no-floating-promises
      featureLayer
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          {},
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          expect(response).toEqual(
            mockSolutions.getFailedItem(itemTemplate.type)
          );
          done();
        });
    });

    it("should handle empty layers and tables", done => {
      const expectedId: string = "svc1234567890";
      const id: string = "{{" + expectedId + ".itemId}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
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
        url: expectedUrl
      };

      const createResponse: any = mockItems.getAGOLService([], [], true);
      createResponse.success = true;

      fetchMock
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", mockItems.get400Failure())
        .post(adminUrl + "/1?f=json", mockItems.get400Failure())
        .post(url + "/sources?f=json", mockItems.getAGOLServiceSources())
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
          createResponse
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/svc1234567890/update",
          mockItems.get400Failure()
        );

      // tslint:disable-next-line: no-floating-promises
      featureLayer
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          {},
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then(response => {
          expect(response).toEqual(
            mockSolutions.getFailedItem(itemTemplate.type)
          );
          done();
        });
    });

    it("should handle cancellation before deployment of item starts", done => {
      const templateDictionary: any = {};

      // tslint:disable-next-line: no-floating-promises
      featureLayer
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallback(1)
        )
        .then(response => {
          expect(response).toEqual(
            mockSolutions.getFailedItem(itemTemplate.type)
          );
          done();
        }, done.fail);
    });

    it("should handle cancellation after deployed item is created", done => {
      const expectedId: string = "svc1234567890";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string =
        "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string =
        "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string =
        "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

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
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
          createResponse
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          '{"success":true}'
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/svc1234567890/update",
          '{"success":true}'
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/svc1234567890/delete",
          utils.getSuccessResponse({ itemId: itemTemplate.itemId })
        );

      // tslint:disable-next-line: no-floating-promises
      featureLayer
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          {
            svc1234567890: {},
            organization: _organization,
            solutionItemExtent: _solutionItemExtent
          },
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallback(2)
        )
        .then(response => {
          expect(response).toEqual(
            mockSolutions.getFailedItem(itemTemplate.type)
          );
          done();
        });
    });

    it("should handle cancellation failure after deployed item is created", done => {
      const expectedId: string = "svc1234567890";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string =
        "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string =
        "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string =
        "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

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
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
          createResponse
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          '{"success":true}'
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/svc1234567890/update",
          '{"success":true}'
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/svc1234567890/delete",
          utils.getFailureResponse({ itemId: itemTemplate.itemId })
        );

      // tslint:disable-next-line: no-floating-promises
      featureLayer
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          {
            svc1234567890: {},
            organization: _organization,
            solutionItemExtent: _solutionItemExtent
          },
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallback(2)
        )
        .then(response => {
          expect(response).toEqual(
            mockSolutions.getFailedItem(itemTemplate.type)
          );
          done();
        });
    });

    it("should handle cancellation after deployed item is finished", done => {
      const expectedId: string = "svc1234567890";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string =
        "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string =
        "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string =
        "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

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
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
          createResponse
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          '{"success":true}'
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/svc1234567890/update",
          '{"success":true}'
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/svc1234567890/delete",
          utils.getSuccessResponse({ itemId: itemTemplate.itemId })
        );

      // tslint:disable-next-line: no-floating-promises
      featureLayer
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          {
            svc1234567890: {},
            organization: _organization,
            solutionItemExtent: _solutionItemExtent
          },
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallback(3)
        )
        .then(response => {
          expect(response).toEqual(
            mockSolutions.getFailedItem(itemTemplate.type)
          );
          done();
        });
    });

    it("should handle cancellation failure after deployed item is finished", done => {
      const expectedId: string = "svc1234567890";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".layer0.fields.globalid.name}}";
      const tableKeyField: string =
        "{{" + expectedId + ".layer1.fields.globalid.name}}";
      const layerDefQuery: string =
        "status = '{{" + expectedId + ".layer0.fields.boardreview.name}}'";
      const tableDefQuery: string =
        "status = '{{" + expectedId + ".layer1.fields.boardreview.name}}'";

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
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
          createResponse
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          '{"success":true}'
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/1/updateDefinition",
          '{"success":true}'
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/svc1234567890/update",
          '{"success":true}'
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/svc1234567890/delete",
          utils.getFailureResponse({ itemId: itemTemplate.itemId })
        );

      // tslint:disable-next-line: no-floating-promises
      featureLayer
        .createItemFromTemplate(
          itemTemplate,
          [],
          MOCK_USER_SESSION,
          {
            svc1234567890: {},
            organization: _organization,
            solutionItemExtent: _solutionItemExtent
          },
          MOCK_USER_SESSION,
          utils.createFailingItemProgressCallback(3)
        )
        .then(response => {
          expect(response).toEqual(
            mockSolutions.getFailedItem(itemTemplate.type)
          );
          done();
        });
    });
  });
});
