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
import * as templates from "../../common/test/mocks/templates";

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

  describe("getWorkforceDependencies", () => {
    it("can get dependencies from workforce service", () => {
      const template = templates.getItemTemplateSkeleton();
      delete template.item.properties;
      const actual = workforceHelpers.getWorkforceDependencies(template, [
        "ABC123"
      ]);
      const expected = [{ id: "ABC123", name: "" }];
      expect(actual).toEqual(expected);
    });
  });

  describe("getWorkforceServiceInfo", () => {
    it("can handle query failure", done => {
      const props: interfaces.IFeatureServiceProperties = {
        service: {},
        layers: [],
        tables: []
      };

      const urlNonAdmin =
        "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_733f169eddb3451a9901abc8bd3d4ad4/FeatureServer";
      const url =
        "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/admin/services/workforce_733f169eddb3451a9901abc8bd3d4ad4/FeatureServer";

      fetchMock
        .get(
          urlNonAdmin +
            "/3/query?f=json&where=1%3D1&outFields=*&token=fake-token",
          mockItems.get400Failure()
        )
        .get(
          urlNonAdmin +
            "/4/query?f=json&where=1%3D1&outFields=*&token=fake-token",
          mockItems.get400Failure()
        );

      workforceHelpers
        .getWorkforceServiceInfo(props, url, MOCK_USER_SESSION)
        .then(() => done.fail, done);
    });

    it("can handle _getAssignmentIntegrationInfos failure", done => {
      const props: interfaces.IFeatureServiceProperties = {
        service: {},
        layers: [],
        tables: []
      };

      const assignmentIntegrations = {
        objectIdFieldName: "OBJECTID",
        uniqueIdField: { name: "OBJECTID", isSystemMaintained: true },
        globalIdFieldName: "GlobalID",
        fields: [
          {
            name: "OBJECTID",
            type: "esriFieldTypeOID",
            alias: "OBJECTID",
            sqlType: "sqlTypeInteger"
          },
          {
            name: "GlobalID",
            type: "esriFieldTypeGlobalID",
            alias: "GlobalID",
            sqlType: "sqlTypeOther",
            length: 38
          },
          {
            name: "appid",
            type: "esriFieldTypeString",
            alias: "App ID",
            sqlType: "sqlTypeVarchar",
            length: 255
          },
          {
            name: "prompt",
            type: "esriFieldTypeString",
            alias: "Prompt",
            sqlType: "sqlTypeVarchar",
            length: 255
          },
          {
            name: "urltemplate",
            type: "esriFieldTypeString",
            alias: "URL Template",
            sqlType: "sqlTypeVarchar",
            length: 4000
          },
          {
            name: "assignmenttype",
            type: "esriFieldTypeGUID",
            alias: "Assignment Type",
            sqlType: "sqlTypeOther",
            length: 38
          },
          {
            name: "CreationDate",
            type: "esriFieldTypeDate",
            alias: "CreationDate",
            sqlType: "sqlTypeOther",
            length: 8
          }
        ],
        features: [
          {
            attributes: {
              OBJECTID: 2,
              GlobalID: "5dc678db-9115-49de-b7e2-6efb80d032c1",
              appid: "arcgis-navigator",
              prompt: "Navigate to Assignment",
              urltemplate:
                "https://navigator.arcgis.app?stop=${assignment.latitude},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt=Workforce",
              assignmenttype: null,
              CreationDate: 1598295988457
            }
          },
          {
            attributes: {
              OBJECTID: 3,
              GlobalID: "b2eabaf6-9c4d-4cd2-88f2-84eb2e1e94d7",
              appid: "arcgis-collector",
              prompt: "Collect at Assignment",
              urltemplate:
                "https://collector.arcgis.app?itemID=79625fd36f30420a8b961df47dae8bbf&center=${assignment.latitude},${assignment.longitude}",
              assignmenttype: "72832e11-2f1c-42c2-809b-b1108b5c625d",
              CreationDate: 1598295988457
            }
          },
          {
            attributes: {
              OBJECTID: 4,
              GlobalID: "c7889194-b3a7-47d3-899b-a3f72017f845",
              appid: "arcgis-collector",
              prompt: "Collect at Assignment",
              urltemplate:
                "https://collector.arcgis.app?itemID=79625fd36f30420a8b961df47dae8bbf&center=${assignment.latitude},${assignment.longitude}&featureSourceURL=https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/ProposedSiteAddress_field_483ff5d0f06d42fba56b479147b4422d/FeatureServer/0&featureAttributes=%7B%22placename%22:%22${assignment.location}%22%7D",
              assignmenttype: "0db1c114-7221-4cf1-9df9-a37801fb2896",
              CreationDate: 1598295988457
            }
          }
        ]
      };
      const assignmentTypes = {
        objectIdFieldName: "OBJECTID",
        uniqueIdField: { name: "OBJECTID", isSystemMaintained: true },
        globalIdFieldName: "GlobalID",
        fields: [
          {
            name: "OBJECTID",
            type: "esriFieldTypeOID",
            alias: "OBJECTID",
            sqlType: "sqlTypeInteger"
          },
          {
            name: "description",
            type: "esriFieldTypeString",
            alias: "Description",
            sqlType: "sqlTypeVarchar",
            length: 255
          },
          {
            name: "GlobalID",
            type: "esriFieldTypeGlobalID",
            alias: "GlobalID",
            sqlType: "sqlTypeOther",
            length: 38
          },
          {
            name: "CreationDate",
            type: "esriFieldTypeDate",
            alias: "CreationDate",
            sqlType: "sqlTypeOther",
            length: 8
          }
        ],
        features: [
          {
            attributes: {
              OBJECTID: 1,
              description: "Verify Address",
              GlobalID: "72832e11-2f1c-42c2-809b-b1108b5c625d",
              CreationDate: 1598295988210
            }
          },
          {
            attributes: {
              OBJECTID: 2,
              description: "Collect New Address",
              GlobalID: "0db1c114-7221-4cf1-9df9-a37801fb2896",
              CreationDate: 1598295988210
            }
          }
        ]
      };

      const urlNonAdmin =
        "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_733f169eddb3451a9901abc8bd3d4ad4/FeatureServer";
      const url =
        "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/admin/services/workforce_733f169eddb3451a9901abc8bd3d4ad4/FeatureServer";
      const fetchUrl =
        "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/ProposedSiteAddress_field_483ff5d0f06d42fba56b479147b4422d/FeatureServer/0";

      fetchMock
        .get(
          urlNonAdmin +
            "/3/query?f=json&where=1%3D1&outFields=*&token=fake-token",
          assignmentTypes
        )
        .get(
          urlNonAdmin +
            "/4/query?f=json&where=1%3D1&outFields=*&token=fake-token",
          assignmentIntegrations
        )
        .post(fetchUrl, mockItems.get400Failure());

      workforceHelpers
        .getWorkforceServiceInfo(props, url, MOCK_USER_SESSION)
        .then(() => done.fail(), done);
    });
  });

  describe("postProcessWorkforceTemplates", () => {
    it("post process workforce service V2", () => {
      const _templates: interfaces.IItemTemplate[] = [
        {
          itemId: "47e0189b806b4151b891a6aa4643e5d8",
          type: "Feature Service",
          key: "au3eoqt6",
          item: {
            id: "{{47e0189b806b4151b891a6aa4643e5d8.itemId}}",
            type: "Feature Service",
            name: "workforce_733f169eddb3451a9901abc8bd3d4ad4",
            properties: {
              workforceProjectGroupId: "733f169eddb3451a9901abc8bd3d4ad4",
              workforceProjectVersion: "2.0.0",
              workforceDispatcherMapId: "af20c97da8864abaaa35a6fcfebcfaa4",
              workforceWorkerMapId: "686c1f6b308e4fa7939257811c604be1"
            },
            title: "Address Assignments v2",
            typeKeywords: [
              "ArcGIS Server",
              "Data",
              "Feature Access",
              "Feature Service",
              "Multilayer",
              "Service",
              "Workforce Project",
              "Hosted Service"
            ],
            url: "{{47e0189b806b4151b891a6aa4643e5d8.url}}"
          },
          data: null,
          resources: [],
          dependencies: [
            "af20c97da8864abaaa35a6fcfebcfaa4",
            "733f169eddb3451a9901abc8bd3d4ad4",
            "686c1f6b308e4fa7939257811c604be1",
            "79625fd36f30420a8b961df47dae8bbf"
          ],
          groups: ["733f169eddb3451a9901abc8bd3d4ad4"],
          properties: {
            workforceInfos: {
              assignmentTypeInfos: [
                {
                  description: "Verify Address",
                  GlobalID: "72832e11-2f1c-42c2-809b-b1108b5c625d"
                },
                {
                  description: "Collect New Address",
                  GlobalID: "0db1c114-7221-4cf1-9df9-a37801fb2896"
                }
              ],
              assignmentIntegrationInfos: [
                {
                  appid: "arcgis-navigator",
                  GlobalID: "5dc678db-9115-49de-b7e2-6efb80d032c1",
                  prompt: "Navigate to Assignment",
                  urltemplate:
                    "https://navigator.arcgis.app?stop=${assignment.latitude},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt=Workforce",
                  dependencies: [],
                  assignmenttype: null
                },
                {
                  appid: "arcgis-collector",
                  GlobalID: "b2eabaf6-9c4d-4cd2-88f2-84eb2e1e94d7",
                  prompt: "Collect at Assignment",
                  urltemplate:
                    "https://collector.arcgis.app?itemID={{79625fd36f30420a8b961df47dae8bbf.itemId}}&center=${assignment.latitude},${assignment.longitude}",
                  dependencies: ["79625fd36f30420a8b961df47dae8bbf"],
                  assignmenttype: "72832e11-2f1c-42c2-809b-b1108b5c625d"
                },
                {
                  appid: "arcgis-collector",
                  GlobalID: "c7889194-b3a7-47d3-899b-a3f72017f845",
                  prompt: "Collect at Assignment",
                  urltemplate:
                    "https://collector.arcgis.app?itemID={{79625fd36f30420a8b961df47dae8bbf.itemId}}&center=${assignment.latitude},${assignment.longitude}&featureSourceURL={{8e1397c8f8ec45f69ff13b2fbf6b58a7.layer0.url}}&featureAttributes=%7B%22placename%22:%22${assignment.location}%22%7D",
                  dependencies: ["79625fd36f30420a8b961df47dae8bbf"],
                  assignmenttype: "0db1c114-7221-4cf1-9df9-a37801fb2896"
                }
              ]
            }
          },
          estimatedDeploymentCostFactor: 10
        },
        {
          itemId: "af20c97da8864abaaa35a6fcfebcfaa4",
          type: "Web Map",
          key: "dd2o31ff",
          item: {
            id: "{{af20c97da8864abaaa35a6fcfebcfaa4.itemId}}",
            type: "Web Map",
            name: null,
            properties: {
              workforceFeatureServiceId: "47e0189b806b4151b891a6aa4643e5d8"
            },
            title: "Address Assignments v2 Dispatcher Map",
            typeKeywords: [
              "ArcGIS Online",
              "Explorer Web Map",
              "Map",
              "Offline",
              "Online Map",
              "Web Map",
              "Workforce Dispatcher"
            ],
            url:
              "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{af20c97da8864abaaa35a6fcfebcfaa4.itemId}}"
          },
          data: {},
          resources: [],
          dependencies: ["47e0189b806b4151b891a6aa4643e5d8"],
          groups: ["733f169eddb3451a9901abc8bd3d4ad4"],
          properties: {},
          estimatedDeploymentCostFactor: 2,
          relatedItems: []
        },
        {
          itemId: "733f169eddb3451a9901abc8bd3d4ad4",
          type: "Group",
          key: "ar4g1es2",
          item: {
            id: "{{733f169eddb3451a9901abc8bd3d4ad4.itemId}}",
            title: "Address Assignments v2",
            typeKeywords: [],
            type: "Group"
          },
          data: {},
          resources: [],
          dependencies: [],
          groups: [],
          properties: {},
          estimatedDeploymentCostFactor: 2
        },
        {
          itemId: "686c1f6b308e4fa7939257811c604be1",
          type: "Web Map",
          key: "zb30cybr",
          item: {
            id: "{{686c1f6b308e4fa7939257811c604be1.itemId}}",
            type: "Web Map",
            properties: {
              workforceFeatureServiceId: "47e0189b806b4151b891a6aa4643e5d8"
            },
            title: "Address Assignments v2",
            typeKeywords: [
              "ArcGIS Online",
              "Data Editing",
              "Explorer Web Map",
              "Map",
              "Offline",
              "Online Map",
              "Web Map",
              "Workforce Worker"
            ],
            url:
              "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{686c1f6b308e4fa7939257811c604be1.itemId}}"
          },
          data: {},
          resources: [],
          dependencies: ["47e0189b806b4151b891a6aa4643e5d8"],
          groups: ["733f169eddb3451a9901abc8bd3d4ad4"],
          properties: {},
          estimatedDeploymentCostFactor: 2,
          relatedItems: []
        },
        {
          itemId: "79625fd36f30420a8b961df47dae8bbf",
          type: "Web Map",
          key: "fati52y5",
          item: {
            id: "{{79625fd36f30420a8b961df47dae8bbf.itemId}}",
            type: "Web Map",
            name: null,
            properties: null,
            title: "Address Field Inventory",
            typeKeywords: [
              "ArcGIS Online",
              "Collector",
              "Data Editing",
              "Explorer Web Map",
              "Map",
              "Online Map",
              "Web Map"
            ],
            url:
              "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{79625fd36f30420a8b961df47dae8bbf.itemId}}"
          },
          data: {},
          resources: [],
          dependencies: ["8e1397c8f8ec45f69ff13b2fbf6b58a7"],
          groups: [],
          properties: {},
          estimatedDeploymentCostFactor: 2,
          relatedItems: []
        },
        {
          itemId: "8e1397c8f8ec45f69ff13b2fbf6b58a7",
          type: "Feature Service",
          key: "d0zlsunb",
          item: {
            id: "{{8e1397c8f8ec45f69ff13b2fbf6b58a7.itemId}}",
            type: "Feature Service",
            name: "ProposedSiteAddress_field_483ff5d0f06d42fba56b479147b4422d",
            properties: null,
            title: "ProposedSiteAddress_field",
            typeKeywords: [
              "ArcGIS Server",
              "Data",
              "Feature Access",
              "Feature Service",
              "Service",
              "Singlelayer",
              "Hosted Service",
              "View Service"
            ],
            url: "{{8e1397c8f8ec45f69ff13b2fbf6b58a7.url}}"
          },
          data: {},
          resources: [],
          dependencies: ["8db2828e30174705a6aa31c30d8d69bd"],
          groups: [],
          properties: {},
          estimatedDeploymentCostFactor: 10
        },
        {
          itemId: "8db2828e30174705a6aa31c30d8d69bd",
          type: "Feature Service",
          key: "aq08tnbi",
          item: {
            id: "{{8db2828e30174705a6aa31c30d8d69bd.itemId}}",
            type: "Feature Service",
            name: "ProposedSiteAddress_483ff5d0f06d42fba56b479147b4422d",
            properties: null,
            title: "ProposedSiteAddress",
            typeKeywords: [
              "ArcGIS Server",
              "Data",
              "Feature Access",
              "Feature Service",
              "Metadata",
              "Service",
              "Singlelayer",
              "Hosted Service"
            ],
            url: "{{8db2828e30174705a6aa31c30d8d69bd.url}}"
          },
          data: {},
          resources: [],
          dependencies: [],
          groups: [],
          properties: {},
          estimatedDeploymentCostFactor: 10
        }
      ];

      const expected: interfaces.IItemTemplate[] = [
        {
          itemId: "47e0189b806b4151b891a6aa4643e5d8",
          type: "Feature Service",
          key: "au3eoqt6",
          item: {
            id: "{{47e0189b806b4151b891a6aa4643e5d8.itemId}}",
            type: "Feature Service",
            name: "workforce_733f169eddb3451a9901abc8bd3d4ad4",
            properties: {
              workforceProjectGroupId:
                "{{733f169eddb3451a9901abc8bd3d4ad4.itemId}}",
              workforceProjectVersion: "2.0.0",
              workforceDispatcherMapId:
                "{{af20c97da8864abaaa35a6fcfebcfaa4.itemId}}",
              workforceWorkerMapId:
                "{{686c1f6b308e4fa7939257811c604be1.itemId}}"
            },
            title: "Address Assignments v2",
            typeKeywords: [
              "ArcGIS Server",
              "Data",
              "Feature Access",
              "Feature Service",
              "Multilayer",
              "Service",
              "Workforce Project",
              "Hosted Service"
            ],
            url: "{{47e0189b806b4151b891a6aa4643e5d8.url}}"
          },
          data: null,
          resources: [],
          dependencies: [],
          groups: ["733f169eddb3451a9901abc8bd3d4ad4"],
          properties: {
            workforceInfos: {
              assignmentTypeInfos: [
                {
                  description: "Verify Address",
                  GlobalID: "72832e11-2f1c-42c2-809b-b1108b5c625d"
                },
                {
                  description: "Collect New Address",
                  GlobalID: "0db1c114-7221-4cf1-9df9-a37801fb2896"
                }
              ],
              assignmentIntegrationInfos: [
                {
                  appid: "arcgis-navigator",
                  GlobalID: "5dc678db-9115-49de-b7e2-6efb80d032c1",
                  prompt: "Navigate to Assignment",
                  urltemplate:
                    "https://navigator.arcgis.app?stop=${assignment.latitude},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt=Workforce",
                  assignmenttype: null
                },
                {
                  appid: "arcgis-collector",
                  GlobalID: "b2eabaf6-9c4d-4cd2-88f2-84eb2e1e94d7",
                  prompt: "Collect at Assignment",
                  urltemplate:
                    "https://collector.arcgis.app?itemID={{79625fd36f30420a8b961df47dae8bbf.itemId}}&center=${assignment.latitude},${assignment.longitude}",
                  assignmenttype: "72832e11-2f1c-42c2-809b-b1108b5c625d"
                },
                {
                  appid: "arcgis-collector",
                  GlobalID: "c7889194-b3a7-47d3-899b-a3f72017f845",
                  prompt: "Collect at Assignment",
                  urltemplate:
                    "https://collector.arcgis.app?itemID={{79625fd36f30420a8b961df47dae8bbf.itemId}}&center=${assignment.latitude},${assignment.longitude}&featureSourceURL={{8e1397c8f8ec45f69ff13b2fbf6b58a7.layer0.url}}&featureAttributes=%7B%22placename%22:%22${assignment.location}%22%7D",
                  assignmenttype: "0db1c114-7221-4cf1-9df9-a37801fb2896"
                }
              ]
            }
          },
          estimatedDeploymentCostFactor: 10
        },
        {
          itemId: "af20c97da8864abaaa35a6fcfebcfaa4",
          type: "Web Map",
          key: "dd2o31ff",
          item: {
            id: "{{af20c97da8864abaaa35a6fcfebcfaa4.itemId}}",
            type: "Web Map",
            name: null,
            properties: {
              workforceFeatureServiceId:
                "{{47e0189b806b4151b891a6aa4643e5d8.itemId}}"
            },
            title: "Address Assignments v2 Dispatcher Map",
            typeKeywords: [
              "ArcGIS Online",
              "Explorer Web Map",
              "Map",
              "Offline",
              "Online Map",
              "Web Map",
              "Workforce Dispatcher"
            ],
            url:
              "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{af20c97da8864abaaa35a6fcfebcfaa4.itemId}}"
          },
          data: {},
          resources: [],
          dependencies: ["47e0189b806b4151b891a6aa4643e5d8"],
          groups: ["733f169eddb3451a9901abc8bd3d4ad4"],
          properties: {},
          estimatedDeploymentCostFactor: 2,
          relatedItems: []
        },
        {
          itemId: "733f169eddb3451a9901abc8bd3d4ad4",
          type: "Group",
          key: "ar4g1es2",
          item: {
            id: "{{733f169eddb3451a9901abc8bd3d4ad4.itemId}}",
            title: "Address Assignments v2",
            typeKeywords: [],
            type: "Group"
          },
          data: {},
          resources: [],
          dependencies: [
            "af20c97da8864abaaa35a6fcfebcfaa4",
            "686c1f6b308e4fa7939257811c604be1",
            "79625fd36f30420a8b961df47dae8bbf"
          ],
          groups: [],
          properties: {},
          estimatedDeploymentCostFactor: 2
        },
        {
          itemId: "686c1f6b308e4fa7939257811c604be1",
          type: "Web Map",
          key: "zb30cybr",
          item: {
            id: "{{686c1f6b308e4fa7939257811c604be1.itemId}}",
            type: "Web Map",
            properties: {
              workforceFeatureServiceId:
                "{{47e0189b806b4151b891a6aa4643e5d8.itemId}}"
            },
            title: "Address Assignments v2",
            typeKeywords: [
              "ArcGIS Online",
              "Data Editing",
              "Explorer Web Map",
              "Map",
              "Offline",
              "Online Map",
              "Web Map",
              "Workforce Worker"
            ],
            url:
              "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{686c1f6b308e4fa7939257811c604be1.itemId}}"
          },
          data: {},
          resources: [],
          dependencies: ["47e0189b806b4151b891a6aa4643e5d8"],
          groups: ["733f169eddb3451a9901abc8bd3d4ad4"],
          properties: {},
          estimatedDeploymentCostFactor: 2,
          relatedItems: []
        },
        {
          itemId: "79625fd36f30420a8b961df47dae8bbf",
          type: "Web Map",
          key: "fati52y5",
          item: {
            id: "{{79625fd36f30420a8b961df47dae8bbf.itemId}}",
            type: "Web Map",
            name: null,
            properties: null,
            title: "Address Field Inventory",
            typeKeywords: [
              "ArcGIS Online",
              "Collector",
              "Data Editing",
              "Explorer Web Map",
              "Map",
              "Online Map",
              "Web Map"
            ],
            url:
              "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{79625fd36f30420a8b961df47dae8bbf.itemId}}"
          },
          data: {},
          resources: [],
          dependencies: ["8e1397c8f8ec45f69ff13b2fbf6b58a7"],
          groups: [],
          properties: {},
          estimatedDeploymentCostFactor: 2,
          relatedItems: []
        },
        {
          itemId: "8e1397c8f8ec45f69ff13b2fbf6b58a7",
          type: "Feature Service",
          key: "d0zlsunb",
          item: {
            id: "{{8e1397c8f8ec45f69ff13b2fbf6b58a7.itemId}}",
            type: "Feature Service",
            name: "ProposedSiteAddress_field_483ff5d0f06d42fba56b479147b4422d",
            properties: null,
            title: "ProposedSiteAddress_field",
            typeKeywords: [
              "ArcGIS Server",
              "Data",
              "Feature Access",
              "Feature Service",
              "Service",
              "Singlelayer",
              "Hosted Service",
              "View Service"
            ],
            url: "{{8e1397c8f8ec45f69ff13b2fbf6b58a7.url}}"
          },
          data: {},
          resources: [],
          dependencies: ["8db2828e30174705a6aa31c30d8d69bd"],
          groups: [],
          properties: {},
          estimatedDeploymentCostFactor: 10
        },
        {
          itemId: "8db2828e30174705a6aa31c30d8d69bd",
          type: "Feature Service",
          key: "aq08tnbi",
          item: {
            id: "{{8db2828e30174705a6aa31c30d8d69bd.itemId}}",
            type: "Feature Service",
            name: "ProposedSiteAddress_483ff5d0f06d42fba56b479147b4422d",
            properties: null,
            title: "ProposedSiteAddress",
            typeKeywords: [
              "ArcGIS Server",
              "Data",
              "Feature Access",
              "Feature Service",
              "Metadata",
              "Service",
              "Singlelayer",
              "Hosted Service"
            ],
            url: "{{8db2828e30174705a6aa31c30d8d69bd.url}}"
          },
          data: {},
          resources: [],
          dependencies: [],
          groups: [],
          properties: {},
          estimatedDeploymentCostFactor: 10
        }
      ];

      const actual = workforceHelpers.postProcessWorkforceTemplates(_templates);
      expect(actual).toEqual(expected);
    });
  });

  describe("fineTuneCreatedWorkforceItem", () => {
    it("post process a workforce service", done => {
      const template: interfaces.IItemTemplate = {
        itemId: "58d8b90f6a0f4900a9ea0b627f07b8ea",
        type: "Feature Service",
        key: "w4jsjf18",
        item: {
          id: "{{47e0189b806b4151b891a6aa4643e5d8.itemId}}",
          type: "Feature Service",
          accessInformation: null,
          categories: [],
          culture: "",
          description: null,
          extent: "{{solutionItemExtent}}",
          licenseInfo: null,
          name: "workforce_7b1c2d1841df41dabbeb4a6ca46d026a",
          properties: {
            workforceProjectGroupId:
              "{{733f169eddb3451a9901abc8bd3d4ad4.itemId}}",
            workforceProjectVersion: "2.0.0",
            workforceDispatcherMapId:
              "{{af20c97da8864abaaa35a6fcfebcfaa4.itemId}}",
            workforceWorkerMapId: "{{686c1f6b308e4fa7939257811c604be1.itemId}}"
          },
          snippet:
            "A Workforce for ArcGIS Project used by addressing staff to manage address field operations.",
          tags: ["workforce"],
          title: "Address Assignments v2",
          typeKeywords: [
            "ArcGIS Server",
            "Data",
            "Feature Access",
            "Feature Service",
            "Multilayer",
            "Service",
            "Workforce Project",
            "Hosted Service",
            "source-47e0189b806b4151b891a6aa4643e5d8"
          ],
          url: "{{47e0189b806b4151b891a6aa4643e5d8.url}}",
          thumbnailurl:
            "https://www.arcgis.com/sharing/rest/content/items/f3743033960544cca79f51e5f4a3701c/resources/47e0189b806b4151b891a6aa4643e5d8_info_thumbnail/ago_downloaded.png?token=-6rdVI7jrVE_5ikmGG90hCIeqZiWAfd_-vxMKuPLDeo6pGuZB0IrLNxIaSwzy9QJzOQdKv7hdiXbRyOA14PIAdPJYVlevteGzT84JxSUrSZdr3g25Wy4mQRW_W4DI7DofS9U4zBD8XkTyAuguy2BrYgo5XZ5ynmrSxjHg5bis4dUTJDgGN9oPtIQdJfbmTWKWs1RHm-g7HWJY0ZBUxBSreP-mRrylxnCFpJfoq6GriE.&w=400"
        },
        data: null,
        resources: [
          "47e0189b806b4151b891a6aa4643e5d8_info_thumbnail/ago_downloaded.png"
        ],
        dependencies: [],
        groups: ["733f169eddb3451a9901abc8bd3d4ad4"],
        properties: {
          workforceInfos: {
            assignmentTypeInfos: [
              {
                description: "Verify Address",
                GlobalID: "72832e11-2f1c-42c2-809b-b1108b5c625d"
              },
              {
                description: "Collect New Address",
                GlobalID: "0db1c114-7221-4cf1-9df9-a37801fb2896"
              }
            ],
            assignmentIntegrationInfos: [
              {
                appid: "arcgis-navigator",
                GlobalID: "5dc678db-9115-49de-b7e2-6efb80d032c1",
                prompt: "Navigate to Assignment",
                urltemplate:
                  "https://navigator.arcgis.app?stop=${assignment.latitude},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt=Workforce",
                assignmenttype: null
              },
              {
                appid: "arcgis-collector",
                GlobalID: "b2eabaf6-9c4d-4cd2-88f2-84eb2e1e94d7",
                prompt: "Collect at Assignment",
                urltemplate:
                  "https://collector.arcgis.app?itemID={{79625fd36f30420a8b961df47dae8bbf.itemId}}&center=${assignment.latitude},${assignment.longitude}",
                assignmenttype: "72832e11-2f1c-42c2-809b-b1108b5c625d"
              },
              {
                appid: "arcgis-collector",
                GlobalID: "c7889194-b3a7-47d3-899b-a3f72017f845",
                prompt: "Collect at Assignment",
                urltemplate:
                  "https://collector.arcgis.app?itemID={{79625fd36f30420a8b961df47dae8bbf.itemId}}&center=${assignment.latitude},${assignment.longitude}&featureSourceURL={{8e1397c8f8ec45f69ff13b2fbf6b58a7.layer0.url}}&featureAttributes=%7B%22placename%22:%22${assignment.location}%22%7D",
                assignmenttype: "0db1c114-7221-4cf1-9df9-a37801fb2896"
              }
            ]
          },
          defaultExtent: {
            xmin: -14999999.999989873,
            ymin: 2699999.999998044,
            xmax: -6199999.999995815,
            ymax: 6499999.99999407,
            spatialReference: {
              wkid: 102100,
              latestWkid: 3857
            }
          }
        },
        estimatedDeploymentCostFactor: 10,
        originalItemId: "47e0189b806b4151b891a6aa4643e5d8"
      };

      const url =
        "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer";
      const templateDictionary = {
        title: "JH Test Publish Group",
        tags: ["test"],
        thumbnailurl:
          "https://www.arcgis.com/sharing/rest/content/items/f3743033960544cca79f51e5f4a3701c/info/thumbnail/ago_downloaded.png",
        isPortal: false,
        portalBaseUrl: "https://statelocaltryit.maps.arcgis.com",
        folderId: "5bf0bc1e21234863a0ab0ae223017afe",
        solutionItemExtent:
          "-134.74729261783725,23.560962423754177,-55.69554761537273,50.309217030255674",
        solutionItemId: "7b1c2d1841df41dabbeb4a6ca46d026a",
        "47e0189b806b4151b891a6aa4643e5d8": {
          def: {},
          solutionExtent: {
            type: "extent",
            xmin: -14999999.999989873,
            ymin: 2699999.999998044,
            xmax: -6199999.999995815,
            ymax: 6499999.99999407,
            spatialReference: {
              wkid: 102100
            }
          },
          itemId: "58d8b90f6a0f4900a9ea0b627f07b8ea",
          url:
            "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/",
          name: "workforce_7b1c2d1841df41dabbeb4a6ca46d026a",
          layer0: {
            fields: {},
            url:
              "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/0",
            layerId: "0",
            itemId: "58d8b90f6a0f4900a9ea0b627f07b8ea"
          },
          layer1: {
            fields: {},
            url:
              "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/1",
            layerId: "1",
            itemId: "58d8b90f6a0f4900a9ea0b627f07b8ea"
          },
          layer2: {
            fields: {},
            url:
              "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/2",
            layerId: "2",
            itemId: "58d8b90f6a0f4900a9ea0b627f07b8ea"
          },
          layer3: {
            fields: {},
            url:
              "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/3",
            layerId: "3",
            itemId: "58d8b90f6a0f4900a9ea0b627f07b8ea"
          },
          layer4: {
            fields: {},
            url:
              "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/4",
            layerId: "4",
            itemId: "58d8b90f6a0f4900a9ea0b627f07b8ea"
          }
        },
        af20c97da8864abaaa35a6fcfebcfaa4: {
          itemId: "5385e40c69f5433caf327a98af2af033"
        },
        "686c1f6b308e4fa7939257811c604be1": {
          itemId: "a8f95972ab09405687991cd4f1cda72a"
        },
        "8db2828e30174705a6aa31c30d8d69bd": {
          def: {},
          solutionExtent: {
            type: "extent",
            xmin: -14999999.999989873,
            ymin: 2699999.999998044,
            xmax: -6199999.999995815,
            ymax: 6499999.99999407,
            spatialReference: {
              wkid: 102100
            }
          },
          itemId: "efd2895b19d64fc4b20f86c0915165cb",
          url:
            "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/ProposedSiteAddress_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/",
          name: "ProposedSiteAddress_7b1c2d1841df41dabbeb4a6ca46d026a"
        },
        "8e1397c8f8ec45f69ff13b2fbf6b58a7": {
          def: {},
          solutionExtent: {
            type: "extent",
            xmin: -14999999.999989873,
            ymin: 2699999.999998044,
            xmax: -6199999.999995815,
            ymax: 6499999.99999407,
            spatialReference: {
              wkid: 102100
            }
          },
          itemId: "7f98a949f7cb4a24b0d3b58d39b1e5cf",
          url:
            "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/ProposedSiteAddress_field_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/",
          name: "ProposedSiteAddress_field_7b1c2d1841df41dabbeb4a6ca46d026a"
        },
        "79625fd36f30420a8b961df47dae8bbf": {
          itemId: "600e2e3505a147a8a5ac82496c24218c"
        },
        "733f169eddb3451a9901abc8bd3d4ad4": {
          itemId: "98e335ed2a3d4a9b875fc87dae8f7506"
        },
        efd2895b19d64fc4b20f86c0915165cb: {
          itemId: "efd2895b19d64fc4b20f86c0915165cb",
          url:
            "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/ProposedSiteAddress_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/",
          name: "ProposedSiteAddress_7b1c2d1841df41dabbeb4a6ca46d026a"
        },
        "58d8b90f6a0f4900a9ea0b627f07b8ea": {
          itemId: "58d8b90f6a0f4900a9ea0b627f07b8ea",
          url:
            "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/",
          name: "workforce_7b1c2d1841df41dabbeb4a6ca46d026a"
        },
        "7f98a949f7cb4a24b0d3b58d39b1e5cf": {
          itemId: "7f98a949f7cb4a24b0d3b58d39b1e5cf",
          url:
            "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/ProposedSiteAddress_field_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/",
          name: "ProposedSiteAddress_field_7b1c2d1841df41dabbeb4a6ca46d026a"
        }
      };

      const expected = [true, true];

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/self?f=json&token=fake-token",
          {}
        )
        .get(
          "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/2/query?f=json&where=userId%20%3D%20%27%27&outFields=*&token=fake-token",
          {}
        )
        .post(
          "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/2",
          {
            id: 2,
            fields: [
              {
                name: "OBJECTID",
                type: "esriFieldTypeOID",
                alias: "OBJECTID",
                sqlType: "sqlTypeInteger",
                nullable: false,
                editable: false,
                domain: null,
                defaultValue: null
              },
              {
                name: "name",
                type: "esriFieldTypeString",
                alias: "Name",
                sqlType: "sqlTypeVarchar",
                length: 255,
                nullable: false,
                editable: true,
                domain: null,
                defaultValue: null
              },
              {
                name: "contactnumber",
                type: "esriFieldTypeString",
                alias: "Contact Number",
                sqlType: "sqlTypeVarchar",
                length: 50,
                nullable: true,
                editable: true,
                domain: null,
                defaultValue: null
              },
              {
                name: "userid",
                type: "esriFieldTypeString",
                alias: "User ID",
                sqlType: "sqlTypeVarchar",
                length: 128,
                nullable: false,
                editable: true,
                domain: null,
                defaultValue: null
              },
              {
                name: "GlobalID",
                type: "esriFieldTypeGlobalID",
                alias: "GlobalID",
                sqlType: "sqlTypeOther",
                length: 38,
                nullable: false,
                editable: false,
                domain: null,
                defaultValue: null
              },
              {
                name: "wfprivileges",
                type: "esriFieldTypeString",
                alias: "Privileges",
                sqlType: "sqlTypeOther",
                length: 256,
                nullable: true,
                editable: true,
                domain: null,
                defaultValue: null
              },
              {
                name: "CreationDate",
                type: "esriFieldTypeDate",
                alias: "CreationDate",
                sqlType: "sqlTypeOther",
                length: 8,
                nullable: true,
                editable: false,
                domain: null,
                defaultValue: null
              },
              {
                name: "Creator",
                type: "esriFieldTypeString",
                alias: "Creator",
                sqlType: "sqlTypeOther",
                length: 128,
                nullable: true,
                editable: false,
                domain: null,
                defaultValue: null
              },
              {
                name: "EditDate",
                type: "esriFieldTypeDate",
                alias: "EditDate",
                sqlType: "sqlTypeOther",
                length: 8,
                nullable: true,
                editable: false,
                domain: null,
                defaultValue: null
              },
              {
                name: "Editor",
                type: "esriFieldTypeString",
                alias: "Editor",
                sqlType: "sqlTypeOther",
                length: 128,
                nullable: true,
                editable: false,
                domain: null,
                defaultValue: null
              }
            ]
          }
        )
        .post(
          "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/3",
          {
            id: 3,
            fields: [
              {
                name: "OBJECTID",
                type: "esriFieldTypeOID",
                alias: "OBJECTID",
                sqlType: "sqlTypeInteger",
                nullable: false,
                editable: false,
                domain: null,
                defaultValue: null
              },
              {
                name: "description",
                type: "esriFieldTypeString",
                alias: "Description",
                sqlType: "sqlTypeVarchar",
                length: 255,
                nullable: false,
                editable: true,
                domain: null,
                defaultValue: null
              },
              {
                name: "GlobalID",
                type: "esriFieldTypeGlobalID",
                alias: "GlobalID",
                sqlType: "sqlTypeOther",
                length: 38,
                nullable: false,
                editable: false,
                domain: null,
                defaultValue: null
              },
              {
                name: "CreationDate",
                type: "esriFieldTypeDate",
                alias: "CreationDate",
                sqlType: "sqlTypeOther",
                length: 8,
                nullable: true,
                editable: false,
                domain: null,
                defaultValue: null
              },
              {
                name: "Creator",
                type: "esriFieldTypeString",
                alias: "Creator",
                sqlType: "sqlTypeOther",
                length: 128,
                nullable: true,
                editable: false,
                domain: null,
                defaultValue: null
              },
              {
                name: "EditDate",
                type: "esriFieldTypeDate",
                alias: "EditDate",
                sqlType: "sqlTypeOther",
                length: 8,
                nullable: true,
                editable: false,
                domain: null,
                defaultValue: null
              },
              {
                name: "Editor",
                type: "esriFieldTypeString",
                alias: "Editor",
                sqlType: "sqlTypeOther",
                length: 128,
                nullable: true,
                editable: false,
                domain: null,
                defaultValue: null
              }
            ]
          }
        )
        .post(
          "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/4",
          {
            id: 4,
            fields: [
              {
                name: "OBJECTID",
                type: "esriFieldTypeOID",
                alias: "OBJECTID",
                sqlType: "sqlTypeInteger",
                nullable: false,
                editable: false,
                domain: null,
                defaultValue: null
              },
              {
                name: "GlobalID",
                type: "esriFieldTypeGlobalID",
                alias: "GlobalID",
                sqlType: "sqlTypeOther",
                length: 38,
                nullable: false,
                editable: false,
                domain: null,
                defaultValue: null
              },
              {
                name: "appid",
                type: "esriFieldTypeString",
                alias: "App ID",
                sqlType: "sqlTypeVarchar",
                length: 255,
                nullable: false,
                editable: true,
                domain: null,
                defaultValue: null
              },
              {
                name: "prompt",
                type: "esriFieldTypeString",
                alias: "Prompt",
                sqlType: "sqlTypeVarchar",
                length: 255,
                nullable: false,
                editable: true,
                domain: null,
                defaultValue: null
              },
              {
                name: "urltemplate",
                type: "esriFieldTypeString",
                alias: "URL Template",
                sqlType: "sqlTypeVarchar",
                length: 4000,
                nullable: false,
                editable: true,
                domain: null,
                defaultValue: null
              },
              {
                name: "assignmenttype",
                type: "esriFieldTypeGUID",
                alias: "Assignment Type",
                sqlType: "sqlTypeOther",
                length: 38,
                nullable: true,
                editable: true,
                domain: null,
                defaultValue: null
              },
              {
                name: "CreationDate",
                type: "esriFieldTypeDate",
                alias: "CreationDate",
                sqlType: "sqlTypeOther",
                length: 8,
                nullable: true,
                editable: false,
                domain: null,
                defaultValue: null
              },
              {
                name: "Creator",
                type: "esriFieldTypeString",
                alias: "Creator",
                sqlType: "sqlTypeOther",
                length: 128,
                nullable: true,
                editable: false,
                domain: null,
                defaultValue: null
              },
              {
                name: "EditDate",
                type: "esriFieldTypeDate",
                alias: "EditDate",
                sqlType: "sqlTypeOther",
                length: 8,
                nullable: true,
                editable: false,
                domain: null,
                defaultValue: null
              },
              {
                name: "Editor",
                type: "esriFieldTypeString",
                alias: "Editor",
                sqlType: "sqlTypeOther",
                length: 128,
                nullable: true,
                editable: false,
                domain: null,
                defaultValue: null
              }
            ]
          }
        )
        .post(
          "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/3/applyEdits",
          {
            addResults: [{}]
          }
        )
        .post(
          "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/4/applyEdits",
          {
            addResults: [{}]
          }
        );

      workforceHelpers
        .fineTuneCreatedWorkforceItem(
          template,
          MOCK_USER_SESSION,
          url,
          templateDictionary
        )
        .then(actual => {
          expect(actual).toEqual(expected);
          done();
        }, done.fail);
    });

    it("handle error fetching fields", done => {
      const template: interfaces.IItemTemplate = {
        itemId: "58d8b90f6a0f4900a9ea0b627f07b8ea",
        type: "Feature Service",
        key: "w4jsjf18",
        item: {
          id: "{{47e0189b806b4151b891a6aa4643e5d8.itemId}}",
          type: "Feature Service",
          accessInformation: null,
          categories: [],
          culture: "",
          description: null,
          extent: "{{solutionItemExtent}}",
          licenseInfo: null,
          name: "workforce_7b1c2d1841df41dabbeb4a6ca46d026a",
          properties: {
            workforceProjectGroupId:
              "{{733f169eddb3451a9901abc8bd3d4ad4.itemId}}",
            workforceProjectVersion: "2.0.0",
            workforceDispatcherMapId:
              "{{af20c97da8864abaaa35a6fcfebcfaa4.itemId}}",
            workforceWorkerMapId: "{{686c1f6b308e4fa7939257811c604be1.itemId}}"
          },
          snippet:
            "A Workforce for ArcGIS Project used by addressing staff to manage address field operations.",
          tags: ["workforce"],
          title: "Address Assignments v2",
          typeKeywords: [
            "ArcGIS Server",
            "Data",
            "Feature Access",
            "Feature Service",
            "Multilayer",
            "Service",
            "Workforce Project",
            "Hosted Service",
            "source-47e0189b806b4151b891a6aa4643e5d8"
          ],
          url: "{{47e0189b806b4151b891a6aa4643e5d8.url}}",
          thumbnailurl:
            "https://www.arcgis.com/sharing/rest/content/items/f3743033960544cca79f51e5f4a3701c/resources/47e0189b806b4151b891a6aa4643e5d8_info_thumbnail/ago_downloaded.png?token=-6rdVI7jrVE_5ikmGG90hCIeqZiWAfd_-vxMKuPLDeo6pGuZB0IrLNxIaSwzy9QJzOQdKv7hdiXbRyOA14PIAdPJYVlevteGzT84JxSUrSZdr3g25Wy4mQRW_W4DI7DofS9U4zBD8XkTyAuguy2BrYgo5XZ5ynmrSxjHg5bis4dUTJDgGN9oPtIQdJfbmTWKWs1RHm-g7HWJY0ZBUxBSreP-mRrylxnCFpJfoq6GriE.&w=400"
        },
        data: null,
        resources: [
          "47e0189b806b4151b891a6aa4643e5d8_info_thumbnail/ago_downloaded.png"
        ],
        dependencies: [],
        groups: ["733f169eddb3451a9901abc8bd3d4ad4"],
        properties: {
          workforceInfos: {
            assignmentTypeInfos: [
              {
                description: "Verify Address",
                GlobalID: "72832e11-2f1c-42c2-809b-b1108b5c625d"
              },
              {
                description: "Collect New Address",
                GlobalID: "0db1c114-7221-4cf1-9df9-a37801fb2896"
              }
            ],
            assignmentIntegrationInfos: [
              {
                appid: "arcgis-navigator",
                GlobalID: "5dc678db-9115-49de-b7e2-6efb80d032c1",
                prompt: "Navigate to Assignment",
                urltemplate:
                  "https://navigator.arcgis.app?stop=${assignment.latitude},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt=Workforce",
                assignmenttype: null
              },
              {
                appid: "arcgis-collector",
                GlobalID: "b2eabaf6-9c4d-4cd2-88f2-84eb2e1e94d7",
                prompt: "Collect at Assignment",
                urltemplate:
                  "https://collector.arcgis.app?itemID={{79625fd36f30420a8b961df47dae8bbf.itemId}}&center=${assignment.latitude},${assignment.longitude}",
                assignmenttype: "72832e11-2f1c-42c2-809b-b1108b5c625d"
              },
              {
                appid: "arcgis-collector",
                GlobalID: "c7889194-b3a7-47d3-899b-a3f72017f845",
                prompt: "Collect at Assignment",
                urltemplate:
                  "https://collector.arcgis.app?itemID={{79625fd36f30420a8b961df47dae8bbf.itemId}}&center=${assignment.latitude},${assignment.longitude}&featureSourceURL={{8e1397c8f8ec45f69ff13b2fbf6b58a7.layer0.url}}&featureAttributes=%7B%22placename%22:%22${assignment.location}%22%7D",
                assignmenttype: "0db1c114-7221-4cf1-9df9-a37801fb2896"
              }
            ]
          },
          defaultExtent: {
            xmin: -14999999.999989873,
            ymin: 2699999.999998044,
            xmax: -6199999.999995815,
            ymax: 6499999.99999407,
            spatialReference: {
              wkid: 102100,
              latestWkid: 3857
            }
          }
        },
        estimatedDeploymentCostFactor: 10,
        originalItemId: "47e0189b806b4151b891a6aa4643e5d8"
      };

      const url =
        "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer";
      const templateDictionary = {
        title: "JH Test Publish Group",
        tags: ["test"],
        thumbnailurl:
          "https://www.arcgis.com/sharing/rest/content/items/f3743033960544cca79f51e5f4a3701c/info/thumbnail/ago_downloaded.png",
        isPortal: false,
        portalBaseUrl: "https://statelocaltryit.maps.arcgis.com",
        folderId: "5bf0bc1e21234863a0ab0ae223017afe",
        solutionItemExtent:
          "-134.74729261783725,23.560962423754177,-55.69554761537273,50.309217030255674",
        solutionItemId: "7b1c2d1841df41dabbeb4a6ca46d026a",
        "47e0189b806b4151b891a6aa4643e5d8": {
          def: {},
          solutionExtent: {
            type: "extent",
            xmin: -14999999.999989873,
            ymin: 2699999.999998044,
            xmax: -6199999.999995815,
            ymax: 6499999.99999407,
            spatialReference: {
              wkid: 102100
            }
          },
          itemId: "58d8b90f6a0f4900a9ea0b627f07b8ea",
          url:
            "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/",
          name: "workforce_7b1c2d1841df41dabbeb4a6ca46d026a",
          layer0: {
            fields: {},
            url:
              "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/0",
            layerId: "0",
            itemId: "58d8b90f6a0f4900a9ea0b627f07b8ea"
          },
          layer1: {
            fields: {},
            url:
              "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/1",
            layerId: "1",
            itemId: "58d8b90f6a0f4900a9ea0b627f07b8ea"
          },
          layer2: {
            fields: {},
            url:
              "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/2",
            layerId: "2",
            itemId: "58d8b90f6a0f4900a9ea0b627f07b8ea"
          },
          layer3: {
            fields: {},
            url:
              "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/3",
            layerId: "3",
            itemId: "58d8b90f6a0f4900a9ea0b627f07b8ea"
          },
          layer4: {
            fields: {},
            url:
              "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/4",
            layerId: "4",
            itemId: "58d8b90f6a0f4900a9ea0b627f07b8ea"
          }
        },
        af20c97da8864abaaa35a6fcfebcfaa4: {
          itemId: "5385e40c69f5433caf327a98af2af033"
        },
        "686c1f6b308e4fa7939257811c604be1": {
          itemId: "a8f95972ab09405687991cd4f1cda72a"
        },
        "8db2828e30174705a6aa31c30d8d69bd": {
          def: {},
          solutionExtent: {
            type: "extent",
            xmin: -14999999.999989873,
            ymin: 2699999.999998044,
            xmax: -6199999.999995815,
            ymax: 6499999.99999407,
            spatialReference: {
              wkid: 102100
            }
          },
          itemId: "efd2895b19d64fc4b20f86c0915165cb",
          url:
            "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/ProposedSiteAddress_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/",
          name: "ProposedSiteAddress_7b1c2d1841df41dabbeb4a6ca46d026a"
        },
        "8e1397c8f8ec45f69ff13b2fbf6b58a7": {
          def: {},
          solutionExtent: {
            type: "extent",
            xmin: -14999999.999989873,
            ymin: 2699999.999998044,
            xmax: -6199999.999995815,
            ymax: 6499999.99999407,
            spatialReference: {
              wkid: 102100
            }
          },
          itemId: "7f98a949f7cb4a24b0d3b58d39b1e5cf",
          url:
            "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/ProposedSiteAddress_field_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/",
          name: "ProposedSiteAddress_field_7b1c2d1841df41dabbeb4a6ca46d026a"
        },
        "79625fd36f30420a8b961df47dae8bbf": {
          itemId: "600e2e3505a147a8a5ac82496c24218c"
        },
        "733f169eddb3451a9901abc8bd3d4ad4": {
          itemId: "98e335ed2a3d4a9b875fc87dae8f7506"
        },
        efd2895b19d64fc4b20f86c0915165cb: {
          itemId: "efd2895b19d64fc4b20f86c0915165cb",
          url:
            "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/ProposedSiteAddress_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/",
          name: "ProposedSiteAddress_7b1c2d1841df41dabbeb4a6ca46d026a"
        },
        "58d8b90f6a0f4900a9ea0b627f07b8ea": {
          itemId: "58d8b90f6a0f4900a9ea0b627f07b8ea",
          url:
            "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/",
          name: "workforce_7b1c2d1841df41dabbeb4a6ca46d026a"
        },
        "7f98a949f7cb4a24b0d3b58d39b1e5cf": {
          itemId: "7f98a949f7cb4a24b0d3b58d39b1e5cf",
          url:
            "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/ProposedSiteAddress_field_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/",
          name: "ProposedSiteAddress_field_7b1c2d1841df41dabbeb4a6ca46d026a"
        }
      };

      const expected = [true, true];

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/community/self?f=json&token=fake-token",
          {}
        )
        .get(
          "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/2/query?f=json&where=userId%20%3D%20%27%27&outFields=*&token=fake-token",
          {}
        )
        .post(
          "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/2",
          mockItems.get400Failure()
        )
        .post(
          "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/3",
          mockItems.get400Failure()
        )
        .post(
          "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_7b1c2d1841df41dabbeb4a6ca46d026a/FeatureServer/4",
          mockItems.get400Failure()
        );

      workforceHelpers
        .fineTuneCreatedWorkforceItem(
          template,
          MOCK_USER_SESSION,
          url,
          templateDictionary
        )
        .then(() => done.fail(), done);
    });
  });

  describe("getUrlDependencies", () => {
    it("can handle no requests", done => {
      const expected: any = {
        dependencies: [],
        urlHash: {}
      };
      workforceHelpers.getUrlDependencies([], []).then(actual => {
        expect(actual).toEqual(expected);
        done();
      }, done.fail);
    });
  });

  describe("_templatizeWorkforceProject", () => {
    it("can handle missing properties", () => {
      const template: interfaces.IItemTemplate = templates.getItemTemplateSkeleton();
      template.item.typeKeywords = ["Workforce Project"];
      delete template.item.properties;

      const expected: interfaces.IItemTemplate = templates.getItemTemplateSkeleton();
      expected.item.typeKeywords = ["Workforce Project"];
      delete expected.item.properties;

      const actual = workforceHelpers._templatizeWorkforceProject(template, {});

      expect(actual).toEqual(expected);
    });
  });

  describe("_templatizeWorkforceDispatcherOrWorker", () => {
    it("can handle missing typeKeywords", () => {
      const template: interfaces.IItemTemplate = templates.getItemTemplateSkeleton();
      delete template.item.typeKeywords;

      const expected: interfaces.IItemTemplate = templates.getItemTemplateSkeleton();
      delete expected.item.typeKeywords;

      const actual = workforceHelpers._templatizeWorkforceDispatcherOrWorker(
        template,
        ""
      );

      expect(actual).toEqual(expected);
    });

    it("can handle missing properties ", () => {
      const template: interfaces.IItemTemplate = templates.getItemTemplateSkeleton();
      template.item.typeKeywords = ["Workforce Project"];
      delete template.item.properties;

      const expected: interfaces.IItemTemplate = templates.getItemTemplateSkeleton();
      expected.item.typeKeywords = ["Workforce Project"];
      delete expected.item.properties;

      const actual = workforceHelpers._templatizeWorkforceDispatcherOrWorker(
        template,
        "Workforce Project"
      );

      expect(actual).toEqual(expected);
    });
  });

  describe("_updateDispatchers", () => {
    it("will not fail with missing url", done => {
      workforceHelpers
        ._updateDispatchers(undefined, "A", "AA", MOCK_USER_SESSION)
        .then(actual => {
          expect(actual).toEqual(false);
          done();
        }, done.fail);
    });
  });

  describe("_getIDs", () => {
    it("will find ids", () => {
      let actual = workforceHelpers._getIDs("bad3483e025c47338d43df308c117308");
      expect(actual).toEqual(["bad3483e025c47338d43df308c117308"]);

      actual = workforceHelpers._getIDs("{bad3483e025c47338d43df308c117308");
      expect(actual).toEqual(["bad3483e025c47338d43df308c117308"]);

      actual = workforceHelpers._getIDs("=bad3483e025c47338d43df308c117308");
      expect(actual).toEqual(["bad3483e025c47338d43df308c117308"]);

      actual = workforceHelpers._getIDs(
        "http://something/name_bad3483e025c47338d43df308c117308"
      );
      expect(actual).toEqual([]);

      actual = workforceHelpers._getIDs(
        "{{bad3483e025c47338d43df308c117308.itemId}}"
      );
      expect(actual).toEqual([]);

      actual = workforceHelpers._getIDs(
        "bad3483e025c47338d43df308c117308 {bad4483e025c47338d43df308c117308 =bad5483e025c47338d43df308c117308 http://something/name_bad6483e025c47338d43df308c117308 {{bad7483e025c47338d43df308c117308.itemId}}"
      );
      expect(actual).toEqual([
        "bad3483e025c47338d43df308c117308",
        "bad4483e025c47338d43df308c117308",
        "bad5483e025c47338d43df308c117308"
      ]);
    });
  });
});
