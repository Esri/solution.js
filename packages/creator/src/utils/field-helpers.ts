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

/**
 * Templatize all field references within a layer
 * This is necessary to support potential field name changes when deploying to portal
 * Portal will force all field names to be lower case
 *
 * @param layerDefinition The data layer instance with field name references within
 * @param itemID The id for the item that contains this layer.
 * @param layer JSON return from the layer being templatized.
 * @return An updated instance of the layer
 * @protected
 */
export function templatizeLayerFieldReferences(
  layerDefinition: any,
  itemID: string,
  layer: any
): void {
  // This is the value that will be used as the template for adlib replacement
  const path: string =
    itemID + ".fieldInfos.layer" + layerDefinition.id + ".fields";

  // Get the field names for various tests
  const fieldNames: string[] = layer.fields.map((f: any) => f.name);

  // Update the layerDefinition
  _templatizeAdminLayerInfoFields(layerDefinition, path, itemID);
  _templatizePopupInfo(layerDefinition, layer, path, itemID, fieldNames);

  // Update the layer json
  _templatizeProperty(layer, "displayField", path);
  _templatizeAdminLayerInfoFields(layer, path, itemID);
  _templatizeRelationshipFields(layer, itemID);
  _templatizeEditFieldsInfo(layer, path);
  _templatizeDefinitionEditor(layer, path, fieldNames);
  _templatizeDefinitionExpression(layer, path, fieldNames);
  _templatizeDrawingInfo(layer, path, fieldNames);
  _templatizeTemplates(layer, path);
}

/**
 * Cache properties that contain field references
 *
 * @param layer The data layer instance with field name references within
 * @param fieldInfos the object that stores the cached field infos
 * @return An updated instance of the fieldInfos
 */
export function cacheFieldInfos(layer: any, fieldInfos: any): any {
  // cache the source fields as they are in the original source
  if (layer && layer.fields) {
    fieldInfos[layer.id] = {
      sourceFields: JSON.parse(JSON.stringify(layer.fields))
    };
  }

  // cache each of these properties as they each can contain field references
  const props: string[] = [
    "displayField",
    "editFieldsInfo",
    "templates",
    "relationships",
    "drawingInfo"
  ];
  props.forEach(prop => {
    _cacheFieldInfo(layer, prop, fieldInfos);
  });

  return fieldInfos;
}

/**
 * Create the name mapping object that will allow for all templatized field
 * references to be de-templatized.
 * This also removes the stored sourceFields and newFields arrays from fieldInfos.
 *
 * Example... { layer0: { fields: { lowerCaseSourceFieldName: newFieldNameAfterDeployment } } }
 *
 * @param fieldInfos The object that stores the cached layer properties and name mapping
 * @return The settings object that will be used to de-templatize the field references.
 * @protected
 */
export function getFieldSettings(fieldInfos: any): any {
  const settings: any = {};
  const ids = Object.keys(fieldInfos);
  ids.forEach((id: any) => {
    settings["layer" + id] = {
      fields: _getNameMapping(fieldInfos, id)
    };
    objectUtils.deleteProp(fieldInfos[id], "newFields");
    objectUtils.deleteProp(fieldInfos[id], "sourceFields");
  });
  return settings;
}

/**
 * This is used when deploying views.
 * We need to update fields referenced in adminLayerInfo for relationships prior to deploying the view.
 * This moves the fieldInfos for the views source layers from the item settings for the source layer
 * to the item settings for the view.
 *
 * @param itemTemplate The current itemTemplate being processed.
 * @param settings The settings object used to de-templatize the various templates within the item.
 * @protected
 */
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

/**
 * Replace the field name reference templates with the new field names after deployment.
 *
 * @param fieldInfos The object that stores the cached layer properties and name mapping
 * @param popupInfos The object from the popupInfo property for the layer
 * @param adminLayerInfos The object from the adminLayerInfo property for the layer
 * @param settings The settings object that has all of the mappings for de-templatizing.
 * @return An object that contains updated instances of popupInfos, fieldInfos, and adminLayerInfos
 * @protected
 */
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
  if (object && object.hasOwnProperty(property) && object[property]) {
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
      const relatedPath =
        itemID + ".fieldInfos.layer" + t.sourceLayerId + ".fields";

      _templatizeTopFilter(t.topFilter || {}, relatedPath);

      _templatizeAdminSourceLayerFields(t.sourceLayerFields || [], relatedPath);

      const parentKeyFields: any[] = t.parentKeyFields || [];
      t.parentKeyFields = parentKeyFields.map((f: any) => {
        return _templatize(basePath, f);
      });

      const keyFields: any[] = t.keyFields || [];
      t.keyFields = keyFields.map((f: any) => {
        return _templatize(relatedPath, f);
      });
    });
  }
}

