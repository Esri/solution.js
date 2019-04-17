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

//#region Imports

import * as mCommon from "../itemTypes/common";
import * as objectUtils from "../utils/object-helpers";
import { IStringValuePair, ITemplate } from "../interfaces";
import * as adlib from "adlib";

//#endregion

//#region Public functions

export function templatizeLayerFieldReferences(
  layer: any,
  itemID: string,
  layerJSON?: any
): any {
  const basePath: string = itemID + ".fieldInfos.layer" + layer.id + ".fields";

  // call local helper functions
  _templatizeProperty(layer, "displayField", basePath);
  _templatizeAdminLayerInfoFields(layer, basePath, itemID);
  _templatizeRelationshipFields(layer, itemID);
  _templatizeEditFieldsInfo(layer, basePath);
  _templatizePopupInfo(layer, basePath, layerJSON, itemID);
  _templatizeDefinitionEditor(layer, basePath);
  _templatizeDefinitionExpression(layer, basePath);
  _templatizeDrawingInfo(layer, basePath);
  _templatizeTemplates(layer, basePath);

  return layer;
}

export function templatizeAppFieldReferences(app: any): any {
  // need to know app type
  // then call local helper functions
}

export function cacheFieldInfos(layer: any, fieldInfos: any): any {
  if (layer.fields) {
    fieldInfos[layer.id] = {
      sourceFields: JSON.parse(JSON.stringify(layer.fields))
    };
  }

  const testProperties: string[] = [
    "displayField",
    "editFieldsInfo",
    "templates",
    "relationships",
    "drawingInfo"
  ];
  testProperties.forEach(prop => {
    _cacheFieldInfo(layer, prop, fieldInfos);
  });

  return fieldInfos;
}

export function getFieldSettings(fieldInfos: any): any {
  const settings: any = {};
  const ids = Object.keys(fieldInfos);
  ids.forEach((id: any) => {
    settings["layer" + id] = {
      fields: _getNameMapping(fieldInfos, id)
    };
    deleteProp(fieldInfos[id], "newFields");
    deleteProp(fieldInfos[id], "sourceFields");
  });
  return settings;
}

export function updateSettingsFieldInfos(
  itemTemplate: ITemplate,
  settings: any
): void {
  const dependencies = itemTemplate.dependencies;
  const id = itemTemplate.itemId;
  const settingsKeys = Object.keys(settings);
  settingsKeys.forEach((k: any) => {
    if (id === settings[k].id) {
      dependencies.forEach((d: any) => {
        settingsKeys.forEach((_k: any) => {
          if (d === settings[_k].id) {
            settings[k]["fieldInfos"] = settings[_k].fieldInfos;
          }
        });
      });
    }
  });
}

export function deTemplatizeFieldInfos(
  fieldInfos: any,
  popupInfos: any,
  adminLayerInfos: any,
  settings: any
): any {
  const fieldInfoKeys = Object.keys(fieldInfos);
  fieldInfoKeys.forEach(id => {
    if (fieldInfos[id].hasOwnProperty("templates")) {
      fieldInfos[id].templates = JSON.parse(
        adlib.adlib(JSON.stringify(fieldInfos[id].templates), settings)
      );
    }

    if (fieldInfos[id].hasOwnProperty("adminLayerInfo")) {
      adminLayerInfos[id].viewLayerDefinition.table.relatedTables =
        fieldInfos[id].adminLayerInfo;
    }
  });

  return {
    popupInfos: adlib.adlib(popupInfos, settings),
    fieldInfos: adlib.adlib(fieldInfos, settings),
    adminLayerInfos: adlib.adlib(adminLayerInfos, settings)
  };
}

//#endregion

//#region Private helper functions

/**
 * templatize an objects property
 *
 * @param object the object with the property to templatize
 * @param property the property of the object to templatize
 * @param basePath path used to de-templatize while deploying
 */
export function _templatizeProperty(
  object: any,
  property: string,
  basePath: string
): void {
  if (object.hasOwnProperty(property) && object[property]) {
    object[property] = _templatize(basePath, object[property]);
  }
}

/**
 * templatize the fields referenced in adminLayerInfo
 *
 * @param layer the layer object with the adminLayerInfo property to templatize
 * @param basePath path used to de-templatize while deploying
 * @param itemID the id for the item that contains this layer
 */
