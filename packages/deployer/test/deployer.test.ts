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
 * Provides tests for functions involving the deployment of a Solution.
 */

import * as utils from "../../common/test/mocks/utils";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as fetchMock from "fetch-mock";
import * as templates from "../../common/test/mocks/templates";
import * as common from "@esri/solution-common";
import * as deployer from "../src/deployer";

// ------------------------------------------------------------------------------------------------------------------ //

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession(new Date().getDate());
});

describe("Module `deploySolution`", () => {
  describe("deploySolution", () => {
    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
      it("can deploy webmap with dependencies", done => {
        // get templates
        const featureServiceTemplate: any = templates.getItemTemplatePart(
          "Feature Service"
        );
        const webmapTemplate: any = templates.getItemTemplatePart(
          "Web Map",
          [featureServiceTemplate.itemId],
          ""
        );
        const itemInfo: any = templates.getSolutionTemplateItem([
          webmapTemplate,
          featureServiceTemplate
        ]);

        const templateDictionary: any = {};
        const portalSubset: any = utils.PORTAL_SUBSET;
        const featureServerAdminUrl: string =
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";
        const featureServerUrl: string =
          "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

        // get mock items
        const layer: any = mockItems.getAGOLLayerOrTable(
          0,
          "ROW Permits",
          "Feature Layer",
          [
            {
              id: 0,
              name: "",
              relatedTableId: 1,
              cardinality: "esriRelCardinalityOneToMany",
              role: "esriRelRoleOrigin",
              "": "globalid",
              composite: true,
              keyField: "globalid"
            }
          ],
          true
        );
        const table: any = mockItems.getAGOLLayerOrTable(
          1,
          "ROW Permit Comment",
          "Table",
          [
            {
              id: 0,
              name: "",
              relatedTableId: 1,
              cardinality: "esriRelCardinalityOneToMany",
              role: "esriRelRoleDestination",
              "": "globalid",
              composite: true,
              keyField: "globalid"
            }
          ],
          true
        );

        const expectedService: any = mockItems.getAGOLService([layer], [table]);
        const expectedMap: any = mockItems.getTrimmedAGOLItem(
          mockItems.getAGOLItem(
            "Web Map",
            "https://myorg.maps.arcgis.com/home/webmap/viewer.html?webmap=map1234567890"
          )
        );
        expectedMap.extent = "-88.226,41.708,-88.009,41.844";
        expectedMap.thumbnail =
          utils.ORG_URL +
          "/sharing/rest/content/items/map1234567890/info/thumbnail/ago_downloaded.png";

        const webMapData: any = mockItems.getAGOLItemData("Web Map");

        const portalResponse: any = utils.getPortalResponse();
        const geometryServer: string =
          portalResponse.helperServices.geometry.url;

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/data",
            itemInfo.data
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/portals/abCDefG123456?f=json&token=fake-token",
            portalResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            utils.getUserResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder",
            utils.getCreateFolderResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/generateToken",
            utils.getTokenResponse()
          )
          .post(
            "https://utility.arcgisonline.com/arcgis/rest/info",
            utils.UTILITY_SERVER_INFO
          )
          .post(
            geometryServer + "/findTransformations",
            utils.getTransformationsResponse()
          )
          .post(geometryServer + "/project", utils.getProjectResponse())
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/a4468da125a64526b359b70d8ba4a9dd/addItem",
            utils.getSuccessResponse({
              id: "map1234567890",
              folder: "44468da125a64526b359b70d8ba4a9dd"
            })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
            utils.getCreateServiceResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/svc1234567890/move",
            utils.getSuccessResponse({
              itemId: "svc1234567890",
              owner: "casey",
              folder: "44468da125a64526b359b70d8ba4a9dd"
            })
          )
          .post(
            featureServerAdminUrl + "/addToDefinition",
            utils.getSuccessResponse({
              layers: [{ name: "ROW Permits", id: 0 }],
              tables: [{ name: "ROW Permit Comment", id: 1 }]
            })
          )
          .post(featureServerAdminUrl + "/0?f=json", layer)
          .post(featureServerAdminUrl + "/1?f=json", table)
          .post(featureServerAdminUrl + "/refresh", utils.getSuccessResponse())
          .post(
            featureServerAdminUrl + "/0/updateDefinition",
            utils.getSuccessResponse()
          )
          .post(
            featureServerAdminUrl + "/1/updateDefinition",
            utils.getSuccessResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/svc1234567890/update",
            utils.getSuccessResponse({ id: "svc1234567890" })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/map1234567890/update",
            utils.getSuccessResponse({ id: "map1234567890" })
          );

        const expected: any = {
          item: {
            commentsEnabled: false,
            id: "map1234567890",
            itemType: "text",
            name: null,
            title: "title",
            type: "Solution",
            typeKeywords: ["Solution", "Deployed"],
            url: "https://www.arcgis.com/home/item.html?id=map1234567890",
            thumbnailUrl: undefined,
            tryitUrl: undefined
          },
          data: {
            metadata: {
              version: "x",
              resourceStorageItemId: "sln1234567890"
            },
            templates: [
              {
                itemId: "map1234567890",
                type: "Web Map",
                key: "i1a2b3c4",
                item: expectedMap,
                dependencies: ["svc1234567890"],
                estimatedDeploymentCostFactor: 4,
                resources: [],
                data: webMapData,
                properties: null
              },
              {
                itemId: "svc1234567890",
                type: "Feature Service",
                key: "i1a2b3c4",
                item: {
                  id: "svc1234567890",
                  item: "svc1234567890",
                  name: "Name of an AGOL item",
                  title: "An AGOL item",
                  type: "Feature Service",
                  typeKeywords: ["JavaScript"],
                  description: "Description of an AGOL item",
                  tags: ["test"],
                  snippet: "Snippet of an AGOL item",
                  thumbnail:
                    utils.ORG_URL +
                    "/sharing/rest/content/items/svc1234567890/info/thumbnail/ago_downloaded.png",
                  documentation: null,
                  categories: [],
                  contentStatus: null,
                  spatialReference: null,
                  extent: "-88.226,41.708,-88.009,41.844",
                  accessInformation: "Esri, Inc.",
                  licenseInfo: null,
                  culture: "en-us",
                  properties: null,
                  url: featureServerUrl,
                  proxyFilter: null,
                  access: "public",
                  appCategories: [],
                  industries: [],
                  languages: [],
                  largeThumbnail: null,
                  banner: null,
                  screenshots: [],
                  listed: false,
                  commentsEnabled: false,
                  groupDesignations: null
                },
                dependencies: [],
                estimatedDeploymentCostFactor: 7,
                resources: [],
                data: {
                  tables: [{ id: 1, popupInfo: { title: "table 1" } }],
                  layers: [
                    {
                      id: 0,
                      popupInfo: { title: "layer 0" },
                      layerDefinition: { defaultVisibility: true }
                    }
                  ]
                },
                properties: {
                  service: expectedService,
                  layers: [layer],
                  tables: [table]
                }
              }
            ]
          }
        };

        delete portalResponse.portalThumbnail;
        delete portalResponse.defaultBasemap.baseMapLayers[0].resourceInfo
          .layers[0].subLayerIds;
        delete portalResponse.portalProperties.sharedTheme.logo.small;
        const expectedTemplate: any = {
          organization: portalResponse,
          portalBaseUrl: "https://myorg.maps.arcgis.com",
          user: utils.getUserResponse(),
          solutionItemExtent: "-88.226,41.708,-88.009,41.844", // [[xmin, ymin], [xmax, ymax]]
          folderId: "a4468da125a64526b359b70d8ba4a9dd",
          isPortal: false,
          solutionItemId: "map1234567890",
          svc1234567890: {
            def: {},
            solutionExtent: {
              xmin: -9821384.714217981,
              ymin: 5117339.123090005,
              xmax: -9797228.384715842,
              ymax: 5137789.39951188,
              spatialReference: { wkid: 102100 }
            },
            itemId: "svc1234567890",
            url: featureServerUrl,
            name: "ROWPermits_publiccomment",
            layer0: {
              itemId: "svc1234567890",
              url: featureServerUrl + "/" + 0,
              layerId: "0",
              fields: {
                globalid: {
                  name: "globalid",
                  alias: "globalid",
                  type: "esriFieldTypeGlobalID"
                },
                creationdate: {
                  name: "CreationDate",
                  alias: "CreationDate",
                  type: "esriFieldTypeDate"
                },
                creator: {
                  name: "Creator",
                  alias: "Creator",
                  type: "esriFieldTypeString"
                },
                editdate: {
                  name: "EditDate",
                  alias: "EditDate",
                  type: "esriFieldTypeDate"
                },
                editor: {
                  name: "Editor",
                  alias: "Editor",
                  type: "esriFieldTypeString"
                },
                objectid: {
                  name: "OBJECTID",
                  alias: "OBJECTID",
                  type: "esriFieldTypeOID"
                },
                appname: {
                  name: "appname",
                  alias: "appname",
                  type: "esriFieldTypeString"
                },
                boardreview: {
                  name: "BoardReview",
                  alias: "Board Review",
                  type: "esriFieldTypeString"
                }
              }
            },
            layer1: {
              itemId: "svc1234567890",
              url: featureServerUrl + "/" + 1,
              layerId: "1",
              fields: {
                globalid: {
                  name: "globalid",
                  alias: "globalid",
                  type: "esriFieldTypeGlobalID"
                },
                creationdate: {
                  name: "CreationDate",
                  alias: "CreationDate",
                  type: "esriFieldTypeDate"
                },
                creator: {
                  name: "Creator",
                  alias: "Creator",
                  type: "esriFieldTypeString"
                },
                editdate: {
                  name: "EditDate",
                  alias: "EditDate",
                  type: "esriFieldTypeDate"
                },
                editor: {
                  name: "Editor",
                  alias: "Editor",
                  type: "esriFieldTypeString"
                },
                objectid: {
                  name: "OBJECTID",
                  alias: "OBJECTID",
                  type: "esriFieldTypeOID"
                },
                appname: {
                  name: "appname",
                  alias: "appname",
                  type: "esriFieldTypeString"
                },
                boardreview: {
                  name: "BoardReview",
                  alias: "Board Review",
                  type: "esriFieldTypeString"
                }
              }
            }
          },
          map1234567890: {
            itemId: "map1234567890"
          }
        };

        deployer
          .deploySolution(
            itemInfo.item,
            templateDictionary,
            portalSubset,
            MOCK_USER_SESSION,
            utils.PROGRESS_CALLBACK
          )
          .then(
            function(actual) {
              // not concerened with the def here
              templateDictionary["svc1234567890"].def = {};
              expect(templateDictionary).toEqual(expectedTemplate);
              expect(actual).toEqual(expected);
              done();
            },
            e => {
              done.fail(e);
            }
          );
      });

      it("can handle error on createItemWithData", done => {
        // get templates
        const itemInfo: any = templates.getSolutionTemplateItem([
          templates.getItemTemplatePart("Feature Service")
        ]);

        const portalResponse: any = utils.getPortalResponse();
        const geometryServer: string =
          portalResponse.helperServices.geometry.url;

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/data",
            itemInfo.data
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/portals/abCDefG123456?f=json&token=fake-token",
            portalResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            utils.getUserResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder",
            utils.getCreateFolderResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/generateToken",
            utils.getTokenResponse()
          )
          .post(
            "https://utility.arcgisonline.com/arcgis/rest/info",
            utils.UTILITY_SERVER_INFO
          )
          .post(
            geometryServer + "/findTransformations",
            utils.getTransformationsResponse()
          )
          .post(geometryServer + "/project", utils.getProjectResponse())
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/a4468da125a64526b359b70d8ba4a9dd/addItem",
            mockItems.get200Failure()
          );

        deployer
          .deploySolution(
            itemInfo.item,
            {},
            utils.PORTAL_SUBSET,
            MOCK_USER_SESSION,
            utils.PROGRESS_CALLBACK
          )
          .then(
            () => {
              done.fail();
            },
            () => {
              done();
            }
          );
      });

      it("can handle error on get solution item", done => {
        // get templates
        const itemInfo: any = templates.getSolutionTemplateItem([
          templates.getItemTemplatePart("Feature Service")
        ]);

        const portalResponse: any = utils.getPortalResponse();

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl + "/generateToken",
            utils.getTokenResponse()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/portals/abCDefG123456?f=json&token=fake-token",
            portalResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            utils.getUserResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder",
            utils.getCreateFolderResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/data",
            mockItems.get400Failure()
          );

        deployer
          .deploySolution(
            itemInfo.item,
            {},
            utils.PORTAL_SUBSET,
            MOCK_USER_SESSION,
            utils.PROGRESS_CALLBACK
          )
          .then(
            () => {
              done.fail();
            },
            () => {
              done();
            }
          );
      });

      it("can handle error on project", done => {
        // get templates
        const itemInfo: any = templates.getSolutionTemplateItem([
          templates.getItemTemplatePart("Feature Service")
        ]);

        const portalResponse: any = utils.getPortalResponse();
        const geometryServer: string =
          portalResponse.helperServices.geometry.url;

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/data",
            itemInfo.data
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/portals/abCDefG123456?f=json&token=fake-token",
            portalResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            utils.getUserResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder",
            utils.getCreateFolderResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/generateToken",
            utils.getTokenResponse()
          )
          .post(
            "https://utility.arcgisonline.com/arcgis/rest/info",
            utils.UTILITY_SERVER_INFO
          )
          .post(
            geometryServer + "/findTransformations",
            utils.getTransformationsResponse()
          )
          .post(geometryServer + "/project", mockItems.get400Failure());

        deployer
          .deploySolution(
            itemInfo.item,
            {},
            utils.PORTAL_SUBSET,
            MOCK_USER_SESSION,
            utils.PROGRESS_CALLBACK
          )
          .then(
            () => {
              done.fail();
            },
            () => {
              done();
            }
          );
      });

      it("can handle error on updateItem", done => {
        // get templates
        const itemInfo: any = templates.getSolutionTemplateItem([
          templates.getItemTemplatePart("Feature Service")
        ]);

        const featureServerAdminUrl: string =
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

        // get mock items
        const layer: any = mockItems.getAGOLLayerOrTable(
          0,
          "ROW Permits",
          "Feature Layer",
          [
            {
              id: 0,
              name: "",
              relatedTableId: 1,
              cardinality: "esriRelCardinalityOneToMany",
              role: "esriRelRoleOrigin",
              "": "globalid",
              composite: true,
              keyField: "globalid"
            }
          ],
          true
        );
        const table: any = mockItems.getAGOLLayerOrTable(
          1,
          "ROW Permit Comment",
          "Table",
          [
            {
              id: 0,
              name: "",
              relatedTableId: 1,
              cardinality: "esriRelCardinalityOneToMany",
              role: "esriRelRoleDestination",
              "": "globalid",
              composite: true,
              keyField: "globalid"
            }
          ],
          true
        );

        const portalResponse: any = utils.getPortalResponse();
        const geometryServer: string =
          portalResponse.helperServices.geometry.url;

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/data",
            itemInfo.data
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/portals/abCDefG123456?f=json&token=fake-token",
            portalResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            utils.getUserResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder",
            utils.getCreateFolderResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/generateToken",
            utils.getTokenResponse()
          )
          .post(
            "https://utility.arcgisonline.com/arcgis/rest/info",
            utils.UTILITY_SERVER_INFO
          )
          .post(
            geometryServer + "/findTransformations",
            utils.getTransformationsResponse()
          )
          .post(geometryServer + "/project", utils.getProjectResponse())
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/a4468da125a64526b359b70d8ba4a9dd/addItem",
            utils.getSuccessResponse({
              id: "map1234567890",
              folder: "44468da125a64526b359b70d8ba4a9dd"
            })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
            utils.getCreateServiceResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/svc1234567890/move",
            utils.getSuccessResponse({
              itemId: "svc1234567890",
              owner: "casey",
              folder: "44468da125a64526b359b70d8ba4a9dd"
            })
          )
          .post(
            featureServerAdminUrl + "/addToDefinition",
            utils.getSuccessResponse({
              layers: [{ name: "ROW Permits", id: 0 }],
              tables: [{ name: "ROW Permit Comment", id: 1 }]
            })
          )
          .post(featureServerAdminUrl + "/0?f=json", layer)
          .post(featureServerAdminUrl + "/1?f=json", table)
          .post(featureServerAdminUrl + "/refresh", utils.getSuccessResponse())
          .post(
            featureServerAdminUrl + "/0/updateDefinition",
            utils.getSuccessResponse()
          )
          .post(
            featureServerAdminUrl + "/1/updateDefinition",
            utils.getSuccessResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/svc1234567890/update",
            utils.getSuccessResponse({ id: "svc1234567890" })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/map1234567890/update",
            mockItems.get400Failure()
          );

        deployer
          .deploySolution(
            itemInfo.item,
            {},
            utils.PORTAL_SUBSET,
            MOCK_USER_SESSION,
            utils.PROGRESS_CALLBACK
          )
          .then(
            () => {
              done.fail();
            },
            () => {
              done();
            }
          );
      });

      it("can handle error on deploySolutionItems update", done => {
        // get templates
        const itemInfo: any = templates.getSolutionTemplateItem([
          templates.getItemTemplatePart("Feature Service")
        ]);

        const featureServerAdminUrl: string =
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

        // get mock items
        const layer: any = mockItems.getAGOLLayerOrTable(
          0,
          "ROW Permits",
          "Feature Layer",
          [
            {
              id: 0,
              name: "",
              relatedTableId: 1,
              cardinality: "esriRelCardinalityOneToMany",
              role: "esriRelRoleOrigin",
              "": "globalid",
              composite: true,
              keyField: "globalid"
            }
          ],
          true
        );
        const table: any = mockItems.getAGOLLayerOrTable(
          1,
          "ROW Permit Comment",
          "Table",
          [
            {
              id: 0,
              name: "",
              relatedTableId: 1,
              cardinality: "esriRelCardinalityOneToMany",
              role: "esriRelRoleDestination",
              "": "globalid",
              composite: true,
              keyField: "globalid"
            }
          ],
          true
        );

        const portalResponse: any = utils.getPortalResponse();
        const geometryServer: string =
          portalResponse.helperServices.geometry.url;

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/data",
            itemInfo.data
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/portals/abCDefG123456?f=json&token=fake-token",
            portalResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            utils.getUserResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder",
            utils.getCreateFolderResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/generateToken",
            utils.getTokenResponse()
          )
          .post(
            "https://utility.arcgisonline.com/arcgis/rest/info",
            utils.UTILITY_SERVER_INFO
          )
          .post(
            geometryServer + "/findTransformations",
            utils.getTransformationsResponse()
          )
          .post(geometryServer + "/project", utils.getProjectResponse())
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/a4468da125a64526b359b70d8ba4a9dd/addItem",
            utils.getSuccessResponse({
              id: "map1234567890",
              folder: "44468da125a64526b359b70d8ba4a9dd"
            })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
            utils.getCreateServiceResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/svc1234567890/move",
            utils.getSuccessResponse({
              itemId: "svc1234567890",
              owner: "casey",
              folder: "44468da125a64526b359b70d8ba4a9dd"
            })
          )
          .post(
            featureServerAdminUrl + "/addToDefinition",
            utils.getSuccessResponse({
              layers: [{ name: "ROW Permits", id: 0 }],
              tables: [{ name: "ROW Permit Comment", id: 1 }]
            })
          )
          .post(featureServerAdminUrl + "/0?f=json", layer)
          .post(featureServerAdminUrl + "/1?f=json", table)
          .post(featureServerAdminUrl + "/refresh", utils.getSuccessResponse())
          .post(
            featureServerAdminUrl + "/0/updateDefinition",
            utils.getSuccessResponse()
          )
          .post(
            featureServerAdminUrl + "/1/updateDefinition",
            utils.getSuccessResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/svc1234567890/update",
            mockItems.get400Failure()
          );

        deployer
          .deploySolution(
            itemInfo.item,
            {},
            utils.PORTAL_SUBSET,
            MOCK_USER_SESSION,
            utils.PROGRESS_CALLBACK
          )
          .then(
            () => {
              done.fail();
            },
            () => {
              done();
            }
          );
      });
    }
  });

  describe("_checkedReplaceAll", () => {
    it("_checkedReplaceAll no template", () => {
      const template: string = null;
      const oldValue = "onm";
      const newValue = "ONM";
      const expectedResult = template;

      const actualResult = deployer._checkedReplaceAll(
        template,
        oldValue,
        newValue
      );
      expect(actualResult).toEqual(expectedResult);
    });

    it("_checkedReplaceAll no matches", () => {
      const template = "abcdefghijklmnopqrstuvwxyz";
      const oldValue = "onm";
      const newValue = "ONM";
      const expectedResult = template;

      const actualResult = deployer._checkedReplaceAll(
        template,
        oldValue,
        newValue
      );
      expect(actualResult).toEqual(expectedResult);
    });

    it("_checkedReplaceAll one match", () => {
      const template = "abcdefghijklmnopqrstuvwxyz";
      const oldValue = "mno";
      const newValue = "MNO";
      const expectedResult = "abcdefghijklMNOpqrstuvwxyz";

      const actualResult = deployer._checkedReplaceAll(
        template,
        oldValue,
        newValue
      );
      expect(actualResult).toEqual(expectedResult);
    });

    it("_checkedReplaceAll two matches", () => {
      const template = "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz";
      const oldValue = "mno";
      const newValue = "MNO";
      const expectedResult =
        "abcdefghijklMNOpqrstuvwxyzabcdefghijklMNOpqrstuvwxyz";

      const actualResult = deployer._checkedReplaceAll(
        template,
        oldValue,
        newValue
      );
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe("_estimateDeploymentCost", () => {
    xit("_estimateDeploymentCost", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });
});
