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
 * Provides tests for functions involving the creation and deployment of feature layers and services.
 */

import {
  templatize,
  cacheFieldInfos,
  _cacheFieldInfo,
  cachePopupInfos,
  _cachePopupInfo,
  updateTemplate,
  getFieldSettings,
  updateSettingsFieldInfos,
  deTemplatizeFieldInfos,
  getLayersAndTables,
  addFeatureServiceLayersAndTables,
  postProcessFields,
  _getFieldVisibilityUpdates,
  updatePopupInfo,
  _templatize,
  _templatizeProperty,
  _templatizeLayer,
  _templatizeLayerFieldReferences,
  _templatizeAdminLayerInfo,
  _processAdminObject,
  _templatizeSourceServiceName,
  _templatizeAdminLayerInfoFields,
  _getDependantItemId,
  _templatizeAdminSourceLayerFields,
  _templatizeTopFilter,
  _templatizeRelationshipFields,
  _templatizePopupInfo,
  _templatizeName,
  _templatizePopupInfoFieldInfos,
  _templatizeFieldName,
  _templatizeExpressionInfos,
  _templatizePopupElements,
  _templatizeMediaInfos,
  _templatizeDefinitionEditor,
  _templatizeDefinitionExpression,
  _templatizeSimpleName,
  _templatizeDrawingInfo,
  _templatizeRenderer,
  _templatizeGenRenderer,
  _templatizeTemporalRenderer,
  _templatizeAuthoringInfo,
  _templatizeArcadeExpressions,
  _templatizeLabelingInfo,
  _templatizeTemplates,
  _templatizeTypeTemplates,
  _templatizeKeys,
  _templatizeTimeInfo,
  _templatizeDefinitionQuery,
  _getNameMapping,
  IPopupInfos
} from "../src/featureServiceHelpers";

import { TOMORROW, createMockSettings } from "../../common/test/mocks/utils";

import { IItemTemplate, IDependency } from "../../common/src/interfaces";

import { IUserRequestOptions, UserSession } from "@esri/arcgis-rest-auth";

import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as mockSolutions from "../../common/test/mocks/templates";
import * as common from "@esri/solution-common";

let itemTemplate: IItemTemplate;
const itemId: string = "cd766cba0dd44ec080420acc10990282";
const basePath: string = itemId + ".fieldInfos.layer0.fields";