export function _templatizeAdminLayerInfoFields(
  layer: any,
  basePath: string,
  itemID: string
): void {
  // templatize the source layer fields
  const sourceLayerFields =
    objectUtils.getProp(
      layer,
      "adminLayerInfo.viewLayerDefinition.table.sourceLayerFields"
    ) || [];

  _templatizeAdminSourceLayerFields(sourceLayerFields, basePath);

  // templatize the releated table fields
  const relatedTables =
    objectUtils.getProp(
      layer,
      "adminLayerInfo.viewLayerDefinition.table.relatedTables"
    ) || [];

  if (relatedTables.length > 0) {
    relatedTables.forEach((t: any) => {
      const relatedBasePath =
        itemID + ".fieldInfos.layer" + t.sourceLayerId + ".fields";

      const topFilter: any = t.topFilter || {};
      _templatizeTopFilter(topFilter, relatedBasePath);

      const relatedSourceLayerFields: any[] = t.sourceLayerFields || [];
      _templatizeAdminSourceLayerFields(
        relatedSourceLayerFields,
        relatedBasePath
      );

      const parentKeyFields: any[] = t.parentKeyFields || [];
      t.parentKeyFields = parentKeyFields.map((f: any) => {
        return _templatize(basePath, f);
      });

      const keyFields: any[] = t.keyFields || [];
      t.keyFields = keyFields.map((f: any) => {
        return _templatize(relatedBasePath, f);
      });
    });
  }
}

/**
 * templatize the fields referenced in adminLayerInfo
 *
 * @param fields array of sourceLayerFields to templatize
 * @param basePath path used to de-templatize while deploying
 */
export function _templatizeAdminSourceLayerFields(
  fields: any[],
  basePath: string
): void {
  fields.forEach(f => _templatizeProperty(f, "source", basePath));
}

export function _templatizeTopFilter(topFilter: any, basePath: string): void {
  // I may need to know the fields for the related table here if
  // I am going to use regex to search for names

  // Need to understand the spec here better...may be ok to split at " " and ","
  // will try this first...

  // TODO understand if can you order by more than one field
  // TODO understand if it would ever have a different pattern than "fieldName OrderByOperation"

  // templatize the orderByFields prop
  const orderByFields: string = topFilter["orderByFields"] || "";
  if (orderByFields !== "") {
    const orderByField = orderByFields.split(" ")[0];
    topFilter.orderByFields = topFilter.orderByFields.replace(
      orderByField,
      _templatize(basePath, orderByField)
    );
  }

  const groupByFields = topFilter["groupByFields"] || "";
  if (groupByFields !== "") {
    const _groupByFields = groupByFields.split(",");
    if (_groupByFields.length > 0) {
      const mappedFields = _groupByFields.map((f: any) => {
        return _templatize(basePath, f);
      });

      topFilter.groupByFields = mappedFields.join(",");
    }
  }
}

export function _templatizeRelationshipFields(
  layer: any,
  itemID: string
): void {
  const relationships: any[] = layer.relationships || [];
  relationships.forEach(r => {
    if (r.keyField && r.relatedTableId) {
      // template path will need to retain relatedTableId
      const basePath: string =
        itemID + ".fieldInfos.layer" + r.relatedTableId + ".fields";
      r.keyField = _templatize(basePath, r.keyField);
    }
  });
}

export function _templatizeEditFieldsInfo(layer: any, basePath: string): void {
  const editFieldsInfo: any = layer.editFieldsInfo || {};
  const keys: string[] = Object.keys(editFieldsInfo) || [];
  keys.forEach(
    (k): any => {
      editFieldsInfo[k] = _templatize(basePath, editFieldsInfo[k]);
    }
  );
}

