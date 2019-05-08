/*
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
import {
  _templatizeProperty,
  _templatizeAdminLayerInfoFields,
  _templatizeRelationshipFields,
  _templatizeEditFieldsInfo,
  _templatizePopupInfo,
  _templatizeDefinitionEditor,
  _templatizeDefinitionExpression,
  _templatizeSimpleName,
  _templatizeDrawingInfo,
  _templatizeArcadeExpressions,
  _templatizeLabelingInfo,
  _templatizeTemplates,
  cacheFieldInfos,
  getFieldSettings,
  updateSettingsFieldInfos,
  deTemplatizeFieldInfos
} from "../../src/utils/field-helpers";
import { ITemplate } from "../../src/interfaces";

const itemId: string = "cd766cba0dd44ec080420acc10990282";
const basePath: string = itemId + ".fieldInfos.layer0.fields";

describe("_templatizeProperty", () => {
  it("works", () => {
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

describe("_templatizeAdminLayerInfoFields", () => {
  it("works", () => {
    // Test empty object does not fail
    let layer: any = {};
    let dependencies: any[] = [];
    _templatizeAdminLayerInfoFields(layer, dependencies);
    expect(layer).toEqual({});

    // Test source layer fields updates
    // should modify the source and leave the name
    layer = {
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
    dependencies = [
      {
        name: "Table",
        id: "cd766cba0dd44ec080420acc10990282"
      }
    ];
    _templatizeAdminLayerInfoFields(layer, dependencies);
    expect(layer).toEqual({
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
    });

    // Test related tables updates
    const relatedBasePath: string = itemId + ".fieldInfos.layer1.fields";
    layer = {
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
    _templatizeAdminLayerInfoFields(layer, dependencies);
    expect(layer).toEqual({
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
    });
  });
});

describe("_templatizeRelationshipFields", () => {
  it("works", () => {
    // Test undefined layer
    let layer;
    _templatizeRelationshipFields(layer, itemId);
    expect(layer).toBeUndefined();

    // Test layer without relationships
    layer = {
      relationships: []
    };
    _templatizeRelationshipFields(layer, itemId);
    expect(layer).toEqual({
      relationships: []
    });

    // Test
    const id = "1";
    layer = {
      id: "0",
      relationships: [
        {
          relatedTableId: id,
          keyField: "AA"
        }
      ]
    };
    _templatizeRelationshipFields(layer, itemId);
    expect(layer).toEqual({
      id: "0",
      relationships: [
        {
          relatedTableId: id,
          keyField: "{{" + itemId + ".fieldInfos.layer0.fields.aa}}"
        }
      ]
    });
  });
});

describe("_templatizeEditFieldsInfo", () => {
  it("works", () => {
    // test without editFieldsInfo
    let layer = {};
    _templatizeEditFieldsInfo(layer, basePath);
    expect(layer).toEqual({});

    // test with empty editFieldsInfo
    layer = {
      editFieldsInfo: {}
    };
    _templatizeEditFieldsInfo(layer, basePath);
    expect(layer).toEqual({
      editFieldsInfo: {}
    });

    // test with editFieldsInfo
    layer = {
      editFieldsInfo: {
        createDate: "CreateDate",
        editDate: "EditDate"
      }
    };
    const expected: any = {
      editFieldsInfo: {
        createDate: "{{" + basePath + ".createdate}}",
        editDate: "{{" + basePath + ".editdate}}"
      }
    };
    _templatizeEditFieldsInfo(layer, basePath);
    expect(layer).toEqual(expected);
  });
});

describe("_templatizePopupInfo", () => {
  it("works", () => {
    // test with undefined
    let layerDefinition: any;
    let layer: any;
    let fieldNames: string[];
    _templatizePopupInfo(layerDefinition, layer, basePath, itemId, fieldNames);
    expect(layerDefinition).toBeUndefined();
    expect(layer).toBeUndefined();
    expect(fieldNames).toBeUndefined();

    // test without popupInfo
    layerDefinition = {};
    layer = {};
    fieldNames = ["A", "B", "AA", "BB"];
    _templatizePopupInfo(layerDefinition, layer, basePath, itemId, fieldNames);
    expect(layerDefinition).toEqual({});
    expect(layer).toEqual({});

    //#region test with popupInfo layer is view
    layerDefinition = {
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

    const relatedTableId = "1";
    layer = {
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
    fieldNames = ["A", "B"];
    const relatedBasePath =
      itemId + ".fieldInfos.layer" + relatedTableId + ".fields";
    _templatizePopupInfo(layerDefinition, layer, basePath, itemId, fieldNames);
    expect(layerDefinition).toEqual({
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
                  tooltipField: "relationships/0/{{" + relatedBasePath + ".aa}}"
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
    });
    // should be untouched
    expect(layer).toEqual({
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
    });
    // should be untouched
    expect(fieldNames).toEqual(["A", "B"]);
    //#endregion

    //#region popupInfo layer not view
    // test with popupInfo layer not view
    layerDefinition = {
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
    layer = {
      isView: false,
      relationships: [
        {
          relatedTableId: relatedTableId
        }
      ]
    };
    fieldNames = ["A", "B"];
    _templatizePopupInfo(layerDefinition, layer, basePath, itemId, fieldNames);
    expect(layerDefinition).toEqual({
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
                  tooltipField: "relationships/0/{{" + relatedBasePath + ".aa}}"
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
    });
    // should be untouched
    expect(layer).toEqual({
      isView: false,
      relationships: [
        {
          relatedTableId: relatedTableId
        }
      ]
    });
    //#endregion
  });
});

describe("_templatizeDefinitionEditor", () => {
  it("works", () => {
    const fieldNames: string[] = ["A", "B", "C"];
    // test with undefined layer
    let layer;
    _templatizeDefinitionEditor(layer, basePath, fieldNames);
    expect(layer).toBeUndefined();

    // test without definitionEditor
    layer = {};
    _templatizeDefinitionEditor(layer, basePath, fieldNames);
    expect(layer).toEqual({});

    // test with empty definitionEditor
    layer = {
      definitionEditor: {}
    };
    _templatizeDefinitionEditor(layer, basePath, fieldNames);
    expect(layer).toEqual({
      definitionEditor: {}
    });

    // test full
    layer = {
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
    _templatizeDefinitionEditor(layer, basePath, fieldNames);
    expect(layer).toEqual({
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
    });
  });
});

describe("_templatizeDefinitionExpression", () => {
  it("works", () => {
    const fieldNames: any[] = ["A", "B", "C"];
    // test with undefined layer
    let layer;
    _templatizeDefinitionExpression(layer, basePath, fieldNames);
    expect(layer).toBeUndefined();

    // test without definitionExpression
    layer = {};
    _templatizeDefinitionExpression(layer, basePath, fieldNames);
    expect(layer).toEqual({});

    // test with empty definitionExpression
    layer = {
      definitionExpression: ""
    };
    _templatizeDefinitionExpression(layer, basePath, fieldNames);
    expect(layer).toEqual({
      definitionExpression: ""
    });

    // test with definitionExpression
    layer = {
      definitionExpression: "A IS ABC AND B LIKE C"
    };
    _templatizeDefinitionExpression(layer, basePath, fieldNames);
    expect(layer).toEqual({
      definitionExpression:
        "{{" +
        basePath +
        ".a}} IS ABC AND {{" +
        basePath +
        ".b}} LIKE {{" +
        basePath +
        ".c}}"
    });
  });
});

describe("_templatizeSimpleName", () => {
  it("works", () => {
    const fieldNames: any[] = ["A", "B", "C", "D"];

    // test with undefined expression
    let expression;
    expression = _templatizeSimpleName(expression, basePath, fieldNames);
    expect(expression).toBeUndefined();

    // test empty
    expression = "";
    expression = _templatizeSimpleName(expression, basePath, fieldNames);
    expect(expression).toEqual("");

    // test case expression
    expression =
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
  it("works", () => {
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
    // test with undefined layer
    let layer;
    _templatizeDrawingInfo(layer, basePath, fieldNames);
    expect(layer).toBeUndefined();

    // test with empty drawingInfo
    layer = { drawingInfo: {} };
    _templatizeDrawingInfo(layer, basePath, fieldNames);
    expect(layer).toEqual({ drawingInfo: {} });

    // Renderers

    // classBreaks
    layer = {
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
    _templatizeDrawingInfo(layer, basePath, fieldNames);
    expect(layer).toEqual({
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
    });

    // heatMap
    layer = {
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
    _templatizeDrawingInfo(layer, basePath, fieldNames);
    expect(layer).toEqual({
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
    });

    // predominance
    layer = {
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
            visualVariables: []
          },
          type: "uniqueValue",
          valueExpression:
            'var fieldNames = ["POP10_CY", "POP40_CY", "POP60_CY", "POP20_CY", "POP30_CY"];\nvar numFields = 5;\nvar maxValueField = null;\nvar maxValue = -Infinity;\nvar value, i, totalValue = null;\nfor(i = 0; i < numFields; i++) {\nvalue = $feature[fieldNames[i]];\nif(value > 0) {\nif(value > maxValue) {\nmaxValue = value;\nmaxValueField = fieldNames[i];\n}\nelse if (value == maxValue) {\nmaxValueField = null;\n}\n}\n}\nreturn maxValueField;',
          uniqueValueInfos: []
        }
      }
    };
    _templatizeDrawingInfo(layer, basePath, fieldNames);
    expect(layer).toEqual({
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
            visualVariables: []
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
    });

    // simple
    layer = {
      drawingInfo: {
        renderer: {
          type: "simple",
          rotationExpression: "[TEST]",
          symbol: {}
        }
      }
    };
    _templatizeDrawingInfo(layer, basePath, fieldNames);
    expect(layer).toEqual({
      drawingInfo: {
        renderer: {
          type: "simple",
          rotationExpression: "[{{" + basePath + ".test}}]",
          symbol: {}
        }
      }
    });

    // temporal
    layer = {
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
    _templatizeDrawingInfo(layer, basePath, fieldNames);
    expect(layer).toEqual({
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
    });

    // uniqueValueRenderer
    layer = {
      drawingInfo: {
        renderer: {
          type: "uniqueValue",
          field1: "COUNTRY",
          uniqueValueInfos: []
        }
      }
    };
    _templatizeDrawingInfo(layer, basePath, fieldNames);
    expect(layer).toEqual({
      drawingInfo: {
        renderer: {
          type: "uniqueValue",
          field1: "{{" + basePath + ".country}}",
          uniqueValueInfos: []
        }
      }
    });
  });
});

describe("_templatizeArcadeExpressions", () => {
  it("works", () => {
    // test with undefined text
    let text: string;
    text = _templatizeArcadeExpressions(text, "", basePath);
    expect(text).toBeUndefined();

    // test without
    text = "";
    text = _templatizeArcadeExpressions(text, "", basePath);
    expect(text).toEqual("");

    const fieldNames: string[] = ["POP_16UP", "EMP_CY", "POP_16UP"];
    text =
      "Round((($feature.POP_16UP - $feature.EMP_CY)/$feature.POP_16UP)*100,2) + '%'";
    fieldNames.forEach((name: string) => {
      text = _templatizeArcadeExpressions(text, name, basePath);
    });
    expect(text).toEqual(
      "Round((($feature.{{" +
        basePath +
        ".pop_16up}} - $feature.{{" +
        basePath +
        ".emp_cy}})/$feature.{{" +
        basePath +
        ".pop_16up}})*100,2) + '%'"
    );

    text =
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
    expect(text).toEqual(
      "Round((($feature.{{" +
        basePath +
        ".pop_16up}} - $feature.{{" +
        basePath +
        ".emp_cy}})/$feature.{{" +
        basePath +
        ".pop_16up}})*100,2) + '%'"
    );

    text = '$feature["COUNTY_ID.EMP_CY"]';
    fieldNames.forEach((name: string) => {
      text = _templatizeArcadeExpressions(text, name, basePath);
    });
    expect(text).toEqual('$feature["COUNTY_ID.{{' + basePath + '.emp_cy}}"]');

    text = "$feature['COUNTY_ID.EMP_CY']";
    fieldNames.forEach((name: string) => {
      text = _templatizeArcadeExpressions(text, name, basePath);
    });
    expect(text).toEqual("$feature['COUNTY_ID.{{" + basePath + ".emp_cy}}']");

    text = '$feature["EMP_CY"]';
    fieldNames.forEach((name: string) => {
      text = _templatizeArcadeExpressions(text, name, basePath);
    });
    expect(text).toEqual('$feature["{{' + basePath + '.emp_cy}}"]');

    text = "$feature['EMP_CY']";
    fieldNames.forEach((name: string) => {
      text = _templatizeArcadeExpressions(text, name, basePath);
    });
    expect(text).toEqual("$feature['{{" + basePath + ".emp_cy}}']");

    text = 'var names = ["EMP_CY"]';
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
  it("works", () => {
    const fieldNames: any[] = ["Description", "STATE_NAME", "ACRES"];

    // test without
    let labelingInfo: any[] = [];
    _templatizeLabelingInfo(labelingInfo, basePath, fieldNames);
    expect(labelingInfo).toEqual([]);

    labelingInfo = [
      {
        labelExpression: "[Description]",
        labelExpressionInfo: {
          value: 'return $feature["STATE_NAME"] + " (arcade)";'
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
    _templatizeLabelingInfo(labelingInfo, basePath, fieldNames);
    expect(labelingInfo).toEqual([
      {
        labelExpression: "[{{" + basePath + ".description}}]",
        labelExpressionInfo: {
          value:
            'return $feature["{{' + basePath + '.state_name}}"] + " (arcade)";'
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
    ]);
  });
});

describe("_templatizeTemplates", () => {
  it("works", () => {
    // test without
    let layer: any = {};
    _templatizeTemplates(layer, basePath);
    expect(layer).toEqual({});

    layer = {
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

    const expectedResult: any = {
      templates: [
        {
          prototype: {
            attributes: {}
          }
        }
      ]
    };
    expectedResult.templates[0].prototype.attributes[
      "{{" + basePath + ".a}}"
    ] = null;
    expectedResult.templates[0].prototype.attributes[
      "{{" + basePath + ".b}}"
    ] = null;

    _templatizeTemplates(layer, basePath);
    expect(layer).toEqual(expectedResult);
  });
});

describe("cacheFieldInfos", () => {
  it("works", () => {
    const fieldInfos: any = {};

    // test with undefined layer
    let layer;
    cacheFieldInfos(layer, fieldInfos, undefined);
    expect(layer).toBeUndefined();

    // test without
    layer = {};
    cacheFieldInfos(layer, fieldInfos, "");
    expect(layer).toEqual({});

    layer = {
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

    cacheFieldInfos(layer, fieldInfos, "cd766cba0dd44ec080420acc10990282");
    expect(layer).toEqual({
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
      displayField: null,
      editFieldsInfo: ["CreateDate"],
      templates: null,
      relationships: null,
      drawingInfo: null,
      type: "layer"
    });

    expect(fieldInfos).toEqual({
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
      }
    });
  });
});

describe("getFieldSettings", () => {
  it("works", () => {
    // fields not changed
    let fieldInfos: any = {
      "0": {
        newFields: [
          {
            name: "A"
          },
          {
            name: "B"
          }
        ],
        sourceFields: [
          {
            name: "A"
          },
          {
            name: "B"
          }
        ],
        otherProperty: {
          test: "test"
        }
      },
      "1": {
        newFields: [
          {
            name: "C"
          },
          {
            name: "D"
          }
        ],
        sourceFields: [
          {
            name: "C"
          },
          {
            name: "D"
          }
        ],
        otherProperty: {
          test: "test"
        }
      }
    };
    let expectedSettingsResult: any = {
      layer0: {
        fields: {
          a: "A",
          b: "B"
        }
      },
      layer1: {
        fields: {
          c: "C",
          d: "D"
        }
      }
    };
    let expectedFieldInfosResult: any = {
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
    let settings = getFieldSettings(fieldInfos);
    expect(fieldInfos).toEqual(expectedFieldInfosResult);
    expect(settings).toEqual(expectedSettingsResult);

    // fields changed
    fieldInfos = {
      "0": {
        newFields: [
          {
            name: "a"
          },
          {
            name: "b"
          }
        ],
        sourceFields: [
          {
            name: "A"
          },
          {
            name: "B"
          }
        ],
        otherProperty: {
          test: "test"
        }
      },
      "1": {
        newFields: [
          {
            name: "c"
          },
          {
            name: "d"
          }
        ],
        sourceFields: [
          {
            name: "C"
          },
          {
            name: "D"
          }
        ],
        otherProperty: {
          test: "test"
        }
      }
    };
    expectedSettingsResult = {
      layer0: {
        fields: {
          a: "a",
          b: "b"
        }
      },
      layer1: {
        fields: {
          c: "c",
          d: "d"
        }
      }
    };
    expectedFieldInfosResult = {
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
    settings = getFieldSettings(fieldInfos);
    expect(fieldInfos).toEqual(expectedFieldInfosResult);
    expect(settings).toEqual(expectedSettingsResult);
  });
});

describe("updateSettingsFieldInfos", () => {
  it("works", () => {
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

    let settings: any = {
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

    let itemTemplate: ITemplate = {
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

    let expectedSettingsResult: any = {
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
    expect(settings).toEqual(expectedSettingsResult);

    // settings should not transfer as the template has no dependencies
    settings = {
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

    expectedSettingsResult = {
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
    expect(settings).toEqual(expectedSettingsResult);
  });
});

describe("deTemplatizeFieldInfos", () => {
  it("works", () => {
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
        }
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
            relatedTables: [
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
              jurisdictionname_1552494094382: "jurisdictionname_1552494094382",
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
              jurisdictionname_1552493773603: "jurisdictionname_1552493773603",
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

    const expectedFieldInfosResults: any = {
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
        }
      },
      "1": {
        displayField: "jurisdictionname",
        templates: [],
        relationships: []
      }
    };

    const expectedPopupResult = {
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

    const expectedAdminLayerInfosResults: any = {
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
    expect(results.fieldInfos).toEqual(expectedFieldInfosResults);
    expect(results.popupInfos).toEqual(expectedPopupResult);
    expect(results.adminLayerInfos).toEqual(expectedAdminLayerInfosResults);
  });
});