beforeEach(() => {
  itemTemplate = {
    itemId: "",
    key: "",
    properties: {
      service: {},
      layers: [
        {
          fields: []
        }
      ],
      tables: []
    },
    type: "",
    item: {},
    data: {},
    resources: [],
    dependencies: [],
    estimatedDeploymentCostFactor: 0
  };
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

describe("Module `featureServiceHelpers`: utility functions for feature-service items", () => {
  describe("templatize", () => {
    it("should handle empty dependency array", () => {
      const dependencies: IDependency[] = [];

      itemTemplate.item.id = "ABC123";
      itemTemplate.properties.service.serviceItemId = "DEF456";

      const expected: IItemTemplate = {
        itemId: "",
        key: "",
        properties: {
          service: {
            serviceItemId: "{{DEF456.id}}"
          },
          layers: [
            {
              fields: []
            }
          ],
          tables: []
        },
        type: "",
        item: {
          id: "{{ABC123.id}}",
          url: "{{ABC123.url}}"
        },
        data: {},
        resources: [],
        dependencies: [],
        estimatedDeploymentCostFactor: 0
      };
      templatize(itemTemplate, dependencies);
      expect(itemTemplate).toEqual(expected);
      expect(dependencies).toEqual([]);
    });

    it("should handle common itemTemplate properties", () => {
      const dependencies: IDependency[] = [];
      itemTemplate = {
        itemId: "ab766cba0dd44ec080420acc10990282",
        key: "ABC123",
        properties: {
          service: {
            serviceItemId: "ab766cba0dd44ec080420acc10990282",
            layers: [
              {
                id: 0,
                prop: "A"
              }
            ],
            tables: [
              {
                id: 1,
                prop: "B"
              }
            ]
          },
          layers: [
            {
              id: "0",
              serviceItemId: "ab766cba0dd44ec080420acc10990282",
              adminLayerInfo: {
                xssTrustedFields: [],
                tableName: "ABC"
              },
              displayField: "A",
              fields: [
                {
                  name: "A"
                }
              ]
            }
          ],
          tables: [
            {
              id: "1",
              serviceItemId: "ab766cba0dd44ec080420acc10990282",
              fields: [
                {
                  name: "B"
                }
              ]
            }
          ]
        },
        type: "",
        item: {
          extent: {},
          id: "ab766cba0dd44ec080420acc10990282"
        },
        data: {
          layers: [
            {
              id: "0",
              displayField: "A",
              fields: [
                {
                  name: "A"
                }
              ]
            }
          ],
          tables: [
            {
              id: "1",
              fields: [
                {
                  name: "B"
                }
              ]
            }
          ]
        },
        resources: [],
        dependencies: [],
        estimatedDeploymentCostFactor: 0
      };
      const expected: any = {
        itemId: "ab766cba0dd44ec080420acc10990282",
        key: "ABC123",
        properties: {
          service: {
            serviceItemId: "{{ab766cba0dd44ec080420acc10990282.id}}",
            layers: [
              {
                id: 0,
                prop: "A"
              }
            ],
            tables: [
              {
                id: 1,
                prop: "B"
              }
            ]
          },
          layers: [
            {
              id: "0",
              serviceItemId: "{{ab766cba0dd44ec080420acc10990282.id}}",
              adminLayerInfo: {},
              displayField: "A",
              fields: [
                {
                  name: "A"
                }
              ]
            }
          ],
          tables: [
            {
              id: "1",
              serviceItemId: "{{ab766cba0dd44ec080420acc10990282.id}}",
              fields: [
                {
                  name: "B"
                }
              ]
            }
          ]
        },
        type: "",
        item: {
          extent: "{{initiative.extent:optional}}",
          id: "{{ab766cba0dd44ec080420acc10990282.id}}",
          url: "{{ab766cba0dd44ec080420acc10990282.url}}"
        },
        data: {
          layers: [
            {
              id: "0",
              displayField: "A",
              fields: [
                {
                  name: "A"
                }
              ]
            }
          ],
          tables: [
            {
              id: "1",
              fields: [
                {
                  name: "B"
                }
              ]
            }
          ]
        },
        resources: [],
        dependencies: [],
        estimatedDeploymentCostFactor: 0
      };
      templatize(itemTemplate, dependencies);
      expect(itemTemplate).toEqual(expected);
    });
  });

  describe("cacheFieldInfos", () => {
    it("should not fail with undefined", () => {
      let fieldInfos: any = {};
      const layer: any = undefined;
      fieldInfos = cacheFieldInfos(layer, fieldInfos);
      expect(layer).toBeUndefined();
      expect(fieldInfos).toEqual({});
    });

    it("should not fail without key properties on the layer", () => {
      let fieldInfos: any = {};
      const layer: any = {};
      fieldInfos = cacheFieldInfos(layer, fieldInfos);
      expect(layer).toEqual({});
      expect(fieldInfos).toEqual({});
    });

    it("should cache the key properties for fieldInfos and set certain properties to null", () => {
      let fieldInfos: any = {};
      const layer: any = {
        id: "23",
        fields: [
          {
            name: "A",
            type: "string"
          },
          {
            name: "B",
            type: "string"
          }
        ],
        displayField: "DisplayField",
        editFieldsInfo: ["CreateDate"],
        templates: [
          {
            A: null,
            B: null
          }
        ],
        relationships: [
          {
            relatedId: 0
          }
        ],
        drawingInfo: {
          renderer: {
            type: "simple"
          }
        },
        type: "layer"
      };

      const expectedLayer: any = {
        id: "23",
        fields: [
          {
            name: "A",
            type: "string"
          },
          {
            name: "B",
            type: "string"
          }
        ],
        displayField: "DisplayField",
        editFieldsInfo: ["CreateDate"],
        templates: null,
        relationships: null,
        drawingInfo: null,
        type: "layer"
      };

      const expectedFieldInfos: any = {
        "23": {
          id: "23",
          sourceFields: [
            {
              name: "A",
              type: "string"
            },
            {
              name: "B",
              type: "string"
            }
          ],
          editFieldsInfo: ["CreateDate"],
          templates: [
            {
              A: null,
              B: null
            }
          ],
          relationships: [
            {
              relatedId: 0
            }
          ],
          drawingInfo: {
            renderer: {
              type: "simple"
            }
          },
          type: "layer"
        }
      };

      fieldInfos = cacheFieldInfos(layer, fieldInfos);
      expect(layer).toEqual(expectedLayer);
      expect(fieldInfos).toEqual(expectedFieldInfos);
    });
  });

  describe("cachePopupInfos", () => {
    it("should not fail when empty", () => {
      const popupInfos: IPopupInfos = cachePopupInfos(itemTemplate);
      const expected: any = {
        layers: {},
        tables: {}
      };
      expect(popupInfos).toEqual(expected);
    });

    it("should handle common popup", () => {
      itemTemplate = {
        itemId: "",
        key: "",
        properties: {
          service: {},
          layers: [
            {
              fields: []
            }
          ],
          tables: []
        },
        type: "",
        item: {},
        data: {
          layers: [
            {
              id: 0
            },
            {
              id: 1,
              popupInfo: {
                property: {}
              }
            }
          ],
          tables: [
            {
              id: 2
            },
            {
              id: 637,
              popupInfo: {
                property: {}
              }
            }
          ]
        },
        resources: [],
        dependencies: [],
        estimatedDeploymentCostFactor: 0
      };

      const popupInfos: IPopupInfos = cachePopupInfos(itemTemplate.data);
      const expectedPopupInfos: any = {
        layers: {
          1: {
            property: {}
          }
        },
        tables: {
          637: {
            property: {}
          }
        }
      };

      const expectedData: any = {
        layers: [
          {
            id: 0
          },
          {
            id: 1,
            popupInfo: {}
          }
        ],
        tables: [
          {
            id: 2
          },
          {
            id: 637,
            popupInfo: {}
          }
        ]
      };
      // popupInfos should be hydrated for layers with popupInfo
      expect(popupInfos).toEqual(expectedPopupInfos);
      // popupInfop should be set to {}
      expect(itemTemplate.data).toEqual(expectedData);
    });
  });

  describe("updateTemplate", () => {
    it("should handle error", () => {
      const settings: any = {};
      const createResponse: any = {
        serviceItemId: "DDDEEEFFF456",
        serviceurl: "http://test/FeatureServer",
        name: "TheService"
      };
      itemTemplate.itemId = "AAABBBCCC123";
      itemTemplate.item = {
        id: "{{AAABBBCCC123.id}}",
        url: "{{AAABBBCCC123.url}}"
      };

      const updatedTemplate: any = updateTemplate(
        itemTemplate,
        settings,
        createResponse
      );

      const expectedTemplate: any = {
        itemId: "DDDEEEFFF456",
        key: "",
        properties: {
          service: {},
          layers: [
            {
              fields: []
            }
          ],
          tables: []
        },
        type: "",
        item: {
          id: "DDDEEEFFF456",
          url: "http://test/FeatureServer"
        },
        data: {},
        resources: [],
        dependencies: [],
        estimatedDeploymentCostFactor: 0
      };

      const expectedSettings: any = {
        AAABBBCCC123: {
          id: "DDDEEEFFF456",
          url: "http://test/FeatureServer",
          name: "TheService"
        }
      };

      expect(updatedTemplate).toEqual(expectedTemplate);
      expect(settings).toEqual(expectedSettings);
    });
  });

  describe("getFieldSettings", () => {
    it("should handle fields NOT changed", () => {
      const fieldInfos: any = {
        "0": {
          newFields: [
            {
              name: "A"
            },
            {
              name: "B"
            },
            {
              name: "CreateDate"
            }
          ],
          sourceFields: [
            {
              name: "A"
            },
            {
              name: "B"
            },
            {
              name: "CreateDate"
            }
          ],
          otherProperty: {
            test: "test"
          },
          editFieldsInfo: {
            createDateField: "CreateDate"
          },
          newEditFieldsInfo: {
            createDateField: "CreateDate"
          },
          sourceSchemaChangesAllowed: true
        },
        "1": {
          newFields: [
            {
              name: "C"
            },
            {
              name: "D"
            },
            {
              name: "CreateDate"
            }
          ],
          sourceFields: [
            {
              name: "C"
            },
            {
              name: "D"
            },
            {
              name: "CreateDate"
            }
          ],
          otherProperty: {
            test: "test"
          },
          editFieldsInfo: {
            createDateField: "CreateDate"
          },
          newEditFieldsInfo: {
            createDateField: "CreateDate"
          },
          sourceSchemaChangesAllowed: true
        }
      };
      const expectedSettings: any = {
        layer0: {
          fields: {
            a: "A",
            b: "B",
            createdate: "CreateDate"
          }
        },
        layer1: {
          fields: {
            c: "C",
            d: "D",
            createdate: "CreateDate"
          }
        }
      };
      const expectedFieldInfos: any = {
        "0": {
          otherProperty: {
            test: "test"
          }
        },
        "1": {
          otherProperty: {
            test: "test"
          }
        }
      };
      const settings = getFieldSettings(fieldInfos);
      expect(fieldInfos).toEqual(expectedFieldInfos);
      expect(settings).toEqual(expectedSettings);
    });

    it("should handle fields changed", () => {
      const fieldInfos: any = {
        "0": {
          newFields: [
            {
              name: "a0",
              alias: "A_a"
            },
            {
              name: "b"
            },
            {
              name: "createdate"
            },
            {
              name: "create_date"
            },
            {
              name: "editdate"
            }
          ],
          sourceFields: [
            {
              name: "A",
              alias: "A_a"
            },
            {
              name: "B"
            },
            {
              name: "CreateDate"
            },
            {
              name: "EditDate"
            }
          ],
          otherProperty: {
            test: "test"
          },
          editFieldsInfo: {
            createDateField: "CreateDate",
            editDateField: "EditDate"
          },
          newEditFieldsInfo: {
            createDateField: "create_date",
            editDateField: "editdate"
          },
          sourceSchemaChangesAllowed: true
        },
        "1": {
          newFields: [
            {
              name: "c"
            },
            {
              name: "d"
            },
            {
              name: "createdate"
            },
            {
              name: "create_date"
            },
            {
              name: "editdate"
            }
          ],
          sourceFields: [
            {
              name: "C"
            },
            {
              name: "D"
            },
            {
              name: "CreateDate"
            },
            {
              name: "EditDate"
            }
          ],
          otherProperty: {
            test: "test"
          },
          editFieldsInfo: {
            createDateField: "CreateDate"
          },
          newEditFieldsInfo: {
            createDateField: "create_date",
            editDateField: "editdate"
          },
          sourceSchemaChangesAllowed: true
        }
      };
      const expectedSettings: any = {
        layer0: {
          fields: {
            a: "a0",
            b: "b",
            createdate: "create_date",
            editdate: "editdate"
          }
        },
        layer1: {
          fields: {
            c: "c",
            d: "d",
            createdate: "create_date",
            editdate: "editdate"
          }
        }
      };
      const expectedFieldInfos = {
        "0": {
          otherProperty: {
            test: "test"
          },
          deleteFields: [
            {
              name: "createdate"
            }
          ]
        },
        "1": {
          otherProperty: {
            test: "test"
          },
          deleteFields: [
            {
              name: "createdate"
            }
          ]
        }
      };
      const settings: any = getFieldSettings(fieldInfos);
      expect(fieldInfos).toEqual(expectedFieldInfos);
      expect(settings).toEqual(expectedSettings);
    });
  });

  describe("updateSettingsFieldInfos", () => {
    it("should transfer settings when dependencies exist", () => {
      const fieldInfos: any = {
        layer0: {
          fields: {
            objectid: "OBJECTID",
            jurisdictionname: "jurisdictionname",
            jurisdictiontype: "jurisdictiontype",
            regvoters: "regvoters",
            ballotscast: "ballotscast",
            ballotsnotcast: "ballotsnotcast",
            globalid: "GlobalID",
            creationdate: "CreationDate",
            creator: "Creator",
            editdate: "EditDate",
            editor: "Editor"
          }
        },
        layer1: {
          fields: {
            objectid: "OBJECTID",
            contest: "contest",
            category: "category",
            jurisdictionname: "jurisdictionname",
            candidate: "candidate",
            party: "party",
            numvotes: "numvotes",
            percvote: "percvote",
            globalid: "GlobalID",
            creationdate: "CreationDate",
            creator: "Creator",
            editdate: "EditDate",
            editor: "Editor"
          }
        }
      };

      const settings: any = {
        solutionName: "test",
        folderId: "4437cab3aa154f5f85fa35dca36ddccb",
        organization: {},
        isPortal: false,
        "0998341a7a2a4e9c86c553287a1f3e94": {
          id: "166657ce19f34c32846cd12022e2c33a",
          url: "",
          name: "ElectionResults_20190425_2018_51947",
          fieldInfos: fieldInfos
        },
        ab766cba0dd44ec080420acc10990282: {
          id: "ebe7e53cc218423c9225ceb783d412b5",
          url: "",
          name: "ElectionResults_join_20190425_2019_12456"
        }
      };

      itemTemplate = {
        itemId: "ebe7e53cc218423c9225ceb783d412b5",
        type: "Feature Service",
        key: "ixxi7v97b",
        item: {},
        dependencies: ["166657ce19f34c32846cd12022e2c33a"],
        estimatedDeploymentCostFactor: 5,
        data: {},
        resources: [],
        properties: {}
      };

      const expectedSettings: any = {
        solutionName: "test",
        folderId: "4437cab3aa154f5f85fa35dca36ddccb",
        organization: {},
        isPortal: false,
        "0998341a7a2a4e9c86c553287a1f3e94": {
          id: "166657ce19f34c32846cd12022e2c33a",
          url: "",
          name: "ElectionResults_20190425_2018_51947",
          fieldInfos: fieldInfos
        },
        ab766cba0dd44ec080420acc10990282: {
          id: "ebe7e53cc218423c9225ceb783d412b5",
          url: "",
          name: "ElectionResults_join_20190425_2019_12456",
          fieldInfos: fieldInfos
        }
      };

      // test that the settings transfer
      updateSettingsFieldInfos(itemTemplate, settings);
      expect(settings).toEqual(expectedSettings);
    });

    it("should NOT transfer settings when dependencies DO NOT exist", () => {
      const fieldInfos: any = {
        layer0: {
          fields: {
            objectid: "OBJECTID",
            jurisdictionname: "jurisdictionname",
            jurisdictiontype: "jurisdictiontype",
            regvoters: "regvoters",
            ballotscast: "ballotscast",
            ballotsnotcast: "ballotsnotcast",
            globalid: "GlobalID",
            creationdate: "CreationDate",
            creator: "Creator",
            editdate: "EditDate",
            editor: "Editor"
          }
        },
        layer1: {
          fields: {
            objectid: "OBJECTID",
            contest: "contest",
            category: "category",
            jurisdictionname: "jurisdictionname",
            candidate: "candidate",
            party: "party",
            numvotes: "numvotes",
            percvote: "percvote",
            globalid: "GlobalID",
            creationdate: "CreationDate",
            creator: "Creator",
            editdate: "EditDate",
            editor: "Editor"
          }
        }
      };

      const settings: any = {
        solutionName: "test",
        folderId: "4437cab3aa154f5f85fa35dca36ddccb",
        organization: {},
        isPortal: false,
        "0998341a7a2a4e9c86c553287a1f3e94": {
          id: "166657ce19f34c32846cd12022e2c33a",
          url: "",
          name: "ElectionResults_20190425_2018_51947",
          fieldInfos: fieldInfos
        },
        ab766cba0dd44ec080420acc10990282: {
          id: "ebe7e53cc218423c9225ceb783d412b5",
          url: "",
          name: "ElectionResults_join_20190425_2019_12456"
        }
      };

      itemTemplate = {
        itemId: "ebe7e53cc218423c9225ceb783d412b5",
        type: "Feature Service",
        key: "ixxi7v97b",
        item: {},
        dependencies: [],
        estimatedDeploymentCostFactor: 5,
        data: {},
        resources: [],
        properties: {}
      };

      const expectedSettings: any = {
        solutionName: "test",
        folderId: "4437cab3aa154f5f85fa35dca36ddccb",
        organization: {},
        isPortal: false,
        "0998341a7a2a4e9c86c553287a1f3e94": {
          id: "166657ce19f34c32846cd12022e2c33a",
          url: "",
          name: "ElectionResults_20190425_2018_51947",
          fieldInfos: fieldInfos
        },
        ab766cba0dd44ec080420acc10990282: {
          id: "ebe7e53cc218423c9225ceb783d412b5",
          url: "",
          name: "ElectionResults_join_20190425_2019_12456"
        }
      };

      updateSettingsFieldInfos(itemTemplate, settings);
      expect(settings).toEqual(expectedSettings);
    });
  });

  describe("deTemplatizeFieldInfos", () => {
    it("should detemplatize field references", () => {
      const fieldInfos: any = {
        "0": {
          displayField:
            "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.jurisdictionname}}",
          templates: [
            {
              prototype: {
                attributes: {
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.jurisdictionname}}": null,
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.jurisdictiontype}}": null,
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.regvoters}}": null,
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.ballotscast}}": null,
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.ballotsnotcast}}": null
                }
              }
            }
          ],
          relationships: [],
          drawingInfo: {
            renderer: {
              visualVariables: [
                {
                  field:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.percvote}}"
                }
              ],
              authoringInfo: {},
              type: "uniqueValue",
              field1:
                "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.party}}",
              defaultSymbol: {},
              uniqueValueInfos: []
            }
          },
          types: [
            {
              id: "-",
              name: "-",
              domains: {
                "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.jurisdictionname}}": {
                  type: "inherited"
                },
                "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.jurisdictiontype}}": {
                  type: "inherited"
                }
              },
              templates: [
                {
                  name: "-",
                  description: "",
                  drawingTool: "esriFeatureEditToolPoint",
                  prototype: {
                    attributes: {
                      "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.jurisdictionname}}": null,
                      "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.jurisdictiontype}}": null
                    }
                  }
                }
              ]
            }
          ],
          adminLayerInfo: [
            {
              name: "ElectionResults_1552494094382_join",
              sourceServiceName: "ElectionResults_20190425_2115_55512",
              sourceLayerId: 1,
              topFilter: {
                orderByFields:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.numvotes}} DESC",
                groupByFields:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.jurisdictionname}},{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.contest}}"
              },
              sourceLayerFields: [
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.contest}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.category}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.jurisdictionname}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.candidate}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.party}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.numvotes}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.percvote}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.globalid}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.creationdate}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.creator}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.editdate}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.editor}}"
                }
              ],
              parentKeyFields: [
                "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.jurisdictionname}}"
              ],
              keyFields: [
                "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.jurisdictionname}}"
              ]
            }
          ]
        },
        "1": {
          displayField:
            "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.jurisdictionname}}",
          templates: [],
          relationships: []
        }
      };

      const popupInfos: any = {
        layers: {
          "0": {
            title: "",
            fieldInfos: [
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.objectid}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.contest}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.category}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.jurisdictionname}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.jurisdictiontype}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.candidate}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.party}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.numvotes}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.percvote}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.regvoters}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.ballotscast}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.ballotsnotcast}}"
              },
              {
                fieldName: "expression/expr0"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.globalid}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.creationdate}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.creator}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.editdate}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.editor}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.jurisdictionname_1552494094382}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.globalid_1552494094382}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.creationdate_1552494094382}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.creator_1552494094382}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.editdate_1552494094382}}"
              },
              {
                fieldName:
                  "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.editor_1552494094382}}"
              }
            ],
            description:
              "<table cellpadding='0' style='text-align: center; border-collapse: collapse; border-spacing: 0px; width: 100%; table-layout: fixed; margin: 0px -1px'>\n\t<tbody>\n\t\t<tr>\n\t\t\t<td style='background-color: {expression/expr0}; color: #FFFFFF; min-width:0%; max-width:100%; width:initial; text-align:center; vertical-align: middle; font-weight: normal; padding: 5px 0px; font-size:14px'>{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.contest}}\n\t\t\t</td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td style='text-align: center; width: 50%; max-width: 100%; padding-left: 0px;'>\n\t\t\t<br /><b>{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.candidate}}</b> received the most votes in {{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.jurisdictionname}}.<br />\n\t\t\t</td>\n\t\t</tr>\n\t</tbody>\n\t</table>\n\t\n\t<table style='font-weight: normal; width: 100%; margin: 8px 0px; border-collapse: separate; border-spacing: 0px 8px; table-layout: fixed;'>\n\t<tbody>\n\t\t<tr>\n\t\t\t<td style='text-align: center; width: 100%; max-width: 100%; padding-left: 0px; padding-bottom: 10px'><b>Votes:</b><br /><font>{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.numvotes}}<br /></font></td>\n\t\t\t\n\t\t\t<td style='text-align: center; width: 100%; max-width: 100%; padding-left: 0px; padding-bottom: 10px'><font><b>Percent:</b><br />{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.percvote}}%\n\t\t\t</font></td>\n\t\t</tr>\n\t</tbody>\n</table>",
            expressionInfos: [
              {
                name: "expr0",
                title: "Banner Color",
                expression:
                  "if ($feature.{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.party}} == 'Constitution'){\n    return '#A900E6';\n}\nelse if ($feature.{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.party}} == 'Democratic'){\n    return '#244078';\n}\n    \nelse if ($feature.{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.party}} == 'Green'){\n    return '#17AA5C';\n}\n\nelse if ($feature.{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.party}} == 'Libertarian'){\n    return '#F9D334';\n}\n\nelse if ($feature.{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.party}} == 'Republican'){\n    return '#B0301C';\n}\n \nelse if ($feature.{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.party}} == 'Write In'){\n    return '#FFAA00';\n}\n    \nreturn '#D6D6D6';\n",
                returnType: "string"
              }
            ]
          }
        },
        tables: {}
      };

      const adminLayerInfos: any = {
        "0": {
          geometryField: {
            name: "ElectionResults_20190425_2115_55512.Shape"
          },
          viewLayerDefinition: {
            table: {
              sourceLayerId: 0,
              sourceLayerFields: [
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.jurisdictionname}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.jurisdictiontype}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.regvoters}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.ballotscast}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.ballotsnotcast}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.globalid}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.creationdate}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.creator}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.editdate}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.editor}}"
                }
              ],
              relatedTables: []
            }
          }
        },
        "1": {
          geometryField: null,
          viewLayerDefinition: {
            table: {
              name: "ElectionResults_1552493773603_target",
              sourceServiceName: "ElectionResults_20190425_2115_55512",
              sourceLayerId: 1,
              sourceLayerFields: [
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.contest}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.category}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.jurisdictionname}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.candidate}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.party}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.numvotes}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.percvote}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.globalid}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.creationdate}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.creator}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.editdate}}"
                },
                {
                  source:
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.editor}}"
                }
              ],
              relatedTables: [
                {
                  name: "ElectionResults_1552493773603_join",
                  sourceServiceName: "ElectionResults_20190425_2115_55512",
                  sourceLayerId: 0,
                  sourceLayerFields: [
                    {
                      source:
                        "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.jurisdictionname}}"
                    },
                    {
                      source:
                        "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.jurisdictiontype}}"
                    },
                    {
                      source:
                        "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.regvoters}}"
                    },
                    {
                      source:
                        "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.ballotscast}}"
                    },
                    {
                      source:
                        "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.ballotsnotcast}}"
                    },
                    {
                      source:
                        "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.globalid}}"
                    },
                    {
                      source:
                        "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.creationdate}}"
                    },
                    {
                      source:
                        "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.creator}}"
                    },
                    {
                      source:
                        "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.editdate}}"
                    },
                    {
                      source:
                        "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.editor}}"
                    }
                  ],
                  type: "INNER",
                  parentKeyFields: [
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer1.fields.jurisdictionname}}"
                  ],
                  keyFields: [
                    "{{ab766cba0dd44ec080420acc10990282.fieldInfos.layer0.fields.jurisdictionname}}"
                  ]
                }
              ]
            }
          }
        }
      };

      const settings: any = {
        solutionName: "test",
        isPortal: false,
        "0998341a7a2a4e9c86c553287a1f3e94": {
          id: "82ed3b6c2236429d885c872b3e188ead",
          name: "ElectionResults_20190425_2115_55512",
          fieldInfos: {
            layer0: {
              fields: {
                objectid: "OBJECTID",
                jurisdictionname: "jurisdictionname",
                jurisdictiontype: "jurisdictiontype",
                regvoters: "regvoters",
                ballotscast: "ballotscast",
                ballotsnotcast: "ballotsnotcast",
                globalid: "GlobalID",
                creationdate: "CreationDate",
                creator: "Creator",
                editdate: "EditDate",
                editor: "Editor"
              }
            },
            layer1: {
              fields: {
                objectid: "OBJECTID",
                contest: "contest",
                category: "category",
                jurisdictionname: "jurisdictionname",
                candidate: "candidate",
                party: "party",
                numvotes: "numvotes",
                percvote: "percvote",
                globalid: "GlobalID",
                creationdate: "CreationDate",
                creator: "Creator",
                editdate: "EditDate",
                editor: "Editor"
              }
            }
          }
        },
        ab766cba0dd44ec080420acc10990282: {
          id: "b3c3021ef3e5409dbb2a35c8f111d1de",
          fieldInfos: {
            layer0: {
              fields: {
                jurisdictionname: "jurisdictionname",
                jurisdictiontype: "jurisdictiontype",
                regvoters: "regvoters",
                ballotscast: "ballotscast",
                ballotsnotcast: "ballotsnotcast",
                globalid: "GlobalID",
                creationdate: "CreationDate",
                creator: "Creator",
                editdate: "EditDate",
                editor: "Editor",
                contest: "contest",
                category: "category",
                jurisdictionname_1552494094382:
                  "jurisdictionname_1552494094382",
                candidate: "candidate",
                party: "party",
                numvotes: "numvotes",
                percvote: "percvote",
                globalid_1552494094382: "GlobalID_1552494094382",
                creationdate_1552494094382: "CreationDate_1552494094382",
                creator_1552494094382: "Creator_1552494094382",
                editdate_1552494094382: "EditDate_1552494094382",
                editor_1552494094382: "Editor_1552494094382",
                objectid: "ObjectId"
              }
            },
            layer1: {
              fields: {
                contest: "contest",
                category: "category",
                jurisdictionname: "jurisdictionname",
                candidate: "candidate",
                party: "party",
                numvotes: "numvotes",
                percvote: "percvote",
                globalid: "GlobalID",
                creationdate: "CreationDate",
                creator: "Creator",
                editdate: "EditDate",
                editor: "Editor",
                jurisdictionname_1552493773603:
                  "jurisdictionname_1552493773603",
                jurisdictiontype: "jurisdictiontype",
                regvoters: "regvoters",
                ballotscast: "ballotscast",
                ballotsnotcast: "ballotsnotcast",
                globalid_1552493773603: "GlobalID_1552493773603",
                creationdate_1552493773603: "CreationDate_1552493773603",
                creator_1552493773603: "Creator_1552493773603",
                editdate_1552493773603: "EditDate_1552493773603",
                editor_1552493773603: "Editor_1552493773603",
                objectid: "ObjectId"
              }
            }
          }
        }
      };

      const expectedFieldInfos: any = {
        "0": {
          displayField: "jurisdictionname",
          templates: [
            {
              prototype: {
                attributes: {
                  jurisdictionname: null,
                  jurisdictiontype: null,
                  regvoters: null,
                  ballotscast: null,
                  ballotsnotcast: null
                }
              }
            }
          ],
          relationships: [],
          drawingInfo: {
            renderer: {
              visualVariables: [
                {
                  field: "percvote"
                }
              ],
              authoringInfo: {},
              type: "uniqueValue",
              field1: "party",
              defaultSymbol: {},
              uniqueValueInfos: []
            }
          },
          types: [
            {
              id: "-",
              name: "-",
              domains: {
                jurisdictionname: {
                  type: "inherited"
                },
                jurisdictiontype: {
                  type: "inherited"
                }
              },
              templates: [
                {
                  name: "-",
                  description: "",
                  drawingTool: "esriFeatureEditToolPoint",
                  prototype: {
                    attributes: {
                      jurisdictionname: null,
                      jurisdictiontype: null
                    }
                  }
                }
              ]
            }
          ]
        },
        "1": {
          displayField: "jurisdictionname",
          templates: [],
          relationships: []
        }
      };

      const expectedPopup: any = {
        layers: {
          "0": {
            title: "",
            fieldInfos: [
              {
                fieldName: "ObjectId"
              },
              {
                fieldName: "contest"
              },
              {
                fieldName: "category"
              },
              {
                fieldName: "jurisdictionname"
              },
              {
                fieldName: "jurisdictiontype"
              },
              {
                fieldName: "candidate"
              },
              {
                fieldName: "party"
              },
              {
                fieldName: "numvotes"
              },
              {
                fieldName: "percvote"
              },
              {
                fieldName: "regvoters"
              },
              {
                fieldName: "ballotscast"
              },
              {
                fieldName: "ballotsnotcast"
              },
              {
                fieldName: "expression/expr0"
              },
              {
                fieldName: "GlobalID"
              },
              {
                fieldName: "CreationDate"
              },
              {
                fieldName: "Creator"
              },
              {
                fieldName: "EditDate"
              },
              {
                fieldName: "Editor"
              },
              {
                fieldName: "jurisdictionname_1552494094382"
              },
              {
                fieldName: "GlobalID_1552494094382"
              },
              {
                fieldName: "CreationDate_1552494094382"
              },
              {
                fieldName: "Creator_1552494094382"
              },
              {
                fieldName: "EditDate_1552494094382"
              },
              {
                fieldName: "Editor_1552494094382"
              }
            ],
            description:
              "<table cellpadding='0' style='text-align: center; border-collapse: collapse; border-spacing: 0px; width: 100%; table-layout: fixed; margin: 0px -1px'>\n\t<tbody>\n\t\t<tr>\n\t\t\t<td style='background-color: {expression/expr0}; color: #FFFFFF; min-width:0%; max-width:100%; width:initial; text-align:center; vertical-align: middle; font-weight: normal; padding: 5px 0px; font-size:14px'>contest\n\t\t\t</td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td style='text-align: center; width: 50%; max-width: 100%; padding-left: 0px;'>\n\t\t\t<br /><b>candidate</b> received the most votes in jurisdictionname.<br />\n\t\t\t</td>\n\t\t</tr>\n\t</tbody>\n\t</table>\n\t\n\t<table style='font-weight: normal; width: 100%; margin: 8px 0px; border-collapse: separate; border-spacing: 0px 8px; table-layout: fixed;'>\n\t<tbody>\n\t\t<tr>\n\t\t\t<td style='text-align: center; width: 100%; max-width: 100%; padding-left: 0px; padding-bottom: 10px'><b>Votes:</b><br /><font>numvotes<br /></font></td>\n\t\t\t\n\t\t\t<td style='text-align: center; width: 100%; max-width: 100%; padding-left: 0px; padding-bottom: 10px'><font><b>Percent:</b><br />percvote%\n\t\t\t</font></td>\n\t\t</tr>\n\t</tbody>\n</table>",
            expressionInfos: [
              {
                name: "expr0",
                title: "Banner Color",
                expression:
                  "if ($feature.party == 'Constitution'){\n    return '#A900E6';\n}\nelse if ($feature.party == 'Democratic'){\n    return '#244078';\n}\n    \nelse if ($feature.party == 'Green'){\n    return '#17AA5C';\n}\n\nelse if ($feature.party == 'Libertarian'){\n    return '#F9D334';\n}\n\nelse if ($feature.party == 'Republican'){\n    return '#B0301C';\n}\n \nelse if ($feature.party == 'Write In'){\n    return '#FFAA00';\n}\n    \nreturn '#D6D6D6';\n",
                returnType: "string"
              }
            ]
          }
        },
        tables: {}
      };

      const expectedAdminLayerInfos: any = {
        "0": {
          geometryField: {
            name: "ElectionResults_20190425_2115_55512.Shape"
          },
          viewLayerDefinition: {
            table: {
              sourceLayerId: 0,
              sourceLayerFields: [
                {
                  source: "jurisdictionname"
                },
                {
                  source: "jurisdictiontype"
                },
                {
                  source: "regvoters"
                },
                {
                  source: "ballotscast"
                },
                {
                  source: "ballotsnotcast"
                },
                {
                  source: "GlobalID"
                },
                {
                  source: "CreationDate"
                },
                {
                  source: "Creator"
                },
                {
                  source: "EditDate"
                },
                {
                  source: "Editor"
                }
              ],
              relatedTables: [
                {
                  name: "ElectionResults_1552494094382_join",
                  sourceServiceName: "ElectionResults_20190425_2115_55512",
                  sourceLayerId: 1,
                  topFilter: {
                    orderByFields: "numvotes DESC",
                    groupByFields: "jurisdictionname,contest"
                  },
                  sourceLayerFields: [
                    {
                      source: "contest"
                    },
                    {
                      source: "category"
                    },
                    {
                      source: "jurisdictionname"
                    },
                    {
                      source: "candidate"
                    },
                    {
                      source: "party"
                    },
                    {
                      source: "numvotes"
                    },
                    {
                      source: "percvote"
                    },
                    {
                      source: "GlobalID"
                    },
                    {
                      source: "CreationDate"
                    },
                    {
                      source: "Creator"
                    },
                    {
                      source: "EditDate"
                    },
                    {
                      source: "Editor"
                    }
                  ],
                  parentKeyFields: ["jurisdictionname"],
                  keyFields: ["jurisdictionname"]
                }
              ]
            }
          }
        },
        "1": {
          geometryField: null,
          viewLayerDefinition: {
            table: {
              name: "ElectionResults_1552493773603_target",
              sourceServiceName: "ElectionResults_20190425_2115_55512",
              sourceLayerId: 1,
              sourceLayerFields: [
                {
                  source: "contest"
                },
                {
                  source: "category"
                },
                {
                  source: "jurisdictionname"
                },
                {
                  source: "candidate"
                },
                {
                  source: "party"
                },
                {
                  source: "numvotes"
                },
                {
                  source: "percvote"
                },
                {
                  source: "GlobalID"
                },
                {
                  source: "CreationDate"
                },
                {
                  source: "Creator"
                },
                {
                  source: "EditDate"
                },
                {
                  source: "Editor"
                }
              ],
              relatedTables: [
                {
                  name: "ElectionResults_1552493773603_join",
                  sourceServiceName: "ElectionResults_20190425_2115_55512",
                  sourceLayerId: 0,
                  sourceLayerFields: [
                    {
                      source: "jurisdictionname"
                    },
                    {
                      source: "jurisdictiontype"
                    },
                    {
                      source: "regvoters"
                    },
                    {
                      source: "ballotscast"
                    },
                    {
                      source: "ballotsnotcast"
                    },
                    {
                      source: "GlobalID"
                    },
                    {
                      source: "CreationDate"
                    },
                    {
                      source: "Creator"
                    },
                    {
                      source: "EditDate"
                    },
                    {
                      source: "Editor"
                    }
                  ],
                  type: "INNER",
                  parentKeyFields: ["jurisdictionname"],
                  keyFields: ["jurisdictionname"]
                }
              ]
            }
          }
        }
      };

      const results: any = deTemplatizeFieldInfos(
        fieldInfos,
        popupInfos,
        adminLayerInfos,
        settings
      );
      expect(results.fieldInfos).toEqual(expectedFieldInfos);
      expect(results.popupInfos).toEqual(expectedPopup);
      expect(results.adminLayerInfos).toEqual(expectedAdminLayerInfos);
    });
  });

  describe("getLayersAndTables", () => {
    it("should handle only layers", () => {
      itemTemplate.properties.layers = [
        {
          id: 0
        }
      ];
      const layersAndTables: any = getLayersAndTables(itemTemplate);
      const expecetd: any[] = [
        {
          item: {
            id: 0
          },
          type: "layer"
        }
      ];
      expect(layersAndTables).toEqual(expecetd);
    });

    it("should handle only tables", () => {
      itemTemplate.properties.layers = [];
      itemTemplate.properties.tables = [
        {
          id: 1
        }
      ];
      const layersAndTables: any = getLayersAndTables(itemTemplate);
      const expected: any[] = [
        {
          item: {
            id: 1
          },
          type: "table"
        }
      ];
      expect(layersAndTables).toEqual(expected);
    });

    it("should handle layers and tables", () => {
      itemTemplate.properties.layers = [
        {
          id: 0
        }
      ];
      itemTemplate.properties.tables = [
        {
          id: 1
        }
      ];
      const layersAndTables: any = getLayersAndTables(itemTemplate);
      const expected: any[] = [
        {
          item: {
            id: 0
          },
          type: "layer"
        },
        {
          item: {
            id: 1
          },
          type: "table"
        }
      ];
      expect(layersAndTables).toEqual(expected);
    });
  });

  describe("addFeatureServiceLayersAndTables", () => {
    it("should handle error", done => {
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
          mockItems.get400Failure()
        );

      addFeatureServiceLayersAndTables(
        itemTemplate,
        settings,
        {
          layers: [],
          tables: []
        },
        MOCK_USER_REQOPTS
      ).then(e => done.fail, done);
    });
  });

  describe("postProcessFields", () => {
    it("should update fieldInfos, settings, and layerInfos", done => {
      const url: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      itemTemplate = mockSolutions.getItemTemplatePart("Feature Service");
      itemTemplate.item.url = url;

      const settings = createMockSettings();
      settings.folderId = "fld1234567890";
      settings[itemTemplate.itemId] = {
        id: itemTemplate.itemId,
        url: url
      };

      expect(settings[itemTemplate.itemId]).toBeDefined();
      expect(settings[itemTemplate.itemId].fieldInfos).toBeUndefined();

      const layer0 = mockItems.getAGOLLayerOrTable(
        0,
        "ROW Permits",
        "Feature Layer",
        [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]
      );

      const layer1 = mockItems.getAGOLLayerOrTable(
        1,
        "ROW Permit Comment",
        "Table",
        [mockItems.createAGOLRelationship(0, 1, "esriRelRoleDestination")]
      );
      const fieldInfos = cacheFieldInfos(layer1, cacheFieldInfos(layer0, {}));

      Object.keys(fieldInfos).forEach(k => {
        fieldInfos[k].sourceFields[1].visible = false;
        fieldInfos[k].sourceFields[2].visible = false;
      });

      // modify the popupInfo with something to detemplatize
      const layer0Popup: any = itemTemplate.data.layers[0];
      layer0Popup.popupInfo.title =
        "{{" +
        itemTemplate.itemId +
        ".fieldInfos.layer" +
        layer0Popup.id +
        ".fields." +
        layer0.fields[0].name +
        "}}";

      const layer1Popup: any = itemTemplate.data.tables[0];
      layer1Popup.popupInfo.title =
        "{{" +
        itemTemplate.itemId +
        ".fieldInfos.layer" +
        layer1Popup.id +
        ".fields." +
        layer1.fields[0].name +
        "}}";

      const popupInfos: IPopupInfos = cachePopupInfos(itemTemplate.data);

      const requestOptions: IUserRequestOptions = {
        authentication: new UserSession({
          username: "jsmith",
          password: "123456"
        })
      };
      const adminLayerInfos: any = {};

      fetchMock
        .post(adminUrl + "/0?f=json", layer0)
        .post(adminUrl + "/1?f=json", layer1)
        .post(
          "https://www.arcgis.com/sharing/rest/generateToken",
          '{"token":"abc123"}'
        );

      postProcessFields(
        itemTemplate,
        fieldInfos,
        popupInfos,
        adminLayerInfos,
        settings,
        requestOptions
      ).then(
        (layerInfos: any) => {
          // verify that fieldInfos are set
          expect(layerInfos).toBeDefined();
          expect(layerInfos.fieldInfos).toBeDefined();

          // verify the fieldInfos have been added to settings
          expect(settings[itemTemplate.itemId].fieldInfos).toBeDefined();

          // verify popup infos
          expect(layerInfos.popupInfos).toBeDefined();
          expect(layerInfos.popupInfos.layers[layer0.id].title).toBeDefined();
          expect(layerInfos.popupInfos.layers[layer0.id].title).toEqual(
            layer0.fields[0].name
          );

          expect(layerInfos.popupInfos.tables[layer1.id].title).toBeDefined();
          expect(layerInfos.popupInfos.tables[layer1.id].title).toEqual(
            layer1.fields[0].name
          );

          expect(layerInfos.adminLayerInfos).toBeDefined();
          done();
        },
        error => done.fail(error)
      );
    });
  });

  describe("_getFieldVisibilityUpdates", () => {
    it("should not fail with undefined", () => {
      const fieldInfo: any = {};
      const fieldUpdates: any[] = _getFieldVisibilityUpdates(fieldInfo);
      expect(fieldUpdates).toEqual([]);
    });

    it("should not fail with empty fields", () => {
      const fieldInfo: any = {
        sourceFields: [],
        newFields: []
      };
      const fieldUpdates: any[] = _getFieldVisibilityUpdates(fieldInfo);
      expect(fieldUpdates).toEqual([]);
    });

    it("should find and difference in field visibility settings", () => {
      const fieldInfo: any = {
        sourceFields: [
          {
            name: "A",
            visible: true
          },
          {
            name: "B",
            visible: false
          },
          {
            name: "C",
            visible: true
          }
        ],
        newFields: [
          {
            name: "A",
            visible: true
          },
          {
            name: "B",
            visible: true
          },
          {
            name: "C",
            visible: true
          }
        ]
      };

      const expected: any[] = [
        {
          name: "B",
          visible: false
        }
      ];
      const fieldUpdates: any[] = _getFieldVisibilityUpdates(fieldInfo);
      expect(fieldUpdates).toEqual(expected);
    });
  });

  describe("updatePopupInfo", () => {
    it("should update popup with cached info", () => {
      const dataWithProp: any = {
        layers: [
          {
            id: 0
          },
          {
            id: 1,
            popupInfo: {
              someProperty: {}
            }
          }
        ],
        tables: [
          {
            id: 2
          },
          {
            id: 637,
            popupInfo: {
              someProperty: {}
            }
          }
        ]
      };
      // data with popupInfo without property on some
      const dataNoProp: any = {
        layers: [
          {
            id: 0
          },
          {
            id: 1,
            popupInfo: {}
          }
        ],
        tables: [
          {
            id: 2
          },
          {
            id: 637,
            popupInfo: {}
          }
        ]
      };

      // Test with popups
      itemTemplate = {
        itemId: "",
        key: "",
        properties: {
          service: {},
          layers: [
            {
              fields: []
            }
          ],
          tables: []
        },
        type: "",
        item: {
          text: {}
        },
        data: dataWithProp,
        resources: [],
        dependencies: [],
        estimatedDeploymentCostFactor: 0
      };

      const popupInfos = cachePopupInfos(itemTemplate.data);

      const expected: any = {
        layers: [
          {
            id: 0,
            popupInfo: {}
          },
          {
            id: 1,
            popupInfo: {
              someProperty: {}
            }
          }
        ],
        tables: [
          {
            id: 2,
            popupInfo: {}
          },
          {
            id: 637,
            popupInfo: {
              someProperty: {}
            }
          }
        ]
      };

      updatePopupInfo(itemTemplate, popupInfos);
      expect(itemTemplate.data).toEqual(expected);
    });
  });

  describe("_templatize", () => {
    it("should return a well formed template for a field reference", () => {
      const path: string = "fields.layer";
      let value: string = "name";
      let expectedV: string = "{{fields.layer.name}}";
      let v: string = _templatize(path, value);
      expect(v).toEqual(expectedV);

      value = "NAME"; // should be changed to all lowercase
      v = _templatize(path, value);
      expect(v).toEqual(expectedV);

      // should return the template if already templatized
      expectedV = v;
      value = v;
      v = _templatize(path, value);
      expect(v).toEqual(expectedV);
    });
  });

  describe("_templatizeProperty", () => {
    it("should templatize an object property", () => {
      const propName = "someProp";

      let obj: any;
      _templatizeProperty(obj, propName, basePath);
      expect(obj).toBeUndefined();

      obj = {};
      _templatizeProperty(obj, propName, basePath);
      expect(obj).toEqual({});

      obj[propName] = "NaMe";
      _templatizeProperty(obj, propName, basePath);
      expect(obj).toEqual({
        someProp: "{{" + basePath + ".name}}"
      });
    });
  });

  describe("_templatizeAdminLayerInfo", () => {
    it("should not fail without adminLayerInfo", () => {
      const layer: any = {};
      const dependencies: IDependency[] = [];

      const adminLayerInfo = _templatizeAdminLayerInfo(layer, dependencies);
      expect(adminLayerInfo).toEqual({});
    });

    it("should handle common adminLayerInfo", () => {
      const layer: any = {
        adminLayerInfo: {
          geometryField: {
            name: "Shape"
          },
          xssTrustedFields: [],
          tableName: "ABC",
          viewLayerDefinition: {
            sourceId: "4818",
            sourceServiceName: "SomeName",
            table: {
              sourceId: "4818_2",
              sourceServiceName: "SomeName",
              relatedTables: [
                {
                  sourceId: "4818_3",
                  sourceServiceName: "SomeName_3"
                }
              ]
            }
          }
        }
      };
      const dependencies: IDependency[] = [
        {
          id: "ab766cba0dd44ec080420acc10990282",
          name: "SomeName"
        },
        {
          id: "bc766cba0dd44ec080420acc10990282",
          name: "SomeName_3"
        }
      ];
      const expected: any = {
        geometryField: {
          name: "Shape"
        },
        viewLayerDefinition: {
          sourceServiceName: "{{ab766cba0dd44ec080420acc10990282.name}}",
          table: {
            sourceServiceName: "{{ab766cba0dd44ec080420acc10990282.name}}",
            relatedTables: [
              {
                sourceServiceName: "{{bc766cba0dd44ec080420acc10990282.name}}"
              }
            ]
          }
        }
      };

      const adminLayerInfo = _templatizeAdminLayerInfo(layer, dependencies);
      expect(adminLayerInfo).toEqual(expected);
    });

    it("should handle common adminLayerInfo with multiServiceView", () => {
      const layer: any = {
        isMultiServicesView: true,
        adminLayerInfo: {
          geometryField: {
            name: "Shape"
          },
          xssTrustedFields: [],
          tableName: "ABC",
          viewLayerDefinition: {
            sourceId: "4818",
            sourceServiceName: "SomeName",
            table: {
              sourceId: "4818_2",
              sourceServiceName: "SomeName",
              relatedTables: [
                {
                  sourceId: "4818_3",
                  sourceServiceName: "SomeName_3"
                }
              ]
            }
          }
        }
      };
      const dependencies: IDependency[] = [
        {
          id: "ab766cba0dd44ec080420acc10990282",
          name: "SomeName"
        },
        {
          id: "bc766cba0dd44ec080420acc10990282",
          name: "SomeName_3"
        }
      ];
      const expected: any = {
        geometryField: {
          name: "{{ab766cba0dd44ec080420acc10990282.name}}.Shape"
        },
        viewLayerDefinition: {
          sourceServiceName: "{{ab766cba0dd44ec080420acc10990282.name}}",
          table: {
            sourceServiceName: "{{ab766cba0dd44ec080420acc10990282.name}}",
            relatedTables: [
              {
                sourceServiceName: "{{bc766cba0dd44ec080420acc10990282.name}}"
              }
            ]
          }
        }
      };

      const adminLayerInfo = _templatizeAdminLayerInfo(layer, dependencies);
      expect(adminLayerInfo).toEqual(expected);
    });
  });

  describe("_processAdminObject", () => {
    it("should not fail when empty", () => {
      const object: any = {};
      const dependencies: IDependency[] = [];
      _processAdminObject(object, dependencies);
      expect(object).toEqual({});
      expect(dependencies).toEqual([]);
    });

    it("should handle sourceId", () => {
      const object: any = {
        sourceId: "4818"
      };
      const dependencies: any[] = [];
      _processAdminObject(object, dependencies);
      expect(object).toEqual({});
      expect(dependencies).toEqual([]);
    });

    it("should handle sourceServiceName and extra prop", () => {
      const object: any = {
        sourceId: "4818",
        otherProp: {},
        sourceServiceName: "SomeName"
      };
      const dependencies: any[] = [
        {
          id: "ab766cba0dd44ec080420acc10990282",
          name: "SomeName"
        }
      ];

      const expectedObject: any = {
        otherProp: {},
        sourceServiceName: "{{ab766cba0dd44ec080420acc10990282.name}}"
      };
      const expectedDependencies: any[] = [
        {
          id: "ab766cba0dd44ec080420acc10990282",
          name: "SomeName"
        }
      ];

      _processAdminObject(object, dependencies);
      expect(object).toEqual(expectedObject);
      expect(dependencies).toEqual(expectedDependencies);
    });
  });

  describe("_templatizeAdminLayerInfoFields", () => {
    it("should not fail with empty layer", () => {
      const layer: any = {};
      const dependencies: any[] = [];
      _templatizeAdminLayerInfoFields(layer, dependencies);
      expect(layer).toEqual({});
    });

    it("should templatize field source references and leave the name", () => {
      const layer = {
        adminLayerInfo: {
          viewLayerDefinition: {
            table: {
              sourceServiceName: "Table",
              sourceLayerId: 0,
              sourceLayerFields: [
                {
                  name: "A",
                  source: "A"
                },
                {
                  name: "B",
                  source: "B"
                }
              ]
            }
          }
        }
      };
      const dependencies = [
        {
          name: "Table",
          id: "cd766cba0dd44ec080420acc10990282"
        }
      ];

      const expected: any = {
        adminLayerInfo: {
          viewLayerDefinition: {
            table: {
              sourceServiceName: "Table",
              sourceLayerId: 0,
              sourceLayerFields: [
                {
                  name: "A",
                  source: "{{" + basePath + ".a}}"
                },
                {
                  name: "B",
                  source: "{{" + basePath + ".b}}"
                }
              ]
            }
          }
        }
      };

      _templatizeAdminLayerInfoFields(layer, dependencies);
      expect(layer).toEqual(expected);
    });

    it("should handle field in related tables", () => {
      const relatedBasePath: string = itemId + ".fieldInfos.layer1.fields";
      const layer = {
        adminLayerInfo: {
          viewLayerDefinition: {
            table: {
              sourceServiceName: "Table",
              sourceLayerId: 0,
              sourceLayerFields: [
                {
                  name: "A",
                  source: "A"
                },
                {
                  name: "B",
                  source: "B"
                }
              ],
              relatedTables: [
                {
                  sourceServiceName: "Table",
                  sourceLayerId: 1,
                  topFilter: {
                    orderByFields: "AA DESC",
                    groupByFields: "BB"
                  },
                  sourceLayerFields: [
                    {
                      name: "AA",
                      source: "AA"
                    },
                    {
                      name: "BB",
                      source: "BB"
                    }
                  ],
                  parentKeyFields: ["A"],
                  keyFields: ["AA"]
                }
              ]
            }
          }
        }
      };
      const dependencies = [
        {
          name: "Table",
          id: "cd766cba0dd44ec080420acc10990282"
        }
      ];

      const expected: any = {
        adminLayerInfo: {
          viewLayerDefinition: {
            table: {
              sourceServiceName: "Table",
              sourceLayerId: 0,
              sourceLayerFields: [
                {
                  name: "A",
                  source: "{{" + basePath + ".a}}"
                },
                {
                  name: "B",
                  source: "{{" + basePath + ".b}}"
                }
              ],
              relatedTables: [
                {
                  sourceServiceName: "Table",
                  sourceLayerId: 1,
                  topFilter: {
                    orderByFields: "{{" + relatedBasePath + ".aa}} DESC",
                    groupByFields: "{{" + relatedBasePath + ".bb}}"
                  },
                  sourceLayerFields: [
                    {
                      name: "AA",
                      source: "{{" + relatedBasePath + ".aa}}"
                    },
                    {
                      name: "BB",
                      source: "{{" + relatedBasePath + ".bb}}"
                    }
                  ],
                  parentKeyFields: ["{{" + basePath + ".a}}"],
                  keyFields: ["{{" + relatedBasePath + ".aa}}"]
                }
              ]
            }
          }
        }
      };

      _templatizeAdminLayerInfoFields(layer, dependencies);
      expect(layer).toEqual(expected);
    });
  });

  describe("_templatizeRelationshipFields", () => {
    it("should not fail with undefined layer", () => {
      const layer: any = undefined;
      _templatizeRelationshipFields(layer, itemId);
      expect(layer).toBeUndefined();
    });

    it("should not fail with no relationships", () => {
      const layer: any = {
        relationships: []
      };

      const expected: any = {
        relationships: []
      };

      _templatizeRelationshipFields(layer, itemId);
      expect(layer).toEqual(expected);
    });

    it("should templatize field references within relationships", () => {
      const id: string = "1";
      const layer: any = {
        id: "0",
        relationships: [
          {
            relatedTableId: id,
            keyField: "AA"
          }
        ]
      };
      const expected: any = {
        id: "0",
        relationships: [
          {
            relatedTableId: id,
            keyField: "{{" + itemId + ".fieldInfos.layer0.fields.aa}}"
          }
        ]
      };

      _templatizeRelationshipFields(layer, itemId);
      expect(layer).toEqual(expected);
    });
  });

  describe("_templatizePopupInfo", () => {
    it("should not fail with undefiend", () => {
      const layerDefinition: any = undefined;
      const layer: any = undefined;
      const fieldNames: any = undefined;
      _templatizePopupInfo(
        layerDefinition,
        layer,
        basePath,
        itemId,
        fieldNames
      );
      expect(layerDefinition).toBeUndefined();
      expect(layer).toBeUndefined();
      expect(fieldNames).toBeUndefined();
    });

    it("should not fail without popup", () => {
      const layerDefinition: any = {};
      const layer: any = {};
      const fieldNames: any = ["A", "B", "AA", "BB"];
      _templatizePopupInfo(
        layerDefinition,
        layer,
        basePath,
        itemId,
        fieldNames
      );
      expect(layerDefinition).toEqual({});
      expect(layer).toEqual({});
    });

    it("should handle popup in view layer", () => {
      const layerDefinition: any = {
        popupInfo: {
          title: "{A}",
          description: "",
          fieldInfos: [
            {
              fieldName: "relationships/0/AA",
              label: "AA",
              isEditable: false,
              visible: false,
              statisticType: "count",
              stringFieldOption: "textbox"
            },
            {
              fieldName: "A",
              label: "A",
              isEditable: false,
              visible: false,
              statisticType: "count",
              stringFieldOption: "textbox"
            },
            {
              fieldName: "expression/expr2",
              label: "A",
              isEditable: false,
              visible: false,
              statisticType: "count",
              stringFieldOption: "textbox"
            }
          ],
          expressionInfos: [
            {
              name: "expr1",
              title: "Population (Expr)",
              expression: "$feature.A",
              returnType: "number"
            },
            {
              name: "expr2",
              title: "Name (Abbr) (Expr)",
              expression: "$feature.A + ' (' + $feature.B + ')'",
              returnType: "string"
            }
          ],
          popupElements: [
            {
              type: "text",
              text: "Some descriptive text describing the popup."
            },
            {
              type: "fields",
              fieldInfos: [
                {
                  fieldName: "relationships/0/BB",
                  label: "Postcode",
                  isEditable: false,
                  visible: false,
                  statisticType: "count",
                  stringFieldOption: "textbox"
                }
              ]
            },
            {
              type: "media",
              mediaInfos: [
                {
                  title: "Chart stats",
                  type: "barchart",
                  caption: "For a better idea...",
                  value: {
                    fields: ["relationships/0/AA"],
                    tooltipField: "relationships/0/AA",
                    normalizeField: "AA"
                  }
                }
              ]
            },
            {
              type: "attachments",
              displayType: "list"
            }
          ],
          mediaInfos: [
            {
              title: "Chart stats",
              type: "barchart",
              caption: "For a better idea...",
              value: {
                fields: ["relationships/0/BB", "A"],
                tooltipField: "relationships/0/AA",
                normalizeField: "AA"
              }
            }
          ]
        }
      };

      const relatedTableId: string = "1";

      const layer: any = {
        isView: true,
        adminLayerInfo: {
          viewLayerDefinition: {
            table: {
              relatedTables: [
                {
                  sourceLayerId: relatedTableId
                }
              ]
            }
          }
        }
      };

      const fieldNames: string[] = ["A", "B"];

      const relatedBasePath =
        itemId + ".fieldInfos.layer" + relatedTableId + ".fields";

      const expectedLayerDef: any = {
        popupInfo: {
          title: "{{{" + basePath + ".a}}}",
          description: "",
          fieldInfos: [
            {
              fieldName: "relationships/0/{{" + relatedBasePath + ".aa}}",
              label: "AA",
              isEditable: false,
              visible: false,
              statisticType: "count",
              stringFieldOption: "textbox"
            },
            {
              fieldName: "{{" + basePath + ".a}}",
              label: "A",
              isEditable: false,
              visible: false,
              statisticType: "count",
              stringFieldOption: "textbox"
            },
            {
              fieldName: "expression/expr2",
              label: "A",
              isEditable: false,
              visible: false,
              statisticType: "count",
              stringFieldOption: "textbox"
            }
          ],
          expressionInfos: [
            {
              name: "expr1",
              title: "Population (Expr)",
              expression: "$feature.{{" + basePath + ".a}}",
              returnType: "number"
            },
            {
              name: "expr2",
              title: "Name (Abbr) (Expr)",
              expression:
                "$feature.{{" +
                basePath +
                ".a}} + ' (' + $feature.{{" +
                basePath +
                ".b}} + ')'",
              returnType: "string"
            }
          ],
          popupElements: [
            {
              type: "text",
              text: "Some descriptive text describing the popup."
            },
            {
              type: "fields",
              fieldInfos: [
                {
                  fieldName: "relationships/0/{{" + relatedBasePath + ".bb}}",
                  label: "Postcode",
                  isEditable: false,
                  visible: false,
                  statisticType: "count",
                  stringFieldOption: "textbox"
                }
              ]
            },
            {
              type: "media",
              mediaInfos: [
                {
                  title: "Chart stats",
                  type: "barchart",
                  caption: "For a better idea...",
                  value: {
                    fields: ["relationships/0/{{" + relatedBasePath + ".aa}}"],
                    tooltipField:
                      "relationships/0/{{" + relatedBasePath + ".aa}}",
                    normalizeField: "{{" + basePath + ".aa}}"
                  }
                }
              ]
            },
            {
              type: "attachments",
              displayType: "list"
            }
          ],
          mediaInfos: [
            {
              title: "Chart stats",
              type: "barchart",
              caption: "For a better idea...",
              value: {
                fields: [
                  "relationships/0/{{" + relatedBasePath + ".bb}}",
                  "{{" + basePath + ".a}}"
                ],
                tooltipField: "relationships/0/{{" + relatedBasePath + ".aa}}",
                normalizeField: "{{" + basePath + ".aa}}"
              }
            }
          ]
        }
      };

      const expectedLayer: any = {
        isView: true,
        adminLayerInfo: {
          viewLayerDefinition: {
            table: {
              relatedTables: [
                {
                  sourceLayerId: relatedTableId
                }
              ]
            }
          }
        }
      };

      const expectedFieldNames: string[] = ["A", "B"];

      _templatizePopupInfo(
        layerDefinition,
        layer,
        basePath,
        itemId,
        fieldNames
      );
      expect(layerDefinition).toEqual(expectedLayerDef);
      // should be untouched
      expect(layer).toEqual(expectedLayer);
      // should be untouched
      expect(fieldNames).toEqual(expectedFieldNames);
    });

    it("should handle popup when not a view", () => {
      const relatedTableId: string = "1";

      const relatedBasePath =
        itemId + ".fieldInfos.layer" + relatedTableId + ".fields";

      const layerDefinition: any = {
        popupInfo: {
          title: "{A}",
          description: "",
          fieldInfos: [
            {
              fieldName: "relationships/0/AA",
              label: "AA",
              isEditable: false,
              visible: false,
              statisticType: "count",
              stringFieldOption: "textbox"
            },
            {
              fieldName: "A",
              label: "A",
              isEditable: false,
              visible: false,
              statisticType: "count",
              stringFieldOption: "textbox"
            }
          ],
          expressionInfos: [
            {
              name: "expr1",
              title: "Population (Expr)",
              expression: "$feature.A",
              returnType: "number"
            },
            {
              name: "expr2",
              title: "Name (Abbr) (Expr)",
              expression: "$feature.A + ' (' + $feature.B + ')'",
              returnType: "string"
            }
          ],
          popupElements: [
            {
              type: "text",
              text: "Some descriptive text describing the popup."
            },
            {
              type: "fields",
              fieldInfos: [
                {
                  fieldName: "relationships/0/BB",
                  label: "Postcode",
                  isEditable: false,
                  visible: false,
                  statisticType: "count",
                  stringFieldOption: "textbox"
                }
              ]
            },
            {
              type: "media",
              mediaInfos: [
                {
                  title: "Chart stats",
                  type: "barchart",
                  caption: "For a better idea...",
                  value: {
                    fields: ["relationships/0/AA"],
                    tooltipField: "relationships/0/AA"
                  }
                }
              ]
            },
            {
              type: "attachments",
              displayType: "list"
            }
          ],
          mediaInfos: [
            {
              title: "Chart stats",
              type: "barchart",
              caption: "For a better idea...",
              value: {
                fields: ["relationships/0/BB", "A"],
                tooltipField: "relationships/0/AA"
              }
            }
          ]
        }
      };

      const layer: any = {
        isView: false,
        relationships: [
          {
            relatedTableId: relatedTableId
          }
        ]
      };

      const fieldNames: string[] = ["A", "B"];

      const expectedLayerDef: any = {
        popupInfo: {
          title: "{{{" + basePath + ".a}}}",
          description: "",
          fieldInfos: [
            {
              fieldName: "relationships/0/{{" + relatedBasePath + ".aa}}",
              label: "AA",
              isEditable: false,
              visible: false,
              statisticType: "count",
              stringFieldOption: "textbox"
            },
            {
              fieldName: "{{" + basePath + ".a}}",
              label: "A",
              isEditable: false,
              visible: false,
              statisticType: "count",
              stringFieldOption: "textbox"
            }
          ],
          expressionInfos: [
            {
              name: "expr1",
              title: "Population (Expr)",
              expression: "$feature.{{" + basePath + ".a}}",
              returnType: "number"
            },
            {
              name: "expr2",
              title: "Name (Abbr) (Expr)",
              expression:
                "$feature.{{" +
                basePath +
                ".a}} + ' (' + $feature.{{" +
                basePath +
                ".b}} + ')'",
              returnType: "string"
            }
          ],
          popupElements: [
            {
              type: "text",
              text: "Some descriptive text describing the popup."
            },
            {
              type: "fields",
              fieldInfos: [
                {
                  fieldName: "relationships/0/{{" + relatedBasePath + ".bb}}",
                  label: "Postcode",
                  isEditable: false,
                  visible: false,
                  statisticType: "count",
                  stringFieldOption: "textbox"
                }
              ]
            },
            {
              type: "media",
              mediaInfos: [
                {
                  title: "Chart stats",
                  type: "barchart",
                  caption: "For a better idea...",
                  value: {
                    fields: ["relationships/0/{{" + relatedBasePath + ".aa}}"],
                    tooltipField:
                      "relationships/0/{{" + relatedBasePath + ".aa}}"
                  }
                }
              ]
            },
            {
              type: "attachments",
              displayType: "list"
            }
          ],
          mediaInfos: [
            {
              title: "Chart stats",
              type: "barchart",
              caption: "For a better idea...",
              value: {
                fields: [
                  "relationships/0/{{" + relatedBasePath + ".bb}}",
                  "{{" + basePath + ".a}}"
                ],
                tooltipField: "relationships/0/{{" + relatedBasePath + ".aa}}"
              }
            }
          ]
        }
      };

      const expectedLayer: any = {
        isView: false,
        relationships: [
          {
            relatedTableId: relatedTableId
          }
        ]
      };

      _templatizePopupInfo(
        layerDefinition,
        layer,
        basePath,
        itemId,
        fieldNames
      );
      expect(layerDefinition).toEqual(expectedLayerDef);
      // should be untouched
      expect(layer).toEqual(expectedLayer);
    });
  });

  describe("_templatizeName", () => {
    it("should not fail when empty", () => {
      const obj: any = {};
      const prop: string = "";
      const fieldNames: string[] = ["A", "B", "C"];
      _templatizeName(obj, prop, fieldNames, basePath);
      expect(obj).toEqual({});
    });

    it("should handle value", () => {
      const obj: any = {
        propName: "SomeAwords and SomeBwords and A and B and C and stuff"
      };
      const prop: string = "propName";
      const fieldNames: string[] = ["A", "B", "C"];
      const expected: any = {
        propName:
          "SomeAwords and SomeBwords and {{" +
          basePath +
          ".a}} and {{" +
          basePath +
          ".b}} and {{" +
          basePath +
          ".c}} and stuff"
      };
      _templatizeName(obj, prop, fieldNames, basePath);
      expect(obj).toEqual(expected);
    });
  });

  describe("_templatizeDefinitionEditor", () => {
    it("should not fail with undefined layer", () => {
      const fieldNames: string[] = ["A", "B", "C"];
      const layer: any = undefined;
      _templatizeDefinitionEditor(layer, basePath, fieldNames);
      expect(layer).toBeUndefined();
    });

    it("should not fail without definitionEditor", () => {
      const fieldNames: string[] = ["A", "B", "C"];
      const layer: any = {};
      _templatizeDefinitionEditor(layer, basePath, fieldNames);
      expect(layer).toEqual({});
    });

    it("should not fail with empty definitionEditor", () => {
      const fieldNames: string[] = ["A", "B", "C"];
      const layer: any = {
        definitionEditor: {}
      };
      const expected: any = {
        definitionEditor: {}
      };
      _templatizeDefinitionEditor(layer, basePath, fieldNames);
      expect(layer).toEqual(expected);
    });

    it("should templatize field references in definitionEditor", () => {
      const fieldNames: string[] = ["A", "B", "C"];
      const layer: any = {
        definitionEditor: {
          parameterizedExpression:
            "A BETWEEN {0} AND {1} or B = 23 or C LIKE '{2}%'",
          inputs: [
            {
              hint: "Enter square miles.",
              prompt: "Area between",
              parameters: [
                {
                  type: "esriFieldTypeInteger",
                  fieldName: "A",
                  parameterId: 0,
                  defaultValue: 10
                },
                {
                  type: "esriFieldTypeInteger",
                  fieldName: "B",
                  parameterId: 1,
                  defaultValue: 100
                }
              ]
            },
            {
              hint: "Enter your name.",
              prompt: "Name starts with",
              parameters: [
                {
                  type: "esriFieldTypeString",
                  fieldName: "C",
                  parameterId: 2,
                  defaultValue: "Jack"
                }
              ]
            }
          ]
        }
      };

      const expected: any = {
        definitionEditor: {
          parameterizedExpression:
            "{{" +
            basePath +
            ".a}} BETWEEN {0} AND {1} or {{" +
            basePath +
            ".b}} = 23 or {{" +
            basePath +
            ".c}} LIKE '{2}%'",
          inputs: [
            {
              hint: "Enter square miles.",
              prompt: "Area between",
              parameters: [
                {
                  type: "esriFieldTypeInteger",
                  fieldName: "{{" + basePath + ".a}}",
                  parameterId: 0,
                  defaultValue: 10
                },
                {
                  type: "esriFieldTypeInteger",
                  fieldName: "{{" + basePath + ".b}}",
                  parameterId: 1,
                  defaultValue: 100
                }
              ]
            },
            {
              hint: "Enter your name.",
              prompt: "Name starts with",
              parameters: [
                {
                  type: "esriFieldTypeString",
                  fieldName: "{{" + basePath + ".c}}",
                  parameterId: 2,
                  defaultValue: "Jack"
                }
              ]
            }
          ]
        }
      };

      _templatizeDefinitionEditor(layer, basePath, fieldNames);
      expect(layer).toEqual(expected);
    });
  });

  describe("_templatizeDefinitionExpression", () => {
    it("should not fail with undefined", () => {
      const fieldNames: any[] = ["A", "B", "C"];
      const layer: any = undefined;
      _templatizeDefinitionExpression(layer, basePath, fieldNames);
      expect(layer).toBeUndefined();
    });

    it("should not fail without definitionExpression", () => {
      const fieldNames: any[] = ["A", "B", "C"];
      const layer: any = {};
      const expected: any = {};
      _templatizeDefinitionExpression(layer, basePath, fieldNames);
      expect(layer).toEqual(expected);
    });

    it("should not fail with empty definitionExpression", () => {
      const fieldNames: any[] = ["A", "B", "C"];
      const layer: any = {
        definitionExpression: ""
      };
      const expected: any = {
        definitionExpression: ""
      };

      _templatizeDefinitionExpression(layer, basePath, fieldNames);
      expect(layer).toEqual(expected);
    });

    it("should templatize field references within definitionExpression", () => {
      const fieldNames: any[] = ["A", "B", "C"];
      const layer: any = {
        definitionExpression: "A IS ABC AND B LIKE C"
      };
      const expected: any = {
        definitionExpression:
          "{{" +
          basePath +
          ".a}} IS ABC AND {{" +
          basePath +
          ".b}} LIKE {{" +
          basePath +
          ".c}}"
      };
      _templatizeDefinitionExpression(layer, basePath, fieldNames);
      expect(layer).toEqual(expected);
    });
  });

  describe("_templatizeSimpleName", () => {
    it("should not fail with undefined", () => {
      const fieldNames: any[] = ["A", "B", "C", "D"];
      let expression;
      expression = _templatizeSimpleName(expression, basePath, fieldNames);
      expect(expression).toBeUndefined();
    });

    it("should not fail with empty expression", () => {
      const fieldNames: any[] = ["A", "B", "C", "D"];
      let expression: string = "";
      expression = _templatizeSimpleName(expression, basePath, fieldNames);
      expect(expression).toEqual("");
    });

    it("should templatize field references in an expression", () => {
      const fieldNames: any[] = ["A", "B", "C", "D"];

      // test case in expression
      let expression =
        "(a LIKE b AND c LIKE d) AND (A LIKE B AND C LIKE D SOMEOTHERABC)";
      expression = _templatizeSimpleName(expression, basePath, fieldNames);
      expect(expression).toEqual(
        "(a LIKE b AND c LIKE d) AND ({{" +
          basePath +
          ".a}} LIKE {{" +
          basePath +
          ".b}} AND {{" +
          basePath +
          ".c}} LIKE {{" +
          basePath +
          ".d}} SOMEOTHERABC)"
      );
    });
  });

  describe("_templatizeDrawingInfo", () => {
    it("should not fail with undefined", () => {
      const fieldNames: any[] = [
        "POPULATION",
        "TEST",
        "POP10_CY",
        "POP20_CY",
        "POP30_CY",
        "POP40_CY",
        "POP50_CY",
        "POP60_CY",
        "Inclination"
      ];

      const layer: any = undefined;
      _templatizeDrawingInfo(layer, basePath, fieldNames);
      expect(layer).toBeUndefined();
    });

    it("should not fail with empty drawingInfo", () => {
      const fieldNames: any[] = [
        "POPULATION",
        "TEST",
        "POP10_CY",
        "POP20_CY",
        "POP30_CY",
        "POP40_CY",
        "POP50_CY",
        "POP60_CY",
        "Inclination"
      ];
      const layer: any = { drawingInfo: {} };
      const expected: any = { drawingInfo: {} };
      _templatizeDrawingInfo(layer, basePath, fieldNames);
      expect(layer).toEqual(expected);
    });

    it("should handle classBreaks", () => {
      const fieldNames: any[] = [
        "POPULATION",
        "TEST",
        "POP10_CY",
        "POP20_CY",
        "POP30_CY",
        "POP40_CY",
        "POP50_CY",
        "POP60_CY",
        "Inclination"
      ];

      const layer: any = {
        drawingInfo: {
          renderer: {
            visualVariables: [
              {
                type: "colorInfo",
                field: "POPULATION",
                stops: []
              }
            ],
            type: "classBreaks",
            field: "POPULATION",
            minValue: -9007199254740991,
            classBreakInfos: []
          }
        }
      };

      const expected: any = {
        drawingInfo: {
          renderer: {
            visualVariables: [
              {
                type: "colorInfo",
                field: "{{" + basePath + ".population}}",
                stops: []
              }
            ],
            type: "classBreaks",
            field: "{{" + basePath + ".population}}",
            minValue: -9007199254740991,
            classBreakInfos: []
          }
        }
      };

      _templatizeDrawingInfo(layer, basePath, fieldNames);
      expect(layer).toEqual(expected);
    });

    it("should handle heatMap", () => {
      const fieldNames: any[] = [
        "POPULATION",
        "TEST",
        "POP10_CY",
        "POP20_CY",
        "POP30_CY",
        "POP40_CY",
        "POP50_CY",
        "POP60_CY",
        "Inclination"
      ];

      const layer: any = {
        drawingInfo: {
          renderer: {
            type: "heatmap",
            blurRadius: 10,
            colorStops: [],
            field: "TEST",
            maxPixelIntensity: 1249.2897582229123,
            minPixelIntensity: 0
          }
        }
      };

      const expected: any = {
        drawingInfo: {
          renderer: {
            type: "heatmap",
            blurRadius: 10,
            colorStops: [],
            field: "{{" + basePath + ".test}}",
            maxPixelIntensity: 1249.2897582229123,
            minPixelIntensity: 0
          }
        }
      };

      _templatizeDrawingInfo(layer, basePath, fieldNames);
      expect(layer).toEqual(expected);
    });

    it("should handle predominance", () => {
      const fieldNames: any[] = [
        "POPULATION",
        "TEST",
        "POP10_CY",
        "POP20_CY",
        "POP30_CY",
        "POP40_CY",
        "POP50_CY",
        "POP60_CY",
        "Inclination"
      ];

      const layer: any = {
        drawingInfo: {
          renderer: {
            visualVariables: [
              {
                type: "transparencyInfo",
                valueExpression:
                  'var fieldNames = ["POP10_CY", "POP40_CY", "POP60_CY", "POP20_CY", "POP30_CY"];\nvar numFields = 5;\nvar maxValueField = null;\nvar maxValue = -Infinity;\nvar value, i, totalValue = null;\nfor(i = 0; i < numFields; i++) {\nvalue = $feature[fieldNames[i]];\nif(value > 0) {\nif(value > maxValue) {\nmaxValue = value;\nmaxValueField = fieldNames[i];\n}\nelse if (value == maxValue) {\nmaxValueField = null;\n}\n}\nif(value != null && value >= 0) {\nif (totalValue == null) { totalValue = 0; }\ntotalValue = totalValue + value;\n}\n}\nvar strength = null;\nif (maxValueField != null && totalValue > 0) {\nstrength = (maxValue / totalValue) * 100;\n}\nreturn strength;',
                stops: [],
                legendOptions: {}
              },
              {
                type: "sizeInfo",
                target: "outline",
                expression: "view.scale",
                stops: []
              }
            ],
            authoringInfo: {
              type: "predominance",
              fields: [
                "POP10_CY",
                "POP40_CY",
                "POP60_CY",
                "POP20_CY",
                "POP30_CY"
              ],
              visualVariables: { endTime: "POP30_CY" }
            },
            type: "uniqueValue",
            valueExpression:
              'var fieldNames = ["POP10_CY", "POP40_CY", "POP60_CY", "POP20_CY", "POP30_CY"];\nvar numFields = 5;\nvar maxValueField = null;\nvar maxValue = -Infinity;\nvar value, i, totalValue = null;\nfor(i = 0; i < numFields; i++) {\nvalue = $feature[fieldNames[i]];\nif(value > 0) {\nif(value > maxValue) {\nmaxValue = value;\nmaxValueField = fieldNames[i];\n}\nelse if (value == maxValue) {\nmaxValueField = null;\n}\n}\n}\nreturn maxValueField;',
            uniqueValueInfos: []
          }
        }
      };

      const expected: any = {
        drawingInfo: {
          renderer: {
            visualVariables: [
              {
                type: "transparencyInfo",
                valueExpression:
                  'var fieldNames = ["{{' +
                  basePath +
                  '.pop10_cy}}", "{{' +
                  basePath +
                  '.pop40_cy}}", "{{' +
                  basePath +
                  '.pop60_cy}}", "{{' +
                  basePath +
                  '.pop20_cy}}", "{{' +
                  basePath +
                  '.pop30_cy}}"];\nvar numFields = 5;\nvar maxValueField = null;\nvar maxValue = -Infinity;\nvar value, i, totalValue = null;\nfor(i = 0; i < numFields; i++) {\nvalue = $feature[fieldNames[i]];\nif(value > 0) {\nif(value > maxValue) {\nmaxValue = value;\nmaxValueField = fieldNames[i];\n}\nelse if (value == maxValue) {\nmaxValueField = null;\n}\n}\nif(value != null && value >= 0) {\nif (totalValue == null) { totalValue = 0; }\ntotalValue = totalValue + value;\n}\n}\nvar strength = null;\nif (maxValueField != null && totalValue > 0) {\nstrength = (maxValue / totalValue) * 100;\n}\nreturn strength;',
                stops: [],
                legendOptions: {}
              },
              {
                type: "sizeInfo",
                target: "outline",
                expression: "view.scale",
                stops: []
              }
            ],
            authoringInfo: {
              type: "predominance",
              fields: [
                "{{" + basePath + ".pop10_cy}}",
                "{{" + basePath + ".pop40_cy}}",
                "{{" + basePath + ".pop60_cy}}",
                "{{" + basePath + ".pop20_cy}}",
                "{{" + basePath + ".pop30_cy}}"
              ],
              visualVariables: {
                endTime: "{{" + basePath + ".pop30_cy}}"
              }
            },
            type: "uniqueValue",
            valueExpression:
              'var fieldNames = ["{{' +
              basePath +
              '.pop10_cy}}", "{{' +
              basePath +
              '.pop40_cy}}", "{{' +
              basePath +
              '.pop60_cy}}", "{{' +
              basePath +
              '.pop20_cy}}", "{{' +
              basePath +
              '.pop30_cy}}"];\nvar numFields = 5;\nvar maxValueField = null;\nvar maxValue = -Infinity;\nvar value, i, totalValue = null;\nfor(i = 0; i < numFields; i++) {\nvalue = $feature[fieldNames[i]];\nif(value > 0) {\nif(value > maxValue) {\nmaxValue = value;\nmaxValueField = fieldNames[i];\n}\nelse if (value == maxValue) {\nmaxValueField = null;\n}\n}\n}\nreturn maxValueField;',
            uniqueValueInfos: []
          }
        }
      };

      _templatizeDrawingInfo(layer, basePath, fieldNames);
      expect(layer).toEqual(expected);
    });

    it("should handle simple", () => {
      const fieldNames: any[] = [
        "POPULATION",
        "TEST",
        "POP10_CY",
        "POP20_CY",
        "POP30_CY",
        "POP40_CY",
        "POP50_CY",
        "POP60_CY",
        "Inclination"
      ];

      const layer: any = {
        drawingInfo: {
          renderer: {
            type: "simple",
            rotationExpression: "[TEST]",
            symbol: {}
          }
        }
      };

      const expected: any = {
        drawingInfo: {
          renderer: {
            type: "simple",
            rotationExpression: "[{{" + basePath + ".test}}]",
            symbol: {}
          }
        }
      };

      _templatizeDrawingInfo(layer, basePath, fieldNames);
      expect(layer).toEqual(expected);
    });

    it("should handle temporal", () => {
      const fieldNames: any[] = [
        "POPULATION",
        "TEST",
        "POP10_CY",
        "POP20_CY",
        "POP30_CY",
        "POP40_CY",
        "POP50_CY",
        "POP60_CY",
        "Inclination"
      ];

      const layer: any = {
        drawingInfo: {
          renderer: {
            type: "temporal",
            observationRenderer: {
              visualVariables: [
                {
                  field: "Inclination",
                  rotationType: "geographic",
                  type: "rotationInfo"
                }
              ],
              type: "simple",
              symbol: {}
            },
            latestObservationRenderer: {
              visualVariables: [
                {
                  field: "Inclination",
                  rotationType: "geographic",
                  type: "rotationInfo"
                }
              ],
              type: "simple",
              symbol: {}
            },
            trackRenderer: {
              type: "simple",
              symbol: {}
            }
          }
        }
      };

      const expected: any = {
        drawingInfo: {
          renderer: {
            type: "temporal",
            observationRenderer: {
              visualVariables: [
                {
                  field: "{{" + basePath + ".inclination}}",
                  rotationType: "geographic",
                  type: "rotationInfo"
                }
              ],
              type: "simple",
              symbol: {}
            },
            latestObservationRenderer: {
              visualVariables: [
                {
                  field: "{{" + basePath + ".inclination}}",
                  rotationType: "geographic",
                  type: "rotationInfo"
                }
              ],
              type: "simple",
              symbol: {}
            },
            trackRenderer: {
              type: "simple",
              symbol: {}
            }
          }
        }
      };

      _templatizeDrawingInfo(layer, basePath, fieldNames);
      expect(layer).toEqual(expected);
    });

    it("should handle uniqueValue", () => {
      const fieldNames: any[] = [
        "POPULATION",
        "TEST",
        "POP10_CY",
        "POP20_CY",
        "POP30_CY",
        "POP40_CY",
        "POP50_CY",
        "POP60_CY",
        "Inclination"
      ];

      const layer: any = {
        drawingInfo: {
          renderer: {
            type: "uniqueValue",
            field1: "COUNTRY",
            uniqueValueInfos: []
          }
        }
      };

      const expected: any = {
        drawingInfo: {
          renderer: {
            type: "uniqueValue",
            field1: "{{" + basePath + ".country}}",
            uniqueValueInfos: []
          }
        }
      };

      _templatizeDrawingInfo(layer, basePath, fieldNames);
      expect(layer).toEqual(expected);
    });
  });

  describe("_templatizeArcadeExpressions", () => {
    it("should not fail with undefined text", () => {
      let text: string;
      text = _templatizeArcadeExpressions(text, "", basePath);
      expect(text).toBeUndefined();
    });

    it("should not fail with empty text", () => {
      let text = "";
      text = _templatizeArcadeExpressions(text, "", basePath);
      expect(text).toEqual("");
    });

    it("should handle $feature. notation", () => {
      const fieldNames: string[] = ["POP_16UP", "EMP_CY", "POP_16UP"];
      let text: string =
        "Round((($feature.POP_16UP - $feature.EMP_CY)/$feature.POP_16UP)*100,2) + '%'";
      let expected: string =
        "Round((($feature.{{" +
        basePath +
        ".pop_16up}} - $feature.{{" +
        basePath +
        ".emp_cy}})/$feature.{{" +
        basePath +
        ".pop_16up}})*100,2) + '%'";

      fieldNames.forEach((name: string) => {
        text = _templatizeArcadeExpressions(text, name, basePath);
      });
      expect(text).toEqual(expected);

      // when already templatized nothing else should happen
      text =
        "Round((($feature.{{" +
        basePath +
        ".pop_16up}} - $feature.{{" +
        basePath +
        ".emp_cy}})/$feature.{{" +
        basePath +
        ".pop_16up}})*100,2) + '%'";

      expected =
        "Round((($feature.{{" +
        basePath +
        ".pop_16up}} - $feature.{{" +
        basePath +
        ".emp_cy}})/$feature.{{" +
        basePath +
        ".pop_16up}})*100,2) + '%'";

      fieldNames.forEach((name: string) => {
        text = _templatizeArcadeExpressions(text, name, basePath);
      });
      expect(text).toEqual(expected);
    });

    it("should handle $feature[] notation", () => {
      const fieldNames: string[] = ["POP_16UP", "EMP_CY", "POP_16UP"];
      let text: string = '$feature["EMP_CY"]';
      fieldNames.forEach((name: string) => {
        text = _templatizeArcadeExpressions(text, name, basePath);
      });
      expect(text).toEqual('$feature["{{' + basePath + '.emp_cy}}"]');

      text = "$feature['EMP_CY']";
      fieldNames.forEach((name: string) => {
        text = _templatizeArcadeExpressions(text, name, basePath);
      });
      expect(text).toEqual("$feature['{{" + basePath + ".emp_cy}}']");
    });

    it("should handle $feature[] notation with join", () => {
      const fieldNames: string[] = ["POP_16UP", "EMP_CY", "POP_16UP"];
      let text: string = '$feature["COUNTY_ID.EMP_CY"]';
      fieldNames.forEach((name: string) => {
        text = _templatizeArcadeExpressions(text, name, basePath);
      });
      expect(text).toEqual('$feature["COUNTY_ID.{{' + basePath + '.emp_cy}}"]');

      text = "$feature['COUNTY_ID.EMP_CY']";
      fieldNames.forEach((name: string) => {
        text = _templatizeArcadeExpressions(text, name, basePath);
      });
      expect(text).toEqual("$feature['COUNTY_ID.{{" + basePath + ".emp_cy}}']");
    });

    it('should handle "fieldName" notation', () => {
      const fieldNames: string[] = ["POP_16UP", "EMP_CY", "POP_16UP"];
      let text: any = 'var names = ["EMP_CY"]';
      fieldNames.forEach((name: string) => {
        text = _templatizeArcadeExpressions(text, name, basePath);
      });
      expect(text).toEqual('var names = ["{{' + basePath + '.emp_cy}}"]');

      text = "var names = ['EMP_CY']";
      fieldNames.forEach((name: string) => {
        text = _templatizeArcadeExpressions(text, name, basePath);
      });
      expect(text).toEqual("var names = ['{{" + basePath + ".emp_cy}}']");

      text = 'var names = [ "EMP_CY", "POP_16UP" ]';
      fieldNames.forEach((name: string) => {
        text = _templatizeArcadeExpressions(text, name, basePath);
      });
      expect(text).toEqual(
        'var names = [ "{{' +
          basePath +
          '.emp_cy}}", "{{' +
          basePath +
          '.pop_16up}}" ]'
      );

      text = "var names = [ 'EMP_CY', 'POP_16UP' ]";
      fieldNames.forEach((name: string) => {
        text = _templatizeArcadeExpressions(text, name, basePath);
      });
      expect(text).toEqual(
        "var names = [ '{{" +
          basePath +
          ".emp_cy}}', '{{" +
          basePath +
          ".pop_16up}}' ]"
      );
    });
  });

  describe("_templatizeLabelingInfo", () => {
    it("should not fail without labelingInfo", () => {
      const fieldNames: any[] = ["Description", "STATE_NAME", "ACRES"];

      // test without
      const labelingInfo: any[] = [];
      _templatizeLabelingInfo(labelingInfo, basePath, fieldNames);
      expect(labelingInfo).toEqual([]);
    });

    it("should templatize field references in labelingInfo", () => {
      const fieldNames: any[] = ["Description", "STATE_NAME", "ACRES"];
      const labelingInfo: any[] = [
        {
          labelExpression: "[Description]",
          labelExpressionInfo: {
            value: 'return $feature["STATE_NAME"] + " (arcade)";',
            expression: 'return $feature["STATE_NAME"] + " (arcade)";'
          },
          fieldInfos: [
            {
              fieldName: "ACRES",
              format: {
                places: 2,
                digitSeparator: true
              }
            }
          ],
          useCodedValues: false,
          maxScale: 0,
          minScale: 0,
          labelPlacement: "esriServerPointLabelPlacementAboveLeft",
          symbol: {}
        }
      ];

      const expected: any[] = [
        {
          labelExpression: "[{{" + basePath + ".description}}]",
          labelExpressionInfo: {
            value:
              'return $feature["{{' +
              basePath +
              '.state_name}}"] + " (arcade)";',
            expression:
              'return $feature["{{' +
              basePath +
              '.state_name}}"] + " (arcade)";'
          },
          fieldInfos: [
            {
              fieldName: "{{" + basePath + ".acres}}",
              format: {
                places: 2,
                digitSeparator: true
              }
            }
          ],
          useCodedValues: false,
          maxScale: 0,
          minScale: 0,
          labelPlacement: "esriServerPointLabelPlacementAboveLeft",
          symbol: {}
        }
      ];

      _templatizeLabelingInfo(labelingInfo, basePath, fieldNames);
      expect(labelingInfo).toEqual(expected);
    });
  });

  describe("_templatizeTemplates", () => {
    it("should not fail with undefined templates", () => {
      const layer: any = {};
      _templatizeTemplates(layer, basePath);
      expect(layer).toEqual({});
    });

    it("should templatize object keys in templates", () => {
      const layer: any = {
        templates: [
          {
            prototype: {
              attributes: {
                A: null,
                B: null
              }
            }
          }
        ]
      };

      const expected: any = {
        templates: [
          {
            prototype: {
              attributes: {}
            }
          }
        ]
      };
      expected.templates[0].prototype.attributes[
        "{{" + basePath + ".a}}"
      ] = null;
      expected.templates[0].prototype.attributes[
        "{{" + basePath + ".b}}"
      ] = null;

      _templatizeTemplates(layer, basePath);
      expect(layer).toEqual(expected);
    });
  });

  describe("_templatizeTypeTemplates", () => {
    it("should not fail without typeTemplates", () => {
      const path: string = "fields.layer";
      const layer: any = {};
      const expectedLayer: any = {};
      _templatizeTypeTemplates(layer, path);
      expect(layer).toEqual(expectedLayer);
    });

    it("should templatize field references in typeTemplates", () => {
      const path: string = "fields.layer";

      const layer: any = {
        types: [
          {
            domains: {
              A: "A",
              B: "B"
            },
            templates: [
              {
                prototype: {
                  attributes: {
                    A: "A",
                    B: "B"
                  }
                }
              }
            ]
          }
        ]
      };
      const expectedDomains: any = {};
      expectedDomains["{{" + path + ".a}}"] = "A";
      expectedDomains["{{" + path + ".b}}"] = "B";
      const expectedTemplates: any = {};
      expectedTemplates["{{" + path + ".a}}"] = "A";
      expectedTemplates["{{" + path + ".b}}"] = "B";
      const expectedLayer: any = {
        types: [
          {
            domains: expectedDomains,
            templates: [
              {
                prototype: {
                  attributes: expectedTemplates
                }
              }
            ]
          }
        ]
      };
      _templatizeTypeTemplates(layer, path);
      expect(layer).toEqual(expectedLayer);
    });
  });

  describe("_templatizeTimeInfo", () => {
    it("should not fail without timeInfo", () => {
      const path: string = "fields.layer";
      const layer: any = {};
      const expected: any = {};
      _templatizeTimeInfo(layer, path);
      expect(layer).toEqual(expected);
    });

    it("should not fail without field references", () => {
      const path: string = "fields.layer";
      const layer: any = {
        timeInfo: {
          endTimeField: "",
          startTimeField: "",
          trackIdField: ""
        }
      };
      const expected: any = {
        timeInfo: {
          endTimeField: null,
          startTimeField: null,
          trackIdField: null
        }
      };
      _templatizeTimeInfo(layer, path);
      expect(layer).toEqual(expected);
    });

    it("should templatize field references within timeInfo", () => {
      const path: string = "fields.layer";
      const layer: any = {
        timeInfo: {
          endTimeField: "A",
          startTimeField: "B",
          trackIdField: "C"
        }
      };
      const expected: any = {
        timeInfo: {
          endTimeField: "{{" + path + ".a}}",
          startTimeField: "{{" + path + ".b}}",
          trackIdField: "{{" + path + ".c}}"
        }
      };
      _templatizeTimeInfo(layer, path);
      expect(layer).toEqual(expected);
    });
  });

  describe("_templatizeDefinitionQuery", () => {
    it("should not fail with undefined", () => {
      const layer: any = undefined;
      const fieldNames: any = undefined;
      _templatizeDefinitionQuery(layer, basePath, fieldNames);
      expect(layer).toBeUndefined();
    });

    it("should not fail with empty viewDefinitionQuery", () => {
      const layer: any = {
        viewDefinitionQuery: ""
      };
      const fieldNames: any = [];
      const expected: any = {
        viewDefinitionQuery: ""
      };
      _templatizeDefinitionQuery(layer, basePath, fieldNames);
      expect(layer).toEqual(expected);

      layer.viewDefinitionQuery = undefined;
      _templatizeDefinitionQuery(layer, basePath, fieldNames);
      expect(layer).toEqual(expected);
    });

    it("should templatize field references in viewDefinitionQuery", () => {
      const layer: any = {
        viewDefinitionQuery: "a is not A is B isNot but BB is and CCC"
      };
      const fieldNames: any = ["A", "BB", "CCC"];
      const expected: any = {
        viewDefinitionQuery:
          "a is not {{" +
          basePath +
          ".a}} is B isNot but {{" +
          basePath +
          ".bb}} is and {{" +
          basePath +
          ".ccc}}"
      };
      _templatizeDefinitionQuery(layer, basePath, fieldNames);
      expect(layer).toEqual(expected);
    });
  });
});