export function _templatizePopupInfo(
  layer: any,
  basePath: string,
  layerJSON: any,
  itemID: any
): void {
  // the data layer does not have the fields...will need to get those
  // from the associated layer json

  if (layerJSON && layerJSON.hasOwnProperty("fields")) {
    const fields: any[] = layerJSON.fields || [];

    const popupInfo: any = layer.popupInfo || {};
    if (popupInfo.hasOwnProperty("title")) {
      fields.forEach((f: any) => {
        const regEx = new RegExp(
          '(?:[{{("\\[ ])(' + f.name + ')(?:[}})"\\] ])',
          "gm"
        );
        if (regEx.test(popupInfo.title)) {
          popupInfo.title = popupInfo.title.replace(
            regEx,
            _templatize(basePath, f.name)
          );
        }
      });
    }

    if (popupInfo.hasOwnProperty("description")) {
      fields.forEach((f: any) => {
        const regEx = new RegExp(
          '(?:[{{("\\[ ])(' + f.name + ')(?:[}})"\\] ])',
          "gm"
        );
        if (regEx.test(popupInfo.description)) {
          popupInfo.description = popupInfo.description.replace(
            regEx,
            _templatize(basePath, f.name)
          );
        }
      });
    }

    // templatize fieldInfos field names
    const fieldInfos: any[] = popupInfo.fieldInfos || [];
    fieldInfos.forEach((f: any) => {
      if (f.fieldName.indexOf("relationships/") > -1) {
        const rels = f.fieldName.split("/");
        const relationshipId = rels[1];

        const relatedTables: any[] = objectUtils.getProp(
          layerJSON,
          layerJSON.isView
            ? "adminLayerInfo.viewLayerDefinition.table.relatedTables"
            : "relationships"
        );

        const relatedTable: any = relatedTables[relationshipId];

        const _basePath: string =
          itemID +
          ".fieldInfos.layer" +
          relatedTable[layerJSON.isView ? "sourceLayerId" : "relatedTableId"] +
          ".fields";

        rels[2] = _templatize(_basePath, rels[2]);
        f.fieldName = rels.join("/");
      } else {
        // do not need to templatize expression references as the expression itself will
        // be templatized
        if (f.fieldName.indexOf("expression/") === -1) {
          f.fieldName = _templatize(basePath, f.fieldName);
        }
      }
    });

    // templatize field name references when used in expressions
    const expressionInfos: any[] = popupInfo.expressionInfos || [];
    popupInfo.expressionInfos = expressionInfos.map((i: any) => {
      const expression: string = i.expression || "";
      fields.forEach((f: any) => {
        // make this a function to be used elsewhere as well
        const regEx = new RegExp("(?:[$]feature.)(" + f.name + ")\\b", "gm");
        if (regEx.test(expression)) {
          i.expression = expression.replace(
            regEx,
            "$feature." + _templatize(basePath, f.name)
          );
        }
      });
      return i;
    });

    if (popupInfo.hasOwnProperty("popupElelments")) {
      const popupElelments: any[] = popupInfo.popupElelments || [];
      popupElelments.forEach((pe: any) => {
        if (pe.hasOwnProperty("fieldInfos")) {
          const infos: any[] = pe.fieldInfos || [];
          infos.forEach(fi => _templatizeProperty(fi, "fieldName", basePath));
        }
      });
    }

    if (popupInfo.hasOwnProperty("mediaInfos")) {
      const mediaInfos: any = popupInfo.mediaInfos || {};
      // if (mediaInfos.hasOwnProperty("title")) {

      // }

      // if (mediaInfos.hasOwnProperty("caption")) {
      // }

      // if (mediaInfos.hasOwnProperty("normalizeField")) {
      // }

      // if (mediaInfos.hasOwnProperty("fields")) {
      //   const fields: any[] = mediaInfos.fields || [];
      //   fields.forEach(f => {});
      // }
    }
  }
}

export function _templatizeDefinitionEditor(
  layer: any,
  basePath: string
): void {
  const definitionEditor: any = layer.definitionEditor || {};
  const parameters: any[] =
    objectUtils.getProp(layer.definitionEditor, "inputs.parameters") || [];

  // if (parameters.length > 0) {
  //   parameters.forEach(p => {});
  // }

  if (definitionEditor.hasOwnProperty("parameterizedExpression")) {
    const parameterizedExpression: string =
      definitionEditor.parameterizedExpression || "";
  }
}

export function _templatizeDefinitionExpression(
  layer: any,
  basePath: string
): void {
  const definitionExpression: string = layer.definitionExpression || "";
}

export function _templatizeDrawingInfo(layer: any, basePath: string): void {
  const drawingInfo: any = layer.drawingInfo || {};

  // templatize the renderer fields
  const renderer: any = drawingInfo.renderer || {};
  _templatizeRenderer(renderer, basePath);

  // templatize the labelingInfo
  const labelingInfo: any = drawingInfo.labelingInfo || [];
  _templatizeLabelingInfo(labelingInfo, basePath);
}

