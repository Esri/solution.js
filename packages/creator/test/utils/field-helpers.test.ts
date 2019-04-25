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
  _templatizeTemplates
} from "../../src/utils/field-helpers";

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
    _templatizeAdminLayerInfoFields(layer, basePath, itemId);
    expect(layer).toEqual({});

    // Test source layer fields updates
    // should modify the source and leave the name
    layer = {
      adminLayerInfo: {
        viewLayerDefinition: {
          table: {
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
    _templatizeAdminLayerInfoFields(layer, basePath, itemId);
    expect(layer).toEqual({
      adminLayerInfo: {
        viewLayerDefinition: {
          table: {
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
            relatedTables: [
              {
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
    _templatizeAdminLayerInfoFields(layer, basePath, itemId);
    expect(layer).toEqual({
      adminLayerInfo: {
        viewLayerDefinition: {
          table: {
            relatedTables: [
              {
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
      relationships: [
        {
          relatedTableId: id,
          keyField: "AA"
        }
      ]
    };
    _templatizeRelationshipFields(layer, itemId);
    expect(layer).toEqual({
      relationships: [
        {
          relatedTableId: id,
          keyField: "{{" + itemId + ".fieldInfos.layer" + id + ".fields.aa}}"
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
        CreateDate: null,
        EditDate: null
      }
    };
    const expected: any = { editFieldsInfo: {} };
    expected.editFieldsInfo["{{" + basePath + ".createdate}}"] = null;
    expected.editFieldsInfo["{{" + basePath + ".editdate}}"] = null;
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

// describe("", () => {
//   it("works", () => {

//     const fieldNames: any[] = [];
//     // test with undefined layer
//     let layer;
//     _templatizeDefinitionExpression(layer, basePath, fieldNames);
//     expect(layer).toBeUndefined();

//     // test without
//     layer = {};
//     _templatizeDefinitionExpression(layer, basePath, fieldNames);
//     expect(layer).toEqual({});
//   });
// });
