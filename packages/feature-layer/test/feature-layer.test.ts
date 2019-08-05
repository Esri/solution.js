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

import {
  convertItemToTemplate,
  createItemFromTemplate
} from "../src/feature-layer";

import {
  IItemTemplate,
  IDependency,
  INumberValuePair,
  IStringValuePair,
  IUpdate,
  IPostProcessArgs
} from "../../common/src/interfaces";

import {
  TOMORROW,
  createMockSettings,
  createRuntimeMockUserSession,
  checkForArcgisRestSuccessRequestError
} from "../../common/test/mocks/utils";
import * as fetchMock from "fetch-mock";
import { IUserRequestOptions, UserSession } from "@esri/arcgis-rest-auth";
// import * as mClassifier from "../../src/itemTypes/classifier";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as mockSolutions from "../../common/test/mocks/templates";
// import { cacheFieldInfos } from "../../src/utils/field-helpers";

let itemTemplate: IItemTemplate = mockSolutions.getItemTemplatePart(
  "Feature Service",
  [],
  "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer"
);

beforeEach(() => {
  // refresh the template if any temp changes were made
  itemTemplate = mockSolutions.getItemTemplatePart(
    "Feature Service",
    [],
    "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer"
  );
});

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

describe("Module `feature-layer`: manages the creation and deployment of feature service types", () => {
  describe("convertItemToTemplate", () => {
    it("templatize common properties", done => {
      const id: string = "SVC1234567890";
      const url: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const expectedUrl: string = "{{" + id + ".url}}";
      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const expectedId: string = "{{" + id + ".id}}";
      const keyField: string = "globalid";
      const expectedLayerKeyField: string =
        "{{" + id + ".fieldInfos.layer0.fields.globalid}}";
      const expectedTableKeyField: string =
        "{{" + id + ".fieldInfos.layer1.fields.globalid}}";
      const defQuery: string = "status = 'BoardReview'";
      const expectedLayerDefQuery: string =
        "status = '{{" + id + ".fieldInfos.layer0.fields.boardreview}}'";
      const expectedTableDefQuery: string =
        "status = '{{" + id + ".fieldInfos.layer1.fields.boardreview}}'";

      itemTemplate = mockSolutions.getItemTemplatePart(
        "Feature Service",
        [],
        url
      );
      itemTemplate.itemId = id;
      itemTemplate.item.id = id;
      itemTemplate.estimatedDeploymentCostFactor = 0;
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
      expect(itemTemplate.estimatedDeploymentCostFactor).toEqual(0);
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
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/SVC1234567890/data?f=json&token=fake-token",
          "{}"
        )
        .post(
          "https://www.arcgis.com/sharing/rest/generateToken",
          '{"token":"abc123"}'
        );

      convertItemToTemplate("A", itemTemplate.item, MOCK_USER_SESSION).then(
        r => {
          // verify the state up front
          expect(r.item.id).toEqual(expectedId);
          expect(r.item.url).toEqual(expectedUrl);
          expect(r.dependencies.length).toEqual(1);
          expect(r.estimatedDeploymentCostFactor).toEqual(7);
          expect(r.data).toEqual({});
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
        },
        done.fail
      );
    });

    it("should handle error on extractDependencies", done => {
      const id: string = "SVC1234567890";
      const url: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";
      const itemDataUrl: string =
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/SVC1234567890/data?f=json&token=fake-token";

      const keyField: string = "globalid";
      const defQuery: string = "status = 'BoardReview'";

      itemTemplate = mockSolutions.getItemTemplatePart(
        "Feature Service",
        [],
        url
      );
      itemTemplate.itemId = id;
      itemTemplate.item.id = id;
      itemTemplate.estimatedDeploymentCostFactor = 0;
      itemTemplate.properties.service.serviceItemId = id;

      itemTemplate.properties.layers[0].serviceItemId = id;
      itemTemplate.properties.layers[0].relationships[0].keyField = keyField;
      itemTemplate.properties.layers[0].viewDefinitionQuery = defQuery;

      itemTemplate.properties.tables[0].serviceItemId = id;
      itemTemplate.properties.tables[0].relationships[0].keyField = keyField;
      itemTemplate.properties.tables[0].viewDefinitionQuery = defQuery;
      delete itemTemplate.item.item;

      fetchMock
        .get(itemDataUrl, "{}")
        .post(url + "?f=json", itemTemplate.properties.service)
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.get400Failure())
        .post(
          "https://www.arcgis.com/sharing/rest/generateToken",
          '{"token":"abc123"}'
        );

      convertItemToTemplate("A", itemTemplate.item, MOCK_USER_SESSION).then(
        r => {
          done.fail();
        },
        done
      );
    });

    it("should handle error on getServiceLayersAndTables", done => {
      const id: string = "SVC1234567890";
      const url: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";
      const itemDataUrl: string =
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/SVC1234567890/data?f=json&token=fake-token";

      const keyField: string = "globalid";
      const defQuery: string = "status = 'BoardReview'";

      itemTemplate = mockSolutions.getItemTemplatePart(
        "Feature Service",
        [],
        url
      );
      itemTemplate.itemId = id;
      itemTemplate.item.id = id;
      itemTemplate.estimatedDeploymentCostFactor = 0;
      itemTemplate.properties.service.serviceItemId = id;

      itemTemplate.properties.layers[0].serviceItemId = id;
      itemTemplate.properties.layers[0].relationships[0].keyField = keyField;
      itemTemplate.properties.layers[0].viewDefinitionQuery = defQuery;

      itemTemplate.properties.tables[0].serviceItemId = id;
      itemTemplate.properties.tables[0].relationships[0].keyField = keyField;
      itemTemplate.properties.tables[0].viewDefinitionQuery = defQuery;
      delete itemTemplate.item.item;

      fetchMock
        .get(itemDataUrl, "{}")
        .post(url + "?f=json", mockItems.get400Failure())
        .post(adminUrl + "/0?f=json", itemTemplate.properties.layers[0])
        .post(adminUrl + "/1?f=json", itemTemplate.properties.tables[0])
        .post(url + "/sources?f=json", mockItems.get400Failure())
        .post(
          "https://www.arcgis.com/sharing/rest/generateToken",
          '{"token":"abc123"}'
        );

      convertItemToTemplate("A", itemTemplate.item, MOCK_USER_SESSION).then(
        r => {
          done.fail();
        },
        done
      );
    });
  });

  describe("createItemFromTemplate", () => {
    it("should create a solution from a template", done => {
      const expectedId: string = "SVC1234567890";
      const id: string = "{{" + expectedId + ".id}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".fieldInfos.layer0.fields.globalid}}";
      const tableKeyField: string =
        "{{" + expectedId + ".fieldInfos.layer1.fields.globalid}}";
      const layerDefQuery: string =
        "status = '{{" +
        expectedId +
        ".fieldInfos.layer0.fields.boardreview}}'";
      const tableDefQuery: string =
        "status = '{{" +
        expectedId +
        ".fieldInfos.layer1.fields.boardreview}}'";

      itemTemplate = mockSolutions.getItemTemplatePart(
        "Feature Service",
        [],
        expectedUrl
      );
      itemTemplate.itemId = expectedId;
      itemTemplate.item.id = id;
      itemTemplate.estimatedDeploymentCostFactor = 0;
      itemTemplate.properties.service.serviceItemId = id;

      itemTemplate.properties.layers[0].serviceItemId = id;
      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].serviceItemId = id;
      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;
      delete itemTemplate.item.item;

      // verify the state up front
      expect(itemTemplate.item.id).toEqual(id);
      expect(itemTemplate.item.url).toEqual(expectedUrl);
      expect(itemTemplate.dependencies.length).toEqual(0);
      expect(itemTemplate.estimatedDeploymentCostFactor).toEqual(0);
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

      const settings = createMockSettings();
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
          "https://www.arcgis.com/sharing/rest/generateToken",
          '{"token":"abc123"}'
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createService",
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
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/update",
          '{"success":true}'
        );

      createItemFromTemplate(
        itemTemplate,
        [],
        MOCK_USER_SESSION,
        {},
        MOCK_USER_SESSION,
        function() {
          const a = "progressTick";
        }
      ).then(r => {
        expect(r).toEqual("svc1234567890");
        done();
      }, done.fail);
    });

    it("should create a solution from a template in portal", done => {
      const expectedId: string = "SVC1234567890";
      const id: string = "{{" + expectedId + ".id}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".fieldInfos.layer0.fields.globalid}}";
      const tableKeyField: string =
        "{{" + expectedId + ".fieldInfos.layer1.fields.globalid}}";
      const layerDefQuery: string =
        "status = '{{" +
        expectedId +
        ".fieldInfos.layer0.fields.boardreview}}'";
      const tableDefQuery: string =
        "status = '{{" +
        expectedId +
        ".fieldInfos.layer1.fields.boardreview}}'";

      itemTemplate = mockSolutions.getItemTemplatePart(
        "Feature Service",
        [],
        expectedUrl
      );

      itemTemplate.itemId = expectedId;
      itemTemplate.item.id = id;
      itemTemplate.estimatedDeploymentCostFactor = 0;
      itemTemplate.properties.service.serviceItemId = id;

      itemTemplate.properties.layers[0].serviceItemId = id;
      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].serviceItemId = id;
      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].adminLayerInfo = {
        geometryField: {}
      };
      delete itemTemplate.item.item;

      // verify the state up front
      expect(itemTemplate.item.id).toEqual(id);
      expect(itemTemplate.item.url).toEqual(expectedUrl);
      expect(itemTemplate.dependencies.length).toEqual(0);
      expect(itemTemplate.estimatedDeploymentCostFactor).toEqual(0);
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

      const settings = createMockSettings();
      settings.folderId = "fld1234567890";
      settings.isPortal = true;
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
          "https://www.arcgis.com/sharing/rest/generateToken",
          '{"token":"abc123"}'
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createService",
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
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/update",
          '{"success":true}'
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/undefined/move",
          '{"success": true, "folderId": 1245}'
        );

      createItemFromTemplate(
        itemTemplate,
        [],
        MOCK_USER_SESSION,
        settings,
        MOCK_USER_SESSION,
        function() {
          const a = "progressTick";
        }
      ).then(r => {
        expect(r).toEqual("svc1234567890");
        done();
      }, done.fail);
    });

    it("should handle error on updateItem", done => {
      const expectedId: string = "SVC1234567890";
      const id: string = "{{" + expectedId + ".id}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".fieldInfos.layer0.fields.globalid}}";
      const tableKeyField: string =
        "{{" + expectedId + ".fieldInfos.layer1.fields.globalid}}";
      const layerDefQuery: string =
        "status = '{{" +
        expectedId +
        ".fieldInfos.layer0.fields.boardreview}}'";
      const tableDefQuery: string =
        "status = '{{" +
        expectedId +
        ".fieldInfos.layer1.fields.boardreview}}'";

      itemTemplate = mockSolutions.getItemTemplatePart(
        "Feature Service",
        [],
        expectedUrl
      );
      itemTemplate.itemId = expectedId;
      itemTemplate.item.id = id;
      itemTemplate.estimatedDeploymentCostFactor = 0;
      itemTemplate.properties.service.serviceItemId = id;

      itemTemplate.properties.layers[0].serviceItemId = id;
      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].serviceItemId = id;
      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;
      delete itemTemplate.item.item;

      const settings = createMockSettings();
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
          "https://www.arcgis.com/sharing/rest/generateToken",
          '{"token":"abc123"}'
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createService",
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
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/update",
          mockItems.get400Failure()
        );

      createItemFromTemplate(
        itemTemplate,
        [],
        MOCK_USER_SESSION,
        {},
        MOCK_USER_SESSION,
        function() {
          const a = "progressTick";
        }
      ).then(done.fail, done);
    });

    it("should handle error on addFeatureServiceLayersAndTables", done => {
      const expectedId: string = "SVC1234567890";
      const id: string = "{{" + expectedId + ".id}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".fieldInfos.layer0.fields.globalid}}";
      const tableKeyField: string =
        "{{" + expectedId + ".fieldInfos.layer1.fields.globalid}}";
      const layerDefQuery: string =
        "status = '{{" +
        expectedId +
        ".fieldInfos.layer0.fields.boardreview}}'";
      const tableDefQuery: string =
        "status = '{{" +
        expectedId +
        ".fieldInfos.layer1.fields.boardreview}}'";

      itemTemplate = mockSolutions.getItemTemplatePart(
        "Feature Service",
        [],
        expectedUrl
      );
      itemTemplate.itemId = expectedId;
      itemTemplate.item.id = id;
      itemTemplate.estimatedDeploymentCostFactor = 0;
      itemTemplate.properties.service.serviceItemId = id;

      itemTemplate.properties.layers[0].serviceItemId = id;
      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].serviceItemId = id;
      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;
      delete itemTemplate.item.item;

      const settings = createMockSettings();
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
          "https://www.arcgis.com/sharing/rest/generateToken",
          '{"token":"abc123"}'
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createService",
          createResponse
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          mockItems.get400Failure()
        );

      createItemFromTemplate(
        itemTemplate,
        [],
        MOCK_USER_SESSION,
        {},
        MOCK_USER_SESSION,
        function() {
          const a = "progressTick";
        }
      ).then(done.fail, done);
    });

    it("should handle error on createService", done => {
      const expectedId: string = "SVC1234567890";
      const id: string = "{{" + expectedId + ".id}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".fieldInfos.layer0.fields.globalid}}";
      const tableKeyField: string =
        "{{" + expectedId + ".fieldInfos.layer1.fields.globalid}}";
      const layerDefQuery: string =
        "status = '{{" +
        expectedId +
        ".fieldInfos.layer0.fields.boardreview}}'";
      const tableDefQuery: string =
        "status = '{{" +
        expectedId +
        ".fieldInfos.layer1.fields.boardreview}}'";

      itemTemplate = mockSolutions.getItemTemplatePart(
        "Feature Service",
        [],
        expectedUrl
      );
      itemTemplate.itemId = expectedId;
      itemTemplate.item.id = id;
      itemTemplate.estimatedDeploymentCostFactor = 0;
      itemTemplate.properties.service.serviceItemId = id;

      itemTemplate.properties.layers[0].serviceItemId = id;
      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].serviceItemId = id;
      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;
      delete itemTemplate.item.item;

      const settings = createMockSettings();
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
          "https://www.arcgis.com/sharing/rest/generateToken",
          '{"token":"abc123"}'
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createService",
          mockItems.get400Failure()
        );

      createItemFromTemplate(
        itemTemplate,
        [],
        MOCK_USER_SESSION,
        {},
        MOCK_USER_SESSION,
        function() {
          const a = "progressTick";
        }
      ).then(done.fail, done);
    });

    it("should handle createService success === false", done => {
      const expectedId: string = "SVC1234567890";
      const id: string = "{{" + expectedId + ".id}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".fieldInfos.layer0.fields.globalid}}";
      const tableKeyField: string =
        "{{" + expectedId + ".fieldInfos.layer1.fields.globalid}}";
      const layerDefQuery: string =
        "status = '{{" +
        expectedId +
        ".fieldInfos.layer0.fields.boardreview}}'";
      const tableDefQuery: string =
        "status = '{{" +
        expectedId +
        ".fieldInfos.layer1.fields.boardreview}}'";

      itemTemplate = mockSolutions.getItemTemplatePart(
        "Feature Service",
        [],
        expectedUrl
      );
      itemTemplate.itemId = expectedId;
      itemTemplate.item.id = id;
      itemTemplate.estimatedDeploymentCostFactor = 0;
      itemTemplate.properties.service.serviceItemId = id;

      itemTemplate.properties.layers[0].serviceItemId = id;
      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].serviceItemId = id;
      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;
      delete itemTemplate.item.item;

      const settings = createMockSettings();
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
          "https://www.arcgis.com/sharing/rest/generateToken",
          '{"token":"abc123"}'
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createService",
          '{"success":false}'
        );

      createItemFromTemplate(
        itemTemplate,
        [],
        MOCK_USER_SESSION,
        {},
        MOCK_USER_SESSION,
        function() {
          const a = "progressTick";
        }
      ).then(done.fail, done);
    });

    it("should handle error on updateItem", done => {
      const expectedId: string = "SVC1234567890";
      const id: string = "{{" + expectedId + ".id}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".fieldInfos.layer0.fields.globalid}}";
      const tableKeyField: string =
        "{{" + expectedId + ".fieldInfos.layer1.fields.globalid}}";
      const layerDefQuery: string =
        "status = '{{" +
        expectedId +
        ".fieldInfos.layer0.fields.boardreview}}'";
      const tableDefQuery: string =
        "status = '{{" +
        expectedId +
        ".fieldInfos.layer1.fields.boardreview}}'";

      itemTemplate = mockSolutions.getItemTemplatePart(
        "Feature Service",
        [],
        expectedUrl
      );
      itemTemplate.itemId = expectedId;
      itemTemplate.item.id = id;
      itemTemplate.estimatedDeploymentCostFactor = 0;
      itemTemplate.properties.service.serviceItemId = id;

      itemTemplate.properties.layers[0].serviceItemId = id;
      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].serviceItemId = id;
      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;
      delete itemTemplate.item.item;

      const settings = createMockSettings();
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
          "https://www.arcgis.com/sharing/rest/generateToken",
          '{"token":"abc123"}'
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createService",
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
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/update",
          mockItems.get400Failure()
        );

      createItemFromTemplate(
        itemTemplate,
        [],
        MOCK_USER_SESSION,
        {},
        MOCK_USER_SESSION,
        function() {
          const a = "progressTick";
        }
      ).then(done.fail, done);
    });

    it("should handle error on updateDefinition", done => {
      const expectedId: string = "SVC1234567890";
      const id: string = "{{" + expectedId + ".id}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".fieldInfos.layer0.fields.globalid}}";
      const tableKeyField: string =
        "{{" + expectedId + ".fieldInfos.layer1.fields.globalid}}";
      const layerDefQuery: string =
        "status = '{{" +
        expectedId +
        ".fieldInfos.layer0.fields.boardreview}}'";
      const tableDefQuery: string =
        "status = '{{" +
        expectedId +
        ".fieldInfos.layer1.fields.boardreview}}'";

      itemTemplate = mockSolutions.getItemTemplatePart(
        "Feature Service",
        [],
        expectedUrl
      );
      itemTemplate.itemId = expectedId;
      itemTemplate.item.id = id;
      itemTemplate.estimatedDeploymentCostFactor = 0;
      itemTemplate.properties.service.serviceItemId = id;

      itemTemplate.properties.layers[0].serviceItemId = id;
      itemTemplate.properties.layers[0].relationships[0].keyField = layerKeyField;
      itemTemplate.properties.layers[0].definitionQuery = layerDefQuery;
      itemTemplate.properties.layers[0].viewDefinitionQuery = layerDefQuery;

      itemTemplate.properties.tables[0].serviceItemId = id;
      itemTemplate.properties.tables[0].relationships[0].keyField = tableKeyField;
      itemTemplate.properties.tables[0].definitionQuery = tableDefQuery;
      itemTemplate.properties.tables[0].viewDefinitionQuery = tableDefQuery;
      delete itemTemplate.item.item;

      const settings = createMockSettings();
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
          "https://www.arcgis.com/sharing/rest/generateToken",
          '{"token":"abc123"}'
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createService",
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
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/update",
          mockItems.get400Failure()
        );

      createItemFromTemplate(
        itemTemplate,
        [],
        MOCK_USER_SESSION,
        {},
        MOCK_USER_SESSION,
        function() {
          const a = "progressTick";
        }
      ).then(done.fail, done);
    });

    it("should handle empty layers and tables", done => {
      const expectedId: string = "SVC1234567890";
      const id: string = "{{" + expectedId + ".id}}";

      const expectedUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const url: string = "{{" + expectedId + ".url}}";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const layerKeyField: string =
        "{{" + expectedId + ".fieldInfos.layer0.fields.globalid}}";
      const tableKeyField: string =
        "{{" + expectedId + ".fieldInfos.layer1.fields.globalid}}";
      const layerDefQuery: string =
        "status = '{{" +
        expectedId +
        ".fieldInfos.layer0.fields.boardreview}}'";
      const tableDefQuery: string =
        "status = '{{" +
        expectedId +
        ".fieldInfos.layer1.fields.boardreview}}'";

      itemTemplate = mockSolutions.getItemTemplatePart(
        "Feature Service",
        [],
        expectedUrl
      );
      itemTemplate.itemId = expectedId;
      itemTemplate.item.id = id;
      itemTemplate.estimatedDeploymentCostFactor = 0;
      itemTemplate.properties.service.serviceItemId = id;

      itemTemplate.properties.layers = [];
      itemTemplate.properties.tables = [];
      itemTemplate.properties.service.layers = [];
      itemTemplate.properties.service.tables = [];
      delete itemTemplate.item.item;

      const settings = createMockSettings();
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
          "https://www.arcgis.com/sharing/rest/generateToken",
          '{"token":"abc123"}'
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createService",
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
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/update",
          mockItems.get400Failure()
        );

      createItemFromTemplate(
        itemTemplate,
        [],
        MOCK_USER_SESSION,
        {},
        MOCK_USER_SESSION,
        function() {
          const a = "progressTick";
        }
      ).then(done.fail, done);
    });
  });
});