export function _templatizeRenderer(renderer: any, basePath: string): void {
  // TODO I'm sure this will need to be extended
  const visualVariables: any[] = renderer.visualVariables || [];
  visualVariables.forEach(v => {
    if (v.hasOwnProperty("field")) {
      v.field = _templatize(basePath, v.field);
    }
  });

  switch (renderer.type) {
    case "uniqueValue":
      let x = 1;
      while (renderer.hasOwnProperty("field" + x)) {
        renderer["field" + x] = _templatize(basePath, renderer["field" + x]);
        x += 1;
      }
      if (renderer.hasOwnProperty("valueExpression")) {
        renderer.valueExpression = _templatizeArcadeExpressions(
          renderer.valueExpression,
          basePath
        );
      }
      break;
    case "classBreaks":
      if (renderer.hasOwnProperty("field")) {
        renderer.field = _templatize(basePath, renderer.field);
      }
      break;
    case "valueExpression":
      renderer.valueExpression = _templatizeArcadeExpressions(
        renderer.valueExpression,
        basePath
      );
      break;
    default:
      break;
  }
}

export function _templatizeArcadeExpressions(
  text: string,
  basePath: string
): string {
  // replace = field_mapping[field]
  // text = text.replace('$feature.{0}'.format(field), '$feature.{0}'.format(replace))
  // text = text.replace('$feature["{0}"]'.format(field), '$feature["{0}"]'.format(replace
  // ))
  // let regEx = new RegExp("(?:[$]feature.)(" + fieldName + ")\\b", "gm");
  // if (regEx.test(text)) {
  //   text = text.replace(
  //     regEx,
  //     "$feature." + _templatize(basePath, fieldName)
  //   );
  // }
  return text;
}

export function _templatizeLabelingInfo(
  labelingInfo: any,
  basePath: string
): void {
  // TODO verify that this is always an array
  labelingInfo.forEach((li: any) => {
    const labelExpressionInfo: any =
      objectUtils.getProp(li, "labelExpression.labelExpressionInfo") || {};

    if (labelExpressionInfo.hasOwnProperty("value")) {
      _templatizeProperty(labelExpressionInfo, "value", basePath);
    }

    if (labelExpressionInfo.hasOwnProperty("expression")) {
      const expression: any = labelExpressionInfo.expression;
      labelExpressionInfo.expression = _templatizeArcadeExpressions(
        expression,
        basePath
      );
    }

    if (li.hasOwnProperty("fieldInfos")) {
      const fieldInfos: any[] = li.fieldInfos || [];
      fieldInfos.forEach(fi => _templatizeProperty(fi, "fieldName", basePath));
    }
  });
}

export function _templatizeTemplates(layer: any, basePath: string): void {
  const templates: any[] = layer.templates || [];
  templates.forEach(t => {
    const attributes: any =
      objectUtils.getProp(t, "prototype.attributes") || {};
    const attributeKeys: string[] = Object.keys(attributes);
    if (attributeKeys.length > 0) {
      const _attributes: any = {};
      attributeKeys.forEach(k => {
        _attributes[String(_templatize(basePath, k))] = attributes[k];
      });
      t.prototype.attributes = _attributes;
    }
  });
}

// export function _templatizeFieldIndexes(layer: any, basePath: string): void {

// }

/**
 * Helper function to templatize value and make sure its converted to lowercase
 *
 * @param basePath path used to de-templatize while deploying
 * @param value to be converted to lower case for lookup while deploying
 */
export function _templatize(
  basePath: string,
  value: string
): string | string[] {
  return mCommon.templatize(basePath, String(value).toLowerCase());
}

export function _cacheFieldInfo(
  layer: any,
  prop: string,
  fieldInfos: any
): void {
  if (layer.hasOwnProperty(prop)) {
    fieldInfos[layer.id][prop] = layer[prop];
    layer[prop] = null;
  }
}

export function _getNameMapping(fieldInfos: any, id: string): any {
  // create name mapping
  const nameMapping: IStringValuePair = {};
  const newFields = fieldInfos[id].newFields;
  fieldInfos[id].sourceFields.forEach((field: any) => {
    const lName = String(field.name).toLowerCase();
    newFields.forEach((f: any) => {
      if (String(f.name).toLowerCase() === lName) {
        nameMapping[lName] = f.name;
      }
    });
  });
  return nameMapping;
}

/**
 * Helper function to test if object and property exist and if so delete the property
 *
 * @param obj object instance to test and update
 * @param prop name of the property we are after
 */
export function deleteProp(obj: any, prop: string): void {
  if (obj && obj.hasOwnProperty(prop)) {
    delete obj[prop];
  }
}

//#endregion