/**
 * templatize the sourceLayerFields referenced in adminLayerInfo
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

/**
 * templatize the topFilter property from adminLayerInfo related tables
 *
 * @param topFilter the topFilter object to templatize
 * @param basePath path used to de-templatize while deploying
 */
export function _templatizeTopFilter(topFilter: any, basePath: string): void {
  if (topFilter) {
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
}

/**
 * templatize the relationships key fields using the related table id in the basePath
 *
 * @param layer the layer that has the relationships to templatize
 * @param itemID the id of the item that contains the related table
 */
export function _templatizeRelationshipFields(
  layer: any,
  itemID: string
): void {
  if (layer.relationships) {
    const relationships: any[] = layer.relationships;
    relationships.forEach(r => {
      if (r.keyField && r.hasOwnProperty("relatedTableId")) {
        // template path will need to retain relatedTableId
        const basePath: string =
          itemID + ".fieldInfos.layer" + r.relatedTableId + ".fields";
        _templatizeProperty(r, "keyField", basePath);
      }
    });
  }
}

/**
 * templatize the editFieldsInfo
 *
 * @param layer the layer that has the editFieldsInfo to templatize
 * @param basePath path used to de-templatize while deploying
 */
export function _templatizeEditFieldsInfo(layer: any, basePath: string): void {
  const editFieldsInfo: any = layer.editFieldsInfo || {};
  const keys: string[] = Object.keys(editFieldsInfo) || [];
  keys.forEach(k => _templatizeProperty(editFieldsInfo, k, basePath));
}

/**
 * templatize the popupInfo
 *
 * @param layerDefinition the layerDefinition that has the popupInfo to templatize
 * @param layer the JSON for the layer being templatized
 * @param basePath path used to de-templatize while deploying
 * @param itemID the id for the item that contains this layer
 * @param fieldNames array of fieldNames
 */
export function _templatizePopupInfo(
  layerDefinition: any,
  layer: any,
  basePath: string,
  itemID: any,
  fieldNames: string[]
): void {
  // the data layer does not have the fields...will need to get those
  // from the associated layer json
  if (fieldNames && layerDefinition.popupInfo) {
    const popupInfo: any = layerDefinition.popupInfo || {};
    _templatizeFieldName(popupInfo, "title", fieldNames, basePath);
    _templatizeFieldName(popupInfo, "description", fieldNames, basePath);

    const fieldInfos: any[] = popupInfo.fieldInfos || [];
    _templatizePopupInfoFieldInfos(fieldInfos, layer, itemID, basePath);

    const expressionInfos: any[] = popupInfo.expressionInfos || [];
    _templatizeExpressionInfos(expressionInfos, fieldNames, basePath);

    const popupElements: any[] = popupInfo.popupElements || [];
    _templatizePopupElements(popupElements, basePath);

    const mediaInfos: any = popupInfo.mediaInfos || {};
    _templatizeMediaInfos(mediaInfos, fieldNames, basePath);
  }
}

/**
 * templatize field name when referenced like this: {{fieldName}}
 * checks each field name from the layer
 *
 * @param object with the property to test for a field name
 * @param property that could have a field name referenced
 * @param fieldNames array for field names for the layer
 * @param basePath path used to de-templatize while deploying
 */
export function _templatizeFieldName(
  object: any,
  property: string,
  fieldNames: string[],
  basePath: string
): void {
  if (object.hasOwnProperty(property)) {
    fieldNames.forEach(name => {
      // Only test and replace instance of the name so any enclosing characters
      // will be retained
      const regEx = new RegExp("(" + name + ")", "gm");
      if (regEx.test(object[property])) {
        object[property] = object[property].replace(
          regEx,
          _templatize(basePath, name)
        );
      }
    });
  }
}

/**
 * templatize field name when referenced like this: {{fieldName}}
 * checks each field name from the layer
 *
 * @param fieldInfos object that contains the popups fieldInfos
 * @param layer json of layer being cloned
 * @param itemID id of the item that contains the current layer
 * @param basePath path used to de-templatize while deploying
 */
export function _templatizePopupInfoFieldInfos(
  fieldInfos: any[],
  layer: any,
  itemID: any,
  basePath: string
): void {
  fieldInfos.forEach((f: any) => {
    if (f.fieldName.indexOf("relationships/") > -1) {
      const rels = f.fieldName.split("/");
      const relationshipId = rels[1];

      const relatedTables: any[] = objectUtils.getProp(
        layer,
        layer.isView
          ? "adminLayerInfo.viewLayerDefinition.table.relatedTables"
          : "relationships"
      );

      const relatedTable: any = relatedTables[relationshipId];

      const _basePath: string =
        itemID +
        ".fieldInfos.layer" +
        relatedTable[layer.isView ? "sourceLayerId" : "relatedTableId"] +
        ".fields";

      rels[2] = _templatize(_basePath, rels[2]);
      f.fieldName = rels.join("/");
    } else {
      // do not need to templatize expression references as the expression
      // itself will be templatized
      if (f.fieldName.indexOf("expression/") === -1) {
        _templatizeProperty(f, "fieldName", basePath);
      }
    }
  });
}

/**
 * templatize field name when referenced in expressionInfos
 *
 * @param expressionInfos the popups expressionInfos to check
 * @param fieldNames array of the layers field names
 * @param basePath path used to de-templatize while deploying
 */
export function _templatizeExpressionInfos(
  expressionInfos: any[],
  fieldNames: string[],
  basePath: string
): any[] {
  return expressionInfos.map((i: any) => {
    fieldNames.forEach(name => {
      i.expression = _templatizeArcadeExpressions(i.expression, name, basePath);
    });
    return i;
  });
}

/**
 * templatize field name when referenced in popupElelments
 *
 * @param popupElelments the popups popupElelments to check
 * @param basePath path used to de-templatize while deploying
 */
export function _templatizePopupElements(
  popupElelments: any[],
  basePath: string
): void {
  popupElelments.forEach((pe: any) => {
    if (pe.hasOwnProperty("fieldInfos")) {
      const infos: any[] = pe.fieldInfos || [];
      infos.forEach(fi => _templatizeProperty(fi, "fieldName", basePath));
    }
  });
}

/**
 * templatize field name when referenced in mediaInfos
 *
 * @param mediaInfos the popups mediaInfos to check
 * @param fieldNames array of the layers field names
 * @param basePath path used to de-templatize while deploying
 */
export function _templatizeMediaInfos(
  mediaInfos: any,
  fieldNames: string[],
  basePath: string
): void {
  // templatize various properties of mediaInfos
  const props: string[] = ["title", "caption"];
  props.forEach(p => _templatizeFieldName(mediaInfos, p, fieldNames, basePath));

  if (mediaInfos.hasOwnProperty("value")) {
    const v: any = mediaInfos.value;

    const vfields: any[] = objectUtils.getProp(v, "fields") || [];
    vfields.forEach(f => _templatizeProperty(vfields, f, basePath));

    if (v.hasOwnProperty("normalizeField")) {
      _templatizeProperty(v, "normalizeField", basePath);
    }
  }
}

/**
 * templatize field names when referenced in definitionEditor
 *
 * @param layer the layer with the definition editor
 * @param basePath path used to de-templatize while deploying
 * @param fieldNames json of layer being cloned
 */
export function _templatizeDefinitionEditor(
  layer: any,
  basePath: string,
  fieldNames: string[]
): void {
  const defEditor: any = layer.definitionEditor || {};
  const parameters: any[] = objectUtils.getProp(defEditor, "inputs.parameters");

  if (parameters) {
    parameters.forEach(p => _templatizeProperty(p, "fieldName", basePath));
    defEditor.inputs.parameters = parameters;
  }

  if (defEditor.hasOwnProperty("parameterizedExpression")) {
    defEditor.parameterizedExpression = _templatizeSimpleName(
      defEditor.parameterizedExpression || "",
      basePath,
      fieldNames
    );
  }
}

/**
 * templatize field names when referenced in definitionExpression
 *
 * @param layer the layer with the definition editor
 * @param basePath path used to de-templatize while deploying
 * @param fieldNames array of field names
 */
export function _templatizeDefinitionExpression(
  layer: any,
  basePath: string,
  fieldNames: string[]
): void {
  if (layer.hasOwnProperty("definitionExpression")) {
    layer.definitionExpression = _templatizeSimpleName(
      layer.definitionExpression || "",
      basePath,
      fieldNames
    );
  }
}

/**
 * Case sensitive test for field names that appear anywhere within a string
 *
 * @param expression the expression to test for field name references
 * @param basePath path used to de-templatize while deploying
 * @param fieldNames array of the layers field names
 */
export function _templatizeSimpleName(
  expression: string,
  basePath: string,
  fieldNames: string[]
): string {
  fieldNames.forEach(name => {
    const regEx = new RegExp("\\b" + name + "\\b", "gm");
    if (expression && regEx.test(expression)) {
      expression = expression.replace(
        regEx,
        String(_templatize(basePath, name))
      );
    }
  });
  return expression;
}

/**
 * Templatize field references within a layers drawingInfo
 *
 * @param layer the data layer
 * @param basePath path used to de-templatize while deploying
 * @param fieldNames array of the layers field names
 */
export function _templatizeDrawingInfo(
  layer: any,
  basePath: string,
  fieldNames: string[]
): void {
  const drawingInfo: any = layer.drawingInfo || {};

  // templatize the renderer fields
  const renderer: any = drawingInfo.renderer || {};
  _templatizeRenderer(renderer, basePath, fieldNames);

  // templatize the labelingInfo
  const labelingInfo: any = drawingInfo.labelingInfo || [];
  _templatizeLabelingInfo(labelingInfo, basePath, fieldNames);
}

/**
 * Templatize field references within a layers drawingInfo
 *
 * @param renderer the layers renderer
 * @param basePath path used to de-templatize while deploying
 * @param fieldNames array of the layers field names
 */
export function _templatizeRenderer(
  renderer: any,
  basePath: string,
  fieldNames: string[]
): void {
  switch (renderer.type) {
    case "classBreaks":
    case "uniqueValue":
    case "predominance":
    case "simple":
      _templatizeGenRenderer(renderer, basePath, fieldNames);
      break;
    case "temporal":
      _templatizeTemporalRenderer(renderer, basePath, fieldNames);
      break;
    case "heatmap":
      _templatizeProperty(renderer, "field", basePath);
      break;
    default:
      break;
  }
}

/**
 * Templatize field references within a layers renderer
 *
 * @param renderer the renderer object to check for field references
 * @param basePath path used to de-templatize while deploying
 * @param fieldNames array of field names that will be used to search expressions
 */
export function _templatizeGenRenderer(
  renderer: any,
  basePath: string,
  fieldNames: string[]
): void {
  if (renderer) {
    // update authoringInfo
    const authoringInfo: any = renderer.authoringInfo;
    _templatizeAuthoringInfo(authoringInfo, basePath, fieldNames);

    const props: string[] = ["field", "normalizationField"];
    props.forEach(p => _templatizeProperty(renderer, p, basePath));

    const fieldNameProps: string[] = ["field1", "field2", "field3"];
    fieldNameProps.forEach(fnP => _templatizeProperty(renderer, fnP, basePath));

    // When an attribute name is specified, it's enclosed in square brackets
    let rExp: string = renderer.rotationExpression || "";
    fieldNames.forEach(name => {
      const regEx = new RegExp("(\\[" + name + "\\])", "gm");
      if (rExp && regEx.test(rExp)) {
        rExp = rExp.replace(regEx, "[" + _templatize(basePath, name) + "]");
      }
    });

    // update valueExpression
    let vExp: string = renderer.valueExpression || "";
    fieldNames.forEach(name => {
      vExp = _templatizeArcadeExpressions(vExp, name, basePath);
    });

    // update visualVariables
    const visualVariables: any[] = renderer.visualVariables || [];
    visualVariables.forEach(v => {
      props.forEach(p => _templatizeProperty(v, p, basePath));
      if (v.valueExpression) {
        fieldNames.forEach(name => {
          v.valueExpression = _templatizeArcadeExpressions(
            v.valueExpression,
            name,
            basePath
          );
        });
      }
    });
  }
}

/**
 * Templatize field references within a layers renderer
 *
 * @param renderer the renderer object to check for field references
 * @param basePath path used to de-templatize while deploying
 * @param fieldNames array of field names that will be used to search expressions
 */
export function _templatizeTemporalRenderer(
  renderer: any,
  basePath: string,
  fieldNames: string[]
): void {
  const renderers: any[] = [
    renderer.latestObservationRenderer,
    renderer.observationalRenderer,
    renderer.trackRenderer
  ];

  renderers.forEach(r => _templatizeGenRenderer(r, basePath, fieldNames));
}

/**
 * Templatize renderers authoringInfo
 *
 * @param authoringInfo  object containing metadata about the authoring process
 * @param basePath path used to de-templatize while deploying
 * @param fieldNames the name of fields from the layer
 */
export function _templatizeAuthoringInfo(
  authoringInfo: any,
  basePath: string,
  fieldNames: string[]
): void {
  if (authoringInfo) {
    const props: string[] = ["field", "normalizationField"];

    const field1: any = authoringInfo.field1;
    props.forEach(p => _templatizeProperty(field1, p, basePath));

    const field2: any = authoringInfo.field2;
    props.forEach(p => _templatizeProperty(field2, p, basePath));

    const fields: any[] = authoringInfo.fields;
    if (fields && Array.isArray(fields)) {
      fields.forEach(f => _templatize(basePath, f));
    }

    const vProps: string[] = ["endTime", "field", "startTime"];
    const vVars: any = authoringInfo.visualVariables;
    if (vVars) {
      vProps.forEach(p => {
        // endTime and startTime may or may not be a field name
        if (fieldNames.indexOf(p) > -1) {
          _templatizeProperty(vVars, p, basePath);
        }
      });
    }
  }
}

/**
 * Templatize field references within an arcade expression
 *
 * @param text the text that contains the expression
 * @param fieldName name of the field to test for
 * @param basePath path used to de-templatize while deploying
 */
export function _templatizeArcadeExpressions(
  text: string,
  fieldName: string,
  basePath: string
): string {
  const t = _templatize(basePath, fieldName);

  // test for . notation
  let exp: string = "(?:[$]feature.)(" + fieldName + ")\\b";
  let regEx = new RegExp(exp, "gm");
  if (text && regEx.test(text)) {
    text = text.replace(regEx, "$feature." + t);
  }

  // test for [] notation
  // captures VOTED_DEM_2012 from $feature["VOTED_DEM_2012"]
  exp = '(?:[$]feature\\[\\")(' + fieldName + ')(?:\\"\\])';
  regEx = new RegExp(exp, "gm");
  if (text && regEx.test(text)) {
    text = text.replace(regEx, "$feature[" + t + "]");
  }

  // test for [] with join case
  // captures VOTED_DEM_2016 from $feature["COUNTY_ID.VOTED_DEM_2016"]
  // (?:[$]feature\[\")(?:\w+\.)(VOTED_DEM_2012)(?:\"\])
  exp = '(?:[$]feature\\[\\")(?:\\w+\\.)(' + fieldName + ')(?:\\"\\])';
  regEx = new RegExp(exp, "gm");
  if (text && regEx.test(text)) {
    // need the joinKey also
    const keyExp =
      '(?:[$]feature\\[\\")(\\w+\\.)(?:' + fieldName + ')(?:\\"\\])';
    const joinKeyEx = new RegExp(keyExp, "gm");
    const joinKey: string[] = joinKeyEx.exec(text);
    text = text.replace(regEx, "$feature[" + joinKey[0] + "." + t + "]");
  }

  return text;
}

/**
 * templatize field names when referenced in the layers labelingInfo
 *
 * @param labelingInfo the object that contains the labelingInfo
 * @param basePath path used to de-templatize while deploying
 * @param fieldNames array of the layers field names
 */
export function _templatizeLabelingInfo(
  labelingInfo: any,
  basePath: string,
  fieldNames: string[]
): void {
  labelingInfo.forEach((li: any) => {
    if (li.hasOwnProperty("fieldInfos")) {
      const fieldInfos: any[] = li.fieldInfos || [];
      fieldInfos.forEach(fi => _templatizeProperty(fi, "fieldName", basePath));
    }

    let labelExp: string = li.labelExpression || "";
    let labelExpInfo: any = li.labelExpressionInfo || "";
    fieldNames.forEach(n => {
      const t: string = String(_templatize(basePath, n));

      let regEx = new RegExp("(\\[" + n + "\\])", "gm");
      if (regEx.test(labelExp)) {
        labelExp = labelExp.replace(regEx, "[" + t + "]");
      }

      if (labelExpInfo.value) {
        regEx = new RegExp("(\\{" + n + "\\})", "gm");
        if (regEx.test(labelExpInfo)) {
          labelExpInfo = labelExpInfo.replace(regEx, "{" + t + "}");
        }
      }

      if (labelExpInfo.expression) {
        labelExpInfo.expression = _templatizeArcadeExpressions(
          labelExpInfo.expression,
          n,
          basePath
        );
      }
    });
  });
}

/**
 * templatize the layers editing templates
 *
 * @param layer the data layer being cloned
 * @param basePath path used to de-templatize while deploying
 */
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
  if (value.startsWith("{{")) {
    return value;
  } else {
    return mCommon.templatize(basePath, String(value).toLowerCase());
  }
}

/**
 * Helper function to cache a single property into the fieldInfos object
 * This property will be removed from the layer instance.
 *
 * @param layer the data layer being cloned
 * @param prop the property name used to cache
 * @param fieldInfos the object that will store the cached property
 */
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

/**
 * Helper function to create the name mapping used to
 * de-templatize the field reference
 *
 * @param fieldInfos the object that stores the cached information
 * @param id the id for the current layer being processed
 */
export function _getNameMapping(fieldInfos: any, id: string): any {
  // TODO This needs to be extended to account for name changes
  // in addition to case changes
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

//#endregion
